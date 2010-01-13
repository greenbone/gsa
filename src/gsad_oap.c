/* Greenbone Security Assistant
 * $Id$
 * Description: OAP communication module.
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
 * @file gsad_oap.c
 * @brief OAP communication module of Greenbone Security Assistant daemon.
 *
 * This file implements an API for OAP.  The functions call the
 * OpenVAS Administrator via OAP properly, and apply XSL-Transforms
 * to deliver an HTML result.
 */

#include <gnutls/gnutls.h> /* for gnutls_session_t */
#include <string.h> /* for strlen */

#include "gsad_base.h" /* for credentials_t */
#include "tracef.h" /* for tracef */

#include <openvas/openvas_server.h> /* for openvas_server_open */
#include <openvas/omp/omp.h> /* for omp_authenticate */

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad  oap"

/**
 * @brief Administrator (openvasad) default address.
 */
#define OPENVASAD_ADDRESS "127.0.0.1"

/**
 * @brief The default port the administrator is on.
 */
int administrator_port = 9393;

/**
 * @brief Connect to OpenVAS Administrator daemon.
 *
 * @param[in]   credentials  Username and password for authentication
 * @param[out]  socket       Administrator socket on success.
 * @param[out]  session      GNUTLS session on success.
 *
 * @return 0 success, -1 failed to connect, -2 authentication failed.
 */
int
administrator_connect (credentials_t *credentials, int *socket,
                       gnutls_session_t *session)
{
  *socket = openvas_server_open (session,
                                 OPENVASAD_ADDRESS,
                                 administrator_port);
  if (*socket == -1)
    {
      tracef ("socket is not there!\n");
      return -1;
    }

#if 0
  tracef ("in %s: Trying to authenticate with %s/%s\n",
          __FUNCTION__,
          credentials->username,
          credentials->password);
#endif

  /* @todo OAP authentication is the same as OMP.  Eventually this might
   *       diverge or get abstracted. */
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

/**
 * @brief Init the GSA OAP library.
 *
 * @param[in]  port_administrator  Port number where the OpenVAS Admnistrator
 *                                 Daemon is listening
 */
void
oap_init (int port_administrator)
{
  administrator_port = port_administrator;
}

/**
 * @brief Wrap some XML in an envelope and XSL transform the envelope.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  xml          XML string.
 *
 * @return Result of XSL transformation.
 */
static char *
xsl_transform_oap (credentials_t * credentials, gchar * xml)
{
  gchar *res = g_strdup_printf ("<envelope><login>%s</login>%s</envelope>",
                                credentials->username,
                                xml);
  char *html = xsl_transform (res);
  g_free (res);
  g_free (xml);
  return html;
}

/**
 * @brief Create a user, get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  name         New user name.
 * @param[in]  password     New user password.
 * @param[in]  role         New user role.
 *
 * @return Result of XSL transformation.
 */
char *
create_user_oap (credentials_t * credentials,
                 const char *name, const char *password, const char *role)
{
  entity_t entity;
  gnutls_session_t session;
  GString *xml;
  int socket;

  if (administrator_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while creating a new user. "
                         "No new user has been created. "
                         "Diagnostics: Failure to connect to administrator daemon.",
                         "/oap?cmd=get_users");

  xml = g_string_new ("<commands_response>");

  if (name == NULL || password == NULL || role == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create User"));
  else
    {
      /* Create the user. */

      if (openvas_server_sendf (&session,
                                "<create_user>"
                                "<name>%s</name>"
                                "<password>%s</password>"
                                "<role>%s</role>"
                                "</create_user>",
                                name,
                                password,
                                role)
          == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new user. "
                               "No new user has been created. "
                               "Diagnostics: Failure to send command to administrator daemon.",
                               "/oap?cmd=get_users");
        }

      entity = NULL;
      if (read_entity_and_string (&session, &entity, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new user. "
                               "It is unclear whether the user has been created or not. "
                               "Diagnostics: Failure to receive response from administrator daemon.",
                               "/oap?cmd=get_users");
        }
      free_entity (entity);
    }

  /* Get all users. */

  if (openvas_server_send (&session, "<get_users/>") == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new user. "
                           "The new user has, however, been created. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/oap?cmd=get_users");
    }

  entity = NULL;
  if (read_entity_and_string (&session, &entity, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new user. "
                           "The new user has, however, been created. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/oap?cmd=get_users");
    }
  free_entity (entity);

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete a user, get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  user_name    Name of user to remove.
 *
 * @return Result of XSL transformation.
 */
char *
delete_user_oap (credentials_t * credentials, const char *user_name)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  if (administrator_connect (credentials, &socket, &session))
    return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a user. "
                         "The user is not deleted. "
                         "Diagnostics: Failure to connect to administrator daemon.",
                         "/oap?cmd=get_users");

  if (openvas_server_sendf
      (&session,
       "<commands><delete_user name=\"%s\"/><get_users/></commands>",
       user_name) == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a user. "
                           "The user is not deleted. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/oap?cmd=get_users");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a user. "
                           "It is unclear whether the user has been deleted or not. "
                           "Diagnostics: Failure to read response from administrator daemon.",
                           "/oap?cmd=get_users");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get all users and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_users_oap (credentials_t * credentials, const char * sort_field,
               const char * sort_order)
{
  tracef ("In get_users_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  switch (administrator_connect (credentials, &socket, &session))
    {
      case -1:
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the user list. "
                             "The current list of users is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_status");
      case -2:
        return xsl_transform_oap (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"List Users\">"
                                    "Only users given the Administrator role"
                                    " may access User Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_users"
                            " sort_field=\"%s\" sort_order=\"%s\"/>"
                            "</commands>",
                            sort_field ? sort_field : "ROWID",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of users is not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of users is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  tracef ("get_users_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get descriptions of the feed(s) connected to the administrator.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_feed_oap (credentials_t * credentials, const char * sort_field,
               const char * sort_order)
{
  tracef ("In get_feed_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  switch (administrator_connect (credentials, &socket, &session))
    {
      case -1:
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the user list. "
                             "The current list of feeds is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_status");
      case -2:
        return xsl_transform_oap (credentials,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the feed list. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  tracef ("get_feed_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Synchronize with an NVT feed and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 *
 * @return Result of XSL transformation.
 */
char *
sync_feed_oap (credentials_t * credentials)
{
  tracef ("In sync_feed_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  switch (administrator_connect (credentials, &socket, &session))
    {
      case -1:
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while synchronizing with the NVT feed. "
                             "Feed synchronization is currently not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_status");
      case -2:
        return xsl_transform_oap (credentials,
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
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the NVT feed. "
                           "Feed synchronization is currently not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the NVT feed. "
                           "Feed synchronization is currently not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  tracef ("sync_feed_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get all settings and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  sort_field   Field to sort on, or NULL.
 * @param[in]  sort_order   "ascending", "descending", or NULL.
 *
 * @return Result of XSL transformation.
 */
char *
get_settings_oap (credentials_t * credentials, const char * sort_field,
                  const char * sort_order)
{
  tracef ("In get_settings_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;

  switch (administrator_connect (credentials, &socket, &session))
    {
      case -1:
        return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the user list. "
                             "The current list of settings is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_status");
      case -2:
        return xsl_transform_oap (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"List Configurations\">"
                                    "Only users given the Administrator role"
                                    " may access the settings list."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_settings/>"
                            "</commands>")
      == -1)
    {
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_status");
    }

  entity = NULL;
  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message ("Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_status");
    }
  free_entity (entity);

  openvas_server_close (socket, session);
  tracef ("get_settings_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}
