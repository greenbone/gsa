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

int manager_connect (credentials_t *, int *, gnutls_session_t *, gchar **);

static char *get_tasks (credentials_t *, const char *, const char *,
                        const char *, const char *, const char *, int,
                        const char *);

static char *get_trash (credentials_t *, const char *, const char *,
                        const char *);


/* Helpers. */

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
  gchar *res;
  GString *string;
  char *html;
  char ctime_now[27];

  assert (credentials);

  now = time (NULL);
  ctime_r_strip_newline (&now, ctime_now);

  string = g_string_new ("");

  res = g_markup_printf_escaped ("<envelope>"
                                 "<token>%s</token>"
                                 "<caller>%s</caller>"
                                 "<time>%s</time>"
                                 "<login>%s</login>",
                                 credentials->token,
                                 credentials->caller ? credentials->caller : "",
                                 ctime_now,
                                 credentials->username);
  g_string_append (string, res);
  g_free (res);
  g_string_append_printf (string, "%s</envelope>", xml);

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
 * @param[in]  function     Function for error message.
 * @param[in]  line         Line number for error message.
 *
 * @return XSL transformed error message on failure, NULL on success.
 */
static char *
check_modify_config (credentials_t *credentials, gnutls_session_t *session,
                     const char *function, int line)
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
 * @brief Check a modify_report_format response.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  session      Session with manager.
 * @param[in]  function     Function for error message.
 * @param[in]  line         Line number for error message.
 *
 * @return XSL transformed error message on failure, NULL on success.
 */
static char *
check_modify_report_format (credentials_t *credentials, gnutls_session_t *session,
                            const char *function, int line)
{
  entity_t entity;
  const char *status_text;

  /** @todo This would be much easier with real error codes. */

  /* Read the response. */

  if (read_entity (session, &entity))
    {
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a report format. "
                           "It is unclear whether the entire report format has been saved. "
                           "Diagnostics: Failure to read command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  /* Check the response. */

  status_text = entity_attribute (entity, "status_text");
  if (status_text == NULL)
    {
      free_entity (entity);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a report format. "
                           "It is unclear whether the entire report format has been saved. "
                           "Diagnostics: Failure to parse status_text from response.",
                           "/omp?cmd=get_report_formats");
    }

  if (strcmp (status_text, "Parameter validation failed") == 0)
    {
      GString *xml;
      free_entity (entity);
      xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Save Report Format"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (strcmp (status_text, "OK"))
    {
      free_entity (entity);
      /** @todo Put in XML for "result of previous..." window. */
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a report format. "
                           "It is unclear whether the entire report format has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  return NULL;
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
 * @todo Display actual text given in \param message .
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  message      If not NULL, display message.
 * @param[in]  apply_overrides  Whether to apply overrides.
 *
 * @return Result of XSL transformation.
 */
char *
new_task_omp (credentials_t * credentials, const char* message,
              int apply_overrides)
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

  /* Get escalators to select in new task UI. */
  if (openvas_server_send (&session,
                           "<get_escalators"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting escalator list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting escalator list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

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

  /* Get slaves to select in new task UI. */
  if (openvas_server_send (&session,
                           "<get_slaves"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
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

  if (message)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Task"));
  g_string_append_printf (xml,
                          "<user>%s</user>"
                          "<apply_overrides>%i</apply_overrides>"
                          "</new_task>",
                          credentials->username,
                          apply_overrides);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create a report, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  name          New task name.
 * @param[in]  comment       Comment on task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  xml_file      Report XML for new task.
 * @param[in]  task_id       Task to hold report, or NULL for new task.
 *
 * @return Result of XSL transformation.
 */
char *
create_report_omp (credentials_t * credentials, char *name, char *comment,
                   const char *apply_overrides, const char *xml_file,
                   const char *task_id)
{
  entity_t entity;
  gnutls_session_t session;
  char *text = NULL;
  int socket, ret;
  gchar *html;

  if (task_id)
    {
      char *ret;
      gchar *command;

      command = g_strdup_printf ("<create_report>"
                                 "<task id=\"%s\"/>"
                                 "%s"
                                 "</create_report>",
                                 task_id ? task_id : "0",
                                 xml_file);
      ret = get_tasks (credentials, task_id, NULL, NULL, NULL, command,
                       strcmp (apply_overrides, "0"), NULL);
      g_free (command);
      return ret;
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
                             "An internal error occurred while creating a new task. "
                             "The task is not created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  ret = openvas_server_sendf (&session,
                              "<commands>"
                              "<create_report>"
                              "<task>"
                              "<name>%s</name>"
                              "<comment>%s</comment>"
                              "</task>"
                              "%s"
                              "</create_report>"
                              "<get_tasks"
                              " sort_field=\"name\""
                              " sort_order=\"ascending\""
                              " apply_overrides=\"%s\"/>"
                              "</commands>",
                              name ? name : "",
                              comment ? comment : "",
                              xml_file,
                              apply_overrides);

  if (ret == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new task. "
                           "The task is not created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new task. "
                           "It is unclear whether the task has been created or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Create a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  name          New task name.
 * @param[in]  comment       Comment on task.
 * @param[in]  target_id     Target for task.
 * @param[in]  config_id     Config for task.
 * @param[in]  escalator_id  Escalator for task.
 * @param[in]  schedule_id   UUID of schedule for task.
 * @param[in]  slave_id      UUID of slave for task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  max_checks        Max checks task preference.
 * @param[in]  max_hosts         Max hosts task preference.
 *
 * @return Result of XSL transformation.
 */
char *
create_task_omp (credentials_t * credentials, char *name, char *comment,
                 char *target_id, char *config_id, const char *escalator_id,
                 const char *schedule_id, const char *slave_id,
                 const char *apply_overrides, const char *max_checks,
                 const char *max_hosts)
{
  entity_t entity;
  gnutls_session_t session;
  char *text = NULL;
  int socket, ret;
  gchar *schedule_element, *escalator_element, *slave_element;
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
                             "An internal error occurred while creating a new task. "
                             "The task is not created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (!schedule_id || strcmp (schedule_id, "--") == 0)
    schedule_element = g_strdup ("");
  else
    schedule_element = g_strdup_printf ("<schedule id=\"%s\"/>", schedule_id);

  if (!escalator_id || strcmp (escalator_id, "--") == 0)
    escalator_element = g_strdup ("");
  else
    escalator_element = g_strdup_printf ("<escalator id=\"%s\"/>",
                                         escalator_id);

  if (!slave_id || strcmp (slave_id, "--") == 0)
    slave_element = g_strdup ("");
  else
    slave_element = g_strdup_printf ("<slave id=\"%s\"/>", slave_id);

  ret = openvas_server_sendf (&session,
                              "<commands>"
                              "<create_task>"
                              "<config id=\"%s\"/>"
                              "%s"
                              "%s"
                              "%s"
                              "<target id=\"%s\"/>"
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
                              "</preferences>"
                              "</create_task>"
                              "<get_tasks"
                              " sort_field=\"name\""
                              " sort_order=\"ascending\""
                              " apply_overrides=\"%s\"/>"
                              "</commands>",
                              config_id,
                              schedule_element,
                              escalator_element,
                              slave_element,
                              target_id,
                              name,
                              comment,
                              max_checks,
                              max_hosts,
                              apply_overrides);

  g_free (schedule_element);
  g_free (escalator_element);
  g_free (slave_element);

  if (ret == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new task. "
                           "The task is not created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new task. "
                           "It is unclear whether the task has been created or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Delete a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  next              Name of next page.
 *
 * @return Result of XSL transformation.
 */
char *
delete_task_omp (credentials_t * credentials, const char *task_id,
                 int apply_overrides, const char *next)
{
  char *ret;
  gchar *delete_task;

  if (task_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a task. "
                         "The task was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  delete_task = g_strdup_printf ("<delete_task task_id=\"%s\" />", task_id);
  ret = get_tasks (credentials, NULL, "name", "ascending", NULL, delete_task,
                   apply_overrides, NULL);
  g_free (delete_task);
  return ret;
}

/**
 * @brief Setup edit_task XML, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  task_id           UUID of task.
 * @param[in]  extra_xml         Extra XML to insert inside page element.
 * @param[in]  next              Name of next page.
 * @param[in]  refresh_interval  Refresh interval (parsed to int).
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 * @param[in]  apply_overrides   Whether to apply overrides.
 *
 * @return Result of XSL transformation.
 */
char *
edit_task (credentials_t * credentials, const char *task_id,
           const char *extra_xml, const char *next,
           /* Parameters for get_tasks. */
           const char *refresh_interval, const char *sort_field,
           const char *sort_order, int apply_overrides)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (task_id == NULL || next == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a task. "
                         "The task remains as it was. "
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
                             "An internal error occurred while editing a task. "
                             "The task remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_tasks task_id=\"%s\" details=\"1\" />"
                            "<get_targets"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "<get_configs"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "<get_escalators"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "<get_schedules"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "<get_slaves/>"
                            "</commands>",
                            task_id)
      == -1)
    {
      g_string_free (xml, TRUE);
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
                          /* Page that follows. */
                          "<next>%s</next>"
                          /* Passthroughs. */
                          "<refresh_interval>%s</refresh_interval>"
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>"
                          "<apply_overrides>%i</apply_overrides>",
                          task_id,
                          credentials->username,
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
 * @param[in]  task_id           UUID of task.
 * @param[in]  next              Name of next page.
 * @param[in]  refresh_interval  Refresh interval (parsed to int).
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 * @param[in]  apply_overrides   Whether to apply overrides.
 *
 * @return Result of XSL transformation.
 */
char *
edit_task_omp (credentials_t * credentials, const char *task_id,
               const char *next,
               /* Parameters for get_tasks. */
               const char *refresh_interval, const char *sort_field,
               const char *sort_order, int apply_overrides)
{
  return edit_task (credentials, task_id, NULL, next, refresh_interval,
                    sort_field, sort_order, apply_overrides);
}

/**
 * @brief Save task, get next page, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  task_id           ID of task.
 * @param[in]  name              New name for task.
 * @param[in]  comment           New comment for task.
 * @param[in]  escalator_id      New escalator for task.
 * @param[in]  schedule_id       New schedule for task.
 * @param[in]  slave_id          New slave for task.
 * @param[in]  next              Name of next page.
 * @param[in]  refresh_interval  Refresh interval (parsed to int).
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  max_checks        Max checks task preference.
 * @param[in]  max_hosts         Max hosts task preference.
 *
 * @return Result of XSL transformation.
 */
char *
save_task_omp (credentials_t * credentials, const char *task_id,
               const char *name, const char *comment, const char *escalator_id,
               const char *schedule_id, const char *slave_id,
               const char *next,
               /* Parameters for get_tasks. */
               const char *refresh_interval, const char *sort_field,
               const char *sort_order, int apply_overrides,
               const char *max_checks, const char *max_hosts)
{
  gchar *modify_task;

  if (comment == NULL || name == NULL)
    return edit_task (credentials, task_id,
                      GSAD_MESSAGE_INVALID_PARAM ("Save Task"), next,
                      refresh_interval, sort_field, sort_order,
                      apply_overrides);

  if (escalator_id == NULL || schedule_id == NULL || slave_id == NULL
      || next == NULL || sort_field == NULL || sort_order == NULL
      || task_id == NULL || max_checks == NULL || max_hosts == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a task. "
                         "The task remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  modify_task = g_strdup_printf ("<modify_task task_id=\"%s\">"
                                 "<name>%s</name>"
                                 "<comment>%s</comment>"
                                 "<escalator id=\"%s\"/>"
                                 "<schedule id=\"%s\"/>"
                                 "<slave id=\"%s\"/>"
                                 "<preferences>"
                                 "<preference>"
                                 "<scanner_name>max_checks</scanner_name>"
                                 "<value>%s</value>"
                                 "</preference>"
                                 "<preference>"
                                 "<scanner_name>max_hosts</scanner_name>"
                                 "<value>%s</value>"
                                 "</preference>"
                                 "</preferences>"
                                 "</modify_task>",
                                 task_id,
                                 name,
                                 comment,
                                 escalator_id,
                                 schedule_id,
                                 slave_id,
                                 max_checks,
                                 max_hosts);

  if (strcmp (next, "get_tasks") == 0)
    {
      char *ret = get_tasks (credentials, NULL, sort_field, sort_order,
                             refresh_interval, modify_task, apply_overrides,
                             NULL);
      g_free (modify_task);
      return ret;
    }

  if (strcmp (next, "get_task") == 0)
    {
      char *ret = get_tasks (credentials, task_id, sort_field, sort_order,
                             refresh_interval, modify_task, apply_overrides,
                             NULL);
      g_free (modify_task);
      return ret;
    }

  g_free (modify_task);
  return gsad_message (credentials,
                       "Internal error", __FUNCTION__, __LINE__,
                       "An internal error occurred while saving a task. "
                       "The task remains the same. "
                       "Diagnostics: Error in parameter next.",
                       "/omp?cmd=get_tasks");
}

/**
 * @brief Save container task, get next page, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  task_id           ID of task.
 * @param[in]  name              New name for task.
 * @param[in]  comment           New comment for task.
 * @param[in]  next              Name of next page.
 * @param[in]  refresh_interval  Refresh interval (parsed to int).
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 * @param[in]  apply_overrides   Whether to apply overrides.
 *
 * @return Result of XSL transformation.
 */
char *
save_container_task_omp (credentials_t * credentials, const char *task_id,
                         const char *name, const char *comment,
                         const char *next,
                         /* Parameters for get_tasks. */
                         const char *refresh_interval, const char *sort_field,
                         const char *sort_order, int apply_overrides)
{
  gchar *modify_task;

  if (comment == NULL || name == NULL)
    return edit_task (credentials, task_id,
                      GSAD_MESSAGE_INVALID_PARAM ("Save Task"), next,
                      refresh_interval, sort_field, sort_order,
                      apply_overrides);

  if (next == NULL || sort_field == NULL || sort_order == NULL
      || task_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a task. "
                         "The task remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  modify_task = g_strdup_printf ("<modify_task task_id=\"%s\">"
                                 "<name>%s</name>"
                                 "<comment>%s</comment>"
                                 "</modify_task>",
                                 task_id,
                                 name,
                                 comment);

  if (strcmp (next, "get_tasks") == 0)
    {
      char *ret = get_tasks (credentials, NULL, sort_field, sort_order,
                             refresh_interval, modify_task, apply_overrides,
                             NULL);
      g_free (modify_task);
      return ret;
    }

  if (strcmp (next, "get_task") == 0)
    {
      char *ret = get_tasks (credentials, task_id, sort_field, sort_order,
                             refresh_interval, modify_task, apply_overrides,
                             NULL);
      g_free (modify_task);
      return ret;
    }

  g_free (modify_task);
  return gsad_message (credentials,
                       "Internal error", __FUNCTION__, __LINE__,
                       "An internal error occurred while saving a task. "
                       "The task remains the same. "
                       "Diagnostics: Error in parameter next.",
                       "/omp?cmd=get_tasks");
}

/**
 * @brief Stop a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  next              Name of next page.
 *
 * @return Result of XSL transformation.
 */
char *
stop_task_omp (credentials_t * credentials, const char *task_id,
               int apply_overrides, const char *next)
{
  char *ret;
  gchar *stop_task;

  stop_task = g_strdup_printf ("<stop_task task_id=\"%s\" />", task_id);

  if (strcmp (next, "get_task") == 0)
    {
      char *ret = get_tasks (credentials, task_id, "name", "ascending",
                             NULL, stop_task, apply_overrides, NULL);
      g_free (stop_task);
      return ret;
    }

  ret = get_tasks (credentials, NULL, "name", "ascending", NULL, stop_task,
                   apply_overrides, NULL);
  g_free (stop_task);
  return ret;
}

/**
 * @brief Pause a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  next              Name of next page.
 *
 * @return Result of XSL transformation.
 */
char *
pause_task_omp (credentials_t * credentials, const char *task_id,
                int apply_overrides, const char *next)
{
  char *ret;
  gchar *pause_task;

  if ((task_id == NULL) || (next == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while pausing a task. "
                         "The task was not paused. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_task");

  pause_task = g_strdup_printf ("<pause_task task_id=\"%s\" />", task_id);

  if (strcmp (next, "get_task") == 0)
    {
      char *ret = get_tasks (credentials, task_id, "name", "ascending",
                             NULL, pause_task, apply_overrides, NULL);
      g_free (pause_task);
      return ret;
    }

  ret = get_tasks (credentials, NULL, "name", "ascending", NULL, pause_task,
                   apply_overrides, NULL);
  g_free (pause_task);
  return ret;
}

/**
 * @brief Resume a paused task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  next              Name of next page.
 *
 * @return Result of XSL transformation.
 */
char *
resume_paused_task_omp (credentials_t * credentials, const char *task_id,
                        int apply_overrides, const char *next)
{
  char *ret;
  gchar *resume_paused_task;

  if ((task_id == NULL) || (next == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while resuming a task. "
                         "The task was not resumed. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_task");

  resume_paused_task = g_strdup_printf ("<resume_paused_task task_id=\"%s\" />",
                                        task_id);

  if (strcmp (next, "get_task") == 0)
    {
      char *ret = get_tasks (credentials, task_id, "name", "ascending",
                             NULL, resume_paused_task, apply_overrides, NULL);
      g_free (resume_paused_task);
      return ret;
    }

  ret = get_tasks (credentials, NULL, "name", "ascending", NULL, resume_paused_task,
                   apply_overrides, NULL);
  g_free (resume_paused_task);
  return ret;
}

/**
 * @brief Resume a stopped task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  next              Name of next page.
 *
 * @return Result of XSL transformation.
 */
char *
resume_stopped_task_omp (credentials_t * credentials, const char *task_id,
                         int apply_overrides, const char *next)
{
  char *ret;
  gchar *resume_stopped;

  if ((task_id == NULL) || (next == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while resuming a task. "
                         "The task was not resumed. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_task");

  resume_stopped = g_strdup_printf ("<resume_stopped_task task_id=\"%s\" />",
                                    task_id);

  if (strcmp (next, "get_task") == 0)
    {
      char *ret = get_tasks (credentials, task_id, "name", "ascending",
                             NULL, resume_stopped, apply_overrides, NULL);
      g_free (resume_stopped);
      return ret;
    }

  ret = get_tasks (credentials, NULL, "name", "ascending", NULL, resume_stopped,
                   apply_overrides, NULL);
  g_free (resume_stopped);
  return ret;
}

/**
 * @brief Start a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  next         Name of following page.
 *
 * @return Result of XSL transformation.
 */
char *
start_task_omp (credentials_t * credentials, const char *task_id,
                int apply_overrides, const char *next)
{
  char *ret;
  gchar *start_task;

  start_task = g_strdup_printf ("<start_task task_id=\"%s\" />", task_id);

  if (strcmp (next, "get_task") == 0)
    {
      char *ret = get_tasks (credentials, task_id, "name", "ascending",
                             NULL, start_task, apply_overrides, NULL);
      g_free (start_task);
      return ret;
    }

  ret = get_tasks (credentials, NULL, "name", "ascending", NULL, start_task,
                   apply_overrides, NULL);
  g_free (start_task);
  return ret;
}

/**
 * @brief Requests NVT details, accepting extra commands.
 *
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  oid          OID of NVT.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return XSL transformed NVT details response or error message.
 */
static char*
get_nvts (credentials_t *credentials, const char *oid,
          const char *commands)
{
  GString *xml = NULL;
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
                             "An internal error occurred while getting nvt details. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_nvts"
                            " nvt_oid=\"%s\""
                            " details=\"1\"/>"
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
  g_string_append (xml, "</get_nvts>");

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Requests NVT details, accepting extra commands.
 *
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  oid          OID of NVT.
 *
 * @return XSL transformed NVT details response or error message.
 */
char*
get_nvts_omp (credentials_t *credentials, const char *oid)
{
  return get_nvts (credentials, oid, NULL);
}

/**
 * @brief Get all tasks, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  task_id           ID of task.
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 * @param[in]  refresh_interval  Refresh interval (parsed to int).
 * @param[in]  commands          Extra commands to run before the others.
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  report_id         ID of delta candidate, or NULL.
 *
 * @return Result of XSL transformation.
 */
static char *
get_tasks (credentials_t * credentials, const char *task_id,
           const char *sort_field, const char *sort_order,
           const char *refresh_interval, const char *commands,
           int apply_overrides, const char *report_id)
{
  GString *xml = NULL;
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
                             "An internal error occurred while getting the status. "
                             "No update on status can be retrieved. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (task_id)
    {
      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_tasks"
                                " task_id=\"%s\""
                                " apply_overrides=\"%i\""
                                " details=\"1\" />"
                                "<get_report_formats"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "<get_notes"
                                " sort_field=\"notes.nvt, notes.text\""
                                " task_id=\"%s\"/>"
                                "<get_overrides"
                                " sort_field=\"overrides.nvt, overrides.text\""
                                " task_id=\"%s\"/>"
                                "</commands>",
                                commands ? commands : "",
                                task_id,
                                apply_overrides,
                                task_id,
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
    }
  else
    {
      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_tasks"
                                " apply_overrides=\"%i\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\"/>"
                                "</commands>",
                                commands ? commands : "",
                                apply_overrides,
                                sort_field ? sort_field : "name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the status. "
                               "No update of the list of tasks can be retrieved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  xml = g_string_new ("<get_tasks>");
  g_string_append_printf (xml,
                          "<apply_overrides>%i</apply_overrides>"
                          "<delta>%s</delta>",
                          apply_overrides,
                          report_id ? report_id : "");
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

  g_string_append (xml, "</get_tasks>");
  if ((refresh_interval == NULL) || (strcmp (refresh_interval, "") == 0))
    g_string_append_printf (xml, "<autorefresh interval=\"0\" />");
  else
    g_string_append_printf (xml, "<autorefresh interval=\"%s\" />",
                            refresh_interval);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  refresh_interval  Refresh interval (parsed to int).
 * @param[in]  apply_overrides   Whether to apply overrides.
 * @param[in]  report_id    ID of delta candidate.
 *
 * @return Result of XSL transformation.
 */
char *
get_tasks_omp (credentials_t * credentials, const char *task_id,
               const char *sort_field, const char *sort_order,
               const char *refresh_interval, int apply_overrides,
               const char *report_id)
{
  return get_tasks (credentials, task_id, sort_field, sort_order,
                    refresh_interval, NULL, apply_overrides, report_id);
}

/**
 * @brief Create an LSC credential, get all credentials, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         Credential name.
 * @param[in]  comment      Comment on credential.
 * @param[in]  type         Either "gen" or "pass".
 * @param[in]  login        Credential user name.
 * @param[in]  password     Password, for type "pass".
 * @param[in]  passphrase   Passphrase, for type "key".
 * @param[in]  public_key   Public key, for type "key".
 * @param[in]  private_key  Private key, for type "key".
 *
 * @return Result of XSL transformation.
 */
char *
create_lsc_credential_omp (credentials_t * credentials,
                           char *name,
                           char *comment,
                           const char *type,
                           const char *login,
                           const char *password,
                           const char *passphrase,
                           const char *public_key,
                           const char *private_key)
{
  gnutls_session_t session;
  int socket;
  GString *xml;
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
                             "An internal error occurred while creating a new credential. "
                             "No new credential was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
    }

  xml = g_string_new ("<commands_response>");

  if (name == NULL || comment == NULL || login == NULL || type == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Credential"));
  else if (type && (strcmp (type, "pass") == 0) && password == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Credential"));
  else if (type
           && (strcmp (type, "key") == 0)
           && ((passphrase == NULL)
               || (public_key == NULL)
               || (private_key == NULL)))
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Credential"));
  else
    {
      int ret;

      /* Create the LSC credential. */

      if (type && strcmp (type, "gen") == 0)
        ret = openvas_server_sendf_xml (&session,
                                        "<create_lsc_credential>"
                                        "<name>%s</name>"
                                        "<comment>%s</comment>"
                                        "<login>%s</login>"
                                        "</create_lsc_credential>",
                                        name,
                                        comment ? comment : "",
                                        login);
      else if (type && strcmp (type, "key") == 0)
        ret = openvas_server_sendf_xml (&session,
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
        ret = openvas_server_sendf_xml (&session,
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

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new credential. "
                               "No new credential was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_lsc_credentials");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new credential. "
                               "It is unclear whether the credential has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_lsc_credentials");
        }
    }

  /* Get all LSC credentials. */

  if (openvas_server_send (&session,
                           "<get_lsc_credentials"
                           " sort_field=\"name\" sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while listing credentials. "
                           "The credential has, however, been created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while listing credentials. "
                           "The credential has, however, been created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *lsc_credential_id;

  lsc_credential_id = params_value (params, "lsc_credential_id");

  if (lsc_credential_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a credential. "
                         "The credential was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_lsc_credentials");

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
                             "An internal error occurred while deleting an credential. "
                             "The credential was not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_lsc_credential lsc_credential_id=\"%s\"/>"
                            "<get_lsc_credentials"
                            " sort_field=\"name\" sort_order=\"ascending\"/>"
                            "</commands>",
                            lsc_credential_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an credential. "
                           "The credential was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an credential. "
                           "It is unclear whether the credential has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
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
                    const char *commands)
{
  GString *xml = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *sort_field, *sort_order;

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
                             "An internal error occurred while getting a credential. "
                             "The credential is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
    }

  /* Get the LSC credential. */

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_lsc_credentials"
                            " lsc_credential_id=\"%s\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>"
                            "</commands>",
                            commands ? commands : "",
                            params_value (params, "lsc_credential_id"),
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a credential. "
                           "The credential is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  xml = g_string_new ("<get_lsc_credential>");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a credential. "
                           "The credential is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_lsc_credential>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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

/** @todo Do package download somewhere else. */
/**
 * @brief Get one or all LSC credentials, XSL transform the result.
 *
 * @param[in]   credentials        Username and password for authentication.
 * @param[in]   lsc_credential_id  UUID of LSC credential.
 * @param[in]   format             Format of result
 * @param[out]  result_len         Length of result.
 * @param[in]   sort_field         Field to sort on, or NULL.
 * @param[in]   sort_order         "ascending", "descending", or NULL.
 * @param[out]  html               Result of XSL transformation.  Required.
 * @param[out]  login              Login name return.  NULL to skip.  Only set
 *                                 on success with lsc_credential_id.
 * @param[in]   commands           Extra commands to run before the others when
 *                                 lsc_credential_id is NULL.
 *
 * @return 0 success, 1 failure.
 */
static int
get_lsc_credentials (credentials_t * credentials,
                     const char * lsc_credential_id,
                     const char * format,
                     gsize *result_len,
                     const char * sort_field,
                     const char * sort_order,
                     char ** html,
                     char ** login,
                     const char *commands)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;
  gchar *connect_html;

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
                              "An internal error occurred while getting the credential list. "
                              "The current list of credentials is not available. "
                              "Diagnostics: Failure to connect to manager daemon.",
                              "/omp?cmd=get_targets");
        return 1;
    }

  /* Send the request. */

  if (lsc_credential_id && format)
    {
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
                                "An internal error occurred while getting credential list. "
                                "The current list of credentials is not available. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                "/omp?cmd=get_targets");
          return 1;
        }
    }
  else
    {
      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_lsc_credentials"
                                " sort_field=\"%s\" sort_order=\"%s\"/>"
                                "</commands>",
                                commands ? commands : "",
                                sort_field ? sort_field : "name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting credential list. "
                                "The current list of credentials is not available. "
                                "Diagnostics: Failure to send command to manager daemon.",
                                "/omp?cmd=get_targets");
          return 1;
        }
    }

  /* Read and handle the response. */

  if (lsc_credential_id && format)
    {
      if (strcmp (format, "rpm") == 0
          || strcmp (format, "deb") == 0
          || strcmp (format, "exe") == 0)
        {
          char *package_encoded = NULL;
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
                                    "/omp?cmd=get_targets");
              return 1;
            }

          credential_entity = entity_child (entity, "lsc_credential");
          if (credential_entity)
            package_entity = entity_child (credential_entity, "package");
          if (package_entity != NULL)
            {
              gsize len;
              package_encoded = entity_text (package_entity);
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
                                    "/omp?cmd=get_tasks");
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
                                    "/omp?cmd=get_tasks");
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
                                "/omp?cmd=get_tasks");
          free_entity (entity);
          return 1;
        }
    }
  else
    {
      char *text = NULL;

      /* The list of credentials. */

      entity = NULL;
      if (read_entity_and_text (&session, &entity, &text))
        {
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting credential list. "
                                "The current list of credentials is not available. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                "/omp?cmd=get_targets");
          return 1;
        }
      free_entity (entity);

      openvas_server_close (socket, session);
      *html = xsl_transform_omp (credentials, text);
      return 0;
    }
}

/**
 * @brief Get one or all LSC credentials, XSL transform the result.
 *
 * @param[in]   credentials        Username and password for authentication.
 * @param[in]   lsc_credential_id  UUID of LSC credential.
 * @param[in]   format             Format of result
 * @param[out]  result_len         Length of result.
 * @param[in]   sort_field         Field to sort on, or NULL.
 * @param[in]   sort_order         "ascending", "descending", or NULL.
 * @param[out]  html               Result of XSL transformation.  Required.
 * @param[out]  login              Login name return.  NULL to skip.  Only set
 *                                 on success with lsc_credential_id.
 *
 * @return 0 success, 1 failure.
 */
int
get_lsc_credentials_omp (credentials_t * credentials,
                         const char * lsc_credential_id,
                         const char * format,
                         gsize *result_len,
                         const char * sort_field,
                         const char * sort_order,
                         char ** html,
                         char ** login)
{
  return get_lsc_credentials (credentials, lsc_credential_id, format,
                              result_len, sort_field, sort_order, html,
                              login, NULL);
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
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *sort_order, *sort_field;

  if (params_value (params, "lsc_credential_id") == NULL
      || params_value (params, "next") == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a credential. "
                         "The credential remains as it was. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_lsc_credentials");

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
                             "An internal error occurred while editing a credential. "
                             "The credential remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_lsc_credentials"
                            " lsc_credential_id=\"%s\""
                            " params=\"1\""
                            " details=\"1\" />"
                            "</commands>",
                            params_value (params, "lsc_credential_id"))
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting credential info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  xml = g_string_new ("");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  g_string_append_printf (xml,
                          "<edit_lsc_credential>"
                          "<lsc_credential id=\"%s\"/>"
                          /* Page that follows. */
                          "<next>%s</next>"
                          /* Passthroughs. */
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>",
                          params_value (params, "lsc_credential_id"),
                          params_value (params, "next"),
                          sort_field ? sort_field : "",
                          sort_order ? sort_order : "");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting credential info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_lsc_credential>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
  gchar *modify;
  int socket, change_login, change_password;
  gnutls_session_t session;
  gchar *html;

  change_login = (params_value (params, "enable") ? 1 : 0);
  change_password = (params_value (params, "login") ? 1 : 0);

  if (params_value (params, "comment") == NULL
      || params_value (params, "name") == NULL
      || (change_password && params_value (params, "password") == NULL)
      || (change_login && params_value (params, "login" == NULL)))
    return edit_lsc_credential (credentials,
                                params,
                                GSAD_MESSAGE_INVALID_PARAM
                                 ("Save Credential"));

  if (params_value (params, "next") == NULL
      || params_value (params, "lsc_credential_id") == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a credential. "
                         "The credential remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_lsc_credentials");

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
                             "An internal error occurred while saving a credential. "
                             "The credential remains the same. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_lsc_credentials");
    }

  if (change_login && change_password)
    modify = g_markup_printf_escaped ("<modify_lsc_credential"
                                      " lsc_credential_id=\"%s\">"
                                      "<name>%s</name>"
                                      "<comment>%s</comment>"
                                      "<login>%s</login>"
                                      "<password>%s</password>"
                                      "</modify_lsc_credential>",
                                      params_value (params, "lsc_credential_id"),
                                      params_value (params, "name"),
                                      params_value (params, "comment"),
                                      params_value (params, "login"),
                                      params_value (params, "password"));
  else if (change_login)
    modify = g_strdup_printf ("<modify_lsc_credential"
                              " lsc_credential_id=\"%s\">"
                              "<name>%s</name>"
                              "<comment>%s</comment>"
                              "<login>%s</login>"
                              "</modify_lsc_credential>",
                              params_value (params, "lsc_credential_id"),
                              params_value (params, "name"),
                              params_value (params, "comment"),
                              params_value (params, "login"));
  else if (change_password)
    modify = g_strdup_printf ("<modify_lsc_credential"
                              " lsc_credential_id=\"%s\">"
                              "<name>%s</name>"
                              "<comment>%s</comment>"
                              "<password>%s</password>"
                              "</modify_lsc_credential>",
                              params_value (params, "lsc_credential_id"),
                              params_value (params, "name"),
                              params_value (params, "comment"),
                              params_value (params, "password"));
  else
    modify = g_strdup_printf ("<modify_lsc_credential"
                              " lsc_credential_id=\"%s\">"
                              "<name>%s</name>"
                              "<comment>%s</comment>"
                              "</modify_lsc_credential>",
                              params_value (params, "lsc_credential_id"),
                              params_value (params, "name"),
                              params_value (params, "comment"));

  if (strcmp (params_value (params, "next"), "get_lsc_credentials") == 0)
    {
      char *ret;
      get_lsc_credentials (credentials, NULL, NULL, NULL,
                           params_value (params, "sort_field"),
                           params_value (params, "sort_order"),
                           &ret, NULL, modify);
      g_free (modify);
      return ret;
    }

  if (strcmp (params_value (params, "next"), "get_lsc_credential") == 0)
    {
      char *ret = get_lsc_credential (credentials, params, modify);
      g_free (modify);
      return ret;
    }

  g_free (modify);
  return gsad_message (credentials,
                       "Internal error", __FUNCTION__, __LINE__,
                       "An internal error occurred while saving a credential. "
                       "It is unclear whether the entire credential has been saved. "
                       "Diagnostics: Error in parameter next.",
                       "/omp?cmd=get_lsc_credentials");
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
  gnutls_session_t session;
  int socket;
  GString *xml;
  gchar *html;
  const char *name, *comment, *installer, *installer_filename, *installer_sig;
  const char *howto_install, *howto_use;
  int installer_size, installer_sig_size, howto_install_size, howto_use_size;

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
                             "An internal error occurred while creating a new agent. "
                             "No new agent was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_agents");
    }

  xml = g_string_new ("<commands_response>");

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
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Agent"));
  else
    {
      int ret;
      gchar *installer_64, *installer_sig_64, *howto_install_64, *howto_use_64;

      /* Create the agent. */

      installer_64 = installer_size
                     ? g_base64_encode ((guchar *) installer,
                                        installer_size)
                     : g_strdup ("");

      installer_sig_64 = installer_sig_size
                         ? g_base64_encode ((guchar *) installer_sig,
                                            installer_sig_size)
                         : g_strdup ("");

      howto_install_64 = howto_install_size
                         ? g_base64_encode ((guchar *) howto_install,
                                            howto_install_size)
                         : g_strdup ("");

      howto_use_64 = howto_use_size
                     ? g_base64_encode ((guchar *) howto_use,
                                        howto_use_size)
                     : g_strdup ("");

      ret = openvas_server_sendf (&session,
                                  "<create_agent>"
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

      g_free (installer_64);
      g_free (howto_install_64);
      g_free (howto_use_64);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new agent. "
                               "No new agent was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_agents");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new agent. "
                               "It is unclear whether the agent has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_agents");
        }
    }

  /* Get all agents. */

  if (openvas_server_send (&session,
                           "<get_agents"
                           " sort_field=\"name\" sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while listing agents. "
                           "The agent has, however, been created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_agents");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while listing agents. "
                           "The agent has, however, been created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_agents");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *agent_id;

  agent_id = params_value (params, "agent_id");

  if (agent_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting an agent. "
                         "The agent was not deleted. "
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
                             "An internal error occurred while deleting an agent. "
                             "The agent was not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_agents");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_agent agent_id=\"%s\"/>"
                            "<get_agents"
                            " sort_field=\"name\" sort_order=\"ascending\"/>"
                            "</commands>",
                            agent_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an agent. "
                           "The agent was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_agents");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an agent. "
                           "It is unclear whether the agent has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_agents");
    }

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/** @todo Split into get_agents_omp and get_agent_omp. */
/**
 * @brief Get one or all agents, XSL transform the result.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[in]   agent_id     UUID of agent.
 * @param[in]   format       Format of result
 * @param[out]  result_len   Length of result.
 * @param[in]   sort_field   Field to sort on, or NULL.
 * @param[in]   sort_order   "ascending", "descending", or NULL.
 * @param[out]  html         Result of XSL transformation.  Required.
 * @param[out]  filename     Agent filename return.  NULL to skip.  Only set
 *                           on success with agent_id.
 *
 * @return 0 success, 1 failure.
 */
int
get_agents_omp (credentials_t * credentials,
                const char * agent_id,
                const char * format,
                gsize *result_len,
                const char * sort_field,
                const char * sort_order,
                char ** html,
                char ** filename)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;
  gchar *connect_html;

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

  if (agent_id && format)
    {
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
    }
  else
    {
      if (openvas_server_sendf (&session,
                                "<commands>"
                                "<get_agents"
                                " sort_field=\"%s\" sort_order=\"%s\"/>"
                                "</commands>",
                                sort_field ? sort_field : "name",
                                sort_order ? sort_order : "ascending")
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
    }

  /* Read and handle the response. */

  if (agent_id && format)
    {
      if (strcmp (format, "installer") == 0
          || strcmp (format, "howto_install") == 0
          || strcmp (format, "howto_use") == 0)
        {
          char *package_encoded = NULL;
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
              package_encoded = entity_text (package_entity);
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
  else
    {
      char *text = NULL;

      /* The list of agents. */

      entity = NULL;
      if (read_entity_and_text (&session, &entity, &text))
        {
          openvas_server_close (socket, session);
          *html = gsad_message (credentials,
                                "Internal error", __FUNCTION__, __LINE__,
                                "An internal error occurred while getting agent list. "
                                "The current list of agents is not available. "
                                "Diagnostics: Failure to receive response from manager daemon.",
                                "/omp?cmd=get_tasks");
          return 1;
        }
      free_entity (entity);

      openvas_server_close (socket, session);
      *html = xsl_transform_omp (credentials, text);
      return 0;
    }
}

/**
 * @brief Verify agent, get agents, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  agent_id     ID of agent.
 *
 * @return Result of XSL transformation.
 */
char *
verify_agent_omp (credentials_t * credentials, const char *agent_id)
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
                             "An internal error occurred while verifying an agent. "
                             "The agent is not verified. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_agents");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<verify_agent agent_id=\"%s\" />"
                            "<get_agents"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
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

  xml = g_string_new ("<get_agents>");

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

  g_string_append (xml, "</get_agents>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Send data for an escalator.
 *
 * @param[in]   session  GNUTLS session.
 * @param[out]  data     Data.
 *
 * @return 0 on success, -1 on error.
 */
static int
send_escalator_data (gnutls_session_t *session, GArray *data)
{
  int index = 0;
  gchar *element;

  if (data)
    while ((element = g_array_index (data, gchar*, index++)))
      if (openvas_server_sendf_xml (session,
                                    "<data><name>%s</name>%s</data>",
                                    element,
                                    element + strlen (element) + 1))
        return -1;

  return 0;
}

/**
 * @brief Send method data for an escalator.
 *
 * @param[in]   session  GNUTLS session.
 * @param[out]  data     Data.
 * @param[out]  method   Method.
 *
 * @return 0 on success, -1 on error.
 */
static int
send_escalator_method_data (gnutls_session_t *session, GArray *data,
                            const char *method)
{
  int index = 0;
  method_data_param_t *element;

  if (data)
    {
      if (strcmp (method, "Sourcefire Connector"))
        {
          while ((element = g_array_index (data,
                                           method_data_param_t*,
                                           index++)))
            if (openvas_server_sendf_xml (session,
                                          "<data><name>%s</name>%s</data>",
                                          element->key,
                                          (gchar*) element->value))
              return -1;
          return 0;
        }

      while ((element = g_array_index (data, method_data_param_t*, index++)))
        if (strcmp (element->key, "pkcs12"))
          {
            if (openvas_server_sendf_xml (session,
                                          "<data><name>%s</name>%s</data>",
                                          element->key,
                                          (gchar*) element->value))
              return -1;
          }
        else
          {
            gchar *base64;

            /* Special case the pkcs12 file, which is binary. */

            base64 = element->value_size
                      ? g_base64_encode ((guchar *) element->value,
                                         element->value_size)
                      : g_strdup ("");
            if (openvas_server_sendf_xml (session,
                                          "<data><name>%s</name>%s</data>",
                                          element->key,
                                          base64))
              {
                g_free (base64);
                return -1;
              }
            g_free (base64);
          }
    }

  return 0;
}

/**
 * @brief Create an escalator, get all escalators, XSL transform the result.
 *
 * @param[in]   credentials     Username and password for authentication.
 * @param[in]   name            Name of new escalator.
 * @param[out]  comment         Comment on escalator.
 * @param[out]  condition       Condition.
 * @param[out]  condition_data  Condition data.
 * @param[out]  event           Event.
 * @param[out]  event_data      Event data.
 * @param[out]  method          Method.
 * @param[out]  method_data     Method data.
 *
 * @return Result of XSL transformation.
 */
char *
create_escalator_omp (credentials_t * credentials, char *name, char *comment,
                      const char *condition, GArray *condition_data,
                      const char *event, GArray *event_data,
                      const char *method, GArray *method_data)
{
  gnutls_session_t session;
  GString *xml;
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
                             "An internal error occurred while creating a new target. "
                             "No new target was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  xml = g_string_new ("<get_escalators>");

  if (name == NULL || comment == NULL || condition == NULL || event == NULL
      || method == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Escalator"));
  else
    {
      /* Create the escalator. */

      /* Special case the syslog submethods, because HTTP only allows one
       * value to vary per radio. */
      if (strncmp (method, "syslog ", strlen ("syslog ")) == 0)
        {
          method_data_param_t *method_data_param;

          method_data_param = g_malloc (sizeof (method_data_param));
          method_data_param->key = g_strdup ("submethod");
          method_data_param->value_size = strlen (method + strlen ("syslog "))
                                          + 1;
          method_data_param->value = g_malloc (method_data_param->value_size);
          memcpy (method_data_param->value,
                  method + strlen ("syslog "),
                  method_data_param->value_size);

          if (method_data == NULL)
            method_data = g_array_new (TRUE, FALSE, sizeof (gchar*));

          g_array_append_val (method_data, method_data_param);

          method = "syslog";
        }

      if (openvas_server_sendf (&session,
                                "<create_escalator>"
                                "<name>%s</name>"
                                "%s%s%s",
                                name,
                                comment ? "<comment>" : "",
                                comment ? comment : "",
                                comment ? "</comment>" : "")
          || openvas_server_sendf (&session, "<event>%s", event)
          || send_escalator_data (&session, event_data)
          || openvas_server_send (&session, "</event>")
          || openvas_server_sendf (&session, "<method>%s", method)
          || send_escalator_method_data (&session, method_data, method)
          || openvas_server_send (&session, "</method>")
          || openvas_server_sendf (&session, "<condition>%s", condition)
          || send_escalator_data (&session, condition_data)
          || openvas_server_send (&session,
                                  "</condition>"
                                  "</create_escalator>"))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new escalator. "
                               "No new escalator was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_escalators");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new escalator. "
                               "It is unclear whether the escalator has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_escalators");
        }
    }

  /* Get all the escalators. */

  if (openvas_server_send (&session,
                           "<get_escalators"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalator. "
                           "A new escalator was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalator. "
                           "A new escalator was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  /* Get report formats. */

  if (openvas_server_sendf (&session,
                            "<get_report_formats"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalator. "
                           "A new escalator was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalator. "
                           "A new escalator was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_escalators>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete an escalator, get all escalators, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_escalator_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *escalator_id;

  escalator_id = params_value (params, "escalator_id");

  if (escalator_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting an escalator. "
                         "The escalator was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_escalators");

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
                             "An internal error occurred while deleting a escalator. "
                             "The escalator is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_escalators");
    }

  xml = g_string_new ("<get_escalators>");

  /* Delete escalator and get all escalators. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_escalator escalator_id=\"%s\"/>"
                            "<get_escalators"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "<get_report_formats"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            escalator_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an escalator. "
                           "The escalator was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an escalator. "
                           "It is unclear whether the escalator has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_escalators>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get one escalator, XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  escalator_id  Name of escalator.
 * @param[in]  sort_field    Field to sort on, or NULL.
 * @param[in]  sort_order    "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_escalator_omp (credentials_t * credentials, const char * escalator_id,
                   const char * sort_field, const char * sort_order)
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
                             "An internal error occurred while getting an escalator. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_escalators");
    }

  xml = g_string_new ("<get_escalator>");

  /* Get the escalator. */

  if (openvas_server_sendf (&session,
                            "<get_escalators"
                            " escalator_id=\"%s\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            escalator_id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an escalator. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an escalator. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  /* Get the report formats. */

  if (openvas_server_sendf (&session,
                            "<get_report_formats/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an escalator. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an escalator. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_escalator>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all escalators, reading the result into a string.
 *
 * @param[in]   credentials  User authentication information.
 * @param[in]   session      GNUTLS session.
 * @param[out]  xml          String.
 * @param[in]   sort_field   Field to sort on, or NULL.
 * @param[in]   sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation on error, NULL on success.
 */
char *
get_escalators_xml (credentials_t *credentials, gnutls_session_t *session,
                    GString *xml, const char *sort_field,
                    const char *sort_order)
{
  if (openvas_server_sendf (session,
                            "<get_escalators"
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting escalators list. "
                         "The current list of escalators is not available. "
                         "Diagnostics: Failure to send command to manager daemon.",
                         "/omp?cmd=get_tasks");

  if (read_string (session, &xml))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting escalators list. "
                         "The current list of escalators is not available. "
                         "Diagnostics: Failure to receive response from manager daemon.",
                         "/omp?cmd=get_tasks");

  return NULL;
}

/**
 * @brief Get all escalators, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_escalators_omp (credentials_t * credentials, const char * sort_field,
                    const char * sort_order)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  char *ret;
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
                             "An internal error occurred while getting escalator list. "
                             "The current list of escalators is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_escalators>");

  ret = get_escalators_xml (credentials, &session, xml, sort_field, sort_order);
  if (ret)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return ret;
    }

  if (openvas_server_sendf (&session,
                            "<get_report_formats"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the escalator list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the escalator list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  g_string_append (xml, "</get_escalators>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Test an escalator, get all escalators XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  escalator_id  UUID of escalator.
 * @param[in]  sort_field    Field to sort on, or NULL.
 * @param[in]  sort_order    "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
test_escalator_omp (credentials_t * credentials, const char * escalator_id,
                    const char * sort_field, const char * sort_order)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  char *ret;
  gchar *html;

  if (escalator_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while testing an escalator. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_escalators");

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
                             "An internal error occurred while testing an escalator. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_escalators");
    }

  xml = g_string_new ("<get_escalators>");

  /* Test the escalator. */

  if (openvas_server_sendf (&session,
                            "<test_escalator escalator_id=\"%s\"/>",
                            escalator_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an escalator. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an escalator. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }

  /* Get all escalators. */

  ret = get_escalators_xml (credentials, &session, xml, sort_field, sort_order);
  if (ret)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return ret;
    }

  /* Get report formats. */

  if (openvas_server_sendf (&session,
                            "<get_report_formats"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalator. "
                           "A new escalator was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalator. "
                           "A new escalator was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_escalators>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create a target, get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         Name of new target.
 * @param[in]  hosts        Hosts associated with target.
 * @param[in]  comment      Comment on target.
 * @param[in]  port_range   Range of ports to be scanned.
 * @param[in]  target_credential      UUID of SSH credential for target.
 * @param[in]  port                   Port to use for SSH LSC login.
 * @param[in]  target_smb_credential  UUID of SMB credential for target.
 * @param[in]  target_locator Target locator to pull targets from.
 * @param[in]  username     Username for source.
 * @param[in]  password     Password for username at source.
 *
 * @return Result of XSL transformation.
 */
char *
create_target_omp (credentials_t * credentials, char *name, char *hosts,
                   char *comment, const char *port_range,
                   const char *target_credential, const char *port,
                   const char *target_smb_credential,
                   const char* target_locator, const char* username,
                   const char* password)
{
  gnutls_session_t session;
  GString *xml;
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
                             "An internal error occurred while creating a new target. "
                             "No new target was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  xml = g_string_new ("<get_targets>");

  if (name == NULL || (hosts == NULL && target_locator == NULL)
      || comment == NULL || port_range == NULL || target_credential == NULL
      || port == NULL || target_smb_credential == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Target"));
  else
    {
      int ret;
      gchar *credentials_element, *smb_credentials_element;
      gchar* source_element = NULL;
      gchar* comment_element = NULL;

      if (comment != NULL)
        comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
      else
        comment_element = g_strdup ("");

      if (target_locator != NULL && strcmp (target_locator, "--") != 0)
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

      ret = openvas_server_sendf (&session,
                                  "<create_target>"
                                  "<name>%s</name>"
                                  "<hosts>%s</hosts>"
                                  "<port_range>%s</port_range>"
                                  "%s%s%s%s"
                                  "</create_target>",
                                  name,
                                  (strcmp (source_element, "") == 0)
                                    ? hosts
                                    : "",
                                  port_range,
                                  comment_element,
                                  source_element,
                                  credentials_element,
                                  smb_credentials_element);

      g_free (comment_element);
      g_free (credentials_element);
      g_free (smb_credentials_element);
      g_free (source_element);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new target. "
                               "No new target was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_targets");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new target. "
                               "It is unclear whether the target has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_targets");
        }
    }

  /* Get all the targets. */

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
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }

  /* Get the target locators. */

  if (openvas_server_sendf (&session,
                            "<get_target_locators/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }

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
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_targets>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

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
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *target_id;

  target_id = params_value (params, "target_id");

  if (target_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a target. "
                         "The target was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_targets");

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
                             "An internal error occurred while deleting a target. "
                             "The target is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  xml = g_string_new ("<get_targets>");

  /* Delete the target and get all targets. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_target target_id=\"%s\"/>"
                            "<get_targets"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "<get_target_locators/>"
                            "<get_lsc_credentials"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            target_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a target. "
                           "The target is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a target. "
                           "It is unclear whether the target has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_targets");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_targets>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete a trash agent, get all agents, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  agent_id     UUID of agent.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_agent_omp (credentials_t * credentials, const char *agent_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (agent_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting an agent. "
                         "The agent was not deleted. "
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
                             "An internal error occurred while deleting an agent. "
                             "The agent is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the agent and get all agents. */

  if (openvas_server_sendf (&session,
                            "<delete_agent"
                            " agent_id=\"%s\""
                            " ultimate=\"1\"/>",
                            agent_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an agent. "
                           "The agent is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an agent. "
                           "It is unclear whether the agent has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash config, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_config_omp (credentials_t * credentials, const char *config_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (config_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a config. "
                         "The config was not deleted. "
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
                             "An internal error occurred while deleting a config. "
                             "The config is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the config. */

  if (openvas_server_sendf (&session,
                            "<delete_config"
                            " config_id=\"%s\""
                            " ultimate=\"1\"/>",
                            config_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a config. "
                           "The config is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a config. "
                           "It is unclear whether the config has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash escalator, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  escalator_id    UUID of escalator.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_escalator_omp (credentials_t * credentials, const char *escalator_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (escalator_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a escalator. "
                         "The escalator was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_escalators");

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
                             "An internal error occurred while deleting a escalator. "
                             "The escalator is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the escalator. */

  if (openvas_server_sendf (&session,
                            "<delete_escalator"
                            " escalator_id=\"%s\""
                            " ultimate=\"1\"/>",
                            escalator_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a escalator. "
                           "The escalator is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a escalator. "
                           "It is unclear whether the escalator has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash LSC credential, get all trash, XSL transform the result.
 *
 * @param[in]  credentials        Username and password for authentication.
 * @param[in]  lsc_credential_id  UUID of LSC credential.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_lsc_credential_omp (credentials_t * credentials,
                                 const char *lsc_credential_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (lsc_credential_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a credential. "
                         "The credential was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_lsc_credentials");

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
                             "An internal error occurred while deleting an LSC credential. "
                             "The LSC credential is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the lsc_credential. */

  if (openvas_server_sendf (&session,
                            "<delete_lsc_credential"
                            " lsc_credential_id=\"%s\""
                            " ultimate=\"1\"/>",
                            lsc_credential_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an LSC credential. "
                           "The LSC credential is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an LSC credential. "
                           "It is unclear whether the LSC credential has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash report format, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  report_format_id    UUID of report format.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_report_format_omp (credentials_t * credentials, const char *report_format_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (report_format_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a report format. "
                         "The report format was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_report_formats");

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
                             "An internal error occurred while deleting a report format. "
                             "The report format is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the report format. */

  if (openvas_server_sendf (&session,
                            "<delete_report_format"
                            " report_format_id=\"%s\""
                            " ultimate=\"1\"/>",
                            report_format_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a report format. "
                           "The report format is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a report format. "
                           "It is unclear whether the report format has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash schedule, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  schedule_id    UUID of schedule.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_schedule_omp (credentials_t * credentials, const char *schedule_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (schedule_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a schedule. "
                         "The schedule was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_schedules");

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
                             "An internal error occurred while deleting a schedule. "
                             "The schedule is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the schedule. */

  if (openvas_server_sendf (&session,
                            "<delete_schedule"
                            " schedule_id=\"%s\""
                            " ultimate=\"1\"/>",
                            schedule_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a schedule. "
                           "The schedule is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a schedule. "
                           "It is unclear whether the schedule has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash slave, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  slave_id    UUID of slave.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_slave_omp (credentials_t * credentials, const char *slave_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (slave_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a slave. "
                         "The slave was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_slaves");

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
                             "An internal error occurred while deleting a slave. "
                             "The slave is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the slave. */

  if (openvas_server_sendf (&session,
                            "<delete_slave"
                            " slave_id=\"%s\""
                            " ultimate=\"1\"/>",
                            slave_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a slave. "
                           "The slave is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a slave. "
                           "It is unclear whether the slave has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash target, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  target_id    UUID of target.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_target_omp (credentials_t * credentials, const char *target_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (target_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a target. "
                         "The target was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_targets");

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
                             "An internal error occurred while deleting a target. "
                             "The target is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the target. */

  if (openvas_server_sendf (&session,
                            "<delete_target"
                            " target_id=\"%s\""
                            " ultimate=\"1\"/>",
                            target_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a target. "
                           "The target is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a target. "
                           "It is unclear whether the target has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Delete a trash task, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      UUID of task.
 *
 * @return Result of XSL transformation.
 */
char *
delete_trash_task_omp (credentials_t * credentials, const char *task_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (task_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a task. "
                         "The task was not deleted. "
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
                             "An internal error occurred while deleting a task. "
                             "The task is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_trash");
    }

  xml = g_string_new ("");

  /* Delete the task. */

  if (openvas_server_sendf (&session,
                            "<delete_task"
                            " task_id=\"%s\""
                            " ultimate=\"1\"/>",
                            task_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a task. "
                           "The task is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_trash");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a task. "
                           "It is unclear whether the task has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_trash");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Restore a resource, get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  target_id    UUID of resource.
 *
 * @return Result of XSL transformation.
 */
char *
restore_omp (credentials_t * credentials, const char *target_id)
{
  GString *xml;
  gchar *ret;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (target_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while restoring a resource. "
                         "The resource was not restored. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_resources");

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
  ret = get_trash (credentials, NULL, NULL, xml->str);
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
  ret = get_trash (credentials, NULL, NULL, xml->str);
  g_string_free (xml, FALSE);
  return ret;
}

/**
 * @brief Get one target, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  target_id    UUID of target.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_target_omp (credentials_t * credentials, const char * target_id,
                const char * sort_field, const char * sort_order)
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
                             "An internal error occurred while getting targets list. "
                             "The current list of targets is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  xml = g_string_new ("<get_target>");

  /* Get the target. */

  if (openvas_server_sendf (&session,
                            "<get_targets"
                            " target_id=\"%s\""
                            " tasks=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            target_id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
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

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_target>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_targets_omp (credentials_t * credentials, const char * sort_field,
                 const char * sort_order)
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
                             "An internal error occurred while getting targets list. "
                             "The current list of targets is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_targets");
    }

  xml = g_string_new ("<get_targets>");

  /* Get the targets. */

  if (openvas_server_sendf (&session,
                            "<get_targets"
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
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

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_targets>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create config, get all configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         Name of new config.
 * @param[in]  comment      Comment on new config.
 * @param[in]  base         Name of config to use as base for new config.
 *
 * @return Result of XSL transformation.
 */
char *
create_config_omp (credentials_t * credentials, char *name, char *comment,
                   const char *base)
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
                             "An internal error occurred while creating a new config. "
                             "No new config was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
    }

  xml = g_string_new ("<commands_response>");

  if (name == NULL || comment == NULL || base == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Scan Config"));
  else
    {
      /* Create the config. */

      if (openvas_server_sendf (&session,
                                "<create_config>"
                                "<name>%s</name>"
                                "<copy>%s</copy>"
                                "%s%s%s"
                                "</create_config>",
                                name,
                                base ? base : "empty",
                                comment ? "<comment>" : "",
                                comment ? comment : "",
                                comment ? "</comment>" : "") == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new config. "
                               "No new config was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_configs");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new config. "
                               "It is unclear whether the config has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_configs");
        }
    }

  /* Get all the configs. */

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
                           "An internal error occurred while creating a new config. "
                           "The new config was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new config. "
                           "The new config was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
                             "An internal error occurred while importing a config. "
                             "No new config was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
    }

  xml = g_string_new ("<commands_response>");

  /* Create the config. */

  if (openvas_server_sendf (&session,
                            "<create_config>"
                            "%s"
                            "</create_config>",
                            params_value (params, "xml_file"))
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a config. "
                           "No new config was created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a config. "
                           "It is unclear whether the config has been created or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Get all the configs. */

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
                           "An internal error occurred while importing a config. "
                           "The new config was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a config. "
                           "The new config was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get one or all configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_configs_omp (credentials_t * credentials, const char * sort_field,
                 const char * sort_order)
{
  entity_t entity;
  char *text = NULL;
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
                             "An internal error occurred while getting list of configs. "
                             "The current list of configs is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_configs"
                            " sort_field=\"%s\" sort_order=\"%s\"/>"
                            "</commands>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Get a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_omp (credentials_t * credentials, const char * config_id, int edit)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  assert (config_id);

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

  /* Get the config families. */

  if (openvas_server_sendf (&session,
                            "<get_configs"
                            " config_id=\"%s\""
                            " families=\"1\""
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

          ret = check_modify_config (credentials, &session, __FUNCTION__,
                                     __LINE__);
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

  ret = check_modify_config (credentials, &session, __FUNCTION__, __LINE__);
  if (ret)
    {
      openvas_server_close (socket, session);
      return ret;
    }

  openvas_server_close (socket, session);

  /* Return the next page. */

  next = params_value (params, "next:");
  if (next == NULL || strcmp (next, "Save Config") == 0)
    return get_config_omp (credentials, params_value (params, "config_id"), 1);
  return get_config_family_omp (credentials, params_value (params, "config_id"),
                                params_value (params, "name"), next, NULL, NULL,
                                1);
}

/**
 * @brief Get details of a family for a configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
 * @param[in]  name         Name of config.
 * @param[in]  family       Name of family.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_family_omp (credentials_t * credentials,
                       const char * config_id,
                       const char * name,
                       const char * family,
                       const char * sort_field,
                       const char * sort_order,
                       int edit)
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
                             "An internal error occurred while getting list of configs. "
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

  if (openvas_server_sendf (&session,
                            "<get_nvts"
                            " config_id=\"%s\" details=\"1\" family=\"%s\""
                            " timeout=\"1\" preference_count=\"1\""
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
 * @brief Get details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
 * @param[in]  name         Name of config.
 * @param[in]  family       Name of family.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  nvts         NVT's.
 *
 * @return Result of XSL transformation.
 */
char *
save_config_family_omp (credentials_t * credentials,
                        const char * config_id,
                        const char * name,
                        const char * family,
                        const char * sort_field,
                        const char * sort_order,
                        GArray *nvts)
{
  gnutls_session_t session;
  gchar *nvt;
  int socket, index = 0;
  char *ret;
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
                             "An internal error occurred while saving a config. "
                             "The current list of configs is not available. "
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

  if (nvts)
    while ((nvt = g_array_index (nvts, gchar*, index++)))
      if (openvas_server_sendf (&session,
                                "<nvt oid=\"%s\"/>",
                                nvt)
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

  ret = check_modify_config (credentials, &session, __FUNCTION__, __LINE__);
  if (ret)
    {
      openvas_server_close (socket, session);
      return ret;
    }

  openvas_server_close (socket, session);

  /* Return the Edit family page. */

  return get_config_family_omp (credentials, config_id, name, family,
                                sort_field, sort_order, 1);
}

/**
 * @brief Get details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
 * @param[in]  name         Name of config.
 * @param[in]  family       Name of family.
 * @param[in]  nvt          OID of NVT.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_nvt_omp (credentials_t * credentials,
                    const char * config_id,
                    const char * name,
                    const char * family,
                    const char * nvt,
                    const char * sort_field,
                    const char * sort_order,
                    int edit)
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
                          family);


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
 * @brief Save NVT prefs for a config, get NVT details, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
 * @param[in]  name         Name of config.
 * @param[in]  family       Name of family.
 * @param[in]  nvt          OID of NVT.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  preferences  Preferences.
 * @param[in]  files        Files within preferences that must be updated.
 * @param[in]  passwords    Passwords within preferences that must be updated.
 * @param[in]  timeout      0 to skip timeout preference.
 *
 * @return Result of XSL transformation.
 */
char *
save_config_nvt_omp (credentials_t * credentials,
                     const char * config_id,
                     const char * name,
                     const char * family,
                     const char * nvt,
                     const char * sort_field,
                     const char * sort_order,
                     GArray *preferences,
                     GArray *files,
                     GArray *passwords,
                     const char * timeout)
{
  if (preferences)
    {
      gnutls_session_t session;
      preference_t *preference;
      int socket, index = 0;
      gchar *html;

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

      while ((preference = g_array_index (preferences,
                                          preference_t*,
                                          index++)))
        {
          int type_start, type_end, count, ret, is_timeout = 0;
          gchar *value;
          char *modify_config_ret;

          /* Passwords and files have checkboxes to control whether they
           * must be reset.  This works around the need for the Manager to
           * send the actual password or show the actual file. */

          /* LDAPsearch[entry]:Timeout value */
          count = sscanf (preference->name,
                          "%*[^[][%n%*[^]]%n]:",
                          &type_start,
                          &type_end);
          if (count == 0 && type_start > 0 && type_end > 0)
            {
              if (strncmp (preference->name + type_start,
                           "password",
                           type_end - type_start)
                  == 0)
                {
                  const preference_t *password;
                  int index = 0, found = 0;
                  if (passwords)
                    while ((password = g_array_index (passwords,
                                                      preference_t*,
                                                      index++)))
                      if (strcmp (password->name, preference->name) == 0)
                        {
                          found = 1;
                          break;
                        }
                  if (found == 0)
                    /* Skip modifying the password preference. */
                    continue;
                }
              else if (strncmp (preference->name + type_start,
                                "file",
                                type_end - type_start)
                       == 0)
                {
                  const preference_t *file;
                  int index = 0, found = 0;
                  if (files)
                    while ((file = g_array_index (files,
                                                  preference_t*,
                                                  index++)))
                      if (strcmp (file->name, preference->name) == 0)
                        {
                          found = 1;
                          break;
                        }
                  if (found == 0)
                    /* Skip modifying the file preference. */
                    continue;
                }
              else if (strncmp (preference->name + type_start,
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
              if (strcmp (timeout, "0") == 0)
                /* Leave out the value to clear the preference. */
                ret = openvas_server_sendf (&session,
                                            "<modify_config config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id,
                                            preference->name);
              else
                ret = openvas_server_sendf (&session,
                                            "<modify_config config_id=\"%s\">"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "<value>%s</value>"
                                            "</preference>"
                                            "</modify_config>",
                                            config_id,
                                            preference->name,
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
                                        nvt,
                                        preference->name,
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

          modify_config_ret = check_modify_config (credentials, &session,
                                                   __FUNCTION__, __LINE__);
          if (modify_config_ret)
            {
              openvas_server_close (socket, session);
              return modify_config_ret;
            }
        }

      openvas_server_close (socket, session);
    }

  /* Return the Edit NVT page. */

  return get_config_nvt_omp (credentials, config_id, name, family, nvt,
                             sort_field, sort_order, 1);
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
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *config_id;

  config_id = params_value (params, "config_id");

  if (config_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a config. "
                         "The config was not deleted. "
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
                             "An internal error occurred while deleting a config. "
                             "The config is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_config config_id=\"%s\"/>"
                            "<get_configs"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            config_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a config. "
                           "The config is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a config. "
                           "It is unclear whether the config has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_configs");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Export a config.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   config_id            UUID of config.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content dispositions return.
 * @param[out]  content_length       Content length return.
 *
 * @return Config XML on success.  HTML result of XSL transformation on error.
 */
char *
export_config_omp (credentials_t * credentials, const char *config_id,
                   enum content_type * content_type, char **content_disposition,
                   gsize *content_length)
{
  GString *xml;
  entity_t entity;
  entity_t config_entity;
  gnutls_session_t session;
  int socket;
  char *content = NULL;
  gchar *html;

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
                             "An internal error occurred while getting a config. "
                             "The config could not be delivered. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_configs_response>");

  if (config_id == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Export Scan Config"));
  else
    {
      if (openvas_server_sendf (&session,
                                "<get_configs"
                                " config_id=\"%s\""
                                " export=\"1\"/>",
                                config_id)
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a config. "
                               "The config could not be delivered. "
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
                               "An internal error occurred while getting a config. "
                               "The config could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      config_entity = entity_child (entity, "config");
      if (config_entity != NULL)
        {
          *content_type = GSAD_CONTENT_TYPE_APP_XML;
          *content_disposition = g_strdup_printf ("attachment; filename=\"%s.xml\"",
                                                  config_id);
          *content_length = strlen (content);
          free_entity (entity);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return content;
        }
      else
        {
          free (content);
          free_entity (entity);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a config. "
                               "The config could not be delivered. "
                               "Diagnostics: Failure to receive config from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }

  g_string_append (xml, "</get_configs_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Export a file preference.
 *
 * @param[in]   credentials          Username and password for authentication.
 * @param[in]   config_id            UUID of config.
 * @param[in]   oid                  OID of NVT.
 * @param[in]   preference_name      Name of preference.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content dispositions return.
 * @param[out]  content_length       Content length return.
 *
 * @return Config XML on success.  HTML result of XSL transformation on error.
 */
char *
export_preference_file_omp (credentials_t * credentials, const char *config_id,
                            const char *oid, const char *preference_name,
                            enum content_type * content_type, char **content_disposition,
                            gsize *content_length)
{
  GString *xml;
  entity_t entity, preference_entity, value_entity;
  gnutls_session_t session;
  int socket;
  gchar *html;

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
 * @param[in]   report_format_id     UUID of report format.
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content disposition return.
 * @param[out]  content_length       Content length return.
 *
 * @return Report format XML on success.  HTML result of XSL transformation
 *         on error.
 */
char *
export_report_format_omp (credentials_t * credentials, const char *report_format_id,
                          enum content_type * content_type, char **content_disposition,
                          gsize *content_length)
{
  GString *xml;
  entity_t entity;
  entity_t report_format_entity;
  gnutls_session_t session;
  int socket;
  char *content = NULL;
  gchar *html;

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
                             "An internal error occurred while getting a report format. "
                             "The report format could not be delivered. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  xml = g_string_new ("<get_report_formats>");

  if (report_format_id == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Export Scan Report Format"));
  else
    {
      if (openvas_server_sendf (&session,
                                "<get_report_formats"
                                " report_format_id=\"%s\""
                                " export=\"1\"/>",
                                report_format_id)
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report format. "
                               "The report format could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_report_formats");
        }

      entity = NULL;
      if (read_entity_and_text (&session, &entity, &content))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report format. "
                               "The report format could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_report_formats");
        }

      report_format_entity = entity_child (entity, "report_format");
      if (report_format_entity != NULL)
        {
          *content_type = GSAD_CONTENT_TYPE_APP_XML;
          *content_disposition = g_strdup_printf ("attachment; filename=\"report-format-%s.xml\"",
                                                  report_format_id);
          *content_length = strlen (content);
          free_entity (entity);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return content;
        }
      else
        {
          free (content);
          free_entity (entity);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report format. "
                               "The report format could not be delivered. "
                               "Diagnostics: Failure to receive report format from manager daemon.",
                               "/omp?cmd=get_report_formats");
        }
    }

  g_string_append (xml, "</get_report_formats>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete report, get task status, XSL transform the result.
 *
 * @param[in]  credentials      Username and password for authentication.
 * @param[in]  report_id        ID of report.
 * @param[in]  task_id          ID of task.
 * @param[in]  apply_overrides  Whether to apply overrides.
 *
 * @return Result of XSL transformation.
 */
char *
delete_report_omp (credentials_t * credentials,
                   const char *report_id,
                   const char *task_id,
                   int apply_overrides)
{
  char *ret;
  gchar *delete_report;

  if ((report_id == NULL) || (task_id == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a report. "
                         "The report is not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  delete_report = g_strdup_printf ("<delete_report report_id=\"%s\"/>",
                                   report_id);

  ret = get_tasks (credentials, task_id, NULL, NULL, 0, delete_report,
                   apply_overrides, NULL);
  g_free (delete_report);
  return ret;
}

/**
 * @brief Get a report and XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  report_id      ID of report.
 * @param[in]  delta_report_id  ID of report to compare with.
 * @param[in]  format_id      ID of format of report.
 * @param[out] report_len     Length of report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  delta_states   Delta states to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  escalator_id       ID of escalator if escalation required, else 0.
 * @param[in]  esc_first_result   Number of first result in escalated report.
 * @param[in]  esc_max_results    Number of results in escalated report.
 * @param[in]  esc_levels     Threat levels to include in escalated report.
 * @param[in]  esc_notes      Whether to include notes in escalation.
 * @param[in]  esc_overrides  Whether to include overrides in escalation.
 * @param[in]  esc_result_hosts_only  Whether to show only hosts with results.
 * @param[in]  esc_search_phrase  Phrase which included results must contain.
 * @param[in]  esc_min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  result_id      ID of single result to get, in delta case.
 * @param[in]  type           Type of report: "assets" or NULL.
 * @param[out] content_type         Content type if known, else NULL.
 * @param[out] content_disposition  Content disposition, if content_type set.
 *
 * @return Report.
 */
char *
get_report_omp (credentials_t * credentials, const char *report_id,
                const char *delta_report_id, const char *format_id,
                gsize *report_len,
                const unsigned int first_result,
                const unsigned int max_results,
                const char * sort_field, const char * sort_order,
                const char * levels, const char * delta_states,
                const char * notes, const char * overrides,
                const char *result_hosts_only, const char * search_phrase,
                const char *min_cvss_base, const char * escalator_id,
                const unsigned int esc_first_result,
                const unsigned int esc_max_results,
                const char * esc_levels, const char * esc_notes,
                const char * esc_overrides, const char *esc_result_hosts_only,
                const char * esc_search_phrase, const char *esc_min_cvss_base,
                const char *result_id,
                const char *type,
                gchar ** content_type, char **content_disposition)
{
  char *report_encoded = NULL;
  gchar *report_decoded = NULL;
  GString *xml;
  entity_t entity;
  entity_t report_entity;
  gnutls_session_t session;
  int socket;
  gchar *html;

  *content_type = NULL;
  *report_len = 0;

  if (escalator_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a report. "
                         "The report could not be delivered. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  if (search_phrase == NULL)
    {
      xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Get Report"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (min_cvss_base == NULL)
    {
      xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Get Report"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (type && (strcmp (type, "assets") == 0))
    {
      if (levels == NULL || strlen (levels) == 0)
        levels = "";
    }
  else if (levels == NULL || strlen (levels) == 0)
    levels = "hm";

  if (delta_states == NULL || strlen (delta_states) == 0) delta_states = "gn";

  if (notes == NULL || strlen (notes) == 0) notes = "0";

  if (overrides == NULL || strlen (overrides) == 0) overrides = "0";

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
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting a report. "
                             "The report could not be delivered. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (strcmp (escalator_id, "0"))
    {
      const char *status;

      if (openvas_server_sendf (&session,
                                "<get_reports"
                                " notes=\"%i\""
                                " notes_details=\"1\""
                                " apply_overrides=\"%i\""
                                " overrides=\"1\""
                                " overrides_details=\"1\""
                                " result_hosts_only=\"%i\""
                                " report_id=\"%s\""
                                " first_result=\"%u\""
                                " max_results=\"%u\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\""
                                " levels=\"%s\""
                                " delta_states=\"%s\""
                                " search_phrase=\"%s\""
                                " min_cvss_base=\"%s\""
                                " escalator_id=\"%s\"/>",
                                strcmp (esc_notes, "0") ? 1 : 0,
                                strcmp (esc_overrides, "0") ? 1 : 0,
                                strcmp (esc_result_hosts_only, "0") ? 1 : 0,
                                report_id,
                                esc_first_result,
                                esc_max_results,
                                sort_field ? sort_field : "type",
                                sort_order
                                 ? sort_order
                                 : ((sort_field == NULL
                                     || strcmp (sort_field, "type") == 0)
                                    ? "descending"
                                    : "ascending"),
                                esc_levels,
                                delta_states,
                                esc_search_phrase,
                                esc_min_cvss_base,
                                escalator_id)
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (read_entity (&session, &entity))
        {
          openvas_server_close (socket, session);
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
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to parse response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }
      if (status[0] != '2')
        {
          char *ret;
          gchar *msg;
          msg = g_strdup_printf ("An internal error occurred while getting a report. "
                                 "The report could not be delivered. "
                                 "Diagnostics: GET_REPORT escalation failed: %s.",
                                 entity_attribute (entity, "status_text"));
          ret = gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              msg, "/omp?cmd=get_tasks");
          g_free (msg);
          free_entity (entity);
          openvas_server_close (socket, session);
          return ret;
        }
      free_entity (entity);
    }

  if (openvas_server_sendf (&session,
                            "<get_reports"
                            "%s"
                            " notes=\"%i\""
                            " notes_details=\"1\""
                            " apply_overrides=\"%i\""
                            " overrides=\"1\""
                            " overrides_details=\"1\""
                            " result_hosts_only=\"%i\""
                            " report_id=\"%s\""
                            " delta_report_id=\"%s\""
                            " format_id=\"%s\""
                            " first_result=\"%u\""
                            " max_results=\"%u\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\""
                            " levels=\"%s\""
                            " delta_states=\"%s\""
                            " search_phrase=\"%s\""
                            " min_cvss_base=\"%s\"/>",
                            (type && (strcmp (type, "assets") == 0))
                             ? " type=\"assets\""
                             : "",
                            strcmp (notes, "0") ? 1 : 0,
                            strcmp (overrides, "0") ? 1 : 0,
                            strcmp (result_hosts_only, "0") ? 1 : 0,
                            (type && (strcmp (type, "assets") == 0))
                             ? ""
                             : report_id,
                            delta_report_id ? delta_report_id : "0",
                            format_id
                             ? format_id
                             : "d5da9f67-8551-4e51-807b-b6a873d70e34",
                            first_result,
                            max_results,
                            sort_field ? sort_field : "type",
                            sort_order
                             ? sort_order
                             : ((sort_field == NULL
                                 || strcmp (sort_field, "type") == 0)
                                ? "descending"
                                : "ascending"),
                            levels,
                            delta_states,
                            search_phrase,
                            min_cvss_base)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (format_id)
    {
      if (strcmp (format_id, "d5da9f67-8551-4e51-807b-b6a873d70e34") == 0)
        {
          const char *extension, *type;
          /* Manager sends XML report as plain XML. */

          xml = g_string_new ("");
          if (read_entity (&session, &entity))
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
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
              g_string_free (xml, TRUE);
              return gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Response from manager daemon did not contain a report.",
                                   "/omp?cmd=get_tasks");
            }
          extension = entity_attribute (report, "extension");
          type = entity_attribute (report, "content_type");
          if (extension && type)
            {
              *content_type = g_strdup (type);
              *content_disposition
                = g_strdup_printf ("attachment; filename=report-%s.%s",
                                   report_id,
                                   extension);
            }
          print_entity_to_string (report, xml);
          free_entity (entity);
          return g_string_free (xml, FALSE);
        }
      else
        {
          /* "nbe", "pdf", "dvi", "html", "html-pdf"... */

          xml = g_string_new ("<commands_response>");

          entity = NULL;
          if (read_entity (&session, &entity))
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
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
              const char *extension, *type;
              extension = entity_attribute (report_entity, "extension");
              type = entity_attribute (report_entity, "content_type");
              report_encoded = entity_text (report_entity);
              report_decoded =
                (gchar *) g_base64_decode (report_encoded, report_len);
              /* g_base64_decode can return NULL (Glib 2.12.4-2), at least
               * when *report_len is zero. */
              if (report_decoded == NULL)
                {
                  report_decoded = (gchar *) g_strdup ("");
                  *report_len = 0;
                }
              if (extension && type)
                {
                  *content_type = g_strdup (type);
                  *content_disposition
                    = g_strdup_printf ("attachment; filename=report-%s.%s",
                                       report_id,
                                       extension);
                }
              free_entity (entity);
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              return report_decoded;
            }
          else
            {
              free_entity (entity);
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
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
      else
        xml = g_string_new ("<get_report>");

      if (strcmp (escalator_id, "0"))
        g_string_append_printf (xml, "<get_reports_escalate_response"
                                     " status=\"200\""
                                     " status_text=\"OK\"/>");
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
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (type && (strcmp (type, "assets") == 0))
        {
          g_string_append (xml, "</get_report>");
          openvas_server_close (socket, session);
          return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
          return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
        }

      if (openvas_server_send (&session, "<get_report_formats"
                                         " sort_field=\"name\""
                                         " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
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
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      if (openvas_server_send (&session, "<get_escalators"
                                         " sort_field=\"name\""
                                         " sort_order=\"ascending\"/>")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
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
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_tasks");
        }

      {

        /* As a temporary hack until there's a reasonable way to do it in the
         * manager, get the report again with all threat levels, so that the XSL
         * can count per-host grand totals. */

        g_string_append (xml, "<all>");

        if (openvas_server_sendf (&session,
                                  "<get_reports"
                                  " report_id=\"%s\""
                                  " delta_report_id=\"%s\""
                                  " format=\"XML\""
                                  " first_result=\"%u\""
                                  " max_results=\"%u\""
                                  " levels=\"hmlg\""
                                  " search_phrase=\"%s\"/>",
                                  report_id,
                                  delta_report_id ? delta_report_id : "0",
                                  first_result,
                                  max_results,
                                  search_phrase)
            == -1)
          {
            g_string_free (xml, TRUE);
            openvas_server_close (socket, session);
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
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting a report. "
                                 "The report could not be delivered. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_tasks");
          }

        g_string_append (xml, "</all>");
      }

      g_string_append (xml, "</get_report>");
      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }
}

#define REQUIRE(arg)                                                  \
  if (arg == NULL)                                                    \
    return gsad_message (credentials,                                 \
                         "Internal error", __FUNCTION__, __LINE__,    \
                         "An internal error occurred."                \
                         " Diagnostics: Required parameter \""        \
                         G_STRINGIFY (arg)                            \
                         "\" was NULL.",                              \
                         "/omp?cmd=get_tasks")

/**
 * @brief Get one result, XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  result_id     Result UUID.
 * @param[in]  task_id       Result task UUID.
 * @param[in]  apply_overrides  Whether to apply overrides.
 * @param[in]  commands      Extra commands to run before the others.
 * @param[in]  report_id     ID of report.
 * @param[in]  first_result  First result.
 * @param[in]  max_results   Max results.
 * @param[in]  levels        Levels.
 * @param[in]  search_phrase  Search phrase.
 * @param[in]  notes         Notes filter flag.
 * @param[in]  overrides     Overrides filter flag.
 * @param[in]  min_cvss_base      Min CVSS base.
 * @param[in]  result_hosts_only  Result hosts only filter flag.
 * @param[in]  sort_field         Sort field.
 * @param[in]  sort_order         Sort order.
 * @param[in]  delta_report_id    ID of delta report.
 * @param[in]  delta_states       Delta states.
 *
 * @return Result of XSL transformation.
 */
char *
get_result_omp (credentials_t *credentials, const char *result_id,
                const char *task_id, const char *task_name,
                const char *apply_overrides, const char *commands,
                const char *report_id, const char *first_result,
                const char *max_results, const char *levels,
                const char *search_phrase, const char *notes,
                const char *overrides, const char *min_cvss_base,
                const char *result_hosts_only, const char *sort_field,
                const char *sort_order, const char *delta_report_id,
                const char *delta_states)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  REQUIRE (apply_overrides);
  REQUIRE (task_name);
  REQUIRE (notes);
  REQUIRE (overrides);
  REQUIRE (min_cvss_base);
  REQUIRE (result_hosts_only);
  REQUIRE (sort_field);
  REQUIRE (sort_order);

  if (apply_overrides == NULL || task_name == NULL || notes == NULL
      || overrides == NULL || min_cvss_base == NULL || result_hosts_only == NULL
      || sort_field == NULL || sort_order == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a result. "
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
                             "An internal error occurred while getting a result. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_results");
    }

  xml = g_string_new ("<get_result>");

  g_string_append_printf (xml,
                          "<task id=\"%s\"><name>%s</name></task>"
                          "<report id=\"%s\"/>"
                          "<delta><report id=\"%s\"/></delta>"
                          /* As a hack put the REPORT children alongside the
                           * REPORT.  This keeps them at the same level
                           * above the RESULT as they are in GET_REPORT. */
                          "<results start=\"%s\" max=\"%s\"/>"
                          "<filters>"
                          "%s"
                          "<phrase>%s</phrase>"
                          "<notes>%s</notes>"
                          "<overrides>%s</overrides>"
                          "<min_cvss_base>%s</min_cvss_base>"
                          /* So that the XSL shows the overrides. */
                          "<apply_overrides>%s</apply_overrides>"
                          "<result_hosts_only>%s</result_hosts_only>"
                          "<delta>%s</delta>"
                          "</filters>"
                          "<sort>"
                          "<field>"
                          "%s"
                          "<order>%s</order>"
                          "</field>"
                          "</sort>",
                          task_id,
                          task_name,
                          report_id,
                          delta_report_id,
                          first_result,
                          max_results,
                          levels,
                          search_phrase,
                          notes,
                          overrides,
                          min_cvss_base,
                          apply_overrides,
                          result_hosts_only,
                          delta_states,
                          sort_field,
                          sort_order);

  /* Get the result. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_results"
                            " result_id=\"%s\""
                            " task_id=\"%s\""
                            " apply_overrides=\"%s\""
                            " overrides=\"1\""
                            " overrides_details=\"1\""
                            " notes=\"1\""
                            " notes_details=\"1\"/>"
                            "</commands>",
                            commands ? commands : "",
                            result_id,
                            task_id,
                            apply_overrides)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a result. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_results");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a result. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_results");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_result>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all notes, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_notes (credentials_t *credentials, const char *commands)
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
                             "An internal error occurred while getting the notes. "
                             "The list of notes is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_notes>");

  /* Get the notes. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_notes sort_field=\"notes.nvt, notes.text\"/>"
                            "</commands>",
                            commands ? commands : "")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the notes. "
                           "The list of notes is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the notes. "
                           "The list of notes is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_notes>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all notes, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 *
 * @return Result of XSL transformation.
 */
char *
get_notes_omp (credentials_t *credentials)
{
  return get_notes (credentials, NULL);
}

/**
 * @brief Get a note, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_note (credentials_t *credentials, params_t *params, const char *commands)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *note_id;

  note_id = params_value (params, "note_id");
  if (note_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a note. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_notes");

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
                             "An internal error occurred while getting the note. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_note>");

  /* Get the note. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_notes"
                            " note_id=\"%s\""
                            " details=\"1\"/>"
                            "</commands>",
                            commands ? commands : "",
                            note_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the note. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the note. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_note>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  oid            OID of NVT associated with note.
 * @param[in]  hosts          Hosts to limit override to, "" for all.
 * @param[in]  port           Port to limit note to, "" for all.
 * @param[in]  threat         Threat to limit note to, "" for all.
 * @param[in]  task_id        ID of task to limit note to, "" for all.
 * @param[in]  task_name      Name of task to limit note to, task_id given.
 * @param[in]  result_id      ID of result to limit note to, "" for all.
 * @param[in]  next           Next page, NULL for get_report.
 * @param[in]  report_id      ID of report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 *
 * @return Result of XSL transformation.
 */
char *
new_note_omp (credentials_t *credentials, const char *oid,
              const char *hosts, const char *port, const char *threat,
              const char *task_id, const char *task_name,
              const char *result_id, const char *next,
              /* Passthroughs. */
              const char *report_id, const char *first_result,
              const char *max_results, const char *sort_field,
              const char *sort_order, const char *levels, const char *notes,
              const char *overrides, const char *result_hosts_only,
              const char *search_phrase, const char *min_cvss_base)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (next == NULL
      && (first_result == NULL || max_results == NULL
          || levels == NULL || notes == NULL || report_id == NULL
          || search_phrase == NULL || sort_field == NULL || sort_order == NULL
          || task_name == NULL || threat == NULL || result_hosts_only == NULL
          || min_cvss_base == NULL))
    {
      GString *xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Get Report"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (hosts == NULL || oid == NULL || port == NULL || result_id == NULL
      || task_id == NULL || overrides == NULL)
    {
      GString *xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Get Report"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
                             "An internal error occurred while creating a new note. "
                             "No new note was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_notes");
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

  g_string_append_printf (xml,
                          "<new_note>"
                          "<nvt id=\"%s\"/>"
                          "<hosts>%s</hosts>"
                          "<port>%s</port>"
                          "<threat>%s</threat>"
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
                          "<notes>%s</notes>"
                          "<overrides>%s</overrides>"
                          "<result_hosts_only>%s</result_hosts_only>"
                          "<search_phrase>%s</search_phrase>"
                          "<min_cvss_base>%s</min_cvss_base>",
                          oid,
                          hosts,
                          port,
                          threat,
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
                          notes,
                          overrides,
                          result_hosts_only,
                          search_phrase,
                          min_cvss_base);

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
 * @brief Create a note, get report, XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  oid            OID of NVT associated with note.
 * @param[in]  text           Text of note.
 * @param[in]  hosts          Hosts note applied to, "" for all.
 * @param[in]  port           Port note applies to, "" for all.
 * @param[in]  threat         Threat note applies to, "" for all.
 * @param[in]  task_id        ID of task to limit note to, "" for all.
 * @param[in]  note_result_id  ID of result to limit note to, "" for all.
 * @param[in]  next           Next page, NULL for get_report.
 * @param[in]  report_id      ID of report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  task_name      Name of task (for get_result).
 * @param[in]  result_task_id  ID of task (for get_result).
 * @param[in]  result_id      ID of result (for get_result).
 *
 * @return Result of XSL transformation.
 */
char *
create_note_omp (credentials_t *credentials, const char *oid,
                 const char *text, const char *hosts, const char *port,
                 const char *threat, const char *task_id,
                 const char *note_result_id, const char *next,
                 /* Passthroughs. */
                 const char *report_id,
                 const unsigned int first_result,
                 const unsigned int max_results,
                 const char *sort_field, const char *sort_order,
                 const char *levels, const char *notes, const char *overrides,
                 const char *result_hosts_only, const char *search_phrase,
                 const char *min_cvss_base, const char *task_name,
                 const char *result_task_id, const char *result_id)
{
  gnutls_session_t session;
  GString *xml;
  int socket;
  gchar *html, *create_note;

  if ((next == NULL) && (search_phrase == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: Search phrase was NULL.",
                         "/omp?cmd=get_notes");

  if (oid == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: OID was NULL.",
                         "/omp?cmd=get_notes");

  if (threat == NULL || port == NULL || hosts == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: A required parameter was NULL.",
                         "/omp?cmd=get_notes");

  if ((next == NULL) && (min_cvss_base == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: A required parameter was NULL.",
                         "/omp?cmd=get_notes");

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

  xml = g_string_new ("<commands_response>");

  create_note = g_strdup_printf ("<create_note>"
                                 "<nvt oid=\"%s\"/>"
                                 "<hosts>%s</hosts>"
                                 "<port>%s</port>"
                                 "<threat>%s</threat>"
                                 "<text>%s</text>"
                                 "<task id=\"%s\"/>"
                                 "<result id=\"%s\"/>"
                                 "</create_note>",
                                 oid,
                                 hosts,
                                 port,
                                 threat,
                                 text ? text : "",
                                 task_id,
                                 note_result_id);

  if (next && (strcmp (next, "get_result") == 0))
    {
      gchar *first = g_strdup_printf ("%u", first_result);
      gchar *max = g_strdup_printf ("%u", max_results);
      char *ret = get_result_omp (credentials, result_id, result_task_id,
                                  task_name, overrides, create_note, report_id,
                                  first, max, levels, search_phrase, notes,
                                  overrides, min_cvss_base, result_hosts_only,
                                  sort_field, sort_order, NULL, NULL);
      g_free (create_note);
      g_free (first);
      g_free (max);
      return ret;
    }

  if (text == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Note"));
  else
    {
      int ret;

      /* Create the note. */

      ret = openvas_server_sendf (&session, create_note);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
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
                               "It is unclear whether the note has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_notes");
        }
    }
  g_free (create_note);

  /* Get the report. */

  if (levels == NULL || strlen (levels) == 0) levels = "hm";

  if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
    result_hosts_only = "1";

  if (notes == NULL || strlen (notes) == 0) notes = "0";

  if (overrides == NULL || strlen (overrides) == 0) overrides = "0";

  if (openvas_server_sendf (&session,
                            "<get_reports"
                            " notes=\"%i\""
                            " notes_details=\"1\""
                            " apply_overrides=\"%i\""
                            " overrides=\"1\""
                            " overrides_details=\"1\""
                            " result_hosts_only=\"%i\""
                            " report_id=\"%s\""
                            " format=\"XML\""
                            " first_result=\"%u\""
                            " max_results=\"%u\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\""
                            " levels=\"%s\""
                            " search_phrase=\"%s\""
                            " min_cvss_base=\"%s\"/>",
                            strcmp (notes, "0") ? 1 : 0,
                            strcmp (overrides, "0") ? 1 : 0,
                            strcmp (result_hosts_only, "0") ? 1 : 0,
                            report_id,
                            first_result,
                            max_results,
                            sort_field ? sort_field : "type",
                            sort_order
                             ? sort_order
                             : ((sort_field == NULL
                                 || strcmp (sort_field, "type") == 0)
                                ? "descending"
                                : "ascending"),
                            levels,
                            search_phrase,
                            min_cvss_base)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report. "
                           "The new note was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report. "
                           "The new note was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (openvas_server_send (&session, "<get_report_formats"
                                     " sort_field=\"name\""
                                     " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
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
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (openvas_server_send (&session, "<get_escalators"
                                     " sort_field=\"name\""
                                     " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
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
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  {

    /* As a temporary hack until there's a reasonable way to do it in the
     * Manager, get the report again with all threat levels, so that the XSL
     * can count per-host grand totals. */

    g_string_append (xml, "<all>");

    if (openvas_server_sendf (&session,
                              "<get_reports"
                              " report_id=\"%s\""
                              " format=\"XML\""
                              " first_result=\"%u\""
                              " max_results=\"%u\""
                              " levels=\"hmlg\""
                              " search_phrase=\"%s\""
                              " search_phrase=\"%s\"/>",
                              report_id,
                              first_result,
                              max_results,
                              search_phrase,
                              min_cvss_base)
        == -1)
      {
        g_string_free (xml, TRUE);
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the report. "
                             "The new note was, however, created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      }

    if (read_string (&session, &xml))
      {
        g_string_free (xml, TRUE);
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the report. "
                             "The new note was, however, created. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      }

    g_string_append (xml, "</all>");
  }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete note, get next page, XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  note_id        ID of note.
 * @param[in]  next           Name of next page.
 * @param[in]  report_id      ID of current report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to apply/include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  oid            OID of NVT (for get_nvts).
 * @param[in]  task_id        ID of task (for get_tasks and get_result).
 * @param[in]  task_name      Name of task (for get_result).
 * @param[in]  result_id      ID of result (for get_result).
 *
 * @return Result of XSL transformation.
 */
char *
delete_note_omp (credentials_t * credentials, const char *note_id,
                 const char *next, const char *report_id,
                 const unsigned int first_result,
                 const unsigned int max_results,
                 const char *sort_field, const char *sort_order,
                 const char *levels, const char *notes, const char *overrides,
                 const char *result_hosts_only, const char *search_phrase,
                 const char *min_cvss_base, const char *oid,
                 const char *task_id, const char *task_name,
                 const char *result_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if ((next == NULL) || (note_id == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a note. "
                         "The note remains intact. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_notes");

  if (strcmp (next, "get_nvts") == 0)
    {
      gchar *extra;
      char *ret;

      if (oid == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while deleting a note. "
                             "The note remains intact. "
                             "Diagnostics: Required parameter was NULL.",
                             "/omp?cmd=get_notes");

      extra = g_strdup_printf ("<delete_note note_id=\"%s\"/>", note_id);
      ret = get_nvts (credentials, oid, extra);
      g_free (extra);
      return ret;
    }

  if (strcmp (next, "get_notes") == 0)
    {
      gchar *extra = g_strdup_printf ("<delete_note note_id=\"%s\"/>", note_id);
      char *ret = get_notes (credentials, extra);
      g_free (extra);
      return ret;
    }

  if (strcmp (next, "get_tasks") == 0)
    {
      gchar *extra = g_strdup_printf ("<delete_note note_id=\"%s\"/>", note_id);
      char *ret = get_tasks (credentials, task_id, NULL, NULL, NULL, extra,
                             overrides ? strcmp (overrides, "0") : 0,
                             NULL);
      g_free (extra);
      return ret;
    }

  if (strcmp (next, "get_result") == 0)
    {
      gchar *extra, *first, *max;
      char *ret;

      if (task_name == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while deleting a note. "
                             "The note remains intact. "
                             "Diagnostics: Required parameter was NULL.",
                             "/omp?cmd=get_notes");

      extra = g_strdup_printf ("<delete_note note_id=\"%s\"/>", note_id);
      first = g_strdup_printf ("%u", first_result);
      max = g_strdup_printf ("%u", max_results);
      ret = get_result_omp (credentials, result_id, task_id, task_name,
                            overrides, extra, report_id, first, max,
                            levels, search_phrase, notes, overrides,
                            min_cvss_base, result_hosts_only, sort_field,
                            sort_order, NULL, NULL);
      g_free (extra);
      g_free (first);
      g_free (max);
      return ret;
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
                             "An internal error occurred while deleting a note. "
                             "The note was not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (strcmp (next, "get_report") == 0)
    {
      if (search_phrase == NULL || min_cvss_base == NULL)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while deleting a note. "
                               "The note remains intact. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_notes");
        }

      if (levels == NULL || strlen (levels) == 0) levels = "hm";

      if (notes == NULL || strlen (notes) == 0) notes = "0";

      if (overrides == NULL || strlen (overrides) == 0) overrides = "0";

      if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
        result_hosts_only = "1";

      if (openvas_server_sendf (&session,
                                "<commands>"
                                "<delete_note note_id=\"%s\" />"
                                "<get_reports"
                                " notes=\"%i\""
                                " notes_details=\"1\""
                                " apply_overrides=\"%i\""
                                " overrides=\"1\""
                                " overrides_details=\"1\""
                                " result_hosts_only=\"%i\""
                                " report_id=\"%s\""
                                " format=\"XML\""
                                " first_result=\"%u\""
                                " max_results=\"%u\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\""
                                " levels=\"%s\""
                                " search_phrase=\"%s\""
                                " min_cvss_base=\"%s\"/>"
                                "<get_report_formats"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "<get_escalators"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "</commands>",
                                note_id,
                                strcmp (notes, "0") ? 1 : 0,
                                strcmp (overrides, "0") ? 1 : 0,
                                strcmp (result_hosts_only, "0") ? 1 : 0,
                                report_id,
                                first_result,
                                max_results,
                                sort_field ? sort_field : "type",
                                sort_order
                                 ? sort_order
                                 : ((sort_field == NULL
                                     || strcmp (sort_field, "type") == 0)
                                    ? "descending"
                                    : "ascending"),
                                levels,
                                search_phrase,
                                min_cvss_base)
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while deleting a note. "
                               "It is unclear whether the note has been deleted or not. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }
  else
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a note. "
                           "The note remains intact. "
                           "Diagnostics: Error in parameter next.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a note. "
                           "It is unclear whether the note has been deleted or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Edit note, get next page, XSL transform the result.
 *
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  params          Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_note_omp (credentials_t * credentials, params_t *params)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *note_id, *next;
  int first_result, max_results;

  note_id = params_value (params, "note_id");
  next = params_value (params, "next");
  if (note_id == NULL || next == NULL)
    {
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           "/omp?cmd=get_notes");
    }

  if (strcmp (next, "get_note")
      && strcmp (next, "get_notes")
      && strcmp (next, "get_nvts")
      && strcmp (next, "get_report")
      && strcmp (next, "get_result")
      && strcmp (next, "get_tasks"))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note remains the same. "
                         "Diagnostics: next must name a valid page.",
                         "/omp?cmd=get_notes");

  if ((strcmp (next, "get_nvts") == 0)
      && (params_value (params, "oid") == NULL))
    {
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           "/omp?cmd=get_notes");
    }

  if ((strcmp (next, "get_tasks") == 0)
      && (params_value (params, "overrides") == NULL)
      && (params_value (params, "task_id") == NULL))
    {
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           "/omp?cmd=get_notes");
    }

  if ((strcmp (next, "get_result") == 0)
      || (strcmp (next, "get_report") == 0))
    {
      if ((params_value (params, "report_id") == NULL)
          || (params_value (params, "first_result") == NULL)
          || (params_value (params, "max_results") == NULL)
          || (params_value (params, "sort_field") == NULL)
          || (params_value (params, "sort_order") == NULL)
          || (params_value (params, "levels") == NULL)
          || (params_value (params, "notes") == NULL)
          || (params_value (params, "overrides") == NULL)
          || (params_value (params, "result_hosts_only") == NULL)
          || (params_value (params, "search_phrase") == NULL)
          || (params_value (params, "min_cvss_base") == NULL))
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while editing a note. "
                             "The note remains as it was. "
                             "Diagnostics: Required parameter was NULL.",
                             "/omp?cmd=get_notes");

      if (sscanf (params_value (params, "first_result"), "%u", &first_result)
          != 1)
        first_result = 1;

      if (sscanf (params_value (params, "max_results"), "%u", &max_results) != 1)
        max_results = RESULTS_PER_PAGE;
    }
  else
    {
      first_result = 0;
      max_results = 0;
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

  g_string_append_printf (xml,
                          "<edit_note>"
                          /* Page that follows. */
                          "<next>%s</next>"
                          /* Parameters for get_report. */
                          "<report id=\"%s\"/>"
                          "<first_result>%i</first_result>"
                          "<max_results>%i</max_results>"
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>"
                          "<levels>%s</levels>"
                          "<notes>%s</notes>"
                          "<overrides>%s</overrides>"
                          "<result_hosts_only>%s</result_hosts_only>"
                          "<search_phrase>%s</search_phrase>"
                          "<min_cvss_base>%s</min_cvss_base>"
                          /* Parameters for get_nvts. */
                          "<nvt id=\"%s\"/>"
                          /* Parameters for get_result. */
                          "<result id=\"%s\"/>"
                          /* Parameters for get_tasks and get_result. */
                          "<task id=\"%s\"><name>%s</name></task>",
                          next,
                          params_value (params, "report_id"),
                          first_result,
                          max_results,
                          params_value (params, "sort_field"),
                          params_value (params, "sort_order"),
                          params_value (params, "levels"),
                          params_value (params, "notes"),
                          params_value (params, "overrides"),
                          params_value (params, "result_hosts_only"),
                          params_value (params, "search_phrase"),
                          params_value (params, "min_cvss_base"),
                          params_value (params, "oid"),
                          params_value (params, "result_id"),
                          params_value (params, "task_id"),
                          params_value (params, "name")
                           ? params_value (params, "name")
                           : "");

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
  entity_t entity;
  char *response = NULL;
  gnutls_session_t session;
  int socket;
  gchar *modify_note;
  gchar *html;

  const char *note_id, *text, *hosts, *port, *threat, *note_task_id;
  const char *note_result_id, *next, *report_id;
  unsigned int first_result, max_results;
  const char *sort_field, *sort_order, *levels, *notes, *overrides;
  const char *result_hosts_only, *search_phrase, *min_cvss_base;
  const char *oid, *task_id, *task_name, *result_id;

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

  threat = params_value (params, "threat");
  note_task_id = params_value (params, "note_task_id");
  note_result_id = params_value (params, "note_result_id");
  next = params_value (params, "next");
  report_id = params_value (params, "report_id");

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");
  levels = params_value (params, "levels");

  notes = params_value (params, "notes");
  if (notes == NULL)
    params_given (params, "notes") || (notes = "0");

  overrides = params_value (params, "overrides");
  if (overrides == NULL)
    params_given (params, "overrides") || (overrides = "0");

  result_hosts_only = params_value (params, "result_hosts_only");
  if (result_hosts_only == NULL)
    params_given (params, "result_hosts_only") || (result_hosts_only = "0");

  search_phrase = params_value (params, "search_phrase");
  if (search_phrase == NULL)
    params_given (params, "search_phrase") || (search_phrase = "");

  min_cvss_base = NULL;
  oid = params_value (params, "oid");
  task_id = params_value (params, "task_id");
  task_name = params_value (params, "name");
  result_id = params_value (params, "result_id");

  if (next == NULL || note_task_id == NULL || note_result_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_notes");

  if (strcmp (next, "get_note")
      && strcmp (next, "get_notes")
      && strcmp (next, "get_nvts")
      && strcmp (next, "get_report")
      && strcmp (next, "get_result")
      && strcmp (next, "get_tasks"))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note remains the same. "
                         "Diagnostics: next must name a valid page.",
                         "/omp?cmd=get_notes");

  if (note_id == NULL
      || text == NULL
      || hosts == NULL
      || port == NULL
      || threat == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note remains the same. "
                         "Diagnostics: Syntax error in required parameter.",
                         "/omp?cmd=get_notes");

  first_result = 0;
  max_results = 0;

  if ((strcmp (next, "get_report") == 0)
      || (strcmp (next, "get_result") == 0))
    {
      if (params_value (params, "first_result") == NULL
          || sscanf (params_value (params, "first_result"), "%u", &first_result)
             != 1)
        first_result = 1;

      if (params_given (params, "min_cvss_base"))
        {
          if (params_valid (params, "min_cvss_base"))
            {
              if (params_value (params, "apply_min")
                  && strcmp (params_value (params, "apply_min"), "0"))
                min_cvss_base = params_value (params, "min_cvss_base");
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      if (report_id == NULL
          || sort_field == NULL
          || sort_order == NULL
          || levels == NULL
          || notes == NULL
          || overrides == NULL
          || result_hosts_only == NULL
          || search_phrase == NULL
          || min_cvss_base == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "The note remains the same. "
                             "Diagnostics: Syntax error in required parameter.",
                             "/omp?cmd=get_notes");

      if (strcmp (next, "get_report") == 0)
        {
          if (params_value (params, "max_results") == NULL
              || sscanf (params_value (params, "max_results"), "%u", &max_results)
                 != 1)
            max_results = 1;
        }
      else
        {
          if (params_value (params, "max_results") == NULL
              || sscanf (params_value (params, "max_results"), "%u", &max_results)
                 != 1)
            max_results = RESULTS_PER_PAGE;

          if (task_id == NULL
              || result_id == NULL
              || task_name == NULL)
            return
              gsad_message (credentials,
                            "Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while saving a note. "
                            "The note remains the same. "
                            "Diagnostics: Syntax error in required parameter.",
                            "/omp?cmd=get_notes");
        }

    }

  if (strcmp (next, "get_tasks") == 0)
    {
      if (overrides == NULL
          || task_id == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving a note. "
                             "The note remains the same. "
                             "Diagnostics: Syntax error in required parameter.",
                             "/omp?cmd=get_notes");
    }

  modify_note = g_strdup_printf ("<modify_note note_id=\"%s\">"
                                 "<hosts>%s</hosts>"
                                 "<port>%s</port>"
                                 "<threat>%s</threat>"
                                 "<text>%s</text>"
                                 "<task id=\"%s\"/>"
                                 "<result id=\"%s\"/>"
                                 "</modify_note>",
                                 note_id,
                                 hosts ? hosts : "",
                                 port ? port : "",
                                 threat ? threat : "",
                                 text ? text : "",
                                 note_task_id,
                                 note_result_id);

  if (strcmp (next, "get_nvts") == 0)
    {
      char *ret;

      if (oid == NULL)
        {
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a note. "
                               "The note remains the same. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_notes");
        }

      ret = get_nvts (credentials, oid, modify_note);
      g_free (modify_note);
      return ret;
    }

  if (strcmp (next, "get_note") == 0)
    {
      char *ret = get_note (credentials, params, modify_note);
      g_free (modify_note);
      return ret;
    }

  if (strcmp (next, "get_notes") == 0)
    {
      char *ret = get_notes (credentials, modify_note);
      g_free (modify_note);
      return ret;
    }

  if (strcmp (next, "get_result") == 0)
    {
      gchar *first = g_strdup_printf ("%u", first_result);
      gchar *max = g_strdup_printf ("%u", max_results);
      char *ret = get_result_omp (credentials, result_id, task_id,
                                  task_name, overrides, modify_note, report_id,
                                  first, max, levels, search_phrase, notes,
                                  overrides, min_cvss_base, result_hosts_only,
                                  sort_field, sort_order, NULL, NULL);
      g_free (modify_note);
      g_free (first);
      g_free (max);
      return ret;
    }

  if (strcmp (next, "get_tasks") == 0)
    {
      char *ret = get_tasks (credentials, task_id, NULL, NULL, NULL,
                             modify_note,
                             overrides ? strcmp (overrides, "0") : 0,
                             NULL);
      g_free (modify_note);
      return ret;
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
                             "An internal error occurred while saving a note. "
                             "The note was not saved. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (strcmp (next, "get_report") == 0)
    {
      if (search_phrase == NULL || min_cvss_base == NULL)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a note. "
                               "The note remains the same. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_notes");
        }

      if (levels == NULL || strlen (levels) == 0) levels = "hm";

      if (notes == NULL || strlen (notes) == 0) notes = "0";

      if (overrides == NULL || strlen (overrides) == 0) overrides = "0";

      if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
        result_hosts_only = "1";

      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_reports"
                                " notes=\"%i\""
                                " notes_details=\"1\""
                                " apply_overrides=\"%i\""
                                " overrides=\"1\""
                                " overrides_details=\"1\""
                                " result_hosts_only=\"%i\""
                                " report_id=\"%s\""
                                " format=\"XML\""
                                " first_result=\"%u\""
                                " max_results=\"%u\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\""
                                " levels=\"%s\""
                                " search_phrase=\"%s\""
                                " min_cvss_base=\"%s\"/>"
                                "<get_report_formats"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "<get_escalators"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "</commands>",
                                modify_note,
                                strcmp (notes, "0") ? 1 : 0,
                                strcmp (overrides, "0") ? 1 : 0,
                                strcmp (result_hosts_only, "0") ? 1 : 0,
                                report_id,
                                first_result,
                                max_results,
                                sort_field ? sort_field : "type",
                                sort_order
                                 ? sort_order
                                 : ((sort_field == NULL
                                     || strcmp (sort_field, "type") == 0)
                                    ? "descending"
                                    : "ascending"),
                                levels,
                                search_phrase,
                                min_cvss_base)
          == -1)
        {
          g_free (modify_note);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a note. "
                               "It is unclear whether the note has been saved or not. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }
      g_free (modify_note);
    }
  else
    {
      g_free (modify_note);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a note. "
                           "The note remains the same. "
                           "Diagnostics: Error in parameter next.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &response))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a note. "
                           "It is unclear whether the note has been saved or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, response);
}

/**
 * @brief Get all overrides, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_overrides (credentials_t *credentials, const char *commands)
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
                             "An internal error occurred while getting the overrides. "
                             "The list of overrides is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_overrides>");

  /* Get the overrides. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_overrides"
                            " sort_field=\"overrides.nvt, overrides.text\"/>"
                            "</commands>",
                            commands ? commands : "")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the overrides. "
                           "The list of overrides is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the overrides. "
                           "The list of overrides is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_overrides>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all overrides, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 *
 * @return Result of XSL transformation.
 */
char *
get_overrides_omp (credentials_t *credentials)
{
  return get_overrides (credentials, NULL);
}

/**
 * @brief Get an override, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  override_id  ID of override.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_override (credentials_t *credentials, const char *override_id,
              const char *commands)
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
                             "An internal error occurred while getting the override. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_override>");

  /* Get the override. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_overrides"
                            " override_id=\"%s\""
                            " details=\"1\"/>"
                            "</commands>",
                            commands ? commands : "",
                            override_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the override. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the override. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_override>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get an override, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  override_id  ID of override.
 *
 * @return Result of XSL transformation.
 */
char *
get_override_omp (credentials_t *credentials, const char *override_id)
{
  return get_override (credentials, override_id, NULL);
}

/**
 * @brief Return the new overrides page.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  oid            OID of NVT associated with override.
 * @param[in]  hosts          Hosts to limit override to, "" for all.
 * @param[in]  port           Port to limit override to, "" for all.
 * @param[in]  threat         Threat to limit override to, "" for all.
 * @param[in]  task_id        ID of task to limit override to, "" for all.
 * @param[in]  task_name      Name of task to limit override to, task_id given.
 * @param[in]  report_id      ID of report.
 * @param[in]  result_id      ID of result to limit note to, "" for all.
 * @param[in]  next           Next page, NULL for get_report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 *
 * @return Result of XSL transformation.
 */
char *
new_override_omp (credentials_t *credentials, const char *oid,
                  const char *hosts, const char *port, const char *threat,
                  const char *task_id, const char *task_name,
                  const char *result_id, const char *next,
                  /* Passthroughs. */
                  const char *report_id, const char *first_result,
                  const char *max_results, const char *sort_field,
                  const char *sort_order, const char *levels,
                  const char *notes, const char *overrides,
                  const char *result_hosts_only, const char *search_phrase,
                  const char *min_cvss_base)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (next == NULL
      && (first_result == NULL || max_results == NULL
          || levels == NULL || notes == NULL || report_id == NULL
          || search_phrase == NULL || sort_field == NULL || sort_order == NULL
          || task_name == NULL || threat == NULL || result_hosts_only == NULL
          || min_cvss_base == NULL))
    {
      GString *xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Get Report"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (hosts == NULL || oid == NULL || port == NULL || result_id == NULL
      || task_id == NULL || overrides == NULL)
    {
      GString *xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Get Report"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
                             "An internal error occurred while creating a new override. "
                             "No new override was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_overrides");
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

  g_string_append_printf (xml,
                          "<new_override>"
                          "<nvt id=\"%s\"/>"
                          "<hosts>%s</hosts>"
                          "<port>%s</port>"
                          "<threat>%s</threat>"
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
                          "<notes>%s</notes>"
                          "<overrides>%s</overrides>"
                          "<result_hosts_only>%s</result_hosts_only>"
                          "<search_phrase>%s</search_phrase>"
                          "<min_cvss_base>%s</min_cvss_base>",
                          oid,
                          hosts,
                          port,
                          threat,
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
                          notes,
                          overrides,
                          result_hosts_only,
                          search_phrase,
                          min_cvss_base);

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
 * @brief Create an override, get report, XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  oid            OID of NVT associated with override.
 * @param[in]  text           Text of override.
 * @param[in]  hosts          Hosts override applied to, "" for all.
 * @param[in]  port           Port override applies to, "" for all.
 * @param[in]  threat         Threat override applies to, "" for all.
 * @param[in]  new_threat     Threat to override the result to.
 * @param[in]  task_id        ID of task to limit override to, "" for all.
 * @param[in]  note_result_id  ID of result to limit override to, "" for all.
 * @param[in]  next           Next page, NULL for get_report.
 * @param[in]  report_id      ID of report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  task_name      Name of task (for get_result).
 * @param[in]  result_task_id  ID of task (for get_result).
 * @param[in]  result_id      ID of result (for get_result).
 *
 * @return Result of XSL transformation.
 */
char *
create_override_omp (credentials_t *credentials, const char *oid,
                     const char *text, const char *hosts, const char *port,
                     const char *threat, const char *new_threat,
                     const char *task_id, const char *note_result_id,
                     const char *next,
                     /* Passthroughs. */
                     const char *report_id,
                     const unsigned int first_result,
                     const unsigned int max_results,
                     const char *sort_field, const char *sort_order,
                     const char *levels, const char *notes,
                     const char *overrides, const char *result_hosts_only,
                     const char *search_phrase, const char *min_cvss_base,
                     const char *task_name, const char *result_task_id,
                     const char *result_id)
{
  gnutls_session_t session;
  GString *xml;
  int socket;
  gchar *html, *create_override;

  if ((next == NULL) && (search_phrase == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new override. "
                         "No new override was created. "
                         "Diagnostics: Search phrase was NULL.",
                         "/omp?cmd=get_overrides");

  if (oid == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new override. "
                         "No new override was created. "
                         "Diagnostics: OID was NULL.",
                         "/omp?cmd=get_overrides");

  if (threat == NULL || port == NULL || hosts == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new override. "
                         "No new override was created. "
                         "Diagnostics: A required parameter was NULL.",
                         "/omp?cmd=get_overrides");

  if ((next == NULL) && (min_cvss_base == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new override. "
                         "No new override was created. "
                         "Diagnostics: A required parameter was NULL.",
                         "/omp?cmd=get_overrides");

  create_override = g_strdup_printf ("<create_override>"
                                     "<nvt oid=\"%s\"/>"
                                     "<hosts>%s</hosts>"
                                     "<port>%s</port>"
                                     "<threat>%s</threat>"
                                     "<new_threat>%s</new_threat>"
                                     "<text>%s</text>"
                                     "<task id=\"%s\"/>"
                                     "<result id=\"%s\"/>"
                                     "</create_override>",
                                     oid,
                                     hosts,
                                     port,
                                     threat,
                                     new_threat,
                                     text,
                                     task_id,
                                     note_result_id);

  if (next && (strcmp (next, "get_result") == 0))
    {
      gchar *first = g_strdup_printf ("%u", first_result);
      gchar *max = g_strdup_printf ("%u", max_results);
      char *ret = get_result_omp (credentials, result_id, result_task_id,
                                  task_name, overrides, create_override,
                                  report_id, first, max, levels, search_phrase,
                                  notes, overrides, min_cvss_base,
                                  result_hosts_only, sort_field, sort_order,
                                  NULL, NULL);
      g_free (create_override);
      g_free (first);
      g_free (max);
      return ret;
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
                             "An internal error occurred while creating a new override. "
                             "No new override was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_overrides");
    }

  xml = g_string_new ("<commands_response>");

  if (text == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Override"));
  else
    {
      int ret;

      /* Create the override. */

      ret = openvas_server_sendf (&session, create_override);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
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
                               "It is unclear whether the override has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_overrides");
        }
    }
  g_free (create_override);

  /* Get the report. */

  if (levels == NULL || strlen (levels) == 0) levels = "hm";

  if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
    result_hosts_only = "1";

  if (notes == NULL || strlen (notes) == 0) notes = "0";

  if (overrides == NULL || strlen (overrides) == 0) overrides = "0";

  if (openvas_server_sendf (&session,
                            "<get_reports"
                            " notes=\"%i\""
                            " notes_details=\"1\""
                            " apply_overrides=\"%i\""
                            " overrides=\"1\""
                            " overrides_details=\"1\""
                            " result_hosts_only=\"%i\""
                            " report_id=\"%s\""
                            " format=\"XML\""
                            " first_result=\"%u\""
                            " max_results=\"%u\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\""
                            " levels=\"%s\""
                            " search_phrase=\"%s\""
                            " min_cvss_base=\"%s\"/>",
                            strcmp (notes, "0") ? 1 : 0,
                            strcmp (overrides, "0") ? 1 : 0,
                            strcmp (result_hosts_only, "0") ? 1 : 0,
                            report_id,
                            first_result,
                            max_results,
                            sort_field ? sort_field : "type",
                            sort_order
                             ? sort_order
                             : ((sort_field == NULL
                                 || strcmp (sort_field, "type") == 0)
                                ? "descending"
                                : "ascending"),
                            levels,
                            search_phrase,
                            min_cvss_base)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report. "
                           "The new override was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report. "
                           "The new override was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (openvas_server_send (&session, "<get_report_formats"
                                     " sort_field=\"name\""
                                     " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
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
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (openvas_server_send (&session, "<get_escalators"
                                     " sort_field=\"name\""
                                     " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
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
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  {

    /* As a temporary hack until there's a reasonable way to do it in the
     * Manager, get the report again with all threat levels, so that the XSL
     * can count per-host grand totals. */

    g_string_append (xml, "<all>");

    if (openvas_server_sendf (&session,
                              "<get_reports"
                              " report_id=\"%s\""
                              " format=\"XML\""
                              " first_result=\"%u\""
                              " max_results=\"%u\""
                              " levels=\"hmlg\""
                              " search_phrase=\"%s\""
                              " search_phrase=\"%s\"/>",
                              report_id,
                              first_result,
                              max_results,
                              search_phrase,
                              min_cvss_base)
        == -1)
      {
        g_string_free (xml, TRUE);
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the report. "
                             "The new override was, however, created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_tasks");
      }

    if (read_string (&session, &xml))
      {
        g_string_free (xml, TRUE);
        openvas_server_close (socket, session);
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the report. "
                             "The new override was, however, created. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_tasks");
      }

    g_string_append (xml, "</all>");
  }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete override, get next page, XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  override_id    ID of override.
 * @param[in]  next           Name of next page.
 * @param[in]  report_id      ID of current report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to apply/include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  oid            OID of NVT (for get_nvts).
 * @param[in]  task_id        ID of task (for get_tasks and get_result).
 * @param[in]  task_name      Name of task (for get_result).
 * @param[in]  result_id      ID of result (for get_result).
 *
 * @return Result of XSL transformation.
 */
char *
delete_override_omp (credentials_t * credentials, const char *override_id,
                     const char *next, const char *report_id,
                     const unsigned int first_result,
                     const unsigned int max_results,
                     const char *sort_field, const char *sort_order,
                     const char *levels, const char *notes,
                     const char *overrides, const char *result_hosts_only,
                     const char *search_phrase, const char *min_cvss_base,
                     const char *oid, const char *task_id,
                     const char *task_name, const char *result_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if ((next == NULL) || (override_id == NULL))
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting an override. "
                         "The override remains intact. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_overrides");

  if (strcmp (next, "get_nvts") == 0)
    {
      gchar *extra;
      char *ret;

      if (oid == NULL)
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while deleting an override. "
                             "The override remains intact. "
                             "Diagnostics: Required parameter was NULL.",
                             "/omp?cmd=get_overrides");

      extra = g_strdup_printf ("<delete_override override_id=\"%s\"/>",
                               override_id);
      ret = get_nvts (credentials, oid, extra);
      g_free (extra);
      return ret;
    }

  if (strcmp (next, "get_overrides") == 0)
    {
      gchar *extra = g_strdup_printf ("<delete_override override_id=\"%s\"/>",
                                      override_id);
      char *ret = get_overrides (credentials, extra);
      g_free (extra);
      return ret;
    }

  if (strcmp (next, "get_tasks") == 0)
    {
      gchar *extra = g_strdup_printf ("<delete_override override_id=\"%s\"/>",
                                      override_id);
      char *ret = get_tasks (credentials, task_id, NULL, NULL, NULL, extra,
                             overrides ? strcmp (overrides, "0") : 0,
                             NULL);
      g_free (extra);
      return ret;
    }

  if (strcmp (next, "get_result") == 0)
    {
      gchar *extra = g_strdup_printf ("<delete_override override_id=\"%s\"/>",
                                      override_id);
      gchar *first = g_strdup_printf ("%u", first_result);
      gchar *max = g_strdup_printf ("%u", max_results);
      char *ret = get_result_omp (credentials, result_id, task_id, task_name,
                                  overrides, extra, report_id, first, max,
                                  levels, search_phrase, notes, overrides,
                                  min_cvss_base, result_hosts_only, sort_field,
                                  sort_order, NULL, NULL);
      g_free (extra);
      g_free (first);
      g_free (max);
      return ret;
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
                             "An internal error occurred while deleting an override. "
                             "The override was not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (strcmp (next, "get_report") == 0)
    {
      if (search_phrase == NULL || min_cvss_base == NULL)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while deleting an override. "
                               "The override remains intact. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_overrides");
        }

      if (levels == NULL || strlen (levels) == 0) levels = "hm";

      if (notes == NULL || strlen (notes) == 0) notes = "0";

      if (overrides == NULL || strlen (overrides) == 0) overrides = "0";

      if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
        result_hosts_only = "1";

      if (openvas_server_sendf (&session,
                                "<commands>"
                                "<delete_override override_id=\"%s\" />"
                                "<get_reports"
                                " notes=\"%i\""
                                " notes_details=\"1\""
                                " apply_overrides=\"%i\""
                                " overrides=\"1\""
                                " overrides_details=\"1\""
                                " result_hosts_only=\"%i\""
                                " report_id=\"%s\""
                                " format=\"XML\""
                                " first_result=\"%u\""
                                " max_results=\"%u\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\""
                                " levels=\"%s\""
                                " search_phrase=\"%s\""
                                " min_cvss_base=\"%s\"/>"
                                "<get_report_formats"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "<get_escalators"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "</commands>",
                                override_id,
                                strcmp (notes, "0") ? 1 : 0,
                                strcmp (overrides, "0") ? 1 : 0,
                                strcmp (result_hosts_only, "0") ? 1 : 0,
                                report_id,
                                first_result,
                                max_results,
                                sort_field ? sort_field : "type",
                                sort_order
                                 ? sort_order
                                 : ((sort_field == NULL
                                     || strcmp (sort_field, "type") == 0)
                                    ? "descending"
                                    : "ascending"),
                                levels,
                                search_phrase,
                                min_cvss_base)
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while deleting an override. "
                               "It is unclear whether the override has been deleted or not. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }
    }
  else
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an override. "
                           "The override remains intact. "
                           "Diagnostics: Error in parameter next.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an override. "
                           "It is unclear whether the override has been deleted or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Edit override, get next page, XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  override_id    ID of override.
 * @param[in]  next           Name of next page.
 * @param[in]  report_id      ID of current report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  overrides      Whether to include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  oid            OID of NVT (for get_nvts).
 * @param[in]  task_id        ID of task (for get_tasks).
 * @param[in]  task_name      Name of task (for get_result).
 * @param[in]  result_id      ID of result (for get_result).
 *
 * @return Result of XSL transformation.
 */
char *
edit_override_omp (credentials_t * credentials, const char *override_id,
                   /* Next page params. */
                   const char *next, const char *report_id,
                   const unsigned int first_result,
                   const unsigned int max_results,
                   const char *sort_field, const char *sort_order,
                   const char *levels, const char *notes, const char *overrides,
                   const char *result_hosts_only, const char *search_phrase,
                   const char *min_cvss_base, const char *oid,
                   const char *task_id, const char *task_name,
                   const char *result_id)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (override_id == NULL || min_cvss_base == NULL)
    {
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing an override. "
                           "The override remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           "/omp?cmd=get_overrides");
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

  g_string_append_printf (xml,
                          "<edit_override>"
                          /* Page that follows. */
                          "<next>%s</next>"
                          /* Parameters for get_report. */
                          "<report id=\"%s\"/>"
                          "<first_result>%i</first_result>"
                          "<max_results>%i</max_results>"
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>"
                          "<levels>%s</levels>"
                          "<notes>%s</notes>"
                          "<overrides>%s</overrides>"
                          "<result_hosts_only>%s</result_hosts_only>"
                          "<search_phrase>%s</search_phrase>"
                          "<min_cvss_base>%s</min_cvss_base>"
                          /* Parameters for get_nvts. */
                          "<nvt id=\"%s\"/>"
                          /* Parameters for get_result. */
                          "<result id=\"%s\"/>"
                          /* Parameters for get_tasks. */
                          "<task id=\"%s\"><name>%s</name></task>",
                          next,
                          report_id,
                          first_result,
                          max_results,
                          sort_field,
                          sort_order,
                          levels,
                          notes,
                          overrides,
                          result_hosts_only,
                          search_phrase,
                          min_cvss_base,
                          oid,
                          result_id,
                          task_id,
                          task_name ? task_name : "");

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
 * @brief Save override, get next page, XSL transform the result.
 *
 * @param[in]  credentials     Username and password for authentication.
 * @param[in]  override_id     ID of override.
 * @param[in]  text            Text of override.
 * @param[in]  hosts           Hosts override applied to, "" for all.
 * @param[in]  port            Port override applies to, "" for all.
 * @param[in]  threat          Threat override applies to, "" for all.
 * @param[in]  new_threat      Threat to override result to.
 * @param[in]  override_task_id    ID of task to limit override to, "" for all.
 * @param[in]  override_result_id  ID of result to limit override to, "" for all.
 * @param[in]  next            Name of next page.
 * @param[in]  report_id       ID of current report.
 * @param[in]  first_result    Number of first result in report.
 * @param[in]  max_results     Number of results in report.
 * @param[in]  sort_field      Field to sort on, or NULL.
 * @param[in]  sort_order      "ascending", "descending", or NULL.
 * @param[in]  levels          Threat levels to include in report.
 * @param[in]  notes           Whether to include notes.
 * @param[in]  overrides       Whether to apply/include overrides.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase   Phrase which included results must contain.
 * @param[in]  min_cvss_base   Minimum CVSS included results may have.
 *                             "-1" for all, including results with NULL CVSS.
 * @param[in]  oid             OID of NVT (for get_nvts).
 * @param[in]  task_id         ID of task (for get_tasks).
 * @param[in]  task_name       Name of task (for get_result).
 * @param[in]  result_id       ID of result (for get_result).
 *
 * @return Result of XSL transformation.
 */
char *
save_override_omp (credentials_t * credentials, const char *override_id,
                   const char *text, const char *hosts, const char *port,
                   const char *threat, const char *new_threat,
                   const char *override_task_id,
                   const char *override_result_id, const char *next,
                   const char *report_id,
                   const unsigned int first_result,
                   const unsigned int max_results,
                   const char *sort_field, const char *sort_order,
                   const char *levels, const char *notes, const char *overrides,
                   const char *result_hosts_only, const char *search_phrase,
                   const char *min_cvss_base, const char *oid,
                   const char *task_id, const char *task_name,
                   const char *result_id)
{
  entity_t entity;
  char *response = NULL;
  gnutls_session_t session;
  int socket;
  gchar *modify_override;
  gchar *html;

  if (next == NULL || override_task_id == NULL || override_result_id == NULL
      || new_threat == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving an override. "
                         "The override remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_overrides");

  modify_override = g_strdup_printf ("<modify_override override_id=\"%s\">"
                                     "<hosts>%s</hosts>"
                                     "<port>%s</port>"
                                     "<threat>%s</threat>"
                                     "<new_threat>%s</new_threat>"
                                     "<text>%s</text>"
                                     "<task id=\"%s\"/>"
                                     "<result id=\"%s\"/>"
                                     "</modify_override>",
                                     override_id,
                                     hosts ? hosts : "",
                                     port ? port : "",
                                     threat ? threat : "",
                                     new_threat,
                                     text ? text : "",
                                     override_task_id,
                                     override_result_id);

  if (strcmp (next, "get_nvts") == 0)
    {
      char *ret;

      if (oid == NULL)
        {
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving an override. "
                               "The override remains the same. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_overrides");
        }

      ret = get_nvts (credentials, oid, modify_override);
      g_free (modify_override);
      return ret;
    }

  if (strcmp (next, "get_override") == 0)
    {
      char *ret = get_override (credentials, override_id, modify_override);
      g_free (modify_override);
      return ret;
    }

  if (strcmp (next, "get_overrides") == 0)
    {
      char *ret = get_overrides (credentials, modify_override);
      g_free (modify_override);
      return ret;
    }

  if (strcmp (next, "get_result") == 0)
    {
      gchar *first = g_strdup_printf ("%u", first_result);
      gchar *max = g_strdup_printf ("%u", max_results);
      char *ret = get_result_omp (credentials, result_id, task_id, task_name,
                                  overrides, modify_override, report_id,
                                  first, max, levels, search_phrase, notes,
                                  overrides, min_cvss_base, result_hosts_only,
                                  sort_field, sort_order, NULL, NULL);
      g_free (modify_override);
      g_free (first);
      g_free (max);
      return ret;
    }

  if (strcmp (next, "get_tasks") == 0)
    {
      char *ret = get_tasks (credentials, task_id, NULL, NULL, NULL,
                             modify_override,
                             overrides ? strcmp (overrides, "0") : 0,
                             NULL);
      g_free (modify_override);
      return ret;
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
                             "An internal error occurred while saving an override. "
                             "The override was not saved. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  if (strcmp (next, "get_report") == 0)
    {
      if (search_phrase == NULL || min_cvss_base == NULL)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving an override. "
                               "The override remains the same. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_overrides");
        }

      if (levels == NULL || strlen (levels) == 0) levels = "hm";

      if (notes == NULL || strlen (notes) == 0) notes = "0";

      if (overrides == NULL || strlen (overrides) == 0) overrides = "0";

      if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
        result_hosts_only = "1";

      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_reports"
                                " notes=\"%i\""
                                " notes_details=\"1\""
                                " apply_overrides=\"%i\""
                                " overrides=\"1\""
                                " overrides_details=\"1\""
                                " result_hosts_only=\"%i\""
                                " report_id=\"%s\""
                                " format=\"XML\""
                                " first_result=\"%u\""
                                " max_results=\"%u\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\""
                                " levels=\"%s\""
                                " search_phrase=\"%s\""
                                " min_cvss_base=\"%s\"/>"
                                "<get_report_formats"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "<get_escalators"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "</commands>",
                                modify_override,
                                strcmp (notes, "0") ? 1 : 0,
                                strcmp (overrides, "0") ? 1 : 0,
                                strcmp (result_hosts_only, "0") ? 1 : 0,
                                report_id,
                                first_result,
                                max_results,
                                sort_field ? sort_field : "type",
                                sort_order
                                 ? sort_order
                                 : ((sort_field == NULL
                                     || strcmp (sort_field, "type") == 0)
                                    ? "descending"
                                    : "ascending"),
                                levels,
                                search_phrase,
                                min_cvss_base)
          == -1)
        {
          g_free (modify_override);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving an override. "
                               "It is unclear whether the override has been saved or not. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_tasks");
        }
      g_free (modify_override);
    }
  else
    {
      g_free (modify_override);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving an override. "
                           "The override remains the same. "
                           "Diagnostics: Error in parameter next.",
                           "/omp?cmd=get_tasks");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &response))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving an override. "
                           "It is unclear whether the override has been saved or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, response);
}

/**
 * @brief Create a slave, get all slaves, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         Name of new slave.
 * @param[in]  comment      Comment on slave.
 * @param[in]  host         Host associated with slave.
 * @param[in]  port         Port on host.
 * @param[in]  login        Login for host.
 * @param[in]  password     Password for login.
 *
 * @return Result of XSL transformation.
 */
char *
create_slave_omp (credentials_t *credentials, const char *name,
                  const char *comment, const char *host, const char *port,
                  const char *login, const char* password)
{
  gnutls_session_t session;
  GString *xml;
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
                             "An internal error occurred while creating a new slave. "
                             "No new slave was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_slaves");
    }

  xml = g_string_new ("<get_slaves>");

  if (name == NULL || comment == NULL || host == NULL || port == NULL
      || login == NULL || password == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Slave"));
  else
    {
      int ret;

      /* Create the slave. */

      if (comment)
        ret = openvas_server_sendf_xml (&session,
                                        "<create_slave>"
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
        ret = openvas_server_sendf_xml (&session,
                                        "<create_slave>"
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


      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new slave. "
                               "No new slave was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_slaves");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new slave. "
                               "It is unclear whether the slave has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_slaves");
        }
    }

  /* Get all the slaves. */

  if (openvas_server_send (&session,
                           "<get_slaves"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new slave. "
                           "A new slave was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new slave. "
                           "A new slave was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_slaves>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *slave_id;

  slave_id = params_value (params, "slave_id");

  if (slave_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a slave. "
                         "The slave was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_slaves");

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
                             "An internal error occurred while deleting a slave. "
                             "The slave is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_slaves");
    }

  xml = g_string_new ("<get_slaves>");

  /* Delete the slave and get all slaves. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_slave slave_id=\"%s\"/>"
                            "<get_slaves"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            slave_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a slave. "
                           "The slave is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a slave. "
                           "It is unclear whether the slave has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_slaves>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get one slave, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  slave_id     UUID of slave.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_slave_omp (credentials_t * credentials, const char * slave_id,
               const char * sort_field, const char * sort_order)
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
                             "An internal error occurred while getting slaves list. "
                             "The current list of slaves is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_slaves");
    }

  xml = g_string_new ("<get_slave>");

  /* Get the slave. */

  if (openvas_server_sendf (&session,
                            "<get_slaves"
                            " slave_id=\"%s\""
                            " tasks=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            slave_id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting slaves list. "
                           "The current list of slaves is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting slaves list. "
                           "The current list of slaves is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_slave>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all slaves, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_slaves_omp (credentials_t * credentials, const char * sort_field,
                 const char * sort_order)
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
                             "An internal error occurred while getting slaves list. "
                             "The current list of slaves is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_slaves");
    }

  xml = g_string_new ("<get_slaves>");

  /* Get the slaves. */

  if (openvas_server_sendf (&session,
                            "<get_slaves"
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting slaves list. "
                           "The current list of slaves is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting slaves list. "
                           "The current list of slaves is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_slaves>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get one schedule, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  schedule_id  UUID of schedule.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_schedule_omp (credentials_t * credentials, const char * schedule_id,
                  const char * sort_field, const char * sort_order)
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
                             "An internal error occurred while getting a schedule. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_schedules");
    }

  xml = g_string_new ("<get_schedule>");

  /* Get the schedule. */

  if (openvas_server_sendf (&session,
                            "<get_schedules"
                            " details=\"1\""
                            " schedule_id=\"%s\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            schedule_id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a schedule. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a schedule. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_schedule>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all schedules, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_schedules_omp (credentials_t * credentials, const char * sort_field,
                   const char * sort_order)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  time_t now;
  struct tm *now_broken;
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
                             "An internal error occurred while getting the schedule list. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<get_schedules>");

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

  /* Get the schedules. */

  if (openvas_server_sendf (&session,
                            "<get_schedules"
                            " details=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the schedule list. "
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
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_schedules>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create a schedule, get all schedules, XSL transform the result.
 *
 * @param[in]   credentials    Username and password for authentication.
 * @param[in]   name           Name of new schedule.
 * @param[in]   comment        Comment on schedule.
 * @param[in]   hour           First time hour (0 to 23).
 * @param[in]   minute         First time minute (0 to 59).
 * @param[in]   day_of_month   First time day of month (1 to 31).
 * @param[in]   month          First time month (1 to 12).
 * @param[in]   year           First time year.
 * @param[in]   period         How often the action will run.  0 for once.  0 if
 *                             "".
 * @param[in]   period_unit    The unit of period.  "second" if "".
 * @param[in]   duration       How long the action will run for.  0 for entire
 *                             duration of action.  0 if "".
 * @param[in]   duration_unit  The unit of duration.  "second" if "".
 *
 * @return Result of XSL transformation.
 */
char *
create_schedule_omp (credentials_t * credentials, const char *name,
                     const char *comment, const char *hour, const char *minute,
                     const char *day_of_month, const char *month,
                     const char *year,
                     const char *period, const char *period_unit,
                     const char *duration, const char *duration_unit)
{
  gnutls_session_t session;
  GString *xml;
  int socket;
  time_t now;
  struct tm *now_broken;
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
                             "An internal error occurred while creating a new schedule. "
                             "No new schedule was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_schedules");
    }

  xml = g_string_new ("<get_schedules>");

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

  if (name == NULL || hour == NULL || minute == NULL || day_of_month == NULL
      || duration == NULL || duration_unit == NULL || month == NULL || period == NULL
      || period_unit == NULL || year == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Schedule"));
  else
    {
      int ret;

      /* Create the schedule. */

      ret = openvas_server_sendf (&session,
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
                                  duration);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new schedule. "
                               "No new schedule was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_schedules");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new schedule. "
                               "It is unclear whether the schedule has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_schedules");
        }
    }

  /* Get all the schedules. */

  if (openvas_server_send (&session,
                           "<get_schedules"
                           " details=\"1\""
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new schedule. "
                           "A new schedule was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new schedule. "
                           "A new schedule was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_schedules>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
  GString *xml;
  gnutls_session_t session;
  int socket;
  time_t now;
  struct tm *now_broken;
  gchar *html;
  const char *schedule;

  schedule = params_value (params, "schedule_id");

  if (schedule == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a schedule. "
                         "The schedule was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_schedules");

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
                             "An internal error occurred while deleting a schedule. "
                             "The schedule was not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_schedules");
    }

  xml = g_string_new ("<get_schedules>");

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

  /* Delete the schedule and get all schedules. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_schedule schedule_id=\"%s\"/>"
                            "<get_schedules"
                            " details=\"1\""
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            schedule)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a schedule. "
                           "The schedule was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a schedule. "
                           "It is unclear whether the schedule has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_schedules>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all system reports, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  duration     Duration of reports, in seconds.
 * @param[in]  slave_id     ID of slave.
 *
 * @return Result of XSL transformation.
 */
char *
get_system_reports_omp (credentials_t * credentials, const char * duration,
                        const char * slave_id)
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
 * @param[out]  content_disposition  Content dispositions return.
 * @param[out]  content_length       Content length return.
 *
 * @return Image, or NULL.
 */
char *
get_system_report_omp (credentials_t *credentials, const char *url,
                       const char *duration, const char *slave_id,
                       enum content_type *content_type,
                       char **content_disposition, gsize *content_length)
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
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  report_format_id  UUID of report format.
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 * @param[in]  commands          Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_report_format (credentials_t * credentials,
                   const char * report_format_id, const char * sort_field,
                   const char * sort_order, const char * commands)
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
                             "An internal error occurred while getting the report formats. "
                             "The current list of report formats is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  xml = g_string_new ("<get_report_format>");

  /* Get the report format. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_report_formats"
                            " report_format_id=\"%s\""
                            " params=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>"
                            "</commands>",
                            commands ? commands : "",
                            report_format_id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report formats. "
                           "The current list of report_formats is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report formats. "
                           "The current list of report_formats is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_report_format>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get one report format, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  report_format_id  UUID of report_format.
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_report_format_omp (credentials_t * credentials,
                       const char * report_format_id, const char * sort_field,
                       const char * sort_order)
{
  return get_report_format (credentials, report_format_id, sort_field,
                            sort_order, NULL);
}

/**
 * @brief Get all report formats, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_report_formats (credentials_t * credentials, const char * sort_field,
                    const char * sort_order, const char * commands)
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
                             "An internal error occurred while getting the report formats. "
                             "The current list of report formats is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  xml = g_string_new ("<get_report_formats>");

  /* Get the report formats. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_report_formats"
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>"
                            "</commands>",
                            commands ? commands : "",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report formats. "
                           "The current list of report formats is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report formatss. "
                           "The current list of report formats is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_report_formats>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all report formats, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_report_formats_omp (credentials_t * credentials, const char * sort_field,
                        const char * sort_order)
{
  return get_report_formats (credentials, sort_field, sort_order, NULL);
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
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *report_format_id;

  report_format_id = params_value (params, "report_format_id");

  if (report_format_id == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a report format. "
                         "The report format was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_report_formats");

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
                             "An internal error occurred while deleting a report format. "
                             "The report_format is not deleted. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_report_format report_format_id=\"%s\" />"
                            "<get_report_formats"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            report_format_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a report format. "
                           "The report_format is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  xml = g_string_new ("<get_report_formats>");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a report format. "
                           "It is unclear whether the report format has been deleted or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  g_string_append (xml, "</get_report_formats>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup edit_report_format XML, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  report_format_id  UUID of report_format.
 * @param[in]  extra_xml         Extra XML to insert inside page element.
 * @param[in]  next              Name of next page.
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
static char *
edit_report_format (credentials_t * credentials, const char *report_format_id,
                    const char *extra_xml, const char *next,
                    const char *sort_field, const char *sort_order)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (report_format_id == NULL || next == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a report format. "
                         "The report format remains as it was. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_report_formats");

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
                             "An internal error occurred while editing a report format. "
                             "The report format remains as it was. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_report_formats"
                            " report_format_id=\"%s\""
                            " params=\"1\""
                            " details=\"1\" />"
                            "</commands>",
                            report_format_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting report format info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  xml = g_string_new ("");

  if (extra_xml)
    g_string_append (xml, extra_xml);

  g_string_append_printf (xml,
                          "<edit_report_format>"
                          "<report_format id=\"%s\"/>"
                          /* Page that follows. */
                          "<next>%s</next>"
                          /* Passthroughs. */
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>",
                          report_format_id,
                          next,
                          sort_field,
                          sort_order);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting report format info. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</edit_report_format>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup edit_report_format XML, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  report_format_id  UUID of report_format.
 * @param[in]  next              Name of next page.
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
edit_report_format_omp (credentials_t * credentials,
                        const char *report_format_id, const char *next,
                        /* Parameters for get_report_formats. */
                        const char *sort_field, const char *sort_order)
{
  return edit_report_format (credentials, report_format_id, NULL, next,
                             sort_field, sort_order);
}

/**
 * @brief Import report format, get all report formats, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  xml_file     Report format XML for new report format.
 *
 * @return Result of XSL transformation.
 */
char *
import_report_format_omp (credentials_t * credentials, char *xml_file)
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
                             "An internal error occurred while importing a report format. "
                             "No new report format was created. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  xml = g_string_new ("<get_report_formats>");

  /* Create the report format. */

  if (openvas_server_sendf (&session,
                            "<create_report_format>"
                            "%s"
                            "</create_report_format>",
                            xml_file)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a report format. "
                           "No new report format was created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a report format. "
                           "It is unclear whether the report format has been created or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  /* Get all the report formats. */

  if (openvas_server_send (&session,
                           "<get_report_formats"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a report format. "
                           "The new report format was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a report format. "
                           "The new report format was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_report_formats>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
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
  params_t *preferences;
  gchar *modify_format;
  int socket;
  gnutls_session_t session;
  gchar *html;

  if (params_value (params, "comment") == NULL
      || params_value (params, "name") == NULL)
    return edit_report_format (credentials,
                               params_value (params, "report_format_id"),
                               GSAD_MESSAGE_INVALID_PARAM
                                ("Save Report Format"),
                               params_value (params, "next"),
                               params_value (params, "sort_field"),
                               params_value (params, "sort_order"));

  if (params_value (params, "next") == NULL
      || params_value (params, "sort_field") == NULL
      || params_value (params, "sort_order") == NULL
      || params_value (params, "report_format_id") == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a report format. "
                         "The report format remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_report_formats");

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
                             "An internal error occurred while saving a report format. "
                             "The report format remains the same. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  preferences = params_values (params, "preference:");
  if (preferences)
    {
      param_t *param;
      gchar *param_name;
      params_iterator_t iter;
      const char *report_format_id;

      report_format_id = params_value (params, "report_format_id");

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
              char *check_ret;

              value = param->value_size
                      ? g_base64_encode ((guchar *) param->value,
                                         param->value_size)
                      : g_strdup ("");

              if (openvas_server_sendf (&session,
                                        "<modify_report_format"
                                        " report_format_id=\"%s\">"
                                        "<param>"
                                        "<name>%s</name>"
                                        "<value>%s</value>"
                                        "</param>"
                                        "</modify_report_format>",
                                        report_format_id,
                                        param_name + type_end + 2,
                                        value)
                  == -1)
                {
                  g_free (value);
                  openvas_server_close (socket, session);
                  return gsad_message (credentials,
                                       "Internal error", __FUNCTION__, __LINE__,
                                       "An internal error occurred while saving a report format. "
                                       "It is unclear whether the entire report format has been saved. "
                                       "Diagnostics: Failure to send command to manager daemon.",
                                       "/omp?cmd=get_report_formats");
                }
              g_free (value);

              check_ret = check_modify_report_format (credentials, &session,
                                                      __FUNCTION__, __LINE__);
              if (check_ret)
                {
                  openvas_server_close (socket, session);
                  return check_ret;
                }
            }
         }
    }
  openvas_server_close (socket, session);

  modify_format = g_strdup_printf ("<modify_report_format"
                                   " report_format_id=\"%s\">"
                                   "<name>%s</name>"
                                   "<summary>%s</summary>"
                                   "<active>%s</active>"
                                   "</modify_report_format>",
                                   params_value (params, "report_format_id"),
                                   params_value (params, "name"),
                                   params_value (params, "comment"),
                                   params_value (params, "enable"));

  if (strcmp (params_value (params, "next"), "get_report_formats") == 0)
    {
      char *ret = get_report_formats (credentials,
                                      params_value (params, "sort_field"),
                                      params_value (params, "sort_order"),
                                      modify_format);
      g_free (modify_format);
      return ret;
    }

  if (strcmp (params_value (params, "next"), "get_report_format") == 0)
    {
      char *ret = get_report_format (credentials,
                                     params_value (params, "report_format_id"),
                                     params_value (params, "sort_field"),
                                     params_value (params, "sort_order"),
                                     modify_format);
      g_free (modify_format);
      return ret;
    }

  g_free (modify_format);
  return gsad_message (credentials,
                       "Internal error", __FUNCTION__, __LINE__,
                       "An internal error occurred while saving a report format. "
                       "It is unclear whether the entire report format has been saved. "
                       "Diagnostics: Error in parameter next.",
                       "/omp?cmd=get_report_formats");
}

/**
 * @brief Verify report format, get report formats, XSL transform the result.
 *
 * @param[in]  credentials       Username and password for authentication.
 * @param[in]  report_format_id  ID of report format.
 *
 * @return Result of XSL transformation.
 */
char *
verify_report_format_omp (credentials_t * credentials,
                          const char *report_format_id)
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
                             "An internal error occurred while verifying a report format. "
                             "The report_format is not verified. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_report_formats");
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<verify_report_format report_format_id=\"%s\" />"
                            "<get_report_formats"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            report_format_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while verifying a report format. "
                           "The report_format is not verified. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  xml = g_string_new ("<get_report_formats>");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while verifying a report format. "
                           "It is unclear whether the report format has been verified or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_report_formats");
    }

  g_string_append (xml, "</get_report_formats>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Setup trash page XML, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  extra_xml    Extra XML to insert inside page element.
 *
 * @return Result of XSL transformation.
 */
char *
get_trash (credentials_t * credentials, const char * sort_field,
           const char * sort_order, const char *extra_xml)
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

  /* Get the agents. */

  if (openvas_server_sendf (&session,
                            "<get_agents"
                            " trash=\"1\""
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting agent list. "
                           "The current list of agents is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting agent list. "
                           "The current list of agents is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Get the configs. */

  if (openvas_server_sendf (&session,
                            "<get_configs"
                            " trash=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting configs list. "
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
                           "An internal error occurred while getting configs list. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Get the credentials. */

  if (openvas_server_sendf (&session,
                            "<get_lsc_credentials"
                            " trash=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting credentials list. "
                           "The current list of credentials is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting credentials list. "
                           "The current list of credentials is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Get the escalators. */

  if (openvas_server_sendf (&session,
                            "<get_escalators"
                            " trash=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting escalators list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting escalators list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  /* Get the report formats. */

  if (openvas_server_sendf (&session,
                            "<get_report_formats"
                            " trash=\"1\""
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting report format list. "
                           "The current list of report formats is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting report format list. "
                           "The current list of report formats is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Get the schedules. */

  if (openvas_server_sendf (&session,
                            "<get_schedules"
                            " details=\"1\""
                            " trash=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting schedules list. "
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
                           "An internal error occurred while getting schedules list. "
                           "The current list of schedules is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  /* Get the slaves. */

  if (openvas_server_sendf (&session,
                            "<get_slaves"
                            " trash=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting slaves list. "
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
                           "An internal error occurred while getting slaves list. "
                           "The current list of slaves is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_slaves");
    }

  /* Get the targets. */

  if (openvas_server_sendf (&session,
                            "<get_targets"
                            " trash=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
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
                           "/omp?cmd=get_targets");
    }

  /* Get the tasks. */

  if (openvas_server_sendf (&session,
                            "<get_tasks"
                            " trash=\"1\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tasks list. "
                           "The current list of tasks is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting tasks list. "
                           "The current list of tasks is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_trash>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all trash, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_trash_omp (credentials_t * credentials, const char * sort_field,
               const char * sort_order)
{
  return get_trash (credentials, sort_field, sort_order, NULL);
}


/* Manager communication. */

/**
 * @brief Check authentication credentials.
 *
 * @param[in]  username  Username.
 * @param[in]  password  Password.
 *
 * @return 0 if valid, 1 failed, 2 manager down.
 */
int
authenticate_omp (const gchar * username, const gchar * password)
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

  auth = omp_authenticate (&session, username, password);
  if (auth == 0)
    {
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
      char ctime_now[27];
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
