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
 * @brief The port the manager is on.
 */
int manager_port = 9390;

int manager_connect (credentials_t *, int *, gnutls_session_t *);


/* Helpers. */

/**
 * @brief Init the GSA OMP library.
 *
 * @param[in]  port_manager  Manager port.
 */
void
omp_init (int port_manager)
{
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
  gchar *res = g_strdup_printf ("<envelope><login>%s</login>%s</envelope>",
                                credentials->username,
                                xml);
  char *html = xsl_transform (res);
  g_free (res);
  g_free (xml);
  return html;
}

/** @todo Duplicated in openvas-manager. */
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
 * @todo Display actual text given in \param message.
 *
 * @param[in]  credentials  Credentials of user issuing the action.
 * @param[in]  message      If not NULL, display message.
 *
 * @return Result of XSL transformation.
 */
char *
gsad_newtask (credentials_t * credentials, const char* message)
{
  entity_t entity;
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  if (openvas_server_send (&session,
                           "<get_configs"
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

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
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         New task name.
 * @param[in]  comment      Comment on task.
 * @param[in]  scantarget   Target for task.
 * @param[in]  scanconfig   Config for task.
 *
 * @return Result of XSL transformation.
 */
char *
create_task_omp (credentials_t * credentials, char *name, char *comment,
                 char *scantarget, char *scanconfig)
{
  entity_t entity;
  gnutls_session_t session;
  char *text = NULL;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new task. "
                         "The task is not created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<create_task>"
                            "<config>%s</config>"
                            "<target>%s</target>"
                            "<name>%s</name>"
                            "<comment>%s</comment>"
                            "</create_task>"
                            "<get_status"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            scanconfig, scantarget, name, comment)
      == -1)
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
 * @brief Requests NVT details.
 *
 * @param[in]  credentials  Credentials for the manager connection.
 * @param[in]  oid          OID of NVT.
 *
 * @return XSL transformed NVT details response or error message.
 */
char*
get_nvt_details_omp (credentials_t * credentials, const char* oid)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting nvt details. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_nvt_details oid=\"%s\" />"
                            "</commands>",
                            oid)
        == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                            "An internal error occurred while getting nvt details. "
                            "Diagnostics: Failure to send command to manager daemon.",
                            "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting nvt details. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Get all tasks, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  task_id      ID of task.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_status_omp (credentials_t * credentials, const char *task_id,
                const char *sort_field, const char *sort_order)
{
  entity_t entity;
  char *text = NULL;
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
                                "<get_status task_id=\"%s\" />"
                                "</commands>",
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
                                "<get_status"
                                " sort_field=\"%s\""
                                " sort_order=\"%s\"/>"
                                "</commands>",
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

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the status. "
                           "No update of the status can be retrieved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, text);
}

/**
 * @brief Create an LSC credential, get all credentials, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         Credential name.
 * @param[in]  comment      Comment on credential.
 * @param[in]  type         Either "gen" or "pass".
 * @param[in]  password     Password, for type "pass".
 *
 * @return Result of XSL transformation.
 */
char *
create_lsc_credential_omp (credentials_t * credentials,
                           char *name,
                           char *comment,
                           const char *type,
                           const char *password)
{
  entity_t entity;
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

  if (name == NULL || comment == NULL)
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
                                    "</create_lsc_credential>",
                                    name, comment ? "<comment>" : "",
                                    comment ? comment : "",
                                    comment ? "</comment>" : "");
      else
        ret = openvas_server_sendf (&session,
                                    "<create_lsc_credential>"
                                    "<name>%s</name>"
                                    "%s%s%s"
                                    "<password>%s</password>"
                                    "</create_lsc_credential>",
                                    name, comment ? "<comment>" : "",
                                    comment ? comment : "",
                                    comment ? "</comment>" : "",
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

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new credential. "
                               "It is unclear whether the credential has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_lsc_credentials");
        }
      free_entity (entity);
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while listing credentials. "
                           "The credential has, however, been created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_lsc_credentials");
    }
  free_entity (entity);

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete LSC credential, get all credentials, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  name         Name of LSC credential.
 *
 * @return Result of XSL transformation.
 */
char *
delete_lsc_credential_omp (credentials_t * credentials, const char *name)
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
                            "<delete_lsc_credential>"
                            "<name>%s</name>"
                            "</delete_lsc_credential>"
                            "<get_lsc_credentials"
                            " sort_field=\"name\" sort_order=\"ascending\"/>"
                            "</commands>",
                            name)
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

/** @todo Split into get_lsc_credentials_omp and get_lsc_credential_omp. */
/**
 * @brief Get one or all LSC credentials, XSL transform the result.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[in]   name         Name of LSC credential.
 * @param[in]   format       Format of result
 * @param[out]  result_len   Length of result.
 * @param[in]   sort_field   Field to sort on, or NULL.
 * @param[in]   sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_lsc_credentials_omp (credentials_t * credentials,
                         const char * name,
                         const char * format,
                         unsigned int *result_len,
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

  if (name && format)
    {
      if (openvas_server_sendf (&session,
                                "<get_lsc_credentials name=\"%s\" format=\"%s\"/>",
                                name,
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

  if (name && format)
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
 * @brief Create a target, get all targets, XSL transform the result.
 *
 * @param[in]   credentials  Username and password for authentication.
 * @param[in]   name         Name of new target.
 * @param[in]   hosts        Hosts associated with target.
 * @param[out]  comment      Comment on target.
 * @param[out]  target_credential  Name of credential for target.
 *
 * @return Result of XSL transformation.
 */
char *
create_target_omp (credentials_t * credentials, char *name, char *hosts,
                   char *comment, const char *target_credential)
{
  entity_t entity;
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

  if (name == NULL || hosts == NULL || comment == NULL
      || target_credential == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Target"));
  else
    {
      int ret;

      /* Create the target. */

      if (strcmp (target_credential, "--") == 0)
        ret = openvas_server_sendf (&session,
                                    "<create_target>"
                                    "<name>%s</name>"
                                    "<hosts>%s</hosts>"
                                    "%s%s%s"
                                    "</create_target>",
                                    name, hosts, comment ? "<comment>" : "",
                                    comment ? comment : "",
                                    comment ? "</comment>" : "");
      else
        ret = openvas_server_sendf (&session,
                                    "<create_target>"
                                    "<name>%s</name>"
                                    "<hosts>%s</hosts>"
                                    "%s%s%s"
                                    "<lsc_credential>%s</lsc_credential>"
                                    "</create_target>",
                                    name, hosts, comment ? "<comment>" : "",
                                    comment ? comment : "",
                                    comment ? "</comment>" : "",
                                    target_credential);

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

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new target. "
                               "It is unclear whether the target has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_targets");
        }
      free_entity (entity);
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }
  free_entity (entity);

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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new target. "
                           "A new target was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }
  free_entity (entity);

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_targets>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete a target, get all targets, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  target_name  Name of target.
 *
 * @return Result of XSL transformation.
 */
char *
delete_target_omp (credentials_t * credentials, const char *target_name)
{
  entity_t entity;
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

  /* Get the targets. */

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<delete_target><name>%s</name></delete_target>"
                            "<get_targets"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "<get_lsc_credentials"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            target_name)
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a target. "
                           "It is unclear whether the target has been deleted or not. "
                           "Diagnostics: Failure to read response from manager daemon.",
                           "/omp?cmd=get_targets");
    }
  free_entity (entity);

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_targets>");
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
  entity_t entity;
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }
  free_entity (entity);

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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting targets list. "
                           "The current list of targets is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_targets");
    }
  free_entity (entity);

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
 * @param[in]  rcfile       RC for new config as a string.
 * @param[in]  base         What to use as base for new config: "file" for
 *                          rcfile, "full" for "Full and fast".
 *
 * @return Result of XSL transformation.
 */
char *
create_config_omp (credentials_t * credentials, char *name, char *comment,
                   char *rcfile, const char *base)
{
  entity_t entity;
  gnutls_session_t session;
  GString *xml = NULL;
  int socket;
  gchar *rc_encoded = NULL;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new config. "
                         "No new config was created. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

  xml = g_string_new ("<commands_response>");

  if (name == NULL || comment == NULL || base == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create Scan Config"));
  else if (strcmp (base, "file") == 0)
    {
      /* Create the config. */

      rc_encoded = g_base64_encode ((guchar *) rcfile, strlen (rcfile));
      if (openvas_server_sendf (&session,
                                "<create_config>"
                                "<name>%s</name>"
                                "<rcfile>%s</rcfile>"
                                "%s%s%s"
                                "</create_config>",
                                name,
                                rc_encoded,
                                comment ? "<comment>" : "",
                                comment ? comment : "",
                                comment ? "</comment>" : "") == -1)
        {
          g_free (rc_encoded);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new config. "
                               "No new config was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_configs");
        }
      g_free (rc_encoded);

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new config. "
                               "It is unclear whether the config has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_configs");
        }
      free_entity (entity);
    }
  else
    {
      /* Create the config. */

      rc_encoded = g_base64_encode ((guchar *) rcfile, strlen (rcfile));
      if (openvas_server_sendf (&session,
                                "<create_config>"
                                "<name>%s</name>"
                                "<copy>%s</copy>"
                                "%s%s%s"
                                "</create_config>",
                                name,
                                base ? base : "Full and fast",
                                comment ? "<comment>" : "",
                                comment ? comment : "",
                                comment ? "</comment>" : "") == -1)
        {
          g_free (rc_encoded);
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new config. "
                               "No new config was created. "
                               "Diagnostics: Failure to send command to manager daemon.",
                               "/omp?cmd=get_configs");
        }
      g_free (rc_encoded);

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new config. "
                               "It is unclear whether the config has been created or not. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_configs");
        }
      free_entity (entity);
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new config. "
                           "The new config was, however, created. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }
  free_entity (entity);

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
 * @param[in]  name         Name of config.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_omp (credentials_t * credentials, const char * name, int edit)
{
  entity_t entity;
  GString *xml;
  gnutls_session_t session;
  int socket;

  assert (name);

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
                            " name=\"%s\""
                            " families=\"1\""
                            " preferences=\"1\"/>",
                            name)
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the config. "
                           "The config is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }
  free_entity (entity);

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

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the config. "
                               "The config is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_configs");
        }
      free_entity (entity);
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
 * @param[in]  config       Name of config.
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
                 const char * config,
                 const char * sort_field,
                 const char * sort_order,
                 GArray * selects,
                 GArray * trends,
                 GArray *preferences,
                 const char * next)
{
  gnutls_session_t session;
  int socket;

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
                                    "<modify_config>"
                                    "<name>%s</name>"
                                    "<preference>"
                                    "<name>%s</name>"
                                    "<value>%s</value>"
                                    "</preference>"
                                    "</modify_config>",
                                    config,
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

          /** @todo Put in XML for "result of previous operation" window. */
          if (check_response (&session))
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

  /* Update the config. */

  if (openvas_server_sendf (&session,
                            "<modify_config>"
                            "<name>%s</name>"
                            "<family_selection>"
                            "<growing>%i</growing>",
                            config,
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

  /** @todo Put in XML for "result of previous operation" window. */
  if (check_response (&session))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }

  openvas_server_close (socket, session);

  /* Return the next page. */

  if (next == NULL || strcmp (next, "Save Config") == 0)
    return get_config_omp (credentials, config, 1);
  return get_config_family_omp (credentials, config, next, NULL, NULL, 1);
}

/**
 * @brief Get details of a family for a configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
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
                       const char * name,
                       const char * family,
                       const char * sort_field,
                       const char * sort_order,
                       int edit)
{
  entity_t entity;
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
                          "<config><name>%s</name><family>%s</family></config>",
                          name,
                          family);

  /* Get the details for all NVT's in the config in the family. */

  if (openvas_server_sendf (&session,
                            "<get_nvt_details"
                            " config=\"%s\" family=\"%s\""
                            " sort_field=\"%s\" sort_order=\"%s\"/>",
                            name,
                            family,
                            sort_field ? sort_field : "name",
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }
  free_entity (entity);

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
                                sort_field ? sort_field : "name",
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

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting list of configs. "
                               "The current list of configs is not available. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_configs");
        }
      free_entity (entity);

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
 * @param[in]  config       Name of config.
 * @param[in]  family       Name of family.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  nvts         NVT's.
 *
 * @return Result of XSL transformation.
 */
char *
save_config_family_omp (credentials_t * credentials,
                        const char * config,
                        const char * family,
                        const char * sort_field,
                        const char * sort_order,
                        GArray *nvts)
{
  gnutls_session_t session;
  gchar *nvt;
  int socket, index = 0;

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while saving a config. "
                         "The current list of configs is not available. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_configs");

  /* Set the NVT selection. */

  if (openvas_server_sendf (&session,
                            "<modify_config>"
                            "<name>%s</name>"
                            "<nvt_selection>"
                            "<family>%s</family>",
                            config,
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

  /** @todo Put in XML for "result of previous operation" window. */
  if (check_response (&session))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a config. "
                           "It is unclear whether the entire config has been saved. "
                           "Diagnostics: Failure to send command to manager daemon.",
                           "/omp?cmd=get_configs");
    }

  openvas_server_close (socket, session);

  /* Return the Edit family page. */

  return get_config_family_omp (credentials, config, family, sort_field,
                                sort_order, 1);
}

/**
 * @brief Get details of an NVT for a config, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config       Name of config.
 * @param[in]  family       Name of family.
 * @param[in]  NVT          OID of NVT.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  edit         0 for config view page, else config edit page.
 *
 * @return Result of XSL transformation.
 */
char *
get_config_nvt_omp (credentials_t * credentials,
                    const char * config,
                    const char * family,
                    const char * nvt,
                    const char * sort_field,
                    const char * sort_order,
                    int edit)
{
  entity_t entity;
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
                          "<config><name>%s</name><family>%s</family></config>",
                          config,
                          family);


  if (openvas_server_sendf (&session,
                            "<get_nvt_details"
                            " config=\"%s\" family=\"%s\" oid=\"%s\""
                            " sort_field=\"%s\" sort_order=\"%s\"/>",
                            config,
                            family,
                            nvt,
                            sort_field ? sort_field : "name",
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

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting list of configs. "
                           "The current list of configs is not available. "
                           "Diagnostics: Failure to receive response from manager daemon.",
                           "/omp?cmd=get_configs");
    }
  free_entity (entity);

  g_string_append (xml, "</get_config_nvt_response>");
  openvas_server_close (socket, session);
  return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Save NVT prefs for a config, get NVT details, XSL transform result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config       Name of config.
 * @param[in]  family       Name of family.
 * @param[in]  NVT          OID of NVT.
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 * @param[in]  preferences  Preferences.
 * @param[in]  passwords    Passwords within preferences that must be updated.
 * @param[in]  timeout      0 to skip timeout preference.
 *
 * @return Result of XSL transformation.
 */
char *
save_config_nvt_omp (credentials_t * credentials,
                     const char * config,
                     const char * family,
                     const char * nvt,
                     const char * sort_field,
                     const char * sort_order,
                     GArray *preferences,
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

          /* Passwords have a radio to control whether they must be reset.
           * This works around the need for the Manager to send the actual
           * password. */

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
                                            "<modify_config>"
                                            "<name>%s</name>"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "</preference>"
                                            "</modify_config>",
                                            config,
                                            preference->name);
              else
                ret = openvas_server_sendf (&session,
                                            "<modify_config>"
                                            "<name>%s</name>"
                                            "<preference>"
                                            "<name>%s</name>"
                                            "<value>%s</value>"
                                            "</preference>"
                                            "</modify_config>",
                                            config,
                                            preference->name,
                                            value);
            }
          else
            ret = openvas_server_sendf (&session,
                                        "<modify_config>"
                                        "<name>%s</name>"
                                        "<preference>"
                                        "<nvt oid=\"%s\"/>"
                                        "<name>%s</name>"
                                        "<value>%s</value>"
                                        "</preference>"
                                        "</modify_config>",
                                        config,
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

          /** @todo Put in XML for "result of previous operation" window. */
          if (check_response (&session))
            {
              openvas_server_close (socket, session);
              return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred while saving a config. "
                                   "It is unclear whether the entire config has been saved. "
                                   "Diagnostics: Failure to send command to manager daemon.",
                                   "/omp?cmd=get_configs");
            }
        }

      openvas_server_close (socket, session);
    }

  /* Return the Edit NVT page. */

  return get_config_nvt_omp (credentials, config, family, nvt, sort_field,
                             sort_order, 1);
}

/**
 * @brief Delete config, get all configs, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  config_name  Name of config.
 *
 * @return Result of XSL transformation.
 */
char *
delete_config_omp (credentials_t * credentials, const char *config_name)
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
                            "<delete_config><name>%s</name></delete_config>"
                            "<get_configs"
                            " sort_field=\"name\""
                            " sort_order=\"ascending\"/>"
                            "</commands>",
                            config_name)
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
 * @param[in]  credentials   Username and password for authentication.
 * @param[in]  report_id     ID of report.
 * @param[in]  format        Format of report.
 * @param[out] report_len    Length of report.
 * @param[in]  first_result  Number of first result in report.
 * @param[in]  max_results   Number of results in report.
 * @param[in]  sort_field    Field to sort on, or NULL.
 * @param[in]  sort_order    "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_report_omp (credentials_t * credentials, const char *report_id,
                const char *format, unsigned int *report_len,
                const unsigned int first_result,
                const unsigned int max_results,
                const char * sort_field, const char * sort_order,
                const char * levels)
{
  char *report_encoded = NULL;
  gchar *report_decoded = NULL;
  GString *xml;
  entity_t entity;
  entity_t report_entity;
  gnutls_session_t session;
  int socket;

  *report_len = 0;

  if (levels == NULL || strlen (levels) == 0) levels = "hm";

  if (format == NULL || strlen (format) == 0) format = "xml";

  if (manager_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a report. "
                         "The report could not be delivered. "
                         "Diagnostics: Failure to connect to manager daemon.",
                         "/omp?cmd=get_status");

  xml = g_string_new ("<commands_response>");

  if (openvas_server_sendf (&session,
                            "<get_report"
                            " report_id=\"%s\""
                            " format=\"%s\""
                            " first_result=\"%u\""
                            " max_results=\"%u\""
                            " sort_field=\"%s\""
                            " sort_order=\"%s\""
                            " levels=\"%s\"/>",
                            report_id,
                            format,
                            first_result,
                            max_results,
                            sort_field ? sort_field : "type",
                            sort_order
                             ? sort_order
                             : ((sort_field == NULL
                                 || strcmp (sort_field, "type") == 0)
                                ? "descending"
                                : "ascending"),
                            levels)
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

  if (strcmp (format, "nbe") == 0
      || strcmp (format, "pdf") == 0
      || strcmp (format, "html") == 0
      || strcmp (format, "html-pdf") == 0)
    {
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
  else
    {
      /* Presume format XML. */

      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting a report. "
                               "The report could not be delivered. "
                               "Diagnostics: Failure to receive response from manager daemon.",
                               "/omp?cmd=get_status");
        }
      free_entity (entity);

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
                                  " levels=\"hmlg\"/>",
                                  report_id,
                                  first_result,
                                  max_results)
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

        if (read_entity_and_string (&session, &entity, &xml))
          {
            g_string_free (xml, TRUE);
            openvas_server_close (socket, session);
            return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while getting a report. "
                                 "The report could not be delivered. "
                                 "Diagnostics: Failure to receive response from manager daemon.",
                                 "/omp?cmd=get_status");
          }
        free_entity (entity);

        g_string_append (xml, "</all>");
      }

      g_string_append (xml, "</commands_response>");
      openvas_server_close (socket, session);
      return xsl_transform_omp (credentials, g_string_free (xml, FALSE));
    }
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

  socket = openvas_server_open (&session, OPENVASMD_ADDRESS, manager_port);
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
  *socket = openvas_server_open (session, OPENVASMD_ADDRESS, manager_port);
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
