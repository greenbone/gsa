/* Greenbone Security Assistant
 * $Id$
 * Description: GMP communication module.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2009, 2014 Greenbone Networks GmbH
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
 * @file gsad_gmp.c
 * @brief GMP communication module of Greenbone Security Assistant daemon.
 *
 * This file implements an API for GMP.  The functions call the Greenbone
 * Vulnerability Manager via GMP properly.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <glib.h>
#include <netinet/in.h>
#include <netdb.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/time.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <fcntl.h>
#include <assert.h>
#include <time.h>
#include <sys/time.h>

#include <microhttpd.h>

#include "gsad_params.h"
#include "gsad_gmp.h"
#include "gsad_settings.h" /* for vendor_version_get */
#include "gsad_http.h" /* for gsad_message, logout_xml */
#include "gsad_base.h" /* for set_language_code */
#include "gsad_i18n.h"

#include <gvm/base/cvss.h>
#include <gvm/util/fileutils.h>
#include <gvm/util/serverutils.h> /* for gvm_connection_t */
#include <gvm/util/xmlutils.h> /* for xml_string_append, read_string_c, ... */
#include <gvm/gmp/gmp.h>

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad  gmp"

/**
 * @brief Manager (gvmd) address.
 */
#define OPENVASMD_ADDRESS "127.0.0.1"

/** @brief Answer for invalid input. */
#define GSAD_MESSAGE_INVALID                                                      \
  "<gsad_msg status_text=\"%s\" operation=\"%s\">"                                \
  "At least one entered value contains invalid characters or exceeds"             \
  " a size limit.  You may use the Back button of your browser to adjust"         \
  " the entered values.  If in doubt, the online help of the respective section"  \
  " will lead you to the appropriate help page."                                  \
  "</gsad_msg>"

/** @brief Answer for invalid input. */
#define GSAD_MESSAGE_INVALID_PARAM(op)                                            \
  "<gsad_msg status_text=\"Invalid parameter\" operation=\"" op "\">"             \
  "At least one entered value contains invalid characters or exceeds"             \
  " a size limit.  You may use the Back button of your browser to adjust"         \
  " the entered values.  If in doubt, the online help of the respective section"  \
  " will lead you to the appropriate help page."                                  \
  "</gsad_msg>"

/**
 * @brief HTTP status code for expected failure of gmp requests e.g. if some
 *        parameter was missing or invalid.
 */
#define GSAD_STATUS_INVALID_REQUEST MHD_HTTP_UNPROCESSABLE_ENTITY

/**
 * @brief Initial filtered results per page on the report summary.
 */
#define RESULTS_PER_PAGE 100

/**
 * @brief filt_id value to use term or built-in default filter.
 */
#define FILT_ID_NONE "0"

/**
 * @brief filt_id value to use the filter in the user setting if possible.
 */
#define FILT_ID_USER_SETTING "-2"

/**
 * @brief Whether to use TLS for Manager connections.
 */
int manager_use_tls = 0;

/**
 * @brief The address the manager is on.
 */
gchar *manager_address = NULL;

/**
 * @brief The port the manager is on.
 */
int manager_port = 9390;


/* Headers. */

static int
gmp (gvm_connection_t *, credentials_t *, gchar **, entity_t *,
     cmd_response_data_t*, const char *);

static int
gmpf (gvm_connection_t *, credentials_t *, gchar **, entity_t *,
      cmd_response_data_t*,
      const char *, ...);

static char *edit_role (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *edit_task (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_alert (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_alerts (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, cmd_response_data_t*);

static char *get_agent (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_agents (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, cmd_response_data_t*);

static char *get_asset (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_assets (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, cmd_response_data_t*);

static char *get_task (gvm_connection_t *, credentials_t *, params_t *,
                       const char *, cmd_response_data_t*);

static char *get_tasks (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_trash (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_config_family (gvm_connection_t *, credentials_t *,
                                params_t *, int, cmd_response_data_t*);

static char *get_config (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, int, cmd_response_data_t*);

static char *get_configs (gvm_connection_t *, credentials_t *, params_t *,
                          const char *, cmd_response_data_t*);

static char *get_filter (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, cmd_response_data_t*);

static char *get_filters (gvm_connection_t *, credentials_t *, params_t *,
                          const char *, cmd_response_data_t*);

static char *get_group (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_groups (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, cmd_response_data_t*);

static char *get_credential (gvm_connection_t *, credentials_t *,
                             params_t *, const char *, cmd_response_data_t*);

static char *get_credentials (gvm_connection_t *, credentials_t *,
                              params_t *, const char *, cmd_response_data_t*);

static char *get_notes (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_note (gvm_connection_t *, credentials_t *, params_t *,
                       const char *, cmd_response_data_t*);

static char *get_nvts (gvm_connection_t *, credentials_t *credentials,
                       params_t *, const char *, const char *,
                       cmd_response_data_t*);

static char *get_overrides (gvm_connection_t *, credentials_t *, params_t *,
                            const char *, cmd_response_data_t*);

static char *get_override (gvm_connection_t *, credentials_t *, params_t *,
                           const char *, cmd_response_data_t*);

static char *get_permission (gvm_connection_t *, credentials_t *,
                             params_t *, const char *, cmd_response_data_t*);

static char *get_permissions (gvm_connection_t *, credentials_t *,
                              params_t *, const char *, cmd_response_data_t*);

static char *get_port_list (gvm_connection_t *, credentials_t *, params_t *,
                            const char *, cmd_response_data_t*);

static char *get_port_lists (gvm_connection_t *, credentials_t *,
                             params_t *, const char *, cmd_response_data_t*);

static char *edit_port_list (gvm_connection_t *, credentials_t *,
                             params_t *, const char *, cmd_response_data_t*);

static char *get_tag (gvm_connection_t *, credentials_t *, params_t *,
                      const char *, cmd_response_data_t*);

static char *get_tags (gvm_connection_t *, credentials_t *, params_t *,
                       const char *, cmd_response_data_t*);

static char *get_target (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, cmd_response_data_t*);

static char *get_targets (gvm_connection_t *, credentials_t *, params_t *,
                          const char *, cmd_response_data_t*);

static char *get_report (gvm_connection_t *connection,
                         credentials_t * credentials,
                         params_t *params, const char *commands,
                         const char *extra_xml,
                         int *error, cmd_response_data_t* response_data);

static char *get_report_format (gvm_connection_t *, credentials_t *,
                                params_t *, const char *, cmd_response_data_t*);

static char *get_report_formats (gvm_connection_t *, credentials_t *,
                                 params_t *, const char *,
                                 cmd_response_data_t*);

static char *get_report_section (gvm_connection_t *, credentials_t *,
                                 params_t *, const char *,
                                 cmd_response_data_t*);

static char *get_reports (gvm_connection_t *, credentials_t *, params_t *,
                          const char *, cmd_response_data_t*);

static char *get_result_page (gvm_connection_t *, credentials_t *,
                              params_t *, const char *, cmd_response_data_t*);

static char *get_results (gvm_connection_t *, credentials_t *, params_t *,
                          const char *, cmd_response_data_t*);

static char *get_role (gvm_connection_t *, credentials_t *, params_t *,
                       const char *, cmd_response_data_t*);

static char *get_roles (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_scanner (gvm_connection_t *, credentials_t *, params_t *,
                          const char *, cmd_response_data_t*);

static char *get_scanners (gvm_connection_t *, credentials_t *, params_t *,
                           const char *, cmd_response_data_t*);

static char *get_schedule (gvm_connection_t *, credentials_t *, params_t *,
                           const char *, cmd_response_data_t*);

static char *get_schedules (gvm_connection_t *, credentials_t *, params_t *,
                            const char *, cmd_response_data_t*);

static char *get_user (gvm_connection_t *, credentials_t *, params_t *,
                       const char *, cmd_response_data_t*);

static char *get_users (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *get_vulns (gvm_connection_t *, credentials_t *, params_t *,
                        const char *, cmd_response_data_t*);

static char *wizard (gvm_connection_t *, credentials_t *, params_t *,
                     const char *, cmd_response_data_t*);

static char *wizard_get (gvm_connection_t *, credentials_t *, params_t *,
                         const char *, cmd_response_data_t*);

int token_user_remove (const char *);

static int gmp_success (entity_t entity);

static gchar *action_result_page (gvm_connection_t *, credentials_t *,
                                  params_t *, cmd_response_data_t *,
                                  const char*, const char*, const char*,
                                  const char*, const char*);

static gchar* response_from_entity (gvm_connection_t *, credentials_t*,
                                    params_t *, entity_t,  const char *,
                                    cmd_response_data_t *);

/* Helpers. */

/**
 * @brief Init the GSA GMP library.
 *
 * @param[in]  credentials   Credentials.
 * @param[in]  name          Command name.
 */
int
command_enabled (credentials_t *credentials, const gchar *name)
{
  /* TODO Hack.  Fails if command named in summary of another command. */
  return strstr (credentials->capabilities, name) ? 1 : 0;
}

/**
 * @brief Init the GSA GMP library.
 *
 * @param[in]  manager_address_unix  Manager address when using UNIX socket.
 * @param[in]  manager_address_tls   Manager address when using TLS-TCP.
 * @param[in]  port_manager          Manager port.
 */
void
gmp_init (const gchar *manager_address_unix, const gchar *manager_address_tls,
          int port_manager)
{
  if (manager_address_unix)
    {
      manager_address = g_strdup (manager_address_unix);
      manager_use_tls = 0;
    }
  else if (manager_address_tls)
    {
      manager_address = g_strdup (manager_address_tls);
      manager_use_tls = 1;
    }
  else
    {
      manager_address = g_build_filename (GVM_RUN_DIR,
                                          "gvmd.sock",
                                          NULL);
      manager_use_tls = 0;
    }
  manager_port = port_manager;
}


/**
 *  @brief Structure to search a key by value
 */
typedef struct
{
  gchar *value;
  GList *keys;
} find_by_value_t;

void
init_find_by_value (find_by_value_t *find, gchar *value)
{
  find->keys = NULL;
  find->value = value;
}

void
free_find_by_value (find_by_value_t *find)
{
  g_list_free (find->keys);
}

/**
 * @brief Traverse a g_tree until the first value is found
 *
 * @param[in]  key current key in the iteraton
 * @param[in]  value current value in the iteration
 * @param[out] data data->value contains the value to search for. data->keys will
 *                  contain all found keys for the passed value
 *
 * @return FALSE to iterrate over all items in the tree
 */
static gboolean
find_by_value (gchar *key, gchar *value,  find_by_value_t *data)
{
  if (strcmp (value, data->value) == 0)
    {
      g_debug ("%s found key %s for value %s\n",
               __FUNCTION__, key, value);
      data->keys = g_list_append (data->keys, key);
    }
  return FALSE;
}

/**
 * @brief Check whether a filter exists
 *
 * @param[in] connection  Connection to manager.
 * @param[in] entity      Response entity.
 *
 * @return 1 success, 0 fail, -1 error, -2 could not send command to server,
 *         -3 could not read entity from server.
 */
static int
filter_exists (gvm_connection_t *connection, const char *filt_id)
{
  entity_t entity;

  if (filt_id == NULL
      || strcmp (filt_id, "0")
      || strcmp (filt_id, "-2"))
    return 1;

  /* check if filter still exists */
  if (gvm_connection_sendf (connection, "<get_filters filter_id='%s'/>",
                            filt_id))
    {
      return -2;
    }

  if (read_entity_c (connection, &entity))
    {
      return -3;
    }

  return gmp_success (entity);
}

/**
 * @brief Wrap some XML in an envelope.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         HTTP request params
 * @param[in]  xml            XML string.  Freed before exit.
 * @param[out] response_data  Extra data return for the HTTP response or NULL.
 *
 * @return Enveloped GMP XML object.
 */
static char *
envelope_gmp (gvm_connection_t *connection,
              credentials_t * credentials, params_t *params, gchar * xml,
              cmd_response_data_t *response_data)
{
  time_t now;
  gchar *res, *name;
  GString *string;
  char ctime_now[200];
  params_iterator_t iter;
  param_t *param;
  struct timeval tv;

  assert (credentials);

  now = time (NULL);
  ctime_r_strip_newline (&now, ctime_now);

  string = g_string_new ("");

  gettimeofday (&tv, NULL);
  res = g_markup_printf_escaped ("<envelope>"
                                 "<version>%s</version>"
                                 "<vendor_version>%s</vendor_version>"
                                 "<token>%s</token>"
                                 "<caller>%s</caller>"
                                 "<current_page>%s</current_page>"
                                 "<time>%s</time>"
                                 "<timezone>%s</timezone>"
                                 "<login>%s</login>"
                                 "<role>%s</role>"
                                 "<severity>%s</severity>"
                                 "<i18n>%s</i18n>"
                                 "<guest>%d</guest>"
                                 "<client_address>%s</client_address>"
                                 "<backend_operation>%.2f</backend_operation>",
                                 GSAD_VERSION,
                                 vendor_version_get (),
                                 credentials->token,
                                 credentials->caller ? credentials->caller : "",
                                 credentials->current_page
                                   ? credentials->current_page
                                   : (credentials->caller
                                       ? credentials->caller
                                       : ""),
                                 ctime_now,
                                 credentials->timezone
                                   ? credentials->timezone : "",
                                 credentials->username,
                                 credentials->role,
                                 credentials->severity,
                                 credentials->language,
                                 credentials->guest,
                                 credentials->client_address,
                                 (double) ((tv.tv_sec
                                            - credentials->cmd_start.tv_sec)
                                           * 1000000L
                                           + tv.tv_usec
                                           - credentials->cmd_start.tv_usec)
                                 / 1000000.0);
  g_string_append (string, res);
  g_free (res);

  if (credentials->pw_warning)
    {
      gchar *warning_elem;
      warning_elem = g_markup_printf_escaped ("<password_warning>"
                                              "%s"
                                              "</password_warning>",
                                              credentials->pw_warning);
      g_string_append (string, warning_elem);
      g_free (warning_elem);
    }

  g_string_append (string, "<params>");
  params_iterator_init (&iter, params);
  while (params_iterator_next (&iter, &name, &param))
    {
      if (name && strcmp (name, ""))
        {
          if ((name[strlen (name) - 1] == ':') && param->values)
            {
              gchar *child_name;
              params_iterator_t children_iter;
              param_t *child_param;

              params_iterator_init (&children_iter, param->values);
              while (params_iterator_next (&children_iter, &child_name,
                                           &child_param))
                if (child_param->value
                    && child_param->valid
                    && child_param->valid_utf8)
                  xml_string_append (string,
                                     "<_param>"
                                     "<name>%s%s</name><value>%s</value>"
                                     "</_param>",
                                     name, child_name, child_param->value);
            }

          if (param->value && param->valid && param->valid_utf8
              && strcmp (name, "xml_file") && strcmp (name, "installer"))
            xml_string_append (string, "<%s>%s</%s>", name, param->value, name);
        }
      else
        g_warning ("%s: Param without name found", __FUNCTION__);
    }
  g_string_append (string, "</params>");

  g_string_append_printf (string,
                          "<capabilities>%s</capabilities>"
                          "%s"
                          "</envelope>",
                          credentials->capabilities,
                          xml);
  g_free (xml);

  cmd_response_data_set_content_type(response_data,
                                     GSAD_CONTENT_TYPE_APP_XML);
  return g_string_free (string, FALSE);
}

/**
 * @brief Look for a param with name equal to a given string.
 *
 * @param[in]  params  Params.
 * @param[in]  string  String.
 *
 * @return 1 if param with name \arg string exists in \arg params, else 0.
 */
static int
member (params_t *params, const char *string)
{
  params_iterator_t iter;
  param_t *param;
  char *name;

  params_iterator_init (&iter, params);
  while (params_iterator_next (&iter, &name, &param))
    if (strcmp (name, string) == 0) return 1;
  return 0;
}

/**
 * @brief Look for param with value 1 and name equal to given string.
 *
 * @param[in]  params  Params.
 * @param[in]  string  String.
 *
 * @return 1 if param with name \arg string exists in \arg params, else 0.
 */
int
member1 (params_t *params, const char *string)
{
  params_iterator_t iter;
  param_t *param;
  char *name;

  params_iterator_init (&iter, params);
  while (params_iterator_next (&iter, &name, &param))
    if (param->value_size
        && param->value[0] == '1'
        && strcmp (name, string) == 0)
      return 1;
  return 0;
}

/**
 * @brief Check a modify_config response.
 *
 * @param[in]  connection   Connection with manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       HTTP request parameters.
 * @param[in]  next         Next page command on success.
 * @param[in]  fail_next    Next page command on failure.
 * @param[out] success      Whether the command returned a success response.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Error message on failure, NULL on success.
 */
static char *
check_modify_config (gvm_connection_t *connection,
                     credentials_t *credentials, params_t *params,
                     const char* next, const char* fail_next, int* success,
                     cmd_response_data_t *response_data)
{
  entity_t entity;
  gchar *response;
  const char  *status_text;

  if (success)
    *success = 0;

  /** @todo This would be much easier with real error codes. */

  /* Read the response. */

  if (read_entity_c (connection, &entity))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to read command to manager daemon.",
                           response_data);
    }

  /* Check the response. */

  status_text = entity_attribute (entity, "status_text");
  if (status_text == NULL)
    {
      free_entity (entity);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to parse status_text from response.",
                           response_data);
    }

  if (strcmp (status_text, "Config is in use") == 0)
    {
      const char* message = "The config is now in use by a task,"
                            " so only name and comment can be modified.";

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      response
        = action_result_page (connection, credentials, params, response_data,
                              "Save Config",
                              entity_attribute (entity, "status"),
                              message, NULL, NULL);

      free_entity (entity);
      return response;
    }
  else if (strcmp (status_text, "MODIFY_CONFIG name must be unique") == 0)
    {
      const char* message = "A config with the given name exists already.";

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      response
        = action_result_page (connection, credentials, params, response_data, "Save Config",
                              entity_attribute (entity, "status"),
                              message, NULL, NULL);

      free_entity (entity);
      return response;
    }
  else if (success && gmp_success (entity))
    {
      *success = 1;
    }

  response
    = response_from_entity (connection, credentials, params, entity,
                            "Save Config", response_data);
  free_entity (entity);

  return response;
}

/**
 * @brief Check whether an GMP command failed.
 *
 * @param[in] entity  Response entity.
 *
 * @return 1 success, 0 fail, -1 error.
 */
static int
gmp_success (entity_t entity)
{
  const char *status;

  if (entity == NULL)
    return 0;

  status = entity_attribute (entity, "status");
  if ((status == NULL)
      || (strlen (status) == 0))
    return -1;

  return status[0] == '2';
}

/**
 * @brief Set the HTTP status according to GMP response entity.
 *
 * @param[in]  entity         The GMP response entity.
 * @param[in]  response_data  Response data.
 */
void
set_http_status_from_entity (entity_t entity,
                             cmd_response_data_t *response_data)
{
  if (entity == NULL)
    cmd_response_data_set_status_code (response_data,
                                       MHD_HTTP_INTERNAL_SERVER_ERROR);
  else if (strcmp (entity_attribute (entity, "status_text"),
              "Permission denied")
           == 0)
    cmd_response_data_set_status_code (response_data,
                                       MHD_HTTP_FORBIDDEN);
  else if (strcmp (entity_attribute (entity, "status"), "404") == 0)
    cmd_response_data_set_status_code (response_data,
                                       MHD_HTTP_NOT_FOUND);
  else
    cmd_response_data_set_status_code (response_data,
                                       MHD_HTTP_BAD_REQUEST);
}

/**
 * @brief Run a single GMP command.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[out] response       Response.
 * @param[out] entity_return  Response entity.
 * @param[out] response_data  Extra data return for the HTTP response.
 * @param[in]  command        Command.
 *
 * @return 0 success, -1 failed to connect (response set), 1 send error, 2 read
 *         error.
 */
static int
gmp (gvm_connection_t *connection, credentials_t *credentials,
     gchar **response, entity_t *entity_return,
     cmd_response_data_t *response_data, const char *command)
{
  int ret;
  entity_t entity;

  if (entity_return)
    *entity_return = NULL;

  ret = gvm_connection_sendf (connection, "%s", command);
  if (ret == -1)
    {
      return 1;
    }

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, response))
    {
      return 2;
    }
  if (entity_return)
    *entity_return = entity;
  else
    free_entity (entity);
  return 0;
}

/**
 * @brief Run a single GMP command, preparing a response even on error.
 *
 * @param[in]  connection         Connection to manager
 * @param[out] message_operation  Operation for error message
 * @param[in]  credentials        Username and password for authentication.
 * @param[out] response           Response.
 * @param[out] response_data      Extra data return for the HTTP response.
 * @param[in]  format             Command.
 * @param[in]  ...                Arguments for format string.
 *
 * @return 0 success, -1 internal error, 1 send error, 2 read error,
 *         3 command failed, 4 connect error.
 */
static int
simple_gmpf (gvm_connection_t *connection, const gchar *message_operation,
             credentials_t *credentials, gchar **response,
             cmd_response_data_t *response_data,
             const char *format, ...)
{
  int ret;
  gchar *command;
  va_list args;
  entity_t entity;

  va_start (args, format);
  command = g_markup_vprintf_escaped (format, args);
  va_end (args);

  ret = gmp (connection, credentials, response, &entity, response_data,
             command);
  g_free (command);
  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return 4;
      case 1:
        if (response_data)
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
        if (response)
          {
            gchar *message;
            message = g_strdup_printf
                       ("An internal error occurred while %s. "
                        " The operation was not started."
                        " Diagnostics: Failure to send command to manager"
                        " daemon.",
                        message_operation
                         ? message_operation
                         : "performing an operation");
            *response = gsad_message (credentials, "Internal error",
                                      __FUNCTION__, __LINE__,
                                      message, response_data);
            g_free (message);
          }
        return 1;
      case 2:
        if (response_data)
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
        if (response)
          {
            gchar *message;
            message = g_strdup_printf
                       ("An internal error occurred while %s."
                        " It is unclear whether the operation succeeded."
                        " Diagnostics: Failure to receive response from manager"
                        " daemon.",
                        message_operation
                         ? message_operation
                         : "performing an operation");
            *response = gsad_message (credentials, "Internal error",
                                      __FUNCTION__, __LINE__,
                                      message, response_data);
            g_free (message);
          }
        return 2;
      default:
        if (response_data)
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
        if (response)
          {
            gchar *message;
            message = g_strdup_printf
                       ("An internal error occurred while %s."
                        " It is unclear whether the operation succeeded."
                        " Diagnostics: Internal Error.",
                        message_operation
                         ? message_operation
                         : "performing an operation");
            *response = gsad_message (credentials, "Internal error",
                                      __FUNCTION__, __LINE__,
                                      message, response_data);
            g_free (message);
          }
        return -1;
    }

  switch (gmp_success (entity))
    {
      case 0:
        set_http_status_from_entity (entity, response_data);
        ret = 3;
        break;
      case 1:
        ret = 0;
        break;
      default:
        ret = -1;
        break;
    }
  free_entity (entity);
  return ret;
}

/**
 * @brief Run a single formatted GMP command.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[out] response       Response.
 * @param[out] entity_return  Response entity.
 * @param[out] response_data  Extra data return for the HTTP response.
 * @param[in]  format         Command.
 * @param[in]  ...            Arguments for format string.
 *
 * @return 0 success, -1 failed to connect (response set), 1 send error,
 *         2 read error.
 */
static int
gmpf (gvm_connection_t *connection, credentials_t *credentials,
      gchar **response, entity_t *entity_return,
      cmd_response_data_t *response_data, const char *format, ...)
{
  int ret;
  gchar *command;
  va_list args;

  va_start (args, format);
  command = g_markup_vprintf_escaped (format, args);
  va_end (args);

  ret = gmp (connection, credentials, response, entity_return, response_data,
             command);
  g_free (command);
  return ret;
}

/**
 * @brief Get a setting by UUID for the current user of an GMP connection.
 *
 * @param[in]  connection  Connection.
 * @param[in]  setting_id  UUID of the setting to get.
 * @param[out] value       Value of the setting.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return     -1 internal error, 0 success, 1 send error, 2 read error.
 */
static int
setting_get_value (gvm_connection_t *connection, const char *setting_id,
                   gchar **value, cmd_response_data_t *response_data)
{
  int ret;
  entity_t entity;
  const char *status;
  gchar *response;

  *value = NULL;

  ret = gvm_connection_sendf (connection,
                              "<get_settings setting_id=\"%s\"/>",
                              setting_id);
  if (ret)
    return 1;

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    return 2;

  status = entity_attribute (entity, "status");
  if (status == NULL
      || strlen (status) == 0)
    {
      g_free (response);
      free_entity (entity);
      return -1;
    }

  if (status[0] == '2')
    {
      entity_t setting;
      setting = entity_child (entity, "setting");
      if (setting == NULL)
        {
          free_entity (entity);
          g_free (response);
          return 0;
        }
      setting = entity_child (setting, "value");
      if (setting == NULL)
        {
          free_entity (entity);
          g_free (response);
          return -1;
        }
      *value = g_strdup (entity_text (setting));
      g_free (response);
      free_entity (entity);
    }
  else
    {
      if (response_data)
        set_http_status_from_entity (entity, response_data);
      free_entity (entity);
      g_free (response);
      return -1;
    }

  return 0;
}

/**
 * @brief Check a param using the direct response method.
 *
 * @param[in]  name      Param name.
 * @param[in]  op_name   Operation name.
 */
#define CHECK_PARAM_INVALID(name, op_name)                                     \
  if (name == NULL)                                                            \
    {                                                                          \
      return message_invalid (connection, credentials, params, response_data,  \
                              "Given " G_STRINGIFY (name) " was invalid",      \
                              G_STRINGIFY (MHD_HTTP_BAD_REQUEST),              \
                              op_name);                                        \
    }

/**
 * @brief Get an URL for the current page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  cmd          Command for URL.
 *
 * @return URL.
 */
static char *
page_url (credentials_t *credentials, const gchar *cmd)
{
  GString *url;

  assert (cmd);

  url = g_string_new ("");

  if (credentials->caller && strlen (credentials->caller))
    {
      gchar **split_question, *page, *params;

      split_question = g_strsplit (credentials->caller, "?", 2);

      page = *split_question;

      if (page)
        {
          g_string_append_printf (url, "%s?cmd=%s", page, cmd);
          params = split_question[1];
        }
      else
        {
          g_string_append_printf (url, "cmd=%s", cmd);
          params = credentials->caller;
        }
      if (params)
        {
          gchar **split_amp, **point;

          point = split_amp = g_strsplit (params, "&", 0);
          while (*point)
            {
              gchar *param;

              param = *point;

              g_strstrip (param);

              if (strstr (param, "cmd=") == param)
                {
                  point++;
                  continue;
                }

              g_string_append_printf (url, "&%s", param);

              point++;
            }
          g_strfreev (split_amp);
        }
      g_strfreev (split_question);
    }
  else
    g_string_append_printf (url, "?cmd=%s", cmd);

  return g_string_free (url, FALSE);
}

/**
 * @brief Capitalize a type or command name and replace underscores.
 *
 * @param[in]  input  The input string.
 *
 * @return The newly allocated capitalized type or command name.
 */
static gchar*
capitalize (const char* input)
{
  gchar *output;
  if (input == NULL)
    return NULL;
  else
    {
      int first_letter = 1;
      int pos = 0;
      output = g_strdup (input);

      while (output[pos])
        {
          if (g_ascii_isalpha (output[pos]) && first_letter)
            {
              output[pos] = g_ascii_toupper (output[pos]);
              first_letter = 0;
            }
          else if (output[pos] == '_')
            {
              output[pos] = ' ';
              first_letter = 1;
            }
          pos++;
        }
      return output;
    }
}


/* Generic page handlers. */

/**
 * @brief Generate a enveloped GMP XML containing a result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params       HTTP request params
 * @param[out] response_data  Extra data return for the HTTP response.
 * @param[in]  action         Name of the action.
 * @param[in]  status         Status code.
 * @param[in]  message        Status message.
 * @param[in]  details        Status details.
 * @param[in]  unused         Not used anymore.
 *
 * @return Enveloped XML object.
 */
static gchar *
action_result_page (gvm_connection_t *connection,
                    credentials_t *credentials, params_t *params,
                    cmd_response_data_t *response_data,
                    const char* action, const char* status,
                    const char* message, const char* details,
                    const char* unused)
{
  gchar *xml;
  xml = g_markup_printf_escaped ("<action_result>"
                                 "<action>%s</action>"
                                 "<status>%s</status>"
                                 "<message>%s</message>"
                                 "<details>%s</details>"
                                 "</action_result>",
                                 action ? action : "",
                                 status ? status : "",
                                 message ? message : "",
                                 details ? details : "");
  return envelope_gmp (connection, credentials, params, xml,
                       response_data);
}

/**
 * @brief Generate a enveloped GMP XML containing an action result.
 *
 * Should replace action_result_page function completely in future
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         HTTP request params
 * @param[out] response_data  Extra data return for the HTTP response.
 * @param[in]  action         Name of the action.
 * @param[in]  status         Status code.
 * @param[in]  message        Status message.
 * @param[in]  details        Status details (optional).
 * @param[in]  id             ID of the handled entity (optional).
 *
 * @return Enveloped XML object.
 */
static gchar *
action_result (gvm_connection_t *connection,
               credentials_t *credentials,
               params_t *params,
               cmd_response_data_t *response_data,
               const char *action,
               const char *status,
               const char *message,
               const char *details,
               const char *id)
{

  GString *xml;

  xml = g_string_new ("");
  xml_string_append(xml,
                    "<action_result>"
                    "<action>%s</action>"
                    "<status>%s</status>"
                    "<message>%s</message>",
                    action ? action : "",
                    status ? status : "",
                    message ? message : "");

  if (details)
    xml_string_append(xml, "<details>%s</details>", details);

  if (id)
    xml_string_append(xml, "<id>%s</id>", id);

  g_string_append (xml, "</action_result>");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Check a param using the direct response method.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  response_data  Response data.
 * @param[in]  message        Message.
 * @param[in]  status         Status code.
 * @param[in]  op_name        Operation name.
 *
 * @return Enveloped XML object.
 */
gchar *
message_invalid (gvm_connection_t *connection,
                 credentials_t *credentials, params_t *params,
                 cmd_response_data_t *response_data, const char *message,
                 const char *status, const char *op_name)
{
  gchar *ret;
  ret = action_result_page (connection, credentials, params, response_data,
                            op_name, G_STRINGIFY (MHD_HTTP_BAD_REQUEST),
                            message, NULL, NULL);

  cmd_response_data_set_status_code (response_data,
                                     MHD_HTTP_BAD_REQUEST);
  return ret;
}

/**
 * @brief Set redirect or return a basic action_result page based on entity.
 *
 * @param[in]  connection     Connection to manager
 */
static gchar *
response_from_entity (gvm_connection_t *connection,
                      credentials_t *credentials, params_t *params,
                      entity_t entity, const char *action,
                      cmd_response_data_t *response_data)
{
  gchar *res;
  entity_t status_details_entity;
  int success;
  success = gmp_success (entity);

  if (!success)
    {
      set_http_status_from_entity (entity, response_data);
    }

  status_details_entity = entity_child (entity, "status_details");

  res = action_result (connection, credentials, params, response_data,
                       action, entity_attribute (entity, "status"),
                       entity_attribute (entity, "status_text"),
                       entity_text(status_details_entity),
                       entity_attribute (entity, "id"));
  return res;
}

/**
 * @brief Generate a page.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  response     Extra XML to insert inside envelope.
 * @param[in]  next         Command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
generate_page (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, gchar *response, const gchar *next,
               cmd_response_data_t* response_data)
{
  credentials->current_page = page_url (credentials, next);
  if (g_utf8_validate (credentials->current_page, -1, NULL) == FALSE)
    {
      g_free (credentials->current_page);
      g_warning ("%s - current_page is not valid UTF-8", __FUNCTION__);
      credentials->current_page = NULL;
    }

  if (strcmp (next, "edit_role") == 0)
    return edit_role (connection, credentials, params, response, response_data);

  if (strcmp (next, "edit_task") == 0)
    return edit_task (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_alerts") == 0)
    return get_alerts (connection, credentials, params, response,
                       response_data);

  if (strcmp (next, "get_alert") == 0)
    return get_alert (connection, credentials, params, response, response_data);

  if (strcmp (next, "edit_port_list") == 0)
    return edit_port_list (connection, credentials, params, response,
                           response_data);

  if (strcmp (next, "get_agents") == 0)
    return get_agents (connection, credentials, params, response,
                       response_data);

  if (strcmp (next, "get_agent") == 0)
    return get_agent (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_asset") == 0)
    return get_asset (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_assets") == 0)
    return get_assets (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_config") == 0)
    return get_config (connection, credentials, params, response, 0,
                       response_data);

  if (strcmp (next, "get_configs") == 0)
    return get_configs (connection, credentials, params, response,
                        response_data);

  if (strcmp (next, "get_filter") == 0)
    return get_filter (connection, credentials, params, response,
                       response_data);

  if (strcmp (next, "get_filters") == 0)
    return get_filters (connection, credentials, params, response,
                        response_data);

  if (strcmp (next, "get_group") == 0)
    return get_group (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_groups") == 0)
    return get_groups (connection, credentials, params, response,
                       response_data);

  if (strcmp (next, "get_credential") == 0)
    return get_credential (connection, credentials, params, response,
                           response_data);

  if (strcmp (next, "get_credentials") == 0)
    return get_credentials (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_note") == 0)
    return get_note (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_notes") == 0)
    return get_notes (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_nvts") == 0)
    return get_nvts (connection, credentials, params, NULL, response, response_data);

  if (strcmp (next, "get_override") == 0)
    return get_override (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_overrides") == 0)
    return get_overrides (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_permission") == 0)
    return get_permission (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_permissions") == 0)
    return get_permissions (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_port_list") == 0)
    return get_port_list (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_port_lists") == 0)
    return get_port_lists (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_tag") == 0)
    return get_tag (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_tags") == 0)
    return get_tags (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_target") == 0)
    return get_target (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_targets") == 0)
    return get_targets (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_task") == 0)
    return get_task (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_tasks") == 0)
    return get_tasks (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_report") == 0)
    {
      char *result;
      int error = 0;

      result = get_report (connection, credentials, params, NULL,
                           response, &error, response_data);

      return error ? result : envelope_gmp (connection, credentials,
                                            params, result,
                                            response_data);
    }

  if (strcmp (next, "get_report_format") == 0)
    return get_report_format (connection, credentials, params, response,
                              response_data);

  if (strcmp (next, "get_report_formats") == 0)
    return get_report_formats (connection, credentials, params, response,
                               response_data);

  if (strcmp (next, "get_report_section") == 0)
    return get_report_section (connection, credentials, params, response,
                               response_data);

  if (strcmp (next, "get_reports") == 0)
    return get_reports (connection, credentials, params, response,
                        response_data);

  if (strcmp (next, "get_results") == 0)
    return get_results (connection, credentials, params, response,
                        response_data);

  if (strcmp (next, "get_result") == 0)
    return get_result_page (connection, credentials, params, response,
                            response_data);

  if (strcmp (next, "get_role") == 0)
    return get_role (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_roles") == 0)
    return get_roles (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_scanner") == 0)
    return get_scanner (connection, credentials, params, response,
                        response_data);

  if (strcmp (next, "get_scanners") == 0)
    return get_scanners (connection, credentials, params, response,
                         response_data);

  if (strcmp (next, "get_schedule") == 0)
    return get_schedule (connection, credentials, params, response,
                         response_data);

  if (strcmp (next, "get_schedules") == 0)
    return get_schedules (connection, credentials, params, response,
                          response_data);

  if (strcmp (next, "get_user") == 0)
    return get_user (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_users") == 0)
    return get_users (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_vulns") == 0)
    return get_vulns (connection, credentials, params, response, response_data);

  if (strcmp (next, "get_info") == 0)
    return get_info (connection, credentials, params, response, response_data);

  if (strcmp (next, "wizard") == 0)
    return wizard (connection, credentials, params, response, response_data);

  if (strcmp (next, "wizard_get") == 0)
    return wizard_get (connection, credentials, params, response, response_data);

  return NULL;
}

/**
 * @brief Generate next page.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  response       Extra XML to insert inside enveloped XML.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
next_page (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, gchar *response,
           cmd_response_data_t* response_data)
{
  const char *next;

  next = params_value (params, "next");
  if (next == NULL)
    return NULL;

  return generate_page (connection, credentials, params, response, next,
                        response_data);
}

/**
 * @brief Get one resource, envelope the result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  type           Type of resource.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[in]  extra_attribs  Extra attributes for GMP GET command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_one (gvm_connection_t *connection, const char *type,
         credentials_t * credentials, params_t *params,
         const char *extra_xml, const char *extra_attribs,
         cmd_response_data_t* response_data)
{
  GString *xml;
  int ret;
  gchar *end, *id_name;
  const char *id, *sort_field, *sort_order, *filter, *first, *max;

  id_name = g_strdup_printf ("%s_id", type);
  id = params_value (params, id_name);
  g_free (id_name);
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "Diagnostics: missing ID.", response_data);
    }

  xml = g_string_new ("");
  g_string_append_printf (xml, "<get_%s>", type);

  if (strcmp (type, "role") == 0
      && command_enabled (credentials, "GET_PERMISSIONS")
      && params_value (params, "role_id"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmpf (connection, credentials, &response, &entity, response_data,
                    "<get_permissions"
                    " filter=\"rows=-1 subject_type=role and subject_uuid=%s\"/>",
                    params_value (params, "role_id")))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting permissions. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting permissions. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting permissins. "
                                 "Diagnostics: Internal Error.", response_data);
        }

      g_string_append (xml, response);

      if (!gmp_success (entity))
        set_http_status_from_entity (entity, response_data);

      free_entity (entity);
      g_free (response);
    }

  /* Pass through params for get_resources. */
  filter = params_value (params, "filter");
  first = params_value (params, "first");
  max = params_value (params, "max");
  end = g_markup_printf_escaped ("<filters><term>%s</term></filters>"
                                 "<%ss start=\"%s\" max=\"%s\"/>",
                                 filter ? filter : "",
                                 type,
                                 first ? first : "",
                                 max ? max : "");
  g_string_append (xml, end);
  g_free (end);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  /* Get the resource. */

  if (gvm_connection_sendf (connection,
                            "<get_%ss"
                            " %s_id=\"%s\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\""
                            " details=\"1\""
                            " %s/>",
                            type,
                            type,
                            id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending",
                            extra_attribs ? extra_attribs : "")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting resources list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting resources list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Get tag names */

  if (gvm_connection_sendf (connection,
                            "<get_tags"
                            " filter=\"resource_type=%s"
                            "          first=1"
                            "          rows=-1\""
                            " names_only=\"1\""
                            "/>",
                            type)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Get permissions */

  g_string_append (xml, "<permissions>");

  if ((strcmp (type, "user") == 0)
      || (strcmp (type, "group") == 0)
      || (strcmp (type, "role") == 0))
    ret = gvm_connection_sendf (connection,
                                "<get_permissions"
                                " filter=\"subject_uuid=%s"
                                "          and not resource_uuid=&quot;&quot;"
                                "          or resource_uuid=%s"
                                "          first=1 rows=-1\"/>",
                                id,
                                id);
  else
    ret = gvm_connection_sendf (connection,
                                "<get_permissions"
                                " filter=\"resource_uuid=%s"
                                "          first=1 rows=-1\"/>",
                                id);
  if (ret == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting permissions list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting permissions list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</permissions>");

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</get_%s>", type);
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Get all of a particular type of resource, envelope the result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  type           Resource type.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[in]  extra_attribs  Extra attributes for GMP GET command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_many (gvm_connection_t *connection, const char *type,
          credentials_t *credentials, params_t *params,
          const char *extra_xml, const char *extra_attribs,
          cmd_response_data_t* response_data)
{
  GString *xml;
  GString *type_many; /* The plural form of type */
  gchar *request, *built_filter;
  const char *build_filter, *filt_id, *filter, *filter_extra;
  const char *first, *max, *sort_field, *sort_order, *owner, *permission;
  const char *replace_task_id;
  const char *overrides, *autofp, *autofp_value, *min_qod;
  const char *level_high, *level_medium, *level_low, *level_log;
  const char *level_false_positive;
  const char *details;

  build_filter = params_value(params, "build_filter");
  filt_id = params_value (params, "filt_id");
  filter = params_value (params, "filter");
  filter_extra = params_value (params, "filter_extra");
  first = params_value (params, "first");
  max = params_value (params, "max");
  replace_task_id = params_value (params, "replace_task_id");
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  owner = params_value (params, "owner");
  permission = params_value (params, "permission");
  overrides = params_value (params, "overrides");
  autofp = params_value (params, "autofp");
  autofp_value = params_value (params, "autofp_value");
  min_qod = params_value (params, "min_qod");
  level_high = params_value (params, "level_high");
  level_medium = params_value (params, "level_medium");
  level_low = params_value (params, "level_low");
  level_log = params_value (params, "level_log");
  level_false_positive = params_value (params, "level_false_positive");
  details = params_value (params, "details");

  if (details == NULL || strcmp (details, "") == 0)
    details = "0";

  /* check if filter still exists */
  switch (filter_exists (connection, filt_id))
    {
      case 1:
        break;
      case 0:
        g_debug ("%s filter doesn't exist anymore %s!\n", __FUNCTION__,
                 filt_id);
        filt_id = NULL;
        break;
      case -1:
        g_debug ("%s filter response didn't contain a status!\n", __FUNCTION__);
        filt_id = NULL;
        break;
      case -2:
        g_debug ("%s could not send filter request!\n", __FUNCTION__);
        filt_id = NULL;
        break;
      case -3:
        g_debug ("%s could not read entity from filter response!\n",
                 __FUNCTION__);
        filt_id = NULL;
        break;
      default:
        filt_id = NULL;
    }

  xml = g_string_new ("");
  type_many = g_string_new (type);

  /* Workaround the fact that info is a non countable noun */
  if (strcmp (type, "info") != 0)
    g_string_append (type_many, "s");

  g_string_append_printf (xml, "<get_%s>", type_many->str);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  built_filter = NULL;
  if (filt_id == NULL
      || (strcmp (filt_id, "") == 0)
      || (strcmp (filt_id, "--") == 0))
    {
      if ((build_filter && (strcmp (build_filter, "1") == 0))
          || ((filter == NULL || strcmp (filter, "") == 0)
              && (filter_extra == NULL || strcmp (filter_extra, "") == 0)))
        {
          if (build_filter && (strcmp (build_filter, "1") == 0))
            {
              gchar *task;
              const char *search_phrase, *task_id;

              if (strcmp (type, "report") == 0
                  || strcmp (type, "task") == 0)
                {
                  task = g_strdup_printf ("apply_overrides=%i min_qod=%s ",
                                          overrides
                                          && strcmp (overrides, "0"),
                                          min_qod ? min_qod : "");
                }
              else if (strcmp (type, "result") == 0)
                {
                  gchar *levels
                    = g_strdup_printf ("%s%s%s%s%s",
                                       level_high ? "h" : "",
                                       level_medium ? "m" : "",
                                       level_low ? "l" : "",
                                       level_log ? "g" : "",
                                       level_false_positive ? "f" : "");
                  task = g_strdup_printf ("apply_overrides=%i min_qod=%s"
                                          " autofp=%s levels=%s ",
                                          (overrides
                                           && strcmp (overrides, "0")),
                                          min_qod ? min_qod : "",
                                          (autofp && autofp_value)
                                            ? autofp_value : "0",
                                          levels);
                  g_free (levels);
                }
              else
                task = NULL;

              search_phrase = params_value (params, "search_phrase");
              task_id = params_value (params, "task_id");
              built_filter = g_strdup_printf
                              ("%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s",
                               task ? task : "",
                               task_id ? "task_id=" : "",
                               task_id ? task_id : "",
                               task_id ? " " : "",
                               first ? "first=" : "",
                               first ? first : "",
                               first ? " " : "",
                               max ? "rows=" : "",
                               max ? max : "",
                               max ? " " : "",
                               sort_field
                                ? ((sort_order && strcmp (sort_order,
                                                          "ascending"))
                                    ? "sort-reverse="
                                    : "sort=")
                                : "",
                               sort_field ? sort_field : "",
                               sort_field ? " " : "",
                               permission ? "permission=" : "",
                               permission ? permission : "",
                               permission ? " " : "",
                               owner ? "owner=" : "",
                               owner ? owner : "",
                               owner ? " " : "",
                               (filter && search_phrase) ? " " : "",
                               filter ? filter : "",
                               search_phrase ? " " : "",
                               search_phrase
                                ? search_phrase
                                : "");
              filt_id = FILT_ID_USER_SETTING;
              g_free (task);
            }
          else if (strcmp (type, "info") == 0
                   && params_value (params, "info_type"))
            {
              if (strcmp (params_value (params, "info_type"), "cve") == 0)
                filter = "sort-reverse=published rows=-2";
              else if (strcmp (params_value (params, "info_type"), "cpe") == 0)
                filter = "sort-reverse=modified rows=-2";
              else
                filter = "sort-reverse=created rows=-2";
            }
          else if (strcmp (type, "user") == 0)
            filter = "sort=roles rows=-2";
          else if (strcmp (type, "report") == 0)
            {
              const char *task_id;
              task_id = params_value (params, "task_id");
              if (task_id)
                built_filter = g_strdup_printf ("task_id=%s apply_overrides=1"
                                                " rows=-2 sort-reverse=date",
                                                task_id);
              else
                filter = "apply_overrides=1 rows=-2 sort-reverse=date";
            }
          else if (strcmp (type, "result") == 0)
            {
              built_filter
                = g_strdup_printf("apply_overrides=%d autofp=%s rows=-2"
                                  " sort-reverse=created",
                                  (overrides == NULL
                                   || strcmp (overrides, "0")),
                                  (autofp && strcmp (autofp, "0"))
                                    ? autofp_value
                                    : "0");
            }
          else if (strcmp (type, "note") == 0 || strcmp (type, "override") == 0)
            {
              filter = "rows=-2 sort=nvt";
            }
          else if (strcmp (type, "task"))
            filter = "rows=-2";
          else
            filter = "apply_overrides=1 rows=-2";
          if (filt_id && strcmp (filt_id, ""))
            /* Request to use "filter" instead. */
            filt_id = FILT_ID_NONE;
          else
            filt_id = FILT_ID_USER_SETTING;
        }
      else if ((strcmp (filter, "sort=nvt") == 0)
               && ((strcmp (type, "note") == 0)
                   || (strcmp (type, "override") == 0)))
        filt_id = FILT_ID_USER_SETTING;
      else if ((strcmp (filter, "apply_overrides=1") == 0)
               && (strcmp (type, "task") == 0))
        filt_id = FILT_ID_USER_SETTING;
    }
  else if (replace_task_id)
    {
      const char *task_id;
      task_id = params_value (params, "task_id");
      if (task_id)
        built_filter = g_strdup_printf ("task_id=%s %s",
                                        task_id,
                                        filter ? filter : "");
    }

  /* Get the list. */

  request = g_markup_printf_escaped (" %sfilt_id=\"%s\""
                                     " %sfilter=\"%s%s%s%s\""
                                     " filter_replace=\"%s\""
                                     " first=\"%s\""
                                     " max=\"%s\""
                                     " sort_field=\"%s\""
                                     " sort_order=\"%s\"",
                                     strcmp (type, "report") ? "" : "report_",
                                     filt_id ? filt_id : "0",
                                     strcmp (type, "report") ? "" : "report_",
                                     built_filter
                                      ? built_filter
                                      : (filter ? filter : ""),
                                     filter_extra ? " " : "",
                                     filter_extra ? filter_extra : "",
                                     filter_extra ? " " : "",
                                     replace_task_id ? "task_id" : "",
                                     first ? first : "1",
                                     max ? max : "-2",
                                     sort_field ? sort_field : "name",
                                     sort_order ? sort_order : "ascending");

  g_free (built_filter);
  if (gvm_connection_sendf (connection,
                            "<get_%s details=\"%s\" %s %s/>",
                            type_many->str,
                            strcmp (type, "report") ? details : "0",
                            request,
                            extra_attribs ? extra_attribs : "")
      == -1)
    {
      g_free(request);
      g_string_free (xml, TRUE);
      g_string_free (type_many, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }
  g_free(request);
  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      g_string_free (type_many, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting resources list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  // TODO: Test response

  if (command_enabled (credentials, "GET_FILTERS"))
    {
      /* Get the filters. */

      g_string_append (xml, "<filters>");

      if (gvm_connection_sendf_xml
           (connection,
            "<get_filters"
            " filter=\"rows=-1 type=%s or type=\"/>",
            type)
          == -1)
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }

      g_string_append (xml, "</filters>");
    }

  if (command_enabled (credentials, "GET_SETTINGS"))
    {
      /* Get the Wizard Rows setting. */

      if (gvm_connection_sendf_xml
           (connection,
            "<get_settings"
            " setting_id=\"20f3034c-e709-11e1-87e7-406186ea4fc5\"/>",
            type)
          == -1)
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_TAGS")
      && params_value (params, "details"))
    {
      /* Get tag names */

      if (gvm_connection_sendf (connection,
                                "<get_tags"
                                " filter=\"resource_type=%s"
                                "          first=1"
                                "          rows=-1\""
                                " names_only=\"1\""
                                "/>",
                                strcmp (type, "info")
                                  ? type
                                  : params_value (params, "info_type"))
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to receive response from manager daemon.",
                              response_data);
        }
    }

  /* Cleanup, and return transformed XML. */
  g_string_append_printf (xml, "</get_%s>", type_many->str);
  g_string_free (type_many, TRUE);
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Setup edit XML, envelope the result.
 *
 * @param[in]  connection         Connection to manager
 * @param[in]  type               Type or resource to edit.
 * @param[in]  credentials        Username and password for authentication.
 * @param[in]  params             Request parameters.
 * @param[in]  extra_get_attribs  Extra attributes for the get_... command.
 * @param[in]  extra_xml          Extra XML to insert inside page element.
 * @param[out] response_data      Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_resource (gvm_connection_t *connection, const char *type,
               credentials_t *credentials, params_t *params,
               const char *extra_get_attribs, const char *extra_xml,
               cmd_response_data_t* response_data)
{
  GString *xml;
  gchar *id_name;
  const char *resource_id;

  id_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, id_name);
  g_free (id_name);

  if (resource_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a resource. "
                           "The resource remains as it was. "
                           "Diagnostics: Required ID parameter was NULL.",
                           response_data);
    }

  if (gvm_connection_sendf (connection,
                            /* TODO: Remove redundant COMMANDS. */
                            "<commands>"
                            "<get_%ss"
                            " %s"
                            " %s_id=\"%s\""
                            " details=\"1\"/>"
                            "</commands>",
                            type,
                            extra_get_attribs ? extra_get_attribs : "",
                            type,
                            resource_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("");

  g_string_append_printf (xml, "<edit_%s>", type);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</edit_%s>", type);
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Generates a file name for exporting.
 *
 * @param[in]   fname_format      Format string.
 * @param[in]   credentials       Current credentials.
 * @param[in]   type              Type of resource.
 * @param[in]   uuid              UUID of resource.
 * @param[in]   resource_entity   Resource entity to extract extra data from.
 *
 * @return The file name.
 */
gchar *
format_file_name (gchar* fname_format, credentials_t* credentials,
                  const char* type, const char* uuid,
                  entity_t resource_entity)
{
  gchar *creation_time, *modification_time, *name, *format_name;
  gchar *ret;

  if (resource_entity)
    {
      entity_t creation_time_entity, modification_time_entity;
      entity_t task_entity, format_entity, format_name_entity, name_entity;

      creation_time_entity = entity_child (resource_entity,
                                           "creation_time");

      if (creation_time_entity)
        creation_time = entity_text (creation_time_entity);
      else
        creation_time = NULL;

      modification_time_entity = entity_child (resource_entity,
                                               "modification_time");

      if (modification_time_entity)
        modification_time = entity_text (modification_time_entity);
      else
        modification_time = NULL;

      if (strcasecmp (type, "report") == 0)
        {
          task_entity = entity_child (resource_entity, "task");
          if (task_entity)
            name_entity = entity_child (task_entity, "name");
          else
            name_entity = NULL;

          format_entity = entity_child (resource_entity, "report_format");
          if (format_entity)
            {
              format_name_entity = entity_child (format_entity, "name");
            }
          else
            format_name_entity = NULL;

          if (format_name_entity && strlen (entity_text (format_name_entity)))
            format_name = entity_text (format_name_entity);
          else
            format_name = NULL;
        }
      else
        {
          name_entity = entity_child (resource_entity, "name");
          format_name = NULL;
        }

      if (name_entity)
        name = entity_text (name_entity);
      else
        name = NULL;
    }
  else
    {
      creation_time = NULL;
      modification_time = NULL;
      name = NULL;
      format_name = NULL;
    }

  ret = gvm_export_file_name (fname_format, credentials->username,
                              type, uuid, creation_time, modification_time,
                              name, format_name);
  return ret;
}


/**
 * @brief Export a resource.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   type                 Type of resource.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Resource XML on success.  XML error object on error.
 */
char *
export_resource (gvm_connection_t *connection, const char *type,
                 credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  GString *xml;
  entity_t entity;
  entity_t resource_entity;
  char *content = NULL;
  gchar *id_name;
  gchar *fname_format, *file_name;
  int ret;
  const char *resource_id, *subtype;

  xml = g_string_new ("");

  id_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, id_name);
  g_free (id_name);

  if (resource_id == NULL)
    {
      g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Export Resource"));
      return envelope_gmp (connection, credentials, params,
                           g_string_free (xml, FALSE), response_data);
    }

  subtype = params_value (params, "subtype");

  if (gvm_connection_sendf (connection,
                            "<get_%ss"
                            " %s_id=\"%s\""
                            "%s%s%s"
                            " export=\"1\""
                            " details=\"1\"/>",
                            type,
                            type,
                            resource_id,
                            subtype ? " type=\"" : "",
                            subtype ? subtype : "",
                            subtype ? "\"" : "")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "The resource could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &content))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "The resource could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (!gmp_success (entity))
    set_http_status_from_entity (entity, response_data);

  resource_entity = entity_child (entity, type);

  if (resource_entity == NULL)
    {
      g_free (content);
      free_entity (entity);
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "The resource could not be delivered. "
                           "Diagnostics: Failure to receive resource from manager daemon.",
                           response_data);
    }

  ret = setting_get_value (connection,
                           "a6ac88c5-729c-41ba-ac0a-deea4a3441f2",
                           &fname_format,
                           response_data);
  if (ret)
    {
      g_free (content);
      free_entity (entity);
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      switch (ret)
        {
          case 1:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                response_data);
          case 2:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          default:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Internal error.",
                                response_data);
        }
    }

  if (fname_format == NULL)
    {
      g_warning ("%s : File name format setting not found.", __FUNCTION__);
      fname_format = "%T-%U";
    }

  file_name = format_file_name (fname_format, credentials, type, resource_id,
                                resource_entity);
  if (file_name == NULL)
    file_name = g_strdup_printf ("%s-%s", type, resource_id);

  cmd_response_data_set_content_type (response_data,
                                      GSAD_CONTENT_TYPE_APP_XML);
  cmd_response_data_set_content_disposition
    (response_data, g_strdup_printf ("attachment; filename=\"%s.xml\"",
                                     file_name));
  cmd_response_data_set_content_length (response_data, strlen (content));

  free_entity (entity);
  g_free (file_name);
  g_string_free (xml, TRUE);
  return content;
}

/**
 * @brief Export a list of resources.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return XML on success.  XML error object on error.
 */
static char *
export_many (gvm_connection_t *connection, const char *type,
             credentials_t * credentials, params_t *params,
             cmd_response_data_t* response_data)
{
  entity_t entity;
  char *content = NULL;
  const char *filter;
  gchar *filter_escaped;
  gchar *type_many;
  gchar *fname_format, *file_name;
  int ret;

  filter = params_value (params, "filter");

  filter_escaped = g_markup_escape_text (filter, -1);

  if (strcmp (type, "info") == 0)
    {
      if (gvm_connection_sendf (connection,
                                "<get_info"
                                " type=\"%s\""
                                " export=\"1\""
                                " details=\"1\""
                                " filter=\"%s\"/>",
                                params_value (params, "info_type"),
                                filter_escaped ? filter_escaped : "")
          == -1)
        {
          g_free (filter_escaped);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting a list. "
                              "The list could not be delivered. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }
    }
  else if (strcmp (type, "asset") == 0)
    {
      if (gvm_connection_sendf (connection,
                                "<get_assets"
                                " type=\"%s\""
                                " export=\"1\""
                                " details=\"1\""
                                " filter=\"%s\"/>",
                                params_value (params, "asset_type"),
                                filter_escaped ? filter_escaped : "")
          == -1)
        {
          g_free (filter_escaped);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting a list. "
                              "The list could not be delivered. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }
    }
  else
    {
      if (gvm_connection_sendf (connection,
                                "<get_%ss"
                                " export=\"1\""
                                " details=\"1\""
                                " filter=\"%s\"/>",
                                type,
                                filter_escaped ? filter_escaped : "")
          == -1)
        {
          g_free (filter_escaped);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting a list. "
                              "The list could not be delivered. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }
    }
  g_free (filter_escaped);

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &content))
    {
      cmd_response_data_set_status_code (response_data,
                                          MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a list. "
                           "The list could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (!gmp_success (entity))
    set_http_status_from_entity (entity, response_data);

  ret = setting_get_value (connection,
                           "0872a6ed-4f85-48c5-ac3f-a5ef5e006745",
                           &fname_format,
                           response_data);
  if (ret)
    {
      g_free (content);
      free_entity (entity);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      switch (ret)
        {
          case 1:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                response_data);
          case 2:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          default:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Internal error.",
                                response_data);
        }
    }

  if (fname_format == NULL)
    {
      g_warning ("%s : File name format setting not found.", __FUNCTION__);
      fname_format = "%T-%D";
    }

  if (strcmp (type, "info") == 0)
    type_many = g_strdup (type);
  else
    type_many = g_strdup_printf ("%ss", type);

  file_name = format_file_name (fname_format, credentials, type_many, "list",
                                NULL);
  if (file_name == NULL)
    file_name = g_strdup_printf ("%s-%s", type_many, "list");

  g_free (type_many);

  cmd_response_data_set_content_type (response_data,
                                      GSAD_CONTENT_TYPE_APP_XML);
  cmd_response_data_set_content_disposition
    (response_data, g_strdup_printf ("attachment; filename=\"%s.xml\"",
                                     file_name));
  cmd_response_data_set_content_length (response_data, strlen (content));

  free_entity (entity);
  g_free (file_name);
  return content;
}

/**
 * @brief Delete a resource, get all resources, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  type           Type of resource.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  ultimate       0 move to trash, 1 remove entirely.
 * @param[in]  get            Next page get command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_resource (gvm_connection_t *connection, const char *type,
                 credentials_t * credentials, params_t *params, int ultimate,
                 const char *get, cmd_response_data_t* response_data)
{
  gchar *html, *response, *id_name, *resource_id, *extra_attribs;
  const char  *next_id;
  entity_t entity;
  gchar *cap_type, *default_next, *prev_action;

  id_name = g_strdup_printf ("%s_id", type);
  if (params_value (params, id_name))
    resource_id = g_strdup (params_value (params, id_name));
  else
    {
      g_free (id_name);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a resource. "
                           "The resource was not deleted. "
                           "Diagnostics: Required parameter resource_id was NULL.",
                           response_data);
    }

  /* This is a hack for assets, because asset_id is the param name used for
   * both the asset being deleted and the asset on the next page. */
  next_id = params_value (params, "next_id");
  if (next_id)
    {
      param_t *param;
      param = params_get (params, id_name);
      g_free (param->value);
      param->value = g_strdup (next_id);
      param->value_size = strlen (param->value);
    }

  g_free (id_name);

  /* Extra attributes */
  extra_attribs = NULL;

  /* Inheritor of user's resource */
  if (strcmp (type, "user") == 0)
    {
      const char* inheritor_id;
      inheritor_id = params_value (params, "inheritor_id");
      if (inheritor_id)
        extra_attribs = g_strdup_printf ("inheritor_id=\"%s\"", inheritor_id);
    }

  /* Delete the resource and get all resources. */

  if (gvm_connection_sendf (connection,
                            "<delete_%s %s_id=\"%s\" ultimate=\"%i\"%s%s/>",
                            type,
                            type,
                            resource_id,
                            !!ultimate,
                            extra_attribs ? " " : "",
                            extra_attribs ? extra_attribs : "")
      == -1)
    {
      g_free (resource_id);
      g_free (extra_attribs);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a resource. "
                           "The resource is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  g_free (resource_id);
  g_free (extra_attribs);

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a resource. "
                           "It is unclear whether the resource has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           response_data);
    }

  if (!gmp_success (entity))
    set_http_status_from_entity (entity, response_data);

  cap_type = capitalize (type);
  default_next = g_strdup_printf ("get_%ss", type);
  prev_action = g_strdup_printf ("Delete %s", cap_type);

  html = response_from_entity (connection, credentials, params, entity,
                               prev_action, response_data);

  g_free (response);
  free_entity (entity);
  g_free (cap_type);
  g_free (default_next);
  g_free (prev_action);

  return html;
}

/**
 * @brief Perform action on resource, get next page, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  type           Type of resource.
 * @param[in]  action         Action to perform.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
resource_action (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, const char *type, const char *action,
                 cmd_response_data_t* response_data)
{
  gchar *html, *response, *param_name;
  const char  *resource_id;
  gchar *cap_action, *cap_type, *get_cmd, *prev_action;

  int ret;
  entity_t entity;

  assert (type);

  param_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, param_name);

  if (resource_id == NULL)
    {
      gchar *message;
      message = g_strdup_printf
                 ("An internal error occurred while performing an action. "
                  "The resource remains the same. "
                  "Diagnostics: Required parameter %s was NULL.",
                  param_name);
      g_free (param_name);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      html = gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           message, response_data);
      g_free (message);
      return html;
    }
  g_free (param_name);

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<%s_%s %s_id=\"%s\"/>",
              action,
              type,
              type,
              resource_id);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while performing an action. "
                             "The resource remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while performing an action. "
                             "It is unclear whether the resource has been affected. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while performing an action. "
                             "It is unclear whether the resource has been affected. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (!gmp_success (entity))
    set_http_status_from_entity (entity, response_data);

  cap_action = capitalize (action);
  cap_type = capitalize (type);
  get_cmd = g_strdup_printf ("get_%ss", type);
  prev_action = g_strdup_printf ("%s %s", cap_action, cap_type);
  html = response_from_entity (connection, credentials, params, entity,
                               prev_action, response_data);

  g_free (response);
  free_entity (entity);
  g_free (cap_action);
  g_free (cap_type);
  g_free (get_cmd);
  g_free (prev_action);

  return html;
}


/* Page handlers. */

/**
 * @todo Consider doing the input sanatizing in the page handlers.
 *
 * Currently the input sanatizing is done in serve_post, exec_gmp_post and
 * exec_gmp_get in gsad.c.  This means that the information about what
 * input is suitable for a page is separate from the page handler.
 *
 * Doing the input sanatizing in the page handler will probably also help
 * in responding with more detailed messages when an input error occurs.
 */

/**
 * @todo Take care of XML in input.
 *
 * Anything that is printed into the XML directly (usually via
 * g_string_append_printf below) must use something like
 * g_markup_printf_escaped or g_markup_escape_text to ensure that any
 * XML special sequences in the string are escaped.
 */

/**
 * @todo Unify the style of page handlers.
 *
 * There are variations in the style of the page handlers that run
 * multiple GMP commands.
 *
 * Some, like delete_credential_gmp, simply run the GMP commands inside
 * one GMP COMMANDS.
 *
 * Others, like create_target_gmp, run each command separately and wrap the
 * responses in a unique page tag.
 *
 * One handler, delete_target_gmp, runs all the commands in a single COMMANDS
 * and also wraps the response in a unique page tag to convey the context to
 * the enveloped XML.  This is probably the way to go.
 */

/**
 * @brief Get setting, returning HTML message on error.
 *
 * @param[in]  connection   Connection
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  setting_id  UUID of the setting to get.
 * @param[out] value       Value of the setting.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return NULL on success, else error message page HTML.
 */
static char *
setting_get_value_error (gvm_connection_t *connection,
                         credentials_t *credentials,
                         const gchar *setting_id,
                         gchar **value,
                         cmd_response_data_t* response_data)
{
  switch (setting_get_value (connection, setting_id, value, response_data))
    {
      case 0:
        return NULL;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a setting. "
                            "The setting could not be delivered. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a setting. "
                            "The setting could not be delivered. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a setting. "
                            "The setting could not be delivered. "
                            "Diagnostics: Internal error.",
                            response_data);
    }
}

/**
 * @brief Get a value from a param or fall back to a setting
 *
 * @param[out]  value       Variable to assign the value to.
 * @param[in]   param       The param to try get the value from first.
 * @param[in]   setting_id  The UUID of the setting to try next.
 * @param[in]   cleanup     Code to run on failure.
 */
#define PARAM_OR_SETTING(value, param, setting_id, cleanup)                   \
  if (params_valid (params, param))                                           \
    value = g_strdup (params_value (params, param));                          \
  else                                                                        \
    {                                                                         \
      char *message;                                                          \
      message = setting_get_value_error (connection, credentials, setting_id, \
                                         &value, response_data);              \
      if (message)                                                            \
        {                                                                     \
          cleanup;                                                            \
          return message;                                                     \
        }                                                                     \
    }

/**
 * @brief Returns page to create a new task.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials of user issuing the action.
 * @param[in]  params         Request parameters.
 * @param[in]  message        If not NULL, display message.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
new_task (gvm_connection_t *connection, credentials_t * credentials,
          const char *message, params_t *params,
          const char *extra_xml, cmd_response_data_t* response_data)
{
  GString *xml;
  int apply_overrides;
  const char *alerts, *overrides;
  int ret;
  gchar *alert, *schedule, *target;
  gchar *openvas_config, *osp_config, *openvas_scanner, *osp_scanner;

  alerts = params_value (params, "alerts");
  overrides = params_value (params, "overrides");

  apply_overrides = overrides ? strcmp (overrides, "0") : 0;

  ret = setting_get_value (connection,
                           "f9f5a546-8018-48d0-bef5-5ad4926ea899",
                           &alert,
                           response_data);
  if (ret)
    {
      switch (ret)
        {
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a setting. "
                                "The setting could not be delivered. "
                                "Diagnostics: Internal error.",
                                response_data);
        }
    }

  PARAM_OR_SETTING (schedule, "schedule_id",
                    "778eedad-5550-4de0-abb6-1320d13b5e18",
                    g_free (alert));

  PARAM_OR_SETTING (target, "target_id",
                    "23409203-940a-4b4a-b70c-447475f18323",
                    g_free (alert);
                    g_free (schedule));

  PARAM_OR_SETTING (openvas_config, "config_id",
                    "fe7ea321-e3e3-4cc6-9952-da836aae83ce",
                    g_free (alert);
                    g_free (schedule);
                    g_free (target));

  PARAM_OR_SETTING (osp_config, "osp_config_id",
                    "fb19ac4b-614c-424c-b046-0bc32bf1be73",
                    g_free (alert);
                    g_free (schedule);
                    g_free (target);
                    g_free (openvas_config));

  PARAM_OR_SETTING (openvas_scanner, "scanner_id",
                    "f7d0f6ed-6f9e-45dc-8bd9-05cced84e80d",
                    g_free (alert);
                    g_free (schedule);
                    g_free (target);
                    g_free (openvas_config);
                    g_free (osp_config));

  PARAM_OR_SETTING (osp_scanner, "osp_scanner_id",
                    "b20697c9-be0a-4cd4-8b4d-5fe7841ebb03",
                    g_free (alert);
                    g_free (schedule);
                    g_free (target);
                    g_free (openvas_config);
                    g_free (osp_config);
                    g_free (openvas_scanner));

  xml = g_string_new ("<new_task>");

  g_string_append_printf (xml,
                          "<alert_id>%s</alert_id>"
                          "<config_id>%s</config_id>"
                          "<osp_config_id>%s</osp_config_id>"
                          "<scanner_id>%s</scanner_id>"
                          "<osp_scanner_id>%s</osp_scanner_id>"
                          "<schedule_id>%s</schedule_id>"
                          "<target_id>%s</target_id>",
                          alert ? alert : "",
                          (openvas_config && strlen (openvas_config))
                           ? openvas_config
                           : "daba56c8-73ec-11df-a475-002264764cea",
                          osp_config ? osp_config : "",
                          openvas_scanner ? openvas_scanner : "",
                          osp_scanner ? osp_scanner : "",
                          schedule ? schedule : "",
                          (target && strlen (target))
                           ? target
                           : "b493b7a8-7489-11df-a3ec-002264764cea");

  g_free (schedule);
  g_free (target);
  g_free (openvas_config);
  g_free (osp_config);
  g_free (openvas_scanner);
  g_free (osp_scanner);

  /* Get list of targets. */
  if (gvm_connection_sendf (connection,
                            "<get_targets"
                            " filter=\"rows=-1 sort=name\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Get configs to select in new task UI. */
  if (gvm_connection_sendf (connection,
                            "<get_configs"
                            " filter=\"rows=-1 sort=name\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config list. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config list. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (command_enabled (credentials, "GET_ALERTS"))
    {
      /* Get alerts to select in new task UI. */
      if (gvm_connection_sendf (connection,
                                "<get_alerts"
                                " filter=\"rows=-1 sort=name\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting alert list. "
                               "The current list of alerts is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting alert list. "
                               "The current list of alerts is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_SCHEDULES"))
    {
      /* Get schedules to select in new task UI. */
      if (gvm_connection_sendf
           (connection,
            "<get_schedules"
            " filter=\"rows=-1 sort=name\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the schedule list. "
                               "The current list of schedules is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the schedule list. "
                               "The current list of schedules is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_SCANNERS"))
    {
      /* Get scanners to select in new task UI. */
      if (gvm_connection_sendf (connection,
                                "<get_scanners"
                                " filter=\"rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the"
                               " scanner list. "
                               "The current list of scanners is not available. "
                               "Diagnostics: Failure to send command to manager"
                               " daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting"
                               " the scanner list."
                               "The current list of scanners is not available. "
                               "Diagnostics: Failure to receive response from"
                               " manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_GROUPS"))
    {
      /* Get groups for Observer Groups. */

      if (gvm_connection_sendf (connection,
                                "<get_groups/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting group list. "
                               "The current list of groups is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting group list. "
                               "The current list of groups is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_TAGS"))
    {
      /* Get tag names. */

      if (gvm_connection_sendf (connection,
                                "<get_tags"
                                " filter=\"resource_type=task rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting tag list. "
                               "The current list of tags is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting tag list. "
                               "The current list of tags is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (extra_xml)
    g_string_append (xml, extra_xml);
  if (message)
    g_string_append_printf (xml, GSAD_MESSAGE_INVALID, message, "Create Task");
  g_string_append_printf (xml,
                          "<user>%s</user>"
                          "<apply_overrides>%i</apply_overrides>"
                          "<alerts>%s</alerts>"
                          "</new_task>",
                          credentials->username,
                          apply_overrides,
                          alerts ? alerts : "1");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Returns page to create a new task.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials of user issuing the action.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
new_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  return new_task (connection, credentials, NULL, params, NULL, response_data);
}

/**
 * @brief Returns page to create a new container task.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  message      If not NULL, display message.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */

/**
 * @brief Returns page to upload a new report.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
upload_report (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, const char *extra_xml,
               cmd_response_data_t* response_data)
{
  GString *xml;

  xml = g_string_new ("<upload_report>");
  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (command_enabled (credentials, "GET_TASKS"))
    {
      gchar *response;

      if (simple_gmpf (connection, "getting Tasks", credentials, &response,
                       response_data,
                       "<get_tasks"
                       /* All container tasks. */
                       " filter=\"target= rows=-1 owner=any permission=any\"/>"))
        {
          g_string_free (xml, TRUE);
          return response;
        }

      g_string_append (xml, response);
    }

  g_string_append (xml, "</upload_report>");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Return the upload report page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
upload_report_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t* response_data)
{
  return upload_report (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create a report, get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_report_gmp (gvm_connection_t *connection,
                   credentials_t *credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  entity_t entity;
  int ret;
  gchar *command, *html, *response;
  const char *task_id, *name, *comment, *xml_file;
  const char *in_assets;

  task_id = params_value (params, "task_id");
  xml_file = params_value (params, "xml_file");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  in_assets = params_value (params, "in_assets");

  if (task_id == NULL)
    {
      CHECK_PARAM_INVALID (name, "Create Report");
      CHECK_PARAM_INVALID (comment, "Create Report");
    }
  CHECK_PARAM_INVALID (xml_file, "Create Report");

  if (params_given (params, "in_assets"))
    CHECK_PARAM_INVALID (xml_file, "Create Report");

  if (strlen (xml_file) == 0)
    {
      if (task_id)
        return message_invalid (connection, credentials, params, response_data,
                                "Report required",
                                G_STRINGIFY (MHD_HTTP_BAD_REQUEST),
                                "Create Report");

      /* Create only the container task. */

      command = g_markup_printf_escaped ("<create_task>"
                                         "<target id=\"0\"/>"
                                         "<name>%s</name>"
                                         "<comment>%s</comment>"
                                         "</create_task>",
                                         name,
                                         comment);
    }
  else
    {
      gchar **xml_file_array, *xml_file_escaped;

      xml_file_array = g_strsplit (xml_file, "%", -1);
      if (xml_file_array != NULL && xml_file_array[0] != NULL)
        xml_file_escaped = g_strjoinv ("%%", xml_file_array);
      else
        xml_file_escaped = g_strdup (xml_file);
      g_strfreev (xml_file_array);

      if (task_id)
        command = g_strdup_printf ("<create_report>"
                                   "<in_assets>%s</in_assets>"
                                   "<task id=\"%s\"/>"
                                   "%s"
                                   "</create_report>",
                                   in_assets ? in_assets : "0",
                                   task_id ? task_id : "0",
                                   xml_file_escaped ? xml_file_escaped : "");
      else
        {
          gchar *name_escaped, *comment_escaped;
          name_escaped = name ? g_markup_escape_text (name, -1)
                              : NULL;
          comment_escaped = comment ? g_markup_escape_text (comment, -1)
                                    : NULL;
          command = g_strdup_printf ("<create_report>"
                                     "<in_assets>%s</in_assets>"
                                     "<task>"
                                     "<name>%s</name>"
                                     "<comment>%s</comment>"
                                     "</task>"
                                     "%s"
                                     "</create_report>",
                                     in_assets ? in_assets : "",
                                     name_escaped,
                                     comment_escaped,
                                     xml_file_escaped);
          g_free (name_escaped);
          g_free (comment_escaped);
        }
      g_free (xml_file_escaped);
    }

  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             command);
  g_free (command);

  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new report. "
                             "No new report was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new report. "
                             "It is unclear whether the report has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new report. "
                             "It is unclear whether the report has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Import Report", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Import report, get all reports, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
import_report_gmp (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return create_report_gmp (connection, credentials, params, response_data);
}

#define CHECK(name)                                                        \
CHECK_PARAM_INVALID (name, "Create Task")

/**
 * @brief Create a container task, serve next page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_container_task_gmp (gvm_connection_t *connection,
                           credentials_t * credentials, params_t *params,
                           cmd_response_data_t* response_data)
{
  entity_t entity;
  int ret;
  gchar *command, *html, *response;
  const char  *name, *comment;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  CHECK_PARAM_INVALID (name, "Create Container Task");
  CHECK_PARAM_INVALID (comment, "Create Container Task");

  command = g_markup_printf_escaped ("<create_task>"
                                     "<target id=\"0\"/>"
                                     "<name>%s</name>"
                                     "<comment>%s</comment>"
                                     "</create_task>",
                                     name,
                                     comment);
  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             command);
  g_free (command);

  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a container task. "
                             "No task was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a container task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a container task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "task_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Container Task", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Create a task, get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  entity_t entity;
  int ret;
  gchar *schedule_element, *command;
  gchar *response, *html;
  const char *name, *comment, *config_id, *target_id, *scanner_type;
  const char *scanner_id, *schedule_id, *schedule_periods;
  const char *max_checks, *max_hosts;
  const char *in_assets, *hosts_ordering, *alterable, *source_iface;
  const char *add_tag, *tag_id, *auto_delete, *auto_delete_data;
  const char *apply_overrides, *min_qod;
  gchar *name_escaped, *comment_escaped;
  params_t *alerts;
  GString *alert_element;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  target_id = params_value (params, "target_id");
  scanner_type = params_value (params, "scanner_type");
  hosts_ordering = params_value (params, "hosts_ordering");
  schedule_id = params_value (params, "schedule_id");
  schedule_periods = params_value (params, "schedule_periods");
  scanner_id = params_value (params, "scanner_id");
  config_id = params_value (params, "config_id");
  in_assets = params_value (params, "in_assets");
  apply_overrides = params_value (params, "apply_overrides");
  min_qod = params_value (params, "min_qod");
  max_checks = params_value (params, "max_checks");
  source_iface = params_value (params, "source_iface");
  auto_delete = params_value (params, "auto_delete");
  auto_delete_data = params_value (params, "auto_delete_data");
  max_hosts = params_value (params, "max_hosts");
  alterable = params_value (params, "alterable");
  add_tag = params_value (params, "add_tag");
  tag_id = params_value (params, "tag_id");
  CHECK (scanner_type);
  if (!strcmp (scanner_type, "1"))
    {
      hosts_ordering = "";
      max_checks = "";
      source_iface = "";
      max_hosts = "";
    }
  else if (!strcmp (scanner_type, "3"))
    {
      config_id = "";
      hosts_ordering = "";
      max_checks = "";
      source_iface = "";
      max_hosts = "";
    }

  CHECK (name);
  CHECK (comment);
  CHECK (config_id);
  CHECK (target_id);
  CHECK (hosts_ordering);
  CHECK (scanner_id);
  CHECK (schedule_id);
  if (params_given (params, "schedule_periods"))
    {
      CHECK (schedule_periods);
    }
  else
    schedule_periods = "0";
  CHECK (in_assets);
  if (!strcmp (in_assets, "1"))
    {
      CHECK (apply_overrides);
      CHECK (min_qod);
    }
  else
    {
      if (!params_given (params, "apply_overrides")
          || !params_valid (params, "apply_overrides"))
        apply_overrides = "";

      if (!params_given (params, "min_qod")
          || !params_valid (params, "min_qod"))
        min_qod = "";
    }
  CHECK (max_checks);
  CHECK (source_iface);
  CHECK (auto_delete);
  CHECK (auto_delete_data);
  CHECK (max_hosts);
  CHECK (alterable);
  if (add_tag && strcmp (add_tag, "1") == 0)
    {
      CHECK (tag_id);
    }

  if (schedule_id == NULL || strcmp (schedule_id, "0") == 0)
    schedule_element = g_strdup ("");
  else
    schedule_element = g_strdup_printf ("<schedule id=\"%s\"/>", schedule_id);

  alert_element = g_string_new ("");
  if (params_given (params, "alert_id_optional:"))
    alerts = params_values (params, "alert_id_optional:");
  else
    alerts = params_values (params, "alert_ids:");

  if (alerts)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, alerts);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "0"))
          g_string_append_printf (alert_element,
                                  "<alert id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  name_escaped = name ? g_markup_escape_text (name, -1) : NULL;
  comment_escaped = comment ? g_markup_escape_text (comment, -1) : NULL;

  command = g_strdup_printf ("<create_task>"
                             "<config id=\"%s\"/>"
                             "<schedule_periods>%s</schedule_periods>"
                             "%s%s"
                             "<target id=\"%s\"/>"
                             "<scanner id=\"%s\"/>"
                             "<hosts_ordering>%s</hosts_ordering>"
                             "<name>%s</name>"
                             "<comment>%s</comment>"
                             "<preferences>"
                             "<preference>"
                             "<scanner_name>max_checks</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "<preference>"
                             "<scanner_name>max_hosts</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "<preference>"
                             "<scanner_name>in_assets</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "<preference>"
                             "<scanner_name>"
                             "assets_apply_overrides"
                             "</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "<preference>"
                             "<scanner_name>assets_min_qod</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "<preference>"
                             "<scanner_name>source_iface</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "<preference>"
                             "<scanner_name>auto_delete</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "<preference>"
                             "<scanner_name>auto_delete_data</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "</preferences>"
                             "<alterable>%i</alterable>"
                             "</create_task>",
                             config_id,
                             schedule_periods,
                             schedule_element,
                             alert_element->str,
                             target_id,
                             scanner_id,
                             hosts_ordering,
                             name_escaped,
                             comment_escaped,
                             max_checks,
                             max_hosts,
                             strcmp (in_assets, "0") ? "yes" : "no",
                             strcmp (apply_overrides, "0") ? "yes" : "no",
                             min_qod,
                             source_iface,
                             auto_delete,
                             auto_delete_data,
                             alterable ? strcmp (alterable, "0") : 0);

  g_free (name_escaped);
  g_free (comment_escaped);

  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             command);
  g_free (command);

  g_free (schedule_element);
  g_string_free (alert_element, TRUE);

  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new task. "
                             "No new task was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (gmp_success (entity))
    {
      if (add_tag && strcmp (add_tag, "1") == 0)
        {
          const char *new_task_id = entity_attribute (entity, "id");
          gchar *tag_command, *tag_response;
          entity_t tag_entity;

          tag_command
              = g_markup_printf_escaped ("<modify_tag tag_id=\"%s\">"
                                         "<resources action=\"add\">"
                                         "<resource id=\"%s\"/>"
                                         "</resources>"
                                         "</modify_tag>",
                                         tag_id,
                                         new_task_id);

          ret = gmp (connection, credentials,
                     &tag_response,
                     &tag_entity,
                     response_data,
                     tag_command);

          switch (ret)
            {
              case 0:
              case -1:
                break;
              case 1:
                free_entity (entity);
                g_free (response);
                cmd_response_data_set_status_code (
                  response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (credentials,
                                    "Internal error", __FUNCTION__, __LINE__,
                                    "An internal error occurred while creating a new tag. "
                                    "No new tag was created. "
                                    "Diagnostics: Failure to send command to manager daemon.",
                                    response_data);
              case 2:
                free_entity (entity);
                g_free (response);
                cmd_response_data_set_status_code (
                  response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (credentials,
                                    "Internal error", __FUNCTION__, __LINE__,
                                    "An internal error occurred while creating a new tag. "
                                    "It is unclear whether the tag has been created or not. "
                                    "Diagnostics: Failure to receive response from manager daemon.",
                                    response_data);
              default:
                free_entity (entity);
                g_free (response);
                cmd_response_data_set_status_code (
                  response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (credentials,
                                    "Internal error", __FUNCTION__, __LINE__,
                                    "An internal error occurred while creating a new task. "
                                    "It is unclear whether the tag has been created or not. "
                                    "Diagnostics: Internal Error.",
                                    response_data);
            }

          if (entity_attribute (entity, "id"))
            params_add (params, "task_id", entity_attribute (entity, "id"));
          html
            = response_from_entity (connection, credentials, params, tag_entity,
                                    "Create Task and Tag", response_data);
          free_entity (tag_entity);
          g_free (tag_response);
        }
      else
        {
          if (entity_attribute (entity, "id"))
            params_add (params, "task_id", entity_attribute (entity, "id"));
          html
            = response_from_entity (connection, credentials, params, entity,
                                    "Create Task", response_data);
        }
    }
  else
    {
      html = response_from_entity (connection, credentials, params, entity,
                                   "Create Task", response_data);
    }
  free_entity (entity);
  g_free (response);
  return html;
}


/**
 * @brief Delete a task, get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return delete_resource (connection, "task", credentials, params, 0, NULL,
                          response_data);
}

/**
 * @brief Setup edit_task XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_task (gvm_connection_t *connection, credentials_t * credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  GString *xml;
  const char *task_id, *next, *sort_field, *sort_order;
  const char *overrides, *alerts;
  int apply_overrides;

  task_id = params_value (params, "task_id");
  next = params_value (params, "next");
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  overrides = params_value (params, "overrides");
  alerts = params_value (params, "alerts");

  apply_overrides = overrides ? strcmp (overrides, "0") : 1;

  if (task_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a task. "
                           "The task remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  if (next == NULL)
    next = "get_task";

  if (gvm_connection_sendf (connection,
                            "<commands>"
                            "<get_tasks task_id=\"%s\" details=\"1\" />"
                            "<get_targets"
                            " filter=\"rows=-1 sort=name\"/>"
                            "<get_configs"
                            " filter=\"rows=-1 sort=name\"/>"
                            "%s"
                            "%s"
                            "%s"
                            "%s"
                            "</commands>",
                            task_id,
                            command_enabled (credentials, "GET_ALERTS")
                             ? "<get_alerts"
                               " filter=\"rows=-1 sort=name\"/>"
                             : "",
                            command_enabled (credentials, "GET_SCHEDULES")
                             ? "<get_schedules"
                               " filter=\"rows=-1 sort=name\"/>"
                             : "",
                            command_enabled (credentials, "GET_SCANNERS")
                             ? "<get_scanners"
                               " filter=\"rows=-1\"/>"
                             : "",
                            command_enabled (credentials, "GET_GROUPS")
                             ? "<get_groups/>"
                             : "")
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting task info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append_printf (xml,
                          "<edit_task>"
                          "<task id=\"%s\"/>"
                          "<user>%s</user>"
                          "<alerts>%s</alerts>"
                          /* Page that follows. */
                          "<next>%s</next>"
                          /* Passthroughs. */
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>"
                          "<apply_overrides>%i</apply_overrides>",
                          task_id,
                          credentials->username,
                          alerts ? alerts : "1",
                          next,
                          sort_field,
                          sort_order,
                          apply_overrides);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting task info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_task>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Setup edit_task XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return edit_task (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Save task, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  gchar *html, *response, *format;
  const char *comment, *name, *schedule_id, *in_assets;
  const char *scanner_id, *task_id, *max_checks, *max_hosts;
  const char *config_id, *target_id, *hosts_ordering, *alterable, *source_iface;
  const char *scanner_type, *schedule_periods, *auto_delete, *auto_delete_data;
  const char *apply_overrides, *min_qod;
  int ret;
  params_t *alerts;
  GString *alert_element;
  entity_t entity;

  comment = params_value (params, "comment");
  name = params_value (params, "name");
  task_id = params_value (params, "task_id");
  in_assets = params_value (params, "in_assets");
  apply_overrides = params_value (params, "apply_overrides");
  min_qod = params_value (params, "min_qod");
  target_id = params_value (params, "target_id");
  scanner_type = params_value (params, "scanner_type");
  hosts_ordering = params_value (params, "hosts_ordering");
  config_id = params_value (params, "config_id");
  schedule_id = params_value (params, "schedule_id");
  schedule_periods = params_value (params, "schedule_periods");
  scanner_id = params_value (params, "scanner_id");
  max_checks = params_value (params, "max_checks");
  source_iface = params_value (params, "source_iface");
  auto_delete = params_value (params, "auto_delete");
  auto_delete_data = params_value (params, "auto_delete_data");
  max_hosts = params_value (params, "max_hosts");
  alterable = params_value (params, "alterable");

  if (scanner_type != NULL)
    {
      CHECK_PARAM_INVALID (scanner_type, "Save Task");
      if (!strcmp (scanner_type, "1"))
        {
          hosts_ordering = "";
          max_checks = "";
          source_iface = "";
          max_hosts = "";
        }
      else if (!strcmp (scanner_type, "3"))
        {
          config_id = "0";
          hosts_ordering = "";
          max_checks = "";
          source_iface = "";
          max_hosts = "";
        }
    }

  CHECK_PARAM_INVALID (name, "Save Task");
  CHECK_PARAM_INVALID (comment, "Save Task");
  CHECK_PARAM_INVALID (target_id, "Save Task");
  CHECK_PARAM_INVALID (hosts_ordering, "Save Task");
  CHECK_PARAM_INVALID (config_id, "Save Task");
  CHECK_PARAM_INVALID (schedule_id, "Save Task");
  if (params_given (params, "schedule_periods"))
    {
      CHECK (schedule_periods);
    }
  else
    schedule_periods = "0";
  CHECK_PARAM_INVALID (scanner_id, "Save Task");
  CHECK_PARAM_INVALID (task_id, "Save Task");
  CHECK_PARAM_INVALID (max_checks, "Save Task");
  CHECK_PARAM_INVALID (source_iface, "Save Task");
  CHECK_PARAM_INVALID (auto_delete, "Save Task");
  CHECK_PARAM_INVALID (auto_delete_data, "Save Task");
  CHECK_PARAM_INVALID (max_hosts, "Save Task");
  CHECK_PARAM_INVALID (in_assets, "Save Task");

  if (!strcmp (in_assets, "1"))
    {
      CHECK_PARAM_INVALID (apply_overrides, "Save Task");
      CHECK_PARAM_INVALID (min_qod, "Save Task");
    }
  else
    {
      if (!params_given (params, "apply_overrides")
          || !params_valid (params, "apply_overrides"))
        apply_overrides = "";

      if (!params_given (params, "min_qod")
          || !params_valid (params, "min_qod"))
        min_qod = "";
    }

  alert_element = g_string_new ("");
  if (params_given (params, "alert_id_optional:"))
    alerts = params_values (params, "alert_id_optional:");
  else
    alerts = params_values (params, "alert_ids:");

  if (alerts)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, alerts);
      while (params_iterator_next (&iter, &name, &param))
      {
        if (param->value && strcmp (param->value, "0"))
          g_string_append_printf (alert_element,
                                  "<alert id=\"%s\"/>",
                                  param->value ? param->value : "");
      }
    }

  // Remove Alerts from Task if none are given.
  if (strcmp (alert_element->str, "") == 0)
    g_string_append_printf (alert_element, "<alert id=\"0\"/>");

  format = g_strdup_printf ("<modify_task task_id=\"%%s\">"
                            "<name>%%s</name>"
                            "<comment>%%s</comment>"
                            "<hosts_ordering>%s</hosts_ordering>"
                            "%s"
                            "<target id=\"%%s\"/>"
                            "<config id=\"%%s\"/>"
                            "<schedule id=\"%%s\"/>"
                            "<schedule_periods>%%s</schedule_periods>"
                            "<scanner id=\"%%s\"/>"
                            "<preferences>"
                            "<preference>"
                            "<scanner_name>max_checks</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>max_hosts</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>in_assets</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>assets_apply_overrides</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>assets_min_qod</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>source_iface</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>auto_delete</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>auto_delete_data</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "</preferences>"
                            "%s%i%s"
                            "</modify_task>",
                            hosts_ordering,
                            alert_element->str,
                            alterable ? "<alterable>" : "",
                            alterable ? strcmp (alterable, "0") : 0,
                            alterable ? "</alterable>" : "");
  response = NULL;
  entity = NULL;
  ret = gmpf (connection,
              credentials,
              &response,
              &entity,
              response_data,
              format,
              task_id,
              name,
              comment,
              target_id,
              config_id,
              schedule_id,
              schedule_periods,
              scanner_id,
              max_checks,
              max_hosts,
              strcmp (in_assets, "0") ? "yes" : "no",
              strcmp (apply_overrides, "0") ? "yes" : "no",
              min_qod,
              source_iface,
              auto_delete,
              auto_delete_data);
  g_free (format);

  g_string_free (alert_element, TRUE);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "The task was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Task", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

#undef CHECK

/**
 * @brief Save container task, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char * save_container_task_gmp (gvm_connection_t *connection,
                                credentials_t *credentials, params_t *params,
                                cmd_response_data_t *response_data)
{
  gchar *format, *response, *html;
  const char  *comment, *name, *task_id;
  const char *in_assets, *auto_delete, *auto_delete_data;
  int ret;
  entity_t entity;

  comment = params_value (params, "comment");
  in_assets = params_value (params, "in_assets");
  name = params_value (params, "name");
  task_id = params_value (params, "task_id");
  auto_delete = params_value (params, "auto_delete");
  auto_delete_data = params_value (params, "auto_delete_data");
  CHECK_PARAM_INVALID (name, "Save Task")
  CHECK_PARAM_INVALID (comment, "Save Task")
  CHECK_PARAM_INVALID (task_id, "Save Task")
  CHECK_PARAM_INVALID (in_assets, "Save Task")
  CHECK_PARAM_INVALID (auto_delete, "Save Task");
  CHECK_PARAM_INVALID (auto_delete_data, "Save Task");

  format = g_strdup_printf ("<modify_task task_id=\"%%s\">"
                            "<name>%%s</name>"
                            "<comment>%%s</comment>"
                            "<preferences>"
                            "<preference>"
                            "<scanner_name>in_assets</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>auto_delete</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "<preference>"
                            "<scanner_name>auto_delete_data</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "</preferences>"
                            "</modify_task>");

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              format, task_id, name, comment,
              strcmp (in_assets, "0") ? "yes" : "no",
              auto_delete,
              auto_delete_data);
  g_free (format);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "No new task was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Container Task", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Export a task.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Note XML on success.  Enveloped XML on error.
 */
char *
export_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return export_resource (connection, "task", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of tasks.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Tasks XML on success.  Enveloped XML
 *         on error.
 */
char * export_tasks_gmp (gvm_connection_t *connection,
                         credentials_t *credentials, params_t *params,
                         cmd_response_data_t *response_data)
{
  return export_many (connection, "task", credentials, params,
                      response_data);
}

/**
 * @brief Stop a task, get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
stop_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return resource_action (connection, credentials, params, "task", "stop",
                          response_data);
}

/**
 * @brief Resume a task, get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
resume_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return resource_action (connection, credentials, params, "task", "resume",
                          response_data);
}

/**
 * @brief Start a task, get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
start_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  return resource_action (connection, credentials, params, "task", "start",
                          response_data);
}

/**
 * @brief Reassign a task to a new GMP slave.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
move_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  gchar *command, *response, *html;
  const char  *task_id, *slave_id;
  int ret;
  entity_t entity;

  slave_id = params_value (params, "slave_id");
  task_id = params_value (params, "task_id");

  command = g_strdup_printf ("<move_task task_id=\"%s\" slave_id=\"%s\"/>",
                             task_id ? task_id : "",
                             slave_id ? slave_id : "");

  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials, &response, &entity, response_data,
             command);
  g_free (command);
  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while moving a task. "
                             "The task was not moved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while moving a task. "
                             "It is unclear whether the task has been moved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while moving a task. "
                             "It is unclear whether the task has been moved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Move Task", response_data);

  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Requests NVT details, accepting extra commands.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials for the manager connection.
 * @param[in]  params         Request parameters.
 * @param[in]  commands       Extra commands to run before the others.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return XML enveloped NVT details response or error message.
 */
static char*
get_nvts (gvm_connection_t *connection, credentials_t *credentials,
          params_t *params, const char *commands,
          const char *extra_xml, cmd_response_data_t* response_data)
{
  GString *xml = NULL;
  const char *oid;

  oid = params_value (params, "oid");
  if (oid == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an NVT. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  if (gvm_connection_sendf (connection,
                            "<commands>"
                            "%s"
                            "<get_nvts"
                            " nvt_oid=\"%s\""
                            " details=\"1\""
                            " preferences=\"1\"/>"
                            "<get_notes"
                            " nvt_oid=\"%s\""
                            " sort_field=\"notes.text\"/>"
                            "<get_overrides"
                            " nvt_oid=\"%s\""
                            " sort_field=\"overrides.text\"/>"
                            "</commands>",
                            commands ? commands : "",
                            oid,
                            oid,
                            oid)
        == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting nvt details. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
    }

  xml = g_string_new ("<get_nvts>");
  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting nvt details. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Append extra_xml */
  if (extra_xml)
    g_string_append (xml, extra_xml);

  /* Get tag names */

  if (gvm_connection_sendf (connection,
                            "<get_tags"
                            " filter=\"resource_type=nvt"
                            "          first=1"
                            "          rows=-1\""
                            " names_only=\"1\""
                            "/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</get_nvts>");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Requests SecInfo.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials for the manager connection.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return XML enveloped SecInfo response or error message.
 */
char *
get_info (gvm_connection_t *connection, credentials_t *credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t* response_data)
{
  char *ret;
  GString *extra_attribs, *extra_response;
  const char *info_type;

  info_type = params_value (params, "info_type");
  if (info_type == NULL)
    {
      param_t *param;
      param = params_add (params, "info_type", "nvt");
      param->valid = 1;
      param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
      info_type = params_value (params, "info_type");
    }

  if (strcmp (info_type, "nvt")
      && strcmp (info_type, "cve")
      && strcmp (info_type, "cpe")
      && strcmp (info_type, "ovaldef")
      && strcmp (info_type, "cert_bund_adv")
      && strcmp (info_type, "dfn_cert_adv")
      && strcmp (info_type, "allinfo")
      && strcmp (info_type, "NVT")
      && strcmp (info_type, "CVE")
      && strcmp (info_type, "CPE")
      && strcmp (info_type, "OVALDEF")
      && strcmp (info_type, "CERT_BUND_ADV")
      && strcmp (info_type, "DFN_CERT_ADV")
      && strcmp (info_type, "ALLINFO"))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting SecInfo. "
                           "Diagnostics: Invalid info_type parameter value",
                           response_data);
    }

  if (params_value (params, "info_name")
      && params_value (params, "info_id"))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting SecInfo. "
                           "Diagnostics: Both ID and Name set.",
                           response_data);
    }
  extra_response = g_string_new (extra_xml ? extra_xml : "");

  if (command_enabled (credentials, "GET_NOTES")
      && (strcasecmp (info_type, "NVT") == 0)
      && params_value (params, "info_id"))
    {
      gchar *response;

      if (simple_gmpf (connection, "getting SecInfo", credentials, &response,
                       response_data,
                       "<get_notes"
                       " nvt_oid=\"%s\""
                       " sort_field=\"notes.text\"/>",
                       params_value (params, "info_id")))
        {
          g_string_free (extra_response, TRUE);
          return response;
        }

      g_string_append (extra_response, response);
    }

  if (command_enabled (credentials, "GET_OVERRIDES")
      && (strcasecmp (info_type, "NVT") == 0)
      && params_value (params, "info_id"))
    {
      gchar *response;

      if (simple_gmpf (connection, "getting SecInfo", credentials, &response,
                       response_data,
                       "<get_overrides"
                       " nvt_oid=\"%s\""
                       " sort_field=\"overrides.text\"/>",
                       params_value (params, "info_id")))
        {
          g_string_free (extra_response, TRUE);
          return response;
        }

      g_string_append (extra_response, response);
    }

  extra_attribs = g_string_new("");
  g_string_append_printf (extra_attribs, "type=\"%s\"",
                          params_value (params, "info_type"));
  if (params_value (params, "info_name"))
    g_string_append_printf (extra_attribs,
                            " name=\"%s\"",
                            params_value (params, "info_name"));
  else if (params_value (params, "info_id"))
    g_string_append_printf (extra_attribs,
                            " info_id=\"%s\"",
                            params_value (params, "info_id"));
  if (params_value (params, "details"))
    g_string_append_printf (extra_attribs,
                            " details=\"%s\"",
                            params_value (params, "details"));
  ret = get_many (connection, "info", credentials, params, extra_response->str,
                  extra_attribs->str, response_data);

  g_string_free (extra_response, TRUE);
  g_string_free (extra_attribs, TRUE);

  return ret;
}

/**
 * @brief Get info, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_info_gmp (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  return get_info (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Requests NVT details, accepting extra commands.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return XML enveloped NVT details response or error message.
 */
char*
get_nvts_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  return get_nvts (connection, credentials, params, NULL, NULL, response_data);
}

/**
 * @brief Toggle overrides.
 *
 * @param[in]  params     Request parameters.
 * @param[in]  overrides  New overrides value.
 */
static void
params_toggle_overrides (params_t *params, const char *overrides)
{
  param_t *filt_id, *build_filter;
  const char *new_filt_id;

  build_filter = params_get (params, "build_filter");

  if (build_filter)
    new_filt_id = "";
  else
    new_filt_id = "0";

  filt_id = params_get (params, "filt_id");
  if (filt_id)
    {
      filt_id->value = g_strdup (new_filt_id);
      filt_id->value_size = strlen (filt_id->value);
      filt_id->valid = 1;
      filt_id->valid_utf8 = 1;
    }
  else
    params_add (params, "filt_id", new_filt_id);

  if (build_filter == NULL)
    {
      param_t *filter;
      filter = params_get (params, "filter");
      if (filter && filter->value)
        {
          gchar *old;
          old = filter->value;
          filter->value = g_strdup_printf ("apply_overrides=%s %s",
                                           overrides,
                                           old);
          g_free (old);
        }
      else if (strcmp (overrides, "0"))
        params_add (params, "filter",
                    "apply_overrides=1 rows=-2");
      else
        params_add (params, "filter",
                    "apply_overrides=0 rows=-2");
    }
}

/**
 * @brief Get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[in]  extra_xml         Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_tasks (gvm_connection_t *connection, credentials_t *credentials, params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  const char *overrides, *schedules_only, *ignore_pagination;
  gchar *extra_attribs, *ret;

  overrides = params_value (params, "overrides");
  schedules_only = params_value (params, "schedules_only");
  ignore_pagination = params_value (params, "ignore_pagination");

  if (overrides)
    /* User toggled overrides.  Set the overrides value in the filter. */
    params_toggle_overrides (params, overrides);

  extra_attribs = g_strdup_printf ("%s%s%s"
                                   "%s%s%s",
                                   schedules_only ? "schedules_only=\"" : "",
                                   schedules_only ? schedules_only : "",
                                   schedules_only ? "\" " : "",
                                   ignore_pagination
                                    ? "ignore_pagination=\""
                                    : "",
                                   ignore_pagination ? ignore_pagination : "",
                                   ignore_pagination ? "\" " : "");

  ret = get_many (connection, "task", credentials, params, extra_xml, extra_attribs,
                  response_data);
  g_free (extra_attribs);
  return ret;
}

/**
 * @brief Get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_tasks_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return get_tasks (connection, credentials, params, NULL, response_data);
}


/**
 * @brief Get all tasks, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_task (gvm_connection_t *connection, credentials_t *credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t* response_data)
{
  GString *xml = NULL;
  GString *commands_xml = NULL;
  entity_t commands_entity = NULL;
  entity_t task_entity = NULL;
  int notes, get_overrides, apply_overrides;
  int get_target, get_alerts;
  const char *overrides, *task_id;

  task_id = params_value (params, "task_id");
  if (task_id == NULL)
    return get_tasks (connection, credentials, params, extra_xml, response_data);

  overrides = params_value (params, "overrides");
  apply_overrides = overrides ? strcmp (overrides, "0") : 1;

  notes = command_enabled (credentials, "GET_NOTES");
  get_overrides = command_enabled (credentials, "GET_OVERRIDES");
  if (gvm_connection_sendf
       (connection,
        "<commands>"
        "<get_tasks"
        " task_id=\"%s\""
        " filter=\"apply_overrides=%i\""
        " details=\"1\"/>"
        "%s%s%s"
        "%s%s%s"
        "</commands>",
        task_id,
        apply_overrides,
        notes
         ? "<get_notes"
           " sort_field=\"notes_nvt_name, notes.text\""
           " task_id=\""
         : "",
        notes ? task_id : "",
        notes ? "\"/>" : "",
        get_overrides
         ? "<get_overrides"
           " sort_field=\"overrides_nvt_name, overrides.text\""
           " task_id=\""
         : "",
        get_overrides ? task_id : "",
        get_overrides ? "\"/>" : "")
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the status. "
                           "No update on the requested task can be retrieved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  commands_xml = g_string_new ("");
  xml = g_string_new ("<get_task>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append_printf (xml,
                          "<apply_overrides>%i</apply_overrides>"
                          "<delta>%s</delta>",
                          apply_overrides,
                          params_value (params, "delta_report_id")
                           ? params_value (params, "delta_report_id")
                           : "");
  if (read_string_c (connection, &commands_xml))
    {
      g_string_free (commands_xml, TRUE);
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the status. "
                           "No update of the status can be retrieved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }
  g_string_append (xml, commands_xml->str);

  if (parse_entity (commands_xml->str, &commands_entity))
    {
      g_string_free (commands_xml, TRUE);
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the status. "
                           "No update of the status can be retrieved. "
                           "Diagnostics: Failure to parse response from manager daemon.",
                           response_data);
    }

  get_target = command_enabled (credentials, "GET_TARGETS");
  get_alerts = command_enabled (credentials, "GET_ALERTS");
  task_entity = entity_child (commands_entity, "get_tasks_response");
  if (task_entity == NULL)
    {
      g_warning ("%s: No get_tasks_response found in manager response.",
                 __FUNCTION__);
    }
  else
    {
      task_entity = entity_child (task_entity, "task");
      if (task_entity == NULL)
        g_message ("%s: No task found in manager response.", __FUNCTION__);
      else if (get_target || get_alerts)
        {
          entities_t child_entities;
          entity_t child_entity;
          child_entities = task_entity->entities;

          while ((child_entity = first_entity (child_entities)))
            {
              if (get_alerts &&
                  strcmp (entity_name (child_entity), "alert") == 0)
                {
                  const char *resource_id
                    = entity_attribute (child_entity, "id");

                  if (resource_id != NULL && strcmp (resource_id, ""))
                    {
                      if (gvm_connection_sendf (connection,
                                                "<get_alerts"
                                                " alert_id=\"%s\"/>",
                                                resource_id))
                        {
                          g_string_free (xml, TRUE);
                          g_string_free (commands_xml, TRUE);
                          free_entity (commands_entity);
                          cmd_response_data_set_status_code (
                            response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                          return gsad_message (credentials,
                                              "Internal error",
                                              __FUNCTION__, __LINE__,
                                              "An internal error occurred while getting an alert of a task. "
                                              "Diagnostics: Failure to send command to manager daemon.",
                                               response_data);
                        }
                      if (read_string_c (connection, &xml))
                        {
                          g_string_free (commands_xml, TRUE);
                          g_string_free (xml, TRUE);
                          free_entity (commands_entity);
                          cmd_response_data_set_status_code (
                            response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                          return gsad_message (credentials,
                                              "Internal error",
                                              __FUNCTION__, __LINE__,
                                              "An internal error occurred while getting an alert of a task. "
                                              "Diagnostics: Failure to receive response from manager daemon.",
                                               response_data);
                        }
                    }
                }

              if (get_target &&
                  strcmp (entity_name (child_entity), "target") == 0)
                {
                  const char *resource_id
                    = entity_attribute (child_entity, "id");

                  if (resource_id != NULL && strcmp (resource_id, ""))
                    {
                      if (gvm_connection_sendf (connection,
                                                "<get_targets"
                                                " target_id=\"%s\"/>",
                                                resource_id))
                        {
                          g_string_free (xml, TRUE);
                          g_string_free (commands_xml, TRUE);
                          free_entity (commands_entity);
                          cmd_response_data_set_status_code (
                            response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                          return gsad_message (credentials,
                                              "Internal error",
                                              __FUNCTION__, __LINE__,
                                              "An internal error occurred while getting the target of a task. "
                                              "Diagnostics: Failure to send command to manager daemon.",
                                               response_data);
                        }
                      if (read_string_c (connection, &xml))
                        {
                          g_string_free (commands_xml, TRUE);
                          g_string_free (xml, TRUE);
                          free_entity (commands_entity);
                          cmd_response_data_set_status_code (
                            response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                          return gsad_message (credentials,
                                              "Internal error",
                                              __FUNCTION__, __LINE__,
                                              "An internal error occurred while getting the target of a task. "
                                              "Diagnostics: Failure to receive response from manager daemon.",
                                               response_data);
                        }
                    }
                }

              child_entities = next_entities (child_entities);
            }
        }
    }

  g_string_free (commands_xml, TRUE);
  free_entity (commands_entity);

  /* Get slave scanners. */

  if (command_enabled (credentials, "GET_SCANNERS"))
    {
      if (gvm_connection_sendf (connection,
                                "<get_scanners"
                                " filter=\"first=1 rows=-1 type=4\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code(response_data,
                                            MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting slaves list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting slaves list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to receive response from manager daemon.",
                              response_data);
        }
    }

  /* Get tag names */

  if (gvm_connection_sendf (connection,
                            "<get_tags"
                            " filter=\"resource_type=task"
                            "          first=1"
                            "          rows=-1\""
                            " names_only=\"1\""
                            "/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Get permissions */

  g_string_append (xml, "<permissions>");

  if (gvm_connection_sendf (connection,
                            "<get_permissions"
                            " filter=\"name:^.*(task)s?$"
                            "          and resource_uuid=%s"
                            "          first=1 rows=-1\"/>",
                            task_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting permissions list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting permissions list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</permissions>");

  g_string_append (xml, "</get_task>");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Get a task, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_task_gmp (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  return get_task (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create a credential, get all credentials, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_credential_gmp (gvm_connection_t *connection,
                       credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *login, *type, *password, *passphrase;
  const char *private_key, *certificate, *community, *privacy_password;
  const char *auth_algorithm, *privacy_algorithm, *allow_insecure;
  int autogenerate;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  login = params_value (params, "credential_login");
  type = params_value (params, "base");
  password = params_value (params, "lsc_password");
  passphrase = params_value (params, "passphrase");
  private_key = params_value (params, "private_key");
  certificate = params_value (params, "certificate");
  community = params_value (params, "community");
  privacy_password = params_value (params, "privacy_password");
  auth_algorithm = params_value (params, "auth_algorithm");
  privacy_algorithm = params_value (params, "privacy_algorithm");
  allow_insecure = params_value (params, "allow_insecure");

  if (params_value (params, "autogenerate"))
    autogenerate = strcmp (params_value (params, "autogenerate"), "0");
  else
    return message_invalid (connection, credentials, params, response_data,
                            "Given autogenerate was invalid",
                            G_STRINGIFY (MHD_HTTP_BAD_REQUEST),
                            "Create Credential");

  CHECK_PARAM_INVALID (name, "Create Credential");
  CHECK_PARAM_INVALID (comment, "Create Credential");
  CHECK_PARAM_INVALID (type, "Create Credential");
  CHECK_PARAM_INVALID (allow_insecure, "Create Credential");

  if (autogenerate)
    {
      if (type && (strcmp (type, "cc") == 0))
        {
          // Auto-generate types without username
          ret = gmpf (connection,
                      credentials,
                      &response,
                      &entity,
                      response_data,
                      "<create_credential>"
                      "<name>%s</name>"
                      "<comment>%s</comment>"
                      "<type>%s</type>"
                      "<allow_insecure>%s</allow_insecure>"
                      "</create_credential>",
                      name,
                      comment ? comment : "",
                      type,
                      allow_insecure);
        }
      else
        {
          // Auto-generate types with username
          CHECK_PARAM_INVALID (login, "Create Credential");

          ret = gmpf (connection, credentials,
                      &response,
                      &entity,
                      response_data,
                      "<create_credential>"
                      "<name>%s</name>"
                      "<comment>%s</comment>"
                      "<type>%s</type>"
                      "<login>%s</login>"
                      "<allow_insecure>%s</allow_insecure>"
                      "</create_credential>",
                      name,
                      comment ? comment : "",
                      type,
                      login,
                      allow_insecure);
        }
    }
  else
    {
      if (type && (strcmp (type, "up") == 0))
        {
          CHECK_PARAM_INVALID (login,
                                "Create Credential");
          CHECK_PARAM_INVALID (password,
                                "Create Credential");

          ret = gmpf (connection, credentials,
                      &response,
                      &entity,
                      response_data,
                      "<create_credential>"
                      "<name>%s</name>"
                      "<comment>%s</comment>"
                      "<type>%s</type>"
                      "<login>%s</login>"
                      "<password>%s</password>"
                      "<allow_insecure>%s</allow_insecure>"
                      "</create_credential>",
                      name,
                      comment ? comment : "",
                      type,
                      login ? login : "",
                      password ? password : "",
                      allow_insecure);
        }
      else if (type && (strcmp (type, "usk") == 0))
        {
          CHECK_PARAM_INVALID (login,
                                "Create Credential");
          CHECK_PARAM_INVALID (passphrase,
                                "Create Credential");
          CHECK_PARAM_INVALID (private_key,
                                "Create Credential");

          ret = gmpf (connection, credentials,
                      &response,
                      &entity,
                      response_data,
                      "<create_credential>"
                      "<name>%s</name>"
                      "<comment>%s</comment>"
                      "<type>%s</type>"
                      "<login>%s</login>"
                      "<key>"
                      "<private>%s</private>"
                      "<phrase>%s</phrase>"
                      "</key>"
                      "<allow_insecure>%s</allow_insecure>"
                      "</create_credential>",
                      name,
                      comment ? comment : "",
                      type,
                      login ? login : "",
                      private_key ? private_key : "",
                      passphrase ? passphrase : "",
                      allow_insecure);
        }
      else if (type && (strcmp (type, "cc") == 0))
        {
          CHECK_PARAM_INVALID (certificate,
                                "Create Credential");
          CHECK_PARAM_INVALID (private_key,
                                "Create Credential");

          ret = gmpf (connection, credentials,
                      &response,
                      &entity,
                      response_data,
                      "<create_credential>"
                      "<name>%s</name>"
                      "<comment>%s</comment>"
                      "<type>%s</type>"
                      "<certificate>%s</certificate>"
                      "<key>"
                      "<private>%s</private>"
                      "</key>"
                      "<allow_insecure>%s</allow_insecure>"
                      "</create_credential>",
                      name,
                      comment ? comment : "",
                      type,
                      certificate ? certificate : "",
                      private_key ? private_key : "",
                      allow_insecure);

        }
      else if (type && (strcmp (type, "snmp") == 0))
        {
          CHECK_PARAM_INVALID (community,
                                "Create Credential");
          CHECK_PARAM_INVALID (login,
                                "Create Credential");
          CHECK_PARAM_INVALID (password,
                                "Create Credential");
          CHECK_PARAM_INVALID (privacy_password,
                                "Create Credential");
          CHECK_PARAM_INVALID (auth_algorithm,
                                "Create Credential");
          CHECK_PARAM_INVALID (privacy_algorithm,
                                "Create Credential");

          if (privacy_password && strcmp (privacy_password, ""))
            ret = gmpf (connection, credentials,
                        &response,
                        &entity,
                        response_data,
                        "<create_credential>"
                        "<name>%s</name>"
                        "<comment>%s</comment>"
                        "<type>%s</type>"
                        "<community>%s</community>"
                        "<login>%s</login>"
                        "<password>%s</password>"
                        "<privacy>"
                        "<password>%s</password>"
                        "<algorithm>%s</algorithm>"
                        "</privacy>"
                        "<auth_algorithm>%s</auth_algorithm>"
                        "<allow_insecure>%s</allow_insecure>"
                        "</create_credential>",
                        name,
                        comment ? comment : "",
                        type,
                        community ? community : "",
                        login ? login : "",
                        password ? password : "",
                        privacy_password ? privacy_password : "",
                        privacy_algorithm ? privacy_algorithm : "",
                        auth_algorithm ? auth_algorithm : "",
                        allow_insecure);
          else
            ret = gmpf (connection, credentials,
                        &response,
                        &entity,
                        response_data,
                        "<create_credential>"
                        "<name>%s</name>"
                        "<comment>%s</comment>"
                        "<type>%s</type>"
                        "<community>%s</community>"
                        "<login>%s</login>"
                        "<password>%s</password>"
                        "<auth_algorithm>%s</auth_algorithm>"
                        "<allow_insecure>%s</allow_insecure>"
                        "</create_credential>",
                        name,
                        comment ? comment : "",
                        type,
                        community ? community : "",
                        login ? login : "",
                        password ? password : "",
                        auth_algorithm ? auth_algorithm : "",
                        allow_insecure);
        }
      else
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new credential. "
                               "The credential could not be created. "
                               "Diagnostics: Unrecognized credential type.",
                               response_data);
        }
    }

  /* Create the credential. */
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new credential. "
                             "It is unclear whether the credential has been created or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new credential. "
                             "It is unclear whether the credential has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new credential. "
                             "It is unclear whether the credential has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "credential_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Credential",
                               response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get one credential, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials        Username and password for authentication.
 * @param[in]   params             Request parameters.
 * @param[in]   commands           Extra commands to run before the others.
 * @param[out]  response_data      Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_credential (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "credential", credentials, params, extra_xml,
                  "targets=\"1\" scanners=\"1\"", response_data);
}

/**
 * @brief Get one credential, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_credential_gmp (gvm_connection_t *connection,
                    credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return get_credential (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Export a Credential in a defined format.
 *
 * @param[in]   connection     Connection to manager.
 * @param[in]   credentials    Username and password for authentication.
 * @param[in]   params         Request parameters.
 * @param[out]  html           Result. Required.
 * @param[out]  login          Login name return.  NULL to skip.  Only set on
 *                             success with credential_id.
 * @param[out]  response_data  Extra data return for the HTTP response.
 *
 * @return 0 success, 1 failure.
 */
int
download_credential_gmp (gvm_connection_t *connection,
                         credentials_t * credentials,
                         params_t *params,
                         char ** html,
                         char ** login,
                         cmd_response_data_t* response_data)
{
  entity_t entity;
  const char *credential_id, *format;

  assert (html);

  /* Send the request. */

  credential_id = params_value (params, "credential_id");
  format = params_value (params, "package_format");

  if ((credential_id == NULL) || (format == NULL))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a credential. "
                            "Diagnostics: Required parameter was NULL.",
                            response_data);
      return 1;
    }

  if (gvm_connection_sendf (connection,
                            "<get_credentials"
                            " credential_id=\"%s\""
                            " format=\"%s\"/>",
                            credential_id,
                            format)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a credential. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      return 1;
    }

  /* Read and handle the response. */

  if (strcmp (format, "rpm") == 0
      || strcmp (format, "deb") == 0
      || strcmp (format, "exe") == 0)
    {
      gchar *package_decoded = NULL;
      entity_t package_entity = NULL, credential_entity;

      /* A base64 encoded package. */

      entity = NULL;
      if (read_entity_c (connection, &entity))
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a credential. "
                                "The credential is not available. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          return 1;
        }

      credential_entity = entity_child (entity, "credential");
      if (credential_entity)
        package_entity = entity_child (credential_entity, "package");
      if (package_entity != NULL)
        {
          gsize len;
          char *package_encoded = entity_text (package_entity);
          if (strlen (package_encoded))
            {
              package_decoded = (gchar *) g_base64_decode (package_encoded,
                                                           &len);
              if (package_decoded == NULL)
                {
                  package_decoded = (gchar *) g_strdup ("");
                  len = 0;
                }
            }
          else
            {
              package_decoded = (gchar *) g_strdup ("");
              len = 0;
            }

          cmd_response_data_set_content_length (response_data, len);

          *html = package_decoded;
          if (login)
            {
              entity_t login_entity;
              login_entity = entity_child (credential_entity, "login");
              if (login_entity)
                *login = g_strdup (entity_text (login_entity));
              else
                *login = NULL;
            }
          free_entity (entity);
          return 0;
        }
      else
        {
          free_entity (entity);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a credential. "
                                "The credential could not be delivered. "
                                "Diagnostics: Failure to receive credential from manager daemon.",
                                response_data);
          return 1;
        }
    }
  else
    {
      entity_t credential_entity, key_entity = NULL;

      /* A key or certificate. */

      entity = NULL;
      if (read_entity_c (connection, &entity))
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a credential. "
                                "The credential could not be delivered. "
                                "Diagnostics: Failure to receive credential from manager daemon.",
                                response_data);
          return 1;
        }

      credential_entity = entity_child (entity, "credential");
      if (credential_entity)
        {
          if (strcmp (format, "pem") == 0)
            key_entity = entity_child (credential_entity, "certificate");
          else
            key_entity = entity_child (credential_entity, "public_key");
        }
      if (key_entity != NULL)
        {
          *html = g_strdup (entity_text (key_entity));
          if (login)
            {
              entity_t login_entity = entity_child (credential_entity, "login");
              if (login_entity)
                *login = g_strdup (entity_text (login_entity));
              else
                *login = NULL;
            }
          free_entity (entity);
          return 0;
        }
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a credential. "
                            "The credential could not be delivered. "
                            "Diagnostics: Failure to parse credential from manager daemon.",
                            response_data);
      free_entity (entity);
      return 1;
    }
}

/**
 * @brief Export a Credential.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Credential XML on success.  Enveloped XML
 *         on error.
 */
char *
export_credential_gmp (gvm_connection_t *connection,
                       credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return export_resource (connection, "credential", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of Credentials.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Credentials XML on success.  Enveloped XML
 *         on error.
 */
char *
export_credentials_gmp (gvm_connection_t *connection,
                        credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return export_many (connection, "credential", credentials, params,
                      response_data);
}

/**
 * @brief Get one or all credentials, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  commands     Extra commands to run before the others when
 *                          credential_id is NULL.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return 0 success, 1 failure.
 */
static char *
get_credentials (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "credential", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get one or all credentials, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return 0 success, 1 failure.
 */
char *
get_credentials_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return get_credentials (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Delete credential, get all credentials, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_credential_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return delete_resource (connection, "credential", credentials, params, 0,
                          "get_credentials", response_data);
}

/**
 * @brief Setup edit_credential XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[in]  extra_xml         Extra XML to insert inside page element.
 * @param[out] response_data     Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
edit_credential (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 const char *extra_xml, cmd_response_data_t* response_data)
{
  return edit_resource (connection, "credential", credentials, params, NULL, extra_xml,
                        response_data);
}

/**
 * @brief Setup edit_credential XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[out] response_data     Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_credential_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return edit_credential (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Save credential, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[out] response_data     Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_credential_gmp (gvm_connection_t *connection, credentials_t * credentials,
                     params_t *params, cmd_response_data_t* response_data)
{
  int ret, change_password, change_passphrase;
  int change_community, change_privacy_password;
  gchar *html, *response;
  const char  *credential_id;
  const char *name, *comment, *login, *password, *passphrase;
  const char *private_key, *certificate, *community, *privacy_password;
  const char *auth_algorithm, *privacy_algorithm, *allow_insecure;
  GString *command;
  entity_t entity;

  credential_id = params_value (params, "credential_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  login = params_value (params, "credential_login");
  password = params_value (params, "password");
  passphrase = params_value (params, "passphrase");
  private_key = params_value (params, "private_key");
  certificate = params_value (params, "certificate");
  community = params_value (params, "community");
  privacy_password = params_value (params, "privacy_password");
  auth_algorithm = params_value (params, "auth_algorithm");
  privacy_algorithm = params_value (params, "privacy_algorithm");
  allow_insecure = params_value (params, "allow_insecure");

  CHECK_PARAM_INVALID (credential_id, "Save Credential");
  CHECK_PARAM_INVALID (name, "Save Credential");
  CHECK_PARAM_INVALID (comment, "Save Credential");
  CHECK_PARAM_INVALID (allow_insecure, "Save Credential");
  if (params_given (params, "certificate"))
    CHECK_PARAM_INVALID (certificate, "Save Credential");
  if (params_given (params, "private_key"))
    CHECK_PARAM_INVALID (private_key, "Save Credential");
  if (params_given (params, "login"))
    CHECK_PARAM_INVALID (login, "Save Credential");
  if (params_given (params, "auth_algorithm"))
    CHECK_PARAM_INVALID (auth_algorithm, "Save Credential");
  if (params_given (params, "privacy_algorithm"))
    CHECK_PARAM_INVALID (privacy_algorithm, "Save Credential");

  if (params_given (params, "change_community"))
    CHECK_PARAM_INVALID (community, "Save Credential");
  if (params_given (params, "change_passphrase"))
    CHECK_PARAM_INVALID (passphrase, "Save Credential");
  if (params_given (params, "change_password"))
    CHECK_PARAM_INVALID (password, "Save Credential");
  if (params_given (params, "change_privacy_password"))
    CHECK_PARAM_INVALID (privacy_password, "Save Credential");

  change_community = params_value_bool (params, "change_community");
  change_passphrase = params_value_bool (params, "change_passphrase");
  change_password = params_value_bool (params, "change_password");
  change_privacy_password =
    params_value_bool (params, "change_privacy_password");

  /* Prepare command */
  command = g_string_new ("");

  xml_string_append (command,
                     "<modify_credential credential_id=\"%s\">"
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<allow_insecure>%s</allow_insecure>",
                     credential_id,
                     name,
                     comment,
                     allow_insecure);

  if (auth_algorithm)
    xml_string_append (command,
                       "<auth_algorithm>%s</auth_algorithm>",
                       auth_algorithm);

  if (certificate && strcmp (certificate, ""))
    xml_string_append (command,
                       "<certificate>%s</certificate>",
                       certificate);

  if (change_community)
    xml_string_append (command,
                       "<community>%s</community>",
                       community);

  if (login && strcmp (login, ""))
    xml_string_append (command,
                       "<login>%s</login>",
                       login);

  if (change_password)
    xml_string_append (command,
                       "<password>%s</password>",
                       password);

  if (privacy_algorithm || change_privacy_password)
    {
      xml_string_append (command,
                         "<privacy>");
      if (privacy_algorithm && strcmp (privacy_algorithm, ""))
        {
          xml_string_append (command,
                             "<algorithm>%s</algorithm>",
                             privacy_algorithm);
          if (change_privacy_password)
            xml_string_append (command,
                               "<password>%s</password>",
                               privacy_password);
        }
      else if (privacy_algorithm)
        {
          xml_string_append (command,
                             "<algorithm></algorithm>");
          xml_string_append (command,
                             "<password></password>");
        }

      xml_string_append (command,
                         "</privacy>");
    }

  if ((private_key && strcmp (private_key, "")) || change_passphrase)
    {
      xml_string_append (command,
                         "<key>");
      if (change_passphrase)
        xml_string_append (command,
                           "<phrase>%s</phrase>",
                           passphrase);
      if (private_key)
        xml_string_append (command,
                           "<private>%s</private>",
                           private_key);
      xml_string_append (command,
                         "</key>");
    }

  xml_string_append (command,
                     "</modify_credential>");

  /* Modify the credential. */
  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             command->str);
  g_string_free (command, TRUE);

  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Credential. "
                             "The Credential was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Credential. "
                             "It is unclear whether the Credential has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Credential. "
                             "It is unclear whether the Credential has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Credential", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Create an agent, get all agents, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials          Username and password for authentication.
 * @param[in]  params               Request parameters.
 * @param[out] response_data        Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_agent_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  entity_t entity;
  gchar *response, *html;
  const char *name, *comment, *installer, *installer_filename, *installer_sig;
  const char *howto_install, *howto_use;
  int installer_size, installer_sig_size, howto_install_size, howto_use_size;
  int ret;
  gchar *name_escaped, *comment_escaped;
  gchar *installer_64, *installer_sig_64, *howto_install_64, *howto_use_64;
  gchar *command;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  installer = params_value (params, "installer");
  installer_filename = params_filename (params, "installer");
  installer_size = params_value_size (params, "installer");
  installer_sig = params_value (params, "installer_sig");
  installer_sig_size = params_value_size (params, "installer_sig");
  howto_install = params_value (params, "howto_install");
  howto_install_size = params_value_size (params, "howto_install");
  howto_use = params_value (params, "howto_use");
  howto_use_size = params_value_size (params, "howto_use");

  CHECK_PARAM_INVALID (name, "Create Agent");
  CHECK_PARAM_INVALID (comment, "Create Agent");

  /* Create the agent. */

  installer_64 = (installer_size > 0)
                 ? g_base64_encode ((guchar *) installer,
                                    installer_size)
                 : g_strdup ("");

  installer_sig_64 = (installer_sig_size > 0)
                     ? g_base64_encode ((guchar *) installer_sig,
                                        installer_sig_size)
                     : g_strdup ("");

  howto_install_64 = (howto_install_size > 0)
                     ? g_base64_encode ((guchar *) howto_install,
                                        howto_install_size)
                     : g_strdup ("");

  howto_use_64 = (howto_use_size > 0)
                 ? g_base64_encode ((guchar *) howto_use,
                                    howto_use_size)
                 : g_strdup ("");

  name_escaped = name ? g_markup_escape_text (name, -1) : NULL;
  comment_escaped = comment ? g_markup_escape_text (comment, -1) : NULL;

  command = g_strdup_printf ("<create_agent>"
                             "<name>%s</name>"
                             "%s%s%s"
                             "<installer>"
                             "%s"
                             "<signature>%s</signature>"
                             "<filename>%s</filename>"
                             "</installer>"
                             "<howto_install>%s</howto_install>"
                             "<howto_use>%s</howto_use>"
                             "</create_agent>",
                             name_escaped,
                             comment_escaped ? "<comment>" : "",
                             comment_escaped ? comment_escaped : "",
                             comment_escaped ? "</comment>" : "",
                             installer_64,
                             installer_sig_64,
                             installer_filename ? installer_filename : "",
                             howto_install_64,
                             howto_use_64);

  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             command);
  g_free (command);

  g_free (installer_64);
  g_free (howto_install_64);
  g_free (howto_use_64);
  g_free (name_escaped);
  g_free (comment_escaped);

  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new agent. "
                            "No new agent was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new agent. "
                            "It is unclear whether the agent has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new agent. "
                            "It is unclear whether the agent has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "agent_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Agent", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete agent, get all agents, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_agent_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return delete_resource (connection, "agent", credentials, params, 0, "get_agents",
                          response_data);
}

/**
 * @brief Get an agent, envelope the result.
 *
 * @param[in]   connection     Connection to manager.
 * @param[in]   credentials    Username and password for authentication.
 * @param[in]   params         Request parameters.
 * @param[out]  html           Result.  Required.
 * @param[out]  filename       Agent filename return.  NULL to skip.  Only set
 *                             on success with agent_id.
 * @param[out]  response_data  Extra data return for the HTTP response.
 *
 * @return 0 success, 1 failure.
 */
int
download_agent_gmp (gvm_connection_t *connection,
                    credentials_t * credentials,
                    params_t *params,
                    char ** html,
                    char ** filename,
                    cmd_response_data_t* response_data)
{
  entity_t entity;
  const char *agent_id, *format;
  gsize result_len = 0;

  agent_id = params_value (params, "agent_id");
  format = params_value (params, "agent_format");

  if ((agent_id == NULL) || (format == NULL))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while downloading "
                            "an agent. "
                            "Diagnostics: Required parameter was NULL.",
                            response_data);
      return 1;
    }


  /* Send the request. */

  if (gvm_connection_sendf (connection,
                            "<get_agents agent_id=\"%s\" format=\"%s\"/>",
                            agent_id,
                            format)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting agent list. "
                            "The current list of agents is not available. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      return 1;
    }

  /* Read and handle the response. */

  if (strcmp (format, "installer") == 0
      || strcmp (format, "howto_install") == 0
      || strcmp (format, "howto_use") == 0)
    {
      gchar *package_decoded = NULL;
      entity_t package_entity = NULL, agent_entity;

      /* A base64 encoded package. */

      entity = NULL;
      if (read_entity_c (connection, &entity))
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a agent. "
                                "The agent is not available. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          return 1;
        }

      agent_entity = entity_child (entity, "agent");
      if (agent_entity)
        package_entity = entity_child (agent_entity, "package");
      if (package_entity != NULL)
        {
          char *package_encoded = entity_text (package_entity);
          if (strlen (package_encoded))
            {
              package_decoded = (gchar *) g_base64_decode (package_encoded,
                                                           &result_len);
              if (package_decoded == NULL)
                {
                  package_decoded = (gchar *) g_strdup ("");
                  result_len = 0;
                }
            }
          else
            {
              package_decoded = (gchar *) g_strdup ("");
              result_len = 0;
            }
          *html = package_decoded;
          if (filename)
            {
              entity_t filename_entity;
              filename_entity = entity_child (package_entity,
                                              "filename");
              if (filename_entity)
                *filename = g_strdup (entity_text (filename_entity));
              else
                *filename = NULL;
              if (!(*filename && strlen (*filename)))
                {
                  g_free(*filename);
                  *filename = g_strdup_printf ("agent-%s-%s", agent_id, format);
                }
            }
          cmd_response_data_set_content_length (response_data, result_len);
          free_entity (entity);
          return 0;
        }
      else
        {
          free_entity (entity);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a agent. "
                                "The agent could not be delivered. "
                                "Diagnostics: Failure to receive agent from manager daemon.",
                                response_data);
          return 1;
        }
    }
  else
    {
      /* An error. */

      entity = NULL;
      if (read_entity_c (connection, &entity))
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a agent. "
                                "The agent could not be delivered. "
                                "Diagnostics: Failure to receive agent from manager daemon.",
                                response_data);
          return 1;
        }

      free_entity (entity);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a agent. "
                            "The agent could not be delivered. "
                            "Diagnostics: Failure to parse agent from manager daemon.",
                            response_data);
      return 1;
    }
}

/**
 * @brief Setup edit_agent XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_agent (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
            const char *extra_xml, cmd_response_data_t* response_data)
{
  return edit_resource (connection, "agent", credentials, params, NULL, extra_xml,
                        response_data);
}

/**
 * @brief Setup edit_agent XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_agent_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return edit_agent (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Modify a agent, get all agents, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_agent_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *agent_id, *name, *comment;
  entity_t entity;

  agent_id = params_value (params, "agent_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");

  CHECK_PARAM_INVALID (agent_id, "Save Agent");
  CHECK_PARAM_INVALID (name, "Save Agent");
  CHECK_PARAM_INVALID (comment, "Save Agent");

  /* Modify the agent. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<modify_agent agent_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "</modify_agent>",
              agent_id,
              name,
              comment);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a agent. "
                             "The agent was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a agent. "
                             "It is unclear whether the agent has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a agent. "
                             "It is unclear whether the agent has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Agent", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get one agent, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_agent (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
            const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "agent", credentials, params, extra_xml, NULL, response_data);
}

/**
 * @brief Get one agent, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_agent_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return get_agent (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all agents, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_agents (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
            const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "agent", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all agents, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials  Username and password for authentication.
 * @param[in]   params       Request parameters.
 * @param[out]  response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_agents_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return get_agents (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Verify agent, get agents, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
verify_agent_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char *agent_id;
  int ret;
  entity_t entity;

  agent_id = params_value (params, "agent_id");
  if (agent_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while verifying an agent. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }
  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<verify_agent agent_id=\"%s\" />",
              agent_id);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a agent. "
                             "The agent was not verified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a agent. "
                             "It is unclear whether the agent was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a agent. "
                             "It is unclear whether the agent was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
    }

  if (gmp_success (entity))
    {
      html = next_page (connection, credentials, params, response,
                        response_data);
      if (html == NULL)
        {
          free_entity (entity);
          g_free (response);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while verifying a agent. "
                               "It is unclear whether the agent was verified or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }
  else
    {
      set_http_status_from_entity (entity, response_data);
      html = get_agents (connection, credentials, params, response, response_data);
    }
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Export a agent.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Agent XML on success.  Enveloped XML on error.
 */
char *
export_agent_gmp (gvm_connection_t *connection,
                  credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return export_resource (connection, "agent", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of agents.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Agents XML on success.  Enveloped XML
 *         on error.
 */
char *
export_agents_gmp (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_many (connection, "agent", credentials, params,
                      response_data);
}

/**
 * @brief Get an aggregate of resources.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return The aggregate.
 */
char *
get_aggregate_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  params_t *data_columns, *text_columns;
  params_t *sort_fields, *sort_stats, *sort_orders;
  params_iterator_t data_columns_iterator, text_columns_iterator;
  params_iterator_t sort_fields_iterator, sort_stats_iterator;
  params_iterator_t sort_orders_iterator;
  char *param_name;
  param_t *param;

  const char *data_column, *group_column, *subgroup_column, *type;
  const char *filter, *filt_id;
  const char *first_group, *max_groups;
  const char *mode;
  gchar *filter_escaped, *command_escaped, *response;
  entity_t entity;
  GString *xml, *command;
  int ret;

  data_columns = params_values (params, "data_columns:");
  data_column = params_value (params, "data_column");
  text_columns = params_values (params, "text_columns:");
  group_column = params_value (params, "group_column");
  subgroup_column = params_value (params, "subgroup_column");
  type = params_value (params, "aggregate_type");
  filter = params_value (params, "filter");
  filt_id = params_value (params, "filt_id");
  sort_fields = params_values (params, "sort_fields:");
  sort_stats = params_values (params, "sort_stats:");
  sort_orders = params_values (params, "sort_orders:");
  first_group = params_value (params, "first_group");
  max_groups = params_value (params, "max_groups");
  mode = params_value (params, "aggregate_mode");
  if (filter && strcmp (filter, ""))
    filter_escaped = g_markup_escape_text (filter, -1);
  else
    {
      if (filt_id == NULL
          || strcmp (filt_id, "") == 0
          || strcmp (filt_id, "0") == 0)
        filter_escaped = g_strdup ("rows=-2");
      else
        filter_escaped = NULL;
    }

  xml = g_string_new ("<get_aggregate>");

  command = g_string_new ("<get_aggregates");
  g_string_append_printf (command, " type=\"%s\"", type);
  if (data_column)
    g_string_append_printf (command, " data_column=\"%s\"", data_column);
  if (group_column)
    g_string_append_printf (command, " group_column=\"%s\"", group_column);
  if (subgroup_column)
    g_string_append_printf (command,
                            " subgroup_column=\"%s\"", subgroup_column);
  if (filter_escaped && strcmp (filter_escaped, ""))
    g_string_append_printf (command, " filter=\"%s\"", filter_escaped);
  if (filt_id && strcmp (filt_id, ""))
    g_string_append_printf (command, " filt_id=\"%s\"", filt_id);
  if (first_group && strcmp (first_group, ""))
    g_string_append_printf (command, " first_group=\"%s\"", first_group);
  if (max_groups && strcmp (max_groups, ""))
    g_string_append_printf (command, " max_groups=\"%s\"", max_groups);
  if (mode && strcmp (mode, ""))
    g_string_append_printf (command, " mode=\"%s\"", mode);
  g_string_append (command, ">");

  if (sort_fields && sort_stats && sort_orders)
    {
      param_t *field_param, *stat_param, *order_param;
      gchar *field_i, *stat_i, *order_i;

      params_iterator_init (&sort_fields_iterator, sort_fields);
      params_iterator_init (&sort_stats_iterator, sort_stats);
      params_iterator_init (&sort_orders_iterator, sort_orders);

      while (params_iterator_next (&sort_fields_iterator,
                                   &field_i, &field_param)
             && params_iterator_next (&sort_stats_iterator,
                                      &stat_i, &stat_param)
             && params_iterator_next (&sort_orders_iterator,
                                      &order_i, &order_param))
        {
          if (field_param->valid && stat_param->valid && order_param->valid)
            {
              xml_string_append (command,
                                 "<sort field=\"%s\""
                                 "      stat=\"%s\""
                                 "      order=\"%s\"/>",
                                 field_param->value ? field_param->value : "",
                                 stat_param->value ? stat_param->value : "",
                                 order_param->value ? order_param->value : "");
            }
        }
    }

  if (data_columns)
    {
      params_iterator_init (&data_columns_iterator, data_columns);
      while (params_iterator_next (&data_columns_iterator, &param_name, &param))
        {
          if (param->valid)
            {
              xml_string_append (command,
                                "<data_column>%s</data_column>",
                                param->value);
            }
        }
    }

  if (text_columns)
    {
      params_iterator_init (&text_columns_iterator, text_columns);
      while (params_iterator_next (&text_columns_iterator, &param_name, &param))
        {
          if (param->valid)
            {
              xml_string_append (command,
                                "<text_column>%s</text_column>",
                                param->value);
            }
        }
    }

  g_string_append (command, "</get_aggregates>");

  g_free (filter_escaped);

  command_escaped = g_markup_escape_text (command->str, -1);
  g_string_append (xml, command_escaped);
  g_free (command_escaped);

  response = NULL;
  ret = gmp (connection, credentials, &response, &entity, response_data,
             command->str);
  g_string_free (command, TRUE);

  if (ret)
    {
      free_entity (entity);
      g_string_free (xml, TRUE);
    }

  switch (ret)
    {
      case 0:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting aggregates. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting aggregates. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting aggregates. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (gmp_success (entity) == 0)
    set_http_status_from_entity (entity, response_data);
  g_string_append (xml, response);

  g_string_append (xml, "</get_aggregate>");

  free_entity (entity);
  g_free (response);
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Returns page to create a new alert.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
new_alert (gvm_connection_t *connection, credentials_t *credentials, params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  GString *xml;
  int ret;
  entity_t entity;
  gchar *response;

  xml = g_string_new ("<new_alert>");
  if (extra_xml)
    g_string_append (xml, extra_xml);

  /* Get Report Formats. */

  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials, &response, &entity, response_data,
             "<get_report_formats filter=\"rows=-1\"/>");
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for new alert. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for new alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for new alert. It is unclear whether"
                             " the alert has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }
  g_string_append (xml, response);
  g_free (response);
  free_entity (entity);

  /* Get Report Filters. */

  ret = gmp (connection, credentials, &response, &entity, response_data,
             "<get_filters filter=\"rows=-1\"/>");

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Filters for new alert. "
                             "The task was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Filters for new alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Filters for new alert. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }
  g_string_append (xml, response);
  g_free (response);
  free_entity (entity);

  /* Get Tasks. */

  ret = gmp (connection, credentials, &response, &entity, response_data,
             "<get_tasks"
             " schedules_only=\"1\""
             " filter=\"owner=any permission=start_task rows=-1\"/>");

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Tasks"
                             " for new alert. "
                             "The task was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Tasks"
                             " for new alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Tasks"
                             " for new alert. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }
  g_string_append (xml, response);
  g_free (response);
  free_entity (entity);

  /* Get Credentials. */

  ret = gmp (connection, credentials, &response, &entity, response_data,
             "<get_credentials"
             " filter=\"type=up owner=any permission=any rows=-1\"/>");

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting"
                             " Credentials for new alert. "
                             "The task was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting"
                             " Credentials for new alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting"
                             " Credentials for new alert. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  g_string_append (xml, response);
  g_free (response);
  free_entity (entity);

  g_string_append (xml, "</new_alert>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Returns page to create a new alert.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
new_alert_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return new_alert (connection, credentials, params, NULL, response_data);
}

char *
get_alerts (gvm_connection_t *connection, credentials_t *, params_t *, const char *, cmd_response_data_t*);

/**
 * @brief Send event data for an alert.
 *
 * @param[in]   xml     XML.
 * @param[out]  data    Data.
 * @param[out]  event   Event.
 *
 * @return 0 on success, -1 on error.
 */
static void
append_alert_event_data (GString *xml, params_t *data, const char *event)
{
  if (data)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, data);
      while (params_iterator_next (&iter, &name, &param))
        if ((strcmp (event, "Task run status changed") == 0
             && strcmp (name, "status") == 0)
            || ((strcmp (event, "New SecInfo arrived") == 0
                 || strcmp (event, "Updated SecInfo arrived") == 0)
                && strcmp (name, "secinfo_type") == 0))
          xml_string_append (xml,
                             "<data><name>%s</name>%s</data>",
                             name,
                             param->value ? param->value : "");
    }
}

/**
 * @brief Send condition data for an alert.
 *
 * @param[in]   xml        XML.
 * @param[out]  data       Data.
 * @param[out]  condition  Condition.
 */
static void
append_alert_condition_data (GString *xml, params_t *data,
                             const char * condition)
{
  if (data)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, data);
      while (params_iterator_next (&iter, &name, &param))
        {
          if (strcmp (condition, "Filter count at least") == 0)
            {
              if (strcmp (name, "at_least_count") == 0)
                xml_string_append (xml,
                                   "<data><name>count</name>%s</data>",
                                   param->value ? param->value : "");
              if (strcmp (name, "at_least_filter_id") == 0)
                xml_string_append (xml,
                                   "<data><name>filter_id</name>%s</data>",
                                   param->value ? param->value : "");
            }
          else if (strcmp (condition, "Filter count changed") == 0)
            {
              if (strcmp (name, "count") == 0
                  || strcmp (name, "filter_id") == 0)
                xml_string_append (xml,
                                   "<data><name>%s</name>%s</data>",
                                   name,
                                   param->value ? param->value : "");
              else if (strcmp (name, "filter_direction") == 0)
                xml_string_append (xml,
                                   "<data><name>direction</name>%s</data>",
                                   param->value ? param->value : "");
            }
          else if ((strcmp (condition, "Severity at least") == 0
                    && strcmp (name, "severity") == 0)
                   || (strcmp (condition, "Severity changed") == 0
                       && strcmp (name, "direction") == 0))
            xml_string_append (xml,
                               "<data><name>%s</name>%s</data>",
                               name,
                               param->value ? param->value : "");
        }
    }
}

/**
 * @brief Send method data for an alert.
 *
 * @param[in]   xml      XML.
 * @param[out]  data     Data.
 * @param[out]  method   Method.
 */
static void
append_alert_method_data (GString *xml, params_t *data, const char *method)
{
  params_iterator_t iter;
  char *name;
  param_t *param;
  int notice;

  if (data == NULL)
    return;

  params_iterator_init (&iter, data);
  /* Used to check email notice type before sending report formats values */
  notice = 1;
  while (params_iterator_next (&iter, &name, &param))
    if (strcmp (name, "notice") == 0)
      {
        notice = atoi (param->value);
        break;
      }

  if (strcmp (method, "Sourcefire Connector"))
    {
      params_iterator_init (&iter, data);

      while (params_iterator_next (&iter, &name, &param))
        if ((strcmp (method, "HTTP Get") == 0
             && strcmp (name, "URL") == 0)
            || (strcmp (method, "Send") == 0
                && (strcmp (name, "send_host") == 0
                    || strcmp (name, "send_port") == 0
                    || strcmp (name, "send_report_format") == 0))
            || (strcmp (method, "SCP") == 0
                && (strcmp (name, "scp_credential") == 0
                    || strcmp (name, "scp_host") == 0
                    || strcmp (name, "scp_known_hosts") == 0
                    || strcmp (name, "scp_path") == 0
                    || strcmp (name, "scp_report_format") == 0))
            || (strcmp (method, "SMB") == 0
                && (strcmp (name, "smb_credential") == 0
                    || strcmp (name, "smb_file_path") == 0
                    || strcmp (name, "smb_report_format") == 0
                    || strcmp (name, "smb_share_path") == 0))
            || (strcmp (method, "SNMP") == 0
                && (strcmp (name, "snmp_community") == 0
                    || strcmp (name, "snmp_agent") == 0
                    || strcmp (name, "snmp_message") == 0))
            || (strcmp (method, "TippingPoint SMS") == 0
                && (strcmp (name, "tp_sms_credential") == 0
                    || strcmp (name, "tp_sms_hostname") == 0
                    || strcmp (name, "tp_sms_tls_certificate") == 0
                    || strcmp (name, "tp_sms_tls_workaround") == 0))
            || (strcmp (method, "verinice Connector") == 0
                && (strcmp (name, "verinice_server_credential") == 0
                    || strcmp (name, "verinice_server_url") == 0
                    || strcmp (name, "verinice_server_report_format") == 0))
            || (strcmp (method, "Email") == 0
                && (strcmp (name, "to_address") == 0
                    || strcmp (name, "from_address") == 0
                    || strcmp (name, "subject") == 0
                    || strcmp (name, "notice") == 0
                    || (strcmp (name, "notice_report_format") == 0
                        && notice == 0)
                    || (strcmp (name, "notice_attach_format") == 0
                        && notice == 2)))
            || (strcmp (method, "Syslog") == 0
                && strcmp (name, "submethod") == 0)
            || (strcmp (method, "Start Task") == 0
                && strcmp (name, "start_task_task") == 0)
            || strcmp (name, "details_url") == 0
            || strcmp (name, "delta_type") == 0
            || strcmp (name, "delta_report_id") == 0)
          xml_string_append (xml,
                             "<data><name>%s</name>%s</data>",
                             name,
                             param->value ? param->value : "");
        else if (strcmp (method, "Email") == 0
                 && notice == 0
                 && strcmp (name, "message") == 0)
          xml_string_append (xml,
                             "<data><name>message</name>%s</data>",
                             param->value ? param->value : "");
        else if (strcmp (method, "Email") == 0
                 && notice == 2
                 && strcmp (name, "message_attach") == 0)
          xml_string_append (xml,
                             "<data><name>message</name>%s</data>",
                             param->value ? param->value : "");

      return;
    }

  params_iterator_init (&iter, data);
  while (params_iterator_next (&iter, &name, &param))
    if (strcmp (name, "pkcs12"))
      {
        if (strcmp (name, "defense_center_ip") == 0
            || strcmp (name, "defense_center_port") == 0)
          xml_string_append (xml,
                             "<data><name>%s</name>%s</data>",
                             name,
                             param->value ? param->value : "");
      }
    else
      {
        gchar *base64;

        /* Special case the pkcs12 file, which is binary. */

        base64 = (param->value && param->value_size)
                  ? g_base64_encode ((guchar*) param->value,
                                     param->value_size)
                  : g_strdup ("");
        xml_string_append (xml,
                           "<data><name>%s</name>%s</data>",
                           name,
                           base64);
        g_free (base64);
      }
}

/**
 * @brief Create an alert, get all alerts, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_alert_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *active, *condition, *event, *method, *filter_id;
  params_t *method_data, *event_data, *condition_data;
  entity_t entity;
  GString *xml;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  active = params_value (params, "active");
  condition = params_value (params, "condition");
  event = params_value (params, "event");
  method = params_value (params, "method");
  filter_id = params_value (params, "filter_id");

  CHECK_PARAM_INVALID (name, "Create Alert");
  CHECK_PARAM_INVALID (active, "Create Alert");
  CHECK_PARAM_INVALID (comment, "Create Alert");
  CHECK_PARAM_INVALID (condition, "Create Alert");
  CHECK_PARAM_INVALID (event, "Create Alert");
  CHECK_PARAM_INVALID (method, "Create Alert");
  CHECK_PARAM_INVALID (filter_id, "Create Alert");

  /* Create the alert. */

  method_data = params_values (params, "method_data:");
  event_data = params_values (params, "event_data:");
  condition_data = params_values (params, "condition_data:");

  xml = g_string_new ("");

  if ((strcmp (event, "New SecInfo arrived") == 0) && event_data)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, event_data);
      while (params_iterator_next (&iter, &name, &param))
        if ((strcmp (name, "feed_event") == 0)
            && param->value
            && (strcmp (param->value, "updated") == 0))
          {
            event = "Updated SecInfo arrived";
            break;
          }
    }

  xml_string_append (xml,
                     "<create_alert>"
                     "<name>%s</name>"
                     "<filter id=\"%s\"/>"
                     "<active>%s</active>"
                     "<comment>%s</comment>"
                     "<event>%s",
                     name,
                     filter_id,
                     active,
                     comment ? comment : "",
                     event);

  append_alert_event_data (xml, event_data, event);

  xml_string_append (xml,
                     "</event>"
                     "<method>%s",
                     method);

  append_alert_method_data (xml, method_data, method);

  xml_string_append (xml,
                     "</method>"
                     "<condition>%s",
                     condition);

  append_alert_condition_data (xml, condition_data, condition);

  xml_string_append (xml,
                     "</condition>"
                     "</create_alert>");

  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "No new alert was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "alert_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Alert", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete an alert, get all alerts, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_alert_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return delete_resource (connection, "alert", credentials, params, 0, "get_alerts",
                          response_data);
}

/**
 * @brief Get one alert, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_alert (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
           const char *extra_xml, cmd_response_data_t* response_data)
{
  gchar *html;
  GString *extra;

  extra = g_string_new ("");
  if (extra_xml)
    g_string_append (extra, extra_xml);
  if (command_enabled (credentials, "GET_REPORT_FORMATS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_report_formats"
                   " filter=\"rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Report "
                                 "Formats for the alert. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Report "
                                 "Formats for the alert. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Report "
                                 "Formats for the alert. "
                                 "It is unclear whether the task has been saved or not. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_TASKS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_tasks"
                   " schedules_only=\"1\""
                   " filter=\"owner=any permission=start_task rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Tasks "
                                 "for the alert. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Tasks "
                                 "for the alert. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Tasks "
                                 "for the alert. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_FILTERS"))
    {
      gchar *response;
      entity_t entity;

      /* Get result filters for condition link. */

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_filters"
                   " filter=\"type=result rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting filters "
                                 "for the alert. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting filters "
                                 "for the alert. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting filters "
                                 "for the alert. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  html = get_one (connection, "alert", credentials, params, extra->str, "tasks=\"1\"",
                  response_data);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get one alert, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_alert_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return get_alert (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all alerts, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_alerts (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
            const char *extra_xml, cmd_response_data_t* response_data)
{
  gchar *html;
  GString *extra;

  extra = g_string_new ("");
  if (command_enabled (credentials, "GET_TASKS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_tasks"
                   " schedules_only=\"1\""
                   " filter=\"owner=any permission=start_task rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the tasks. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the tasks. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the reports. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }


  if (command_enabled (credentials, "GET_FILTERS"))
    {
      gchar *response;
      entity_t entity;

      /* Get result filters for condition link. */

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_filters"
                   " filter=\"type=result rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting filters "
                                 "for the alerts. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting filters "
                                 "for the alerts. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting filters "
                                 "for the alerts. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = get_many (connection, "alert", credentials, params, extra->str, NULL,
                   response_data);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get all alerts, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_alerts_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return get_alerts (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Setup edit_alert XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_alert (gvm_connection_t *connection, credentials_t * credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t* response_data)
{
  GString *xml;
  gchar *edit;
  const char *alert_id, *next, *filter;

  alert_id = params_value (params, "alert_id");
  next = params_value (params, "next");
  filter = params_value (params, "filter");

  if (alert_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing an alert. "
                           "The alert remains as it was. "
                           "Diagnostics: Required parameter alert_id was NULL.",
                           response_data);
    }

  if (next == NULL)
    next = "get_alerts";

  if (gvm_connection_sendf (connection,
                            "<get_alerts"
                            " alert_id=\"%s\""
                            " details=\"1\"/>",
                            alert_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting alert info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("<edit_alert>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  edit = g_markup_printf_escaped ("<alert id=\"%s\"/>"
                                  /* Page that follows. */
                                  "<next>%s</next>"
                                  /* Passthroughs. */
                                  "<filters><term>%s</term></filters>",
                                  alert_id,
                                  next,
                                  filter);
  g_string_append (xml, edit);
  g_free (edit);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting alert info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (command_enabled (credentials, "GET_REPORT_FORMATS"))
    {
      /* Get the report formats. */

      if (gvm_connection_sendf (connection,
                                "<get_report_formats"
                                " filter=\"rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting report formats. "
                               "The current list of report formats is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting report formats. "
                               "The current list of report formats is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_FILTERS"))
    {
      /* Get filters. */

      if (gvm_connection_sendf (connection,
                                "<get_filters filter=\"rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of filters. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of filters. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_TASKS"))
    {
      /* Get tasks. */

      if (gvm_connection_sendf (connection,
                                "<get_tasks"
                                " schedules_only=\"1\""
                                " filter=\"owner=any permission=start_task"
                                "          rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of tasks. "
                               "The current list of tasks is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of tasks. "
                               "The current list of tasks is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  /* Get Credentials. */

  if (command_enabled (credentials, "GET_CREDENTIALS"))
    {
      if (gvm_connection_sendf (connection,
                                "<get_credentials"
                                " filter=\"type=up owner=any permission=any"
                                "          rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of credentials. "
                               "The current list of tasks is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of credentials. "
                               "The current list of tasks is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_alert>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Setup edit_alert XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_alert_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  return edit_alert (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Modify an alert, get all alerts, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_alert_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  GString *xml;
  int ret;
  gchar *html, *response;
  const char  *name, *comment, *alert_id;
  const char *event, *condition, *method;
  const char *filter_id, *active;
  params_t *event_data, *condition_data, *method_data;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  condition = params_value (params, "condition");
  event = params_value (params, "event");
  method = params_value (params, "method");
  alert_id = params_value (params, "alert_id");
  filter_id = params_value (params, "filter_id");
  active = params_value (params, "active");

  CHECK_PARAM_INVALID (name, "Save Alert");
  CHECK_PARAM_INVALID (comment, "Save Alert");
  CHECK_PARAM_INVALID (alert_id, "Save Alert");
  CHECK_PARAM_INVALID (condition, "Save Alert");
  CHECK_PARAM_INVALID (event, "Save Alert");
  CHECK_PARAM_INVALID (method, "Save Alert");
  CHECK_PARAM_INVALID (filter_id, "Save Alert");
  CHECK_PARAM_INVALID (active, "Save Alert");

  xml = g_string_new ("");

  /* Modify the alert. */

  event_data = params_values (params, "event_data:");
  condition_data = params_values (params, "condition_data:");
  method_data = params_values (params, "method_data:");

  if ((strcmp (event, "New SecInfo arrived") == 0) && event_data)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, event_data);
      while (params_iterator_next (&iter, &name, &param))
        if ((strcmp (name, "feed_event") == 0)
            && param->value
            && (strcmp (param->value, "updated") == 0))
          {
            event = "Updated SecInfo arrived";
            break;
          }
    }

  xml_string_append (xml,
                     "<modify_alert alert_id=\"%s\">"
                     "<name>%s</name>"
                     "<filter id=\"%s\"/>"
                     "<active>%s</active>"
                     "<comment>%s</comment>"
                     "<event>%s",
                     alert_id,
                     name,
                     filter_id,
                     active,
                     comment ? comment : "",
                     event);

  append_alert_event_data (xml, event_data, event);

  xml_string_append (xml,
                     "</event>"
                     "<method>%s",
                     method);

  append_alert_method_data (xml, method_data, method);

  xml_string_append (xml,
                     "</method>"
                     "<condition>%s",
                     condition);

  append_alert_condition_data (xml, condition_data, condition);

  xml_string_append (xml,
                     "</condition>"
                     "</modify_alert>");

  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while saving a new alert. "
                            "No new alert was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while saving a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while saving a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                              "Save Alert", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Test an alert, get all alerts envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
test_alert_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char  *alert_id;
  entity_t entity;
  entity_t status_details_entity;

  alert_id = params_value (params, "alert_id");

  if (alert_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         GSAD_STATUS_INVALID_REQUEST);
      return gsad_message (credentials,
                           "Invalid request", __FUNCTION__, __LINE__,
                           "Missing parameter alert_id."
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  /* Test the alert. */

  if (gvm_connection_sendf (connection,
                            "<test_alert alert_id=\"%s\"/>",
                            alert_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an alert. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an alert. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }


  status_details_entity = entity_child (entity, "status_details");

  html = action_result (connection, credentials, params, response_data,
                        "Test Alert", entity_attribute (entity, "status"),
                        entity_attribute (entity, "status_text"),
                        entity_text(status_details_entity),
                        entity_attribute (entity, "id"));

  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Export an alert.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Alert XML on success.  Enveloped XML on error.
 */
char *
export_alert_gmp (gvm_connection_t *connection,
                  credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return export_resource (connection, "alert", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of alerts.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Alerts XML on success.  Enveloped XML
 *         on error.
 */
char *
export_alerts_gmp (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_many (connection, "alert", credentials, params,
                      response_data);
}

/**
 * @brief Create a target, get all targets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_target_gmp (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response, *command;
  const char  *name, *hosts, *exclude_hosts, *comment;
  const char *target_ssh_credential, *port, *target_smb_credential;
  const char *target_esxi_credential, *target_snmp_credential, *target_source;
  const char *target_exclude_source;
  const char *port_list_id, *reverse_lookup_only, *reverse_lookup_unify;
  const char *alive_tests, *hosts_filter, *file, *exclude_file;
  gchar *ssh_credentials_element, *smb_credentials_element;
  gchar *esxi_credentials_element, *snmp_credentials_element;
  gchar *asset_hosts_element;
  gchar* comment_element = NULL;
  entity_t entity;
  GString *xml;

  name = params_value (params, "name");
  hosts = params_value (params, "hosts");
  exclude_hosts = params_value (params, "exclude_hosts");
  reverse_lookup_only = params_value (params, "reverse_lookup_only");
  reverse_lookup_unify = params_value (params, "reverse_lookup_unify");
  target_source = params_value (params, "target_source");
  target_exclude_source = params_value (params, "target_exclude_source");
  comment = params_value (params, "comment");
  port_list_id = params_value (params, "port_list_id");
  target_ssh_credential = params_value (params, "ssh_credential_id");
  port = params_value (params, "port");
  target_smb_credential = params_value (params, "smb_credential_id");
  target_esxi_credential = params_value (params, "esxi_credential_id");
  target_snmp_credential = params_value (params, "snmp_credential_id");
  alive_tests = params_value (params, "alive_tests");
  hosts_filter = params_value (params, "hosts_filter");
  file = params_value (params, "file");
  exclude_file = params_value (params, "exclude_file");

  CHECK_PARAM_INVALID (name, "Create Target");
  CHECK_PARAM_INVALID (target_source, "Create Target")
  if (strcmp (target_source, "manual") == 0)
    CHECK_PARAM_INVALID (hosts, "Create Target");
  if (strcmp (target_source, "file") == 0 && file == NULL)
    return message_invalid (connection, credentials, params, response_data,
                            "Missing hosts file",
                            G_STRINGIFY (MHD_HTTP_BAD_REQUEST),
                            "Create Target");
  /* require hosts_filter if target_source is "asset_hosts" */
  if (strcmp (target_source, "asset_hosts") == 0)
    CHECK_PARAM_INVALID (hosts_filter, "Create Target");

  if (params_given (params, "target_exclude_source"))
    {
      CHECK_PARAM_INVALID (target_exclude_source, "Create Target")
      if (strcmp (target_exclude_source, "manual") == 0
          /* In case browser doesn't send empty field. */
          && params_given (params, "exclude_hosts"))
        CHECK_PARAM_INVALID (exclude_hosts, "Create Target");
      if (strcmp (target_exclude_source, "file") == 0 && exclude_file == NULL)
        return message_invalid (connection, credentials, params, response_data,
                                "Missing exclude hosts file",
                                G_STRINGIFY (MHD_HTTP_BAD_REQUEST),
                                "Create Target");
    }

  CHECK_PARAM_INVALID (comment, "Create Target");
  CHECK_PARAM_INVALID (port_list_id, "Create Target");
  CHECK_PARAM_INVALID (target_ssh_credential, "Create Target");
  if (strcmp (target_ssh_credential, "--"))
    CHECK_PARAM_INVALID (port, "Create Target");
  CHECK_PARAM_INVALID (target_smb_credential, "Create Target");
  CHECK_PARAM_INVALID (target_esxi_credential, "Create Target");
  CHECK_PARAM_INVALID (target_snmp_credential, "Create Target");
  CHECK_PARAM_INVALID (alive_tests, "Create Target");

  if (comment != NULL)
    comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
  else
    comment_element = g_strdup ("");

  if (strcmp (target_ssh_credential, "0") == 0)
    ssh_credentials_element = g_strdup ("");
  else
    ssh_credentials_element =
      g_strdup_printf ("<ssh_credential id=\"%s\">"
                       "<port>%s</port>"
                       "</ssh_credential>",
                       target_ssh_credential,
                       port);

  if (strcmp (target_smb_credential, "0") == 0)
    smb_credentials_element = g_strdup ("");
  else
    smb_credentials_element =
      g_strdup_printf ("<smb_credential id=\"%s\"/>",
                       target_smb_credential);

  if (strcmp (target_esxi_credential, "0") == 0)
    esxi_credentials_element = g_strdup ("");
  else
    esxi_credentials_element =
      g_strdup_printf ("<esxi_credential id=\"%s\"/>",
                       target_esxi_credential);

  if (strcmp (target_snmp_credential, "0") == 0)
    snmp_credentials_element = g_strdup ("");
  else
    snmp_credentials_element =
      g_strdup_printf ("<snmp_credential id=\"%s\"/>",
                       target_snmp_credential);

  if (strcmp (target_source, "asset_hosts") == 0)
    asset_hosts_element = g_strdup_printf ("<asset_hosts filter=\"%s\"/>",
                                           hosts_filter);
  else
    asset_hosts_element = g_strdup ("");

  /* Create the target. */

  xml = g_string_new ("");

  xml_string_append (xml,
                     "<name>%s</name>"
                     "<hosts>%s</hosts>"
                     "<exclude_hosts>%s</exclude_hosts>"
                     "<reverse_lookup_only>%s</reverse_lookup_only>"
                     "<reverse_lookup_unify>%s</reverse_lookup_unify>"
                     "<port_list id=\"%s\"/>"
                     "<alive_tests>%s</alive_tests>",
                     name,
                     strcmp (target_source, "file") == 0 ? file : hosts,
                     target_exclude_source
                      ? (strcmp (target_exclude_source, "file") == 0
                          ? exclude_file
                          : (exclude_hosts ? exclude_hosts : ""))
                      : "",
                     reverse_lookup_only ? reverse_lookup_only : "0",
                     reverse_lookup_unify ? reverse_lookup_unify : "0",
                     port_list_id,
                     alive_tests);

  command = g_strdup_printf ("<create_target>"
                             "%s%s%s%s%s%s%s"
                             "</create_target>",
                             xml->str,
                             comment_element,
                             ssh_credentials_element,
                             smb_credentials_element,
                             esxi_credentials_element,
                             snmp_credentials_element,
                             asset_hosts_element);

  g_string_free (xml, TRUE);
  g_free (comment_element);
  g_free (ssh_credentials_element);
  g_free (smb_credentials_element);
  g_free (esxi_credentials_element);

  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             command);
  g_free (command);
  switch (ret)
    {
      case 0:
        break;
      case -1:
        /* 'gmp' set response. */
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new target. "
                            "No new target was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new target. "
                            "It is unclear whether the target has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new target. "
                            "It is unclear whether the target has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "target_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                              "Create Target", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Check a param.
 *
 * @param[in]  name  Param name.
 */
#define CHECK(name)                                                                 \
  if (name == NULL)                                                                 \
    {                                                                               \
      cmd_response_data_set_status_code (response_data,                             \
                                         MHD_HTTP_BAD_REQUEST);                     \
      return gsad_message (credentials,                                             \
                           "Internal error", __FUNCTION__, __LINE__,                \
                           "An internal error occurred while cloning a resource. "  \
                           "The resource was not cloned. "                          \
                           "Diagnostics: Required parameter '" G_STRINGIFY (name)   \
                           "' was NULL.",                                           \
                           response_data);                    \
    }

/**
 * @brief Clone a resource, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
clone_gmp (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char *id, *type, *alterable,  *next_id;
  gchar *next_id_name, *cap_type, *prev_action;
  entity_t entity;

  id = params_value (params, "id");
  type = params_value (params, "resource_type");
  alterable = params_value (params, "alterable");

  CHECK (id);
  CHECK (type);

  /* Clone the resource. */

  if (alterable && strcmp (alterable, "0"))
    {
      if (gvm_connection_sendf (connection,
                                "<create_%s>"
                                "<copy>%s</copy>"
                                "<alterable>1</alterable>"
                                "</create_%s>",
                                type,
                                id,
                                type)
          == -1)
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while cloning a resource. "
                               "The resource was not cloned. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
    }
  else if (gvm_connection_sendf (connection,
                                 "<create_%s>"
                                 "<copy>%s</copy>"
                                 "</create_%s>",
                                 type,
                                 id,
                                 type)
           == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while cloning a resource. "
                           "The resource was not cloned. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while cloning a resource. "
                           "It is unclear whether the resource has been cloned or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return next page. */

  if (gmp_success (entity) == 0 || params_given (params, "next") == 0)
    {
      gchar *next;
      next = g_strdup_printf ("get_%ss", type);
      params_add (params, "next", next);
      g_free (next);
    }

  if (gmp_success (entity))
    {
      next_id = entity_attribute (entity, "id");
      if (next_id == NULL)
        {
          free_entity (entity);
          g_free (response);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while cloning a resource. "
                              "The resource remains the same. "
                              "Diagnostics: Error getting new resource.",
                              response_data);
        }
      next_id_name = g_strdup_printf ("%s_id", type);
      params_add (params, next_id_name, next_id);
      g_free (next_id_name);
    }
  else
    {
      set_http_status_from_entity (entity, response_data);
      next_id_name = NULL;
      next_id = NULL;
    }

  cap_type = capitalize (type);
  prev_action = g_strdup_printf ("Clone %s", cap_type);
  html = response_from_entity (connection, credentials, params, entity,
                              prev_action, response_data);

  free_entity (entity);
  g_free (cap_type);
  g_free (prev_action);
  g_free (response);

  return html;
}

#undef CHECK

/**
 * @brief Delete a target, get all targets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_target_gmp (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return delete_resource (connection, "target", credentials, params, 0,
                          "get_targets", response_data);
}

/**
 * @brief Delete a trash agent, get all agents, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_agent_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return delete_resource (connection, "agent", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a trash config, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_config_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                         cmd_response_data_t* response_data)
{
  return delete_resource (connection, "config", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a trash alert, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_alert_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return delete_resource (connection, "alert", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a trash credential, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_credential_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                             cmd_response_data_t* response_data)
{
  return delete_resource (connection, "credential", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a trash report format, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_report_format_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                                cmd_response_data_t* response_data)
{
  return delete_resource (connection, "report_format", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a trash schedule, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_schedule_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                           cmd_response_data_t* response_data)
{
  return delete_resource (connection, "schedule", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a trash target, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_target_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                         cmd_response_data_t* response_data)
{
  return delete_resource (connection, "target", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a trash task, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_task_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return delete_resource (connection, "task", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Restore a resource, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
restore_gmp (gvm_connection_t *connection, credentials_t * credentials,
             params_t *params, cmd_response_data_t* response_data)
{
  GString *xml;
  gchar *ret;
  entity_t entity;
  const char *target_id;

  target_id = params_value (params, "target_id");

  if (target_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while restoring a resource. "
                           "The resource was not restored. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  xml = g_string_new ("");

  /* Restore the resource. */

  if (gvm_connection_sendf (connection,
                            "<restore"
                            " id=\"%s\"/>",
                            target_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while restoring a resource. "
                           "The resource was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_entity_and_string_c (connection, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while restoring a resource. "
                           "It is unclear whether the resource has been restored or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return trash page. */

  ret = response_from_entity (connection, credentials, params, entity,
                             "Restore", response_data);
  free_entity (entity);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Empty the trashcan, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
empty_trashcan_gmp (gvm_connection_t *connection, credentials_t *
                    credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  GString *xml;
  gchar *ret;
  entity_t entity;

  xml = g_string_new ("");

  /* Empty the trash. */

  if (gvm_connection_sendf (connection,
                            "<empty_trashcan/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while emptying the trashcan. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_entity_and_string_c (connection, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while emptying the trashcan. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return trash page. */

  ret = response_from_entity (connection, credentials, params, entity,
                              "Empty Trashcan", response_data);
  free_entity (entity);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Create a tag, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_tag_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  char *ret;
  gchar *response;
  const char *name, *comment, *filter, *value, *resource_type, *active;
  params_t *resource_ids;
  GString *command;
  entity_t entity;

  name = params_value (params, "tag_name");
  comment = params_value (params, "comment");
  filter = params_value (params, "filter");
  value = params_value (params, "tag_value");
  resource_type = params_value (params, "resource_type");
  resource_ids = params_values (params, "resource_ids:");
  active = params_value (params, "active");

  CHECK_PARAM_INVALID (name, "Create Tags")
  CHECK_PARAM_INVALID (comment, "Create Tags")
  if (params_given (params, "filter"))
    CHECK_PARAM_INVALID (filter, "Create Tags")
  CHECK_PARAM_INVALID (value, "Create Tags")
  CHECK_PARAM_INVALID (resource_type, "Create Tags")
  CHECK_PARAM_INVALID (active, "Create Tags")

  command = g_string_new ("");

  xml_string_append (command,
                     "<create_tag>"
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<value>%s</value>"
                     "<active>%s</active>"
                     "<resources filter=\"%s\">"
                     "<type>%s</type>",
                     name,
                     comment,
                     value,
                     active,
                     filter ? filter : "",
                     resource_type);

  if (resource_ids)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, resource_ids);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "0"))
          g_string_append_printf (command,
                                  "<resource id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  xml_string_append (command,
                     "</resources>"
                     "</create_tag>");

  response = NULL;
  entity = NULL;
  switch (gmp (connection, credentials,
               &response,
               &entity,
               response_data,
               command->str))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (command, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new tag. "
                             "No new tag was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (command, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new tag. "
                             "It is unclear whether the tag has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (command, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new tag. "
                             "It is unclear whether the tag has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  g_string_free (command, TRUE);
  ret = response_from_entity (connection, credentials, params, entity,
                              "Create Tag", response_data);

  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete note, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_tag_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return delete_resource (connection, "tag", credentials, params, 0, NULL, response_data);
}

/**
 * @brief Delete a note, get all notes, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_tag_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  return delete_resource (connection, "tag", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Setup edit_tag XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_tag (gvm_connection_t *connection, credentials_t * credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t* response_data)
{
  GString *xml;
  gchar *edit;
  const char *tag_id;

  tag_id = params_value (params, "tag_id");
  if (tag_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a tag. "
                           "The tag remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  if (gvm_connection_sendf (connection,
                            "<get_tags"
                            " tag_id=\"%s\""
                            "/>",
                            tag_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("");

  edit = g_markup_printf_escaped ("<edit_tag>"
                                  "<tag id=\"%s\"/>",
                                  tag_id);

  g_string_append (xml, edit);
  g_free (edit);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting target info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_tag>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Setup edit_tag XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_tag_gmp (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  return edit_tag (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Modify a tag, get all tags, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_tag_gmp (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  gchar *response;
  const char *name, *comment, *filter, *value, *resource_type, *active;
  const char *resources_action;
  params_t *resource_ids;
  const char *tag_id;
  GString *command;
  entity_t entity;
  char* ret;

  tag_id = params_value (params, "tag_id");
  name = params_value (params, "tag_name");
  comment = params_value (params, "comment");
  filter = params_value (params, "filter");
  value = params_value (params, "tag_value");
  resource_type = params_value (params, "resource_type");
  resource_ids = params_values (params, "resource_ids:");
  resources_action = params_value (params, "resources_action");
  active = params_value (params, "active");

  CHECK_PARAM_INVALID (tag_id, "Save Tag")
  CHECK_PARAM_INVALID (name, "Save Tag")
  CHECK_PARAM_INVALID (comment, "Save Tag")
  if (params_given (params, "filter"))
    CHECK_PARAM_INVALID (filter, "Save Tag")
  CHECK_PARAM_INVALID (value, "Save Tag")
  if (params_given (params, "resources_action"))
    CHECK_PARAM_INVALID (resources_action, "Save Tag")
  CHECK_PARAM_INVALID (resource_type, "Save Tag")
  CHECK_PARAM_INVALID (active, "Save Tag")

  command = g_string_new ("");

  xml_string_append (command,
                     "<modify_tag tag_id=\"%s\">"
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<value>%s</value>"
                     "<resources action=\"%s\" filter=\"%s\">"
                     "<type>%s</type>",
                     tag_id,
                     name,
                     comment,
                     value,
                     resources_action ? resources_action : "",
                     filter ? filter : "",
                     resource_type);

  if (resource_ids)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, resource_ids);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "0"))
          g_string_append_printf (command,
                                  "<resource id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  xml_string_append (command,
                     "</resources>"
                     "</modify_tag>");

  response = NULL;
  entity = NULL;
  switch (gmp (connection, credentials,
               &response,
               &entity,
               response_data,
               command->str))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (command, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a tag. "
                             "The tag remains the same. "
                             "Diagnostics: Failure to send command to "
                             "manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (command, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a tag. "
                             "It is unclear whether the tag has been saved "
                             "or not. "
                             "Diagnostics: Failure to receive response from "
                             "manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (command, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a tag. "
                             "It is unclear whether the tag has been saved "
                             "or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  g_string_free (command, TRUE);
  ret = response_from_entity (connection, credentials, params, entity,
                              "Save Tag", response_data);

  free_entity (entity);
  g_free (response);
  return ret;

}

/**
 * @brief Export a tag.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Target XML on success.  Enveloped XML
 *         on error.
 */
char *
export_tag_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  return export_resource (connection, "tag", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of tags.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Targets XML on success.  Enveloped XML
 *         on error.
 */
char *
export_tags_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return export_many (connection, "tag", credentials, params,
                      response_data);
}

/**
 * @brief Get one tag, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_tag (gvm_connection_t *connection, credentials_t * credentials,
         params_t *params, const char *extra_xml,
         cmd_response_data_t* response_data)
{
  return get_one (connection, "tag", credentials, params, extra_xml, NULL,
                  response_data);
}

/**
 * @brief Get one tag, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_tag_gmp (gvm_connection_t *connection, credentials_t * credentials,
             params_t *params, cmd_response_data_t* response_data)
{
  return get_tag (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all tags, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_tags (gvm_connection_t *connection, credentials_t * credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t* response_data)
{
  return get_many (connection, "tag", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all tags, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_tags_gmp (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  return get_tags (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Set tag enabled status.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
toggle_tag_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char  *tag_id, *enable;
  entity_t entity;

  tag_id = params_value (params, "tag_id");
  enable = params_value (params, "enable");

  if (tag_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while modifying a tag. "
                           "The tag was not modified. "
                           "Diagnostics: Required parameter tag_id was NULL.",
                           response_data);
    }
  if (enable == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while modifying a tag. "
                           "The tag was not modified. "
                           "Diagnostics: Required parameter enable was NULL.",
                           response_data);
    }

  /* Delete the resource and get all resources. */

  if (gvm_connection_sendf (connection,
                            "<modify_tag tag_id=\"%s\">"
                            "<active>%s</active>"
                            "</modify_tag>",
                            tag_id,
                            enable)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while modifying a tag. "
                           "The tag is not modified. "
                           "Diagnostics: Failure to send command to"
                           " manager daemon.",
                           response_data);
    }

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while modifying a tag. "
                           "It is unclear whether the tag has been modified"
                           " or not. "
                           "Diagnostics: Failure to read response from"
                           " manager daemon.",
                           response_data);
    }

  if (! gmp_success (entity))
    set_http_status_from_entity (entity, response_data);
  html = response_from_entity (connection, credentials, params, entity,
                               "Toggle Tag", response_data);

  free_entity (entity);
  g_free (response);

  return html;
}

/**
 * @brief Setup edit_target XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_target (gvm_connection_t *connection, credentials_t * credentials,
             params_t *params, const char *extra_xml,
             cmd_response_data_t* response_data)
{
  GString *xml;
  gchar *edit;
  const char *target_id, *next, *filter, *first, *max;

  target_id = params_value (params, "target_id");
  filter = params_value (params, "filter");
  first = params_value (params, "first");
  max = params_value (params, "max");
  next = params_value (params, "next");

  if (target_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a target. "
                           "The target remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  if (next == NULL)
    next = "get_target";

  if (gvm_connection_sendf (connection,
                            "<get_targets"
                            " target_id=\"%s\""
                            " details=\"1\"/>",
                            target_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting target info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("");

  if (extra_xml)
    g_string_append (xml, extra_xml);


  edit = g_markup_printf_escaped ("<edit_target>"
                                  "<target id=\"%s\"/>"
                                  /* Page that follows. */
                                  "<next>%s</next>"
                                  /* Passthroughs. */
                                  "<filters><term>%s</term></filters>"
                                  "<targets start=\"%s\" max=\"%s\"/>",
                                  target_id,
                                  next,
                                  filter,
                                  first,
                                  max);
  g_string_append (xml, edit);
  g_free (edit);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting target info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (command_enabled (credentials, "GET_CREDENTIALS"))
    {
      /* Get the credentials. */

      if (gvm_connection_sendf (connection,
                                "<get_credentials"
                                " filter=\"rows=-1 sort=name\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  if (command_enabled (credentials, "GET_PORT_LISTS"))
    {
      /* Get the port lists. */

      if (gvm_connection_sendf (connection,
                                "<get_port_lists"
                                " filter=\"rows=-1 sort=name\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_target>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Setup edit_target XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_target_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return edit_target (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get one target, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_target (gvm_connection_t *connection, credentials_t * credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t* response_data)
{
  return get_one (connection, "target", credentials, params, extra_xml,
                  "tasks=\"1\"", response_data);
}

/**
 * @brief Get one target, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_target_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  return get_target (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all targets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_targets (gvm_connection_t *connection, credentials_t * credentials,
             params_t *params, const char *extra_xml,
             cmd_response_data_t* response_data)
{
  return get_many (connection, "target", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all targets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_targets_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return get_targets (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Modify a target, get all targets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_target_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char  *name, *hosts, *exclude_hosts, *comment;
  const char *target_ssh_credential, *port, *target_smb_credential;
  const char *target_esxi_credential, *target_snmp_credential;
  const char *target_source, *target_exclude_source;
  const char *target_id, *port_list_id, *reverse_lookup_only;
  const char *reverse_lookup_unify, *alive_tests, *in_use;
  GString *command;

  alive_tests = params_value (params, "alive_tests");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  in_use = params_value (params, "in_use");
  target_id = params_value (params, "target_id");

  CHECK_PARAM_INVALID (name, "Save Target");
  CHECK_PARAM_INVALID (target_id, "Save Target");
  CHECK_PARAM_INVALID (comment, "Save Target");
  CHECK_PARAM_INVALID (alive_tests, "Save Target");
  CHECK_PARAM_INVALID (in_use, "Save Target");

  if (strcmp (in_use, "0"))
    {
      entity_t entity;
      int ret;

      /* Target is in use.  Modify fewer fields. */

      command = g_string_new ("");
      xml_string_append (command,
                         "<modify_target target_id=\"%s\">"
                         "<name>%s</name>"
                         "<comment>%s</comment>"
                         "<alive_tests>%s</alive_tests>"
                         "</modify_target>",
                         target_id,
                         name ? name : "",
                         comment ? comment : "",
                         alive_tests);

      response = NULL;
      entity = NULL;
      ret = gmp (connection, credentials, &response, &entity, response_data,
                 command->str);
      g_string_free (command, TRUE);
      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a target. "
                                 "The target remains the same. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a target. "
                                 "It is unclear whether the target has been saved or not. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a target. "
                                 "It is unclear whether the target has been saved or not. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      html = response_from_entity (connection, credentials, params, entity,
                                   "Save Target", response_data);

      free_entity (entity);
      g_free (response);
      return html;
    }

  hosts = params_value (params, "hosts");
  exclude_hosts = params_value (params, "exclude_hosts");
  reverse_lookup_only = params_value (params, "reverse_lookup_only");
  reverse_lookup_unify = params_value (params, "reverse_lookup_unify");
  target_source = params_value (params, "target_source");
  target_exclude_source = params_value (params, "target_exclude_source");
  port_list_id = params_value (params, "port_list_id");
  target_ssh_credential = params_value (params, "ssh_credential_id");
  port = params_value (params, "port");
  target_smb_credential = params_value (params, "smb_credential_id");
  target_esxi_credential = params_value (params, "esxi_credential_id");
  target_snmp_credential = params_value (params, "snmp_credential_id");

  CHECK_PARAM_INVALID (target_source, "Save Target");
  CHECK_PARAM_INVALID (target_exclude_source, "Save Target");
  CHECK_PARAM_INVALID (port_list_id, "Save Target");
  CHECK_PARAM_INVALID (target_ssh_credential, "Save Target");
  CHECK_PARAM_INVALID (target_smb_credential, "Save Target");
  CHECK_PARAM_INVALID (target_esxi_credential, "Save Target");
  CHECK_PARAM_INVALID (target_snmp_credential, "Save Target");

  if (strcmp (target_ssh_credential, "--")
      && strcmp (target_ssh_credential, "0"))
    CHECK_PARAM_INVALID (port, "Save Target");

  if (hosts == NULL && strcmp (target_source, "manual") == 0)
    {
      return message_invalid (connection, credentials, params, response_data,
                              "Given hosts was invalid",
                              G_STRINGIFY (MHD_HTTP_BAD_REQUEST),
                              "Save Target");
    }
  if (strcmp (target_source, "import") == 0 && name == NULL)
    {
      return message_invalid (connection, credentials, params, response_data,
                              "Given target_source was invalid",
                              G_STRINGIFY (MHD_HTTP_BAD_REQUEST),
                              "Save Target");
    }

  {
    int ret;
    gchar *ssh_credentials_element, *smb_credentials_element;
    gchar *esxi_credentials_element, *snmp_credentials_element;
    gchar* comment_element;
    entity_t entity;

    if (comment)
      comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
    else
      comment_element = g_strdup ("");

    if (strcmp (target_ssh_credential, "--") == 0)
      ssh_credentials_element = g_strdup ("");
    else
      ssh_credentials_element =
        g_strdup_printf ("<ssh_credential id=\"%s\">"
                         "<port>%s</port>"
                         "</ssh_credential>",
                         target_ssh_credential,
                         port);

    if (strcmp (target_smb_credential, "--") == 0)
      smb_credentials_element = g_strdup ("");
    else
      smb_credentials_element =
        g_strdup_printf ("<smb_credential id=\"%s\"/>",
                         target_smb_credential);

    if (strcmp (target_esxi_credential, "--") == 0)
      esxi_credentials_element = g_strdup ("");
    else
      esxi_credentials_element =
        g_strdup_printf ("<esxi_credential id=\"%s\"/>",
                         target_esxi_credential);

    if (strcmp (target_snmp_credential, "--") == 0)
      snmp_credentials_element = g_strdup ("");
    else
      snmp_credentials_element =
        g_strdup_printf ("<snmp_credential id=\"%s\"/>",
                         target_snmp_credential);

    command = g_string_new ("");
    xml_string_append (command,
                       "<modify_target target_id=\"%s\">"
                       "<name>%s</name>"
                       "<hosts>%s</hosts>"
                       "<exclude_hosts>%s</exclude_hosts>"
                       "<reverse_lookup_only>%s</reverse_lookup_only>"
                       "<reverse_lookup_unify>%s</reverse_lookup_unify>"
                       "<port_list id=\"%s\"/>"
                       "<alive_tests>%s</alive_tests>",
                       target_id,
                       name,
                       strcmp (target_source, "file") == 0
                         ? params_value (params, "file")
                         : hosts,
                       strcmp (target_exclude_source, "file") == 0
                         ? params_value (params, "exclude_file")
                         : exclude_hosts,
                       reverse_lookup_only ? reverse_lookup_only : "0",
                       reverse_lookup_unify ? reverse_lookup_unify : "0",
                       port_list_id,
                       alive_tests);

    g_string_append_printf (command,
                            "%s%s%s%s%s"
                            "</modify_target>",
                            comment_element,
                            ssh_credentials_element,
                            smb_credentials_element,
                            esxi_credentials_element,
                            snmp_credentials_element);

    g_free (comment_element);
    g_free (ssh_credentials_element);
    g_free (smb_credentials_element);
    g_free (esxi_credentials_element);
    g_free (snmp_credentials_element);

    /* Modify the target. */

    ret = gvm_connection_sendf (connection, "%s", command->str);
    g_string_free (command, TRUE);

    if (ret == -1)
      {
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying target. "
                             "No target was modified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      }

    entity = NULL;
    if (read_entity_and_text_c (connection, &entity, &response))
      {
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a target. "
                             "It is unclear whether the target has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      }

    html = response_from_entity (connection, credentials, params, entity,
                                 "Save Target", response_data);
  }

  /* Pass response to handler of following page. */

  return html;
}

/**
 * @brief Export a target.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Target XML on success.  Enveloped XML
 *         on error.
 */
char *
export_target_gmp (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_resource (connection, "target", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of targets.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Targets XML on success.  Enveloped XML
 *         on error.
 */
char *
export_targets_gmp (gvm_connection_t *connection, credentials_t *
                    credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return export_many (connection, "target", credentials, params,
                      response_data);
}

/**
 * @brief Returns page to upload a new scan config.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
upload_config (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
               const char *extra_xml, cmd_response_data_t* response_data)
{
  GString *xml;

  xml = g_string_new ("<upload_config>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</upload_config>");

  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Return the upload scan config page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
upload_config_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return upload_config (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create config, get all configs, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_config_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char  *name, *comment, *base, *scanner = NULL;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  base = params_value (params, "base");

  CHECK_PARAM_INVALID (name, "New Config");
  CHECK_PARAM_INVALID (comment, "New Config");
  CHECK_PARAM_INVALID (base, "New Config");
  if (!strcmp (base, "0"))
    {
      scanner = params_value (params, "scanner_id");
      CHECK_PARAM_INVALID (scanner, "New Config");
    }

  /* Create the config. */
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_config>"
                "<name>%s</name>"
                "<copy>%s</copy>"
                "<comment>%s</comment>"
                "<scanner>%s</scanner>"
                "</create_config>",
                name, base, comment,
                scanner ?: ""))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new config. "
                            "No new config was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new config. "
                            "It is unclear whether the config has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new config. "
                            "It is unclear whether the config has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "config_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Config", response_data);

  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Import config, get all configs, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
import_config_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  gchar *command, *html, *response;
  entity_t entity;
  int ret;

  /* Create the config. */

  response = NULL;
  entity = NULL;
  command = g_strdup_printf ("<create_config>"
                             "%s"
                             "</create_config>",
                             params_value (params, "xml_file"));
  ret = gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a config. "
                             "The schedule remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a config. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a config. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  /* Cleanup, and return transformed XML. */

  html = response_from_entity (connection, credentials, params, entity,
                               "Import Config", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get all scan configs, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_configs (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
             const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "config", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all scan configs, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_configs_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  return get_configs (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[in]  edit         0 for config view page, else config edit page.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_config (gvm_connection_t *connection, credentials_t * credentials,
            params_t *params, const char *extra_xml, int edit,
            cmd_response_data_t* response_data)
{
  GString *xml;
  const char *config_id;

  config_id = params_value (params, "config_id");

  if (config_id == NULL)
    return get_configs (connection, credentials, params, extra_xml, response_data);

  xml = g_string_new ("<get_config_response>");
  if (edit) g_string_append (xml, "<edit/>");

  if (extra_xml)
    g_string_append (xml, extra_xml);
  /* Get the config families. */

  if (gvm_connection_sendf (connection,
                            "<get_configs"
                            " config_id=\"%s\""
                            " families=\"1\""
                            " tasks=\"1\""
                            " preferences=\"1\"/>",
                            config_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Get all the families. */

  if (gvm_connection_sendf (connection, "<get_nvt_families/>") == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (edit)
    {
      /* Get OSP scanners */
      if (gvm_connection_sendf (connection, "<get_scanners filter=\"type=1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message
                  (credentials, "Internal error", __FUNCTION__, __LINE__,
                   "An internal error occurred while getting the config. "
                   "The config is not available. "
                   "Diagnostics: Failure to send command to manager daemon.",
                   response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message
                  (credentials, "Internal error", __FUNCTION__, __LINE__,
                   "An internal error occurred while getting the config. "
                   "The config is not available. "
                   "Diagnostics: Failure to receive response from manager daemon.",
                   response_data);
        }

    }

  /* Get Credentials */
  if (gvm_connection_sendf (connection, "<get_credentials/>") == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message
              (credentials, "Internal error", __FUNCTION__, __LINE__,
               "An internal error occurred while getting the config. "
               "The config is not available. "
               "Diagnostics: Failure to send command to manager daemon.",
               response_data);
    }
  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message
              (credentials, "Internal error", __FUNCTION__, __LINE__,
               "An internal error occurred while getting the config. "
               "The config is not available. "
               "Diagnostics: Failure to receive response from manager daemon.",
               response_data);
    }

  /* Get the permissions */

  g_string_append (xml, "<permissions>");

  if (gvm_connection_sendf (connection,
                            "<get_permissions"
                            " filter=\"name:^.*(config)s?$"
                            "          and resource_uuid=%s"
                            "          first=1 rows=-1\"/>",
                            config_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting permissions list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting permissions list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</permissions>");

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_config_response>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Get a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_config_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return get_config (connection, credentials, params, NULL, 0, response_data);
}

/**
 * @brief Get a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
edit_config (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
             const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_config (connection, credentials, params, extra_xml, 1, response_data);
}

/**
 * @brief Get a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_config_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  return edit_config (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Sync config, get configs, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
sync_config_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  GString *xml;
  const char *config_id, *next;
  char *ret;

  config_id = params_value (params, "config_id");
  CHECK_PARAM_INVALID (config_id, "Synchronize Config");

  if (gvm_connection_sendf (connection, "<sync_config config_id=\"%s\"/>",
                            config_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message
              (credentials, "Internal error", __FUNCTION__, __LINE__,
               "An internal error occurred while synchronizing a config. "
               "The config is not synchronized. "
               "Diagnostics: Failure to send command to manager daemon.",
               response_data);
    }

  xml = g_string_new ("");

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message
              (credentials, "Internal error", __FUNCTION__, __LINE__,
               "An internal error occurred while synchronizing a config. "
               "It is unclear whether the config has been synchronized or not. "
               "Diagnostics: Failure to receive response from manager daemon.",
               response_data);
    }

  next = params_value (params, "next");
  if (next && !strcmp (next, "get_config"))
    ret = get_config (connection, credentials, params, xml->str, 0,
                      response_data);
  else
    ret = get_configs (connection, credentials, params, xml->str,
                       response_data);

  g_string_free (xml, TRUE);
  return ret;
}


/**
 * @brief Save OSP file preferences.
 *
 * @param[in]   connection     Connection.
 * @param[in]   credentials    Username and password for authentication.
 * @param[in]   params         Request parameters.
 * @param[in]   next           The next command on success.
 * @param[in]   fail_next      The next command on failure.
 * @param[out]  success        Whether the last command was successful.
 * @param[out]  response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
save_osp_prefs (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, const char *next, const char *fail_next,
                int *success, cmd_response_data_t* response_data)
{
  GHashTableIter iter;
  gpointer param_name, val;
  char *ret;
  const char *config_id;

  config_id = params_value (params, "config_id");
  g_hash_table_iter_init (&iter, params);
  ret = NULL;
  while (g_hash_table_iter_next (&iter, &param_name, &val))
    {
      gchar *value;
      param_t *param = val;

      g_free (ret);
      ret = NULL;

      if (!g_str_has_prefix (param_name, "osp_pref_"))
        continue;
      value = param->value_size ? g_base64_encode ((guchar *) param->value,
                                                   param->value_size)
                                : g_strdup ("");

      /* Send the name without the osp_pref_ prefix. */
      param_name = ((char *) param_name) + 9;
      if (gvm_connection_sendf (connection,
                                "<modify_config config_id=\"%s\">"
                                "<preference><name>%s</name>"
                                "<value>%s</value></preference>"
                                "</modify_config>",
                                config_id,
                                (char *) param_name,
                                value)
          == -1)
        {
          g_free (value);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message
                  (credentials, "Internal error", __FUNCTION__, __LINE__,
                   "An internal error occurred while saving a config. It is"
                   " unclear whether the entire config has been saved. "
                   "Diagnostics: Failure to send command to manager daemon.",
                   response_data);
        }
      g_free (value);

      ret = check_modify_config (connection, credentials, params, next,
                                 fail_next, success, response_data);
      if (*success == 0)
        return ret;
    }
  return ret;
}

/**
 * @brief Save details of an NVT for a config and return the next page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Following page.
 */
char *
save_config_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  int gmp_ret;
  char *ret, *osp_ret;
  params_t *preferences, *selects, *trends;
  const char *config_id, *name, *comment, *scanner_id;
  int success;

  config_id = params_value (params, "config_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  scanner_id = params_value (params, "scanner_id");

  CHECK_PARAM_INVALID (config_id, "Save Config");
  CHECK_PARAM_INVALID (name, "Save Config");
  CHECK_PARAM_INVALID (comment, "Save Config");

  /* Save name and comment. */

  if (scanner_id)
    gmp_ret = gvm_connection_sendf_xml (connection,
                                        "<modify_config config_id=\"%s\">"
                                        "<name>%s</name>"
                                        "<comment>%s</comment>"
                                        "<scanner>%s</scanner>"
                                        "</modify_config>",
                                        params_value (params, "config_id"),
                                        name,
                                        comment,
                                        scanner_id);
  else
    gmp_ret = gvm_connection_sendf_xml (connection,
                                        "<modify_config config_id=\"%s\">"
                                        "<name>%s</name>"
                                        "<comment>%s</comment>"
                                        "</modify_config>",
                                        params_value (params, "config_id"),
                                        name,
                                        comment);

  if (gmp_ret == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  ret = check_modify_config (connection, credentials, params,
                             "get_config", "edit_config",
                             &success, response_data);
  if (success == 0)
    {
      return ret;
    }

  /* Save preferences. */

  preferences = params_values (params, "preference:");
  if (preferences)
    {
      params_iterator_t iter;
      char *param_name;
      param_t *param;

      params_iterator_init (&iter, preferences);
      while (params_iterator_next (&iter, &param_name, &param))
        {
          gchar *value;

          value = param->value_size
                  ? g_base64_encode ((guchar *) param->value,
                                     param->value_size)
                  : g_strdup ("");

          if (gvm_connection_sendf (connection,
                                    "<modify_config config_id=\"%s\">"
                                    "<preference>"
                                    "<name>%s</name>"
                                    "<value>%s</value>"
                                    "</preference>"
                                    "</modify_config>",
                                    params_value (params, "config_id"),
                                    param_name,
                                    value)
              == -1)
            {
              g_free (value);
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while saving a config. "
                                   "It is unclear whether the entire config has been saved. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }
          g_free (value);
          g_free (ret);

          ret = check_modify_config (connection, credentials, params,
                                     "get_config", "edit_config",
                                     &success, response_data);
          if (success == 0)
            {
              return ret;
            }
        }
    }

  /* OSP config file preference. */
  osp_ret = save_osp_prefs (connection, credentials, params,
                            "get_config", "edit_config",
                            &success, response_data);
  if (osp_ret)
    {
      g_free (ret);
      ret = osp_ret;
    }

  if (success == 0)
    {
      if (osp_ret == NULL)
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a config. "
                               "It is unclear whether the entire config has been saved. "
                               "Diagnostics: save_osp_prefs returned NULL unexpectedly.",
                               response_data);
        }
      return ret;
    }

  /* Update the config. */

  trends = params_values (params, "trend:");
  selects = params_values (params, "select:");

  if (trends || selects || params_value (params, "trend"))
    {
      if (gvm_connection_sendf (connection,
                                "<modify_config config_id=\"%s\">"
                                "<family_selection>"
                                "<growing>%i</growing>",
                                params_value (params, "config_id"),
                                trends
                                && params_value (params, "trend")
                                && strcmp (params_value (params, "trend"), "0"))
          == -1)
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while saving a config. "
                              "It is unclear whether the entire config has been saved. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }

      if (selects)
        {
          gchar *family;
          params_iterator_t iter;
          param_t *param;

          params_iterator_init (&iter, selects);
          while (params_iterator_next (&iter, &family, &param))
            if (gvm_connection_sendf (connection,
                                      "<family>"
                                      "<name>%s</name>"
                                      "<all>1</all>"
                                      "<growing>%i</growing>"
                                      "</family>",
                                      family,
                                      trends && member1 (trends, family))
                == -1)
              {
                cmd_response_data_set_status_code (response_data,
                                                   MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (credentials,
                                    "Internal error", __FUNCTION__, __LINE__,
                                    "An internal error occurred while saving a config. "
                                    "It is unclear whether the entire config has been saved. "
                                    "Diagnostics: Failure to send command to manager daemon.",
                                    response_data);
              }
        }

      if (trends)
        {
          gchar *family;
          params_iterator_t iter;
          param_t *param;

          params_iterator_init (&iter, trends);
          while (params_iterator_next (&iter, &family, &param))
            {
              if (param->value_size == 0) continue;
              if (param->value[0] == '0') continue;
              if (selects && member (selects, family)) continue;
              if (gvm_connection_sendf (connection,
                                        "<family>"
                                        "<name>%s</name>"
                                        "<all>0</all>"
                                        "<growing>1</growing>"
                                        "</family>",
                                        family)
                  == -1)
                {
                  cmd_response_data_set_status_code (
                    response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while saving a config. "
                                       "It is unclear whether the entire config has been saved. "
                                       "Diagnostics: Failure to send command to manager daemon.",
                                       response_data);
                }
            }
        }

      if (gvm_connection_sendf (connection,
                                "</family_selection>"
                                "</modify_config>")
          == -1)
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a config. "
                               "It is unclear whether the entire config has been saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      g_free (ret);
      ret = check_modify_config (connection, credentials, params,
                                 "get_config", "edit_config",
                                 NULL, response_data);
    }
  return ret;
}

/**
 * @brief Get details of a family for a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  edit         0 for config view page, else config edit page.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_config_family (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params, int edit,
                   cmd_response_data_t* response_data)
{
  GString *xml;
  const char *config_id, *name, *family, *sort_field, *sort_order;

  config_id = params_value (params, "config_id");
  name = params_value (params, "name");
  family = params_value (params, "family");

  if ((config_id == NULL) || (name == NULL) || (family == NULL))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config family. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  xml = g_string_new ("<get_config_family_response>");
  if (edit) g_string_append (xml, "<edit/>");
  /* @todo Would it be better include this in the get_nvts response? */
  g_string_append_printf (xml,
                          "<config id=\"%s\">"
                          "<name>%s</name><family>%s</family>"
                          "</config>",
                          config_id,
                          name,
                          family);

  /* Get the details for all NVT's in the config in the family. */

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (gvm_connection_sendf (connection,
                            "<get_nvts"
                            " config_id=\"%s\" details=\"1\""
                            " family=\"%s\" timeout=\"1\" preference_count=\"1\""
                            " sort_field=\"%s\" sort_order=\"%s\"/>",
                            config_id,
                            family,
                            sort_field ? sort_field : "nvts.name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (edit)
    {
      /* Get the details for all NVT's in the family. */

      g_string_append (xml, "<all>");

      if (gvm_connection_sendf (connection,
                                "<get_nvts"
                                " details=\"1\""
                                " timeout=\"1\""
                                " family=\"%s\""
                                " preferences_config_id=\"%s\""
                                " preference_count=\"1\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\"/>",
                                family,
                                config_id,
                                sort_field ? sort_field : "nvts.name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting list of configs. "
                               "The current list of configs is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting list of configs. "
                               "The current list of configs is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }

      g_string_append (xml, "</all>");
    }

  g_string_append (xml, "</get_config_family_response>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Get details of a family for a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_config_family_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return get_config_family (connection, credentials, params, 0, response_data);
}

/**
 * @brief Get details of a family for editing a config, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_config_family_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return get_config_family (connection, credentials, params, 1, response_data);
}

/**
 * @brief Get details of an NVT for a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_config_family_gmp (gvm_connection_t *connection, credentials_t *
                        credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  char *ret;
  const char *config_id, *family;
  params_t *nvts;

  config_id = params_value (params, "config_id");
  family = params_value (params, "family");

  if ((config_id == NULL) || (family == NULL))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving getting config family. "
                           "The config has not been saved. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  /* Set the NVT selection. */

  if (gvm_connection_sendf (connection,
                            "<modify_config config_id=\"%s\">"
                            "<nvt_selection>"
                            "<family>%s</family>",
                            config_id,
                            family)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  nvts = params_values (params, "nvt:");
  if (nvts)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, nvts);
      while (params_iterator_next (&iter, &name, &param))
        if (gvm_connection_sendf (connection,
                                  "<nvt oid=\"%s\"/>",
                                  name)
            == -1)
          {
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a config. "
                                 "It is unclear whether the entire config has been saved. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          }
    }

  if (gvm_connection_sendf (connection,
                            "</nvt_selection>"
                            "</modify_config>")
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  ret = check_modify_config (connection, credentials, params,
                             "get_config_family", "edit_config_family",
                             NULL, response_data);

  return ret;
}

/**
 * @brief Get details of an NVT for a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  edit         0 for config view page, else config edit page.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_config_nvt (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, int edit, cmd_response_data_t* response_data)
{
  GString *xml;
  const char *config_id, *name, *family, *sort_field, *sort_order, *nvt;

  config_id = params_value (params, "config_id");
  name = params_value (params, "name");
  family = params_value (params, "family");
  nvt = params_value (params, "oid");

  if ((config_id == NULL) || (name == NULL))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config family. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  xml = g_string_new ("<get_config_nvt_response>");
  if (edit) g_string_append (xml, "<edit/>");
  /* @todo Would it be better include this in the get_nvts response? */
  g_string_append_printf (xml,
                          "<config id=\"%s\">"
                          "<name>%s</name><family>%s</family>"
                          "</config>",
                          config_id,
                          name,
                          family ? family : "");

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (gvm_connection_sendf (connection,
                            "<get_nvts"
                            " config_id=\"%s\" nvt_oid=\"%s\""
                            " details=\"1\" preferences=\"1\""
                            " sort_field=\"%s\" sort_order=\"%s\"/>",
                            config_id,
                            nvt,
                            sort_field ? sort_field : "nvts.name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</get_config_nvt_response>");

  if (gvm_connection_sendf (connection,
                            "<get_notes"
                            " nvt_oid=\"%s\""
                            " sort_field=\"notes.text\"/>",
                            nvt)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of notes. "
                           "The current list of notes is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of notes. "
                           "The current list of notes is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (gvm_connection_sendf (connection,
                            "<get_overrides"
                            " nvt_oid=\"%s\""
                            " sort_field=\"overrides.text\"/>",
                            nvt)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of overrides. "
                           "The current list of overrides is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of overrides. "
                           "The current list of overrides is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Get details of an NVT for a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_config_nvt_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return get_config_nvt (connection, credentials, params, 0, response_data);
}

/**
 * @brief Edit details of an NVT for a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_config_nvt_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return get_config_nvt (connection, credentials, params, 1, response_data);
}

/**
 * @brief Save NVT prefs for a config, get NVT details, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_config_nvt_gmp (gvm_connection_t *connection, credentials_t *
                     credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  params_t *preferences;
  const char *config_id;
  int success;
  char *modify_config_ret;

  modify_config_ret = NULL;
  config_id = params_value (params, "config_id");

  preferences = params_values (params, "preference:");
  if (preferences)
    {
      param_t *preference;
      gchar *preference_name;
      params_iterator_t iter;

      /* Save preferences. */

      params_iterator_init (&iter, preferences);
      while (params_iterator_next (&iter, &preference_name, &preference))
        {
          int type_start, type_end, count, ret, is_timeout = 0;
          gchar *value;

          g_free (modify_config_ret);
          modify_config_ret = NULL;

          /* Passwords and files have checkboxes to control whether they
           * must be reset.  This works around the need for the Manager to
           * send the actual password or show the actual file. */

          /* LDAPsearch[entry]:Timeout value */
          count = sscanf (preference_name,
                          "%*[^[][%n%*[^]]%n]:",
                          &type_start,
                          &type_end);
          if (count == 0 && type_start > 0 && type_end > 0)
            {
              if (strncmp (preference_name + type_start,
                           "password",
                           type_end - type_start)
                  == 0)
                {
                  int found = 0;
                  params_t *passwords;

                  passwords = params_values (params, "password:");
                  if (passwords)
                    {
                      param_t *password;
                      gchar *password_name;
                      params_iterator_t password_params;

                      params_iterator_init (&password_params, passwords);
                      while (params_iterator_next (&password_params,
                                                   &password_name,
                                                   &password))
                        if (strcmp (password_name, preference_name) == 0)
                          {
                            found = 1;
                            break;
                          }
                    }
                  if (found == 0)
                    /* Skip modifying the password preference. */
                    continue;
                }
              else if (strncmp (preference_name + type_start,
                                "file",
                                type_end - type_start)
                       == 0)
                {
                  int found = 0;
                  params_t *files;

                  files = params_values (params, "file:");
                  if (files)
                    {
                      param_t *file;
                      gchar *file_name;
                      params_iterator_t file_params;

                      params_iterator_init (&file_params, files);
                      while (params_iterator_next (&file_params,
                                                   &file_name,
                                                   &file))
                        if (strcmp (file_name, preference_name) == 0)
                          {
                            found = 1;
                            break;
                          }
                    }
                  if (found == 0)
                    /* Skip modifying the file preference. */
                    continue;
                }
              else if (strncmp (preference_name + type_start,
                                "scanner",
                                type_end - type_start)
                       == 0)
                {
                  /* Presume it's the timeout. */
                  is_timeout = 1;
                }
            }

          value = preference->value_size
                  ? g_base64_encode ((guchar *) preference->value,
                                     preference->value_size)
                  : g_strdup ("");

          if (is_timeout)
            {
              const char *timeout;
              gchar *preference_name_escaped;

              timeout = params_value (params, "timeout");

              if (timeout == NULL)
                {
                  g_free (value);
                  cmd_response_data_set_status_code (response_data,
                                                     MHD_HTTP_BAD_REQUEST);
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while saving a config. "
                                       "It is unclear whether the entire config has been saved. "
                                       "Diagnostics: Required parameter was NULL.",
                                       response_data);
                }

              preference_name_escaped = g_markup_escape_text (preference_name,
                                                              -1);

              if (strcmp (timeout, "0") == 0)
                /* Leave out the value to clear the preference. */
                ret = gvm_connection_sendf (connection,
                                            "<modify_config"
                                            " config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id,
                                            preference_name_escaped);
              else
                ret = gvm_connection_sendf (connection,
                                            "<modify_config"
                                            " config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "<value>%s</value>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id,
                                            preference_name_escaped,
                                            value);

              g_free (preference_name_escaped);
            }
          else
            {
              gchar *preference_name_escaped;
              preference_name_escaped = g_markup_escape_text (preference_name,
                                                              -1);
              ret = gvm_connection_sendf (connection,
                                          "<modify_config"
                                          " config_id=\"%s\">"
                                          "<preference>"
                                          "<nvt oid=\"%s\"/>"
                                          "<name>%s</name>"
                                          "<value>%s</value>"
                                          "</preference>"
                                          "</modify_config>",
                                          config_id,
                                          params_value (params, "oid"),
                                          preference_name_escaped,
                                          value);
              g_free (preference_name_escaped);
            }

          if (ret == -1)
            {
              g_free (value);
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while saving a config. "
                                   "It is unclear whether the entire config has been saved. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }
          g_free (value);

          modify_config_ret = check_modify_config (connection, credentials,
                                                   params,
                                                   "get_config_nvt",
                                                   "edit_config_nvt",
                                                   &success, response_data);
          if (success == 0)
            {
              return modify_config_ret;
            }
        }

    }

  return modify_config_ret;
}

/**
 * @brief Delete config, get all configs, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_config_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return delete_resource (connection, "config", credentials, params, 0, "get_configs",
                          response_data);
}

/**
 * @brief Export a config.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Config XML on success.  Enveloped XML on error.
 */
char *
export_config_gmp (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_resource (connection, "config", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of scan configs.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Scan configs XML on success.  Enveloped XML
 *         on error.
 */
char *
export_configs_gmp (gvm_connection_t *connection,
                    credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return export_many (connection, "config", credentials, params, response_data);
}

/**
 * @brief Export a note.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Note XML on success.  Enveloped XML on error.
 */
char *
export_note_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return export_resource (connection, "note", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of notes.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Notes XML on success.  Enveloped XML
 *         on error.
 */
char *
export_notes_gmp (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  return export_many (connection, "note", credentials, params,
                      response_data);
}

/**
 * @brief Export an override.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Override XML on success.  Enveloped XML on error.
 */
char *
export_override_gmp (gvm_connection_t *connection,
                     credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return export_resource (connection, "override", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of overrides.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Overrides XML on success.  Enveloped XML
 *         on error.
 */
char *
export_overrides_gmp (gvm_connection_t *connection,
                      credentials_t * credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  return export_many (connection, "override", credentials, params,
                      response_data);
}

/**
 * @brief Export a Port List.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Port List XML on success.  Enveloped XML on
 *         error.
 */
char *
export_port_list_gmp (gvm_connection_t *connection,
                      credentials_t * credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  return export_resource (connection, "port_list", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of Port Lists.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Port Lists XML on success.  Enveloped XML
 *         on error.
 */
char *
export_port_lists_gmp (gvm_connection_t *connection,
                       credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return export_many (connection, "port_list", credentials, params,
                      response_data);
}

/**
 * @brief Export a file preference.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Config XML on success.  Enveloped XML on error.
 */
char *
export_preference_file_gmp (gvm_connection_t *connection,
                            credentials_t * credentials, params_t *params,
                            cmd_response_data_t* response_data)
{
  GString *xml;
  entity_t entity, preference_entity, value_entity;
  const char *config_id, *oid, *preference_name;

  config_id = params_value (params, "config_id");
  oid = params_value (params, "oid");
  preference_name = params_value (params, "preference_name");

  xml = g_string_new ("<get_preferences_response>");

  if (config_id == NULL || oid == NULL || preference_name == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Export Preference File"));
  else
    {
      if (gvm_connection_sendf (connection,
                                "<get_preferences"
                                " config_id=\"%s\""
                                " nvt_oid=\"%s\""
                                " preference=\"%s\"/>",
                                config_id,
                                oid,
                                preference_name)
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      entity = NULL;
      if (read_entity_c (connection, &entity))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }

      preference_entity = entity_child (entity, "preference");
      if (preference_entity != NULL
          && (value_entity = entity_child (preference_entity, "value")))
        {
          char *content = strdup (entity_text (value_entity));
          cmd_response_data_set_content_type (response_data,
                                              GSAD_CONTENT_TYPE_OCTET_STREAM);
          cmd_response_data_set_content_disposition
            (response_data,
             g_strdup_printf ("attachment; filename=\"pref_file.bin\""));
          cmd_response_data_set_content_length (response_data,
                                                strlen (content));
          free_entity (entity);
          g_string_free (xml, TRUE);
          return content;
        }
      else
        {
          free_entity (entity);
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to receive file from manager daemon.",
                               response_data);
        }
    }

  g_string_append (xml, "</get_preferences_response>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Export a report format.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Report format XML on success.  Enveloped XML
 *         on error.
 */
char *
export_report_format_gmp (gvm_connection_t *connection,
                          credentials_t * credentials, params_t *params,
                          cmd_response_data_t* response_data)
{
  return export_resource (connection, "report_format", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of Report Formats.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Report Formats XML on success.  Enveloped XML
 *         on error.
 */
char *
export_report_formats_gmp (gvm_connection_t *connection,
                           credentials_t * credentials, params_t *params,
                           cmd_response_data_t* response_data)
{
  return export_many (connection, "report_format", credentials, params,
                      response_data);
}

/**
 * @brief Delete report, get task status, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_report_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return delete_resource (connection, "report", credentials, params, 0, NULL,
                          response_data);
}

/**
 * @brief Get a report and return the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  commands     Extra commands to run before the others.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] error        Set to 1 if error, else 0.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Report.
 */
char *
get_report (gvm_connection_t *connection, credentials_t * credentials,
            params_t *params, const char *commands,
            const char *extra_xml, int *error,
            cmd_response_data_t* response_data)
{
  GString *xml, *commands_xml;
  entity_t entity;
  entity_t report_entity;
  unsigned int first, max;
  GString *levels, *delta_states;
  const char *alert_id, *search_phrase, *min_qod, *type, *zone;
  const char *autofp, *autofp_value, *notes, *overrides, *result_hosts_only;
  const char *apply_overrides;
  const char *report_id, *sort_field, *sort_order, *result_id, *delta_report_id;
  const char *format_id, *first_result, *max_results, *host, *pos;
  const char *given_filt_id, *filt_id, *filter, *apply_filter, *report_section;
  const char *build_filter, *filter_extra;
  const char *host_search_phrase, *host_levels;
  const char *host_first_result, *host_max_results;
  int ret;
  int ignore_filter, ignore_pagination;
  gchar *built_filter;
  gchar *fname_format, *esc_response;
  const gchar *extension, *requested_content_type;

  build_filter = params_value (params, "build_filter");

  if (params_given (params, "apply_filter")
      && params_valid (params, "apply_filter"))
    apply_filter = params_value (params, "apply_filter");
  else
    apply_filter = "no_pagination";

  if (params_given (params, "report_section")
      && params_valid (params, "report_section"))
    report_section = params_value (params, "report_section");
  else
    report_section = "";

  ignore_filter = (strcmp (apply_filter, "full")
                   && strcmp (apply_filter, "no_pagination")
                   && strcmp (report_section, "")
                   && strcmp (report_section, "results")
                   && strcmp (report_section, "summary"));

  if (params_given (params, "ignore_pagination"))
    {
      const char *ignore_pagination_str = params_value (params,
                                                        "ignore_pagination");
      ignore_pagination = (ignore_pagination_str
                           && strcmp (ignore_pagination_str, "")
                           && strcmp (ignore_pagination_str, "0"));
    }
  else
    {
      ignore_pagination = (strcmp (apply_filter, "full")
                          && strcmp (report_section, "")
                          && strcmp (report_section, "results")
                          && strcmp (report_section, "summary"));
    }

  alert_id = params_value (params, "alert_id");
  if (alert_id == NULL)
    params_given (params, "alert_id") || (alert_id = "0");

  search_phrase = params_value (params, "search_phrase");
  if (search_phrase == NULL)
    params_given (params, "search_phrase") || (search_phrase = "");

  zone = params_value (params, "timezone");
  if (zone == NULL)
    params_given (params, "zone") || (zone = "");

  min_qod = params_value (params, "min_qod");

  type = params_value (params, "type");
  host = params_value (params, "host");
  pos = params_value (params, "pos");

  autofp = params_value (params, "autofp");
  if (autofp == NULL)
    params_given (params, "autofp") || (autofp = "0");

  autofp_value = params_value (params, "autofp_value");
  if (autofp_value == NULL)
    params_given (params, "autofp_value") || (autofp_value = "1");

  notes = params_value (params, "notes");
  if (notes == NULL)
    {
      if (params_given (params, "max_results"))
        /* Use the max_results param to determine if the request is from
         * the Result Filtering form, because the notes param is only sent
         * when the checkbox is ticked. */
        notes = "0";
      else
        params_given (params, "notes") || (notes = "1");
    }

  overrides = params_value (params, "overrides");
  if (overrides == NULL)
    {
      if (params_given (params, "max_results"))
        /* Use the max_results param to check for filtering form as above */
        overrides = "0";
      else
        params_given (params, "overrides") || (overrides = "1");
    }

  apply_overrides = params_value (params, "apply_overrides");
  if (apply_overrides == NULL)
    {
      if (params_given (params, "max_results"))
        /* Use the max_results param to check for filtering form as above */
        apply_overrides = "0";
      else
        params_given (params, "apply_overrides") || (apply_overrides = "1");
    }

  result_hosts_only = params_value (params, "result_hosts_only");
  if (result_hosts_only == NULL)
    {
      if (params_given (params, "max_results"))
        /* Use the max_results params to determine if the request is from
         * the Result Filtering form, because the result_hosts_only param is
         * only sent when the checkbox is ticked. */
        result_hosts_only = "0";
      else
        params_given (params, "result_hosts_only") || (result_hosts_only = "1");
    }

  if (autofp == NULL || strlen (autofp) == 0) autofp = "0";

  if (autofp_value == NULL || strlen (autofp_value) == 0) autofp_value = "1";

  if (strcmp (autofp, "2") == 0)
    autofp_value = "2";

  if (notes == NULL || strlen (notes) == 0) notes = "1";

  if (overrides == NULL || strlen (overrides) == 0) overrides = "1";

  if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
    result_hosts_only = "1";

  /* Run any extra commands. */

  commands_xml = g_string_new ("");
  if (commands)
    {
      if (gvm_connection_sendf (connection, "%s", commands)
          == -1)
        {
          g_string_free (commands_xml, TRUE);
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to send extra commands to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &commands_xml))
        {
          g_string_free (commands_xml, TRUE);
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  /* Get the report. */

  if (params_value (params, "delta_states"))
    delta_states = g_string_new (params_value (params, "delta_states"));
  else
    {
      delta_states = g_string_new ("");
      if (params_value (params, "delta_state_changed")
          && atoi (params_value (params, "delta_state_changed")))
        g_string_append (delta_states, "c");
      if (params_value (params, "delta_state_gone")
          && atoi (params_value (params, "delta_state_gone")))
        g_string_append (delta_states, "g");
      if (params_value (params, "delta_state_new")
          && atoi (params_value (params, "delta_state_new")))
        g_string_append (delta_states, "n");
      if (params_value (params, "delta_state_same")
          && atoi (params_value (params, "delta_state_same")))
        g_string_append (delta_states, "s");
    }

  if (strlen (delta_states->str) == 0) g_string_append (delta_states, "gn");

  if (params_value (params, "levels"))
    levels = g_string_new (params_value (params, "levels"));
  else
    {
      levels = g_string_new ("");
      if (params_value (params, "level_high")
          && atoi (params_value (params, "level_high")))
        g_string_append (levels, "h");
      if (params_value (params, "level_medium")
          && atoi (params_value (params, "level_medium")))
        g_string_append (levels, "m");
      if (params_value (params, "level_low")
          && atoi (params_value (params, "level_low")))
        g_string_append (levels, "l");
      if (params_value (params, "level_log")
          && atoi (params_value (params, "level_log")))
        g_string_append (levels, "g");
      if (params_value (params, "level_false_positive")
          && atoi (params_value (params, "level_false_positive")))
        g_string_append (levels, "f");
    }

  if (type && (strcmp (type, "assets") == 0))
    {
      if (strlen (levels->str) == 0)
        g_string_append (levels, "");
    }
  else if (strlen (levels->str) == 0)
    g_string_append (levels, "hml");

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  report_id = params_value (params, "report_id");

  if (report_id == NULL
      && (type == NULL
          || (strcmp (type, "prognostic")
              && strcmp (type, "assets"))))
    return get_reports (connection, credentials, params, extra_xml,
                        response_data);

  if (strcmp (alert_id, "0"))
    {
      const char *status, *esc_filter;

      esc_filter = params_value (params, "esc_filter");
      if (esc_filter == NULL)
        params_given (params, "esc_filter")
          || (esc_filter = "first=1 rows=-1"
                           "  result_hosts_only=0"
                           "  apply_overrides=1"
                           "  notes=1 overrides=1"
                           "  sort-reverse=severity");

      if (ignore_filter)
        ret = gvm_connection_sendf_xml (connection,
                                        "<get_reports"
                                        " report_id=\"%s\""
                                        " filter=\"first=1 rows=-1"
                                        "  result_hosts_only=0"
                                        "  apply_overrides=1"
                                        "  notes=1 overrides=1"
                                        "  sort-reverse=severity\""
                                        " alert_id=\"%s\"/>",
                                        report_id,
                                        alert_id);
      else
        ret = gvm_connection_sendf_xml (connection,
                                        "<get_reports"
                                        " report_id=\"%s\""
                                        " ignore_pagination=\"%d\""
                                        " filter=\"%s\""
                                        " alert_id=\"%s\"/>",
                                        report_id,
                                        ignore_pagination,
                                        esc_filter ? esc_filter : "",
                                        alert_id);
      if (ret == -1)
        {
          g_string_free (commands_xml, TRUE);
          g_string_free (delta_states, TRUE);
          g_string_free (levels, TRUE);
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_entity_and_text_c (connection, &entity, &esc_response))
        {
          g_string_free (commands_xml, TRUE);
          g_string_free (delta_states, TRUE);
          g_string_free (levels, TRUE);
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      status = entity_attribute (entity, "status");
      if ((status == NULL)
          || (strlen (status) == 0))
        {
          free_entity (entity);
          g_string_free (commands_xml, TRUE);
          g_string_free (delta_states, TRUE);
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to parse response from manager daemon.",
                               response_data);
        }
      free_entity (entity);
    }
  else
    esc_response = NULL;

  result_id = params_value (params, "result_id");
  delta_report_id = params_value (params, "delta_report_id");
  format_id = params_value (params, "report_format_id");

  first_result = params_value (params, "first_result");
  if (first_result == NULL
      || sscanf (first_result, "%u", &first) != 1)
    first_result = "1";

  max_results = params_value (params, "max_results");
  if (max_results == NULL
      || sscanf (max_results, "%u", &max) != 1)
    max_results = G_STRINGIFY (RESULTS_PER_PAGE);

  if (gvm_connection_sendf (connection,
                            "<get_reports"
                            "%s%s"
                            " details=\"%i\""
                            "%s%s%s",
                            (type && (strcmp (type, "prognostic") == 0))
                             ? " type=\"prognostic\""
                             : "",
                            (type && (strcmp (type, "assets") == 0))
                             ? " type=\"assets\""
                             : "",
                            (type
                             && (strcmp (type, "assets") == 0)
                             && host)
                            || delta_report_id
                            || strcmp (report_section, "summary"),
                            host ? " host=\"" : "",
                            host ? host : "",
                            host ? "\"" : "")
      == -1)
    {
      g_string_free (delta_states, TRUE);
      g_string_free (commands_xml, TRUE);
      g_string_free (levels, TRUE);
      if (error) *error = 1;
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  given_filt_id = params_value (params, "filt_id");
  filter = params_value (params, "filter");
  filter_extra = params_value (params, "filter_extra");

  if (params_given (params, "filt_id"))
    {
      g_tree_replace (credentials->last_filt_ids, g_strdup ("report_result"),
                      g_strdup (given_filt_id));
      filt_id = given_filt_id;
    }
  else if (filter == NULL || strcmp (filter, "") == 0)
    filt_id = g_tree_lookup (credentials->last_filt_ids, "report_result");
  else
    filt_id = NULL;

  if (filter == NULL)
    filter = "";

  if ((build_filter && (strcmp (build_filter, "1") == 0))
      || ((filter == NULL || strcmp (filter, "") == 0)
          && (filter_extra == NULL || strcmp (filter_extra, "") == 0)))
    {
      GString *filter_buffer;
      filter_buffer = g_string_new ("");

      g_string_append_printf (filter_buffer,
                              "autofp=%s"
                              " apply_overrides=%i"
                              " notes=%i"
                              " overrides=%i"
                              " result_hosts_only=%i"
                              " first=%s"
                              " rows=%s"
                              " sort%s=%s"
                              " levels=%s",
                              strcmp (autofp, "0") ? autofp_value : "0",
                              apply_overrides
                                ? (strcmp (apply_overrides, "0") ? 1 : 0)
                                : 1,
                              strcmp (notes, "0") ? 1 : 0,
                              strcmp (overrides, "0") ? 1 : 0,
                              strcmp (result_hosts_only, "0") ? 1 : 0,
                              first_result,
                              max_results,
                              sort_order
                                ? strcmp (sort_order, "ascending")
                                    ? "-reverse"
                                    : ""
                                : ((sort_field == NULL
                                    || strcmp (sort_field, "type") == 0
                                    || strcmp (sort_field, "severity") == 0)
                                    ? "-reverse"
                                    : ""),
                              sort_field ? sort_field : "severity",
                              levels->str);

      if (search_phrase && strcmp (search_phrase, ""))
        {
          gchar *search_phrase_escaped;
          search_phrase_escaped = g_markup_escape_text (search_phrase, -1);
          g_string_append_printf (filter_buffer,
                                  " \"%s\"",
                                  search_phrase_escaped);
          g_free (search_phrase_escaped);
        }

      if (delta_states->str && strcmp (delta_states->str, "")
          && delta_report_id && strcmp (delta_report_id, ""))
        g_string_append_printf (filter_buffer,
                                " delta_states=%s",
                                delta_states->str);

      if (min_qod && strcmp (min_qod, ""))
        g_string_append_printf (filter_buffer,
                                " min_qod=%s",
                                min_qod);

      if (zone && strcmp (zone, ""))
        g_string_append_printf (filter_buffer,
                                " timezone=%s",
                                zone);

      if (filter && strcmp (filter, ""))
        g_string_append_printf (filter_buffer,
                                " %s",
                                filter);

      built_filter = g_string_free (filter_buffer, FALSE);
    }
  else if (filter || filter_extra)
    built_filter = g_strdup_printf ("%s%s%s",
                                    filter ? filter : "",
                                    filter && filter_extra ? " " : "",
                                    filter_extra ? filter_extra : "");
  else
    built_filter = NULL;

  if (type && (strcmp (type, "prognostic") == 0))
    {
      host_search_phrase = params_value (params, "host_search_phrase");
      if (host_search_phrase == NULL)
        params_given (params, "host_search_phrase")
          || (host_search_phrase = "");

      host_levels = params_value (params, "host_levels");
      if (host_levels == NULL)
        params_given (params, "host_levels")
          || (host_levels = "");

      host_first_result = params_value (params, "host_first_result");
      if (host_first_result == NULL
          || sscanf (host_first_result, "%u", &first) != 1)
        host_first_result = "1";

      host_max_results = params_value (params, "host_max_results");
      if (host_max_results == NULL
          || sscanf (host_max_results, "%u", &max) != 1)
        host_max_results = G_STRINGIFY (RESULTS_PER_PAGE);

      if (host_search_phrase == NULL)
        {
          g_string_free (delta_states, TRUE);
          g_string_free (commands_xml, TRUE);
          g_string_free (levels, TRUE);
          xml = g_string_new ("");
          g_string_append_printf (xml, GSAD_MESSAGE_INVALID,
                                  "Given host search_phrase was invalid",
                                  "Get Report");
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_BAD_REQUEST);
          return g_string_free (xml, FALSE);
        }

      if (gvm_connection_sendf_xml (connection,
                                    " host_search_phrase=\"%s\""
                                    " host_levels=\"%s\""
                                    " host_first_result=\"%s\""
                                    " host_max_results=\"%s\"",
                                    host_search_phrase,
                                    host_levels,
                                    host_first_result,
                                    host_max_results))
        {
          g_string_free (delta_states, TRUE);
          g_string_free (commands_xml, TRUE);
          g_string_free (levels, TRUE);
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
    }
  else
    {
      host_search_phrase = NULL;
      host_levels = NULL;
      host_first_result = NULL;
      host_max_results = NULL;
    }

  /* Don't apply default filter when applying result filter checkboxes/textboxes
   */
  if (sort_field == NULL && sort_order == NULL)
    if ((filt_id == NULL || strcmp (filt_id, "") == 0)
        && (filter == NULL || strcmp (filter, "") == 0))
      filt_id = FILT_ID_USER_SETTING;

  if (ignore_filter)
    ret = gvm_connection_sendf_xml (connection,
                                    " filt_id=\"0\""
                                    " filter=\"first=1 rows=-1"
                                    "  result_hosts_only=0 apply_overrides=1"
                                    "  notes=1 overrides=1"
                                    "  sort-reverse=severity\""
                                    " report_id=\"%s\""
                                    " delta_report_id=\"%s\""
                                    " format_id=\"%s\"/>",
                                    (type && ((strcmp (type, "assets") == 0)
                                              || (strcmp (type, "prognostic")
                                                  == 0)))
                                      ? ""
                                      : report_id,
                                    delta_report_id ? delta_report_id : "0",
                                    format_id ? format_id : "");
  else
    ret = gvm_connection_sendf_xml (connection,
                                    " ignore_pagination=\"%d\""
                                    " filt_id=\"%s\""
                                    " filter=\"%s\""
                                    " pos=\"%s\""
                                    " notes_details=\"1\""
                                    " overrides_details=\"1\""
                                    " report_id=\"%s\""
                                    " delta_report_id=\"%s\""
                                    " format_id=\"%s\"/>",
                                    ignore_pagination,
                                    filt_id ? filt_id : "0",
                                    built_filter ? built_filter : "",
                                    pos ? pos : "1",
                                    (type && ((strcmp (type, "assets") == 0)
                                              || (strcmp (type, "prognostic")
                                                  == 0)))
                                     ? ""
                                     : report_id,
                                    delta_report_id ? delta_report_id : "0",
                                    format_id ? format_id : "",
                                    first_result,
                                    max_results,
                                    sort_field ? sort_field : "severity",
                                    sort_order
                                     ? sort_order
                                     : ((sort_field == NULL
                                        || strcmp (sort_field, "type") == 0
                                        || strcmp (sort_field, "severity") == 0)
                                       ? "descending"
                                       : "ascending"),
                                    levels->str,
                                    delta_states->str,
                                    search_phrase,
                                    min_qod,
                                    zone);
  if (ret == -1)
    {
      g_string_free (delta_states, TRUE);
      g_string_free (commands_xml, TRUE);
      g_string_free (levels, TRUE);
      if (error) *error = 1;
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  g_string_free (delta_states, TRUE);

  if (format_id)
    {
      g_string_free (commands_xml, TRUE);
      g_string_free (levels, TRUE);
      if ((strcmp (format_id, "a994b278-1f62-11e1-96ac-406186ea4fc5") == 0)
          || strcmp (format_id, "5057e5cc-b825-11e4-9d0e-28d24461215b") == 0)
        {
          /* Manager sends XML report as plain XML. */

          if (read_entity_c (connection, &entity))
            {
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   response_data);
            }
          entity_t report = entity_child (entity, "report");
          if (report == NULL)
            {
              free_entity (entity);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Response from manager daemon did not contain a report.",
                                   response_data);
            }
          extension = entity_attribute (report, "extension");
          requested_content_type = entity_attribute (report, "content_type");
          if (extension && requested_content_type)
            {
              gchar *file_name;
              ret = setting_get_value (connection,
                                       "e1a2ae0b-736e-4484-b029-330c9e15b900",
                                       &fname_format,
                                       response_data);
              if (ret)
                {
                  switch (ret)
                    {
                      case 1:
                        cmd_response_data_set_status_code (response_data,
                                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
                        return gsad_message (credentials,
                                            "Internal error", __FUNCTION__, __LINE__,
                                            "An internal error occurred while getting a setting. "
                                            "The setting could not be delivered. "
                                            "Diagnostics: Failure to send command to manager daemon.",
                                             response_data);
                      case 2:
                        cmd_response_data_set_status_code (response_data,
                                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
                        return gsad_message (credentials,
                                            "Internal error", __FUNCTION__, __LINE__,
                                            "An internal error occurred while getting a setting. "
                                            "The setting could not be delivered. "
                                            "Diagnostics: Failure to receive response from manager daemon.",
                                             response_data);
                      default:
                        cmd_response_data_set_status_code (response_data,
                                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
                        return gsad_message (credentials,
                                            "Internal error", __FUNCTION__, __LINE__,
                                            "An internal error occurred while getting a setting. "
                                            "The setting could not be delivered. "
                                            "Diagnostics: Internal error.",
                                             response_data);
                    }
                }

              if (fname_format == NULL)
                {
                  g_warning ("%s : File name format setting not found.",
                              __FUNCTION__);
                  fname_format = "%T-%U";
                }

              file_name = format_file_name (fname_format,
                                            credentials,
                                            "report",
                                            (type
                                             && ((strcmp (type, "assets") == 0)
                                                 || (strcmp (type, "prognostic")
                                                     == 0)))
                                            ? type
                                            : report_id,
                                            report);
              if (file_name == NULL)
                file_name = g_strdup_printf ("%s-%s",
                                            "report",
                                            (type
                                             && ((strcmp (type, "assets") == 0)
                                                 || (strcmp (type, "prognostic")
                                                     == 0)))
                                              ? type
                                              : report_id);

              cmd_response_data_set_content_type_string
                (response_data, g_strdup (requested_content_type));
              cmd_response_data_set_content_disposition
                (response_data,
                 g_strdup_printf ("attachment; filename=\"%s.%s\"",
                                  file_name,
                                  extension));

              g_free (file_name);
            }
          xml = g_string_new ("");
          print_entity_to_string (report, xml);
          free_entity (entity);
          if (error) *error = 1;
          return g_string_free (xml, FALSE);
        }
      else
        {
          /* "nbe", "pdf", "dvi", "html", "html-pdf"... */

          entity = NULL;
          if (read_entity_c (connection, &entity))
            {
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   response_data);
            }

          report_entity = entity_child (entity, "report");
          if (report_entity != NULL)
            {
              char *report_encoded;
              gsize report_len;
              gchar *report_decoded;
              extension = entity_attribute (report_entity, "extension");
              requested_content_type = entity_attribute (report_entity,
                                                         "content_type");
              report_encoded = entity_text (report_entity);
              report_decoded =
                (gchar *) g_base64_decode (report_encoded, &report_len);
              /* g_base64_decode can return NULL (Glib 2.12.4-2), at least
               * when *report_len is zero. */
              if (report_decoded == NULL)
                {
                  report_decoded = g_strdup ("");
                  report_len = 0;
                }
              if (extension && requested_content_type)
                {
                  gchar *file_name;
                  const char *id;
                  if (report_id)
                    id = report_id;
                  else if (type && (strcmp (type, "prognostic") == 0))
                    id = "prognostic";
                  else
                    id = "ERROR";

                  ret = setting_get_value
                          (connection,
                           "e1a2ae0b-736e-4484-b029-330c9e15b900",
                           &fname_format,
                           response_data);
                  if (ret)
                    {
                      switch (ret)
                        {
                          case 1:
                            cmd_response_data_set_status_code (response_data,
                                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
                            return gsad_message (credentials,
                                                "Internal error", __FUNCTION__, __LINE__,
                                                "An internal error occurred while getting a setting. "
                                                "The setting could not be delivered. "
                                                "Diagnostics: Failure to send command to manager daemon.",
                                                 response_data);
                          case 2:
                            cmd_response_data_set_status_code (response_data,
                                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
                            return gsad_message (credentials,
                                                "Internal error", __FUNCTION__, __LINE__,
                                                "An internal error occurred while getting a setting. "
                                                "The setting could not be delivered. "
                                                "Diagnostics: Failure to receive response from manager daemon.",
                                                 response_data);
                          default:
                            cmd_response_data_set_status_code (response_data,
                                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
                            return gsad_message (credentials,
                                                "Internal error", __FUNCTION__, __LINE__,
                                                "An internal error occurred while getting a setting. "
                                                "The setting could not be delivered. "
                                                "Diagnostics: Internal error.",
                                                 response_data);
                        }
                    }

                  if (fname_format == NULL)
                    {
                      g_warning ("%s : File name format setting not found.",
                                  __FUNCTION__);
                      fname_format = "%T-%U";
                    }

                  file_name = format_file_name (fname_format, credentials,
                                                "report", id, report_entity);
                  if (file_name == NULL)
                    file_name = g_strdup_printf ("%s-%s",
                                                "report", id);

                  cmd_response_data_set_content_type_string
                    (response_data, g_strdup (requested_content_type));
                  cmd_response_data_set_content_disposition
                    (response_data,
                     g_strdup_printf ("attachment; filename=\"%s.%s\"",
                                      file_name,
                                      extension));

                  g_free (file_name);
                }

              free_entity (entity);
              if (error) *error = 1;

              cmd_response_data_set_content_length (response_data, report_len);
              return report_decoded;
            }
          else
            {
              free_entity (entity);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive report from manager daemon.",
                                   response_data);
            }
        }
    }
  else
    {
      gchar *task_id;

      task_id = NULL;

      /* Format is NULL, send enveloped XML. */

      if (delta_report_id && result_id && strcmp (result_id, "0"))
        xml = g_string_new ("<get_delta_result>");
      else if (host || (type && (strcmp (type, "prognostic") == 0)))
        {
          if (type && (strcmp (type, "prognostic") == 0))
            {
              xml = g_string_new ("<get_prognostic_report>");

              xml_string_append (xml,
                                 "<host_search_phrase>"
                                 "%s"
                                 "</host_search_phrase>"
                                 "<host_levels>%s</host_levels>"
                                 "<results start=\"%s\" max=\"%s\"/>",
                                 host_search_phrase,
                                 host_levels,
                                 host_first_result,
                                 host_max_results);
            }
          else
            xml = g_string_new ("<get_asset>");
          xml_string_append (xml,
                             "<search_phrase>%s</search_phrase>"
                             "<levels>%s</levels>"
                             "<hosts start=\"%s\" max=\"%s\"/>",
                             search_phrase,
                             levels->str,
                             first_result,
                             max_results);
        }
      else
        xml = g_string_new ("<get_report>");

      if (extra_xml)
        g_string_append (xml, extra_xml);

      if (commands)
        g_string_append (xml, commands_xml->str);
      g_string_free (commands_xml, TRUE);
      g_string_free (levels, TRUE);

      if (strcmp (alert_id, "0"))
        {
          g_string_append_printf (xml, "<get_reports_alert_response>");
          if (esc_response)
            {
              g_string_append (xml, esc_response);
              g_free (esc_response);
            }
          g_string_append_printf (xml, "</get_reports_alert_response>");
        }
      else if (delta_report_id)
        g_string_append_printf (xml,
                                "<delta>%s</delta>"
                                "<result id=\"%s\"/>",
                                delta_report_id,
                                result_id ? result_id : "0");

      entity = NULL;
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          if (error) *error = 1;
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }

      if ((filt_id == NULL) && (params_value (params, "filter") == NULL))
        {
          entity_t term;

          /* Add the filter from the report as a param, because it's easier to
           * get from the envelope for things like the New Note icon. */

          term = entity_child (entity, "report");
          if (term
              && ((term = entity_child (term, "report")))
              && ((term = entity_child (term, "filters")))
              && ((term = entity_child (term, "term"))))
            {
              param_t *param;
              param = params_add (params, "filter", entity_text (term));
              param->valid = 1;
              param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
            }
        }

      if ((type && (strcmp (type, "prognostic") == 0))
          && (command_enabled (credentials, "GET_REPORT_FORMATS")))
        {
          if (gvm_connection_sendf
               (connection,
                "<get_report_formats"
                " filter=\"rows=-1 sort=name\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }

          if (read_string_c (connection, &xml))
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   response_data);
            }
        }

      if (type && (strcmp (type, "prognostic") == 0))
        {
          if (command_enabled (credentials, "GET_FILTERS"))
            {
              /* Get the filters. */

              g_string_append (xml, "<filters>");

              if (gvm_connection_sendf_xml (connection,
                                            "<get_filters"
                                            " filter=\"type=result\"/>")
                  == -1)
                {
                  g_string_free (xml, TRUE);
                  if (error) *error = 1;
                  cmd_response_data_set_status_code (response_data,
                                                     MHD_HTTP_INTERNAL_SERVER_ERROR);
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while getting the filter list. "
                                       "The current list of filters is not available. "
                                       "Diagnostics: Failure to send command to manager daemon.",
                                       response_data);
                }

              if (read_string_c (connection, &xml))
                {
                  g_string_free (xml, TRUE);
                  if (error) *error = 1;
                  cmd_response_data_set_status_code (response_data,
                                                     MHD_HTTP_INTERNAL_SERVER_ERROR);
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while getting the filter list. "
                                       "The current list of filters is not available. "
                                       "Diagnostics: Failure to receive response from manager daemon.",
                                       response_data);
                }

              g_string_append (xml, "</filters>");
            }

          g_string_append (xml, "</get_prognostic_report>");
          return g_string_free (xml, FALSE);
        }

      if (type && (strcmp (type, "assets") == 0))
        {
          if (host)
            g_string_append (xml, "</get_asset>");
          else
            g_string_append (xml, "</get_report>");
          return g_string_free (xml, FALSE);
        }

      report_entity = entity_child (entity, "report");
      if (report_entity)
        report_entity = entity_child (report_entity, "report");
      if (report_entity)
        {
          const char *id;
          entity_t task_entity, name;

          id = NULL;
          task_entity = entity_child (report_entity, "task");
          if (task_entity)
            {
              id = entity_attribute (task_entity, "id");
              name = entity_child (task_entity, "name");
            }
          else
            name = NULL;
          if (id)
            task_id = g_strdup (id);
          if (delta_report_id && result_id && id && name)
            g_string_append_printf (xml,
                                    "<task id=\"%s\"><name>%s</name></task>",
                                    id,
                                    entity_text (name));

          free_entity (entity);
        }

      if (task_id)
        {
          if (gvm_connection_sendf (connection,
                                    "<get_tasks task_id=\"%s\" details=\"0\" />",
                                    task_id)
              == -1)
            {
              g_free (task_id);
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }

          if (read_string_c (connection, &xml))
            {
              g_free (task_id);
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }

          g_free (task_id);
        }

      if (delta_report_id && result_id && strcmp (result_id, "0"))
        {
          g_string_append (xml, "</get_delta_result>");
          return g_string_free (xml, FALSE);
        }

      if (command_enabled (credentials, "GET_REPORT_FORMATS"))
        {
          gchar *default_report_format, *err;

          /* Get Default Report Format. */

          err = setting_get_value_error (connection,
                                         credentials,
                                         "353304fc-645e-11e6-ba7a-28d24461215b",
                                         &default_report_format,
                                         response_data);
          if (err)
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              return err;
            }

          g_string_append_printf (xml,
                                  "<report_format_id>%s</report_format_id>",
                                  default_report_format);

          /* Get all the report formats. */

          if (gvm_connection_sendf
               (connection,
                "<get_report_formats"
                " filter=\"rows=-1 sort=name\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }

          if (read_string_c (connection, &xml))
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   response_data);
            }
        }

      if (command_enabled (credentials, "GET_ALERTS"))
        {
          if (gvm_connection_sendf
               (connection,
                "<get_alerts"
                " filter=\"rows=-1 sort=name\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }

          if (read_string_c (connection, &xml))
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   response_data);
            }
        }

      if (command_enabled (credentials, "GET_FILTERS"))
        {
          /* Get the filters. */

          g_string_append (xml, "<filters>");

          if (gvm_connection_sendf_xml (connection,
                                        "<get_filters"
                                        " filter=\"type=result\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting the filter list. "
                                   "The current list of filters is not available. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   response_data);
            }

          if (read_string_c (connection, &xml))
            {
              g_string_free (xml, TRUE);
              if (error) *error = 1;
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting the filter list. "
                                   "The current list of filters is not available. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   response_data);
            }

          g_string_append (xml, "</filters>");
        }

      /* Get tag names */

      if (gvm_connection_sendf (connection,
                                "<get_tags"
                                " filter=\"resource_type=report"
                                "          first=1"
                                "          rows=-1\""
                                " names_only=\"1\""
                                "/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to receive response from manager daemon.",
                              response_data);
        }

      g_string_append (xml, "</get_report>");
      return g_string_free (xml, FALSE);
    }
}

/**
 * @brief Get a report and envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Report.
 */
char *
get_report_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  char *result;
  int error = 0;

  result = get_report (connection, credentials, params, NULL, NULL, &error,
                       response_data);

  return error ? result : envelope_gmp (connection, credentials, params,
                                        result, response_data);
}

/**
 * @brief Run alert for a report.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
report_alert_gmp (gvm_connection_t *connection,
                  credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  entity_t entity;
  const char *alert_id, *report_id;
  const char *status, *filter;
  gchar *response, *html;
  int ret;

  alert_id = params_value (params, "alert_id");
  report_id = params_value (params, "report_id");

  if ((alert_id == NULL) || (report_id == NULL))
    {
      cmd_response_data_set_status_code(response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Bad Request", __FUNCTION__, __LINE__,
                           "Missing parameter alert_id or report_id. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  filter = params_value (params, "filter");

  if (filter == NULL && !params_given (params, "filter"))
    filter = "first=1 rows=-1"
      "  result_hosts_only=0"
      "  apply_overrides=1"
      "  notes=1 overrides=1"
      "  sort-reverse=severity";

  ret = gvm_connection_sendf_xml (connection,
                                  "<get_reports"
                                  " report_id=\"%s\""
                                  " ignore_pagination=\"1\""
                                  " filter=\"%s\""
                                  " alert_id=\"%s\"/>",
                                  report_id,
                                  filter ? filter : "",
                                  alert_id);
  if (ret == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to receive response from "
                           "manager daemon.",
                           response_data);
    }

  status = entity_attribute (entity, "status");
  if ((status == NULL) || (strlen (status) == 0))
    {
      free_entity (entity);
      g_free (response);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to parse response from manager daemon.",
                           response_data);
    }
  if (strcmp(status, "200"))
    {
      free_entity (entity);
      g_free (response);
      cmd_response_data_set_status_code(response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Failed", __FUNCTION__, __LINE__,
                           "Running the report alert failed."
                           "The report could not be delivered.",
                           response_data);

    }

  html = response_from_entity (connection, credentials, params, entity,
                              "Report Alert", response_data);

  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get all reports, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_reports (gvm_connection_t *connection, credentials_t * credentials,
             params_t *params, const char *extra_xml,
             cmd_response_data_t* response_data)
{
  const char *overrides;

  overrides = params_value (params, "overrides");
  if (overrides)
    /* User toggled overrides.  Set the overrides value in the filter. */
    params_toggle_overrides (params, overrides);

  return get_many (connection, "report", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all reports, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_reports_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return get_reports (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get the hosts for a report, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_report_section (gvm_connection_t *connection,
                    credentials_t * credentials, params_t *params,
                    const char *extra_xml, cmd_response_data_t* response_data)
{
  GString *xml;
  const char *report_id, *report_section, *type;
  char *result;
  int error = 0;

  report_section = params_value (params, "report_section");
  report_id = params_value (params, "report_id");
  type = params_value (params, "type");

  if (report_section == NULL)
    report_section = "results";

  if (report_id == NULL && (type == NULL || strcmp (type, "prognostic")))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred."
                           " Diagnostics: report_id was NULL.",
                           response_data);
    }

  if (!strcmp (report_section, "results"))
    {
      char *result;

      result = get_report (connection, credentials, params, NULL,
                           extra_xml, &error, response_data);

      return error ? result : envelope_gmp (connection, credentials,
                                            params, result, response_data);
    }

  result = get_report (connection, credentials, params, NULL, NULL,
                       &error, response_data);
  if (error)
    return result;

  xml = g_string_new ("");
  g_string_append_printf (xml, "<get_report_%s_response>", report_section);
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, result);
  if (strcmp (params_value (params, "report_section"), "topology") == 0)
    {
      int ret;
      char *response;

      ret = gmp (connection, credentials,
                 &response,
                 NULL,
                 response_data,
                 "<get_report_formats"
                 " filter=\"rows=-1\"/>");

      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            g_string_free (xml, TRUE);
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting the "
                                "result formats list. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                response_data);
          case 2:
            g_string_free (xml, TRUE);
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting the "
                                "result formats list. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          default:
            g_string_free (xml, TRUE);
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting the "
                                "result formats list. "
                                "Diagnostics: Internal Error.",
                                response_data);
        }

      g_string_append (xml, response);
      g_free (response);
    }

  g_string_append_printf (xml, "</get_report_%s_response>", report_section);

  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Get a report section, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_report_section_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return get_report_section (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get an SSL Certificate.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return SSL Certificate.
 */
char *
download_ssl_cert (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  const char *ssl_cert;
  gchar *cert;
  char *unescaped;

  ssl_cert = params_value (params, "ssl_cert");
  if (ssl_cert == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred."
                           " Diagnostics: ssl_cert was NULL.",
                           response_data);
    }
  /* The Base64 comes URI escaped as it may contain special characters. */
  unescaped = g_uri_unescape_string (ssl_cert, NULL);

  cert = g_strdup_printf ("-----BEGIN CERTIFICATE-----\n"
                          "%s\n-----END CERTIFICATE-----\n",
                          unescaped);

  cmd_response_data_set_content_length (response_data, strlen (cert));

  g_free (unescaped);
  return cert;
}

/**
 * @brief Get a Scanner's CA Certificate.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return CA Certificate.
 */
char *
download_ca_pub (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  const char *ca_pub;
  char *unescaped;

  ca_pub = params_value (params, "ca_pub");
  if (ca_pub == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred."
                           " Diagnostics: ca_pub was NULL.",
                           response_data);
    }
  /* The Base64 comes URI escaped as it may contain special characters. */
  unescaped = g_uri_unescape_string (ca_pub, NULL);
  cmd_response_data_set_content_length (response_data, strlen (unescaped));
  return unescaped;
}

/**
 * @brief Get a Scanner's Certificate.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Certificate.
 */
char *
download_key_pub (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  const char *key_pub;
  char *unescaped;

  key_pub = params_value (params, "key_pub");
  if (key_pub == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred."
                           " Diagnostics: key_pub was NULL.",
                           response_data);
    }

  /* The Base64 comes URI escaped as it may contain special characters. */
  unescaped = g_uri_unescape_string (key_pub, NULL);
  cmd_response_data_set_content_length (response_data, strlen (unescaped));
  return unescaped;
}

/**
 * @brief Export a result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Result XML on success.  Enveloped XML
 *         on error.
 */
char *
export_result_gmp (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_resource (connection, "result", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of results.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Results XML on success.  Enveloped XML
 *         on error.
 */
char *
export_results_gmp (gvm_connection_t *connection, credentials_t *
                    credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return export_many (connection, "result", credentials, params,
                      response_data);
}

/**
 * @brief Get all results, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_results (gvm_connection_t *connection, credentials_t * credentials,
             params_t *params, const char *extra_xml,
             cmd_response_data_t* response_data)
{
  const char *overrides;
  overrides = params_value (params, "overrides");

  if (overrides)
    /* User toggled overrides.  Set the overrides value in the filter. */
    params_toggle_overrides (params, overrides);

  return get_many (connection, "result", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all results, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_results_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return get_results (connection,
                      credentials,
                      params,
                      NULL,
                      response_data);
}

/**
 * @brief Get one result, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials      Username and password for authentication.
 * @param[in]  params           HTTP request params
 * @param[in]  result_id        Result UUID.
 * @param[in]  task_id          Result task UUID.
 * @param[in]  apply_overrides  Whether to apply overrides.
 * @param[in]  commands         Extra commands to run before the others.
 * @param[in]  report_id        ID of report.
 * @param[in]  autofp           Auto FP filter flag.
 * @param[in]  extra_xml        Extra XML to insert inside page element.
 * @param[out] response_data    Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_result (gvm_connection_t *connection, credentials_t *credentials,
            params_t * params, const char *result_id, const char *task_id,
            const char *task_name, const char *apply_overrides,
            const char *commands, const char *report_id, const char *autofp,
            const char *extra_xml, cmd_response_data_t* response_data)
{
  GString *xml;

  if (apply_overrides == NULL)
    apply_overrides = "1";

  if (autofp == NULL)
    autofp = "0";

  xml = g_string_new ("<get_result>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  xml_string_append (xml,
                     "<task id=\"%s\"><name>%s</name></task>"
                     "<report id=\"%s\"/>",
                     task_id,
                     task_name,
                     report_id);

  /* Get the result. */

  if (gvm_connection_sendf (connection,
                            "<commands>"
                            "%s"
                            "<get_results"
                            " get_counts=\"0\""
                            " result_id=\"%s\""
                            "%s%s%s"
                            " filter=\"autofp=%s"
                            " apply_overrides=%s"
                            " overrides=%s"
                            " notes=1\""
                            " overrides_details=\"1\""
                            " notes_details=\"1\""
                            " details=\"1\"/>"
                            "</commands>",
                            commands ? commands : "",
                            result_id,
                            task_id ? " task_id=\"" : "",
                            task_id ? task_id : "",
                            task_id ? "\"" : "",
                            autofp,
                            apply_overrides,
                            apply_overrides)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a result. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a result. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Get tag names */

  if (gvm_connection_sendf (connection,
                            "<get_tags"
                            " filter=\"resource_type=result"
                            "          first=1"
                            "          rows=-1\""
                            " names_only=\"1\""
                            "/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_result>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Get one result, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_result_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return get_result (connection, credentials, params,
                     params_value (params, "result_id"),
                     params_value (params, "task_id"),
                     params_value (params, "name"),
                     params_value (params, "apply_overrides"),
                     NULL,
                     params_value (params, "report_id"),
                     params_value (params, "autofp"),
                     NULL,
                     response_data);
}

/**
 * @brief Get result details page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_result_page (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                 const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_result (connection, credentials, params,
                     params_value (params, "result_id"),
                     params_value (params, "task_id"),
                     params_value (params, "name"),
                     params_value (params, "apply_overrides"),
                     NULL,
                     params_value (params, "report_id"),
                     params_value (params, "autofp"),
                     extra_xml,
                     response_data);

}

/**
 * @brief Get all notes, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_notes (gvm_connection_t *connection, credentials_t *credentials, params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  return get_many (connection, "note", credentials, params, extra_xml, NULL, response_data);
}

/**
 * @brief Get all notes, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_notes_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return get_notes (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get a note, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_note (gvm_connection_t *connection, credentials_t *credentials, params_t *params, const char *extra_xml,
          cmd_response_data_t* response_data)
{
  return get_one (connection, "note", credentials, params, extra_xml,
                  "result=\"1\"", response_data);
}

/**
 * @brief Get a note, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_note_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
              cmd_response_data_t* response_data)
{
  return get_note (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get a port from request params
 *
 * @param[in]  params  Request parameters.
 *
 * @return The port
 */
const char *
get_port_from_params(params_t *params)
{
  const char *port;

  port = params_value (params, "port");

  if (port == NULL)
    return "";

  if (strcmp (port, "--") == 0)
    port = params_value (params, "port_manual");

  if (port == NULL)
    port = "";

  return port;
}

/**
 * @brief Get hosts from request params
 *
 * @param[in]  params  Request parameters.
 *
 * @return The hosts
 */
const char *
get_hosts_from_params(params_t *params)
{
  const char *hosts;

  if (params_valid (params, "hosts"))
    {
      hosts = params_value (params, "hosts");
      if (strcmp (hosts, "--") == 0)
        {
          if (params_valid (params, "hosts_manual"))
            hosts = params_value (params, "hosts_manual");
          else if (params_given (params, "hosts_manual")
                   && strcmp (params_original_value (params, "hosts_manual"),
                              ""))
            hosts = NULL;
          else
            hosts = "";
        }
    }
  else if (strcmp (params_original_value (params, "hosts"), ""))
    hosts = NULL;
  else
    hosts = "";

  return hosts;
}

/**
 * @brief Get task_id from request params
 *
 * @param[in]  params  Request parameters.
 *
 * @return The task_id
 */
const char *
get_task_id_from_params(params_t *params)
{
  const char *task_id;

  task_id = params_value (params, "task_id");

  if (task_id && (strcmp (task_id, "0") == 0))
    task_id = params_value (params, "task_uuid");

  return task_id;
}

/**
 * @brief Get severity from request params
 *
 * @param[in]  params  Request parameters.
 *
 * @return The severity
 */
const char *
get_severity_from_params(params_t *params)
{
  const char *severity;

  if (params_valid (params, "severity"))
    severity = params_value (params, "severity");
  else if (params_given (params, "severity")
           && strcmp (params_original_value (params, "severity"), ""))
    severity = NULL;
  else
    severity = "";

  return severity;
}

/**
 * @brief Get result_id from request params
 *
 * @param[in]  params  Request parameters.
 *
 * @return The result_id
 */
const char *
get_result_id_from_params(params_t *params)
{
  const char *result_id;

  result_id = params_value (params, "result_id");

  if (result_id && (strcmp (result_id, "0") == 0))
    {
      result_id = params_value (params, "result_uuid");
    }

  return result_id;
}

/**
 * @brief Create a note, get report, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_note_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  char *ret;
  gchar *response;
  const char  *oid, *severity, *port, *hosts;
  const char *text, *task_id, *result_id;
  /* For get_report. */
  const char *active, *days;
  entity_t entity;

  oid = params_value (params, "oid");
  CHECK_PARAM_INVALID (oid, "Create Note");

  port = get_port_from_params (params);
  hosts = get_hosts_from_params (params);
  task_id = get_task_id_from_params (params);
  severity = get_severity_from_params (params);
  result_id = get_result_id_from_params (params);

  CHECK_PARAM_INVALID (severity, "Create Note");
  CHECK_PARAM_INVALID (hosts, "Create Note");

  active = params_value (params, "active");
  CHECK_PARAM_INVALID (active, "Create Note");

  text = params_value (params, "text");
  days = params_value (params, "days");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_note>"
                "<active>%s</active>"
                "<nvt oid=\"%s\"/>"
                "<hosts>%s</hosts>"
                "<port>%s</port>"
                "<severity>%s</severity>"
                "<text>%s</text>"
                "<task id=\"%s\"/>"
                "<result id=\"%s\"/>"
                "</create_note>",
                strcmp (active, "1")
                 ? active
                 : (days ? days : "-1"),
                oid,
                hosts ? hosts : "",
                port ? port : "",
                severity ? severity : "",
                text ? text : "",
                task_id ? task_id : "",
                result_id ? result_id : ""))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new note. "
                             "No new note was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new note. "
                             "It is unclear whether the note has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new note. "
                             "It is unclear whether the note has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "note_id", entity_attribute (entity, "id"));
  ret = response_from_entity (connection, credentials, params, entity,
                              "Create Note", response_data);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete note, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_note_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  return delete_resource (connection, "note", credentials, params, 0, NULL, response_data);
}

/**
 * @brief Delete a note, get all notes, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_note_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return delete_resource (connection, "note", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Edit note, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_note (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  GString *xml;
  const char *note_id;

  note_id = params_value (params, "note_id");

  if (gvm_connection_sendf (connection,
                            "<get_notes"
                            " note_id=\"%s\""
                            " details=\"1\""
                            " result=\"1\"/>",
                            note_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("");

  xml_string_append (xml, "<edit_note>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_note>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Edit note, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_note_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return edit_note (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Save note, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_note_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  gchar *response;
  entity_t entity;
  const char *note_id, *text, *hosts, *port, *severity, *task_id;
  const char *result_id, *active, *days, *oid;
  char *ret;

  note_id = params_value (params, "note_id");

  oid = params_value (params, "oid");

  text = params_value (params, "text");
  if (text == NULL)
    params_given (params, "text") || (text = "");

  port = get_port_from_params (params);
  hosts = get_hosts_from_params (params);
  task_id = get_task_id_from_params (params);
  severity = get_severity_from_params (params);
  result_id = get_result_id_from_params (params);

  active = params_value (params, "active");
  days = params_value (params, "days");

  CHECK_PARAM_INVALID (oid, "Save Note");
  CHECK_PARAM_INVALID (active, "Save Note");
  CHECK_PARAM_INVALID (note_id, "Save Note");
  CHECK_PARAM_INVALID (days, "Save Note");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<modify_note note_id=\"%s\">"
                "<active>%s</active>"
                "<hosts>%s</hosts>"
                "<port>%s</port>"
                "<severity>%s</severity>"
                "<text>%s</text>"
                "<task id=\"%s\"/>"
                "<result id=\"%s\"/>"
                "<nvt oid=\"%s\"/>"
                "</modify_note>",
                note_id,
                strcmp (active, "1")
                 ? active
                 : (days ? days : "-1"),
                hosts ? hosts : "",
                port ? port : "",
                severity ? severity : "",
                text ? text : "",
                task_id ? task_id : "",
                result_id ? result_id : "",
                oid))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "The note remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "It is unclear whether the note has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "It is unclear whether the note has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Save Note", response_data);

  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Get all overrides, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_overrides (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
               const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "override", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all overrides, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_overrides_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return get_overrides (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get a override, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_override (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
              const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "override", credentials, params, extra_xml,
                  "result=\"1\"", response_data);
}

/**
 * @brief Get an override, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_override_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return get_override (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create an override, get report, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_override_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
{
  char *ret;
  gchar *response;
  const char *oid, *severity, *custom_severity, *new_severity, *port, *hosts;
  const char *text, *task_id, *result_id;
  /* For get_report. */
  const char *active, *days;
  entity_t entity;

  oid = params_value (params, "oid");
  CHECK_PARAM_INVALID (oid, "Create Override");

  port = get_port_from_params (params);
  hosts = get_hosts_from_params (params);
  task_id = get_task_id_from_params (params);
  severity = get_severity_from_params (params);
  result_id = get_result_id_from_params (params);

  custom_severity = params_value (params, "custom_severity");
  CHECK_PARAM_INVALID (custom_severity, "Create Override");

  if (custom_severity != NULL && strcmp (custom_severity, "0"))
    {
      if (params_valid (params, "new_severity"))
        new_severity = params_value (params, "new_severity");
      else if (params_original_value (params, "new_severity") == NULL
               || strcmp (params_original_value (params, "new_severity"), ""))
        new_severity = NULL;
      else
        new_severity = "";
      CHECK_PARAM_INVALID (new_severity, "Create Override");
    }
  else
    {
      if (params_valid (params, "new_severity_from_list"))
        new_severity = params_value (params, "new_severity_from_list");
      else if (params_original_value (params, "new_severity_from_list") == NULL
               || strcmp (params_original_value (params,
                                                 "new_severity_from_list"),
                          ""))
        new_severity = NULL;
      else
        new_severity = "";
      CHECK_PARAM_INVALID (new_severity, "Create Override");
    }


  active = params_value (params, "active");
  CHECK_PARAM_INVALID (active, "Create Override");

  text = params_value (params, "text");
  days = params_value (params, "days");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_override>"
                "<active>%s</active>"
                "<nvt oid=\"%s\"/>"
                "<hosts>%s</hosts>"
                "<port>%s</port>"
                "<severity>%s</severity>"
                "<new_severity>%s</new_severity>"
                "<text>%s</text>"
                "<task id=\"%s\"/>"
                "<result id=\"%s\"/>"
                "</create_override>",
                strcmp (active, "1")
                 ? active
                 : (days ? days : "-1"),
                oid,
                hosts ? hosts : "",
                port ? port : "",
                severity ? severity : "",
                new_severity,
                text ? text : "",
                task_id ? task_id : "",
                result_id ? result_id : ""))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new override. "
                             "No new override was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new override. "
                             "It is unclear whether the override has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new override. "
                             "It is unclear whether the override has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "override_id", entity_attribute (entity, "id"));
  ret = response_from_entity (connection, credentials, params, entity,
                              "Create Override", response_data);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete override, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_override_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return delete_resource (connection, "override", credentials, params, 0, NULL,
                          response_data);
}

/**
 * @brief Delete a override, get all overrides, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_override_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                           cmd_response_data_t* response_data)
{
  return delete_resource (connection, "override", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Edit override, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_override (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, const char *extra_xml,
               cmd_response_data_t* response_data)
{
  GString *xml;
  const char *override_id;

  override_id = params_value (params, "override_id");

  if (gvm_connection_sendf (connection,
                            "<get_overrides"
                            " override_id=\"%s\""
                            " details=\"1\""
                            " result=\"1\"/>",
                            override_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing an override. "
                           "The override remains as it was. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("");

  xml_string_append (xml, "<edit_override>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing an override. "
                           "The override remains as it was. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_override>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Edit override, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_override_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return edit_override (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Save override, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_override_gmp (gvm_connection_t *connection, credentials_t * credentials,
                   params_t *params, cmd_response_data_t* response_data)
{
  gchar *response;
  entity_t entity;
  const char  *override_id, *text, *hosts, *port;
  const char *severity, *custom_severity, *new_severity;
  const char *task_id, *result_id, *active, *days, *oid;
  char *ret;

  override_id = params_value (params, "override_id");

  port = get_port_from_params (params);
  hosts = get_hosts_from_params (params);
  task_id = get_task_id_from_params (params);
  severity = get_severity_from_params (params);
  result_id = get_result_id_from_params (params);

  text = params_value (params, "text");
  if (text == NULL)
    params_given (params, "text") || (text = "");

  custom_severity = params_value (params, "custom_severity");
  if (custom_severity && strcmp (custom_severity, "0") != 0)
    new_severity = params_value (params, "new_severity");
  else
    new_severity = params_value (params, "new_severity_from_list");

  active = params_value (params, "active");
  days = params_value (params, "days");
  oid = params_value (params, "oid");

  CHECK_PARAM_INVALID (active, "Save Override");
  CHECK_PARAM_INVALID (override_id, "Save Override");
  CHECK_PARAM_INVALID (new_severity, "Save Override");
  CHECK_PARAM_INVALID (days, "Save Override");
  CHECK_PARAM_INVALID (oid, "Save Override");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<modify_override override_id=\"%s\">"
                "<active>%s</active>"
                "<nvt oid=\"%s\"/>"
                "<hosts>%s</hosts>"
                "<port>%s</port>"
                "<severity>%s</severity>"
                "<new_severity>%s</new_severity>"
                "<text>%s</text>"
                "<task id=\"%s\"/>"
                "<result id=\"%s\"/>"
                "</modify_override>",
                override_id,
                strcmp (active, "1")
                 ? active
                 : (days ? days : "-1"),
                oid,
                hosts ? hosts : "",
                port ? port : "",
                severity ? severity : "",
                new_severity,
                text ? text : "",
                task_id ? task_id : "",
                result_id ? result_id : ""))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a override. "
                             "The override remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a override. "
                             "It is unclear whether the override has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a override. "
                             "It is unclear whether the override has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Save Override", response_data);

  free_entity (entity);
  g_free (response);
  return ret;
}


/* Scanners. */

/**
 * @brief Get all scanners, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_scanners (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
               const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "scanner", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all scanners, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_scanners_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return get_scanners (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get one scanner, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_scanner (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
              const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "scanner", credentials, params, extra_xml, NULL,
                  response_data);
}

/**
 * @brief Get one scanner, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_scanner_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  return get_scanner (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Export a scanner.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Scanner XML on success.  Enveloped XML on error.
 */
char *
export_scanner_gmp (gvm_connection_t *connection,
                    credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return export_resource (connection, "scanner", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of scanners.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Scanners XML on success. Enveloped XML on error.
 */
char *
export_scanners_gmp (gvm_connection_t *connection,
                     credentials_t *credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return export_many (connection, "scanner", credentials, params,
                      response_data);
}

/**
 * @brief Verify scanner, get scanners, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
verify_scanner_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char *scanner_id, *next;
  int ret;
  entity_t entity;

  scanner_id = params_value (params, "scanner_id");
  CHECK_PARAM_INVALID (scanner_id, "Verify Scanner");


  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<verify_scanner scanner_id=\"%s\"/>",
              scanner_id);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a scanner. "
                             "The scanner was not verified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a scanner. "
                             "It is unclear whether the scanner was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a scanner. "
                             "It is unclear whether the scanner was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
    }

  if (gmp_success (entity))
    {
      html = next_page (connection, credentials, params, response, response_data);
      if (html == NULL)
        {
          free_entity (entity);
          g_free (response);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while verifying a scanner. "
                               "It is unclear whether the scanner was verified or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }
  else
    {
      set_http_status_from_entity (entity, response_data);
      next = params_value (params, "next");
      if (next && !strcmp (next, "get_scanner"))
        html = get_scanner (connection, credentials, params, response, response_data);
      else
        html = get_scanners (connection, credentials, params, response, response_data);
    }

  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Create a scanner, get all scanners, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_scanner_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  int ret;
  char *html;
  gchar *response = NULL;
  const char *name, *comment, *host, *port, *type, *ca_pub, *credential_id;
  entity_t entity = NULL;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  host = params_value (params, "scanner_host");
  port = params_value (params, "port");
  type = params_value (params, "scanner_type");
  ca_pub = params_value (params, "ca_pub");
  credential_id = params_value (params, "credential_id");
  CHECK_PARAM_INVALID (name, "Create Scanner");
  CHECK_PARAM_INVALID (comment, "Create Scanner");
  CHECK_PARAM_INVALID (host, "Create Scanner");
  CHECK_PARAM_INVALID (port, "Create Scanner");
  CHECK_PARAM_INVALID (type, "Create Scanner");
  if (params_given (params, "ca_pub"))
    CHECK_PARAM_INVALID (ca_pub, "Create Scanner");
  CHECK_PARAM_INVALID (credential_id, "Create Scanner");

  if (ca_pub)
    ret = gmpf (connection, credentials, &response, &entity, response_data,
                "<create_scanner>"
                "<name>%s</name><comment>%s</comment>"
                "<host>%s</host><port>%s</port><type>%s</type>"
                "<ca_pub>%s</ca_pub>"
                "<credential id=\"%s\"/>"
                "</create_scanner>",
                name, comment, host, port, type, ca_pub, credential_id);
  else
    ret = gmpf (connection, credentials, &response, &entity, response_data,
                "<create_scanner>"
                "<name>%s</name><comment>%s</comment>"
                "<host>%s</host><port>%s</port><type>%s</type>"
                "<credential id=\"%s\"/>"
                "</create_scanner>",
                name, comment, host, port, type, credential_id);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message
                (credentials, "Internal error", __FUNCTION__, __LINE__,
                 "An internal error occurred while creating a new scanner. "
                 "No new scanner was created. "
                 "Diagnostics: Failure to send command to manager daemon.",
                 response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message
                (credentials, "Internal error", __FUNCTION__, __LINE__,
                 "An internal error occurred while creating a new scanner. "
                 "It is unclear whether the scanner has been created or not. "
                 "Diagnostics: Failure to receive response from manager daemon.",
                 response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message
                (credentials, "Internal error", __FUNCTION__, __LINE__,
                 "An internal error occurred while creating a new scanner. "
                 "It is unclear whether the scanner has been created or not. "
                 "Diagnostics: Internal Error.",
                 response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "scanner_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Scanner", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete a scanner, get all scanners, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_scanner_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return delete_resource (connection, "scanner", credentials, params, 0, "get_scanners",
                          response_data);
}

/**
 * @brief Delete a trash scanner, get all scanners, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_scanner_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                          cmd_response_data_t* response_data)
{
  return delete_resource (connection, "scanner", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Setup edit_scanner XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_scanner (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, char *extra_xml,
              cmd_response_data_t* response_data)
{
  GString *xml;
  const char *scanner_id, *next;

  scanner_id = params_value (params, "scanner_id");
  next = params_value (params, "next");

  if (scanner_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a scanner. "
                           "The scanner remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  if (next == NULL)
    next = "get_scanner";

  if (gvm_connection_sendf (connection,
                            "<commands>"
                            "<get_scanners scanner_id=\"%s\" details=\"1\" />"
                            "<get_credentials filter=\"first=1 rows=-1\" />"
                            "</commands>",
                            scanner_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting scanner info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  xml = g_string_new ("");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append_printf (xml,
                          "<edit_scanner>"
                          "<scanner id=\"%s\"/>"
                          /* Page that follows. */
                          "<next>%s</next>",
                          scanner_id,
                          next);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting scanner info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_scanner>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Setup edit_scanner XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_scanner_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return edit_scanner (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Save scanner, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_scanner_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  gchar *response = NULL;
  entity_t entity = NULL;
  const char *scanner_id, *name, *comment, *port, *host, *type, *ca_pub;
  const char *credential_id, *which_cert;
  char *html;
  int ret, is_unix_socket, in_use;

  scanner_id = params_value (params, "scanner_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  host = params_value (params, "scanner_host");
  is_unix_socket = (host && *host == '/') ? 1 : 0;
  port = params_value (params, "port");
  type = params_value (params, "scanner_type");
  which_cert = params_value (params, "which_cert");
  ca_pub = params_value (params, "ca_pub");
  credential_id = params_value (params, "credential_id");
  CHECK_PARAM_INVALID (scanner_id, "Edit Scanner");
  CHECK_PARAM_INVALID (name, "Edit Scanner");
  if (params_given (params, "scanner_host") == 0)
    in_use = 1;
  else
   {
     in_use = 0;
     CHECK_PARAM_INVALID (host, "Edit Scanner");
     CHECK_PARAM_INVALID (port, "Edit Scanner");
     CHECK_PARAM_INVALID (type, "Edit Scanner");
   }
  if (is_unix_socket == 0)
    {
      CHECK_PARAM_INVALID (ca_pub, "Edit Scanner");
      CHECK_PARAM_INVALID (credential_id, "Edit Scanner");
      CHECK_PARAM_INVALID (which_cert, "Edit Scanner");
    }

  if (is_unix_socket)
    {
      ret = gmpf (connection, credentials, &response, &entity, response_data,
                  "<modify_scanner scanner_id=\"%s\">"
                  "<name>%s</name>"
                  "<comment>%s</comment>"
                  "</modify_scanner>",
                  scanner_id, name, comment ?: "");
    }
  else if (strcmp (which_cert, "new") == 0
           || strcmp (which_cert, "default") == 0)
    {
      if (ca_pub == NULL)
        ca_pub = "";
      if (in_use)
        ret = gmpf (connection, credentials, &response, &entity, response_data,
                    "<modify_scanner scanner_id=\"%s\">"
                    "<name>%s</name>"
                    "<comment>%s</comment>"
                    "<ca_pub>%s</ca_pub>"
                    "<credential id=\"%s\"/>"
                    "</modify_scanner>",
                    scanner_id, name, comment ?: "",
                    strcmp (which_cert, "new") == 0 ? ca_pub : "",
                    credential_id);
      else
        ret = gmpf (connection, credentials, &response, &entity, response_data,
                    "<modify_scanner scanner_id=\"%s\">"
                    "<name>%s</name>"
                    "<comment>%s</comment>"
                    "<host>%s</host>"
                    "<port>%s</port>"
                    "<type>%s</type>"
                    "<ca_pub>%s</ca_pub>"
                    "<credential id=\"%s\"/>"
                    "</modify_scanner>",
                    scanner_id, name, comment ?: "", host, port, type,
                    strcmp (which_cert, "new") == 0 ? ca_pub : "",
                    credential_id);
    }
  else
    {
      /* Using existing CA cert. */
      if (in_use)
        ret = gmpf (connection, credentials, &response, &entity, response_data,
                    "<modify_scanner scanner_id=\"%s\">"
                    "<name>%s</name>"
                    "<comment>%s</comment>"
                    "<credential id=\"%s\"/>"
                    "</modify_scanner>",
                    scanner_id, name, comment ?: "", credential_id);
      else
        ret = gmpf (connection, credentials, &response, &entity, response_data,
                    "<modify_scanner scanner_id=\"%s\">"
                    "<name>%s</name>"
                    "<comment>%s</comment>"
                    "<host>%s</host>"
                    "<port>%s</port>"
                    "<type>%s</type>"
                    "<credential id=\"%s\"/>"
                    "</modify_scanner>",
                    scanner_id, name, comment ?: "", host, port, type,
                    credential_id);
    }

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message
                (credentials, "Internal error", __FUNCTION__, __LINE__,
                 "An internal error occurred while saving a scanner. "
                 "The scanner remains the same. "
                 "Diagnostics: Failure to send command to manager daemon.",
                 response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message
                (credentials, "Internal error", __FUNCTION__, __LINE__,
                 "An internal error occurred while saving a scanner. "
                 "It is unclear whether the scanner has been saved or not. "
                 "Diagnostics: Failure to receive response from manager daemon.",
                 response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message
                (credentials, "Internal error", __FUNCTION__, __LINE__,
                 "An internal error occurred while saving a scanner. "
                 "It is unclear whether the scanner has been saved or not. "
                 "Diagnostics: Internal Error.",
                 response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Scanner", response_data);

  free_entity (entity);
  g_free (response);
  return html;
}


/* Schedules. */

/**
 * @brief Get one schedule, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_schedule (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
              const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "schedule", credentials, params, extra_xml, "tasks=\"1\"",
                  response_data);
}

/**
 * @brief Get one schedule, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_schedule_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return get_schedule (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all schedules, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_schedules (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
               const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "schedule", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all schedules, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_schedules_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return get_schedules (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create a schedule, get all schedules, envelope the result.
 * @param[in]  connection     Connection to manager.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_schedule_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
{
  char *ret;
  gchar *response;
  const char *name, *comment, *timezone, *icalendar;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  timezone = params_value (params, "timezone");
  icalendar = params_value (params, "icalendar");

  CHECK_PARAM_INVALID (name, "Create Schedule");
  CHECK_PARAM_INVALID (comment, "Create Schedule");
  CHECK_PARAM_INVALID (timezone, "Create Schedule");
  CHECK_PARAM_INVALID (icalendar, "Create Schedule");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_schedule>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<timezone>%s</timezone>"
                "<icalendar>%s</icalendar>"
                "</create_schedule>",
                name,
                comment,
                timezone,
                icalendar))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new schedule. "
                             "No new schedule was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new schedule. "
                             "It is unclear whether the schedule has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new schedule. "
                             "It is unclear whether the schedule has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "schedule_id", entity_attribute (entity, "id"));
  ret = response_from_entity (connection, credentials, params, entity,
                              "Create Schedule", response_data);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete a schedule, get all schedules, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_schedule_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return delete_resource (connection, "schedule", credentials, params, 0, "get_schedules",
                          response_data);
}

/**
 * @brief Get all system reports, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_system_reports_gmp (gvm_connection_t *connection,
                        credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  GString *xml;
  time_t now, duration, duration_start;
  struct tm start_time, end_time;

  const char *slave_id, *given_duration, *range_type;
  const char *start_year, *start_month, *start_day, *start_hour, *start_minute;
  const char *end_year, *end_month, *end_day, *end_hour, *end_minute;

  slave_id = params_value (params, "slave_id");

  now = time (NULL);

  given_duration = params_value (params, "duration");
  range_type = params_value (params, "range_type");
  if (!range_type)
    range_type = "duration";

  duration = given_duration ? atoi (given_duration) : 86400;
  duration_start = now - duration;

  xml = g_string_new ("<get_system_reports>");

  g_string_append_printf (xml,
                          "<slave id=\"%s\"/>",
                          slave_id ? slave_id : "0");

  if (strcmp (range_type, "duration") == 0)
    {
      struct tm *time_broken;
      time_broken = localtime (&now);
      end_time.tm_year = time_broken->tm_year;
      end_time.tm_mon = time_broken->tm_mon;
      end_time.tm_mday = time_broken->tm_mday;
      end_time.tm_hour = time_broken->tm_hour;
      end_time.tm_min = time_broken->tm_min;

      time_broken = localtime (&duration_start);
      start_time.tm_year = time_broken->tm_year;
      start_time.tm_mon = time_broken->tm_mon;
      start_time.tm_mday = time_broken->tm_mday;
      start_time.tm_hour = time_broken->tm_hour;
      start_time.tm_min = time_broken->tm_min;

      g_string_append_printf (xml,
                              "<duration>%ld</duration>",
                              duration);
    }
  else
    {
      struct tm *time_broken;
      time_broken = localtime (&now);

      start_year = params_value (params, "start_year");
      start_month = params_value (params, "start_month");
      start_day = params_value (params, "start_day");
      start_hour = params_value (params, "start_hour");
      start_minute = params_value (params, "start_minute");

      end_year = params_value (params, "end_year");
      end_month = params_value (params, "end_month");
      end_day = params_value (params, "end_day");
      end_hour = params_value (params, "end_hour");
      end_minute = params_value (params, "end_minute");

      start_time.tm_year = start_year ? atoi (start_year) - 1900
                                      : time_broken->tm_year;
      start_time.tm_mon = start_month ? atoi (start_month) - 1
                                      : time_broken->tm_mon;
      start_time.tm_mday = start_day ? atoi (start_day)
                                     : time_broken->tm_mday;
      start_time.tm_hour = start_hour ? atoi (start_hour)
                                      : time_broken->tm_hour;
      start_time.tm_min = start_minute ? atoi (start_minute)
                                       : time_broken->tm_min;

      end_time.tm_year = end_year ? atoi (end_year) - 1900
                                  : time_broken->tm_year;
      end_time.tm_mon = end_month ? atoi (end_month) - 1
                                  : time_broken->tm_mon;
      end_time.tm_mday = end_day ? atoi (end_day)
                                 : time_broken->tm_mday;
      end_time.tm_hour = end_hour ? atoi (end_hour)
                                  : time_broken->tm_hour;
      end_time.tm_min = end_minute ? atoi (end_minute)
                                   : time_broken->tm_min;
    }

    g_string_append_printf (xml,
                            "<start_time>"
                            "<minute>%i</minute>"
                            "<hour>%i</hour>"
                            "<day_of_month>%i</day_of_month>"
                            "<month>%i</month>"
                            "<year>%i</year>"
                            "</start_time>",
                            start_time.tm_min,
                            start_time.tm_hour,
                            start_time.tm_mday,
                            start_time.tm_mon + 1,
                            start_time.tm_year + 1900);


    g_string_append_printf (xml,
                            "<end_time>"
                            "<minute>%i</minute>"
                            "<hour>%i</hour>"
                            "<day_of_month>%i</day_of_month>"
                            "<month>%i</month>"
                            "<year>%i</year>"
                            "</end_time>"
                            "<range_type>%s</range_type>",
                            end_time.tm_min,
                            end_time.tm_hour,
                            end_time.tm_mday,
                            end_time.tm_mon + 1,
                            end_time.tm_year + 1900,
                            range_type);



  /* Get the system reports. */

  if (gvm_connection_sendf (connection,
                            "<get_system_reports brief=\"1\" slave_id=\"%s\"/>",
                            slave_id ? slave_id : "0")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the system reports. "
                           "The current list of system reports is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the system reports. "
                           "The current list of system reports is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (command_enabled (credentials, "GET_SCANNERS"))
    {
      /* Get the GMP scanners. */

      if (gvm_connection_sendf (connection,
                                "<get_scanners"
                                " filter=\"sort=name rows=-1 type=4\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the system reports. "
                               "The current list of system reports is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }

      if (read_string_c (connection, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the system reports. "
                               "The current list of system reports is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_system_reports>");
  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Return system report image.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Credentials of user issuing the action.
 * @param[in]   url                  URL of report image.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Image, or NULL.
 */
char *
get_system_report_gmp (gvm_connection_t *connection,
                       credentials_t *credentials, const char *url,
                       params_t *params,
                       cmd_response_data_t* response_data)
{
  entity_t entity;
  entity_t report_entity;
  char name[501];
  gchar *gmp_command;
  time_t now;
  struct tm *now_broken;
  const char *slave_id, *duration;
  const char *start_year, *start_month, *start_day, *start_hour, *start_minute;
  const char *end_year, *end_month, *end_day, *end_hour, *end_minute;
  struct tm start_time, end_time;
  gchar *start_time_str, *end_time_str;


  if (url == NULL)
    return NULL;

  /* fan/report.png */
  if (sscanf (url, "%500[^ /]./report.png", name) == 1)
    {
    slave_id = params_value (params, "slave_id");

    duration = params_value (params, "duration");

    if (duration && strcmp (duration, ""))
      {
        gmp_command
        = g_markup_printf_escaped ("<get_system_reports"
                                    " name=\"%s\""
                                    " duration=\"%s\""
                                    " slave_id=\"%s\"/>",
                                    name,
                                    duration,
                                    slave_id ? slave_id : "0");
      }
    else
      {
        now = time (NULL);
        now_broken = localtime (&now);

        start_year = params_value (params, "start_year");
        start_month = params_value (params, "start_month");
        start_day = params_value (params, "start_day");
        start_hour = params_value (params, "start_hour");
        start_minute = params_value (params, "start_minute");

        end_year = params_value (params, "end_year");
        end_month = params_value (params, "end_month");
        end_day = params_value (params, "end_day");
        end_hour = params_value (params, "end_hour");
        end_minute = params_value (params, "end_minute");

        start_time.tm_year = start_year ? atoi (start_year) - 1900
                                        : now_broken->tm_year;
        start_time.tm_mon = start_month ? atoi (start_month) - 1
                                        : now_broken->tm_mon;
        start_time.tm_mday = start_day ? atoi (start_day) : now_broken->tm_mday;
        start_time.tm_hour = start_hour ? atoi (start_hour) : now_broken->tm_hour;
        start_time.tm_min = start_minute ? atoi (start_minute) : now_broken->tm_min;
        start_time.tm_zone = now_broken->tm_zone;

        end_time.tm_year = end_year ? atoi (end_year) - 1900
                                      : now_broken->tm_year;
        end_time.tm_mon = end_month ? atoi (end_month) - 1
                                      : now_broken->tm_mon;
        end_time.tm_mday = end_day ? atoi (end_day) : now_broken->tm_mday;
        end_time.tm_hour = end_hour ? atoi (end_hour) : now_broken->tm_hour;
        end_time.tm_min = end_minute ? atoi (end_minute) : now_broken->tm_min;
        end_time.tm_zone = now_broken->tm_zone;


        start_time_str
        = g_strdup_printf ("%04d-%02d-%02dT%02d:%02d:00",
                            start_time.tm_year + 1900,
                            start_time.tm_mon + 1,
                            start_time.tm_mday,
                            start_time.tm_hour,
                            start_time.tm_min);

        end_time_str
        = g_strdup_printf ("%04d-%02d-%02dT%02d:%02d:00",
                            end_time.tm_year + 1900,
                            end_time.tm_mon + 1,
                            end_time.tm_mday,
                            end_time.tm_hour,
                            end_time.tm_min);

        gmp_command
        = g_markup_printf_escaped ("<get_system_reports"
                                    " name=\"%s\""
                                    " start_time=\"%s\""
                                    " end_time=\"%s\""
                                    " slave_id=\"%s\"/>",
                                    name,
                                    start_time_str,
                                    end_time_str,
                                    slave_id ? slave_id : "0");
        g_free (start_time_str);
        g_free (end_time_str);
      }

      if (gvm_connection_sendf (connection,
                                "%s",
                                gmp_command)
          == -1)
        {
          g_free (gmp_command);
          return NULL;
        }
      g_free (gmp_command);

      entity = NULL;
      if (read_entity_c (connection, &entity))
        {
          return NULL;
        }

      report_entity = entity_child (entity, "system_report");
      if (report_entity == NULL)
        {
          free_entity (entity);
          return NULL;
        }

      report_entity = entity_child (report_entity, "report");
      if (report_entity == NULL)
        {
          free_entity (entity);
          return NULL;
        }
      else
        {
          char *content_64 = entity_text (report_entity);
          char *content = NULL;
          gsize content_length = 0;

          if (content_64 && strlen (content_64))
            {
              content = (char *) g_base64_decode (content_64,
                                                  &content_length);

#if 1
              cmd_response_data_set_content_type (response_data,
                                                  GSAD_CONTENT_TYPE_IMAGE_PNG);
              //*content_disposition = g_strdup_printf ("attachment; filename=\"xxx.png\"");
#else
              g_free (content);
              content = g_strdup ("helo");
#endif
            }

          cmd_response_data_set_content_length (response_data,
                                                content_length);
          free_entity (entity);
          return content;
       }
    }

  return NULL;
}

/**
 * @brief Get one report format, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_report_format (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params,
                   const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "report_format", credentials, params, extra_xml,
                  "alerts =\"1\" params=\"1\"", response_data);
}

/**
 * @brief Get one report format, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_report_format_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return get_report_format (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all Report Formats, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_report_formats (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "report_format", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all Report Formats, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_report_formats_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return get_report_formats (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Delete report format, get report formats, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_report_format_gmp (gvm_connection_t *connection,
                          credentials_t *credentials, params_t *params,
                          cmd_response_data_t* response_data)
{
  return delete_resource (connection, "report_format", credentials, params, 0,
                          "get_report_formats", response_data);
}

/**
 * @brief Setup edit_report_format XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
edit_report_format (gvm_connection_t *connection,
                    credentials_t *credentials,
                    params_t *params, const char *extra_xml,
                    cmd_response_data_t* response_data)
{
  gchar *all_rfs_response, *response, *ext_extra_xml;

  if (simple_gmpf (connection, "getting Report Formats",
                   credentials, &all_rfs_response, response_data,
                   "<get_report_formats"
                   " filter=\"rows=-1\"/>"))
    {
      return all_rfs_response;
    }

  ext_extra_xml = g_strdup_printf ("%s"
                                   "<all_formats>%s</all_formats>",
                                   extra_xml ? extra_xml : "",
                                   all_rfs_response);
  g_free (all_rfs_response);

  response = edit_resource (connection, "report_format", credentials, params,
                            NULL, ext_extra_xml, response_data);
  g_free (ext_extra_xml);
  return response;
}

/**
 * @brief Setup edit_report_format XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_report_format_gmp (gvm_connection_t *connection,
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return edit_report_format (connection, credentials, params, NULL,
                             response_data);
}

/**
 * @brief Import report format, get all report formats, envelope result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
import_report_format_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                          cmd_response_data_t* response_data)
{
  gchar *command, *html, *response;
  entity_t entity;
  int ret;

  /* Create the report format. */

  response = NULL;
  entity = NULL;
  command = g_strdup_printf ("<create_report_format>"
                             "%s"
                             "</create_report_format>",
                             params_value (params, "xml_file"));
  ret = gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a report format. "
                             "The schedule remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a report format. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a report format. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  /* Cleanup, and return transformed XML. */

  if (entity_attribute (entity, "id"))
    params_add (params, "report_format_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Report Format", response_data);

  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Save report_format, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[out] response_data     Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_report_format_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  params_t *preferences, *id_list_params, *include_id_lists;
  const char  *report_format_id, *name, *summary, *enable;
  entity_t entity;

  report_format_id = params_value (params, "report_format_id");
  name = params_value (params, "name");
  summary = params_value (params, "summary");
  enable = params_value (params, "enable");

  CHECK_PARAM_INVALID (report_format_id, "Save Report Format");
  CHECK_PARAM_INVALID (name, "Save Report Format");
  CHECK_PARAM_INVALID (summary, "Save Report Format");
  CHECK_PARAM_INVALID (enable, "Save Report Format");

  id_list_params = params_values (params, "id_list:");
  include_id_lists = params_values (params, "include_id_list:");
  if (include_id_lists)
    {
      GHashTable *id_lists;
      param_t *param;
      gchar *param_name, *pref_name, *value, *old_values, *new_values;
      params_iterator_t iter;
      GHashTableIter hash_table_iter;

      id_lists = g_hash_table_new_full (g_str_hash, g_str_equal,
                                        g_free, g_free);

      params_iterator_init (&iter, include_id_lists);
      while (params_iterator_next (&iter, &param_name, &param))
        {
          if (param->value == NULL)
            continue;

          g_hash_table_insert (id_lists, g_strdup (param_name), g_strdup (""));
        }

      params_iterator_init (&iter, id_list_params);
      while (params_iterator_next (&iter, &param_name, &param))
        {
          if (param->value == NULL)
            continue;

          gchar *colon_pos = strchr (param->value, ':');

          pref_name = g_strndup (param->value, colon_pos - param->value);
          value = g_strdup (colon_pos + 1);

          old_values = g_hash_table_lookup (id_lists, pref_name);

          if (old_values && strcmp (old_values, ""))
            {
              new_values = g_strdup_printf ("%s,%s", old_values, value);
              g_hash_table_insert (id_lists, pref_name, new_values);
              g_free (value);
            }
          else if (old_values)
            {
              g_hash_table_insert (id_lists, pref_name, value);
            }
        }

      g_hash_table_iter_init (&hash_table_iter, id_lists);
      while (g_hash_table_iter_next (&hash_table_iter,
                                     (void**)&pref_name, (void**)&value))
        {
          gchar *value_64;

          value_64 = strlen (value)
                      ? g_base64_encode ((guchar *) value, strlen (value))
                      : g_strdup ("");

          response = NULL;
          entity = NULL;
          ret = gmpf (connection, credentials,
                      &response,
                      &entity,
                      response_data,
                      "<modify_report_format"
                      " report_format_id=\"%s\">"
                      "<param>"
                      "<name>%s</name>"
                      "<value>%s</value>"
                      "</param>"
                      "</modify_report_format>",
                      report_format_id,
                      pref_name,
                      value_64);
          g_free (value_64);
          switch (ret)
            {
              case 0:
                break;
              case 1:
                cmd_response_data_set_status_code (response_data,
                                                   MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (credentials,
                                      "Internal error", __FUNCTION__, __LINE__,
                                      "An internal error occurred while saving a Report Format. "
                                      "The Report Format was not saved. "
                                      "Diagnostics: Failure to send command to manager daemon.",
                                      response_data);
              case 2:
                cmd_response_data_set_status_code (response_data,
                                                   MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (credentials,
                                      "Internal error", __FUNCTION__, __LINE__,
                                      "An internal error occurred while saving a Report Format. "
                                      "It is unclear whether the Report Format has been saved or not. "
                                      "Diagnostics: Failure to receive response from manager daemon.",
                                      response_data);
              case -1:
              default:
                cmd_response_data_set_status_code (response_data,
                                                   MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (credentials,
                                      "Internal error", __FUNCTION__, __LINE__,
                                      "An internal error occurred while saving a Report Format. "
                                      "It is unclear whether the Report Format has been saved or not. "
                                      "Diagnostics: Internal Error.",
                                      response_data);
            }

          /* TODO Check if succeeded.  response_from_entity_if_failed? */
        }
    }

  /* Modify the Report Format. */

  preferences = params_values (params, "preference:");
  if (preferences)
    {
      param_t *param;
      gchar *param_name;
      params_iterator_t iter;

      /* The naming is a bit subtle here, because the HTTP request
       * parameters are called "param"s and so are the GMP report format
       * parameters. */

      params_iterator_init (&iter, preferences);
      while (params_iterator_next (&iter, &param_name, &param))
        {
          int type_start, type_end, count;
          /* LDAPsearch[entry]:Timeout value */
          count = sscanf (param_name,
                          "%*[^[][%n%*[^]]%n]:",
                          &type_start,
                          &type_end);
          if (count == 0 && type_start > 0 && type_end > 0)
            {
              gchar *value;

              value = param->value_size
                      ? g_base64_encode ((guchar *) param->value,
                                         param->value_size)
                      : g_strdup ("");

              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials,
                          &response,
                          &entity,
                          response_data,
                          "<modify_report_format"
                          " report_format_id=\"%s\">"
                          "<param>"
                          "<name>%s</name>"
                          "<value>%s</value>"
                          "</param>"
                          "</modify_report_format>",
                          report_format_id,
                          param_name + type_end + 2,
                          value);
              g_free (value);
              switch (ret)
                {
                  case 0:
                    break;
                  case 1:
                    cmd_response_data_set_status_code (response_data,
                                                       MHD_HTTP_INTERNAL_SERVER_ERROR);
                    return gsad_message (credentials,
                                         "Internal error", __FUNCTION__, __LINE__,
                                         "An internal error occurred while saving a Report Format. "
                                         "The Report Format was not saved. "
                                         "Diagnostics: Failure to send command to manager daemon.",
                                         response_data);
                  case 2:
                    cmd_response_data_set_status_code (response_data,
                                                       MHD_HTTP_INTERNAL_SERVER_ERROR);
                    return gsad_message (credentials,
                                         "Internal error", __FUNCTION__, __LINE__,
                                         "An internal error occurred while saving a Report Format. "
                                         "It is unclear whether the Report Format has been saved or not. "
                                         "Diagnostics: Failure to receive response from manager daemon.",
                                         response_data);
                  case -1:
                  default:
                    cmd_response_data_set_status_code (response_data,
                                                       MHD_HTTP_INTERNAL_SERVER_ERROR);
                    return gsad_message (credentials,
                                         "Internal error", __FUNCTION__, __LINE__,
                                         "An internal error occurred while saving a Report Format. "
                                         "It is unclear whether the Report Format has been saved or not. "
                                         "Diagnostics: Internal Error.",
                                         response_data);
                }

              /* TODO Check if succeeded.  response_from_entity_if_failed? */
            }
         }
    }

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<modify_report_format"
              " report_format_id=\"%s\">"
              "<name>%s</name>"
              "<summary>%s</summary>"
              "<active>%s</active>"
              "</modify_report_format>",
              report_format_id,
              name,
              summary,
              enable);

  switch (ret)
    {
      case 0:
        break;
      case -1:
        return response;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Report Format. "
                             "The Report Format was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Report Format. "
                             "It is unclear whether the Report Format has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Report Format. "
                             "It is unclear whether the Report Format has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Report Format", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Verify report format, get report formats, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
verify_report_format_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                          cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char *report_format_id;
  entity_t entity;

  report_format_id = params_value (params, "report_format_id");
  if (report_format_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while verifying a report format. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  /* Verify the report format. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<verify_report_format report_format_id=\"%s\"/>",
              report_format_id);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a report format. "
                             "The report format was not verified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a report format. "
                             "It is unclear whether the report format was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a report format. "
                             "It is unclear whether the report format was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
    }

  if (gmp_success (entity))
    {
      html = next_page (connection, credentials, params, response, response_data);
      if (html == NULL)
        {
          free_entity (entity);
          g_free (response);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while verifying a report format. "
                               "It is unclear whether the report format was verified or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
    }
  else
    {
      set_http_status_from_entity (entity, response_data);
      html = get_report_formats (connection, credentials, params, response, response_data);
    }
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Run a wizard and envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
run_wizard_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  const char  *name;
  int ret;
  GString *run;
  param_t *param;
  gchar *param_name, *html, *response;
  params_iterator_t iter;
  params_t *wizard_params;
  entity_t entity;

  /* The naming is a bit subtle here, because the HTTP request
   * parameters are called "param"s and so are the GMP wizard
   * parameters. */

  name = params_value (params, "name");
  if (name == NULL)
    {

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while trying to start a wizard. "
                           "Diagnostics: Required parameter 'name' was NULL.",
                           response_data);
    }
  run = g_string_new ("<run_wizard>");

  g_string_append_printf (run,
                          "<name>%s</name>"
                          "<params>",
                          name);

  wizard_params = params_values (params, "event_data:");
  if (wizard_params)
    {
      params_iterator_init (&iter, wizard_params);
      while (params_iterator_next (&iter, &param_name, &param))
        xml_string_append (run,
                           "<param>"
                           "<name>%s</name>"
                           "<value>%s</value>"
                           "</param>",
                           param_name,
                           param->value);
    }

  g_string_append (run, "</params></run_wizard>");

  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials, &response, &entity, response_data, run->str);
  g_string_free (run, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "The wizard did not start. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Run Wizard", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

#define GET_TRASH_RESOURCE(capability, command, name)                         \
  if (command_enabled (credentials, capability))                              \
      {                                                                       \
        if (gvm_connection_sendf                                              \
             (connection,                                                     \
              "<" command                                                     \
              " filter=\"rows=-1 sort=name\""                                 \
              " trash=\"1\"/>")                                               \
            == -1)                                                            \
          {                                                                   \
            g_string_free (xml, TRUE);                                        \
            cmd_response_data_set_status_code (response_data,                 \
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);\
            return gsad_message                                               \
                    (credentials,                                             \
                     "Internal error", __FUNCTION__, __LINE__,                \
                     "An internal error occurred while getting "              \
                     name " list for trash."                                  \
                     "Diagnostics: Failure to send command to"                \
                     " manager daemon.",                                      \
                     response_data);                    \
          }                                                                   \
                                                                              \
        if (read_string_c (connection, &xml))                                 \
          {                                                                   \
            g_string_free (xml, TRUE);                                        \
            cmd_response_data_set_status_code (response_data,                 \
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);\
            return gsad_message                                               \
                    (credentials,                                             \
                     "Internal error", __FUNCTION__, __LINE__,                \
                     "An internal error occurred while getting " name " list."\
                     "Diagnostics: Failure to receive response from"          \
                     " manager daemon.",                                      \
                     response_data);                    \
          }                                                                   \
      }

/**
 * @brief Setup trash page XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_trash (gvm_connection_t *connection, credentials_t * credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  GString *xml;

  xml = g_string_new ("<get_trash>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  GET_TRASH_RESOURCE ("GET_AGENTS", "get_agents", "agents");

  GET_TRASH_RESOURCE ("GET_CONFIGS", "get_configs", "configs");

  GET_TRASH_RESOURCE ("GET_CREDENTIALS", "get_credentials", "credentials");

  GET_TRASH_RESOURCE ("GET_ALERTS", "get_alerts", "alerts");

  GET_TRASH_RESOURCE ("GET_GROUPS", "get_groups", "groups");

  GET_TRASH_RESOURCE ("GET_FILTERS", "get_filters", "filters");

  GET_TRASH_RESOURCE ("GET_NOTES", "get_notes", "notes");

  GET_TRASH_RESOURCE ("GET_OVERRIDES", "get_overrides", "overrides");

  GET_TRASH_RESOURCE ("GET_PERMISSIONS", "get_permissions", "permissions");

  GET_TRASH_RESOURCE ("GET_PORT_LISTS", "get_port_lists", "port lists");

  GET_TRASH_RESOURCE ("GET_REPORT_FORMATS", "get_report_formats",
                      "report formats");

  GET_TRASH_RESOURCE ("GET_ROLES", "get_roles", "roles");

  GET_TRASH_RESOURCE ("GET_SCANNERS", "get_scanners", "scanners");

  GET_TRASH_RESOURCE ("GET_SCHEDULES", "get_schedules", "schedules");

  GET_TRASH_RESOURCE ("GET_TAGS", "get_tags", "tags");

  GET_TRASH_RESOURCE ("GET_TARGETS", "get_targets", "targets");

  GET_TRASH_RESOURCE ("GET_TASKS", "get_tasks", "tasks");

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_trash>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}
#undef GET_TRASH_RESOURCE

/**
 * @brief Get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_trash_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return get_trash (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Returns page with user's settings.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_my_settings (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, const char *extra_xml,
                 cmd_response_data_t* response_data)
{
  GString *xml;

  xml = g_string_new ("<get_my_settings>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  /* Get the settings. */

  if (gvm_connection_sendf (connection,
                            "<get_settings"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</get_my_settings>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Returns page with user's settings.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_my_settings_gmp (gvm_connection_t *connection, credentials_t *
                     credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  GString *commands;
  int ret;
  gchar *response = NULL, *settings;

  commands = g_string_new ("<commands>");
  if (command_enabled (credentials, "GET_ALERTS"))
    g_string_append (commands, "<get_alerts/>");
  if (command_enabled (credentials, "GET_CONFIGS"))
    g_string_append (commands, "<get_configs/>");
  if (command_enabled (credentials, "GET_FILTERS"))
    g_string_append (commands, "<get_filters/>");
  if (command_enabled (credentials, "GET_CREDENTIALS"))
    g_string_append (commands, "<get_credentials/>");
  if (command_enabled (credentials, "GET_PORT_LISTS"))
    g_string_append (commands, "<get_port_lists/>");
  if (command_enabled (credentials, "GET_REPORT_FORMATS"))
    g_string_append (commands, "<get_report_formats/>");
  if (command_enabled (credentials, "GET_SCANNERS"))
    g_string_append (commands, "<get_scanners/>");
  if (command_enabled (credentials, "GET_SCHEDULES"))
    g_string_append (commands, "<get_schedules/>");
  if (command_enabled (credentials, "GET_TARGETS"))
    g_string_append (commands, "<get_targets/>");
  g_string_append (commands, "</commands>");

  /* Get Filters and other resource lists. */
  ret = gmp (connection, credentials, &response, NULL, response_data,
             commands->str);
  g_string_free (commands, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting resources "
                             "for the settings. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting resources "
                             "for the settings. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting resources "
                             "for the settings. "
                             "It is unclear whether the task has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  settings = get_my_settings (connection, credentials, params, response,
                              response_data);
  g_free (response);
  return settings;
}

/**
 * @brief Returns page with user's settings, for editing.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
edit_my_settings (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, const char *extra_xml,
                  cmd_response_data_t* response_data)
{
  GString *commands, *xml;
  int ret;
  gchar *filters_xml;
  entity_t entity;

  /* Get the Filters and other resources. */
  commands = g_string_new ("<commands>");
  if (command_enabled (credentials, "GET_ALERTS"))
    g_string_append (commands, "<get_alerts/>");
  if (command_enabled (credentials, "GET_CONFIGS"))
    g_string_append (commands, "<get_configs/>");
  if (command_enabled (credentials, "GET_CREDENTIALS"))
    g_string_append (commands, "<get_credentials/>");
  if (command_enabled (credentials, "GET_FILTERS"))
    g_string_append (commands, "<get_filters/>");
  if (command_enabled (credentials, "GET_PORT_LISTS"))
    g_string_append (commands, "<get_port_lists/>");
  if (command_enabled (credentials, "GET_REPORT_FORMAT"))
    g_string_append (commands, "<get_report_formats/>");
  if (command_enabled (credentials, "GET_SCANNERS"))
    g_string_append (commands, "<get_scanners/>");
  if (command_enabled (credentials, "GET_SCHEDULES"))
    g_string_append (commands, "<get_schedules/>");
  if (command_enabled (credentials, "GET_TARGETS"))
    g_string_append (commands, "<get_targets/>");
  g_string_append (commands, "</commands>");

  filters_xml = NULL;
  entity = NULL;
  ret = gmp (connection, credentials, &filters_xml, &entity, response_data,
             commands->str);
  g_string_free (commands, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting resources "
                             "for the settings. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting resources "
                             "for the alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting resources "
                             "for the settings. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }
  free_entity (entity);

  xml = g_string_new ("<edit_my_settings>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append (xml, filters_xml);
  g_free (filters_xml);

  /* Get the settings. */

  if (gvm_connection_sendf (connection,
                            "<get_settings"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</edit_my_settings>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Returns page with user's settings, for editing.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_my_settings_gmp (gvm_connection_t *connection, credentials_t *
                      credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  return edit_my_settings (connection, credentials, params, NULL,
                           response_data);
}

/**
 * @brief Send settings resource filters.
 *
 * @param[in]   connection          Connection to Manager.
 * @param[in]   data                Data.
 * @param[in]   changed             Params indicating which settings changed.
 * @param[out]  xml                 GString to write responses to.
 * @param[out]  modify_failed_flag  Pointer to an int to set to 1 on failure
 *                                  to modify one of the settings.
 * @return 0 on success, -1 on error.
 */
static int
send_settings_filters (gvm_connection_t *connection, params_t *data,
                       params_t *changed, GString *xml, int *modify_failed_flag,
                       cmd_response_data_t* response_data)
{
  if (data)
    {
      params_iterator_t iter;
      char *uuid;
      param_t *param;
      entity_t entity;

      params_iterator_init (&iter, data);
      while (params_iterator_next (&iter, &uuid, &param))
        {
          const char* changed_value = params_value (changed, uuid);
          if (changed_value == NULL
              || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
            {
              gchar *base64;
              if (param->value)
                base64 = g_base64_encode ((guchar*) param->value,
                                          strlen (param->value));
              else
                base64 = g_strdup("");
              if (gvm_connection_sendf_xml (connection,
                                            "<modify_setting setting_id=\"%s\">"
                                            "<value>%s</value>"
                                            "</modify_setting>",
                                            uuid,
                                            base64))
                {
                  g_free (base64);
                  return -1;
                }

              g_free (base64);

              entity = NULL;
              xml_string_append (xml,
                                 "<save_setting id=\"%s\">",
                                 uuid);
              if (read_entity_and_string_c (connection, &entity, &xml))
                {
                  free_entity (entity);
                  return -1;
                }
              xml_string_append (xml, "</save_setting>");
              if (! gmp_success (entity))
                {
                  set_http_status_from_entity (entity, response_data);
                  if (modify_failed_flag)
                    *modify_failed_flag = 1;
                }
              free_entity(entity);
            }
        }
    }
  return 0;
}

/**
 * @brief Returns page with user's settings, for editing.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  accept_language  Accept-Language, from browser.
 * @param[out] timezone     Timezone.  Caller must free.
 * @param[out] password     Password.  Caller must free.
 * @param[out] severity     Severity.  Caller must free.
 * @param[out] language     Language.  Caller must free.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_my_settings_gmp (gvm_connection_t *connection, credentials_t *
                      credentials, params_t *params,
                      const char *accept_language, char **timezone,
                      char **password, char **severity, char **language,
                      cmd_response_data_t* response_data)
{
  const char *lang, *text, *old_passwd, *passwd, *status, *max;
  const char *details_fname, *list_fname, *report_fname;
  gchar *lang_64, *text_64, *max_64, *fname_64;
  GString *xml;
  entity_t entity;
  params_t *changed, *defaults, *filters;
  int modify_failed = 0;
  const char *changed_value;

  changed = params_values (params, "settings_changed:");
  *timezone = NULL;
  *password = NULL;
  *severity = NULL;
  *language = NULL;

  text = params_value (params, "text");
  old_passwd = params_value (params, "old_password");
  passwd = params_value (params, "password");
  max = params_value (params, "max");
  lang = params_value (params, "lang");
  details_fname = params_value (params, "details_fname");
  list_fname = params_value (params, "list_fname");
  report_fname = params_value (params, "report_fname");

  if ((text == NULL)
      || (passwd == NULL)
      || (old_passwd == NULL)
      || (max == NULL)
      || (lang == NULL)
      || (details_fname == NULL)
      || (list_fname == NULL)
      || (report_fname == NULL))
    return edit_my_settings (connection, credentials, params,
                             GSAD_MESSAGE_INVALID_PARAM
                               ("Save My Settings"),
                             response_data);

  xml = g_string_new ("");

  changed_value = params_value (changed, "password");
  if ((strlen (passwd) || strlen (old_passwd))
      && (changed_value == NULL
          || (strcmp (changed_value, "") && strcmp (changed_value, "0"))))
    {
      gchar *passwd_64;
      gmp_authenticate_info_opts_t auth_opts;

      /* Send Password setting */

      auth_opts = gmp_authenticate_info_opts_defaults;
      auth_opts.username = credentials->username;
      auth_opts.password = old_passwd;
      switch (gmp_authenticate_info_ext_c (connection, auth_opts))
        {
          case 0:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving settings. "
                                 "The settings remains the same. "
                                 "Diagnostics: Manager closed connection during authenticate.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Invalid Password", __FUNCTION__, __LINE__,
                                 "You tried to change your password, but the old"
                                 " password was not provided or was incorrect. "
                                 " Please enter the correct old password or remove"
                                 " old and new passwords to apply any other changes"
                                 " of your settings.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving settings. "
                                 "The settings remains the same. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      passwd_64 = g_base64_encode ((guchar*) passwd, strlen (passwd));

      if (gvm_connection_sendf (connection,
                                "<modify_setting>"
                                "<name>Password</name>"
                                "<value>%s</value>"
                                "</modify_setting>",
                                passwd_64 ? passwd_64 : "")
          == -1)
        {
          g_free (passwd_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (passwd_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting name=\"Password\">");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");

      status = entity_attribute (entity, "status");
      if (status && (strlen (status) > 0) && (status[0] == '2'))
        {
          g_free (credentials->password);
          credentials->password = g_strdup (passwd);
          *password = g_strdup (passwd);
        }
      else
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send Timezone */
  changed_value = params_value (changed, "timezone");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text_64 = g_base64_encode ((guchar*) text, strlen (text));

      if (gvm_connection_sendf (connection,
                                "<modify_setting>"
                                "<name>Timezone</name>"
                                "<value>%s</value>"
                                "</modify_setting>",
                                text_64 ? text_64 : "")
          == -1)
        {
          g_free (text_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting name=\"Timezone\">");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");

      status = entity_attribute (entity, "status");
      if (status && (strlen (status) > 0) && (status[0] == '2'))
        {
          g_free (credentials->timezone);
          credentials->timezone = g_strdup (strlen (text) ? text : "UTC");
          *timezone = g_strdup (strlen (text) ? text : "UTC");

          /* Set the timezone, so that the ENVELOPE/TIME
           * uses the right timezone. */

          if (setenv ("TZ", credentials->timezone, 1) == -1)
            {
              g_critical ("%s: failed to set TZ\n", __FUNCTION__);
              exit (EXIT_FAILURE);
            }
          tzset ();
        }
      else
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send Rows Per Page */
  changed_value = params_value (changed, "max");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      max_64 = g_base64_encode ((guchar*) max, strlen (max));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"5f5a8712-8017-11e1-8556-406186ea4fc5\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                max_64 ? max_64 : "")
          == -1)
        {
          g_free (max_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (max_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "5f5a8712-8017-11e1-8556-406186ea4fc5");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (! gmp_success (entity))
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send resource details export file name format. */
  changed_value = params_value (changed, "details_fname");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      fname_64 = g_base64_encode ((guchar*) details_fname, strlen (details_fname));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"a6ac88c5-729c-41ba-ac0a-deea4a3441f2\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                fname_64 ? fname_64 : "")
          == -1)
        {
          g_free (fname_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (fname_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "a6ac88c5-729c-41ba-ac0a-deea4a3441f2");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (gmp_success (entity) != 1)
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send resource list export file name format. */
  changed_value = params_value (changed, "list_fname");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      fname_64 = g_base64_encode ((guchar*) list_fname, strlen (list_fname));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"0872a6ed-4f85-48c5-ac3f-a5ef5e006745\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                fname_64 ? fname_64 : "")
          == -1)
        {
          g_free (fname_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (fname_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "a6ac88c5-729c-41ba-ac0a-deea4a3441f2");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (gmp_success (entity) != 1)
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send report export file name format. */
  changed_value = params_value (changed, "report_fname");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      fname_64 = g_base64_encode ((guchar*) report_fname, strlen (report_fname));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"e1a2ae0b-736e-4484-b029-330c9e15b900\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                fname_64 ? fname_64 : "")
          == -1)
        {
          g_free (fname_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (fname_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "e1a2ae0b-736e-4484-b029-330c9e15b900");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (gmp_success (entity) != 1)
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send User Interface Language. */
  changed_value = params_value (changed, "lang");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      lang_64 = g_base64_encode ((guchar*) lang, strlen (lang));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"6765549a-934e-11e3-b358-406186ea4fc5\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                lang_64 ? lang_64 : "")
          == -1)
        {
          g_free (lang_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (lang_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "6765549a-934e-11e3-b358-406186ea4fc5");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (gmp_success (entity))
        {
          gchar *language_code;
          set_language_code (&language_code, lang);
          if (language_code)
            {
              g_free (credentials->language);
              credentials->language = language_code;
              *language = g_strdup (lang);
            }
          else
            {
              g_free (credentials->language);
              credentials->language = accept_language_to_env_fmt (accept_language);
              *language = NULL;
            }
        }
      else
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send default resources */

  defaults = params_values (params, "settings_default:");
  if (send_settings_filters (connection, defaults, changed, xml,
                             &modify_failed, response_data))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  /* Send resources filters */

  filters = params_values (params, "settings_filter:");
  if (send_settings_filters (connection, filters, changed, xml, &modify_failed,
                             response_data))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  /* Send Severity Class. */

  changed_value = params_value (changed, "severity_class");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text = params_value (params, "severity_class");
      text_64 = (text
                    ? g_base64_encode ((guchar*) text, strlen (text))
                    : g_strdup (""));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"f16bb236-a32d-4cd5-a880-e0fcf2599f59\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                text_64 ? text_64 : "")
          == -1)
        {
          g_free (text_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "f16bb236-a32d-4cd5-a880-e0fcf2599f59");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");

      status = entity_attribute (entity, "status");
      if (status && (strlen (status) > 0) && (status[0] == '2'))
        {
          g_free (credentials->severity);
          if ((text != NULL) && (strlen (text) > 0))
            {
              credentials->severity = g_strdup (text);
              *severity = g_strdup (text);
            }
        }
      else
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send Dynamic Severity setting. */

  changed_value = params_value (changed, "dynamic_severity");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text = params_value (params, "dynamic_severity");
      text_64 = (text
                    ? g_base64_encode ((guchar*) text, strlen (text))
                    : g_strdup (""));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"77ec2444-e7f2-4a80-a59b-f4237782d93f\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                text_64 ? text_64 : "")
          == -1)
        {
          g_free (text_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "77ec2444-e7f2-4a80-a59b-f4237782d93f");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (! gmp_success (entity))
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send Default Severity setting. */
  changed_value = params_value (changed, "default_severity");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text = params_value (params, "default_severity");
      text_64 = (text
                    ? g_base64_encode ((guchar*) text, strlen (text))
                    : g_strdup (""));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"7eda49c5-096c-4bef-b1ab-d080d87300df\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                text_64 ? text_64 : "")
          == -1)
        {
          g_free (text_64);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while saving settings. "
                              "It is unclear whether all the settings were saved. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "7eda49c5-096c-4bef-b1ab-d080d87300df");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (! gmp_success (entity))
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send Auto Cache Rebuild setting. */

  changed_value = params_value (changed, "auto_cache_rebuild");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text = params_value (params, "auto_cache_rebuild");
      text_64 = (text
                    ? g_base64_encode ((guchar*) text, strlen (text))
                    : g_strdup (""));

      if (gvm_connection_sendf (connection,
                                "<modify_setting"
                                " setting_id"
                                "=\"a09285b0-2d47-49b6-a4ef-946ee71f1d5c\">"
                                "<value>%s</value>"
                                "</modify_setting>",
                                text_64 ? text_64 : "")
          == -1)
        {
          g_free (text_64);
          gvm_connection_close (connection);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml,
                         "<save_setting id=\"%s\">",
                         "a09285b0-2d47-49b6-a4ef-946ee71f1d5c");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          gvm_connection_close (connection);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (! gmp_success (entity))
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  if (modify_failed)
    return edit_my_settings (connection, credentials, params,
                             g_string_free (xml, FALSE),
                             response_data);
  else
    return get_my_settings (connection, credentials, params,
                            g_string_free (xml, FALSE),
                            response_data);
}

/**
 * @brief Get GMP doc.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_protocol_doc_gmp (gvm_connection_t *connection, credentials_t *
                      credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  GString *xml;
  entity_t help_response;

  xml = g_string_new ("");
  g_string_append_printf (xml, "<get_protocol_doc>");

  /* Get the resource. */

  if (gvm_connection_sendf (connection, "<help format=\"XML\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the GMP doc. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  help_response = NULL;
  if (read_entity_and_string_c (connection, &help_response, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the GMP doc. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }
  free_entity (help_response);


  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</get_protocol_doc>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Download the GMP doc.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return XML on success.  Enveloped XML on error.
 */
char *
export_gmp_doc_gmp (gvm_connection_t *connection,
                    credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  entity_t entity, response;
  char *content = NULL;
  const char *format;
  time_t now;
  struct tm *tm;

  format = params_value (params, "protocol_format")
            ? params_value (params, "protocol_format")
            : "xml";

  if (gvm_connection_sendf (connection,
                            "<help format=\"%s\"/>",
                            format)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a list. "
                           "The list could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  response = NULL;
  if (read_entity_and_text_c (connection, &response, &content))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting GMP doc. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  if (strcmp (format, "xml") == 0)
    cmd_response_data_set_content_length (response_data, strlen (content));
  else
    {
      char *content_64;
      gsize content_length;
      entity = entity_child (response, "schema");
      if (entity == NULL)
        {
          free_entity (response);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting GMP doc. "
                               "Diagnostics: Schema element missing.",
                               response_data);
        }

      content_64 = entity_text (entity);
      if (strlen (content_64) == 0)
        {
          free_entity (response);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting GMP doc. "
                               "Diagnostics: Schema empty.",
                               response_data);
        }

      content = (char *) g_base64_decode (content_64, &content_length);
      cmd_response_data_set_content_length (response_data, content_length);
    }

  now = time (NULL);
  tm = localtime (&now);
  cmd_response_data_set_content_type (response_data, GSAD_CONTENT_TYPE_APP_XML);
  cmd_response_data_set_content_disposition
    (response_data, g_strdup_printf ("attachment; filename=\"gmp-%d-%d-%d.%s\"",
                                     tm->tm_mday,
                                     tm->tm_mon + 1,
                                     tm->tm_year +1900,
                                     format));
  free_entity (response);
  return content;
}


/* Groups. */

/**
 * @brief Get one group, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_group (gvm_connection_t *connection, credentials_t * credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  return get_one (connection, "group", credentials, params, extra_xml, NULL,
                  response_data);
}

/**
 * @brief Get one group, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_group_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return get_group (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all groups, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_groups (gvm_connection_t *connection, credentials_t * credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t* response_data)
{
  return get_many (connection, "group", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all groups, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_groups_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return get_groups (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Delete a group from trash, get all groups, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_group_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return delete_resource (connection, "group", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a group, get all groups, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_group_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  return delete_resource (connection, "group", credentials, params, 0,
                          "get_groups", response_data);
}

/**
 * @brief Create a group, get all groups, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_group_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  gchar *html, *response, *command, *specials_element;
  const char  *name, *comment, *users, *grant_full;
  entity_t entity;
  GString *xml;
  int ret;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  grant_full = params_value (params, "grant_full");
  users = params_value (params, "users");

  CHECK_PARAM_INVALID (name, "Create Group");
  CHECK_PARAM_INVALID (comment, "Create Group");
  CHECK_PARAM_INVALID (users, "Create Group");

  /* Create the group. */

  xml = g_string_new ("");

  xml_string_append (xml,
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<users>%s</users>",
                     name,
                     comment,
                     users);

  if (grant_full)
    specials_element = g_strdup_printf ("<full/>");
  else
    specials_element = NULL;

  command = g_strdup_printf ("<create_group>"
                             "%s"
                             "<specials>"
                             "%s"
                             "</specials>"
                             "</create_group>",
                             xml->str,
                             specials_element);

  g_string_free (xml, TRUE);
  g_free (specials_element);

  ret = gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new group. "
                            "No new group was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new group. "
                            "It is unclear whether the group has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new group. "
                            "It is unclear whether the group has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "group_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Group", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Setup edit_group XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_group (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
            const char *extra_xml, cmd_response_data_t* response_data)
{
  return edit_resource (connection, "group", credentials, params, NULL, extra_xml,
                        response_data);
}

/**
 * @brief Setup edit_group XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_group_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return edit_group (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Export a group.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Group XML on success.  Enveloped XML on error.
 */
char *
export_group_gmp (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  return export_resource (connection, "group", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of groups.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Groups XML on success.  Enveloped XML
 *         on error.
 */
char *
export_groups_gmp (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_many (connection, "group", credentials, params, response_data);
}

/**
 * @brief Modify a group, return the next page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_group_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *group_id, *name, *comment, *users;
  entity_t entity;

  group_id = params_value (params, "group_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_PARAM_INVALID (group_id, "Save Group");
  CHECK_PARAM_INVALID (name, "Save Group");
  CHECK_PARAM_INVALID (comment, "Save Group");
  CHECK_PARAM_INVALID (users, "Save Group");

  /* Modify the Group. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<modify_group group_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<users>%s</users>"
              "</modify_group>",
              group_id,
              name,
              comment,
              users);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a group. "
                             "The group was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a group. "
                             "It is unclear whether the group has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a group. "
                             "It is unclear whether the group has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Group", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Permissions. */

/**
 * @brief Get one permission, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_permission (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "permission", credentials, params, extra_xml, "alerts=\"1\"",
                  response_data);
}

/**
 * @brief Get one permission, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_permission_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return get_permission (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all permissions, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_permissions (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "permission", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all permissions, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_permissions_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return get_permissions (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Delete a permission, get all permissions, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_permission_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                             cmd_response_data_t* response_data)
{
  return delete_resource (connection, "permission", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a permission, get all permissions, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_permission_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return delete_resource (connection, "permission", credentials, params, 0, NULL,
                          response_data);
}

/**
 * @brief Create a permission, get all permissions, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_permission_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *name, *comment, *resource_id, *resource_type;
  const char *subject_id, *subject_type, *subject_name;
  entity_t entity;

  gchar *subject_response;
  entity_t get_subject_entity = NULL;
  entity_t subject_entity;

  name = params_value (params, "permission");
  comment = params_value (params, "comment");
  resource_id = params_value (params, "id_or_empty");
  resource_type = params_value (params, "optional_resource_type");
  subject_type = params_value (params, "subject_type");
  subject_name = params_value (params, "subject_name");

  CHECK_PARAM_INVALID (name, "Create Permission");
  CHECK_PARAM_INVALID (comment, "Create Permission");
  if (params_given (params, "id_or_empty"))
    CHECK_PARAM_INVALID (resource_id, "Create Permission");
  CHECK_PARAM_INVALID (subject_type, "Create Permission");
  if (params_given (params, "optional_resource_type"))
    CHECK_PARAM_INVALID (resource_type, "Create Permission");

  if (params_given (params, "subject_name"))
    {
      CHECK_PARAM_INVALID (subject_name, "Create Permission");
      subject_id = NULL;
      ret = gmpf (connection, credentials,
                  &subject_response,
                  &get_subject_entity,
                  response_data,
                  "<get_%ss filter=\"rows=1 name=%s\">"
                  "</get_%ss>",
                  subject_type,
                  subject_name,
                  subject_type);

      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to send command"
                                " to manager daemon.",
                                response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to receive response"
                                " from manager daemon.",
                                response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Internal Error.",
                                response_data);
        }

      subject_entity = entity_child (get_subject_entity, subject_type);

      if (subject_entity)
        subject_id = entity_attribute (subject_entity, "id");

      if (subject_id == NULL)
        {
          gchar *msg;
          msg = g_strdup_printf ("<gsad_msg status_text=\"Subject not found\""
                                 "          operation=\"create_permission\">"
                                 "Could not find a %s with name '%s'."
                                 "</gsad_msg>",
                                 subject_type,
                                 subject_name ? subject_name : "");
          return next_page (connection, credentials, params, msg, response_data);
        }
    }
  else if (strcmp (subject_type, "user") == 0)
    subject_id = params_value (params, "permission_user_id");
  else if (strcmp (subject_type, "group") == 0)
    subject_id = params_value (params, "permission_group_id");
  else if (strcmp (subject_type, "role") == 0)
    subject_id = params_value (params, "permission_role_id");
  else
    subject_id = NULL;

  CHECK_PARAM_INVALID (subject_id, "Create Permission");

  /* Create the permission(s). */

  if (strcmp (name, "task_proxy") == 0)
    {
      response = NULL;
      entity = NULL;
      ret = gmpf (connection, credentials,
                  &response,
                  &entity,
                  response_data,
                  "<commands>"
                  "<create_permission>"
                  "<name>get_tasks</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\"/>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>"
                  "<create_permission>"
                  "<name>modify_task</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\"/>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>"
                  "<create_permission>"
                  "<name>start_task</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\"/>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>"
                  "<create_permission>"
                  "<name>stop_task</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\"/>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>"
                  "<create_permission>"
                  "<name>resume_task</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\"/>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>"
                  "</commands>",
                  comment ? comment : "",
                  resource_id ? resource_id : "",
                  subject_id,
                  subject_type,
                  comment ? comment : "",
                  resource_id ? resource_id : "",
                  subject_id,
                  subject_type,
                  comment ? comment : "",
                  resource_id ? resource_id : "",
                  subject_id,
                  subject_type,
                  comment ? comment : "",
                  resource_id ? resource_id : "",
                  subject_id,
                  subject_type,
                  comment ? comment : "",
                  resource_id ? resource_id : "",
                  subject_id,
                  subject_type);

      if (get_subject_entity)
        free_entity (get_subject_entity);

      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a permission. "
                                "It is unclear whether the permission has been created or not. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a permission. "
                                "It is unclear whether the permission has been created or not. "
                                "Diagnostics: Internal Error.",
                                response_data);
        }

        if (entity_attribute (entity, "id"))
          params_add (params, "permission_id", entity_attribute (entity, "id"));
        html = response_from_entity (connection, credentials, params, entity,
                                     "Create Permission", response_data);
    }
  else
    {
      response = NULL;
      entity = NULL;
      ret = gmpf (connection, credentials,
                  &response,
                  &entity,
                  response_data,
                  "<create_permission>"
                  "<name>%s</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\">"
                  "<type>%s</type>"
                  "</resource>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>",
                  name,
                  comment ? comment : "",
                  resource_id ? resource_id : "",
                  resource_type ? resource_type : "",
                  subject_id,
                  subject_type);

      if (get_subject_entity)
        free_entity (get_subject_entity);

      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a permission. "
                                "It is unclear whether the permission has been created or not. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a permission. "
                                "It is unclear whether the permission has been created or not. "
                                "Diagnostics: Internal Error.",
                                response_data);
        }

        if (entity_attribute (entity, "id"))
          params_add (params, "permission_id", entity_attribute (entity, "id"));
        html = response_from_entity (connection, credentials, params, entity,
                                     "Create Permission", response_data);
    }
  free_entity (entity);
  g_free (response);
  return html;
}

#define CHECK_GMPF_RET \
  switch (ret)                                                                \
    {                                                                         \
      case 0:                                                                 \
      case -1:                                                                \
        break;                                                                \
      case 1:                                                                 \
        cmd_response_data_set_status_code (response_data,                     \
                                            MHD_HTTP_INTERNAL_SERVER_ERROR);  \
        return gsad_message (credentials,                                                    \
                            "Internal error", __FUNCTION__, __LINE__,                        \
                            "An internal error occurred while creating a permission. "       \
                            "The permission was not created. "                               \
                            "Diagnostics: Failure to send command to manager daemon.",       \
                            response_data);                      \
      case 2:                                                                                \
        cmd_response_data_set_status_code (response_data,                     \
                                            MHD_HTTP_INTERNAL_SERVER_ERROR);  \
        return gsad_message (credentials,                                                    \
                            "Internal error", __FUNCTION__, __LINE__,                        \
                            "An internal error occurred while creating a permission. "       \
                            "It is unclear whether the permission has been created or not. " \
                            "Diagnostics: Failure to receive response from manager daemon.", \
                            response_data);                      \
      default:                                                                               \
        cmd_response_data_set_status_code (response_data,                     \
                                            MHD_HTTP_INTERNAL_SERVER_ERROR);  \
        return gsad_message (credentials,                                                    \
                            "Internal error", __FUNCTION__, __LINE__,                        \
                            "An internal error occurred while creating a permission. "       \
                            "It is unclear whether the permission has been created or not. " \
                            "Diagnostics: Internal Error.",                                  \
                            response_data);                      \
    }                                                                         \
  if (gmp_success (entity))                                                   \
    {                                                                         \
      successes ++;                                                           \
      free_entity (entity);                                                   \
      g_free (response);                                                      \
    }                                                                         \
  else                                                                        \
    {                                                                         \
      html                                                                    \
        = response_from_entity (connection, credentials, params, entity,      \
                                "Create Permissions", response_data);         \
      free_entity (entity);                                                   \
      g_free (response);                                                      \
      return html;                                                            \
    }                                                                         \

/**
 * @brief Create multiple permission, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_permissions_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response, *summary_response;
  int successes;
  const char  *permission, *comment, *resource_id, *resource_type;
  const char *subject_id, *subject_type, *subject_name;
  int include_related;

  entity_t entity;

  gchar *subject_response;
  entity_t get_subject_entity = NULL;
  entity_t subject_entity;

  permission = params_value (params, "permission");
  comment = params_value (params, "comment");
  resource_id = params_value (params, "resource_id");
  resource_type = params_value (params, "resource_type");
  subject_type = params_value (params, "subject_type");
  subject_name = params_value (params, "subject_name");

  include_related = atoi (params_value (params, "include_related"));
  CHECK_PARAM_INVALID (params_value (params, "include_related"),
                       "Create Permission");

  CHECK_PARAM_INVALID (permission, "Create Permission");
  CHECK_PARAM_INVALID (comment, "Create Permission");
  CHECK_PARAM_INVALID (resource_id, "Create Permission");
  CHECK_PARAM_INVALID (subject_type, "Create Permission");
  CHECK_PARAM_INVALID (resource_type, "Create Permission");

  if (params_given (params, "subject_name"))
    {
      CHECK_PARAM_INVALID (subject_name, "Create Permission");
      subject_id = NULL;
      ret = gmpf (connection, credentials,
                  &subject_response,
                  &get_subject_entity,
                  response_data,
                  "<get_%ss filter=\"rows=1 name=%s\">"
                  "</get_%ss>",
                  subject_type,
                  subject_name,
                  subject_type);

      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to send command"
                                " to manager daemon.",
                                response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to receive response"
                                " from manager daemon.",
                                response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Internal Error.",
                                response_data);
        }

      subject_entity = entity_child (get_subject_entity, subject_type);

      if (subject_entity)
        subject_id = entity_attribute (subject_entity, "id");

      if (subject_id == NULL)
        {
          gchar *msg;
          msg = g_strdup_printf ("<gsad_msg status_text=\"Subject not found\""
                                 "          operation=\"create_permission\">"
                                 "Could not find a %s with name '%s'."
                                 "</gsad_msg>",
                                 subject_type,
                                 subject_name ? subject_name : "");
          return next_page (connection, credentials, params, msg, response_data);
        }
    }
  else if (strcmp (subject_type, "user") == 0)
    subject_id = params_value (params, "permission_user_id");
  else if (strcmp (subject_type, "group") == 0)
    subject_id = params_value (params, "permission_group_id");
  else if (strcmp (subject_type, "role") == 0)
    subject_id = params_value (params, "permission_role_id");
  else
    subject_id = NULL;

  CHECK_PARAM_INVALID (subject_id, "Create Permission");

  successes = 0;

  /* Create the permission(s). */

  // Main resource permissions
  if (include_related != 2)
    {
      if (strcmp (permission, "read") == 0
          || strcmp (permission, "proxy") == 0)
        {
          response = NULL;
          entity = NULL;
          ret = gmpf (connection, credentials,
                      &response,
                      &entity,
                      response_data,
                      "<create_permission>"
                      "<name>get_%ss</name>"
                      "<comment>%s</comment>"
                      "<resource id=\"%s\">"
                      "</resource>"
                      "<subject id=\"%s\"><type>%s</type></subject>"
                      "</create_permission>",
                      resource_type,
                      comment ? comment : "",
                      resource_id,
                      subject_id,
                      subject_type);

          CHECK_GMPF_RET
        }

      if ((strcmp (permission, "proxy") == 0)
          && strcmp (resource_type, "result")
          && strcmp (resource_type, "report"))
        {
          response = NULL;
          entity = NULL;
          ret = gmpf (connection, credentials,
                      &response,
                      &entity,
                      response_data,
                      "<create_permission>"
                      "<name>modify_%s</name>"
                      "<comment>%s</comment>"
                      "<resource id=\"%s\">"
                      "</resource>"
                      "<subject id=\"%s\"><type>%s</type></subject>"
                      "</create_permission>",
                      resource_type,
                      comment ? comment : "",
                      resource_id,
                      subject_id,
                      subject_type);

          CHECK_GMPF_RET

          if (strcmp (resource_type, "task") == 0)
            {
              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials,
                          &response,
                          &entity,
                          response_data,
                          "<create_permission>"
                          "<name>start_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          resource_type,
                          comment ? comment : "",
                          resource_id,
                          subject_id,
                          subject_type);

              CHECK_GMPF_RET

              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials,
                          &response,
                          &entity,
                          response_data,
                          "<create_permission>"
                          "<name>stop_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          resource_type,
                          comment ? comment : "",
                          resource_id,
                          subject_id,
                          subject_type);

              CHECK_GMPF_RET

              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials,
                          &response,
                          &entity,
                          response_data,
                          "<create_permission>"
                          "<name>resume_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          resource_type,
                          comment ? comment : "",
                          resource_id,
                          subject_id,
                          subject_type);

              CHECK_GMPF_RET
            }

          if (strcmp (resource_type, "alert") == 0)
            {
              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials,
                          &response,
                          &entity,
                          response_data,
                          "<create_permission>"
                          "<name>test_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          resource_type,
                          comment ? comment : "",
                          resource_id,
                          subject_id,
                          subject_type);

              CHECK_GMPF_RET
            }

          if (strcmp (resource_type, "agent") == 0
              || strcmp (resource_type, "report_format") == 0
              || strcmp (resource_type, "scanner") == 0)
            {
              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials,
                          &response,
                          &entity,
                          response_data,
                          "<create_permission>"
                          "<name>verify_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          resource_type,
                          comment ? comment : "",
                          resource_id,
                          subject_id,
                          subject_type);

              CHECK_GMPF_RET
            }
        }
    }

  // Related permissions
  if (include_related)
    {
      params_t *related;
      related = params_values (params, "related:");
      if (related)
        {
          params_iterator_t iter;
          char *name;
          param_t *param;

          params_iterator_init (&iter, related);
          while (params_iterator_next (&iter, &name, &param))
            {
              char *related_id = name;
              char *related_type = param->value;

              if (strcmp (permission, "read") == 0
                  || strcmp (permission, "proxy") == 0)
                {
                  response = NULL;
                  entity = NULL;
                  ret = gmpf (connection, credentials,
                              &response,
                              &entity,
                              response_data,
                              "<create_permission>"
                              "<name>get_%ss</name>"
                              "<comment>%s</comment>"
                              "<resource id=\"%s\">"
                              "</resource>"
                              "<subject id=\"%s\"><type>%s</type></subject>"
                              "</create_permission>",
                              related_type,
                              comment ? comment : "",
                              related_id,
                              subject_id,
                              subject_type);

                  CHECK_GMPF_RET
                }

              if ((strcmp (permission, "proxy") == 0)
                  && strcmp (related_type, "result")
                  && strcmp (related_type, "report"))
                {
                  response = NULL;
                  entity = NULL;
                  ret = gmpf (connection, credentials,
                              &response,
                              &entity,
                              response_data,
                              "<create_permission>"
                              "<name>modify_%s</name>"
                              "<comment>%s</comment>"
                              "<resource id=\"%s\">"
                              "</resource>"
                              "<subject id=\"%s\"><type>%s</type></subject>"
                              "</create_permission>",
                              related_type,
                              comment ? comment : "",
                              related_id,
                              subject_id,
                              subject_type);

                  CHECK_GMPF_RET

                  if (strcmp (related_type, "task") == 0)
                    {
                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials,
                                  &response,
                                  &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>start_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type,
                                  comment ? comment : "",
                                  related_id,
                                  subject_id,
                                  subject_type);

                      CHECK_GMPF_RET

                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials,
                                  &response,
                                  &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>stop_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type,
                                  comment ? comment : "",
                                  related_id,
                                  subject_id,
                                  subject_type);

                      CHECK_GMPF_RET

                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials,
                                  &response,
                                  &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>resume_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type,
                                  comment ? comment : "",
                                  related_id,
                                  subject_id,
                                  subject_type);

                      CHECK_GMPF_RET
                    }

                  if (strcmp (related_type, "alert") == 0)
                    {
                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials,
                                  &response,
                                  &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>test_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type,
                                  comment ? comment : "",
                                  related_id,
                                  subject_id,
                                  subject_type);

                      CHECK_GMPF_RET
                    }

                  if (strcmp (related_type, "agent") == 0
                      || strcmp (related_type, "report_format") == 0
                      || strcmp (related_type, "scanner") == 0)
                    {
                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials,
                                  &response,
                                  &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>verify_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type,
                                  comment ? comment : "",
                                  related_id,
                                  subject_id,
                                  subject_type);

                      CHECK_GMPF_RET
                    }
                }
            }
        }
    }

  if (get_subject_entity)
    free_entity (get_subject_entity);

  summary_response = g_strdup_printf("Successfully created %i permissions",
                                     successes);

  html = action_result_page (connection, credentials, params, response_data,
                              "Create Permissions",
                              G_STRINGIFY (MHD_HTTP_CREATED),
                              summary_response,
                              NULL, NULL);
  return html;
}

#undef CHECK_GMPF_RET

/**
 * @brief Setup edit_permission XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_permission (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 const char *extra_xml, cmd_response_data_t* response_data)
{
  gchar *html;
  GString *extra;

  extra = g_string_new ("");

  if (command_enabled (credentials, "GET_USERS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_users filter=\"rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_GROUPS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_groups filter=\"rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_ROLES"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_roles filter=\"rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = edit_resource (connection, "permission", credentials, params, NULL, extra->str,
                        response_data);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Setup edit_permission XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_permission_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return edit_permission (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Export a permission.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Permission XML on success.  Enveloped XML on error.
 */
char *
export_permission_gmp (gvm_connection_t *connection,
                       credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return export_resource (connection, "permission", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of permissions.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Permissions XML on success.  Enveloped XML
 *         on error.
 */
char *
export_permissions_gmp (gvm_connection_t *connection,
                        credentials_t * credentials, params_t *params,
                        cmd_response_data_t* response_data)
{
  return export_many (connection, "permission", credentials, params,
                      response_data);
}

/**
 * @brief Modify a permission, get all permissions, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_permission_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char *permission_id, *name, *comment, *resource_id, *resource_type;
  const char *subject_id, *subject_type;
  entity_t entity;
  int ret;

  permission_id = params_value (params, "permission_id");
  name = params_value (params, "permission");
  comment = params_value (params, "comment");
  subject_type = params_value (params, "subject_type");
  resource_id = params_value (params, "id_or_empty");
  resource_type = params_value (params, "optional_resource_type");

  CHECK_PARAM_INVALID (permission_id, "Save Permission");
  CHECK_PARAM_INVALID (name, "Save Permission");
  CHECK_PARAM_INVALID (comment, "Save Permission");
  CHECK_PARAM_INVALID (resource_id, "Save Permission");
  CHECK_PARAM_INVALID (subject_type, "Save Permission");
  if (params_given (params, "optional_resource_type"))
    CHECK_PARAM_INVALID (resource_type, "Save Permission");

  if (strcmp (subject_type, "user") == 0)
    subject_id = params_value (params, "user_id");
  else if (strcmp (subject_type, "group") == 0)
    subject_id = params_value (params, "group_id");
  else if (strcmp (subject_type, "role") == 0)
    subject_id = params_value (params, "role_id");
  else
    subject_id = NULL;
  CHECK_PARAM_INVALID (subject_id, "Save Permission");

  /* Modify the permission. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<modify_permission permission_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<subject id=\"%s\">"
              "<type>%s</type>"
              "</subject>"
              "<resource id=\"%s\">"
              "<type>%s</type>"
              "</resource>"
              "</modify_permission>",
              permission_id,
              name,
              comment,
              subject_id,
              subject_type,
              (resource_id && strlen (resource_id)) ? resource_id : "0",
              resource_type ? resource_type : "");
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a permission. "
                             "The permission was not modified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a permission. "
                             "It is unclear whether the permission has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a permission. "
                             "It is unclear whether the permission has been modified or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Permission", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Port lists. */

/**
 * @brief Returns page to upload a new port list.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
upload_port_list (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                  const char *extra_xml, cmd_response_data_t* response_data)
{
  GString *xml;

  xml = g_string_new ("<upload_port_list>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</upload_port_list>");

  return envelope_gmp (connection, credentials, params, g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Return the upload port list page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
upload_port_list_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  return upload_port_list (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create a port list, get all port lists, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_port_list_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char  *name, *comment, *port_range, *from_file;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  port_range = params_value (params, "port_range");
  from_file = params_value (params, "from_file");

  CHECK_PARAM_INVALID (name, "Create Port List");
  CHECK_PARAM_INVALID (comment, "Create Port List");
  CHECK_PARAM_INVALID (port_range, "Create Port List");
  CHECK_PARAM_INVALID (from_file, "Create Port List");

  /* Create the port_list. */

  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_port_list>"
                "<name>%s</name>"
                "<port_range>%s</port_range>"
                "<comment>%s</comment>"
                "</create_port_list>",
                name,
                strcmp (from_file, "0")
                 ? params_value (params, "file")
                 : port_range,
                comment ? comment : ""))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new port list. "
                            "No new port list was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new port list. "
                            "It is unclear whether the port list has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new port list. "
                            "It is unclear whether the port list has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "port_list_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Port List", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Add a range to a port list, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_port_range_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *port_list_id, *start, *end, *type;
  entity_t entity;

  port_list_id = params_value (params, "port_list_id");
  start = params_value (params, "port_range_start");
  end = params_value (params, "port_range_end");
  type = params_value (params, "port_type");

  CHECK_PARAM_INVALID (port_list_id, "Create Port Range");
  CHECK_PARAM_INVALID (start, "Create Port Range");
  CHECK_PARAM_INVALID (end, "Create Port Range");
  CHECK_PARAM_INVALID (type, "Create Port Range");

  /* Create the port range. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<create_port_range>"
              "<port_list id=\"%s\"/>"
              "<start>%s</start>"
              "<end>%s</end>"
              "<type>%s</type>"
              "</create_port_range>",
              port_list_id,
              start,
              end,
              type);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a Port Range. "
                             "The Port Range was not created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a Port Range. "
                             "It is unclear whether the Port Range has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a Port Range. "
                             "It is unclear whether the Port Range has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Create Port Range", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get one port_list, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  commands     Extra commands to run before the others.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_port_list (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               const char * extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "port_list", credentials, params, extra_xml,
                  "targets=\"1\" details=\"1\"", response_data);
}

/**
 * @brief Get one port_list, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_port_list_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return get_port_list (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all Port Lists, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_port_lists (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "port_list", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all port_lists, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_port_lists_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return get_port_lists (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Setup edit_port_list XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_port_list (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                const char *extra_xml, cmd_response_data_t* response_data)
{
  return edit_resource (connection, "port_list", credentials, params, NULL, extra_xml,
                        response_data);
}

/**
 * @brief Setup edit_port_list XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_port_list_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return edit_port_list (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Modify a port list, get all port list, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_port_list_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *port_list_id, *name, *comment;
  entity_t entity;

  port_list_id = params_value (params, "port_list_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");

  CHECK_PARAM_INVALID (port_list_id, "Save Port List");
  CHECK_PARAM_INVALID (name, "Save Port List");
  CHECK_PARAM_INVALID (comment, "Save Port List");

  /* Modify the Port List. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<modify_port_list port_list_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "</modify_port_list>",
              port_list_id,
              name,
              comment);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Port List. "
                             "The Port List was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Port List. "
                             "It is unclear whether the Port List has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Port List. "
                             "It is unclear whether the Port List has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Port List", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete a port list, get all port lists, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_port_list_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  return delete_resource (connection, "port_list", credentials, params, 0, "get_port_lists",
                          response_data);
}

/**
 * @brief Delete a trash port list, get all trash, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_port_list_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                            cmd_response_data_t* response_data)
{
  return delete_resource (connection, "port_list", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a port range, get the port list, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_port_range_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return delete_resource (connection, "port_range", credentials, params, 1,
                          "edit_port_list", response_data);
}

/**
 * @brief Import port list, get all port_lists, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
import_port_list_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  gchar *command, *html, *response;
  entity_t entity;
  int ret;

  /* Create the port list. */

  response = NULL;
  entity = NULL;
  command = g_strdup_printf ("<create_port_list>"
                             "%s"
                             "</create_port_list>",
                             params_value (params, "xml_file"));
  ret = gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a port_list. "
                             "The schedule remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a port_list. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a port_list. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  /* Cleanup, and return transformed XML. */

  html = response_from_entity (connection, credentials, params, entity,
                               "Import Port List", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Roles. */

/**
 * @brief Delete a role from trash, get all roles, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_role_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                       cmd_response_data_t* response_data)
{
  return delete_resource (connection, "role", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a role, get all roles, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_role_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  return delete_resource (connection, "role", credentials, params, 0, "get_roles",
                          response_data);
}

/**
 * @brief Create a role, get all roles, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_role_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  char *ret;
  gchar *response;
  const char  *name, *comment, *users;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_PARAM_INVALID (name, "Create Role");
  CHECK_PARAM_INVALID (comment, "Create Role");
  CHECK_PARAM_INVALID (users, "Create Role");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_role>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<users>%s</users>"
                "</create_role>",
                name,
                comment,
                users))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new role. "
                             "No new role was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new role. "
                             "It is unclear whether the role has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new role. "
                             "It is unclear whether the role has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "role_id", entity_attribute (entity, "id"));
  ret = response_from_entity (connection, credentials, params, entity,
                              "Create Role", response_data);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Setup edit_role XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_role (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
           const char *extra_xml, cmd_response_data_t* response_data)
{
  gchar *html;
  GString *extra;

  extra = g_string_new ("");

  if (command_enabled (credentials, "GET_PERMISSIONS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmpf (connection, credentials, &response, &entity, response_data,
                    "<get_permissions"
                    " filter=\"rows=-1 subject_type=role and subject_uuid=%s\"/>",
                    params_value (params, "role_id")))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the permission list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the permission list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the permission list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_GROUPS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmpf (connection, credentials, &response, &entity, response_data,
                    "<get_groups"
                    " filter=\"rows=-1 owner=%s\"/>",
                    credentials->username))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = edit_resource (connection, "role", credentials, params, NULL, extra->str,
                        response_data);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Setup edit_role XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_role_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return edit_role (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get one role, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_role (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
          const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "role", credentials, params, extra_xml, NULL, response_data);
}

/**
 * @brief Get one role, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_role_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
              cmd_response_data_t* response_data)
{
  return get_role (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all roles, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_roles (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
           const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "role", credentials, params, extra_xml, NULL, response_data);
}

/**
 * @brief Get all roles, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_roles_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return get_roles (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Export a role.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Role XML on success.  Enveloped XML on error.
 */
char *
export_role_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return export_resource (connection, "role", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of roles.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Roles XML on success.  Enveloped XML
 *         on error.
 */
char *
export_roles_gmp (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  return export_many (connection, "role", credentials, params, response_data);
}

/**
 * @brief Modify a role, return the next page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_role_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *role_id, *name, *comment, *users;
  entity_t entity;

  role_id = params_value (params, "role_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_PARAM_INVALID (role_id, "Save Role");
  CHECK_PARAM_INVALID (name, "Save Role");
  CHECK_PARAM_INVALID (comment, "Save Role");
  CHECK_PARAM_INVALID (users, "Save Role");

  /* Modify the Role. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<modify_role role_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<users>%s</users>"
              "</modify_role>",
              role_id,
              name,
              comment,
              users);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a role. "
                             "The role was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a role. "
                             "It is unclear whether the role has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a role. "
                             "It is unclear whether the role has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Role", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Feeds. */

/**
 * @brief Get descriptions of the feeds connected to the manager.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_feeds_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  entity_t entity;
  char *text = NULL;
  gchar *response;
  time_t now;
  struct tm *tm;
  gchar current_timestamp[30];

  if (gvm_connection_sendf (connection,
                            "<commands>"
                            "<get_feeds/>"
                            "</commands>")
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the feed list. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_entity_and_text_c (connection, &entity, &text))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the feed. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  time (&now);
  tm = gmtime (&now);
  if (tm == NULL
      || (strftime (current_timestamp,
                    29,
                    "%Y-%m-%dT%H:%M:%S",
                    tm)
          == 0))
    {
      current_timestamp[0] = '\0';
    }

  response = g_strdup_printf ("<get_feeds>"
                              "%s"
                              "<current_time_utc>%s</current_time_utc>"
                              "</get_feeds>",
                              text,
                              current_timestamp);

  g_free (text);

  return envelope_gmp (connection, credentials, params,  response,
                       response_data);
}

/**
 * @brief Synchronize with a feed and envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication
 * @param[in]  params         Request parameters.
 * @param[in]  sync_cmd       Name of the GMP command used to sync the feed.
 * @param[in]  action         Action shown in gsad status messages.
 * @param[in]  feed_name      Name of the feed shown in error messages.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char*
sync_feed (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
           const char *sync_cmd, const char *action,
           const char *feed_name,
           cmd_response_data_t* response_data)
{
  entity_t entity;
  char *text = NULL;
  gchar *html, *msg;

  if (gvm_connection_sendf (connection,
                            "<%s/>",
                            sync_cmd)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);

      msg = g_strdup_printf
              ("An internal error occurred while synchronizing with %s. "
               "Feed synchronization is currently not available. "
               "Diagnostics: Failure to send command to manager daemon.",
               feed_name);
      html = gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           msg, response_data);
      g_free (msg);
      return html;
    }

  if (read_entity_and_text_c (connection, &entity, &text))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);

      msg = g_strdup_printf
              ("An internal error occurred while synchronizing with %s. "
               "Feed synchronization is currently not available. "
               "Diagnostics: Failure to receive response from manager daemon.",
               feed_name);
      html = gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           msg, response_data);
      g_free (msg);
      return html;
    }

  html = response_from_entity (connection, credentials, params, entity,
                               action, response_data);

  return html;
}

/**
 * @brief Synchronize with an NVT feed and envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
sync_feed_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return sync_feed (connection, credentials, params,
                    "sync_feed", "Synchronize Feed", "the NVT feed",
                    response_data);
}

/**
 * @brief Synchronize with a SCAP feed and envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
sync_scap_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return sync_feed (connection, credentials, params,
                    "sync_scap", "Synchronize Feed", "the SCAP feed",
                    response_data);
}

/**
 * @brief Synchronize with a CERT feed and envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
sync_cert_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return sync_feed (connection, credentials, params,
                    "sync_cert", "Synchronize CERT Feed", "the CERT feed",
                    response_data);
}


/* Filters. */

/**
 * @brief Get one filter, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_filter (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
            const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_one (connection, "filter", credentials, params, extra_xml, "alerts=\"1\"",
                  response_data);
}

/**
 * @brief Get one filter, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_filter_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                cmd_response_data_t* response_data)
{
  return get_filter (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all filters, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_filters (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
             const char *extra_xml, cmd_response_data_t* response_data)
{
  return get_many (connection, "filter", credentials, params, extra_xml, NULL,
                   response_data);
}

/**
 * @brief Get all filters, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_filters_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  return get_filters (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create a filter, get all filters, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_filter_gmp (gvm_connection_t *connection, credentials_t *credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  gchar *html, *response;
  const char  *name, *comment, *term, *type;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  term = params_value (params, "term");
  type = params_value (params, "optional_resource_type");

  CHECK_PARAM_INVALID (name, "Create Filter");
  CHECK_PARAM_INVALID (comment, "Create Filter");
  CHECK_PARAM_INVALID (term, "Create Filter");
  CHECK_PARAM_INVALID (type, "Create Filter");

  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_filter>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<term>%s</term>"
                "<type>%s</type>"
                "</create_filter>",
                name,
                comment,
                term,
                type))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "No new alert was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (gmp_success (entity))
    {
      const char *filter_id;

      filter_id = entity_attribute (entity, "id");
      if (filter_id && strlen (filter_id))
        {
          param_t *param;
          param = params_add (params, "filt_id", filter_id);
          param->valid = 1;
          param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
        }
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "filter_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Filter", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete a filter, get all filters, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_trash_filter_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                         cmd_response_data_t* response_data)
{
  return delete_resource (connection, "filter", credentials, params, 1, "get_trash",
                          response_data);
}

/**
 * @brief Delete a filter, get all filters, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_filter_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  param_t *filt_id, *id;
  GList *list;

  filt_id = params_get (params, "filt_id");
  id = params_get (params, "filter_id");
  if (id && id->value && filt_id && filt_id->value
      && (strcmp (id->value, filt_id->value) == 0))
    // TODO: Add params_remove.
    filt_id->value = NULL;

  /* remove to be deleted key from the user credentials */
  if (id && id->value)
    {
      find_by_value_t find;

      init_find_by_value (&find, id->value);

      g_tree_foreach (credentials->last_filt_ids, (GTraverseFunc)find_by_value,
                      &find);
      if (find.keys != NULL)
        {
          list = g_list_first (find.keys);

          while (list != NULL)
            {
              g_debug ("%s removing filter from last filter ids for %s\n",
                      __FUNCTION__, (char *)list->data);
              g_tree_remove (credentials->last_filt_ids, list->data);
              list = g_list_next (find.keys);
            }
        }

      free_find_by_value(&find);
    }

  return delete_resource (connection, "filter", credentials, params, 0, "get_filters",
                          response_data);
}

/**
 * @brief Setup edit_filter XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_filter (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
             const char *extra_xml, cmd_response_data_t* response_data)
{
  return edit_resource (connection, "filter", credentials, params, NULL, extra_xml,
                        response_data);
}

/**
 * @brief Setup edit_filter XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_filter_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
                 cmd_response_data_t* response_data)
{
  return edit_filter (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Export a filter.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Filter XML on success.  Enveloped XML on error.
 */
char *
export_filter_gmp (gvm_connection_t *connection,
                   credentials_t * credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_resource (connection, "filter", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of filters.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Filters XML on success.  Enveloped XML
 *         on error.
 */
char *
export_filters_gmp (gvm_connection_t *connection,
                    credentials_t * credentials, params_t *params,
                    cmd_response_data_t* response_data)
{
  return export_many (connection, "filter", credentials, params,
                      response_data);
}

/**
 * @brief Modify a filter, get all filters, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_filter_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  entity_t entity;
  gchar *html, *response;
  const char  *filter_id, *name, *comment, *term, *type;

  filter_id = params_value (params, "filter_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  term = params_value (params, "term");
  type = params_value (params, "optional_resource_type");

  CHECK_PARAM_INVALID (filter_id, "Save Filter");
  CHECK_PARAM_INVALID (name, "Save Filter");
  CHECK_PARAM_INVALID (comment, "Save Filter");
  CHECK_PARAM_INVALID (term, "Save Filter");
  CHECK_PARAM_INVALID (type, "Save Filter");

  {
    int ret;

    /* Modify the filter. */

    ret = gvm_connection_sendf_xml (connection,
                                    "<modify_filter filter_id=\"%s\">"
                                    "<name>%s</name>"
                                    "<comment>%s</comment>"
                                    "<term>%s</term>"
                                    "<type>%s</type>"
                                    "</modify_filter>",
                                    filter_id,
                                    name,
                                    comment,
                                    term,
                                    type);

    if (ret == -1)
      {
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a filter. "
                             "The filter was not modified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      }

    entity = NULL;
    if (read_entity_and_text_c (connection, &entity, &response))
      {
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a filter. "
                             "It is unclear whether the filter has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      }

  }


  /* Pass response to handler of following page. */

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Filter", response_data);

  free_entity (entity);
  g_free (response);
  return html;
}


/* Schedules. */

/**
 * @brief Setup edit_schedule XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_schedule (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, const char *extra_xml,
               cmd_response_data_t* response_data)
{
  return edit_resource (connection, "schedule", credentials, params,
                        "tasks=\"1\"", extra_xml, response_data);
}

/**
 * @brief Setup edit_schedule XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_schedule_gmp (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return edit_schedule (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Export a schedule.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Schedule XML on success.  Enveloped XML on error.
 */
char *
export_schedule_gmp (gvm_connection_t *connection,
                     credentials_t * credentials, params_t *params,
                     cmd_response_data_t* response_data)
{
  return export_resource (connection, "schedule", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of schedules.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Schedules XML on success. Enveloped XML on error.
 */
char *
export_schedules_gmp (gvm_connection_t *connection,
                      credentials_t * credentials, params_t *params,
                      cmd_response_data_t* response_data)
{
  return export_many (connection, "schedule", credentials, params,
                      response_data);
}

/**
 * @brief Save schedule, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_schedule_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  gchar *response;
  entity_t entity;
  const char  *schedule_id, *name, *comment, *timezone, *icalendar;
  char *ret;

  schedule_id = params_value (params, "schedule_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  icalendar = params_value (params, "icalendar");
  timezone = params_value (params, "timezone");

  CHECK_PARAM_INVALID (schedule_id, "Save Schedule");
  CHECK_PARAM_INVALID (name, "Save Schedule");
  CHECK_PARAM_INVALID (comment, "Save Schedule");
  CHECK_PARAM_INVALID (icalendar, "Save Schedule");
  CHECK_PARAM_INVALID (timezone, "Save Schedule");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<modify_schedule schedule_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<timezone>%s</timezone>"
                "<icalendar>%s</icalendar>"
                "</modify_schedule>",
                schedule_id,
                name ? name : "",
                comment ? comment : "",
                timezone,
                icalendar))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a schedule. "
                             "The schedule remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a schedule. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a schedule. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Save Schedule", response_data);
  free_entity (entity);
  g_free (response);
  return ret;
}


/* Users. */

/**
 * @brief Delete a user, get all users, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_user_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  return delete_resource (connection, "user", credentials, params, 0,
                          "get_users", response_data);
}

/**
 * @brief Returns page to create a new user.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
delete_user_confirm (gvm_connection_t *connection, credentials_t
                     *credentials, params_t *params,
                     const char *extra_xml, cmd_response_data_t* response_data)
{
  GString *xml;
  gchar *response = NULL;
  entity_t entity = NULL;

  if (command_enabled (credentials, "GET_USERS"))
    {
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_users filter=\"first=1 rows=-1\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }
    }

  xml = g_string_new ("<delete_user>");
  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (response)
    g_string_append (xml, response);
  free_entity (entity);
  g_free (response);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append (xml, "</delete_user>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Show confirmation deleting a user, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_user_confirm_gmp (gvm_connection_t *connection, credentials_t *
                         credentials, params_t *params,
                         cmd_response_data_t* response_data)
{
  return delete_user_confirm (connection, credentials, params, NULL,
                              response_data);
}

/**
 * @brief Get one user, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_user (gvm_connection_t *connection, credentials_t * credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t* response_data)
{
  gchar *html;
  GString *extra;

  extra = g_string_new ("");
  if (extra_xml)
    g_string_append (extra, extra_xml);
  if (command_enabled (credentials, "DESCRIBE_AUTH"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }
  html = get_one (connection, "user", credentials, params, extra->str, NULL,
                  response_data);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get one user, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_user_gmp (gvm_connection_t *connection, credentials_t * credentials,
              params_t *params, cmd_response_data_t* response_data)
{
  return get_user (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get all users, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_users (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
           const char *extra_xml, cmd_response_data_t* response_data)
{
  gchar *html;
  GString *extra;

  extra = g_string_new ("");
  if (command_enabled (credentials, "DESCRIBE_AUTH"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }
  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = get_many (connection, "user", credentials, params, extra->str, NULL,
                   response_data);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get all users, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_users_gmp (gvm_connection_t *connection, credentials_t * credentials, params_t *params,
               cmd_response_data_t* response_data)
{
  return get_users (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create a user, get all users, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_user_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  const char *name, *password, *hosts, *hosts_allow, *ifaces, *ifaces_allow;
  const char *auth_method, *comment;
  int ret;
  params_t *groups, *roles;
  GString *group_elements, *role_elements, *string;
  gchar *buf, *response, *html;
  entity_t entity;

  name = params_value (params, "login");
  password = params_value (params, "password");
  hosts = params_value (params, "access_hosts");
  hosts_allow = params_value (params, "hosts_allow");
  ifaces = params_value (params, "access_ifaces");
  ifaces_allow = params_value (params, "ifaces_allow");
  auth_method = params_value (params, "auth_method");
  comment = params_value (params, "comment");

  CHECK_PARAM_INVALID (name, "Create User");
  CHECK_PARAM_INVALID (hosts, "Create User");
  CHECK_PARAM_INVALID (hosts_allow, "Create User");
  CHECK_PARAM_INVALID (ifaces, "Create User");
  CHECK_PARAM_INVALID (ifaces_allow, "Create User");

  if (auth_method && strcmp (auth_method, "1") == 0)
    {
      CHECK_PARAM_INVALID (password, "Create User");
    }

  if (params_given (params, "comment"))
    {
      CHECK_PARAM_INVALID (comment, "Create User");
    }

  /* Create the user. */

  string = g_string_new ("<create_user>");
  buf = g_markup_printf_escaped ("<name>%s</name>"
                                 "<password>%s</password>",
                                 name,
                                 password ? password : "");

  g_string_append (string, buf);
  g_free (buf);

  group_elements = g_string_new ("<groups>");
  if (params_given (params, "group_id_optional:"))
    groups = params_values (params, "group_id_optional:");
  else
    groups = params_values (params, "group_ids:");

  if (groups)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, groups);
      while (params_iterator_next (&iter, &name, &param))
      {
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (group_elements,
                                  "<group id=\"%s\"/>",
                                  param->value ? param->value : "");
      }
    }
  g_string_append (string, group_elements->str);
  g_string_free (group_elements, TRUE);
  g_string_append (string, "</groups>");

  role_elements = g_string_new ("");
  if (params_given (params, "role_id_optional:"))
    roles = params_values (params, "role_id_optional:");
  else
    roles = params_values (params, "role_ids:");

  if (roles)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, roles);
      while (params_iterator_next (&iter, &name, &param))
      {
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (role_elements,
                                  "<role id=\"%s\"/>",
                                  param->value ? param->value : "");
      }
    }
  g_string_append (string, role_elements->str);
  g_string_free (role_elements, TRUE);

  buf = g_markup_printf_escaped ("<hosts allow=\"%s\">%s</hosts>"
                                 "<ifaces allow=\"%s\">%s</ifaces>",
                                 hosts_allow, hosts, ifaces_allow, ifaces);
  g_string_append (string, buf);
  g_free (buf);
  if (auth_method && !strcmp (auth_method, "1"))
    g_string_append
     (string, "<sources><source>ldap_connect</source></sources>");
  else if (auth_method && !strcmp (auth_method, "2"))
    g_string_append
     (string, "<sources><source>radius_connect</source></sources>");

  if (comment)
    {
      xml_string_append (string, "<comment>%s</comment>", comment);
    }

  g_string_append (string, "</create_user>");

  buf = g_string_free (string, FALSE);

  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials, &response, &entity, response_data, buf);
  g_free (buf);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new user. "
                             "No new user was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new user. "
                             "It is unclear whether the user has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new user. "
                             "It is unclear whether the user has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "user_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create User", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Setup edit_user XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_user (gvm_connection_t *connection, credentials_t * credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  gchar *html;
  GString *extra;

  extra = g_string_new ("");
  if (command_enabled (credentials, "DESCRIBE_AUTH"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_GROUPS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_groups filter=\"permission=modify_group\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_ROLES"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<get_roles/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (extra, extra_xml);

  html = edit_resource (connection, "user", credentials, params, NULL,
                        extra->str, response_data);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Setup edit_user XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_user_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return edit_user (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get multiple vulns, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_vulns_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return get_vulns (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Get multiple vulns, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_vulns (gvm_connection_t *connection, credentials_t * credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  return get_many (connection, "vuln", credentials, params, extra_xml, NULL,
                   response_data);
}

char *
auth_settings_gmp (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  GString * xml;
  gchar * buf;
  const char *name;

  name = params_value (params, "name");

  CHECK_PARAM_INVALID (name, "Auth settings");

  xml = g_string_new ("");
  buf = g_markup_printf_escaped ("<auth_settings name=\"%s\">", name);
  g_string_append (xml, buf);
  g_free (buf);

  if (command_enabled (credentials, "DESCRIBE_AUTH"))
    {
      gchar * response = NULL;
      entity_t entity = NULL;

      switch (gmp (connection, credentials, &response, &entity, response_data,
                   "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 response_data);
          case 2:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 response_data);
          default:
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Internal Error.",
                                 response_data);
        }


      g_string_append (xml, response);
      free_entity (entity);
      g_free (response);
    }

  g_string_append (xml, "</auth_settings>");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Modify a user, get all users, envelope the result.
 *
 * @param[in]  connection       Connection to manager.
 * @param[in]  credentials      Username and password for authentication.
 * @param[in]  params           Request parameters.
 * @param[out] password_return  Password.  Caller must free.
 * @param[out] modified_user    Name of user modified. Caller must free.
 * @param[out] logout_user      Whether the user should be logged out.
 * @param[out] response_data    Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_user_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, char **password_return, char **modified_user,
               int *logout_user, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response, *buf;
  const char *user_id, *login, *old_login, *modify_password, *password;
  const char *hosts, *hosts_allow, *ifaces, *ifaces_allow, *comment;
  entity_t entity;
  GString *command, *group_elements, *role_elements;
  params_t *groups, *roles;
  const char *status;

  *password_return = NULL;
  *modified_user = NULL;
  *logout_user = 0;

  /* List of hosts user has/lacks access rights. */
  hosts = params_value (params, "access_hosts");
  /* Whether hosts grants ("1") or forbids ("0") access.  "2" for all
   * access. */
  hosts_allow = params_value (params, "hosts_allow");
  ifaces = params_value (params, "access_ifaces");
  ifaces_allow = params_value (params, "ifaces_allow");
  login = params_value (params, "login");
  old_login = params_value (params, "old_login");
  modify_password = params_value (params, "modify_password");
  password = params_value (params, "password");
  user_id = params_value (params, "user_id");
  comment = params_value (params, "comment");

  CHECK_PARAM_INVALID (user_id, "Edit User");
  CHECK_PARAM_INVALID (modify_password, "Edit User");
  CHECK_PARAM_INVALID (hosts, "Edit User");
  CHECK_PARAM_INVALID (hosts_allow, "Edit User");
  CHECK_PARAM_INVALID (ifaces, "Save User");
  CHECK_PARAM_INVALID (ifaces_allow, "Save User");

  if (modify_password && strcmp (modify_password, "1"))
    {
      CHECK_PARAM_INVALID (password, "Create User");
    }

  if (params_given (params, "comment"))
    {
      CHECK_PARAM_INVALID (comment, "Save User");
    }

  if (params_given (params, "login")
      && !(params_given (params, "current_user")))
    {
      CHECK_PARAM_INVALID (login, "Save User");
      CHECK_PARAM_INVALID (old_login, "Save User");
    }

  /* Modify the user. */

  command = g_string_new ("");
  buf = g_markup_printf_escaped ("<modify_user user_id=\"%s\">"
                                 "<password modify=\"%s\">"
                                 "%s</password>",
                                 user_id,
                                 modify_password,
                                 password ? password : "");
  g_string_append (command, buf);
  g_free (buf);

  if (login)
    {
      buf = g_markup_printf_escaped ("<new_name>%s</new_name>",
                                     login);
      g_string_append (command, buf);
      g_free (buf);
    }

  buf = g_markup_printf_escaped ("<hosts allow=\"%s\">%s</hosts>"
                                 "<ifaces allow=\"%s\">%s</ifaces>",
                                 hosts_allow, hosts, ifaces_allow, ifaces);
  g_string_append (command, buf);
  g_free (buf);

  if (modify_password && !strcmp (modify_password, "2"))
    g_string_append (command,
                     "<sources><source>ldap_connect</source></sources>");
  else if (modify_password && !strcmp (modify_password, "3"))
    g_string_append (command,
                     "<sources><source>radius_connect</source></sources>");
  else
    g_string_append (command, "<sources><source>file</source></sources>");

  group_elements = g_string_new ("<groups>");
  if (params_given (params, "group_id_optional:"))
    groups = params_values (params, "group_id_optional:");
  else
    groups = params_values (params, "group_ids:");

  if (groups)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, groups);
      while (params_iterator_next (&iter, &name, &param))
      {
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (group_elements,
                                  "<group id=\"%s\"/>",
                                  param->value ? param->value : "");
      }
    }
  g_string_append (command, group_elements->str);
  g_string_free (group_elements, TRUE);
  g_string_append (command, "</groups>");

  role_elements = g_string_new ("");
  if (params_given (params, "role_id_optional:"))
    roles = params_values (params, "role_id_optional:");
  else
    roles = params_values (params, "role_ids:");

  if (roles)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, roles);
      while (params_iterator_next (&iter, &name, &param))
      {
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (role_elements,
                                  "<role id=\"%s\"/>",
                                  param->value ? param->value : "");
      }
    }
  else
    g_string_append_printf (role_elements, "<role id=\"0\"/>");

  g_string_append (command, role_elements->str);
  g_string_free (role_elements, TRUE);

  if (comment)
    {
      xml_string_append (command, "<comment>%s</comment>", comment);
    }

  g_string_append (command, "</modify_user>");

  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             command->str);
  g_string_free (command, TRUE);
  switch (ret)
    {
      case 0:
        status = entity_attribute (entity, "status");
        if (status && (strlen (status) > 0) && (status[0] == '2'))
          {
            *modified_user
              = g_strdup (old_login ? old_login : credentials->username);

            if (strcmp (modify_password, "0")
                || (login && *modified_user && strcmp (*modified_user, login)))
              *logout_user = 1;

            if (strcmp (modify_password, "0")
                && strcmp (modify_password, "2")
                && strcmp (modify_password, "3")
                && params_given (params, "current_user"))
              {
                g_free (credentials->password);
                credentials->password = g_strdup (password);
                *password_return = g_strdup (password);
              }
          }
        break;
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a user. "
                             "The user was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a user. "
                             "It is unclear whether the user has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a user. "
                             "It is unclear whether the user has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  if (gmp_success (entity)
      && (!strcmp (modify_password, "2")
          || !strcmp (modify_password, "3"))
      && params_given (params, "current_user"))
    {
      free_entity (entity);
      g_free (response);
      html = logout_xml (credentials,
                         "Authentication method changed. Please login with "
                         "LDAP password.", response_data);
    }
  else
    html = response_from_entity (connection, credentials, params, entity,
                                 "Save User", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Export a user.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Note XML on success.  Enveloped XML on error.
 */
char *
export_user_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return export_resource (connection, "user", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of users.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Users XML on success.  Enveloped XML
 *         on error.
 */
char *
export_users_gmp (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  return export_many (connection, "user", credentials, params,
                      response_data);
}

char *
cvss_calculator (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  GString *xml;
  const char *cvss_av, *cvss_au, *cvss_ac, *cvss_c, *cvss_i, *cvss_a;
  const char *cvss_vector, *name;

  cvss_av = params_value (params, "cvss_av");
  cvss_au = params_value (params, "cvss_au");
  cvss_ac = params_value (params, "cvss_ac");
  cvss_c = params_value (params, "cvss_c");
  cvss_i = params_value (params, "cvss_i");
  cvss_a = params_value (params, "cvss_a");
  cvss_vector = params_value (params, "cvss_vector");
  name = params_value (params, "name");

  xml = g_string_new ("<cvss_calculator>");

  /* Calculate base score */
  if (cvss_av && cvss_au && cvss_ac && cvss_c && cvss_i && cvss_a)
    {
      char *vector = g_strdup_printf
                      ("AV:%c/AC:%c/Au:%c/C:%c/I:%c/A:%c",
                       *cvss_av, *cvss_ac, *cvss_au, *cvss_c, *cvss_i, *cvss_a);

      g_string_append_printf (xml,
                              "<cvss_vector>%s</cvss_vector>"
                              "<cvss_score>%.1f</cvss_score>",
                              vector,
                              get_cvss_score_from_base_metrics (vector));

      g_string_append_printf
       (xml,
        "<cvss_av>%c</cvss_av><cvss_au>%c</cvss_au>"
        "<cvss_ac>%c</cvss_ac><cvss_c>%c</cvss_c>"
        "<cvss_i>%c</cvss_i><cvss_a>%c</cvss_a>",
        *cvss_av, *cvss_au, *cvss_ac, *cvss_c, *cvss_i, *cvss_a);

      g_free (vector);
    }
  else if (cvss_vector)
    {
      double cvss_score = get_cvss_score_from_base_metrics (cvss_vector);

      g_string_append_printf (xml,
                              "<cvss_vector>%s</cvss_vector>"
                              "<cvss_score>%.1f</cvss_score>",
                              cvss_vector,
                              cvss_score);

      if (cvss_score != -1.0)
        {
            cvss_av = strstr (cvss_vector, "AV:");
            cvss_ac = strstr (cvss_vector, "/AC:");
            cvss_au = strstr (cvss_vector, "/Au:");
            if (cvss_au == NULL)
              cvss_au = strstr (cvss_vector, "/AU:");
            cvss_c = strstr (cvss_vector, "/C:");
            cvss_i = strstr (cvss_vector, "/I:");
            cvss_a = strstr (cvss_vector, "/A:");

            if (cvss_av && cvss_ac && cvss_au && cvss_c
                && cvss_i && cvss_a)
              g_string_append_printf
               (xml,
                "<cvss_av>%c</cvss_av><cvss_ac>%c</cvss_ac>"
                "<cvss_au>%c</cvss_au><cvss_c>%c</cvss_c>"
                "<cvss_i>%c</cvss_i><cvss_a>%c</cvss_a>",
                *(cvss_av + 3), *(cvss_ac + 4), *(cvss_au + 4),
                *(cvss_c + 3), *(cvss_i + 3), *(cvss_a + 3));
        }
    }
  else if (name && !strcmp ("vector", name))
    {
      g_string_append_printf (xml,
                              "<cvss_score>%.1f</cvss_score>",
                              -1.0);
    }

  g_string_append (xml, "</cvss_calculator>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Generate AUTH_CONF_SETTING element for save_auth_gmp.
 */
#define AUTH_CONF_SETTING(key, value) \
  "<auth_conf_setting>"               \
  "<key>" key "</key>"                \
  "<value>" value "</value>"          \
  "</auth_conf_setting>"

/**
 * @brief Save authentication settings.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return XML enveloped list of users and configuration.
 */
char*
save_auth_gmp (gvm_connection_t *connection, credentials_t* credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  int ret;
  entity_t entity = NULL;
  char *html, *response = NULL, *truefalse;
  const char  *method;

  if (params_value (params, "enable")
      && (strcmp (params_value (params, "enable"), "1") == 0))
    truefalse = "true";
  else
    truefalse = "false";

  method = params_value (params, "group");
  CHECK_PARAM_INVALID (method, "Save Authentication");
  if (!strcmp (method, "method:ldap_connect"))
    {
      const char *ldaphost, *authdn, *certificate;
      ldaphost = params_value (params, "ldaphost");
      authdn = params_value (params, "authdn");
      certificate = params_value (params, "certificate");

      CHECK_PARAM_INVALID (ldaphost, "Save Authentication");
      CHECK_PARAM_INVALID (authdn, "Save Authentication");
      if (params_given (params, "certificate") && strcmp (certificate, ""))
        {
          CHECK_PARAM_INVALID (certificate, "Save Authentication");
          /** @warning authdn shall contain a single %s, handle with care. */
          ret = gmpf (connection, credentials, &response, &entity,
                      response_data,
                      "<modify_auth>"
                      "<group name=\"%s\">"
                      AUTH_CONF_SETTING ("enable", "%s")
                      AUTH_CONF_SETTING ("ldaphost", "%s")
                      AUTH_CONF_SETTING ("authdn", "%s")
                      AUTH_CONF_SETTING ("cacert", "%s")
                      "</group>"
                      "</modify_auth>", method, truefalse, ldaphost, authdn,
                      certificate);
        }
      else
        /** @warning authdn shall contain a single %s, handle with care. */
        ret = gmpf (connection, credentials, &response, &entity, response_data,
                    "<modify_auth>"
                    "<group name=\"%s\">"
                    AUTH_CONF_SETTING ("enable", "%s")
                    AUTH_CONF_SETTING ("ldaphost", "%s")
                    AUTH_CONF_SETTING ("authdn", "%s")
                    "</group>"
                    "</modify_auth>", method, truefalse, ldaphost, authdn);
    }
  else if (!strcmp (method, "method:radius_connect"))
    {
      const char *radiushost, *radiuskey;
      radiushost = params_value (params, "radiushost");
      radiuskey = params_value (params, "radiuskey");

      CHECK_PARAM_INVALID (radiushost, "Save Authentication");
      CHECK_PARAM_INVALID (radiuskey, "Save Authentication");
      /** @warning authdn shall contain a single %s, handle with care. */
      ret = gmpf (connection, credentials, &response, &entity, response_data,
                  "<modify_auth>"
                  "<group name=\"%s\">"
                  AUTH_CONF_SETTING ("enable", "%s")
                  AUTH_CONF_SETTING ("radiushost", "%s")
                  AUTH_CONF_SETTING ("radiuskey", "%s")
                  "</group>"
                  "</modify_auth>", method, truefalse, radiushost, radiuskey);
    }
  else
    return get_users (connection, credentials, params,
                      GSAD_MESSAGE_INVALID_PARAM
                       ("Save Authentication Configuration"),
                      response_data);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the auth settings. "
                             "The settings were not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the auth settings. "
                             "It is unclear whether the settings have been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the auth settings. "
                             "It is unclear whether the settings have been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                              "Save Authentication Configuration",
                              response_data);
  free_entity (entity);
  g_free (response);
  return html;
}
/**
 * @brief Get all dashboard settings
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_dashboard_settings_gmp (gvm_connection_t *connection,
                            credentials_t * credentials, params_t *params,
                            cmd_response_data_t* response_data)
{
  GString *xml;

  xml = g_string_new ("<get_dashboard_settings>");

  if (gvm_connection_sendf_xml (connection,
                              "<get_settings"
                              " filter='name~\"Dashboard\"'/>"))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting the "
                            "dashboard settings"
                            "Diagnostics: Failure to send command to manager "
                            "daemon.",
                            response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the "
                           "dashboard settings"
                           "Diagnostics: Failure to receive response from "
                           "manager daemon.",
                            response_data);
    }

  g_string_append (xml, "</get_dashboard_settings>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Save user setting
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return An action response.
 */
char*
save_setting_gmp (gvm_connection_t *connection,
                  credentials_t* credentials, params_t *params,
                  cmd_response_data_t* response_data)
{
  const gchar *setting_id = params_value (params, "setting_id");
  const gchar *setting_value = params_value (params, "setting_value");
  const gchar *setting_name = NULL;

  CHECK_PARAM_INVALID (setting_id, "Save Setting");
  CHECK_PARAM_INVALID (setting_value, "Save Setting");

  if (params_given (params, "setting_name")) {
    setting_name = params_value (params, "setting_name");
    CHECK_PARAM_INVALID (setting_name, "Save Settings")
  }

  gchar* value_64 = g_base64_encode ((guchar*)setting_value,
                                     strlen (setting_value));
  gchar *html;
  gchar* response = NULL;
  entity_t entity = NULL;
  int ret;
  GString *xml = g_string_new ("");

  xml_string_append (xml,
                     "<modify_setting setting_id=\"%s\">"
                     "<value>%s</value>",
                     setting_id,
                     value_64);

  if (setting_name) {
    xml_string_append (xml,
                       "<name>%s</name>",
                       setting_name);
  }

  xml_string_append (xml,
                     "</modify_setting>");

  cmd_response_data_set_content_type (response_data, GSAD_CONTENT_TYPE_APP_XML);

  ret = gmp (connection, credentials, &response, &entity, response_data,
              xml->str);

  g_free (value_64);
  g_string_free (xml, TRUE);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving settings. "
                             "It is unclear whether all the settings were saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:

        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving settings. "
                             "It is unclear whether all the settings were saved. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:

        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving settings. "
                             "It is unclear whether all the settings were saved. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }
  html = response_from_entity (connection, credentials, params, entity,
                              "Save Setting",
                              response_data);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Wizards. */

/**
 * @brief Returns a wizard page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials of user issuing the action.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
wizard (gvm_connection_t *connection, credentials_t *credentials,
        params_t *params, const char *extra_xml,
        cmd_response_data_t* response_data)
{
  GString *xml;
  const char* name = params_value (params, "name");

  if (name == NULL)
    {
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_BAD_REQUEST);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the wizard. "
                             "Given name was invalid",
                             response_data);
    }

  xml = g_string_new ("");
  g_string_append_printf (xml,
                          "<wizard>%s<%s/>",
                          extra_xml ? extra_xml : "",
                          name);

  /* Try to run init mode of the wizard */
  if (gvm_connection_sendf_xml (connection,
                                "<run_wizard read_only=\"1\">"
                                "<name>%s</name>"
                                "<mode>init</mode>"
                                "</run_wizard>",
                                name)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the wizard. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the"
                           " wizard."
                           "Diagnostics: Failure to receive response from"
                           " manager daemon.",
                           response_data);
    }

  /* Get the setting. */

  if (gvm_connection_sendf_xml (connection,
                                "<get_settings"
                                " setting_id=\"20f3034c-e709-11e1-87e7-406186ea4fc5\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the wizard. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while the wizard. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</wizard>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Returns a wizard page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials of user issuing the action.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
wizard_gmp (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, cmd_response_data_t* response_data)
{
  return wizard (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Returns a wizard_get page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials of user issuing the action.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
wizard_get (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t* response_data)
{
  const char *name;
  int ret;
  GString *run;
  param_t *param;
  gchar *param_name, *response;
  params_iterator_t iter;
  params_t *wizard_params;
  entity_t entity;
  gchar *wizard_xml;

  /* The naming is a bit subtle here, because the HTTP request
   * parameters are called "param"s and so are the GMP wizard
   * parameters. */

  name = params_value (params, "get_name");
  if (name == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while trying to start a wizard. "
                           "Diagnostics: Required parameter 'get_name' was NULL.",
                           response_data);
    }

  run = g_string_new ("<run_wizard read_only=\"1\">");

  g_string_append_printf (run,
                          "<name>%s</name>"
                          "<params>",
                          name);

  wizard_params = params_values (params, "event_data:");
  if (wizard_params)
    {
      params_iterator_init (&iter, wizard_params);
      while (params_iterator_next (&iter, &param_name, &param))
        xml_string_append (run,
                           "<param>"
                           "<name>%s</name>"
                           "<value>%s</value>"
                           "</param>",
                           param_name,
                           param->value);
    }

  g_string_append (run, "</params></run_wizard>");

  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials, &response, &entity, response_data,
             run->str);
  g_string_free (run, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "The wizard did not start. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  wizard_xml = g_strdup_printf ("<wizard><%s/>%s%s</wizard>",
                                name,
                                extra_xml ? extra_xml : "",
                                response);

  return envelope_gmp (connection, credentials, params, wizard_xml,
                       response_data);
}

/**
 * @brief Returns a wizard_get page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials of user issuing the action.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
wizard_get_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  return wizard_get (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Delete multiple resources, get next page, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
bulk_delete_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  const char  *type;
  GString *commands_xml;
  params_t *selected_ids;
  params_iterator_t iter;
  param_t *param;
  gchar *param_name;
  gchar *html, *response;
  entity_t entity;
  gchar *extra_attribs;

  type = params_value (params, "resource_type");
  if (type == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting resources. "
                           "The resources were not deleted. "
                           "Diagnostics: Required parameter 'resource_type' was NULL.",
                           response_data);
    }

  /* Extra attributes */
  extra_attribs = NULL;

  /* Inheritor of user's resource */
  if (strcmp (type, "user") == 0)
    {
      const char* inheritor_id;
      inheritor_id = params_value (params, "inheritor_id");
      if (inheritor_id)
        extra_attribs = g_strdup_printf ("inheritor_id=\"%s\"", inheritor_id);
    }

  commands_xml = g_string_new ("<commands>");

  selected_ids = params_values (params, "bulk_selected:");
  if (selected_ids)
    {
      params_iterator_init (&iter, selected_ids);
      while (params_iterator_next (&iter, &param_name, &param))
        {
          xml_string_append (commands_xml,
                            "<delete_%s %s_id=\"%s\" ultimate=\"0\"",
                            type,
                            type,
                            param_name);
          if (extra_attribs)
            g_string_append_printf (commands_xml, " %s/>", extra_attribs);
          else
            g_string_append (commands_xml, "/>");
        }
    }

  g_string_append (commands_xml, "</commands>");

  /* Delete the resources and get all resources. */

  if (gvm_connection_sendf_xml (connection,
                                commands_xml->str)
      == -1)
    {
      g_string_free (commands_xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting resources. "
                           "The resources were not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }
  g_string_free (commands_xml, TRUE);

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting resources. "
                           "It is unclear whether the resources have been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           response_data);
    }


  /* Cleanup, and return transformed XML. */

  if (params_given (params, "next") == 0)
    {
      gchar *next;
      next = g_strdup_printf ("get_%ss", type);
      params_add (params, "next", next);
      g_free (next);
    }

  html = response_from_entity (connection, credentials, params, entity,
                              "Bulk Delete", response_data);
  g_free (response);
  free_entity (entity);

  return html;
}

/**
 * @brief Export multiple resources
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
bulk_export_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  const gchar  *type, *filter, *bulk_select;
  gchar *param_name;
  GString *bulk_string;
  params_t *selected_ids;
  params_iterator_t iter;
  param_t *param;

  type = params_value (params, "resource_type");
  filter = params_value (params, "filter");
  bulk_select = params_value (params, "bulk_select");

  CHECK_PARAM_INVALID (type, "Bulk export")
  CHECK_PARAM_INVALID (bulk_select, "Bulkd export")

  if (bulk_select && strcmp(bulk_select, "1") == 0)
  {
    bulk_string = g_string_new("first=1 rows=-1 uuid=");

    selected_ids = params_values(params, "bulk_selected:");
    if (selected_ids)
    {
      params_iterator_init(&iter, selected_ids);
      while (params_iterator_next(&iter, &param_name, &param))
       {
         xml_string_append(bulk_string, " uuid=%s", param_name);
       }
    }
  }
  else
  {
    bulk_string = g_string_new(filter ?: "");
  }

  params_add(params, "filter", g_string_free(bulk_string, FALSE));

  return export_many(connection, type, credentials, params, response_data);
}

/* Assets. */

/**
 * @brief Create a host, serve next page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_host_gmp (gvm_connection_t *connection, credentials_t * credentials,
                 params_t *params, cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *name, *comment;
  entity_t entity;
  GString *xml;

  name = params_value (params, "name");
  CHECK_PARAM_INVALID (name, "Create Host");

  comment = params_value (params, "comment");
  CHECK_PARAM_INVALID (comment, "Create Host");

  /* Create the host. */

  xml = g_string_new ("");

  xml_string_append (xml,
                     "<create_asset>"
                     "<asset>"
                     "<type>host</type>"
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "</asset>"
                     "</create_asset>",
                     name,
                     comment);

  ret = gmp (connection, credentials,
             &response,
             &entity,
             response_data,
             xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new host. "
                            "No new host was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new host. "
                            "It is unclear whether the host has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new host. "
                            "It is unclear whether the host has been created or not. "
                            "Diagnostics: Internal Error.",
                            response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "asset_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                              "Create Host", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Request an asset.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return XML enveloped asset response or error message.
 */
char *
get_asset (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t* response_data)
{
  char *ret;
  GString *extra_attribs, *extra_response;
  const char *asset_type;

  asset_type = params_value (params, "asset_type");
  if (asset_type == NULL)
    {
      param_t *param;
      param = params_add (params, "asset_type", "host");
      param->valid = 1;
      param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
      asset_type = params_value (params, "asset_type");
    }

  if (strcmp (asset_type, "host")
      && strcmp (asset_type, "os"))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an asset. "
                           "Diagnostics: Invalid asset_type parameter value",
                           response_data);
    }

  if (params_value (params, "asset_name")
      && params_value (params, "asset_id"))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an asset. "
                           "Diagnostics: Both ID and Name set.",
                           response_data);
    }

  extra_response = g_string_new (extra_xml ? extra_xml : "");

  extra_attribs = g_string_new ("");
  g_string_append_printf (extra_attribs, "type=\"%s\"",
                          params_value (params, "asset_type"));
  if (params_value (params, "asset_name"))
    g_string_append_printf (extra_attribs,
                            " name=\"%s\"",
                            params_value (params, "asset_name"));
  else if (params_value (params, "asset_id"))
    g_string_append_printf (extra_attribs,
                            " asset_id=\"%s\"",
                            params_value (params, "asset_id"));
  if (params_value (params, "details"))
    g_string_append_printf (extra_attribs,
                            " details=\"%s\"",
                            params_value (params, "details"));

  ret = get_one (connection, "asset", credentials, params, extra_response->str,
                 extra_attribs->str, response_data);

  g_string_free (extra_response, TRUE);
  g_string_free (extra_attribs, TRUE);

  return ret;
}

/**
 * @brief Get asset, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_asset_gmp (gvm_connection_t *connection, credentials_t * credentials,
               params_t *params, cmd_response_data_t* response_data)
{
  return get_asset (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Request assets.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials for the manager connection.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return XML enveloped assets response or error message.
 */
char *
get_assets (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t* response_data)
{
  char *ret;
  GString *extra_attribs, *extra_response;
  const char *asset_type;

  asset_type = params_value (params, "asset_type");
  if (asset_type == NULL)
    {
      param_t *param;
      param = params_add (params, "asset_type", "host");
      param->valid = 1;
      param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
      asset_type = params_value (params, "asset_type");
    }

  if (strcmp (asset_type, "host")
      && strcmp (asset_type, "os"))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting Assets. "
                           "Diagnostics: Invalid asset_type parameter value",
                           response_data);
    }

  extra_response = g_string_new (extra_xml ? extra_xml : "");

  extra_attribs = g_string_new("");
  g_string_append_printf (extra_attribs, "type=\"%s\" ignore_pagination=\"%s\"",
                          params_value (params, "asset_type"),
                          params_value (params, "ignore_pagination")
                            ? params_value (params, "ignore_pagination")
                            : "0");
  if (params_value (params, "details"))
    g_string_append_printf (extra_attribs,
                            " details=\"%s\"",
                            params_value (params, "details"));
  ret = get_many (connection, "asset", credentials, params, extra_response->str,
                  extra_attribs->str, response_data);

  g_string_free (extra_response, TRUE);
  g_string_free (extra_attribs, TRUE);

  return ret;
}

/**
 * @brief Get assets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_assets_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  return get_assets (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Create an asset, get report, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_asset_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  char *ret;
  gchar *response;
  const char  *report_id, *filter;
  entity_t entity;

  report_id = params_value (params, "report_id");
  filter = params_value (params, "filter");

  CHECK_PARAM_INVALID (report_id, "Create Asset");
  CHECK_PARAM_INVALID (filter, "Create Asset");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<create_asset>"
                "<report id=\"%s\">"
                "<filter><term>%s</term></filter>"
                "</report>"
                "</create_asset>",
                report_id,
                filter))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating an asset. "
                             "No new asset was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating an asset. "
                             "It is unclear whether the asset has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating an asset. "
                             "It is unclear whether the asset has been created or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Create Asset", response_data);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete an asset, go to the next page.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_asset_gmp (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  gchar *html, *response, *resource_id;
  const char *next_id;
  entity_t entity;

  if (params_value (params, "asset_id"))
    resource_id = g_strdup (params_value (params, "asset_id"));
  else if (params_value (params, "report_id"))
    resource_id = g_strdup (params_value (params, "report_id"));
  else
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an asset. "
                           "The asset was not deleted. "
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  /* This is a hack, needed because asset_id is the param name used for
   * both the asset being deleted and the asset on the next page. */
  next_id = params_value (params, "next_id");
  if (next_id
      && params_value (params, "asset_id"))
    {
      param_t *param;
      param = params_get (params, "asset_id");
      g_free (param->value);
      param->value = g_strdup (next_id);
      param->value_size = strlen (param->value);
    }

  /* Delete the resource and get all resources. */

  if (gvm_connection_sendf (connection,
                            "<delete_asset %s_id=\"%s\"/>",
                            params_value (params, "asset_id")
                             ? "asset" : "report",
                            resource_id)
      == -1)
    {
      g_free (resource_id);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an asset. "
                           "The asset is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           response_data);
    }

  g_free (resource_id);

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an asset. "
                           "It is unclear whether the asset has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           response_data);
    }

  /* Cleanup, and return transformed XML. */

  if (params_given (params, "next") == 0)
    params_add (params, "next", "get_asset");

  html = next_page (connection, credentials, params, response,
                    response_data);
  if (html == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                          MHD_HTTP_BAD_REQUEST);
      html = gsad_message (credentials,
          "Internal error", __FUNCTION__, __LINE__,
          "An internal error occurred while deleting an "
          "asset. Diagnostics: Error in parameter next.",
          response_data);
    }
  g_free (response);
  free_entity (entity);
  return html;
}

/**
 * @brief Export an asset.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Asset XML on success.  Enveloped XML on error.
 */
char *
export_asset_gmp (gvm_connection_t *connection, credentials_t * credentials,
                  params_t *params, cmd_response_data_t* response_data)
{
  return export_resource (connection, "asset", credentials, params,
                          response_data);
}

/**
 * @brief Export a list of assets.
 *
 * @param[in]   connection           Connection to manager.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  response_data        Extra data return for the HTTP response.
 *
 * @return Assets XML on success.  Enveloped XML
 *         on error.
 */
char *
export_assets_gmp (gvm_connection_t *connection, credentials_t *
                   credentials, params_t *params,
                   cmd_response_data_t* response_data)
{
  return export_many (connection, "asset", credentials, params,
                      response_data);
}

/**
 * @brief Setup edit XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_asset (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t* response_data)
{
  GString *xml;
  const char *asset_id;
  gchar *response;
  entity_t entity;

  asset_id = params_value (params, "asset_id");
  if (asset_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a asset. "
                           "The asset remains as it was. "
                           "Diagnostics: Required ID parameter was NULL.",
                           response_data);
    }

  xml = g_string_new ("");

  g_string_append_printf (xml, "<edit_asset>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials,
                &response,
                &entity,
                response_data,
                "<get_assets"
                " type=\"host\""
                " asset_id=\"%s\""
                " details=\"1\"/>",
                asset_id))
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (xml, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the asset. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (xml, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the asset. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        g_string_free (xml, TRUE);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the asset. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  g_string_append (xml, response);
  g_string_append_printf (xml, "</edit_asset>");
  free_entity (entity);
  g_free (response);
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE),
                       response_data);
}

/**
 * @brief Setup edit_asset XML, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
edit_asset_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  return edit_asset (connection, credentials, params, NULL, response_data);
}

/**
 * @brief Modify an asset, get all assets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_asset_gmp (gvm_connection_t *connection, credentials_t * credentials,
                params_t *params, cmd_response_data_t* response_data)
{
  int ret;
  gchar *html, *response;
  const char  *asset_id, *comment;
  entity_t entity;

  asset_id = params_value (params, "asset_id");
  comment = params_value (params, "comment");

  CHECK_PARAM_INVALID (asset_id, "Save Asset");
  CHECK_PARAM_INVALID (comment, "Save Asset");

  /* Modify the asset. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials,
              &response,
              &entity,
              response_data,
              "<modify_asset asset_id=\"%s\">"
              "<comment>%s</comment>"
              "</modify_asset>",
              asset_id,
              comment);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving an asset. "
                             "The asset was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             response_data);
      case 2:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving an asset. "
                             "It is unclear whether the asset has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             response_data);
      default:
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving an asset. "
                             "It is unclear whether the asset has been saved or not. "
                             "Diagnostics: Internal Error.",
                             response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Save Asset", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}



/* Manager communication. */

/**
 * @brief Connect to Greenbone Vulnerability Manager daemon.
 *
 * @param[in]  path  Path to the Manager socket.
 *
 * @return Socket, or -1 on error.
 */
int
connect_unix (const gchar *path)
{
  struct sockaddr_un address;
  int sock;

  /* Make socket. */

  sock = socket (AF_UNIX, SOCK_STREAM, 0);
  if (sock == -1)
    {
      g_warning ("Failed to create server socket");
      return -1;
    }

  /* Connect to server. */

  address.sun_family = AF_UNIX;
  strncpy (address.sun_path, path, sizeof (address.sun_path) - 1);
  if (connect (sock, (struct sockaddr *) &address, sizeof (address)) == -1)
    {
      g_warning ("Failed to connect to server: %s", strerror (errno));
      close (sock);
      return -1;
    }

  return sock;
}

/**
 * @brief Connect to an address.
 *
 * @param[out]  connection  Connection.
 * @param[out]  address     Address.
 * @param[out]  port        Port.
 *
 * @return 0 success, -1 failed to connect.
 */
int
openvas_connection_open (gvm_connection_t *connection,
                         const gchar *address,
                         int port)
{
  if (address == NULL)
    return -1;

  connection->tls = manager_use_tls;

  if (manager_use_tls)
    {
      connection->socket = gvm_server_open (&connection->session,
                                            address,
                                            port);
      connection->credentials = NULL;
    }
  else
    connection->socket = connect_unix (address);

  if (connection->socket == -1)
    return -1;

  return 0;
}

/**
 * @brief Check authentication credentials.
 *
 * @param[in]  username      Username.
 * @param[in]  password      Password.
 * @param[out] role          Role.
 * @param[out] timezone      Timezone.
 * @param[out] severity      Severity class.
 * @param[out] capabilities  Capabilities of manager.
 * @param[out] language      User Interface Language, or NULL.
 * @param[out] pw_warning    Password warning message, NULL if password is OK.
 *
 * @return 0 if valid, 1 failed, 2 manager down, -1 error.
 */
int
authenticate_gmp (const gchar * username, const gchar * password,
                  gchar **role, gchar **timezone, gchar **severity,
                  gchar **capabilities, gchar **language, gchar **pw_warning)
{
  gvm_connection_t connection;
  int auth;
  gmp_authenticate_info_opts_t auth_opts;

  if (openvas_connection_open (&connection,
                               manager_address,
                               manager_port))
    {
      g_debug ("%s failed to acquire socket!\n", __FUNCTION__);
      return 2;
    }

#ifdef DEBUG_AUTH
  /* Enable this if you need the CGI to sleep after launch. This can be useful
   * if you need to attach to manager process the CGI is talking to for
   * debugging purposes.
   *
   * It's probably easier to run gsad in the foreground under gdb and
   * set a break point here.
   */
  g_debug ("Sleeping!");
  sleep (20);
#endif

  auth_opts = gmp_authenticate_info_opts_defaults;
  auth_opts.username = username;
  auth_opts.password = password;
  auth_opts.role = role;
  auth_opts.severity = severity;
  auth_opts.timezone = timezone;
  auth_opts.pw_warning = pw_warning;

  auth = gmp_authenticate_info_ext_c (&connection, auth_opts);
  if (auth == 0)
    {
      entity_t entity;
      const char* status;
      char first;
      gchar *response;
      int ret;

      /* Get language setting. */

      ret = setting_get_value (&connection,
                               "6765549a-934e-11e3-b358-406186ea4fc5",
                               language,
                               NULL);

      switch (ret)
        {
          case 0:
            break;
          case 1:
          case 2:
            gvm_connection_close (&connection);
            return 2;
          default:
            gvm_connection_close (&connection);
            return -1;
        }

      /* Request help. */

      ret = gvm_connection_sendf (&connection,
                                  "<help format=\"XML\" type=\"brief\"/>");
      if (ret)
        {
          gvm_connection_close (&connection);
          return 2;
        }

      /* Read the response. */

      entity = NULL;
      if (read_entity_and_text_c (&connection, &entity, &response))
        {
          gvm_connection_close (&connection);
          return 2;
        }

      /* Check the response. */

      status = entity_attribute (entity, "status");
      if (status == NULL
          || strlen (status) == 0)
        {
          g_free (response);
          free_entity (entity);
          return -1;
        }
      first = status[0];
      free_entity (entity);
      if (first == '2')
        {
          *capabilities = response;
        }
      else
        {
          gvm_connection_close (&connection);
          g_free (response);
          return -1;
        }

      gvm_connection_close (&connection);
      return 0;
    }
  else
    {
      gvm_connection_close (&connection);
      return 1;
    }
}

/**
 * @brief Login and create a session
 *
 * @param[in]   con             HTTP Connection
 * @param[in]   params          Request paramters
 * @param[out]  response_data   Extra data return for the HTTP response
 * @param[in]   client_address  Client address
 *
 * @return MHD_YES on success. MHD_NO on errors.
 */
int
login (http_connection_t *con,
       params_t *params,
       cmd_response_data_t *response_data,
       const char *client_address)
{
  int ret;
  authentication_reason_t auth_reason;
  credentials_t *credentials;
  gchar *timezone;
  gchar *role;
  gchar *capabilities;
  gchar *severity;
  gchar *language;
  gchar *pw_warning;

  const char *password = params_value (params, "password");
  const char *login = params_value(params, "login");

  if ((password == NULL)
      && (params_original_value (params, "password") == NULL))
    password = "";

  if (login && password)
    {
      ret = authenticate_gmp (login,
                              password,
                              &role,
                              &timezone,
                              &severity,
                              &capabilities,
                              &language,
                              &pw_warning);
      if (ret)
        {
          int status;
          if (ret == -1)
            status = MHD_HTTP_INTERNAL_SERVER_ERROR;
          if (ret == 2)
            status = MHD_HTTP_SERVICE_UNAVAILABLE;
          else
            status = MHD_HTTP_UNAUTHORIZED;

          auth_reason =
                  ret == 2
                    ? GMP_SERVICE_DOWN
                    : (ret == -1
                        ? LOGIN_ERROR
                        : LOGIN_FAILED);

          g_warning ("Authentication failure for '%s' from %s",
                     login ?: "",
                     client_address);
          return handler_send_reauthentication(con, status,
                                               auth_reason);
        }
      else
        {
          user_t *user;
          user = user_add (login, password, timezone, severity, role,
                           capabilities, language, pw_warning, client_address);

          g_message ("Authentication success for '%s' from %s",
                     login ?: "",
                     client_address);

          credentials = credentials_new (user, language, client_address);

          char *data = envelope_gmp (NULL, credentials, params, g_strdup(""), response_data);

          ret = handler_create_response (con, data, response_data, user->cookie);

          user_release (user);

          credentials_free (credentials);

          g_free (timezone);
          g_free (severity);
          g_free (capabilities);
          g_free (language);
          g_free (role);
          g_free (pw_warning);

          return ret;
        }
    }
  else
    {
      g_warning ("Authentication failure for '%s' from %s",
                 login ?: "",
                 client_address);
      return handler_send_reauthentication (con, MHD_HTTP_UNAUTHORIZED,
                                            LOGIN_FAILED);
    }
}


/**
 * @brief Connect to Greenbone Vulnerability Manager daemon.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[out]  connection   Connection to Manager on success.
 * @param[out]  response_data  Extra data return for the HTTP response.
 *
 * @return 0 success, -1 failed to connect, -2 authentication failed.
 */
int
manager_connect (credentials_t *credentials,
                 gvm_connection_t *connection,
                 cmd_response_data_t *response_data)
{
  gmp_authenticate_info_opts_t auth_opts;

  if (openvas_connection_open (connection,
                               manager_address,
                               manager_port))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_SERVICE_UNAVAILABLE);
      return -1;
    }

#if 0
  g_debug ("in manager_connect: Trying to authenticate with %s/%s\n",
           credentials->username,
           credentials->password);
#endif


  auth_opts = gmp_authenticate_info_opts_defaults;
  auth_opts.username = credentials->username;
  auth_opts.password = credentials->password;
  if (gmp_authenticate_info_ext_c (connection, auth_opts))
    {
      g_debug ("authenticate failed!\n");
      gvm_connection_close (connection);
      return -2;
    }

#ifdef DEBUG
  /* Enable this if you need the CGI to sleep after launch. This can be useful
   * if you need to attach to manager process the CGI is talking to for
   * debugging purposes.
   *
   * An easier method is to run gsad under gdb and set a breakpoint here.
   */
  g_debug ("Sleeping!");
  sleep (10);
#endif
  return 0;
}
