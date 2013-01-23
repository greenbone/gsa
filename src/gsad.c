/* Greenbone Security Assistant
 * $Id$
 * Description: Main module of Greenbone Security Assistant daemon.
 *
 * Authors:
 * Chandrashekhar B <bchandra@secpod.com>
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
 * @file gsad.c
 * @brief Main module of Greenbone Security Assistant daemon
 *
 * This file contains the core of the GSA server process that
 * handles HTTPS requests and communicates with OpenVAS-Manager via the
 * OMP protocol.
 */

/**
 * \mainpage
 * \section Introduction
 * \verbinclude README
 *
 * \section Installation
 * \verbinclude INSTALL
 *
 * \section copying License Information
 * \verbinclude COPYING
 */

/**
 * @brief The Glib fatal mask, redefined to leave out G_LOG_FLAG_RECURSION.
 */
#undef G_LOG_FATAL_MASK
#define G_LOG_FATAL_MASK G_LOG_LEVEL_ERROR

#include <arpa/inet.h>
#include <assert.h>
#include <errno.h>
#include <gcrypt.h>
#include <glib.h>
#include <gnutls/gnutls.h>
#include <locale.h>
#include <netinet/in.h>
#include <openvas/misc/openvas_logging.h>
#include <openvas/base/openvas_file.h>
#include <openvas/base/pidfile.h>
#include <openvas/misc/openvas_uuid.h>
#include <pthread.h>
#include <pwd.h> /* for getpwnam */
#include <signal.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
/* This must follow the system includes. */
#include <microhttpd.h>

#include "gsad_base.h"
#include "gsad_omp.h"
#include "gsad_oap.h" /* for create_user_oap */
#include "tracef.h"
#include "validator.h"

/**
 * @brief Name of the cookie used to store the SID.
 */
#define SID_COOKIE_NAME "GSAD_SID"

/**
 * @brief Fallback GSAD port for HTTPS.
 */
#define DEFAULT_GSAD_HTTPS_PORT 443

/**
 * @brief Fallback GSAD port for HTTP.
 */
#define DEFAULT_GSAD_HTTP_PORT 80

/**
 * @brief Fallback unprivileged GSAD port.
 */
#define DEFAULT_GSAD_PORT 9392

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
 * @brief Buffer size for POST processor.
 */
#define POST_BUFFER_SIZE 500000

/**
 * @brief Maximum length of "file name" for /help/ or /dialog/ URLs.
 */
#define MAX_FILE_NAME_SIZE 128

/**
 * @brief Max number of minutes between activity in a session.
 */
#define SESSION_TIMEOUT 15

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
 * @brief The IP address of this program, "the GSAD".
 */
struct sockaddr_in gsad_address;

/**
 * @brief Location for redirection server.
 */
gchar *redirect_location = NULL;

/**
 * @brief PID of redirect child in parent, 0 in child.
 */
pid_t redirect_pid = 0;

/** @todo Ensure the accesses to these are thread safe. */

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
 * @brief Whether to use a secure cookie.
 *
 * This is always true when using HTTPS.
 */
int use_secure_cookie = 1;

/**
 * @brief Maximum number of minutes of user idle time.
 */
int session_timeout;

/**
 * @brief User session data.
 */
GPtrArray *users = NULL;

/**
 * @brief User information structure, for sessions.
 */
struct user
{
  char *cookie;        ///< Cookie token.
  char *token;         ///< Request session token.
  gchar *username;     ///< Login name.
  gchar *password;     ///< Password.
  gchar *role;         ///< Role.
  gchar *timezone;     ///< Timezone.
  gchar *capabilities; ///< Capabilities.
  time_t time;         ///< Login time.
};

/**
 * @brief User information type, for sessions.
 */
typedef struct user user_t;

/**
 * @brief Mutex to prevent concurrent access to user information.
 */
static GMutex *mutex = NULL;

/**
 * @brief Add a user.
 *
 * It's up to the caller to release the returned user.
 *
 * @param[in]  username      Name of user.
 * @param[in]  password      Password for user.
 * @param[in]  timezone      Timezone of user.
 * @param[in]  role          Role of user.
 * @param[in]  capabilities  Capabilities of manager.
 *
 * @return Added user.
 */
user_t *
user_add (const gchar *username, const gchar *password, const gchar *timezone,
          const gchar *role, const gchar *capabilities)
{
  user_t *user = NULL;
  int index;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->username, username) == 0)
        {
          user = item;
          break;
        }
    }
  if (user)
    {
      free (user->token);
      user->token = openvas_uuid_make ();
      free (user->cookie);
      user->cookie = openvas_uuid_make ();
      g_free (user->password);
      user->password = g_strdup (password);
      g_free (user->role);
      user->role = g_strdup (role);
      g_free (user->timezone);
      user->timezone = g_strdup (timezone);
      g_free (user->capabilities);
      user->capabilities = g_strdup (capabilities);
    }
  else
    {
      user = g_malloc (sizeof (user_t));
      user->cookie = openvas_uuid_make ();
      user->token = openvas_uuid_make ();
      user->username = g_strdup (username);
      user->password = g_strdup (password);
      user->role = g_strdup (role);
      user->timezone = g_strdup (timezone);
      user->capabilities = g_strdup (capabilities);
      g_ptr_array_add (users, (gpointer) user);
    }
  user->time = time (NULL);
  return user;
}

/**
 * @brief Add a user.
 *
 * If a user is returned, it's up to the caller to release the user.
 *
 * @param[in]   cookie       Token in cookie.
 * @param[in]   token        Token request parameter.
 * @param[out]  user_return  User.
 *
 * @return 0 ok (user in user_return), 1 bad token, 2 expired token,
 *         3 bad/missing cookie.
 */
int
user_find (const gchar *cookie, const gchar *token, user_t **user_return)
{
  int ret;
  user_t *user = NULL;
  int index;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          if ((cookie == NULL) || strcmp (item->cookie, cookie))
            {
              /* Check if the session has expired. */
              if (time (NULL) - item->time > (session_timeout * 60))
                /* Probably the browser removed the cookie. */
                ret = 2;
              else
                ret = 3;
              break;
            }
          user = item;
          break;
        }
    }
  if (user)
    {
      if (time (NULL) - user->time > (session_timeout * 60))
        ret = 2;
      else
        {
          *user_return = user;
          ret = 0;
          user->time = time (NULL);
          return ret;
        }
    }
  else
    ret = 2;
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set timezone of user.
 *
 * @param[in]   name      User name.
 * @param[in]   timezone  Timezone.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_timezone (const gchar *name, const gchar *timezone)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->username, name) == 0)
        {
          g_free (item->timezone);
          item->timezone = g_strdup (timezone);
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set password of user.
 *
 * @param[in]   name      User name.
 * @param[in]   password  Password.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_password (const gchar *name, const gchar *password)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->username, name) == 0)
        {
          g_free (item->password);
          item->password = g_strdup (password);
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Release a user_t returned by user_add or user_find.
 *
 * @param[in]  user  User.
 */
void
user_release (user_t *user)
{
  g_mutex_unlock (mutex);
}

/**
 * @brief Remove a user from the session "database", releasing the user_t too.
 *
 * @param[in]  user  User.
 */
void
user_remove (user_t *user)
{
  g_ptr_array_remove (users, (gpointer) user);
  g_mutex_unlock (mutex);
}

/**
 * @brief Add a user.
 *
 * If a user is returned, it's up to the caller to release the user.
 *
 * @param[in]   token        Token request parameter.
 * @param[out]  user_return  User.
 *
 * @return 0 ok (user in user_return), 1 bad token, 2 expired token.
 */
int
token_user (const gchar *token, user_t **user_return)
{
  int ret;
  user_t *user = NULL;
  int index;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          user = item;
          break;
        }
    }
  if (user)
    {
      if (time (NULL) - user->time > (session_timeout * 60))
        ret = 2;
      else
        {
          *user_return = user;
          ret = 0;
          user->time = time (NULL);
          return ret;
        }
    }
  else
    ret = 1;
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Remove a user from the session "database", releasing the user_t too.
 *
 * @param[in]  user  User.
 *
 * @return 0 success, -1 error.
 */
int
token_user_remove (const char *token)
{
  user_t *user;
  if (token_user (token, &user))
    return -1;
  g_ptr_array_remove (users, (gpointer) user);
  g_mutex_unlock (mutex);
  return 0;
}

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
                         "^(clone)"
                         "|(create_agent)"
                         "|(create_config)"
                         "|(create_alert)"
                         "|(create_filter)"
                         "|(create_lsc_credential)"
                         "|(create_note)"
                         "|(create_override)"
                         "|(create_port_list)"
                         "|(create_port_range)"
                         "|(create_report)"
                         "|(create_schedule)"
                         "|(create_slave)"
                         "|(create_target)"
                         "|(create_task)"
                         "|(create_user)"
                         "|(delete_agent)"
                         "|(delete_config)"
                         "|(delete_alert)"
                         "|(delete_filter)"
                         "|(delete_lsc_credential)"
                         "|(delete_note)"
                         "|(delete_override)"
                         "|(delete_port_list)"
                         "|(delete_port_range)"
                         "|(delete_report)"
                         "|(delete_report_format)"
                         "|(delete_schedule)"
                         "|(delete_slave)"
                         "|(delete_target)"
                         "|(delete_task)"
                         "|(delete_trash_agent)"
                         "|(delete_trash_config)"
                         "|(delete_trash_alert)"
                         "|(delete_trash_filter)"
                         "|(delete_trash_lsc_credential)"
                         "|(delete_trash_note)"
                         "|(delete_trash_override)"
                         "|(delete_trash_port_list)"
                         "|(delete_trash_report_format)"
                         "|(delete_trash_schedule)"
                         "|(delete_trash_slave)"
                         "|(delete_trash_target)"
                         "|(delete_trash_task)"
                         "|(delete_user)"
                         "|(download_agent)"
                         "|(download_lsc_credential)"
                         "|(edit_agent)"
                         "|(edit_alert)"
                         "|(edit_config)"
                         "|(edit_config_family)"
                         "|(edit_config_nvt)"
                         "|(edit_filter)"
                         "|(edit_lsc_credential)"
                         "|(edit_my_settings)"
                         "|(edit_note)"
                         "|(edit_override)"
                         "|(edit_port_list)"
                         "|(edit_report_format)"
                         "|(edit_schedule)"
                         "|(edit_settings)"
                         "|(edit_slave)"
                         "|(edit_target)"
                         "|(edit_task)"
                         "|(edit_user)"
                         "|(empty_trashcan)"
                         "|(alert_report)"
                         "|(export_agent)"
                         "|(export_agents)"
                         "|(export_alert)"
                         "|(export_alerts)"
                         "|(export_config)"
                         "|(export_configs)"
                         "|(export_lsc_credential)"
                         "|(export_lsc_credentials)"
                         "|(export_filter)"
                         "|(export_filters)"
                         "|(export_note)"
                         "|(export_notes)"
                         "|(export_override)"
                         "|(export_overrides)"
                         "|(export_port_list)"
                         "|(export_port_lists)"
                         "|(export_preference_file)"
                         "|(export_report_format)"
                         "|(export_report_formats)"
                         "|(export_schedule)"
                         "|(export_schedules)"
                         "|(export_slave)"
                         "|(export_slaves)"
                         "|(export_target)"
                         "|(export_targets)"
                         "|(export_task)"
                         "|(export_tasks)"
                         "|(get_agent)"
                         "|(get_agents)"
                         "|(get_config)"
                         "|(get_config_family)"
                         "|(get_config_nvt)"
                         "|(get_configs)"
                         "|(get_feed)"
                         "|(get_scap)"
                         "|(get_filter)"
                         "|(get_filters)"
                         "|(get_alert)"
                         "|(get_alerts)"
                         "|(get_info)"
                         "|(get_lsc_credential)"
                         "|(get_lsc_credentials)"
                         "|(get_my_settings)"
                         "|(get_note)"
                         "|(get_notes)"
                         "|(get_nvts)"
                         "|(get_override)"
                         "|(get_overrides)"
                         "|(get_port_list)"
                         "|(get_port_lists)"
                         "|(get_report)"
                         "|(get_report_format)"
                         "|(get_report_formats)"
                         "|(get_result)"
                         "|(get_settings)"
                         "|(get_schedule)"
                         "|(get_schedules)"
                         "|(get_slave)"
                         "|(get_slaves)"
                         "|(get_system_reports)"
                         "|(get_target)"
                         "|(get_targets)"
                         "|(get_task)"
                         "|(get_tasks)"
                         "|(get_trash)"
                         "|(get_user)"
                         "|(get_users)"
                         "|(import_config)"
                         "|(import_port_list)"
                         "|(import_report_format)"
                         "|(login)"
                         "|(modify_auth)"
                         "|(new_agent)"
                         "|(new_alert)"
                         "|(new_config)"
                         "|(new_filter)"
                         "|(new_lsc_credential)"
                         "|(new_note)"
                         "|(new_override)"
                         "|(new_port_list)"
                         "|(new_report_format)"
                         "|(new_slave)"
                         "|(new_schedule)"
                         "|(new_target)"
                         "|(new_task)"
                         "|(pause_task)"
                         "|(restore)"
                         "|(resume_paused_task)"
                         "|(resume_stopped_task)"
                         "|(run_wizard)"
                         "|(test_alert)"
                         "|(save_agent)"
                         "|(save_alert)"
                         "|(save_config)"
                         "|(save_config_family)"
                         "|(save_config_nvt)"
                         "|(save_container_task)"
                         "|(save_filter)"
                         "|(save_lsc_credential)"
                         "|(save_my_settings)"
                         "|(save_note)"
                         "|(save_override)"
                         "|(save_port_list)"
                         "|(save_report_format)"
                         "|(save_schedule)"
                         "|(save_settings)"
                         "|(save_slave)"
                         "|(save_target)"
                         "|(save_task)"
                         "|(save_user)"
                         "|(start_task)"
                         "|(stop_task)"
                         "|(sync_feed)"
                         "|(sync_scap)"
                         "|(verify_agent)"
                         "|(verify_report_format)"
                         "|(wizard)$");


  openvas_validator_add (validator, "active", "^(-1|-2|[0-9]+)$");
  openvas_validator_add (validator, "agent_format", "^(installer)$");
  openvas_validator_add (validator, "agent_id",     "^[a-z0-9\\-]+$");
  /* Defined in RFC 2253. */
  openvas_validator_add (validator, "authdn",       "^.{0,200}%s.{0,200}$");
  openvas_validator_add (validator, "autofp",       "^(0|1|2)$");
  openvas_validator_add (validator, "autofp_value", "^(1|2)$");
  openvas_validator_add (validator, "boolean",    "^0|1$");
  openvas_validator_add (validator, "caller",     "^.*$");
  openvas_validator_add (validator, "comment",    "^[-_;'[:alnum:]äüöÄÜÖß, \\./]{0,400}$");
  openvas_validator_add (validator, "config_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "config_id_optional", "^(--|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "condition",  "^[[:alnum:] ]{0,100}$");
  openvas_validator_add (validator, "create_credentials_type", "^(gen|pass|key)$");
  openvas_validator_add (validator, "credential_login", "^[-_[:alnum:]\\.@\\\\]{1,40}$");
  openvas_validator_add (validator, "condition_data:name", "^(.*){0,400}$");
  openvas_validator_add (validator, "condition_data:value", "(?s)^.*$");
  openvas_validator_add (validator, "min_cvss_base", "^(|10.0|[0-9].[0-9])$");
  openvas_validator_add (validator, "day_of_month", "^((0|1|2)[0-9]{1,1})|30|31$");
  openvas_validator_add (validator, "days",         "^(-1|[0-9]+)$");
  openvas_validator_add (validator, "delta_states", "^(c|g|n|s){0,4}$");
  openvas_validator_add (validator, "domain",     "^[-[:alnum:]\\.]{1,80}$");
  openvas_validator_add (validator, "email",      "^[^@ ]{1,150}@[^@ ]{1,150}$");
  openvas_validator_add (validator, "alert_id",   "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "alert_id_optional", "^(--|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "event_data:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "event_data:value", "(?s)^.*$");
  openvas_validator_add (validator, "family",     "^[-_[:alnum:] :.]{1,200}$");
  openvas_validator_add (validator, "family_page", "^[-_[:alnum:] :.]{1,200}$");
  openvas_validator_add (validator, "file",         "(?s)^.*$");
  openvas_validator_add (validator, "file:name",    "^.*[[0-9abcdefABCDEF\\-]{1,40}]:.*$");
  openvas_validator_add (validator, "file:value",   "^yes$");
  openvas_validator_add (validator, "settings_filter:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "settings_filter:value", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "first",        "^[0-9]+$");
  openvas_validator_add (validator, "first_result", "^[0-9]+$");
  openvas_validator_add (validator, "filter",       "^(.*){0,1000}$");
  openvas_validator_add (validator, "format_id", "^[a-z0-9\\-]+$");
  /* Validator for  modify_auth group, e.g. "method:ldap". */
  openvas_validator_add (validator, "group",        "^method:(ads|ldap|ldap_connect)$");
  openvas_validator_add (validator, "max",          "^(-?[0-9]+|)$");
  openvas_validator_add (validator, "max_results",  "^[0-9]+$");
  openvas_validator_add (validator, "format",     "^[-[:alnum:]]{1,15}$");
  openvas_validator_add (validator, "host",       "^[[:alnum:]:\\.]{1,80}$");
  openvas_validator_add (validator, "hostport",   "^[-[:alnum:]\\. :]{1,80}$");
  openvas_validator_add (validator, "hosts",      "^[-[:alnum:],: \\./]{1,2000}$");
  openvas_validator_add (validator, "hosts_allow", "^0|1|2$");
  openvas_validator_add (validator, "hosts_opt",  "^[[:alnum:], \\./]{0,80}$");
  openvas_validator_add (validator, "hour",        "^((0|1)[0-9]{1,1})|(2(0|1|2|3))$");
  openvas_validator_add (validator, "howto_use",   "(?s)^.*$");
  openvas_validator_add (validator, "howto_install",  "(?s)^.*$");
  openvas_validator_add (validator, "id",             "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "installer",      "(?s)^.*$");
  openvas_validator_add (validator, "installer_sig",  "(?s)^.*$");
  openvas_validator_add (validator, "levels",       "^(h|m|l|g|f){0,5}$");
  /* Used for Administrator users, LSC credentials, login for target
   * locator and slave login name.  Needs to match validate_username in
   * Administrator. */
  openvas_validator_add (validator, "login",      "^[[:alnum:]-_@.]+$");
  openvas_validator_add (validator, "lsc_credential_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "lsc_password", "^.{0,40}$");
  openvas_validator_add (validator, "max_result", "^[0-9]+$");
  openvas_validator_add (validator, "minute",     "^[0-5]{1,1}[0-9]{1,1}$");
  openvas_validator_add (validator, "month",      "^(0[0-9]{1,1})|10|11|12$");
  openvas_validator_add (validator, "note_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "note_result_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "override_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "override_result_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "name",       "^[-_[:alnum:], \\./]{1,80}$");
  openvas_validator_add (validator, "info_name",  "(?s)^.*$");
  openvas_validator_add (validator, "info_type",  "(?s)^.*$");
  openvas_validator_add (validator, "info_id",  "^[0-9]+$");
  openvas_validator_add (validator, "details", "^[0-1]$");
  /* Number is special cased in params_mhd_validate to remove the space. */
  openvas_validator_add (validator, "number",     "^ *[0-9]+ *$");
  openvas_validator_add (validator, "observers",       "^[-_ [:alnum:],]*$");
  openvas_validator_add (validator, "optional_number", "^[0-9]*$");
  openvas_validator_add (validator, "oid",        "^[0-9.]{1,80}$");
  openvas_validator_add (validator, "page",       "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "package_format", "^(key)|(rpm)|(deb)|(exe)$");
  openvas_validator_add (validator, "password",   "^.{0,40}$");
  openvas_validator_add (validator, "password:value", "(?s)^.*$");
  openvas_validator_add (validator, "port",       "^[-[:alnum:] \\(\\)_/]{1,400}$");
  openvas_validator_add (validator, "port_range", "^((default)|([-0-9, TU:]{1,400}))$");
  openvas_validator_add (validator, "port_type", "^tcp|udp$");
  /** @todo Better regex. */
  openvas_validator_add (validator, "preference_name", "^(.*){0,400}$");
  openvas_validator_add (validator, "preference:",      "^$");
  openvas_validator_add (validator, "preference:name",  "^([^[]*\\[[^]]*\\]:.*){0,400}$");
  openvas_validator_add (validator, "preference:value", "(?s)^.*$");
  openvas_validator_add (validator, "private_key",      "(?s)^.*$");
  openvas_validator_add (validator, "public_key",       "(?s)^.*$");
  openvas_validator_add (validator, "pw",         "^[[:alnum:]]{1,10}$");
  openvas_validator_add (validator, "xml_file",   "(?s)^.*$");
  openvas_validator_add (validator, "report_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "report_format_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "result_id",        "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "optional_task_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "port_list_id",     "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "port_range_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "resource_type",
                         "^(agent|alert|config|filter|lsc_credential|note|override|port_list|report|report_format|schedule|slave|target|task|info|"
                         "Agent|Alert|Config|Credential|Filter|Note|Override|Port List|Report|Report Format|Schedule|Slave|Target|Task|SecInfo)$");
  openvas_validator_add (validator, "optional_resource_type",
                         "^(agent|alert|config|filter|lsc_credential|note|override|port_list|report|report_format|schedule|slave|target|task|info|"
                         "Agent|Alert|Config|Credential|Filter|Note|Override|Port List|Report|Report Format|Schedule|Slave|Target|Task|SecInfo|)$");
  openvas_validator_add (validator, "role",       "^[[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "select:",      "^$");
  openvas_validator_add (validator, "select:value", "^(.*){0,400}$");
  openvas_validator_add (validator, "method_data:name", "^(.*){0,400}$");
  openvas_validator_add (validator, "method_data:value", "(?s)^.*$");
  openvas_validator_add (validator, "nvt:name",          "(?s)^.*$");
  openvas_validator_add (validator, "slave_id",   "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "slave_id_optional",   "^(--|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "summary",    "^.{0,400}$");
  openvas_validator_add (validator, "target_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "target_id_optional",  "^(--|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "task_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "term",       "^.{0,1000}");
  openvas_validator_add (validator, "text",       "^.{0,1000}");
  openvas_validator_add (validator, "threat",     "^(High|Medium|Low|Log|False Positive|)$");
  openvas_validator_add (validator, "trend:",      "^(0|1)$");
  openvas_validator_add (validator, "trend:value", "^(0|1)$");
  openvas_validator_add (validator, "type",       "^(assets|prognostic)$");
  openvas_validator_add (validator, "search_phrase", "^[[:alnum:][:punct:] äöüÄÖÜß]{0,400}$");
  openvas_validator_add (validator, "sort_field", "^[_[:alnum:] ]{1,20}$");
  openvas_validator_add (validator, "sort_order", "^(ascending)|(descending)$");
  openvas_validator_add (validator, "submit_plus",    "^\\+$");
  openvas_validator_add (validator, "target_locator", "^[[:alnum:] -_/]{1,80}$");
  openvas_validator_add (validator, "target_source", "^(file|import|manual)$");
  openvas_validator_add (validator, "timezone",      "^.{0,1000}$");
  openvas_validator_add (validator, "token", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "schedule_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "schedule_id_optional", "^(--|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "uuid",       "^[0-9abcdefABCDEF\\-]{1,40}$");
  openvas_validator_add (validator, "year",       "^[0-9]+$");
  openvas_validator_add (validator, "calendar_unit", "^second|minute|hour|day|week|month|year|decade$");

  /* Beware, the rule must be defined before the alias. */

  openvas_validator_alias (validator, "alert_id_2", "alert_id");
  openvas_validator_alias (validator, "alert_id_optional:name",  "number");
  openvas_validator_alias (validator, "alert_id_optional:value", "alert_id_optional");
  openvas_validator_alias (validator, "alerts",     "optional_number");
  openvas_validator_alias (validator, "apply_min_cvss_base", "boolean");
  openvas_validator_alias (validator, "apply_overrides", "boolean");
  openvas_validator_alias (validator, "base",         "name");
  openvas_validator_alias (validator, "delta_report_id",     "report_id");
  openvas_validator_alias (validator, "delta_state_changed", "boolean");
  openvas_validator_alias (validator, "delta_state_gone", "boolean");
  openvas_validator_alias (validator, "delta_state_new", "boolean");
  openvas_validator_alias (validator, "delta_state_same", "boolean");
  openvas_validator_alias (validator, "duration",     "optional_number");
  openvas_validator_alias (validator, "duration_unit", "calendar_unit");
  openvas_validator_alias (validator, "enable",       "boolean");
  openvas_validator_alias (validator, "enable_ldap_connect",     "boolean");
  openvas_validator_alias (validator, "enable_stop",             "boolean");
  openvas_validator_alias (validator, "esc_apply_min_cvss_base", "boolean");
  openvas_validator_alias (validator, "esc_first_result", "first_result");
  openvas_validator_alias (validator, "esc_levels",       "levels");
  openvas_validator_alias (validator, "esc_max_results",  "max_results");
  openvas_validator_alias (validator, "esc_min_cvss_base", "min_cvss_base");
  openvas_validator_alias (validator, "esc_search_phrase", "search_phrase");
  openvas_validator_alias (validator, "filter_id",          "id");
  openvas_validator_alias (validator, "filt_id",            "id");
  openvas_validator_alias (validator, "from_file",          "boolean");
  openvas_validator_alias (validator, "force_wizard",       "boolean");
  openvas_validator_alias (validator, "host_search_phrase", "search_phrase");
  openvas_validator_alias (validator, "host_first_result",  "first_result");
  openvas_validator_alias (validator, "host_max_results",   "max_results");
  openvas_validator_alias (validator, "host_levels",        "levels");
  openvas_validator_alias (validator, "hosts_manual",       "hosts");
  openvas_validator_alias (validator, "in_assets",          "boolean");
  openvas_validator_alias (validator, "refresh_interval", "number");
  openvas_validator_alias (validator, "event",        "condition");
  openvas_validator_alias (validator, "access_hosts", "hosts_opt");
  openvas_validator_alias (validator, "max_checks",   "number");
  openvas_validator_alias (validator, "max_hosts",    "number");
  openvas_validator_alias (validator, "method",       "condition");
  openvas_validator_alias (validator, "modify_password", "boolean");
  openvas_validator_alias (validator, "ldaphost",     "hostport");
  openvas_validator_alias (validator, "level_high",   "boolean");
  openvas_validator_alias (validator, "level_medium", "boolean");
  openvas_validator_alias (validator, "level_low",    "boolean");
  openvas_validator_alias (validator, "level_log",    "boolean");
  openvas_validator_alias (validator, "level_false_positive", "boolean");
  openvas_validator_alias (validator, "lsc_smb_credential_id",
                           "lsc_credential_id");
  openvas_validator_alias (validator, "method_data:to_address:", "email");
  openvas_validator_alias (validator, "method_data:from_address:", "email");
  openvas_validator_alias (validator, "new_threat",   "threat");
  openvas_validator_alias (validator, "next",         "page");
  openvas_validator_alias (validator, "notes",        "boolean");
  openvas_validator_alias (validator, "note_task_id", "optional_task_id");
  openvas_validator_alias (validator, "note_task_uuid", "note_task_id");
  openvas_validator_alias (validator, "note_result_uuid", "note_result_id");
  openvas_validator_alias (validator, "nvt:value",         "uuid");
  openvas_validator_alias (validator, "overrides",        "boolean");
  openvas_validator_alias (validator, "override_task_id", "optional_task_id");
  openvas_validator_alias (validator, "override_task_uuid", "override_task_id");
  openvas_validator_alias (validator, "override_result_uuid", "override_result_id");
  openvas_validator_alias (validator, "passphrase",   "lsc_password");
  openvas_validator_alias (validator, "password:name", "preference_name");
  openvas_validator_alias (validator, "port_manual",       "port");
  openvas_validator_alias (validator, "port_range_end",    "number");
  openvas_validator_alias (validator, "port_range_start",  "number");
  openvas_validator_alias (validator, "pos",               "number");
  openvas_validator_alias (validator, "result_hosts_only", "boolean");
  openvas_validator_alias (validator, "result_task_id", "optional_task_id");
  openvas_validator_alias (validator, "report_result_id",  "result_id");
  openvas_validator_alias (validator, "period",       "optional_number");
  openvas_validator_alias (validator, "period_unit",  "calendar_unit");
  openvas_validator_alias (validator, "select:name",  "family");
  openvas_validator_alias (validator, "show_closed_cves",  "boolean");
  openvas_validator_alias (validator, "timeout",      "boolean");
  openvas_validator_alias (validator, "trend:name",   "family");

  openvas_validator_alias (validator, "esc_notes",        "notes");
  openvas_validator_alias (validator, "esc_overrides",    "overrides");
  openvas_validator_alias (validator, "esc_result_hosts_only",
                           "result_hosts_only");
}

/**
 * @brief Set a content type from a format string.
 *
 * For example set the content type to GSAD_CONTENT_TYPE_APP_DEB when given
 * format "deb".
 *
 * @param[out]  content_type  Return location for the newly set content type,
 *                            defaults to GSAD_CONTENT_TYPE_APP_HTML.
 * @param[in]   format        Lowercase format string as in the respective
 *                            OMP commands.
 */
static void
content_type_from_format_string (enum content_type* content_type,
                                 const char* format)
{
  if (!format)
    *content_type = GSAD_CONTENT_TYPE_APP_HTML;

  else if (strcmp (format, "deb") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_DEB;
  else if (strcmp (format, "exe") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_EXE;
  else if (strcmp (format, "html") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_HTML;
  else if (strcmp (format, "key") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_KEY;
  else if (strcmp (format, "nbe") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_NBE;
  else if (strcmp (format, "pdf") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_PDF;
  else if (strcmp (format, "rpm") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_RPM;
  else if (strcmp (format, "xml") == 0)
    *content_type = GSAD_CONTENT_TYPE_APP_XML;
  // Defaults to GSAD_CONTENT_TYPE_APP_HTML
  else
    *content_type = GSAD_CONTENT_TYPE_APP_HTML;
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
  params_t *params;                        ///< Request parameters.
  char *cookie;                            ///< Value of SID cookie param.
};

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

  params_free (con_info->params);
  free (con_info->cookie);
  free (con_info);
  *con_cls = NULL;
}

/**
 * @brief Append a chunk to a request parameter.
 *
 * @param[in]   params        Request parameters.
 * @param[out]  name          Parameter.
 * @param[out]  filename      Filename if uploaded file.
 * @param[in]   chunk_data    Incoming chunk data.
 * @param[out]  chunk_size    Size of chunk.
 * @param[out]  chunk_offset  Offset into all data.
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
static int
params_append_mhd (params_t *params,
                   const char *name,
                   const char *filename,
                   const char *chunk_data,
                   int chunk_size,
                   int chunk_offset)
{
  if ((strncmp (name, "condition_data:", strlen ("condition_data:")) == 0)
      || (strncmp (name, "event_data:", strlen ("event_data:")) == 0)
      || (strncmp (name, "settings_filter:", strlen ("settings_filter:")) == 0)
      || (strncmp (name, "file:", strlen ("file:")) == 0)
      || (strncmp (name, "parameter:", strlen ("parameter:")) == 0)
      || (strncmp (name, "password:", strlen ("password:")) == 0)
      || (strncmp (name, "preference:", strlen ("preference:")) == 0)
      || (strncmp (name, "select:", strlen ("select:")) == 0)
      || (strncmp (name, "trend:", strlen ("trend:")) == 0)
      || (strncmp (name, "method_data:", strlen ("method_data:")) == 0)
      || (strncmp (name, "nvt:", strlen ("nvt:")) == 0)
      || (strncmp (name, "alert_id_optional:", strlen ("alert_id_optional:"))
          == 0))
    {
      param_t *param;
      const char *colon;
      gchar *prefix;

      colon = strchr (name, ':');

      /* Hashtable param, like for radios. */

      if ((colon - name) == (strlen (name) - 1))
        {
          params_append_bin (params, name, chunk_data, chunk_size, chunk_offset);

          return MHD_YES;
        }

      prefix = g_strndup (name, 1 + colon - name);
      param = params_get (params, prefix);

      if (param == NULL)
        {
          param = params_add (params, prefix, "");
          param->values = params_new ();
        }
      else if (param->values == NULL)
        param->values = params_new ();

      g_free (prefix);

      params_append_bin (param->values, colon + 1, chunk_data, chunk_size,
                         chunk_offset);
      if (filename)
        param->filename = g_strdup (filename);

      return MHD_YES;
    }

  /* Single value param. */

  params_append_bin (params, name, chunk_data, chunk_size, chunk_offset);

  return MHD_YES;
}

/**
 * @brief Serves part of a POST request.
 *
 * Implements an MHD_PostDataIterator.
 *
 * Called one or more times to collect the multiple parts (key/value pairs)
 * of a POST request.  Fills the params of a gsad_connection_info.
 *
 * After serve_post, the connection info is free'd.
 *
 * @param[in,out]  coninfo_cls   Connection info (a gsad_connection_info).
 * @param[in]      kind          Type of request data (header, cookie, etc.).
 * @param[in]      key           Name of data (name of request variable).
 * @param[in]      filename      Name of uploaded file if any, else NULL.
 * @param[in]      content_type  MIME type of data if known, else NULL.
 * @param[in]      transfer_encoding  Transfer encoding if known, else NULL.
 * @param[in]      data          Data.
 * @param[in]      off           Offset into entire data.
 * @param[in]      size          Size of data, in bytes.
 *
 * @return MHD_YES to continue iterating over post data, MHD_NO to stop.
 */
int
serve_post (void *coninfo_cls, enum MHD_ValueKind kind, const char *key,
            const char *filename, const char *content_type,
            const char *transfer_encoding, const char *data, uint64_t off,
            size_t size)
{
  struct gsad_connection_info *con_info =
    (struct gsad_connection_info *) coninfo_cls;

  con_info->answercode = MHD_HTTP_INTERNAL_SERVER_ERROR;
  con_info->response   = SERVER_ERROR;

  if (NULL != key)
    {
      params_append_mhd (con_info->params, key, filename, data, size, off);
      con_info->answercode = MHD_HTTP_OK;
      return MHD_YES;
    }
  return MHD_NO;
}

/**
 * @brief Validate param values.
 *
 * @param[in]  params  Values.
 */
void
params_mhd_validate_values (const char *parent_name, void *params)
{
  params_iterator_t iter;
  param_t *param;
  gchar *name, *name_name, *value_name;

  name_name = g_strdup_printf ("%sname", parent_name);
  value_name = g_strdup_printf ("%svalue", parent_name);

  params_iterator_init (&iter, params);
  while (params_iterator_next (&iter, &name, &param))
    {
      gchar *item_name;

      item_name = g_strdup_printf ("%s%s:", parent_name, name);

      /* Item specific value validator like "method_data:to_adddress:". */
      switch (openvas_validate (validator, item_name, param->value))
        {
          case 0:
            break;
          case 1:
            /* General name validator for collection like "method_data:name". */
            if (openvas_validate (validator, name_name, name))
              {
                param->original_value = param->value;
                param->value = NULL;
                param->value_size = 0;
                param->valid = 0;
                param->valid_utf8 = 0;
              }
            /* General value validator like "method_data:value". */
            else if (openvas_validate (validator, value_name, param->value))
              {
                param->original_value = param->value;
                param->value = NULL;
                param->value_size = 0;
                param->valid = 0;
                param->valid_utf8 = 0;
              }
            else
              {
                const gchar *alias_for;

                param->valid = 1;
                param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);

                alias_for = openvas_validator_alias_for (validator, name);
                if ((param->value && (strcmp ((gchar*) name, "number") == 0))
                    || (alias_for && (strcmp ((gchar*) alias_for, "number") == 0)))
                  /* Remove any leading or trailing space from numbers. */
                  param->value = g_strstrip (param->value);
              }
            break;
          case 2:
          default:
            {
              param->original_value = param->value;
              param->value = NULL;
              param->value_size = 0;
              param->valid = 0;
              param->valid_utf8 = 0;
            }
        }

      g_free (item_name);
    }

  g_free (name_name);
  g_free (value_name);
}

/**
 * @brief Validate params.
 *
 * @param[in]  params  Params.
 */
static void
params_mhd_validate (void *params)
{
  GHashTableIter iter;
  gpointer name, value;

  g_hash_table_iter_init (&iter, params);
  while (g_hash_table_iter_next (&iter, &name, &value))
    {
      param_t *param;
      param = (param_t*) value;

      if (openvas_validate (validator, name, param->value))
        {
          param->original_value = param->value;
          param->value = NULL;
          param->valid = 0;
          param->valid_utf8 = 0;
        }
      else
        {
          const gchar *alias_for;

          param->valid = 1;
          param->valid_utf8 = g_utf8_validate (param->value, -1, NULL);

          alias_for = openvas_validator_alias_for (validator, name);
          if ((param->value && (strcmp ((gchar*) name, "number") == 0))
              || (alias_for && (strcmp ((gchar*) alias_for, "number") == 0)))
            /* Remove any leading or trailing space from numbers. */
            param->value = g_strstrip (param->value);
        }

      if (param->values)
        params_mhd_validate_values (name, param->values);
    }
}

/**
 * @brief Add else branch for an OMP operation.
 */
#define ELSE(name) \
  else if (!strcmp (cmd, G_STRINGIFY (name))) \
    con_info->response = name ## _omp (credentials, con_info->params);

/**
 * @brief Add else branch for an OMP operation.
 */
#define ELSE_OAP(name) \
  else if (!strcmp (cmd, G_STRINGIFY (name))) \
    con_info->response = name ## _oap (credentials, con_info->params);

/**
 * @brief Handle a complete POST request.
 *
 * Ensures there is a command, then depending on the command validates
 * parameters and calls the appropriate OAP or OMP function (like
 * create_task_omp).
 *
 * @param[in]   con_info     Connection info.
 * @param[out]  user_return  User after successful login.
 * @param[out]  new_sid      SID when appropriate to attach.
 *
 * @return 0 after authenticated page, 1 after login, 2 after logout,
 *         3 after internal error or login failure.
 */
int
exec_omp_post (struct gsad_connection_info *con_info, user_t **user_return,
               gchar **new_sid)
{
  int ret;
  user_t *user;
  credentials_t *credentials = NULL;
  const char *cmd, *caller;

  /* Handle the login command specially. */

  params_mhd_validate (con_info->params);

  cmd = params_value (con_info->params, "cmd");

  if (cmd && !strcmp (cmd, "login"))
    {
      const char *password;

      password = params_value (con_info->params, "password");
      if ((password == NULL)
          && (params_original_value (con_info->params, "password") == NULL))
        password = "";

      if (params_value (con_info->params, "login")
          && password)
        {
          int ret;
          gchar *timezone, *role, *capabilities;
          ret = authenticate_omp (params_value (con_info->params, "login"),
                                  password,
                                  &role,
                                  &timezone,
                                  &capabilities);
          if (ret)
            {
              time_t now;
              gchar *xml;
              char *res;
              char ctime_now[200];

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              xml = g_strdup_printf ("<login_page>"
                                     "<message>"
                                     "Login failed.%s"
                                     "</message>"
                                     "<token></token>"
                                     "<time>%s</time>"
                                     "</login_page>",
                                     ret == 2
                                      ? "  OMP service is down."
                                      : (ret == -1
                                          ? "  Error during authentication."
                                          : ""),
                                     ctime_now);
              res = xsl_transform (xml);
              g_free (xml);
              con_info->response = res;
            }
          else
            {
              user_t *user;
              user = user_add (params_value (con_info->params, "login"),
                               password,
                               timezone,
                               role,
                               capabilities);
              /* Redirect to get_tasks. */
              *user_return = user;
              g_free (timezone);
              g_free (role);
              return 1;
            }
        }
      else if ((params_value (con_info->params, "login") == NULL)
               && ((params_original_value (con_info->params, "login") == NULL)
                   || (strcmp (params_original_value (con_info->params, "login"),
                               "")
                       == 0)))
        {
          time_t now;
          gchar *xml;
          char *res;
          char ctime_now[200];

          now = time (NULL);
          ctime_r_strip_newline (&now, ctime_now);

          xml = g_strdup_printf ("<login_page>"
                                 "<message>"
                                 "Login failed."
                                 "</message>"
                                 "<token></token>"
                                 "<time>%s</time>"
                                 "</login_page>",
                                 ctime_now);
          res = xsl_transform (xml);
          g_free (xml);
          con_info->response = res;
        }
      else
        {
          con_info->response = gsad_message (credentials,
                                             "Internal error",
                                             __FUNCTION__,
                                             __LINE__,
                                             "An internal error occured inside GSA daemon. "
                                             "Diagnostics: Error in login or password.",
                                             "/omp?cmd=get_tasks");
        }
      con_info->answercode = MHD_HTTP_OK;
      return 3;
    }

  /* Check the session. */

  if (params_value (con_info->params, "token") == NULL)
    {
      if (params_given (con_info->params, "token") == 0)
        con_info->response
         = gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: Token missing.",
                         "/omp?cmd=get_tasks");
      else
        con_info->response
         = gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: Token bad.",
                         "/omp?cmd=get_tasks");
      con_info->answercode = MHD_HTTP_OK;
      return 3;
    }

  ret = user_find (con_info->cookie,
                   params_value (con_info->params, "token"),
                   &user);
  if (ret == 1)
    {
      con_info->response
       = gsad_message (credentials,
                       "Internal error", __FUNCTION__, __LINE__,
                       "An internal error occured inside GSA daemon. "
                       "Diagnostics: Bad token.",
                       "/omp?cmd=get_tasks");
      con_info->answercode = MHD_HTTP_OK;
      return 3;
    }

  if (ret == 2)
    {
      time_t now;
      gchar *xml;
      char ctime_now[200];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      caller = params_value (con_info->params, "caller");

      /* @todo Validate caller. */

      xml = g_markup_printf_escaped ("<login_page>"
                                     "<message>"
                                     "Session has expired.  Please login again."
                                     "</message>"
                                     "<token></token>"
                                     "<time>%s</time>"
                                     "<url>%s</url>"
                                     "</login_page>",
                                     ctime_now,
                                     caller
                                      ? caller
                                      : "");
      con_info->response = xsl_transform (xml);
      g_free (xml);
      con_info->answercode = MHD_HTTP_OK;
      return 2;
    }

  if (ret == 3)
    {
      time_t now;
      gchar *xml;
      char ctime_now[200];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      xml = g_strdup_printf ("<login_page>"
                             "<message>"
                             "Cookie missing or bad.  Please login again."
                             "</message>"
                             "<token></token>"
                             "<time>%s</time>"
                             "</login_page>",
                             ctime_now);
      con_info->response = xsl_transform (xml);
      g_free (xml);
      con_info->answercode = MHD_HTTP_OK;
      return 2;
    }

  if (ret)
    abort ();

  /* From here, the user is authenticated. */

  credentials = malloc (sizeof (credentials_t));
  if (credentials == NULL)
    {
      user_release (user);
      abort ();
    }
  assert (user->username);
  assert (user->password);
  assert (user->token);
  credentials->username = strdup (user->username);
  credentials->password = strdup (user->password);
  credentials->role = user->role ? strdup (user->role) : NULL;
  credentials->timezone = user->timezone ? strdup (user->timezone) : NULL;
  credentials->capabilities = user->capabilities
                               ? strdup (user->capabilities)
                               : NULL;
  credentials->token = strdup (user->token);
  credentials->params = con_info->params;
  /* The caller of a POST is usually the caller of the page that the POST form
   * was on. */
  caller = params_value (con_info->params, "caller");
  credentials->caller = strdup (caller ? caller : "");

  if (new_sid) *new_sid = g_strdup (user->cookie);

  user_release (user);

  /* Set the timezone. */

  if (credentials->timezone)
    {
      if (setenv ("TZ", credentials->timezone, 1) == -1)
        {
          g_critical ("%s: failed to set TZ\n", __FUNCTION__);
          exit (EXIT_FAILURE);
        }
      tzset ();
    }

  /* Handle the usual commands. */

  if (!cmd)
    {
      con_info->response = gsad_message (credentials,
                                         "Internal error",
                                         __FUNCTION__,
                                         __LINE__,
                                         "An internal error occured inside GSA daemon. "
                                         "Diagnostics: Empty command.",
                                         "/omp?cmd=get_tasks");
    }
  ELSE (clone)
  ELSE (create_agent)
  ELSE (create_alert)
  ELSE (create_filter)
  ELSE (create_lsc_credential)
  ELSE (create_port_list)
  ELSE (create_port_range)
  ELSE (create_report)
  ELSE (create_task)
  ELSE_OAP (create_user)
  ELSE (create_schedule)
  ELSE (create_slave)
  ELSE (create_target)
  ELSE (create_config)
  ELSE (create_note)
  ELSE (create_override)
  ELSE (delete_agent)
  ELSE (delete_task)
  ELSE (delete_alert)
  ELSE (delete_filter)
  ELSE (delete_lsc_credential)
  ELSE (delete_note)
  ELSE (delete_override)
  ELSE (delete_port_list)
  ELSE (delete_port_range)
  ELSE (delete_report)
  ELSE (delete_report_format)
  ELSE (delete_schedule)
  ELSE (delete_slave)
  ELSE_OAP (delete_user)
  ELSE (delete_target)
  ELSE (delete_trash_agent)
  ELSE (delete_trash_config)
  ELSE (delete_trash_alert)
  ELSE (delete_trash_filter)
  ELSE (delete_trash_lsc_credential)
  ELSE (delete_trash_note)
  ELSE (delete_trash_override)
  ELSE (delete_trash_port_list)
  ELSE (delete_trash_report_format)
  ELSE (delete_trash_schedule)
  ELSE (delete_trash_slave)
  ELSE (delete_trash_target)
  ELSE (delete_trash_task)
  ELSE (delete_config)
  ELSE (empty_trashcan)
  else if (!strcmp (cmd, "alert_report"))
    {
      gchar *content_type_omp;
      gsize response_size;
      char *content_disposition;
      con_info->response = get_report_omp (credentials, con_info->params,
                                           &response_size,
                                           &content_type_omp,
                                           &content_disposition);
    }
  ELSE (import_config)
  ELSE (import_port_list)
  ELSE (import_report_format)
  ELSE_OAP (modify_auth)
  ELSE (pause_task)
  ELSE (restore)
  ELSE (resume_paused_task)
  ELSE (resume_stopped_task)
  ELSE (run_wizard)
  ELSE (save_agent)
  ELSE (save_alert)
  ELSE (save_config)
  ELSE (save_config_family)
  ELSE (save_config_nvt)
  ELSE (save_filter)
  ELSE (save_lsc_credential)
  else if (!strcmp (cmd, "save_my_settings"))
    {
      char *timezone, *password;
      con_info->response = save_my_settings_omp (credentials, con_info->params,
                                                 &timezone, &password);
      if (timezone)
        /* credentials->timezone set in save_my_settings_omp before XSLT. */
        user_set_timezone (credentials->username, timezone);
      if (password)
        /* credentials->password set in save_my_settings_omp before XSLT. */
        user_set_password (credentials->username, password);
      g_free (timezone);
    }
  ELSE (save_note)
  ELSE (save_override)
  ELSE (save_port_list)
  ELSE (save_report_format)
  ELSE (save_schedule)
  ELSE_OAP (save_settings)
  ELSE (save_slave)
  ELSE (save_target)
  ELSE (save_task)
  ELSE (save_container_task)
  ELSE_OAP (save_user)
  ELSE (start_task)
  ELSE (stop_task)
  ELSE_OAP (sync_feed)
  ELSE_OAP (sync_scap)
  ELSE (test_alert)
  else
    {
      con_info->response = gsad_message (credentials,
                                         "Internal error",
                                         __FUNCTION__,
                                         __LINE__,
                                         "An internal error occured inside GSA daemon. "
                                         "Diagnostics: Unknown command.",
                                         "/omp?cmd=get_tasks");
    }

  con_info->answercode = MHD_HTTP_OK;
  return 0;
}

/**
 * @brief Add a param.
 *
 * @param[in]  params  Params.
 * @param[in]  kind    MHD header kind.
 * @param[in]  name    Name.
 * @param[in]  value   Value.
 */
static int
params_mhd_add (void *params, enum MHD_ValueKind kind, const char *name,
                const char *value)
{
  params_add ((params_t *) params, name, value);
  return MHD_YES;
}

#undef ELSE
#undef ELSE_OAP

/**
 * @brief Add else branch for an OMP operation.
 */
#define ELSE(name) \
  else if (!strcmp (cmd, G_STRINGIFY (name))) \
    return name ## _omp (credentials, params);

/**
 * @brief Add else branch for an OAP operation.
 */
#define ELSE_OAP(name) \
  else if (!strcmp (cmd, G_STRINGIFY (name))) \
    return name ## _oap (credentials, params);

/**
 * @brief Handle a complete GET request.
 *
 * After some input checking, depending on the cmd parameter of the connection,
 * issue an omp command (via *_omp functions).
 *
 * @param[in]   connection           Connection.
 * @param[in]   credentials          User credentials.
 * @param[out]  content_type         Return location for the content type of
 *                                   the response.
 * @param[out]  content_type_string  Return location for dynamic content type.
 * @param[out]  content_disposition  Return location for the
 *                                   content_disposition, if any.
 * @param[out]  response_size        Return location for response size, if any.
 *
 * @return Newly allocated response string.
 */
char *
exec_omp_get (struct MHD_Connection *connection,
              credentials_t *credentials,
              enum content_type* content_type,
              gchar **content_type_string,
              char** content_disposition,
              gsize* response_size)
{
  char *cmd = NULL;
  const int CMD_MAX_SIZE = 27;   /* delete_trash_lsc_credential */
  params_t *params;

  cmd =
    (char *) MHD_lookup_connection_value (connection, MHD_GET_ARGUMENT_KIND,
                                          "cmd");
  if (openvas_validate (validator, "cmd", cmd))
    cmd = NULL;

  if ((cmd != NULL) && (strlen (cmd) <= CMD_MAX_SIZE))
    {
      tracef ("cmd: [%s]\n", cmd);

      params = params_new ();

      MHD_get_connection_values (connection, MHD_GET_ARGUMENT_KIND,
                                 params_mhd_add, params);

      params_mhd_validate (params);
      credentials->params = params;
    }
  else
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: No valid command for omp.",
                         "/omp?cmd=get_tasks");


  /* Set the timezone. */

  if (credentials->timezone)
    {
      if (setenv ("TZ", credentials->timezone, 1) == -1)
        {
          g_critical ("%s: failed to set TZ\n", __FUNCTION__);
          exit (EXIT_FAILURE);
        }
      tzset ();
    }

  /** @todo Ensure that XSL passes on sort_order and sort_field. */

  /* Check cmd and precondition, start respective OMP command(s). */

  if (!strcmp (cmd, "new_filter"))
    return new_filter_omp (credentials, params);

  ELSE (new_target)
  ELSE (new_task)
  ELSE (new_alert)
  ELSE (get_task)
  ELSE (get_tasks)
  ELSE (edit_agent)
  ELSE (edit_alert)
  ELSE (edit_config)
  ELSE (edit_config_family)
  ELSE (edit_config_nvt)
  ELSE (edit_filter)
  ELSE (edit_lsc_credential)
  ELSE (edit_my_settings)
  ELSE (edit_note)
  ELSE (edit_override)
  ELSE (edit_port_list)
  ELSE (edit_report_format)
  ELSE (edit_schedule)
  ELSE (edit_slave)
  ELSE_OAP (edit_settings)
  ELSE (edit_target)
  ELSE (edit_task)
  ELSE_OAP (edit_user)

  else if (!strcmp (cmd, "export_agent"))
    return export_agent_omp (credentials, params, content_type,
                             content_disposition, response_size);

  else if (!strcmp (cmd, "export_agents"))
    return export_agents_omp (credentials, params, content_type,
                              content_disposition, response_size);

  else if (!strcmp (cmd, "export_alert"))
    return export_alert_omp (credentials, params, content_type,
                             content_disposition, response_size);

  else if (!strcmp (cmd, "export_alerts"))
    return export_alerts_omp (credentials, params, content_type,
                              content_disposition, response_size);

  else if (!strcmp (cmd, "export_config"))
    return export_config_omp (credentials, params, content_type,
                              content_disposition, response_size);

  else if (!strcmp (cmd, "export_configs"))
    return export_configs_omp (credentials, params, content_type,
                               content_disposition, response_size);

  else if (!strcmp (cmd, "export_filter"))
    return export_filter_omp (credentials, params, content_type,
                              content_disposition, response_size);

  else if (!strcmp (cmd, "export_filters"))
    return export_filters_omp (credentials, params, content_type,
                               content_disposition, response_size);

  else if (!strcmp (cmd, "download_lsc_credential"))
    {
      char *html;
      gchar *lsc_credential_login;
      const char *package_format;

      package_format = params_value (params, "package_format");

      if (download_lsc_credential_omp (credentials,
                                       params,
                                       response_size,
                                       &html,
                                       &lsc_credential_login))
        return html;

      /* Returned above if package_format was NULL. */
      content_type_from_format_string (content_type, package_format);
      free (*content_disposition);
      *content_disposition = g_strdup_printf
                              ("attachment; filename=openvas-lsc-target-%s.%s",
                               lsc_credential_login,
                               (strcmp (package_format, "key") == 0
                                 ? "pub"
                                 : package_format));
      free (lsc_credential_login);

      return html;
    }

  else if (!strcmp (cmd, "export_lsc_credential"))
    return export_lsc_credential_omp (credentials, params, content_type,
                                      content_disposition, response_size);

  else if (!strcmp (cmd, "export_lsc_credentials"))
    return export_lsc_credentials_omp (credentials, params, content_type,
                                       content_disposition, response_size);

  else if (!strcmp (cmd, "export_note"))
    return export_note_omp (credentials, params, content_type,
                            content_disposition, response_size);

  else if (!strcmp (cmd, "export_notes"))
    return export_notes_omp (credentials, params, content_type,
                             content_disposition, response_size);

  else if (!strcmp (cmd, "export_override"))
    return export_override_omp (credentials, params, content_type,
                                content_disposition, response_size);

  else if (!strcmp (cmd, "export_overrides"))
    return export_overrides_omp (credentials, params, content_type,
                                 content_disposition, response_size);

  else if (!strcmp (cmd, "export_port_list"))
    return export_port_list_omp (credentials, params, content_type,
                                 content_disposition, response_size);

  else if (!strcmp (cmd, "export_port_lists"))
    return export_port_lists_omp (credentials, params, content_type,
                                  content_disposition, response_size);

  else if (!strcmp (cmd, "export_preference_file"))
    return export_preference_file_omp (credentials, params, content_type,
                                       content_disposition, response_size);

  else if (!strcmp (cmd, "export_report_format"))
    return export_report_format_omp (credentials, params, content_type,
                                     content_disposition, response_size);

  else if (!strcmp (cmd, "export_report_formats"))
    return export_report_formats_omp (credentials, params, content_type,
                                      content_disposition, response_size);
  else if (!strcmp (cmd, "export_schedule"))
    return export_schedule_omp (credentials, params, content_type,
                                content_disposition, response_size);

  else if (!strcmp (cmd, "export_schedules"))
    return export_schedules_omp (credentials, params, content_type,
                                 content_disposition, response_size);

  else if (!strcmp (cmd, "export_slave"))
    return export_slave_omp (credentials, params, content_type,
                             content_disposition, response_size);

  else if (!strcmp (cmd, "export_slaves"))
    return export_slaves_omp (credentials, params, content_type,
                              content_disposition, response_size);

  else if (!strcmp (cmd, "export_target"))
    return export_target_omp (credentials, params, content_type,
                              content_disposition, response_size);

  else if (!strcmp (cmd, "export_targets"))
    return export_targets_omp (credentials, params, content_type,
                               content_disposition, response_size);

  else if (!strcmp (cmd, "export_task"))
    return export_task_omp (credentials, params, content_type,
                            content_disposition, response_size);

  else if (!strcmp (cmd, "export_tasks"))
    return export_tasks_omp (credentials, params, content_type,
                             content_disposition, response_size);

  ELSE (get_agent)
  ELSE (get_agents)

  else if (!strcmp (cmd, "download_agent"))
    {
      char *html, *filename;

      if (download_agent_omp (credentials,
                              params,
                              response_size,
                              &html,
                              &filename))
        return html;

      *content_type = GSAD_CONTENT_TYPE_OCTET_STREAM;
      free (*content_disposition);
      *content_disposition = g_strdup_printf ("attachment; filename=%s",
                                              filename);
      free (filename);

      return html;
    }

  ELSE (get_alert)
  ELSE (get_alerts)
  ELSE (get_filter)
  ELSE (get_filters)
  ELSE (get_info)
  ELSE (get_lsc_credential)
  ELSE (get_lsc_credentials)
  ELSE (get_my_settings)
  ELSE (get_note)
  ELSE (get_notes)
  ELSE (get_override)
  ELSE (get_overrides)
  ELSE (get_port_list)
  ELSE (get_port_lists)

  else if (!strcmp (cmd, "get_report"))
    {
      char *ret;
      gchar *content_type_omp;
      ret = get_report_omp (credentials,
                            params,
                            response_size,
                            &content_type_omp,
                            content_disposition);

      if (content_type_omp)
        {
          *content_type = GSAD_CONTENT_TYPE_DONE;
          *content_type_string = content_type_omp;
        }

      return ret;
    }

  ELSE (get_result)
  ELSE (get_report_format)
  ELSE (get_report_formats)
  ELSE (get_schedule)
  ELSE (get_schedules)
  ELSE (get_slave)
  ELSE (get_slaves)
  ELSE (get_system_reports)
  ELSE (get_target)
  ELSE (get_targets)
  ELSE (get_trash)
  ELSE_OAP (get_user)
  ELSE_OAP (get_users)
  ELSE_OAP (get_feed)
  ELSE_OAP (get_scap)
  ELSE (get_config)
  ELSE (get_configs)
  ELSE (get_config_family)
  ELSE (get_config_nvt)
  ELSE (get_nvts)
  ELSE_OAP (get_settings)
  ELSE (new_agent)
  ELSE (new_config)
  ELSE (new_lsc_credential)
  ELSE (new_note)
  ELSE (new_override)
  ELSE (new_port_list)
  ELSE (new_report_format)
  ELSE (new_slave)
  ELSE (new_schedule)
  ELSE (verify_agent)
  ELSE (verify_report_format)
  ELSE (wizard)

  else
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: Unknown command.",
                         "/omp?cmd=get_tasks");
}

/**
 * @brief Max length of cookie expires param.
 */
#define EXPIRES_LENGTH 100

/**
 * @brief Attach SID cookie to a response, resetting "expire" arg.
 *
 * @param[in]  response  Response.
 * @param[in]  sid       Session ID.
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
static int
attach_sid (struct MHD_Response *response, const char *sid)
{
  int ret;
  gchar *value;
  char *locale;
  char expires[EXPIRES_LENGTH + 1];
  struct tm expire_time_broken;
  time_t now, expire_time;
  gchar *tz;

  /* Set up the expires param. */

  /* Store current TZ, switch to GMT. */
  tz = getenv ("TZ") ? g_strdup (getenv ("TZ")) : NULL;
  if (setenv ("TZ", "GMT", 1) == -1)
    {
      g_critical ("%s: failed to set TZ\n", __FUNCTION__);
      g_free (tz);
      exit (EXIT_FAILURE);
    }
  tzset ();

  locale = setlocale (LC_ALL, "C");
  now = time (NULL);
  expire_time = now + (session_timeout * 60) + 30;
  if (localtime_r (&expire_time, &expire_time_broken) == NULL)
    abort ();
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d-%b-%Y %T GMT",
                  &expire_time_broken);
  if (ret == 0)
    abort ();

  setlocale (LC_ALL, locale);

  /* Revert to stored TZ. */
  if (tz)
    {
      if (setenv ("TZ", tz, 1) == -1)
        {
          g_warning ("%s: Failed to switch to original TZ", __FUNCTION__);
          g_free (tz);
          exit (EXIT_FAILURE);
        }
    }
  else
    unsetenv ("TZ");
  g_free (tz);

  /* Add the cookie.
   *
   * Tim Brown's suggested cookie included a domain attribute.  How would
   * we get the domain in here?  Maybe a --domain option. */

  value = g_strdup_printf (SID_COOKIE_NAME
                           "=%s; expires=%s; path=/; %sHTTPonly",
                           sid,
                           expires,
                           (use_secure_cookie ? "secure; " : ""));
  ret = MHD_add_response_header (response, "Set-Cookie", value);
  g_free (value);
  return ret;
}

/**
 * @brief Attach expired SID cookie to response.
 *
 * @param[in]  response  Response.
 *
 * @return MHD_NO in case of problems. MHD_YES if all is OK.
 */
static int
remove_sid (struct MHD_Response *response)
{
  int ret;
  gchar *value;
  char *locale;
  char expires[EXPIRES_LENGTH + 1];
  struct tm expire_time_broken;
  time_t expire_time;

  /* Set up the expires param. */

  locale = setlocale (LC_ALL, "C");
  expire_time = time (NULL);
  if (localtime_r (&expire_time, &expire_time_broken) == NULL)
    abort ();
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d-%b-%Y %T GMT",
                  &expire_time_broken);
  if (ret == 0)
    abort ();

  setlocale (LC_ALL, locale);

  /* Add the cookie.
   *
   * Tim Brown's suggested cookie included a domain attribute.  How would
   * we get the domain in here?  Maybe a --domain option. */

  value = g_strdup_printf (SID_COOKIE_NAME "=0; expires=%s; path=/; %sHTTPonly",
                           expires,
                           (use_secure_cookie ? "secure; " : ""));
  ret = MHD_add_response_header (response, "Set-Cookie", value);
  g_free (value);
  return ret;
}

/**
 * @brief Sends a HTTP response.
 *
 * @param[in]  connection   The connection handle.
 * @param[in]  page         The HTML page content.
 * @param[in]  status_code  The HTTP status code.
 * @param[in]  sid          Session ID, or NULL.
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
int
send_response (struct MHD_Connection *connection, const char *page,
               int status_code, const gchar *sid)
{
  struct MHD_Response *response;
  int ret;

  response = MHD_create_response_from_data (strlen (page),
                                            (void *) page, MHD_NO, MHD_YES);
  MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                           "text/html; charset=utf-8");
  if (sid)
    {
      if (strcmp (sid, "0"))
        {
          if (attach_sid (response, sid) == MHD_NO)
            {
              MHD_destroy_response (response);
              return MHD_NO;
            }
        }
      else
        {
          if (remove_sid (response) == MHD_NO)
            {
              MHD_destroy_response (response);
              return MHD_NO;
            }
        }
    }
  ret = MHD_queue_response (connection, status_code, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Sends a HTTP redirection.
 *
 * @param[in]  connection  The connection handle.
 * @param[in]  location    The URL to redirect to.
 * @param[in]  user        User to add cookie for, or NULL.
 *
 * @return MHD_NO in case of a problem. Else MHD_YES.
 */
int
send_redirect_header (struct MHD_Connection *connection, const char *location,
                      user_t *user)
{
  int ret;
  struct MHD_Response *response;

  response = MHD_create_response_from_data (0, NULL, MHD_NO, MHD_NO);

  if (!response)
    return MHD_NO;

  ret = MHD_add_response_header (response, MHD_HTTP_HEADER_LOCATION, location);
  if (!ret)
    {
      MHD_destroy_response (response);
      return MHD_NO;
    }

  if (user)
    {
      if (attach_sid (response, user->cookie) == MHD_NO)
        {
          MHD_destroy_response (response);
          return MHD_NO;
        }
    }

  MHD_add_response_header (response, MHD_HTTP_HEADER_EXPIRES, "-1");
  MHD_add_response_header (response, MHD_HTTP_HEADER_CACHE_CONTROL, "no-cache");

  ret = MHD_queue_response (connection, MHD_HTTP_SEE_OTHER, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Maximum length of the host portion of the redirect address.
 */
#define MAX_HOST_LEN 1000

/**
 * @brief HTTP request handler for GSAD.
 *
 * This routine is an MHD_AccessHandlerCallback, the request handler for
 * microhttpd.
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

      /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
      con_info = calloc (1, sizeof (struct gsad_connection_info));
      if (NULL == con_info)
        return MHD_NO;

      con_info->params = params_new ();

      con_info->connectiontype = 2;

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    return MHD_NO;

  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if (strcmp (method, "GET") && strcmp (method, "POST"))
    {
      send_response (connection, ERROR_PAGE, MHD_HTTP_METHOD_NOT_ACCEPTABLE,
                     NULL);
      return MHD_YES;
    }

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
  if (send_redirect_header (connection, location, NULL) == MHD_NO)
    {
      g_free (location);
      return MHD_NO;
    }
  g_free (location);
  return MHD_YES;
}

#undef MAX_HOST_LEN

/**
 * @brief Adds content-type header fields to a response.
 *
 * This function should be called only once per response and is the only
 * function where values of enum content_types are translated into strings.
 *
 * @param[in,out]  response  Response to add header to.
 * @param[in]      ct        Content Type to set.
 */
static void
gsad_add_content_type_header (struct MHD_Response *response,
                              enum content_type* ct)
{
  if (!response)
    return;

  switch (*ct)
    {
      case GSAD_CONTENT_TYPE_APP_DEB:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/deb");
        break;
      case GSAD_CONTENT_TYPE_APP_EXE:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/exe");
        break;
      case GSAD_CONTENT_TYPE_APP_HTML:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/html");
        break;
      case GSAD_CONTENT_TYPE_APP_KEY:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/key");
        break;
      case GSAD_CONTENT_TYPE_APP_NBE:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/nbe");
        break;
      case GSAD_CONTENT_TYPE_APP_PDF:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/pdf");
        break;
      case GSAD_CONTENT_TYPE_APP_RPM:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/rpm");
        break;
      case GSAD_CONTENT_TYPE_APP_XML:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/xml; charset=utf-8");
        break;
      case GSAD_CONTENT_TYPE_IMAGE_PNG:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "image/png");
        break;
      case GSAD_CONTENT_TYPE_OCTET_STREAM:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "application/octet-stream");
        break;
      case GSAD_CONTENT_TYPE_TEXT_CSS:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/css");
        break;
      case GSAD_CONTENT_TYPE_TEXT_HTML:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/html; charset=utf-8");
        break;
      case GSAD_CONTENT_TYPE_TEXT_PLAIN:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/plain; charset=utf-8");
        break;
      case GSAD_CONTENT_TYPE_DONE:
        break;
      default:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/plain; charset=utf-8");
        break;
    }
}

/**
 * @brief At least maximum length of rfc2822 format date.
 */
#define DATE_2822_LEN 100

/**
 * @brief Create a response to serve a file.
 *
 * If the file does not exist, but user is logged in, refuse credentials
 * ("logout"). Otherwise, serve the default (login) page.
 *
 * @param[in]   credentials          User authentication information.
 * @param[in]   connection           Connection.
 * @param[in]   url                  Requested URL.
 * @param[out]  http_response_code   Return location for response code.
 * @param[out]  content_type         Return location for content type.
 * @param[out]  content_disposition  Return location for content disposition.
 *
 * @return Response to send in combination with the response code. NULL only
 *         if file information could not be retrieved.
 */
static struct MHD_Response*
file_content_response (credentials_t *credentials,
                       struct MHD_Connection *connection, const char* url,
                       int* http_response_code, enum content_type* content_type,
                       char** content_disposition)
{
  FILE* file;
  gchar* path;
  char *default_file = "login/login.html";
  struct MHD_Response* response;
  char date_2822[DATE_2822_LEN];
  struct tm *mtime;
  time_t next_week;

  /** @todo validation, URL length restriction (allows you to view ANY
    *       file that the user running the gsad might look at!) */
  /** @todo use glibs path functions */
  /* Attempt to prevent disclosing non-gsa content. */
  if (strstr (url, ".."))
    path = g_strconcat (default_file, NULL);
  else
    {
      /* Ensure that url is relative. */
      const char* relative_url = url;
      if (*url == '/') relative_url = url + 1;
      path = g_strconcat (relative_url, NULL);
    }

  if (!strcmp (path, default_file))
    {
      time_t now;
      gchar *xml;
      char *res;
      char ctime_now[200];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      xml = g_strdup_printf ("<login_page>"
                             "<token></token>"
                             "<time>%s</time>"
                             "</login_page>",
                             ctime_now);
      res = xsl_transform (xml);
      response = MHD_create_response_from_data (strlen (res), res,
                                                MHD_NO, MHD_YES);
      g_free (path);
      g_free (xml);
      return response;
    }

  file = fopen (path, "r"); /* flawfinder: ignore, this file is just
                                read and sent */

  if (file == NULL)
    {
      tracef ("File %s failed, ", path);
      g_free (path);

      return MHD_create_response_from_data (strlen (FILE_NOT_FOUND),
                                            (void *) FILE_NOT_FOUND,
                                            MHD_NO,
                                            MHD_YES);
    }

  /* Guess content type. */
  if (strstr (path, ".png"))
    *content_type = GSAD_CONTENT_TYPE_IMAGE_PNG;
  else if (strstr (path, ".html"))
    *content_type = GSAD_CONTENT_TYPE_TEXT_HTML;
  else if (strstr (path, ".css"))
    *content_type = GSAD_CONTENT_TYPE_TEXT_CSS;
  /** @todo Set content disposition? */

  struct stat buf;
  tracef ("Default file successful.\n");
  if (stat (path, &buf))
    {
      /* File information could not be retrieved. */
      g_critical ("%s: file <%s> can not be stat'ed.\n",
                  __FUNCTION__,
                  path);
      g_free (path);
      fclose (file);
      return NULL;
    }

  /* Make sure the requested path really is a file. */
  if ((buf.st_mode & S_IFMT) != S_IFREG)
    {
      struct MHD_Response *ret;
      char *res = gsad_message (credentials,
                                "Invalid request", __FUNCTION__, __LINE__,
                                "The requested page does not exist.",
                                NULL);
      g_free (path);
      fclose (file);
      ret = MHD_create_response_from_data (strlen (res), (void *) res,
                                           MHD_NO, MHD_YES);
      free (res);
      return ret;
    }

  response = MHD_create_response_from_callback (buf.st_size, 32 * 1024,
                                                (MHD_ContentReaderCallback) &file_reader,
                                                file,
                                                (MHD_ContentReaderFreeCallback)
                                                &fclose);

  mtime = localtime (&buf.st_mtime);
  if (mtime
      && strftime (date_2822, DATE_2822_LEN, "%a, %d %b %Y %H:%M:%S %Z", mtime))
    {
      MHD_add_response_header (response, "Last-Modified", date_2822);
    }

  next_week = time (NULL) + 7 * 24 * 60 * 60;
  mtime = localtime (&next_week);
  if (mtime
      && strftime (date_2822, DATE_2822_LEN, "%a, %d %b %Y %H:%M:%S %Z", mtime))
    {
      MHD_add_response_header (response, "Expires", date_2822);
    }

  g_free (path);
  *http_response_code = MHD_HTTP_OK;
  return response;
}

/**
 * @brief Send response for request_handler.
 *
 * @param[in]  connection     Connection handle, e.g. used to send response.
 * @param[in]  response       Response.
 * @param[in]  content_type         Content type.
 * @param[in]  content_disposition  Content disposition.
 * @param[in]  http_response_code   Response code.
 * @param[in]  remove_cookie        Whether to remove SID cookie.
 *
 * @return MHD_YES on success, else MHD_NO.
 */
static int
handler_send_response (struct MHD_Connection *connection,
                       struct MHD_Response *response,
                       enum content_type *content_type,
                       char *content_disposition,
                       int http_response_code,
                       int remove_cookie)
{
  if (remove_cookie)
    if (remove_sid (response) == MHD_NO)
      {
        MHD_destroy_response (response);
        return MHD_NO;
      }
  gsad_add_content_type_header (response, content_type);
  if (content_disposition != NULL)
    {
      MHD_add_response_header (response, "Content-Disposition",
                               content_disposition);
      free (content_disposition);
    }
  MHD_queue_response (connection, http_response_code, response);
  MHD_destroy_response (response);
  return MHD_YES;
}

/**
 * @brief Append a request param to a string.
 *
 * @param[in]  string  String.
 * @param[in]  kind    Kind of request data.
 * @param[in]  key     Key.
 * @param[in]  value   Value.
 *
 * @return MHD_YES.
 */
static int
append_param (void *string, enum MHD_ValueKind kind, const char *key,
              const char *value)
{
  if (strcmp (key, "token") && strcmp (key, "r"))
    {
      g_string_append ((GString*) string, key);
      g_string_append ((GString*) string, "=");
      g_string_append ((GString*) string, value);
      g_string_append ((GString*) string, "&");
    }
  return MHD_YES;
}

/**
 * @brief Reconstruct the URL for a connection.
 *
 * @param[in]  connection  Connection.
 * @param[in]  url         Base part of URL.
 *
 * @return URL.
 */
static gchar *
reconstruct_url (struct MHD_Connection *connection, const char *url)
{
  GString *full_url;

  full_url = g_string_new (url);
  /* To simplify appending the token later, ensure there is at least
   * one param. */
  g_string_append (full_url, "?r=1&");

  MHD_get_connection_values (connection, MHD_GET_ARGUMENT_KIND,
                             append_param, full_url);

  if (full_url->str[strlen (full_url->str) - 1] == '&')
    full_url->str[strlen (full_url->str) - 1] = '\0';

  return g_string_free (full_url, FALSE);
}

/**
 * @brief HTTP request handler for GSAD.
 *
 * This routine is an MHD_AccessHandlerCallback, the request handler for
 * microhttpd.
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
  char *default_file = "/login/login.html";
  const char *omp_cgi_base = "/omp";
  const char *oap_cgi_base = "/oap";
  enum content_type content_type;
  char *content_disposition = NULL;
  gsize response_size = 0;
  int http_response_code = MHD_HTTP_OK;

  struct MHD_Response *response = NULL;
  int ret;
  char *res;
  credentials_t *credentials = NULL;


  /* Never respond on first call of a GET. */
  if ((!strcmp (method, "GET")) && *con_cls == NULL)
    {
      struct gsad_connection_info *con_info;

      /* First call for this request, a GET. */

      /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
      con_info = calloc (1, sizeof (struct gsad_connection_info));
      if (NULL == con_info)
        return MHD_NO;

      con_info->params = params_new ();

      con_info->connectiontype = 2;

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    return MHD_NO;

  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if (strcmp (method, "GET") && strcmp (method, "POST"))
    {
      send_response (connection, ERROR_PAGE, MHD_HTTP_METHOD_NOT_ACCEPTABLE,
                     NULL);
      return MHD_YES;
    }

  /* Redirect the base URL to the login page.  Serve the login page
   * even if the user is already logged in.
   *
   * This might make users think that they have been logged out.  The only
   * way to logout, however, is with a token.  I guess this is where a cookie
   * would be useful. */

  tracef ("============= url: %s\n", url);

  if (!strcmp (&url[0], url_base))
    {
      send_redirect_header (connection, default_file, NULL);
      return MHD_YES;
    }

  if ((!strcmp (method, "GET"))
        && (! strncmp (&url[0], "/login/", strlen ("/login/"))) /* flawfinder: ignore,
                                                                    it is a const str */
        && ! url[strlen ("/login/")])
    {
      send_redirect_header (connection, default_file, NULL);
      return MHD_YES;
    }

  /* Set HTTP Header values. */

  if (!strcmp (method, "GET"))
    {
      const char *token  = NULL;
      const char *cookie = NULL;
      user_t *user;
      gchar *sid;

      /* Second or later call for this request, a GET. */

      content_type = GSAD_CONTENT_TYPE_TEXT_HTML;

      /* Special case the login page, stylesheet and icon. */

      if (!strcmp (url, default_file))
        {
          response = file_content_response (credentials,
                                            connection, url,
                                            &http_response_code,
                                            &content_type,
                                            &content_disposition);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      if (!strcmp (url, "/gsa-style.css")
          || !strcmp (url, "/favicon.ico")
          || !strcmp (url, "/favicon.gif"))
        {
          response = file_content_response (credentials,
                                            connection, url,
                                            &http_response_code,
                                            &content_type,
                                            &content_disposition);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        0);
        }

      /* Allow the decorative images to anyone. */

      if (strncmp (url, "/img/", strlen ("/img/")) == 0)
        {
          response = file_content_response (credentials,
                                            connection, url,
                                            &http_response_code,
                                            &content_type,
                                            &content_disposition);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        0);
        }

      /* Setup credentials from token. */

      token = MHD_lookup_connection_value (connection,
                                           MHD_GET_ARGUMENT_KIND,
                                           "token");
      if (openvas_validate (validator, "token", token))
        token = NULL;

      if (token == NULL)
        {
          res = gsad_message (credentials,
                              "Internal error", __FUNCTION__, __LINE__,
                              "An internal error occured inside GSA daemon. "
                              "Diagnostics: Token missing or bad.",
                              "/omp?cmd=get_tasks");
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          free (res);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      cookie = MHD_lookup_connection_value (connection,
                                            MHD_COOKIE_KIND,
                                            SID_COOKIE_NAME);
      if (openvas_validate (validator, "token", cookie))
        cookie = NULL;

      ret = user_find (cookie, token, &user);
      if (ret == 1)
        {
          res =  gsad_message (credentials,
                               "Internal error", __FUNCTION__, __LINE__,
                               "An internal error occured inside GSA daemon. "
                               "Diagnostics: Bad token.",
                               "/omp?cmd=get_tasks");
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          free (res);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      if ((ret == 2) || (ret == 3))
        {
          time_t now;
          gchar *xml;
          char *res;
          gchar *full_url;
          char ctime_now[200];
          const char *cmd, *report_format_id;
          int export;

          now = time (NULL);
          ctime_r_strip_newline (&now, ctime_now);

          cmd = MHD_lookup_connection_value (connection,
                                             MHD_GET_ARGUMENT_KIND,
                                             "cmd");
          report_format_id = MHD_lookup_connection_value (connection,
                                                          MHD_GET_ARGUMENT_KIND,
                                                          "report_format_id");
          export = (cmd
                    && ((strncmp (cmd, "export", strlen ("export")) == 0)
                        || ((strcmp (cmd, "get_report") == 0)
                            && report_format_id)));

          full_url = reconstruct_url (connection, url);
          xml = g_markup_printf_escaped
                 ("<login_page>"
                  "<message>"
                  "%s"
                  "</message>"
                  "<token></token>"
                  "<time>%s</time>"
                  "<url>%s</url>"
                  "</login_page>",
                  ((ret == 2)
                    ? (strncmp (url, "/logout", strlen ("/logout"))
                        ? "Session has expired.  Please login again."
                        : "Already logged out.")
                    : "Cookie missing or bad.  Please login again."),
                  ctime_now,
                  (((export == 0)
                    && strncmp (url, "/logout", strlen ("/logout")))
                    ? full_url
                    : ""));
          g_free (full_url);
          res = xsl_transform (xml);
          g_free (xml);
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          free (res);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      if (ret)
        abort ();

      /* From here on, the user is authenticated. */

      /* flawfinder: ignore, it is a const str */
      if (!strncmp (url, "/logout", strlen ("/logout")))
        {
          time_t now;
          gchar *xml;
          char *res;
          char ctime_now[200];

          now = time (NULL);
          ctime_r_strip_newline (&now, ctime_now);

          user_remove (user);

          xml = g_strdup_printf ("<login_page>"
                                 "<message>"
                                 "Successfully logged out."
                                 "</message>"
                                 "<token></token>"
                                 "<time>%s</time>"
                                 "</login_page>",
                                 ctime_now);
          res = xsl_transform (xml);
          g_free (xml);
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          free (res);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      credentials = malloc (sizeof (credentials_t));
      if (credentials == NULL) abort ();
      assert (user->username);
      assert (user->password);
      assert (user->role);
      assert (user->timezone);
      assert (user->capabilities);
      assert (user->token);
      credentials->username = strdup (user->username);
      credentials->password = strdup (user->password);
      credentials->role = strdup (user->role);
      credentials->timezone = strdup (user->timezone);
      credentials->capabilities = strdup (user->capabilities);
      credentials->token = strdup (user->token);
      credentials->caller = reconstruct_url (connection, url);

      sid = g_strdup (user->cookie);

      user_release (user);

      /* Serve the request. */

      if (!strncmp (&url[0], omp_cgi_base, strlen (omp_cgi_base))
          || !strncmp (&url[0], oap_cgi_base, strlen (oap_cgi_base)))
        {
          /* URL requests to run OMP or OAP command. */

          unsigned int res_len = 0;
          gchar *content_type_string = NULL;

          res = exec_omp_get (connection, credentials, &content_type,
                              &content_type_string, &content_disposition,
                              &response_size);
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
          if (content_type_string)
            {
              MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                       content_type_string);
              g_free (content_type_string);
            }

          free (res);
        }
      /* URL does not request OMP command but perhaps a special GSAD command? */
      else if (!strncmp (&url[0], "/system_report/",
                         strlen ("/system_report/"))) /* flawfinder: ignore,
                                                         it is a const str */
        {
          gsize res_len;
          const char *duration, *slave_id;

          duration = MHD_lookup_connection_value (connection,
                                                  MHD_GET_ARGUMENT_KIND,
                                                  "duration");
          if (openvas_validate (validator, "duration", duration))
            duration = NULL;

          slave_id = MHD_lookup_connection_value (connection,
                                                  MHD_GET_ARGUMENT_KIND,
                                                  "slave_id");
          if (slave_id && openvas_validate (validator, "slave_id", slave_id))
            {
              g_free (sid);
              return MHD_NO;
            }

          res = get_system_report_omp (credentials,
                                       &url[0] + strlen ("/system_report/"),
                                       duration,
                                       slave_id,
                                       &content_type,
                                       &content_disposition,
                                       &res_len);
          if (res == NULL)
            {
              g_free (sid);
              return MHD_NO;
            }
          response = MHD_create_response_from_data ((unsigned int) res_len,
                                                    res, MHD_NO, MHD_YES);
          free (res);
        }
      else if (!strncmp (&url[0], "/dialog/",
                         strlen ("/dialog/"))) /* flawfinder: ignore,
                                                  it is a const str */
        {
          if (! g_ascii_isalpha (url[8]))
            {
              res = gsad_message (credentials,
                                  "Invalid request", __FUNCTION__, __LINE__,
                                  "The requested dialog page does not exist.",
                                  "/dialog/contents.html");
            }
          else
            {
              gchar *page = g_strndup ((gchar *) &url[8], MAX_FILE_NAME_SIZE);
              // XXX: url subsearch could be nicer and xsl transform could
              // be generalized with the other transforms.
              time_t now;
              char ctime_now[200];
              gchar *xml, *pre;

              assert (credentials->token);

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              pre = g_markup_printf_escaped ("<envelope>"
                                             "<token>%s</token>"
                                             "<time>%s</time>"
                                             "<login>%s</login>"
                                             "<role>%s</role>"
                                             "<dialog><%s/></dialog>",
                                             credentials->token,
                                             ctime_now,
                                             credentials->username,
                                             credentials->role,
                                             page);
              xml = g_strdup_printf ("%s"
                                     "<capabilities>%s</capabilities>"
                                     "</envelope>",
                                     pre,
                                     credentials->capabilities);
              g_free (pre);
              g_free (page);
              res = xsl_transform (xml);
            }
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          free (res);
        }
      else if (!strncmp (&url[0], "/help/",
                         strlen ("/help/"))) /* flawfinder: ignore,
                                                it is a const str */
        {
          if (! g_ascii_isalpha (url[6]))
            {
              res = gsad_message (credentials,
                                  "Invalid request", __FUNCTION__, __LINE__,
                                  "The requested help page does not exist.",
                                  "/help/contents.html");
            }
          else
            {
              gchar *page = g_strndup ((gchar *) &url[6], MAX_FILE_NAME_SIZE);
              // XXX: url subsearch could be nicer and xsl transform could
              // be generalized with the other transforms.
              time_t now;
              char ctime_now[200];
              gchar *xml, *pre;

              assert (credentials->token);

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              pre = g_markup_printf_escaped ("<envelope>"
                                             "<token>%s</token>"
                                             "<time>%s</time>"
                                             "<login>%s</login>"
                                             "<role>%s</role>"
                                             "<help><%s/></help>",
                                             credentials->token,
                                             ctime_now,
                                             credentials->username,
                                             credentials->role,
                                             page);
              xml = g_strdup_printf ("%s"
                                     "<capabilities>%s</capabilities>"
                                     "</envelope>",
                                     pre,
                                     credentials->capabilities);
              g_free (pre);
              g_free (page);
              res = xsl_transform (xml);
            }
          if (res == NULL)
            res = gsad_message (credentials,
                                "Invalid request", __FUNCTION__, __LINE__,
                                "Error generating help page.",
                                "/help/contents.html");
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
          free (res);
        }
      else
        {
          /* URL requests neither an OMP command nor a special GSAD command,
           * so it is a simple file. */
          /* Serve a file. */
          response = file_content_response (credentials,
                                            connection, url,
                                            &http_response_code,
                                            &content_type,
                                            &content_disposition);
        }

      if (response)
        {
          if (attach_sid (response, sid) == MHD_NO)
            {
              g_free (sid);
              MHD_destroy_response (response);
              return MHD_NO;
            }
          g_free (sid);

          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        0);
        }
      else
        {
          /* Severe memory or file access problem. */
          g_free (sid);
          return MHD_NO;
        }
    }

  if (!strcmp (method, "POST"))
    {
      user_t *user;
      const char *sid;
      gchar *new_sid;

      if (NULL == *con_cls)
        {
          /* First call for this request, a POST. */

          struct gsad_connection_info *con_info;

          /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
          con_info = calloc (1, sizeof (struct gsad_connection_info));
          if (NULL == con_info)
            return MHD_NO;

          con_info->postprocessor =
            MHD_create_post_processor (connection, POST_BUFFER_SIZE,
                                       serve_post, (void *) con_info);
          if (NULL == con_info->postprocessor)
            return MHD_NO;
          con_info->params = params_new ();
          con_info->connectiontype = 1;
          con_info->answercode = MHD_HTTP_OK;

          *con_cls = (void *) con_info;
          return MHD_YES;
        }

      /* Second or later call for this request, a POST. */

      struct gsad_connection_info *con_info = *con_cls;
      if (0 != *upload_data_size)
        {
          MHD_post_process (con_info->postprocessor, upload_data,
                            *upload_data_size);
          *upload_data_size = 0;
          return MHD_YES;
        }

      sid = MHD_lookup_connection_value (connection,
                                         MHD_COOKIE_KIND,
                                         SID_COOKIE_NAME);
      if (openvas_validate (validator, "token", sid))
        con_info->cookie = NULL;
      else
        con_info->cookie = g_strdup (sid);

      new_sid = NULL;
      ret = exec_omp_post (con_info, &user, &new_sid);

      if (ret == 1)
        {
          gchar *url;
          url = g_strdup_printf ("%s&token=%s",
                                 params_value (con_info->params, "text"),
                                 user->token);
          user_release (user);
          send_redirect_header (connection, url, user);
          g_free (url);
          return MHD_YES;
        }

      ret = send_response (connection, con_info->response, MHD_HTTP_OK,
                           new_sid ? new_sid : "0");
      g_free (new_sid);
      return ret;
    }
  return MHD_NO;
}


/**
 * @brief Attempt to drop privileges (become user "nobody").
 *
 * @param[in]  nobody_pw  User details of "nobody".
 *
 * @return TRUE if successfull, FALSE if failed (will g_critical in fail case).
 */
static gboolean
drop_privileges (struct passwd * nobody_pw)
{
  if (setgid (nobody_pw->pw_gid) != 0)
    {
      g_critical ("%s: Failed to drop group privileges!\n", __FUNCTION__);
      return FALSE;
    }
  if (setuid (nobody_pw->pw_uid) != 0)
    {
      g_critical ("%s: Failed to drop group privileges!\n", __FUNCTION__);
      return FALSE;
    }

  return TRUE;
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
  if (mutex == NULL)
    mutex = g_mutex_new ();
  users = g_ptr_array_new ();

  /* Check for required files. */
  if (openvas_file_check_is_dir (GSA_DATA_DIR) < 1)
    {
      g_critical ("%s: Could not access %s!\n", __FUNCTION__, GSA_DATA_DIR);
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
  if (redirect_pid) kill (redirect_pid, SIGTERM);

  MHD_stop_daemon (gsad_daemon);

  if (log_config) free_log_configuration (log_config);

  pidfile_remove ("gsad");
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
  int gsad_port;
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

  static gboolean do_chroot = FALSE;
  static gboolean foreground = FALSE;
  static gboolean http_only = FALSE;
  static gboolean print_version = FALSE;
  static gboolean redirect = FALSE;
  static gboolean secure_cookie = FALSE;
  static int timeout = SESSION_TIMEOUT;
  static gchar *gsad_address_string = NULL;
  static gchar *gsad_manager_address_string = NULL;
  static gchar *gsad_administrator_address_string = NULL;
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
    {"http-only", '\0',
     0, G_OPTION_ARG_NONE, &http_only,
     "Serve HTTP only, without SSL.", NULL},
    /** @todo This is 'a' in Manager. */
    {"listen", '\0',
     0, G_OPTION_ARG_STRING, &gsad_address_string,
     "Listen on <address>.", "<address>" },
    {"alisten", '\0',
     0, G_OPTION_ARG_STRING, &gsad_administrator_address_string,
     "Administrator address.", "<address>" },
    {"mlisten", '\0',
     0, G_OPTION_ARG_STRING, &gsad_manager_address_string,
     "Manager address.", "<address>" },
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
    {"do-chroot", '\0',
     0, G_OPTION_ARG_NONE, &do_chroot,
     "Do chroot and drop privileges.", NULL},
    {"secure-cookie", '\0',
     0, G_OPTION_ARG_NONE, &secure_cookie,
     "Use a secure cookie (implied when using HTTPS).", NULL},
    {"timeout", '\0',
     0, G_OPTION_ARG_INT, &timeout,
     "Minutes of user idle time before session expires.", "<number>"},
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
      printf ("Greenbone Security Assistant %s\n", GSAD_VERSION);
      printf ("Copyright (C) 2010-2012 Greenbone Networks GmbH\n");
      printf ("License GPLv2+: GNU GPL version 2 or later\n");
      printf
        ("This is free software: you are free to change and redistribute it.\n"
         "There is NO WARRANTY, to the extent permitted by law.\n\n");
      exit (EXIT_SUCCESS);
    }

  switch (gsad_base_init ())
    {
      case 1:
        g_critical ("%s: libxml must be compiled with thread support\n",
                    __FUNCTION__);
        exit (EXIT_FAILURE);
    }


  if ((redirect || gsad_redirect_port_string) && http_only)
    {
      g_critical ("%s: redirect options given with HTTP only option\n",
                  __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Switch to UTC for scheduling. */

  if (setenv ("TZ", "utc 0", 1) == -1)
    {
      g_critical ("%s: failed to set timezone\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }
  tzset ();

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

  use_secure_cookie = secure_cookie;

  if ((timeout < 1) || (timeout > 1440))
    {
      g_critical ("%s: Timeout must be a number from 1 to 1440\n",
                  __FUNCTION__);
      exit (EXIT_FAILURE);
    }
  session_timeout = timeout;

  gsad_port = http_only ? DEFAULT_GSAD_HTTP_PORT : DEFAULT_GSAD_HTTPS_PORT;

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

  if (redirect)
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
          redirect_pid = pid;
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
      || signal (SIGHUP, handle_sighup) == SIG_ERR  /* RATS: ignore, only one function per signal */
#ifdef USE_LIBXSLT
      || signal (SIGCHLD, SIG_IGN) == SIG_ERR)      /* RATS: ignore, only one function per signal */
#else
      || signal (SIGCHLD, SIG_DFL) == SIG_ERR)      /* RATS: ignore, only one function per signal */
#endif
    {
      g_critical ("%s: Failed to register signal handlers!\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Write pidfile. */

  if (pidfile_create ("gsad"))
    {
      g_critical ("%s: Could not write PID file.\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  if (do_chroot)
    {
      /* Chroot into state dir and drop privileges. */

      struct passwd * nobody_pw = getpwnam ("nobody");
      if (nobody_pw == NULL)
        {
          g_critical ("%s: Failed to drop privileges."
                      "  Could not determine UID and GID for user \"nobody\"!\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }

      if (chroot (GSA_DATA_DIR))
        {
          g_critical ("%s: Failed to chroot: %s\n",
                      __FUNCTION__,
                      strerror (errno));
          exit (EXIT_FAILURE);
        }

      if (drop_privileges (nobody_pw) == FALSE)
        exit (EXIT_FAILURE);

      if (chdir ("/"))
        {
          g_critical ("%s: failed change to chroot root directory\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }
  else if (chdir (GSA_DATA_DIR))
    {
      g_critical ("%s: failed change to state dir (" GSA_DATA_DIR ")\n",
                  __FUNCTION__);
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
          tracef ("GSAD started successfully and is redirecting on port %d.\n",
                  gsad_redirect_port);
        }
    }
  else
    {
      omp_init (gsad_manager_address_string, gsad_manager_port);
      oap_init (gsad_administrator_address_string, gsad_administrator_port);

      gsad_address.sin_family = AF_INET;
      gsad_address.sin_port = htons (gsad_port);
      if (gsad_address_string)
        {
          if (!inet_aton (gsad_address_string, &gsad_address.sin_addr))
            {
              g_critical ("%s: failed to create GSAD address %s\n",
                          __FUNCTION__,
                          gsad_address_string);
              exit (EXIT_FAILURE);
            }
        }
      else
        gsad_address.sin_addr.s_addr = INADDR_ANY;

      tracef ("   GSAD will bind to address %s port %i\n",
              gsad_address_string ? gsad_address_string : "*",
              ntohs (gsad_address.sin_port));

      /* Start the real server. */
      if (http_only)
        {
          gsad_daemon =
            MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION
                              | MHD_USE_DEBUG,
                              gsad_port,
                              NULL, /* Policy callback. */
                              NULL, /* Policy callback arg. */
                              &request_handler,
                              NULL, /* Access callback arg. */
                              /* Option value(s) pairs. */
                              MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL,
                              MHD_OPTION_SOCK_ADDR, &gsad_address,
                              /* End marker option. */
                              MHD_OPTION_END);

          if (gsad_daemon == NULL && gsad_port_string == NULL)
            {
              g_warning ("Binding to port %d failed, trying default port %d next.",
                         gsad_port, DEFAULT_GSAD_PORT);
              gsad_port = DEFAULT_GSAD_PORT;
              gsad_address.sin_family = AF_INET;
              gsad_address.sin_port = htons (gsad_port);
              if (gsad_address_string)
                {
                  if (!inet_aton (gsad_address_string, &gsad_address.sin_addr))
                    {
                      g_critical ("%s: failed to create GSAD address %s\n",
                                  __FUNCTION__,
                                  gsad_address_string);
                      exit (EXIT_FAILURE);
                    }
                }
              else
                gsad_address.sin_addr.s_addr = INADDR_ANY;

              gsad_daemon =
                MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION
                                  | MHD_USE_DEBUG,
                                  gsad_port,
                                  NULL, /* Policy callback. */
                                  NULL, /* Policy callback arg. */
                                  &request_handler,
                                  NULL, /* Access callback arg. */
                                  /* Option value(s) pairs. */
                                  MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL,
                                  MHD_OPTION_SOCK_ADDR, &gsad_address,
                                  /* End marker option. */
                                  MHD_OPTION_END);
            }
        }
      else
        {
          gchar *ssl_private_key = NULL;
          gchar *ssl_certificate = NULL;

          use_secure_cookie = 1;

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
            MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION
                              | MHD_USE_DEBUG
                              | MHD_USE_SSL,
                              gsad_port,
                              NULL, /* Policy callback. */
                              NULL, /* Policy callback arg. */
                              &request_handler,
                              NULL, /* Access callback arg. */
                              /* Option value(s) pairs. */
                              MHD_OPTION_HTTPS_MEM_KEY, ssl_private_key,
                              MHD_OPTION_HTTPS_MEM_CERT, ssl_certificate,
                              MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL,
                              MHD_OPTION_SOCK_ADDR, &gsad_address,
                              /* End marker option. */
                              MHD_OPTION_END);

          if (gsad_daemon == NULL && gsad_port_string == NULL)
            {
              g_warning ("Binding to port %d failed, trying default port %d next.",
                         gsad_port, DEFAULT_GSAD_PORT);
              gsad_port = DEFAULT_GSAD_PORT;
              gsad_address.sin_family = AF_INET;
              gsad_address.sin_port = htons (gsad_port);
              if (gsad_address_string)
                {
                  if (!inet_aton (gsad_address_string, &gsad_address.sin_addr))
                    {
                      g_critical ("%s: failed to create GSAD address %s\n",
                                  __FUNCTION__,
                                  gsad_address_string);
                      exit (EXIT_FAILURE);
                    }
                }
              else
                gsad_address.sin_addr.s_addr = INADDR_ANY;

              gsad_daemon =
                MHD_start_daemon (MHD_USE_THREAD_PER_CONNECTION
                                  | MHD_USE_DEBUG
                                  | MHD_USE_SSL,
                                  gsad_port,
                                  NULL, /* Policy callback. */
                                  NULL, /* Policy callback arg. */
                                  &request_handler,
                                  NULL, /* Access callback arg. */
                                  /* Option value(s) pairs. */
                                  MHD_OPTION_HTTPS_MEM_KEY, ssl_private_key,
                                  MHD_OPTION_HTTPS_MEM_CERT, ssl_certificate,
                                  MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL,
                                  MHD_OPTION_SOCK_ADDR, &gsad_address,
                                  /* End marker option. */
                                  MHD_OPTION_END);
            }

        }

      if (gsad_daemon == NULL)
        {
          g_critical ("%s: MHD_start_daemon failed!\n", __FUNCTION__);
          return EXIT_FAILURE;
        }
      else
        {
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
