/* Copyright (C) 2009-2021 Greenbone Networks GmbH
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
 * @file gsad_gmp.c
 * @brief GMP communication module of Greenbone Security Assistant daemon.
 *
 * This file implements an API for GMP.  The functions call the Greenbone
 * Vulnerability Manager via GMP properly.
 */

#include "gsad_gmp.h"

#include "gsad_base.h" /* for set_language_code */
#include "gsad_credentials.h"
#include "gsad_gmp_arguments.h" /* for gmp_arguments_t */
#include "gsad_gmp_request.h"   /* for gmp_request() */
#include "gsad_http.h"          /* for gsad_message */
#include "gsad_i18n.h"
#include "gsad_params.h"
#include "gsad_session.h"
#include "gsad_settings.h" /* for vendor_version_get */
#include "utils.h"

#include <arpa/inet.h>
#include <assert.h>
#include <errno.h>
#include <fcntl.h>
#include <glib.h>
#include <gvm/base/cvss.h>
#include <gvm/gmp/gmp.h>
#include <gvm/util/fileutils.h>
#include <gvm/util/serverutils.h> /* for gvm_connection_t */
#include <gvm/util/xmlutils.h> /* for xml_string_append, read_string_c, ... */
#include <microhttpd.h>
#include <netdb.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/un.h>
#include <time.h>
#include <unistd.h>

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
#define GSAD_MESSAGE_INVALID                                              \
  "<gsad_msg status_text=\"%s\" operation=\"%s\">"                        \
  "At least one entered value contains invalid characters or exceeds"     \
  " a size limit.  You may use the Back button of your browser to adjust" \
  " the entered values.  If in doubt, the online help of the respective " \
  "section"                                                               \
  " will lead you to the appropriate help page."                          \
  "</gsad_msg>"

/** @brief Answer for invalid input. */
#define GSAD_MESSAGE_INVALID_PARAM(op)                                    \
  "<gsad_msg status_text=\"Invalid parameter\" operation=\"" op "\">"     \
  "At least one entered value contains invalid characters or exceeds"     \
  " a size limit.  You may use the Back button of your browser to adjust" \
  " the entered values.  If in doubt, the online help of the respective " \
  "section"                                                               \
  " will lead you to the appropriate help page."                          \
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
 * @brief Check if variable is NULL
 *
 * @param[in]  name      Param name.
 * @param[in]  op_name   Operation name.
 */
#define CHECK_VARIABLE_INVALID(name, op_name)                                 \
  if (name == NULL)                                                           \
    {                                                                         \
      return message_invalid (connection, credentials, params, response_data, \
                              "Given " G_STRINGIFY (name) " was invalid",     \
                              op_name);                                       \
    }

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

#define XML_REPORT_FORMAT_ID "a994b278-1f62-11e1-96ac-406186ea4fc5"
#define ANONXML_REPORT_FORMAT_ID "5057e5cc-b825-11e4-9d0e-28d24461215b"

/* Headers. */

static int
gmp (gvm_connection_t *, credentials_t *, gchar **, entity_t *,
     cmd_response_data_t *, const char *);

static int
gmpf (gvm_connection_t *, credentials_t *, gchar **, entity_t *,
      cmd_response_data_t *, const char *, ...);

static char *
get_alert (gvm_connection_t *, credentials_t *, params_t *, const char *,
           cmd_response_data_t *);

static char *
get_asset (gvm_connection_t *, credentials_t *, params_t *, const char *,
           cmd_response_data_t *);

static char *
get_trash (gvm_connection_t *, credentials_t *, params_t *, const char *,
           cmd_response_data_t *);

static char *
get_config_family (gvm_connection_t *, credentials_t *, params_t *, int,
                   cmd_response_data_t *);

static char *
get_filter (gvm_connection_t *, credentials_t *, params_t *, const char *,
            cmd_response_data_t *);

static char *
get_group (gvm_connection_t *, credentials_t *, params_t *, const char *,
           cmd_response_data_t *);

static char *
get_credential (gvm_connection_t *, credentials_t *, params_t *, const char *,
                cmd_response_data_t *);

static char *
get_note (gvm_connection_t *, credentials_t *, params_t *, const char *,
          cmd_response_data_t *);

static char *
get_override (gvm_connection_t *, credentials_t *, params_t *, const char *,
              cmd_response_data_t *);

static char *
get_permission (gvm_connection_t *, credentials_t *, params_t *, const char *,
                cmd_response_data_t *);

static char *
get_port_list (gvm_connection_t *, credentials_t *, params_t *, const char *,
               cmd_response_data_t *);

static char *
get_tag (gvm_connection_t *, credentials_t *, params_t *, const char *,
         cmd_response_data_t *);

static char *
get_target (gvm_connection_t *, credentials_t *, params_t *, const char *,
            cmd_response_data_t *);

static char *
get_report_format (gvm_connection_t *, credentials_t *, params_t *,
                   const char *, cmd_response_data_t *);

static char *
get_role (gvm_connection_t *, credentials_t *, params_t *, const char *,
          cmd_response_data_t *);

static char *
get_scanner (gvm_connection_t *, credentials_t *, params_t *, const char *,
             cmd_response_data_t *);

static char *
get_schedule (gvm_connection_t *, credentials_t *, params_t *, const char *,
              cmd_response_data_t *);

static char *
get_user (gvm_connection_t *, credentials_t *, params_t *, const char *,
          cmd_response_data_t *);

static char *
wizard (gvm_connection_t *, credentials_t *, params_t *, const char *,
        cmd_response_data_t *);

static char *
wizard_get (gvm_connection_t *, credentials_t *, params_t *, const char *,
            cmd_response_data_t *);

static int
gmp_success (entity_t entity);

static gchar *
response_from_entity (gvm_connection_t *, credentials_t *, params_t *, entity_t,
                      const char *, cmd_response_data_t *);

static gchar *
action_result (gvm_connection_t *, credentials_t *, params_t *,
               cmd_response_data_t *, const char *action, const char *message,
               const char *details, const char *id);
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
  user_t *user =
    credentials_get_user (credentials); // TODO pass user_t directly
  return strstr (user_get_capabilities (user), name) ? 1 : 0;
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
      manager_address = g_build_filename (GVM_RUN_DIR, "gvmd.sock", NULL);
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

/**
 * @brief Wrap some XML in an envelope.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         HTTP request params (UNUSED)
 * @param[in]  xml            XML string.  Freed before exit.
 * @param[out] response_data  Extra data return for the HTTP response or NULL.
 *
 * @return Enveloped GMP XML object.
 */
static char *
envelope_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, gchar *xml, cmd_response_data_t *response_data)
{
  time_t now;
  gchar *res;
  GString *string;
  char ctime_now[200];
  struct timeval tv;

  assert (credentials);

  user_t *user = credentials_get_user (credentials);
  const gchar *timezone = user_get_timezone (user);
  const gchar *pw_warning = user_get_password_warning (user);

  now = time (NULL);
  ctime_r_strip_newline (&now, ctime_now);

  string = g_string_new ("");

  gettimeofday (&tv, NULL);
  res = g_markup_printf_escaped (
    "<envelope>"
    "<version>%s</version>"
    "<vendor_version>%s</vendor_version>"
    "<token>%s</token>"
    "<time>%s</time>"
    "<timezone>%s</timezone>"
    "<login>%s</login>"
    "<session>%ld</session>"
    "<role>%s</role>"
    "<i18n>%s</i18n>"
    "<client_address>%s</client_address>"
    "<backend_operation>%.2f</backend_operation>",
    GSAD_VERSION, vendor_version_get (), user_get_token (user), ctime_now,
    timezone ? timezone : "", user_get_username (user),
    user_get_session_timeout (user), user_get_role (user),
    credentials_get_language (credentials),
    user_get_client_address (user), credentials_get_cmd_duration (credentials));

  g_string_append (string, res);
  g_free (res);

  if (pw_warning)
    {
      gchar *warning_elem;
      warning_elem = g_markup_printf_escaped ("<password_warning>"
                                              "%s"
                                              "</password_warning>",
                                              pw_warning);
      g_string_append (string, warning_elem);
      g_free (warning_elem);
    }

  g_string_append_printf (string, "%s</envelope>", xml);
  g_free (xml);

  cmd_response_data_set_content_type (response_data, GSAD_CONTENT_TYPE_APP_XML);
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
    if (strcmp (name, string) == 0)
      return 1;
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
    if (param->value_size && param->value[0] == '1'
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
check_modify_config (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, const char *next, const char *fail_next,
                     int *success, cmd_response_data_t *response_data)
{
  entity_t entity;
  gchar *response;
  const char *status_text;

  if (success)
    *success = 0;

  /** @todo This would be much easier with real error codes. */

  /* Read the response. */

  if (read_entity_c (connection, &entity))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a config. "
        "It is unclear whether the entire config has been saved. "
        "Diagnostics: Failure to parse status_text from response.",
        response_data);
    }
  else if (str_equal (status_text, "MODIFY_CONFIG name must be unique"))
    {
      const char *message = "A config with the given name exists already.";

      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      response = action_result (connection, credentials, params, response_data,
                                "Save Config", message, NULL, NULL);

      free_entity (entity);
      return response;
    }
  else if (success && gmp_success (entity))
    {
      *success = 1;
    }

  response = response_from_entity (connection, credentials, params, entity,
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
  if ((status == NULL) || (strlen (status) == 0))
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
  else if (str_equal (entity_attribute (entity, "status_text"),
                      "Permission denied"))
    cmd_response_data_set_status_code (response_data, MHD_HTTP_FORBIDDEN);
  else if (str_equal (entity_attribute (entity, "status"), "404"))
    cmd_response_data_set_status_code (response_data, MHD_HTTP_NOT_FOUND);
  else
    cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
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
gmp (gvm_connection_t *connection, credentials_t *credentials, gchar **response,
     entity_t *entity_return, cmd_response_data_t *response_data,
     const char *command)
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

  ret = gvm_connection_sendf (connection, "<get_settings setting_id=\"%s\"/>",
                              setting_id);
  if (ret)
    return 1;

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    return 2;

  status = entity_attribute (entity, "status");
  if (status == NULL || strlen (status) == 0)
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

/* Generic page handlers. */

/**
 * @brief Generate a enveloped GMP XML containing an action result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         HTTP request params
 * @param[out] response_data  Extra data return for the HTTP response.
 * @param[in]  action         Name of the action.
 * @param[in]  message        Status message.
 * @param[in]  details        Status details (optional).
 * @param[in]  id             ID of the handled entity (optional).
 *
 * @return Enveloped XML object.
 */
static gchar *
action_result (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data,
               const char *action, const char *message, const char *details,
               const char *id)
{
  GString *xml;

  xml = g_string_new ("");
  xml_string_append (xml,
                     "<action_result>"
                     "<action>%s</action>"
                     "<message>%s</message>",
                     action ? action : "", message ? message : "");

  if (details)
    xml_string_append (xml, "<details>%s</details>", details);

  if (id)
    xml_string_append (xml, "<id>%s</id>", id);

  g_string_append (xml, "</action_result>");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Check a param using the direct response method.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  response_data  Response data.
 * @param[in]  message        Message.
 * @param[in]  op_name        Operation name.
 *
 * @return Enveloped XML object.
 */
gchar *
message_invalid (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data,
                 const char *message, const char *op_name)
{
  gchar *ret = action_result (connection, credentials, params, response_data,
                              op_name, message, NULL, NULL);

  cmd_response_data_set_status_code (response_data,
                                     GSAD_STATUS_INVALID_REQUEST);

  return ret;
}

/**
 * @brief Set redirect or return a basic action_result page based on entity.
 *
 * @param[in]  connection     Connection to manager
 */
static gchar *
response_from_entity (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, entity_t entity, const char *action,
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

  res = action_result (connection, credentials, params, response_data, action,
                       entity_attribute (entity, "status_text"),
                       entity_text (status_details_entity),
                       entity_attribute (entity, "id"));
  return res;
}

/**
 * @brief Get a single entity, envelope the result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  type           Type of resource.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[in]  arguments      Extra arguments for GMP GET command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_entity (gvm_connection_t *connection, const char *type,
            credentials_t *credentials, params_t *params,
            gmp_arguments_t *arguments, cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *cmd;
  entity_t entity;

  xml = g_string_new ("");

  if (str_equal (type, "info"))
    {
      cmd = g_strdup_printf ("get_%s", type);
    }
  else
    {
      cmd = g_strdup_printf ("get_%ss", type);
    }

  g_string_append_printf (xml, "<get_%s>", type);

  if (gmp_request (connection, cmd, arguments))
    {
      g_free (cmd);

      gmp_arguments_free (arguments);

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a resource list. "
        "The current list of resources is not available. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  gmp_arguments_free (arguments);

  if (read_entity_and_string_c (connection, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      g_free (cmd);

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting resources list. "
        "The current list of resources is not available. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  if (gmp_success (entity) != 1)
    {
      gchar *message;

      set_http_status_from_entity (entity, response_data);

      message =
        gsad_message (credentials, "Error", __func__, __LINE__,
                      entity_attribute (entity, "status_text"), response_data);

      g_string_free (xml, TRUE);
      g_free (cmd);
      free_entity (entity);
      return message;
    }

  g_string_append_printf (xml, "</get_%s>", type);

  g_free (cmd);
  free_entity (entity);

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Get one resource, envelope the result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  type           Type of resource.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[in]  arguments      Extra arguments for GMP GET command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_one (gvm_connection_t *connection, const char *type,
         credentials_t *credentials, params_t *params, const char *extra_xml,
         gmp_arguments_t *arguments, cmd_response_data_t *response_data)
{
  gchar *id_name;
  const gchar *id;
  const gchar *details;

  id_name = g_strdup_printf ("%s_id", type);
  id = params_value (params, id_name);

  CHECK_VARIABLE_INVALID (id, "Get")

  details = params_value (params, "details");
  if (!details)
    {
      details = "1";
    }

  if (arguments == NULL)
    {
      arguments = gmp_arguments_new ();
    }

  gmp_arguments_add (arguments, id_name, id);

  if (details && !str_equal (details, ""))
    {
      gmp_arguments_add (arguments, "details", details);
    }

  g_free (id_name);

  return get_entity (connection, type, credentials, params, arguments,
                     response_data);
}

/**
 * @brief Get all entities of a particular type, envelope the result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  type           Entity type.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  extra_xml      Extra XML to insert inside page element.
 * @param[in]  arguments      Extra arguments for GMP GET command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_entities (gvm_connection_t *connection, const char *type,
              credentials_t *credentials, params_t *params,
              gmp_arguments_t *arguments, cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *cmd;
  entity_t entity;

  cmd = g_strdup_printf ("get_%s", type);

  if (gmp_request (connection, cmd, arguments))
    {
      g_free (cmd);

      gmp_arguments_free (arguments);

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a resource list. "
        "The current list of resources is not available. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  gmp_arguments_free (arguments);

  xml = g_string_new ("");
  g_string_append_printf (xml, "<%s>", cmd);

  if (read_entity_and_string_c (connection, &entity, &xml))
    {
      g_free (cmd);
      g_string_free (xml, TRUE);

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting resources list. "
        "The current list of resources is not available. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  if (gmp_success (entity) != 1)
    {
      gchar *message;

      set_http_status_from_entity (entity, response_data);

      message =
        gsad_message (credentials, "Error", __func__, __LINE__,
                      entity_attribute (entity, "status_text"), response_data);

      g_free (cmd);
      g_string_free (xml, TRUE);
      free_entity (entity);
      return message;
    }

  g_string_append_printf (xml, "</%s>", cmd);

  g_free (cmd);
  free_entity (entity);

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Get all of a particular type of resource, envelope the result.
 *
 * @param[in]  connection     Connection to manager
 * @param[in]  type           Resource type in plural form.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[in]  arguments      Extra arguments for GMP GET command.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
static char *
get_many (gvm_connection_t *connection, const char *type,
          credentials_t *credentials, params_t *params,
          gmp_arguments_t *arguments, cmd_response_data_t *response_data)
{
  const gchar *filter_id, *filter;
  const gchar *details;

  filter_id = params_value (params, "filter_id");
  filter = params_value (params, "filter");
  details = params_value (params, "details");

  if (arguments == NULL)
    {
      arguments = gmp_arguments_new ();
    }

  if (details && !str_equal (details, ""))
    {
      gmp_arguments_add (arguments, "details", details);
    }

  if (!filter_id && !filter)
    {
      filter_id = FILT_ID_USER_SETTING;
    }

  if (filter_id)
    {
      gmp_arguments_add (arguments, "filt_id", filter_id);
    }

  if (filter)
    {
      gmp_arguments_add (arguments, "filter", filter);
    }

  return get_entities (connection, type, credentials, params, arguments,
                       response_data);
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
               cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *id_name;
  const char *resource_id;

  id_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, id_name);
  g_free (id_name);

  if (resource_id == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while editing a resource. "
        "The resource remains as it was. "
        "Diagnostics: Required ID parameter was NULL.",
        response_data);
    }

  if (gvm_connection_sendf (connection,
                            "<get_%ss"
                            " %s"
                            " %s_id=\"%s\""
                            " details=\"1\"/>",
                            type, extra_get_attribs ? extra_get_attribs : "",
                            type, resource_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
format_file_name (gchar *fname_format, credentials_t *credentials,
                  const char *type, const char *uuid, entity_t resource_entity)
{
  gchar *creation_time, *modification_time, *name, *format_name;
  gchar *ret;

  if (resource_entity)
    {
      entity_t creation_time_entity, modification_time_entity;
      entity_t task_entity, format_entity, format_name_entity, name_entity;

      creation_time_entity = entity_child (resource_entity, "creation_time");

      if (creation_time_entity)
        creation_time = entity_text (creation_time_entity);
      else
        creation_time = NULL;

      modification_time_entity =
        entity_child (resource_entity, "modification_time");

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

  user_t *user = credentials_get_user (credentials);
  ret =
    gvm_export_file_name (fname_format, user_get_username (user), type, uuid,
                          creation_time, modification_time, name, format_name);
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
                 credentials_t *credentials, params_t *params,
                 cmd_response_data_t *response_data)
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
                            type, type, resource_id, subtype ? " type=\"" : "",
                            subtype ? subtype : "", subtype ? "\"" : "")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a resource. "
        "The resource could not be delivered. "
        "Diagnostics: Failure to receive resource from manager daemon.",
        response_data);
    }

  ret = setting_get_value (connection, "a6ac88c5-729c-41ba-ac0a-deea4a3441f2",
                           &fname_format, response_data);
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting a setting. "
            "The setting could not be delivered. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        case 2:
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting a setting. "
            "The setting could not be delivered. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        default:
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting a setting. "
            "The setting could not be delivered. "
            "Diagnostics: Internal error.",
            response_data);
        }
    }

  if (fname_format == NULL)
    {
      g_warning ("%s : File name format setting not found.", __func__);
      fname_format = "%T-%U";
    }

  file_name = format_file_name (fname_format, credentials, type, resource_id,
                                resource_entity);
  if (file_name == NULL)
    file_name = g_strdup_printf ("%s-%s", type, resource_id);

  cmd_response_data_set_content_type (response_data, GSAD_CONTENT_TYPE_APP_XML);
  cmd_response_data_set_content_disposition (
    response_data,
    g_strdup_printf ("attachment; filename=\"%s.xml\"", file_name));
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
             credentials_t *credentials, params_t *params,
             cmd_response_data_t *response_data)
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
                                type, filter_escaped ? filter_escaped : "")
          == -1)
        {
          g_free (filter_escaped);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a list. "
        "The list could not be delivered. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  if (!gmp_success (entity))
    set_http_status_from_entity (entity, response_data);

  ret = setting_get_value (connection, "0872a6ed-4f85-48c5-ac3f-a5ef5e006745",
                           &fname_format, response_data);
  if (ret)
    {
      g_free (content);
      free_entity (entity);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      switch (ret)
        {
        case 1:
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting a setting. "
            "The setting could not be delivered. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        case 2:
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting a setting. "
            "The setting could not be delivered. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        default:
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting a setting. "
            "The setting could not be delivered. "
            "Diagnostics: Internal error.",
            response_data);
        }
    }

  if (fname_format == NULL)
    {
      g_warning ("%s : File name format setting not found.", __func__);
      fname_format = "%T-%D";
    }

  if (strcmp (type, "info") == 0)
    type_many = g_strdup (type);
  else
    type_many = g_strdup_printf ("%ss", type);

  file_name =
    format_file_name (fname_format, credentials, type_many, "list", NULL);
  if (file_name == NULL)
    file_name = g_strdup_printf ("%s-%s", type_many, "list");

  g_free (type_many);

  cmd_response_data_set_content_type (response_data, GSAD_CONTENT_TYPE_APP_XML);
  cmd_response_data_set_content_disposition (
    response_data,
    g_strdup_printf ("attachment; filename=\"%s.xml\"", file_name));
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
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_resource (gvm_connection_t *connection, const char *type,
                 credentials_t *credentials, params_t *params,
                 gboolean ultimate, cmd_response_data_t *response_data)
{
  gchar *html, *response, *id_name, *resource_id, *extra_attribs;
  entity_t entity;
  gchar *cap_type, *prev_action;

  id_name = g_strdup_printf ("%s_id", type);
  if (params_value (params, id_name))
    resource_id = g_strdup (params_value (params, id_name));
  else
    {
      g_free (id_name);
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while deleting a resource. "
        "The resource was not deleted. "
        "Diagnostics: Required parameter resource_id was NULL.",
        response_data);
    }

  /* This is a hack for assets, because asset_id is the param name used for
   * both the asset being deleted and the asset on the next page. */
  g_free (id_name);

  /* Extra attributes */
  extra_attribs = NULL;

  /* Inheritor of user's resource */
  if (strcmp (type, "user") == 0)
    {
      const char *inheritor_id;
      inheritor_id = params_value (params, "inheritor_id");
      if (inheritor_id)
        extra_attribs = g_strdup_printf ("inheritor_id=\"%s\"", inheritor_id);
      else if (params_given (params, "inheritor_id"))
        return message_invalid (connection, credentials, params, response_data,
                                "Invalid inheritor_id", "Delete User");
    }

  /* Delete the resource and get all resources. */

  if (gvm_connection_sendf (
        connection, "<delete_%s %s_id=\"%s\" ultimate=\"%i\"%s%s/>", type, type,
        resource_id, !!ultimate, extra_attribs ? " " : "",
        extra_attribs ? extra_attribs : "")
      == -1)
    {
      g_free (resource_id);
      g_free (extra_attribs);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while deleting a resource. "
        "It is unclear whether the resource has been deleted or not. "
        "Diagnostics: Failure to read response from manager daemon.",
        response_data);
    }

  if (!gmp_success (entity))
    set_http_status_from_entity (entity, response_data);

  cap_type = capitalize (type);
  prev_action = g_strdup_printf ("Delete %s", cap_type);

  html = response_from_entity (connection, credentials, params, entity,
                               prev_action, response_data);

  g_free (response);
  free_entity (entity);
  g_free (cap_type);
  g_free (prev_action);

  return html;
}

/**
 * @brief Move a resource to the trashcan
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  type           Type of resource.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
move_resource_to_trash (gvm_connection_t *connection, const char *type,
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
{
  return delete_resource (connection, type, credentials, params, FALSE,
                          response_data);
}

/**
 * @brief Delete a resource from the trashcan
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  type           Type of resource.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_from_trash_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  const gchar *resource_type;

  resource_type = params_value (params, "resource_type");

  CHECK_VARIABLE_INVALID (resource_type, "Delete from Trashcan");

  return delete_resource (connection, resource_type, credentials, params, TRUE,
                          response_data);
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
                 cmd_response_data_t *response_data)
{
  gchar *html, *response, *param_name;
  const char *resource_id;
  gchar *cap_action, *cap_type, *get_cmd, *prev_action;

  int ret;
  entity_t entity;

  assert (type);

  param_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, param_name);

  if (resource_id == NULL)
    {
      gchar *message;
      message = g_strdup_printf (
        "An internal error occurred while performing an action. "
        "The resource remains the same. "
        "Diagnostics: Required parameter %s was NULL.",
        param_name);
      g_free (param_name);
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      html = gsad_message (credentials, "Internal error", __func__, __LINE__,
                           message, response_data);
      g_free (message);
      return html;
    }
  g_free (param_name);

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<%s_%s %s_id=\"%s\"/>", action, type, type, resource_id);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while performing an action. "
        "The resource remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while performing an action. "
        "It is unclear whether the resource has been affected. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
create_report_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  entity_t entity;
  int ret;
  gchar **xml_file_array, *xml_file_escaped;
  gchar *command, *html, *response;
  const char *task_id = params_value (params, "task_id"),
             *xml_file = params_value (params, "xml_file"),
             *in_assets = params_value (params, "in_assets");

  CHECK_VARIABLE_INVALID (task_id, "Create Report");
  CHECK_VARIABLE_INVALID (xml_file, "Create Report");

  if (strlen (xml_file) == 0)
    {
      return message_invalid (connection, credentials, params, response_data,
                              "Report required", "Create Report");
    }

  xml_file_array = g_strsplit (xml_file, "%", -1);
  if (xml_file_array != NULL && xml_file_array[0] != NULL)
    xml_file_escaped = g_strjoinv ("%%", xml_file_array);
  else
    xml_file_escaped = g_strdup (xml_file);
  g_strfreev (xml_file_array);

  command = g_strdup_printf ("<create_report>"
                             "<in_assets>%s</in_assets>"
                             "<task id=\"%s\"/>"
                             "%s"
                             "</create_report>",
                             in_assets ? in_assets : "0", task_id,
                             xml_file_escaped ? xml_file_escaped : "");
  g_free (xml_file_escaped);

  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new report. "
        "No new report was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new report. "
        "It is unclear whether the report has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
import_report_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return create_report_gmp (connection, credentials, params, response_data);
}

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
                           credentials_t *credentials, params_t *params,
                           cmd_response_data_t *response_data)
{
  entity_t entity;
  int ret;
  gchar *command, *html, *response;
  const char *name, *comment, *usage_type;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  usage_type = params_value (params, "usage_type");

  CHECK_VARIABLE_INVALID (name, "Create Container Task");
  CHECK_VARIABLE_INVALID (comment, "Create Container Task");
  CHECK_VARIABLE_INVALID (usage_type, "Create Container Task");

  command = g_markup_printf_escaped ("<create_task>"
                                     "<target id=\"0\"/>"
                                     "<name>%s</name>"
                                     "<comment>%s</comment>"
                                     "<usage_type>%s</usage_type>"
                                     "</create_task>",
                                     name, comment, usage_type);
  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a container task. "
        "No task was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a container task. "
        "It is unclear whether the task has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
create_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
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
  const char *apply_overrides, *min_qod, *usage_type;
  gchar *name_escaped, *comment_escaped;
  params_t *alerts;
  GString *alert_element;

  add_tag = params_value (params, "add_tag");
  alterable = params_value (params, "alterable");
  apply_overrides = params_value (params, "apply_overrides");
  auto_delete = params_value (params, "auto_delete");
  auto_delete_data = params_value (params, "auto_delete_data");
  comment = params_value (params, "comment");
  config_id = params_value (params, "config_id");
  hosts_ordering = params_value (params, "hosts_ordering");
  in_assets = params_value (params, "in_assets");
  max_checks = params_value (params, "max_checks");
  max_hosts = params_value (params, "max_hosts");
  min_qod = params_value (params, "min_qod");
  name = params_value (params, "name");
  scanner_id = params_value (params, "scanner_id");
  scanner_type = params_value (params, "scanner_type");
  schedule_id = params_value (params, "schedule_id");
  schedule_periods = params_value (params, "schedule_periods");
  source_iface = params_value (params, "source_iface");
  tag_id = params_value (params, "tag_id");
  target_id = params_value (params, "target_id");
  usage_type = params_value (params, "usage_type");

  CHECK_VARIABLE_INVALID (scanner_type, "Create Task");
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

  CHECK_VARIABLE_INVALID (name, "Create Task");
  CHECK_VARIABLE_INVALID (comment, "Create Task");
  CHECK_VARIABLE_INVALID (usage_type, "Create Task");
  CHECK_VARIABLE_INVALID (config_id, "Create Task");
  CHECK_VARIABLE_INVALID (target_id, "Create Task");
  CHECK_VARIABLE_INVALID (hosts_ordering, "Create Task");
  CHECK_VARIABLE_INVALID (scanner_id, "Create Task");
  CHECK_VARIABLE_INVALID (schedule_id, "Create Task");

  if (str_equal (target_id, "0"))
    {
      /* Don't allow to create container task via create_task */
      return message_invalid (connection, credentials, params, response_data,
                              "Given target_id was invalid", "Create Task");
    }

  if (params_given (params, "schedule_periods"))
    {
      CHECK_VARIABLE_INVALID (schedule_periods, "Create Task");
    }
  else
    schedule_periods = "0";

  CHECK_VARIABLE_INVALID (in_assets, "Create Task");

  if (!strcmp (in_assets, "1"))
    {
      CHECK_VARIABLE_INVALID (apply_overrides, "Create Task");
      CHECK_VARIABLE_INVALID (min_qod, "Create Task");
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

  CHECK_VARIABLE_INVALID (max_checks, "Create Task");
  CHECK_VARIABLE_INVALID (source_iface, "Create Task");
  CHECK_VARIABLE_INVALID (auto_delete, "Create Task");
  CHECK_VARIABLE_INVALID (auto_delete_data, "Create Task");
  CHECK_VARIABLE_INVALID (max_hosts, "Create Task");
  CHECK_VARIABLE_INVALID (alterable, "Create Task");

  if (add_tag && strcmp (add_tag, "1") == 0)
    {
      CHECK_VARIABLE_INVALID (tag_id, "Create Task");
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
          g_string_append_printf (alert_element, "<alert id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  name_escaped = name ? g_markup_escape_text (name, -1) : NULL;
  comment_escaped = comment ? g_markup_escape_text (comment, -1) : NULL;

  command = g_strdup_printf (
    "<create_task>"
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
    "<usage_type>%s</usage_type>"
    "</create_task>",
    config_id, schedule_periods, schedule_element, alert_element->str,
    target_id, scanner_id, hosts_ordering, name_escaped, comment_escaped,
    max_checks, max_hosts, strcmp (in_assets, "0") ? "yes" : "no",
    strcmp (apply_overrides, "0") ? "yes" : "no", min_qod, source_iface,
    auto_delete, auto_delete_data, alterable ? strcmp (alterable, "0") : 0,
    usage_type);

  g_free (name_escaped);
  g_free (comment_escaped);

  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new task. "
        "No new task was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new task. "
        "It is unclear whether the task has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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

          tag_command = g_markup_printf_escaped ("<modify_tag tag_id=\"%s\">"
                                                 "<resources action=\"add\">"
                                                 "<resource id=\"%s\"/>"
                                                 "</resources>"
                                                 "</modify_tag>",
                                                 tag_id, new_task_id);

          ret = gmp (connection, credentials, &tag_response, &tag_entity,
                     response_data, tag_command);

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
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while creating a new tag. "
                "No new tag was created. "
                "Diagnostics: Failure to send command to manager daemon.",
                response_data);
            case 2:
              free_entity (entity);
              g_free (response);
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while creating a new tag. "
                "It is unclear whether the tag has been created or not. "
                "Diagnostics: Failure to receive response from manager daemon.",
                response_data);
            default:
              free_entity (entity);
              g_free (response);
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while creating a new task. "
                "It is unclear whether the tag has been created or not. "
                "Diagnostics: Internal Error.",
                response_data);
            }

          if (entity_attribute (entity, "id"))
            params_add (params, "task_id", entity_attribute (entity, "id"));
          html =
            response_from_entity (connection, credentials, params, tag_entity,
                                  "Create Task and Tag", response_data);
          free_entity (tag_entity);
          g_free (tag_response);
        }
      else
        {
          if (entity_attribute (entity, "id"))
            params_add (params, "task_id", entity_attribute (entity, "id"));
          html = response_from_entity (connection, credentials, params, entity,
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
delete_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "task", credentials, params,
                                 response_data);
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
save_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
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

  alterable = params_value (params, "alterable");
  apply_overrides = params_value (params, "apply_overrides");
  auto_delete = params_value (params, "auto_delete");
  auto_delete_data = params_value (params, "auto_delete_data");
  comment = params_value (params, "comment");
  config_id = params_value (params, "config_id");
  hosts_ordering = params_value (params, "hosts_ordering");
  in_assets = params_value (params, "in_assets");
  max_checks = params_value (params, "max_checks");
  max_hosts = params_value (params, "max_hosts");
  min_qod = params_value (params, "min_qod");
  name = params_value (params, "name");
  scanner_id = params_value (params, "scanner_id");
  scanner_type = params_value (params, "scanner_type");
  schedule_id = params_value (params, "schedule_id");
  schedule_periods = params_value (params, "schedule_periods");
  source_iface = params_value (params, "source_iface");
  target_id = params_value (params, "target_id");
  task_id = params_value (params, "task_id");

  if (scanner_type != NULL)
    {
      CHECK_VARIABLE_INVALID (scanner_type, "Save Task");
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

  CHECK_VARIABLE_INVALID (name, "Save Task");
  CHECK_VARIABLE_INVALID (comment, "Save Task");
  CHECK_VARIABLE_INVALID (target_id, "Save Task");
  CHECK_VARIABLE_INVALID (hosts_ordering, "Save Task");
  CHECK_VARIABLE_INVALID (config_id, "Save Task");
  CHECK_VARIABLE_INVALID (schedule_id, "Save Task");
  if (params_given (params, "schedule_periods"))
    {
      CHECK_VARIABLE_INVALID (schedule_periods, "Save Task");
    }
  else
    schedule_periods = "0";
  CHECK_VARIABLE_INVALID (scanner_id, "Save Task");
  CHECK_VARIABLE_INVALID (task_id, "Save Task");
  CHECK_VARIABLE_INVALID (max_checks, "Save Task");
  CHECK_VARIABLE_INVALID (source_iface, "Save Task");
  CHECK_VARIABLE_INVALID (auto_delete, "Save Task");
  CHECK_VARIABLE_INVALID (auto_delete_data, "Save Task");
  CHECK_VARIABLE_INVALID (max_hosts, "Save Task");
  CHECK_VARIABLE_INVALID (in_assets, "Save Task");

  if (!strcmp (in_assets, "1"))
    {
      CHECK_VARIABLE_INVALID (apply_overrides, "Save Task");
      CHECK_VARIABLE_INVALID (min_qod, "Save Task");
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
            g_string_append_printf (alert_element, "<alert id=\"%s\"/>",
                                    param->value ? param->value : "");
        }
    }

  // Remove Alerts from Task if none are given.
  if (strcmp (alert_element->str, "") == 0)
    g_string_append_printf (alert_element, "<alert id=\"0\"/>");

  format = g_strdup_printf (
    "<modify_task task_id=\"%%s\">"
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
    hosts_ordering, alert_element->str, alterable ? "<alterable>" : "",
    alterable ? strcmp (alterable, "0") : 0, alterable ? "</alterable>" : "");
  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              format, task_id, name, comment, target_id, config_id, schedule_id,
              schedule_periods, scanner_id, max_checks, max_hosts,
              strcmp (in_assets, "0") ? "yes" : "no",
              strcmp (apply_overrides, "0") ? "yes" : "no", min_qod,
              source_iface, auto_delete, auto_delete_data);
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a task. "
        "The task was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a task. "
        "It is unclear whether the task has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
char *
save_container_task_gmp (gvm_connection_t *connection,
                         credentials_t *credentials, params_t *params,
                         cmd_response_data_t *response_data)
{
  gchar *format, *response, *html;
  const char *comment, *name, *task_id;
  const char *in_assets, *auto_delete, *auto_delete_data;
  int ret;
  entity_t entity;

  comment = params_value (params, "comment");
  in_assets = params_value (params, "in_assets");
  name = params_value (params, "name");
  task_id = params_value (params, "task_id");
  auto_delete = params_value (params, "auto_delete");
  auto_delete_data = params_value (params, "auto_delete_data");
  CHECK_VARIABLE_INVALID (name, "Save Task")
  CHECK_VARIABLE_INVALID (comment, "Save Task")
  CHECK_VARIABLE_INVALID (task_id, "Save Task")
  CHECK_VARIABLE_INVALID (in_assets, "Save Task")
  CHECK_VARIABLE_INVALID (auto_delete, "Save Task");
  CHECK_VARIABLE_INVALID (auto_delete_data, "Save Task");

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
  ret =
    gmpf (connection, credentials, &response, &entity, response_data, format,
          task_id, name, comment, strcmp (in_assets, "0") ? "yes" : "no",
          auto_delete, auto_delete_data);
  g_free (format);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a task. "
        "No new task was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a task. "
        "It is unclear whether the task has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
char *
export_tasks_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "task", credentials, params, response_data);
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
stop_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
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
start_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
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
move_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  gchar *command, *response, *html;
  const char *task_id, *slave_id;
  int ret;
  entity_t entity;

  slave_id = params_value (params, "slave_id");
  task_id = params_value (params, "task_id");

  command = g_strdup_printf ("<move_task task_id=\"%s\" slave_id=\"%s\"/>",
                             task_id ? task_id : "", slave_id ? slave_id : "");

  response = NULL;
  entity = NULL;
  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while moving a task. "
        "The task was not moved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while moving a task. "
        "It is unclear whether the task has been moved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_info_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t *response_data)
{
  const gchar *info_type;
  const gchar *info_name;
  const gchar *info_id;
  const gchar *details;

  gmp_arguments_t *arguments;

  info_type = params_value (params, "info_type");
  info_name = params_value (params, "info_name");
  info_id = params_value (params, "info_id");
  details = params_value (params, "details");

  CHECK_VARIABLE_INVALID (info_type, "Get SecInfo")

  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "type", info_type);
  if (details)
    {
      gmp_arguments_add (arguments, "details", details);
    }

  if (info_id)
    {
      gmp_arguments_add (arguments, "info_id", info_id);

      return get_entity (connection, "info", credentials, params, arguments,
                         response_data);
    }
  else if (info_name)
    {
      gmp_arguments_add (arguments, "name", info_name);
    }

  return get_many (connection, "info", credentials, params, arguments,
                   response_data);
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
get_tasks_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  const char *schedules_only, *ignore_pagination, *usage_type;
  gmp_arguments_t *arguments;

  schedules_only = params_value (params, "schedules_only");
  ignore_pagination = params_value (params, "ignore_pagination");
  usage_type = params_value (params, "usage_type");
  if (params_given (params, "usage_type"))
    CHECK_VARIABLE_INVALID (usage_type, "Get Tasks");

  arguments = gmp_arguments_new ();

  if (schedules_only)
    {
      gmp_arguments_add (arguments, "schedules_only", schedules_only);
    }

  if (ignore_pagination)
    {
      gmp_arguments_add (arguments, "ignore_pargination", ignore_pagination);
    }

  if (usage_type)
    {
      gmp_arguments_add (arguments, "usage_type", usage_type);
    }

  return get_many (connection, "tasks", credentials, params, arguments,
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
get_task_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t *response_data)
{
  return get_one (connection, "task", credentials, params, NULL, NULL,
                  response_data);
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
create_credential_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *credential_login, *type, *password, *passphrase;
  const char *private_key, *public_key, *certificate, *community;
  const char *privacy_password, *auth_algorithm, *privacy_algorithm;
  const char *autogenerate, *allow_insecure;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  credential_login = params_value (params, "credential_login");
  type = params_value (params, "credential_type");
  password = params_value (params, "lsc_password");
  passphrase = params_value (params, "passphrase");
  private_key = params_value (params, "private_key");
  public_key = params_value (params, "public_key");
  certificate = params_value (params, "certificate");
  community = params_value (params, "community");
  privacy_password = params_value (params, "privacy_password");
  auth_algorithm = params_value (params, "auth_algorithm");
  privacy_algorithm = params_value (params, "privacy_algorithm");
  allow_insecure = params_value (params, "allow_insecure");
  autogenerate = params_value (params, "autogenerate");

  CHECK_VARIABLE_INVALID (name, "Create Credential");
  CHECK_VARIABLE_INVALID (comment, "Create Credential");
  CHECK_VARIABLE_INVALID (type, "Create Credential");
  CHECK_VARIABLE_INVALID (allow_insecure, "Create Credential");
  CHECK_VARIABLE_INVALID (autogenerate, "Create Credential");

  if (str_equal (autogenerate, "1"))
    {
      if (str_equal (type, "cc"))
        {
          // Auto-generate types without username
          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<create_credential>"
                  "<name>%s</name>"
                  "<comment>%s</comment>"
                  "<type>%s</type>"
                  "<allow_insecure>%s</allow_insecure>"
                  "</create_credential>",
                  name, comment ? comment : "", type, allow_insecure);
        }
      else
        {
          // Auto-generate types with username
          CHECK_VARIABLE_INVALID (credential_login, "Create Credential");

          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<create_credential>"
                  "<name>%s</name>"
                  "<comment>%s</comment>"
                  "<type>%s</type>"
                  "<login>%s</login>"
                  "<allow_insecure>%s</allow_insecure>"
                  "</create_credential>",
                  name, comment ? comment : "", type, credential_login,
                  allow_insecure);
        }
    }
  else
    {
      if (str_equal (type, "up"))
        {
          CHECK_VARIABLE_INVALID (credential_login, "Create Credential");
          CHECK_VARIABLE_INVALID (password, "Create Credential");

          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<create_credential>"
                  "<name>%s</name>"
                  "<comment>%s</comment>"
                  "<type>%s</type>"
                  "<login>%s</login>"
                  "<password>%s</password>"
                  "<allow_insecure>%s</allow_insecure>"
                  "</create_credential>",
                  name, comment ? comment : "", type,
                  credential_login ? credential_login : "",
                  password ? password : "", allow_insecure);
        }
      else if (str_equal (type, "usk"))
        {
          CHECK_VARIABLE_INVALID (credential_login, "Create Credential");
          CHECK_VARIABLE_INVALID (passphrase, "Create Credential");
          CHECK_VARIABLE_INVALID (private_key, "Create Credential");

          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
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
                  name, comment ? comment : "", type,
                  credential_login ? credential_login : "",
                  private_key ? private_key : "", passphrase ? passphrase : "",
                  allow_insecure);
        }
      else if (str_equal (type, "cc"))
        {
          CHECK_VARIABLE_INVALID (certificate, "Create Credential");
          CHECK_VARIABLE_INVALID (passphrase, "Create Credential");
          CHECK_VARIABLE_INVALID (private_key, "Create Credential");

          ret = gmpf (
            connection, credentials, &response, &entity, response_data,
            "<create_credential>"
            "<name>%s</name>"
            "<comment>%s</comment>"
            "<type>%s</type>"
            "<certificate>%s</certificate>"
            "<key>"
            "<private>%s</private>"
            "<phrase>%s</phrase>"
            "</key>"
            "<allow_insecure>%s</allow_insecure>"
            "</create_credential>",
            name, comment ? comment : "", type, certificate ? certificate : "",
            private_key ? private_key : "", passphrase ? passphrase : "",
            allow_insecure);
        }
      else if (str_equal (type, "snmp"))
        {
          CHECK_VARIABLE_INVALID (community, "Create Credential");
          CHECK_VARIABLE_INVALID (credential_login, "Create Credential");
          CHECK_VARIABLE_INVALID (password, "Create Credential");
          CHECK_VARIABLE_INVALID (privacy_password, "Create Credential");
          CHECK_VARIABLE_INVALID (auth_algorithm, "Create Credential");
          CHECK_VARIABLE_INVALID (privacy_algorithm, "Create Credential");

          if (privacy_password && strcmp (privacy_password, ""))
            ret = gmpf (
              connection, credentials, &response, &entity, response_data,
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
              name, comment ? comment : "", type, community ? community : "",
              credential_login ? credential_login : "",
              password ? password : "",
              privacy_password ? privacy_password : "",
              privacy_algorithm ? privacy_algorithm : "",
              auth_algorithm ? auth_algorithm : "", allow_insecure);
          else
            ret = gmpf (
              connection, credentials, &response, &entity, response_data,
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
              name, comment ? comment : "", type, community ? community : "",
              credential_login ? credential_login : "",
              password ? password : "",
              auth_algorithm ? auth_algorithm : "", allow_insecure);
        }
      else if (str_equal (type, "pgp"))
        {
          CHECK_VARIABLE_INVALID (public_key, "Create Credential");

          ret = gmpf (
            connection, credentials, &response, &entity, response_data,
            "<create_credential>"
            "<name>%s</name>"
            "<comment>%s</comment>"
            "<type>%s</type>"
            "<key>"
            "<public>%s</public>"
            "</key>"
            "<allow_insecure>%s</allow_insecure>"
            "</create_credential>",
            name, comment ? comment : "", type, public_key, allow_insecure);
        }
      else if (str_equal (type, "smime"))
        {
          CHECK_VARIABLE_INVALID (certificate, "Create Credential");

          ret = gmpf (
            connection, credentials, &response, &entity, response_data,
            "<create_credential>"
            "<name>%s</name>"
            "<comment>%s</comment>"
            "<type>%s</type>"
            "<certificate>%s</certificate>"
            "<allow_insecure>%s</allow_insecure>"
            "</create_credential>",
            name, comment ? comment : "", type, certificate, allow_insecure);
        }
      else if (type && (strcmp (type, "pw") == 0))
        {
          CHECK_VARIABLE_INVALID (password, "Create Credential");

          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<create_credential>"
                  "<name>%s</name>"
                  "<comment>%s</comment>"
                  "<type>%s</type>"
                  "<password>%s</password>"
                  "<allow_insecure>%s</allow_insecure>"
                  "</create_credential>",
                  name, comment ? comment : "", type, password ? password : "",
                  allow_insecure);
        }
      else
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new credential. "
        "It is unclear whether the credential has been created or not. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new credential. "
        "It is unclear whether the credential has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new credential. "
        "It is unclear whether the credential has been created or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "credential_id", entity_attribute (entity, "id"));
  html = response_from_entity (connection, credentials, params, entity,
                               "Create Credential", response_data);
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
get_credential (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, const char *extra_xml,
                cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments = gmp_arguments_new ();
  gmp_arguments_add (arguments, "targets", "1");
  gmp_arguments_add (arguments, "scanners", "1");
  return get_one (connection, "credential", credentials, params, extra_xml,
                  arguments, response_data);
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
get_credential_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
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
                         credentials_t *credentials, params_t *params,
                         char **html, char **login,
                         cmd_response_data_t *response_data)
{
  entity_t entity;
  const char *credential_id, *format;

  assert (html);

  /* Send the request. */

  credential_id = params_value (params, "credential_id");
  format = params_value (params, "package_format");

  if ((credential_id == NULL) || (format == NULL))
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      *html =
        gsad_message (credentials, "Internal error", __func__, __LINE__,
                      "An internal error occurred while getting a credential. "
                      "Diagnostics: Required parameter was NULL.",
                      response_data);
      return 1;
    }

  if (gvm_connection_sendf (connection,
                            "<get_credentials"
                            " credential_id=\"%s\""
                            " format=\"%s\"/>",
                            credential_id, format)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      *html =
        gsad_message (credentials, "Internal error", __func__, __LINE__,
                      "An internal error occurred while getting a credential. "
                      "Diagnostics: Failure to send command to manager daemon.",
                      response_data);
      return 1;
    }

  /* Read and handle the response. */

  if (strcmp (format, "rpm") == 0 || strcmp (format, "deb") == 0
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
          *html = gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
              package_decoded =
                (gchar *) g_base64_decode (package_encoded, &len);
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
          *html = gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          *html = gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      *html = gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
export_credential_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
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
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
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
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return 0 success, 1 failure.
 */
char *
get_credentials_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "credentials", credentials, params, NULL,
                   response_data);
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
delete_credential_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "credential", credentials, params,
                                 response_data);
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
save_credential_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
{
  int ret, change_password, change_ssh_passphrase, change_passphrase;
  int change_community, change_privacy_password;
  gchar *html, *response;
  const char *credential_id, *public_key;
  const char *name, *comment, *credential_login, *password, *passphrase, *type;
  const char *private_key, *certificate, *community, *privacy_password;
  const char *auth_algorithm, *privacy_algorithm, *allow_insecure;
  GString *command;
  entity_t entity;

  credential_id = params_value (params, "credential_id");
  type = params_value (params, "credential_type");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  credential_login = params_value (params, "credential_login");
  password = params_value (params, "password");
  passphrase = params_value (params, "passphrase");
  private_key = params_value (params, "private_key");
  certificate = params_value (params, "certificate");
  community = params_value (params, "community");
  privacy_password = params_value (params, "privacy_password");
  auth_algorithm = params_value (params, "auth_algorithm");
  privacy_algorithm = params_value (params, "privacy_algorithm");
  allow_insecure = params_value (params, "allow_insecure");
  public_key = params_value (params, "public_key");

  CHECK_VARIABLE_INVALID (credential_id, "Save Credential");
  CHECK_VARIABLE_INVALID (name, "Save Credential");
  CHECK_VARIABLE_INVALID (comment, "Save Credential");
  CHECK_VARIABLE_INVALID (allow_insecure, "Save Credential");
  CHECK_VARIABLE_INVALID (type, "Save Credential");

  if (str_equal (type, "cc"))
    {
      if (params_given (params, "certificate"))
        CHECK_VARIABLE_INVALID (certificate, "Save Credential");

      if (params_given (params, "private_key"))
        CHECK_VARIABLE_INVALID (private_key, "Save Credential");

      if (params_given (params, "change_passphrase"))
        CHECK_VARIABLE_INVALID (passphrase, "Save Credential");
    }
  else if (str_equal (type, "snmp"))
    {
      if (params_given (params, "auth_algorithm"))
        CHECK_VARIABLE_INVALID (auth_algorithm, "Save Credential");

      if (params_given (params, "privacy_algorithm"))
        CHECK_VARIABLE_INVALID (privacy_algorithm, "Save Credential");

      if (params_given (params, "change_privacy_password"))
        CHECK_VARIABLE_INVALID (privacy_password, "Save Credential");

      if (params_given (params, "change_community"))
        CHECK_VARIABLE_INVALID (community, "Save Credential");
    }
  else if (str_equal (type, "up") | str_equal (type, "pw"))
    {
      if (params_given (params, "change_password"))
        CHECK_VARIABLE_INVALID (password, "Save Credential");
    }
  else if (str_equal (type, "smime"))
    {
      if (params_given (params, "certificate"))
        CHECK_VARIABLE_INVALID (certificate, "Save Credential");
    }
  else if (str_equal (type, "smime"))
    {
      if (params_given (params, "public_key"))
        CHECK_VARIABLE_INVALID (public_key, "Save Credential");
    }

  if (params_given (params, "credential_login"))
    CHECK_VARIABLE_INVALID (credential_login, "Save Credential");

  change_password = params_value_bool (params, "change_password");

  /* Prepare command */
  command = g_string_new ("");

  xml_string_append (command,
                     "<modify_credential credential_id=\"%s\">"
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<allow_insecure>%s</allow_insecure>",
                     credential_id, name, comment, allow_insecure);

  if (str_equal (type, "snmp"))
    {
      change_community = params_value_bool (params, "change_community");
      change_privacy_password =
        params_value_bool (params, "change_privacy_password");

      if (auth_algorithm)
        xml_string_append (command, "<auth_algorithm>%s</auth_algorithm>",
                           auth_algorithm);

      if (change_community)
        xml_string_append (command, "<community>%s</community>", community);

      if (privacy_algorithm || change_privacy_password)
        {
          xml_string_append (command, "<privacy>");
          if (privacy_algorithm)
            {
              xml_string_append (command, "<algorithm>%s</algorithm>",
                                 privacy_algorithm);
            }
          if (change_privacy_password && privacy_password)
            {
              xml_string_append (command, "<password>%s</password>",
                                 privacy_password);
            }

          xml_string_append (command, "</privacy>");
        }
    }
  else if (str_equal (type, "cc"))
    {
      change_passphrase = params_value_bool (params, "change_passphrase");

      if ((certificate && strcmp (certificate, "")))
        {
          xml_string_append (command, "<certificate>%s</certificate>",
                             certificate);
        }

      if ((private_key && strcmp (private_key, "")) || change_passphrase)
        {
          xml_string_append (command, "<key>");
          if (change_passphrase)
            xml_string_append (command, "<phrase>%s</phrase>", passphrase);
          if (private_key)
            xml_string_append (command, "<private>%s</private>", private_key);
          xml_string_append (command, "</key>");
        }


    }
  else if (str_equal (type, "usk"))
    {
      change_ssh_passphrase = params_value_bool (params, "change_passphrase");

      if ((private_key && strcmp (private_key, "")) || change_ssh_passphrase)
        {
          xml_string_append (command, "<key>");
          if (change_ssh_passphrase)
            xml_string_append (command, "<phrase>%s</phrase>", passphrase);
          if (private_key)
            xml_string_append (command, "<private>%s</private>", private_key);
          xml_string_append (command, "</key>");
        }
    }
  else if (str_equal (type, "up") | str_equal (type, "pw"))
    {
      if (change_password)
        xml_string_append (command, "<password>%s</password>", password);
    }
  else if (str_equal (type, "smime"))
    {
      if ((certificate && strcmp (certificate, "")))
        {
          xml_string_append (command, "<certificate>%s</certificate>",
                             certificate);
        }
    }
  else if (str_equal (type, "pgp"))
    {
      if ((public_key && strcmp (public_key, "")))
        {
          xml_string_append (command, "<key>");
          xml_string_append (command, "<public>%s</public>", public_key);
          xml_string_append (command, "</key>");
        }
    }

  if (credential_login && strcmp (credential_login, ""))
    xml_string_append (command, "<login>%s</login>", credential_login);

  xml_string_append (command, "</modify_credential>");

  /* Modify the credential. */
  response = NULL;
  entity = NULL;
  ret = gmp (connection, credentials, &response, &entity, response_data,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a Credential. "
        "The Credential was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a Credential. "
        "It is unclear whether the Credential has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_aggregate_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  params_t *data_columns, *text_columns;
  params_t *sort_fields, *sort_stats, *sort_orders;
  params_iterator_t data_columns_iterator, text_columns_iterator;
  params_iterator_t sort_fields_iterator, sort_stats_iterator;
  params_iterator_t sort_orders_iterator;
  char *param_name;
  param_t *param;

  const char *data_column, *group_column, *subgroup_column, *type;
  const char *filter, *filter_id;
  const char *first_group, *max_groups;
  const char *mode;
  const char *usage_type;
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
  filter_id = params_value (params, "filter_id");
  sort_fields = params_values (params, "sort_fields:");
  sort_stats = params_values (params, "sort_stats:");
  sort_orders = params_values (params, "sort_orders:");
  first_group = params_value (params, "first_group");
  max_groups = params_value (params, "max_groups");
  mode = params_value (params, "aggregate_mode");
  usage_type = params_value (params, "usage_type");

  if (filter && !str_equal (filter, ""))
    filter_escaped = g_markup_escape_text (filter, -1);
  else
    {
      if (filter_id == NULL || str_equal (filter_id, "")
          || str_equal (filter_id, FILT_ID_NONE))
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
    g_string_append_printf (command, " subgroup_column=\"%s\"",
                            subgroup_column);
  if (filter_escaped && strcmp (filter_escaped, ""))
    g_string_append_printf (command, " filter=\"%s\"", filter_escaped);

  if (filter_id && !str_equal (filter_id, ""))
    g_string_append_printf (command, " filt_id=\"%s\"", filter_id);

  if (first_group && strcmp (first_group, ""))
    g_string_append_printf (command, " first_group=\"%s\"", first_group);

  if (max_groups && strcmp (max_groups, ""))
    g_string_append_printf (command, " max_groups=\"%s\"", max_groups);

  if (mode && strcmp (mode, ""))
    g_string_append_printf (command, " mode=\"%s\"", mode);

  if (usage_type && strcmp (usage_type, ""))
    g_string_append_printf (command, " usage_type=\"%s\"", usage_type);

  g_string_append (command, ">");

  if (sort_fields && sort_stats && sort_orders)
    {
      param_t *field_param, *stat_param, *order_param;
      gchar *field_i, *stat_i, *order_i;

      params_iterator_init (&sort_fields_iterator, sort_fields);
      params_iterator_init (&sort_stats_iterator, sort_stats);
      params_iterator_init (&sort_orders_iterator, sort_orders);

      while (
        params_iterator_next (&sort_fields_iterator, &field_i, &field_param)
        && params_iterator_next (&sort_stats_iterator, &stat_i, &stat_param)
        && params_iterator_next (&sort_orders_iterator, &order_i, &order_param))
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
              xml_string_append (command, "<data_column>%s</data_column>",
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
              xml_string_append (command, "<text_column>%s</text_column>",
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting aggregates. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting aggregates. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
new_alert (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t *response_data)
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting Report "
        "Formats for new alert. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting Report "
        "Formats for new alert. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting Report "
        "Filters for new alert. "
        "The task was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting Report "
        "Filters for new alert. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting Tasks"
        " for new alert. "
        "The task was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting Tasks"
        " for new alert. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
             " filter=\"type=up or type=pw"
             "          owner=any permission=any rows=-1\"/>");

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting"
        " Credentials for new alert. "
        "The task was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting"
        " Credentials for new alert. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while getting"
                           " Credentials for new alert. "
                           "Diagnostics: Internal Error.",
                           response_data);
    }

  g_string_append (xml, response);
  g_free (response);
  free_entity (entity);

  g_string_append (xml, "</new_alert>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
new_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return new_alert (connection, credentials, params, NULL, response_data);
}

char *
get_alerts (gvm_connection_t *connection, credentials_t *, params_t *,
            const char *, cmd_response_data_t *);

#define EVENT_TYPE_NEW_SECINFO "New SecInfo arrived"
#define EVENT_TYPE_UPDATED_SECINFO "Updated SecInfo arrived"
#define EVENT_TYPE_TASK_RUN_STATUS_CHANGED "Task run status changed"
#define EVENT_TYPE_TICKET_RECEIVED "Ticket received"
#define EVENT_TYPE_ASSIGNED_TICKET_CHANGED "Assigned ticket changed"
#define EVENT_TYPE_OWNED_TICKET_CHANGED "Owned ticket changed"
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
        if ((str_equal (event, EVENT_TYPE_TASK_RUN_STATUS_CHANGED)
             && str_equal (name, "status"))
            || ((str_equal (event, EVENT_TYPE_NEW_SECINFO)
                 || str_equal (event, EVENT_TYPE_UPDATED_SECINFO))
                && str_equal (name, "secinfo_type")))
          xml_string_append (xml, "<data><name>%s</name>%s</data>", name,
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
                             const char *condition)
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
                xml_string_append (xml, "<data><name>count</name>%s</data>",
                                   param->value ? param->value : "");
              if (strcmp (name, "at_least_filter_id") == 0)
                xml_string_append (xml, "<data><name>filter_id</name>%s</data>",
                                   param->value ? param->value : "");
            }
          else if (strcmp (condition, "Filter count changed") == 0)
            {
              if (strcmp (name, "count") == 0
                  || strcmp (name, "filter_id") == 0)
                xml_string_append (xml, "<data><name>%s</name>%s</data>", name,
                                   param->value ? param->value : "");
              else if (strcmp (name, "filter_direction") == 0)
                xml_string_append (xml, "<data><name>direction</name>%s</data>",
                                   param->value ? param->value : "");
            }
          else if ((strcmp (condition, "Severity at least") == 0
                    && strcmp (name, "severity") == 0)
                   || (strcmp (condition, "Severity changed") == 0
                       && strcmp (name, "direction") == 0))
            xml_string_append (xml, "<data><name>%s</name>%s</data>", name,
                               param->value ? param->value : "");
        }
    }
}

/**
 * @brief Send method data for an alert.
 *
 * @param[in]  xml             Command XML to append to.
 * @param[in]  data            Alert method data params.
 * @param[in]  method          Name of the Alert method.
 * @param[in]  report_formats  Report formats to use if multiple are supported.
 */
static void
append_alert_method_data (GString *xml, params_t *data, const char *method,
                          params_t *report_formats)
{
  params_iterator_t iter;
  char *name;
  param_t *param;
  int notice;

  if (data == NULL)
    return;

  /* Add report formats for methods that support multiple */
  if (strcmp (method, "Alemba vFire") == 0)
    {
      g_string_append (xml, "<data><name>report_formats</name>");

      if (report_formats && g_hash_table_size (report_formats))
        {
          int report_formats_count = g_hash_table_size (report_formats);
          int index;
          params_iterator_init (&iter, report_formats);

          for (index = 1; index <= report_formats_count; index++)
            {
              gchar *index_str = g_strdup_printf ("%d", index);
              const char *value;
              value = params_value (report_formats, index_str);

              if (index > 1)
                xml_string_append (xml, ", %s", value);
              else
                xml_string_append (xml, "%s", value);

              g_free (index_str);
            }
        }
      g_string_append (xml, "</data>");
    }

  /* Add single-value method data items */
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
        if ((strcmp (method, "HTTP Get") == 0 && strcmp (name, "URL") == 0)
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
            || (strcmp (method, "Alemba vFire") == 0
                && (strcmp (name, "vfire_base_url") == 0
                    || strcmp (name, "vfire_call_description") == 0
                    || strcmp (name, "vfire_call_impact_name") == 0
                    || strcmp (name, "vfire_call_partition_name") == 0
                    || strcmp (name, "vfire_call_template_name") == 0
                    || strcmp (name, "vfire_call_type_name") == 0
                    || strcmp (name, "vfire_call_urgency_name") == 0
                    || strcmp (name, "vfire_client_id") == 0
                    || strcmp (name, "vfire_credential") == 0
                    || strcmp (name, "vfire_session_type") == 0))
            || (strcmp (method, "Email") == 0
                && (strcmp (name, "to_address") == 0
                    || strcmp (name, "from_address") == 0
                    || strcmp (name, "subject") == 0
                    || strcmp (name, "notice") == 0
                    || (strcmp (name, "notice_report_format") == 0
                        && notice == 0)
                    || (strcmp (name, "notice_attach_format") == 0
                        && notice == 2)
                    || (str_equal (name, "recipient_credential")
                        && !str_equal (param->value, "0"))))
            || (strcmp (method, "Syslog") == 0
                && strcmp (name, "submethod") == 0)
            || (strcmp (method, "Start Task") == 0
                && strcmp (name, "start_task_task") == 0)
            || strcmp (name, "details_url") == 0
            || strcmp (name, "delta_type") == 0
            || strcmp (name, "delta_report_id") == 0
            || strcmp (name, "composer_include_notes") == 0
            || strcmp (name, "composer_include_overrides") == 0)
          xml_string_append (xml, "<data><name>%s</name>%s</data>", name,
                             param->value ? param->value : "");
        else if (strcmp (method, "Email") == 0 && notice == 0
                 && strcmp (name, "message") == 0)
          xml_string_append (xml, "<data><name>message</name>%s</data>",
                             param->value ? param->value : "");
        else if (strcmp (method, "Email") == 0 && notice == 2
                 && strcmp (name, "message_attach") == 0)
          xml_string_append (xml, "<data><name>message</name>%s</data>",
                             param->value ? param->value : "");

      return;
    }

  params_iterator_init (&iter, data);
  while (params_iterator_next (&iter, &name, &param))
    if (strcmp (name, "pkcs12"))
      {
        if (strcmp (name, "defense_center_ip") == 0
            || strcmp (name, "defense_center_port") == 0
            || (strcmp (name, "pkcs12_credential") == 0
                && !str_equal (param->value, "0")))
          xml_string_append (xml, "<data><name>%s</name>%s</data>", name,
                             param->value ? param->value : "");
      }
    else
      {
        gchar *base64;

        /* Special case the pkcs12 file, which is binary. */

        base64 =
          (param->value && param->value_size)
            ? g_base64_encode ((guchar *) param->value, param->value_size)
            : g_strdup ("");
        xml_string_append (xml, "<data><name>%s</name>%s</data>", name, base64);
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
create_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *active, *condition, *event, *method, *filter_id;
  params_t *method_data, *event_data, *condition_data, *report_formats;
  entity_t entity;
  GString *xml;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  active = params_value (params, "active");
  condition = params_value (params, "condition");
  event = params_value (params, "event");
  method = params_value (params, "method");
  filter_id = params_value (params, "filter_id");

  CHECK_VARIABLE_INVALID (name, "Create Alert");
  CHECK_VARIABLE_INVALID (active, "Create Alert");
  CHECK_VARIABLE_INVALID (comment, "Create Alert");
  CHECK_VARIABLE_INVALID (condition, "Create Alert");
  CHECK_VARIABLE_INVALID (event, "Create Alert");
  CHECK_VARIABLE_INVALID (method, "Create Alert");

  /* Create the alert. */

  method_data = params_values (params, "method_data:");
  event_data = params_values (params, "event_data:");
  condition_data = params_values (params, "condition_data:");
  report_formats = params_values (params, "report_format_ids:");

  xml = g_string_new ("");

  if (str_equal (event, EVENT_TYPE_NEW_SECINFO) && event_data)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, event_data);
      while (params_iterator_next (&iter, &name, &param))
        if (str_equal (name, "feed_event") && param->value
            && str_equal (param->value, "updated"))
          {
            event = EVENT_TYPE_UPDATED_SECINFO;
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
                     name, filter_id ? filter_id : FILT_ID_NONE, active,
                     comment ? comment : "", event);

  append_alert_event_data (xml, event_data, event);

  xml_string_append (xml,
                     "</event>"
                     "<method>%s",
                     method);

  append_alert_method_data (xml, method_data, method, report_formats);

  xml_string_append (xml,
                     "</method>"
                     "<condition>%s",
                     condition);

  append_alert_condition_data (xml, condition_data, condition);

  xml_string_append (xml, "</condition>"
                          "</create_alert>");

  ret =
    gmp (connection, credentials, &response, &entity, response_data, xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new alert. "
        "No new alert was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new alert. "
        "It is unclear whether the alert has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "alert", credentials, params,
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
get_alert (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "tasks", "1");

  return get_one (connection, "alert", credentials, params, NULL, arguments,
                  response_data);
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
get_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return get_alert (connection, credentials, params, NULL, response_data);
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
get_alerts_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "alerts", credentials, params, NULL,
                   response_data);
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
edit_alert (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *edit;
  const char *alert_id, *next, *filter;

  alert_id = params_value (params, "alert_id");
  next = params_value (params, "next");
  filter = params_value (params, "filter");

  if (alert_id == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
                                  alert_id, next, filter);
  g_string_append (xml, edit);
  g_free (edit);

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting alert info. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  if (command_enabled (credentials, "GET_REPORT_FORMATS"))
    {
      /* Get the report formats. */

      if (gvm_connection_sendf (connection, "<get_report_formats"
                                            " filter=\"rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting report formats. "
            "The current list of report formats is not available. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        }
    }

  if (command_enabled (credentials, "GET_FILTERS"))
    {
      /* Get filters. */

      if (gvm_connection_sendf (connection, "<get_filters filter=\"rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      if (gvm_connection_sendf (connection, "<get_credentials"
                                            " filter=\"type=up or type=pw"
                                            "          owner=any permission=any"
                                            "          rows=-1\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
                       g_string_free (xml, FALSE), response_data);
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
edit_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
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
save_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  GString *xml;
  int ret;
  gchar *html, *response;
  const char *name, *comment, *alert_id;
  const char *event, *condition, *method;
  const char *filter_id, *active;
  params_t *event_data, *condition_data, *method_data, *report_formats;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  condition = params_value (params, "condition");
  event = params_value (params, "event");
  method = params_value (params, "method");
  alert_id = params_value (params, "alert_id");
  filter_id = params_value (params, "filter_id");
  active = params_value (params, "active");

  if (filter_id == NULL || str_equal (filter_id, ""))
    {
      filter_id = FILT_ID_NONE;
    }

  CHECK_VARIABLE_INVALID (name, "Save Alert");
  CHECK_VARIABLE_INVALID (comment, "Save Alert");
  CHECK_VARIABLE_INVALID (alert_id, "Save Alert");
  CHECK_VARIABLE_INVALID (condition, "Save Alert");
  CHECK_VARIABLE_INVALID (event, "Save Alert");
  CHECK_VARIABLE_INVALID (method, "Save Alert");
  CHECK_VARIABLE_INVALID (active, "Save Alert");

  xml = g_string_new ("");

  /* Modify the alert. */

  event_data = params_values (params, "event_data:");
  condition_data = params_values (params, "condition_data:");
  method_data = params_values (params, "method_data:");
  report_formats = params_values (params, "report_format_ids:");

  if (str_equal (event, EVENT_TYPE_NEW_SECINFO) && event_data)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, event_data);
      while (params_iterator_next (&iter, &name, &param))
        if (str_equal (name, "feed_event") && param->value
            && str_equal (param->value, "updated"))
          {
            event = EVENT_TYPE_UPDATED_SECINFO;
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
                     alert_id, name, filter_id, active, comment ? comment : "",
                     event);

  append_alert_event_data (xml, event_data, event);

  xml_string_append (xml,
                     "</event>"
                     "<method>%s",
                     method);

  append_alert_method_data (xml, method_data, method, report_formats);

  xml_string_append (xml,
                     "</method>"
                     "<condition>%s",
                     condition);

  append_alert_condition_data (xml, condition_data, condition);

  xml_string_append (xml, "</condition>"
                          "</modify_alert>");

  ret =
    gmp (connection, credentials, &response, &entity, response_data, xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a new alert. "
        "No new alert was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a new alert. "
        "It is unclear whether the alert has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
test_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *alert_id;
  entity_t entity;

  alert_id = params_value (params, "alert_id");

  if (alert_id == NULL)
    {
      cmd_response_data_set_status_code (response_data,
                                         GSAD_STATUS_INVALID_REQUEST);
      return gsad_message (credentials, "Invalid request", __func__, __LINE__,
                           "Missing parameter alert_id."
                           "Diagnostics: Required parameter was NULL.",
                           response_data);
    }

  /* Test the alert. */

  if (gvm_connection_sendf (connection, "<test_alert alert_id=\"%s\"/>",
                            alert_id)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while testing an alert. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  entity = NULL;
  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while testing an alert. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Test Alert", response_data);

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
export_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
export_alerts_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "alert", credentials, params, response_data);
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
create_target_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response, *command;
  const char *name, *hosts, *exclude_hosts, *comment;
  const char *target_ssh_credential, *port, *target_smb_credential;
  const char *target_esxi_credential, *target_snmp_credential, *target_source;
  const char *target_exclude_source;
  const char *port_list_id, *reverse_lookup_only, *reverse_lookup_unify;
  const char *alive_tests, *hosts_filter, *file, *exclude_file;
  gchar *ssh_credentials_element, *smb_credentials_element;
  gchar *esxi_credentials_element, *snmp_credentials_element;
  gchar *asset_hosts_element;
  gchar *comment_element = NULL;
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

  CHECK_VARIABLE_INVALID (name, "Create Target");
  CHECK_VARIABLE_INVALID (target_source, "Create Target")
  if (strcmp (target_source, "manual") == 0)
    CHECK_VARIABLE_INVALID (hosts, "Create Target");
  if (strcmp (target_source, "file") == 0)
    CHECK_VARIABLE_INVALID (file, "Create Target")
  /* require hosts_filter if target_source is "asset_hosts" */
  if (strcmp (target_source, "asset_hosts") == 0)
    CHECK_VARIABLE_INVALID (hosts_filter, "Create Target");

  if (params_given (params, "target_exclude_source"))
    {
      CHECK_VARIABLE_INVALID (target_exclude_source, "Create Target")
      if (strcmp (target_exclude_source, "manual") == 0
          /* In case browser doesn't send empty field. */
          && params_given (params, "exclude_hosts"))
        CHECK_VARIABLE_INVALID (exclude_hosts, "Create Target");
      if (strcmp (target_exclude_source, "file") == 0)
        CHECK_VARIABLE_INVALID (exclude_file, "Create Target");
    }

  CHECK_VARIABLE_INVALID (comment, "Create Target");
  CHECK_VARIABLE_INVALID (port_list_id, "Create Target");
  CHECK_VARIABLE_INVALID (target_ssh_credential, "Create Target");
  if (strcmp (target_ssh_credential, "--"))
    CHECK_VARIABLE_INVALID (port, "Create Target");
  CHECK_VARIABLE_INVALID (target_smb_credential, "Create Target");
  CHECK_VARIABLE_INVALID (target_esxi_credential, "Create Target");
  CHECK_VARIABLE_INVALID (target_snmp_credential, "Create Target");
  CHECK_VARIABLE_INVALID (alive_tests, "Create Target");

  if (comment != NULL)
    comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
  else
    comment_element = g_strdup ("");

  if (strcmp (target_ssh_credential, "0") == 0)
    ssh_credentials_element = g_strdup ("");
  else
    ssh_credentials_element = g_strdup_printf ("<ssh_credential id=\"%s\">"
                                               "<port>%s</port>"
                                               "</ssh_credential>",
                                               target_ssh_credential, port);

  if (strcmp (target_smb_credential, "0") == 0)
    smb_credentials_element = g_strdup ("");
  else
    smb_credentials_element =
      g_strdup_printf ("<smb_credential id=\"%s\"/>", target_smb_credential);

  if (strcmp (target_esxi_credential, "0") == 0)
    esxi_credentials_element = g_strdup ("");
  else
    esxi_credentials_element =
      g_strdup_printf ("<esxi_credential id=\"%s\"/>", target_esxi_credential);

  if (strcmp (target_snmp_credential, "0") == 0)
    snmp_credentials_element = g_strdup ("");
  else
    snmp_credentials_element =
      g_strdup_printf ("<snmp_credential id=\"%s\"/>", target_snmp_credential);

  if (strcmp (target_source, "asset_hosts") == 0)
    asset_hosts_element = g_markup_printf_escaped ("<asset_hosts"
                                                   " filter=\"%s\"/>",
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
                     name, strcmp (target_source, "file") == 0 ? file : hosts,
                     target_exclude_source
                       ? (strcmp (target_exclude_source, "file") == 0
                            ? exclude_file
                            : (exclude_hosts ? exclude_hosts : ""))
                       : "",
                     reverse_lookup_only ? reverse_lookup_only : "0",
                     reverse_lookup_unify ? reverse_lookup_unify : "0",
                     port_list_id, alive_tests);

  command = g_strdup_printf ("<create_target>"
                             "%s%s%s%s%s%s%s"
                             "</create_target>",
                             xml->str, comment_element, ssh_credentials_element,
                             smb_credentials_element, esxi_credentials_element,
                             snmp_credentials_element, asset_hosts_element);

  g_string_free (xml, TRUE);
  g_free (comment_element);
  g_free (ssh_credentials_element);
  g_free (smb_credentials_element);
  g_free (esxi_credentials_element);

  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new target. "
        "No new target was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new target. "
        "It is unclear whether the target has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
           params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *id, *type, *alterable;
  entity_t entity;

  id = params_value (params, "id");
  type = params_value (params, "resource_type");
  alterable = params_value (params, "alterable");

  CHECK_VARIABLE_INVALID (id, "Clone");
  CHECK_VARIABLE_INVALID (type, "Clone");

  /* Clone the resource. */

  if (alterable && strcmp (alterable, "0"))
    {
      if (gvm_connection_sendf (connection,
                                "<create_%s>"
                                "<copy>%s</copy>"
                                "<alterable>1</alterable>"
                                "</create_%s>",
                                type, id, type)
          == -1)
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
                                 type, id, type)
           == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while cloning a resource. "
        "It is unclear whether the resource has been cloned or not. "
        "Diagnostics: Failure to read response from manager daemon.",
        response_data);
    }

  /* Cleanup, and return next page. */
  html = response_from_entity (connection, credentials, params, entity, "Clone",
                               response_data);

  free_entity (entity);
  g_free (response);

  return html;
}

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
delete_target_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "target", credentials, params,
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
restore_gmp (gvm_connection_t *connection, credentials_t *credentials,
             params_t *params, cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *ret;
  entity_t entity;
  const char *target_id;

  target_id = params_value (params, "target_id");

  CHECK_VARIABLE_INVALID (target_id, "Restore")

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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
empty_trashcan_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *ret;
  entity_t entity;

  xml = g_string_new ("");

  /* Empty the trash. */

  if (gvm_connection_sendf (connection, "<empty_trashcan/>") == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while emptying the trashcan. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  if (read_entity_and_string_c (connection, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
                params_t *params, cmd_response_data_t *response_data)
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

  CHECK_VARIABLE_INVALID (name, "Create Tags")
  CHECK_VARIABLE_INVALID (comment, "Create Tags")
  if (params_given (params, "filter"))
    CHECK_VARIABLE_INVALID (filter, "Create Tags")
  CHECK_VARIABLE_INVALID (value, "Create Tags")
  CHECK_VARIABLE_INVALID (resource_type, "Create Tags")
  CHECK_VARIABLE_INVALID (active, "Create Tags")

  command = g_string_new ("");

  xml_string_append (command,
                     "<create_tag>"
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<value>%s</value>"
                     "<active>%s</active>"
                     "<resources filter=\"%s\">"
                     "<type>%s</type>",
                     name, comment, value, active, filter ? filter : "",
                     resource_type);

  if (resource_ids)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, resource_ids);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "0"))
          g_string_append_printf (command, "<resource id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  xml_string_append (command, "</resources>"
                              "</create_tag>");

  response = NULL;
  entity = NULL;
  switch (gmp (connection, credentials, &response, &entity, response_data,
               command->str))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      g_string_free (command, TRUE);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new tag. "
        "No new tag was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      g_string_free (command, TRUE);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new tag. "
        "It is unclear whether the tag has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      g_string_free (command, TRUE);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_tag_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "tag", credentials, params,
                                 response_data);
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
save_tag_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t *response_data)
{
  gchar *response;
  const char *name, *comment, *filter, *value, *resource_type, *active;
  const char *resources_action;
  params_t *resource_ids;
  const char *tag_id;
  GString *command;
  entity_t entity;
  char *ret;

  tag_id = params_value (params, "tag_id");
  name = params_value (params, "tag_name");
  comment = params_value (params, "comment");
  filter = params_value (params, "filter");
  value = params_value (params, "tag_value");
  resource_type = params_value (params, "resource_type");
  resource_ids = params_values (params, "resource_ids:");
  resources_action = params_value (params, "resources_action");
  active = params_value (params, "active");

  CHECK_VARIABLE_INVALID (tag_id, "Save Tag")
  CHECK_VARIABLE_INVALID (name, "Save Tag")
  CHECK_VARIABLE_INVALID (comment, "Save Tag")
  if (params_given (params, "filter"))
    CHECK_VARIABLE_INVALID (filter, "Save Tag")
  CHECK_VARIABLE_INVALID (value, "Save Tag")
  if (params_given (params, "resources_action"))
    CHECK_VARIABLE_INVALID (resources_action, "Save Tag")
  CHECK_VARIABLE_INVALID (resource_type, "Save Tag")
  CHECK_VARIABLE_INVALID (active, "Save Tag")

  command = g_string_new ("");

  xml_string_append (command,
                     "<modify_tag tag_id=\"%s\">"
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<value>%s</value>"
                     "<active>%s</active>"
                     "<resources action=\"%s\" filter=\"%s\">"
                     "<type>%s</type>",
                     tag_id, name, comment, value, active,
                     resources_action ? resources_action : "",
                     filter ? filter : "", resource_type);

  if (resource_ids)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, resource_ids);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "0"))
          g_string_append_printf (command, "<resource id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  xml_string_append (command, "</resources>"
                              "</modify_tag>");

  response = NULL;
  entity = NULL;
  switch (gmp (connection, credentials, &response, &entity, response_data,
               command->str))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      g_string_free (command, TRUE);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while saving a tag. "
                           "The tag remains the same. "
                           "Diagnostics: Failure to send command to "
                           "manager daemon.",
                           response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      g_string_free (command, TRUE);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
export_tag_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
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
export_tags_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "tag", credentials, params, response_data);
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
get_tag (gvm_connection_t *connection, credentials_t *credentials,
         params_t *params, const char *extra_xml,
         cmd_response_data_t *response_data)
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
get_tag_gmp (gvm_connection_t *connection, credentials_t *credentials,
             params_t *params, cmd_response_data_t *response_data)
{
  return get_tag (connection, credentials, params, NULL, response_data);
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
get_tags_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "tags", credentials, params, NULL,
                   response_data);
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
toggle_tag_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *tag_id, *enable;
  entity_t entity;

  tag_id = params_value (params, "tag_id");
  enable = params_value (params, "enable");

  CHECK_VARIABLE_INVALID (tag_id, "Toggle Tag")
  CHECK_VARIABLE_INVALID (enable, "Toggle Tag")

  /* Delete the resource and get all resources. */

  if (gvm_connection_sendf (connection,
                            "<modify_tag tag_id=\"%s\">"
                            "<active>%s</active>"
                            "</modify_tag>",
                            tag_id, enable)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while modifying a tag. "
                           "It is unclear whether the tag has been modified"
                           " or not. "
                           "Diagnostics: Failure to read response from"
                           " manager daemon.",
                           response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Toggle Tag", response_data);

  free_entity (entity);
  g_free (response);

  return html;
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
get_target (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "tasks", "1");

  return get_one (connection, "target", credentials, params, extra_xml,
                  arguments, response_data);
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
get_target_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return get_target (connection, credentials, params, NULL, response_data);
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
get_targets_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "targets", credentials, params, NULL,
                   response_data);
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
save_target_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *name, *hosts, *exclude_hosts, *comment;
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

  CHECK_VARIABLE_INVALID (name, "Save Target");
  CHECK_VARIABLE_INVALID (target_id, "Save Target");
  CHECK_VARIABLE_INVALID (comment, "Save Target");
  CHECK_VARIABLE_INVALID (alive_tests, "Save Target");
  CHECK_VARIABLE_INVALID (in_use, "Save Target");

  if (str_equal (in_use, "1"))
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
                         target_id, name ? name : "", comment ? comment : "",
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving a target. "
            "The target remains the same. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        case 2:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving a target. "
            "It is unclear whether the target has been saved or not. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        default:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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

  CHECK_VARIABLE_INVALID (target_source, "Save Target");
  CHECK_VARIABLE_INVALID (target_exclude_source, "Save Target");
  CHECK_VARIABLE_INVALID (port_list_id, "Save Target");
  CHECK_VARIABLE_INVALID (target_ssh_credential, "Save Target");
  CHECK_VARIABLE_INVALID (target_smb_credential, "Save Target");
  CHECK_VARIABLE_INVALID (target_esxi_credential, "Save Target");
  CHECK_VARIABLE_INVALID (target_snmp_credential, "Save Target");

  if (strcmp (target_ssh_credential, "--")
      && strcmp (target_ssh_credential, "0"))
    CHECK_VARIABLE_INVALID (port, "Save Target");

  if (str_equal (target_source, "manual"))
    {
      CHECK_VARIABLE_INVALID (hosts, "Save Target")
    }

  {
    int ret;
    gchar *ssh_credentials_element, *smb_credentials_element;
    gchar *esxi_credentials_element, *snmp_credentials_element;
    gchar *comment_element;
    entity_t entity;

    if (comment)
      comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
    else
      comment_element = g_strdup ("");

    if (str_equal (target_ssh_credential, "--"))
      ssh_credentials_element = g_strdup ("");
    else
      ssh_credentials_element = g_strdup_printf ("<ssh_credential id=\"%s\">"
                                                 "<port>%s</port>"
                                                 "</ssh_credential>",
                                                 target_ssh_credential, port);

    if (str_equal (target_smb_credential, "--"))
      smb_credentials_element = g_strdup ("");
    else
      smb_credentials_element =
        g_strdup_printf ("<smb_credential id=\"%s\"/>", target_smb_credential);

    if (str_equal (target_esxi_credential, "--"))
      esxi_credentials_element = g_strdup ("");
    else
      esxi_credentials_element = g_strdup_printf (
        "<esxi_credential id=\"%s\"/>", target_esxi_credential);

    if (str_equal (target_snmp_credential, "--"))
      snmp_credentials_element = g_strdup ("");
    else
      snmp_credentials_element = g_strdup_printf (
        "<snmp_credential id=\"%s\"/>", target_snmp_credential);

    command = g_string_new ("");
    xml_string_append (
      command,
      "<modify_target target_id=\"%s\">"
      "<name>%s</name>"
      "<hosts>%s</hosts>"
      "<exclude_hosts>%s</exclude_hosts>"
      "<reverse_lookup_only>%s</reverse_lookup_only>"
      "<reverse_lookup_unify>%s</reverse_lookup_unify>"
      "<port_list id=\"%s\"/>"
      "<alive_tests>%s</alive_tests>",
      target_id, name,
      str_equal (target_source, "file") ? params_value (params, "file") : hosts,
      str_equal (target_exclude_source, "file")
        ? params_value (params, "exclude_file")
        : exclude_hosts,
      reverse_lookup_only ? reverse_lookup_only : "0",
      reverse_lookup_unify ? reverse_lookup_unify : "0", port_list_id,
      alive_tests);

    g_string_append_printf (command,
                            "%s%s%s%s%s"
                            "</modify_target>",
                            comment_element, ssh_credentials_element,
                            smb_credentials_element, esxi_credentials_element,
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
        return gsad_message (
          credentials, "Internal error", __func__, __LINE__,
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
        return gsad_message (
          credentials, "Internal error", __func__, __LINE__,
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
export_target_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
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
export_targets_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "target", credentials, params, response_data);
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
create_config_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *name, *comment, *base, *usage_type, *scanner = NULL;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  base = params_value (params, "base");
  usage_type = params_value (params, "usage_type");

  CHECK_VARIABLE_INVALID (name, "New Config");
  CHECK_VARIABLE_INVALID (comment, "New Config");
  CHECK_VARIABLE_INVALID (base, "New Config");
  CHECK_VARIABLE_INVALID (usage_type, "New Config");
  if (str_equal (base, "0"))
    {
      scanner = params_value (params, "scanner_id");
      CHECK_VARIABLE_INVALID (scanner, "New Config");
    }

  /* Create the config. */
  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<create_config>"
                "<name>%s</name>"
                "<copy>%s</copy>"
                "<comment>%s</comment>"
                "<scanner>%s</scanner>"
                "<usage_type>%s</usage_type>"
                "</create_config>",
                name, base, comment, scanner ?: "", usage_type))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new config. "
        "No new config was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new config. "
        "It is unclear whether the config has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
import_config_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
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
  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while importing a config. "
        "The schedule remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while importing a config. "
        "It is unclear whether the schedule has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_configs_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  const char *usage_type;
  gmp_arguments_t *arguments = NULL;

  usage_type = params_value (params, "usage_type");
  if (params_given (params, "usage_type"))
    CHECK_VARIABLE_INVALID (usage_type, "Get Configs")

  if (usage_type)
    {
      arguments = gmp_arguments_new ();
      gmp_arguments_add (arguments, "usage_type", usage_type);
    }

  return get_many (connection, "configs", credentials, params, arguments,
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
get_config_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;

  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "families", "1");
  gmp_arguments_add (arguments, "tasks", "1");
  gmp_arguments_add (arguments, "preferences", "1");

  return get_one (connection, "config", credentials, params, NULL, arguments,
                  response_data);
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
                int *success, cmd_response_data_t *response_data)
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
      value = param->value_size
                ? g_base64_encode ((guchar *) param->value, param->value_size)
                : g_strdup ("");

      /* Send the name without the osp_pref_ prefix. */
      param_name = ((char *) param_name) + 9;
      if (gvm_connection_sendf (connection,
                                "<modify_config config_id=\"%s\">"
                                "<preference><name>%s</name>"
                                "<value>%s</value></preference>"
                                "</modify_config>",
                                config_id, (char *) param_name, value)
          == -1)
        {
          g_free (value);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
save_config_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
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

  CHECK_VARIABLE_INVALID (config_id, "Save Config");
  CHECK_VARIABLE_INVALID (name, "Save Config");
  CHECK_VARIABLE_INVALID (comment, "Save Config");

  /* Save name and comment. */

  if (scanner_id)
    gmp_ret = gvm_connection_sendf_xml (connection,
                                        "<modify_config config_id=\"%s\">"
                                        "<name>%s</name>"
                                        "<comment>%s</comment>"
                                        "<scanner>%s</scanner>"
                                        "</modify_config>",
                                        params_value (params, "config_id"),
                                        name, comment, scanner_id);
  else
    gmp_ret = gvm_connection_sendf_xml (connection,
                                        "<modify_config config_id=\"%s\">"
                                        "<name>%s</name>"
                                        "<comment>%s</comment>"
                                        "</modify_config>",
                                        params_value (params, "config_id"),
                                        name, comment);

  if (gmp_ret == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a config. "
        "It is unclear whether the entire config has been saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  ret = check_modify_config (connection, credentials, params, "get_config",
                             "edit_config", &success, response_data);
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

          value = param->value_size ? g_base64_encode ((guchar *) param->value,
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
                                    param_name, value)
              == -1)
            {
              g_free (value);
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while saving a config. "
                "It is unclear whether the entire config has been saved. "
                "Diagnostics: Failure to send command to manager daemon.",
                response_data);
            }
          g_free (value);
          g_free (ret);

          ret =
            check_modify_config (connection, credentials, params, "get_config",
                                 "edit_config", &success, response_data);
          if (success == 0)
            {
              return ret;
            }
        }
    }

  /* OSP config file preference. */
  osp_ret = save_osp_prefs (connection, credentials, params, "get_config",
                            "edit_config", &success, response_data);
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      if (gvm_connection_sendf (
            connection,
            "<modify_config config_id=\"%s\">"
            "<family_selection>"
            "<growing>%i</growing>",
            params_value (params, "config_id"),
            trends && params_value (params, "trend")
              && strcmp (params_value (params, "trend"), "0"))
          == -1)
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
                cmd_response_data_set_status_code (
                  response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                return gsad_message (
                  credentials, "Internal error", __func__, __LINE__,
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
              if (param->value_size == 0)
                continue;
              if (param->value[0] == '0')
                continue;
              if (selects && member (selects, family))
                continue;
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
                  return gsad_message (
                    credentials, "Internal error", __func__, __LINE__,
                    "An internal error occurred while saving a config. "
                    "It is unclear whether the entire config has been saved. "
                    "Diagnostics: Failure to send command to manager daemon.",
                    response_data);
                }
            }
        }

      if (gvm_connection_sendf (connection, "</family_selection>"
                                            "</modify_config>")
          == -1)
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving a config. "
            "It is unclear whether the entire config has been saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }

      g_free (ret);
      ret = check_modify_config (connection, credentials, params, "get_config",
                                 "edit_config", NULL, response_data);
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
get_config_family (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, int edit,
                   cmd_response_data_t *response_data)
{
  GString *xml;
  const char *config_id, *family, *sort_field, *sort_order;

  config_id = params_value (params, "config_id");
  family = params_value (params, "family");

  CHECK_VARIABLE_INVALID (config_id, "Get Scan Config Family")
  CHECK_VARIABLE_INVALID (family, "Get Scan Config Family")

  xml = g_string_new ("<get_config_family_response>");

  /* Get the details for all NVT's in the config in the family. */

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (gvm_connection_sendf (
        connection,
        "<get_nvts"
        " config_id=\"%s\" details=\"1\""
        " family=\"%s\" timeout=\"1\" preference_count=\"1\""
        " sort_field=\"%s\" sort_order=\"%s\"/>",
        config_id, family, sort_field ? sort_field : "nvts.name",
        sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
                                family, config_id,
                                sort_field ? sort_field : "nvts.name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting list of configs. "
            "The current list of configs is not available. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        }

      g_string_append (xml, "</all>");
    }

  g_string_append (xml, "</get_config_family_response>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
get_config_family_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
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
edit_config_family_gmp (gvm_connection_t *connection,
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
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
save_config_family_gmp (gvm_connection_t *connection,
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
{
  char *ret;
  const char *config_id, *family;
  params_t *nvts;

  config_id = params_value (params, "config_id");
  family = params_value (params, "family");

  CHECK_VARIABLE_INVALID (config_id, "Save Config Family")
  CHECK_VARIABLE_INVALID (family, "Save Config Family")

  /* Set the NVT selection. */

  if (gvm_connection_sendf (connection,
                            "<modify_config config_id=\"%s\">"
                            "<nvt_selection>"
                            "<family>%s</family>",
                            config_id, family)
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
        if (gvm_connection_sendf (connection, "<nvt oid=\"%s\"/>", name) == -1)
          {
            cmd_response_data_set_status_code (response_data,
                                               MHD_HTTP_INTERNAL_SERVER_ERROR);
            return gsad_message (
              credentials, "Internal error", __func__, __LINE__,
              "An internal error occurred while saving a config. "
              "It is unclear whether the entire config has been saved. "
              "Diagnostics: Failure to send command to manager daemon.",
              response_data);
          }
    }

  if (gvm_connection_sendf (connection, "</nvt_selection>"
                                        "</modify_config>")
      == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a config. "
        "It is unclear whether the entire config has been saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  ret =
    check_modify_config (connection, credentials, params, "get_config_family",
                         "edit_config_family", NULL, response_data);

  return ret;
}

/**
 * @brief Get details of an NVT for a config, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_config_nvt_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  GString *xml;
  const char *config_id, *sort_field, *sort_order, *nvt;

  config_id = params_value (params, "config_id");
  nvt = params_value (params, "oid");

  CHECK_VARIABLE_INVALID (config_id, "Get Config")

  xml = g_string_new ("<get_config_nvt_response>");

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (gvm_connection_sendf (connection,
                            "<get_nvts"
                            " config_id=\"%s\" nvt_oid=\"%s\""
                            " details=\"1\" preferences=\"1\""
                            " sort_field=\"%s\" sort_order=\"%s\"/>",
                            config_id, nvt,
                            sort_field ? sort_field : "nvts.name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting list of configs. "
        "The current list of configs is not available. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  g_string_append (xml, "</get_config_nvt_response>");

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Get all nvt_families, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_nvt_families_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
{
  return get_entities (connection, "nvt_families", credentials, params, NULL,
                       response_data);
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
save_config_nvt_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
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
          int ret, is_timeout = 0;
          gchar *value, **splits;

          g_free (modify_config_ret);
          modify_config_ret = NULL;

          /* Passwords and files have checkboxes to control whether they
           * must be reset.  This works around the need for the Manager to
           * send the actual password or show the actual file. */

          /* OID:PrefID:PrefType:PrefName value */
          splits = g_strsplit (preference_name, ":", 4);
          if (splits && splits[0] && splits[1] && splits[2] && splits[3])
            {
              if (!strcmp (splits[2], "password"))
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
                                                   &password_name, &password))
                        if (strcmp (password_name, preference_name) == 0)
                          {
                            found = 1;
                            break;
                          }
                    }
                  if (found == 0)
                    {
                      /* Skip modifying the password preference. */
                      g_strfreev (splits);
                      continue;
                    }
                }
              else if (!strcmp (splits[2], "file"))
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
                      while (
                        params_iterator_next (&file_params, &file_name, &file))
                        if (strcmp (file_name, preference_name) == 0)
                          {
                            found = 1;
                            break;
                          }
                    }
                  if (found == 0)
                    {
                      /* Skip modifying the file preference. */
                      g_strfreev (splits);
                      continue;
                    }
                }
              else if (!strcmp (splits[2], "scanner"))
                {
                  /* Presume it's the timeout. */
                  is_timeout = 1;
                }
            }
          g_strfreev (splits);

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
                  return gsad_message (
                    credentials, "Internal error", __func__, __LINE__,
                    "An internal error occurred while saving a config. "
                    "It is unclear whether the entire config has been saved. "
                    "Diagnostics: Required parameter was NULL.",
                    response_data);
                }

              preference_name_escaped =
                g_markup_escape_text (preference_name, -1);

              if (strcmp (timeout, "0") == 0)
                /* Leave out the value to clear the preference. */
                ret = gvm_connection_sendf (connection,
                                            "<modify_config"
                                            " config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id, preference_name_escaped);
              else
                ret = gvm_connection_sendf (connection,
                                            "<modify_config"
                                            " config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "<value>%s</value>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id, preference_name_escaped,
                                            value);

              g_free (preference_name_escaped);
            }
          else
            {
              gchar *preference_name_escaped;
              preference_name_escaped =
                g_markup_escape_text (preference_name, -1);
              ret =
                gvm_connection_sendf (connection,
                                      "<modify_config"
                                      " config_id=\"%s\">"
                                      "<preference>"
                                      "<nvt oid=\"%s\"/>"
                                      "<name>%s</name>"
                                      "<value>%s</value>"
                                      "</preference>"
                                      "</modify_config>",
                                      config_id, params_value (params, "oid"),
                                      preference_name_escaped, value);
              g_free (preference_name_escaped);
            }

          if (ret == -1)
            {
              g_free (value);
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while saving a config. "
                "It is unclear whether the entire config has been saved. "
                "Diagnostics: Failure to send command to manager daemon.",
                response_data);
            }
          g_free (value);

          modify_config_ret = check_modify_config (
            connection, credentials, params, "get_config_nvt",
            "save_config_nvt", &success, response_data);
          if (success == 0)
            {
              return modify_config_ret;
            }
        }
    }

  /* Create a generic success message in case modify_config_ret is NULL,
   *  which could happen if the last preference is a password and skipped.
   * This assumes that messages are returned earlier in case of errors. */
  modify_config_ret = action_result (
    connection, credentials, params, response_data, "Modify Config",
    "All NVT preferences modified successfully", NULL, NULL);

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
delete_config_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "config", credentials, params,
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
export_config_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
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
export_configs_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
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
export_note_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
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
export_notes_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "note", credentials, params, response_data);
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
export_override_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
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
export_overrides_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
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
export_port_list_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
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
export_port_lists_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
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
                            credentials_t *credentials, params_t *params,
                            cmd_response_data_t *response_data)
{
  GString *xml;
  entity_t entity, preference_entity, value_entity;
  const char *config_id, *oid, *preference_name;

  config_id = params_value (params, "config_id");
  oid = params_value (params, "oid");
  preference_name = params_value (params, "preference_name");

  xml = g_string_new ("<get_preferences_response>");

  CHECK_VARIABLE_INVALID (config_id, "Export Preference File")
  CHECK_VARIABLE_INVALID (oid, "Export Preference File")
  CHECK_VARIABLE_INVALID (preference_name, "Export Preference File")

  if (gvm_connection_sendf (connection,
                            "<get_preferences"
                            " config_id=\"%s\""
                            " nvt_oid=\"%s\""
                            " preference=\"%s\"/>",
                            config_id, oid, preference_name)
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      cmd_response_data_set_content_disposition (
        response_data,
        g_strdup_printf ("attachment; filename=\"pref_file.bin\""));
      cmd_response_data_set_content_length (response_data, strlen (content));
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a preference file. "
        "The file could not be delivered. "
        "Diagnostics: Failure to receive file from manager daemon.",
        response_data);
    }

  g_string_append (xml, "</get_preferences_response>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
                          credentials_t *credentials, params_t *params,
                          cmd_response_data_t *response_data)
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
                           credentials_t *credentials, params_t *params,
                           cmd_response_data_t *response_data)
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
delete_report_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return delete_resource (connection, "report", credentials, params, TRUE,
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
get_report (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t *response_data)
{
  GString *xml;
  entity_t entity;
  entity_t report_entity;
  const char *report_id, *delta_report_id;
  const char *format_id;
  const char *filter;
  const char *filter_id;
  gboolean lean, ignore_pagination, details;
  int ret;
  gchar *fname_format;
  const gchar *extension, *requested_content_type;

  details = params_value_bool (params, "details");
  ignore_pagination = params_value_bool (params, "ignore_pagination");
  lean = params_value_bool (params, "lean");

  report_id = params_value (params, "report_id");

  CHECK_VARIABLE_INVALID (report_id, "Get Report");

  delta_report_id = params_value (params, "delta_report_id");
  format_id = params_value (params, "report_format_id");

  filter = params_value (params, "filter");
  filter_id = params_value (params, "filter_id");

  details = params_value_bool (params, "details");

  if (filter == NULL || filter_id)
    filter = "";

  ret = gvm_connection_sendf_xml (
    connection,
    "<get_reports"
    " details=\"%d\""
    " ignore_pagination=\"%d\""
    " lean=\"%d\""
    " filter=\"%s\""
    " filt_id=\"%s\""
    " report_id=\"%s\""
    " delta_report_id=\"%s\""
    " format_id=\"%s\"/>",
    details, ignore_pagination, lean, filter,
    filter_id ? filter_id : FILT_ID_NONE, report_id,
    delta_report_id ? delta_report_id : "0", format_id ? format_id : "");

  if (ret == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a report. "
        "The report could not be delivered. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  if (format_id)
    {
      if ((str_equal (format_id, XML_REPORT_FORMAT_ID))
          || str_equal (format_id, ANONXML_REPORT_FORMAT_ID))
        {
          /* Manager sends XML report as plain XML. */

          if (read_entity_c (connection, &entity))
            {
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while getting a report. "
                "The report could not be delivered. "
                "Diagnostics: Failure to receive response from manager daemon.",
                response_data);
            }
          entity_t report = entity_child (entity, "report");
          if (report == NULL)
            {
              free_entity (entity);
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while getting a report. "
                "The report could not be delivered. "
                "Diagnostics: Response from manager daemon did not contain a "
                "report.",
                response_data);
            }
          extension = entity_attribute (report, "extension");
          requested_content_type = entity_attribute (report, "content_type");
          if (extension && requested_content_type)
            {
              gchar *file_name;
              ret = setting_get_value (connection,
                                       "e1a2ae0b-736e-4484-b029-330c9e15b900",
                                       &fname_format, response_data);
              if (ret)
                {
                  switch (ret)
                    {
                    case 1:
                      cmd_response_data_set_status_code (
                        response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                      return gsad_message (
                        credentials, "Internal error", __func__, __LINE__,
                        "An internal error occurred while getting a setting. "
                        "The setting could not be delivered. "
                        "Diagnostics: Failure to send command to manager "
                        "daemon.",
                        response_data);
                    case 2:
                      cmd_response_data_set_status_code (
                        response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                      return gsad_message (
                        credentials, "Internal error", __func__, __LINE__,
                        "An internal error occurred while getting a setting. "
                        "The setting could not be delivered. "
                        "Diagnostics: Failure to receive response from manager "
                        "daemon.",
                        response_data);
                    default:
                      cmd_response_data_set_status_code (
                        response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                      return gsad_message (
                        credentials, "Internal error", __func__, __LINE__,
                        "An internal error occurred while getting a setting. "
                        "The setting could not be delivered. "
                        "Diagnostics: Internal error.",
                        response_data);
                    }
                }

              if (fname_format == NULL)
                {
                  g_warning ("%s : File name format setting not found.",
                             __func__);
                  fname_format = "%T-%U";
                }

              file_name = format_file_name (fname_format, credentials, "report",
                                            report_id, report);
              if (file_name == NULL)
                file_name = g_strdup_printf ("%s-%s", "report", report_id);

              cmd_response_data_set_content_type_string (
                response_data, g_strdup (requested_content_type));
              cmd_response_data_set_content_disposition (
                response_data,
                g_strdup_printf ("attachment; filename=\"%s.%s\"", file_name,
                                 extension));

              g_free (file_name);
            }
          xml = g_string_new ("");
          print_entity_to_string (report, xml);
          free_entity (entity);
          return g_string_free (xml, FALSE);
        }
      else
        {
          /* "nbe", "pdf", "dvi", "html", "html-pdf"... */

          entity = NULL;
          if (read_entity_c (connection, &entity))
            {
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
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
              requested_content_type =
                entity_attribute (report_entity, "content_type");
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
                  else
                    id = "ERROR";

                  ret = setting_get_value (
                    connection, "e1a2ae0b-736e-4484-b029-330c9e15b900",
                    &fname_format, response_data);
                  if (ret)
                    {
                      switch (ret)
                        {
                        case 1:
                          cmd_response_data_set_status_code (
                            response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                          return gsad_message (
                            credentials, "Internal error", __func__, __LINE__,
                            "An internal error occurred while getting a "
                            "setting. "
                            "The setting could not be delivered. "
                            "Diagnostics: Failure to send command to manager "
                            "daemon.",
                            response_data);
                        case 2:
                          cmd_response_data_set_status_code (
                            response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                          return gsad_message (
                            credentials, "Internal error", __func__, __LINE__,
                            "An internal error occurred while getting a "
                            "setting. "
                            "The setting could not be delivered. "
                            "Diagnostics: Failure to receive response from "
                            "manager daemon.",
                            response_data);
                        default:
                          cmd_response_data_set_status_code (
                            response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                          return gsad_message (
                            credentials, "Internal error", __func__, __LINE__,
                            "An internal error occurred while getting a "
                            "setting. "
                            "The setting could not be delivered. "
                            "Diagnostics: Internal error.",
                            response_data);
                        }
                    }

                  if (fname_format == NULL)
                    {
                      g_warning ("%s : File name format setting not found.",
                                 __func__);
                      fname_format = "%T-%U";
                    }

                  file_name = format_file_name (fname_format, credentials,
                                                "report", id, report_entity);
                  if (file_name == NULL)
                    file_name = g_strdup_printf ("%s-%s", "report", id);

                  cmd_response_data_set_content_type_string (
                    response_data, g_strdup (requested_content_type));
                  cmd_response_data_set_content_disposition (
                    response_data,
                    g_strdup_printf ("attachment; filename=\"%s.%s\"",
                                     file_name, extension));

                  g_free (file_name);
                }

              free_entity (entity);

              cmd_response_data_set_content_length (response_data, report_len);
              return report_decoded;
            }
          else
            {
              free_entity (entity);
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while getting a report. "
                "The report could not be delivered. "
                "Diagnostics: Failure to receive report from manager daemon.",
                response_data);
            }
        }
    }
  else
    {
      /* Format is NULL, send enveloped XML. */

      xml = g_string_new ("<get_report>");

      if (extra_xml)
        g_string_append (xml, extra_xml);

      if (delta_report_id)
        {
          g_string_append_printf (xml, "<delta>%s</delta>", delta_report_id);

          entity = NULL;
          if (read_entity_and_string_c (connection, &entity, &xml))
            {
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __FUNCTION__, __LINE__,
                "An internal error occurred while getting a report. "
                "The report could not be delivered. "
                "Diagnostics: Failure to receive response from manager daemon.",
                response_data);
            }

          if (gmp_success (entity) != 1)
            {
              gchar *message;

              set_http_status_from_entity (entity, response_data);

              message = gsad_message (
                credentials, "Error", __FUNCTION__, __LINE__,
                entity_attribute (entity, "status_text"), response_data);

              g_string_free (xml, TRUE);
              free_entity (entity);
              return message;
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

              if (delta_report_id && id && name)
                g_string_append_printf (
                  xml, "<task id=\"%s\"><name>%s</name></task>", id,
                  entity_text (name));

              free_entity (entity);
            }

          g_string_append (xml, "</get_report>");

          return envelope_gmp (connection, credentials, params,
                               g_string_free (xml, FALSE), response_data);
        }

      if (read_string_c (connection, &xml))
        {
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting a report. "
            "The report could not be delivered. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        }

      g_string_append (xml, "</get_report>");

      return envelope_gmp (connection, credentials, params,
                           g_string_free (xml, FALSE), response_data);
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
get_report_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return get_report (connection, credentials, params, NULL, response_data);
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
report_alert_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials, "Bad Request", __func__, __LINE__,
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
                                  report_id, filter ? filter : "", alert_id);
  if (ret == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a report. "
        "The report could not be delivered. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  if (read_entity_and_text_c (connection, &entity, &response))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting a report. "
        "The report could not be delivered. "
        "Diagnostics: Failure to parse response from manager daemon.",
        response_data);
    }
  if (strcmp (status, "200"))
    {
      free_entity (entity);
      g_free (response);
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials, "Failed", __func__, __LINE__,
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
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_reports_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  const gchar *filter, *filter_id, *details;
  gmp_arguments_t *arguments;

  filter = params_value (params, "filter");
  filter_id = params_value (params, "filter_id");
  details = params_value (params, "details");

  arguments = gmp_arguments_new ();

  if (!filter && !filter_id)
    {
      filter_id = FILT_ID_USER_SETTING;
    }

  if (filter)
    {
      gmp_arguments_add (arguments, "report_filter", filter);
    }

  if (!filter_id && !filter)
    {
      filter_id = FILT_ID_USER_SETTING;
    }

  if (filter_id)
    {
      gmp_arguments_add (arguments, "report_filt_id", filter_id);
    }

  if (details && !str_equal (details, ""))
    {
      gmp_arguments_add (arguments, "details", details);
    }

  params_remove (params, "filter");
  params_remove (params, "filter_id");

  return get_entities (connection, "reports", credentials, params, arguments,
                       response_data);
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
download_ssl_cert (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  const char *ssl_cert;
  gchar *cert;
  char *unescaped;

  ssl_cert = params_value (params, "ssl_cert");
  if (ssl_cert == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
download_ca_pub (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  const char *ca_pub;
  char *unescaped;

  ca_pub = params_value (params, "ca_pub");
  if (ca_pub == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
download_key_pub (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  const char *key_pub;
  char *unescaped;

  key_pub = params_value (params, "key_pub");
  if (key_pub == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
export_result_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
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
export_results_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "result", credentials, params, response_data);
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
                 params_t *params, cmd_response_data_t *response_data)
{
  const gchar *_and_report_id;
  gmp_arguments_t *arguments = NULL;

  _and_report_id = params_value (params, "_and_report_id");

  if (params_given (params, "_and_report_id"))
    {
      CHECK_VARIABLE_INVALID (_and_report_id, "Get results");

      arguments = gmp_arguments_new ();

      gmp_arguments_add (arguments, "_and_report_id", _and_report_id);
    }

  return get_many (connection, "results", credentials, params, arguments,
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
get_result_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return get_one (connection, "result", credentials, params, NULL, NULL,
                  response_data);
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
get_notes_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "notes", credentials, params, NULL,
                   response_data);
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
get_note (gvm_connection_t *connection, credentials_t *credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "result", "1");

  return get_one (connection, "note", credentials, params, extra_xml, arguments,
                  response_data);
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
get_note_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t *response_data)
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
get_port_from_params (params_t *params)
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
get_hosts_from_params (params_t *params)
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
get_task_id_from_params (params_t *params)
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
get_severity_from_params (params_t *params)
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
get_result_id_from_params (params_t *params)
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
create_note_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  char *ret;
  gchar *response;
  const char *oid, *severity, *port, *hosts;
  const char *text, *task_id, *result_id;
  /* For get_report. */
  const char *active, *days;
  entity_t entity;

  oid = params_value (params, "oid");
  CHECK_VARIABLE_INVALID (oid, "Create Note");

  port = get_port_from_params (params);
  hosts = get_hosts_from_params (params);
  task_id = get_task_id_from_params (params);
  severity = get_severity_from_params (params);
  result_id = get_result_id_from_params (params);

  CHECK_VARIABLE_INVALID (severity, "Create Note");
  CHECK_VARIABLE_INVALID (hosts, "Create Note");

  active = params_value (params, "active");
  CHECK_VARIABLE_INVALID (active, "Create Note");

  text = params_value (params, "text");
  days = params_value (params, "days");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
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
                strcmp (active, "1") ? active : (days ? days : "-1"), oid,
                hosts ? hosts : "", port ? port : "", severity ? severity : "",
                text ? text : "", task_id ? task_id : "",
                result_id ? result_id : ""))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new note. "
        "No new note was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new note. "
        "It is unclear whether the note has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_note_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "note", credentials, params,
                                 response_data);
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
save_note_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
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

  CHECK_VARIABLE_INVALID (oid, "Save Note");
  CHECK_VARIABLE_INVALID (active, "Save Note");
  CHECK_VARIABLE_INVALID (note_id, "Save Note");
  CHECK_VARIABLE_INVALID (days, "Save Note");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
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
                note_id, strcmp (active, "1") ? active : (days ? days : "-1"),
                hosts ? hosts : "", port ? port : "", severity ? severity : "",
                text ? text : "", task_id ? task_id : "",
                result_id ? result_id : "", oid))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a note. "
        "The note remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a note. "
        "It is unclear whether the note has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_overrides_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "overrides", credentials, params, NULL,
                   response_data);
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
get_override (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, const char *extra_xml,
              cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "result", "1");

  return get_one (connection, "override", credentials, params, extra_xml,
                  arguments, response_data);
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
get_override_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
  CHECK_VARIABLE_INVALID (oid, "Create Override");

  port = get_port_from_params (params);
  hosts = get_hosts_from_params (params);
  task_id = get_task_id_from_params (params);
  severity = get_severity_from_params (params);
  result_id = get_result_id_from_params (params);

  custom_severity = params_value (params, "custom_severity");
  CHECK_VARIABLE_INVALID (custom_severity, "Create Override");

  if (custom_severity != NULL && strcmp (custom_severity, "0"))
    {
      if (params_valid (params, "new_severity"))
        new_severity = params_value (params, "new_severity");
      else if (params_original_value (params, "new_severity") == NULL
               || strcmp (params_original_value (params, "new_severity"), ""))
        new_severity = NULL;
      else
        new_severity = "";
      CHECK_VARIABLE_INVALID (new_severity, "Create Override");
    }
  else
    {
      if (params_valid (params, "new_severity_from_list"))
        new_severity = params_value (params, "new_severity_from_list");
      else if (params_original_value (params, "new_severity_from_list") == NULL
               || strcmp (
                    params_original_value (params, "new_severity_from_list"),
                    ""))
        new_severity = NULL;
      else
        new_severity = "";
      CHECK_VARIABLE_INVALID (new_severity, "Create Override");
    }

  active = params_value (params, "active");
  CHECK_VARIABLE_INVALID (active, "Create Override");

  text = params_value (params, "text");
  days = params_value (params, "days");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
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
                strcmp (active, "1") ? active : (days ? days : "-1"), oid,
                hosts ? hosts : "", port ? port : "", severity ? severity : "",
                new_severity, text ? text : "", task_id ? task_id : "",
                result_id ? result_id : ""))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new override. "
        "No new override was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new override. "
        "It is unclear whether the override has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_override_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "override", credentials, params,
                                 response_data);
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
save_override_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  gchar *response;
  entity_t entity;
  const char *override_id, *text, *hosts, *port;
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

  CHECK_VARIABLE_INVALID (active, "Save Override");
  CHECK_VARIABLE_INVALID (override_id, "Save Override");
  CHECK_VARIABLE_INVALID (new_severity, "Save Override");
  CHECK_VARIABLE_INVALID (days, "Save Override");
  CHECK_VARIABLE_INVALID (oid, "Save Override");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
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
                strcmp (active, "1") ? active : (days ? days : "-1"), oid,
                hosts ? hosts : "", port ? port : "", severity ? severity : "",
                new_severity, text ? text : "", task_id ? task_id : "",
                result_id ? result_id : ""))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a override. "
        "The override remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a override. "
        "It is unclear whether the override has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_scanners_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "scanners", credentials, params, NULL,
                   response_data);
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
get_scanner (gvm_connection_t *connection, credentials_t *credentials,
             params_t *params, const char *extra_xml,
             cmd_response_data_t *response_data)
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
get_scanner_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
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
export_scanner_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
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
export_scanners_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
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
verify_scanner_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *scanner_id;
  int ret;
  entity_t entity;

  scanner_id = params_value (params, "scanner_id");
  CHECK_VARIABLE_INVALID (scanner_id, "Verify Scanner");

  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<verify_scanner scanner_id=\"%s\"/>", scanner_id);

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while verifying a scanner. "
        "The scanner was not verified. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while verifying a scanner. "
        "It is unclear whether the scanner was verified or not. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while verifying a scanner. "
        "It is unclear whether the scanner was verified or not. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  html = response_from_entity (connection, credentials, params, entity,
                               "Verify Scanner", response_data);
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
create_scanner_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
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
  CHECK_VARIABLE_INVALID (name, "Create Scanner");
  CHECK_VARIABLE_INVALID (comment, "Create Scanner");
  CHECK_VARIABLE_INVALID (host, "Create Scanner");
  CHECK_VARIABLE_INVALID (port, "Create Scanner");
  CHECK_VARIABLE_INVALID (type, "Create Scanner");
  if (params_given (params, "ca_pub"))
    CHECK_VARIABLE_INVALID (ca_pub, "Create Scanner");

  if (ca_pub)
    ret = gmpf (connection, credentials, &response, &entity, response_data,
                "<create_scanner>"
                "<name>%s</name><comment>%s</comment>"
                "<host>%s</host><port>%s</port><type>%s</type>"
                "<ca_pub>%s</ca_pub>"
                "<credential id=\"%s\"/>"
                "</create_scanner>",
                name, comment, host, port, type, ca_pub,
                credential_id ? credential_id : "");
  else
    ret = gmpf (connection, credentials, &response, &entity, response_data,
                "<create_scanner>"
                "<name>%s</name><comment>%s</comment>"
                "<host>%s</host><port>%s</port><type>%s</type>"
                "<credential id=\"%s\"/>"
                "</create_scanner>",
                name, comment, host, port, type,
                credential_id ? credential_id : "");
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new scanner. "
        "No new scanner was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new scanner. "
        "It is unclear whether the scanner has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_scanner_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "scanner", credentials, params,
                                 response_data);
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
save_scanner_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
  CHECK_VARIABLE_INVALID (scanner_id, "Edit Scanner");
  CHECK_VARIABLE_INVALID (name, "Edit Scanner");
  if (params_given (params, "scanner_host") == 0)
    in_use = 1;
  else
    {
      in_use = 0;
      CHECK_VARIABLE_INVALID (host, "Edit Scanner");
      CHECK_VARIABLE_INVALID (port, "Edit Scanner");
      CHECK_VARIABLE_INVALID (type, "Edit Scanner");
    }
  if (is_unix_socket == 0)
    {
      CHECK_VARIABLE_INVALID (ca_pub, "Edit Scanner");
      CHECK_VARIABLE_INVALID (which_cert, "Edit Scanner");
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
                    credential_id ? credential_id : "");
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
                    credential_id ? credential_id : "");
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a scanner. "
        "The scanner remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a scanner. "
        "It is unclear whether the scanner has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_schedule (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, const char *extra_xml,
              cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "tasks", "1");

  return get_one (connection, "schedule", credentials, params, extra_xml,
                  arguments, response_data);
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
get_schedule_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  return get_schedule (connection, credentials, params, NULL, response_data);
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
get_schedules_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "schedules", credentials, params, NULL,
                   response_data);
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

  CHECK_VARIABLE_INVALID (name, "Create Schedule");
  CHECK_VARIABLE_INVALID (comment, "Create Schedule");
  CHECK_VARIABLE_INVALID (timezone, "Create Schedule");
  CHECK_VARIABLE_INVALID (icalendar, "Create Schedule");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<create_schedule>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<timezone>%s</timezone>"
                "<icalendar>%s</icalendar>"
                "</create_schedule>",
                name, comment, timezone, icalendar))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new schedule. "
        "No new schedule was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new schedule. "
        "It is unclear whether the schedule has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_schedule_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "schedule", credentials, params,
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
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
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

  g_string_append_printf (xml, "<slave id=\"%s\"/>", slave_id ? slave_id : "0");

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

      g_string_append_printf (xml, "<duration>%ld</duration>", duration);
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

      start_time.tm_year =
        start_year ? atoi (start_year) - 1900 : time_broken->tm_year;
      start_time.tm_mon =
        start_month ? atoi (start_month) - 1 : time_broken->tm_mon;
      start_time.tm_mday = start_day ? atoi (start_day) : time_broken->tm_mday;
      start_time.tm_hour =
        start_hour ? atoi (start_hour) : time_broken->tm_hour;
      start_time.tm_min =
        start_minute ? atoi (start_minute) : time_broken->tm_min;

      end_time.tm_year =
        end_year ? atoi (end_year) - 1900 : time_broken->tm_year;
      end_time.tm_mon = end_month ? atoi (end_month) - 1 : time_broken->tm_mon;
      end_time.tm_mday = end_day ? atoi (end_day) : time_broken->tm_mday;
      end_time.tm_hour = end_hour ? atoi (end_hour) : time_broken->tm_hour;
      end_time.tm_min = end_minute ? atoi (end_minute) : time_broken->tm_min;
    }

  g_string_append_printf (xml,
                          "<start_time>"
                          "<minute>%i</minute>"
                          "<hour>%i</hour>"
                          "<day_of_month>%i</day_of_month>"
                          "<month>%i</month>"
                          "<year>%i</year>"
                          "</start_time>",
                          start_time.tm_min, start_time.tm_hour,
                          start_time.tm_mday, start_time.tm_mon + 1,
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
                          end_time.tm_min, end_time.tm_hour, end_time.tm_mday,
                          end_time.tm_mon + 1, end_time.tm_year + 1900,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while getting the system reports. "
            "The current list of system reports is not available. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        }
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_system_reports>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
get_system_report_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       const char *url, params_t *params,
                       cmd_response_data_t *response_data)
{
  entity_t entity;
  entity_t report_entity;
  char name[501];
  gchar *gmp_command;
  const char *slave_id, *duration;

  const char *start_time;
  const char *end_time;

  if (url == NULL)
    return NULL;

  /* fan/report.png */
  if (sscanf (url, "%500[^ /]./report.png", name) == 1)
    {
      slave_id = params_value (params, "slave_id");

      duration = params_value (params, "duration");

      if (duration && strcmp (duration, ""))
        {
          gmp_command =
            g_markup_printf_escaped ("<get_system_reports"
                                     " name=\"%s\""
                                     " duration=\"%s\""
                                     " slave_id=\"%s\"/>",
                                     name, duration, slave_id ? slave_id : "0");
        }
      else
        {
          start_time = params_value (params, "start_time");
          end_time = params_value (params, "end_time");

          CHECK_VARIABLE_INVALID (start_time, "Get System Report")
          CHECK_VARIABLE_INVALID (end_time, "Get System Report")

          gmp_command = g_markup_printf_escaped ("<get_system_reports"
                                                 " name=\"%s\""
                                                 " start_time=\"%s\""
                                                 " end_time=\"%s\""
                                                 " slave_id=\"%s\"/>",
                                                 name, start_time, end_time,
                                                 slave_id ? slave_id : "0");
        }

      if (gvm_connection_sendf (connection, "%s", gmp_command) == -1)
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
              content = (char *) g_base64_decode (content_64, &content_length);

#if 1
              cmd_response_data_set_content_type (response_data,
                                                  GSAD_CONTENT_TYPE_IMAGE_PNG);
              //*content_disposition = g_strdup_printf ("attachment;
              // filename=\"xxx.png\"");
#else
              g_free (content);
              content = g_strdup ("helo");
#endif
            }

          cmd_response_data_set_content_length (response_data, content_length);
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
get_report_format (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, const char *extra_xml,
                   cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "alerts", "1");
  gmp_arguments_add (arguments, "params", "1");

  return get_one (connection, "report_format", credentials, params, extra_xml,
                  arguments, response_data);
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
get_report_format_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  return get_report_format (connection, credentials, params, NULL,
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
get_report_formats_gmp (gvm_connection_t *connection,
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
{
  return get_many (connection, "report_formats", credentials, params, NULL,
                   response_data);
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
                          cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "report_format", credentials,
                                 params, response_data);
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
import_report_format_gmp (gvm_connection_t *connection,
                          credentials_t *credentials, params_t *params,
                          cmd_response_data_t *response_data)
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
  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while importing a report format. "
        "The schedule remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while importing a report format. "
        "It is unclear whether the schedule has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
save_report_format_gmp (gvm_connection_t *connection,
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  params_t *preferences, *id_list_params, *include_id_lists;
  const char *report_format_id, *name, *summary, *enable;
  entity_t entity;

  report_format_id = params_value (params, "report_format_id");
  name = params_value (params, "name");
  summary = params_value (params, "summary");
  enable = params_value (params, "enable");

  CHECK_VARIABLE_INVALID (report_format_id, "Save Report Format");
  CHECK_VARIABLE_INVALID (name, "Save Report Format");
  CHECK_VARIABLE_INVALID (summary, "Save Report Format");
  CHECK_VARIABLE_INVALID (enable, "Save Report Format");

  id_list_params = params_values (params, "id_list:");
  include_id_lists = params_values (params, "include_id_list:");
  if (include_id_lists)
    {
      GHashTable *id_lists;
      param_t *param;
      gchar *param_name, *pref_name, *value, *old_values, *new_values;
      params_iterator_t iter;
      GHashTableIter hash_table_iter;

      id_lists =
        g_hash_table_new_full (g_str_hash, g_str_equal, g_free, g_free);

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
      while (g_hash_table_iter_next (&hash_table_iter, (void **) &pref_name,
                                     (void **) &value))
        {
          gchar *value_64;

          value_64 = strlen (value)
                       ? g_base64_encode ((guchar *) value, strlen (value))
                       : g_strdup ("");

          response = NULL;
          entity = NULL;
          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<modify_report_format"
                  " report_format_id=\"%s\">"
                  "<param>"
                  "<name>%s</name>"
                  "<value>%s</value>"
                  "</param>"
                  "</modify_report_format>",
                  report_format_id, pref_name, value_64);
          g_free (value_64);
          switch (ret)
            {
            case 0:
              break;
            case 1:
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while saving a Report Format. "
                "The Report Format was not saved. "
                "Diagnostics: Failure to send command to manager daemon.",
                response_data);
            case 2:
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while saving a Report Format. "
                "It is unclear whether the Report Format has been saved or "
                "not. "
                "Diagnostics: Failure to receive response from manager daemon.",
                response_data);
            case -1:
            default:
              cmd_response_data_set_status_code (
                response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while saving a Report Format. "
                "It is unclear whether the Report Format has been saved or "
                "not. "
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
          char **splits;
          /* OID:PrefID:PrefType:PrefName value */
          splits = g_strsplit (param_name, ":", 4);
          if (splits && splits[0] && splits[1] && splits[2] && splits[3])
            {
              gchar *value;

              value =
                param->value_size
                  ? g_base64_encode ((guchar *) param->value, param->value_size)
                  : g_strdup ("");

              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials, &response, &entity,
                          response_data,
                          "<modify_report_format"
                          " report_format_id=\"%s\">"
                          "<param>"
                          "<name>%s</name>"
                          "<value>%s</value>"
                          "</param>"
                          "</modify_report_format>",
                          report_format_id, splits[3], value);
              g_free (value);
              switch (ret)
                {
                case 0:
                  break;
                case 1:
                  cmd_response_data_set_status_code (
                    response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                  g_strfreev (splits);
                  return gsad_message (
                    credentials, "Internal error", __func__, __LINE__,
                    "An internal error occurred while saving a Report Format. "
                    "The Report Format was not saved. "
                    "Diagnostics: Failure to send command to manager daemon.",
                    response_data);
                case 2:
                  cmd_response_data_set_status_code (
                    response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                  g_strfreev (splits);
                  return gsad_message (
                    credentials, "Internal error", __func__, __LINE__,
                    "An internal error occurred while saving a Report Format. "
                    "It is unclear whether the Report Format has been saved or "
                    "not. "
                    "Diagnostics: Failure to receive response from manager "
                    "daemon.",
                    response_data);
                case -1:
                default:
                  cmd_response_data_set_status_code (
                    response_data, MHD_HTTP_INTERNAL_SERVER_ERROR);
                  g_strfreev (splits);
                  return gsad_message (
                    credentials, "Internal error", __func__, __LINE__,
                    "An internal error occurred while saving a Report Format. "
                    "It is unclear whether the Report Format has been saved or "
                    "not. "
                    "Diagnostics: Internal Error.",
                    response_data);
                }

              /* TODO Check if succeeded.  response_from_entity_if_failed? */
            }
          g_strfreev (splits);
        }
    }

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<modify_report_format"
              " report_format_id=\"%s\">"
              "<name>%s</name>"
              "<summary>%s</summary>"
              "<active>%s</active>"
              "</modify_report_format>",
              report_format_id, name, summary, enable);

  switch (ret)
    {
    case 0:
      break;
    case -1:
      return response;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a Report Format. "
        "The Report Format was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a Report Format. "
        "It is unclear whether the Report Format has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
run_wizard_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  const char *name;
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
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
                           param_name, param->value);
    }

  g_string_append (run, "</params></run_wizard>");

  response = NULL;
  entity = NULL;
  ret =
    gmp (connection, credentials, &response, &entity, response_data, run->str);
  g_string_free (run, TRUE);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while running a wizard. "
        "The wizard did not start. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while running a wizard. "
        "It is unclear whether the wizard started or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
    {                                                                         \
      if (gvm_connection_sendf (connection,                                   \
                                "<" command " filter=\"rows=-1 sort=name\""   \
                                " trash=\"1\"/>")                             \
          == -1)                                                              \
        {                                                                     \
          g_string_free (xml, TRUE);                                          \
          cmd_response_data_set_status_code (response_data,                   \
                                             MHD_HTTP_INTERNAL_SERVER_ERROR); \
          return gsad_message (                                               \
            credentials, "Internal error", __func__, __LINE__,                \
            "An internal error occurred while getting " name                  \
            " list for trash."                                                \
            "Diagnostics: Failure to send command to"                         \
            " manager daemon.",                                               \
            response_data);                                                   \
        }                                                                     \
                                                                              \
      if (read_string_c (connection, &xml))                                   \
        {                                                                     \
          g_string_free (xml, TRUE);                                          \
          cmd_response_data_set_status_code (response_data,                   \
                                             MHD_HTTP_INTERNAL_SERVER_ERROR); \
          return gsad_message (                                               \
            credentials, "Internal error", __func__, __LINE__,                \
            "An internal error occurred while getting " name " list."         \
            "Diagnostics: Failure to receive response from"                   \
            " manager daemon.",                                               \
            response_data);                                                   \
        }                                                                     \
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
get_trash (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t *response_data)
{
  GString *xml;

  xml = g_string_new ("<get_trash>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

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

  GET_TRASH_RESOURCE ("GET_TICKETS", "get_tickets", "tickets");

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_trash>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
get_trash_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return get_trash (connection, credentials, params, NULL, response_data);
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
                       cmd_response_data_t *response_data)
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
          const char *changed_value = params_value (changed, uuid);
          if (changed_value == NULL
              || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
            {
              gchar *base64;
              if (param->value)
                base64 = g_base64_encode ((guchar *) param->value,
                                          strlen (param->value));
              else
                base64 = g_strdup ("");
              if (gvm_connection_sendf_xml (connection,
                                            "<modify_setting setting_id=\"%s\">"
                                            "<value>%s</value>"
                                            "</modify_setting>",
                                            uuid, base64))
                {
                  g_free (base64);
                  return -1;
                }

              g_free (base64);

              entity = NULL;
              xml_string_append (xml, "<save_setting id=\"%s\">", uuid);
              if (read_entity_and_string_c (connection, &entity, &xml))
                {
                  free_entity (entity);
                  return -1;
                }
              xml_string_append (xml, "</save_setting>");
              if (!gmp_success (entity))
                {
                  set_http_status_from_entity (entity, response_data);
                  if (modify_failed_flag)
                    *modify_failed_flag = 1;
                }
              free_entity (entity);
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
save_my_settings_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, const gchar *accept_language,
                      cmd_response_data_t *response_data)
{
  const char *lang, *text, *old_passwd, *passwd, *max;
  const char *details_fname, *list_fname, *report_fname;
  gchar *lang_64, *text_64, *max_64, *fname_64;
  GString *xml;
  entity_t entity;
  params_t *changed, *defaults, *filters;
  int modify_failed = 0;
  const char *changed_value;
  gboolean user_changed = 0;

  user_t *user = credentials_get_user (credentials);

  changed = params_values (params, "settings_changed:");

  text = params_value (params, "text");
  old_passwd = params_value (params, "old_password");
  passwd = params_value (params, "password");
  max = params_value (params, "max");
  lang = params_value (params, "lang");
  details_fname = params_value (params, "details_fname");
  list_fname = params_value (params, "list_fname");
  report_fname = params_value (params, "report_fname");

  CHECK_VARIABLE_INVALID (text, "Save Settings")
  CHECK_VARIABLE_INVALID (text, "Save Settings")
  CHECK_VARIABLE_INVALID (old_passwd, "Save Settings")
  CHECK_VARIABLE_INVALID (max, "Save Settings")
  CHECK_VARIABLE_INVALID (lang, "Save Settings")
  CHECK_VARIABLE_INVALID (details_fname, "Save Settings")
  CHECK_VARIABLE_INVALID (list_fname, "Save Settings")
  CHECK_VARIABLE_INVALID (report_fname, "Save Settings")

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
      auth_opts.username = user_get_username (user);
      auth_opts.password = old_passwd;
      switch (gmp_authenticate_info_ext_c (connection, auth_opts))
        {
        case 0:
          break;
        case 1:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "The settings remains the same. "
            "Diagnostics: Manager closed connection during authenticate.",
            response_data);
        case 2:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Invalid Password", __func__, __LINE__,
            "You tried to change your password, but the old"
            " password was not provided or was incorrect. "
            " Please enter the correct old password or remove"
            " old and new passwords to apply any other changes"
            " of your settings.",
            response_data);
        default:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "The settings remains the same. "
            "Diagnostics: Internal Error.",
            response_data);
        }

      passwd_64 = g_base64_encode ((guchar *) passwd, strlen (passwd));

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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        }
      xml_string_append (xml, "</save_setting>");

      if (gmp_success (entity) == 1)
        {
          user_set_password (user, passwd);
          session_remove_other_sessions (user_get_token (user), user);
          user_changed = 1;
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
      text_64 = g_base64_encode ((guchar *) text, strlen (text));

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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        }
      xml_string_append (xml, "</save_setting>");

      if (gmp_success (entity) == 1)
        {
          const gchar *timezone = strlen (text) ? text : "UTC";

          user_set_timezone (user, timezone);
          user_changed = 1;

          /* Set the timezone, so that the ENVELOPE/TIME
           * uses the right timezone. */

          if (setenv ("TZ", timezone, 1) == -1)
            {
              g_critical ("%s: failed to set TZ\n", __func__);
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
      max_64 = g_base64_encode ((guchar *) max, strlen (max));

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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (max_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "5f5a8712-8017-11e1-8556-406186ea4fc5");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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

  /* Send resource details export file name format. */
  changed_value = params_value (changed, "details_fname");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      fname_64 =
        g_base64_encode ((guchar *) details_fname, strlen (details_fname));

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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (fname_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "a6ac88c5-729c-41ba-ac0a-deea4a3441f2");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      fname_64 = g_base64_encode ((guchar *) list_fname, strlen (list_fname));

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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (fname_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "a6ac88c5-729c-41ba-ac0a-deea4a3441f2");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      fname_64 =
        g_base64_encode ((guchar *) report_fname, strlen (report_fname));

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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (fname_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "e1a2ae0b-736e-4484-b029-330c9e15b900");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
      lang_64 = g_base64_encode ((guchar *) lang, strlen (lang));

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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (lang_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "6765549a-934e-11e3-b358-406186ea4fc5");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        }
      xml_string_append (xml, "</save_setting>");
      if (gmp_success (entity) == 1)
        {
          user_set_language (user, lang);
          user_changed = 1;
        }
      else
        {
          set_http_status_from_entity (entity, response_data);
          modify_failed = 1;
        }
    }

  /* Send default resources */

  defaults = params_values (params, "settings_default:");
  if (send_settings_filters (connection, defaults, changed, xml, &modify_failed,
                             response_data))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving settings. "
        "It is unclear whether all the settings were saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  /* Send Dynamic Severity setting. */

  changed_value = params_value (changed, "dynamic_severity");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text = params_value (params, "dynamic_severity");
      text_64 = (text ? g_base64_encode ((guchar *) text, strlen (text))
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "77ec2444-e7f2-4a80-a59b-f4237782d93f");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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

  /* Send Default Severity setting. */
  changed_value = params_value (changed, "default_severity");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text = params_value (params, "default_severity");
      text_64 = (text ? g_base64_encode ((guchar *) text, strlen (text))
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "7eda49c5-096c-4bef-b1ab-d080d87300df");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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

  /* Send Auto Cache Rebuild setting. */

  changed_value = params_value (changed, "auto_cache_rebuild");
  if (changed_value == NULL
      || (strcmp (changed_value, "") && strcmp (changed_value, "0")))
    {
      text = params_value (params, "auto_cache_rebuild");
      text_64 = (text ? g_base64_encode ((guchar *) text, strlen (text))
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred while saving settings. "
            "It is unclear whether all the settings were saved. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        }
      g_free (text_64);

      entity = NULL;
      xml_string_append (xml, "<save_setting id=\"%s\">",
                         "a09285b0-2d47-49b6-a4ef-946ee71f1d5c");
      if (read_entity_and_string_c (connection, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          gvm_connection_close (connection);
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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

  if (user_changed)
    {
      session_add_user (user_get_token (user), user);
    }

  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
get_group (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, const char *extra_xml,
           cmd_response_data_t *response_data)
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
get_group_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return get_group (connection, credentials, params, NULL, response_data);
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
get_groups_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "groups", credentials, params, NULL,
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
delete_group_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "group", credentials, params,
                                 response_data);
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
create_group_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response, *command, *specials_element;
  const char *name, *comment, *users, *grant_full;
  entity_t entity;
  GString *xml;
  int ret;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  grant_full = params_value (params, "grant_full");
  users = params_value (params, "users");

  CHECK_VARIABLE_INVALID (name, "Create Group");
  CHECK_VARIABLE_INVALID (comment, "Create Group");
  CHECK_VARIABLE_INVALID (users, "Create Group");

  /* Create the group. */

  xml = g_string_new ("");

  xml_string_append (xml,
                     "<name>%s</name>"
                     "<comment>%s</comment>"
                     "<users>%s</users>",
                     name, comment, users);

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
                             xml->str, specials_element);

  g_string_free (xml, TRUE);
  g_free (specials_element);

  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new group. "
        "No new group was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new group. "
        "It is unclear whether the group has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
export_group_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
export_groups_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
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
save_group_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *group_id, *name, *comment, *users;
  entity_t entity;

  group_id = params_value (params, "group_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_VARIABLE_INVALID (group_id, "Save Group");
  CHECK_VARIABLE_INVALID (name, "Save Group");
  CHECK_VARIABLE_INVALID (comment, "Save Group");
  CHECK_VARIABLE_INVALID (users, "Save Group");

  /* Modify the Group. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<modify_group group_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<users>%s</users>"
              "</modify_group>",
              group_id, name, comment, users);

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a group. "
        "The group was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a group. "
        "It is unclear whether the group has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_permission (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, const char *extra_xml,
                cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "alerts", "1");

  return get_one (connection, "permission", credentials, params, extra_xml,
                  arguments, response_data);
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
get_permission_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  return get_permission (connection, credentials, params, NULL, response_data);
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
get_permissions_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "permissions", credentials, params, NULL,
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
delete_permission_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "permission", credentials, params,
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
create_permission_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *resource_id, *resource_type;
  const char *subject_id, *subject_type;
  entity_t entity;

  name = params_value (params, "permission");
  comment = params_value (params, "comment");
  resource_id = params_value (params, "id_or_empty");
  resource_type = params_value (params, "optional_resource_type");
  subject_type = params_value (params, "subject_type");

  CHECK_VARIABLE_INVALID (name, "Create Permission");
  CHECK_VARIABLE_INVALID (comment, "Create Permission");
  if (params_given (params, "id_or_empty"))
    CHECK_VARIABLE_INVALID (resource_id, "Create Permission");
  CHECK_VARIABLE_INVALID (subject_type, "Create Permission");
  if (params_given (params, "optional_resource_type"))
    CHECK_VARIABLE_INVALID (resource_type, "Create Permission");

  if (str_equal (subject_type, "user"))
    subject_id = params_value (params, "permission_user_id");
  else if (str_equal (subject_type, "group"))
    subject_id = params_value (params, "permission_group_id");
  else if (str_equal (subject_type, "role"))
    subject_id = params_value (params, "permission_role_id");
  else
    subject_id = NULL;

  CHECK_VARIABLE_INVALID (subject_id, "Create Permission");

  /* Create the permission(s). */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<create_permission>"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<resource id=\"%s\">"
              "<type>%s</type>"
              "</resource>"
              "<subject id=\"%s\"><type>%s</type></subject>"
              "</create_permission>",
              name, comment ? comment : "", resource_id ? resource_id : "",
              resource_type ? resource_type : "", subject_id, subject_type);

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a permission. "
        "The permission was not created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a permission. "
        "It is unclear whether the permission has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a permission. "
        "It is unclear whether the permission has been created or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  if (entity_attribute (entity, "id"))
    params_add (params, "permission_id", entity_attribute (entity, "id"));

  html = response_from_entity (connection, credentials, params, entity,
                               "Create Permission", response_data);

  free_entity (entity);
  g_free (response);
  return html;
}

#define CHECK_GMPF_RET                                                      \
  switch (ret)                                                              \
    {                                                                       \
    case 0:                                                                 \
    case -1:                                                                \
      break;                                                                \
    case 1:                                                                 \
      cmd_response_data_set_status_code (response_data,                     \
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);   \
      return gsad_message (                                                 \
        credentials, "Internal error", __func__, __LINE__,                  \
        "An internal error occurred while creating a permission. "          \
        "The permission was not created. "                                  \
        "Diagnostics: Failure to send command to manager daemon.",          \
        response_data);                                                     \
    case 2:                                                                 \
      cmd_response_data_set_status_code (response_data,                     \
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);   \
      return gsad_message (                                                 \
        credentials, "Internal error", __func__, __LINE__,                  \
        "An internal error occurred while creating a permission. "          \
        "It is unclear whether the permission has been created or not. "    \
        "Diagnostics: Failure to receive response from manager daemon.",    \
        response_data);                                                     \
    default:                                                                \
      cmd_response_data_set_status_code (response_data,                     \
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);   \
      return gsad_message (                                                 \
        credentials, "Internal error", __func__, __LINE__,                  \
        "An internal error occurred while creating a permission. "          \
        "It is unclear whether the permission has been created or not. "    \
        "Diagnostics: Internal Error.",                                     \
        response_data);                                                     \
    }                                                                       \
  if (gmp_success (entity))                                                 \
    {                                                                       \
      successes++;                                                          \
      free_entity (entity);                                                 \
      g_free (response);                                                    \
    }                                                                       \
  else                                                                      \
    {                                                                       \
      html = response_from_entity (connection, credentials, params, entity, \
                                   "Create Permissions", response_data);    \
      free_entity (entity);                                                 \
      g_free (response);                                                    \
      return html;                                                          \
    }

#define INCLUDE_RELATED_CURRENT_RESOURCE_ONLY 0
#define INCLUDE_RELATED_ALL_RESOURCES 1
#define INCLUDE_RELATED_RESOURCES_ONLY 2

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
create_permissions_gmp (gvm_connection_t *connection,
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response, *summary_response;
  int successes;
  const char *permission, *comment, *resource_id, *resource_type;
  const char *subject_id, *subject_type;
  const char *permission_resource_type;
  int include_related;

  entity_t entity;

  permission = params_value (params, "permission_type");
  comment = params_value (params, "comment");
  resource_id = params_value (params, "resource_id");
  resource_type = params_value (params, "resource_type");
  subject_type = params_value (params, "subject_type");

  CHECK_VARIABLE_INVALID (params_value (params, "include_related"),
                          "Create Permission");
  CHECK_VARIABLE_INVALID (permission, "Create Permission");
  CHECK_VARIABLE_INVALID (comment, "Create Permission");
  CHECK_VARIABLE_INVALID (resource_id, "Create Permission");
  CHECK_VARIABLE_INVALID (subject_type, "Create Permission");
  CHECK_VARIABLE_INVALID (resource_type, "Create Permission");

  if (str_equal (resource_type, "host") || str_equal (resource_type, "os"))
    {
      permission_resource_type = "asset";
    }
  else
    permission_resource_type = resource_type;

  include_related = atoi (params_value (params, "include_related"));

  if (str_equal (subject_type, "user"))
    subject_id = params_value (params, "permission_user_id");
  else if (str_equal (subject_type, "group"))
    subject_id = params_value (params, "permission_group_id");
  else if (str_equal (subject_type, "role"))
    subject_id = params_value (params, "permission_role_id");
  else
    subject_id = NULL;

  CHECK_VARIABLE_INVALID (subject_id, "Create Permission");

  successes = 0;

  /* Create the permission(s). */

  // Main resource permissions
  if (include_related != INCLUDE_RELATED_RESOURCES_ONLY)
    {
      if (str_equal (permission, "read") || str_equal (permission, "write"))
        {
          response = NULL;
          entity = NULL;
          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<create_permission>"
                  "<name>get_%ss</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\">"
                  "</resource>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>",
                  permission_resource_type, comment ? comment : "", resource_id,
                  subject_id, subject_type);

          CHECK_GMPF_RET
        }

      if ((str_equal (permission, "write"))
          && !str_equal (permission_resource_type, "result")
          && !str_equal (permission_resource_type, "report"))
        {
          // create modify permission for resource
          response = NULL;
          entity = NULL;
          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<create_permission>"
                  "<name>modify_%s</name>"
                  "<comment>%s</comment>"
                  "<resource id=\"%s\">"
                  "</resource>"
                  "<subject id=\"%s\"><type>%s</type></subject>"
                  "</create_permission>",
                  permission_resource_type, comment ? comment : "", resource_id,
                  subject_id, subject_type);

          CHECK_GMPF_RET

          if (str_equal (permission_resource_type, "task"))
            {
              // create start_task, stop_task and resume_task permission
              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials, &response, &entity,
                          response_data,
                          "<create_permission>"
                          "<name>start_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          permission_resource_type, comment ? comment : "",
                          resource_id, subject_id, subject_type);

              CHECK_GMPF_RET

              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials, &response, &entity,
                          response_data,
                          "<create_permission>"
                          "<name>stop_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          permission_resource_type, comment ? comment : "",
                          resource_id, subject_id, subject_type);

              CHECK_GMPF_RET

              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials, &response, &entity,
                          response_data,
                          "<create_permission>"
                          "<name>resume_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          permission_resource_type, comment ? comment : "",
                          resource_id, subject_id, subject_type);

              CHECK_GMPF_RET
            }

          if (str_equal (permission_resource_type, "alert"))
            {
              // create test permission
              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials, &response, &entity,
                          response_data,
                          "<create_permission>"
                          "<name>test_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          permission_resource_type, comment ? comment : "",
                          resource_id, subject_id, subject_type);

              CHECK_GMPF_RET
            }

          if (str_equal (permission_resource_type, "report_format")
              || str_equal (permission_resource_type, "scanner"))
            {
              // create verify permission
              response = NULL;
              entity = NULL;
              ret = gmpf (connection, credentials, &response, &entity,
                          response_data,
                          "<create_permission>"
                          "<name>verify_%s</name>"
                          "<comment>%s</comment>"
                          "<resource id=\"%s\">"
                          "</resource>"
                          "<subject id=\"%s\"><type>%s</type></subject>"
                          "</create_permission>",
                          permission_resource_type, comment ? comment : "",
                          resource_id, subject_id, subject_type);

              CHECK_GMPF_RET
            }
        }
    }

  // Related permissions
  if (include_related != INCLUDE_RELATED_CURRENT_RESOURCE_ONLY)
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
              char *related_type;

              if (str_equal (param->value, "host")
                  || str_equal (param->value, "os"))
                {
                  related_type = "asset";
                }
              else
                related_type = param->value;

              if (str_equal (permission, "read") == 0
                  || str_equal (permission, "write") == 0)
                {
                  response = NULL;
                  entity = NULL;
                  ret = gmpf (connection, credentials, &response, &entity,
                              response_data,
                              "<create_permission>"
                              "<name>get_%ss</name>"
                              "<comment>%s</comment>"
                              "<resource id=\"%s\">"
                              "</resource>"
                              "<subject id=\"%s\"><type>%s</type></subject>"
                              "</create_permission>",
                              related_type, comment ? comment : "", related_id,
                              subject_id, subject_type);

                  CHECK_GMPF_RET
                }

              if ((str_equal (permission, "write"))
                  && !str_equal (related_type, "result")
                  && !str_equal (related_type, "report"))
                {
                  response = NULL;
                  entity = NULL;
                  ret = gmpf (connection, credentials, &response, &entity,
                              response_data,
                              "<create_permission>"
                              "<name>modify_%s</name>"
                              "<comment>%s</comment>"
                              "<resource id=\"%s\">"
                              "</resource>"
                              "<subject id=\"%s\"><type>%s</type></subject>"
                              "</create_permission>",
                              related_type, comment ? comment : "", related_id,
                              subject_id, subject_type);

                  CHECK_GMPF_RET

                  if (str_equal (related_type, "task"))
                    {
                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials, &response, &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>start_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type, comment ? comment : "",
                                  related_id, subject_id, subject_type);

                      CHECK_GMPF_RET

                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials, &response, &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>stop_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type, comment ? comment : "",
                                  related_id, subject_id, subject_type);

                      CHECK_GMPF_RET

                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials, &response, &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>resume_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type, comment ? comment : "",
                                  related_id, subject_id, subject_type);

                      CHECK_GMPF_RET
                    }

                  if (str_equal (related_type, "alert"))
                    {
                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials, &response, &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>test_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type, comment ? comment : "",
                                  related_id, subject_id, subject_type);

                      CHECK_GMPF_RET
                    }

                  if (str_equal (related_type, "report_format")
                      || str_equal (related_type, "scanner"))
                    {
                      response = NULL;
                      entity = NULL;
                      ret = gmpf (connection, credentials, &response, &entity,
                                  response_data,
                                  "<create_permission>"
                                  "<name>verify_%s</name>"
                                  "<comment>%s</comment>"
                                  "<resource id=\"%s\">"
                                  "</resource>"
                                  "<subject id=\"%s\"><type>%s</type></subject>"
                                  "</create_permission>",
                                  related_type, comment ? comment : "",
                                  related_id, subject_id, subject_type);

                      CHECK_GMPF_RET
                    }
                }
            }
        }
    }

  summary_response =
    g_strdup_printf ("Successfully created %i permissions", successes);

  html = action_result (connection, credentials, params, response_data,
                        "Create Permissions", summary_response, NULL, NULL);
  return html;
}

#undef CHECK_GMPF_RET

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
export_permission_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
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
                        credentials_t *credentials, params_t *params,
                        cmd_response_data_t *response_data)
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
save_permission_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
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

  CHECK_VARIABLE_INVALID (permission_id, "Save Permission");
  CHECK_VARIABLE_INVALID (name, "Save Permission");
  CHECK_VARIABLE_INVALID (comment, "Save Permission");
  CHECK_VARIABLE_INVALID (resource_id, "Save Permission");
  CHECK_VARIABLE_INVALID (subject_type, "Save Permission");
  if (params_given (params, "optional_resource_type"))
    CHECK_VARIABLE_INVALID (resource_type, "Save Permission");

  if (strcmp (subject_type, "user") == 0)
    subject_id = params_value (params, "user_id");
  else if (strcmp (subject_type, "group") == 0)
    subject_id = params_value (params, "group_id");
  else if (strcmp (subject_type, "role") == 0)
    subject_id = params_value (params, "role_id");
  else
    subject_id = NULL;
  CHECK_VARIABLE_INVALID (subject_id, "Save Permission");

  /* Modify the permission. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
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
              permission_id, name, comment, subject_id, subject_type,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while modifying a permission. "
        "The permission was not modified. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while modifying a permission. "
        "It is unclear whether the permission has been modified or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
create_port_list_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *name, *comment, *port_range, *from_file;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  port_range = params_value (params, "port_range");
  from_file = params_value (params, "from_file");

  CHECK_VARIABLE_INVALID (name, "Create Port List");
  CHECK_VARIABLE_INVALID (comment, "Create Port List");
  CHECK_VARIABLE_INVALID (port_range, "Create Port List");
  CHECK_VARIABLE_INVALID (from_file, "Create Port List");

  /* Create the port_list. */

  switch (gmpf (
    connection, credentials, &response, &entity, response_data,
    "<create_port_list>"
    "<name>%s</name>"
    "<port_range>%s</port_range>"
    "<comment>%s</comment>"
    "</create_port_list>",
    name, strcmp (from_file, "0") ? params_value (params, "file") : port_range,
    comment ? comment : ""))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new port list. "
        "No new port list was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new port list. "
        "It is unclear whether the port list has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
create_port_range_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *port_list_id, *start, *end, *type;
  entity_t entity;

  port_list_id = params_value (params, "port_list_id");
  start = params_value (params, "port_range_start");
  end = params_value (params, "port_range_end");
  type = params_value (params, "port_type");

  CHECK_VARIABLE_INVALID (port_list_id, "Create Port Range");
  CHECK_VARIABLE_INVALID (start, "Create Port Range");
  CHECK_VARIABLE_INVALID (end, "Create Port Range");
  CHECK_VARIABLE_INVALID (type, "Create Port Range");

  /* Create the port range. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<create_port_range>"
              "<port_list id=\"%s\"/>"
              "<start>%s</start>"
              "<end>%s</end>"
              "<type>%s</type>"
              "</create_port_range>",
              port_list_id, start, end, type);

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a Port Range. "
        "The Port Range was not created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a Port Range. "
        "It is unclear whether the Port Range has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_port_list (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, const char *extra_xml,
               cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "targets", "1");
  gmp_arguments_add (arguments, "details", "1");

  return get_one (connection, "port_list", credentials, params, extra_xml,
                  arguments, response_data);
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
get_port_list_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return get_port_list (connection, credentials, params, NULL, response_data);
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
get_port_lists_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "port_lists", credentials, params, NULL,
                   response_data);
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
save_port_list_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *port_list_id, *name, *comment;
  entity_t entity;

  port_list_id = params_value (params, "port_list_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");

  CHECK_VARIABLE_INVALID (port_list_id, "Save Port List");
  CHECK_VARIABLE_INVALID (name, "Save Port List");
  CHECK_VARIABLE_INVALID (comment, "Save Port List");

  /* Modify the Port List. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<modify_port_list port_list_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "</modify_port_list>",
              port_list_id, name, comment);

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a Port List. "
        "The Port List was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a Port List. "
        "It is unclear whether the Port List has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_port_list_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "port_list", credentials, params,
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
delete_port_range_gmp (gvm_connection_t *connection, credentials_t *credentials,
                       params_t *params, cmd_response_data_t *response_data)
{
  return delete_resource (connection, "port_range", credentials, params, TRUE,
                          response_data);
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
import_port_list_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
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
  ret =
    gmp (connection, credentials, &response, &entity, response_data, command);
  g_free (command);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while importing a port_list. "
        "The schedule remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while importing a port_list. "
        "It is unclear whether the schedule has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_role_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "role", credentials, params,
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
create_role_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  char *ret;
  gchar *response;
  const char *name, *comment, *users;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_VARIABLE_INVALID (name, "Create Role");
  CHECK_VARIABLE_INVALID (comment, "Create Role");
  CHECK_VARIABLE_INVALID (users, "Create Role");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<create_role>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<users>%s</users>"
                "</create_role>",
                name, comment, users))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new role. "
        "No new role was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new role. "
        "It is unclear whether the role has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_role (gvm_connection_t *connection, credentials_t *credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t *response_data)
{
  return get_one (connection, "role", credentials, params, extra_xml, NULL,
                  response_data);
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
get_role_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t *response_data)
{
  return get_role (connection, credentials, params, NULL, response_data);
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
get_roles_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "roles", credentials, params, NULL,
                   response_data);
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
export_role_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
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
export_roles_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
save_role_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *role_id, *name, *comment, *users;
  entity_t entity;

  role_id = params_value (params, "role_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_VARIABLE_INVALID (role_id, "Save Role");
  CHECK_VARIABLE_INVALID (name, "Save Role");
  CHECK_VARIABLE_INVALID (comment, "Save Role");
  CHECK_VARIABLE_INVALID (users, "Save Role");

  /* Modify the Role. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<modify_role role_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<users>%s</users>"
              "</modify_role>",
              role_id, name, comment, users);

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a role. "
        "The role was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a role. "
        "It is unclear whether the role has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_feeds_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  entity_t entity;
  char *text = NULL;
  gchar *response;
  time_t now;
  struct tm *tm;
  gchar current_timestamp[30];

  if (gvm_connection_sendf (connection, "<get_feeds/>") == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the feed list. "
        "The current list of feeds is not available. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  if (read_entity_and_text_c (connection, &entity, &text))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the feed. "
        "The current list of feeds is not available. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  time (&now);
  tm = gmtime (&now);
  if (tm == NULL
      || (strftime (current_timestamp, 29, "%Y-%m-%dT%H:%M:%S", tm) == 0))
    {
      current_timestamp[0] = '\0';
    }

  response = g_strdup_printf ("<get_feeds>"
                              "%s"
                              "<current_time_utc>%s</current_time_utc>"
                              "</get_feeds>",
                              text, current_timestamp);

  g_free (text);

  return envelope_gmp (connection, credentials, params, response,
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
static char *
sync_feed (gvm_connection_t *connection, credentials_t *credentials,
           params_t *params, const char *sync_cmd, const char *action,
           const char *feed_name, cmd_response_data_t *response_data)
{
  entity_t entity;
  char *text = NULL;
  gchar *html, *msg;

  if (gvm_connection_sendf (connection, "<%s/>", sync_cmd) == -1)
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);

      msg = g_strdup_printf (
        "An internal error occurred while synchronizing with %s. "
        "Feed synchronization is currently not available. "
        "Diagnostics: Failure to send command to manager daemon.",
        feed_name);
      html = gsad_message (credentials, "Internal error", __func__, __LINE__,
                           msg, response_data);
      g_free (msg);
      return html;
    }

  if (read_entity_and_text_c (connection, &entity, &text))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);

      msg = g_strdup_printf (
        "An internal error occurred while synchronizing with %s. "
        "Feed synchronization is currently not available. "
        "Diagnostics: Failure to receive response from manager daemon.",
        feed_name);
      html = gsad_message (credentials, "Internal error", __func__, __LINE__,
                           msg, response_data);
      g_free (msg);
      return html;
    }

  html = response_from_entity (connection, credentials, params, entity, action,
                               response_data);

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
sync_feed_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return sync_feed (connection, credentials, params, "sync_feed",
                    "Synchronize Feed", "the NVT feed", response_data);
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
sync_scap_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return sync_feed (connection, credentials, params, "sync_scap",
                    "Synchronize Feed", "the SCAP feed", response_data);
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
sync_cert_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return sync_feed (connection, credentials, params, "sync_cert",
                    "Synchronize CERT Feed", "the CERT feed", response_data);
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
get_filter (gvm_connection_t *connection, credentials_t *credentials,
            params_t *params, const char *extra_xml,
            cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "alerts", "1");

  return get_one (connection, "filter", credentials, params, extra_xml,
                  arguments, response_data);
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
get_filter_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return get_filter (connection, credentials, params, NULL, response_data);
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
get_filters_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "filters", credentials, params, NULL,
                   response_data);
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
create_filter_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  gchar *html, *response;
  const char *name, *comment, *term, *type;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  term = params_value (params, "term");
  type = params_value (params, "resource_type");

  CHECK_VARIABLE_INVALID (name, "Create Filter");
  CHECK_VARIABLE_INVALID (comment, "Create Filter");
  CHECK_VARIABLE_INVALID (term, "Create Filter");
  CHECK_VARIABLE_INVALID (type, "Create Filter");

  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<create_filter>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<term>%s</term>"
                "<type>%s</type>"
                "</create_filter>",
                name, comment, term, type))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new alert. "
        "No new alert was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new alert. "
        "It is unclear whether the alert has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new alert. "
        "It is unclear whether the alert has been created or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

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
delete_filter_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "filter", credentials, params,
                                 response_data);
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
export_filter_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
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
export_filters_gmp (gvm_connection_t *connection, credentials_t *credentials,
                    params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "filter", credentials, params, response_data);
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
save_filter_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  entity_t entity;
  gchar *html, *response;
  const char *filter_id, *name, *comment, *term, *type;

  filter_id = params_value (params, "filter_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  term = params_value (params, "term");
  type = params_value (params, "resource_type");

  CHECK_VARIABLE_INVALID (filter_id, "Save Filter");
  CHECK_VARIABLE_INVALID (name, "Save Filter");
  CHECK_VARIABLE_INVALID (comment, "Save Filter");
  CHECK_VARIABLE_INVALID (term, "Save Filter");
  CHECK_VARIABLE_INVALID (type, "Save Filter");

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
                                    filter_id, name, comment, term, type);

    if (ret == -1)
      {
        cmd_response_data_set_status_code (response_data,
                                           MHD_HTTP_INTERNAL_SERVER_ERROR);
        return gsad_message (
          credentials, "Internal error", __func__, __LINE__,
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
        return gsad_message (
          credentials, "Internal error", __func__, __LINE__,
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
export_schedule_gmp (gvm_connection_t *connection, credentials_t *credentials,
                     params_t *params, cmd_response_data_t *response_data)
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
export_schedules_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
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
  const char *schedule_id, *name, *comment, *timezone, *icalendar;
  char *ret;

  schedule_id = params_value (params, "schedule_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  icalendar = params_value (params, "icalendar");
  timezone = params_value (params, "timezone");

  CHECK_VARIABLE_INVALID (schedule_id, "Save Schedule");
  CHECK_VARIABLE_INVALID (name, "Save Schedule");
  CHECK_VARIABLE_INVALID (comment, "Save Schedule");
  CHECK_VARIABLE_INVALID (icalendar, "Save Schedule");
  CHECK_VARIABLE_INVALID (timezone, "Save Schedule");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<modify_schedule schedule_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<timezone>%s</timezone>"
                "<icalendar>%s</icalendar>"
                "</modify_schedule>",
                schedule_id, name ? name : "", comment ? comment : "", timezone,
                icalendar))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a schedule. "
        "The schedule remains the same. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a schedule. "
        "It is unclear whether the schedule has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_user_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "user", credentials, params,
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
get_user (gvm_connection_t *connection, credentials_t *credentials,
          params_t *params, const char *extra_xml,
          cmd_response_data_t *response_data)
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred getting the auth list. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        case 2:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred getting the auth list. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        default:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
get_user_gmp (gvm_connection_t *connection, credentials_t *credentials,
              params_t *params, cmd_response_data_t *response_data)
{
  return get_user (connection, credentials, params, NULL, response_data);
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
get_users_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "users", credentials, params, NULL,
                   response_data);
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
create_user_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
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

  CHECK_VARIABLE_INVALID (name, "Create User");
  CHECK_VARIABLE_INVALID (hosts, "Create User");
  CHECK_VARIABLE_INVALID (hosts_allow, "Create User");
  CHECK_VARIABLE_INVALID (ifaces, "Create User");
  CHECK_VARIABLE_INVALID (ifaces_allow, "Create User");

  if (auth_method && strcmp (auth_method, "1") == 0)
    {
      CHECK_VARIABLE_INVALID (password, "Create User");
    }

  if (params_given (params, "comment"))
    {
      CHECK_VARIABLE_INVALID (comment, "Create User");
    }

  /* Create the user. */

  string = g_string_new ("<create_user>");
  buf = g_markup_printf_escaped ("<name>%s</name>"
                                 "<password>%s</password>",
                                 name, password ? password : "");

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
            g_string_append_printf (group_elements, "<group id=\"%s\"/>",
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
            g_string_append_printf (role_elements, "<role id=\"%s\"/>",
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
    g_string_append (string,
                     "<sources><source>ldap_connect</source></sources>");
  else if (auth_method && !strcmp (auth_method, "2"))
    g_string_append (string,
                     "<sources><source>radius_connect</source></sources>");

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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new user. "
        "No new user was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new user. "
        "It is unclear whether the user has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
get_vulns_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "vulns", credentials, params, NULL,
                   response_data);
}

char *
auth_settings_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *buf;
  const char *name;

  name = params_value (params, "name");

  CHECK_VARIABLE_INVALID (name, "Auth settings");

  xml = g_string_new ("");
  buf = g_markup_printf_escaped ("<auth_settings name=\"%s\">", name);
  g_string_append (xml, buf);
  g_free (buf);

  if (command_enabled (credentials, "DESCRIBE_AUTH"))
    {
      gchar *response = NULL;
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
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred getting the auth list. "
            "Diagnostics: Failure to send command to manager daemon.",
            response_data);
        case 2:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
            "An internal error occurred getting the auth list. "
            "Diagnostics: Failure to receive response from manager daemon.",
            response_data);
        default:
          cmd_response_data_set_status_code (response_data,
                                             MHD_HTTP_INTERNAL_SERVER_ERROR);
          return gsad_message (
            credentials, "Internal error", __func__, __LINE__,
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
                       g_string_free (xml, FALSE), response_data);
}

/**
 * @brief Modify a user, get all users, envelope the result.
 *
 * @param[in]  connection       Connection to manager.
 * @param[in]  credentials      Username and password for authentication.
 * @param[in]  params           Request parameters.
 * @param[out] response_data    Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_user_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response, *buf;
  const char *user_id, *login, *old_login, *modify_password, *password;
  const char *hosts, *hosts_allow, *ifaces, *ifaces_allow, *comment;
  entity_t entity;
  GString *command, *group_elements, *role_elements;
  params_t *groups, *roles;
  user_t *current_user;

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

  CHECK_VARIABLE_INVALID (user_id, "Save User");
  CHECK_VARIABLE_INVALID (modify_password, "Save User");
  CHECK_VARIABLE_INVALID (hosts, "Save User");
  CHECK_VARIABLE_INVALID (hosts_allow, "Save User");
  CHECK_VARIABLE_INVALID (ifaces, "Save User");
  CHECK_VARIABLE_INVALID (ifaces_allow, "Save User");
  CHECK_VARIABLE_INVALID (login, "Save User");
  CHECK_VARIABLE_INVALID (old_login, "Save User");

  if (modify_password && str_equal (modify_password, "1"))
    {
      // require password if modify_password is 1 (== set new password)
      CHECK_VARIABLE_INVALID (password, "Save User");
    }

  if (params_given (params, "comment"))
    {
      CHECK_VARIABLE_INVALID (comment, "Save User");
    }

  /* Modify the user. */

  command = g_string_new ("");
  buf = g_markup_printf_escaped ("<modify_user user_id=\"%s\">"
                                 "<password modify=\"%s\">"
                                 "%s</password>",
                                 user_id, modify_password,
                                 password ? password : "");
  g_string_append (command, buf);
  g_free (buf);

  current_user = credentials_get_user (credentials);

  if (login
      /* gvmd forbids users from modifying their own names. */
      && strcmp (login, user_get_username (current_user)))
    {
      buf = g_markup_printf_escaped ("<new_name>%s</new_name>", login);
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
            g_string_append_printf (group_elements, "<group id=\"%s\"/>",
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
          if (param->value && strcmp (param->value, "--")
              /* Skip "Super Admin" which may not be added to a user. */
              && strcmp (param->value, "9c5a6ec6-6fe2-11e4-8cb6-406186ea4fc5"))
            g_string_append_printf (role_elements, "<role id=\"%s\"/>",
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
  ret = gmp (connection, credentials, &response, &entity, response_data,
             command->str);
  g_string_free (command, TRUE);

  switch (ret)
    {
    case 0:
      if (gmp_success (entity) == 1)
        {
          user_t *user = session_get_user_by_username (old_login);

          if (user
              && (!str_equal (modify_password, "0")
                  || !str_equal (old_login, login)))
            {
              /* logout all other user sessions if new password was set,
                 authentication type has changed or username has changed */
              session_remove_other_sessions (user_get_token (current_user),
                                             user);
            }

          if (str_equal (old_login, user_get_username (current_user)))
            {
              /* update username of current user */
              user_set_username (current_user, login);

              if (str_equal (modify_password, "1"))
                {
                  /* update password of current user */
                  user_set_password (current_user, password);
                }
            }
        }
      break;
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a user. "
        "The user was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a user. "
        "It is unclear whether the user has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a user. "
        "It is unclear whether the user has been saved or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  if (gmp_success (entity)
      && (str_equal (modify_password, "2") || !str_equal (modify_password, "3"))
      && str_equal (old_login, user_get_username (current_user)))
    {
      free_entity (entity);
      g_free (response);

      cmd_response_data_set_status_code (response_data, MHD_HTTP_UNAUTHORIZED);
      return gsad_message (
        credentials, "Authentication Required", __func__, __LINE__,
        "Authentication method changed. Please login with ", response_data);
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
export_user_gmp (gvm_connection_t *connection, credentials_t *credentials,
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
export_users_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "user", credentials, params, response_data);
}

char *
cvss_calculator (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
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
      char *vector =
        g_strdup_printf ("AV:%c/AC:%c/Au:%c/C:%c/I:%c/A:%c", *cvss_av, *cvss_ac,
                         *cvss_au, *cvss_c, *cvss_i, *cvss_a);

      g_string_append_printf (xml,
                              "<cvss_vector>%s</cvss_vector>"
                              "<cvss_score>%.1f</cvss_score>",
                              vector,
                              get_cvss_score_from_base_metrics (vector));

      g_string_append_printf (xml,
                              "<cvss_av>%c</cvss_av><cvss_au>%c</cvss_au>"
                              "<cvss_ac>%c</cvss_ac><cvss_c>%c</cvss_c>"
                              "<cvss_i>%c</cvss_i><cvss_a>%c</cvss_a>",
                              *cvss_av, *cvss_au, *cvss_ac, *cvss_c, *cvss_i,
                              *cvss_a);

      g_free (vector);
    }
  else if (cvss_vector)
    {
      double cvss_score = get_cvss_score_from_base_metrics (cvss_vector);

      g_string_append_printf (xml,
                              "<cvss_vector>%s</cvss_vector>"
                              "<cvss_score>%.1f</cvss_score>",
                              cvss_vector, cvss_score);

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

          if (cvss_av && cvss_ac && cvss_au && cvss_c && cvss_i && cvss_a)
            g_string_append_printf (xml,
                                    "<cvss_av>%c</cvss_av><cvss_ac>%c</cvss_ac>"
                                    "<cvss_au>%c</cvss_au><cvss_c>%c</cvss_c>"
                                    "<cvss_i>%c</cvss_i><cvss_a>%c</cvss_a>",
                                    *(cvss_av + 3), *(cvss_ac + 4),
                                    *(cvss_au + 4), *(cvss_c + 3),
                                    *(cvss_i + 3), *(cvss_a + 3));
        }
    }
  else if (name && !strcmp ("vector", name))
    {
      g_string_append_printf (xml, "<cvss_score>%.1f</cvss_score>", -1.0);
    }

  g_string_append (xml, "</cvss_calculator>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
char *
save_auth_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  entity_t entity = NULL;
  char *html, *response = NULL, *truefalse;
  const char *method;

  if (params_value (params, "enable")
      && (strcmp (params_value (params, "enable"), "1") == 0))
    truefalse = "true";
  else
    truefalse = "false";

  method = params_value (params, "group");
  CHECK_VARIABLE_INVALID (method, "Save Authentication");
  if (!strcmp (method, "method:ldap_connect"))
    {
      const char *ldaphost, *authdn, *certificate;
      ldaphost = params_value (params, "ldaphost");
      authdn = params_value (params, "authdn");
      certificate = params_value (params, "certificate");

      CHECK_VARIABLE_INVALID (ldaphost, "Save Authentication");
      CHECK_VARIABLE_INVALID (authdn, "Save Authentication");
      if (params_given (params, "certificate") && strcmp (certificate, ""))
        {
          CHECK_VARIABLE_INVALID (certificate, "Save Authentication");
          /** @warning authdn shall contain a single %s, handle with care. */
          ret =
            gmpf (connection, credentials, &response, &entity, response_data,
                  "<modify_auth>"
                  "<group name=\"%s\">" AUTH_CONF_SETTING ("enable", "%s")
                    AUTH_CONF_SETTING ("ldaphost", "%s")
                      AUTH_CONF_SETTING ("authdn", "%s")
                        AUTH_CONF_SETTING ("cacert", "%s") "</group>"
                                                           "</modify_auth>",
                  method, truefalse, ldaphost, authdn, certificate);
        }
      else
        /** @warning authdn shall contain a single %s, handle with care. */
        ret = gmpf (connection, credentials, &response, &entity, response_data,
                    "<modify_auth>"
                    "<group name=\"%s\">" AUTH_CONF_SETTING ("enable", "%s")
                      AUTH_CONF_SETTING ("ldaphost", "%s")
                        AUTH_CONF_SETTING ("authdn", "%s") "</group>"
                                                           "</modify_auth>",
                    method, truefalse, ldaphost, authdn);
    }
  else if (!strcmp (method, "method:radius_connect"))
    {
      const char *radiushost, *radiuskey;
      radiushost = params_value (params, "radiushost");
      radiuskey = params_value (params, "radiuskey");

      CHECK_VARIABLE_INVALID (radiushost, "Save Authentication");
      CHECK_VARIABLE_INVALID (radiuskey, "Save Authentication");
      /** @warning authdn shall contain a single %s, handle with care. */
      ret = gmpf (connection, credentials, &response, &entity, response_data,
                  "<modify_auth>"
                  "<group name=\"%s\">" AUTH_CONF_SETTING ("enable", "%s")
                    AUTH_CONF_SETTING ("radiushost", "%s")
                      AUTH_CONF_SETTING ("radiuskey", "%s") "</group>"
                                                            "</modify_auth>",
                  method, truefalse, radiushost, radiuskey);
    }
  else
    {
      return message_invalid (connection, credentials, params, response_data,
                              "Given method was invalid", "Save auth");
    }

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving the auth settings. "
        "The settings were not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving the auth settings. "
        "It is unclear whether the settings have been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving the auth settings. "
        "It is unclear whether the settings have been saved or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  html =
    response_from_entity (connection, credentials, params, entity,
                          "Save Authentication Configuration", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get all user defined settings
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Credentials of user issuing the action.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_settings_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  GString *xml;
  gchar *command;
  const gchar *filter;

  xml = g_string_new ("<get_settings>");

  /* Get the settings. */

  filter = params_value (params, "filter");
  if (filter)
    {
      command = g_markup_printf_escaped ("<get_settings"
                                         " filter=\"%s\""
                                         " sort_field=\"name\""
                                         " sort_order=\"ascending\"/>",
                                         filter);
    }
  else
    {
      command = g_strdup ("<get_settings"
                          " sort_field=\"name\""
                          " sort_order=\"ascending\"/>");
    }

  if (gvm_connection_sendf (connection, command))
    {
      g_free (command);

      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the settings. "
        "The current list of settings is not available. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_free (command);
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the settings. "
        "The current list of settings is not available. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  g_free (command);
  g_string_append (xml, "</get_settings>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
char *
save_setting_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
{
  const gchar *setting_id = params_value (params, "setting_id");
  const gchar *setting_value = params_value (params, "setting_value");
  const gchar *setting_name = NULL;

  CHECK_VARIABLE_INVALID (setting_id, "Save Setting");
  CHECK_VARIABLE_INVALID (setting_value, "Save Setting");

  if (params_given (params, "setting_name"))
    {
      setting_name = params_value (params, "setting_name");
      CHECK_VARIABLE_INVALID (setting_name, "Save Settings")
    }

  gchar *value_64 =
    g_base64_encode ((guchar *) setting_value, strlen (setting_value));
  gchar *html;
  gchar *response = NULL;
  entity_t entity = NULL;
  int ret;
  GString *xml = g_string_new ("");

  xml_string_append (xml,
                     "<modify_setting setting_id=\"%s\">"
                     "<value>%s</value>",
                     setting_id, value_64);

  if (setting_name)
    {
      xml_string_append (xml, "<name>%s</name>", setting_name);
    }

  xml_string_append (xml, "</modify_setting>");

  cmd_response_data_set_content_type (response_data, GSAD_CONTENT_TYPE_APP_XML);

  ret =
    gmp (connection, credentials, &response, &entity, response_data, xml->str);

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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving settings. "
        "It is unclear whether all the settings were saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving settings. "
        "It is unclear whether all the settings were saved. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:

      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Internal Error.",
                           response_data);
    }
  html = response_from_entity (connection, credentials, params, entity,
                               "Save Setting", response_data);
  free_entity (entity);
  g_free (response);
  return html;
}

char *
get_setting_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  const gchar *setting_id = params_value (params, "setting_id");
  CHECK_VARIABLE_INVALID (setting_id, "Get Setting");
  GString *xml = g_string_new ("<get_settings>");

  if (gvm_connection_sendf_xml (connection,
                                "<get_settings"
                                " setting_id=\"%s\"/>",
                                setting_id))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while getting the "
                           "dashboard settings"
                           "Diagnostics: Failure to receive response from "
                           "manager daemon.",
                           response_data);
    }

  g_string_append (xml, "</get_settings>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
        cmd_response_data_t *response_data)
{
  GString *xml;
  const char *name = params_value (params, "name");

  if (name == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the wizard. "
        "Given name was invalid",
        response_data);
    }

  xml = g_string_new ("");
  g_string_append_printf (xml, "<wizard>%s<%s/>", extra_xml ? extra_xml : "",
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the wizard. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while getting the"
                           " wizard."
                           "Diagnostics: Failure to receive response from"
                           " manager daemon.",
                           response_data);
    }

  /* Get the setting. */

  if (gvm_connection_sendf_xml (
        connection, "<get_settings"
                    " setting_id=\"20f3034c-e709-11e1-87e7-406186ea4fc5\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the wizard. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  if (read_string_c (connection, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while the wizard. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</wizard>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
            params_t *params, cmd_response_data_t *response_data)
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
            cmd_response_data_t *response_data)
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
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
                           param_name, param->value);
    }

  g_string_append (run, "</params></run_wizard>");

  response = NULL;
  entity = NULL;
  ret =
    gmp (connection, credentials, &response, &entity, response_data, run->str);
  g_string_free (run, TRUE);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while running a wizard. "
        "The wizard did not start. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while running a wizard. "
        "It is unclear whether the wizard started or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while running a wizard. "
                           "It is unclear whether the wizard started or not. "
                           "Diagnostics: Internal Error.",
                           response_data);
    }

  wizard_xml = g_strdup_printf ("<wizard><%s/>%s%s</wizard>", name,
                                extra_xml ? extra_xml : "", response);

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
                params_t *params, cmd_response_data_t *response_data)
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
bulk_delete_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  const char *type;
  params_t *selected_ids;
  gchar *extra_attribs;
  int count, fail;

  type = params_value (params, "resource_type");
  if (type == NULL)
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      const char *inheritor_id;
      inheritor_id = params_value (params, "inheritor_id");
      if (inheritor_id)
        extra_attribs = g_strdup_printf ("inheritor_id=\"%s\"", inheritor_id);
    }

  count = fail = 0;
  selected_ids = params_values (params, "bulk_selected:");
  if (selected_ids)
    {
      params_iterator_t iter;
      param_t *param;
      gchar *param_name;

      params_iterator_init (&iter, selected_ids);
      while (params_iterator_next (&iter, &param_name, &param))
        {
          gchar *command, *response;
          entity_t entity;

          /* Delete the resource. */

          command = g_strdup_printf ("<delete_%s %s_id=\"%s\""
                                     "           ultimate=\"0\" %s/>",
                                     type, type, param_name,
                                     extra_attribs ? extra_attribs : "");
          if (gvm_connection_sendf_xml (connection, command) == -1)
            {
              g_free (command);
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while deleting resources. "
                "The resources were not deleted. "
                "Diagnostics: Failure to send command to manager daemon.",
                response_data);
            }
          g_free (command);

          entity = NULL;
          if (read_entity_and_text_c (connection, &entity, &response))
            {
              cmd_response_data_set_status_code (response_data,
                                                 MHD_HTTP_INTERNAL_SERVER_ERROR);
              return gsad_message (
                credentials, "Internal error", __func__, __LINE__,
                "An internal error occurred while deleting resources. "
                "It is unclear whether the resources have been deleted or not. "
                "Diagnostics: Failure to read response from manager daemon.",
                response_data);
            }

          if (*(entity_attribute (entity, "status")) != '2')
            fail = 1;
          else
            count++;

          free_entity (entity);
          g_free (response);
        }
    }

  /* Cleanup, and return transformed XML. */

  if (fail)
    {
      gchar *html, *msg;

      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);

      msg = g_strdup_printf
             ("An error occurred while deleting one or more resources. "
              "However, %i of the resources %s successfully deleted. "
              "Diagnostics: At least one DELETE command failed.",
              count,
              count > 1 ? "were" : "was");

      html = gsad_message (credentials, "Error", __func__, __LINE__, msg,
                           response_data);
      g_free (msg);
      return html;
    }

  return action_result (connection, credentials, params, response_data, "Bulk Delete",
                        "OK",
                        "",    /* Status details. */
                        NULL); /* ID. */
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
bulk_export_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  const gchar *type, *filter, *bulk_select;
  gchar *param_name;
  GString *bulk_string;
  params_t *selected_ids;
  params_iterator_t iter;
  param_t *param;

  type = params_value (params, "resource_type");
  filter = params_value (params, "filter");
  bulk_select = params_value (params, "bulk_select");

  CHECK_VARIABLE_INVALID (type, "Bulk Export")
  CHECK_VARIABLE_INVALID (bulk_select, "Bulk Export")

  if (bulk_select && str_equal (bulk_select, "1"))
    {
      bulk_string = g_string_new ("first=1 rows=-1 uuid=");

      selected_ids = params_values (params, "bulk_selected:");
      if (selected_ids)
        {
          params_iterator_init (&iter, selected_ids);
          while (params_iterator_next (&iter, &param_name, &param))
            {
              xml_string_append (bulk_string, " uuid=%s", param_name);
            }
        }
    }
  else
    {
      bulk_string = g_string_new (filter ?: "");
    }

  params_add (params, "filter", g_string_free (bulk_string, FALSE));

  return export_many (connection, type, credentials, params, response_data);
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
create_host_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment;
  entity_t entity;
  GString *xml;

  name = params_value (params, "name");
  CHECK_VARIABLE_INVALID (name, "Create Host");

  comment = params_value (params, "comment");
  CHECK_VARIABLE_INVALID (comment, "Create Host");

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
                     name, comment);

  ret =
    gmp (connection, credentials, &response, &entity, response_data, xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new host. "
        "No new host was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a new host. "
        "It is unclear whether the host has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
           cmd_response_data_t *response_data)
{
  const gchar *asset_type;
  gmp_arguments_t *arguments;

  asset_type = params_value (params, "asset_type");

  CHECK_VARIABLE_INVALID (asset_type, "Get Asset")

  if (params_value (params, "asset_name") && params_value (params, "asset_id"))
    {
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (credentials, "Internal error", __func__, __LINE__,
                           "An internal error occurred while getting an asset. "
                           "Diagnostics: Both ID and Name set.",
                           response_data);
    }

  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "type", asset_type);

  if (params_value (params, "asset_name"))
    {
      gmp_arguments_add (arguments, "name",
                         params_value (params, "asset_name"));
    }

  return get_one (connection, "asset", credentials, params, NULL, arguments,
                  response_data);
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
get_asset_gmp (gvm_connection_t *connection, credentials_t *credentials,
               params_t *params, cmd_response_data_t *response_data)
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
get_assets_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments;
  const char *asset_type;

  asset_type = params_value (params, "asset_type");

  CHECK_VARIABLE_INVALID (asset_type, "Get Assets");

  arguments = gmp_arguments_new ();

  gmp_arguments_add (arguments, "type", asset_type);

  if (params_value (params, "ignore_pagination"))
    {
      gmp_arguments_add (arguments, "ignore_pagination",
                         params_value (params, "ignore_pagination"));
    }

  return get_many (connection, "assets", credentials, params, arguments,
                   response_data);
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
                  params_t *params, cmd_response_data_t *response_data)
{
  char *ret;
  gchar *response;
  const char *report_id, *filter;
  entity_t entity;

  report_id = params_value (params, "report_id");
  filter = params_value (params, "filter");

  CHECK_VARIABLE_INVALID (report_id, "Create Asset");
  CHECK_VARIABLE_INVALID (filter, "Create Asset");

  response = NULL;
  entity = NULL;
  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<create_asset>"
                "<report id=\"%s\">"
                "<filter><term>%s</term></filter>"
                "</report>"
                "</create_asset>",
                report_id, filter))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating an asset. "
        "No new asset was created. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating an asset. "
        "It is unclear whether the asset has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
delete_asset_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
      cmd_response_data_set_status_code (response_data, MHD_HTTP_BAD_REQUEST);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while deleting an asset. "
        "The asset was not deleted. "
        "Diagnostics: Required parameter was NULL.",
        response_data);
    }

  /* This is a hack, needed because asset_id is the param name used for
   * both the asset being deleted and the asset on the next page. */
  next_id = params_value (params, "next_id");
  if (next_id && params_value (params, "asset_id"))
    {
      param_t *param;
      param = params_get (params, "asset_id");
      g_free (param->value);
      param->value = g_strdup (next_id);
      param->value_size = strlen (param->value);
    }

  /* Delete the resource and get all resources. */

  if (gvm_connection_sendf (
        connection, "<delete_asset %s_id=\"%s\"/>",
        params_value (params, "asset_id") ? "asset" : "report", resource_id)
      == -1)
    {
      g_free (resource_id);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while deleting an asset. "
        "It is unclear whether the asset has been deleted or not. "
        "Diagnostics: Failure to read response from manager daemon.",
        response_data);
    }

  /* Cleanup, and return transformed XML. */

  html = response_from_entity (connection, credentials, params, entity,
                               "Delete Asset", response_data);
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
export_asset_gmp (gvm_connection_t *connection, credentials_t *credentials,
                  params_t *params, cmd_response_data_t *response_data)
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
export_assets_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return export_many (connection, "asset", credentials, params, response_data);
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
save_asset_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  int ret;
  gchar *html, *response;
  const char *asset_id, *comment;
  entity_t entity;

  asset_id = params_value (params, "asset_id");
  comment = params_value (params, "comment");

  CHECK_VARIABLE_INVALID (asset_id, "Save Asset");
  CHECK_VARIABLE_INVALID (comment, "Save Asset");

  /* Modify the asset. */

  response = NULL;
  entity = NULL;
  ret = gmpf (connection, credentials, &response, &entity, response_data,
              "<modify_asset asset_id=\"%s\">"
              "<comment>%s</comment>"
              "</modify_asset>",
              asset_id, comment);

  switch (ret)
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving an asset. "
        "The asset was not saved. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving an asset. "
        "It is unclear whether the asset has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
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

/**
 * @brief Get all tickets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_tickets_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  return get_many (connection, "tickets", credentials, params, NULL,
                   response_data);
}

/**
 * @brief Get single tickets, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_ticket_gmp (gvm_connection_t *connection, credentials_t *credentials,
                params_t *params, cmd_response_data_t *response_data)
{
  return get_one (connection, "ticket", credentials, params, NULL, NULL,
                  response_data);
}

/**
 * @brief Create a ticket
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_ticket_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  gchar *response = NULL;
  entity_t entity = NULL;
  const gchar *result_id, *user_id, *note;
  char *ret;

  result_id = params_value (params, "result_id");
  user_id = params_value (params, "user_id");
  note = params_value (params, "note");

  CHECK_VARIABLE_INVALID (result_id, "Create Ticket");
  CHECK_VARIABLE_INVALID (user_id, "Create Ticket");
  CHECK_VARIABLE_INVALID (note, "Create Ticket")

  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<create_ticket>"
                "<result id=\"%s\"/>"
                "<assigned_to>"
                "<user id=\"%s\"/>"
                "</assigned_to>"
                "<open_note>%s</open_note>"
                "</create_ticket>",
                result_id, user_id, note ? note : ""))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a ticket. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a ticket. "
        "It is unclear whether the ticket has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a ticket. "
        "It is unclear whether the ticket has been created or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Create Ticket", response_data);

  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Modify a ticket
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_ticket_gmp (gvm_connection_t *connection, credentials_t *credentials,
                 params_t *params, cmd_response_data_t *response_data)
{
  gchar *response = NULL;
  entity_t entity = NULL;
  const gchar *ticket_id, *status, *open_note, *fixed_note, *closed_note;
  const gchar *user_id;
  gchar *ret;

  ticket_id = params_value (params, "ticket_id");
  status = params_value (params, "ticket_status");
  open_note = params_value (params, "open_note");
  fixed_note = params_value (params, "fixed_note");
  closed_note = params_value (params, "closed_note");
  user_id = params_value (params, "user_id");

  CHECK_VARIABLE_INVALID (ticket_id, "Save Ticket");
  CHECK_VARIABLE_INVALID (status, "Save Ticket");
  CHECK_VARIABLE_INVALID (user_id, "Save Ticket");
  CHECK_VARIABLE_INVALID (open_note, "Save Ticket");
  CHECK_VARIABLE_INVALID (fixed_note, "Save Ticket");
  CHECK_VARIABLE_INVALID (closed_note, "Save Ticket");

  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<modify_ticket ticket_id=\"%s\">"
                "<assigned_to><user id=\"%s\"/></assigned_to>"
                "<status>%s</status>"
                "<open_note>%s</open_note>"
                "<fixed_note>%s</fixed_note>"
                "<closed_note>%s</closed_note>"
                "</modify_ticket>",
                ticket_id, user_id, status, open_note, fixed_note, closed_note))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a ticket. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a ticket. "
        "It is unclear whether the ticket has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a ticket. "
        "It is unclear whether the ticket has been saved or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Save Ticket", response_data);

  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete a ticket
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_ticket_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "ticket", credentials, params,
                                 response_data);
}

/**
 * @brief Get all TLS certificates, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_tls_certificates_gmp (gvm_connection_t *connection,
                          credentials_t *credentials, params_t *params,
                          cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments = gmp_arguments_new ();
  const char *include_certificate_data;

  if (params_given (params, "include_certificate_data"))
    {
      include_certificate_data =
        params_value (params, "include_certificate_data");
      CHECK_VARIABLE_INVALID (include_certificate_data, "Get TLS Certificate");
      gmp_arguments_add (arguments, "include_certificate_data",
                         include_certificate_data);
    }

  return get_many (connection, "tls_certificates", credentials, params,
                   arguments, response_data);
}

/**
 * @brief Get single TLS certificates, envelope the result.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
get_tls_certificate_gmp (gvm_connection_t *connection,
                         credentials_t *credentials, params_t *params,
                         cmd_response_data_t *response_data)
{
  gmp_arguments_t *arguments = gmp_arguments_new ();
  const char *include_certificate_data;

  if (params_given (params, "include_certificate_data"))
    {
      include_certificate_data =
        params_value (params, "include_certificate_data");
      CHECK_VARIABLE_INVALID (include_certificate_data, "Get TLS Certificate");
      gmp_arguments_add (arguments, "include_certificate_data",
                         include_certificate_data);
    }

  return get_one (connection, "tls_certificate", credentials, params, NULL,
                  arguments, response_data);
}

/**
 * @brief Create a TLS certificate.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
create_tls_certificate_gmp (gvm_connection_t *connection,
                            credentials_t *credentials, params_t *params,
                            cmd_response_data_t *response_data)
{
  gchar *response = NULL;
  entity_t entity = NULL;
  const gchar *name, *comment, *trust, *certificate_bin;
  size_t certificate_size;
  gchar *certificate_b64;
  gchar *ret;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  trust = params_value (params, "trust");
  certificate_bin = params_value (params, "certificate_bin");
  certificate_size = params_value_size (params, "certificate_bin");

  certificate_b64 =
    (certificate_size > 0)
      ? g_base64_encode ((guchar *) certificate_bin, certificate_size)
      : g_strdup ("");

  CHECK_VARIABLE_INVALID (name, "Create TLS Certificate");
  CHECK_VARIABLE_INVALID (comment, "Create TLS Certificate");
  CHECK_VARIABLE_INVALID (trust, "Create TLS Certificate");

  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<create_tls_certificate>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<trust>%s</trust>"
                "<certificate>%s</certificate>"
                "</create_tls_certificate>",
                name, comment, trust, certificate_b64))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a TLS certificate. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a TLS certificate. "
        "It is unclear whether the TLS certificate has been created or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while creating a TLS certificate. "
        "It is unclear whether the TLS certificate has been created or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Create TLS Certificate", response_data);

  free_entity (entity);
  g_free (response);
  g_free (certificate_b64);
  return ret;
}

/**
 * @brief Modify a TLS certificate.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
save_tls_certificate_gmp (gvm_connection_t *connection,
                          credentials_t *credentials, params_t *params,
                          cmd_response_data_t *response_data)
{
  gchar *response = NULL;
  entity_t entity = NULL;
  const gchar *tls_certificate_id, *name, *comment, *trust, *certificate_bin;
  size_t certificate_size;
  gchar *certificate_b64;
  gchar *ret;

  tls_certificate_id = params_value (params, "tls_certificate_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  trust = params_value (params, "trust");
  certificate_bin = params_value (params, "certificate_bin");
  certificate_size = params_value_size (params, "certificate_bin");

  certificate_b64 =
    (certificate_size > 0)
      ? g_base64_encode ((guchar *) certificate_bin, certificate_size)
      : g_strdup ("");

  CHECK_VARIABLE_INVALID (tls_certificate_id, "Save TLS Certificate");
  CHECK_VARIABLE_INVALID (name, "Save TLS Certificate");
  CHECK_VARIABLE_INVALID (comment, "Save TLS Certificate");
  CHECK_VARIABLE_INVALID (trust, "Save TLS Certificate");

  switch (gmpf (connection, credentials, &response, &entity, response_data,
                "<modify_tls_certificate tls_certificate_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<trust>%s</trust>"
                "<certificate>%s</certificate>"
                "</modify_tls_certificate>",
                tls_certificate_id, name, comment, trust, certificate_b64))
    {
    case 0:
    case -1:
      break;
    case 1:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a TLS certificate. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    case 2:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a TLS certificate. "
        "It is unclear whether the TLS certificate has been saved or not. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    default:
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while saving a TLS certificate. "
        "It is unclear whether the TLS certificate has been saved or not. "
        "Diagnostics: Internal Error.",
        response_data);
    }

  ret = response_from_entity (connection, credentials, params, entity,
                              "Save TLS Certificate", response_data);

  free_entity (entity);
  g_free (response);
  g_free (certificate_b64);
  return ret;
}

/**
 * @brief Delete a TLS certificate.
 *
 * @param[in]  connection     Connection to manager.
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  params         Request parameters.
 * @param[out] response_data  Extra data return for the HTTP response.
 *
 * @return Enveloped XML object.
 */
char *
delete_tls_certificate_gmp (gvm_connection_t *connection,
                            credentials_t *credentials, params_t *params,
                            cmd_response_data_t *response_data)
{
  return move_resource_to_trash (connection, "tls_certificate", credentials,
                                 params, response_data);
}

char *
renew_session_gmp (gvm_connection_t *connection, credentials_t *credentials,
                   params_t *params, cmd_response_data_t *response_data)
{
  gchar *html;
  gchar *message;
  user_t *user = credentials_get_user (credentials);

  user_renew_session (user);
  session_add_user (user_get_token (user), user);

  message = g_strdup_printf ("%ld", user_get_session_timeout (user));

  html = action_result (connection, credentials, params, response_data,
                        "renew_session", message, NULL, NULL);
  g_free (message);
  return html;
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
ping_gmp (gvm_connection_t *connection, credentials_t *credentials,
          params_t *params, cmd_response_data_t *response_data)
{
  return action_result (connection, credentials, params, response_data, "ping",
                        "pong", NULL, NULL);
}

char *
get_capabilities_gmp (gvm_connection_t *connection, credentials_t *credentials,
                      params_t *params, cmd_response_data_t *response_data)
{
  entity_t entity = NULL;
  GString *xml;

  if (gvm_connection_sendf (connection,
                            "<help format=\"XML\" type=\"brief\"/>"))
    {
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the user credentials. "
        "Diagnostics: Failure to send command to manager daemon.",
        response_data);
    }

  xml = g_string_new ("");
  g_string_append (xml, "<get_capabilities>");

  /* Read the response. */
  if (read_entity_and_string_c (connection, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      cmd_response_data_set_status_code (response_data,
                                         MHD_HTTP_INTERNAL_SERVER_ERROR);
      return gsad_message (
        credentials, "Internal error", __func__, __LINE__,
        "An internal error occurred while getting the user credentials. "
        "Diagnostics: Failure to receive response from manager daemon.",
        response_data);
    }

  if (gmp_success (entity) != 1)
    {
      gchar *message;

      set_http_status_from_entity (entity, response_data);

      message =
        gsad_message (credentials, "Error", __func__, __LINE__,
                      entity_attribute (entity, "status_text"), response_data);

      g_string_free (xml, TRUE);
      free_entity (entity);
      return message;
    }

  /* Cleanup, and return transformed XML. */
  free_entity (entity);

  g_string_append (xml, "</get_capabilities>");
  return envelope_gmp (connection, credentials, params,
                       g_string_free (xml, FALSE), response_data);
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
      g_warning ("Failed to connect to server at %s: %s", path,
                 strerror (errno));
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
gvm_connection_open (gvm_connection_t *connection, const gchar *address,
                     int port)
{
  if (address == NULL)
    return -1;

  connection->tls = manager_use_tls;

  if (manager_use_tls)
    {
      connection->socket =
        gvm_server_open (&connection->session, address, port);
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
 * @param[out] capabilities  Capabilities of manager.
 * @param[out] language      User Interface Language, or NULL.
 * @param[out] pw_warning    Password warning message, NULL if password is OK.
 *
 * @return 0 if valid, 1 manager down, 2 failed, 3 timeout, -1 error.
 */
int
authenticate_gmp (const gchar *username, const gchar *password, gchar **role,
                  gchar **timezone, gchar **capabilities,
                  gchar **language, gchar **pw_warning)
{
  gvm_connection_t connection;
  int auth;
  gmp_authenticate_info_opts_t auth_opts;

  if (gvm_connection_open (&connection, manager_address, manager_port))
    {
      g_debug ("%s failed to acquire socket!\n", __func__);
      return 1;
    }

  auth_opts = gmp_authenticate_info_opts_defaults;
  auth_opts.username = username;
  auth_opts.password = password;
  auth_opts.role = role;
  auth_opts.timezone = timezone;
  auth_opts.pw_warning = pw_warning;

  auth = gmp_authenticate_info_ext_c (&connection, auth_opts);
  if (auth == 0)
    {
      entity_t entity;
      const char *status;
      char first;
      gchar *response;
      int ret;

      /* Get language setting. */

      ret = setting_get_value (
        &connection, "6765549a-934e-11e3-b358-406186ea4fc5", language, NULL);

      switch (ret)
        {
        case 0:
          break;
        case 1:
        case 2:
          gvm_connection_close (&connection);
          return 1;
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
          return 1;
        }

      /* Read the response. */

      entity = NULL;
      if (read_entity_and_text_c (&connection, &entity, &response))
        {
          gvm_connection_close (&connection);
          return 1;
        }

      /* Check the response. */

      status = entity_attribute (entity, "status");
      if (status == NULL || strlen (status) == 0)
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

      switch (auth)
        {
        case 1: /* manager closed connection */
        case 2: /* auth failed */
        case 3: /* timeout */
          return auth;
        default:
          return -1;
        }
    }
}

/**
 * @brief Login and create a session
 *
 * @param[in]   con             HTTP Connection
 * @param[in]   params          Request parameters
 * @param[out]  response_data   Extra data return for the HTTP response
 * @param[in]   client_address  Client address
 *
 * @return MHD_YES on success. MHD_NO on errors.
 */
int
login (http_connection_t *con, params_t *params,
       cmd_response_data_t *response_data, const char *client_address)
{
  int ret, status;
  authentication_reason_t auth_reason;
  credentials_t *credentials;
  gchar *timezone;
  gchar *role;
  gchar *capabilities;
  gchar *language;
  gchar *pw_warning;

  const char *password = params_value (params, "password");
  const char *login = params_value (params, "login");

  if ((password == NULL)
      && (params_original_value (params, "password") == NULL))
    password = "";
  if (login && password)
    {
      ret = authenticate_gmp (login, password, &role, &timezone,
                              &capabilities, &language, &pw_warning);
      if (ret)
        {
          switch (ret)
            {
            case 1: /* could not connect to manager */
            case 3: /* timeout */
              status = MHD_HTTP_SERVICE_UNAVAILABLE;
              auth_reason = GMP_SERVICE_DOWN;
              break;
            case 2: /* authentication failure */
              status = MHD_HTTP_UNAUTHORIZED;
              auth_reason = LOGIN_FAILED;
              break;
            default: /* unspecified error */
              status = MHD_HTTP_INTERNAL_SERVER_ERROR;
              auth_reason = LOGIN_ERROR;
              break;
            }

          g_warning ("Authentication failure for '%s' from %s. "
                     "Status was %d.",
                     login ?: "", client_address, ret);
          return handler_send_reauthentication (con, status, auth_reason);
        }
      else
        {
          user_t *user;
          user = user_add (login, password, timezone, role,
                           capabilities, language, pw_warning, client_address);

          g_message ("Authentication success for '%s' from %s", login ?: "",
                     client_address);

          credentials = credentials_new (user, language);

          gchar *data =
            envelope_gmp (NULL, credentials, params, NULL, response_data);

          ret = handler_create_response (con, data, response_data,
                                         user_get_cookie (user));

          user_free (user);

          credentials_free (credentials);

          g_free (timezone);
          g_free (capabilities);
          g_free (language);
          g_free (role);
          g_free (pw_warning);

          return ret;
        }
    }
  else
    {
      g_warning ("Authentication failure for '%s' from %s", login ?: "",
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
 * @return 0 success, 1 if manager closed connection, 2 if auth failed,
 *         3 on timeout, 4 failed to connect, -1 on error
 */
int
manager_connect (credentials_t *credentials, gvm_connection_t *connection,
                 cmd_response_data_t *response_data)
{
  gmp_authenticate_info_opts_t auth_opts;

  if (gvm_connection_open (connection, manager_address, manager_port))
    {
      return 4;
    }

  user_t *user = credentials_get_user (credentials);

  auth_opts = gmp_authenticate_info_opts_defaults;
  auth_opts.username = user_get_username (user);
  auth_opts.password = user_get_password (user);

  int ret = gmp_authenticate_info_ext_c (connection, auth_opts);

  if (ret)
    {
      gvm_connection_close (connection);
      return ret;
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
