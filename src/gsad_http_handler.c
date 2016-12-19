/* Greenbone Security Assistant
 * $Id$
 * Description: HTTP handling of GSA.
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#include "gsad_http_handler.h"
#include "gsad_omp.h" /* for get_system_report_omp */
#include "validator.h" /* for openvas_validate */
#include "xslt_i18n.h" /* for accept_language_to_env_fmt */
#include "gsad_settings.h" /* for get_guest_usernmae */
#include "gsad_base.h" /* for ctime_r_strip_newline */

#include <string.h> /* for strcmp */
#include <openvas/base/openvas_networking.h> /* for INET6_ADDRSTRLEN */
#include <openvas/omp/xml.h> /* for find_element_in_xml_file */

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad http handler"

/**
 * @file gsad_http_handler.c
 * @brief HTTP URL handling/routing
 */

#define TOKEN_REGEXP "^[a-z0-9\\-]+$"
#define SLAVE_ID_REGEXP "^[a-z0-9\\-]+$"

/**
 * @brief Validator instance for http params
 */
validator_t http_validator;


/**
 * @brief URL regexp to handler function mapping
 *
 * Instances of url_map contain a compiled glib perl compatible regular
 * expression and a http handler function.
 */
struct url_map
{
  GRegex *gregexp;
  http_handler_t *handler;
};

typedef struct url_map url_map_t;

struct http_handler
{
  http_handler_t *next;
  http_handler_func_t handle;
  http_handler_free_func_t free;
  void * data;
};

struct method_router
{
  http_handler_t *get;
  http_handler_t *post;
};

typedef struct method_router method_router_t;

http_handler_t * handlers;

http_handler_t *
http_handler_add (http_handler_t *handlers, http_handler_t *next)
{
  http_handler_t *handler = handlers;

  if (handler == NULL)
    {
      return next;
    }

  while (handler->next != NULL)
    {
      handler = handler->next;
    }

  handler->next = next;

  return handlers;
}

int
http_handler_start (http_connection_t *connection, const char *method,
                    const char *url, gsad_connection_info_t *con_info,
                    http_handler_t *handler, void *data)
{
  if (handler == NULL)
    {
      return MHD_NO;
    }
  return handler->handle (connection, method, url, con_info, handler, data);
}

int
http_handler_next (http_connection_t *connection, const char *method,
                   const char *url, gsad_connection_info_t *con_info,
                   http_handler_t *handler, void *data)
{
  http_handler_t *next;

  if (handler == NULL || handler->next == NULL)
    {
      return MHD_NO;
    }

  next = handler->next;
  return next->handle (connection, method, url, con_info, next, data);
}

http_handler_t *
http_handler_new_with_data (http_handler_func_t func,
                            http_handler_free_func_t freefunc,
                            void *data)
{
  http_handler_t *handler = g_malloc0 (sizeof (http_handler_t));
  handler->handle = func;
  handler->free = freefunc;
  handler->data = data;
  handler->next = NULL;
  return handler;
}

void
http_handler_free_internal(http_handler_t *handler)
{
  g_free (handler);
}

http_handler_t *
http_handler_new (http_handler_func_t func)
{
  return http_handler_new_with_data (func, http_handler_free_internal, NULL);
}

void
http_handler_free(http_handler_t *handler)
{
  if (!handler)
    return;

  if (handler->next)
    {
      // free the chain
      http_handler_free (handler->next);
    }

  handler->free (handler);
}

int
handle_get_post (http_connection_t *connection, const char *method,
                 const char *url, gsad_connection_info_t *con_info,
                 http_handler_t *handler, void *data)
{
  method_router_t *routes = (method_router_t*)handler->data;

  if (!strcmp (method, "GET"))
    {
      g_debug ("method router handling GET");
      return http_handler_start (connection, method, url, con_info,
                                 routes->get, data);
    }
  if (!strcmp (method, "POST"))
    {
      g_debug ("method router handling POST");
      return http_handler_start (connection, method, url, con_info,
                                 routes->post, data);
    }
  return http_handler_next (connection, method, url, con_info, handler, data);
}

void
method_router_free(http_handler_t *handler)
{
  method_router_t *routes = (method_router_t*)handler->data;

  http_handler_free(routes->get);
  http_handler_free(routes->post);

  g_free(routes);

  http_handler_free_internal(handler);
}

http_handler_t *
method_router_new()
{
  method_router_t *router = g_malloc0 (sizeof (method_router_t));
  router->get = NULL;
  router->post = NULL;
  return http_handler_new_with_data (handle_get_post, method_router_free,
                                     router);
}

void
method_router_set_get_handler (http_handler_t *router,
                               http_handler_t *handler)
{
  method_router_t *method_router = (method_router_t*)router->data;
  method_router->get = handler;
}

void
method_router_set_post_handler (http_handler_t *router,
                                http_handler_t *handler)
{
  method_router_t *method_router = (method_router_t*)router->data;
  method_router->post = handler;
}

int
handle_url (http_connection_t *connection, const char *method,
            const char *url, gsad_connection_info_t *con_info,
            http_handler_t *current, void *data)
{
  url_map_t *map = (url_map_t*)current->data;

  g_debug("checking url map for url %s against %s\n", url,
          g_regex_get_pattern (map->gregexp));

  if (g_regex_match(map->gregexp, url, 0, NULL))
    {
      g_debug("Found url handler for url %s\n", url);

      return http_handler_start (connection, method, url, con_info,
                                 map->handler, data);
    }

  return http_handler_next (connection, method, url, con_info, current, data);
}

url_map_t *
url_map_new (const gchar *regexp, http_handler_t *handler)
{
  url_map_t *map = g_malloc0 (sizeof (url_map_t));
  map->gregexp = g_regex_new (regexp, 0, 0, NULL);
  map->handler = handler;
  return map;
}

void
url_handler_free (http_handler_t *handler)
{
  url_map_t * map = (url_map_t*)handler->data;

  g_regex_unref (map->gregexp);
  http_handler_free (map->handler); /* free the chain */
  g_free (map);

  http_handler_free_internal(handler);
}

http_handler_t *
url_handler_new (const gchar *regexp, http_handler_func_t handle)
{
  http_handler_t * handler = http_handler_new (handle);
  url_map_t * map = url_map_new (regexp, handler);
  return http_handler_new_with_data (&handle_url, url_handler_free, map);
}

http_handler_t *
url_handler_add (http_handler_t *handlers, const gchar *regexp,
                 http_handler_func_t handle)
{
  http_handler_t *url_handler = url_handler_new (regexp, handle);
  return http_handler_add (handlers, url_handler);
}

int
handle_validate (http_connection_t *connection, const char * method,
                 const char *url, gsad_connection_info_t *con_info,
                 http_handler_t *handler, void * data)
{

  g_debug ("Validating url %s", url);

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    {
      send_response (connection, BAD_REQUEST_PAGE, MHD_HTTP_NOT_ACCEPTABLE,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  /* Prevent guest link from leading to URL redirection. */
  if (url && (url[0] == '/') && (url[1] == '/'))
    {
      return handler_send_not_found(connection, url);
    }

  /* Many Glib functions require valid UTF-8. */
  if (url && (g_utf8_validate (url, -1, NULL) == FALSE))
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("URL"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  return http_handler_next (connection, method, url, con_info, handler, data);
}

int
handle_not_found (http_connection_t *connection, const char * method,
                  const char *url, gsad_connection_info_t *con_info,
                  http_handler_t *handler, void * data)
{
  return handler_send_not_found (connection, url);
}

int
handle_static_file (http_connection_t *connection, const char * method,
                    const char *url, gsad_connection_info_t *con_info,
                    http_handler_t *handler, void * data)
{
  gchar* path;
  http_response_t *response;
  cmd_response_data_t *response_data;
  char *default_file = "login/login.html";

  response_data = cmd_response_data_new ();

  /** @todo validation, URL length restriction (allows you to view ANY
    *       file that the user running the gsad might look at!) */
  /** @todo use glibs path functions */
  /* Attempt to prevent disclosing non-gsa content. */
  if (strstr (url, ".."))
    path = g_strconcat (default_file, NULL);
  else
    {
      /* Ensure that url is relative. */
      const char* relative_url = url;
      if (*url == '/') relative_url = url + 1;
      path = g_strconcat (relative_url, NULL);
    }

  response = file_content_response(connection, url, path, response_data);

  g_free (path);

  return handler_send_response (connection, response, response_data, NULL);
}

int
handle_login_page (http_connection_t *connection, const char *method,
                   const char *url, gsad_connection_info_t *con_info,
                   http_handler_t *handler, void *data)
{
  return handler_send_login_page (connection, MHD_HTTP_OK, NULL, NULL);
}

int
handle_redirect_to_login_page (http_connection_t *connection,
                               const char *method, const char *url,
                               gsad_connection_info_t *con_info,
                               http_handler_t *handler, void *data)
{
  return send_redirect_to_urn (connection, LOGIN_URL, NULL);
}

int
handle_invalid_method (http_connection_t *connection,
                       const char *method, const char *url,
                       gsad_connection_info_t *con_info,
                       http_handler_t *handler, void *data)
{
  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if (strcmp (method, "GET") && strcmp (method, "POST"))
    {
      send_response (connection, ERROR_PAGE, MHD_HTTP_METHOD_NOT_ALLOWED,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  return http_handler_next (connection, method, url, con_info, handler, data);
}

int
handle_setup_user (http_connection_t *connection,
                   const char *method, const char *url,
                   gsad_connection_info_t *con_info,
                   http_handler_t *handler, void *data)
{
  int ret;
  int http_response_code = MHD_HTTP_OK;
  char *res;
  const char *cookie;
  char client_address[INET6_ADDRSTRLEN];
  const char *token;
  gboolean xml = params_value_bool (con_info->params, "xml");
  authentication_reason_t auth_reason;

  user_t *user;
  cmd_response_data_t *response_data;

  token = MHD_lookup_connection_value (connection, MHD_GET_ARGUMENT_KIND,
                                       "token");

  if (token == NULL)
    {
      g_debug ("%s: Missing token in arguments", __FUNCTION__);
      cookie = NULL;
      ret = USER_BAD_MISSING_TOKEN;
    }
  else
    {
      if (openvas_validate (http_validator, "token", token))
        token = NULL;

      cookie = MHD_lookup_connection_value (connection,
                                            MHD_COOKIE_KIND,
                                            SID_COOKIE_NAME);
      if (openvas_validate (http_validator, "token", cookie))
        cookie = NULL;

      get_client_address (connection, client_address);
      ret = get_client_address (connection, client_address);
      if (ret == 1)
        {
          send_response (connection,
                         UTF8_ERROR_PAGE ("'X-Real-IP' header"),
                         MHD_HTTP_BAD_REQUEST, NULL,
                         GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
          return MHD_YES;
        }

      ret = user_find (cookie, token, client_address, &user);
    }


  if (ret == USER_BAD_TOKEN)
    {
      response_data = cmd_response_data_new ();

      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);

      res = gsad_message_new (NULL,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred inside GSA daemon. "
                              "Diagnostics: Bad token.",
                              "/omp?cmd=get_tasks",
                              params_value_bool (con_info->params, "xml"),
                              response_data);
      return handler_create_response (connection,
                                      res,
                                      response_data,
                                      REMOVE_SID);
    }

  if (ret == USER_GUEST_LOGIN_FAILED
      || ret == USER_OMP_DOWN || ret == USER_GUEST_LOGIN_ERROR)
    {
      auth_reason = ret == USER_OMP_DOWN
                    ? GMP_SERVICE_DOWN
                    : (ret == USER_GUEST_LOGIN_ERROR
                      ? LOGIN_ERROR
                      : LOGIN_FAILED);

      return handler_send_reauthentication (connection,
                                            MHD_HTTP_SERVICE_UNAVAILABLE,
                                            auth_reason, xml);
    }

  if ((ret == USER_EXPIRED_TOKEN) || (ret == USER_BAD_MISSING_COOKIE)
      || (ret == USER_BAD_MISSING_TOKEN)
      || (ret == USER_IP_ADDRESS_MISSMATCH))
    {
      gchar *full_url;
      gboolean export = is_export (connection);;

      if (!export && strncmp (url, LOGOUT_URL, strlen (LOGOUT_URL)))
        {
          full_url = reconstruct_url (connection, url);
          if (full_url && g_utf8_validate (full_url, -1, NULL) == FALSE)
            {
              g_free (full_url);
              full_url = NULL;
            }
        }
      else
        full_url = NULL;

      if (ret == USER_EXPIRED_TOKEN)
        {
          if (strncmp (url, LOGOUT_URL, strlen (LOGOUT_URL)))
            http_response_code = MHD_HTTP_UNAUTHORIZED;
          else
            http_response_code = MHD_HTTP_BAD_REQUEST;
        }
      else
        http_response_code = MHD_HTTP_UNAUTHORIZED;

      auth_reason = (ret == USER_EXPIRED_TOKEN)
               ? (strncmp (url, LOGOUT_URL, strlen (LOGOUT_URL))
                 ? SESSION_EXPIRED
                 : LOGOUT_ALREADY)
               : ((ret == USER_BAD_MISSING_COOKIE)
                 ? BAD_MISSING_COOKIE
                 : BAD_MISSING_TOKEN);

      return handler_send_reauthentication (connection, http_response_code,
                                            auth_reason, xml);
    }

  if (ret)
    abort ();

  g_debug ("Found user %s\n", user->username);

  return http_handler_next (connection, method, url, con_info, handler, user);
}

int
handle_setup_credentials (http_connection_t *connection,
                          const char *method, const char *url,
                          gsad_connection_info_t *con_info,
                          http_handler_t *handler, void *data)
{
  user_t *user = (user_t *)data;
  const gchar * accept_language;
  gchar *language;
  credentials_t *credentials;
  char client_address[INET6_ADDRSTRLEN];

  language = g_strdup (user->language);

  get_client_address (connection, client_address);

  if (!language)
    /* Accept-Language: de; q=1.0, en; q=0.5 */
    {
      accept_language = MHD_lookup_connection_value
                          (connection, MHD_HEADER_KIND, "Accept-Language");
      if (accept_language
          && g_utf8_validate (accept_language, -1, NULL) == FALSE)
        {
          send_response (connection,
                         UTF8_ERROR_PAGE ("'Accept-Language' header"),
                         MHD_HTTP_BAD_REQUEST, NULL,
                         GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
          return MHD_YES;
        }
      language = accept_language_to_env_fmt (accept_language);
      credentials = credentials_new (user, language, client_address);
      g_free (language);
    }
  else
    credentials = credentials_new (user, language, client_address);

  credentials->caller = reconstruct_url (connection, url);
  if (credentials->caller
      && g_utf8_validate (credentials->caller, -1, NULL) == FALSE)
    {
      g_free (credentials->caller);
      credentials->caller = NULL;
    }

  user_release (user);

  return http_handler_next (connection, method, url, con_info, handler,
                            credentials);
}

int
handle_logout (http_connection_t *connection,
               const char *method, const char *url,
               gsad_connection_info_t *con_info,
               http_handler_t *handler, void *data)
{
  user_t * user = (user_t *)data;

  user_remove (user);

  return handler_send_reauthentication (connection, MHD_HTTP_OK, LOGOUT,
                                        params_value_bool (con_info->params,
                                                           "xml"));
}

int
handle_omp_get (http_connection_t *connection,
                const char *method, const char *url,
                gsad_connection_info_t *con_info,
                http_handler_t *handler, void *data)
{
  /* URL requests to run OMP command. */
  int ret;
  credentials_t *credentials = (credentials_t*)data;

  cmd_response_data_t *response_data;

  response_data = cmd_response_data_new ();

  ret = exec_omp_get (connection, con_info, credentials, response_data);

  credentials_free (credentials);
  return ret;
}

int
handle_omp_post (http_connection_t *connection,
                 const char *method, const char *url,
                 gsad_connection_info_t *con_info,
                 http_handler_t *handler, void *data)
{
  const gchar *sid, *accept_language;
  int ret;
  char client_address[INET6_ADDRSTRLEN];
  cmd_response_data_t *response_data;

  sid = MHD_lookup_connection_value (connection,
                                     MHD_COOKIE_KIND,
                                     SID_COOKIE_NAME);

  if (openvas_validate (http_validator, "token", sid))
    con_info->cookie = NULL;
  else
    con_info->cookie = g_strdup (sid);

  accept_language = MHD_lookup_connection_value (connection,
                                                 MHD_HEADER_KIND,
                                                 "Accept-Language");
  if (accept_language
      && g_utf8_validate (accept_language, -1, NULL) == FALSE)
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("'Accept-Language' header"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }
  con_info->language = accept_language_to_env_fmt (accept_language);

  get_client_address (connection, client_address);

  /* FIXME why is get_client_address called twice? it was already called twice
     in gsad.c handle_request function */
  ret = get_client_address (connection, client_address);
  if (ret == 1)
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("'X-Real-IP' header"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  response_data = cmd_response_data_new ();

  return exec_omp_post (connection, con_info, client_address, response_data);
}

int
handle_help_pages (http_connection_t *connection,
                   const char *method, const char *url,
                   gsad_connection_info_t *con_info,
                   http_handler_t *handler, void *data)
{
  cmd_response_data_t *response_data;
  credentials_t *credentials = (credentials_t*)data;

  gchar **preferred_languages;
  gchar *xsl_filename = NULL;
  gchar *page;
  GHashTable *template_attributes;

  int template_found = 0;
  time_t now;
  char ctime_now[200];
  gchar *xml, *pre;
  int index;
  char *res;

  page = g_strndup ((gchar *) &url[6], MAX_FILE_NAME_SIZE);

  assert (credentials->token);

  now = time (NULL);
  ctime_r_strip_newline (&now, ctime_now);

  pre = g_markup_printf_escaped
          ("<envelope>"
          "<version>%s</version>"
          "<vendor_version>%s</vendor_version>"
          "<token>%s</token>"
          "<time>%s</time>"
          "<login>%s</login>"
          "<role>%s</role>"
          "<i18n>%s</i18n>"
          "<charts>%i</charts>"
          "<guest>%d</guest>"
          "<client_address>%s</client_address>"
#ifdef USE_GSA_NG
          "<ng/>"
#endif
          "<help><%s/></help>",
          GSAD_VERSION,
          vendor_version_get (),
          credentials->token,
          ctime_now,
          credentials->username,
          credentials->role,
          credentials->language,
          credentials->charts,
          credentials->guest,
          credentials->client_address,
          page);

  xml = g_strdup_printf ("%s"
                         "<capabilities>%s</capabilities>"
                         "</envelope>",
                         pre,
                         credentials->capabilities);
  g_free (pre);

  preferred_languages = g_strsplit (credentials->language, ":", 0);

  index = 0;

  while (preferred_languages [index] && xsl_filename == NULL)
    {
      gchar *help_language;
      help_language = g_strdup (preferred_languages [index]);
      xsl_filename = g_strdup_printf ("help_%s.xsl",
                                      help_language);
      if (access (xsl_filename, R_OK) != 0)
        {
          g_free (xsl_filename);
          xsl_filename = NULL;
          if (strchr (help_language, '_'))
            {
              *strchr (help_language, '_') = '\0';
              xsl_filename = g_strdup_printf ("help_%s.xsl",
                                              help_language);
              if (access (xsl_filename, R_OK) != 0)
                {
                  g_free (xsl_filename);
                  xsl_filename = NULL;
                }
            }
        }
      g_free (help_language);
      index ++;
    }

  template_attributes
    = g_hash_table_new (g_str_hash, g_str_equal);

  g_hash_table_insert (template_attributes, "match", page);
  g_hash_table_insert (template_attributes, "mode", "help");

  // Try to find the requested page template
  template_found
    = find_element_in_xml_file (xsl_filename, "xsl:template",
                                template_attributes);

  if (template_found == 0)
    {
      // Try finding page template again in default help
      template_found
        = find_element_in_xml_file ("help.xsl", "xsl:template",
                                    template_attributes);
    }

  response_data = cmd_response_data_new ();

  if (template_found == 0)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_NOT_FOUND);
      res = gsad_message_new (credentials,
                              NOT_FOUND_TITLE, NULL, 0,
                              NOT_FOUND_MESSAGE,
                              "/help/contents.html",
                              params_value_bool (con_info->params, "xml"),
                              response_data);
    }
  else if (xsl_filename)
    {
      res = xsl_transform_with_stylesheet (xml, xsl_filename,
                                           response_data);

    }
  else
    {
      res = xsl_transform_with_stylesheet (xml, "help.xsl",
                                           response_data);
    }

  g_strfreev (preferred_languages);
  g_free (xsl_filename);
  g_free (page);

  if (res == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      res = gsad_message_new (credentials,
                              "Invalid request", __FUNCTION__, __LINE__,
                              "Error generating help page.",
                              "/help/contents.html",
                              params_value_bool (con_info->params, "xml"),
                              response_data);
    }

  credentials_free (credentials);
  return handler_create_response (connection,
                                  res,
                                  response_data,
                                  credentials->sid);
}

int
handle_system_report (http_connection_t *connection,
                      const char *method, const char *url,
                      gsad_connection_info_t *con_info,
                      http_handler_t *handler, void *data)
{
  params_t *params = params_new();
  credentials_t *credentials = (credentials_t*)data;
  const char *slave_id;
  char *res;
  openvas_connection_t con;
  cmd_response_data_t *response_data;

  g_debug("Request for system report url %s", url);

  MHD_get_connection_values (connection, MHD_GET_ARGUMENT_KIND,
                             params_mhd_add, params);

  params_mhd_validate (params);

  slave_id = MHD_lookup_connection_value (connection,
                                          MHD_GET_ARGUMENT_KIND,
                                          "slave_id");

  if (slave_id && openvas_validate (http_validator, "slave_id", slave_id))
    {
      credentials_free (credentials);
      g_warning ("%s: failed to validate slave_id, dropping request",
                  __FUNCTION__);
      return MHD_NO;
    }

  response_data = cmd_response_data_new ();

  /* Connect to manager */
  switch (manager_connect (credentials, &con, response_data))
    {
      case 0:
        res = get_system_report_omp (&con,
                                     credentials,
                                     &url[0] + strlen ("/system_report/"),
                                     params,
                                     response_data);
        break;
      case -1:
        return handler_send_reauthentication
          (connection, MHD_HTTP_SERVICE_UNAVAILABLE, GMP_SERVICE_DOWN,
           params_value_bool (con_info->params, "xml"));

        break;
      case -2:
       res = gsad_message_new (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred. "
                               "Diagnostics: Could not authenticate to manager "
                               "daemon.",
                               "/omp?cmd=get_tasks",
                               params_value_bool (con_info->params, "xml"),
                               response_data);
        break;
      default:
        res = gsad_message_new (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred. "
                                "Diagnostics: Failure to connect to manager daemon.",
                                "/omp?cmd=get_tasks",
                                params_value_bool (con_info->params, "xml"),
                                response_data);
        break;
    }

  if (res == NULL)
    {
      credentials_free (credentials);
      g_warning ("%s: failed to get system reports, dropping request",
                  __FUNCTION__);
      cmd_response_data_free (response_data);
      return MHD_NO;
    }

  credentials_free (credentials);

  return handler_create_response (connection, res, response_data,
                                  credentials->sid);
}

int
handle_index_ng (http_connection_t *connection,
                 const char *method, const char *url,
                 gsad_connection_info_t *con_info,
                 http_handler_t *handler, void *data)
{
  http_response_t *response;
  cmd_response_data_t *response_data;

  response_data = cmd_response_data_new ();

  response = file_content_response (connection, url,
                                    "ng/index.html",
                                    response_data);
  return handler_send_response (connection, response, response_data, NULL);
}

int
handle_config_ng (http_connection_t *connection,
                 const char *method, const char *url,
                 gsad_connection_info_t *con_info,
                 http_handler_t *handler, void *data)
{
  http_response_t *response;
  cmd_response_data_t *response_data;

  response_data = cmd_response_data_new ();

  response = file_content_response (connection, url,
                                    "ng/config.js",
                                    response_data);
  return handler_send_response (connection, response, response_data, NULL);
}

int
handle_static_ng_file (http_connection_t *connection, const char * method,
                       const char *url, gsad_connection_info_t *con_info,
                       http_handler_t *handler, void * data)
{
  gchar* path;
  http_response_t *response;
  char *default_file = "login/login.html";
  cmd_response_data_t *response_data;

  /** @todo validation, URL length restriction (allows you to view ANY
    *       file that the user running the gsad might look at!) */
  /** @todo use glibs path functions */
  /* Attempt to prevent disclosing non-gsa content. */
  if (strstr (url, ".."))
    path = g_strconcat (default_file, NULL);
  else
    {
      /* Ensure that url is relative. */
      const char* relative_url = url;
      if (*url == '/') relative_url = url + 1;
      path = g_strconcat ("ng/", relative_url, NULL);
    }

  g_debug ("Requesting url %s for static ng path %s", url, path);

  response_data = cmd_response_data_new ();

  response = file_content_response (connection, url, path, response_data);

  g_free (path);

  return handler_send_response (connection, response, response_data, NULL);
}

http_handler_t *
init_http_handlers()
{
  http_handler_t *method_router;
  http_handler_t *not_found_handler;
  http_handler_t *user_handler;
  http_handler_t *credential_handler;
  http_handler_t *omp_post_handler;
  http_handler_t *anon_url_handlers;
  http_handler_t *user_url_handlers;

  http_validator = openvas_validator_new ();
  openvas_validator_add (http_validator, "slave_id", SLAVE_ID_REGEXP);
  openvas_validator_add (http_validator, "token", TOKEN_REGEXP);

  handlers = http_handler_new (handle_validate);

  method_router = method_router_new ();
  not_found_handler = http_handler_new (handle_not_found);
  user_handler = http_handler_new (handle_setup_user);
  credential_handler = http_handler_new (handle_setup_credentials);
  omp_post_handler = http_handler_new (handle_omp_post);

  http_handler_add (handlers, method_router);

  anon_url_handlers = url_handler_new ("^/$", handle_redirect_to_login_page);

#ifdef SERVE_STATIC_ASSETS
  url_handler_add (anon_url_handlers, "^/(img|js|css)/.+$",
                   handle_static_file);
#endif

#ifdef USE_GSA_NG
  url_handler_add (anon_url_handlers, "^/login/?$", handle_index_ng);
#else
  url_handler_add (anon_url_handlers, "^/login/?$", handle_login_page);
#endif
  url_handler_add (anon_url_handlers, "^/login/.+$",
                   handle_redirect_to_login_page);

#ifdef USE_GSA_NG
  url_handler_add (anon_url_handlers, "^/ng(/.*)?$", handle_index_ng);
  url_handler_add (anon_url_handlers, "^/config.js$", handle_config_ng);
  url_handler_add (anon_url_handlers, "^/static/(img|js|css)/.+$",
                   handle_static_ng_file);
#endif

  user_url_handlers = url_handler_new ("^/logout/?$", handle_logout);
  http_handler_add (user_url_handlers, credential_handler);
  url_handler_add (user_url_handlers, "^/omp$", handle_omp_get);
  url_handler_add (user_url_handlers,
      "^/help/[a-zA-Z][[:alpha:][:alnum:]_-]*\\.html$", handle_help_pages);
  url_handler_add (user_url_handlers, "^/system_report/.+$",
                   handle_system_report);
  http_handler_add (user_url_handlers, not_found_handler);

  http_handler_add (anon_url_handlers, user_handler);
  http_handler_add (user_handler, user_url_handlers);

  method_router_set_get_handler (method_router, anon_url_handlers);
  method_router_set_post_handler (method_router, omp_post_handler);

  http_handler_add (handlers, http_handler_new (handle_invalid_method));

  return handlers;
}

void
cleanup_http_handlers()
{
  g_debug ("Cleaning up http handlers");

  http_handler_free(handlers);

  openvas_validator_free (http_validator);
}

/**
 * @brief HTTP request handler for GSAD.
 *
 * This routine is an MHD_AccessHandlerCallback, the request handler for
 * microhttpd.
 *
 * @param[in]  cls              A pointer to http_handler_t
 * @param[in]  connection       Connection handle, e.g. used to send response.
 * @param[in]  url              The URL requested.
 * @param[in]  method           "GET" or "POST", others are disregarded.
 * @param[in]  version          Not used for this callback.
 * @param[in]  upload_data      Data used for POST requests.
 * @param[in]  upload_data_size Size of upload_data.
 * @param[out] con_cls          For exchange of connection-related data
 *                              (here a struct gsad_connection_info).
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
int
handle_request(void *cls, http_connection_t *connection,
               const char *url, const char *method,
               const char *version, const char *upload_data,
               size_t *upload_data_size, void **con_cls)
{
  gsad_connection_info_t *con_info;
  http_handler_t *handlers;

  handlers = (http_handler_t*)cls;
  con_info = *con_cls;

  /* Never respond on first call of a GET. */
  if ((!strcmp (method, "GET")) && *con_cls == NULL)
    {
      /* First call for this request, a GET. */

      /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
      con_info = g_malloc0 (sizeof (gsad_connection_info_t));
      con_info->params = params_new ();
      con_info->connectiontype = 2;

      MHD_get_connection_values (connection, MHD_GET_ARGUMENT_KIND,
                                 params_mhd_add, con_info->params);

      params_mhd_validate (con_info->params);

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  if (!strcmp (method, "POST"))
    {
      if (NULL == *con_cls)
        {
          /* First call for this request, a POST. */

          /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
          con_info = g_malloc0 (sizeof (gsad_connection_info_t));

          con_info->postprocessor =
            MHD_create_post_processor (connection, POST_BUFFER_SIZE,
                                       serve_post, (void *) con_info);
          if (NULL == con_info->postprocessor)
            {
              g_free (con_info);
              /* Both bad request or running out of memory will lead here, but
               * we return the Bad Request page always, to prevent bad requests
               * from leading to "Internal application error" in the log. */
              send_response (connection, BAD_REQUEST_PAGE,
                             MHD_HTTP_NOT_ACCEPTABLE, NULL,
                             GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
              return MHD_YES;
            }
          con_info->params = params_new ();
          con_info->connectiontype = 1;

          *con_cls = (void *) con_info;
          return MHD_YES;
        }

      /* Second or later call for this request, a POST. */

      if (0 != *upload_data_size)
        {
          MHD_post_process (con_info->postprocessor, upload_data,
                            *upload_data_size);
          *upload_data_size = 0;
          return MHD_YES;
        }
    }

  g_debug ("============= url: %s\n", reconstruct_url (connection, url));

  if (handlers != NULL) {
    return http_handler_start (connection, method, url, con_info, handlers,
                               NULL);
  }

  return MHD_NO;
}

/* vim: set ts=2 sw=2 tw=80:*/
