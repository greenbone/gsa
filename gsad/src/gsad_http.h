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
 * @file gsad_http.h
 * @brief HTTP handling of GSA.
 */

#ifndef _GSAD_HTTP_H
#define _GSAD_HTTP_H

#include "gsad_cmd.h"          /* for cmd_response_data_t */
#include "gsad_content_type.h" /* for content_type_t */
#include "gsad_credentials.h"  /* for credentials_t */
#include "gsad_user.h"         /* for user_t */

#include <glib.h>
#include <microhttpd.h>

/**
 * @brief At least maximum length of rfc2822 format date.
 */
#define DATE_2822_LEN 100

/**
 * @brief Max length of cookie expires param.
 */
#define EXPIRES_LENGTH 100

/*
 * UTF-8 Error page HTML.
 */
#define UTF8_ERROR_PAGE(location)                                     \
  "<html>"                                                            \
  "<head><title>Invalid request</title></head>"                       \
  "<body>The request contained invalid UTF-8 in " location ".</body>" \
  "</html>"

/**
 * @brief Name of the cookie used to store the SID.
 */
#define SID_COOKIE_NAME "GSAD_SID"

#define REMOVE_SID "0"

/**
 * @brief Title for "Page not found" messages.
 */
#define NOT_FOUND_TITLE "Invalid request"

/**
 * @brief Main message for "Page not found" messages.
 */
#define NOT_FOUND_MESSAGE "The requested page or file does not exist."

/**
 * @brief Error page HTML.
 */
#define ERROR_PAGE "<html><body>HTTP Method not supported</body></html>"

/**
 * @brief Bad request error HTML.
 */
#define BAD_REQUEST_PAGE "<html><body>Bad request.</body></html>"

/**
 * @brief Server error HTML.
 */
#define SERVER_ERROR \
  "<html><body>An internal server error has occurred.</body></html>"

#undef MAX_HOST_LEN

/**
 * @brief Maximum length of the host portion of the redirect address.
 */
#define MAX_HOST_LEN 1000

#define LOGIN_URL "/login"
#define LOGOUT_URL "/logout"

/**
 * @brief Buffer size for POST processor.
 */
#define POST_BUFFER_SIZE 500000

/**
 * @brief The symbol is deprecated, but older versions (0.9.37 - Debian
 * jessie) don't define it yet.
 */
#ifndef MHD_HTTP_NOT_ACCEPTABLE
#define MHD_HTTP_NOT_ACCEPTABLE MHD_HTTP_METHOD_NOT_ACCEPTABLE
#endif

/**
 * @brief Maximum length of "file name" for /help/ URLs.
 */
#define MAX_FILE_NAME_SIZE 128

/**
 * @brief Connection information.
 *
 * These objects are used to hold connection information
 * during the multiple calls of the request handler that
 * refer to the same request.
 *
 * Once a request is finished, the object will be free'd.
 */
typedef struct gsad_connection_info
{
  struct MHD_PostProcessor *postprocessor; ///< POST processor.
  params_t *params;                        ///< Request parameters.
  char *cookie;                            ///< Value of SID cookie param.
  char *language;                          ///< Language code e.g. en
  int connectiontype;                      ///< 1=POST, 2=GET.
  gchar *redirect;                         ///< Redirect URL.
} gsad_connection_info_t;

typedef struct MHD_Connection http_connection_t;

typedef struct MHD_Response http_response_t;

content_type_t
guess_content_type (const gchar *path);

void
gsad_add_content_type_header (http_response_t *response, content_type_t *ct);

int
handler_create_response (http_connection_t *connection, gchar *data,
                         cmd_response_data_t *response_data, const gchar *sid);

int
handler_send_response (http_connection_t *connection, http_response_t *response,
                       cmd_response_data_t *response_data, const gchar *sid);

/**
 * @brief Content types.
 */
enum authentication_reason
{
  LOGIN_FAILED,
  LOGIN_ERROR,
  LOGOUT,
  LOGOUT_ALREADY,
  GMP_SERVICE_DOWN,
  SESSION_EXPIRED,
  BAD_MISSING_COOKIE,
  BAD_MISSING_TOKEN,
  UNKOWN_ERROR,
};

typedef enum authentication_reason authentication_reason_t;

int
handler_send_reauthentication (http_connection_t *connection,
                               int http_status_code,
                               authentication_reason_t reason);

int
send_response (http_connection_t *connection, const char *content,
               int status_code, const gchar *sid, content_type_t content_type,
               const char *content_disposition, size_t content_length);

int
send_redirect_to_uri (http_connection_t *connection, const char *uri,
                      const gchar *sid);

void
add_security_headers (http_response_t *response);

void
add_guest_chart_content_security_headers (http_response_t *response);

void
add_cors_headers (http_response_t *response);

void
add_forbid_caching_headers (http_response_t *response);

/* helper functions required in gsad_http */
http_response_t *
file_content_response (http_connection_t *connection, const char *url,
                       const char *path, cmd_response_data_t *response_data);

gchar *
reconstruct_url (http_connection_t *connection, const char *url);

int
get_client_address (http_connection_t *conn, char *client_address);

#if MHD_VERSION < 0x00097002
int
#else
enum MHD_Result
#endif
serve_post (void *coninfo_cls, enum MHD_ValueKind kind, const char *key,
            const char *filename, const char *content_type,
            const char *transfer_encoding, const char *data, uint64_t off,
            size_t size);

int
remove_sid (http_response_t *response);

int
attach_sid (http_response_t *response, const char *sid);

int
attach_remove_sid (http_response_t *response, const gchar *sid);

/* params_append_mhd, exec_gmp_... are still in gsad.c */
int
exec_gmp_get (http_connection_t *connection, gsad_connection_info_t *con_info,
              credentials_t *credentials);

int
exec_gmp_post (http_connection_t *connection, gsad_connection_info_t *con_info,
               const char *client_address);

int
params_append_mhd (params_t *params, const char *name, const char *filename,
                   const char *chunk_data, int chunk_size, int chunk_offset);

char *
gsad_message (credentials_t *, const char *, const char *, int, const char *,
              cmd_response_data_t *);

#endif /* _GSAD_HTTP_H */
