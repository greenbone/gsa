/* Greenbone Security Assistant
 * $Id$
 * Description: OMP communication module.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@greenbone.net>
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
 * @file gsad_omp.c
 * @brief OMP communication module of Greenbone Security Assistant daemon.
 *
 * This file implements an API for OMP.  The functions call the OpenVAS Manager
 * via OMP properly, and apply XSL-Transforms to deliver HTML results.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <glib.h>
#include <gnutls/gnutls.h>
#include <netinet/in.h>
#include <netdb.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <fcntl.h>
#include <assert.h>

#include "gsad_base.h"
#include "gsad_omp.h"
#include "tracef.h"

#include <openvas/misc/openvas_server.h>
#include <openvas/base/cvss.h>
#include <openvas/omp/omp.h>
#include <openvas/omp/xml.h>

/*
 * XSLT includes
 */
#include <libxml2/libxml/xmlmemory.h>
#include <libxml2/libxml/HTMLtree.h>
#include <libxml2/libxml/xmlIO.h>
#include <libxml2/libxml/xinclude.h>
#include <libxslt/xslt.h>
#include <libxslt/xsltInternals.h>
#include <libxslt/transform.h>
#include <libxslt/xsltutils.h>

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad  omp"

/**
 * @brief Manager (openvasmd) address.
 */
#define OPENVASMD_ADDRESS "127.0.0.1"

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
omp (credentials_t *, gchar **, entity_t *, const char *);

static int
ompf (credentials_t *, gchar **, entity_t *, const char *, ...);

int manager_connect (credentials_t *, int *, gnutls_session_t *, gchar **);

static char *edit_role (credentials_t *, params_t *, const char *);

static char *get_alert (credentials_t *, params_t *, const char *);

static char *get_alerts (credentials_t *, params_t *, const char *);

static char *get_agent (credentials_t *, params_t *, const char *);

static char *get_agents (credentials_t *, params_t *, const char *);

static char *get_task (credentials_t *, params_t *, const char *);

static char *get_tasks (credentials_t *, params_t *, const char *);

static char *get_trash (credentials_t *, params_t *, const char *);

static char *get_config_family (credentials_t *, params_t *, int);

static char *get_config (credentials_t *, params_t *, const char *, int);

static char *get_configs (credentials_t *, params_t *, const char *);

static char *get_filter (credentials_t *, params_t *, const char *);

static char *get_filters (credentials_t *, params_t *, const char *);

static char *get_group (credentials_t *, params_t *, const char *);

static char *get_groups (credentials_t *, params_t *, const char *);

static char *get_lsc_credential (credentials_t *, params_t *, const char *);

static char *get_lsc_credentials (credentials_t *, params_t *, const char *);

static char *get_notes (credentials_t *, params_t *, const char *);

static char *get_note (credentials_t *, params_t *, const char *);

static char *get_nvts (credentials_t *credentials, params_t *,
                       const char *, const char *);

static char *get_overrides (credentials_t *, params_t *, const char *);

static char *get_override (credentials_t *, params_t *, const char *);

static char *get_permission (credentials_t *, params_t *, const char *);

static char *get_permissions (credentials_t *, params_t *, const char *);

static char *get_port_list (credentials_t *, params_t *, const char *);

static char *get_port_lists (credentials_t *, params_t *, const char *);

static char *edit_port_list (credentials_t *, params_t *, const char *);

static char *get_tag (credentials_t *, params_t *, const char *);

static char *get_tags (credentials_t *, params_t *, const char *);

static char *get_target (credentials_t *, params_t *, const char *);

static char *get_targets (credentials_t *, params_t *, const char *);

static char *get_report (credentials_t *, params_t *, const char *, gsize *,
                         gchar **, char **, const char *, int *);

static char *get_report_format (credentials_t *, params_t *, const char *);

static char *get_report_formats (credentials_t *, params_t *, const char *);

static char *get_report_section (credentials_t *, params_t *, const char *);

static char *get_reports (credentials_t *, params_t *, const char *);

static char *get_result_page (credentials_t *, params_t *, const char *);

static char *get_role (credentials_t *, params_t *, const char *);

static char *get_roles (credentials_t *, params_t *, const char *);

static char *get_schedule (credentials_t *, params_t *, const char *);

static char *get_schedules (credentials_t *, params_t *, const char *);

static char *get_slave (credentials_t *, params_t *, const char *);

static char *get_slaves (credentials_t *, params_t *, const char *);

static char *get_user (credentials_t *, params_t *, const char *);

static char *get_users (credentials_t *, params_t *, const char *);

static char *wizard (credentials_t *, params_t *, const char *);

static char *wizard_get (credentials_t *, params_t *, const char *);


/* Helpers. */

/**
 * @brief Init the GSA OMP library.
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
 * @brief Init the GSA OMP library.
 *
 * @param[in]  address_manager  Manager address (copied).
 * @param[in]  port_manager     Manager port.
 */
void
omp_init (const gchar *address_manager, int port_manager)
{
  if (address_manager)
    manager_address = g_strdup (address_manager);
  manager_port = port_manager;
}

/**
 * @brief Wrap some XML in an envelope and XSL transform the envelope.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  xml          XML string.  Freed before exit.
 *
 * @return Result of XSL transformation.
 */
static char *
xsl_transform_omp (credentials_t * credentials, gchar * xml)
{
  time_t now;
  gchar *res, *name;
  GString *string;
  char *html;
  char ctime_now[200];
  params_iterator_t iter;
  param_t *param;
  const char *refresh_interval, *xml_flag;

  assert (credentials);

  now = time (NULL);
  ctime_r_strip_newline (&now, ctime_now);

  string = g_string_new ("");

  res = g_markup_printf_escaped ("<envelope>"
                                 "<token>%s</token>"
                                 "<caller>%s</caller>"
                                 "<current_page>%s</current_page>"
                                 "<time>%s</time>"
                                 "<timezone>%s</timezone>"
                                 "<login>%s</login>"
                                 "<role>%s</role>"
                                 "<severity>%s</severity>"
                                 "<i18n>%s</i18n>",
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
                                 credentials->language);
  g_string_append (string, res);
  g_free (res);

  refresh_interval = params_value (credentials->params, "refresh_interval");
  if ((refresh_interval == NULL) || (strcmp (refresh_interval, "") == 0))
    g_string_append_printf (string,
                            "<autorefresh interval=\"%s\"/>",
                            credentials->autorefresh);
  else
    {
      int ret;
      gchar *interval_64, *response;
      entity_t entity;

      interval_64 = (refresh_interval
                     ? g_base64_encode ((guchar*) refresh_interval,
                                        strlen (refresh_interval))
                     : g_strdup (""));
      ret = ompf (credentials, &response, &entity,
                  "<modify_setting"
                  " setting_id=\"578a1c14-e2dc-45ef-a591-89d31391d007\">"
                  "<value>%s</value>"
                  "</modify_setting>",
                  interval_64);
      g_free (interval_64);
      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while modifying the"
                                " autorefresh setting for the settings. "
                                "Diagnostics: Failure to send command to"
                                " manager daemon.",
                                "/omp?cmd=get_my_settings");
          case 2:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while modifying the"
                                " autorefresh setting for the settings. "
                                "Diagnostics: Failure to receive response from"
                                " manager daemon.",
                                "/omp?cmd=get_my_settings");
          default:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while modifying the"
                                " autorefresh setting for the settings. "
                                "Diagnostics: Internal Error.",
                                "/omp?cmd=get_my_settings");
        }

      free_entity (entity);
      g_free (credentials->autorefresh);
      credentials->autorefresh = g_strdup (refresh_interval);
      user_set_autorefresh (credentials->username, refresh_interval);

      g_string_append_printf (string,
                              "<autorefresh interval=\"%s\"/>",
                              credentials->autorefresh);
    }

  g_string_append (string, "<params>");
  params_iterator_init (&iter, credentials->params);
  while (params_iterator_next (&iter, &name, &param))
    {
      if (name)
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
              && strcmp (name, "xml_file"))
            xml_string_append (string, "<%s>%s</%s>", name, param->value, name);
        }
    }
  g_string_append (string, "</params>");

  g_string_append_printf (string,
                          "<capabilities>%s</capabilities>"
                          "%s"
                          "</envelope>",
                          credentials->capabilities,
                          xml);

  xml_flag = params_value (credentials->params, "xml");
  if (xml_flag && strcmp (xml_flag, "0"))
    {
      g_free (xml);
      return g_string_free (string, FALSE);
    }

  html = xsl_transform (string->str);
  g_string_free (string, TRUE);
  if (html == NULL)
    {
      res = g_strdup_printf ("<gsad_response>"
                             "<title>Internal Error</title>"
                             "<message>"
                             "An internal server error has occurred during XSL"
                             " transformation."
                             "</message>"
                             "<backurl>/omp?cmd=get_tasks</backurl>"
                             "</gsad_response>");
      html = xsl_transform (res);
      if (html == NULL)
        html = g_strdup ("<html>"
                         "<body>"
                         "An internal server error has occurred during XSL"
                         " transformation."
                         "</body>"
                         "</html>");
      g_free (res);
    }
  g_free (xml);
  return html;
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
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  session      Session with manager.
 *
 * @return XSL transformed error message on failure, NULL on success.
 */
static char *
check_modify_config (credentials_t *credentials, gnutls_session_t *session)
{
  entity_t entity;
  const char *status_text;

  /** @todo This would be much easier with real error codes. */

  /* Read the response. */

  if (read_entity (session, &entity))
    {
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to read command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Check the response. */

  status_text = entity_attribute (entity, "status_text");
  if (status_text == NULL)
    {
      free_entity (entity);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to parse status_text from response.",
                           "/omp?cmd=get_configs");
    }

  if (strcmp (status_text, "Config is in use") == 0)
    {
      free_entity (entity);
      return xsl_transform_omp
              (credentials,
               g_strdup ("<gsad_msg status_text=\"Config is in use.\""
                         " operation=\"Save Config\">"
                         "The config is now in use by a task,"
                         " so modification of the config is forbidden."
                         "</gsad_msg>"));
    }
  else if (strcmp (status_text, "MODIFY_CONFIG name must be unique") == 0)
    {
      free_entity (entity);
      return xsl_transform_omp
              (credentials,
               g_strdup ("<gsad_msg status_text=\"Config name must be unique\""
                         " operation=\"Save Config\">"
                         "A config with the given name exists already."
                         "</gsad_msg>"));
    }
  else if (strcmp (status_text, "OK"))
    {
      free_entity (entity);
      /** @todo Put in XML for "result of previous..." window. */
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  return NULL;
}

/**
 * @brief Check whether an OMP command failed.
 *
 * @param[in] entity  Response entity.
 *
 * @return 1 success, 0 fail, -1 error.
 */
static int
omp_success (entity_t entity)
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
 * @brief Run a single OMP command.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[out] response       Response.
 * @param[out] entity_return  Response entity.
 * @param[in]  command        Command.
 *
 * @return -1 failed to connect (response set), 1 send error, 2 read error.
 */
static int
omp (credentials_t *credentials, gchar **response, entity_t *entity_return,
     const char *command)
{
  gnutls_session_t session;
  int socket, ret;
  entity_t entity;

  if (entity_return)
    *entity_return = NULL;

  switch (manager_connect (credentials, &socket, &session, response))
    {
      case 0:
        break;
      case -1:
        return -1;
      default:
        if (response)
          *response = gsad_message (credentials,
                                    "Internal error", __FUNCTION__, __LINE__,
                                    "An internal error occurred. "
                                    "Diagnostics: Failure to connect to manager daemon.",
                                    "/omp?cmd=get_tasks");
        return -1;
    }

  ret = openvas_server_send (&session, command);
  if (ret == -1)
    {
      openvas_server_close (socket, session);
      return 1;
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, response))
    {
      openvas_server_close (socket, session);
      return 2;
    }
  if (entity_return)
    *entity_return = entity;
  else
    free_entity (entity);
  openvas_server_close (socket, session);
  return 0;
}

/**
 * @brief Run a single formatted OMP command.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[out] response       Response.
 * @param[out] entity_return  Response entity.
 * @param[in]  format         Command.
 * @param[in]  ...            Arguments for format string.
 *
 * @return -1 failed to connect (response set), 1 send error, 2 read error.
 */
static int
ompf (credentials_t *credentials, gchar **response, entity_t *entity_return,
      const char *format, ...)
{
  int ret;
  gchar *command;
  va_list args;

  va_start (args, format);
  command = g_markup_vprintf_escaped (format, args);
  va_end (args);

  ret = omp (credentials, response, entity_return, command);
  g_free (command);
  return ret;
}

/**
 * @brief Check a param.
 *
 * @param[in]  name     Param name.
 * @param[in]  op_name  Operation name.
 * @param[in]  ret_func Function to return message.
 */
#define CHECK_PARAM(name, op_name, ret_func)                                   \
  if (name == NULL)                                                            \
    {                                                                          \
      gchar *msg, *ret_html;                                                   \
      msg = g_strdup_printf (GSAD_MESSAGE_INVALID,                             \
                             "Given " G_STRINGIFY (name) " was invalid",       \
                             op_name);                                         \
      ret_html = ret_func (credentials, params, msg);                          \
      g_free (msg);                                                            \
      return ret_html;                                                         \
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
 * @brief Append a param to the URL for the current page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         Param name.
 * @param[in]  value        Param value.
 */
static void
page_url_append_param (credentials_t *credentials, const gchar *name,
                       const gchar *value)
{
  if (credentials->current_page)
    {
      gchar *new;
      new = g_strdup_printf ("%s&%s=%s", credentials->current_page, name,
                             value);
      g_free (credentials->current_page);
      credentials->current_page = new;
    }
}


/* Generic page handlers. */

/**
 * @brief Generate next page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  response     Extra XML to insert inside page element for XSLT.
 *
 * @return Result of XSL transformation.
 */
static char *
next_page (credentials_t *credentials, params_t *params, gchar *response)
{
  const char *next;

  next = params_value (params, "next");
  if (next == NULL)
    return NULL;

  credentials->current_page = page_url (credentials, next);

  if (strcmp (next, "edit_role") == 0)
    return edit_role (credentials, params, response);

  if (strcmp (next, "get_alerts") == 0)
    return get_alerts (credentials, params, response);

  if (strcmp (next, "get_alert") == 0)
    return get_alert (credentials, params, response);

  if (strcmp (next, "edit_port_list") == 0)
    return edit_port_list (credentials, params, response);

  if (strcmp (next, "get_agents") == 0)
    return get_agents (credentials, params, response);

  if (strcmp (next, "get_agent") == 0)
    return get_agent (credentials, params, response);

  if (strcmp (next, "get_config") == 0)
    return get_config (credentials, params, response, 0);

  if (strcmp (next, "get_configs") == 0)
    return get_configs (credentials, params, response);

  if (strcmp (next, "get_filter") == 0)
    return get_filter (credentials, params, response);

  if (strcmp (next, "get_filters") == 0)
    return get_filters (credentials, params, response);

  if (strcmp (next, "get_group") == 0)
    return get_group (credentials, params, response);

  if (strcmp (next, "get_groups") == 0)
    return get_groups (credentials, params, response);

  if (strcmp (next, "get_lsc_credential") == 0)
    return get_lsc_credential (credentials, params, response);

  if (strcmp (next, "get_lsc_credentials") == 0)
    return get_lsc_credentials (credentials, params, response);

  if (strcmp (next, "get_note") == 0)
    return get_note (credentials, params, response);

  if (strcmp (next, "get_notes") == 0)
    return get_notes (credentials, params, response);

  if (strcmp (next, "get_nvts") == 0)
    return get_nvts (credentials, params, NULL, response);

  if (strcmp (next, "get_override") == 0)
    return get_override (credentials, params, response);

  if (strcmp (next, "get_overrides") == 0)
    return get_overrides (credentials, params, response);

  if (strcmp (next, "get_permission") == 0)
    return get_permission (credentials, params, response);

  if (strcmp (next, "get_permissions") == 0)
    return get_permissions (credentials, params, response);

  if (strcmp (next, "get_port_list") == 0)
    return get_port_list (credentials, params, response);

  if (strcmp (next, "get_port_lists") == 0)
    return get_port_lists (credentials, params, response);

  if (strcmp (next, "get_tag") == 0)
    return get_tag (credentials, params, response);

  if (strcmp (next, "get_tags") == 0)
    return get_tags (credentials, params, response);

  if (strcmp (next, "get_target") == 0)
    return get_target (credentials, params, response);

  if (strcmp (next, "get_targets") == 0)
    return get_targets (credentials, params, response);

  if (strcmp (next, "get_task") == 0)
    return get_task (credentials, params, response);

  if (strcmp (next, "get_tasks") == 0)
    return get_tasks (credentials, params, response);

  if (strcmp (next, "get_report") == 0)
    {
      char *result;
      int error = 0;

      result = get_report (credentials, params, NULL, NULL, NULL,
                           NULL, response, &error);

      return error ? result : xsl_transform_omp (credentials, result);
    }

  if (strcmp (next, "get_report_format") == 0)
    return get_report_format (credentials, params, response);

  if (strcmp (next, "get_report_formats") == 0)
    return get_report_formats (credentials, params, response);

  if (strcmp (next, "get_report_section") == 0)
    return get_report_section (credentials, params, response);

  if (strcmp (next, "get_reports") == 0)
    return get_reports (credentials, params, response);

  if (strcmp (next, "get_result") == 0)
    return get_result_page (credentials, params, response);

  if (strcmp (next, "get_role") == 0)
    return get_role (credentials, params, response);

  if (strcmp (next, "get_roles") == 0)
    return get_roles (credentials, params, response);

  if (strcmp (next, "get_schedule") == 0)
    return get_schedule (credentials, params, response);

  if (strcmp (next, "get_schedules") == 0)
    return get_schedules (credentials, params, response);

  if (strcmp (next, "get_slave") == 0)
    return get_slave (credentials, params, response);

  if (strcmp (next, "get_slaves") == 0)
    return get_slaves (credentials, params, response);

  if (strcmp (next, "get_user") == 0)
    return get_user (credentials, params, response);

  if (strcmp (next, "get_users") == 0)
    return get_users (credentials, params, response);

  if (strcmp (next, "get_info") == 0)
    return get_info (credentials, params, response);

  if (strcmp (next, "wizard") == 0)
    return wizard (credentials, params, response);

  if (strcmp (next, "wizard_get") == 0)
    return wizard_get (credentials, params, response);

  return NULL;
}

/**
 * @brief Get one resource, XSL transform the result.
 *
 * @param[in]  type         Type of resource.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[in]  extra_attribs  Extra attributes for OMP GET command.
 *
 * @return Result of XSL transformation.
 */
char *
get_one (const char *type, credentials_t * credentials, params_t *params,
         const char *extra_xml, const char *extra_attribs)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html, *end, *id_name;
  const char *id, *sort_field, *sort_order, *filter, *first, *max;

  id_name = g_strdup_printf ("%s_id", type);
  id = params_value (params, id_name);
  g_free (id_name);
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (id == NULL)
    {
      entity_t entity;

      /* Check for an ID in a CREATE response in extra_xml. */

      if (extra_xml == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a resource. "
                             "Diagnostics: extra_xml is NULL.",
                             "/omp?cmd=get_tasks");

      if (parse_entity (extra_xml, &entity) == 0)
        {
          gchar *name;

          name = g_strdup_printf ("create_%s_response", type);
          if (strcmp (entity_name (entity), name) == 0)
            {
              param_t *param;

              g_free (name);
              name = g_strdup_printf ("%s_id", type);
              param = params_add (params, name, entity_attribute (entity, "id"));
              param->valid = 1;
              param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
              id = params_value (params, name);
              assert (id);
              g_free (name);
              free_entity (entity);
            }
          else
            {
              g_free (name);
              free_entity (entity);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a resource. "
                                   "Diagnostics: Error parsing extra_xml.",
                                   "/omp?cmd=get_tasks");
            }
        }
      else
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a resource. "
                             "Diagnostics: Required ID parameter was NULL.",
                             "/omp?cmd=get_tasks");
    }

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a resource. "
                             "The resource is currently not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
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
      switch (ompf (credentials, &response, &entity,
                    "<get_permissions"
                    " filter=\"rows=-1 subject_type=role and subject_uuid=%s\"/>",
                    params_value (params, "role_id")))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting permissions. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_roles");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting permissions. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_roles");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting permissins. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_roles");
        }

      g_string_append (xml, response);

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

  if (openvas_server_sendf (&session,
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting resources list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_resources");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting resources list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_resources");
    }

  /* Get tag names */

  if (openvas_server_sendf (&session,
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_resources");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_resources");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</get_%s>", type);
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all of a particular type of resource, XSL transform the result.
 *
 * @param[in]  type         Resource type.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[in]  extra_attribs  Extra attributes for OMP GET command.
 *
 * @return Result of XSL transformation.
 */
static char *
get_many (const char *type, credentials_t * credentials, params_t *params,
          const char *extra_xml, const char *extra_attribs)
{
  GString *xml;
  GString *type_many; /* The plural form of type */
  gnutls_session_t session;
  int socket;
  gchar *filter_type, *html, *request, *built_filter;
  const char *given_filt_id, *filt_id, *filter;
  const char *first, *max, *sort_field, *sort_order;
  const char *replace_task_id;

  given_filt_id = params_value (params, "filt_id");
  filter = params_value (params, "filter");
  first = params_value (params, "first");
  max = params_value (params, "max");
  replace_task_id = params_value (params, "replace_task_id");
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (strcasecmp (type, "info") == 0)
    filter_type = g_strdup (params_value (params, "info_type"));
  else
    filter_type = g_strdup (type);

  if (given_filt_id)
    {
      if (strcmp (given_filt_id, "0"))
        g_tree_replace (credentials->last_filt_ids, filter_type,
                        g_strdup (given_filt_id));
      filt_id = given_filt_id;
    }
  else if (filter == NULL || strcmp (filter, "") == 0)
    filt_id = g_tree_lookup (credentials->last_filt_ids, filter_type);
  else
    filt_id = NULL;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a resource list. "
                             "The current list of resources is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
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
      if (params_value (params, "build_filter")
          || filter == NULL
          || (strcmp (filter, "") == 0))
        {
          if (params_value (params, "build_filter"))
            {
              gchar *task;
              const char *search_phrase, *task_id;

              if (strcmp (type, "task"))
                task = NULL;
              else
                {
                  const char *overrides;
                  overrides = params_value (params, "overrides");
                  task = g_strdup_printf ("apply_overrides=%i ",
                                          overrides
                                          && strcmp (overrides, "0"));
                }

              search_phrase = params_value (params, "search_phrase");
              task_id = params_value (params, "task_id");
              built_filter = g_strdup_printf
                              ("%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s",
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
                               (filter && search_phrase) ? " " : "",
                               filter ? filter : "",
                               search_phrase ? " " : "",
                               search_phrase
                                ? search_phrase
                                : "");
              g_free (task);
            }
          else if (strcmp (type, "info") == 0
                   && params_value (params, "info_type"))
            {
              if (strcmp (params_value (params, "info_type"), "cve") == 0)
                filter = "sort-reverse=published rows=-2";
              else
                filter = "sort-reverse=created rows=-2";
            }
          else if (strcmp (type, "user") == 0)
            filter = "sort=roles rows=-2 permission=any";
          else if (strcmp (type, "report") == 0)
            {
              const char *task_id;
              task_id = params_value (params, "task_id");
              if (task_id)
                built_filter = g_strdup_printf ("task_id=%s apply_overrides=1"
                                                " rows=-2 permission=any"
                                                " owner=any sort-reverse=date",
                                                task_id);
              else
                filter = "apply_overrides=1 rows=-2"
                         " permission=any owner=any sort-reverse=date";
            }
          else if (strcmp (type, "task"))
            filter = "rows=-2 permission=any owner=any";
          else
            filter = "apply_overrides=1 rows=-2 permission=any owner=any";
          if (filt_id && strcmp (filt_id, ""))
            /* Request to use "filter" instead. */
            filt_id = "0";
          else
            filt_id = "-2";
        }
      else if ((strcmp (filter, "sort=nvt permission=any") == 0)
               && ((strcmp (type, "note") == 0)
                   || (strcmp (type, "override") == 0)))
        filt_id = "-2";
      else if ((strcmp (filter, "apply_overrides=1") == 0)
               && (strcmp (type, "task") == 0))
        filt_id = "-2";
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
                                     " %sfilter=\"%s\""
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
                                     replace_task_id ? "task_id" : "",
                                     first ? first : "1",
                                     max ? max : "-2",
                                     sort_field ? sort_field : "name",
                                     sort_order ? sort_order : "ascending");

  g_free (built_filter);
  if (openvas_server_sendf (&session,
                            "<get_%s%s%s %s/>",
                            type_many->str,
                            strcmp (type, "report") ? "" : " details=\"0\"",
                            request,
                            extra_attribs ? extra_attribs : "")
      == -1)
    {
      g_free(request);
      g_string_free (xml, TRUE);
      g_string_free (type_many, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  g_free(request);
  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      g_string_free (type_many, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting resources list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (command_enabled (credentials, "GET_FILTERS"))
    {
      /* Get the filters. */

      g_string_append (xml, "<filters>");

      if (openvas_server_sendf_xml (&session,
                                    "<get_filters"
                                    " filter=\"owner=any permission=any"
                                    "          rows=-1 type=%s or type=\"/>",
                                    type)
          == -1)
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      g_string_append (xml, "</filters>");
    }

  if (command_enabled (credentials, "GET_SETTINGS"))
    {
      /* Get the Wizard Rows setting. */

      if (openvas_server_sendf_xml
           (&session,
            "<get_settings"
            " setting_id=\"20f3034c-e709-11e1-87e7-406186ea4fc5\"/>",
            type)
          == -1)
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          g_string_free (type_many, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the filter list. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  if (command_enabled (credentials, "GET_TAGS")
      && params_value (params, "details"))
    {
      /* Get tag names */

      if (openvas_server_sendf (&session,
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
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              "/omp?cmd=get_resources");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to receive response from manager daemon.",
                              "/omp?cmd=get_resources");
        }
    }

  /* Cleanup, and return transformed XML. */
  g_string_append_printf (xml, "</get_%s>", type_many->str);
  openvas_server_close (socket, session);
  g_string_free (type_many, TRUE);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup edit XML, XSL transform the result.
 *
 * @param[in]  type         Type or resource to edit.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_resource (const char *type, credentials_t *credentials, params_t *params,
               const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html, *id_name;
  const char *resource_id;

  id_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, id_name);
  g_free (id_name);

  if (resource_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a resource. "
                         "The resource remains as it was. "
                         "Diagnostics: Required ID parameter was NULL.",
                         "/omp?cmd=get_tasks");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing a resource. "
                             "The resource remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (openvas_server_sendf (&session,
                            /* TODO: Remove redundant COMMANDS. */
                            "<commands>"
                            "<get_%ss"
                            " %s_id=\"%s\""
                            " details=\"1\"/>"
                            "</commands>",
                            type,
                            type,
                            resource_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("");

  g_string_append_printf (xml, "<edit_%s>", type);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</edit_%s>", type);
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Export a resource.
 *
 * @param[in]   type                 Type of resource.
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Resource XML on success.  HTML result of XSL transformation on error.
 */
char *
export_resource (const char *type, credentials_t * credentials,
                 params_t *params, enum content_type * content_type,
                 char **content_disposition, gsize *content_length)
{
  GString *xml;
  entity_t entity;
  entity_t resource_entity;
  gnutls_session_t session;
  int socket;
  char *content = NULL;
  gchar *html, *id_name;
  const char *resource_id;

  *content_length = 0;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a resource. "
                             "The resource could not be delivered. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("");

  id_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, id_name);
  g_free (id_name);

  if (resource_id == NULL)
    {
      g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Export Resource"));
      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (openvas_server_sendf (&session,
                            "<get_%ss"
                            " %s_id=\"%s\""
                            " export=\"1\""
                            " details=\"1\"/>",
                            type,
                            type,
                            resource_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "The resource could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &content))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "The resource could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (strcmp (type, "result"))
    resource_entity = entity_child (entity, type);
  else
    {
      resource_entity = entity_child (entity, "results");
      if (resource_entity)
        resource_entity = entity_child (resource_entity, "result");
    }
  if (resource_entity == NULL)
    {
      free (content);
      free_entity (entity);
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a resource. "
                           "The resource could not be delivered. "
                           "Diagnostics: Failure to receive resource from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  *content_type = GSAD_CONTENT_TYPE_APP_XML;
  *content_disposition = g_strdup_printf ("attachment; filename=\"%s-%s.xml\"",
                                          type,
                                          resource_id);
  *content_length = strlen (content);
  free_entity (entity);
  g_string_free (xml, TRUE);
  openvas_server_close (socket, session);
  return content;
}

/**
 * @brief Export a list of resources.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return XML on success.  HTML result of XSL transformation on error.
 */
static char *
export_many (const char *type, credentials_t * credentials, params_t *params,
             enum content_type * content_type, char **content_disposition,
             gsize *content_length)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;
  char *content = NULL;
  gchar *html;
  const char *filter;
  time_t now;
  struct tm *tm;

  *content_length = 0;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a list. "
                             "The list could not be delivered. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  filter = params_value (params, "filter");

  if (openvas_server_sendf (&session,
                            "<get_%ss"
                            " export=\"1\""
                            " details=\"1\""
                            " filter=\"%s\"/>",
                            type,
                            filter ? filter : "")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a list. "
                           "The list could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &content))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a list. "
                           "The list could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  now = time (NULL);
  tm = localtime (&now);
  *content_type = GSAD_CONTENT_TYPE_APP_XML;
  *content_disposition = g_strdup_printf ("attachment;"
                                          " filename=\"%ss-%d-%d-%d.xml\"",
                                          type,
                                          tm->tm_mday,
                                          tm->tm_mon + 1,
                                          tm->tm_year +1900);
  *content_length = strlen (content);
  free_entity (entity);
  openvas_server_close (socket, session);
  return content;
}

/**
 * @brief Delete a resource, get all resources, XSL transform the result.
 *
 * @param[in]  type         Type of resource.
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  ultimate     0 move to trash, 1 remove entirely.
 * @param[in]  get          Next page get function.
 *
 * @return Result of XSL transformation.
 */
char *
delete_resource (const char *type, credentials_t * credentials,
                 params_t *params, int ultimate,
                 char *get (credentials_t *, params_t *, const char *))
{
  gnutls_session_t session;
  int socket;
  gchar *html, *response, *id_name;
  const char *resource_id;
  entity_t entity;

  id_name = g_strdup_printf ("%s_id", type);
  resource_id = params_value (params, id_name);
  g_free (id_name);

  if (resource_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a resource. "
                         "The resource was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while deleting a resource. "
                             "The resource is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  /* Delete the resource and get all resources. */

  if (openvas_server_sendf (&session,
                            "<delete_%s %s_id=\"%s\" ultimate=\"%i\"/>",
                            type,
                            type,
                            resource_id,
                            !!ultimate)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a resource. "
                           "The resource is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &response))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a resource. "
                           "It is unclear whether the resource has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);

  /* Cleanup, and return transformed XML. */

  if (get)
    html = get (credentials, params, response);
  else
    {
      if (params_given (params, "next") == 0)
        {
          gchar *next;
          next = g_strdup_printf ("get_%ss", type);
          params_add (params, "next", next);
          g_free (next);
        }
      html = next_page (credentials, params, response);
    }
  g_free (response);
  if (html == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a resource. "
                         "Diagnostics: Error in parameter next.",
                         "/omp?cmd=get_tasks");
  return html;
}

/**
 * @brief Perform action on resource, get next page, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  type         Type of resource.
 * @param[in]  action       Action to perform.
 *
 * @return Result of XSL transformation.
 */
char *
resource_action (credentials_t *credentials, params_t *params, const char *type,
                 const char *action)
{
  gchar *html, *response, *param_name;
  const char *resource_id;
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
      html = gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           message,
                           "/omp?cmd=get_tasks");
      g_free (message);
      return html;
    }
  g_free (param_name);

  response = NULL;
  entity = NULL;
  ret = ompf (credentials, &response, &entity,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while performing an action. "
                             "The resource remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while performing an action. "
                             "It is unclear whether the resource has been affected. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while performing an action. "
                             "It is unclear whether the resource has been affected. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tasks");
    }

  html = next_page (credentials, params, response);
  if (html == NULL)
    {
      int success;
      success = omp_success (entity);
      free_entity (entity);
      g_free (response);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           success
                            ? "An internal error occurred while performing an action. "
                              "The action, however, succeeded. "
                              "Diagnostics: Error in parameter next."
                            : "An internal error occurred while performing an action. "
                              "The action, furthermore, failed. "
                              "Diagnostics: Error in parameter next.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);
  g_free (response);
  return html;
}


/* Page handlers. */

/**
 * @todo Consider doing the input sanatizing in the page handlers.
 *
 * Currently the input sanatizing is done in serve_post, exec_omp_post and
 * exec_omp_get in gsad.c.  This means that the information about what
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
 * multiple OMP commands.
 *
 * Some, like delete_lsc_credential_omp, simply run the OMP commands inside
 * one OMP COMMANDS and leave it to the XSL to figure out the context.
 *
 * Others, like create_target_omp, run each command separately and wrap the
 * responses in a unique page tag which gives the XSL the context.
 *
 * One handler, delete_target_omp, runs all the commands in a single COMMANDS
 * and also wraps the response in a unique page tag to convey the context to
 * the XSL.  This is probably the way to go.
 */

/**
 * @brief Returns page to create a new task.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  message      If not NULL, display message.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_task (credentials_t * credentials, const char *message, params_t *params,
          const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  int apply_overrides;
  const char *alerts, *overrides;

  alerts = params_value (params, "alerts");
  overrides = params_value (params, "overrides");

  apply_overrides = overrides ? strcmp (overrides, "0") : 0;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting targets list. "
                             "The current list of targets is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<new_task>");

  /* Get list of targets. */
  if (openvas_server_send (&session,
                           "<get_targets"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Get configs to select in new task UI. */
  if (openvas_server_send (&session,
                           "<get_configs"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config list. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config list. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (command_enabled (credentials, "GET_ALERTS"))
    {
      /* Get alerts to select in new task UI. */
      if (openvas_server_send (&session,
                               "<get_alerts"
                               " sort_field=\"name\""
                               " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting alert list. "
                               "The current list of alerts is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting alert list. "
                               "The current list of alerts is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  if (command_enabled (credentials, "GET_SCHEDULES"))
    {
      /* Get schedules to select in new task UI. */
      if (openvas_server_send (&session,
                               "<get_schedules"
                               " sort_field=\"name\""
                               " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the schedule list. "
                               "The current list of schedules is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the schedule list. "
                               "The current list of schedules is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  if (command_enabled (credentials, "GET_SLAVES"))
    {
      /* Get slaves to select in new task UI. */
      if (openvas_server_send (&session,
                               "<get_slaves"
                               " filter=\"rows=-1 owner=any permission=any\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the slave list. "
                               "The current list of slaves is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the slave list. "
                               "The current list of slaves is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  if (command_enabled (credentials, "GET_GROUPS"))
    {
      /* Get groups for Observer Groups. */

      if (openvas_server_send (&session,
                               "<get_groups/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting group list. "
                               "The current list of groups is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting group list. "
                               "The current list of groups is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
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

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page to create a new task.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_task_omp (credentials_t * credentials, params_t *params)
{
  return new_task (credentials, NULL, params, NULL);
}

/**
 * @brief Create a report, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_report_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  int ret;
  gchar *xml_file_escaped, *command, *html, *response;
  gchar **xml_file_array;
  const char *task_id, *name, *comment, *xml_file;

  task_id = params_value (params, "task_id");
  xml_file = params_value (params, "xml_file");
  name = params_value (params, "name");
  comment = params_value (params, "comment");

  if (((task_id == NULL) && (name == NULL))
      || ((task_id == NULL) && (comment == NULL))
      || (xml_file == NULL))
    return new_task (credentials, "Invalid parameter", params, NULL);

  xml_file_array = g_strsplit (xml_file, "%", -1);
  if (xml_file_array != NULL && xml_file_array[0] != NULL)
    xml_file_escaped = g_strjoinv ("%%", xml_file_array);
  else
    xml_file_escaped = g_strdup (xml_file);
  g_strfreev (xml_file_array);

  if (task_id)
    command = g_strdup_printf ("<create_report>"
                               "<task id=\"%s\"/>"
                               "%s"
                               "</create_report>",
                               task_id ? task_id : "0",
                               xml_file_escaped ? xml_file_escaped : "");
  else
    command = g_strdup_printf ("<create_report>"
                               "<task>"
                               "<name>%s</name>"
                                "<comment>%s</comment>"
                               "</task>"
                               "%s"
                               "</create_report>",
                               name,
                               comment,
                               xml_file_escaped);
  g_free (xml_file_escaped);

  ret = omp (credentials,
             &response,
             &entity,
             command);
  g_free (command);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new report. "
                             "No new report was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new report. "
                             "It is unclear whether the report has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new report. "
                             "It is unclear whether the report has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tasks");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_tasks (credentials, params, response);
    }
  else
    html = new_task (credentials, NULL, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

#define CHECK(name)                                                        \
  if (name == NULL)                                                        \
    return new_task (credentials,                                          \
                     "Given " G_STRINGIFY (name) " was invalid",           \
                     params,                                               \
                     NULL)

/**
 * @brief Create a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_task_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  int ret;
  gchar *schedule_element, *slave_element, *command;
  gchar *response, *html;
  const char *name, *comment, *config_id, *target_id;
  const char *slave_id, *schedule_id, *max_checks, *max_hosts;
  const char *in_assets, *submit, *hosts_ordering, *alterable, *source_iface;
  params_t *alerts;
  GString *alert_element;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  config_id = params_value (params, "config_id");
  target_id = params_value (params, "target_id");
  hosts_ordering = params_value (params, "hosts_ordering");
  slave_id = params_value (params, "slave_id_optional");
  schedule_id = params_value (params, "schedule_id_optional");
  in_assets = params_value (params, "in_assets");
  max_checks = params_value (params, "max_checks");
  source_iface = params_value (params, "source_iface");
  max_hosts = params_value (params, "max_hosts");
  alterable = params_value (params, "alterable");

  submit = params_value (params, "submit_plus");
  if (submit && (strcmp (submit, "+") == 0))
    {
      param_t *count;
      count = params_get (params, "alerts");
      if (count)
        {
          gchar *old;
          old = count->value;
          count->value = old ? g_strdup_printf ("%i", atoi (old) + 1)
                             : g_strdup ("2");
        }
      else
        params_add (params, "alerts", "2");

      CHECK (name);
      CHECK (comment);
      CHECK (config_id);
      CHECK (target_id);
      CHECK (slave_id);
      CHECK (schedule_id);
      CHECK (in_assets);
      CHECK (max_checks);
      CHECK (max_hosts);
      CHECK (alterable);

      return new_task_omp (credentials, params);
    }

  CHECK (name);
  CHECK (comment);
  CHECK (config_id);
  CHECK (target_id);
  CHECK (hosts_ordering);
  CHECK (slave_id);
  CHECK (schedule_id);
  CHECK (in_assets);
  CHECK (max_checks);
  CHECK (source_iface);
  CHECK (max_hosts);
  CHECK (alterable);

  if (schedule_id == NULL || strcmp (schedule_id, "--") == 0)
    schedule_element = g_strdup ("");
  else
    schedule_element = g_strdup_printf ("<schedule id=\"%s\"/>", schedule_id);

  alert_element = g_string_new ("");
  alerts = params_values (params, "alert_id_optional:");
  if (alerts)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, alerts);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (alert_element,
                                  "<alert id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  if (slave_id == NULL || strcmp (slave_id, "--") == 0)
    slave_element = g_strdup ("");
  else
    slave_element = g_strdup_printf ("<slave id=\"%s\"/>", slave_id);

  command = g_strdup_printf ("<create_task>"
                             "<config id=\"%s\"/>"
                             "%s"
                             "%s"
                             "%s"
                             "<target id=\"%s\"/>"
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
                             "<scanner_name>source_iface</scanner_name>"
                             "<value>%s</value>"
                             "</preference>"
                             "</preferences>"
                             "<alterable>%i</alterable>"
                             "</create_task>",
                             config_id,
                             schedule_element,
                             alert_element->str,
                             slave_element,
                             target_id,
                             hosts_ordering,
                             name,
                             comment,
                             max_checks,
                             max_hosts,
                             strcmp (in_assets, "0") ? "yes" : "no",
                             source_iface,
                             alterable ? strcmp (alterable, "0") : 0);

  ret = omp (credentials,
             &response,
             &entity,
             command);
  g_free (command);

  g_free (schedule_element);
  g_string_free (alert_element, TRUE);
  g_free (slave_element);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new task. "
                             "No new task was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tasks");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_tasks (credentials, params, response);
    }
  else
    html = new_task (credentials, NULL, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

#undef CHECK

/**
 * @brief Delete a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_task_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("task", credentials, params, 0, NULL);
}

/**
 * @brief Setup edit_task XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_task (credentials_t * credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *task_id, *next, *refresh_interval, *sort_field, *sort_order;
  const char *overrides, *alerts;
  int apply_overrides;

  task_id = params_value (params, "task_id");
  next = params_value (params, "next");
  refresh_interval = params_value (params, "refresh_interval");
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  overrides = params_value (params, "overrides");
  alerts = params_value (params, "alerts");

  apply_overrides = overrides ? strcmp (overrides, "0") : 1;

  if (task_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a task. "
                         "The task remains as it was. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  if (next == NULL)
    next = "get_task";

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing a task. "
                             "The task remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_tasks task_id=\"%s\" details=\"1\" />"
                            "<get_targets"
                            " filter=\"sort=name rows=-1\"/>"
                            "<get_configs"
                            " filter=\"sort=name rows=-1\"/>"
                            "%s"
                            "%s"
                            "%s"
                            "%s"
                            "</commands>",
                            task_id,
                            command_enabled (credentials, "GET_ALERTS")
                             ? "<get_alerts"
                               " sort_field=\"name\""
                               " sort_order=\"ascending\"/>"
                             : "",
                            command_enabled (credentials, "GET_SCHEDULES")
                             ? "<get_schedules"
                               " sort_field=\"name\""
                               " sort_order=\"ascending\"/>"
                             : "",
                            command_enabled (credentials, "GET_SLAVES")
                             ? "<get_slaves"
                               " filter=\"rows=-1 owner=any permission=any\"/>"
                             : "",
                            command_enabled (credentials, "GET_GROUPS")
                             ? "<get_groups/>"
                             : "")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting task info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
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
                          "<refresh_interval>%s</refresh_interval>"
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>"
                          "<apply_overrides>%i</apply_overrides>",
                          task_id,
                          credentials->username,
                          alerts ? alerts : "1",
                          next,
                          refresh_interval ? refresh_interval : "",
                          sort_field,
                          sort_order,
                          apply_overrides);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting task info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_task>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup edit_task XML, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_task_omp (credentials_t * credentials, params_t *params)
{
  return edit_task (credentials, params, NULL);
}

/**
 * @brief Save task, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_task_omp (credentials_t * credentials, params_t *params)
{
  gchar *html, *response, *format;
  const char *comment, *name, *next, *schedule_id, *in_assets, *submit;
  const char *slave_id, *task_id, *max_checks, *max_hosts;
  const char *config_id, *target_id, *hosts_ordering, *alterable, *source_iface;
  int ret;
  params_t *alerts;
  GString *alert_element;
  entity_t entity;

  comment = params_value (params, "comment");
  name = params_value (params, "name");
  task_id = params_value (params, "task_id");
  next = params_value (params, "next");
  in_assets = params_value (params, "in_assets");
  target_id = params_value (params, "target_id");
  hosts_ordering = params_value (params, "hosts_ordering");
  config_id = params_value (params, "config_id");
  schedule_id = params_value (params, "schedule_id");
  slave_id = params_value (params, "slave_id");
  max_checks = params_value (params, "max_checks");
  source_iface = params_value (params, "source_iface");
  max_hosts = params_value (params, "max_hosts");
  alterable = params_value (params, "alterable");

  submit = params_value (params, "submit_plus");
  if (submit && (strcmp (submit, "+") == 0))
    {
      param_t *count;
      count = params_get (params, "alerts");
      if (count)
        {
          gchar *old;
          old = count->value;
          count->value = old ? g_strdup_printf ("%i", atoi (old) + 1)
                             : g_strdup ("2");
        }
      else
        params_add (params, "alerts", "2");

      CHECK_PARAM (name, "Edit Task", edit_task);
      CHECK_PARAM (comment, "Edit Task", edit_task);
      CHECK_PARAM (target_id, "Edit Task", edit_task);
      CHECK_PARAM (config_id, "Edit Task", edit_task);
      CHECK_PARAM (schedule_id, "Edit Task", edit_task);
      CHECK_PARAM (slave_id, "Edit Task", edit_task);
      CHECK_PARAM (next, "Edit Task", edit_task);
      CHECK_PARAM (task_id, "Edit Task", edit_task);
      CHECK_PARAM (max_checks, "Edit Task", edit_task);
      CHECK_PARAM (source_iface, "Edit Task", edit_task);
      CHECK_PARAM (max_hosts, "Edit Task", edit_task);
      CHECK_PARAM (in_assets, "Edit Task", edit_task);

      return edit_task_omp (credentials, params);
    }

  CHECK_PARAM (name, "Save Task", edit_task);
  CHECK_PARAM (comment, "Save Task", edit_task);
  CHECK_PARAM (target_id, "Save Task", edit_task);
  CHECK_PARAM (hosts_ordering, "Save Task", edit_task);
  CHECK_PARAM (config_id, "Save Task", edit_task);
  CHECK_PARAM (schedule_id, "Save Task", edit_task);
  CHECK_PARAM (slave_id, "Save Task", edit_task);
  CHECK_PARAM (next, "Save Task", edit_task);
  CHECK_PARAM (task_id, "Save Task", edit_task);
  CHECK_PARAM (max_checks, "Save Task", edit_task);
  CHECK_PARAM (source_iface, "Save Task", edit_task);
  CHECK_PARAM (max_hosts, "Save Task", edit_task);
  CHECK_PARAM (in_assets, "Save Task", edit_task);

  alert_element = g_string_new ("");
  alerts = params_values (params, "alert_id_optional:");
  if (alerts)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, alerts);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (alert_element,
                                  "<alert id=\"%s\"/>",
                                  param->value ? param->value : "");
    }

  format = g_strdup_printf ("<modify_task task_id=\"%%s\">"
                            "<name>%%s</name>"
                            "<comment>%%s</comment>"
                            "<hosts_ordering>%s</hosts_ordering>"
                            "%s"
                            "<target id=\"%%s\"/>"
                            "<config id=\"%%s\"/>"
                            "<schedule id=\"%%s\"/>"
                            "<slave id=\"%%s\"/>"
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
                            "<scanner_name>source_iface</scanner_name>"
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
  ret = ompf (credentials,
              &response,
              &entity,
              format,
              task_id,
              name,
              comment,
              target_id,
              config_id,
              schedule_id,
              slave_id,
              max_checks,
              max_hosts,
              strcmp (in_assets, "0") ? "yes" : "no",
              source_iface);
  g_free (format);

  g_string_free (alert_element, TRUE);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "The task was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tasks");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_tasks (credentials, params, response);
    }
  else
    html = edit_task (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Save container task, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_container_task_omp (credentials_t * credentials, params_t *params)
{
  gchar *format, *response, *html;
  const char *comment, *name, *task_id;
  const char *in_assets;
  int ret;
  entity_t entity;

  comment = params_value (params, "comment");
  in_assets = params_value (params, "in_assets");
  name = params_value (params, "name");
  task_id = params_value (params, "task_id");

  if (comment == NULL || name == NULL)
    return edit_task (credentials, params,
                      GSAD_MESSAGE_INVALID_PARAM ("Save Task"));

  if (task_id == NULL || in_assets == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a task. "
                         "The task remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  format = g_strdup_printf ("<modify_task task_id=\"%%s\">"
                            "<name>%%s</name>"
                            "<comment>%%s</comment>"
                            "<preferences>"
                            "<preference>"
                            "<scanner_name>in_assets</scanner_name>"
                            "<value>%%s</value>"
                            "</preference>"
                            "</preferences>"
                            "</modify_task>");

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
              format,
              task_id,
              name,
              comment,
              strcmp (in_assets, "0") ? "yes" : "no");
  g_free (format);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "No new task was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a task. "
                             "It is unclear whether the task has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tasks");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_tasks (credentials, params, response);
    }
  else
    html = edit_task (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Export a task.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Note XML on success.  HTML result of XSL transformation on error.
 */
char *
export_task_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_resource ("task", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of tasks.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Tasks XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_tasks_omp (credentials_t * credentials, params_t *params,
                  enum content_type * content_type, char **content_disposition,
                  gsize *content_length)
{
  return export_many ("task", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Stop a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
stop_task_omp (credentials_t * credentials, params_t *params)
{
  return resource_action (credentials, params, "task", "stop");
}

/**
 * @brief Pause a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
pause_task_omp (credentials_t * credentials, params_t *params)
{
  return resource_action (credentials, params, "task", "pause");
}

/**
 * @brief Resume a paused task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
resume_paused_task_omp (credentials_t * credentials, params_t *params)
{
  return resource_action (credentials, params, "task", "resume_paused");
}

/**
 * @brief Resume a stopped task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
resume_stopped_task_omp (credentials_t * credentials, params_t *params)
{
  return resource_action (credentials, params, "task", "resume_stopped");
}

/**
 * @brief Start a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
start_task_omp (credentials_t * credentials, params_t *params)
{
  return resource_action (credentials, params, "task", "start");
}

/**
 * @brief Requests NVT details, accepting extra commands.
 *
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  params            Request parameters.
 * @param[in]  commands     Extra commands to run before the others.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return XSL transformed NVT details response or error message.
 */
static char*
get_nvts (credentials_t *credentials, params_t *params, const char *commands,
          const char *extra_xml)
{
  GString *xml = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *oid;

  oid = params_value (params, "oid");
  if (oid == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting an NVT. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting nvt details. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (openvas_server_sendf (&session,
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting nvt details. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_nvts>");
  if (read_string (&session, &xml))
    {
      openvas_server_close (socket, session);
      g_string_free (xml, TRUE);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting nvt details. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Append extra_xml */
  if (extra_xml)
    g_string_append (xml, extra_xml);

  /* Get tag names */

  if (openvas_server_sendf (&session,
                            "<get_tags"
                            " filter=\"resource_type=nvt"
                            "          first=1"
                            "          rows=-1\""
                            " names_only=\"1\""
                            "/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_resources");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_resources");
    }

  g_string_append (xml, "</get_nvts>");

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Requests SecInfo.
 *
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return XSL transformed SecInfo response or error message.
 */
char *
get_info (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  char *ret;
  GString *extra_attribs;
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
      && strcmp (info_type, "dfn_cert_adv")
      && strcmp (info_type, "allinfo")
      && strcmp (info_type, "NVT")
      && strcmp (info_type, "CVE")
      && strcmp (info_type, "CPE")
      && strcmp (info_type, "OVALDEF")
      && strcmp (info_type, "DFN_CERT_ADV")
      && strcmp (info_type, "ALLINFO"))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting SecInfo. "
                         "Diagnostics: Invalid info_type parameter value",
                         "/omp?cmd=get_info");

  if (params_value (params, "info_name")
      && params_value (params, "info_id"))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting SecInfo. "
                         "Diagnostics: Both ID and Name set.",
                         "/omp?cmd=get_info");

  extra_attribs = g_string_new("");
  g_string_append_printf(extra_attribs, "type=\"%s\"",
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
  ret = get_many ("info", credentials, params, extra_xml, extra_attribs->str);

  g_string_free (extra_attribs, TRUE);

  return ret;
}

/**
 * @brief Get info, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_info_omp (credentials_t * credentials, params_t *params)
{
  return get_info (credentials, params, NULL);
}

/**
 * @brief Requests NVT details, accepting extra commands.
 *
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  params       Request parameters.
 *
 * @return XSL transformed NVT details response or error message.
 */
char*
get_nvts_omp (credentials_t *credentials, params_t *params)
{
  return get_nvts (credentials, params, NULL, NULL);
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
                    "apply_overrides=1 rows=-2 permission=any owner=any");
      else
        params_add (params, "filter",
                    "apply_overrides=0 rows=-2 permission=any owner=any");
    }
}

/**
 * @brief Get all tasks, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[in]  extra_xml         Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_tasks (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  const char *overrides;

  overrides = params_value (params, "overrides");
  if (overrides)
    /* User toggled overrides.  Set the overrides value in the filter. */
    params_toggle_overrides (params, overrides);

  return get_many ("task", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_tasks_omp (credentials_t * credentials, params_t *params)
{
  return get_tasks (credentials, params, NULL);
}

/**
 * @brief Get all tasks, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[in]  extra_xml         Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_task (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml = NULL;
  gnutls_session_t session;
  int socket, notes, get_overrides, apply_overrides;
  const char *overrides, *task_id;
  gchar *html;

  task_id = params_value (params, "task_id");
  if (task_id == NULL)
    {
      entity_t entity;

      /* Check for an ID in a CREATE_TASK response in extra_xml. */

      if (extra_xml == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a task. "
                             "Diagnostics: extra_xml is NULL.",
                             "/omp?cmd=get_tasks");

      if (parse_entity (extra_xml, &entity) == 0)
        {
          if (strcmp (entity_name (entity), "create_task_response") == 0)
            {
              param_t *param;

              param = params_add (params, "task_id", entity_attribute (entity, "id"));
              param->valid = 1;
              param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
              task_id = params_value (params, "task_id");
              assert (task_id);
              page_url_append_param (credentials, "task_id", task_id);
              free_entity (entity);
            }
          else
            {
              free_entity (entity);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a task. "
                                   "Diagnostics: CREATE_TASK response missing.",
                                   "/omp?cmd=get_tasks");
            }
        }
      else
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a task. "
                             "Diagnostics: Error parsing extra_xml.",
                             "/omp?cmd=get_tasks");
    }

  overrides = params_value (params, "overrides");
  apply_overrides = overrides ? strcmp (overrides, "0") : 1;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the status. "
                             "No update on status can be retrieved. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  notes = command_enabled (credentials, "GET_NOTES");
  get_overrides = command_enabled (credentials, "GET_OVERRIDES");
  if (openvas_server_sendf (&session,
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
                            get_overrides ? "\"/>" : "",
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the status. "
                           "No update on the requested task can be retrieved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

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
  if (read_string (&session, &xml))
    {
      openvas_server_close (socket, session);
      g_string_free (xml, TRUE);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the status. "
                           "No update of the status can be retrieved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Get tag names */

  if (openvas_server_sendf (&session,
                            "<get_tags"
                            " filter=\"resource_type=task"
                            "          first=1"
                            "          rows=-1\""
                            " names_only=\"1\""
                            "/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_resources");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_resources");
    }

  /* Get permissions */

  g_string_append (xml, "<permissions>");

  if (openvas_server_sendf (&session,
                            "<get_permissions"
                            " filter=\"name=get_tasks and resource_uuid=%s"
                            "          first=1 rows=-1\"/>",
                            task_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting permissions list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_resources");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_resources");
    }

  g_string_append (xml, "</permissions>");

  g_string_append (xml, "</get_task>");

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get a task, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_task_omp (credentials_t * credentials, params_t *params)
{
  return get_task (credentials, params, NULL);
}

/**
 * @brief Returns page to create a new LSC Credential.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_lsc_credential (credentials_t *credentials, params_t *params,
                    const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_lsc_credential>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_lsc_credential>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create an LSC credential, get all credentials, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_lsc_credential_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *login, *type, *password, *passphrase;
  const char *public_key, *private_key;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  login = params_value (params, "credential_login");
  type = params_value (params, "base");
  password = params_value (params, "lsc_password");
  passphrase = params_value (params, "passphrase");
  public_key = params_value (params, "public_key");
  private_key = params_value (params, "private_key");

  CHECK_PARAM (name, "Create LSC Credential", new_lsc_credential);
  CHECK_PARAM (comment, "Create LSC Credential", new_lsc_credential);
  CHECK_PARAM (login, "Create LSC Credential", new_lsc_credential);
  CHECK_PARAM (type, "Create LSC Credential", new_lsc_credential);

  if (type && (strcmp (type, "pass") == 0))
    CHECK_PARAM (password, "Create LSC Credential", new_lsc_credential);
  if (type && (strcmp (type, "key") == 0))
    {
      CHECK_PARAM (passphrase, "Create LSC Credential", new_lsc_credential);
      CHECK_PARAM (public_key, "Create LSC Credential", new_lsc_credential);
      CHECK_PARAM (private_key, "Create LSC Credential", new_lsc_credential);
    }

  /* Create the LSC credential. */

  if (type && strcmp (type, "gen") == 0)
    ret = ompf (credentials,
                &response,
                &entity,
                "<create_lsc_credential>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<login>%s</login>"
                "</create_lsc_credential>",
                name,
                comment ? comment : "",
               login);
  else if (type && strcmp (type, "key") == 0)
    ret = ompf (credentials,
                &response,
                &entity,
                "<create_lsc_credential>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<login>%s</login>"
                "<key>"
                "<public>%s</public>"
                "<private>%s</private>"
                "<phrase>%s</phrase>"
                "</key>"
                "</create_lsc_credential>",
                name,
                comment ? comment : "",
                login,
                public_key ? public_key : "",
                private_key ? private_key : "",
                passphrase ? passphrase : "");
  else
    ret = ompf (credentials,
                &response,
                &entity,
                "<create_lsc_credential>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<login>%s</login>"
                "<password>%s</password>"
                "</create_lsc_credential>",
                name,
                comment ? comment : "",
                login,
                password ? password : "");

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new credential. "
                             "It is unclear whether the credential has been created or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new credential. "
                             "It is unclear whether the credential has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new credential. "
                             "It is unclear whether the credential has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_lsc_credentials");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_lsc_credentials (credentials, params, response);
    }
  else
    html = new_lsc_credential (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get one LSC credential, XSL transform the result.
 *
 * @param[in]   credentials        Username and password for authentication.
 * @param[in]   params             Request parameters.
 * @param[in]   commands           Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_lsc_credential (credentials_t * credentials, params_t *params,
                    const char *extra_xml)
{
  return get_one ("lsc_credential", credentials, params, extra_xml,
                  "targets=\"1\"");
}

/**
 * @brief Get one LSC credential, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_lsc_credential_omp (credentials_t * credentials, params_t *params)
{
  return get_lsc_credential (credentials, params, NULL);
}

/**
 * @brief Export a LSC Credential in a defined format.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[in]   params       Request parameters.
 * @param[out]  result_len   Length of result.
 * @param[out]  html         Result of XSL transformation.  Required.
 * @param[out]  login        Login name return.  NULL to skip.  Only set on
 *                           success with lsc_credential_id.
 *
 * @return 0 success, 1 failure.
 */
int
download_lsc_credential_omp (credentials_t * credentials,
                             params_t *params,
                             gsize *result_len,
                             char ** html,
                             char ** login)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;
  gchar *connect_html;
  const char *lsc_credential_id, *format;

  assert (html);

  if (result_len) *result_len = 0;

  switch (manager_connect (credentials, &socket, &session, &connect_html))
    {
      case 0:
        break;
      case -1:
        if (connect_html)
          {
            *html = connect_html;
            return 1;
          }
        /* Fall through. */
      default:
        *html = gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting a credential. "
                              "Diagnostics: Failure to connect to manager daemon.",
                              "/omp?cmd=get_lsc_credentials");
        return 1;
    }

  /* Send the request. */

  lsc_credential_id = params_value (params, "lsc_credential_id");
  format = params_value (params, "package_format");

  if ((lsc_credential_id == NULL) || (format == NULL))
    {
      openvas_server_close (socket, session);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a credential. "
                            "Diagnostics: Required parameter was NULL.",
                            "/omp?cmd=get_lsc_credentials");
      return 1;
    }

  if (openvas_server_sendf (&session,
                            "<get_lsc_credentials"
                            " lsc_credential_id=\"%s\""
                            " format=\"%s\"/>",
                            lsc_credential_id,
                            format)
      == -1)
    {
      openvas_server_close (socket, session);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a credential. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_lsc_credentials");
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
      if (read_entity (&session, &entity))
        {
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a credential. "
                                "The credential is not available. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                "/omp?cmd=get_lsc_credentials");
          return 1;
        }

      credential_entity = entity_child (entity, "lsc_credential");
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
          if (result_len) *result_len = len;
          openvas_server_close (socket, session);
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
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a credential. "
                                "The credential could not be delivered. "
                                "Diagnostics: Failure to receive credential from manager daemon.",
                                "/omp?cmd=get_lsc_credentials");
          return 1;
        }
    }
  else
    {
      entity_t credential_entity, key_entity = NULL;

      /* A key. */

      entity = NULL;
      if (read_entity (&session, &entity))
        {
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a credential. "
                                "The credential could not be delivered. "
                                "Diagnostics: Failure to receive credential from manager daemon.",
                                "/omp?cmd=get_lsc_credentials");
          return 1;
        }
      openvas_server_close (socket, session);

      credential_entity = entity_child (entity, "lsc_credential");
      if (credential_entity)
        key_entity = entity_child (credential_entity, "public_key");
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
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a credential. "
                            "The credential could not be delivered. "
                            "Diagnostics: Failure to parse credential from manager daemon.",
                            "/omp?cmd=get_lsc_credentials");
      free_entity (entity);
      return 1;
    }
}

/**
 * @brief Export a LSC Credential.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return LSC Credential XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_lsc_credential_omp (credentials_t * credentials, params_t *params,
                           enum content_type * content_type,
                           char **content_disposition, gsize *content_length)
{
  return export_resource ("lsc_credential", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of LSC Credentials.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return LSC Credentials XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_lsc_credentials_omp (credentials_t * credentials, params_t *params,
                            enum content_type * content_type,
                            char **content_disposition, gsize *content_length)
{
  return export_many ("lsc_credential", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Get an LSC credentials, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  commands     Extra commands to run before the others when
 *                          lsc_credential_id is NULL.
 *
 * @return 0 success, 1 failure.
 */
static char *
get_lsc_credentials (credentials_t * credentials, params_t *params,
                     const char *extra_xml)
{
  return get_many ("lsc_credential", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get one or all LSC credentials, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return 0 success, 1 failure.
 */
char *
get_lsc_credentials_omp (credentials_t * credentials, params_t *params)
{
  return get_lsc_credentials (credentials, params, NULL);
}

/**
 * @brief Delete LSC credential, get all credentials, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_lsc_credential_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("lsc_credential", credentials, params, 0,
                          get_lsc_credentials);
}

/**
 * @brief Returns page to create a new LSC Credential.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_lsc_credential_omp (credentials_t *credentials, params_t *params)
{
  return new_lsc_credential (credentials, params, NULL);
}

/**
 * @brief Setup edit_lsc_credential XML, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 * @param[in]  extra_xml         Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
edit_lsc_credential (credentials_t * credentials, params_t *params,
                     const char *extra_xml)
{
  return edit_resource ("lsc_credential", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_lsc_credential XML, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_lsc_credential_omp (credentials_t * credentials, params_t *params)
{
  return edit_lsc_credential (credentials, params, NULL);
}

/**
 * @brief Save lsc_credential, get next page, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_lsc_credential_omp (credentials_t * credentials, params_t *params)
{
  int ret, change_password;
  gchar *html, *response;
  const char *lsc_credential_id, *name, *comment, *login, *password;
  entity_t entity;

  lsc_credential_id = params_value (params, "lsc_credential_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  login = params_value (params, "credential_login");
  password = params_value (params, "password");

  CHECK_PARAM (lsc_credential_id, "Save LSC Credential", edit_lsc_credential);
  CHECK_PARAM (name, "Save LSC Credential", edit_lsc_credential);
  CHECK_PARAM (comment, "Save LSC Credential", edit_lsc_credential);
  change_password = (params_value (params, "enable") ? 1 : 0);
  if (change_password)
    CHECK_PARAM (password, "Save LSC Credential", edit_lsc_credential);

  /* Modify the credential. */
  response = NULL;
  entity = NULL;
  if (login && change_password)
    ret = ompf (credentials,
                &response,
                &entity,
                "<modify_lsc_credential lsc_credential_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<login>%s</login>"
                "<password>%s</password>"
                "</modify_lsc_credential>",
                lsc_credential_id,
                name,
                comment,
                login,
                password);

  else if (login)
    ret = ompf (credentials,
                &response,
                &entity,
                "<modify_lsc_credential lsc_credential_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<login>%s</login>"
                "</modify_lsc_credential>",
                lsc_credential_id,
                name,
                comment,
                login);

  else if (change_password)
    ret = ompf (credentials,
                &response,
                &entity,
                "<modify_lsc_credential lsc_credential_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<password>%s</password>"
                "</modify_lsc_credential>",
                lsc_credential_id,
                name,
                comment,
                password);

  else
    ret = ompf (credentials,
                &response,
                &entity,
                "<modify_lsc_credential lsc_credential_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "</modify_lsc_credential>",
                lsc_credential_id,
                name,
                comment);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Credential. "
                             "The Credential was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Credential. "
                             "It is unclear whether the Credential has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Credential. "
                             "It is unclear whether the Credential has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_lsc_credentials");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_lsc_credentials (credentials, params, response);
    }
  else
    html = edit_lsc_credential (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Returns page to create a new agent.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_agent (credentials_t *credentials, params_t *params,
              const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_agent>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_agent>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return the new agent page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_agent_omp (credentials_t *credentials, params_t *params)
{
  return new_agent (credentials, params, NULL);
}

/**
 * @brief Create an agent, get all agents, XSL transform result.
 *
 * @param[in]  credentials          Username and password for authentication.
 * @param[in]  params               Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_agent_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  gchar *response, *html;
  const char *name, *comment, *installer, *installer_filename, *installer_sig;
  const char *howto_install, *howto_use;
  int installer_size, installer_sig_size, howto_install_size, howto_use_size;

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

  if (name == NULL || comment == NULL)
    return get_agents (credentials, params, GSAD_MESSAGE_INVALID_PARAM ("Create Agent"));
  else
    {
      int ret;
      gchar *installer_64, *installer_sig_64, *howto_install_64, *howto_use_64;
      gchar *command;

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
                                 name, comment ? "<comment>" : "",
                                 comment ? comment : "",
                                 comment ? "</comment>" : "",
                                 installer_64,
                                 installer_sig_64,
                                 installer_filename ? installer_filename : "",
                                 howto_install_64,
                                 howto_use_64);

      ret = omp (credentials,
                 &response,
                 &entity,
                 command);
      g_free (command);

      g_free (installer_64);
      g_free (howto_install_64);
      g_free (howto_use_64);

      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a new agent. "
                                "No new agent was created. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                "/omp?cmd=get_agents");
          case 2:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a new agent. "
                                "It is unclear whether the agent has been created or not. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                "/omp?cmd=get_agents");
          default:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while creating a new agent. "
                                "It is unclear whether the agent has been created or not. "
                                "Diagnostics: Internal Error.",
                                "/omp?cmd=get_agents");
        }
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_agents (credentials, params, response);
    }
  else
    html = new_agent (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete agent, get all agents, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_agent_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("agent", credentials, params, 0, get_agents);
}

/**
 * @brief Get an agent, XSL transform the result.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[in]   params       Request parameters.
 * @param[out]  result_len   Length of result.
 * @param[out]  html         Result of XSL transformation.  Required.
 * @param[out]  filename     Agent filename return.  NULL to skip.  Only set
 *                           on success with agent_id.
 *
 * @return 0 success, 1 failure.
 */
int
download_agent_omp (credentials_t * credentials,
                    params_t *params,
                    gsize *result_len,
                    char ** html,
                    char ** filename)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;
  gchar *connect_html;
  const char *agent_id, *format;

  agent_id = params_value (params, "agent_id");
  format = params_value (params, "agent_format");

  if ((agent_id == NULL) || (format == NULL))
    {
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while downloading "
                            "an agent. "
                            "Diagnostics: Required parameter was NULL.",
                            "/omp?cmd=get_agents");
      return 1;
    }

  *result_len = 0;

  switch (manager_connect (credentials, &socket, &session, &connect_html))
    {
      case 0:
        break;
      case -1:
        if (connect_html)
          {
            *html = connect_html;
            return 1;
          }
        /* Fall through. */
      default:
        {
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting the agent list. "
                                "The current list of agents is not available. "
                                "Diagnostics: Failure to connect to manager daemon.",
                                "/omp?cmd=get_agents");
          return 1;
        }
    }

  /* Send the request. */

  if (openvas_server_sendf (&session,
                            "<get_agents agent_id=\"%s\" format=\"%s\"/>",
                            agent_id,
                            format)
      == -1)
    {
      openvas_server_close (socket, session);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting agent list. "
                            "The current list of agents is not available. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_agents");
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
      if (read_entity (&session, &entity))
        {
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a agent. "
                                "The agent is not available. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                "/omp?cmd=get_agents");
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
                                                           result_len);
              if (package_decoded == NULL)
                {
                  package_decoded = (gchar *) g_strdup ("");
                  *result_len = 0;
                }
            }
          else
            {
              package_decoded = (gchar *) g_strdup ("");
              *result_len = 0;
            }
          openvas_server_close (socket, session);
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
          free_entity (entity);
          return 0;
        }
      else
        {
          free_entity (entity);
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a agent. "
                                "The agent could not be delivered. "
                                "Diagnostics: Failure to receive agent from manager daemon.",
                                "/omp?cmd=get_tasks");
          return 1;
        }
    }
  else
    {
      /* An error. */

      entity = NULL;
      if (read_entity (&session, &entity))
        {
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting a agent. "
                                "The agent could not be delivered. "
                                "Diagnostics: Failure to receive agent from manager daemon.",
                                "/omp?cmd=get_tasks");
          return 1;
        }
      openvas_server_close (socket, session);

      free_entity (entity);
      *html = gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting a agent. "
                            "The agent could not be delivered. "
                            "Diagnostics: Failure to parse agent from manager daemon.",
                            "/omp?cmd=get_tasks");
      return 1;
    }
}

/**
 * @brief Setup edit_agent XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_agent (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return edit_resource ("agent", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_agent XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_agent_omp (credentials_t * credentials, params_t *params)
{
  return edit_agent (credentials, params, NULL);
}

/**
 * @brief Modify a agent, get all agents, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_agent_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *agent_id, *name, *comment;
  entity_t entity;

  agent_id = params_value (params, "agent_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");

  CHECK_PARAM (agent_id, "Save Agent", edit_agent);
  CHECK_PARAM (name, "Save Agent", edit_agent);
  CHECK_PARAM (comment, "Save Agent", edit_agent);

  /* Modify the agent. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a agent. "
                             "The agent was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_agents");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a agent. "
                             "It is unclear whether the agent has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_agents");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a agent. "
                             "It is unclear whether the agent has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_agents");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_agents (credentials, params, response);
    }
  else
    html = edit_agent (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get one agent, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_agent (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return get_one ("agent", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get one agent, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_agent_omp (credentials_t * credentials, params_t *params)
{
  return get_agent (credentials, params, NULL);
}

/**
 * @brief Get all agents, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_agents (credentials_t * credentials, params_t *params, const char *extra_xml)
{
  return get_many ("agent", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all agents, XSL transform the result.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[in]   params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_agents_omp (credentials_t * credentials, params_t *params)
{
  return get_agents (credentials, params, NULL);
}

/**
 * @brief Verify agent, get agents, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
verify_agent_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *agent_id;
  char *ret;

  agent_id = params_value (params, "agent_id");
  if (agent_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while verifying an agent. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_agents");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying an agent. "
                             "The agent is not verified. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_agents");
    }

  if (openvas_server_sendf (&session,
                            "<verify_agent agent_id=\"%s\" />",
                            agent_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while verifying an agent. "
                           "The agent is not verified. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_agents");
    }

  xml = g_string_new ("");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while verifying an agent. "
                           "It is unclear whether the agent has been verified or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_agents");
    }

  ret = get_agents (credentials, params, xml->str);
  openvas_server_close (socket, session);
  g_string_free (xml, TRUE);
  return ret;
}

/**
 * @brief Export a agent.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Agent XML on success.  HTML result of XSL transformation on error.
 */
char *
export_agent_omp (credentials_t * credentials, params_t *params,
                  enum content_type * content_type, char **content_disposition,
                  gsize *content_length)
{
  return export_resource ("agent", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of agents.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Agents XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_agents_omp (credentials_t * credentials, params_t *params,
                    enum content_type * content_type, char **content_disposition,
                    gsize *content_length)
{
  return export_many ("agent", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Returns page to create a new alert.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_alert (credentials_t *credentials, params_t *params, const char *extra_xml)
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
  ret = omp (credentials, &response, &entity, "<get_report_formats/>");
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for new alert. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_alerts");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for new alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_alerts");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for new alert. "
                             "It is unclear whether the task has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_alerts");
    }
  g_string_append (xml, response);
  g_free (response);
  free_entity (entity);

  /* Get Report Filters. */
  ret = omp (credentials, &response, &entity,
             "<get_filters filter=\"type=result\"/>");

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Filters for new alert. "
                             "The task was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_alerts");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Filters for new alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_alerts");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Filters for new alert. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_alerts");
    }
  g_string_append (xml, response);
  g_free (response);
  free_entity (entity);

  g_string_append (xml, "</new_alert>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page to create a new alert.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_alert_omp (credentials_t *credentials, params_t *params)
{
  return new_alert (credentials, params, NULL);
}

char *
get_alerts (credentials_t *, params_t *, const char *);

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
             && strcmp (name, "status") == 0))
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
        if ((strcmp (condition, "Severity at least") == 0
             && strcmp (name, "severity") == 0)
            || (strcmp (condition, "Severity changed") == 0
             && strcmp (name, "direction") == 0))
          xml_string_append (xml,
                             "<data><name>%s</name>%s</data>",
                             name,
                             param->value ? param->value : "");
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
  if (data)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;
      int notice;
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
                || (strcmp (method, "verinice Connector") == 0
                    && (strcmp (name, "verinice_server_url") == 0
                        || strcmp (name, "verinice_server_username") == 0
                        || strcmp (name, "verinice_server_password") == 0
                        || strcmp (name, "verinice_server_report_format") == 0))
                || (strcmp (method, "Email") == 0
                    && (strcmp (name, "to_address") == 0
                        || strcmp (name, "from_address") == 0
                        || strcmp (name, "notice") == 0
                        || (strcmp (name, "notice_report_format") == 0
                            && notice == 0)
                        || (strcmp (name, "notice_attach_format") == 0
                            && notice == 2)))
                || (strcmp (method, "syslog") == 0
                    && strcmp (name, "submethod") == 0))
              xml_string_append (xml,
                                 "<data><name>%s</name>%s</data>",
                                 name,
                                 param->value ? param->value : "");
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
}

/**
 * @brief Create an alert, get all alerts, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_alert_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *condition, *event, *method, *filter_id;
  params_t *method_data, *event_data, *condition_data;
  entity_t entity;
  GString *xml;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  condition = params_value (params, "condition");
  event = params_value (params, "event");
  method = params_value (params, "method");
  filter_id = params_value (params, "filter_id");

  if (name == NULL || comment == NULL || condition == NULL || event == NULL
      || method == NULL || filter_id == NULL)
    return new_alert (credentials, params, GSAD_MESSAGE_INVALID_PARAM ("Create Alert"));

  /* Create the alert. */

  method_data = params_values (params, "method_data:");
  event_data = params_values (params, "event_data:");
  condition_data = params_values (params, "condition_data:");

  xml = g_string_new ("");

  xml_string_append (xml,
                     "<create_alert>"
                     "<name>%s</name>"
                     "<filter id=\"%s\"/>"
                     "<comment>%s</comment>"
                     "<event>%s",
                     name,
                     filter_id,
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

  ret = omp (credentials,
             &response,
             &entity,
             xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "No new alert was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_alerts");
      case 2:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            "/omp?cmd=get_alerts");
      default:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Internal Error.",
                            "/omp?cmd=get_alerts");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_alerts (credentials, params, response);
    }
  else
    html = new_alert (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete an alert, get all alerts, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_alert_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("alert", credentials, params, 0, get_alerts);
}

/**
 * @brief Get one alert, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_alert (credentials_t * credentials, params_t *params,
           const char *extra_xml)
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
      switch (omp (credentials, &response, &entity, "<get_report_formats/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Report "
                                 "Formats for the alert. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_alerts");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Report "
                                 "Formats for the alert. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_alerts");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting Report "
                                 "Formats for the alert. "
                                 "It is unclear whether the task has been saved or not. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_alerts");
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }
  html = get_one ("alert", credentials, params, extra->str, "tasks=\"1\"");
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get one alert, XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_alert_omp (credentials_t * credentials, params_t *params)
{
  return get_alert (credentials, params, NULL);
}

/**
 * @brief Get all alerts, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_alerts (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return get_many ("alert", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all alerts, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_alerts_omp (credentials_t * credentials, params_t *params)
{
  return get_alerts (credentials, params, NULL);
}

/**
 * @brief Setup edit_alert XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_alert (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html, *edit;
  const char *alert_id, *next, *filter;

  alert_id = params_value (params, "alert_id");
  next = params_value (params, "next");
  filter = params_value (params, "filter");

  if (alert_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing an alert. "
                         "The alert remains as it was. "
                         "Diagnostics: Required parameter alert_id was NULL.",
                         "/omp?cmd=get_alerts");

  if (next == NULL)
    next = "get_alerts";

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing an alert. "
                             "The alert remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_alerts");
    }

  if (openvas_server_sendf (&session,
                            "<get_alerts"
                            " alert_id=\"%s\""
                            " details=\"1\"/>",
                            alert_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting alert info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_alerts");
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

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting alert info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_alerts");
    }

  if (command_enabled (credentials, "GET_REPORT_FORMATS"))
    {
      /* Get the report formats. */

      if (openvas_server_sendf (&session,
                                "<get_report_formats/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting report formats. "
                               "The current list of report formats is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_alerts");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting report formats. "
                               "The current list of report formats is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_alerts");
        }
    }

  if (command_enabled (credentials, "GET_FILTERS"))
    {
      /* Get target locators. */

      if (openvas_server_send (&session,
                              "<get_filters"
                              " filter=\"type=result\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of filters. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_alerts");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of filters. "
                               "The current list of filters is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_filters");
        }
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_alert>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup edit_alert XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_alert_omp (credentials_t * credentials, params_t *params)
{
  return edit_alert (credentials, params, NULL);
}

/**
 * @brief Modify an alert, get all alerts, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_alert_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  int ret;
  gchar *html, *response;
  const char *name, *comment, *alert_id;
  const char *event, *condition, *method;
  const char *filter_id;
  params_t *event_data, *condition_data, *method_data;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  condition = params_value (params, "condition");
  event = params_value (params, "event");
  method = params_value (params, "method");
  alert_id = params_value (params, "alert_id");
  filter_id = params_value (params, "filter_id");

  CHECK_PARAM (name, "Save Alert", edit_alert);
  CHECK_PARAM (comment, "Save Alert", edit_alert);
  CHECK_PARAM (alert_id, "Save Alert", edit_alert);
  CHECK_PARAM (condition, "Save Alert", edit_alert);
  CHECK_PARAM (event, "Save Alert", edit_alert);
  CHECK_PARAM (method, "Save Alert", edit_alert);
  CHECK_PARAM (filter_id, "Save Alert", edit_alert);

  xml = g_string_new ("");

  /* Modify the alert. */

  event_data = params_values (params, "event_data:");
  condition_data = params_values (params, "condition_data:");
  method_data = params_values (params, "method_data:");

  xml_string_append (xml,
                     "<modify_alert alert_id=\"%s\">"
                     "<name>%s</name>"
                     "<filter id=\"%s\"/>"
                     "<comment>%s</comment>"
                     "<event>%s",
                     alert_id,
                     name,
                     filter_id,
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

  ret = omp (credentials,
             &response,
             &entity,
             xml->str);
  g_string_free (xml, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while saving a new alert. "
                            "No new alert was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_alerts");
      case 2:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while saving a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            "/omp?cmd=get_alerts");
      default:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while saving a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Internal Error.",
                            "/omp?cmd=get_alerts");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_alerts (credentials, params, response);
    }
  else
    html = edit_alert (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Test an alert, get all alerts XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
test_alert_omp (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  int socket;
  gchar *html, *response;
  const char *alert_id;
  entity_t entity;

  alert_id = params_value (params, "alert_id");

  if (alert_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while testing an alert. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_alerts");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while testing an alert. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_alerts");
    }

  /* Test the alert. */

  if (openvas_server_sendf (&session,
                            "<test_alert alert_id=\"%s\"/>",
                            alert_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an alert. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_alerts");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &response))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an alert. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_alerts");
    }
  free_entity (entity);

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  html = get_alerts (credentials, params, response);
  g_free (response);
  return html;
}

/**
 * @brief Export an alert.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Alert XML on success.  HTML result of XSL transformation on error.
 */
char *
export_alert_omp (credentials_t * credentials, params_t *params,
                  enum content_type * content_type, char **content_disposition,
                  gsize *content_length)
{
  return export_resource ("alert", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of alerts.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Alerts XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_alerts_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_many ("alert", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Returns page to create a new target.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_target (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html, *end;
  const char *filter, *first, *max;

  filter = params_value (params, "filter");
  if (filter == NULL)
    filter = "";

  first = params_value (params, "first");
  if (first == NULL)
    first = "";

  max = params_value (params, "max");
  if (max == NULL)
    max = "";

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting targets list. "
                             "The current list of targets is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  xml = g_string_new ("<new_target>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (command_enabled (credentials, "GET_LSC_CREDENTIALS"))
    {
      /* Get the credentials. */

      if (openvas_server_sendf (&session,
                                "<get_lsc_credentials"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_targets");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_targets");
        }
    }

  if (command_enabled (credentials, "GET_TARGET_LOCATORS"))
    {
      /* Get target locators. */

      if (openvas_server_send (&session,
                               "<get_target_locators/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of target locators. "
                               "The current list of schedules is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the list "
                               "of target locators. "
                               "The current list of schedules is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  if (command_enabled (credentials, "GET_PORT_LISTS"))
    {
      /* Get the port lists. */

      if (openvas_server_sendf (&session,
                                "<get_port_lists"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  end = g_markup_printf_escaped ("<filters><term>%s</term></filters>"
                                 "<targets start=\"%s\" max=\"%s\"/>"
                                 "</new_target>",
                                 filter,
                                 first,
                                 max);
  g_string_append (xml, end);
  g_free (end);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page to create a new target.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_target_omp (credentials_t *credentials, params_t *params)
{
  return new_target (credentials, params, NULL);
}

/**
 * @brief Create a target, get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_target_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response, *command;
  const char *name, *hosts, *exclude_hosts, *target_locator, *comment;
  const char *target_credential, *port, *target_smb_credential, *target_source;
  const char *port_list_id, *reverse_lookup_only, *reverse_lookup_unify;
  const char *alive_tests;
  gchar *credentials_element, *smb_credentials_element;
  gchar* source_element = NULL;
  gchar* comment_element = NULL;
  const char *username, *password;
  entity_t entity;
  GString *xml;

  name = params_value (params, "name");
  hosts = params_value (params, "hosts");
  exclude_hosts = params_value (params, "exclude_hosts");
  reverse_lookup_only = params_value (params, "reverse_lookup_only");
  reverse_lookup_unify = params_value (params, "reverse_lookup_unify");
  target_locator = params_value (params, "target_locator");
  target_source = params_value (params, "target_source");
  comment = params_value (params, "comment");
  port_list_id = params_value (params, "port_list_id");
  target_credential = params_value (params, "lsc_credential_id");
  port = params_value (params, "port");
  target_smb_credential = params_value (params, "lsc_smb_credential_id");
  alive_tests = params_value (params, "alive_tests");

  CHECK_PARAM (name, "Create Target", new_target);
  CHECK_PARAM (target_source, "Create Target", new_target)
  if (hosts == NULL && strcmp (target_source, "manual") == 0)
    return new_target (credentials, params,
                       GSAD_MESSAGE_INVALID_PARAM ("Create Target"));
  if (strcmp (target_source, "import") == 0 && name == NULL)
    {
      gchar *msg;
      msg = g_strdup_printf (GSAD_MESSAGE_INVALID,
                            "Given target_locator was invalid",
                            "Create Target");
      html = new_target (credentials, params, msg);
      g_free (msg);
      return html;
    }
  CHECK_PARAM (comment, "Create Target", new_target);
  CHECK_PARAM (port_list_id, "Create Target", new_target);
  CHECK_PARAM (target_credential, "Create Target", new_target);
  if (strcmp (target_credential, "--"))
    CHECK_PARAM (port, "Create Target", new_target);
  CHECK_PARAM (target_smb_credential, "Create Target", new_target);
  CHECK_PARAM (alive_tests, "Create Target", new_target);

  username = params_value (params, "login");
  password = params_value (params, "password");

  if (comment != NULL)
    comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
  else
    comment_element = g_strdup ("");

  if (strcmp (target_source, "import") == 0)
    source_element = g_markup_printf_escaped ("<target_locator>"
                                              "%s"
                                              "<username>%s</username>"
                                              "<password>%s</password>"
                                              "</target_locator>",
                                              target_locator,
                                              username ? username : "",
                                              password ? password : "");
  else
    source_element = g_strdup ("");

  if (strcmp (target_credential, "--") == 0)
    credentials_element = g_strdup ("");
  else
    credentials_element =
      g_strdup_printf ("<ssh_lsc_credential id=\"%s\">"
                       "<port>%s</port>"
                       "</ssh_lsc_credential>",
                       target_credential,
                       port);

  if (strcmp (target_smb_credential, "--") == 0)
    smb_credentials_element = g_strdup ("");
  else
    smb_credentials_element =
      g_strdup_printf ("<smb_lsc_credential id=\"%s\"/>",
                       target_smb_credential);

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
                     (strcmp (source_element, "") == 0)
                       ? ((strcmp (target_source, "file") == 0)
                            ? params_value (params, "file")
                            : hosts)
                       : "",
                     exclude_hosts ? exclude_hosts : "",
                     reverse_lookup_only ? reverse_lookup_only : "0",
                     reverse_lookup_unify ? reverse_lookup_unify : "0",
                     port_list_id,
                     alive_tests);

  command = g_strdup_printf ("<create_target>"
                             "%s%s%s%s%s"
                             "</create_target>",
                             xml->str,
                             comment_element,
                             source_element,
                             credentials_element,
                             smb_credentials_element);

  g_string_free (xml, TRUE);
  g_free (comment_element);
  g_free (credentials_element);
  g_free (smb_credentials_element);
  g_free (source_element);

  ret = omp (credentials,
             &response,
             &entity,
             command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new target. "
                            "No new target was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_targets");
      case 2:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new target. "
                            "It is unclear whether the target has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            "/omp?cmd=get_targets");
      default:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new target. "
                            "It is unclear whether the target has been created or not. "
                            "Diagnostics: Internal Error.",
                            "/omp?cmd=get_targets");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_targets (credentials, params, response);
    }
  else
    html = new_target (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Check a param.
 *
 * @param[in]  name  Param name.
 */
#define CHECK(name)                                                               \
  if (name == NULL)                                                               \
    return gsad_message (credentials,                                             \
                         "Internal error", __FUNCTION__, __LINE__,                \
                         "An internal error occurred while cloning a resource. "  \
                         "The resource was not cloned. "                          \
                         "Diagnostics: Required parameter '" G_STRINGIFY (name)   \
                         "' was NULL.",                                           \
                         "/omp?cmd=get_tasks");

/**
 * @brief Clone a resource, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
clone_omp (credentials_t *credentials, params_t *params)
{
  gnutls_session_t session;
  int socket;
  gchar *html, *response;
  const char *id, *type, *alterable;
  entity_t entity;

  id = params_value (params, "id");
  type = params_value (params, "resource_type");
  alterable = params_value (params, "alterable");

  CHECK (id);
  CHECK (type);

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while cloning a resource. "
                             "The resource was not cloned. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  /* Clone the resource. */

  if (alterable && strcmp (alterable, "0"))
    {
      if (openvas_server_sendf (&session,
                                "<create_%s>"
                                "<copy>%s</copy>"
                                "<alterable>1</alterable>"
                                "</create_%s>",
                                type,
                                id,
                                type)
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while cloning a resource. "
                               "The resource was not cloned. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }
  else if (openvas_server_sendf (&session,
                                 "<create_%s>"
                                 "<copy>%s</copy>"
                                 "</create_%s>",
                                 type,
                                 id,
                                 type)
           == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while cloning a resource. "
                           "The resource was not cloned. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &response))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while cloning a resource. "
                           "It is unclear whether the resource has been cloned or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);

  /* Cleanup, and return next page. */

  if (omp_success (entity) == 0 || params_given (params, "next") == 0)
    {
      gchar *next;
      next = g_strdup_printf ("get_%ss", type);
      params_add (params, "next", next);
      g_free (next);
    }
  free_entity (entity);
  html = next_page (credentials, params, response);
  g_free (response);
  if (html == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while cloning a resource. "
                         "The resource remains the same. "
                         "Diagnostics: Error in parameter next.",
                         "/omp?cmd=get_tasks");
  return html;
}

#undef CHECK

/**
 * @brief Delete a target, get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_target_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("target", credentials, params, 0, get_targets);
}

/**
 * @brief Delete a trash agent, get all agents, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_agent_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("agent", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash config, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_config_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("config", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash alert, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_alert_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("alert", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash LSC credential, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_lsc_credential_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("lsc_credential", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash report format, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_report_format_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("report_format", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash schedule, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_schedule_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("schedule", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash slave, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_slave_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("slave", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash target, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_target_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("target", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a trash task, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_task_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("task", credentials, params, 1, get_trash);
}

/**
 * @brief Restore a resource, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
restore_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *target_id;

  target_id = params_value (params, "target_id");

  if (target_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while restoring a resource. "
                         "The resource was not restored. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while restoring a resource. "
                             "The resource was not restored. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Restore the resource. */

  if (openvas_server_sendf (&session,
                            "<restore"
                            " id=\"%s\"/>",
                            target_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while restoring a resource. "
                           "The resource was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while restoring a resource. "
                           "It is unclear whether the resource has been restored or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return trash page. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, params, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Empty the trashcan, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
empty_trashcan_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while emptying the trashcan. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Empty the trash. */

  if (openvas_server_sendf (&session,
                            "<empty_trashcan/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while emptying the trashcan. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while emptying the trashcan. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return trash page. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, params, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Returns page to create a new tag.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_tag (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gchar *end;
  const char *resource_type, *resource_id, *tag_id, *tag_name;

  resource_type = params_value (params, "resource_type");
  resource_id = params_value (params, "resource_id");

  tag_id = params_value (params, "tag_id");
  tag_name = params_value (params, "tag_name");

  xml = g_string_new ("<new_tag>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  end = g_markup_printf_escaped ("<tag id=\"%s\"/>"
                                 "<resource_type>%s</resource_type>"
                                 "<resource_id>%s</resource_id>"
                                 "<tag_name>%s%s</tag_name>"
                                 "<tag_value></tag_value>"
                                 "<comment></comment>"
                                 "<active>1</active>"
                                 "</new_tag>",
                                 tag_id ? tag_id : "0",
                                 resource_type ? resource_type : "",
                                 resource_id ? resource_id : "",
                                 tag_name ? tag_name : (resource_type
                                                          ? resource_type
                                                          : "default"),
                                 tag_name ? "" : ":unnamed");
  g_string_append (xml, end);
  g_free (end);

  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page to create a new target.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_tag_omp (credentials_t *credentials, params_t *params)
{
  return new_tag (credentials, params, NULL);
}

/**
 * @brief Create a tag, get report, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_tag_omp (credentials_t *credentials, params_t *params)
{
  char *ret;
  gchar *response;
  const char *name, *comment, *value, *resource_type, *resource_id, *active;
  entity_t entity;

  name = params_value (params, "tag_name");
  comment = params_value (params, "comment");
  value = params_value (params, "tag_value");
  resource_type = params_value (params, "resource_type");
  resource_id = params_value (params, "resource_id");
  active = params_value (params, "active");

  CHECK_PARAM (name, "Create Tag", new_tag)
  CHECK_PARAM (comment, "Create Tag", new_tag)
  CHECK_PARAM (value, "Create Tag", new_tag)
  CHECK_PARAM (resource_type, "Create Tag", new_tag)
  CHECK_PARAM (resource_id, "Create Tag", new_tag)
  CHECK_PARAM (active, "Create Tag", new_tag)

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
                "<create_tag>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<value>%s</value>"
                "<resource id=\"%s\">"
                "<type>%s</type>"
                "</resource>"
                "<active>%s</active>"
                "</create_tag>",
                name,
                comment,
                value,
                resource_id,
                resource_type,
                active))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new tag. "
                             "No new tag was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_targets");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new tag. "
                             "It is unclear whether the tag has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tags");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new tag. "
                             "It is unclear whether the tag has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tags");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_tags (credentials, params, response);
    }
  else
    ret = new_tag (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete note, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_tag_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("tag", credentials, params, 0, NULL);
}

/**
 * @brief Delete a note, get all notes, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_tag_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("tag", credentials, params, 1, get_trash);
}

/**
 * @brief Setup edit_tag XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_tag (credentials_t * credentials, params_t *params,
          const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html, *edit;
  const char *tag_id;

  tag_id = params_value (params, "tag_id");
  if (tag_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a tag. "
                         "The tag remains as it was. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tags");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing a tag. "
                             "The tag remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tags");
    }

  if (openvas_server_sendf (&session,
                            "<get_tags"
                            " tag_id=\"%s\""
                            "/>",
                            tag_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tags");
    }

  xml = g_string_new ("");

  edit = g_markup_printf_escaped ("<edit_tag>"
                                  "<tag id=\"%s\"/>",
                                  tag_id);

  g_string_append (xml, edit);
  g_free (edit);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting target info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tags");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_tag>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup edit_tag XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_tag_omp (credentials_t * credentials, params_t *params)
{
  return edit_tag (credentials, params, NULL);
}

/**
 * @brief Modify a tag, get all tags, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_tag_omp (credentials_t * credentials, params_t *params)
{
  gchar *response;
  const char *name, *comment, *value, *resource_type, *resource_id, *active;
  const char *tag_id;
  entity_t entity;
  char* ret;

  tag_id = params_value (params, "tag_id");
  name = params_value (params, "tag_name");
  comment = params_value (params, "comment");
  value = params_value (params, "tag_value");
  resource_type = params_value (params, "resource_type");
  resource_id = params_value (params, "resource_id");
  active = params_value (params, "active");

  CHECK_PARAM (tag_id, "Save Tag", edit_tag)
  CHECK_PARAM (name, "Save Tag", edit_tag)
  CHECK_PARAM (comment, "Save Tag", edit_tag)
  CHECK_PARAM (value, "Save Tag", edit_tag)
  CHECK_PARAM (resource_type, "Save Tag", edit_tag)
  CHECK_PARAM (resource_id, "Save Tag", edit_tag)
  CHECK_PARAM (active, "Save Tag", edit_tag)

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
                "<modify_tag tag_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<value>%s</value>"
                "<resource id=\"%s\">"
                "<type>%s</type>"
                "</resource>"
                "<active>%s</active>"
                "</modify_tag>",
                tag_id,
                name,
                comment,
                value,
                resource_id,
                resource_type,
                active))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a tag. "
                             "The tag remains the same. "
                             "Diagnostics: Failure to send command to "
                             "manager daemon.",
                             "/omp?cmd=get_targets");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a tag. "
                             "It is unclear whether the tag has been saved "
                             "or not. "
                             "Diagnostics: Failure to receive response from "
                             "manager daemon.",
                             "/omp?cmd=get_tags");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a tag. "
                             "It is unclear whether the tag has been saved "
                             "or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tags");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_tags (credentials, params, response);
    }
  else
    ret = edit_tag (credentials, params, response);

  free_entity (entity);
  g_free (response);
  return ret;

}

/**
 * @brief Export a tag.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Target XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_tag_omp (credentials_t * credentials, params_t *params,
                enum content_type * content_type, char **content_disposition,
                gsize *content_length)
{
  return export_resource ("tag", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of tags.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Targets XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_tags_omp (credentials_t * credentials, params_t *params,
                 enum content_type * content_type, char **content_disposition,
                 gsize *content_length)
{
  return export_many ("tag", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Get one tag, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_tag (credentials_t * credentials, params_t *params,
         const char *extra_xml)
{
  return get_one ("tag", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get one tag, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_tag_omp (credentials_t * credentials, params_t *params)
{
  return get_tag (credentials, params, NULL);
}

/**
 * @brief Get all tags, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_tags (credentials_t * credentials, params_t *params,
          const char *extra_xml)
{
  return get_many ("tag", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all tags, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_tags_omp (credentials_t * credentials, params_t *params)
{
  return get_tags (credentials, params, NULL);
}

/**
 * @brief Set tag enabled status.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
toggle_tag_omp (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  int socket;
  gchar *html, *response;
  const char *tag_id, *enable;
  entity_t entity;

  tag_id = params_value (params, "tag_id");
  enable = params_value (params, "enable");

  if (tag_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while modifying a tag. "
                         "The tag was not modified. "
                         "Diagnostics: Required parameter tag_id was NULL.",
                         "/omp?cmd=get_tasks");

  if (enable == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while modifying a tag. "
                         "The tag was not modified. "
                         "Diagnostics: Required parameter enable was NULL.",
                         "/omp?cmd=get_tasks");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a tag."
                             " The tag is not modified. "
                             "Diagnostics: Failure to connect to"
                             " manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  /* Delete the resource and get all resources. */

  if (openvas_server_sendf (&session,
                            "<modify_tag tag_id=\"%s\">"
                            "<active>%s</active>"
                            "</modify_tag>",
                            tag_id,
                            enable
                            )
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while modifying a tag. "
                           "The tag is not modified. "
                           "Diagnostics: Failure to send command to"
                           " manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &response))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while modifying a tag. "
                           "It is unclear whether the tag has been modified"
                           " or not. "
                           "Diagnostics: Failure to read response from"
                           " manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);

  /* Cleanup, and return transformed XML. */

  html = next_page (credentials, params, response);
  if (html == NULL)
    html = get_tags (credentials, params, response);
  g_free (response);
  return html;
}

/**
 * @brief Setup edit_target XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_target (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html, *edit;
  const char *target_id, *next, *filter, *first, *max;

  target_id = params_value (params, "target_id");
  filter = params_value (params, "filter");
  first = params_value (params, "first");
  max = params_value (params, "max");
  next = params_value (params, "next");

  if (target_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a target. "
                         "The target remains as it was. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_targets");

  if (next == NULL)
    next = "get_target";

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing a target. "
                             "The target remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_targets"
                            " target_id=\"%s\""
                            " details=\"1\"/>"
                            "<get_target_locators/>"
                            "</commands>",
                            target_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting target info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
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

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting target info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (command_enabled (credentials, "GET_LSC_CREDENTIALS"))
    {
      /* Get the credentials. */

      if (openvas_server_sendf (&session,
                                "<get_lsc_credentials"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_targets");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_targets");
        }
    }

  if (command_enabled (credentials, "GET_PORT_LISTS"))
    {
      /* Get the port lists. */

      if (openvas_server_sendf (&session,
                                "<get_port_lists"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting targets list. "
                               "The current list of targets is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_target>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup edit_target XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_target_omp (credentials_t * credentials, params_t *params)
{
  return edit_target (credentials, params, NULL);
}

/**
 * @brief Get one target, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_target (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return get_one ("target", credentials, params, extra_xml, "tasks=\"1\"");
}

/**
 * @brief Get one target, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_target_omp (credentials_t * credentials, params_t *params)
{
  return get_target (credentials, params, NULL);
}

/**
 * @brief Get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_targets (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  return get_many ("target", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_targets_omp (credentials_t * credentials, params_t *params)
{
  return get_targets (credentials, params, NULL);
}

/**
 * @brief Modify a target, get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_target_omp (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  int socket;
  gchar *html, *response;
  const char *name, *hosts, *target_locator, *exclude_hosts, *comment;
  const char *target_credential, *port, *target_smb_credential, *target_source;
  const char *target_id, *port_list_id, *reverse_lookup_only;
  const char *reverse_lookup_unify, *alive_tests, *in_use;
  GString *command;

  alive_tests = params_value (params, "alive_tests");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  in_use = params_value (params, "in_use");
  target_id = params_value (params, "target_id");

  CHECK_PARAM (name, "Save Target", edit_target);
  CHECK_PARAM (target_id, "Save Target", edit_target);
  CHECK_PARAM (comment, "Save Target", edit_target);
  CHECK_PARAM (alive_tests, "Save Target", edit_target);
  CHECK_PARAM (in_use, "Save Target", edit_target);

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
      ret = omp (credentials, &response, &entity, command->str);
      g_string_free (command, TRUE);
      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a target. "
                                 "The target remains the same. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_targets");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a target. "
                                 "It is unclear whether the target has been saved or not. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_targets");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a target. "
                                 "It is unclear whether the target has been saved or not. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_targets");
        }

      if (omp_success (entity))
        {
          html = next_page (credentials, params, response);
          if (html == NULL)
            html = get_targets_omp (credentials, params);
        }
      else
        html = edit_target (credentials, params, response);

      free_entity (entity);
      g_free (response);
      return html;
    }

  hosts = params_value (params, "hosts");
  exclude_hosts = params_value (params, "exclude_hosts");
  reverse_lookup_only = params_value (params, "reverse_lookup_only");
  reverse_lookup_unify = params_value (params, "reverse_lookup_unify");
  target_locator = params_value (params, "target_locator");
  target_source = params_value (params, "target_source");
  port_list_id = params_value (params, "port_list_id");
  target_credential = params_value (params, "lsc_credential_id");
  port = params_value (params, "port");
  target_smb_credential = params_value (params, "lsc_smb_credential_id");

  CHECK_PARAM (target_source, "Save Target", edit_target);
  CHECK_PARAM (port_list_id, "Save Target", edit_target);
  CHECK_PARAM (target_credential, "Save Target", edit_target);
  CHECK_PARAM (target_smb_credential, "Save Target", edit_target);

  if (target_credential
      && strcmp (target_credential, "--")
      && strcmp (target_credential, "0"))
    {
      CHECK_PARAM (port, "Save Target", edit_target);
    }

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a target. "
                             "The target was not modified. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  if (hosts == NULL && strcmp (target_source, "manual") == 0)
    {
      openvas_server_close (socket, session);
      return new_target (credentials, params,
                         GSAD_MESSAGE_INVALID_PARAM ("Modify Target"));
    }
  if (strcmp (target_source, "import") == 0 && name == NULL)
    {
      gchar *msg;
      openvas_server_close (socket, session);
      msg = g_strdup_printf (GSAD_MESSAGE_INVALID,
                            "Given target_locator was invalid",
                            "Modify Target");
      html = new_target (credentials, params, msg);
      g_free (msg);
      return html;
    }

  {
    int ret;
    gchar *credentials_element, *smb_credentials_element;
    gchar* source_element = NULL;
    gchar* comment_element;
    const char *username, *password, *status;
    entity_t entity;

    username = params_value (params, "login");
    password = params_value (params, "password");

    if (comment)
      comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
    else
      comment_element = g_strdup ("");

    if (strcmp (target_source, "import") == 0)
      source_element = g_markup_printf_escaped ("<target_locator>"
                                                "%s"
                                                "<username>%s</username>"
                                                "<password>%s</password>"
                                                "</target_locator>",
                                                target_locator,
                                                username ? username : "",
                                                password ? password : "");
    else
      source_element = g_strdup ("");

    if (strcmp (target_credential, "--") == 0)
      credentials_element = g_strdup ("");
    else
      credentials_element =
        g_strdup_printf ("<ssh_lsc_credential id=\"%s\">"
                         "<port>%s</port>"
                         "</ssh_lsc_credential>",
                         target_credential,
                         port);

    if (strcmp (target_smb_credential, "--") == 0)
      smb_credentials_element = g_strdup ("");
    else
      smb_credentials_element =
        g_strdup_printf ("<smb_lsc_credential id=\"%s\"/>",
                         target_smb_credential);

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
                       (strcmp (source_element, "") == 0)
                         ? ((strcmp (target_source, "file") == 0)
                              ? params_value (params, "file")
                              : hosts)
                         : "",
                       exclude_hosts ? exclude_hosts : "",
                       reverse_lookup_only ? reverse_lookup_only : "0",
                       reverse_lookup_unify ? reverse_lookup_unify : "0",
                       port_list_id,
                       alive_tests);

    g_string_append_printf (command,
                            "%s%s%s%s"
                            "</modify_target>",
                            comment_element,
                            source_element,
                            credentials_element,
                            smb_credentials_element);

    g_free (comment_element);
    g_free (credentials_element);
    g_free (smb_credentials_element);
    g_free (source_element);

    /* Modify the target. */

    ret = openvas_server_sendf (&session, "%s", command->str);
    g_string_free (command, TRUE);

    if (ret == -1)
      {
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying target. "
                             "No target was modified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_targets");
      }

    entity = NULL;
    if (read_entity_and_text (&session, &entity, &response))
      {
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a target. "
                             "It is unclear whether the target has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_targets");
      }

    openvas_server_close (socket, session);

    status = entity_attribute (entity, "status");
    if ((status == NULL)
        || (strlen (status) == 0))
      {
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a target. "
                             "It is unclear whether the target has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_targets");
      }

    if (status[0] != '2')
      {
        html = edit_target (credentials, params, response);
        g_free (response);
        free_entity (entity);
        return html;
      }

    free_entity (entity);
  }

  /* Pass response to handler of following page. */

  html = next_page (credentials, params, response);
  if (html == NULL)
    html = get_targets (credentials, params, response);
  g_free (response);
  return html;
}

/**
 * @brief Export a target.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Target XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_target_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_resource ("target", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of targets.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Targets XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_targets_omp (credentials_t * credentials, params_t *params,
                    enum content_type * content_type, char **content_disposition,
                    gsize *content_length)
{
  return export_many ("target", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Returns page to create a new scan config.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_config (credentials_t *credentials, params_t *params,
              const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_config>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_config>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return the new scan config page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_config_omp (credentials_t *credentials, params_t *params)
{
  return new_config (credentials, params, NULL);
}

/**
 * @brief Create config, get all configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_config_omp (credentials_t * credentials, params_t *params)
{
  gchar *html, *response;
  const char *name, *comment, *base;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  base = params_value (params, "base");

  if (name == NULL || comment == NULL || base == NULL)
    return new_config (credentials, params,
                       GSAD_MESSAGE_INVALID_PARAM ("Create Scan Config"));

  /* Create the config. */

  switch (ompf (credentials,
                &response,
                &entity,
                "<create_config>"
                "<name>%s</name>"
                "<copy>%s</copy>"
                "<comment>%s</comment>"
                "</create_config>",
                name,
                base ? base : "empty",
                comment ? comment : ""))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new config. "
                            "No new config was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_configs");
      case 2:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new config. "
                            "It is unclear whether the config has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            "/omp?cmd=get_configs");
      default:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new config. "
                            "It is unclear whether the config has been created or not. "
                            "Diagnostics: Internal Error.",
                            "/omp?cmd=get_configs");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_configs (credentials, params, response);
    }
  else
    html = new_config (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Import config, get all configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
import_config_omp (credentials_t * credentials, params_t *params)
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
  ret = omp (credentials, &response, &entity, command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a config. "
                             "The schedule remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_configs");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a config. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_configs");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a config. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_configs");
    }

  /* Cleanup, and return transformed XML. */

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_configs (credentials, params, response);
    }
  else
    html = new_config (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get all scan configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_configs (credentials_t *credentials, params_t *params,
             const char *extra_xml)
{
  return get_many ("config", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all scan configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_configs_omp (credentials_t * credentials, params_t *params)
{
  return get_configs (credentials, params, NULL);
}

/**
 * @brief Get a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
static char *
get_config (credentials_t * credentials, params_t *params,
            const char *extra_xml, int edit)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *config_id;

  config_id = params_value (params, "config_id");

  if (config_id == NULL)
    {
      entity_t entity;

      /* Check for an ID in a CREATE_CONFIG response in extra_xml. */

      if (extra_xml == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a config. "
                             "Diagnostics: extra_xml is NULL.",
                             "/omp?cmd=get_configs");

      if (parse_entity (extra_xml, &entity) == 0)
        {
          if (strcmp (entity_name (entity), "create_config_response") == 0)
            {
              param_t *param;

              param = params_add (params, "config_id", entity_attribute (entity, "id"));
              param->valid = 1;
              param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);
              config_id = params_value (params, "config_id");
              assert (config_id);
              page_url_append_param (credentials, "config_id", config_id);
              free_entity (entity);
            }
          else
            {
              free_entity (entity);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a config. "
                                   "Diagnostics: CREATE_CONFIG response missing.",
                                   "/omp?cmd=get_configs");
            }
        }
      else
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a task. "
                             "Diagnostics: Error parsing extra_xml.",
                             "/omp?cmd=get_configs");


    }

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting list of configs. "
                             "The current list of configs is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
    }

  xml = g_string_new ("<get_config_response>");
  if (edit) g_string_append (xml, "<edit/>");

  if (extra_xml)
    g_string_append (xml, extra_xml);
  /* Get the config families. */

  if (openvas_server_sendf (&session,
                            "<get_configs"
                            " config_id=\"%s\""
                            " families=\"1\""
                            " tasks=\"1\""
                            " preferences=\"1\"/>",
                            config_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Get all the families. */

  if (openvas_server_sendf (&session, "<get_nvt_families/>") == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_config_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_omp (credentials_t * credentials, params_t *params)
{
  return get_config (credentials, params, NULL, 0);
}

/**
 * @brief Get a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
static char *
edit_config (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  return get_config (credentials, params, extra_xml, 1);
}

/**
 * @brief Get a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_config_omp (credentials_t * credentials, params_t *params)
{
  return edit_config (credentials, params, NULL);
}

/**
 * @brief Save details of an NVT for a config and return the next page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Following page.
 */
char *
save_config_omp (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  int socket;
  char *ret;
  gchar *html;
  const char *next;
  params_t *preferences, *selects, *trends;
  const char *config_id, *name, *comment;

  config_id = params_value (params, "config_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");

  CHECK_PARAM (config_id, "Save Config", edit_config);
  CHECK_PARAM (name, "Save Config", edit_config);
  CHECK_PARAM (comment, "Save Config", edit_config);

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a config. "
                             "The current list of configs is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
    }

  /* Save name and comment. */

  if (openvas_server_sendf_xml (&session,
                                "<modify_config config_id=\"%s\">"
                                "<name>%s</name>"
                                "<comment>%s</comment>"
                                "</modify_config>",
                                params_value (params, "config_id"),
                                name,
                                comment)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  ret = check_modify_config (credentials, &session);
  if (ret)
    {
      openvas_server_close (socket, session);
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

          if (openvas_server_sendf (&session,
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
              openvas_server_close (socket, session);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while saving a config. "
                                   "It is unclear whether the entire config has been saved. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_configs");
            }
          g_free (value);

          ret = check_modify_config (credentials, &session);
          if (ret)
            {
              openvas_server_close (socket, session);
              return ret;
            }
        }
    }

  /* Update the config. */

  trends = params_values (params, "trend:");

  if (openvas_server_sendf (&session,
                            "<modify_config config_id=\"%s\">"
                            "<family_selection>"
                            "<growing>%i</growing>",
                            params_value (params, "config_id"),
                            trends
                            && params_value (params, "trend:")
                            && strcmp (params_value (params, "trend:"), "0"))
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  selects = params_values (params, "select:");

  if (selects)
    {
      gchar *family;
      params_iterator_t iter;
      param_t *param;

      params_iterator_init (&iter, selects);
      while (params_iterator_next (&iter, &family, &param))
        if (openvas_server_sendf (&session,
                                  "<family>"
                                  "<name>%s</name>"
                                  "<all>1</all>"
                                  "<growing>%i</growing>"
                                  "</family>",
                                  family,
                                  trends && member1 (trends, family))
            == -1)
          {
            openvas_server_close (socket, session);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a config. "
                                 "It is unclear whether the entire config has been saved. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_configs");
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
          if (openvas_server_sendf (&session,
                                    "<family>"
                                    "<name>%s</name>"
                                    "<all>0</all>"
                                    "<growing>1</growing>"
                                    "</family>",
                                    family)
              == -1)
            {
              openvas_server_close (socket, session);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while saving a config. "
                                   "It is unclear whether the entire config has been saved. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_configs");
            }
        }
    }

  if (openvas_server_send (&session,
                           "</family_selection>"
                           "</modify_config>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  ret = check_modify_config (credentials, &session);
  if (ret)
    {
      openvas_server_close (socket, session);
      return ret;
    }

  openvas_server_close (socket, session);

  /* Return the next page. */

  next = params_value (params, "next:");
  if (next == NULL || strcmp (next, "Save Config") == 0)
    return get_config (credentials, params, NULL, 1);
  return get_config_family (credentials, params, 1);
}

/**
 * @brief Get details of a family for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
static char *
get_config_family (credentials_t * credentials, params_t *params, int edit)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *config_id, *name, *family, *sort_field, *sort_order;

  config_id = params_value (params, "config_id");
  name = params_value (params, "name");
  family = params_value (params, "family");

  if ((config_id == NULL) || (name == NULL) || (family == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting config family. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_configs");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting config family. "
                             "The current list of configs is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
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

  if (openvas_server_sendf (&session,
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (edit)
    {
      /* Get the details for all NVT's in the family. */

      g_string_append (xml, "<all>");

      if (openvas_server_sendf (&session,
                                "<get_nvts"
                                " details=\"1\""
                                " family=\"%s\""
                                " preference_count=\"1\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\"/>",
                                family,
                                sort_field ? sort_field : "nvts.name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting list of configs. "
                               "The current list of configs is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_configs");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting list of configs. "
                               "The current list of configs is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_configs");
        }

      g_string_append (xml, "</all>");
    }

  g_string_append (xml, "</get_config_family_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get details of a family for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_family_omp (credentials_t * credentials, params_t *params)
{
  return get_config_family (credentials, params, 0);
}

/**
 * @brief Get details of a family for editing a config, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_config_family_omp (credentials_t * credentials, params_t *params)
{
  return get_config_family (credentials, params, 1);
}

/**
 * @brief Get details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_config_family_omp (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  int socket;
  char *ret;
  gchar *html;
  const char *config_id, *family;
  params_t *nvts;

  config_id = params_value (params, "config_id");
  family = params_value (params, "family");

  if ((config_id == NULL) || (family == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving getting config family. "
                         "The config has not been saved. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_configs");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a config. "
                             "The current list of configs is not available. "
                             "The config has not been saved. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
    }

  /* Set the NVT selection. */

  if (openvas_server_sendf (&session,
                            "<modify_config config_id=\"%s\">"
                            "<nvt_selection>"
                            "<family>%s</family>",
                            config_id,
                            family)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  nvts = params_values (params, "nvt:");
  if (nvts)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, nvts);
      while (params_iterator_next (&iter, &name, &param))
        if (openvas_server_sendf (&session,
                                  "<nvt oid=\"%s\"/>",
                                  name)
            == -1)
          {
            openvas_server_close (socket, session);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a config. "
                                 "It is unclear whether the entire config has been saved. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_configs");
          }
    }

  if (openvas_server_send (&session,
                           "</nvt_selection>"
                           "</modify_config>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  ret = check_modify_config (credentials, &session);
  if (ret)
    {
      openvas_server_close (socket, session);
      return ret;
    }

  openvas_server_close (socket, session);

  /* Return the Edit family page. */

  return get_config_family (credentials, params, 1);
}

/**
 * @brief Get details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
static char *
get_config_nvt (credentials_t * credentials, params_t *params, int edit)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *config_id, *name, *family, *sort_field, *sort_order, *nvt;

  config_id = params_value (params, "config_id");
  name = params_value (params, "name");
  family = params_value (params, "family");
  nvt = params_value (params, "oid");

  if ((config_id == NULL) || (name == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting config family. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_configs");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting list of configs. "
                             "The current list of configs is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
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

  if (openvas_server_sendf (&session,
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  g_string_append (xml, "</get_config_nvt_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_nvt_omp (credentials_t * credentials, params_t *params)
{
  return get_config_nvt (credentials, params, 0);
}

/**
 * @brief Edit details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_config_nvt_omp (credentials_t * credentials, params_t *params)
{
  return get_config_nvt (credentials, params, 1);
}

/**
 * @brief Save NVT prefs for a config, get NVT details, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_config_nvt_omp (credentials_t * credentials, params_t *params)
{
  params_t *preferences;
  const char *config_id;

  config_id = params_value (params, "config_id");

  preferences = params_values (params, "preference:");
  if (preferences)
    {
      gnutls_session_t session;
      int socket;
      gchar *html;
      param_t *preference;
      gchar *preference_name;
      params_iterator_t iter;

      /* Save preferences. */

      switch (manager_connect (credentials, &socket, &session, &html))
        {
          case 0:
            break;
          case -1:
            if (html)
              return html;
            /* Fall through. */
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting list of configs. "
                                 "The current list of configs is not available. "
                                 "Diagnostics: Failure to connect to manager daemon.",
                                 "/omp?cmd=get_configs");
        }

      params_iterator_init (&iter, preferences);
      while (params_iterator_next (&iter, &preference_name, &preference))
        {
          int type_start, type_end, count, ret, is_timeout = 0;
          gchar *value;
          char *modify_config_ret;

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

              timeout = params_value (params, "timeout");

              if (timeout == NULL)
                {
                  g_free (value);
                  openvas_server_close (socket, session);
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while saving a config. "
                                       "It is unclear whether the entire config has been saved. "
                                       "Diagnostics: Required parameter was NULL.",
                                       "/omp?cmd=get_configs");
                }

              if (strcmp (timeout, "0") == 0)
                /* Leave out the value to clear the preference. */
                ret = openvas_server_sendf (&session,
                                            "<modify_config config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id,
                                            preference_name);
              else
                ret = openvas_server_sendf (&session,
                                            "<modify_config config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "<value>%s</value>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id,
                                            preference_name,
                                            value);
            }
          else
            ret = openvas_server_sendf (&session,
                                        "<modify_config config_id=\"%s\">"
                                        "<preference>"
                                        "<nvt oid=\"%s\"/>"
                                        "<name>%s</name>"
                                        "<value>%s</value>"
                                        "</preference>"
                                        "</modify_config>",
                                        config_id,
                                        params_value (params, "oid"),
                                        preference_name,
                                        value);

          if (ret == -1)
            {
              g_free (value);
              openvas_server_close (socket, session);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while saving a config. "
                                   "It is unclear whether the entire config has been saved. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_configs");
            }
          g_free (value);

          modify_config_ret = check_modify_config (credentials, &session);
          if (modify_config_ret)
            {
              openvas_server_close (socket, session);
              return modify_config_ret;
            }
        }

      openvas_server_close (socket, session);
    }

  /* Return the Edit NVT page. */

  return get_config_nvt (credentials, params, 1);
}

/**
 * @brief Delete config, get all configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_config_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("config", credentials, params, 0, get_configs);
}

/**
 * @brief Export a config.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content dispositions return.
 * @param[out]  content_length       Content length return.
 *
 * @return Config XML on success.  HTML result of XSL transformation on error.
 */
char *
export_config_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_resource ("config", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of scan configs.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Scan configs XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_configs_omp (credentials_t * credentials, params_t *params,
                    enum content_type * content_type, char **content_disposition,
                    gsize *content_length)
{
  return export_many ("config", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Export a note.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Note XML on success.  HTML result of XSL transformation on error.
 */
char *
export_note_omp (credentials_t * credentials, params_t *params,
                 enum content_type * content_type, char **content_disposition,
                 gsize *content_length)
{
  return export_resource ("note", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of notes.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Notes XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_notes_omp (credentials_t * credentials, params_t *params,
                    enum content_type * content_type, char **content_disposition,
                    gsize *content_length)
{
  return export_many ("note", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Export an override.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Override XML on success.  HTML result of XSL transformation on error.
 */
char *
export_override_omp (credentials_t * credentials, params_t *params,
                     enum content_type * content_type, char **content_disposition,
                     gsize *content_length)
{
  return export_resource ("override", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of overrides.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Overrides XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_overrides_omp (credentials_t * credentials, params_t *params,
                      enum content_type * content_type,
                      char **content_disposition, gsize *content_length)
{
  return export_many ("override", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Export a Port List.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Port List XML on success.  HTML result of XSL transformation on
 *         error.
 */
char *
export_port_list_omp (credentials_t * credentials, params_t *params,
                      enum content_type * content_type,
                      char **content_disposition, gsize *content_length)
{
  return export_resource ("port_list", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of Port Lists.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Port Lists XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_port_lists_omp (credentials_t * credentials, params_t *params,
                       enum content_type * content_type, char **content_disposition,
                       gsize *content_length)
{
  return export_many ("port_list", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Export a file preference.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content dispositions return.
 * @param[out]  content_length       Content length return.
 *
 * @return Config XML on success.  HTML result of XSL transformation on error.
 */
char *
export_preference_file_omp (credentials_t * credentials, params_t *params,
                            enum content_type * content_type, char **content_disposition,
                            gsize *content_length)
{
  GString *xml;
  entity_t entity, preference_entity, value_entity;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *config_id, *oid, *preference_name;

  *content_length = 0;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a preference file. "
                             "The file could not be delivered. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  config_id = params_value (params, "config_id");
  oid = params_value (params, "oid");
  preference_name = params_value (params, "preference_name");

  xml = g_string_new ("<get_preferences_response>");

  if (config_id == NULL || oid == NULL || preference_name == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Export Preference File"));
  else
    {
      if (openvas_server_sendf (&session,
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
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      entity = NULL;
      if (read_entity (&session, &entity))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      preference_entity = entity_child (entity, "preference");
      if (preference_entity != NULL
          && (value_entity = entity_child (preference_entity, "value")))
        {
          char *content = strdup (entity_text (value_entity));
          *content_type = GSAD_CONTENT_TYPE_OCTET_STREAM;
          *content_disposition = g_strdup_printf ("attachment; filename=\"pref_file.bin\"");
          *content_length = strlen (content);
          free_entity (entity);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return content;
        }
      else
        {
          free_entity (entity);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to receive file from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  g_string_append (xml, "</get_preferences_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Export a report format.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Report format XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_report_format_omp (credentials_t * credentials, params_t *params,
                          enum content_type * content_type, char **content_disposition,
                          gsize *content_length)
{
  return export_resource ("report_format", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of Report Formats.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Report Formats XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_report_formats_omp (credentials_t * credentials, params_t *params,
                           enum content_type * content_type,
                           char **content_disposition, gsize *content_length)
{
  return export_many ("report_format", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Delete report, get task status, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_report_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("report", credentials, params, 0, NULL);
}

/**
 * @brief Get a report and return the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  commands     Extra commands to run before the others.
 * @param[out] report_len   Length of report.
 * @param[out] content_type         Content type if known, else NULL.
 * @param[out] content_disposition  Content disposition, if content_type set.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 * @param[out] error        Set to 1 if error, else 0.
 *
 * @return Report.
 */
char *
get_report (credentials_t * credentials, params_t *params, const char *commands,
            gsize *report_len, gchar **content_type, char **content_disposition,
            const char *extra_xml, int *error)
{
  GString *xml, *commands_xml;
  entity_t entity;
  entity_t report_entity;
  gnutls_session_t session;
  int socket;
  gchar *html;
  unsigned int first, max;
  GString *levels, *delta_states;
  const char *alert_id, *search_phrase, *min_cvss_base, *type;
  const char *autofp, *autofp_value, *notes, *overrides, *result_hosts_only;
  const char *report_id, *sort_field, *sort_order, *result_id, *delta_report_id;
  const char *format_id, *first_result, *max_results, *host, *pos;
  const char *given_filt_id, *filt_id, *filter, *apply_filter, *report_section;
  const char *host_search_phrase, *host_levels;
  const char *host_first_result, *host_max_results;
  int ret;
  int ignore_filter;
  gchar *esc_response;

  if (params_given (params, "apply_filter")
      && params_valid (params, "apply_filter"))
    apply_filter = params_value (params, "apply_filter");
  else
    apply_filter = "0";

  if (params_given (params, "report_section")
      && params_valid (params, "report_section"))
    report_section = params_value (params, "report_section");
  else
    report_section = "";

  ignore_filter = (strcmp (apply_filter, "1")
                   && strcmp (report_section, "")
                   && strcmp (report_section, "results")
                   && strcmp (report_section, "summary"));

  alert_id = params_value (params, "alert_id");
  if (alert_id == NULL)
    params_given (params, "alert_id") || (alert_id = "0");

  search_phrase = params_value (params, "search_phrase");
  if (search_phrase == NULL)
    params_given (params, "search_phrase") || (search_phrase = "");

  if (params_given (params, "min_cvss_base"))
    {
      if (params_valid (params, "min_cvss_base"))
        {
          if (params_value (params, "apply_min_cvss_base")
              && strcmp (params_value (params, "apply_min_cvss_base"), "0"))
            min_cvss_base = params_value (params, "min_cvss_base");
          else
            min_cvss_base = "";
        }
      else
        min_cvss_base = NULL;
    }
  else
    min_cvss_base = "";

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
        /* Use the max_results params to determine if the request is from
         * the Result Filtering form, because the notes param is only sent
         * when the checkbox is ticked. */
        notes = "0";
      else
        params_given (params, "notes") || (notes = "1");
    }

  overrides = params_value (params, "overrides");
  if (overrides == NULL)
    params_given (params, "overrides") || (overrides = "0");

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

  if (content_type) *content_type = NULL;
  if (report_len) *report_len = 0;

  if (autofp == NULL || strlen (autofp) == 0) autofp = "0";

  if (autofp_value == NULL || strlen (autofp_value) == 0) autofp_value = "1";

  if (strcmp (autofp, "2") == 0)
    autofp_value = "2";

  if (notes == NULL || strlen (notes) == 0) notes = "1";

  if (overrides == NULL || strlen (overrides) == 0) overrides = "1";

  if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
    result_hosts_only = "1";

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        {
          if (error) *error = 1;
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to connect to manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  /* Run any extra commands. */

  commands_xml = g_string_new ("");
  if (commands)
    {
      if (openvas_server_send (&session, commands)
          == -1)
        {
          g_string_free (commands_xml, TRUE);
          openvas_server_close (socket, session);
          if (error) *error = 1;
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to send extra commands to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &commands_xml))
        {
          g_string_free (commands_xml, TRUE);
          openvas_server_close (socket, session);
          if (error) *error = 1;
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
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
    g_string_append (levels, "hmlg");

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  report_id = params_value (params, "report_id");

  if (strcmp (alert_id, "0"))
    {
      const char *status, *esc_notes, *esc_overrides, *esc_result_hosts_only;
      const char *esc_first_result, *esc_max_results;
      const char *esc_search_phrase, *esc_min_cvss_base;

      esc_notes = params_value (params, "esc_notes");
      if (esc_notes == NULL)
        params_given (params, "esc_notes") || (esc_notes = "0");

      esc_overrides = params_value (params, "esc_overrides");
      if (esc_overrides == NULL)
        params_given (params, "esc_overrides") || (esc_overrides = "0");

      esc_result_hosts_only = params_value (params, "esc_result_hosts_only");
      if (esc_result_hosts_only == NULL)
        params_given (params, "esc_result_hosts_only")
          || (esc_result_hosts_only = "0");

      esc_first_result = params_value (params, "esc_first_result");
      if (esc_first_result == NULL
          || sscanf (esc_first_result, "%u", &first) != 1)
        esc_first_result = "1";

      esc_max_results = params_value (params, "esc_max_results");
      if (esc_max_results == NULL
          || sscanf (esc_max_results, "%u", &max) != 1)
        esc_max_results = G_STRINGIFY (RESULTS_PER_PAGE);

      esc_search_phrase = params_value (params, "esc_search_phrase");
      if (esc_search_phrase == NULL)
        params_given (params, "esc_search_phrase") || (esc_search_phrase = "");

      if (params_given (params, "esc_min_cvss_base"))
        {
          if (params_valid (params, "esc_min_cvss_base"))
            {
              if (params_value (params, "esc_apply_min_cvss_base")
                  && strcmp (params_value (params, "esc_apply_min_cvss_base"),
                                           "0"))
                esc_min_cvss_base = params_value (params, "esc_min_cvss_base");
              else
                esc_min_cvss_base = "";
            }
          else
            esc_min_cvss_base = NULL;
        }
      else
        esc_min_cvss_base = "";

      if (ignore_filter)
        ret = openvas_server_sendf_xml (&session,
                                        "<get_reports"
                                        " autofp=\"0\""
                                        " notes=\"1\""
                                        " notes_details=\"1\""
                                        " apply_overrides=\"0\""
                                        " overrides=\"1\""
                                        " overrides_details=\"1\""
                                        " result_hosts_only=\"0\""
                                        " report_id=\"%s\""
                                        " first_result=\"1\""
                                        " max_results=\"-1\""
                                        " sort_field=\"severity\""
                                        " sort_order=\"ascending\""
                                        " levels=\"hmlgfd\""
                                        " delta_states=\"\""
                                        " search_phrase=\"\""
                                        " min_cvss_base=\"\""
                                        " alert_id=\"%s\"/>",
                                        report_id,
                                        alert_id);
      else
        ret = openvas_server_sendf_xml (&session,
                                        "<get_reports"
                                        " autofp=\"%s\""
                                        " notes=\"%i\""
                                        " notes_details=\"1\""
                                        " apply_overrides=\"%i\""
                                        " overrides=\"%i\""
                                        " overrides_details=\"1\""
                                        " result_hosts_only=\"%i\""
                                        " report_id=\"%s\""
                                        " first_result=\"%s\""
                                        " max_results=\"%s\""
                                        " sort_field=\"%s\""
                                        " sort_order=\"%s\""
                                        " levels=\"%s\""
                                        " delta_states=\"%s\""
                                        " search_phrase=\"%s\""
                                        " min_cvss_base=\"%s\""
                                        " alert_id=\"%s\"/>",
                                        strcmp (autofp, "0") ? autofp_value
                                                             : "0",
                                        strcmp (esc_notes, "0") ? 1 : 0,
                                        strcmp (esc_overrides, "0") ? 1 : 0,
                                        strcmp (esc_overrides, "0") ? 1 : 0,
                                        strcmp (esc_result_hosts_only, "0") ? 1
                                                                            : 0,
                                        report_id,
                                        esc_first_result,
                                        esc_max_results,
                                        sort_field ? sort_field : "severity",
                                        sort_order
                                        ? sort_order
                                        : ((sort_field == NULL
                                            || (strcmp (sort_field, "severity")
                                                == 0)
                                            || (strcmp (sort_field, "type")
                                                == 0))
                                            ? "descending"
                                            : "ascending"),
                                        params_value (params, "esc_levels"),
                                        delta_states->str,
                                        esc_search_phrase,
                                        esc_min_cvss_base,
                                        alert_id);
      if (ret == -1)
        {
          openvas_server_close (socket, session);
          g_string_free (commands_xml, TRUE);
          g_string_free (delta_states, TRUE);
          g_string_free (levels, TRUE);
          if (error) *error = 1;
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_entity_and_text (&session, &entity, &esc_response))
        {
          openvas_server_close (socket, session);
          g_string_free (commands_xml, TRUE);
          g_string_free (delta_states, TRUE);
          g_string_free (levels, TRUE);
          if (error) *error = 1;
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
      status = entity_attribute (entity, "status");
      if ((status == NULL)
          || (strlen (status) == 0))
        {
          free_entity (entity);
          openvas_server_close (socket, session);
          g_string_free (commands_xml, TRUE);
          g_string_free (delta_states, TRUE);
          if (error) *error = 1;
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to parse response from manager daemon.",
                               "/omp?cmd=get_tasks");
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

  if (openvas_server_sendf (&session,
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
      openvas_server_close (socket, session);
      g_string_free (delta_states, TRUE);
      g_string_free (commands_xml, TRUE);
      g_string_free (levels, TRUE);
      if (error) *error = 1;
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  given_filt_id = params_value (params, "filt_id");
  filter = params_value (params, "filter");

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
          openvas_server_close (socket, session);
          g_string_free (commands_xml, TRUE);
          g_string_free (levels, TRUE);
          xml = g_string_new ("");
          g_string_append_printf (xml, GSAD_MESSAGE_INVALID,
                                  "Given host search_phrase was invalid",
                                  "Get Report");
          return g_string_free (xml, FALSE);
        }

      ret = openvas_server_sendf_xml (&session,
                                      " host_search_phrase=\"%s\""
                                      " host_levels=\"%s\""
                                      " host_first_result=\"%s\""
                                      " host_max_results=\"%s\"",
                                      host_search_phrase,
                                      host_levels,
                                      host_first_result,
                                      host_max_results);
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
      filt_id = "-2";

  if (ignore_filter)
    ret = openvas_server_sendf_xml (&session,
                                    " filt_id=\"0\""
                                    " filter=\"\""
                                    " pos=\"1\""
                                    " autofp=\"0\""
                                    " notes=\"1\""
                                    " notes_details=\"1\""
                                    " apply_overrides=\"1\""
                                    " overrides=\"1\""
                                    " overrides_details=\"1\""
                                    " result_hosts_only=\"0\""
                                    " report_id=\"%s\""
                                    " delta_report_id=\"%s\""
                                    " format_id=\"%s\""
                                    " first_result=\"1\""
                                    " max_results=\"-1\""
                                    " sort_field=\"severity\""
                                    " sort_order=\"ascending\""
                                    " levels=\"hmlgfd\""
                                    " delta_states=\"\""
                                    " search_phrase=\"\""
                                    " min_cvss_base=\"\"/>",
                                    (type && ((strcmp (type, "assets") == 0)
                                              || (strcmp (type, "prognostic")
                                                  == 0)))
                                      ? ""
                                      : report_id,
                                    delta_report_id ? delta_report_id : "0",
                                    format_id
                                     ? format_id
                                     : "a994b278-1f62-11e1-96ac-406186ea4fc5");
  else
    ret = openvas_server_sendf_xml (&session,
                                    " filt_id=\"%s\""
                                    " filter=\"%s\""
                                    " pos=\"%s\""
                                    " autofp=\"%s\""
                                    " notes=\"%i\""
                                    " notes_details=\"1\""
                                    " apply_overrides=\"%i\""
                                    " overrides=\"%i\""
                                    " overrides_details=\"1\""
                                    " result_hosts_only=\"%i\""
                                    " report_id=\"%s\""
                                    " delta_report_id=\"%s\""
                                    " format_id=\"%s\""
                                    " first_result=\"%s\""
                                    " max_results=\"%s\""
                                    " sort_field=\"%s\""
                                    " sort_order=\"%s\""
                                    " levels=\"%s\""
                                    " delta_states=\"%s\""
                                    " search_phrase=\"%s\""
                                    " min_cvss_base=\"%s\"/>",
                                    filt_id ? filt_id : "0",
                                    filter ? filter : "",
                                    pos ? pos : "1",
                                    strcmp (autofp, "0") ? autofp_value : "0",
                                    strcmp (notes, "0") ? 1 : 0,
                                    strcmp (overrides, "0") ? 1 : 0,
                                    strcmp (overrides, "0") ? 1 : 0,
                                    strcmp (result_hosts_only, "0") ? 1 : 0,
                                    (type && ((strcmp (type, "assets") == 0)
                                              || (strcmp (type, "prognostic")
                                                  == 0)))
                                     ? ""
                                     : report_id,
                                    delta_report_id ? delta_report_id : "0",
                                    format_id
                                     ? format_id
                                     : "a994b278-1f62-11e1-96ac-406186ea4fc5",
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
                                    min_cvss_base);
  if (ret == -1)
    {
      openvas_server_close (socket, session);
      g_string_free (delta_states, TRUE);
      g_string_free (commands_xml, TRUE);
      g_string_free (levels, TRUE);
      if (error) *error = 1;
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  g_string_free (delta_states, TRUE);

  if (format_id)
    {
      g_string_free (commands_xml, TRUE);
      g_string_free (levels, TRUE);
      if (strcmp (format_id, "a994b278-1f62-11e1-96ac-406186ea4fc5") == 0)
        {
          const char *extension, *requested_content_type;
          /* Manager sends XML report as plain XML. */

          if (read_entity (&session, &entity))
            {
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_tasks");
            }
          openvas_server_close (socket, session);
          entity_t report = entity_child (entity, "report");
          if (report == NULL)
            {
              free_entity (entity);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Response from manager daemon did not contain a report.",
                                   "/omp?cmd=get_tasks");
            }
          extension = entity_attribute (report, "extension");
          requested_content_type = entity_attribute (report, "content_type");
          if (extension && requested_content_type && content_type
              && content_disposition)
            {
              *content_type = g_strdup (requested_content_type);
              *content_disposition
                = g_strdup_printf ("attachment; filename=report-%s.%s",
                                   (type && ((strcmp (type, "assets") == 0)
                                             || (strcmp (type, "prognostic") == 0)))
                                    ? type
                                    : report_id,
                                   extension);
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

          if (report_len == NULL)
            {
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Parameter error.",
                                   "/omp?cmd=get_tasks");
            }

          entity = NULL;
          if (read_entity (&session, &entity))
            {
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          report_entity = entity_child (entity, "report");
          if (report_entity != NULL)
            {
              const char *extension, *requested_content_type;
              char *report_encoded;
              gchar *report_decoded;
              extension = entity_attribute (report_entity, "extension");
              requested_content_type = entity_attribute (report_entity,
                                                         "content_type");
              report_encoded = entity_text (report_entity);
              report_decoded =
                (gchar *) g_base64_decode (report_encoded, report_len);
              /* g_base64_decode can return NULL (Glib 2.12.4-2), at least
               * when *report_len is zero. */
              if (report_decoded == NULL)
                {
                  report_decoded = g_strdup ("");
                  *report_len = 0;
                }
              if (extension && requested_content_type && content_type
                  && content_disposition)
                {
                  const char *id;
                  if (report_id)
                    id = report_id;
                  else if (type && (strcmp (type, "prognostic") == 0))
                    id = "prognostic";
                  else
                    id = "ERROR";
                  *content_type = g_strdup (requested_content_type);
                  *content_disposition
                    = g_strdup_printf ("attachment; filename=report-%s.%s",
                                       id,
                                       extension);
                }
              free_entity (entity);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return report_decoded;
            }
          else
            {
              free_entity (entity);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive report from manager daemon.",
                                   "/omp?cmd=get_tasks");
            }
        }
    }
  else
    {
      gchar *task_id = NULL;

      /* Format is NULL, send XSL transformed XML. */

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
      if (read_entity_and_string (&session, &entity, &xml))
        {
          openvas_server_close (socket, session);
          if (error) *error = 1;
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
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
          if (openvas_server_send (&session, "<get_report_formats"
                                             " sort_field=\"name\""
                                             " sort_order=\"ascending\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          if (read_string (&session, &xml))
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_tasks");
            }
        }

      if (type && (strcmp (type, "prognostic") == 0))
        {
          if (command_enabled (credentials, "GET_FILTERS"))
            {
              /* Get the filters. */

              g_string_append (xml, "<filters>");

              if (openvas_server_sendf_xml (&session,
                                            "<get_filters"
                                            " filter=\"type=result\"/>")
                  == -1)
                {
                  g_string_free (xml, TRUE);
                  openvas_server_close (socket, session);
                  if (error) *error = 1;
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while getting the filter list. "
                                       "The current list of filters is not available. "
                                       "Diagnostics: Failure to send command to manager daemon.",
                                       "/omp?cmd=get_tasks");
                }

              if (read_string (&session, &xml))
                {
                  g_string_free (xml, TRUE);
                  openvas_server_close (socket, session);
                  if (error) *error = 1;
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while getting the filter list. "
                                       "The current list of filters is not available. "
                                       "Diagnostics: Failure to receive response from manager daemon.",
                                       "/omp?cmd=get_tasks");
                }

              g_string_append (xml, "</filters>");
            }

          g_string_append (xml, "</get_prognostic_report>");
          openvas_server_close (socket, session);
          return g_string_free (xml, FALSE);
        }

      if (type && (strcmp (type, "assets") == 0))
        {
          if (host)
            g_string_append (xml, "</get_asset>");
          else
            g_string_append (xml, "</get_report>");
          openvas_server_close (socket, session);
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
          if (openvas_server_sendf (&session,
                                    "<get_tasks task_id=\"%s\" details=\"0\" />",
                                    task_id)
              == -1)
            {
              g_free (task_id);
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          if (read_string (&session, &xml))
            {
              g_free (task_id);
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          g_free (task_id);
        }

      if (delta_report_id && result_id && strcmp (result_id, "0"))
        {
          g_string_append (xml, "</get_delta_result>");
          openvas_server_close (socket, session);
          return g_string_free (xml, FALSE);
        }

      if (command_enabled (credentials, "GET_REPORT_FORMATS"))
        {
          if (openvas_server_send (&session, "<get_report_formats"
                                             " sort_field=\"name\""
                                             " sort_order=\"ascending\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          if (read_string (&session, &xml))
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_tasks");
            }
        }

      if (command_enabled (credentials, "GET_ALERTS"))
        {
          if (openvas_server_send (&session, "<get_alerts"
                                             " sort_field=\"name\""
                                             " sort_order=\"ascending\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          if (read_string (&session, &xml))
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_tasks");
            }
        }

      if (command_enabled (credentials, "GET_FILTERS"))
        {
          /* Get the filters. */

          g_string_append (xml, "<filters>");

          if (openvas_server_sendf_xml (&session,
                                        "<get_filters"
                                        " filter=\"type=result\"/>")
              == -1)
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting the filter list. "
                                   "The current list of filters is not available. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          if (read_string (&session, &xml))
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              if (error) *error = 1;
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting the filter list. "
                                   "The current list of filters is not available. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_tasks");
            }

          g_string_append (xml, "</filters>");
        }

      /* Get tag names */

      if (openvas_server_sendf (&session,
                                "<get_tags"
                                " filter=\"resource_type=report"
                                "          first=1"
                                "          rows=-1\""
                                " names_only=\"1\""
                                "/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to send command to manager daemon.",
                              "/omp?cmd=get_resources");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occurred while getting tag names list. "
                              "The current list of resources is not available. "
                              "Diagnostics: Failure to receive response from manager daemon.",
                              "/omp?cmd=get_resources");
        }

      g_string_append (xml, "</get_report>");
      openvas_server_close (socket, session);
      return g_string_free (xml, FALSE);
    }
}

/**
 * @brief Get a report and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] report_len   Length of report.
 * @param[out] content_type         Content type if known, else NULL.
 * @param[out] content_disposition  Content disposition, if content_type set.
 *
 * @return Report.
 */
char *
get_report_omp (credentials_t * credentials, params_t *params,
                gsize *report_len, gchar ** content_type,
                char **content_disposition)
{
  char *result;
  int error = 0;

  result = get_report (credentials, params, NULL, report_len, content_type,
                       content_disposition, NULL, &error);

  return error ? result : xsl_transform_omp (credentials, result);
}

/**
 * @brief Get all reports, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_reports (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  gchar *html;
  GString *extra;
  const char *overrides;

  overrides = params_value (params, "overrides");
  if (overrides)
    /* User toggled overrides.  Set the overrides value in the filter. */
    params_toggle_overrides (params, overrides);

  extra = g_string_new ("");
  if (command_enabled (credentials, "GET_TASKS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (omp (credentials, &response, &entity,
                   "<get_tasks details=\"0\"/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the reports. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_tasks");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the reports. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_tasks");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the reports. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_tasks");
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }
  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = get_many ("report", credentials, params, extra->str, NULL);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get all reports, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_reports_omp (credentials_t * credentials, params_t *params)
{
  return get_reports (credentials, params, NULL);
}

/**
 * @brief Get the hosts for a report, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
static char *
get_report_section (credentials_t * credentials, params_t *params,
                    const char *extra_xml)
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
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred."
                         " Diagnostics: report_id was NULL.",
                         "/omp?cmd=get_tasks");

  if (!strcmp (report_section, "results"))
    {
      char *result;

      result = get_report (credentials, params, NULL, NULL, NULL, NULL,
                           extra_xml, &error);

      return error ? result : xsl_transform_omp (credentials, result);
    }

  result = get_report (credentials, params, NULL, NULL, NULL,
                       NULL, NULL, &error);
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

      ret = omp (credentials,
                 &response,
                 NULL,
                 "<get_report_formats/>");

      switch (ret)
        {
          case 0:
          case -1:
            break;
          case 1:
            g_string_free (xml, TRUE);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting the "
                                "result formats list. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                "/omp?cmd=get_tasks");
          case 2:
            g_string_free (xml, TRUE);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting the "
                                "result formats list. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                "/omp?cmd=get_tasks");
          default:
            g_string_free (xml, TRUE);
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting the "
                                "result formats list. "
                                "Diagnostics: Internal Error.",
                                "/omp?cmd=get_tasks");
        }

      g_string_append (xml, response);
      free (response);
    }

  g_string_append_printf (xml, "</get_report_%s_response>", report_section);

  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get a report section, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_report_section_omp (credentials_t * credentials, params_t *params)
{
  return get_report_section (credentials, params, NULL);
}

/**
 * @brief Get an SSL Certificate.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  response_size  Size of cert.
 *
 * @return SSL Certificate.
 */
char *
download_ssl_cert (credentials_t * credentials, params_t *params,
                   gsize *response_size)
{
  const char *ssl_cert;
  gchar *cert;
  char *unescaped;

  ssl_cert = params_value (params, "ssl_cert");
  if (ssl_cert == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred."
                         " Diagnostics: ssl_cert was NULL.",
                         "/omp?cmd=get_reports");

  /* The Base64 comes URI escaped as it may contain special characters. */
  unescaped = g_uri_unescape_string (ssl_cert, NULL);

  cert = g_strdup_printf ("-----BEGIN CERTIFICATE-----\n"
                          "%s\n-----END CERTIFICATE-----\n",
                          unescaped);

  *response_size = strlen (cert);

  g_free (unescaped);
  return cert;
}

/**
 * @brief Export a result.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Result XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_result_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_resource ("result", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Get one result, XSL transform the result.
 *
 * @param[in]  credentials      Username and password for authentication.
 * @param[in]  result_id        Result UUID.
 * @param[in]  task_id          Result task UUID.
 * @param[in]  apply_overrides  Whether to apply overrides.
 * @param[in]  commands         Extra commands to run before the others.
 * @param[in]  report_id        ID of report.
 * @param[in]  autofp           Auto FP filter flag.
 * @param[in]  extra_xml        Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_result (credentials_t *credentials, const char *result_id,
            const char *task_id, const char *task_name,
            const char *apply_overrides, const char *commands,
            const char *report_id, const char *autofp,
            const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (apply_overrides == NULL)
    apply_overrides = "1";

  if (autofp == NULL)
    autofp = "0";

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a result. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

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

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_results"
                            " result_id=\"%s\""
                            " autofp=\"%s\""
                            "%s%s%s"
                            " apply_overrides=\"%s\""
                            " overrides=\"%s\""
                            " overrides_details=\"1\""
                            " notes=\"1\""
                            " notes_details=\"1\""
                            " details=\"1\"/>"
                            "</commands>",
                            commands ? commands : "",
                            result_id,
                            autofp,
                            task_id ? " task_id=\"" : "",
                            task_id ? task_id : "",
                            task_id ? "\"" : "",
                            apply_overrides,
                            apply_overrides)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a result. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a result. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Get tag names */

  if (openvas_server_sendf (&session,
                            "<get_tags"
                            " filter=\"resource_type=result"
                            "          first=1"
                            "          rows=-1\""
                            " names_only=\"1\""
                            "/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_resources");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tag names list. "
                           "The current list of resources is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_resources");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_result>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get one result, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_result_omp (credentials_t *credentials, params_t *params)
{
  return get_result (credentials,
                     params_value (params, "result_id"),
                     params_value (params, "task_id"),
                     params_value (params, "name"),
                     params_value (params, "apply_overrides"),
                     NULL,
                     params_value (params, "report_id"),
                     params_value (params, "autofp"),
                     NULL);
}

/**
 * @brief Get result details page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_result_page (credentials_t *credentials, params_t *params,
                 const char *extra_xml)
{
  return get_result (credentials,
                     params_value (params, "result_id"),
                     params_value (params, "task_id"),
                     params_value (params, "name"),
                     params_value (params, "apply_overrides"),
                     NULL,
                     params_value (params, "report_id"),
                     params_value (params, "autofp"),
                     extra_xml);

}

/**
 * @brief Get all notes, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_notes (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  return get_many ("note", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all notes, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_notes_omp (credentials_t *credentials, params_t *params)
{
  return get_notes (credentials, params, NULL);
}

/**
 * @brief Get a note, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_note (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  return get_one ("note", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get a note, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_note_omp (credentials_t *credentials, params_t *params)
{
  return get_note (credentials, params, NULL);
}

/**
 * @brief Return the new notes page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
new_note (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *oid, *hosts, *port, *severity, *task_id, *task_name, *result_id;
  const char *next;
  /* Passthroughs. */
  const char *report_id, *first_result, *max_results, *sort_field;
  const char *sort_order, *levels, *autofp, *notes;
  const char *overrides, *result_hosts_only, *search_phrase, *min_cvss_base;

  result_id = params_value (params, "result_id");
  task_id = params_value (params, "task_id");

  next = params_value (params, "next");
  first_result = params_value (params, "first_result");
  max_results = params_value (params, "max_results");
  levels = params_value (params, "levels");
  autofp = params_value (params, "autofp");
  notes = params_value (params, "notes");
  report_id = params_value (params, "report_id");
  search_phrase = params_value (params, "search_phrase");
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  task_name = params_value (params, "name");
  severity = params_value (params, "severity");
  result_hosts_only = params_value (params, "result_hosts_only");
  min_cvss_base = params_value (params, "min_cvss_base");

  hosts = params_value (params, "hosts");
  oid = params_value (params, "oid");
  port = params_value (params, "port");
  overrides = params_value (params, "overrides");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new note. "
                             "No new note was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_notes");
    }

  if (result_id == NULL || task_id == NULL)
    {
      xml = g_string_new ("");

      xml_string_append (xml,
                         "<new_note>"
                         "<nvt id=\"%s\"/>"
                         "<next>%s</next>",
                         oid ? oid : "0",
                         next ? next : "");

      if (extra_xml)
        g_string_append (xml, extra_xml);

      if (openvas_server_sendf (&session,
                                "<get_tasks"
                                " details=\"0\"/>")
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new note. "
                               "No new note was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_notes");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new note. "
                               "No new note was created. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_notes");
        }

      g_string_append (xml, "</new_note>");
      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (openvas_server_sendf (&session,
                            "<get_results"
                            " result_id=\"%s\""
                            " task_id=\"%s\""
                            " notes_details=\"1\""
                            " notes=\"1\""
                            " result_hosts_only=\"1\"/>",
                            result_id,
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new note. "
                           "No new note was created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_notes");
    }

  xml = g_string_new ("");

  xml_string_append (xml,
                     "<new_note>"
                     "<nvt id=\"%s\"/>"
                     "<hosts>%s</hosts>"
                     "<port>%s</port>"
                     "<severity>%s</severity>"
                     "<task id=\"%s\">"
                     "<name>%s</name>"
                     "</task>"
                     "<result id=\"%s\"/>"
                     "<next>%s</next>"
                     /* Passthroughs. */
                     "<report id=\"%s\"/>"
                     "<first_result>%s</first_result>"
                     "<max_results>%s</max_results>"
                     "<sort_field>%s</sort_field>"
                     "<sort_order>%s</sort_order>"
                     "<levels>%s</levels>"
                     "<autofp>%s</autofp>"
                     "<notes>%s</notes>"
                     "<overrides>%s</overrides>"
                     "<result_hosts_only>%s</result_hosts_only>"
                     "<search_phrase>%s</search_phrase>"
                     "<min_cvss_base>%s</min_cvss_base>",
                     oid,
                     hosts,
                     port,
                     severity,
                     task_id,
                     task_name,
                     result_id,
                     next ? next : "",
                     report_id,
                     first_result,
                     max_results,
                     sort_field,
                     sort_order,
                     levels,
                     autofp,
                     notes,
                     overrides,
                     result_hosts_only,
                     search_phrase,
                     min_cvss_base);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new note. "
                           "It is unclear whether the note has been created or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_notes");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</new_note>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return the new notes page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_note_omp (credentials_t *credentials, params_t *params)
{
  return new_note (credentials, params, NULL);
}

/**
 * @brief Create a note, get report, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_note_omp (credentials_t *credentials, params_t *params)
{
  char *ret;
  gchar *response;
  const char *oid, *severity, *port, *hosts;
  const char *text, *task_id, *note_result_id;
  /* For get_report. */
  const char *active, *days;
  entity_t entity;

  oid = params_value (params, "oid");
  CHECK_PARAM (oid, "Create Note", new_note);

  if (params_valid (params, "severity"))
    severity = params_value (params, "severity");
  else if (params_given (params, "severity")
           && strcmp (params_original_value (params, "severity"), ""))
    severity = NULL;
  else
    severity = "";
  CHECK_PARAM (severity, "Create Note", new_note);

  port = params_value (params, "port");
  if (port == NULL)
    port = "";
  if (strcmp (port, "--") == 0)
    {
      int num = -1;

      port = params_value (params, "port_manual");
      if (port)
        num = atoi (port);
      if (num < 0 || num > 65535)
        port = NULL;
    }
  CHECK_PARAM (port, "Create Note", new_note);

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
  CHECK_PARAM (hosts, "Create Note", new_note);

  if (params_valid (params, "note_task_id"))
    {
      task_id = params_value (params, "note_task_id");
      if (task_id && (strcmp (task_id, "0") == 0))
        task_id = params_value (params, "note_task_uuid");
    }
  else if (params_given (params, "note_task_id")
           && strcmp (params_original_value (params, "note_task_id"), ""))
    task_id = NULL;
  else
    task_id = "";

  active = params_value (params, "active");
  CHECK_PARAM (active, "Create Note", new_note);

  text = params_value (params, "text");
  days = params_value (params, "days");

  note_result_id = params_value (params, "note_result_id");
  if (note_result_id && (strcmp (note_result_id, "0") == 0))
    note_result_id = params_value (params, "note_result_uuid");

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
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
                hosts,
                port,
                severity,
                text ? text : "",
                task_id,
                note_result_id))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new note. "
                             "No new note was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_notes");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new note. "
                             "It is unclear whether the note has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_notes");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new note. "
                             "It is unclear whether the note has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_notes");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_notes (credentials, params, response);
    }
  else
    ret = new_note (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete note, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_note_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("note", credentials, params, 0, NULL);
}

/**
 * @brief Delete a note, get all notes, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_note_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("note", credentials, params, 1, get_trash);
}

/**
 * @brief Edit note, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_note (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *note_id;

  note_id = params_value (params, "note_id");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing a note. "
                             "The note remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_notes");
    }

  if (openvas_server_sendf (&session,
                            "<get_notes"
                            " note_id=\"%s\""
                            " details=\"1\""
                            " result=\"1\"/>",
                            note_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_notes");
    }

  xml = g_string_new ("");

  xml_string_append (xml, "<edit_note>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_notes");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_note>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Edit note, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_note_omp (credentials_t *credentials, params_t *params)
{
  return edit_note (credentials, params, NULL);
}

/**
 * @brief Save note, get next page, XSL transform the result.
 *
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_note_omp (credentials_t * credentials, params_t *params)
{
  gchar *response;
  entity_t entity;
  const char *note_id, *text, *hosts, *port, *severity, *note_task_id;
  const char *note_result_id, *active, *days;
  char *ret;

  note_id = params_value (params, "note_id");

  text = params_value (params, "text");
  if (text == NULL)
    params_given (params, "text") || (text = "");

  if (params_valid (params, "hosts"))
    hosts = params_value (params, "hosts");
  else if (strcmp (params_original_value (params, "hosts"), ""))
    hosts = NULL;
  else
    hosts = "";

  if (params_valid (params, "port"))
    port = params_value (params, "port");
  else if (strcmp (params_original_value (params, "port"), ""))
    port = NULL;
  else
    port = "";

  if (params_valid (params, "severity"))
    severity = params_value (params, "severity");
  else if (strcmp (params_original_value (params, "severity"), ""))
    severity = NULL;
  else
    severity = "";

  note_task_id = params_value (params, "note_task_id");
  note_result_id = params_value (params, "note_result_id");

  active = params_value (params, "active");
  days = params_value (params, "days");

  if (note_task_id == NULL || note_result_id == NULL || active == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_notes");

  if (note_id == NULL
      || text == NULL
      || hosts == NULL
      || port == NULL
      || severity == NULL
      || days == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note remains the same. "
                         "Diagnostics: Syntax error in required parameter.",
                         "/omp?cmd=get_notes");

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
                "<modify_note note_id=\"%s\">"
                "<active>%s</active>"
                "<hosts>%s</hosts>"
                "<port>%s</port>"
                "<severity>%s</severity>"
                "<text>%s</text>"
                "<task id=\"%s\"/>"
                "<result id=\"%s\"/>"
                "</modify_note>",
                note_id,
                strcmp (active, "1")
                 ? active
                 : (days ? days : "-1"),
                hosts ? hosts : "",
                port ? port : "",
                severity ? severity : "",
                text ? text : "",
                note_task_id,
                note_result_id))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "The note remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_notes");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "It is unclear whether the note has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_notes");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "It is unclear whether the note has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_notes");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_notes (credentials, params, response);
    }
  else
    ret = edit_note (credentials, params, response);

  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Get all overrides, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_overrides (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  return get_many ("override", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all overrides, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_overrides_omp (credentials_t *credentials, params_t *params)
{
  return get_overrides (credentials, params, NULL);
}

/**
 * @brief Get a override, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_override (credentials_t *credentials, params_t *params,
              const char *extra_xml)
{
  return get_one ("override", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get an override, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_override_omp (credentials_t *credentials, params_t *params)
{
  return get_override (credentials, params, NULL);
}

/**
 * @brief Return the new overrides page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
new_override (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *oid, *hosts, *port, *severity, *task_id, *task_name, *result_id;
  const char *next;
  /* Passthroughs. */
  const char *report_id, *first_result, *max_results, *sort_field;
  const char *sort_order, *levels, *autofp, *notes;
  const char *overrides, *result_hosts_only, *search_phrase, *min_cvss_base;

  result_id = params_value (params, "result_id");
  task_id = params_value (params, "task_id");

  next = params_value (params, "next");
  first_result = params_value (params, "first_result");
  max_results = params_value (params, "max_results");
  levels = params_value (params, "levels");
  autofp = params_value (params, "autofp");
  notes = params_value (params, "notes");
  report_id = params_value (params, "report_id");
  search_phrase = params_value (params, "search_phrase");
  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  task_name = params_value (params, "name");
  severity = params_value (params, "severity");
  result_hosts_only = params_value (params, "result_hosts_only");
  min_cvss_base = params_value (params, "min_cvss_base");

  hosts = params_value (params, "hosts");
  oid = params_value (params, "oid");
  port = params_value (params, "port");
  overrides = params_value (params, "overrides");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new override. "
                             "No new override was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_overrides");
    }

  if (result_id == NULL || task_id == NULL)
    {
      xml = g_string_new ("");

      xml_string_append (xml,
                         "<new_override>"
                         "<nvt id=\"%s\"/>"
                         "<next>%s</next>",
                         oid ? oid : "0",
                         next ? next : "");

      if (extra_xml)
        g_string_append (xml, extra_xml);

      if (openvas_server_sendf (&session,
                                "<get_tasks"
                                " details=\"0\"/>")
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new override. "
                               "No new override was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_overrides");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new override. "
                               "No new override was created. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_overrides");
        }

      g_string_append (xml, "</new_override>");
      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (openvas_server_sendf (&session,
                            "<get_results"
                            " result_id=\"%s\""
                            " task_id=\"%s\""
                            " notes_details=\"1\""
                            " notes=\"1\""
                            " overrides_details=\"1\""
                            " overrides=\"1\""
                            " result_hosts_only=\"1\"/>",
                            result_id,
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new override. "
                           "No new override was created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_overrides");
    }

  xml = g_string_new ("");

  xml_string_append (xml,
                     "<new_override>"
                     "<nvt id=\"%s\"/>"
                     "<hosts>%s</hosts>"
                     "<port>%s</port>"
                     "<severity>%s</severity>"
                     "<task id=\"%s\">"
                     "<name>%s</name>"
                     "</task>"
                     "<result id=\"%s\"/>"
                     "<next>%s</next>"
                     /* Passthroughs. */
                     "<report id=\"%s\"/>"
                     "<first_result>%s</first_result>"
                     "<max_results>%s</max_results>"
                     "<sort_field>%s</sort_field>"
                     "<sort_order>%s</sort_order>"
                     "<levels>%s</levels>"
                     "<autofp>%s</autofp>"
                     "<notes>%s</notes>"
                     "<overrides>%s</overrides>"
                     "<result_hosts_only>%s</result_hosts_only>"
                     "<search_phrase>%s</search_phrase>"
                     "<min_cvss_base>%s</min_cvss_base>",
                     oid,
                     hosts,
                     port,
                     severity,
                     task_id,
                     task_name,
                     result_id,
                     next ? next : "",
                     report_id,
                     first_result,
                     max_results,
                     sort_field,
                     sort_order,
                     levels,
                     autofp,
                     notes,
                     overrides,
                     result_hosts_only,
                     search_phrase,
                     min_cvss_base);

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new override. "
                           "It is unclear whether the override has been created or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_overrides");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</new_override>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return the new overrides page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_override_omp (credentials_t *credentials, params_t *params)
{
  return new_override (credentials, params, NULL);
}

/**
 * @brief Create an override, get report, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_override_omp (credentials_t *credentials, params_t *params)
{
  char *ret;
  gchar *response;
  const char *oid, *severity, *custom_severity, *new_severity, *port, *hosts;
  const char *text, *task_id, *override_result_id;
  /* For get_report. */
  const char *active, *days;
  entity_t entity;

  oid = params_value (params, "oid");
  CHECK_PARAM (oid, "Create Override", new_override);

  if (params_valid (params, "severity"))
    severity = params_value (params, "severity");
  else if (params_given (params, "severity")
           && strcmp (params_original_value (params, "severity"), ""))
    severity = NULL;
  else
    severity = "";
  CHECK_PARAM (severity, "Create Override", new_override);

  custom_severity = params_value (params, "custom_severity");
  CHECK_PARAM (custom_severity, "Create Override", new_override);

  if (custom_severity != NULL && strcmp (custom_severity, "0"))
    {
      if (params_valid (params, "new_severity"))
        new_severity = params_value (params, "new_severity");
      else if (params_original_value (params, "new_severity") == NULL
               || strcmp (params_original_value (params, "new_severity"), ""))
        new_severity = NULL;
      else
        new_severity = "";
      CHECK_PARAM (new_severity, "Create Override", new_override);
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
      CHECK_PARAM (new_severity, "Create Override", new_override);
    }

  port = params_value (params, "port");
  if (port == NULL)
    port = "";
  if (strcmp (port, "--") == 0)
    {
      int num = -1;

      port = params_value (params, "port_manual");
      if (port)
        num = atoi (port);
      if (num < 0 || num > 65535)
        port = NULL;
    }
  CHECK_PARAM (port, "Create Override", new_override);

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
  CHECK_PARAM (hosts, "Create Override", new_override);

  if (params_valid (params, "override_task_id"))
    {
      task_id = params_value (params, "override_task_id");
      if (task_id && (strcmp (task_id, "0") == 0))
        task_id = params_value (params, "override_task_uuid");
    }
  else
    task_id = "";

  active = params_value (params, "active");
  CHECK_PARAM (active, "Create Override", new_override);

  text = params_value (params, "text");
  days = params_value (params, "days");

  override_result_id = params_value (params, "override_result_id");
  if (override_result_id && (strcmp (override_result_id, "0") == 0))
    override_result_id = params_value (params, "override_result_uuid");

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
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
                hosts,
                port,
                severity,
                new_severity,
                text ? text : "",
                task_id,
                override_result_id))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new override. "
                             "No new override was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_overrides");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new override. "
                             "It is unclear whether the override has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_overrides");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new override. "
                             "It is unclear whether the override has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_overrides");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_overrides (credentials, params, response);
    }
  else
    ret = new_override (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete override, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_override_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("override", credentials, params, 0, NULL);
}

/**
 * @brief Delete a override, get all overrides, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_override_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("override", credentials, params, 1, get_trash);
}

/**
 * @brief Edit override, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_override (credentials_t *credentials, params_t *params,
               const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *override_id;

  override_id = params_value (params, "override_id");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing an override. "
                             "The override remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_overrides");
    }

  if (openvas_server_sendf (&session,
                            "<get_overrides"
                            " override_id=\"%s\""
                            " details=\"1\""
                            " result=\"1\"/>",
                            override_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing an override. "
                           "The override remains as it was. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_overrides");
    }

  xml = g_string_new ("");

  xml_string_append (xml, "<edit_override>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing an override. "
                           "The override remains as it was. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_overrides");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_override>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Edit override, get next page, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_override_omp (credentials_t *credentials, params_t *params)
{
  return edit_override (credentials, params, NULL);
}

/**
 * @brief Save override, get next page, XSL transform the result.
 *
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_override_omp (credentials_t * credentials, params_t *params)
{
  gchar *response;
  entity_t entity;
  const char *override_id, *text, *hosts, *port;
  const char *severity, *custom_severity, *new_severity;
  const char *override_task_id, *override_result_id, *active, *days;
  char *ret;

  override_id = params_value (params, "override_id");

  text = params_value (params, "text");
  if (text == NULL)
    params_given (params, "text") || (text = "");

  if (params_valid (params, "hosts"))
    hosts = params_value (params, "hosts");
  else if (strcmp (params_original_value (params, "hosts"), ""))
    hosts = NULL;
  else
    hosts = "";

  if (params_valid (params, "port"))
    port = params_value (params, "port");
  else if (strcmp (params_original_value (params, "port"), ""))
    port = NULL;
  else
    port = "";

  if (params_valid (params, "severity"))
    severity = params_value (params, "severity");
  else if (strcmp (params_original_value (params, "severity"), ""))
    severity = NULL;
  else
    severity = "";

  custom_severity = params_value (params, "custom_severity");
  if (custom_severity && strcmp (custom_severity, "0") != 0)
    new_severity = params_value (params, "new_severity");
  else
    new_severity = params_value (params, "new_severity_from_list");

  override_task_id = params_value (params, "override_task_id");
  override_result_id = params_value (params, "override_result_id");

  active = params_value (params, "active");
  days = params_value (params, "days");

  if (override_task_id == NULL || override_result_id == NULL || active == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a override. "
                         "The override remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_overrides");

  if (override_id == NULL
      || text == NULL
      || hosts == NULL
      || port == NULL
      || severity == NULL
      || new_severity == NULL
      || days == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a override. "
                         "The override remains the same. "
                         "Diagnostics: Syntax error in required parameter.",
                         "/omp?cmd=get_overrides");

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
                "<modify_override override_id=\"%s\">"
                "<active>%s</active>"
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
                hosts ? hosts : "",
                port ? port : "",
                severity ? severity : "",
                new_severity,
                text ? text : "",
                override_task_id,
                override_result_id))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a override. "
                             "The override remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_overrides");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a override. "
                             "It is unclear whether the override has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_overrides");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a override. "
                             "It is unclear whether the override has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_overrides");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_overrides (credentials, params, response);
    }
  else
    ret = edit_override (credentials, params, response);

  free_entity (entity);
  g_free (response);
  return ret;
}

/* Slaves */

/**
 * @brief Returns page to create a new slave.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_slave (credentials_t *credentials, params_t *params,
              const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_slave>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_slave>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return the new slave page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_slave_omp (credentials_t *credentials, params_t *params)
{
  return new_slave (credentials, params, NULL);
}

/**
 * @brief Create a slave, get all slaves, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_slave_omp (credentials_t *credentials, params_t *params)
{
  int ret;
  gchar *html, *command, *response;
  const char *name, *comment, *host, *port, *login, *password;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  host = params_value (params, "host");
  port = params_value (params, "port");
  login = params_value (params, "login");
  password = params_value (params, "password");

  CHECK_PARAM (name, "Create Slave", new_slave);
  CHECK_PARAM (comment, "Create Slave", new_slave);
  CHECK_PARAM (host, "Create Slave", new_slave);
  CHECK_PARAM (port, "Create Slave", new_slave);
  CHECK_PARAM (login, "Create Slave", new_slave);
  CHECK_PARAM (password, "Create Slave", new_slave);

  if (comment)
    command = g_strdup_printf ("<create_slave>"
                               "<name>%s</name>"
                               "<comment>%s</comment>"
                               "<host>%s</host>"
                               "<port>%s</port>"
                               "<login>%s</login>"
                               "<password>%s</password>"
                               "</create_slave>",
                               name,
                               comment,
                               host,
                               port,
                               login,
                               password);
  else
    command = g_strdup_printf ("<create_slave>"
                               "<name>%s</name>"
                               "<host>%s</host>"
                               "<port>%s</port>"
                               "<login>%s</login>"
                               "<password>%s</password>"
                               "</create_slave>",
                               name,
                               host,
                               port,
                               login,
                               password);

  ret = omp (credentials, &response, &entity, command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new slave. "
                             "No new slave was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_slaves");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new slave. "
                             "It is unclear whether the slave has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_slaves");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new slave. "
                             "It is unclear whether the slave has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_slaves");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_slaves (credentials, params, response);
    }
  else
    html = new_slave (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get one slave, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_slave (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return get_one ("slave", credentials, params, extra_xml, "tasks=\"1\"");
}

/**
 * @brief Get all slaves, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_slaves (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  return get_many ("slave", credentials, params, extra_xml, NULL);
}

/**
 * @brief Delete a slave, get all slaves, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_slave_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("slave", credentials, params, 0, get_slaves);
}

/**
 * @brief Get all slaves, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_slaves_omp (credentials_t * credentials, params_t *params)
{
  return get_slaves (credentials, params, NULL);
}

/**
 * @brief Get one slave, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_slave_omp (credentials_t * credentials, params_t *params)
{
  return get_slave (credentials, params, NULL);
}

/**
 * @brief Setup edit_slave XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_slave (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return edit_resource ("slave", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_slave XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_slave_omp (credentials_t * credentials, params_t *params)
{
  return edit_slave (credentials, params, NULL);
}

/**
 * @brief Modify a slave, get all slaves, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_slave_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *slave_id, *name, *comment, *host, *port, *login, *password;
  entity_t entity;

  slave_id = params_value (params, "slave_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  host = params_value (params, "host");
  port = params_value (params, "port");
  login = params_value (params, "login");
  password = params_value (params, "password");

  CHECK_PARAM (slave_id, "Save Slave", edit_slave);
  CHECK_PARAM (name, "Save Slave", edit_slave);
  CHECK_PARAM (comment, "Save Slave", edit_slave);
  CHECK_PARAM (host, "Save Slave", edit_slave);
  CHECK_PARAM (port, "Save Slave", edit_slave);
  CHECK_PARAM (login, "Save Slave", edit_slave);
  CHECK_PARAM (password, "Save Slave", edit_slave);

  /* Modify the slave. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
              "<modify_slave slave_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<host>%s</host>"
              "<port>%s</port>"
              "<login>%s</login>"
              "<password>%s</password>"
              "</modify_slave>",
              slave_id,
              name,
              comment,
              host,
              port,
              login,
              password);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a slave. "
                             "The slave was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_slaves");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a slave. "
                             "It is unclear whether the slave has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_slaves");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a slave. "
                             "It is unclear whether the slave has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_slaves");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_slaves (credentials, params, response);
    }
  else
    html = edit_slave (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Export a slave.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Slave XML on success.  HTML result of XSL transformation on error.
 */
char *
export_slave_omp (credentials_t * credentials, params_t *params,
                  enum content_type * content_type, char **content_disposition,
                  gsize *content_length)
{
  return export_resource ("slave", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of slaves.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Slaves XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_slaves_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_many ("slave", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Get one schedule, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_schedule (credentials_t * credentials, params_t *params,
              const char *extra_xml)
{
  return get_one ("schedule", credentials, params, extra_xml, "tasks=\"1\"");
}

/**
 * @brief Get one schedule, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_schedule_omp (credentials_t * credentials, params_t *params)
{
  return get_schedule (credentials, params, NULL);
}

/**
 * @brief Get all schedules, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_schedules (credentials_t *credentials, params_t *params,
               const char *extra_xml)
{
  return get_many ("schedule", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all schedules, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_schedules_omp (credentials_t * credentials, params_t *params)
{
  return get_schedules (credentials, params, NULL);
}

/**
 * @brief Returns page to create a new schedule.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_schedule (credentials_t *credentials, params_t *params,
              const char *extra_xml)
{
  GString *xml;
  time_t now;
  struct tm *now_broken;
  xml = g_string_new ("<new_schedule>");
  now = time (NULL);
  now_broken = localtime (&now);
  g_string_append_printf (xml,
                          "<time>"
                          "<minute>%s%i</minute>"
                          "<hour>%s%i</hour>"
                          "<day_of_month>%s%i</day_of_month>"
                          "<month>%s%i</month>"
                          "<year>%i</year>"
                          "</time>",
                          (now_broken->tm_min > 9 ? "" : "0"),
                          now_broken->tm_min,
                          (now_broken->tm_hour > 9 ? "" : "0"),
                          now_broken->tm_hour,
                          (now_broken->tm_mday > 9 ? "" : "0"),
                          now_broken->tm_mday,
                          ((now_broken->tm_mon + 1) > 9 ? "" : "0"),
                          (now_broken->tm_mon + 1),
                          (now_broken->tm_year + 1900));

  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_schedule>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return the new schedule page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_schedule_omp (credentials_t *credentials, params_t *params)
{
  return new_schedule (credentials, params, NULL);
}

/**
 * @brief Create a schedule, get all schedules, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_schedule_omp (credentials_t * credentials, params_t *params)
{
  char *ret;
  gchar *response;
  const char *name, *comment, *hour, *minute, *day_of_month, *month, *year;
  const char *period, *period_unit, *duration, *duration_unit, *timezone;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  hour = params_value (params, "hour");
  minute = params_value (params, "minute");
  day_of_month = params_value (params, "day_of_month");
  duration = params_value (params, "duration");
  duration_unit = params_value (params, "duration_unit");
  month = params_value (params, "month");
  period = params_value (params, "period");
  period_unit = params_value (params, "period_unit");
  year = params_value (params, "year");
  timezone = params_value (params, "timezone");

  CHECK_PARAM (name, "Create Schedule", new_schedule);
  CHECK_PARAM (hour, "Create Schedule", new_schedule);
  CHECK_PARAM (minute, "Create Schedule", new_schedule);
  CHECK_PARAM (day_of_month, "Create Schedule", new_schedule);
  CHECK_PARAM (duration, "Create Schedule", new_schedule);
  CHECK_PARAM (duration_unit, "Create Schedule", new_schedule);
  CHECK_PARAM (month, "Create Schedule", new_schedule);
  CHECK_PARAM (period, "Create Schedule", new_schedule);
  CHECK_PARAM (period_unit, "period_unit", new_schedule);
  CHECK_PARAM (year, "Create Schedule", new_schedule);
  CHECK_PARAM (timezone, "Create Schedule", new_schedule);

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
                "<create_schedule>"
                "<name>%s</name>"
                "%s%s%s"
                "<first_time>"
                "<hour>%s</hour>"
                "<minute>%s</minute>"
                "<day_of_month>%s</day_of_month>"
                "<month>%s</month>"
                "<year>%s</year>"
                "</first_time>"
                "<period>"
                "<unit>%s</unit>"
                "%s"
                "</period>"
                "<duration>"
                "<unit>%s</unit>"
                "%s"
                "</duration>"
                "<timezone>%s</timezone>"
                "</create_schedule>",
                name,
                comment ? "<comment>" : "",
                comment ? comment : "",
                comment ? "</comment>" : "",
                hour,
                minute,
                day_of_month,
                month,
                year,
                (strcmp (period_unit, "")
                  ? period_unit
                  : "second"),
                period,
                (strcmp (duration_unit, "")
                  ? duration_unit
                  : "second"),
                duration,
                timezone))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new schedule. "
                             "No new schedule was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_schedules");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new schedule. "
                             "It is unclear whether the schedule has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_schedules");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new schedule. "
                             "It is unclear whether the schedule has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_schedules");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_schedules (credentials, params, response);
    }
  else
    ret = new_schedule (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Delete a schedule, get all schedules, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_schedule_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("schedule", credentials, params, 0, get_schedules);
}

/**
 * @brief Get all system reports, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_system_reports_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *duration, *slave_id;

  duration = params_value (params, "duration");
  slave_id = params_value (params, "slave_id");

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the system reports. "
                             "The current list of system reports is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_system_reports>");
  g_string_append_printf (xml,
                          "<duration>%s</duration>"
                          "<slave id=\"%s\"/>",
                          duration ? duration : "86400",
                          slave_id ? slave_id : "0");

  /* Get the system reports. */

  if (openvas_server_sendf (&session,
                            "<get_system_reports brief=\"1\" slave_id=\"%s\"/>",
                            slave_id ? slave_id : "0")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the system reports. "
                           "The current list of system reports is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the system reports. "
                           "The current list of system reports is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (command_enabled (credentials, "GET_SLAVES"))
    {
      /* Get the slaves. */

      if (openvas_server_sendf (&session,
                                "<get_slaves"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the system reports. "
                               "The current list of system reports is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the system reports. "
                               "The current list of system reports is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_system_reports>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return system report image.
 *
 * @param[in]   credentials          Credentials of user issuing the action.
 * @param[in]   url                  URL of report image.
 * @param[in]   duration             Duration of report, in seconds.
 * @param[in]   slave_id             ID of slave.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_length       Content length return.
 *
 * @return Image, or NULL.
 */
char *
get_system_report_omp (credentials_t *credentials, const char *url,
                       const char *duration, const char *slave_id,
                       enum content_type *content_type,
                       gsize *content_length)
{
  entity_t entity;
  entity_t report_entity;
  gnutls_session_t session;
  int socket;
  char name[501];

  *content_length = 0;

  if (url == NULL)
    return NULL;

  /* fan/report.png */
  if (sscanf (url, "%500[^ /]./report.png", name) == 1)
    {
      if (manager_connect (credentials, &socket, &session, NULL))
        return NULL;

      if (openvas_server_sendf (&session,
                                "<get_system_reports"
                                " name=\"%s\""
                                " duration=\"%s\""
                                " slave_id=\"%s\"/>",
                                name,
                                duration ? duration : "86400",
                                slave_id ? slave_id : "0")
          == -1)
        {
          openvas_server_close (socket, session);
          return NULL;
        }

      entity = NULL;
      if (read_entity (&session, &entity))
        {
          openvas_server_close (socket, session);
          return NULL;
        }

      report_entity = entity_child (entity, "system_report");
      if (report_entity == NULL)
        {
          free_entity (entity);
          openvas_server_close (socket, session);
          return NULL;
        }

      report_entity = entity_child (report_entity, "report");
      if (report_entity == NULL)
        {
          free_entity (entity);
          openvas_server_close (socket, session);
          return NULL;
        }
      else
        {
          char *content_64 = entity_text (report_entity);
          char *content = NULL;

          if (content_64 && strlen (content_64))
            {
              content = (char *) g_base64_decode (content_64,
                                                  content_length);

#if 1
              *content_type = GSAD_CONTENT_TYPE_IMAGE_PNG;
              //*content_disposition = g_strdup_printf ("attachment; filename=\"xxx.png\"");
#else
              g_free (content);
              content = g_strdup ("helo");
#endif
            }

          free_entity (entity);
          openvas_server_close (socket, session);
          return content;
       }
    }

  return NULL;
}

/**
 * @brief Get one report format, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_report_format (credentials_t * credentials, params_t *params,
                   const char *extra_xml)
{
  return get_one ("report_format", credentials, params, extra_xml,
                  "alerts =\"1\" params=\"1\"");
}

/**
 * @brief Get one report format, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_report_format_omp (credentials_t * credentials, params_t *params)
{
  return get_report_format (credentials, params, NULL);
}

/**
 * @brief Get all Report Formats, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_report_formats (credentials_t * credentials, params_t *params,
                    const char *extra_xml)
{
  return get_many ("report_format", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all Report Formats, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_report_formats_omp (credentials_t * credentials, params_t *params)
{
  return get_report_formats (credentials, params, NULL);
}

/**
 * @brief Returns page to create a new report format.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_report_format (credentials_t *credentials, params_t *params,
              const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_report_format>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_report_format>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Return the new report format page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_report_format_omp (credentials_t *credentials, params_t *params)
{
  return new_report_format (credentials, params, NULL);
}

/**
 * @brief Delete report format, get report formats, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_report_format_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("report_format", credentials, params, 0,
                          get_report_formats);
}

/**
 * @brief Setup edit_report_format XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
edit_report_format (credentials_t * credentials, params_t *params,
                    const char *extra_xml)
{
  return edit_resource ("report_format", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_report_format XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_report_format_omp (credentials_t * credentials, params_t *params)
{
  return edit_report_format (credentials, params, NULL);
}

/**
 * @brief Import report format, get all report formats, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
import_report_format_omp (credentials_t * credentials, params_t *params)
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
  ret = omp (credentials, &response, &entity, command);
  g_free (command);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a report format. "
                             "The schedule remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_report_formats");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a report format. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_report_formats");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a report format. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_report_formats");
    }

  /* Cleanup, and return transformed XML. */

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_report_formats (credentials, params, response);
    }
  else
    html = new_report_format (credentials, params, response);

  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Save report_format, get next page, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  params            Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_report_format_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  params_t *preferences;
  const char *report_format_id, *name, *summary, *enable;
  entity_t entity;

  report_format_id = params_value (params, "report_format_id");
  name = params_value (params, "name");
  summary = params_value (params, "summary");
  enable = params_value (params, "enable");

  CHECK_PARAM (report_format_id, "Save Report Format", edit_report_format);
  CHECK_PARAM (name, "Save Report Format", edit_report_format);
  CHECK_PARAM (summary, "Save Report Format", edit_report_format);
  CHECK_PARAM (enable, "Save Report Format", edit_report_format);

  /* Modify the Report Format. */

  preferences = params_values (params, "preference:");
  if (preferences)
    {
      param_t *param;
      gchar *param_name;
      params_iterator_t iter;

      /* The naming is a bit subtle here, because the HTTP request
       * parameters are called "param"s and so are the OMP report format
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
              ret = ompf (credentials,
                          &response,
                          &entity,
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
                  case -1:
                    break;
                  case 1:
                    return gsad_message (credentials,
                                         "Internal error", __FUNCTION__, __LINE__,
                                         "An internal error occurred while saving a Report Format. "
                                         "The Report Format was not saved. "
                                         "Diagnostics: Failure to send command to manager daemon.",
                                         "/omp?cmd=get_report_formats");
                  case 2:
                    return gsad_message (credentials,
                                         "Internal error", __FUNCTION__, __LINE__,
                                         "An internal error occurred while saving a Report Format. "
                                         "It is unclear whether the Report Format has been saved or not. "
                                         "Diagnostics: Failure to receive response from manager daemon.",
                                         "/omp?cmd=get_report_formats");
                  default:
                    return gsad_message (credentials,
                                         "Internal error", __FUNCTION__, __LINE__,
                                         "An internal error occurred while saving a Report Format. "
                                         "It is unclear whether the Report Format has been saved or not. "
                                         "Diagnostics: Internal Error.",
                                         "/omp?cmd=get_report_formats");
                }
            }
         }
    }

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
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
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Report Format. "
                             "The Report Format was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_report_formats");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Report Format. "
                             "It is unclear whether the Report Format has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_report_formats");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Report Format. "
                             "It is unclear whether the Report Format has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_report_formats");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_report_formats (credentials, params, response);
    }
  else
    html = edit_report_format (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Verify report format, get report formats, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
verify_report_format_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *report_format_id;
  entity_t entity;

  report_format_id = params_value (params, "report_format_id");
  if (report_format_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while verifying a report format. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_report_formats");

  /* Verify the report format. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
              "<verify_report_format report_format_id=\"%s\"/>",
              report_format_id);

  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a report format. "
                             "The report format was not verified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_report_formats");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a report format. "
                             "It is unclear whether the report format was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_report_formats");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while verifying a report format. "
                             "It is unclear whether the report format was verified or not. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        {
          free_entity (entity);
          g_free (response);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while verifying a report format. "
                               "It is unclear whether the report format was verified or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_report_formats");
        }
    }
  else
    html = get_report_formats (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Run a wizard and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
run_wizard_omp (credentials_t *credentials, params_t *params)
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
   * parameters are called "param"s and so are the OMP wizard
   * parameters. */

  name = params_value (params, "name");
  if (name == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while trying to start a wizard. "
                         "Diagnostics: Required parameter 'name' was NULL.",
                         "/omp?cmd=get_tasks");

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
  ret = omp (credentials, &response, &entity, run->str);
  g_string_free (run, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "The wizard did not start. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tasks");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = wizard (credentials, params, response);
    }
  else
    html = wizard (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

#define GET_TRASH_RESOURCE(capability, command, name)                         \
  if (command_enabled (credentials, capability))                              \
      {                                                                       \
        if (openvas_server_sendf (&session,                                   \
                                  "<" command                                 \
                                  " trash=\"1\""                              \
                                  " sort_field=\"name\""                      \
                                  " sort_order=\"ascending\"/>")              \
            == -1)                                                            \
          {                                                                   \
            g_string_free (xml, TRUE);                                        \
            openvas_server_close (socket, session);                           \
            return gsad_message                                               \
                    (credentials,                                             \
                     "Internal error", __FUNCTION__, __LINE__,                \
                     "An internal error occurred while getting "              \
                     name " list for trash."                                  \
                     "Diagnostics: Failure to send command to"                \
                     " manager daemon.",                                      \
                     "/omp?cmd=get_trash");                                   \
          }                                                                   \
                                                                              \
        if (read_string (&session, &xml))                                     \
          {                                                                   \
            g_string_free (xml, TRUE);                                        \
            openvas_server_close (socket, session);                           \
            return gsad_message                                               \
                    (credentials,                                             \
                     "Internal error", __FUNCTION__, __LINE__,                \
                     "An internal error occurred while getting " name " list."\
                     "Diagnostics: Failure to receive response from"          \
                     " manager daemon.",                                      \
                     "/omp?cmd=get_tasks");                                   \
          }                                                                   \
      }

/**
 * @brief Setup trash page XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_trash (credentials_t * credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the trash. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_trash>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  GET_TRASH_RESOURCE ("GET_AGENTS", "get_agents", "agents");

  GET_TRASH_RESOURCE ("GET_CONFIGS", "get_configs", "configs");

  GET_TRASH_RESOURCE ("GET_LSC_CREDENTIALS", "get_lsc_credentials",
                      "credentails");

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

  GET_TRASH_RESOURCE ("GET_SCHEDULES", "get_schedules", "schedules");

  GET_TRASH_RESOURCE ("GET_SLAVES", "get_slaves", "slaves");

  GET_TRASH_RESOURCE ("GET_TAGS", "get_tags", "tags");

  GET_TRASH_RESOURCE ("GET_TARGETS", "get_targets", "targets");

  GET_TRASH_RESOURCE ("GET_TASKS", "get_tasks", "tasks");

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_trash>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}
#undef GET_TRASH_RESOURCE

/**
 * @brief Get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_trash_omp (credentials_t * credentials, params_t *params)
{
  return get_trash (credentials, params, NULL);
}

/**
 * @brief Returns page with user's settings.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_my_settings (credentials_t * credentials, params_t *params,
                 const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the settings. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_my_settings>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  /* Get the settings. */

  if (openvas_server_sendf (&session,
                            "<get_settings"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  g_string_append (xml, "</get_my_settings>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page with user's settings.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_my_settings_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  entity_t entity;
  gchar *response;

  /* Get Filters. */
  response = NULL;
  entity = NULL;
  ret = omp (credentials, &response, &entity, "<get_filters/>");
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Filters "
                             "for the settings. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_my_settings");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for the alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_alerts");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting Report "
                             "Formats for the alert. "
                             "It is unclear whether the task has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_alerts");
    }
  free_entity (entity);

  return get_my_settings (credentials, params, response);
}

/**
 * @brief Returns page with user's settings, for editing.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
edit_my_settings (credentials_t * credentials, params_t *params,
                  const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket, ret;
  gchar *html, *filters_xml;
  entity_t entity;

  /* Get the Filters. */

  filters_xml = NULL;
  entity = NULL;
  ret = omp (credentials, &filters_xml, &entity, "<get_filters/>");
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the Filters "
                             "for the settings. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_my_settings");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the Filters "
                             "for the alert. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_my_settings");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the Filters "
                             "for the settings. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_my_settings");
    }
  free_entity (entity);

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the settings. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_my_settings");
    }

  xml = g_string_new ("<edit_my_settings>");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append (xml, filters_xml);
  g_free (filters_xml);

  /* Get the settings. */

  if (openvas_server_sendf (&session,
                            "<get_settings"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }

  g_string_append (xml, "</edit_my_settings>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page with user's settings, for editing.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_my_settings_omp (credentials_t * credentials, params_t *params)
{
  return edit_my_settings (credentials, params, NULL);
}

/**
 * @brief Send settings resource filters.
 *
 * @param[in]   session             GNUTLS session.
 * @param[in]   data                Data.
 * @param[out]  xml                 GString to write responses to.
 * @param[out]  modify_failed_flag  Pointer to an int to set to 1 on failure
 *                                  to modify one of the settings.
 * @return 0 on success, -1 on error.
 */
static int
send_settings_filters (gnutls_session_t *session, params_t *data,
                       GString *xml, int *modify_failed_flag)
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
          gchar *base64;
          if (param->value)
            base64 = g_base64_encode ((guchar*) param->value,
                                      strlen (param->value));
          else
            base64 = g_strdup("");
          if (openvas_server_sendf_xml (session,
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
          if (read_entity_and_string (session, &entity, &xml))
            {
              free_entity (entity);
              return -1;
            }
          if (! omp_success (entity) && modify_failed_flag)
            *modify_failed_flag = 1;
          free_entity(entity);
        }
    }
  return 0;
}

/**
 * @brief Returns page with user's settings, for editing.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  accept_language  Accept-Language, from browser.
 * @param[out] timezone     Timezone.  Caller must free.
 * @param[out] password     Password.  Caller must free.
 * @param[out] severity     Severity.  Caller must free.
 * @param[out] language     Language.  Caller must free.
 *
 * @return Result of XSL transformation.
 */
char *
save_my_settings_omp (credentials_t * credentials, params_t *params,
                      const char *accept_language, char **timezone,
                      char **password, char **severity, char **language)
{
  int socket;
  gnutls_session_t session;
  gchar *html;
  const char *lang, *text, *old_passwd, *passwd, *status, *max;
  gchar *lang_64, *text_64, *max_64;
  GString *xml;
  entity_t entity;
  params_t *filters;
  int modify_failed = 0;

  *timezone = NULL;
  *password = NULL;
  *severity = NULL;
  *language = NULL;

  text = params_value (params, "text");
  old_passwd = params_value (params, "old_password");
  passwd = params_value (params, "password");
  max = params_value (params, "max");
  lang = params_value (params, "lang");
  if ((text == NULL)
      || (passwd == NULL)
      || (old_passwd == NULL)
      || (max == NULL)
      || (lang == NULL))
    return edit_my_settings (credentials, params,
                             GSAD_MESSAGE_INVALID_PARAM
                               ("Save My Settings"));

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving settings. "
                             "The settings remains the same. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_my_settings");
    }

  xml = g_string_new ("");

  if (strlen (passwd) || strlen (old_passwd))
    {
      gchar *passwd_64;

      /* Send Password setting */

      switch (omp_authenticate (&session, credentials->username, old_passwd))
        {
          case 0:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving settings. "
                                 "The settings remains the same. "
                                 "Diagnostics: Manager closed connection during authenticate.",
                                 "/omp?cmd=get_my_settings");
          case 2:
            g_string_append (xml,
                             "<gsad_msg"
                             " status_text=\"Password error\""
                             " operation=\"Save My Settings\">"
                             "You tried to change your password, but the old"
                             " password was not provided or was incorrect. "
                             " Please enter the correct old password or remove"
                             " old and new passwords to apply any other changes"
                             " of your settings."
                             "</gsad_msg>");
            return edit_my_settings (credentials, params,
                                     g_string_free (xml, FALSE));
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving settings. "
                                 "The settings remains the same. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_my_settings");
        }

      passwd_64 = g_base64_encode ((guchar*) passwd, strlen (passwd));

      if (openvas_server_sendf (&session,
                                "<modify_setting>"
                                "<name>Password</name>"
                                "<value>%s</value>"
                                "</modify_setting>",
                                passwd_64 ? passwd_64 : "")
          == -1)
        {
          g_free (passwd_64);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "It is unclear whether all the settings were saved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_my_settings");
        }
      g_free (passwd_64);

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving settings. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_my_settings");
        }

      status = entity_attribute (entity, "status");
      if (status && (strlen (status) > 0) && (status[0] == '2'))
        {
          g_free (credentials->password);
          credentials->password = g_strdup (passwd);
          *password = g_strdup (passwd);
        }
      else
        modify_failed = 1;
    }

  /* Send Timezone */
  text_64 = g_base64_encode ((guchar*) text, strlen (text));

  if (openvas_server_sendf (&session,
                            "<modify_setting>"
                            "<name>Timezone</name>"
                            "<value>%s</value>"
                            "</modify_setting>",
                            text_64 ? text_64 : "")
      == -1)
    {
      g_free (text_64);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  g_free (text_64);

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }

  status = entity_attribute (entity, "status");
  if (status && (strlen (status) > 0) && (status[0] == '2'))
    {
      g_free (credentials->timezone);
      credentials->timezone = g_strdup (strlen (text) ? text : "UTC");
      *timezone = g_strdup (strlen (text) ? text : "UTC");

      /* Set the timezone, so that the ENVELOPE/TIME uses the right timezone. */

      if (setenv ("TZ", credentials->timezone, 1) == -1)
        {
          openvas_server_close (socket, session);
          g_critical ("%s: failed to set TZ\n", __FUNCTION__);
          exit (EXIT_FAILURE);
        }
      tzset ();
    }
  else
    modify_failed = 1;

  /* Send Rows Per Page */
  max_64 = g_base64_encode ((guchar*) max, strlen (max));

  if (openvas_server_sendf (&session,
                            "<modify_setting"
                            " setting_id"
                            "=\"5f5a8712-8017-11e1-8556-406186ea4fc5\">"
                            "<value>%s</value>"
                            "</modify_setting>",
                            max_64 ? max_64 : "")
      == -1)
    {
      g_free (max_64);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  g_free (max_64);

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  if (! omp_success (entity))
    modify_failed = 1;

  /* Send User Interface Language. */
  lang_64 = g_base64_encode ((guchar*) lang, strlen (lang));

  if (openvas_server_sendf (&session,
                            "<modify_setting"
                            " setting_id"
                            "=\"6765549a-934e-11e3-b358-406186ea4fc5\">"
                            "<value>%s</value>"
                            "</modify_setting>",
                            lang_64 ? lang_64 : "")
      == -1)
    {
      g_free (lang_64);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  g_free (lang_64);

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  if (omp_success (entity))
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
        credentials->language = g_strdup (accept_language);
    }
  else
    modify_failed = 1;

  /* Send resources filters */
  filters = params_values (params, "settings_filter:");
  if (send_settings_filters (&session, filters, xml, &modify_failed))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }

  /* Send Wizard Rows */
  max = params_value (params, "max_results");
  max_64 = (max
             ? g_base64_encode ((guchar*) max, strlen (max))
             : g_strdup (""));

  if (openvas_server_sendf (&session,
                            "<modify_setting"
                            " setting_id"
                            "=\"20f3034c-e709-11e1-87e7-406186ea4fc5\">"
                            "<value>%s</value>"
                            "</modify_setting>",
                            max_64 ? max_64 : "")
      == -1)
    {
      g_free (max_64);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  g_free (max_64);

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  if (! omp_success (entity))
    modify_failed = 1;

  /* Send Severity Class. */
  text = params_value (params, "severity_class");
  text_64 = (text
                 ? g_base64_encode ((guchar*) text, strlen (text))
                 : g_strdup (""));

  if (openvas_server_sendf (&session,
                            "<modify_setting"
                            " setting_id"
                            "=\"f16bb236-a32d-4cd5-a880-e0fcf2599f59\">"
                            "<value>%s</value>"
                            "</modify_setting>",
                            text_64 ? text_64 : "")
      == -1)
    {
      g_free (text_64);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  g_free (text_64);

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }

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
    modify_failed = 1;

  /* Send Dynamic Severity setting. */
  text = params_value (params, "dynamic_severity");
  text_64 = (text
                 ? g_base64_encode ((guchar*) text, strlen (text))
                 : g_strdup (""));

  if (openvas_server_sendf (&session,
                            "<modify_setting"
                            " setting_id"
                            "=\"77ec2444-e7f2-4a80-a59b-f4237782d93f\">"
                            "<value>%s</value>"
                            "</modify_setting>",
                            text_64 ? text_64 : "")
      == -1)
    {
      g_free (text_64);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  g_free (text_64);

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }
  if (! omp_success (entity))
    modify_failed = 1;

  /* Get filters */
  if (openvas_server_sendf (&session,
                            "<get_filters/>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_my_settings");
    }

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving settings. "
                           "It is unclear whether all the settings were saved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_my_settings");
    }

  free_entity (entity);
  openvas_server_close (socket, session);
  if (modify_failed)
    return edit_my_settings (credentials, params, g_string_free (xml, FALSE));
  else
    return get_my_settings (credentials, params, g_string_free (xml, FALSE));
}

/**
 * @brief Get OMP doc.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_protocol_doc_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  entity_t help_response;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the OMP doc. "
                             "The resource is currently not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("");
  g_string_append_printf (xml, "<get_protocol_doc>");

  /* Get the resource. */

  if (openvas_server_sendf (&session, "<help format=\"XML\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the OMP doc. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  help_response = NULL;
  if (read_entity_and_string (&session, &help_response, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the OMP doc. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (help_response);

  openvas_server_close (socket, session);

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</get_protocol_doc>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Download the OMP doc.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return XML on success.  HTML result of XSL transformation on error.
 */
char *
export_omp_doc_omp (credentials_t * credentials, params_t *params,
                    enum content_type * content_type,
                    char **content_disposition, gsize *content_length)
{
  entity_t entity, response;
  gnutls_session_t session;
  int socket;
  char *content = NULL;
  gchar *html;
  const char *format;
  time_t now;
  struct tm *tm;

  *content_length = 0;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the OMP doc. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_protocol_doc");
    }

  format = params_value (params, "protocol_format")
            ? params_value (params, "protocol_format")
            : "xml";

  if (openvas_server_sendf (&session,
                            "<help format=\"%s\"/>",
                            format)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a list. "
                           "The list could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_protocol_doc");
    }

  response = NULL;
  if (read_entity_and_text (&session, &response, &content))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting OMP doc. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_protocol_doc");
    }
  openvas_server_close (socket, session);

  if (strcmp (format, "xml") == 0)
    *content_length = strlen (content);
  else
    {
      char *content_64;
      entity = entity_child (response, "schema");
      if (entity == NULL)
        {
          free_entity (response);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting OMP doc. "
                               "Diagnostics: Schema element missing.",
                               "/omp?cmd=get_protocol_doc");
        }

      content_64 = entity_text (entity);
      if (strlen (content_64) == 0)
        {
          free_entity (response);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting OMP doc. "
                               "Diagnostics: Schema empty.",
                               "/omp?cmd=get_protocol_doc");
        }

      content = (char *) g_base64_decode (content_64, content_length);
    }

  now = time (NULL);
  tm = localtime (&now);
  *content_type = GSAD_CONTENT_TYPE_APP_XML;
  *content_disposition = g_strdup_printf ("attachment;"
                                          " filename=\"omp-%d-%d-%d.%s\"",
                                          tm->tm_mday,
                                          tm->tm_mon + 1,
                                          tm->tm_year +1900,
                                          format);
  free_entity (response);
  openvas_server_close (socket, session);
  return content;
}


/* Groups. */

/**
 * @brief Get one group, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_group (credentials_t * credentials, params_t *params,
           const char *extra_xml)
{
  return get_one ("group", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get one group, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_group_omp (credentials_t * credentials, params_t *params)
{
  return get_group (credentials, params, NULL);
}

/**
 * @brief Get all groups, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_groups (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return get_many ("group", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all groups, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_groups_omp (credentials_t * credentials, params_t *params)
{
  return get_groups (credentials, params, NULL);
}

/**
 * @brief Returns page to create a new group.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_group (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_group>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_group>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page to create a new group.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_group_omp (credentials_t *credentials, params_t *params)
{
  return new_group (credentials, params, NULL);
}

/**
 * @brief Delete a group from trash, get all groups, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_group_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("group", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a group, get all groups, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_group_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("group", credentials, params, 0,
                          get_groups);
}

/**
 * @brief Create a group, get all groups, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_group_omp (credentials_t *credentials, params_t *params)
{
  gchar *html, *response;
  const char *name, *comment, *users;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_PARAM (name, "Create Group", new_group);
  CHECK_PARAM (comment, "Create Group", new_group);
  CHECK_PARAM (users, "Create Group", new_group);

  /* Create the group. */

  switch (ompf (credentials,
                &response,
                &entity,
                "<create_group>"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<users>%s</users>"
                "</create_group>",
                name,
                comment,
                users))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new group. "
                            "No new group was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_groups");
      case 2:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new group. "
                            "It is unclear whether the group has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            "/omp?cmd=get_groups");
      default:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new group. "
                            "It is unclear whether the group has been created or not. "
                            "Diagnostics: Internal Error.",
                            "/omp?cmd=get_groups");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_groups (credentials, params, response);
    }
  else
    html = new_group (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Setup edit_group XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_group (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return edit_resource ("group", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_group XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_group_omp (credentials_t * credentials, params_t *params)
{
  return edit_group (credentials, params, NULL);
}

/**
 * @brief Export a group.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Group XML on success.  HTML result of XSL transformation on error.
 */
char *
export_group_omp (credentials_t * credentials, params_t *params,
                  enum content_type * content_type, char **content_disposition,
                  gsize *content_length)
{
  return export_resource ("group", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of groups.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Groups XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_groups_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_many ("group", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Modify a group, return the next page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_group_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *group_id, *name, *comment, *users;
  entity_t entity;

  group_id = params_value (params, "group_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_PARAM (group_id, "Save Group", edit_group);
  CHECK_PARAM (name, "Save Group", edit_group);
  CHECK_PARAM (comment, "Save Group", edit_group);
  CHECK_PARAM (users, "Save Group", edit_group);

  /* Modify the Group. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a group. "
                             "The group was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_groups");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a group. "
                             "It is unclear whether the group has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_groups");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a group. "
                             "It is unclear whether the group has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_groups");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_groups (credentials, params, response);
    }
  else
    html = edit_group (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Permissions. */

/**
 * @brief Get one permission, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_permission (credentials_t * credentials, params_t *params,
                const char *extra_xml)
{
  return get_one ("permission", credentials, params, extra_xml, "alerts=\"1\"");
}

/**
 * @brief Get one permission, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_permission_omp (credentials_t * credentials, params_t *params)
{
  return get_permission (credentials, params, NULL);
}

/**
 * @brief Get all permissions, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_permissions (credentials_t * credentials, params_t *params,
                 const char *extra_xml)
{
  return get_many ("permission", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all permissions, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_permissions_omp (credentials_t * credentials, params_t *params)
{
  return get_permissions (credentials, params, NULL);
}

/**
 * @brief Delete a permission, get all permissions, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_permission_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("permission", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a permission, get all permissions, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_permission_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("permission", credentials, params, 0, NULL);
}

/**
 * @brief Setup new_permission XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
new_permission (credentials_t * credentials, params_t *params,
                 const char *extra_xml)
{
  GString *xml;

  xml = g_string_new ("<new_permission>");

  if (command_enabled (credentials, "GET_USERS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (omp (credentials, &response, &entity, "<get_users/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (xml, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_GROUPS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (omp (credentials, &response, &entity, "<get_groups/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (xml, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_ROLES"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (omp (credentials, &response, &entity, "<get_roles/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (xml, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append (xml, "</new_permission>");

  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup new_permission XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_permission_omp (credentials_t * credentials, params_t *params)
{
  return new_permission (credentials, params, NULL);
}

/**
 * @brief Create a permission, get all permissions, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_permission_omp (credentials_t *credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *name, *comment, *resource_id;
  const char *subject_id, *subject_type, *subject_name;
  entity_t entity;

  gchar *subject_response;
  entity_t get_subject_entity = NULL;
  entity_t subject_entity;

  name = params_value (params, "permission");
  comment = params_value (params, "comment");
  resource_id = params_value (params, "id_or_empty");
  subject_type = params_value (params, "subject_type");
  subject_name = params_value (params, "subject_name");

  CHECK_PARAM (name, "Create Permission", new_permission);
  CHECK_PARAM (comment, "Create Permission", new_permission);
  CHECK_PARAM (resource_id, "Create Permission", new_permission);
  CHECK_PARAM (subject_type, "Create Permission", new_permission);

  if (params_given (params, "subject_name"))
    {
      CHECK_PARAM (subject_name, "Create Permission", new_permission);
      subject_id = NULL;
      ret = ompf (credentials,
                  &subject_response,
                  &get_subject_entity,
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
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to send command"
                                " to manager daemon.",
                                "/omp?cmd=get_permissions");
          case 2:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Failure to receive response"
                                " from manager daemon.",
                                "/omp?cmd=get_permissions");
          default:
            return gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting"
                                " the subject for a permission. "
                                "The permission was not created. "
                                "Diagnostics: Internal Error.",
                                "/omp?cmd=get_permissions");
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
          return next_page (credentials, params, msg);
        }
    }
  else if (strcmp (subject_type, "user") == 0)
    subject_id = params_value (params, "user_id");
  else if (strcmp (subject_type, "group") == 0)
    subject_id = params_value (params, "group_id");
  else if (strcmp (subject_type, "role") == 0)
    subject_id = params_value (params, "role_id");
  else
    subject_id = NULL;
  CHECK_PARAM (subject_id, "Create Permission", new_permission);

  /* Create the permission. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
              "<create_permission>"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<resource id=\"%s\"/>"
              "<subject id=\"%s\"><type>%s</type></subject>"
              "</create_permission>",
              name,
              comment ? comment : "",
              resource_id,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a permission. "
                             "The permission was not created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_permissions");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a permission. "
                             "It is unclear whether the permission has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_permissions");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a permission. "
                             "It is unclear whether the permission has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_permissions");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_permissions (credentials, params, response);
    }
  else
    html = new_permission (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Setup edit_permission XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_permission (credentials_t * credentials, params_t *params,
                 const char *extra_xml)
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
      switch (omp (credentials, &response, &entity, "<get_users/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the user list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
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
      switch (omp (credentials, &response, &entity, "<get_groups/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
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
      switch (omp (credentials, &response, &entity, "<get_roles/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = edit_resource ("permission", credentials, params, extra->str);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Setup edit_permission XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_permission_omp (credentials_t * credentials, params_t *params)
{
  return edit_permission (credentials, params, NULL);
}

/**
 * @brief Export a permission.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Permission XML on success.  HTML result of XSL transformation on error.
 */
char *
export_permission_omp (credentials_t * credentials, params_t *params,
                       enum content_type * content_type,
                       char **content_disposition, gsize *content_length)
{
  return export_resource ("permission", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of permissions.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Permissions XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_permissions_omp (credentials_t * credentials, params_t *params,
                        enum content_type * content_type,
                        char **content_disposition, gsize *content_length)
{
  return export_many ("permission", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Modify a permission, get all permissions, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_permission_omp (credentials_t * credentials, params_t *params)
{
  gchar *html, *response;
  const char *permission_id, *name, *comment, *resource_id;
  const char *subject_id, *subject_type;
  entity_t entity;
  int ret;

  permission_id = params_value (params, "permission_id");
  name = params_value (params, "permission");
  comment = params_value (params, "comment");
  subject_type = params_value (params, "subject_type");
  resource_id = params_value (params, "id_or_empty");

  CHECK_PARAM (permission_id, "Save Permission", edit_permission);
  CHECK_PARAM (name, "Save Permission", edit_permission);
  CHECK_PARAM (comment, "Save Permission", edit_permission);
  CHECK_PARAM (resource_id, "Save Permission", edit_permission);
  CHECK_PARAM (subject_type, "Save Permission", edit_permission);

  if (strcmp (subject_type, "user") == 0)
    subject_id = params_value (params, "user_id");
  else if (strcmp (subject_type, "group") == 0)
    subject_id = params_value (params, "group_id");
  else if (strcmp (subject_type, "role") == 0)
    subject_id = params_value (params, "role_id");
  else
    subject_id = NULL;
  CHECK_PARAM (subject_id, "Save Permission", edit_permission);

  /* Modify the permission. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
              "<modify_permission permission_id=\"%s\">"
              "<name>%s</name>"
              "<comment>%s</comment>"
              "<subject id=\"%s\">"
              "<type>%s</type>"
              "</subject>"
              "<resource id=\"%s\"/>"
              "</modify_permission>",
              permission_id,
              name,
              comment,
              subject_id,
              subject_type,
              (resource_id && strlen (resource_id)) ? resource_id : "0");
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a permission. "
                             "The permission was not modified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_permissions");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a permission. "
                             "It is unclear whether the permission has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_permissions");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a permission. "
                             "It is unclear whether the permission has been modified or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_permissions");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_permissions (credentials, params, response);
    }
  else
    html = edit_permission (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Port lists. */

/**
 * @brief Returns page to create a new Port List.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_port_list (credentials_t *credentials, params_t *params,
              const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_port_list>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_port_list>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create a port list, get all port lists, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_port_list_omp (credentials_t * credentials, params_t *params)
{
  gchar *html, *response;
  const char *name, *comment, *port_range, *from_file;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  port_range = params_value (params, "port_range");
  from_file = params_value (params, "from_file");

  CHECK_PARAM (name, "Create Port List", new_port_list);
  CHECK_PARAM (comment, "Create Port List", new_port_list);
  CHECK_PARAM (port_range, "Create Port List", new_port_list);
  CHECK_PARAM (from_file, "Create Port List", new_port_list);

  /* Create the port_list. */

  switch (ompf (credentials,
                &response,
                &entity,
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
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new port list. "
                            "No new port list was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_port_lists");
      case 2:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new port list. "
                            "It is unclear whether the port list has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            "/omp?cmd=get_port_lists");
      default:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new port list. "
                            "It is unclear whether the port list has been created or not. "
                            "Diagnostics: Internal Error.",
                            "/omp?cmd=get_port_lists");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_port_lists (credentials, params, response);
    }
  else
    html = new_port_list (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Add a range to a port list, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_port_range_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *port_list_id, *start, *end, *type;
  entity_t entity;

  port_list_id = params_value (params, "port_list_id");
  start = params_value (params, "port_range_start");
  end = params_value (params, "port_range_end");
  type = params_value (params, "port_type");

  CHECK_PARAM (port_list_id, "Create Port Range", edit_port_list);
  CHECK_PARAM (start, "Create Port Range", edit_port_list);
  CHECK_PARAM (end, "Create Port Range", edit_port_list);
  CHECK_PARAM (type, "Create Port Range", edit_port_list);

  /* Create the port range. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a Port Range. "
                             "The Port Range was not created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_port_lists");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a Port Range. "
                             "It is unclear whether the Port Range has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_port_lists");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a Port Range. "
                             "It is unclear whether the Port Range has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_port_lists");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_port_lists (credentials, params, response);
    }
  else
    html = edit_port_list (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Get one port_list, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_port_list (credentials_t * credentials, params_t *params,
               const char * extra_xml)
{
  return get_one ("port_list", credentials, params, extra_xml,
                  "targets=\"1\" details=\"1\"");
}

/**
 * @brief Get one port_list, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_port_list_omp (credentials_t * credentials, params_t *params)
{
  return get_port_list (credentials, params, NULL);
}

/**
 * @brief Get all Port Lists, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_port_lists (credentials_t * credentials, params_t *params,
                const char *extra_xml)
{
  return get_many ("port_list", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all port_lists, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_port_lists_omp (credentials_t * credentials, params_t *params)
{
  return get_port_lists (credentials, params, NULL);
}

/**
 * @brief Return the new Port List page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_port_list_omp (credentials_t *credentials, params_t *params)
{
  return new_port_list (credentials, params, NULL);
}

/**
 * @brief Setup edit_port_list XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_port_list (credentials_t * credentials, params_t *params,
                const char *extra_xml)
{
  return edit_resource ("port_list", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_port_list XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_port_list_omp (credentials_t * credentials, params_t *params)
{
  return edit_port_list (credentials, params, NULL);
}

/**
 * @brief Modify a port list, get all port list, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_port_list_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *port_list_id, *name, *comment;
  entity_t entity;

  port_list_id = params_value (params, "port_list_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");

  CHECK_PARAM (port_list_id, "Save Port List", edit_port_list);
  CHECK_PARAM (name, "Save Port List", edit_port_list);
  CHECK_PARAM (comment, "Save Port List", edit_port_list);

  /* Modify the Port List. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Port List. "
                             "The Port List was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_port_lists");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Port List. "
                             "It is unclear whether the Port List has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_port_lists");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a Port List. "
                             "It is unclear whether the Port List has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_port_lists");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_port_lists (credentials, params, response);
    }
  else
    html = edit_port_list (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete a port list, get all port lists, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_port_list_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("port_list", credentials, params, 0, get_port_lists);
}

/**
 * @brief Delete a trash port list, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_port_list_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("port_list", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a port range, get the port list, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_port_range_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("port_range", credentials, params, 1, edit_port_list);
}

/**
 * @brief Import port list, get all port lists, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
import_port_list_omp (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  GString *xml = NULL;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while importing a port list. "
                             "No new port list was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_port_lists");
    }

  xml = g_string_new ("<get_port_lists>");

  /* Create the port_list. */

  if (openvas_server_sendf (&session,
                            "<create_port_list>"
                            "%s"
                            "</create_port_list>",
                            params_value (params, "xml_file"))
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a port list. "
                           "No new port list was created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_port_lists");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a port list. "
                           "It is unclear whether the port list has been created or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_port_lists");
    }

  /* Get all the port_lists. */

  if (openvas_server_send (&session,
                           "<get_port_lists"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a port list. "
                           "The new port list was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_port_lists");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a port list. "
                           "The new port list was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_port_lists");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_port_lists>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}


/* Roles. */

/**
 * @brief Returns page to create a new role.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_role (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_role>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_role>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page to create a new role.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_role_omp (credentials_t *credentials, params_t *params)
{
  return new_role (credentials, params, NULL);
}

/**
 * @brief Delete a role from trash, get all roles, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_role_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("role", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a role, get all roles, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_role_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("role", credentials, params, 0, get_roles);
}

/**
 * @brief Create a role, get all roles, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_role_omp (credentials_t *credentials, params_t *params)
{
  char *ret;
  gchar *response;
  const char *name, *comment, *users;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_PARAM (name, "Create Role", new_role);
  CHECK_PARAM (comment, "Create Role", new_role);
  CHECK_PARAM (users, "Create Role", new_role);

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new role. "
                             "No new role was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_targets");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new role. "
                             "It is unclear whether the role has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_roles");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new role. "
                             "It is unclear whether the role has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_roles");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_roles (credentials, params, response);
    }
  else
    ret = new_role (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return ret;
}

/**
 * @brief Setup edit_role XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_role (credentials_t * credentials, params_t *params,
            const char *extra_xml)
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
      switch (ompf (credentials, &response, &entity,
                    "<get_permissions"
                    " filter=\"rows=-1 ubject_type=role and subject_uuid=%s\"/>",
                    params_value (params, "role_id")))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the permission list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_roles");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the permission list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_roles");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the permission list. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_roles");
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = edit_resource ("role", credentials, params, extra->str);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Setup edit_role XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_role_omp (credentials_t * credentials, params_t *params)
{
  return edit_role (credentials, params, NULL);
}

/**
 * @brief Get one role, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_role (credentials_t * credentials, params_t *params,
          const char *extra_xml)
{
  return get_one ("role", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get one role, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_role_omp (credentials_t * credentials, params_t *params)
{
  return get_role (credentials, params, NULL);
}

/**
 * @brief Get all roles, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_roles (credentials_t * credentials, params_t *params,
           const char *extra_xml)
{
  return get_many ("role", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all roles, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_roles_omp (credentials_t * credentials, params_t *params)
{
  return get_roles (credentials, params, NULL);
}

/**
 * @brief Export a role.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Role XML on success.  HTML result of XSL transformation on error.
 */
char *
export_role_omp (credentials_t * credentials, params_t *params,
                 enum content_type * content_type, char **content_disposition,
                 gsize *content_length)
{
  return export_resource ("role", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of roles.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Roles XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_roles_omp (credentials_t * credentials, params_t *params,
                  enum content_type * content_type, char **content_disposition,
                  gsize *content_length)
{
  return export_many ("role", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Modify a role, return the next page.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_role_omp (credentials_t * credentials, params_t *params)
{
  int ret;
  gchar *html, *response;
  const char *role_id, *name, *comment, *users;
  entity_t entity;

  role_id = params_value (params, "role_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  users = params_value (params, "users");

  CHECK_PARAM (role_id, "Save Role", edit_role);
  CHECK_PARAM (name, "Save Role", edit_role);
  CHECK_PARAM (comment, "Save Role", edit_role);
  CHECK_PARAM (users, "Save Role", edit_role);

  /* Modify the Role. */

  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a role. "
                             "The role was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_roles");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a role. "
                             "It is unclear whether the role has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_roles");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a role. "
                             "It is unclear whether the role has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_roles");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_roles (credentials, params, response);
    }
  else
    html = edit_role (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Feeds. */

/**
 * @brief Get descriptions of the feed(s) connected to the manager.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_feed_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the feed list. "
                             "The current list of feeds is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_omp (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"List Feeds\">"
                                    "Only users given the Administrator role"
                                    " may access Feed Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<describe_feed/>"
                            "</commands>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the feed list. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the feed. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Get descriptions of the scap feed(s) connected to the manager.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_scap_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the SCAP feed list. "
                             "The current list of SCAP feeds is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_omp (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"List SCAP Feeds\">"
                                    "Only users given the Administrator role"
                                    " may access Feed Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<describe_scap/>"
                            "</commands>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the SCAP feed list. "
                           "The current list of SCAP feeds is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting SCAP the feed. "
                           "The current list of SCAP feeds is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Get descriptions of the CERT feed(s) connected to the manager.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_cert_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the CERT feed list. "
                             "The current list of CERT feeds is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_omp (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"List CERT Feeds\">"
                                    "Only users given the Administrator role"
                                    " may access Feed Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<describe_cert/>"
                            "</commands>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the CERT feed list. "
                           "The current list of CERT feeds is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the CERT feed. "
                           "The current list of CERT feeds is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Synchronize with an NVT feed and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
sync_feed_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while synchronizing with the NVT feed. "
                             "Feed synchronization is currently not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_omp (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Synchronize Feed\">"
                                    "Only users given the Administrator role"
                                    " may access Feed Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<sync_feed/>"
                            "<describe_feed/>"
                            "</commands>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the NVT feed. "
                           "Feed synchronization is currently not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the NVT feed. "
                           "Feed synchronization is currently not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Synchronize with a SCAP feed and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
sync_scap_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while synchronizing with the SCAP feed. "
                             "SCAP Feed synchronization is currently not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_omp (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Synchronize SCAP Feed\">"
                                    "Only users given the Administrator role"
                                    " may access Feed Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<sync_scap/>"
                            "<describe_scap/>"
                            "</commands>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the SCAP feed. "
                           "SCAP Feed synchronization is currently not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the SCAP feed. "
                           "SCAP Feed synchronization is currently not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Synchronize with a CERT feed and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
sync_cert_omp (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while synchronizing with the CERT feed. "
                             "CERT Feed synchronization is currently not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_omp (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Synchronize CERT Feed\">"
                                    "Only users given the Administrator role"
                                    " may access Feed Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<sync_cert/>"
                            "<describe_cert/>"
                            "</commands>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the CERT feed. "
                           "CERT Feed synchronization is currently not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the CERT feed. "
                           "CERT Feed synchronization is currently not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}


/* Filters. */

/**
 * @brief Get one filter, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_filter (credentials_t * credentials, params_t *params,
            const char *extra_xml)
{
  return get_one ("filter", credentials, params, extra_xml, "alerts=\"1\"");
}

/**
 * @brief Get one filter, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_filter_omp (credentials_t * credentials, params_t *params)
{
  return get_filter (credentials, params, NULL);
}

/**
 * @brief Get all filters, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_filters (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  return get_many ("filter", credentials, params, extra_xml, NULL);
}

/**
 * @brief Get all filters, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_filters_omp (credentials_t * credentials, params_t *params)
{
  return get_filters (credentials, params, NULL);
}

/**
 * @brief Returns page to create a new filter.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_filter (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  xml = g_string_new ("<new_filter>");
  if (extra_xml)
    g_string_append (xml, extra_xml);
  g_string_append (xml, "</new_filter>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create a filter, get all filters, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_filter_omp (credentials_t *credentials, params_t *params)
{
  gchar *html, *response;
  const char *name, *comment, *term, *type;
  entity_t entity;

  name = params_value (params, "name");
  comment = params_value (params, "comment");
  term = params_value (params, "term");
  type = params_value (params, "optional_resource_type");

  CHECK_PARAM (name, "Create Filter", new_filter);
  CHECK_PARAM (comment, "Create Filter", new_filter);
  CHECK_PARAM (term, "Create Filter", new_filter);
  CHECK_PARAM (type, "Create Filter", new_filter);

  switch (ompf (credentials,
                &response,
                &entity,
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
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "No new alert was created. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_alerts");
      case 2:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Failure to receive response from manager daemon.",
                            "/omp?cmd=get_alerts");
      default:
        return gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while creating a new alert. "
                            "It is unclear whether the alert has been created or not. "
                            "Diagnostics: Internal Error.",
                            "/omp?cmd=get_alerts");
    }

  if (omp_success (entity))
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

      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_filters (credentials, params, response);
    }
  else
    html = new_filter (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Delete a filter, get all filters, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_filter_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("filter", credentials, params, 1, get_trash);
}

/**
 * @brief Delete a filter, get all filters, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_filter_omp (credentials_t * credentials, params_t *params)
{
  param_t *filt_id, *id;

  filt_id = params_get (params, "filt_id");
  id = params_get (params, "filter_id");
  if (id && id->value && filt_id && filt_id->value
      && (strcmp (id->value, filt_id->value) == 0))
    // TODO: Add params_remove.
    filt_id->value = NULL;

  return delete_resource ("filter", credentials, params, 0, get_filters);
}

/**
 * @brief Setup edit_filter XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_filter (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  return edit_resource ("filter", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_filter XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_filter_omp (credentials_t * credentials, params_t *params)
{
  return edit_filter (credentials, params, NULL);
}

/**
 * @brief Export a filter.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Filter XML on success.  HTML result of XSL transformation on error.
 */
char *
export_filter_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_resource ("filter", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of filters.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Filters XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_filters_omp (credentials_t * credentials, params_t *params,
                    enum content_type * content_type, char **content_disposition,
                    gsize *content_length)
{
  return export_many ("filter", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Returns page to create a new filter.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_filter_omp (credentials_t *credentials, params_t *params)
{
  return new_filter (credentials, params, NULL);
}

/**
 * @brief Modify a filter, get all filters, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_filter_omp (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  int socket;
  gchar *html, *response;
  const char *filter_id, *name, *comment, *term, *type;

  filter_id = params_value (params, "filter_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  term = params_value (params, "term");
  type = params_value (params, "optional_resource_type");

  CHECK_PARAM (filter_id, "Save Filter", edit_filter);
  CHECK_PARAM (name, "Save Filter", edit_filter);
  CHECK_PARAM (comment, "Save Filter", edit_filter);
  CHECK_PARAM (term, "Save Filter", edit_filter);
  CHECK_PARAM (type, "Save Filter", edit_filter);

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a filter. "
                             "The filter was not saved. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_filters");
    }

  {
    int ret;
    const char *status;
    entity_t entity;

    /* Modify the filter. */

    ret = openvas_server_sendf (&session,
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
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a filter. "
                             "The filter was not modified. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_filters");
      }

    entity = NULL;
    if (read_entity_and_text (&session, &entity, &response))
      {
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a filter. "
                             "It is unclear whether the filter has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_filters");
      }

    openvas_server_close (socket, session);

    status = entity_attribute (entity, "status");
    if ((status == NULL)
        || (strlen (status) == 0))
      {
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while modifying a filter. "
                             "It is unclear whether the filter has been modified or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_filters");
      }

    if (status[0] != '2')
      {
        openvas_server_close (socket, session);
        html = edit_filter (credentials, params, response);
        g_free (response);
        free_entity (entity);
        return html;
      }

    free_entity (entity);
  }

  openvas_server_close (socket, session);

  /* Pass response to handler of following page. */

  html = next_page (credentials, params, response);
  if (html == NULL)
    html = get_filters (credentials, params, response);
  g_free (response);
  return html;
}


/* Schedules. */

/**
 * @brief Setup edit_schedule XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_schedule (credentials_t * credentials, params_t *params,
             const char *extra_xml)
{
  return edit_resource ("schedule", credentials, params, extra_xml);
}

/**
 * @brief Setup edit_schedule XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_schedule_omp (credentials_t * credentials, params_t *params)
{
  return edit_schedule (credentials, params, NULL);
}

/**
 * @brief Export a schedule.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Schedule XML on success.  HTML result of XSL transformation on error.
 */
char *
export_schedule_omp (credentials_t * credentials, params_t *params,
                     enum content_type * content_type,
                     char **content_disposition, gsize *content_length)
{
  return export_resource ("schedule", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of schedules.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Schedules XML on success. HTML result of XSL transformation on error.
 */
char *
export_schedules_omp (credentials_t * credentials, params_t *params,
                      enum content_type * content_type,
                      char **content_disposition, gsize *content_length)
{
  return export_many ("schedule", credentials, params, content_type,
                      content_disposition, content_length);
}

/**
 * @brief Save schedule, get next page, XSL transform the result.
 *
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_schedule_omp (credentials_t * credentials, params_t *params)
{
  gchar *response;
  entity_t entity;
  const char *schedule_id, *name, *comment;
  const char *hour, *minute, *day_of_month, *month, *year, *timezone;
  const char *period, *period_unit, *duration, *duration_unit;
  char *ret;

  schedule_id = params_value (params, "schedule_id");
  name = params_value (params, "name");
  comment = params_value (params, "comment");
  hour = params_value (params, "hour");
  minute = params_value (params, "minute");
  day_of_month = params_value (params, "day_of_month");
  duration = params_value (params, "duration");
  duration_unit = params_value (params, "duration_unit");
  month = params_value (params, "month");
  period = params_value (params, "period");
  period_unit = params_value (params, "period_unit");
  year = params_value (params, "year");
  timezone = params_value (params, "timezone");

  if (name == NULL || hour == NULL || minute == NULL || day_of_month == NULL
      || duration == NULL || duration_unit == NULL || month == NULL
      || period == NULL || period_unit == NULL || year == NULL
      || timezone == NULL)
    return edit_schedule (credentials, params,
                          GSAD_MESSAGE_INVALID_PARAM ("Create Schedule"));

  if (schedule_id == NULL || name == NULL || comment == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a schedule. "
                         "The schedule remains the same. "
                         "Diagnostics: Required parameter missing.",
                         "/omp?cmd=get_schedules");

  response = NULL;
  entity = NULL;
  switch (ompf (credentials,
                &response,
                &entity,
                "<modify_schedule schedule_id=\"%s\">"
                "<name>%s</name>"
                "<comment>%s</comment>"
                "<first_time>"
                "<hour>%s</hour>"
                "<minute>%s</minute>"
                "<day_of_month>%s</day_of_month>"
                "<month>%s</month>"
                "<year>%s</year>"
                "</first_time>"
                "<timezone>%s</timezone>"
                "<period>"
                "<unit>%s</unit>"
                "%s"
                "</period>"
                "<duration>"
                "<unit>%s</unit>"
                "%s"
                "</duration>"
                "</modify_schedule>",
                schedule_id,
                name ? name : "",
                comment ? comment : "",
                hour,
                minute,
                day_of_month,
                month,
                year,
                timezone,
                (strcmp (period_unit, "")
                  ? period_unit
                  : "second"),
                period,
                (strcmp (duration_unit, "")
                  ? duration_unit
                  : "second"),
                duration))
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a schedule. "
                             "The schedule remains the same. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_schedules");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a schedule. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_schedules");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a schedule. "
                             "It is unclear whether the schedule has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_schedules");
    }

  if (omp_success (entity))
    {
      ret = next_page (credentials, params, response);
      if (ret == NULL)
        ret = get_schedules_omp (credentials, params);
    }
  else
    ret = edit_schedule (credentials, params, response);

  free_entity (entity);
  g_free (response);
  return ret;
}


/* Users. */

/**
 * @brief Returns page to create a new user.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
new_user (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;

  xml = g_string_new ("<new_user>");
  if (extra_xml)
    g_string_append (xml, extra_xml);

  if (command_enabled (credentials, "DESCRIBE_AUTH"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (omp (credentials, &response, &entity, "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (xml, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_GROUPS"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (omp (credentials, &response, &entity, "<get_groups/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (xml, response);

      free_entity (entity);
      g_free (response);
    }

  if (command_enabled (credentials, "GET_ROLES"))
    {
      gchar *response;
      entity_t entity;

      response = NULL;
      entity = NULL;
      switch (omp (credentials, &response, &entity, "<get_roles/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (xml, response);

      free_entity (entity);
      g_free (response);
    }

  g_string_append (xml, "</new_user>");
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns page to create a new user.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
new_user_omp (credentials_t *credentials, params_t *params)
{
  return new_user (credentials, params, NULL);
}

/**
 * @brief Delete a user, get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_user_omp (credentials_t * credentials, params_t *params)
{
  return delete_resource ("user", credentials, params, 0, get_users);
}

/**
 * @brief Get one user, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_user (credentials_t * credentials, params_t *params, const char *extra_xml)
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
      switch (omp (credentials, &response, &entity, "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }
  html = get_one ("user", credentials, params, extra->str, NULL);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get one user, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_user_omp (credentials_t * credentials, params_t *params)
{
  return get_user (credentials, params, NULL);
}

/**
 * @brief Get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
static char *
get_users (credentials_t * credentials, params_t *params,
           const char *extra_xml)
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
      switch (omp (credentials, &response, &entity, "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }
  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = get_many ("user", credentials, params, extra->str, NULL);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_users_omp (credentials_t * credentials, params_t *params)
{
  return get_users (credentials, params, NULL);
}

/**
 * @brief Create a user, get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_user_omp (credentials_t * credentials, params_t *params)
{
  const char *name, *password, *hosts, *hosts_allow, *ifaces, *ifaces_allow;
  const char *enable_ldap_connect, *submit;
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
  enable_ldap_connect = params_value (params, "enable_ldap_connect");

  submit = params_value (params, "submit_plus_group");
  if (submit && (strcmp (submit, "+") == 0))
    {
      param_t *count;
      count = params_get (params, "groups");
      if (count)
        {
          gchar *old;
          old = count->value;
          count->value = old ? g_strdup_printf ("%i", atoi (old) + 1)
                             : g_strdup ("2");
        }
      else
        params_add (params, "groups", "2");

      if (name == NULL || password == NULL || hosts == NULL
          || hosts_allow == NULL)
        return new_user (credentials, params,
                         GSAD_MESSAGE_INVALID_PARAM ("New User"));

      return new_user_omp (credentials, params);
    }

  submit = params_value (params, "submit_plus_role");
  if (submit && (strcmp (submit, "+") == 0))
    {
      param_t *count;
      count = params_get (params, "roles");
      if (count)
        {
          gchar *old;
          old = count->value;
          count->value = old ? g_strdup_printf ("%i", atoi (old) + 1)
                             : g_strdup ("2");
        }
      else
        params_add (params, "roles", "2");

      if (name == NULL || password == NULL || hosts == NULL
          || hosts_allow == NULL)
        return new_user (credentials, params,
                         GSAD_MESSAGE_INVALID_PARAM ("New User"));

      return new_user_omp (credentials, params);
    }

  CHECK_PARAM (name, "Create User", new_user);
  CHECK_PARAM (password, "Create User", new_user);
  CHECK_PARAM (hosts, "Create User", new_user);
  CHECK_PARAM (hosts_allow, "Create User", new_user);
  CHECK_PARAM (ifaces, "Create User", new_user);
  CHECK_PARAM (ifaces_allow, "Create User", new_user);

  /* Create the user. */

  string = g_string_new ("<create_user>");
  buf = g_markup_printf_escaped ("<name>%s</name>"
                                 "<password>%s</password>",
                                 name,
                                 password);

  g_string_append (string, buf);
  g_free (buf);

  group_elements = g_string_new ("<groups>");
  groups = params_values (params, "group_id_optional:");
  if (groups)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, groups);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (group_elements,
                                  "<group id=\"%s\"/>",
                                  param->value ? param->value : "");
    }
  g_string_append (string, group_elements->str);
  g_string_free (group_elements, TRUE);
  g_string_append (string, "</groups>");

  role_elements = g_string_new ("");
  roles = params_values (params, "role_id_optional:");
  if (roles)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, roles);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (role_elements,
                                  "<role id=\"%s\"/>",
                                  param->value ? param->value : "");
    }
  g_string_append (string, role_elements->str);
  g_string_free (role_elements, TRUE);

  buf = g_markup_printf_escaped ("<hosts allow=\"%s\">%s</hosts>"
                                 "<ifaces allow=\"%s\">%s</ifaces>",
                                 hosts_allow, hosts, ifaces_allow, ifaces);
  g_string_append (string, buf);
  g_free (buf);
  if ((enable_ldap_connect) && (strcmp (enable_ldap_connect, "1") == 0))
    {
      g_string_append (string,
        "<sources><source>ldap_connect</source></sources>");
    }
  g_string_append (string, "</create_user>");

  buf = g_string_free (string, FALSE);

  response = NULL;
  entity = NULL;
  ret = omp (credentials, &response, &entity, buf);
  g_free (buf);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new user. "
                             "No new user was created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_users");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new user. "
                             "It is unclear whether the user has been created or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_users");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while creating a new user. "
                             "It is unclear whether the user has been created or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_users");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_users (credentials, params, response);
    }
  else
    html = new_user (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Setup edit_user XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
edit_user (credentials_t * credentials, params_t *params,
           const char *extra_xml)
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
      switch (omp (credentials, &response, &entity, "<describe_auth/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the auth list. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
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
      switch (omp (credentials, &response, &entity, "<get_groups/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the group list. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
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
      switch (omp (credentials, &response, &entity, "<get_roles/>"))
        {
          case 0:
          case -1:
            break;
          case 1:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_users");
          case 2:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_users");
          default:
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred getting the role list. "
                                 "No new user was created. "
                                 "Diagnostics: Internal Error.",
                                 "/omp?cmd=get_users");
        }

      g_string_append (extra, response);

      free_entity (entity);
      g_free (response);
    }

  if (extra_xml)
    g_string_append (extra, extra_xml);
  html = edit_resource ("user", credentials, params, extra->str);
  g_string_free (extra, TRUE);
  return html;
}

/**
 * @brief Setup edit_user XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_user_omp (credentials_t * credentials, params_t *params)
{
  return edit_user (credentials, params, NULL);
}

/**
 * @brief Modify a user, get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[out] password_return  Password.  Caller must free.
 *
 * @return Result of XSL transformation.
 */
char *
save_user_omp (credentials_t * credentials, params_t *params,
               char **password_return)
{
  int ret;
  gchar *html, *response, *buf;
  const char *user_id, *login, *modify_password, *password, *submit;
  const char *hosts, *hosts_allow, *enable_ldap_connect, *ifaces, *ifaces_allow;
  entity_t entity;
  GString *command, *group_elements, *role_elements;
  params_t *groups, *roles;

  *password_return = NULL;

  enable_ldap_connect = params_value (params, "enable_ldap_connect");
  /* List of hosts user has/lacks access rights. */
  hosts = params_value (params, "access_hosts");
  /* Whether hosts grants ("1") or forbids ("0") access.  "2" for all
   * access. */
  hosts_allow = params_value (params, "hosts_allow");
  ifaces = params_value (params, "access_ifaces");
  ifaces_allow = params_value (params, "ifaces_allow");
  login = params_value (params, "login");
  modify_password = params_value (params, "modify_password");
  password = params_value (params, "password");
  user_id = params_value (params, "user_id");

  submit = params_value (params, "submit_plus_group");
  if (submit && (strcmp (submit, "+") == 0))
    {
      param_t *count;
      count = params_get (params, "groups");
      if (count)
        {
          gchar *old;
          old = count->value;
          count->value = old ? g_strdup_printf ("%i", atoi (old) + 1)
                             : g_strdup ("2");
        }
      else
        params_add (params, "groups", "2");

      CHECK_PARAM (user_id, "Edit User", edit_user);
      CHECK_PARAM (login, "Edit User", edit_user);
      CHECK_PARAM (modify_password, "Edit User", edit_user);
      CHECK_PARAM (password, "Edit User", edit_user);
      CHECK_PARAM (hosts, "Edit User", edit_user);
      CHECK_PARAM (hosts, "Edit User", edit_user);
      CHECK_PARAM (hosts_allow, "Edit User", edit_user);

      return edit_user_omp (credentials, params);
    }

  submit = params_value (params, "submit_plus_role");
  if (submit && (strcmp (submit, "+") == 0))
    {
      param_t *count;
      count = params_get (params, "roles");
      if (count)
        {
          gchar *old;
          old = count->value;
          count->value = old ? g_strdup_printf ("%i", atoi (old) + 1)
                             : g_strdup ("2");
        }
      else
        params_add (params, "roles", "2");

      CHECK_PARAM (user_id, "Edit User", edit_user);
      CHECK_PARAM (login, "Edit User", edit_user);
      CHECK_PARAM (modify_password, "Edit User", edit_user);
      CHECK_PARAM (password, "Edit User", edit_user);
      CHECK_PARAM (hosts, "Edit User", edit_user);
      CHECK_PARAM (hosts, "Edit User", edit_user);
      CHECK_PARAM (hosts_allow, "Edit User", edit_user);

      return edit_user_omp (credentials, params);
    }

  CHECK_PARAM (user_id, "Save User", edit_user);
  CHECK_PARAM (login, "Save User", edit_user);
  CHECK_PARAM (modify_password, "Save User", edit_user);
  CHECK_PARAM (password, "Save User", edit_user);
  CHECK_PARAM (hosts, "Save User", edit_user);
  CHECK_PARAM (hosts_allow, "Save User", edit_user);
  CHECK_PARAM (ifaces, "Save User", edit_user);
  CHECK_PARAM (ifaces_allow, "Save User", edit_user);

  /* Modify the user. */

  command = g_string_new ("");
  buf = g_markup_printf_escaped ("<modify_user user_id=\"%s\">"
                                 "<password modify=\"%s\">"
                                 "%s</password>",
                                 user_id,
                                 modify_password,
                                 password);
  g_string_append (command, buf);
  g_free (buf);

  buf = g_markup_printf_escaped ("<hosts allow=\"%s\">%s</hosts>"
                                 "<ifaces allow=\"%s\">%s</ifaces>",
                                 hosts_allow, hosts, ifaces_allow, ifaces);
  g_string_append (command, buf);
  g_free (buf);

  enable_ldap_connect = params_value (params, "enable_ldap_connect");
  if (enable_ldap_connect && strcmp (enable_ldap_connect, "1") == 0)
    {
      g_string_append (command, "<sources><source>ldap_connect</source></sources>");
    }
  else
    {
      g_string_append (command, "<sources><source>file</source></sources>");
    }

  group_elements = g_string_new ("<groups>");
  groups = params_values (params, "group_id_optional:");
  if (groups)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, groups);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (group_elements,
                                  "<group id=\"%s\"/>",
                                  param->value ? param->value : "");
    }
  g_string_append (command, group_elements->str);
  g_string_free (group_elements, TRUE);
  g_string_append (command, "</groups>");

  role_elements = g_string_new ("");
  roles = params_values (params, "role_id_optional:");
  if (roles)
    {
      params_iterator_t iter;
      char *name;
      param_t *param;

      params_iterator_init (&iter, roles);
      while (params_iterator_next (&iter, &name, &param))
        if (param->value && strcmp (param->value, "--"))
          g_string_append_printf (role_elements,
                                  "<role id=\"%s\"/>",
                                  param->value ? param->value : "");
    }
  g_string_append (command, role_elements->str);
  g_string_free (role_elements, TRUE);

  g_string_append (command, "</modify_user>");

  response = NULL;
  entity = NULL;
  ret = omp (credentials,
             &response,
             &entity,
             command->str);
  g_string_free (command, TRUE);
  switch (ret)
    {
      case 0:
        if (strcmp (modify_password, "0")
            && (strcmp (login, credentials->username) == 0))
          {
            const char *status;
            status = entity_attribute (entity, "status");
            if (status && (strlen (status) > 0) && (status[0] == '2'))
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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a user. "
                             "The user was not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_users");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a user. "
                             "It is unclear whether the user has been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_users");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a user. "
                             "It is unclear whether the user has been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_users");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_users (credentials, params, response);
    }
  else
    html = edit_user (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}

/**
 * @brief Export a user.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Note XML on success.  HTML result of XSL transformation on error.
 */
char *
export_user_omp (credentials_t * credentials, params_t *params,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  return export_resource ("user", credentials, params, content_type,
                          content_disposition, content_length);
}

/**
 * @brief Export a list of users.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   params               Request parameters.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Users XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_users_omp (credentials_t * credentials, params_t *params,
                  enum content_type * content_type, char **content_disposition,
                  gsize *content_length)
{
  return export_many ("user", credentials, params, content_type,
                      content_disposition, content_length);
}

char *
cvss_calculator (credentials_t * credentials, params_t *params)
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
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Save authentication settings.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params        Request parameters.
 *
 * @return XSL transformated list of users and configuration.
 */
char*
save_auth_omp (credentials_t* credentials, params_t *params)
{
  int ret;
  entity_t entity;
  char *truefalse;
  gchar *html, *response;
  const char *ldaphost, *method, *authdn;

  if (params_value (params, "enable")
      && (strcmp (params_value (params, "enable"), "1") == 0))
    truefalse = "true";
  else
    truefalse = "false";

  ldaphost = params_value (params, "ldaphost");
  method = params_value (params, "group");
  authdn = params_value (params, "authdn");

  if (ldaphost == NULL || method == NULL
      || (strcmp (method, "method:ldap_connect") == 0 && authdn == NULL))
    return get_users (credentials, params,
                      GSAD_MESSAGE_INVALID_PARAM
                       ("Save Authentication Configuration"));

  /* Input is valid. Save settings. */

  /** @warning authdn shall contain a single %s, handle with care. */
  response = NULL;
  entity = NULL;
  ret = ompf (credentials,
              &response,
              &entity,
              "<modify_auth>"
              "<group name=\"%s\">"
              "<auth_conf_setting key=\"enable\" value=\"%s\"/>"
              "<auth_conf_setting key=\"ldaphost\" value=\"%s\"/>"
              "<auth_conf_setting key=\"authdn\" value=\"%s\"/>"
              "</group>"
              "</modify_auth>",
              method,
              truefalse,
              ldaphost,
              authdn);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the auth settings. "
                             "The settings were not saved. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_users");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the auth settings. "
                             "It is unclear whether the settings have been saved or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_users");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the auth settings. "
                             "It is unclear whether the settings have been saved or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_users");
    }

  if (omp_success (entity))
    {
      html = next_page (credentials, params, response);
      if (html == NULL)
        html = get_users (credentials, params, response);
    }
  else
    html = get_users (credentials, params, response);
  free_entity (entity);
  g_free (response);
  return html;
}


/* Wizards. */

/**
 * @brief Returns a wizard page.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
wizard (credentials_t *credentials, params_t *params, const char *extra_xml)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (manager_connect (credentials, &socket, &session, &html))
    {
      case 0:
        break;
      case -1:
        if (html)
          return html;
        /* Fall through. */
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the wizard. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("");
  g_string_append_printf (xml,
                          "<wizard>%s<%s/>",
                          extra_xml ? extra_xml : "",
                          params_value (params, "name"));

  /* Try to run init mode of the wizard */
  if (openvas_server_sendf_xml (&session,
                                "<run_wizard read_only=\"1\">"
                                "<name>%s</name>"
                                "<mode>init</mode>"
                                "</run_wizard>",
                                params_value (params, "name"))
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the wizard. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the"
                           " wizard."
                           "Diagnostics: Failure to receive response from"
                           " manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Get the setting. */

  if (openvas_server_sendf_xml (&session,
                                "<get_settings"
                                " setting_id=\"20f3034c-e709-11e1-87e7-406186ea4fc5\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the wizard. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while the wizard. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append_printf (xml, "</wizard>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Returns a wizard page.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
wizard_omp (credentials_t *credentials, params_t *params)
{
  return wizard (credentials, params, NULL);
}

/**
 * @brief Returns a wizard_get page.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
wizard_get (credentials_t *credentials, params_t *params, const char *extra_xml)
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
   * parameters are called "param"s and so are the OMP wizard
   * parameters. */

  name = params_value (params, "get_name");
  if (name == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while trying to start a wizard. "
                         "Diagnostics: Required parameter 'get_name' was NULL.",
                         "/omp?cmd=get_tasks");

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
  ret = omp (credentials, &response, &entity, run->str);
  g_string_free (run, TRUE);
  switch (ret)
    {
      case 0:
      case -1:
        break;
      case 1:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "The wizard did not start. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      case 2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while running a wizard. "
                             "It is unclear whether the wizard started or not. "
                             "Diagnostics: Internal Error.",
                             "/omp?cmd=get_tasks");
    }

  wizard_xml = g_strdup_printf ("<wizard><%s/>%s%s</wizard>",
                                name,
                                extra_xml ? extra_xml : "",
                                response);

  return xsl_transform_omp (credentials, wizard_xml);
}

/**
 * @brief Returns a wizard_get page.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
wizard_get_omp (credentials_t *credentials, params_t *params)
{
  return wizard_get (credentials, params, NULL);
}


/* Manager communication. */

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
 *
 * @return 0 if valid, 1 failed, 2 manager down, -1 error.
 */
int
authenticate_omp (const gchar * username, const gchar * password,
                  gchar **role, gchar **timezone, gchar **severity,
                  gchar **capabilities, gchar **language,
                  gchar **autorefresh)
{
  gnutls_session_t session;
  int socket;
  int auth;

  socket = openvas_server_open (&session,
                                manager_address
                                 ? manager_address
                                 : OPENVASMD_ADDRESS,
                                manager_port);
  if (socket == -1)
    {
      tracef ("%s failed to acquire socket!\n", __FUNCTION__);
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
  tracef ("Sleeping!");
  sleep (20);
#endif

  auth = omp_authenticate_info (&session, username, password, role,
                                severity, timezone);
  if (auth == 0)
    {
      entity_t entity;
      const char* status;
      char first;
      gchar *response;
      int ret;

      /* Get language setting. */

      ret = openvas_server_send
             (&session,
              "<get_settings"
              " setting_id=\"6765549a-934e-11e3-b358-406186ea4fc5\"/>");
      if (ret)
        {
          openvas_server_close (socket, session);
          return 2;
        }

      /* Read the response. */

      entity = NULL;
      if (read_entity_and_text (&session, &entity, &response))
        {
          openvas_server_close (socket, session);
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
      if (first == '2')
        {
          entity_t setting;
          setting = entity_child (entity, "setting");
          if (setting == NULL)
            {
              free_entity (entity);
              g_free (response);
              return -1;
            }
          setting = entity_child (setting, "value");
          if (setting == NULL)
            {
              free_entity (entity);
              g_free (response);
              return -1;
            }
          *language = g_strdup (entity_text (setting));
          free_entity (entity);
        }
      else
        {
          free_entity (entity);
          g_free (response);
          return -1;
        }

      /* Request help. */

      ret = openvas_server_send (&session,
                                 "<help format=\"XML\" type=\"brief\"/>");
      if (ret)
        {
          openvas_server_close (socket, session);
          return 2;
        }

      /* Read the response. */

      entity = NULL;
      if (read_entity_and_text (&session, &entity, &response))
        {
          openvas_server_close (socket, session);
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
          openvas_server_close (socket, session);
          g_free (response);
          return -1;
        }

      /* Get autorefresh setting. */

      ret = openvas_server_sendf
             (&session,
              "<get_settings"
              " setting_id=\"578a1c14-e2dc-45ef-a591-89d31391d007\"/>");
      if (ret)
        {
          openvas_server_close (socket, session);
          return 2;
        }

      /* Read the response. */

      entity = NULL;
      if (read_entity_and_text (&session, &entity, &response))
        {
          openvas_server_close (socket, session);
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
      if (first == '2')
        {
          entity_t setting;
          setting = entity_child (entity, "setting");
          if (setting == NULL)
            {
              free_entity (entity);
              g_free (response);
              return -1;
            }
          setting = entity_child (setting, "value");
          if (setting == NULL)
            {
              free_entity (entity);
              g_free (response);
              return -1;
            }
          *autorefresh = g_strdup (entity_text (setting));
          g_free (response);
          free_entity (entity);
        }
      else
        {
          free_entity (entity);
          g_free (response);
          return -1;
        }

      openvas_server_close (socket, session);
      return 0;
    }
  else
    {
      openvas_server_close (socket, session);
      return 1;
    }
}

int
token_user_remove (const char *);

/**
 * @brief Connect to OpenVAS Manager daemon.
 *
 * If the Manager is down, logout and return the login HTML in \p html.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[out]  socket       Manager socket on success.
 * @param[out]  session      GNUTLS session on success.
 * @param[out]  html         HTML on failure to connect if possible, else NULL.
 *
 * @return 0 success, -1 failed to connect, -2 authentication failed.
 */
int
manager_connect (credentials_t *credentials, int *socket,
                 gnutls_session_t *session, gchar **html)
{
  *socket = openvas_server_open (session,
                                 manager_address
                                  ? manager_address
                                  : OPENVASMD_ADDRESS,
                                 manager_port);
  if (*socket == -1)
    {
      time_t now;
      gchar *xml;
      char *res;
      char ctime_now[200];
      int ret;

      if (html == NULL)
        return -1;

      *html = NULL;

      if (credentials->token == NULL)
        return -1;

      ret = token_user_remove (credentials->token);
      if (ret)
        return -1;

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      xml = g_strdup_printf ("<login_page>"
                             "<message>"
                             "Logged out. OMP service is down."
                             "</message>"
                             "<token></token>"
                             "<time>%s</time>"
                             "</login_page>",
                             ctime_now);
      res = xsl_transform (xml);
      g_free (xml);
      *html = res;
      return -1;
    }

#if 0
  tracef ("in manager_connect: Trying to authenticate with %s/%s\n",
          credentials->username,
          credentials->password);
#endif

  if (omp_authenticate (session, credentials->username, credentials->password))
    {
      tracef ("authenticate failed!\n");
      openvas_server_close (*socket, *session);
      return -2;
    }

#ifdef DEBUG
  /* Enable this if you need the CGI to sleep after launch. This can be useful
   * if you need to attach to manager process the CGI is talking to for
   * debugging purposes.
   *
   * An easier method is to run gsad under gdb and set a breakpoint here.
   */
  tracef ("Sleeping!");
  sleep (10);
#endif
  return 0;
}
