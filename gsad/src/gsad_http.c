/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file gsad_http.c
 * @brief HTTP handling
 */

#include "gsad_http.h"

#include "gsad_base.h" /* for ctime_r_strip_newline */
#include "gsad_i18n.h" /* for accept_language_to_env_fmt */
#include "gsad_settings.h"
#include "utils.h" /* for str_equal */

#include <assert.h>              /* for asset */
#include <gvm/base/networking.h> /* for sockaddr_as_str */
#include <gvm/util/xmlutils.h>   /* for xml_string_append */
#include <locale.h>              /* for setlocale */
#include <stdlib.h>              /* for abort */
#include <string.h>              /* for strcmp */
#include <sys/stat.h>            /* struct stat */
#include <sys/types.h>
#include <unistd.h>

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
guess_content_type (const gchar *path)
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
  else if (g_str_has_suffix (path, ".json"))
    return GSAD_CONTENT_TYPE_APP_JSON;
  else if (g_str_has_suffix (path, ".txt"))
    return GSAD_CONTENT_TYPE_TEXT_PLAIN;
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
gsad_add_content_type_header (http_response_t *response, content_type_t *ct)
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
    case GSAD_CONTENT_TYPE_APP_XHTML:
      MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                               "application/xhtml+xml");
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
    case GSAD_CONTENT_TYPE_APP_JSON:
      MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                               "application/json; charset=utf-8");
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
 * @brief Sends a HTTP redirection to an uri.
 *
 * @param[in]  connection  The connection handle.
 * @param[in]  uri         The full URI to redirect to.
 * @param[in]  sid         Session ID to add, or NULL.
 *
 * @return MHD_NO in case of a problem. Else MHD_YES.
 */
int
send_redirect_to_uri (http_connection_t *connection, const char *uri,
                      const gchar *sid)
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
                 __func__);
      return MHD_NO;
    }
  ret = MHD_add_response_header (response, MHD_HTTP_HEADER_LOCATION, uri);
  if (!ret)
    {
      MHD_destroy_response (response);
      g_warning ("%s: failed to add location header, dropping request",
                 __func__);
      return MHD_NO;
    }

  if (attach_remove_sid (response, sid) == MHD_NO)
    {
      MHD_destroy_response (response);
      g_warning ("%s: failed to attach SID, dropping request", __func__);
      return MHD_NO;
    }

  add_forbid_caching_headers (response);
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
               int status_code, const gchar *sid, content_type_t content_type,
               const char *content_disposition, size_t content_length)
{
  http_response_t *response;
  size_t size;
  int ret;

  if (content)
    size = (content_length ? content_length : strlen (content));
  else
    {
      g_warning ("%s: content is NULL", __func__);
      status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
      size = 0;
    }
  response = MHD_create_response_from_buffer (
    size, (void *) (content ? content : ""), MHD_RESPMEM_MUST_COPY);

  gsad_add_content_type_header (response, &content_type);

  if (content_disposition)
    MHD_add_response_header (response, "Content-Disposition",
                             content_disposition);

  if (attach_remove_sid (response, sid) == MHD_NO)
    {
      return MHD_NO;
    }

  add_forbid_caching_headers (response);
  add_security_headers (response);
  add_cors_headers (response);
  ret = MHD_queue_response (connection, status_code, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Send response for handle_request.
 *
 * The passed response data will be freed and can't be used afterwards
 *
 * @param[in]  connection     Connection handle, e.g. used to send response.
 * @param[in]  response       Response.
 * @param[in]  response_data  Response data struct. Response data will be freed.
 * @param[in]  sid            Session ID, or NULL. "0" to remove session.
 *
 * @return MHD_YES on success, else MHD_NO.
 */
int
handler_send_response (http_connection_t *connection, http_response_t *response,
                       cmd_response_data_t *response_data, const gchar *sid)
{
  int ret;
  const gchar *content_disposition;
  content_type_t content_type;
  int status_code;

  if (attach_remove_sid (response, sid) == MHD_NO)
    {
      cmd_response_data_free (response_data);
      MHD_destroy_response (response);
      return MHD_NO;
    }

  content_type = cmd_response_data_get_content_type (response_data);

  if (content_type == GSAD_CONTENT_TYPE_STRING)
    {
      MHD_add_response_header (
        response, MHD_HTTP_HEADER_CONTENT_TYPE,
        cmd_response_data_get_content_type_string (response_data));
    }
  else
    {
      gsad_add_content_type_header (response, &content_type);
    }

  content_disposition =
    cmd_response_data_get_content_disposition (response_data);

  if (content_disposition != NULL)
    {
      MHD_add_response_header (response, "Content-Disposition",
                               content_disposition);
    }

  if (cmd_response_data_is_allow_caching (response_data) == FALSE)
    add_forbid_caching_headers (response);
  add_security_headers (response);
  add_cors_headers (response);

  status_code = cmd_response_data_get_status_code (response_data);

  cmd_response_data_free (response_data);

  ret = MHD_queue_response (connection, status_code, response);
  if (ret == MHD_NO)
    {
      /* Assume this was due to a bad request, to keep the MHD "Internal
       * application error" out of the log. */
      send_response (connection, BAD_REQUEST_PAGE, MHD_HTTP_NOT_ACCEPTABLE,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      MHD_destroy_response (response);
      return MHD_YES;
    }
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Create and send a response
 *
 * The passed response data will be freed and can't be used afterwards
 *
 * @param[in]  connection     Connection handle, e.g. used to send response.
 * @param[in]  data           Data to send in response
 * @param[in]  response_data  Response data struct. Response data will be freed.
 * @param[in]  sid            Session ID, or NULL. "0" to remove session.
 *
 * @return MHD_YES on success, else MHD_NO.
 */
int
handler_create_response (http_connection_t *connection, gchar *data,
                         cmd_response_data_t *response_data, const gchar *sid)
{
  http_response_t *response;
  gsize len = 0;

  len = cmd_response_data_get_content_length (response_data);
  if (len == 0 && data)
    {
      len = strlen (data);
    }

  response = MHD_create_response_from_buffer (len, data, MHD_RESPMEM_MUST_FREE);
  return handler_send_response (connection, response, response_data, sid);
}

/**
 * @brief Create a default 404 (not found) http response
 *
 * @param[out]  response_data       Response data to return
 *
 * @return A http response
 */
http_response_t *
create_not_found_response (cmd_response_data_t *response_data)
{
  http_response_t *response;
  int len;

  cmd_response_data_set_status_code (response_data, MHD_HTTP_NOT_FOUND);

  gchar *msg =
    "<!DOCTYPE html>"
    "<html>"
    "<head>"
    "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />"
    "<link rel=\"icon\" href=\"/img/favicon.gif\" type=\"image/gif\"></link>"
    "<title>Greenbone Security Assistant</title>"
    "</head>"
    "<body>"
    "<h1>URL not found</h1>"
    "<p>"
    "The requested URL is not available"
    "</p>"
    "</body>"
    "</html>";

  cmd_response_data_set_content_type (response_data,
                                      GSAD_CONTENT_TYPE_TEXT_HTML);

  cmd_response_data_set_content_length (response_data, strlen (msg));

  len = cmd_response_data_get_content_length (response_data);
  response = MHD_create_response_from_buffer (len, msg, MHD_RESPMEM_MUST_COPY);
  return response;
}

/**
 * @brief Allow for reauthentication of a user
 *
 * @param[in]  connection        Connection handle, e.g. used to send response.
 * @param[in]  http_status_code  HTTP status code for the response.
 * @param[in]  reason            Reason for re-authentication
 *
 * @return MHD_YES on success. MHD_NO on errors.
 */
int
handler_send_reauthentication (http_connection_t *connection,
                               int http_status_code,
                               authentication_reason_t reason)
{
  const char *msg;

  switch (reason)
    {
    case LOGIN_FAILED:
      msg = "Login failed.";
      break;
    case LOGIN_ERROR:
      msg = "Login failed. Error during authentication.";
      break;
    case GMP_SERVICE_DOWN:
      msg = "Login failed. GMP Service is down.";
      break;
    case SESSION_EXPIRED:
      msg = "Session expired. Please login again.";
      break;
    case LOGOUT_ALREADY:
      msg = "Already logged out.";
      break;
    case BAD_MISSING_TOKEN:
      msg = "Token missing or bad. Please login again.";
      break;
    case BAD_MISSING_COOKIE:
      msg = "Cookie missing or bad. Please login again.";
      break;
    case LOGOUT:
      msg = "Successfully logged out.";
      break;
    case UNKOWN_ERROR:
      msg = "Unknown error.";
      break;
    default:
      msg = "";
    }

  cmd_response_data_t *response_data = cmd_response_data_new ();
  cmd_response_data_set_status_code (response_data, http_status_code);

  gchar *xml = gsad_message (NULL, "Authentication required", __func__,
                             __LINE__, msg, response_data);

  return handler_create_response (connection, xml, response_data, REMOVE_SID);
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
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d %b %Y %T GMT",
                  &expire_time_broken);
  if (ret == 0)
    abort ();

  setlocale (LC_ALL, locale);
  g_free (locale);

  /* Add the cookie.
   *
   * Tim Brown's suggested cookie included a domain attribute.  How would
   * we get the domain in here?  Maybe a --domain option. */

  value =
    g_strdup_printf (SID_COOKIE_NAME "=0; expires=%s; path=/; %sHTTPonly",
                     expires, (is_use_secure_cookie () ? "secure; " : ""));
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
  int ret, timeout;
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
      g_critical ("%s: failed to set TZ\n", __func__);
      g_free (tz);
      exit (EXIT_FAILURE);
    }
  tzset ();

  locale = g_strdup (setlocale (LC_ALL, NULL));
  setlocale (LC_ALL, "C");

  timeout = get_session_timeout () * 60 + 30;

  now = time (NULL);
  expire_time = now + timeout;
  if (localtime_r (&expire_time, &expire_time_broken) == NULL)
    abort ();
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d %b %Y %T GMT",
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
          g_warning ("%s: Failed to switch to original TZ", __func__);
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

  value = g_strdup_printf (
    SID_COOKIE_NAME "=%s; expires=%s; max-age=%d; path=/; %sHTTPonly", sid,
    expires, timeout, (is_use_secure_cookie () ? "secure; " : ""));
  ret = MHD_add_response_header (response, "Set-Cookie", value);
  g_free (value);
  return ret;
}

/**
 * Attach or remove session id
 *
 * If sid is "0" the session id will be removed. Otherwise if the sid is not
 * NULL the sid will be attached to the response.
 *
 * @param[in]  response  HTTP response
 * @param[in]  sid       Session ID
 *
 * @return MHD_YES on success, MHD_NO on failure
 */
int
attach_remove_sid (http_response_t *response, const gchar *sid)
{
  if (sid)
    {
      if (str_equal (sid, REMOVE_SID))
        {
          if (remove_sid (response) == MHD_NO)
            {
              MHD_destroy_response (response);
              g_warning ("%s: failed to remove SID, dropping request",
                         __func__);
              return MHD_NO;
            }
        }
      else
        {
          if (attach_sid (response, sid) == MHD_NO)
            {
              MHD_destroy_response (response);
              g_warning ("%s: failed to attach SID, dropping request",
                         __func__);
              return MHD_NO;
            }
        }
    }
  return MHD_YES;
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
 * @brief Create a response to serve a file from a path.
 *
 * @param[in]   connection           Connection.
 * @param[in]   url                  Requested URL.
 * @param[in]   path                 Path to file.
 * @param[out]  response_data        Return response data
 *
 * @return Response to send in combination with the response code. NULL only
 *         if file information could not be retrieved.
 */
http_response_t *
file_content_response (http_connection_t *connection, const char *url,
                       const char *path, cmd_response_data_t *response_data)
{
  char date_2822[DATE_2822_LEN];
  struct tm *mtime;
  time_t next_week;
  http_response_t *response;
  FILE *file;
  struct stat buf;

  cmd_response_data_set_status_code (response_data, MHD_HTTP_OK);

  if (!g_file_test (path, (G_FILE_TEST_EXISTS | G_FILE_TEST_IS_REGULAR)))
    {
      /* path does not exists or is not a file */
      /* return index.html to show page not found via js */
      g_debug ("File %s not found. Return index.html", path);

      path = "index.html";
      cmd_response_data_set_status_code (response_data, MHD_HTTP_NOT_FOUND);
    }

  file = fopen (path, "r"); /* this file is just read and sent */

  if (file == NULL)
    {
      g_debug ("File %s failed, ", path);
      return create_not_found_response (response_data);
    }

  /* Guess content type. */
  cmd_response_data_set_content_type (response_data, guess_content_type (path));

  if (stat (path, &buf))
    {
      /* File information could not be retrieved. */
      g_critical ("%s: file <%s> can not be stat'ed.\n", __func__, path);
      fclose (file);
      return create_not_found_response (response_data);
    }

  /* Make sure the requested path really is a file. */
  if ((buf.st_mode & S_IFMT) != S_IFREG)
    {
      fclose (file);
      return create_not_found_response (response_data);
    }

  response = MHD_create_response_from_callback (
    buf.st_size, 32 * 1024, (MHD_ContentReaderCallback) &file_reader, file,
    (MHD_ContentReaderFreeCallback) &fclose);

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
#if MHD_VERSION < 0x00097002
static int
#else
static enum MHD_Result
#endif
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
      g_string_append ((GString *) string, key);
      g_string_append ((GString *) string, "=");
      g_string_append ((GString *) string, value);
      g_string_append ((GString *) string, "&");
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

  MHD_get_connection_values (connection, MHD_GET_ARGUMENT_KIND, append_param,
                             full_url);

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
  const gchar *http_x_frame_options = get_http_x_frame_options ();
  const gchar *http_content_security_policy =
    get_http_content_security_policy ();
  const gchar *http_strict_transport_security =
    get_http_strict_transport_security ();

  if (strcmp (http_x_frame_options, ""))
    MHD_add_response_header (response, "X-Frame-Options", http_x_frame_options);
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
  const gchar *http_cors_origin = get_http_cors_origin ();

  if (strcmp (http_cors_origin, ""))
    {
      MHD_add_response_header (response, "Access-Control-Allow-Origin",
                               http_cors_origin);
      MHD_add_response_header (response, "Access-Control-Allow-Credentials",
                               "true");
    }
}

/**
 * @brief Add header to forbid caching to a HTTP response.
 *
 * @param[in]  response       The HTTP response to add the headers to.
 * @param[in]  allow_caching  1 to allow caching, 0 to forbid.
 */
void
add_forbid_caching_headers (http_response_t *response)
{
  MHD_add_response_header (response, MHD_HTTP_HEADER_EXPIRES, "-1");
  MHD_add_response_header (response, MHD_HTTP_HEADER_CACHE_CONTROL,
                           "no-cache, no-store");
  MHD_add_response_header (response, MHD_HTTP_HEADER_PRAGMA, "no-cache");
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
  const char *x_real_ip;

  /* First try X-Real-IP header (unless told to ignore), then MHD connection. */

  x_real_ip = MHD_lookup_connection_value (conn, MHD_HEADER_KIND, "X-Real-IP");

  if (!is_ignore_http_x_real_ip () && x_real_ip
      && g_utf8_validate (x_real_ip, -1, NULL) == FALSE)
    return 1;
  else if (!is_ignore_http_x_real_ip () && x_real_ip != NULL)
    strncpy (client_address, x_real_ip, INET6_ADDRSTRLEN);
  else if (is_unix_socket ())
    strncpy (client_address, "unix_socket", INET6_ADDRSTRLEN);
  else
    {
      const union MHD_ConnectionInfo *info;

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
#if MHD_VERSION < 0x00097002
int
#else
enum MHD_Result
#endif
serve_post (void *coninfo_cls, enum MHD_ValueKind kind, const char *key,
            const char *filename, const char *content_type,
            const char *transfer_encoding, const char *data, uint64_t off,
            size_t size)
{
  gsad_connection_info_t *con_info = (gsad_connection_info_t *) coninfo_cls;

  if (NULL != key)
    {
      params_append_mhd (con_info->params, key, filename, data, size, off);
      return MHD_YES;
    }
  return MHD_NO;
}

/**
 * @brief Handles fatal errors.
 *
 * @todo Make it accept formatted strings.
 *
 * @param[in]  credentials     User authentication information.
 * @param[in]  title           The title for the message.
 * @param[in]  function        The function in which the error occurred.
 * @param[in]  line            The line number at which the error occurred.
 * @param[in]  msg             The response message.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return An XML document as a newly allocated string.
 */
char *
gsad_message (credentials_t *credentials, const char *title,
              const char *function, int line, const char *msg,
              cmd_response_data_t *response_data)
{
  gchar *xml, *xmltitle;

  if (function)
    {
      xmltitle = g_strdup_printf ("<title>%s: %s:%i (GSA %s)</title>", title,
                                  function, line, GSAD_VERSION);
    }
  else
    {
      xmltitle =
        g_strdup_printf ("<title>%s (GSA %s)</title>", title, GSAD_VERSION);
    }

  if (credentials)
    {
      gchar *pre;
      time_t now;
      char ctime_now[200];
      user_t *user = credentials_get_user (credentials);

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      pre = g_markup_printf_escaped (
        "<envelope>"
        "<version>%s</version>"
        "<vendor_version>%s</vendor_version>"
        "<token>%s</token>"
        "<time>%s</time>"
        "<login>%s</login>"
        "<role>%s</role>"
        "<i18n>%s</i18n>"
        "<client_address>%s</client_address>",
        GSAD_VERSION, vendor_version_get (), user_get_token (user), ctime_now,
        user_get_username (user), user_get_role (user),
        credentials_get_language (credentials), user_get_client_address (user));

      xml = g_strdup_printf ("%s"
                             "<gsad_response>"
                             "%s"
                             "<message>%s</message>"
                             "</gsad_response>"
                             "<capabilities>%s</capabilities>"
                             "</envelope>",
                             pre, xmltitle, msg ? msg : "",
                             user_get_capabilities (user));

      g_free (pre);
    }
  else
    {
      xml = g_strdup_printf ("<envelope>"
                             "<version>%s</version>"
                             "<vendor_version>%s</vendor_version>"
                             "<gsad_response>"
                             "%s"
                             "<message>%s</message>"
                             "<token></token>"
                             "</gsad_response>"
                             "</envelope>",
                             GSAD_VERSION, vendor_version_get (), xmltitle,
                             msg ? msg : "");
    }

  g_free (xmltitle);

  cmd_response_data_set_content_type (response_data, GSAD_CONTENT_TYPE_APP_XML);
  cmd_response_data_set_content_length (response_data, strlen (xml));

  return xml;
}
