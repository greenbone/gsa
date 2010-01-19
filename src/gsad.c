/* Greenbone Security Assistant
 * $Id$
 * Description: Main module of Greenbone Security Assistant daemon.
 *
 * Authors:
 * Chandrashekhar B <bchandra@secpod.com>
 * Matthew Mundell <matthew.mundell@intevation.de>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@intevation.de>
 *
 * Copyright:
 * Copyright (C) 2009 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * or, at your option, any later version as published by the Free
 * Software Foundation
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
 * @file gsad.c
 * @brief Main module of Greenbone Security Assistant daemon
 *
 * This file contains the core of the GSA server process that
 * handles HTTPS requests and communicates with OpenVAS-Manager via the
 * OMP protocol.
 */

/**
 * @brief The Glib fatal mask, redefined to leave out G_LOG_FLAG_RECURSION.
 */
#undef G_LOG_FATAL_MASK
#define G_LOG_FATAL_MASK G_LOG_LEVEL_ERROR

#include <errno.h>
#include <gcrypt.h>
#include <glib.h>
#include <gnutls/gnutls.h>
#include <openvas_logging.h>
#include <openvas/base/pidfile.h>
#include <pthread.h>
#include <signal.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
/* This must follow the system includes. */
#include <microhttpd.h>

#include "gsad_omp.h"
#include "gsad_oap.h" /* for create_user_oap */
#include "tracef.h"
#include "validator.h"

/**
 * @brief Fallback GSAD port.
 */
#define DEFAULT_GSAD_PORT 443

/**
 * @brief Fallback GSAD port.
 */
#define DEFAULT_GSAD_REDIRECT_PORT 80

/**
 * @brief Fallback Administrator port.
 */
#define DEFAULT_OPENVAS_ADMINISTRATOR_PORT 9393

/**
 * @brief Fallback Manager port.
 */
#define DEFAULT_OPENVAS_MANAGER_PORT 9390

/**
 * @brief HTTP basic authentication realm.
 */
#define REALM "\"Greenbone Security Assistant\""

/**
 * @brief Buffer size for POST processor.
 */
#define POST_BUFFER_SIZE 500000

/**
 * @brief Libgcrypt thread callback definition.
 */
GCRY_THREAD_OPTION_PTHREAD_IMPL;

/**
 * @brief Last resort HTML on failure to open "default_file".
 */
const char *FILE_NOT_FOUND =
  "<html><head><title>File not found</title></head><body>File not found</body></html>";

/**
 * @brief Error page HTML.
 */
const char *ERROR_PAGE = "<html><body>HTTP Method not supported</body></html>";

/**
 * @brief Server error HTML.
 */
char *SERVER_ERROR =
  "<html><body>An internal server error has occured.</body></html>";

/**
 * @brief The handle on the embedded HTTP daemon.
 */
struct MHD_Daemon *gsad_daemon;

/**
 * @brief Location for redirection server.
 */
gchar *redirect_location = NULL;

/** @todo Ensure the accesses to these are thread safe. */

/**
 * @brief Content-Type passed between callbacks when sending files.
 */
char *content_type = NULL;

/**
 * @brief Content-Disposition passed between callbacks when sending files.
 */
char *content_disposition = NULL;

/**
 * @brief Response size passed between callbacks when sending files.
 */
gsize response_size = 0;

/**
 * @brief Logging parameters, as passed to setup_log_handlers.
 */
GSList *log_config = NULL;

// @todo This is the definition for the entire program.
/**
 * @brief Verbose output flag.
 */
int verbose = 0;

/**
 * @brief Parameter validator.
 */
validator_t validator;

/**
 * @brief Initialise the parameter validator.
 */
void
init_validator ()
{
  validator = openvas_validator_new ();

  openvas_validator_add (validator,
                         "cmd",
                         "^(abort_task)"
                         "|(create_agent)"
                         "|(create_config)"
                         "|(create_escalator)"
                         "|(create_lsc_credential)"
                         "|(create_target)"
                         "|(create_task)"
                         "|(create_user)"
                         "|(delete_agent)"
                         "|(delete_config)"
                         "|(delete_escalator)"
                         "|(delete_lsc_credential)"
                         "|(delete_report)"
                         "|(delete_target)"
                         "|(delete_task)"
                         "|(delete_user)"
                         "|(edit_config)"
                         "|(edit_config_family)"
                         "|(edit_config_nvt)"
                         "|(edit_settings)"
                         "|(export_config)"
                         "|(get_agents)"
                         "|(get_config)"
                         "|(get_config_family)"
                         "|(get_config_nvt)"
                         "|(get_configs)"
                         "|(get_feed)"
                         "|(get_escalator)"
                         "|(get_escalators)"
                         "|(get_lsc_credential)"
                         "|(get_lsc_credentials)"
                         "|(get_nvt_details)"
                         "|(get_report)"
                         "|(get_settings)"
                         "|(get_status)"
                         "|(get_target)"
                         "|(get_system_reports)"
                         "|(get_targets)"
                         "|(get_users)"
                         "|(import_config)"
                         "|(test_escalator)"
                         "|(save_config)"
                         "|(save_config_family)"
                         "|(save_config_nvt)"
                         "|(save_settings)"
                         "|(start_task)"
                         "|(sync_feed)$");

  openvas_validator_add (validator, "agent_format", "^(installer)$");
  openvas_validator_add (validator, "boolean",    "^0|1$");
  openvas_validator_add (validator, "comment",    "^[-_[:alnum:], \\./]{0,400}$");
  openvas_validator_add (validator, "condition",  "^[[:alnum:] ]{0,100}$");
  openvas_validator_add (validator, "create_credentials_type", "^(gen|pass)$");
  openvas_validator_add (validator, "credential_login", "^[[:alnum:]\\\\]{1,40}$");
  openvas_validator_add (validator, "email",      "^[^@ ]{1,150}@[^@ ]{1,150}$");
  openvas_validator_add (validator, "family",     "^[-_[:alnum:] :]{1,200}$");
  openvas_validator_add (validator, "family_page", "^[_[:alnum:] :]{1,40}$");
  openvas_validator_add (validator, "first_result", "^[0-9]+$");
  openvas_validator_add (validator, "format",     "^(html)|(nbe)|(pdf)|(xml)$");
  openvas_validator_add (validator, "hosts",      "^[[:alnum:], \\./]{1,80}$");
  openvas_validator_add (validator, "hosts_allow", "^0|1|2$");
  openvas_validator_add (validator, "access_hosts", "^[[:alnum:], \\./]{0,80}$");
  openvas_validator_add (validator, "levels",       "^(h|m|l|g){0,4}$");
  openvas_validator_add (validator, "login",      "^[[:alnum:]]{1,10}$");
  /** @todo Because we fear injections, we're requiring weaker passwords! */
  openvas_validator_add (validator, "lsc_password", "^[-_[:alnum:], ;:\\./\\\\]{0,40}$");
  openvas_validator_add (validator, "max_result", "^[0-9]+$");
  openvas_validator_add (validator, "name",       "^[-_[:alnum:], \\./]{1,80}$");
  openvas_validator_add (validator, "number",     "^[0-9]+$");
  openvas_validator_add (validator, "oid",        "^[0-9.]{1,80}$");
  openvas_validator_add (validator, "page",       "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "package_format", "^(key)|(rpm)|(deb)|(exe)$");
  openvas_validator_add (validator, "password",   "^[[:alnum:], \\./]{0,40}$");
  /** @todo Better regex. */
  openvas_validator_add (validator, "preference_name", "^(.*){0,400}$");
  openvas_validator_add (validator, "pw",         "^[[:alnum:]]{1,10}$");
  openvas_validator_add (validator, "xml_file",   NULL);
  openvas_validator_add (validator, "report_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "role",       "^[[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "task_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "search_phrase", "^[-_[:alnum:], \\./]{0,400}$");
  openvas_validator_add (validator, "sort_field", "^[_[:alnum:] ]{1,20}$");
  openvas_validator_add (validator, "sort_order", "^(ascending)|(descending)$");
  openvas_validator_add (validator, "uuid",       "^[0-9abcdefABCDEF.]{1,40}$");


  openvas_validator_alias (validator, "base",         "name");
  openvas_validator_alias (validator, "duration",     "number");
  openvas_validator_alias (validator, "escalator",    "name");
  openvas_validator_alias (validator, "scanconfig",   "name");
  openvas_validator_alias (validator, "scantarget",   "name");
  openvas_validator_alias (validator, "refresh_interval", "number");
  openvas_validator_alias (validator, "event",        "condition");
  openvas_validator_alias (validator, "method",       "condition");
  openvas_validator_alias (validator, "level_high",   "boolean");
  openvas_validator_alias (validator, "level_medium", "boolean");
  openvas_validator_alias (validator, "level_low",    "boolean");
  openvas_validator_alias (validator, "level_log",    "boolean");
}

/**
 * @brief Get data for an escalator.
 *
 * @param[out]  data  Data.
 * @param[out]  name  Name of element.
 *
 * @return 0 on success, -1 on error.
 */
static gchar *
escalator_data (GArray *data, const char *name)
{
  int index = 0;
  gchar *element;

  if (data)
    while ((element = g_array_index (data, gchar*, index++)))
      if (strcmp (element, name) == 0)
        return element + strlen (element) + 1;

  return 0;
}

/**
 * @brief Connection information.
 *
 * These objects are used to hold connection information
 * during the multiple calls of the request handler that
 * refer to the same request.
 *
 * Once a request is finished, the object will be free'd.
 */
struct gsad_connection_info
{
  int connectiontype;                      ///< 1=POST, 2=GET.
  struct MHD_PostProcessor *postprocessor; ///< POST processor.
  char *response;                          ///< HTTP response text.
  int answercode;                          ///< HTTP response code.

  /**
   * @brief create_task / create_target / create_config POST request info
   * @todo This should eventually be a dynamic key-based structure.  (The
   *       names and number of request parameters are static, so a static
   *       structure is more appropriate. -- mamu)
   * @todo Combine POST and GET parameter handling.
   */
  struct req_parms
  {
    char *access_hosts;  ///< Value of "access_hosts" parameter.
    char *base;          ///< Value of "base" parameter.
    char *cmd;           ///< Value of "cmd" parameter.
    char *name;          ///< Value of "name" parameter.
    char *comment;       ///< Value of "comment" parameter.
    char *condition;     ///< Value of "condition" parameter.
    char *credential_login; ///< Value of "credential_login" parameter.
    char *escalator;     ///< Value of "escalator" parameter.
    char *event;         ///< Value of "event" parameter.
    char *family;        ///< Value of "family" parameter.
    char *method;        ///< Value of "event" parameter.
    char *scanconfig;    ///< Value of "scanconfig" parameter.
    char *scantarget;    ///< Value of "scantarget" parameter.
    char *sort_field;    ///< Value of "sort_field" parameter.
    char *sort_order;    ///< Value of "sort_order" parameter.
    char *levels;        ///< Value of "levels" parameter.
    char *xml_file;      ///< Value of "xml_file" parameter.
    char *role;          ///< Value of "role" parameter.
    char *submit;        ///< Value of "submit" parameter.
    char *hosts;         ///< Value of "hosts" parameter.
    char *hosts_allow;   ///< Value of "hosts_allow" parameter.
    char *login;         ///< Value of "login" parameter.
    char *oid;           ///< Value of "oid" parameter.
    char *pw;            ///< Value of "pw" parameter.
    char *password;      ///< Value of "password" parameter.
    char *timeout;       ///< Value of "timeout" parameter.
    char *installer;     ///< Value of "installer" parameter.
    int installer_size;  ///< Size of "installer" parameter.
    char *howto_install; ///< Value of "howto_install" parameter.
    int howto_install_size; ///< Size of "howto_install" parameter.
    char *howto_use;     ///< Value of "howto_use" parameter.
    int howto_use_size;  ///< Size of "howto_use" parameter.
    GArray *condition_data; ///< Collection of "condition_data:*" parameters.
    GArray *event_data;  ///< Collection of "event_data:*" parameters.
    GArray *method_data; ///< Collection of "method_data:*" parameters.
    GArray *passwords;   ///< Collection of "password:*" parameters.
    GArray *preferences; ///< Collection of "preference:*" parameters.
    GArray *nvts;        ///< Collection of "nvt:*" parameters.
    GArray *trends;      ///< Collection of "trend:*" parameters.
    GArray *selects;     ///< Collection of "select:*" parameters.
  } req_parms;
};

/**
 * @brief Parse name and password from Base64 HTTP Basic Auth string.
 *
 * @param[in]  connection  Connection.
 *
 * @return Credentials on success, else NULL.
 */
credentials_t *
get_header_credentials (struct MHD_Connection * connection)
{
  const char *header_auth;
  guchar *header_auth_decoded = NULL;
  const char *strbase = "Basic ";
  gsize header_auth_decoded_len;
  gchar **auth_split;

  header_auth = MHD_lookup_connection_value (connection,
                                             MHD_HEADER_KIND, "Authorization");
  if (header_auth == NULL)
    return NULL;

  if (strncmp (header_auth, strbase, strlen (strbase)) != 0)
    return NULL;

  header_auth_decoded = g_base64_decode (header_auth + strlen (strbase),
                                         &header_auth_decoded_len);
  /* g_base64_decode can return NULL (Glib 2.12.4-2), at least
   * when header_auth_decoded_len is zero. */
  if (header_auth_decoded == NULL)
    {
      header_auth_decoded = (guchar *) g_strdup ("");
      header_auth_decoded_len = 0;
    }

#if 0
  /* For debug purposes. */
  tracef ("Somebody is trying to authenticate with:"
          " %s, which is %s decoded\n",
          header_auth + strlen (strbase),
          header_auth_decoded);
#endif

  auth_split = g_strsplit ((gchar *) header_auth_decoded, ":", 0);
  g_free (header_auth_decoded);

  if (g_strv_length (auth_split) != 2)
    {
      g_warning ("%s: Could not get credentials from header! (Colons in credentials?)\n",
                 __FUNCTION__);
      g_strfreev (auth_split);
      return NULL;
    }
  else
    {
      credentials_t *creds = malloc (sizeof (credentials_t));
      if (creds == NULL) abort ();
      creds->username = strdup (auth_split[0]);
      creds->password = strdup (auth_split[1]);
      g_strfreev (auth_split);
      return creds;
    }
}

/**
 * @brief Checks whether an HTTP client is authenticated.
 *
 * @todo: Checks with the manager _every_ time, which makes it quite slow.
 *
 * @param[in]  connection  Connection.
 *
 * @return MHD_YES if authenticated, else MHD_NO.
 */
int
is_http_authenticated (struct MHD_Connection *connection)
{
  credentials_t *creds = get_header_credentials (connection);

  if (creds == NULL)
    return MHD_NO;

  if (is_omp_authenticated (creds->username, creds->password))
    return MHD_YES;

  return MHD_NO;
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
 * @brief Free resources.
 *
 * Used as free callback for HTTP daemon.
 *
 * @param[in]  cls         Dummy parameter.
 * @param[in]  connection  Connection.
 * @param[in]  con_cls     Connection information.
 * @param[in]  toe         Dummy parameter.
 */
void
free_resources (void *cls, struct MHD_Connection *connection,
                void **con_cls, enum MHD_RequestTerminationCode toe)
{
  struct gsad_connection_info *con_info =
    (struct gsad_connection_info *) *con_cls;

  if (NULL == con_info)
    {
      tracef ("con_info was NULL!\n");
      return;
    }

  tracef ("connectiontype=%d\n", con_info->connectiontype);

  if (con_info->connectiontype == 1)
    {
      if (NULL != con_info->postprocessor)
        {
          MHD_destroy_post_processor (con_info->postprocessor);
        }
    }
  free (con_info->req_parms.access_hosts);
  free (con_info->req_parms.base);
  free (con_info->req_parms.cmd);
  free (con_info->req_parms.name);
  free (con_info->req_parms.comment);
  free (con_info->req_parms.condition);
  free (con_info->req_parms.credential_login);
  free (con_info->req_parms.escalator);
  free (con_info->req_parms.event);
  free (con_info->req_parms.family);
  free (con_info->req_parms.method);
  free (con_info->req_parms.scanconfig);
  free (con_info->req_parms.scantarget);
  free (con_info->req_parms.xml_file);
  free (con_info->req_parms.role);
  free (con_info->req_parms.submit);
  free (con_info->req_parms.hosts);
  free (con_info->req_parms.hosts_allow);
  free (con_info->req_parms.login);
  free (con_info->req_parms.pw);
  free (con_info->req_parms.password);
  free (con_info->req_parms.oid);
  free (con_info->req_parms.sort_field);
  free (con_info->req_parms.sort_order);
  free (con_info->req_parms.timeout);
  free (con_info->req_parms.installer);
  free (con_info->req_parms.howto_install);
  free (con_info->req_parms.howto_use);
  if (con_info->req_parms.condition_data)
    {
      gchar *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.condition_data, gchar*, index++)))
        g_free (item);

      g_array_free (con_info->req_parms.condition_data, TRUE);
    }
  if (con_info->req_parms.event_data)
    {
      gchar *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.event_data, gchar*, index++)))
        g_free (item);

      g_array_free (con_info->req_parms.event_data, TRUE);
    }
  if (con_info->req_parms.method_data)
    {
      gchar *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.method_data, gchar*, index++)))
        g_free (item);

      g_array_free (con_info->req_parms.method_data, TRUE);
    }
  if (con_info->req_parms.preferences)
    {
      preference_t *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.preferences,
                                    preference_t*,
                                    index++)))
        {
          g_free (item->name);
          g_free (item->nvt);
          g_free (item->value);
          g_free (item);
        }

      g_array_free (con_info->req_parms.preferences, TRUE);
    }
  if (con_info->req_parms.passwords)
    {
      preference_t *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.passwords,
                                    preference_t*,
                                    index++)))
        {
          g_free (item->name);
          g_free (item->nvt);
          g_free (item->value);
          g_free (item);
        }

      g_array_free (con_info->req_parms.passwords, TRUE);
    }
  if (con_info->req_parms.nvts)
    {
      gchar *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.nvts, gchar*, index++)))
        g_free (item);

      g_array_free (con_info->req_parms.nvts, TRUE);
    }
  if (con_info->req_parms.selects)
    {
      gchar *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.selects,
                                    gchar*,
                                    index++)))
        g_free (item);

      g_array_free (con_info->req_parms.selects, TRUE);
    }
  if (con_info->req_parms.trends)
    {
      gchar *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.trends,
                                    gchar*,
                                    index++)))
        g_free (item);

      g_array_free (con_info->req_parms.trends, TRUE);
    }
  free (con_info);
  *con_cls = NULL;
}

/**
 * @brief Append a chunk to a binary parameter.
 *
 * @param[in]   chunk         Incoming chunk data.
 * @param[out]  chunk_size    Size of chunk.
 * @param[out]  chunk_offset  Offset into all data.
 * @param[out]  param         Parameter.
 * @param[out]  param_size    Parameter size.
 *
 * @return 0 on success, -1 on error.
 */
static int
append_chunk_binary (const char *chunk_data,
                     int chunk_size,
                     int chunk_offset,
                     char **param,
                     int *param_size)
{
  if (chunk_size)
    {
      if (chunk_offset == 0)
        {
          if (*param)
            return -1;
          *param = malloc (chunk_size);
          *param_size = chunk_size;
        }
      else
        {
          void *new_param;
          if (*param == NULL)
            return -1;
          new_param = realloc (*param, *param_size + chunk_size);
          if (new_param == NULL)
            return -1;
          *param = new_param;
          *param_size += chunk_size;
        }
      memcpy (*param + chunk_offset,
              chunk_data,
              chunk_size);
    }
  return 0;
}

/**
 * @brief Called once the post request handler has collected the multiple
 * @brief parts of a post request. Fills the req_params of an
 * @brief gsad_connection_info.
 *
 * Implements a MHD_PostDataIterator, returning MHD_NO if iteration should
 * stop, MHD_YES if further key/value pairs should be looked at.
 *
 * After serve_post, the connection info is free'd.
 *
 * @todo Parameter documentation from microhttpd's documentation.
 *
 * @param[in,out]  coninfo_cls  User-specified closure (here: gsad_connection_info).
 * @param[in]      kind  Type of the value
 * @param[in]      key   0-terminated key for the value
 * @param[in]      filename     Name of the uploaded file, NULL if not known.
 * @param[in]      contenttype  Mime-type of the data, NULL if not known.
 * @param[in]      transfer_encoding Encoding of the data, NULL if not known.
 * @param[in]      data  Pointer to size bytes of data at the specified offset.
 * @param[in]      off   Offset of data in the overall value.
 * @param[in]      size  Number of bytes in data available.
 *
 * @return MHD_YES to continue iterating over post data, MHD_NO to stop.
 */
int
serve_post (void *coninfo_cls, enum MHD_ValueKind kind, const char *key,
            const char *filename, const char *contenttype,
            const char *transfer_encoding, const char *data, uint64_t off,
            size_t size)
{
  struct gsad_connection_info *con_info =
    (struct gsad_connection_info *) coninfo_cls;
  gboolean abort_on_insane = FALSE;

  con_info->answercode = MHD_HTTP_INTERNAL_SERVER_ERROR;
  con_info->response   = SERVER_ERROR;

  if (NULL != key)
    {
      /**
       * @todo Accept only the parameters that the command uses.
       *
       * That way req_params can be reduced to something more manageable,
       * and any extra parameters would be caught as errors.
       *
       * A problem is that the command is determined by a parameter.
       * So how about we represent the command in the filename instead?
       *
       *     http://xxx/omp/get_targets?sort_field=name
       */

      /** @todo Why validate these here and in exec_omp_post? */

      if (!strcmp (key, "access_hosts"))
        {
          con_info->req_parms.access_hosts = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.access_hosts,
                  (char *) data,
                  size);
          con_info->req_parms.access_hosts[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "access_hosts",
                                   con_info->req_parms.access_hosts))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "base"))
        {
          con_info->req_parms.base = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.base, (char *) data, size);
          con_info->req_parms.base[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "base",
                                   con_info->req_parms.base))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "cmd"))
        {
          con_info->req_parms.cmd = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.cmd, (char *) data, size);
          con_info->req_parms.cmd[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator, "cmd", con_info->req_parms.cmd))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "condition"))
        {
          con_info->req_parms.condition = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.condition,
                  (char *) data,
                  size);
          con_info->req_parms.condition[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "condition",
                                   con_info->req_parms.condition))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "credential_login"))
        {
          con_info->req_parms.credential_login = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.credential_login,
                  (char *) data,
                  size);
          con_info->req_parms.credential_login[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "credential_login",
                                   con_info->req_parms.credential_login))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "escalator"))
        {
          con_info->req_parms.escalator = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.escalator, (char *) data, size);
          con_info->req_parms.escalator[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "escalator",
                                   con_info->req_parms.escalator))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "event"))
        {
          con_info->req_parms.event = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.event,
                  (char *) data,
                  size);
          con_info->req_parms.event[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "event",
                                   con_info->req_parms.event))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "method"))
        {
          con_info->req_parms.method = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.method,
                  (char *) data,
                  size);
          con_info->req_parms.method[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "method",
                                   con_info->req_parms.method))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "name"))
        {
          con_info->req_parms.name = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.name, (char *) data, size);
          con_info->req_parms.name[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator, "name", con_info->req_parms.name))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "login"))
        {
          con_info->req_parms.login = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.login, (char *) data, size);
          con_info->req_parms.login[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "login",
                                   con_info->req_parms.login))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "pw"))
        {
          con_info->req_parms.pw = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.pw, (char *) data, size);
          con_info->req_parms.pw[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator, "pw", con_info->req_parms.pw))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "family"))
        {
          con_info->req_parms.family = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.family, (char *) data, size);
          con_info->req_parms.family[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "family",
                                   con_info->req_parms.family))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "scanconfig"))
        {
          con_info->req_parms.scanconfig = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.scanconfig, (char *) data, size);
          con_info->req_parms.scanconfig[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "scanconfig",
                                   con_info->req_parms.scanconfig))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "scantarget"))
        {
          con_info->req_parms.scantarget = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.scantarget, (char *) data, size);
          con_info->req_parms.scantarget[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "scantarget",
                                   con_info->req_parms.scantarget))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "hosts"))
        {
          con_info->req_parms.hosts = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.hosts, (char *) data, size);
          con_info->req_parms.hosts[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "hosts",
                                   con_info->req_parms.hosts))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "hosts_allow"))
        {
          con_info->req_parms.hosts_allow = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.hosts_allow,
                  (char *) data,
                  size);
          con_info->req_parms.hosts_allow[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "hosts_allow",
                                   con_info->req_parms.hosts_allow))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "comment"))
        {
          con_info->req_parms.comment = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.comment, (char *) data, size);
          con_info->req_parms.comment[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "comment",
                                   con_info->req_parms.comment))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "xml_file"))
        {
          if (con_info->req_parms.xml_file)
            {
              int prevsize = strlen (con_info->req_parms.xml_file);
              con_info->req_parms.xml_file =
                realloc (con_info->req_parms.xml_file, prevsize + size + 1);
              memcpy (&con_info->req_parms.xml_file[prevsize], (char *) data,
                      size);
              con_info->req_parms.xml_file[size + prevsize] = 0;
              con_info->answercode = MHD_HTTP_OK;
              return MHD_YES;
            }
          else
            {
              con_info->req_parms.xml_file = malloc (size + 1);
              memcpy ((char *) con_info->req_parms.xml_file, (char *) data, size);
              con_info->req_parms.xml_file[size] = 0;
              con_info->answercode = MHD_HTTP_OK;
              return MHD_YES;
            }
        }
      if (!strcmp (key, "oid"))
        {
          con_info->req_parms.oid = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.oid, (char *) data, size);
          con_info->req_parms.oid[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "oid",
                                   con_info->req_parms.oid))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "password"))
        {
          con_info->req_parms.password = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.password, (char *) data, size);
          con_info->req_parms.password[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "password",
                                   con_info->req_parms.password))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "role"))
        {
          con_info->req_parms.role = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.role, (char *) data, size);
          con_info->req_parms.role[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator, "role", con_info->req_parms.role))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "submit"))
        {
          con_info->req_parms.submit = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.submit, (char *) data, size);
          con_info->req_parms.submit[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "page",
                                   con_info->req_parms.submit))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "timeout"))
        {
          con_info->req_parms.timeout = malloc (size + 1);
          memcpy ((char *) con_info->req_parms.timeout, (char *) data, size);
          con_info->req_parms.timeout[size] = 0;
          if (abort_on_insane
              && openvas_validate (validator,
                                   "boolean",
                                   con_info->req_parms.timeout))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "installer"))
        {
          if (append_chunk_binary (data,
                                   size,
                                   off,
                                   &con_info->req_parms.installer,
                                   &con_info->req_parms.installer_size))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "howto_install"))
        {
          if (append_chunk_binary (data,
                                   size,
                                   off,
                                   &con_info->req_parms.howto_install,
                                   &con_info->req_parms.howto_install_size))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "howto_use"))
        {
          if (append_chunk_binary (data,
                                   size,
                                   off,
                                   &con_info->req_parms.howto_use,
                                   &con_info->req_parms.howto_use_size))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strncmp (key, "condition_data:", strlen ("condition_data:")))
        {
          gchar *condition_data;

          condition_data = g_strdup_printf ("%s0%.*s",
                                            key + strlen ("condition_data:"),
                                            (int) size,
                                            data);
          condition_data[strlen (key + strlen ("condition_data:"))] = '\0';

          if (con_info->req_parms.condition_data == NULL)
            con_info->req_parms.condition_data
             = g_array_new (TRUE,
                            FALSE,
                            sizeof (gchar*));

          g_array_append_val (con_info->req_parms.condition_data, condition_data);

          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strncmp (key, "event_data:", strlen ("event_data:")))
        {
          gchar *event_data;

          event_data = g_strdup_printf ("%s0%.*s",
                                        key + strlen ("event_data:"),
                                        (int) size,
                                        data);
          event_data[strlen (key + strlen ("event_data:"))] = '\0';

          if (con_info->req_parms.event_data == NULL)
            con_info->req_parms.event_data
             = g_array_new (TRUE,
                            FALSE,
                            sizeof (gchar*));

          g_array_append_val (con_info->req_parms.event_data, event_data);

          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strncmp (key, "method_data:", strlen ("method_data:")))
        {
          gchar *method_data;

          method_data = g_strdup_printf ("%s0%.*s",
                                         key + strlen ("method_data:"),
                                         (int) size,
                                         data);
          method_data[strlen (key + strlen ("method_data:"))] = '\0';

          if (con_info->req_parms.method_data == NULL)
            con_info->req_parms.method_data
             = g_array_new (TRUE,
                            FALSE,
                            sizeof (gchar*));

          g_array_append_val (con_info->req_parms.method_data, method_data);

          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strncmp (key, "nvt:", strlen ("nvt:")))
        {
          gchar *nvt = g_strdup (key + strlen ("nvt:"));
          if (abort_on_insane
              && openvas_validate (validator,
                                   "uuid",
                                   nvt))
            {
              g_free (nvt);
              return MHD_NO;
            }

          if (con_info->req_parms.nvts == NULL)
            con_info->req_parms.nvts
             = g_array_new (TRUE,
                            FALSE,
                            sizeof (gchar*));

          g_array_append_val (con_info->req_parms.nvts, nvt);

          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strncmp (key, "preference:", strlen ("preference:")))
        {
          int uuid_start = -1, uuid_end = -1, count;
          count = sscanf (key,
                          "preference:%*[^[][%n%*[^]]%n]:%*s",
                          &uuid_start,
                          &uuid_end);
          if (count == 0 && uuid_start > 0 && uuid_end > 0)
            {
              preference_t preference;

              /* Just put the type in the nvt field for now, so that there
               * is something to free. */
              preference.nvt = g_strndup (key + uuid_start, uuid_end - uuid_start);
              if (abort_on_insane
                  && openvas_validate (validator, "uuid", preference.nvt))
                {
                  g_free (preference.nvt);
                  return MHD_NO;
                }

              preference.name = g_strdup (key + strlen ("preference:"));
              if (abort_on_insane
                  && openvas_validate (validator,
                                       "preference_name",
                                       preference.name))
                {
                  g_free (preference.nvt);
                  g_free (preference.name);
                  return MHD_NO;
                }

              preference.value = g_memdup (data, size);
              preference.value_size = size;

              if (con_info->req_parms.preferences == NULL)
                con_info->req_parms.preferences
                 = g_array_new (TRUE,
                                FALSE,
                                sizeof (preference_t*));

              {
                gconstpointer p = g_memdup (&preference, sizeof (preference));
                g_array_append_vals (con_info->req_parms.preferences,
                                     &p,
                                     1);
              }

              con_info->answercode = MHD_HTTP_OK;
              return MHD_YES;
            }
          return MHD_NO;
        }
      if (!strncmp (key, "password:", strlen ("password:")))
        {
          int uuid_start = -1, uuid_end = -1, count;
          count = sscanf (key,
                          "password:%*[^[][%n%*[^]]%n]:%*s",
                          &uuid_start,
                          &uuid_end);
          if (count == 0 && uuid_start > 0 && uuid_end > 0)
            {
              preference_t preference;

              /* Just put the type in the nvt field for now, so that there
               * is something to free. */
              preference.nvt = g_strndup (key + uuid_start, uuid_end - uuid_start);
              if (abort_on_insane
                  && openvas_validate (validator, "uuid", preference.nvt))
                {
                  g_free (preference.nvt);
                  return MHD_NO;
                }

              preference.name = g_strdup (key + strlen ("password:"));
              if (abort_on_insane
                  && openvas_validate (validator,
                                       "preference_name",
                                       preference.name))
                {
                  g_free (preference.nvt);
                  g_free (preference.name);
                  return MHD_NO;
                }

              preference.value = g_memdup (data, size);
              preference.value_size = size;

              if (con_info->req_parms.passwords == NULL)
                con_info->req_parms.passwords
                 = g_array_new (TRUE,
                                FALSE,
                                sizeof (preference_t*));

              {
                gconstpointer p = g_memdup (&preference, sizeof (preference));
                g_array_append_vals (con_info->req_parms.passwords,
                                     &p,
                                     1);
              }

              con_info->answercode = MHD_HTTP_OK;
              return MHD_YES;
            }
          return MHD_NO;
        }
      if (!strncmp (key, "select:", strlen ("select:")))
        {
          gchar *select = g_strdup (key + strlen ("select:"));
          if (abort_on_insane
              && openvas_validate (validator, "name", select))
            {
              g_free (select);
              return MHD_NO;
            }

          if (con_info->req_parms.selects == NULL)
            con_info->req_parms.selects
             = g_array_new (TRUE,
                            FALSE,
                            sizeof (gchar*));

          g_array_append_val (con_info->req_parms.selects, select);

          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strncmp (key, "trend:", strlen ("trend:"))
          && size > 0
          && data[0] == '1')
        {
          gchar *trend = g_strdup (key + strlen ("trend:"));
          if (abort_on_insane
              && openvas_validate (validator, "name", trend))
            {
              g_free (trend);
              return MHD_NO;
            }

          if (con_info->req_parms.trends == NULL)
            con_info->req_parms.trends
             = g_array_new (TRUE,
                            FALSE,
                            sizeof (gchar*));

          g_array_append_val (con_info->req_parms.trends, trend);

          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      con_info->answercode = MHD_HTTP_OK;
      return MHD_YES;
    }
  return MHD_NO;
}

/**
 * @brief Handle a complete POST request.
 *
 * Ensures there is a command, then depending on the command validates
 * parameters and calls the appropriate OAP or OMP function (like
 * create_task_omp).
 *
 * @param[in]  credentials  User credentials sent by client.
 * @param[in]  con_info     Connection info.
 *
 * @return MHD_YES.
 */
int
exec_omp_post (credentials_t * credentials,
               struct gsad_connection_info *con_info)
{
  if (!con_info->req_parms.cmd)
    {
      con_info->response = gsad_message ("Internal error",
                                         __FUNCTION__,
                                         __LINE__,
                                         "An internal error occured inside GSA daemon. "
                                         "Diagnostics: Empty command.",
                                         "/omp?cmd=get_status");
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_agent"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator, "comment", con_info->req_parms.comment))
        {
          free (con_info->req_parms.comment);
          con_info->req_parms.comment = NULL;
        }
      con_info->response =
        create_agent_omp (credentials,
                          con_info->req_parms.name,
                          con_info->req_parms.comment,
                          con_info->req_parms.installer,
                          con_info->req_parms.installer_size,
                          con_info->req_parms.howto_install,
                          con_info->req_parms.howto_install_size,
                          con_info->req_parms.howto_use,
                          con_info->req_parms.howto_use_size);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_escalator"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator, "comment", con_info->req_parms.comment))
        {
          free (con_info->req_parms.comment);
          con_info->req_parms.comment = NULL;
        }
      if (openvas_validate (validator,
                            "condition",
                            con_info->req_parms.condition))
        {
          free (con_info->req_parms.condition);
          con_info->req_parms.condition = NULL;
        }
      if (openvas_validate (validator, "event", con_info->req_parms.event))
        {
          free (con_info->req_parms.event);
          con_info->req_parms.event = NULL;
        }
      if (openvas_validate (validator, "method", con_info->req_parms.method))
        {
          free (con_info->req_parms.method);
          con_info->req_parms.method = NULL;
        }
      else if (strcasecmp (con_info->req_parms.method, "Email") == 0)
        {
          char *to_address;
          to_address = escalator_data (con_info->req_parms.method_data,
                                       "to_address");
          if (openvas_validate (validator, "email", to_address))
            {
              free (con_info->req_parms.method);
              con_info->req_parms.method = NULL;
            }
          else
            {
              gchar *from_address;
              from_address = escalator_data (con_info->req_parms.method_data,
                                             "from_address");
              if (openvas_validate (validator, "email", from_address))
                {
                  free (con_info->req_parms.method);
                  con_info->req_parms.method = NULL;
                }
            }
        }
      con_info->response =
        create_escalator_omp (credentials, con_info->req_parms.name,
                              con_info->req_parms.comment,
                              con_info->req_parms.condition,
                              con_info->req_parms.condition_data,
                              con_info->req_parms.event,
                              con_info->req_parms.event_data,
                              con_info->req_parms.method,
                              con_info->req_parms.method_data);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_lsc_credential"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator, "comment", con_info->req_parms.comment))
        {
          free (con_info->req_parms.comment);
          con_info->req_parms.comment = NULL;
        }
      if (openvas_validate (validator,
                            "credential_login",
                            con_info->req_parms.credential_login))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator,
                            "lsc_password",
                            con_info->req_parms.password))
        {
          free (con_info->req_parms.password);
          con_info->req_parms.password = NULL;
        }
      if (openvas_validate (validator,
                            "create_credentials_type",
                            con_info->req_parms.base))
        {
          free (con_info->req_parms.base);
          con_info->req_parms.base = NULL;
        }
      con_info->response =
        create_lsc_credential_omp (credentials,
                                   con_info->req_parms.name,
                                   con_info->req_parms.comment,
                                   con_info->req_parms.base,
                                   con_info->req_parms.credential_login,
                                   con_info->req_parms.password);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_task"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator,
                            "escalator",
                            con_info->req_parms.escalator))
        {
          free (con_info->req_parms.escalator);
          con_info->req_parms.escalator  = NULL;
        }
      if (openvas_validate (validator,
                            "scantarget",
                            con_info->req_parms.scantarget))
        {
          free (con_info->req_parms.scantarget);
          con_info->req_parms.scantarget  = NULL;
        }
      if (openvas_validate (validator,
                            "scanconfig",
                            con_info->req_parms.scanconfig))
        {
          free (con_info->req_parms.scanconfig);
          con_info->req_parms.scanconfig  = NULL;
        }
      if ((con_info->req_parms.name == NULL) ||
          (con_info->req_parms.scanconfig == NULL) ||
          (con_info->req_parms.scantarget == NULL))
        con_info->response = gsad_newtask (credentials, "Invalid parameter");
      else
        con_info->response =
          create_task_omp (credentials, con_info->req_parms.name, "comment",
                           con_info->req_parms.scantarget,
                           con_info->req_parms.scanconfig,
                           con_info->req_parms.escalator);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_user"))
    {
      if (openvas_validate (validator, "login", con_info->req_parms.login))
        {
          free (con_info->req_parms.login);
          con_info->req_parms.login = NULL;
        }
      if (openvas_validate (validator,
                            "password",
                            con_info->req_parms.password))
        {
          /** @todo Free con_info->req_parms.password? */
          con_info->req_parms.password = NULL;
        }
      if (openvas_validate (validator, "role", con_info->req_parms.role))
        {
          free (con_info->req_parms.role);
          con_info->req_parms.role = NULL;
        }
      if (openvas_validate (validator,
                            "access_hosts",
                            con_info->req_parms.access_hosts))
        {
          free (con_info->req_parms.access_hosts);
          con_info->req_parms.access_hosts = NULL;
        }
      if (openvas_validate (validator,
                            "hosts_allow",
                            con_info->req_parms.hosts_allow))
        {
          free (con_info->req_parms.hosts_allow);
          con_info->req_parms.hosts_allow = NULL;
        }
      con_info->response =
        create_user_oap (credentials,
                         con_info->req_parms.login,
                         con_info->req_parms.password,
                         con_info->req_parms.role,
                         con_info->req_parms.access_hosts,
                         con_info->req_parms.hosts_allow);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_target"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator,
                            "access_hosts",
                            con_info->req_parms.access_hosts))
        {
          free (con_info->req_parms.hosts);
          con_info->req_parms.hosts = NULL;
        }
      if (openvas_validate (validator, "comment", con_info->req_parms.comment))
        {
          free (con_info->req_parms.comment);
          con_info->req_parms.comment = NULL;
        }
      if (openvas_validate (validator, "name", con_info->req_parms.password))
        {
          free (con_info->req_parms.password);
          con_info->req_parms.password = NULL;
        }
      con_info->response =
        create_target_omp (credentials, con_info->req_parms.name,
                           con_info->req_parms.hosts,
                           con_info->req_parms.comment,
                           con_info->req_parms.password);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_config"))
    {
      if (openvas_validate (validator, "base", con_info->req_parms.base))
        {
          free (con_info->req_parms.base);
          con_info->req_parms.base  = NULL;
        }
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator, "comment", con_info->req_parms.comment))
        {
          free (con_info->req_parms.comment);
          con_info->req_parms.comment = NULL;
        }
      con_info->response =
        create_config_omp (credentials, con_info->req_parms.name,
                           con_info->req_parms.comment,
                           con_info->req_parms.base);
    }
  else if (!strcmp (con_info->req_parms.cmd, "get_status"))
    {
      con_info->response = get_status_omp (credentials,
                                           NULL,
                                           con_info->req_parms.sort_field,
                                           con_info->req_parms.sort_order,
                                           "");
    }
  else if (!strcmp (con_info->req_parms.cmd, "import_config"))
    {
      con_info->response =
        import_config_omp (credentials, con_info->req_parms.xml_file);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_config"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator, "family_page", con_info->req_parms.submit))
        {
          free (con_info->req_parms.submit);
          con_info->req_parms.submit = NULL;
        }
      con_info->response =
        save_config_omp (credentials,
                         con_info->req_parms.name,
                         con_info->req_parms.sort_field,
                         con_info->req_parms.sort_order,
                         con_info->req_parms.selects,
                         con_info->req_parms.trends,
                         con_info->req_parms.preferences,
                         con_info->req_parms.submit);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_config_family"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator, "family", con_info->req_parms.family))
        {
          free (con_info->req_parms.family);
          con_info->req_parms.family = NULL;
        }
      con_info->response =
        save_config_family_omp (credentials,
                                con_info->req_parms.name,
                                con_info->req_parms.family,
                                con_info->req_parms.sort_field,
                                con_info->req_parms.sort_order,
                                con_info->req_parms.nvts);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_config_nvt"))
    {
      if (openvas_validate (validator, "name", con_info->req_parms.name))
        {
          free (con_info->req_parms.name);
          con_info->req_parms.name = NULL;
        }
      if (openvas_validate (validator, "family", con_info->req_parms.family))
        {
          free (con_info->req_parms.family);
          con_info->req_parms.family = NULL;
        }
      if (openvas_validate (validator, "oid", con_info->req_parms.oid))
        {
          free (con_info->req_parms.oid);
          con_info->req_parms.oid = NULL;
        }
      con_info->response =
        save_config_nvt_omp (credentials,
                             con_info->req_parms.name,
                             con_info->req_parms.family,
                             con_info->req_parms.oid,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.preferences,
                             con_info->req_parms.passwords,
                             con_info->req_parms.timeout);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_settings"))
    {
      con_info->response =
        save_settings_oap (credentials,
                           con_info->req_parms.sort_field,
                           con_info->req_parms.sort_order,
                           con_info->req_parms.method_data);
    }
  else if (!strcmp (con_info->req_parms.cmd, "sync_feed"))
    {
      con_info->response = sync_feed_oap (credentials);
    }
  else
    {
      con_info->response = gsad_message ("Internal error",
                                         __FUNCTION__,
                                         __LINE__,
                                         "An internal error occured inside GSA daemon. "
                                         "Diagnostics: Unknown command.",
                                         "/omp?cmd=get_status");
    }

  con_info->answercode = MHD_HTTP_OK;
  return MHD_YES;
}

/**
 * @brief Handle a complete GET request.
 *
 * After some input checking, depending on the cmd parameter of the connection,
 * issue an omp command (via *_omp functions).
 *
 * @param[in]  connection  Connection.
 *
 * @return Newly allocated response string.
 */
char *
exec_omp_get (struct MHD_Connection *connection)
{
  char *cmd = NULL;
  const char *agent_format = NULL;
  const char *task_id      = NULL;
  const char *report_id    = NULL;
  const char *format       = NULL;
  const char *package_format = NULL;
  const char *name         = NULL;
  const char *family       = NULL;
  const char *first_result = NULL;
  const char *max_results  = NULL;
  const char *oid          = NULL;
  const char *sort_field   = NULL;
  const char *sort_order   = NULL;
  const char *levels       = NULL;
  const char *search_phrase = NULL;
  const char *refresh_interval = NULL;
  const char *duration     = NULL;
  int high = 0, medium = 0, low = 0, log = 0;
  credentials_t *credentials = NULL;

  const int CMD_MAX_SIZE = 22;
  const int VAL_MAX_SIZE = 100;

  credentials = get_header_credentials (connection);
  if (credentials == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: Missing credentials for OMP request.",
                         "/login.html");

  cmd =
    (char *) MHD_lookup_connection_value (connection, MHD_GET_ARGUMENT_KIND,
                                          "cmd");
  if (openvas_validate (validator, "cmd", cmd))
    cmd = NULL;

  if ((cmd != NULL) && (strlen (cmd) < CMD_MAX_SIZE))
    {
      /** @todo Why lookup all parameters when each handler only uses some? */

      tracef ("cmd: [%s]\n", cmd);
      task_id = MHD_lookup_connection_value (connection,
                                             MHD_GET_ARGUMENT_KIND,
                                             "task_id");
      if (openvas_validate (validator, "task_id", task_id))
        task_id = NULL;

      report_id = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "report_id");
      if (openvas_validate (validator, "report_id", report_id))
        report_id = NULL;

      oid = MHD_lookup_connection_value (connection,
                                         MHD_GET_ARGUMENT_KIND,
                                         "oid");
      if (openvas_validate (validator, "oid", oid))
        oid = NULL;

      agent_format = MHD_lookup_connection_value
                      (connection,
                       MHD_GET_ARGUMENT_KIND,
                       "agent_format");
      if (openvas_validate (validator, "agent_format", agent_format))
        agent_format = NULL;

      format = MHD_lookup_connection_value (connection,
                                            MHD_GET_ARGUMENT_KIND,
                                            "format");
      if (openvas_validate (validator, "format", format))
        format = NULL;

      package_format = MHD_lookup_connection_value
                        (connection,
                         MHD_GET_ARGUMENT_KIND,
                         "package_format");
      if (openvas_validate (validator, "package_format", package_format))
        package_format = NULL;

      name = MHD_lookup_connection_value (connection,
                                          MHD_GET_ARGUMENT_KIND,
                                          "name");
      if (openvas_validate (validator, "name", name))
        name = NULL;

      family = MHD_lookup_connection_value (connection,
                                            MHD_GET_ARGUMENT_KIND,
                                            "family");
      if (openvas_validate (validator, "family", name))
        family = NULL;

      first_result = MHD_lookup_connection_value (connection,
                                                  MHD_GET_ARGUMENT_KIND,
                                                  "first_result");
      if (openvas_validate (validator, "first_result", first_result))
        first_result = NULL;

      max_results = MHD_lookup_connection_value (connection,
                                                 MHD_GET_ARGUMENT_KIND,
                                                 "max_results");
      if (openvas_validate (validator, "max_results", max_results))
        max_results = NULL;

      sort_field = MHD_lookup_connection_value (connection,
                                                MHD_GET_ARGUMENT_KIND,
                                                "sort_field");
      if (openvas_validate (validator, "sort_field", sort_field))
        sort_field = NULL;

      refresh_interval = MHD_lookup_connection_value (connection,
                                                      MHD_GET_ARGUMENT_KIND,
                                                      "refresh_interval");
      if (openvas_validate (validator, "refresh_interval", refresh_interval))
        refresh_interval = NULL;

      duration = MHD_lookup_connection_value (connection,
                                              MHD_GET_ARGUMENT_KIND,
                                              "duration");
      if (openvas_validate (validator, "duration", duration))
        duration = NULL;

      sort_order = MHD_lookup_connection_value (connection,
                                                MHD_GET_ARGUMENT_KIND,
                                                "sort_order");
      if (openvas_validate (validator, "sort_order", sort_order))
        sort_order = NULL;

      levels = MHD_lookup_connection_value (connection,
                                            MHD_GET_ARGUMENT_KIND,
                                            "levels");
      if (levels)
        {
          /* "levels" overrides "level_*". */
          if (openvas_validate (validator, "levels", levels))
            levels = NULL;
        }
      else
        {
          const char *level;

          level = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "level_high");
          if (openvas_validate (validator, "level_high", level))
            high = 0;
          else
            high = atoi (level);

          level = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "level_medium");
          if (openvas_validate (validator, "level_medium", level))
            medium = 0;
          else
            medium = atoi (level);

          level = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "level_low");
          if (openvas_validate (validator, "level_low", level))
            low = 0;
          else
            low = atoi (level);

          level = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "level_log");
          if (openvas_validate (validator, "level_log", level))
            log = 0;
          else
            log = atoi (level);
        }

      search_phrase = MHD_lookup_connection_value (connection,
                                                   MHD_GET_ARGUMENT_KIND,
                                                   "search_phrase");
      if (search_phrase)
        {
          if (openvas_validate (validator, "search_phrase", search_phrase))
            search_phrase = NULL;
        }
      else
        search_phrase = "";
    }
  else
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: No valid command for omp.",
                         "/omp?cmd=get_status");

  /** @todo Pass sort_order and sort_field to all page handlers. */
  /** @todo Ensure that XSL passes on sort_order and sort_field. */

  /* Check cmd and precondition, start respective OMP command(s). */
  if ((!strcmp (cmd, "delete_task")) && (task_id != NULL)
      && (strlen (task_id) < VAL_MAX_SIZE))
    return delete_task_omp (credentials, task_id);

  else if ((!strcmp (cmd, "abort_task")) && (task_id != NULL)
           && (strlen (task_id) < VAL_MAX_SIZE))
    return abort_task_omp (credentials, task_id);

  else if ((!strcmp (cmd, "start_task")) && (task_id != NULL)
           && (strlen (task_id) < VAL_MAX_SIZE))
    return start_task_omp (credentials, task_id);

  else if ((!strcmp (cmd, "get_status")) && (task_id != NULL)
           && (strlen (task_id) < VAL_MAX_SIZE))
    return get_status_omp (credentials, task_id, sort_field, sort_order, refresh_interval);

  else if ((0 == strcmp (cmd, "delete_agent")) && (name != NULL))
    return delete_agent_omp (credentials, name);

  else if ((!strcmp (cmd, "delete_escalator")) && (name != NULL))
    return delete_escalator_omp (credentials, name);

  else if ((!strcmp (cmd, "delete_lsc_credential")) && (name != NULL))
    return delete_lsc_credential_omp (credentials, name);

  else if ((!strcmp (cmd, "delete_report")) && (report_id != NULL)
           && (strlen (report_id) < VAL_MAX_SIZE))
    return delete_report_omp (credentials, report_id, task_id);

  else if ((!strcmp (cmd, "delete_user")) && (name != NULL))
    return delete_user_oap (credentials, name);

  else if ((!strcmp (cmd, "delete_target")) && (name != NULL))
    return delete_target_omp (credentials, name);

  else if ((!strcmp (cmd, "delete_config")) && (name != NULL))
    return delete_config_omp (credentials, name);

  else if (!strcmp (cmd, "edit_config"))
    return get_config_omp (credentials, name, 1);

  else if (!strcmp (cmd, "edit_config_family"))
    return get_config_family_omp (credentials, name, family, sort_field,
                                  sort_order, 1);

  else if (!strcmp (cmd, "edit_config_nvt"))
    return get_config_nvt_omp (credentials, name, family, oid, sort_field,
                               sort_order, 1);

  else if (!strcmp (cmd, "edit_settings"))
    return edit_settings_oap (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "export_config")) && (name != NULL))
    return export_config_omp (credentials, name, &content_type,
                              &content_disposition, &response_size);

  else if (0 == strcmp (cmd, "get_agents")
           && ((name == NULL && agent_format == NULL)
               || (name && agent_format)))
    {
      if (name == NULL)
        return get_agents_omp (credentials,
                               name,
                               agent_format,
                               &response_size,
                               sort_field,
                               sort_order);

      /**
       * @todo Get sizes from constants that are also used by gsad_params.
       */
      content_type = calloc (25, sizeof (char));
      snprintf (content_type, 25, "application/octet-stream");
      content_disposition = calloc (250, sizeof (char));
      snprintf (content_disposition, 250, "attachment; filename=agent.bin");

      /** @todo On fail, HTML ends up in file. */
      return get_agents_omp (credentials,
                             name,
                             agent_format,
                             &response_size,
                             NULL,
                             NULL);
    }

  else if ((!strcmp (cmd, "get_escalator")) && (name != NULL))
    return get_escalator_omp (credentials, name, sort_field, sort_order);

  else if (!strcmp (cmd, "get_escalators"))
    return get_escalators_omp (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "get_lsc_credential")) && (name != NULL))
    return get_lsc_credential_omp (credentials, name, sort_field, sort_order);

  else if (!strcmp (cmd, "get_lsc_credentials")
           && ((name == NULL && package_format == NULL)
               || (name && package_format)))
    {
      if (name == NULL)
        return get_lsc_credentials_omp (credentials,
                                        name,
                                        package_format,
                                        &response_size,
                                        sort_field,
                                        sort_order);

      /**
       * @todo Get sizes from constants that are also used by gsad_params.
       */
      content_type = calloc (16, sizeof (char));
      snprintf (content_type, 16, "application/%s", package_format);
      content_disposition = calloc (250, sizeof (char));
      snprintf (content_disposition, 250,
                "attachment; filename=openvas-lsc-target-%s_0.5-1.%s",
                name,
                (strcmp (package_format, "key") == 0 ? "pub" : package_format));

      /** @todo On fail, HTML ends up in file. */
      return get_lsc_credentials_omp (credentials,
                                      name,
                                      package_format,
                                      &response_size,
                                      NULL,
                                      NULL);
    }

  else if ((!strcmp (cmd, "get_report")) && (report_id != NULL)
           && (strlen (report_id) < VAL_MAX_SIZE))
    {
      unsigned int first;
      unsigned int max;

      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;
      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = 1000;

      if (format != NULL)
        {
          /**
           * @todo Get sizes from constants that are also used by gsad_params.
           */
          /* @todo name is now 80 */
          content_type = calloc (16, sizeof (char));
          snprintf (content_type, 16, "application/%s", format);
          content_disposition = calloc (70, sizeof (char));
          snprintf (content_disposition, 70,
                    "attachment; filename=report-%s.%s", report_id, format);
        }

      if (levels)
        return get_report_omp (credentials, report_id, format, &response_size,
                               (const unsigned int) first,
                               (const unsigned int) max,
                               sort_field,
                               sort_order,
                               levels,
                               search_phrase);

      {
        char *ret;
        GString *string = g_string_new ("");
        if (high) g_string_append (string, "h");
        if (medium) g_string_append (string, "m");
        if (low) g_string_append (string, "l");
        if (log) g_string_append (string, "g");
        ret = get_report_omp (credentials, report_id, format, &response_size,
                              (const unsigned int) first,
                              (const unsigned int) max,
                              sort_field,
                              sort_order,
                              string->str,
                              search_phrase);
        g_string_free (string, TRUE);
        return ret;
      }
    }

  else if (!strcmp (cmd, "get_status"))
    return get_status_omp (credentials, NULL, sort_field, sort_order, refresh_interval);

  else if ((!strcmp (cmd, "get_system_reports")))
    return get_system_reports_omp (credentials, duration);

  else if ((!strcmp (cmd, "get_target")) && (name != NULL))
    return get_target_omp (credentials, name, sort_field, sort_order);

  else if (!strcmp (cmd, "get_targets"))
    return get_targets_omp (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_users"))
    return get_users_oap (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_feed"))
    return get_feed_oap (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_config"))
    return get_config_omp (credentials, name, 0);

  else if (!strcmp (cmd, "get_configs"))
    return get_configs_omp (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_config_family"))
    return get_config_family_omp (credentials, name, family, sort_field,
                                  sort_order, 0);

  else if (!strcmp (cmd, "get_config_nvt"))
    return get_config_nvt_omp (credentials, name, family, oid, sort_field,
                               sort_order, 0);

  else if ((!strcmp (cmd, "get_nvt_details")) && (oid != NULL))
    return get_nvt_details_omp (credentials, oid);

  else if (!strcmp (cmd, "get_settings"))
    return get_settings_oap (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "test_escalator")) && (name != NULL))
    return test_escalator_omp (credentials, name, sort_field, sort_order);

  else
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: Unknown command.",
                         "/omp?cmd=get_status");
}

/**
 * @brief Checks whether a file is a directory or not.
 *
 * @todo Handle symbolic links.
 *
 * @param[in]  name  Name of directory.
 *
 * @return 1 if parameter is directory, 0 if it is not, -1 if it does
 *         not exist or could not be accessed.
 */
int
check_is_dir (const char *name)
{
  struct stat sb;

  if (stat (name, &sb))
    {
      return -1;
    }
  else
    {
      return (S_ISDIR (sb.st_mode));
    }
}

/**
 * @brief Determines the size of a given file.
 *
 * @param[in]  filename  Path to file.
 *
 * @return Size of file \arg filename, or 0 if the file could not be opened.
 */
long
get_file_size (const char *filename)
{
  FILE *fp;
  fp = fopen (filename, "rb");
  if (fp)
    {
      long size;
      if ((0 != fseek (fp, 0, SEEK_END)) || (-1 == (size = ftell (fp))))
        size = 0;
      fclose (fp);

      return size;
    }
  else
    return 0;
}

/**
 * @brief Callback iterator for MHD_get_connection_values
 *
 * The current implementation is empty.
 *
 * @param[in]  cls    Not used for this callback.
 * @param[in]  kind   Not used for this callback.
 * @param[in]  key    Header key.
 * @param[in]  value  Header value.
 *
 * @return MHD_YES is always returned.
 */
int
print_header (void *cls, enum MHD_ValueKind kind, const char *key,
              const char *value)
{
  return MHD_YES;
}

/**
 * @brief Sends a HTTP response.
 *
 * @param[in]  connection   The connection handle.
 * @param[in]  page         The HTML page content.
 * @param[in]  status_code  The HTTP status code.
 *
 * @return The result of MHD_queue_response.
 */
int
send_response (struct MHD_Connection *connection, const char *page,
               int status_code)
{
  struct MHD_Response *response;
  int ret;

  response = MHD_create_response_from_data (strlen (page),
                                            (void *) page, MHD_NO, MHD_YES);
  ret = MHD_queue_response (connection, status_code, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Sends a HTTP redirection.
 *
 * @param[in]  connection  The connection handle.
 * @param[in]  location    The URL to redirect to.
 *
 * @return MHD_NO in case of a problem. Else MHD_YES.
 */
int
send_redirect_header (struct MHD_Connection *connection, const char *location)
{
  int ret;
  struct MHD_Response *response;

  response = MHD_create_response_from_data (0, NULL, MHD_NO, MHD_NO);

  if (!response)
    return MHD_NO;

  ret = MHD_add_response_header (response, "Location", location);
  if (!ret)
    {
      MHD_destroy_response (response);
      return MHD_NO;
    }

  ret = MHD_queue_response (connection, MHD_HTTP_SEE_OTHER, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Sends HTTP header requesting the browser to authenticate itself.
 *
 * @param[in]  connection  The connection object.
 * @param[in]  realm       Name of the realm that was authenticated for.
 *
 * @return MHD_NO in case of an error. Else the result of queueing
 *         the response.
 */
int
send_http_authenticate_header (struct MHD_Connection *connection,
                               const char *realm)
{
  int ret;
  gchar *headervalue;
  struct MHD_Response *response =
    MHD_create_response_from_data (0, NULL, MHD_NO, MHD_NO);

  if (!response)
    return MHD_NO;

  headervalue = g_strconcat ("Basic realm=", realm, NULL);
  if (!headervalue)
    {
      MHD_destroy_response (response);
      return MHD_NO;
    }

  ret = MHD_add_response_header (response, "WWW-Authenticate", headervalue);
  g_free (headervalue);
  if (!ret)
    {
      MHD_destroy_response (response);
      return MHD_NO;
    }

  ret = MHD_queue_response (connection, MHD_HTTP_UNAUTHORIZED, response);
  MHD_destroy_response (response);
  return ret;
}

#define MAX_HOST_LEN 1000

/**
 * @brief HTTP request handler for GSAD.
 *
 * This routine is the callback request handler for microhttpd.
 *
 * @param[in]  cls              Not used for this callback.
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
redirect_handler (void *cls, struct MHD_Connection *connection,
                  const char *url, const char *method,
                  const char *version, const char *upload_data,
                  size_t *upload_data_size, void **con_cls)
{
  gchar *location;
  const char *host;
  char name[MAX_HOST_LEN + 1];

  /* Never respond on first call of a GET. */
  if ((!strcmp (method, "GET")) && *con_cls == NULL)
    {
      struct gsad_connection_info *con_info;

      // @todo what frees this?
      con_info = calloc (1, sizeof (struct gsad_connection_info));
      if (NULL == con_info)
        return MHD_NO;

      con_info->connectiontype = 2;

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    return MHD_NO;

  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if (strcmp (method, "GET") && strcmp (method, "POST"))
    /** @todo return MHD_NO;? */
    send_response (connection, ERROR_PAGE, MHD_HTTP_METHOD_NOT_ACCEPTABLE);

  /* Redirect every URL to the default file on the HTTPS port. */
  host = MHD_lookup_connection_value (connection,
                                      MHD_HEADER_KIND,
                                      "Host");
  if (host == NULL)
    return MHD_NO;
  /* host.name:port */
  if (sscanf (host, "%" G_STRINGIFY(MAX_HOST_LEN) "[^:]:%*i", name) == 1)
    location = g_strdup_printf (redirect_location, name);
  else
    location = g_strdup_printf (redirect_location, host);
  if (send_redirect_header (connection, location) == MHD_NO)
    {
      g_free (location);
      return MHD_NO;
    }
  g_free (location);
  return MHD_YES;
}

#undef MAX_HOST_LEN

/**
 * @brief HTTPS request handler for GSAD.
 *
 * This routine is the secure callback request handler for microhttpd.
 *
 * @param[in]  cls              Not used for this callback.
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
request_handler (void *cls, struct MHD_Connection *connection,
                 const char *url, const char *method,
                 const char *version, const char *upload_data,
                 size_t * upload_data_size, void **con_cls)
{
  const char *url_base = "/";
  const char *omp_cgi_base = "/omp";
  const char *oap_cgi_base = "/oap";
  char *default_file = "/login/login.html";

  struct MHD_Response *response;
  int ret;
  FILE *file;
  char *path;
  char *res;
  credentials_t *credentials;

  /* Never respond on first call of a GET. */
  if ((!strcmp (method, "GET")) && *con_cls == NULL)
    {
      struct gsad_connection_info *con_info;

      // @todo what frees this?
      con_info = calloc (1, sizeof (struct gsad_connection_info));
      if (NULL == con_info)
        return MHD_NO;

      con_info->connectiontype = 2;

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    return MHD_NO;

  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if (strcmp (method, "GET") && strcmp (method, "POST"))
    /** @todo return MHD_NO;? */
    send_response (connection, ERROR_PAGE, MHD_HTTP_METHOD_NOT_ACCEPTABLE);

  /* Redirect any URL matching the base to the default file. */
  if (!strcmp (&url[0], url_base))
    {
      if (is_http_authenticated (connection))
        {
          return send_http_authenticate_header (connection, REALM);
        }
      else
        {
          send_redirect_header (connection, default_file);
          return MHD_YES;
        }
    }

  /* Treat logging out specially. */
  if ((!strcmp (method, "GET"))
      && (!strncmp (&url[0], "/logout", strlen ("/logout")))) /* flawfinder: ignore,
                                                                 it is a const str */
    {
      /**
       * @todo The problem is the URL is still "/logout" after the
       *       authentication, so this just keeps sending the auth header.
       *       All the user can do is cancel so the browser clears the
       *       credentials.  Perhaps the only way to do this is to keep
       *       state across requests. */
      if (is_http_authenticated (connection))
        {
          return send_http_authenticate_header (connection, REALM);
        }
      else
        {
          send_redirect_header (connection, default_file);
          return MHD_YES;
        }
    }

  if ((!strcmp (method, "GET"))
        && (! strncmp (&url[0], "/login/", strlen ("/login/"))) /* flawfinder: ignore,
                                                                    it is a const str */
        && ! url[strlen ("/login/")])
    {
      send_redirect_header (connection, default_file);
      return MHD_YES;
    }

  credentials = get_header_credentials (connection);

  /* Set HTTP Header values. */
  MHD_get_connection_values (connection, MHD_HEADER_KIND, print_header, NULL);

  if (!strcmp (method, "GET"))
    {
      /* This is a GET request. */

      /* Check for authentication. */
      if ((!is_http_authenticated (connection))
          && (strncmp (&url[0], "/login/", strlen ("/login/")))) /* flawfinder: ignore,
                                                                    it is a const str */
        return send_http_authenticate_header (connection, REALM);

      if (!strncmp (&url[0], omp_cgi_base, strlen (omp_cgi_base))
          || !strncmp (&url[0], oap_cgi_base, strlen (oap_cgi_base)))
        {
          /* URL requests to run OMP or OAP command. */

          unsigned int res_len = 0;
          res = exec_omp_get (connection);
          if (response_size > 0)
            {
              res_len = response_size;
              response_size = 0;
            }
          else
            {
              res_len = strlen (res);
            }

          response = MHD_create_response_from_data (res_len,
                                                    (void *) res,
                                                    MHD_NO, MHD_YES);
          free (res);

          if (content_type != NULL)
            {
              MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                       content_type);
              content_type = NULL;
            }
          if (content_disposition != NULL)
            {
              MHD_add_response_header (response, "Content-Disposition",
                                       content_disposition);
              content_disposition = NULL;
            }
          ret = MHD_queue_response (connection, MHD_HTTP_OK, response);
          MHD_destroy_response (response);
          return MHD_YES;
        }

      /* URL does not request OMP command but perhaps a special GSAD command? */
      if (!strncmp (&url[0], "/new_task.html",
                    strlen ("/new_task.html"))) /* flawfinder: ignore,
                                                   it is a const str */
        {
          res = gsad_newtask (credentials, NULL);
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          ret = MHD_queue_response (connection, MHD_HTTP_OK, response);
          MHD_destroy_response (response);
          return MHD_YES;
        }

      if (!strncmp (&url[0], "/system_report/",
                    strlen ("/system_report/"))) /* flawfinder: ignore,
                                                    it is a const str */
        {
          gsize res_len;
          const char *duration;

          duration = MHD_lookup_connection_value (connection,
                                                  MHD_GET_ARGUMENT_KIND,
                                                  "duration");
          if (openvas_validate (validator, "duration", duration))
            duration = NULL;

          res = get_system_report_omp (credentials,
                                       &url[0] + strlen ("/system_report/"),
                                       duration,
                                       &content_type,
                                       &content_disposition,
                                       &res_len);
          if (res == NULL) return MHD_NO;
          response = MHD_create_response_from_data ((unsigned int) res_len,
                                                    res, MHD_NO, MHD_YES);
          if (content_type != NULL)
            {
              MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                       content_type);
              content_type = NULL;
            }
          if (content_disposition != NULL)
            {
              MHD_add_response_header (response, "Content-Disposition",
                                       content_disposition);
              content_disposition = NULL;
            }
          ret = MHD_queue_response (connection, MHD_HTTP_OK, response);
          MHD_destroy_response (response);
          return MHD_YES;
        }

      /* URL requests neither an OMP command nor a special GSAD command,
       * so it is a simple file. */

      /* @todo: validation, URL length restriction */
      path = g_strconcat (GSA_STATE_DIR, url, NULL);
      file = fopen (path, "r"); /* flawfinder: ignore, this file is just
                                   read and sent */

      /* In case the file is not found, logout if logged in, else always
       * the default file. */
      if (file == NULL)
        {
          tracef ("File %s failed, ", path);
          g_free (path);

          if (is_http_authenticated (connection))
            {
              return send_http_authenticate_header (connection, REALM);
            }

          path = g_strconcat (GSA_STATE_DIR, default_file, NULL);
          tracef ("trying default file <%s>.\n", path);
          file = fopen (path, "r"); /* flawfinder: ignore, this file is just
                                       read and sent */
        }

      if (file == NULL)
        {
          /* Even the default file failed. */
          tracef ("Default file failed.\n");
          send_response (connection, FILE_NOT_FOUND, MHD_HTTP_NOT_FOUND);
          g_free (path);
        }
      else
        {
          struct stat buf;
          tracef ("Default file successful.\n");
          if (stat (path, &buf))
            {
              /* File information could not be retrieved. */
              g_critical ("%s: file <%s> can not be stat'ed.\n",
                          __FUNCTION__,
                          path);
              g_free (path);
              return MHD_NO;
            }

          response = MHD_create_response_from_callback (buf.st_size, 32 * 1024,
                                                        &file_reader,
                                                        file,
                                                        (MHD_ContentReaderFreeCallback)
                                                        & fclose);
          ret = MHD_queue_response (connection, MHD_HTTP_OK, response);

          MHD_destroy_response (response);
          g_free (path);
          return MHD_YES;
        }
    }

  if (!strcmp (method, "POST"))
    {
      if (NULL == *con_cls)
        {
          struct gsad_connection_info *con_info;

          /* Check for authentication. */
          if ((!is_http_authenticated (connection))
              && (strncmp (&url[0], "/login/", strlen ("/login/")))) /* flawfinder: ignore,
                                                                        it is a const str */
            return send_http_authenticate_header (connection, REALM);

          // @todo what frees this?
          con_info = calloc (1, sizeof (struct gsad_connection_info));
          if (NULL == con_info)
            return MHD_NO;

          con_info->postprocessor =
            MHD_create_post_processor (connection, POST_BUFFER_SIZE,
                                       serve_post, (void *) con_info);
          if (NULL == con_info->postprocessor)
            return MHD_NO;
          con_info->connectiontype = 1;
          con_info->answercode = MHD_HTTP_OK;

          *con_cls = (void *) con_info;
          return MHD_YES;
        }

      struct gsad_connection_info *con_info = *con_cls;
      if (0 != *upload_data_size)
        {
          MHD_post_process (con_info->postprocessor, upload_data,
                            *upload_data_size);
          *upload_data_size = 0;
          return MHD_YES;
        }
      exec_omp_post (credentials, con_info);
      send_response (connection, con_info->response, MHD_HTTP_OK);
      return MHD_YES;
    }
  return MHD_NO;
}

/**
 * @brief Initialization routine for GSAD.
 *
 * This routine checks for required files and initializes the gcrypt
 * library.
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
int
gsad_init (void)
{
  tracef ("Initializing the Greenbone Security Assistant...\n");

  /* Init Glib. */
  if (!g_thread_supported ()) g_thread_init (NULL);

  /* Check for required files. */
  if (check_is_dir (GSA_STATE_DIR) < 1)
    {
      g_critical ("%s: Could not access %s!\n", __FUNCTION__, GSA_STATE_DIR);
      return MHD_NO;
    }

  /* Init GCRYPT. */
  gcry_control (GCRYCTL_SET_THREAD_CBS, &gcry_threads_pthread);

  /* Version check should be the very first call because it makes sure that
   * important subsystems are intialized. */
  if (!gcry_check_version (GCRYPT_VERSION))
    {
      g_critical ("%s: libgcrypt version mismatch\n", __FUNCTION__);
      return MHD_NO;
    }

  /* We don't want to see any warnings, e.g. because we have not yet parsed
   * program options which might be used to suppress such warnings. */
  gcry_control (GCRYCTL_SUSPEND_SECMEM_WARN);

  /* ... If required, other initialization goes here.  Note that the process
   * might still be running with increased privileges and that the secure
   * memory has not been intialized. */

  /* Allocate a pool of 16k secure memory.  This make the secure memory
   * available and also drops privileges where needed. */
  gcry_control (GCRYCTL_INIT_SECMEM, 16384, 0);

  /* It is now okay to let Libgcrypt complain when there was/is a problem with
   * the secure memory. */
  gcry_control (GCRYCTL_RESUME_SECMEM_WARN);

  /* ... If required, other initialization goes here. */

  /* Tell Libgcrypt that initialization has completed. */
  gcry_control (GCRYCTL_INITIALIZATION_FINISHED, 0);

  /* Init GNUTLS. */
  int ret = gnutls_global_init ();
  if (ret < 0)
    {
      g_critical ("%s: Failed to initialize GNUTLS.\n", __FUNCTION__);
      return MHD_NO;
    }

  /* Init the validator. */
  init_validator ();

  tracef ("Initialization of GSA successful.\n");
  return MHD_YES;
}

/**
 * @brief Cleanup routine for GSAD.
 *
 * This routine will stop the http server, free log resources
 * and remove the pidfile.
 */
void
gsad_cleanup (void)
{
  MHD_stop_daemon (gsad_daemon);

  if (log_config) free_log_configuration (log_config);

  pidfile_remove("gsad");
}

/**
 * @brief Handle a SIGTERM signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_sigterm (int signal)
{
  exit (EXIT_SUCCESS);
}

/**
 * @brief Handle a SIGHUP signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_sighup (int signal)
{
  exit (EXIT_SUCCESS);
}

/**
 * @brief Handle a SIGINT signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_sigint (int signal)
{
  exit (EXIT_SUCCESS);
}

/**
 * @brief Main routine of Greenbone Security Assistant daemon.
 *
 * @param[in]  argc  Argument counter
 * @param[in]  argv  Argument vector
 *
 * @return EXIT_SUCCESS on success, else EXIT_FAILURE.
 */
int
main (int argc, char **argv)
{
  gchar *rc_name;
  int gsad_port = DEFAULT_GSAD_PORT;
  int gsad_redirect_port = DEFAULT_GSAD_REDIRECT_PORT;
  int gsad_administrator_port = DEFAULT_OPENVAS_ADMINISTRATOR_PORT;
  int gsad_manager_port = DEFAULT_OPENVAS_MANAGER_PORT;

  /* Initialise. */

  if (gsad_init () == MHD_NO)
    {
      g_critical ("%s: Initialization failed!\nExiting...\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Process command line options. */

  static gboolean foreground = FALSE;
  static gboolean print_version = FALSE;
  static gboolean redirect = FALSE;
  static gchar *gsad_port_string = NULL;
  static gchar *gsad_redirect_port_string = NULL;
  static gchar *gsad_administrator_port_string = NULL;
  static gchar *gsad_manager_port_string = NULL;
  static gchar *ssl_private_key_filename = OPENVAS_SERVER_KEY;
  static gchar *ssl_certificate_filename = OPENVAS_SERVER_CERTIFICATE;
  GError *error = NULL;
  GOptionContext *option_context;
  static GOptionEntry option_entries[] = {
    {"foreground", 'f',
     0, G_OPTION_ARG_NONE, &foreground,
     "Run in foreground.", NULL},
    {"port", 'p',
     0, G_OPTION_ARG_STRING, &gsad_port_string,
     "Use port number <number>.", "<number>"},
    {"aport", 'a',
     0, G_OPTION_ARG_STRING, &gsad_administrator_port_string,
     "Use administrator port number <number>.", "<number>"},
    {"mport", 'm',
     0, G_OPTION_ARG_STRING, &gsad_manager_port_string,
     "Use manager port number <number>.", "<number>"},
    {"rport", 'r',
     0, G_OPTION_ARG_STRING, &gsad_redirect_port_string,
     "Redirect HTTP from this port number <number>.", "<number>"},
    {"redirect", 'R',
     0, G_OPTION_ARG_NONE, &redirect,
     "Redirect HTTP to HTTPS.", NULL },
    {"verbose", 'v',
     0, G_OPTION_ARG_NONE, &verbose,
     "Print progress messages.", NULL },
    {"version", 'V',
     0, G_OPTION_ARG_NONE, &print_version,
     "Print version and exit.", NULL},
    {"ssl-private-key", 'k',
     0, G_OPTION_ARG_FILENAME, &ssl_private_key_filename,
     "Use <file> as the private key for HTTPS", "<file>"},
    {"ssl-certificate", 'c',
     0, G_OPTION_ARG_FILENAME, &ssl_certificate_filename,
     "Use <file> as the certificate for HTTPS", "<file>"},
    {NULL}
  };

  option_context =
    g_option_context_new ("- Greenbone Security Assistant Daemon");
  g_option_context_add_main_entries (option_context, option_entries, NULL);
  if (!g_option_context_parse (option_context, &argc, &argv, &error))
    {
      g_critical ("%s: %s\n\n", __FUNCTION__, error->message);
      exit (EXIT_FAILURE);
    }

  if (print_version)
    {
      printf ("gsad %s\n", GSAD_VERSION);
      printf ("Copyright (C) 2009 Greenbone Networks GmbH\n\n");
      exit (EXIT_SUCCESS);
    }

  /* Setup logging. */

  rc_name = g_build_filename (GSA_CONFIG_DIR, "gsad_log.conf", NULL);
  if (g_file_test (rc_name, G_FILE_TEST_EXISTS))
    log_config = load_log_configuration (rc_name);
  g_free (rc_name);
  setup_log_handlers (log_config);
  /* Set to ensure that recursion is left out, in case two threads log
   * concurrently. */
  g_log_set_always_fatal (G_LOG_FATAL_MASK);

  /* Finish processing the command line options. */

  if (gsad_port_string)
    {
      /* flawfinder: ignore, for atoi boundaries are checked properly */
      gsad_port = atoi (gsad_port_string);
      if (gsad_port <= 0 || gsad_port >= 65536)
        {
          g_critical ("%s: Port must be a number between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  if (gsad_manager_port_string)
    {
      /* flawfinder: ignore, for atoi boundaries are checked properly */
      gsad_manager_port = atoi (gsad_manager_port_string);
      if (gsad_manager_port <= 0 || gsad_manager_port >= 65536)
        {
          g_critical ("%s: Manager port must be a number between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  if (gsad_administrator_port_string)
    {
      /* flawfinder: ignore, for atoi boundaries are checked properly */
      gsad_administrator_port = atoi (gsad_administrator_port_string);
      if (gsad_administrator_port <= 0 || gsad_administrator_port >= 65536)
        {
          g_critical ("%s: Administrator port must be a number"
                      " between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  if (gsad_redirect_port_string)
    {
      /* flawfinder: ignore, for atoi boundaries are checked properly */
      gsad_redirect_port = atoi (gsad_redirect_port_string);
      if (gsad_redirect_port <= 0 || gsad_redirect_port >= 65536)
        {
          g_critical ("%s: Redirect port must be a number between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  if (foreground == FALSE)
    {
      /* Fork into the background. */
      tracef ("Forking...\n");
      pid_t pid = fork ();
      switch (pid)
        {
        case 0:
          /* Child. */
          break;
        case -1:
          /* Parent when error. */
          g_critical ("%s: Failed to fork!\n", __FUNCTION__);
          exit (EXIT_FAILURE);
          break;
        default:
          /* Parent. */
          exit (EXIT_SUCCESS);
          break;
        }
    }

  if (gsad_redirect_port_string)
    {
      /* Fork for the redirect server. */
      tracef ("Forking for redirect...\n");
      pid_t pid = fork ();
      switch (pid)
        {
        case 0:
          /* Child. */
          redirect = TRUE;
          redirect_location = g_strdup_printf ("https://%%s:%i/login/login.html",
                                               gsad_port);
          break;
        case -1:
          /* Parent when error. */
          g_critical ("%s: Failed to fork for redirect!\n", __FUNCTION__);
          exit (EXIT_FAILURE);
          break;
        default:
          /* Parent. */
          redirect = FALSE;
          break;
        }
    }

  /* Register the cleanup function. */

  if (atexit (&gsad_cleanup))
    {
      g_critical ("%s: Failed to register cleanup function!\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Register the signal handlers. */

  if (signal (SIGTERM, handle_sigterm) == SIG_ERR   /* RATS: ignore, only one function per signal */
      || signal (SIGINT, handle_sigint) == SIG_ERR  /* RATS: ignore, only one function per signal */
      || signal (SIGHUP, handle_sighup) == SIG_ERR) /* RATS: ignore, only one function per signal */
    {
      g_critical ("%s: Failed to register signal handlers!\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  if (redirect)
    {
      /* Start the HTTP to HTTPS redirect server. */

      gsad_daemon = MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION | MHD_USE_DEBUG,
                                      gsad_redirect_port, NULL, NULL, &redirect_handler,
                                      NULL, MHD_OPTION_NOTIFY_COMPLETED,
                                      free_resources, NULL, MHD_OPTION_END);

      if (gsad_daemon == NULL)
        {
          g_critical ("%s: MHD_start_daemon failed (redirector)!\n", __FUNCTION__);
          return EXIT_FAILURE;
        }
      else
        {
          /** @todo Add g_critical. */
          if (pidfile_create ("gsad")) exit (EXIT_FAILURE);

          tracef ("GSAD started successfully and is redirecting on port %d.\n",
                  gsad_redirect_port);
        }
    }
  else
    {
      int use_ssl = 1;
      gchar *ssl_private_key = NULL;
      gchar *ssl_certificate = NULL;

      /* Start the real, HTTPS server. */

      omp_init (gsad_manager_port);
      oap_init (gsad_administrator_port);

      if (use_ssl == 0)
        {
          gsad_daemon = MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION | MHD_USE_DEBUG,
                                          gsad_port, NULL, NULL, &request_handler,
                                          NULL, MHD_OPTION_NOTIFY_COMPLETED,
                                          free_resources, NULL, MHD_OPTION_END);
        }
      else
        {
          if (!g_file_get_contents (ssl_private_key_filename, &ssl_private_key,
                                    NULL, NULL))
            {
              g_critical ("%s: Could not load private SSL key from %s!\n",
                          __FUNCTION__,
                          ssl_private_key_filename);
              exit (EXIT_FAILURE);
            }

          if (!g_file_get_contents (ssl_certificate_filename, &ssl_certificate,
                                    NULL, NULL))
            {
              g_critical ("%s: Could not load SSL certificate from %s!\n",
                          __FUNCTION__,
                          ssl_certificate_filename);
              exit (EXIT_FAILURE);
            }

          gsad_daemon =
            MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION | MHD_USE_SSL | MHD_USE_DEBUG,
                              gsad_port, NULL, NULL, &request_handler, NULL,
                              MHD_OPTION_HTTPS_MEM_KEY, ssl_private_key,
                              MHD_OPTION_HTTPS_MEM_CERT, ssl_certificate,
                              MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL,
                              MHD_OPTION_END);
        }

      if (gsad_daemon == NULL)
        {
          g_critical ("%s: MHD_start_daemon failed!\n", __FUNCTION__);
          return EXIT_FAILURE;
        }
      else
        {
          /** @todo Add g_critical. */
          if (pidfile_create ("gsad")) exit (EXIT_FAILURE);

          tracef ("GSAD started successfully and is listening on port %d.\n",
                  gsad_port);
        }
    }

  /* Wait forever for input or interrupts. */

  while (1)
    {
      select (0, NULL, NULL, NULL, NULL);
    }
  return EXIT_SUCCESS;
}
