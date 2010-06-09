/* Greenbone Security Assistant
 * $Id$
 * Description: OMP communication module.
 *
 * Authors:
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

#include <openvas/openvas_server.h>
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

int manager_connect (credentials_t *, int *, gnutls_session_t *);

static char *get_status (credentials_t *, const char *, const char *,
                         const char *, const char *, const char *);


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
  char *html;

  now = time (NULL);
  res = g_strdup_printf ("<envelope>"
                         "<time>%s</time>"
                         "<login>%s</login>"
                         "%s"
                         "</envelope>",
                         ctime (&now),
                         credentials->username,
                         xml);
  html = xsl_transform (res);

  g_free (res);
  g_free (xml);
  return html;
}

/**
 * @brief Test whether a string equal to a given string exists in an array.
 *
 * @param[in]  array   Array of gchar* pointers.
 * @param[in]  string  String.
 *
 * @return 1 if a string equal to \arg string exists in \arg array, else 0.
 */
static int
member (GArray *array, const char *string)
{
  const gchar *item;
  int index = 0;
  while ((item = g_array_index (array, gchar*, index++)))
    if (strcmp (item, string) == 0) return 1;
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
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
 *
 * @return Result of XSL transformation.
 */
char *
gsad_newtask (credentials_t * credentials, const char* message)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting targets list. "
                         "The current list of targets is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  xml = g_string_new ("<gsad_newtask>");

  /* Get list of targets. */
  if (openvas_server_send (&session,
                           "<get_targets"
                           " sort_field=\"name\""
                           " sort_order=\"ascending\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config list. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting config list. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting escalator list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting escalator list. "
                           "The current list of escalators is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the schedule list. "
                           "The current list of schedules is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the schedule list. "
                           "The current list of schedules is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (message)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Task"));
  g_string_append_printf (xml,
                          "<user>%s</user></gsad_newtask>",
                          credentials->username);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Create a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  name          New task name.
 * @param[in]  comment       Comment on task.
 * @param[in]  target_id     Target for task.
 * @param[in]  scanconfig    Config for task.
 * @param[in]  escalator_id  Escalator for task.
 * @param[in]  schedule_id   UUID of schedule for task.
 *
 * @return Result of XSL transformation.
 */
char *
create_task_omp (credentials_t * credentials, char *name, char *comment,
                 char *target_id, char *config_id, const char *escalator_id,
                 const char *schedule_id)
{
  entity_t entity;
  gnutls_session_t session;
  char *text = NULL;
  int socket, ret;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new task. "
                         "The task is not created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (strcmp (escalator_id, "--") == 0)
    ret = openvas_server_sendf (&session,
                                "<commands>"
                                "<create_task>"
                                "<config id=\"%s\"/>"
                                "<schedule id=\"%s\"/>"
                                "<target id=\"%s\"/>"
                                "<name>%s</name>"
                                "<comment>%s</comment>"
                                "</create_task>"
                                "<get_status"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "</commands>",
                                config_id,
                                strcmp (schedule_id, "--") ? schedule_id : "",
                                target_id,
                                name,
                                comment);
  else
    ret = openvas_server_sendf (&session,
                                "<commands>"
                                "<create_task>"
                                "<config id=\"%s\"/>"
                                "<escalator id=\"%s\"/>"
                                "<schedule id=\"%s\"/>"
                                "<target id=\"%s/>"
                                "<name>%s</name>"
                                "<comment>%s</comment>"
                                "</create_task>"
                                "<get_status"
                                " sort_field=\"name\""
                                " sort_order=\"ascending\"/>"
                                "</commands>",
                                config_id,
                                escalator_id,
                                strcmp (schedule_id, "--") ? schedule_id : "",
                                target_id,
                                name,
                                comment);

  if (ret == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new task. "
                           "The task is not created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new task. "
                           "It is unclear whether the task has been created or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_status");
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
 *
 * @return Result of XSL transformation.
 */
char *
delete_task_omp (credentials_t * credentials, const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a new task. "
                         "The task is not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_task task_id=\"%s\" />"
                            "<get_status"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a new task. "
                           "The task is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a new task. "
                           "It is unclear whether the task has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
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
 *
 * @return Result of XSL transformation.
 */
char *
edit_task (credentials_t * credentials, const char *task_id,
           const char *extra_xml, const char *next,
           /* Parameters for get_status. */
           const char *refresh_interval, const char *sort_field,
           const char *sort_order)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (task_id == NULL || next == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a task. "
                         "The task remains as it was. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_tasks");

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a task. "
                         "The task remains as it was. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_tasks");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_status task_id=\"%s\" />"
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
                            "</commands>",
                            task_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting task info. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
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
                          "<sort_order>%s</sort_order>",
                          task_id,
                          credentials->username,
                          next,
                          refresh_interval ? refresh_interval : "",
                          sort_field,
                          sort_order);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 *
 * @return Result of XSL transformation.
 */
char *
edit_task_omp (credentials_t * credentials, const char *task_id,
               const char *next,
               /* Parameters for get_status. */
               const char *refresh_interval, const char *sort_field,
               const char *sort_order)
{
  return edit_task (credentials, task_id, NULL, next, refresh_interval,
                    sort_field, sort_order);
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
 * @param[in]  next              Name of next page.
 * @param[in]  refresh_interval  Refresh interval (parsed to int).
 * @param[in]  sort_field        Field to sort on, or NULL.
 * @param[in]  sort_order        "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
save_task_omp (credentials_t * credentials, const char *task_id,
               const char *name, const char *comment, const char *escalator_id,
               const char *schedule_id, const char *next,
               /* Parameters for get_status. */
               const char *refresh_interval, const char *sort_field,
               const char *sort_order)
{
  gchar *modify_task;

  if (comment == NULL || name == NULL)
    return edit_task (credentials, task_id,
                      GSAD_MESSAGE_INVALID_PARAM ("Save Task"), next,
                      refresh_interval, sort_field, sort_order);

  if (escalator_id == NULL || schedule_id == NULL || next == NULL
      || sort_field == NULL || sort_order == NULL || task_id == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a task. "
                         "The task remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_status");

  modify_task = g_strdup_printf ("<modify_task task_id=\"%s\">"
                                 "<name>%s</name>"
                                 "<comment>%s</comment>"
                                 "<escalator id=\"%s\"/>"
                                 "<schedule id=\"%s\"/>"
                                 "</modify_task>",
                                 task_id,
                                 name,
                                 comment,
                                 escalator_id,
                                 schedule_id);

  if (strcmp (next, "get_status") == 0)
    {
      char *ret = get_status (credentials, NULL, sort_field, sort_order,
                              refresh_interval, modify_task);
      g_free (modify_task);
      return ret;
    }

  g_free (modify_task);
  return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                       "An internal error occurred while saving a task. "
                       "The task remains the same. "
                       "Diagnostics: Error in parameter next.",
                       "/omp?cmd=get_status");
}

/**
 * @brief Abort a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 *
 * @return Result of XSL transformation.
 */
char *
abort_task_omp (credentials_t * credentials, const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while aborting a task. "
                         "The task is not aborted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<abort_task task_id=\"%s\" />"
                            "<get_status"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while aborting a task. "
                           "The task is not aborted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while aborting a task. "
                           "It is unclear whether the task has been aborted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Pause a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 *
 * @return Result of XSL transformation.
 */
char *
pause_task_omp (credentials_t * credentials, const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while pausing a task. "
                         "The task was not paused. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<pause_task task_id=\"%s\" />"
                            "<get_status"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while pausing a task. "
                           "The task was not paused. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while pausing a task. "
                           "It is unclear whether the task has been paused or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Resume a paused task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 *
 * @return Result of XSL transformation.
 */
char *
resume_paused_task_omp (credentials_t * credentials, const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while resuming a paused task. "
                         "The task was not resumed. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<resume_paused_task task_id=\"%s\" />"
                            "<get_status"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while resuming a paused task. "
                           "The task was not resumed. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while resuming a paused task. "
                           "It is unclear whether the task has been resumed or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Resume a stopped task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 *
 * @return Result of XSL transformation.
 */
char *
resume_stopped_task_omp (credentials_t * credentials, const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while resuming a stopped task. "
                         "The task was not resumed. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<resume_stopped_task task_id=\"%s\" />"
                            "<get_status"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while resuming a stopped task. "
                           "The task was not resumed. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while resuming a stopped task. "
                           "It is unclear whether the task has been resumed or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Start a task, get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 *
 * @return Result of XSL transformation.
 */
char *
start_task_omp (credentials_t * credentials, const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while starting a task. "
                         "The task is not started. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<start_task task_id=\"%s\" />"
                            "<get_status"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            task_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while starting a task. "
                           "The task is not started. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while starting a task. "
                           "It is unclear whether the task has been started or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
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
get_nvt_details (credentials_t *credentials, const char *oid,
                 const char *commands)
{
  GString *xml = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting nvt details. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "%s"
                            "<get_nvt_details oid=\"%s\" />"
                            "<get_notes sort_field=\"notes.text\">"
                            "<nvt id=\"%s\"/>"
                            "</get_notes>"
                            "</commands>",
                            commands ? commands : "",
                            oid,
                            oid)
        == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting nvt details. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_status");
    }

  xml = g_string_new ("<get_nvt_details>");
  if (read_string (&session, &xml))
    {
      openvas_server_close (socket, session);
      g_string_free (xml, TRUE);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting nvt details. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  g_string_append (xml, "</get_nvt_details>");

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
get_nvt_details_omp (credentials_t *credentials, const char *oid)
{
  return get_nvt_details (credentials, oid, NULL);
}

/**
 * @brief Get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  refresh_interval Refresh interval (parsed to int).
 * @param[in]  command      Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_status (credentials_t * credentials, const char *task_id,
            const char *sort_field, const char *sort_order,
            const char *refresh_interval, const char *commands)
{
  GString *xml = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the status. "
                         "No update on status can be retrieved. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (task_id)
    {
      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_status task_id=\"%s\" />"
                                "<get_notes"
                                " sort_field=\"notes.nvt, notes.text\">"
                                "<task id=\"%s\"/>"
                                "</get_notes>"
                                "</commands>",
                                commands ? commands : "",
                                task_id,
                                task_id)
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the status. "
                               "No update on the requested task can be retrieved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_status");
        }
    }
  else
    {
      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_status"
                                " sort_field=\"%s\""
                                " sort_order=\"%s\"/>"
                                "</commands>",
                                commands ? commands : "",
                                sort_field ? sort_field : "name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the status. "
                               "No update of the list of tasks can be retrieved. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_status");
        }
    }

  xml = g_string_new ("<get_status>");
  if (read_string (&session, &xml))
    {
      openvas_server_close (socket, session);
      g_string_free (xml, TRUE);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the status. "
                           "No update of the status can be retrieved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }

  g_string_append (xml, "</get_status>");
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
 * @param[in]  refresh_interval Refresh interval (parsed to int).
 *
 * @return Result of XSL transformation.
 */
char *
get_status_omp (credentials_t * credentials, const char *task_id,
                const char *sort_field, const char *sort_order,
                const char *refresh_interval)
{
  return get_status (credentials, task_id, sort_field, sort_order,
                     refresh_interval, NULL);
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
 *
 * @return Result of XSL transformation.
 */
char *
create_lsc_credential_omp (credentials_t * credentials,
                           char *name,
                           char *comment,
                           const char *type,
                           const char *login,
                           const char *password)
{
  gnutls_session_t session;
  int socket;
  GString *xml;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new credential. "
                         "No new credential was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_lsc_credentials");

  xml = g_string_new ("<commands_response>");

  if (name == NULL || comment == NULL || login == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Credential"));
  else if (type && strcmp (type, "gen") && password == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Credential"));
  else
    {
      int ret;

      /* Create the LSC credential. */

      if (type && strcmp (type, "gen") == 0)
        ret = openvas_server_sendf (&session,
                                    "<create_lsc_credential>"
                                    "<name>%s</name>"
                                    "%s%s%s"
                                    "<login>%s</login>"
                                    "</create_lsc_credential>",
                                    name,
                                    comment ? "<comment>" : "",
                                    comment ? comment : "",
                                    comment ? "</comment>" : "",
                                    login);
      else
        ret = openvas_server_sendf (&session,
                                    "<create_lsc_credential>"
                                    "<name>%s</name>"
                                    "%s%s%s"
                                    "<login>%s</login>"
                                    "<password>%s</password>"
                                    "</create_lsc_credential>",
                                    name,
                                    comment ? "<comment>" : "",
                                    comment ? comment : "",
                                    comment ? "</comment>" : "",
                                    login,
                                    password ? password : "");

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new credential. "
                               "No new credential was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_lsc_credentials");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while listing credentials. "
                           "The credential has, however, been created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]  credentials        Username and password for authentication.
 * @param[in]  lsc_credential_id  UUID of LSC credential.
 *
 * @return Result of XSL transformation.
 */
char *
delete_lsc_credential_omp (credentials_t * credentials,
                           const char *lsc_credential_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting an credential. "
                         "The credential was not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_lsc_credentials");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an credential. "
                           "The credential was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]   lsc_credential_id  UUID of LSC credential.
 * @param[in]   sort_field         Field to sort on, or NULL.
 * @param[in]   sort_order         "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_lsc_credential_omp (credentials_t * credentials,
                        const char * lsc_credential_id,
                        const char * sort_field,
                        const char * sort_order)
{
  GString *xml = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a credential. "
                         "The credential is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_lsc_credentials");

  /* Get the target. */

  if (openvas_server_sendf (&session,
                            "<get_lsc_credentials"
                            " lsc_credential_id=\"%s\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            lsc_credential_id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 *
 * @return Result of XSL transformation.
 */
char *
get_lsc_credentials_omp (credentials_t * credentials,
                         const char * lsc_credential_id,
                         const char * format,
                         gsize *result_len,
                         const char * sort_field,
                         const char * sort_order)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;

  *result_len = 0;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the credential list. "
                         "The current list of credentials is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_targets");

  /* Send the request. */

  if (lsc_credential_id && format)
    {
      if (openvas_server_sendf (&session,
                                "<get_lsc_credentials name=\"%s\" format=\"%s\"/>",
                                lsc_credential_id,
                                format)
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting credential list. "
                               "The current list of credentials is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_targets");
        }
    }
  else
    {
      if (openvas_server_sendf (&session,
                                "<commands>"
                                "<get_lsc_credentials"
                                " sort_field=\"%s\" sort_order=\"%s\"/>"
                                "</commands>",
                                sort_field ? sort_field : "name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting credential list. "
                               "The current list of credentials is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_targets");
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
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a credential. "
                                   "The credential is not available. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_targets");
            }

          credential_entity = entity_child (entity, "lsc_credential");
          if (credential_entity)
            package_entity = entity_child (credential_entity, "package");
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
              free_entity (entity);
              openvas_server_close (socket, session);
              return package_decoded;
            }
          else
            {
              free_entity (entity);
              openvas_server_close (socket, session);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a credential. "
                                   "The credential could not be delivered. "
                                   "Diagnostics: Failure to receive credential from manager daemon.",
                                   "/omp?cmd=get_status");
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
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a credential. "
                                   "The credential could not be delivered. "
                                   "Diagnostics: Failure to receive credential from manager daemon.",
                                   "/omp?cmd=get_status");
            }
          openvas_server_close (socket, session);

          credential_entity = entity_child (entity, "lsc_credential");
          if (credential_entity)
            key_entity = entity_child (credential_entity, "public_key");
          if (key_entity != NULL)
            {
              gchar* key = g_strdup (entity_text (key_entity));
              free_entity (entity);
              return key;
            }
          free_entity (entity);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a credential. "
                               "The credential could not be delivered. "
                               "Diagnostics: Failure to parse credential from manager daemon.",
                               "/omp?cmd=get_status");
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting credential list. "
                               "The current list of credentials is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_targets");
        }
      free_entity (entity);

      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, text);
    }
}

/**
 * @brief Create an agent, get all agents, XSL transform result.
 *
 * @param[in]  credentials          Username and password for authentication.
 * @param[in]  name                 Agent name.
 * @param[in]  comment              Comment on agent.
 * @param[in]  installer            Installer, in base64.
 * @param[in]  installer_size       Size of \param installer .
 * @param[in]  howto_install        Install HOWTO, in base64.
 * @param[in]  howto_install_size   Size of \param howto_install .
 * @param[in]  howto_use            Usage HOWTO, in base64.
 * @param[in]  howto_use_size       Size of \param howto_use .
 *
 * @return Result of XSL transformation.
 */
char *
create_agent_omp (credentials_t * credentials, const char *name,
                  const char *comment,
                  const char *installer, int installer_size,
                  const char *howto_install, int howto_install_size,
                  const char *howto_use, int howto_use_size)
{
  gnutls_session_t session;
  int socket;
  GString *xml;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new agent. "
                         "No new agent was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_agents");

  xml = g_string_new ("<commands_response>");

  if (name == NULL || comment == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Agent"));
  else
    {
      int ret;
      gchar *installer_64, *howto_install_64, *howto_use_64;

      /* Create the agent. */

      installer_64 = installer_size
                     ? g_base64_encode ((guchar *) installer,
                                        installer_size)
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
                                  "<installer>%s</installer>"
                                  "<howto_install>%s</howto_install>"
                                  "<howto_use>%s</howto_use>"
                                  "</create_agent>",
                                  name, comment ? "<comment>" : "",
                                  comment ? comment : "",
                                  comment ? "</comment>" : "",
                                  installer_64,
                                  howto_install_64,
                                  howto_use_64);

      g_free (installer_64);
      g_free (howto_install_64);
      g_free (howto_use_64);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new agent. "
                               "No new agent was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_agents");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while listing agents. "
                           "The agent has, however, been created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_agents");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]  agent_id     UUID of agent.
 *
 * @return Result of XSL transformation.
 */
char *
delete_agent_omp (credentials_t * credentials, const char *agent_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting an agent. "
                         "The agent was not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_agents");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an agent. "
                           "The agent was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_agents");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 *
 * @return Result of XSL transformation.
 */
char *
get_agents_omp (credentials_t * credentials,
                const char * agent_id,
                const char * format,
                gsize *result_len,
                const char * sort_field,
                const char * sort_order)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;

  *result_len = 0;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the agent list. "
                         "The current list of agents is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_agents");

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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting agent list. "
                               "The current list of agents is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_agents");
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting agent list. "
                               "The current list of agents is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_agents");
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
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a agent. "
                                   "The agent is not available. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_agents");
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
              free_entity (entity);
              openvas_server_close (socket, session);
              return package_decoded;
            }
          else
            {
              free_entity (entity);
              openvas_server_close (socket, session);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a agent. "
                                   "The agent could not be delivered. "
                                   "Diagnostics: Failure to receive agent from manager daemon.",
                                   "/omp?cmd=get_status");
            }
        }
      else
        {
          entity_t agent_entity = NULL;

          /* A key. */

          entity = NULL;
          if (read_entity (&session, &entity))
            {
              openvas_server_close (socket, session);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a agent. "
                                   "The agent could not be delivered. "
                                   "Diagnostics: Failure to receive agent from manager daemon.",
                                   "/omp?cmd=get_status");
            }
          openvas_server_close (socket, session);

          agent_entity = entity_child (entity, "agent");
          free_entity (entity);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a agent. "
                               "The agent could not be delivered. "
                               "Diagnostics: Failure to parse agent from manager daemon.",
                               "/omp?cmd=get_status");
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting agent list. "
                               "The current list of agents is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_status");
        }
      free_entity (entity);

      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, text);
    }
}

/**
 * @brief Send data for an escalator.
 *
 * @param[out]  data  Data.
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
      if (openvas_server_sendf (session,
                                "<data><name>%s</name>%s</data>",
                                element,
                                element + strlen (element) + 1))
        return -1;

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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new target. "
                         "No new target was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_targets");

  xml = g_string_new ("<get_escalators>");

  if (name == NULL || comment == NULL || condition == NULL || event == NULL
      || method == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Escalator"));
  else
    {
      /* Create the escalator. */

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
          || send_escalator_data (&session, method_data)
          || openvas_server_send (&session, "</method>")
          || openvas_server_sendf (&session, "<condition>%s", condition)
          || send_escalator_data (&session, condition_data)
          || openvas_server_send (&session,
                                  "</condition>"
                                  "</create_escalator>"))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new escalator. "
                               "No new escalator was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_escalators");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalator. "
                           "A new escalator was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new escalators. "
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
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  escalator_id  UUID of escalator.
 *
 * @return Result of XSL transformation.
 */
char *
delete_escalator_omp (credentials_t * credentials, const char *escalator_id)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a escalator. "
                         "The escalator is not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_escalators");

  xml = g_string_new ("<get_escalators>");

  /* Delete escalator and get all escalators. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_escalator escalator_id=\"%s\"/>"
                            "<get_escalators"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            escalator_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting an escalator. "
                           "The escalator was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting an escalator. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_escalators");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting an escalator. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_escalators");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]   session      GNUTLS session on success.
 * @param[out]  xml          String.
 * @param[in]   sort_field   Field to sort on, or NULL.
 * @param[in]   sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation on error, NULL on success.
 */
char *
get_escalators_xml (gnutls_session_t *session, GString *xml,
                    const char *sort_field, const char *sort_order)
{
  if (openvas_server_sendf (session,
                            "<get_escalators"
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting escalators list. "
                         "The current list of escalators is not available. "
                         "Diagnostics: Failure to send command to manager daemon.",
                         "/omp?cmd=get_status");

  if (read_string (session, &xml))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting escalators list. "
                         "The current list of escalators is not available. "
                         "Diagnostics: Failure to receive response from manager daemon.",
                         "/omp?cmd=get_status");

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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting escalator list. "
                         "The current list of escalators is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  xml = g_string_new ("<get_escalators>");

  ret = get_escalators_xml (&session, xml, sort_field, sort_order);
  if (ret)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return ret;
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while testing an escalator. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_escalators");

  xml = g_string_new ("<get_escalators>");

  /* Test the escalator. */

  if (openvas_server_sendf (&session,
                            "<test_escalator escalator_id=\"%s\"/>",
                            escalator_id)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an escalator. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while testing an escalator. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }

  /* Get all escalators. */

  ret = get_escalators_xml (&session, xml, sort_field, sort_order);
  if (ret)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return ret;
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
 * @param[in]  target_credential  UUID of credential for target.
 * @param[in]  target_locator Target locator to pull targets from.
 * @param[in]  username     Username for source.
 * @param[in]  password     Password for username at source.
 *
 * @return Result of XSL transformation.
 */
char *
create_target_omp (credentials_t * credentials, char *name, char *hosts,
                   char *comment, const char *target_credential,
                   const char* target_locator, const char* username,
                   const char* password)
{
  gnutls_session_t session;
  GString *xml;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new target. "
                         "No new target was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_targets");

  xml = g_string_new ("<get_targets>");

  if (name == NULL || (hosts == NULL && target_locator == NULL)
      || comment == NULL || target_credential == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Target"));
  else
    {
      int ret;
      gchar* credentials_element = NULL;
      gchar* source_element = NULL;
      gchar* comment_element = NULL;

      if (comment != NULL)
        comment_element = g_strdup_printf ("<comment>%s</comment>", comment);
      else
        comment_element = g_strdup ("");

      if (target_locator != NULL && strcmp (target_locator, "--") != 0)
        source_element = g_strdup_printf ("<target_locator>%s</target_locator>"
                                          "<username>%s</username>"
                                          "<password>%s</password>",
                                          target_locator,
                                          username ? username : "",
                                          password ? password : "");
      else
        source_element = g_strdup ("");

      if (strcmp (target_credential, "--") == 0)
        credentials_element = g_strdup ("");
      else
        credentials_element =
          g_strdup_printf ("<lsc_credential id=\"%s\"/>",
                           target_credential);

      /* Create the target. */

      ret = openvas_server_sendf (&session,
                                  "<create_target>"
                                  "<name>%s</name>"
                                  "<hosts>%s</hosts>"
                                  "%s%s%s"
                                  "</create_target>",
                                  name,
                                  (strcmp (source_element, "") == 0)
                                    ? hosts
                                    : "",
                                  comment_element,
                                  source_element,
                                  credentials_element);

      g_free (comment_element);
      g_free (credentials_element);
      g_free (source_element);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new target. "
                               "No new target was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_targets");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]  target_id    UUID of target.
 *
 * @return Result of XSL transformation.
 */
char *
delete_target_omp (credentials_t * credentials, const char *target_id)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a target. "
                         "The target is not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_targets");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a target. "
                           "The target is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting targets list. "
                         "The current list of targets is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_targets");

  xml = g_string_new ("<get_target>");

  /* Get the target. */

  if (openvas_server_sendf (&session,
                            "<get_targets"
                            " target_id=\"%s\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\"/>",
                            target_id,
                            sort_field ? sort_field : "name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting targets list. "
                         "The current list of targets is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_targets");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_targets");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the list "
                           "of target locators. "
                           "The current list of schedules is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the list "
                           "of target locators. "
                           "The current list of schedules is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new config. "
                         "No new config was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new config. "
                               "No new config was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_configs");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new config. "
                           "The new config was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]  xml_file     Config XML for new config.
 *
 * @return Result of XSL transformation.
 */
char *
import_config_omp (credentials_t * credentials, char *xml_file)
{
  gnutls_session_t session;
  GString *xml = NULL;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while importing a config. "
                         "No new config was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

  xml = g_string_new ("<commands_response>");

  /* Create the config. */

  if (openvas_server_sendf (&session,
                            "<create_config>"
                            "%s"
                            "</create_config>",
                            xml_file)
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a config. "
                           "No new config was created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while importing a config. "
                           "The new config was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting list of configs. "
                         "The current list of configs is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  assert (config_id);

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting list of configs. "
                         "The current list of configs is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Get all the families. */

  if (edit)
    {
      if (openvas_server_sendf (&session, "<get_nvt_families/>") == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the config. "
                               "The config is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_configs");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the config. "
                               "The config is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_configs");
        }
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
 * @param[in]  config_id    UUID of config.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  selects      Selected families.
 * @param[in]  trends       Trend values.
 * @param[in]  preferences  Scanner preferences.
 * @param[in]  next         Name of following page.
 *
 * @return Following page.
 */
char *
save_config_omp (credentials_t * credentials,
                 const char * config_id,
                 const char * sort_field,
                 const char * sort_order,
                 GArray * selects,
                 GArray * trends,
                 GArray *preferences,
                 const char * next)
{
  gnutls_session_t session;
  int socket;
  char *ret;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a config. "
                         "The current list of configs is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

  /* Save preferences. */

  if (preferences)
    {
      preference_t *preference;
      int index = 0;

      while ((preference = g_array_index (preferences,
                                          preference_t*,
                                          index++)))
        {
          gchar *value;

          value = preference->value_size
                  ? g_base64_encode ((guchar *) preference->value,
                                     preference->value_size)
                  : g_strdup ("");

          if (openvas_server_sendf (&session,
                                    "<modify_config config_id=\"%s\">"
                                    "<preference>"
                                    "<name>%s</name>"
                                    "<value>%s</value>"
                                    "</preference>"
                                    "</modify_config>",
                                    config_id,
                                    preference->name,
                                    value)
              == -1)
            {
              g_free (value);
              openvas_server_close (socket, session);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  if (openvas_server_sendf (&session,
                            "<modify_config config_id=\"%s\">"
                            "<family_selection>"
                            "<growing>%i</growing>",
                            config_id,
                            trends && member (trends, ""))
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (selects)
    {
      gchar *family;
      int index = 0;

      while ((family = g_array_index (selects, gchar*, index++)))
        if (openvas_server_sendf (&session,
                                  "<family>"
                                  "<name>%s</name>"
                                  "<all>1</all>"
                                  "<growing>%i</growing>"
                                  "</family>",
                                  family,
                                  trends && member (trends, family))
            == -1)
          {
            openvas_server_close (socket, session);
            return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving a config. "
                                 "It is unclear whether the entire config has been saved. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_configs");
          }
    }

  if (trends)
    {
      gchar *family;
      int index = 0;

      while ((family = g_array_index (trends, gchar*, index++)))
        {
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
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  if (next == NULL || strcmp (next, "Save Config") == 0)
    return get_config_omp (credentials, config_id, 1);
  return get_config_family_omp (credentials, config_id, next, NULL, NULL, 1);
}

/**
 * @brief Get details of a family for a configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
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
                       const char * family,
                       const char * sort_field,
                       const char * sort_order,
                       int edit)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting list of configs. "
                         "The current list of configs is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

  xml = g_string_new ("<get_config_family_response>");
  if (edit) g_string_append (xml, "<edit/>");
  /* @todo Would it be better include this in the get_nvt_details response? */
  g_string_append_printf (xml,
                          "<config id=\"%s\"><family>%s</family></config>",
                          config_id,
                          family);

  /* Get the details for all NVT's in the config in the family. */

  if (openvas_server_sendf (&session,
                            "<get_nvt_details"
                            " config_id=\"%s\" family=\"%s\""
                            " sort_field=\"%s\" sort_order=\"%s\"/>",
                            config_id,
                            family,
                            sort_field ? sort_field : "nvts.name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
                                "<get_nvt_details"
                                " family=\"%s\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\"/>",
                                family,
                                sort_field ? sort_field : "nvts.name",
                                sort_order ? sort_order : "ascending")
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting list of configs. "
                               "The current list of configs is not available. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_configs");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
                        const char * family,
                        const char * sort_field,
                        const char * sort_order,
                        GArray *nvts)
{
  gnutls_session_t session;
  gchar *nvt;
  int socket, index = 0;
  char *ret;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a config. "
                         "The current list of configs is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  return get_config_family_omp (credentials, config_id, family, sort_field,
                                sort_order, 1);
}

/**
 * @brief Get details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
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
                    const char * family,
                    const char * nvt,
                    const char * sort_field,
                    const char * sort_order,
                    int edit)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting list of configs. "
                         "The current list of configs is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

  xml = g_string_new ("<get_config_nvt_response>");
  if (edit) g_string_append (xml, "<edit/>");
  /* @todo Would it be better include this in the get_nvt_details response? */
  g_string_append_printf (xml,
                          "<config id=\"%s\"><family>%s</family></config>",
                          config_id,
                          family);


  if (openvas_server_sendf (&session,
                            "<get_nvt_details"
                            " config_id=\"%s\" family=\"%s\" oid=\"%s\""
                            " sort_field=\"%s\" sort_order=\"%s\"/>",
                            config_id,
                            family,
                            nvt,
                            sort_field ? sort_field : "nvts.name",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

      /* Save preferences. */

      if (manager_connect (credentials, &socket, &session))
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting list of configs. "
                             "The current list of configs is not available. "
                             "Diagnostics: Failure to connect to manager daemon.",
                             "/omp?cmd=get_configs");

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
                                        preference->nvt,
                                        preference->name,
                                        value);

          if (ret == -1)
            {
              g_free (value);
              openvas_server_close (socket, session);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  return get_config_nvt_omp (credentials, config_id, family, nvt, sort_field,
                             sort_order, 1);
}

/**
 * @brief Delete config, get all configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_id    UUID of config.
 *
 * @return Result of XSL transformation.
 */
char *
delete_config_omp (credentials_t * credentials, const char *config_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a config. "
                         "The config is not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a config. "
                           "The config is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  *content_length = 0;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a config. "
                         "The config could not be delivered. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a config. "
                               "The config could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_status");
        }

      entity = NULL;
      if (read_entity_and_text (&session, &entity, &content))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a config. "
                               "The config could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_status");
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a config. "
                               "The config could not be delivered. "
                               "Diagnostics: Failure to receive config from manager daemon.",
                               "/omp?cmd=get_status");
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

  *content_length = 0;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a preference file. "
                         "The file could not be delivered. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  xml = g_string_new ("<get_preferences_response>");

  if (config_id == NULL || oid == NULL || preference_name == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Export Preference File"));
  else
    {
      if (openvas_server_sendf (&session,
                                "<get_preferences"
                                " config_id=\"%s\""
                                " oid=\"%s\""
                                " preference=\"%s\"/>",
                                config_id,
                                oid,
                                preference_name)
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_status");
        }

      entity = NULL;
      if (read_entity (&session, &entity))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_status");
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a preference file. "
                               "The file could not be delivered. "
                               "Diagnostics: Failure to receive file from manager daemon.",
                               "/omp?cmd=get_status");
        }
    }

  g_string_append (xml, "</get_preferences_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete report, get task status, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  report_id    ID of report.
 * @param[in]  task_id      ID of task.
 *
 * @return Result of XSL transformation.
 */
char *
delete_report_omp (credentials_t * credentials,
                   const char *report_id,
                   const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a report. "
                         "The report is not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_report report_id=\"%s\" />"
                            "<get_status task_id=\"%s\" />"
                            "</commands>",
                            report_id,
                            task_id) == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a report. "
                           "The report is not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a report. "
                           "It is unclear whether the report has been deleted or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Get a report and XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  report_id      ID of report.
 * @param[in]  format         Format of report.
 * @param[out] report_len     Length of report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 *
 * @return Report.
 */
char *
get_report_omp (credentials_t * credentials, const char *report_id,
                const char *format, gsize *report_len,
                const unsigned int first_result,
                const unsigned int max_results,
                const char * sort_field, const char * sort_order,
                const char * levels, const char * notes,
                const char *result_hosts_only, const char * search_phrase,
                const char *min_cvss_base)
{
  char *report_encoded = NULL;
  gchar *report_decoded = NULL;
  GString *xml;
  entity_t entity;
  entity_t report_entity;
  gnutls_session_t session;
  int socket;

  *report_len = 0;

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

  if (levels == NULL || strlen (levels) == 0) levels = "hm";

  if (notes == NULL || strlen (notes) == 0) notes = "0";

  if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
    result_hosts_only = "1";

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a report. "
                         "The report could not be delivered. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<get_report"
                            " notes=\"%i\""
                            " notes_details=\"1\""
                            " result_hosts_only=\"%i\""
                            " report_id=\"%s\""
                            " format=\"%s\""
                            " first_result=\"%u\""
                            " max_results=\"%u\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\""
                            " levels=\"%s\""
                            " search_phrase=\"%s\""
                            " min_cvss_base=\"%s\"/>",
                            strcmp (notes, "0") ? 1 : 0,
                            strcmp (result_hosts_only, "0") ? 1 : 0,
                            report_id,
                            format ? format : "xml",
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a report. "
                           "The report could not be delivered. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (format)
    {
      if (strcmp (format, "xml") == 0)
        {
          /* Manager sends XML report as plain XML. */
          /** @TODO Call g_string_sized_new with an appropriate size */
          xml = g_string_new ("");
          if (read_entity (&session, &entity))
            {
              g_string_free (xml, TRUE);
              openvas_server_close (socket, session);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_status");
            }
          openvas_server_close (socket, session);
          entity_t report = entity_child (entity, "report");
          if (report == NULL)
            {
              free_entity (entity);
              g_string_free (xml, TRUE);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Response from manager daemon did not contain a report.",
                                   "/omp?cmd=get_status");
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
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive response from manager daemon.",
                                   "/omp?cmd=get_status");
            }

          report_entity = entity_child (entity, "report");
          if (report_entity != NULL)
            {
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
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while getting a report. "
                                   "The report could not be delivered. "
                                   "Diagnostics: Failure to receive report from manager daemon.",
                                   "/omp?cmd=get_status");
            }
        }
    }
  else
    {
      /* Format is NULL, send XSL transformed XML. */

      xml = g_string_new ("<commands_response>");

      if (read_string (&session, &xml))
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_status");
        }

      {

        /* As a temporary hack until there's a reasonable way to do it in the
         * manager, get the report again with all threat levels, so that the XSL
         * can count per-host grand totals. */

        g_string_append (xml, "<all>");

        if (openvas_server_sendf (&session,
                                  "<get_report"
                                  " report_id=\"%s\""
                                  " format=\"xml\""
                                  " first_result=\"%u\""
                                  " max_results=\"%u\""
                                  " levels=\"hmlg\""
                                  " search_phrase=\"%s\"/>",
                                  report_id,
                                  first_result,
                                  max_results,
                                  search_phrase)
            == -1)
          {
            g_string_free (xml, TRUE);
            openvas_server_close (socket, session);
            return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting a report. "
                                 "The report could not be delivered. "
                                 "Diagnostics: Failure to send command to manager daemon.",
                                 "/omp?cmd=get_status");
          }

        if (read_string (&session, &xml))
          {
            g_string_free (xml, TRUE);
            openvas_server_close (socket, session);
            return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting a report. "
                                 "The report could not be delivered. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_status");
          }

        g_string_append (xml, "</all>");
      }

      g_string_append (xml, "</commands_response>");
      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the notes. "
                         "The list of notes is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the notes. "
                           "The list of notes is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the notes. "
                           "The list of notes is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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
 * @param[in]  note_id      ID of note.
 * @param[in]  commands     Extra commands to run before the others.
 *
 * @return Result of XSL transformation.
 */
static char *
get_note (credentials_t *credentials, const char *note_id, const char *commands)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the note. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the note. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the note. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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
 * @param[in]  note_id      ID of note.
 *
 * @return Result of XSL transformation.
 */
char *
get_note_omp (credentials_t *credentials, const char *note_id)
{
  return get_note (credentials, note_id, NULL);
}

/**
 * @brief Return the new notes page.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  oid            OID of NVT associated with note.
 * @param[in]  port           Port to limit note to, "" for all.
 * @param[in]  threat         Threat to limit note to, "" for all.
 * @param[in]  task_id        ID of task to limit note to, "" for all.
 * @param[in]  task_name      Name of task to limit note to, task_id given.
 * @param[in]  report_id      ID of report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
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
              const char *result_id,
              const char *report_id, const char *first_result,
              const char *max_results, const char *sort_field,
              const char *sort_order, const char *levels, const char *notes,
              const char *result_hosts_only, const char *search_phrase,
              const char *min_cvss_base)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (first_result == NULL || max_results == NULL || hosts == NULL
      || levels == NULL || notes == NULL || oid == NULL || port == NULL
      || report_id == NULL || result_id == NULL || search_phrase == NULL
      || sort_field == NULL || sort_order == NULL || task_id == NULL
      || task_name == NULL || threat == NULL || result_hosts_only == NULL
      || min_cvss_base == NULL)
    {
      GString *xml = g_string_new (GSAD_MESSAGE_INVALID_PARAM ("Get Report"));
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_notes");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
                          /* Passthroughs. */
                          "<report id=\"%s\"/>"
                          "<first_result>%s</first_result>"
                          "<max_results>%s</max_results>"
                          "<sort_field>%s</sort_field>"
                          "<sort_order>%s</sort_order>"
                          "<levels>%s</levels>"
                          "<notes>%s</notes>"
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
                          report_id,
                          first_result,
                          max_results,
                          sort_field,
                          sort_order,
                          levels,
                          notes,
                          result_hosts_only,
                          search_phrase,
                          min_cvss_base);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]  result_id      ID of result to limit note to, "" for all.
 * @param[in]  report_id      ID of report.
 * @param[in]  first_result   Number of first result in report.
 * @param[in]  max_results    Number of results in report.
 * @param[in]  sort_field     Field to sort on, or NULL.
 * @param[in]  sort_order     "ascending", "descending", or NULL.
 * @param[in]  levels         Threat levels to include in report.
 * @param[in]  notes          Whether to include notes.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 *
 * @return Result of XSL transformation.
 */
char *
create_note_omp (credentials_t *credentials, const char *oid,
                 const char *text, const char *hosts, const char *port,
                 const char *threat, const char *task_id, const char *result_id,
                 const char *report_id,
                 const unsigned int first_result,
                 const unsigned int max_results,
                 const char *sort_field, const char *sort_order,
                 const char *levels, const char *notes,
                 const char *result_hosts_only, const char *search_phrase,
                 const char *min_cvss_base)
{
  gnutls_session_t session;
  GString *xml;
  int socket;

  if (search_phrase == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: Search phrase was NULL.",
                         "/omp?cmd=get_notes");

  if (oid == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: OID was NULL.",
                         "/omp?cmd=get_notes");

  if (threat == NULL || port == NULL || hosts == NULL || min_cvss_base == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: A required parameter was NULL.",
                         "/omp?cmd=get_notes");

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new note. "
                         "No new note was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_notes");

  xml = g_string_new ("<commands_response>");

  if (text == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Note"));
  else
    {
      int ret;

      /* Create the note. */

      ret = openvas_server_sendf (&session,
                                  "<create_note>"
                                  "<nvt>%s</nvt>"
                                  "<hosts>%s</hosts>"
                                  "<port>%s</port>"
                                  "<threat>%s</threat>"
                                  "<text>%s</text>"
                                  "<task>%s</task>"
                                  "<result>%s</result>"
                                  "</create_note>",
                                  oid,
                                  hosts,
                                  port,
                                  threat,
                                  text,
                                  task_id,
                                  result_id);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new note. "
                               "No new note was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_notes");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new note. "
                               "It is unclear whether the note has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_notes");
        }
    }

  /* Get the report. */

  if (levels == NULL || strlen (levels) == 0) levels = "hm";

  if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
    result_hosts_only = "1";

  if (notes == NULL || strlen (notes) == 0) notes = "0";

  if (openvas_server_sendf (&session,
                            "<get_report"
                            " notes=\"%i\""
                            " notes_details=\"1\""
                            " result_hosts_only=\"%i\""
                            " report_id=\"%s\""
                            " format=\"xml\""
                            " first_result=\"%u\""
                            " max_results=\"%u\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\""
                            " levels=\"%s\""
                            " search_phrase=\"%s\""
                            " min_cvss_base=\"%s\"/>",
                            strcmp (notes, "0") ? 1 : 0,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report. "
                           "The new note was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the report. "
                           "The new note was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }

  {

    /* As a temporary hack until there's a reasonable way to do it in the
     * Manager, get the report again with all threat levels, so that the XSL
     * can count per-host grand totals. */

    g_string_append (xml, "<all>");

    if (openvas_server_sendf (&session,
                              "<get_report"
                              " report_id=\"%s\""
                              " format=\"xml\""
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
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the report. "
                             "The new note was, however, created. "
                             "Diagnostics: Failure to send command to manager daemon.",
                             "/omp?cmd=get_status");
      }

    if (read_string (&session, &xml))
      {
        g_string_free (xml, TRUE);
        openvas_server_close (socket, session);
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the report. "
                             "The new note was, however, created. "
                             "Diagnostics: Failure to receive response from manager daemon.",
                             "/omp?cmd=get_status");
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
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase  Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  oid            OID of NVT (for get_nvt_details).
 * @param[in]  task_id        ID of task (for get_status).
 *
 * @return Result of XSL transformation.
 */
char *
delete_note_omp (credentials_t * credentials, const char *note_id,
                 const char *next, const char *report_id,
                 const unsigned int first_result,
                 const unsigned int max_results,
                 const char *sort_field, const char *sort_order,
                 const char *levels, const char *notes,
                 const char *result_hosts_only, const char *search_phrase,
                 const char *min_cvss_base, const char *oid,
                 const char *task_id)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (next == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a note. "
                         "The note remains intact. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_notes");

  if (strcmp (next, "get_nvt_details") == 0)
    {
      gchar *extra;
      char *ret;

      if (oid == NULL)
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while deleting a note. "
                             "The note remains intact. "
                             "Diagnostics: Required parameter was NULL.",
                             "/omp?cmd=get_notes");

      extra = g_strdup_printf ("<delete_note note_id=\"%s\"/>", note_id);
      ret = get_nvt_details (credentials, oid, extra);
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

  if (strcmp (next, "get_status") == 0)
    {
      gchar *extra = g_strdup_printf ("<delete_note note_id=\"%s\"/>", note_id);
      char *ret = get_status (credentials, task_id, NULL, NULL, NULL, extra);
      g_free (extra);
      return ret;
    }

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a note. "
                         "The note was not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (strcmp (next, "get_report") == 0)
    {
      if (search_phrase == NULL || min_cvss_base == NULL)
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while deleting a note. "
                               "The note remains intact. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_notes");
        }

      if (levels == NULL || strlen (levels) == 0) levels = "hm";

      if (notes == NULL || strlen (notes) == 0) notes = "0";

      if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
        result_hosts_only = "1";

      if (openvas_server_sendf (&session,
                                "<commands>"
                                "<delete_note note_id=\"%s\" />"
                                "<get_report"
                                " notes=\"%i\""
                                " notes_details=\"1\""
                                " result_hosts_only=\"%i\""
                                " report_id=\"%s\""
                                " format=\"xml\""
                                " first_result=\"%u\""
                                " max_results=\"%u\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\""
                                " levels=\"%s\""
                                " search_phrase=\"%s\""
                                " min_cvss_base=\"%s\"/>"
                                "</commands>",
                                note_id,
                                strcmp (notes, "0") ? 1 : 0,
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while deleting a note. "
                               "It is unclear whether the note has been deleted or not. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_status");
        }
    }
  else
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a note. "
                           "The note remains intact. "
                           "Diagnostics: Error in parameter next.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a note. "
                           "It is unclear whether the note has been deleted or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Edit note, get next page, XSL transform the result.
 *
 * @param[in]  credentials    Username and password for authentication.
 * @param[in]  note_id         ID of note.
 * @param[in]  next            Name of next page.
 * @param[in]  report_id       ID of current report.
 * @param[in]  first_result    Number of first result in report.
 * @param[in]  max_results     Number of results in report.
 * @param[in]  sort_field      Field to sort on, or NULL.
 * @param[in]  sort_order      "ascending", "descending", or NULL.
 * @param[in]  levels          Threat levels to include in report.
 * @param[in]  notes           Whether to include notes.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase   Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  oid             OID of NVT (for get_nvt_details).
 * @param[in]  task_id         ID of task (for get_status).
 *
 * @return Result of XSL transformation.
 */
char *
edit_note_omp (credentials_t * credentials, const char *note_id,
               /* Next page params. */
               const char *next, const char *report_id,
               const unsigned int first_result,
               const unsigned int max_results,
               const char *sort_field, const char *sort_order,
               const char *levels, const char *notes,
               const char *result_hosts_only, const char *search_phrase,
               const char *min_cvss_base, const char *oid, const char *task_id)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (note_id == NULL || min_cvss_base == NULL)
    {
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while editing a note. "
                           "The note remains as it was. "
                           "Diagnostics: Required parameter was NULL.",
                           "/omp?cmd=get_notes");
    }

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while editing a note. "
                         "The note remains as it was. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_notes");

  if (openvas_server_sendf (&session,
                            "<get_notes"
                            " note_id=\"%s\""
                            " details=\"1\""
                            " result=\"1\"/>",
                            note_id)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
                          "<result_hosts_only>%s</result_hosts_only>"
                          "<search_phrase>%s</search_phrase>"
                          "<min_cvss_base>%s</min_cvss_base>"
                          /* Parameters for get_nvt_details. */
                          "<nvt id=\"%s\"/>"
                          /* Parameters for get_status. */
                          "<task id=\"%s\"/>",
                          next,
                          report_id,
                          first_result,
                          max_results,
                          sort_field,
                          sort_order,
                          levels,
                          notes,
                          result_hosts_only,
                          search_phrase,
                          min_cvss_base,
                          oid,
                          task_id);

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]  note_id         ID of note.
 * @param[in]  text            Text of note.
 * @param[in]  hosts           Hosts note applied to, "" for all.
 * @param[in]  port            Port note applies to, "" for all.
 * @param[in]  threat          Threat note applies to, "" for all.
 * @param[in]  note_task_id    ID of task to limit note to, "" for all.
 * @param[in]  note_result_id  ID of result to limit note to, "" for all.
 * @param[in]  next            Name of next page.
 * @param[in]  report_id       ID of current report.
 * @param[in]  first_result    Number of first result in report.
 * @param[in]  max_results     Number of results in report.
 * @param[in]  sort_field      Field to sort on, or NULL.
 * @param[in]  sort_order      "ascending", "descending", or NULL.
 * @param[in]  levels          Threat levels to include in report.
 * @param[in]  notes           Whether to include notes.
 * @param[in]  result_hosts_only  Whether to show only hosts with results.
 * @param[in]  search_phrase   Phrase which included results must contain.
 * @param[in]  min_cvss_base  Minimum CVSS included results may have.
 *                            "-1" for all, including results with NULL CVSS.
 * @param[in]  oid             OID of NVT (for get_nvt_details).
 * @param[in]  task_id         ID of task (for get_status).
 *
 * @return Result of XSL transformation.
 */
char *
save_note_omp (credentials_t * credentials, const char *note_id,
               const char *text, const char *hosts, const char *port,
               const char *threat, const char *note_task_id,
               const char *note_result_id, const char *next,
               const char *report_id,
               const unsigned int first_result,
               const unsigned int max_results,
               const char *sort_field, const char *sort_order,
               const char *levels, const char *notes,
               const char *result_hosts_only, const char *search_phrase,
               const char *min_cvss_base, const char *oid, const char *task_id)
{
  entity_t entity;
  char *response = NULL;
  gnutls_session_t session;
  int socket;
  gchar *modify_note;

  if (next == NULL || note_task_id == NULL || note_result_id == NULL)
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note remains the same. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_notes");

  modify_note = g_strdup_printf ("<modify_note note_id=\"%s\">"
                                 "<hosts>%s</hosts>"
                                 "<port>%s</port>"
                                 "<threat>%s</threat>"
                                 "<text>%s</text>"
                                 "<task>%s</task>"
                                 "<result>%s</result>"
                                 "</modify_note>",
                                 note_id,
                                 hosts ? hosts : "",
                                 port ? port : "",
                                 threat ? threat : "",
                                 text ? text : "",
                                 note_task_id,
                                 note_result_id);

  if (strcmp (next, "get_nvt_details") == 0)
    {
      char *ret;

      if (oid == NULL)
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a note. "
                               "The note remains the same. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_notes");
        }

      ret = get_nvt_details (credentials, oid, modify_note);
      g_free (modify_note);
      return ret;
    }

  if (strcmp (next, "get_note") == 0)
    {
      char *ret = get_note (credentials, note_id, modify_note);
      g_free (modify_note);
      return ret;
    }

  if (strcmp (next, "get_notes") == 0)
    {
      char *ret = get_notes (credentials, modify_note);
      g_free (modify_note);
      return ret;
    }

  if (strcmp (next, "get_status") == 0)
    {
      char *ret = get_status (credentials, task_id, NULL, NULL, NULL,
                              modify_note);
      g_free (modify_note);
      return ret;
    }

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a note. "
                         "The note was not saved. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (strcmp (next, "get_report") == 0)
    {
      if (search_phrase == NULL || min_cvss_base == NULL)
        {
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a note. "
                               "The note remains the same. "
                               "Diagnostics: Required parameter was NULL.",
                               "/omp?cmd=get_notes");
        }

      if (levels == NULL || strlen (levels) == 0) levels = "hm";

      if (notes == NULL || strlen (notes) == 0) notes = "0";

      if (result_hosts_only == NULL || strlen (result_hosts_only) == 0)
        result_hosts_only = "1";

      if (openvas_server_sendf (&session,
                                "<commands>"
                                "%s"
                                "<get_report"
                                " notes=\"%i\""
                                " notes_details=\"1\""
                                " result_hosts_only=\"%i\""
                                " report_id=\"%s\""
                                " format=\"xml\""
                                " first_result=\"%u\""
                                " max_results=\"%u\""
                                " sort_field=\"%s\""
                                " sort_order=\"%s\""
                                " levels=\"%s\""
                                " search_phrase=\"%s\""
                                " min_cvss_base=\"%s\"/>"
                                "</commands>",
                                modify_note,
                                strcmp (notes, "0") ? 1 : 0,
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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a note. "
                               "It is unclear whether the note has been saved or not. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_status");
        }
      g_free (modify_note);
    }
  else
    {
      g_free (modify_note);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a note. "
                           "The note remains the same. "
                           "Diagnostics: Error in parameter next.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &response))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a note. "
                           "It is unclear whether the note has been saved or not. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, response);
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a schedule. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_schedules");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting a schedule. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the schedule list. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the schedule list. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the schedule list. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new schedule. "
                         "No new schedule was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_schedules");

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
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new schedule. "
                               "No new schedule was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_schedules");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new schedule. "
                           "A new schedule was, however, created. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]  schedule     UUID of schedule.
 *
 * @return Result of XSL transformation.
 */
char *
delete_schedule_omp (credentials_t * credentials, const char *schedule)
{
  GString *xml;
  gnutls_session_t session;
  int socket;
  time_t now;
  struct tm *now_broken;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a schedule. "
                         "The schedule was not deleted. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_schedules");

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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a schedule. "
                           "The schedule was not deleted. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_schedules");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
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
 * @param[in]   duration    Duration of reports, in seconds.
 *
 * @return Result of XSL transformation.
 */
char *
get_system_reports_omp (credentials_t * credentials, const char * duration)
{
  GString *xml;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the system reports. "
                         "The current list of system reports is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  xml = g_string_new ("<get_system_reports>");
  g_string_append_printf (xml, "<duration>%s</duration>",
                          duration ? duration : "86400");

  /* Get the system reports. */

  if (openvas_server_sendf (&session,
                            "<get_system_reports name=\"types\"/>")
      == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the system reports. "
                           "The current list of system reports is not available. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_status");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the system reports. "
                           "The current list of system reports is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
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
 * @param[out]  content_type         Content type return.
 * @param[out]  content_disposition  Content dispositions return.
 * @param[out]  content_length       Content length return.
 *
 * @return Image, or NULL.
 */
char *
get_system_report_omp (credentials_t *credentials, const char *url,
                       const char *duration, enum content_type *content_type,
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
      if (manager_connect (credentials, &socket, &session))
        return NULL;

      if (openvas_server_sendf (&session,
                                "<get_system_reports"
                                " name=\"%s\" duration=\"%s\"/>",
                                name,
                                duration ? duration : "86400")
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


/* Manager communication. */

/**
 * @brief Check authentication credentials.
 *
 * @param[in]  username  Username.
 * @param[in]  password  Password.
 *
 * @return TRUE if valid, FALSE otherwise.
 */
gboolean
is_omp_authenticated (gchar * username, gchar * password)
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
      tracef ("is_omp_authenticated failed to acquire socket!\n");
      return FALSE;
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
      return TRUE;
    }
  else
    {
      openvas_server_close (socket, session);
      return FALSE;
    }
}

/**
 * @brief Connect to OpenVAS Manager daemon.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[out]  socket       Manager socket on success.
 * @param[out]  session      GNUTLS session on success.
 *
 * @return 0 success, -1 failed to connect, -2 authentication failed.
 */
int
manager_connect (credentials_t *credentials, int *socket,
                 gnutls_session_t *session)
{
  *socket = openvas_server_open (session,
                                 manager_address
                                  ? manager_address
                                  : OPENVASMD_ADDRESS,
                                 manager_port);
  if (*socket == -1)
    return -1;

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
   */
  tracef ("Sleeping!");
  sleep (10);
#endif
  return 0;
}
