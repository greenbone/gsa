/* Greenbone Security Assistant
 * $Id$
 * Description: Base http functionalities of GSA.
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

/**
 * @file gsad_http.c
 * @brief HTTP handling
 */

#include "gsad_http.h"

#include <string.h> /* for strcmp */
#include <locale.h> /* for setlocale */
#include <stdlib.h> /* for abort */
#include <sys/stat.h> /* struct stat */
#include <sys/types.h>
#include <unistd.h>
#include <assert.h> /* for asset */

#include <openvas/base/openvas_networking.h> /* for sockaddr_as_str */
#include <openvas/omp/xml.h> /* for xml_string_append */

#include "xslt_i18n.h" /* for accept_language_to_env_fmt */
#include "gsad_settings.h"
#include "gsad_base.h" /* for xsl_transform, ctime_r_strip_newline */

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad http"

/**
 * @brief Guess a content type from a file extension
 *
 * @param[in]  path  filename with extension
 *
 * @return a content_type_t for the file
 */
content_type_t
guess_content_type (gchar *path)
{
  /* Guess content type. */
  if (g_str_has_suffix (path, ".png"))
    return GSAD_CONTENT_TYPE_IMAGE_PNG;
  else if (g_str_has_suffix (path, ".svg"))
    return GSAD_CONTENT_TYPE_IMAGE_SVG;
  else if (g_str_has_suffix (path, ".html"))
    return GSAD_CONTENT_TYPE_TEXT_HTML;
  else if (g_str_has_suffix (path, ".css"))
    return GSAD_CONTENT_TYPE_TEXT_CSS;
  else if (g_str_has_suffix (path, ".js"))
    return GSAD_CONTENT_TYPE_TEXT_JS;
  else if (g_str_has_suffix (path, ".gif"))
    return GSAD_CONTENT_TYPE_IMAGE_GIF;
  else
    return GSAD_CONTENT_TYPE_OCTET_STREAM;
}

/**
 * @brief Adds content-type header fields to a response.
 *
 * This function should be called only once per response and is the only
 * function where values of enum content_types are translated into strings.
 *
 * @param[in,out]  response  Response to add header to.
 * @param[in]      ct        Content Type to set.
 */
void
gsad_add_content_type_header (http_response_t *response,
                              content_type_t* ct)
{
  if (!response)
    return;

  switch (*ct)
    {
      case GSAD_CONTENT_TYPE_APP_DEB:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/deb");
        break;
      case GSAD_CONTENT_TYPE_APP_EXE:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/exe");
        break;
      case GSAD_CONTENT_TYPE_APP_HTML:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/html");
        break;
      case GSAD_CONTENT_TYPE_APP_KEY:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/key");
        break;
      case GSAD_CONTENT_TYPE_APP_NBE:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/nbe");
        break;
      case GSAD_CONTENT_TYPE_APP_PDF:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/pdf");
        break;
      case GSAD_CONTENT_TYPE_APP_RPM:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/rpm");
        break;
      case GSAD_CONTENT_TYPE_APP_XML:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/xml; charset=utf-8");
        break;
      case GSAD_CONTENT_TYPE_IMAGE_PNG:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "image/png");
        break;
      case GSAD_CONTENT_TYPE_IMAGE_SVG:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "image/svg+xml");
        break;
      case GSAD_CONTENT_TYPE_IMAGE_GIF:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "image/gif");
        break;
      case GSAD_CONTENT_TYPE_OCTET_STREAM:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/octet-stream");
        break;
      case GSAD_CONTENT_TYPE_TEXT_CSS:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/css");
        break;
      case GSAD_CONTENT_TYPE_TEXT_HTML:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/html; charset=utf-8");
        break;
      case GSAD_CONTENT_TYPE_TEXT_JS:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/javascript");
        break;
      case GSAD_CONTENT_TYPE_TEXT_PLAIN:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/plain; charset=utf-8");
        break;
      case GSAD_CONTENT_TYPE_DONE:
        break;
      default:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/plain; charset=utf-8");
        break;
    }
}

/**
 * @brief Sends an HTTP redirection response to an urn.
 *
 * @param[in]  connection   The connection handle.
 * @param[in]  urn          The full urn to redirect to.
 * @param[in]  user         User to add cookie for, or NULL.
 *
 * @return MHD_NO in case of a problem. Else MHD_YES.
 */
int
send_redirect_to_urn (http_connection_t *connection, const char *urn,
                      user_t *user)
{
  const char *host, *protocol;
  char uri[MAX_HOST_LEN];

  host = MHD_lookup_connection_value (connection, MHD_HEADER_KIND,
                                      MHD_HTTP_HEADER_HOST);
  if (host && g_utf8_validate (host, -1, NULL) == FALSE)
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("'Host' header"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }
  if (host == NULL)
    {
      send_response (connection, BAD_REQUEST_PAGE, MHD_HTTP_NOT_ACCEPTABLE,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  protocol = MHD_lookup_connection_value (connection, MHD_HEADER_KIND,
                                          "X-Forwarded-Protocol");
  if (protocol && g_utf8_validate (protocol, -1, NULL) == FALSE)
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("'X-Forwarded-Protocol' header"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }
  else if ((protocol == NULL)
           || (strcmp(protocol, "http") && strcmp(protocol, "https")))
    {
      if (is_use_secure_cookie())
        protocol = "https";
      else
        protocol = "http";
    }

  snprintf (uri, sizeof (uri), "%s://%s%s", protocol, host, urn);
  return send_redirect_to_uri (connection, uri, user);
}

/**
 * @brief Sends a HTTP redirection to an uri.
 *
 * @param[in]  connection  The connection handle.
 * @param[in]  uri         The full URI to redirect to.
 * @param[in]  user        User to add cookie for, or NULL.
 *
 * @return MHD_NO in case of a problem. Else MHD_YES.
 */
int
send_redirect_to_uri (http_connection_t *connection, const char *uri,
                      user_t *user)
{
  int ret;
  http_response_t *response;
  char *body;

  /* Some libmicrohttp versions get into an endless loop in https mode
     if an empty body is passed.  As a workaround and because it is
     anyway suggested by the HTTP specs, we provide a short body.  We
     assume that uri does not need to be quoted.  */
  body = g_strdup_printf ("<html><body>Code 303 - Redirecting to"
                          " <a href=\"%s\">%s<a/></body></html>\n",
                          uri, uri);
  response = MHD_create_response_from_buffer (strlen (body), body,
                                              MHD_RESPMEM_MUST_FREE);

  if (!response)
    {
      g_warning ("%s: failed to create response, dropping request",
                 __FUNCTION__);
      return MHD_NO;
    }
  ret = MHD_add_response_header (response, MHD_HTTP_HEADER_LOCATION, uri);
  if (!ret)
    {
      MHD_destroy_response (response);
      g_warning ("%s: failed to add location header, dropping request",
                 __FUNCTION__);
      return MHD_NO;
    }

  if (user)
    {
      if (attach_sid (response, user->cookie) == MHD_NO)
        {
          MHD_destroy_response (response);
          g_warning ("%s: failed to attach SID, dropping request",
                     __FUNCTION__);
          return MHD_NO;
        }
    }

  MHD_add_response_header (response, MHD_HTTP_HEADER_EXPIRES, "-1");
  MHD_add_response_header (response, MHD_HTTP_HEADER_CACHE_CONTROL, "no-cache");

  add_security_headers (response);
  add_cors_headers (response);
  ret = MHD_queue_response (connection, MHD_HTTP_SEE_OTHER, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Sends a HTTP response.
 *
 * @param[in]  connection           The connection handle.
 * @param[in]  content              The content.
 * @param[in]  status_code          The HTTP status code.
 * @param[in]  sid                  Session ID, or NULL.
 * @param[in]  content_type         The content type.
 * @param[in]  content_disposition  The content disposition or NULL.
 * @param[in]  content_length       Content length, 0 for strlen (content).
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
int
send_response (http_connection_t *connection, const char *content,
               int status_code, const gchar *sid,
               content_type_t content_type,
               const char *content_disposition,
               size_t content_length)
{
  http_response_t *response;
  size_t size = (content_length ? content_length : strlen (content));
  int ret;

  response = MHD_create_response_from_buffer (size, (void *) content,
                                              MHD_RESPMEM_MUST_COPY);
  gsad_add_content_type_header (response, &content_type);

  if (content_disposition)
    MHD_add_response_header (response, "Content-Disposition",
                             content_disposition);

  if (sid)
    {
      if (strcmp (sid, "0"))
        {
          if (attach_sid (response, sid) == MHD_NO)
            {
              MHD_destroy_response (response);
              return MHD_NO;
            }
        }
      else
        {
          if (remove_sid (response) == MHD_NO)
            {
              MHD_destroy_response (response);
              return MHD_NO;
            }
        }
    }
  add_security_headers (response);
  add_cors_headers (response);
  ret = MHD_queue_response (connection, status_code, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Send response for handle_request.
 *
 * @param[in]  connection     Connection handle, e.g. used to send response.
 * @param[in]  response       Response.
 * @param[in]  content_type         Content type.
 * @param[in]  content_disposition  Content disposition.
 * @param[in]  http_response_code   Response code.
 * @param[in]  remove_cookie        Whether to remove SID cookie.
 *
 * @return MHD_YES on success, else MHD_NO.
 */
int
handler_send_response (http_connection_t *connection,
                       http_response_t *response,
                       content_type_t *content_type,
                       char *content_disposition,
                       int http_response_code,
                       int remove_cookie)
{
  int ret;

  if (remove_cookie)
    if (remove_sid (response) == MHD_NO)
      {
        MHD_destroy_response (response);
        g_warning ("%s: failed to remove SID, dropping request",
                   __FUNCTION__);
        return MHD_NO;
      }
  gsad_add_content_type_header (response, content_type);
  if (content_disposition != NULL)
    {
      MHD_add_response_header (response, "Content-Disposition",
                               content_disposition);
      g_free (content_disposition);
    }
  ret = MHD_queue_response (connection, http_response_code, response);
  if (ret == MHD_NO)
    {
      /* Assume this was due to a bad request, to keep the MHD "Internal
       * application error" out of the log. */
      send_response (connection, BAD_REQUEST_PAGE, MHD_HTTP_NOT_ACCEPTABLE,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Create a default 404 (not found) http response
 *
 * @param[in]   url                 Requested (not found) url
 * @param[out]  content_type        Content type of the response
 * @param[out]  http_response_code  HTTP response status code
 *
 * @return A http response
 */
http_response_t *
create_not_found_response(const gchar *url, content_type_t *content_type,
                          int *http_response_code)
{
  *content_type = GSAD_CONTENT_TYPE_TEXT_HTML; // FIXME gsad_message should determine the content type
  http_response_t *response;

  cmd_response_data_t response_data;

  cmd_response_data_init (&response_data);

  response_data.http_status_code = MHD_HTTP_NOT_FOUND;

  gchar *msg = gsad_message (NULL, NOT_FOUND_TITLE, NULL, 0, NOT_FOUND_MESSAGE,
                             "/login", &response_data);
  response = MHD_create_response_from_buffer (strlen (msg), (void *) msg,
                                              MHD_RESPMEM_MUST_COPY);
  *http_response_code = response_data.http_status_code;
  g_free (msg);
  return response;
}

/**
 * @brief Send a 404 response for a request
 *
 * @param[in]  connection  Connection handle, e.g. used to send response.
 * @param[in]  url         Requested url.
 *
 * @return MHD_YES on success. MHD_NO on errors.
 */
int
handler_send_not_found (http_connection_t *connection, const gchar * url)
{
  content_type_t content_type;
  int http_status_code;

  http_response_t *response = create_not_found_response(url, &content_type,
                                                        &http_status_code);
  return handler_send_response (connection, response, &content_type, NULL,
                                http_status_code, 0);
}

/**
 * @brief Send the login page to the user
 *
 * @param[in]  connection        Connection handle, e.g. used to send response.
 * @param[in]  http_status_code  HTTP status code for the response.
 * @param[in]  message           Message to add in the response.
 * @param[in]  url               Requested url.
 *
 * @return MHD_YES on success. MHD_NO on errors.
 */
int
handler_send_login_page (http_connection_t *connection,
                         int http_status_code, const gchar * message,
                         const gchar *url)
{
  const char * xml_flag = MHD_lookup_connection_value (connection,
                                                       MHD_GET_ARGUMENT_KIND,
                                                       "xml");
  time_t now;
  content_type_t content_type;
  char ctime_now[200];
  char *res;
  http_response_t *response;
  const gchar * guest_username = get_guest_username ();
  gchar *language;
  const char* accept_language = MHD_lookup_connection_value (connection,
                                                             MHD_HEADER_KIND,
                                                             "Accept-Language");

  now = time (NULL);
  ctime_r_strip_newline (&now, ctime_now);

  cmd_response_data_t response_data;
  cmd_response_data_init (&response_data);

  response_data.http_status_code = http_status_code;
  if (accept_language && g_utf8_validate (accept_language, -1, NULL) == FALSE)
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("'Accept-Language' header"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  language = accept_language_to_env_fmt (accept_language);

  gchar *xml = login_xml (message, NULL, ctime_now, url, language,
                          guest_username ? guest_username : "");

  g_free(language);

  if (xml_flag && strcmp (xml_flag, "0"))
    {
      res = xml;
      content_type = GSAD_CONTENT_TYPE_APP_XML;
    }
  else
    {
      content_type = GSAD_CONTENT_TYPE_TEXT_HTML;
      res = xsl_transform (xml, &response_data);
      g_free (xml);
    }

  response = MHD_create_response_from_buffer (strlen (res), res,
                                              MHD_RESPMEM_MUST_FREE);
  add_security_headers (response);
  add_cors_headers (response);

  http_status_code = response_data.http_status_code;

  cmd_response_data_reset (&response_data);
  return handler_send_response (connection,
                                response,
                                &content_type,
                                NULL,
                                http_status_code,
                                1);
}

/**
 * @brief Attach expired SID cookie to response.
 *
 * @param[in]  response  Response.
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
int
remove_sid (http_response_t *response)
{
  int ret;
  gchar *value;
  gchar *locale;
  char expires[EXPIRES_LENGTH + 1];
  struct tm expire_time_broken;
  time_t expire_time;

  /* Set up the expires param. */
  locale = g_strdup (setlocale (LC_ALL, NULL));
  setlocale (LC_ALL, "C");

  expire_time = time (NULL);
  if (localtime_r (&expire_time, &expire_time_broken) == NULL)
    abort ();
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d-%b-%Y %T GMT",
                  &expire_time_broken);
  if (ret == 0)
    abort ();

  setlocale (LC_ALL, locale);
  g_free (locale);

  /* Add the cookie.
   *
   * Tim Brown's suggested cookie included a domain attribute.  How would
   * we get the domain in here?  Maybe a --domain option. */

  value = g_strdup_printf (SID_COOKIE_NAME "=0; expires=%s; path=/; %sHTTPonly",
                           expires,
                           (is_use_secure_cookie () ? "secure; " : ""));
  ret = MHD_add_response_header (response, "Set-Cookie", value);
  g_free (value);
  return ret;
}

/**
 * @brief Attach SID cookie to a response, resetting "expire" arg.
 *
 * @param[in]  response  Response.
 * @param[in]  sid       Session ID.
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
int
attach_sid (http_response_t *response, const char *sid)
{
  int ret;
  gchar *value;
  gchar *locale;
  char expires[EXPIRES_LENGTH + 1];
  struct tm expire_time_broken;
  time_t now, expire_time;
  gchar *tz;

  /* Set up the expires param. */

  /* Store current TZ, switch to GMT. */
  tz = getenv ("TZ") ? g_strdup (getenv ("TZ")) : NULL;
  if (setenv ("TZ", "GMT", 1) == -1)
    {
      g_critical ("%s: failed to set TZ\n", __FUNCTION__);
      g_free (tz);
      exit (EXIT_FAILURE);
    }
  tzset ();

  locale = g_strdup (setlocale (LC_ALL, NULL));
  setlocale (LC_ALL, "C");

  now = time (NULL);
  expire_time = now + (get_session_timeout() * 60) + 30;
  if (localtime_r (&expire_time, &expire_time_broken) == NULL)
    abort ();
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d-%b-%Y %T GMT",
                  &expire_time_broken);
  if (ret == 0)
    abort ();

  setlocale (LC_ALL, locale);
  g_free (locale);

  /* Revert to stored TZ. */
  if (tz)
    {
      if (setenv ("TZ", tz, 1) == -1)
        {
          g_warning ("%s: Failed to switch to original TZ", __FUNCTION__);
          g_free (tz);
          exit (EXIT_FAILURE);
        }
    }
  else
    unsetenv ("TZ");
  g_free (tz);

  /* Add the cookie.
   *
   * Tim Brown's suggested cookie included a domain attribute.  How would
   * we get the domain in here?  Maybe a --domain option. */

  value = g_strdup_printf (SID_COOKIE_NAME
                           "=%s; expires=%s; path=/; %sHTTPonly",
                           sid,
                           expires,
                           (is_use_secure_cookie () ? "secure; " : ""));
  ret = MHD_add_response_header (response, "Set-Cookie", value);
  g_free (value);
  return ret;
}

/**
 * @brief Reads from a file.
 *
 * @param[in]  cls  File.
 * @param[in]  pos  Position in file to start reading.
 * @param[out] buf  Buffer to read into.
 * @param[in]  max  Maximum number of bytes to read.
 *
 * @return The number of bytes read.
 */
static int
file_reader (void *cls, uint64_t pos, char *buf, int max)
{
  FILE *file = cls;

  fseek (file, pos, SEEK_SET);
  return fread (buf, 1, max, file);
}

/**
 * @brief Create a response to serve a file.
 *
 * If the file does not exist, but user is logged in, refuse credentials
 * ("logout"). Otherwise, serve the default (login) page.
 *
 * @param[in]   credentials          User authentication information.
 * @param[in]   connection           Connection.
 * @param[in]   url                  Requested URL.
 * @param[out]  http_response_code   Return location for response code.
 * @param[out]  content_type         Return location for content type.
 * @param[out]  content_disposition  Return location for content disposition.
 *
 * @return Response to send in combination with the response code. NULL only
 *         if file information could not be retrieved.
 */
http_response_t *
file_content_response (credentials_t *credentials,
                       http_connection_t *connection, const char *url,
                       int *http_response_code, content_type_t *content_type,
                       char **content_disposition)
{
  FILE* file;
  gchar* path;
  char *default_file = "login/login.html";
  struct MHD_Response* response;
  char date_2822[DATE_2822_LEN];
  struct tm *mtime;
  time_t next_week;

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

  file = fopen (path, "r"); /* this file is just read and sent */

  if (file == NULL)
    {
      g_debug ("File %s failed, ", path);
      g_free (path);
      return create_not_found_response(url, content_type, http_response_code);
    }

  /* Guess content type. */
  *content_type = guess_content_type (path);

  /** @todo Set content disposition? */

  struct stat buf;
  g_debug ("Default file successful.\n");
  if (stat (path, &buf))
    {
      /* File information could not be retrieved. */
      g_critical ("%s: file <%s> can not be stat'ed.\n",
                  __FUNCTION__,
                  path);
      g_free (path);
      fclose (file);
      return NULL;
    }

  /* Make sure the requested path really is a file. */
  if ((buf.st_mode & S_IFMT) != S_IFREG)
    {
      g_free (path);
      fclose (file);
      return create_not_found_response(url, content_type, http_response_code);
    }

  response = MHD_create_response_from_callback (buf.st_size, 32 * 1024,
                                                (MHD_ContentReaderCallback) &file_reader,
                                                file,
                                                (MHD_ContentReaderFreeCallback)
                                                &fclose);

  mtime = localtime (&buf.st_mtime);
  if (mtime
      && strftime (date_2822, DATE_2822_LEN, "%a, %d %b %Y %H:%M:%S %Z", mtime))
    {
      MHD_add_response_header (response, "Last-Modified", date_2822);
    }

  next_week = time (NULL) + 7 * 24 * 60 * 60;
  mtime = localtime (&next_week);
  if (mtime
      && strftime (date_2822, DATE_2822_LEN, "%a, %d %b %Y %H:%M:%S %Z", mtime))
    {
      MHD_add_response_header (response, "Expires", date_2822);
    }

  g_free (path);
  *http_response_code = MHD_HTTP_OK;
  return response;
}

/**
 * @brief Append a request param to a string.
 *
 * @param[in]  string  String.
 * @param[in]  kind    Kind of request data.
 * @param[in]  key     Key.
 * @param[in]  value   Value.
 *
 * @return MHD_YES.
 */
static int
append_param (void *string, enum MHD_ValueKind kind, const char *key,
              const char *value)
{
  if (value == NULL)
    /* http://foo/bar?key */
    return MHD_YES;
  if (key == NULL)
    {
      assert (0);
      return MHD_YES;
    }
  /* http://foo/bar?key=value */
  if (strcmp (key, "token") && strcmp (key, "r"))
    {
      g_string_append ((GString*) string, key);
      g_string_append ((GString*) string, "=");
      g_string_append ((GString*) string, value);
      g_string_append ((GString*) string, "&");
    }
  return MHD_YES;
}

/**
 * @brief Reconstruct the URL for a connection.
 *
 * @param[in]  connection  Connection.
 * @param[in]  url         Base part of URL.
 *
 * @return URL.
 */
gchar *
reconstruct_url (http_connection_t *connection, const char *url)
{
  GString *full_url;

  full_url = g_string_new (url);
  /* To simplify appending the token later, ensure there is at least
   * one param. */
  g_string_append (full_url, "?r=1&");

  MHD_get_connection_values (connection, MHD_GET_ARGUMENT_KIND,
                             append_param, full_url);

  if (full_url->str[strlen (full_url->str) - 1] == '&')
    full_url->str[strlen (full_url->str) - 1] = '\0';

  return g_string_free (full_url, FALSE);
}


/**
 * @brief Add security headers to a MHD response.
 */
void
add_security_headers (http_response_t *response)
{
  const gchar * http_x_frame_options = get_http_x_frame_options ();
  const gchar * http_content_security_policy =
    get_http_content_security_policy ();
  const gchar * http_strict_transport_security =
    get_http_strict_transport_security ();

  if (strcmp (http_x_frame_options, ""))
    MHD_add_response_header (response, "X-Frame-Options",
                             http_x_frame_options);
  if (strcmp (http_content_security_policy, ""))
    MHD_add_response_header (response, "Content-Security-Policy",
                             http_content_security_policy);
  if (http_strict_transport_security)
    MHD_add_response_header (response, "Strict-Transport-Security",
                             http_strict_transport_security);
}

/**
 * @brief Add guest chart content security headers to a MHD response.
 */
void
add_guest_chart_content_security_headers (http_response_t *response)
{
  if (strcmp (get_http_x_frame_options (), ""))
    MHD_add_response_header (response, "X-Frame-Options",
                             get_http_guest_chart_x_frame_options ());
  if (strcmp (get_http_content_security_policy (), ""))
    MHD_add_response_header (response, "Content-Security-Policy",
                             get_http_guest_chart_content_security_policy ());
}

void
add_cors_headers (http_response_t *response)
{
  const gchar * http_cors_origin = get_http_cors_origin ();

  if (strcmp (http_cors_origin, "")) {
    MHD_add_response_header (response, "Access-Control-Allow-Origin",
                             http_cors_origin);
    MHD_add_response_header (response, "Access-Control-Allow-Credentials",
                             "true");
  }
}

gboolean
is_export (http_connection_t *connection)
{
  const char *cmd;

  cmd = MHD_lookup_connection_value (connection, MHD_GET_ARGUMENT_KIND, "cmd");

  if (cmd && g_utf8_validate (cmd, -1, NULL))
    {
      if (strncmp (cmd, "export", strlen ("export")) == 0)
        return 1;
      else if (strcmp (cmd, "get_report") == 0)
        {
          const char *report_format_id;

          report_format_id = MHD_lookup_connection_value
                              (connection,
                                MHD_GET_ARGUMENT_KIND,
                                "report_format_id");
          if (report_format_id
              && g_utf8_validate (report_format_id, -1, NULL))
            return 1;
        }
    }
  return 0;
}

/**
 * @brief Get the client's address.
 *
 * @param[in]   conn             Connection.
 * @param[out]  client_address   Buffer to store client address. Must have at
 *                               least INET6_ADDRSTRLEN bytes.
 *
 * @return  0 success, 1 invalid UTF-8 in X-Real-IP header
 */
int
get_client_address (http_connection_t *conn, char *client_address)
{
  const char* x_real_ip;

  /* First try X-Real-IP header (unless told to ignore), then MHD connection. */

  x_real_ip = MHD_lookup_connection_value (conn,
                                           MHD_HEADER_KIND,
                                           "X-Real-IP");

  if (!is_ignore_http_x_real_ip()
      && x_real_ip && g_utf8_validate (x_real_ip, -1, NULL) == FALSE)
    return 1;
  else if (!is_ignore_http_x_real_ip() && x_real_ip != NULL)
    strncpy (client_address, x_real_ip, INET6_ADDRSTRLEN);
  else if (is_unix_socket())
    strncpy (client_address, "unix_socket", INET6_ADDRSTRLEN);
  else
    {
      const union MHD_ConnectionInfo* info;

      info = MHD_get_connection_info (conn, MHD_CONNECTION_INFO_CLIENT_ADDRESS);
      sockaddr_as_str ((struct sockaddr_storage *) info->client_addr,
                       client_address);
    }
  return 0;
}

/**
 * @brief Serves part of a POST request.
 *
 * Implements an MHD_PostDataIterator.
 *
 * Called one or more times to collect the multiple parts (key/value pairs)
 * of a POST request.  Fills the params of a gsad_connection_info.
 *
 * After serve_post, the connection info is free'd.
 *
 * @param[in,out]  coninfo_cls   Connection info (a gsad_connection_info).
 * @param[in]      kind          Type of request data (header, cookie, etc.).
 * @param[in]      key           Name of data (name of request variable).
 * @param[in]      filename      Name of uploaded file if any, else NULL.
 * @param[in]      content_type  MIME type of data if known, else NULL.
 * @param[in]      transfer_encoding  Transfer encoding if known, else NULL.
 * @param[in]      data          Data.
 * @param[in]      off           Offset into entire data.
 * @param[in]      size          Size of data, in bytes.
 *
 * @return MHD_YES to continue iterating over post data, MHD_NO to stop.
 */
int
serve_post (void *coninfo_cls, enum MHD_ValueKind kind, const char *key,
            const char *filename, const char *content_type,
            const char *transfer_encoding, const char *data, uint64_t off,
            size_t size)
{
  gsad_connection_info_t *con_info = (gsad_connection_info_t *) coninfo_cls;

  con_info->answercode = MHD_HTTP_INTERNAL_SERVER_ERROR;
  con_info->response   = SERVER_ERROR;

  if (NULL != key)
    {
      params_append_mhd (con_info->params, key, filename, data, size, off);
      con_info->answercode = MHD_HTTP_OK;
      return MHD_YES;
    }
  return MHD_NO;
}

/**
 * @brief Handles fatal errors.
 *
 * @todo Make it accept formatted strings.
 *
 * @param[in]  credentials  User authentication information.
 * @param[in]  title     The title for the message.
 * @param[in]  function  The function in which the error occurred.
 * @param[in]  line      The line number at which the error occurred.
 * @param[in]  msg       The response message.
 * @param[in]  backurl   The URL offered to get back to a sane situation.
 *                       If NULL, the tasks page is used.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return An HTML document as a newly allocated string.
 */
char *
gsad_message (credentials_t *credentials, const char *title,
              const char *function, int line, const char *msg,
              const char *backurl, cmd_response_data_t *response_data)
{
  gchar *xml, *message, *resp;
  const char* xml_flag;

  if (credentials && credentials->params)
    xml_flag = params_value (credentials->params, "xml");
  else
    xml_flag = NULL;

  if (function)
    {
      message = g_strdup_printf ("<gsad_response>"
                                 "<title>%s: %s:%i (GSA %s)</title>"
                                 "<message>%s</message>"
                                 "<backurl>%s</backurl>"
                                 "<token>%s</token>"
                                 "</gsad_response>",
                                 title,
                                 function,
                                 line,
                                 GSAD_VERSION,
                                 msg,
                                 backurl ? backurl : "/omp?cmd=get_tasks",
                                 credentials ? credentials->token : "");
    }
  else
    {
      message = g_strdup_printf ("<gsad_response>"
                                 "<title>%s (GSA %s)</title>"
                                 "<message>%s</message>"
                                 "<backurl>%s</backurl>"
                                 "<token>%s</token>"
                                 "</gsad_response>",
                                 title,
                                 GSAD_VERSION,
                                 msg,
                                 backurl ? backurl : "/omp?cmd=get_tasks",
                                 credentials ? credentials->token : "");
    }

  if (credentials)
    {
      gchar *pre;
      time_t now;
      char ctime_now[200];

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
               "<client_address>%s</client_address>",
               GSAD_VERSION,
               vendor_version_get (),
               credentials->token,
               ctime_now,
               credentials->username,
               credentials->role,
               credentials->language,
               credentials->charts,
               credentials->client_address);
      xml = g_strdup_printf ("%s%s"
                              "<capabilities>%s</capabilities>"
                              "</envelope>",
                              pre,
                              message,
                              credentials->capabilities);
      g_free (pre);
    }
  else
    {
      xml = g_strdup (message);
    }
  g_free (message);

  if (xml_flag && strcmp (xml_flag, "0"))
    return xml;

  resp = xsl_transform (xml, response_data);
  if (resp == NULL)
    {
      resp = g_strdup ("<html>"
                       "<body>"
                       "An internal server error has occurred during XSL"
                       " transformation."
                       "</body>"
                       "</html>");
      response_data->http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
    }
  g_free (xml);
  return resp;
}

/**
 * @brief Generate XML for login page.
 *
 * @param[in]  message      Login screen message, or NULL.
 * @param[out] token        Token, or NULL.
 * @param[out] time         Time.
 * @param[out] url          URL.
 * @param[out] i18n         i18n language code, or NULL.
 * @param[out] guest        Username for guest login, or NULL.
 *
 * @return Freshly allocated login XML.
 */
gchar *
login_xml (const gchar *message, const gchar *token, const gchar *time,
           const gchar *url, const gchar *i18n, const gchar *guest)
{
  GString *xml;
  const gchar *label = label_name_get();

  xml = g_string_new ("");
  xml_string_append (xml,
                     "<login_page>"
                     "<version>%s</version>"
                     "<vendor_version>%s</vendor_version>"
                     "<token>%s</token>"
                     "<time>%s</time>",
                     GSAD_VERSION,
                     vendor_version_get (),
                     token ? token : "",
                     time);

  if (label)
    xml_string_append(xml,
                      "<label>%s</label>",
                      label);
  if (message)
    xml_string_append (xml,
                       "<message>%s</message>",
                       message);
  if (url)
    xml_string_append (xml,
                       "<url>%s</url>",
                       url);
  if (i18n)
    xml_string_append (xml,
                       "<i18n>%s</i18n>",
                       i18n);
  if (guest)
    xml_string_append (xml,
                       "<guest><username>%s</username></guest>",
                       guest);
  g_string_append (xml, "</login_page>");

  return g_string_free (xml, FALSE);
}
