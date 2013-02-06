/* Greenbone Security Assistant
 * $Id$
 * Description: OAP communication module.
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
 * @file gsad_oap.c
 * @brief OAP communication module of Greenbone Security Assistant daemon.
 *
 * This file implements an API for OAP.  The functions call the
 * OpenVAS Administrator via OAP properly, and apply XSL-Transforms
 * to deliver an HTML result.
 */

#include <assert.h>
#include <gnutls/gnutls.h> /* for gnutls_session_t */
#include <string.h> /* for strlen */

#include "gsad_base.h" /* for credentials_t */
#include "tracef.h" /* for tracef */

#include <openvas/misc/openvas_server.h> /* for openvas_server_open */
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
 * @brief The address the administrator is on.
 */
gchar *administrator_address = NULL;

/**
 * @brief The default port the administrator is on.
 */
int administrator_port = 9393;

int
token_user_remove (const char *);

/**
 * @brief Connect to OpenVAS Administrator daemon.
 *
 * @param[in]   credentials  Username and password for authentication
 * @param[out]  socket       Administrator socket on success.
 * @param[out]  session      GNUTLS session on success.
 * @param[out]  html         HTML on failure to connect if possible, else NULL.
 *
 * @return 0 success, -1 failed to connect, -2 authentication failed.
 */
int
administrator_connect (credentials_t *credentials, int *socket,
                       gnutls_session_t *session, gchar **html)
{
  *socket = openvas_server_open (session,
                                 administrator_address
                                  ? administrator_address
                                  : OPENVASAD_ADDRESS,
                                 administrator_port);
  if (*socket == -1)
    {
      time_t now;
      gchar *xml;
      char *res;
      char ctime_now[200];
      int ret;

      tracef ("socket is not there!\n");

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
                             "Logged out. OAP service is down."
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
   *
   * An easier method is to run gsad under gdb and set a breakpoint here.
   */
  tracef ("Sleeping!");
  sleep (10);
#endif
  return 0;
}

/**
 * @brief Init the GSA OAP library.
 *
 * @param[in]  address_administrator  Administrator address (copied).
 * @param[in]  port_administrator     Port number where the OpenVAS Admnistrator
 *                                    Daemon is listening
 */
void
oap_init (const gchar *address_administrator, int port_administrator)
{
  if (address_administrator)
    administrator_address = g_strdup (address_administrator);
  administrator_port = port_administrator;
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
xsl_transform_oap (credentials_t * credentials, gchar * xml)
{
  time_t now;
  gchar *res;
  GString *string;
  char *html;
  char ctime_now[200];

  assert (credentials);

  now = time (NULL);
  ctime_r_strip_newline (&now, ctime_now);

  string = g_string_new ("");

  res = g_markup_printf_escaped ("<envelope>"
                                 "<token>%s</token>"
                                 "<caller>%s</caller>"
                                 "<time>%s</time>"
                                 "<timezone>%s</timezone>"
                                 "<login>%s</login>"
                                 "<role>%s</role>",
                                 credentials->token,
                                 credentials->caller ? credentials->caller : "",
                                 ctime_now,
                                 credentials->timezone
                                   ? credentials->timezone : "",
                                 credentials->username,
                                 credentials->role);
  g_string_append (string, res);
  g_free (res);
  g_string_append_printf (string,
                          "<capabilities>%s</capabilities>"
                          "%s"
                          "</envelope>",
                          credentials->capabilities,
                          xml);

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
 * @brief Create a user, get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
create_user_oap (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  GString *xml;
  int socket;
  gchar *html;
  const char *name, *password, *role, *hosts, *hosts_allow,
             *enable_ldap_connect;

  switch (administrator_connect (credentials, &socket, &session, &html))
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
                             "An internal error occurred while creating a new user. "
                             "No new user has been created. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/oap?cmd=get_users");
    }

  xml = g_string_new ("<commands_response>");

  name = params_value (params, "login");
  password = params_value (params, "password");
  role = params_value (params, "role");
  hosts = params_value (params, "access_hosts");
  hosts_allow = params_value (params, "hosts_allow");
  enable_ldap_connect = params_value (params, "enable_ldap_connect");

  if (name == NULL || password == NULL || role == NULL || hosts == NULL
      || hosts_allow == NULL)
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Create User"));
  else
    {
      int ret;

      /* Create the user. */

      GString * string = g_string_new ("<create_user>");
      gchar * buf = g_markup_printf_escaped (
                                        "<name>%s</name>"
                                        "<password>%s</password>"
                                        "<role>%s</role>",
                                        name,
                                        password,
                                        role);
      g_string_append (string, buf);
      g_free (buf);
      if (strcmp (hosts_allow, "2") && strlen (hosts))
        {
          buf = g_markup_printf_escaped ("<hosts allow=\"%s\">%s</hosts>",
                                         hosts_allow,
                                         hosts);
          g_string_append (string, buf);
          g_free (buf);
        }
      if ((enable_ldap_connect) && (strcmp (enable_ldap_connect, "1") == 0))
        {
          g_string_append (string,
            "<sources><source>ldap_connect</source></sources>");
        }
      g_string_append (string, "</create_user>");

      buf = g_string_free (string, FALSE);
      ret = openvas_server_send (&session, buf);
      g_free (buf);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new user. "
                               "No new user has been created. "
                               "Diagnostics: Failure to send command to administrator daemon.",
                               "/oap?cmd=get_users");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while creating a new user. "
                               "It is unclear whether the user has been created or not. "
                               "Diagnostics: Failure to receive response from administrator daemon.",
                               "/oap?cmd=get_users");
        }
    }

  /* Get all users. */

  if (openvas_server_send (&session, "<commands><get_users/><describe_auth/></commands>") == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new user. "
                           "The new user has, however, been created. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/oap?cmd=get_users");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while creating a new user. "
                           "The new user has, however, been created. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/oap?cmd=get_users");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</commands_response>");
  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Save a maybe modified user, get all users, XSL transform the result.
 *
 * @param[in]  credentials      Username and password for authentication
 * @param[in]  name             User name.
 * @param[in]  params           Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
save_user_oap (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  GString *xml;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
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
                             "An internal error occurred while saving a user. "
                             "No saving has been done. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/oap?cmd=get_users");
    }

  xml = g_string_new ("<get_users>");

  if (params_valid (params, "login") && params_valid (params, "modify_password")
      && params_valid (params, "password") && params_valid (params, "role")
      && params_valid (params, "access_hosts")
      && params_valid (params, "hosts_allow"))
    {
      int ret;
      const gchar *name, *modify_password, *password, *role, *hosts;
      const gchar *hosts_allow, *enable_ldap_connect;

      name = params_value (params, "login");
      modify_password = params_value (params, "modify_password");
      password = params_value (params, "password");
      role = params_value (params, "role");
      /* List of hosts user has/lacks access rights. */
      hosts = params_value (params, "access_hosts");
      /* Whether hosts grants ("1") or forbids ("0") access.  "2" for all
       * access. */
      hosts_allow = params_value (params, "hosts_allow");

      enable_ldap_connect = params_value (params, "enable_ldap_connect");

      /* Modify the user. */

      GString * command = g_string_new ("<modify_user>");
      gchar * buf = g_markup_printf_escaped ("<name>%s</name>"
                                             "<password modify=\"%s\">"
                                             "%s</password>"
                                             "<role>%s</role>",
                                             name,
                                             modify_password,
                                             password,
                                             role);
      g_string_append (command, buf);
      g_free (buf);
      if (strcmp (hosts_allow, "2") && strlen (hosts))
        {
          buf = g_markup_printf_escaped ("<hosts allow=\"%s\">%s</hosts>",
                                         hosts_allow, hosts);
        }
      else
        {
          buf = g_strdup ("<hosts allow=\"0\"></hosts>");
        }
      g_string_append (command, buf);
      g_free (buf);

      if (enable_ldap_connect && strcmp (enable_ldap_connect, "1") == 0)
        {
          g_string_append (command, "<sources><source>ldap_connect</source></sources>");
        }
      else
        {
          g_string_append (command, "<sources><source></source></sources>");
        }
      g_string_append (command, "</modify_user>");

      buf = g_string_free (command, FALSE);
      ret = openvas_server_send (&session, buf);
      g_free (buf);

      if (ret == -1)
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a user. "
                               "No saving has been done. "
                               "Diagnostics: Failure to send command to administrator daemon.",
                               "/oap?cmd=get_users");
        }

      if (read_string (&session, &xml))
        {
          g_string_free (xml, TRUE);
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while saving a user. "
                               "It is unclear whether the user has been modified. "
                               "Diagnostics: Failure to receive response from administrator daemon.",
                               "/oap?cmd=get_users");
        }
    }
  else
    g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Save User"));

  /* Get all users. */

  if (openvas_server_send (&session, "<commands><get_users/><describe_auth/></commands>") == -1)
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a user. "
                           "The user has, however, been saving. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/oap?cmd=get_users");
    }

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving a user. "
                           "The user has, however, been saved. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/oap?cmd=get_users");
    }

  /* Cleanup, and return transformed XML. */

  g_string_append (xml, "</get_users>");
  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Delete a user, get all users, XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
delete_user_oap (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *user_name;

  user_name = params_value (params, "name");

  if (user_name == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while deleting a user. "
                         "The user was not deleted. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_users");

  switch (administrator_connect (credentials, &socket, &session, &html))
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
                             "An internal error occurred while deleting a user. "
                             "The user is not deleted. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/oap?cmd=get_users");
    }

  if (openvas_server_sendf
      (&session,
       "<commands>"
       "<delete_user name=\"%s\"/>"
       "<get_users/>"
       "<describe_auth/>"
       "</commands>",
       user_name) == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a user. "
                           "The user is not deleted. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/oap?cmd=get_users");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while deleting a user. "
                           "It is unclear whether the user has been deleted or not. "
                           "Diagnostics: Failure to read response from administrator daemon.",
                           "/oap?cmd=get_users");
    }

  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get a user for editing and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_user_oap (credentials_t * credentials, params_t * params)
{
  tracef ("In edit_users_oap\n");
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;

  if (params_value (params, "login") == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting the user. "
                         "Diagnostics: Username error.",
                         "/omp?cmd=get_users");

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the user. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_users");
      case -2:
        return xsl_transform_oap (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Get User\">"
                                    "Only users given the Administrator role"
                                    " may access User Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_users name=\"%s\"/>"
                            "<describe_auth/>"
                            "</commands>",
                            params_value (params, "login"))
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_users");
    }

  xml = g_string_new ("<edit_user>");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting user. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_users");
    }

  g_string_append (xml, "</edit_user>");
  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get a user and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_user_oap (credentials_t * credentials, params_t *params)
{
  tracef ("In get_users_oap\n");
  GString *xml;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *name;

  name = params_value (params, "login");

  if (name == NULL)
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred while getting a user. "
                         "Diagnostics: Required parameter was NULL.",
                         "/omp?cmd=get_users");

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the user. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_users");
      case -2:
        return xsl_transform_oap (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Get User\">"
                                    "Only users given the Administrator role"
                                    " may access User Administration."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session,
                            "<commands><get_users name=\"%s\"/><describe_auth/></commands>",
                            name)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_users");
    }

  xml = g_string_new ("<get_user>");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting user. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_users");
    }

  g_string_append (xml, "</get_user>");
  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Get all users and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_users_oap (credentials_t * credentials, params_t *params)
{
  tracef ("In get_users_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;
  const char *sort_field, *sort_order;

  sort_field = params_value (params, "sort_field");
  sort_order = params_value (params, "sort_order");

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the user list. "
                             "The current list of users is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
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
                            "<describe_auth/>"
                            "</commands>",
                            sort_field ? sort_field : "ROWID",
                            sort_order ? sort_order : "ascending")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of users is not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of users is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("get_users_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get descriptions of the feed(s) connected to the administrator.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_feed_oap (credentials_t * credentials, params_t *params)
{
  tracef ("In get_feed_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the feed list. "
                             "The current list of feeds is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the feed list. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the feed. "
                           "The current list of feeds is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("get_feed_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get descriptions of the scap feed(s) connected to the administrator.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_scap_oap(credentials_t * credentials, params_t *params)
{
  tracef ("In get_scap_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the SCAP feed list. "
                             "The current list of SCAP feeds is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_oap (credentials,
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
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting SCAP the feed. "
                           "The current list of SCAP feeds is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("get_scap_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get descriptions of the CERT feed(s) connected to the administrator.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
get_cert_oap(credentials_t * credentials, params_t *params)
{
  tracef ("In get_cert_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the CERT feed list. "
                             "The current list of CERT feeds is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_oap (credentials,
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
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the CERT feed. "
                           "The current list of CERT feeds is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("get_cert_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
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
sync_feed_oap (credentials_t * credentials, params_t *params)
{
  tracef ("In sync_feed_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while synchronizing with the NVT feed. "
                             "Feed synchronization is currently not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the NVT feed. "
                           "Feed synchronization is currently not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the NVT feed. "
                           "Feed synchronization is currently not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("sync_feed_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
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
sync_scap_oap (credentials_t * credentials, params_t *params)
{
  tracef ("In sync_scap_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while synchronizing with the SCAP feed. "
                             "SCAP Feed synchronization is currently not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_oap (credentials,
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
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the SCAP feed. "
                           "SCAP Feed synchronization is currently not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("sync_scap_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
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
sync_cert_oap (credentials_t * credentials, params_t *params)
{
  tracef ("In sync_cert_oap\n");
  entity_t entity;
  char *text = NULL;
  gnutls_session_t session;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while synchronizing with the CERT feed. "
                             "CERT Feed synchronization is currently not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_oap (credentials,
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
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while synchronizing with the CERT feed. "
                           "CERT Feed synchronization is currently not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("sync_cert_oap: got text: %s", text);
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
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the user list. "
                             "The current list of settings is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
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
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the user list. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  openvas_server_close (socket, session);
  tracef ("get_settings_oap: got text: %s", text);
  fflush (stderr);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Get all settings and XSL transform the result.
 *
 * @param[in]  credentials  Username and password for authentication
 * @param[in]  params       Request parameters.
 *
 * @return Result of XSL transformation.
 */
char *
edit_settings_oap (credentials_t * credentials, params_t *params)
{
  gnutls_session_t session;
  GString *xml;
  int socket;
  gchar *html;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while getting the settings. "
                             "The current list of settings is not available. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_oap (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Edit Settings\">"
                                    "Only users given the Administrator role"
                                    " may edit the settings."
                                    "</gsad_msg>"));
    }

  if (openvas_server_sendf (&session, "<get_settings/>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  xml = g_string_new ("<edit_settings>");

  if (read_string (&session, &xml))
    {
      g_string_free (xml, TRUE);
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "The current list of settings is not available. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  g_string_append (xml, "</edit_settings>");
  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, g_string_free (xml, FALSE));
}

/**
 * @brief Save settings.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params       Request parameters.
 *
 * @return Following page.
 */
char *
save_settings_oap (credentials_t * credentials, params_t *params)
{
  entity_t entity;
  gnutls_session_t session;
  int socket;
  char *text = NULL;
  gchar *html;
  params_t *settings;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the settings. "
                             "The settings have not been saved. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_oap (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Save Settings\">"
                                    "Only users given the Administrator role"
                                    " may save the settings."
                                    "</gsad_msg>"));
    }

  /* Save settings. */

  if (openvas_server_send (&session, "<commands>"
                                     "<modify_settings>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving the settings. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_configs");
    }

  settings = params_values (params, "method_data:");
  if (settings)
    {
      params_iterator_t iter;
      param_t *setting;
      char *name;

      params_iterator_init (&iter, settings);
      while (params_iterator_next (&iter, &name, &setting))
        if (openvas_server_sendf (&session,
                                  "<setting>"
                                  "<name>%s</name>"
                                  "<value>%s</value>"
                                  "</setting>",
                                  name,
                                  setting->value)
            == -1)
          {
            openvas_server_close (socket, session);
            return gsad_message (credentials,
                                 "Internal error", __FUNCTION__, __LINE__,
                                 "An internal error occurred while saving the settings. "
                                 "Diagnostics: Failure to send command to administrator daemon.",
                                 "/omp?cmd=get_configs");
          }
    }

  if (openvas_server_send (&session, "</modify_settings>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving the settings. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_configs");
    }

  /* Get the settings. */

  if (openvas_server_send (&session, "<get_settings/>"
                                     "</commands>")
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the settings. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, text);
}

/**
 * @brief Sends a modify_auth with the settings adjustable via the GSA to the
 * @brief openvas-administrator.
 *
 * @param[in]  credentials  Username and password for authentication.
 * @param[in]  params        Request parameters.
 *
 * @return XSL transformated list of users and configuration.
 */
char*
modify_auth_oap (credentials_t* credentials, params_t *params)
{
  tracef ("In modify_auth_oap\n");
  entity_t entity;
  gnutls_session_t session;
  int socket;
  char *text = NULL;
  char* truefalse;
  GString* xml = NULL;
  gchar *html;
  const char *ldaphost, *method, *authdn, *domain;

  switch (administrator_connect (credentials, &socket, &session, &html))
    {
      case -1:
        if (html)
          return html;
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred while saving the ldap settings. "
                             "The settings have not been saved. "
                             "Diagnostics: Failure to connect to administrator daemon.",
                             "/omp?cmd=get_tasks");
      case -2:
        return xsl_transform_oap (credentials,
                                  g_strdup
                                   ("<gsad_msg status_text=\"Access refused.\""
                                    " operation=\"Save Settings\">"
                                    "Only users given the Administrator role"
                                    " may save the settings."
                                    "</gsad_msg>"));
    }

  truefalse = (params_value (params, "enable")
               && strcmp (params_value (params, "enable"), "1") == 0)
                ? "true" : "false";

  ldaphost = params_value (params, "ldaphost");
  method = params_value (params, "group");
  authdn = params_value (params, "authdn");
  domain = params_value (params, "domain");

  if (ldaphost == NULL || method == NULL
      || (strcmp (method, "method:ldap") == 0 && authdn == NULL)
      || (strcmp (method, "method:ads")  == 0 && domain == NULL)
      || (strcmp (method, "method:ldap_connect") == 0 && authdn == NULL))
    {
      /* Parameter validation failed. Only send get_users and describe_auth. */
       if (openvas_server_send (&session,
                                "<commands>"
                                "<get_users/><describe_auth/>"
                                "</commands>")
           == -1)
        {
          openvas_server_close (socket, session);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the users list. "
                               "Diagnostics: Failure to send command to administrator daemon.",
                               "/omp?cmd=get_tasks");
        }

      xml = g_string_new ("");
      g_string_append (xml, GSAD_MESSAGE_INVALID_PARAM ("Modify Authentication Configuration"));

      if (read_string (&session, &xml))
        {
          openvas_server_close (socket, session);
          g_string_free (xml, TRUE);
          return gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occurred while getting the users list. "
                               "Diagnostics: Failure to receive response from administrator daemon.",
                               "/omp?cmd=get_tasks");
        }

      openvas_server_close (socket, session);
      return xsl_transform_oap (credentials, g_string_free (xml, FALSE));
    }

  /* Input is valid. Save settings. */

  /** @warning authdn shall contain a single %s, handle with care. */
  if (openvas_server_sendf (&session,
                            "<commands>"
                            "<get_users/>"
                            "<modify_auth><group name=\"%s\">"
                            "<auth_conf_setting key=\"enable\" value=\"%s\"/>"
                            "<auth_conf_setting key=\"ldaphost\" value=\"%s\"/>"
                            "<auth_conf_setting key=\"%s\" value=\"%s\"/>"
                            "</group></modify_auth>"
                            "<describe_auth/></commands>",
                            method,
                            truefalse,
                            ldaphost,
                            (strcmp (method, "method:ads") == 0) ? "domain"
                                                                 : "authdn",
                            (strcmp (method, "method:ads") == 0) ? domain
                                                                 : authdn)
      == -1)
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while saving the ldap settings. "
                           "Diagnostics: Failure to send command to administrator daemon.",
                           "/omp?cmd=get_configs");
    }

  if (read_entity_and_text (&session, &entity, &text))
    {
      openvas_server_close (socket, session);
      return gsad_message (credentials,
                           "Internal error", __FUNCTION__, __LINE__,
                           "An internal error occurred while getting the ldap settings. "
                           "Diagnostics: Failure to receive response from administrator daemon.",
                           "/omp?cmd=get_tasks");
    }

  /* Cleanup, and return transformed XML. */

  openvas_server_close (socket, session);
  return xsl_transform_oap (credentials, text);
}
