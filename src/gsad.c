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
 * @brief Maximum length of "file name" for /help/ URLs.
 */
#define MAX_HELP_NAME_SIZE 128

/**
 * @brief Max number of minutes between activity in a session.
 */
#define SESSION_TIMEOUT 15

/**
 * @brief Initial filtered results per page on the report summary.
 */
#define RESULTS_PER_PAGE 100

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
  char *cookie;       ///< Cookie token.
  char *token;        ///< Request session token.
  gchar *username;    ///< Login name.
  gchar *password;    ///< Password.
  time_t time;        ///< Login time.
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
 * @param[in]  username  Name of user.
 * @param[in]  password  Password for user.
 *
 * @return Added user.
 */
user_t *
user_add (const gchar *username, const gchar *password)
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
    }
  else
    {
      user = g_malloc (sizeof (user_t));
      user->cookie = openvas_uuid_make ();
      user->token = openvas_uuid_make ();
      user->username = g_strdup (username);
      user->password = g_strdup (password);
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
              if (time (NULL) - user->time > (session_timeout * 60))
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
    ret = 2;
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
                         "^(create_agent)"
                         "|(create_config)"
                         "|(create_escalator)"
                         "|(create_lsc_credential)"
                         "|(create_note)"
                         "|(create_override)"
                         "|(create_report)"
                         "|(create_schedule)"
                         "|(create_slave)"
                         "|(create_target)"
                         "|(create_task)"
                         "|(create_user)"
                         "|(delete_agent)"
                         "|(delete_config)"
                         "|(delete_escalator)"
                         "|(delete_lsc_credential)"
                         "|(delete_note)"
                         "|(delete_override)"
                         "|(delete_report)"
                         "|(delete_report_format)"
                         "|(delete_schedule)"
                         "|(delete_slave)"
                         "|(delete_target)"
                         "|(delete_task)"
                         "|(delete_trash_agent)"
                         "|(delete_trash_config)"
                         "|(delete_trash_escalator)"
                         "|(delete_trash_lsc_credential)"
                         "|(delete_trash_report_format)"
                         "|(delete_trash_schedule)"
                         "|(delete_trash_slave)"
                         "|(delete_trash_target)"
                         "|(delete_trash_task)"
                         "|(delete_user)"
                         "|(edit_config)"
                         "|(edit_config_family)"
                         "|(edit_config_nvt)"
                         "|(edit_lsc_credential)"
                         "|(edit_note)"
                         "|(edit_override)"
                         "|(edit_report_format)"
                         "|(edit_settings)"
                         "|(edit_task)"
                         "|(edit_user)"
                         "|(empty_trashcan)"
                         "|(escalate_report)"
                         "|(export_config)"
                         "|(export_preference_file)"
                         "|(export_report_format)"
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
                         "|(get_note)"
                         "|(get_notes)"
                         "|(get_nvts)"
                         "|(get_override)"
                         "|(get_overrides)"
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
                         "|(get_tasks)"
                         "|(get_trash)"
                         "|(get_user)"
                         "|(get_users)"
                         "|(import_config)"
                         "|(import_report_format)"
                         "|(modify_auth)"
                         "|(new_note)"
                         "|(new_override)"
                         "|(new_task)"
                         "|(pause_task)"
                         "|(restore)"
                         "|(resume_paused_task)"
                         "|(resume_stopped_task)"
                         "|(test_escalator)"
                         "|(save_config)"
                         "|(save_config_family)"
                         "|(save_config_nvt)"
                         "|(save_lsc_credential)"
                         "|(save_note)"
                         "|(save_override)"
                         "|(save_report_format)"
                         "|(save_settings)"
                         "|(save_task)"
                         "|(save_user)"
                         "|(start_task)"
                         "|(stop_task)"
                         "|(sync_feed)"
                         "|(verify_agent)"
                         "|(verify_report_format)$");


  openvas_validator_add (validator, "agent_format", "^(installer)$");
  openvas_validator_add (validator, "agent_id",     "^[a-z0-9\\-]+$");
  /* Defined in RFC 2253. */
  openvas_validator_add (validator, "authdn",     "^.{0,200}%s.{0,200}$");
  openvas_validator_add (validator, "boolean",    "^0|1$");
  openvas_validator_add (validator, "comment",    "^[-_[:alnum:]äüöÄÜÖß, \\./]{0,400}$");
  openvas_validator_add (validator, "config_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "condition",  "^[[:alnum:] ]{0,100}$");
  openvas_validator_add (validator, "create_credentials_type", "^(gen|pass|key)$");
  openvas_validator_add (validator, "credential_login", "^[-_[:alnum:]\\.@\\\\]{1,40}$");
  openvas_validator_add (validator, "min_cvss_base", "^(|10.0|[0-9].[0-9])$");
  openvas_validator_add (validator, "day_of_month", "^((0|1|2)[0-9]{1,1})|30|31$");
  openvas_validator_add (validator, "delta_states", "^(c|g|n|s){0,4}$");
  openvas_validator_add (validator, "domain",     "^[-[:alnum:]\\.]{1,80}$");
  openvas_validator_add (validator, "email",      "^[^@ ]{1,150}@[^@ ]{1,150}$");
  openvas_validator_add (validator, "escalator_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "family",     "^[-_[:alnum:] :]{1,200}$");
  openvas_validator_add (validator, "family_page", "^[-_[:alnum:] :]{1,200}$");
  openvas_validator_add (validator, "first_result", "^[0-9]+$");
  /* Validator for  modify_auth group, e.g. "method:ldap". */
  openvas_validator_add (validator, "group",        "^method:(ads|ldap)$");
  openvas_validator_add (validator, "max_results",  "^[0-9]+$");
  openvas_validator_add (validator, "format",     "^[-[:alnum:]]{1,15}$");
  openvas_validator_add (validator, "host",       "^[[:alnum:]\\.]{1,80}$");
  openvas_validator_add (validator, "hostport",   "^[[:alnum:]\\. :]{1,80}$");
  openvas_validator_add (validator, "hosts",      "^[-[:alnum:],: \\./]{1,2000}$");
  openvas_validator_add (validator, "hosts_allow", "^0|1|2$");
  openvas_validator_add (validator, "hosts_opt",  "^[[:alnum:], \\./]{0,80}$");
  openvas_validator_add (validator, "hour",        "^((0|1)[0-9]{1,1})|(2(0|1|2|3))$");
  openvas_validator_add (validator, "levels",       "^(h|m|l|g|f){0,5}$");
  openvas_validator_add (validator, "login",      "^[[:alnum:]]{1,10}$");
  openvas_validator_add (validator, "lsc_credential_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "lsc_password", "^.{0,40}$");
  openvas_validator_add (validator, "max_result", "^[0-9]+$");
  openvas_validator_add (validator, "minute",     "^[0-5]{1,1}[0-9]{1,1}$");
  openvas_validator_add (validator, "month",      "^(0[0-9]{1,1})|10|11|12$");
  openvas_validator_add (validator, "note_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "note_task_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "note_result_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "override_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "override_task_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "override_result_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "name",       "^[-_[:alnum:], \\./]{1,80}$");
  openvas_validator_add (validator, "number",     "^[0-9]+$");
  openvas_validator_add (validator, "optional_number", "^[0-9]*$");
  openvas_validator_add (validator, "oid",        "^[0-9.]{1,80}$");
  openvas_validator_add (validator, "page",       "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "package_format", "^(key)|(rpm)|(deb)|(exe)$");
  openvas_validator_add (validator, "password",   "^.{0,40}$");
  openvas_validator_add (validator, "port",       "^[-[:alnum:] \\(\\)_/]{1,400}$");
  openvas_validator_add (validator, "port_range", "^((default)|([-0-9, ]{1,400}))$");
  /** @todo Better regex. */
  openvas_validator_add (validator, "preference_name", "^(.*){0,400}$");
  openvas_validator_add (validator, "pw",         "^[[:alnum:]]{1,10}$");
  openvas_validator_add (validator, "xml_file",   NULL);
  openvas_validator_add (validator, "report_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "report_format_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "result_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "role",       "^[[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "slave_id",   "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "target_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "task_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "text",       "^.{0,1000}");
  openvas_validator_add (validator, "threat",     "^(High|Medium|Low|Log|False Positive|)$");
  openvas_validator_add (validator, "type",       "^inventory$");
  openvas_validator_add (validator, "search_phrase", "^[[:alnum:][:punct:] äöüÄÖÜß]{0,400}$");
  openvas_validator_add (validator, "sort_field", "^[_[:alnum:] ]{1,20}$");
  openvas_validator_add (validator, "sort_order", "^(ascending)|(descending)$");
  openvas_validator_add (validator, "target_locator", "^[[:alnum:] -_/]{1,80}$");
  openvas_validator_add (validator, "token", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "schedule_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "uuid",       "^[0-9abcdefABCDEF\\-]{1,40}$");
  openvas_validator_add (validator, "year",       "^[0-9]+$");
  openvas_validator_add (validator, "calendar_unit", "^second|minute|hour|day|week|month|year|decade$");


  openvas_validator_alias (validator, "apply_overrides", "boolean");
  openvas_validator_alias (validator, "base",         "name");
  openvas_validator_alias (validator, "delta_state_changed", "boolean");
  openvas_validator_alias (validator, "delta_state_gone", "boolean");
  openvas_validator_alias (validator, "delta_state_new", "boolean");
  openvas_validator_alias (validator, "delta_state_same", "boolean");
  openvas_validator_alias (validator, "duration",     "optional_number");
  openvas_validator_alias (validator, "duration_unit", "calendar_unit");
  openvas_validator_alias (validator, "enable",       "boolean");
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
  openvas_validator_alias (validator, "new_threat",   "threat");
  openvas_validator_alias (validator, "notes",        "boolean");
  openvas_validator_alias (validator, "overrides",        "boolean");
  openvas_validator_alias (validator, "result_hosts_only", "boolean");
  openvas_validator_alias (validator, "period",       "optional_number");
  openvas_validator_alias (validator, "period_unit",  "calendar_unit");
}

/**
 * @brief Check validity of an input string.
 *
 * Checks whether an input string is valid according to a rule registered with
 * \ref validator.  Frees and NULLs \p string if not.
 *
 * @param[in]      validator       Validator to use.
 * @param[in]      validator_rule  The rule with which to validate \p string.
 * @param[in,out]  string          The string to validate.  If invalid, memory
 *                                 location pointed to will be freed and set
 *                                 to NULL.
 *
 * @return TRUE if \p string was invalid and was freed, FALSE otherwise.
 */
static gboolean
validate (validator_t validator, const gchar* validator_rule, char** string)
{
  if (openvas_validate (validator, validator_rule, *string))
    {
      free (*string);
      *string = NULL;
      return TRUE;
    }

  return FALSE;
}

/**
 * @brief Check validity of an input string.
 *
 * @param[in]      validator       Validator to use.
 * @param[in]      validator_rule  The rule with which to validate \p string.
 * @param[in,out]  string          The string to validate.  If invalid, memory
 *                                 location pointed to will be freed and set
 *                                 to NULL.
 * @param[in]      fallback        String to duplicate into \p string if
 *                                 \p string is NULL.
 *
 * @return TRUE if \p string was invalid and was freed, FALSE otherwise.
 */
static gboolean
validate_or (validator_t validator, const gchar* validator_rule, char** string,
             const char *fallback)
{
  if (*string)
    {
      if (openvas_validate (validator, validator_rule, *string))
        {
          free (*string);
          *string = NULL;
          return TRUE;
        }

      return FALSE;
    }
  *string = g_strdup (fallback);
  return FALSE;
}

/**
 * @brief Frees array and its gchar* contents.
 *
 * @param[in,out]  array  The GArray containing gchar*s to free.
 */
static void
free_gchar_array (GArray ** array)
{
  if (*array)
    {
      gchar *item;
      int index = 0;

      while ((item = g_array_index (*array, gchar*, index++)))
        g_free (item);

      g_array_free (*array, TRUE);
    }
}

/**
 * @brief Set a content type from a format string.
 *
 * For example set the content type to GSAD_CONTENT_TYPE_APP_DEB when given
 * when given format "deb".
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
 * @brief Get data for an escalator.
 *
 * @param[out]  data  Data.
 * @param[out]  name  Name of element.
 *
 * @return Parameter value on success, NULL on error.
 */
static gchar *
escalator_data (GArray *data, const char *name)
{
  int index = 0;
  method_data_param_t *element;

  if (data)
    while ((element = g_array_index (data, method_data_param_t*, index++)))
      if (strcmp (element->key, name) == 0)
        return (gchar*) element->value;

  return NULL;
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
   * @todo This should eventually be a dynamic key-based structure.
   * @todo Combine POST and GET parameter handling.
   */
  struct req_parms
  {
    char *cookie;        ///< Value of "SID" cookie.
    char *token;         ///< Value of "token" parameter.

    char *caller;        ///< Value of "caller" parameter.

    char *access_hosts;  ///< Value of "access_hosts" parameter.
    char *agent_id;      ///< Value of "agent_id" parameter.
    char *apply_min;     ///< Value of "apply_min" parameter.
    char *authdn;        ///< Value of "authdn" parameter.
    char *base;          ///< Value of "base" parameter.
    char *cmd;           ///< Value of "cmd" parameter.
    char *name;          ///< Value of "name" parameter.
    char *comment;       ///< Value of "comment" parameter.
    char *condition;     ///< Value of "condition" parameter.
    char *config_id;     ///< Value of "config_id" parameter.
    char *credential_login; ///< Value of "credential_login" parameter.
    char *day_of_month;  ///< Value of "day_of_month" parameter.
    char *duration;      ///< Value of "duration" parameter.
    char *duration_unit; ///< Value of "duration_unit" parameter.
    char *enable;        ///< Value of "enable" parameter.
    char *esc_first_result;  ///< Value of "esc_first_result" parameter.
    char *esc_levels;        ///< Value of "esc_levels" parameter.
    char *esc_max_results;   ///< Value of "esc_max_results" parameter.
    char *esc_min_cvss_base; ///< Value of "esc_min_cvss_base" parameter.
    char *esc_notes;         ///< Value of "esc_notes" parameter.
    char *esc_overrides;     ///< Value of "esc_overrides" parameter.
    char *esc_result_hosts_only; ///< Value of "esc_result_hosts_only" parameter.
    char *esc_search_phrase; ///< Value of "esc_search_phrase" parameter.
    char *escalator_id;  ///< Value of "escalator_id" parameter.
    char *event;         ///< Value of "event" parameter.
    char *family;        ///< Value of "family" parameter.
    char *group;         ///< Value of "group" parameter.
    char *domain;        ///< Value of "domain" parameter.
    char *hour;          ///< Value of "hour" parameter.
    char *ldaphost;      ///< Value of "ldaphost" parameter.
    char *lsc_credential_id; ///< Value of "lsc_credential_id" parameter.
    char *lsc_smb_credential_id; ///< Value of "lsc_smb_credential_id" parameter.
    char *modify_password; ///< Value of "modify_password" parameter.
    char *method;        ///< Value of "event" parameter.
    char *next;          ///< Value of "next" parameter.
    char *schedule_id;   ///< Value of "schedule_id" parameter.
    char *slave_id;      ///< Value of "slave_id" parameter.
    char *sort_field;    ///< Value of "sort_field" parameter.
    char *sort_order;    ///< Value of "sort_order" parameter.
    char *target_id;     ///< Value of "target_id" parameter.
    char *target_locator; ///< Value of "target_locator" parameter.
    char *levels;        ///< Value of "levels" parameter.
    char *notes;         ///< Value of "notes" parameter.
    char *overrides;     ///< Value of "overrides" parameter.
    char *result_hosts_only; ///< Value of "result_hosts_only" parameter.
    char *xml_file;      ///< Value of "xml_file" parameter.
    char *role;          ///< Value of "role" parameter.
    char *submit;        ///< Value of "submit" parameter.
    char *host;          ///< Value of "host" parameter.
    char *hosts;         ///< Value of "hosts" parameter.
    char *hosts_allow;   ///< Value of "hosts_allow" parameter.
    char *login;         ///< Value of "login" parameter.
    char *max_checks;    ///< Value of "max_checks" parameter.
    char *max_hosts;     ///< Value of "max_hosts" parameter.
    char *minute;        ///< Value of "minute" parameter.
    char *month;         ///< Value of "month" parameter.
    char *note_id;       ///< Value of "note_id" parameter.
    char *note_task_id;  ///< Value of "note_task_id" parameter.
    char *note_result_id; ///< Value of "note_result_id" parameter.
    char *oid;           ///< Value of "oid" parameter.
    char *override_id;   ///< Value of "override_id" parameter.
    char *override_task_id;   ///< Value of "override_task_id" parameter.
    char *override_result_id; ///< Value of "override_result_id" parameter.
    char *period;        ///< Value of "period" parameter.
    char *period_unit;   ///< Value of "period_unit" parameter.
    char *pw;            ///< Value of "pw" parameter.
    char *passphrase;    ///< Value of "passphrase" parameter.
    char *password;      ///< Value of "password" parameter.
    char *port;          ///< Value of "port" parameter.
    char *port_range;    ///< Value of "port_range" parameter.
    char *private_key;   ///< Value of "private_key" parameter.
    char *public_key;    ///< Value of "public_key" parameter.
    char *timeout;       ///< Value of "timeout" parameter.
    char *threat;        ///< Value of "threat" parameter.
    char *new_threat;    ///< Value of "new_threat" parameter.
    char *text;          ///< Value of "text" parameter.
    char *task_id;       ///< Value of "task_id" parameter.
    char *refresh_interval; ///< Value of "refresh_interval" parameter.
    char *result_id;     ///< Value of "result_id" parameter.
    char *report_escalator_id;  ///< Value of "report_escalator_id" parameter.
    char *report_format_id;     ///< Value of "report_format_id" parameter.
    char *report_id;     ///< Value of "report_id" parameter.
    char *first_result;  ///< Value of "first_result" parameter.
    char *max_results;   ///< Value of "max_results" parameter.
    char *search_phrase; ///< Value of "search_phrase" parameter.
    char *min_cvss_base; ///< Value of "min_cvss_base" parameter.
    char *apply_min_cvss_base; ///< Value of "apply_min_cvss_base" parameter.
    char *installer;     ///< Value of "installer" parameter.
    int installer_size;  ///< Size of "installer" parameter.
    char *installer_filename; ///< Filename of "installer" parameter.
    char *installer_sig; ///< Value of "installer_sig" parameter.
    int installer_sig_size;  ///< Size of "installer_sig" parameter.
    char *howto_install; ///< Value of "howto_install" parameter.
    int howto_install_size; ///< Size of "howto_install" parameter.
    char *howto_use;     ///< Value of "howto_use" parameter.
    int howto_use_size;  ///< Size of "howto_use" parameter.
    char *year;          ///< Value of "year" parameter.
    GArray *condition_data; ///< Collection of "condition_data:*" parameters.
    GArray *event_data;  ///< Collection of "event_data:*" parameters.
    GArray *files;       ///< Collection of "file:*" parameters.
    GArray *method_data; ///< Collection of "method_data:*" parameters.
    GArray *passwords;   ///< Collection of "password:*" parameters.
    GArray *preferences; ///< Collection of "preference:*" parameters.
    GArray *nvts;        ///< Collection of "nvt:*" parameters.
    GArray *trends;      ///< Collection of "trend:*" parameters.
    GArray *selects;     ///< Collection of "select:*" parameters.
  } req_parms;
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
  free (con_info->req_parms.cookie);
  free (con_info->req_parms.token);

  free (con_info->req_parms.caller);

  free (con_info->req_parms.access_hosts);
  free (con_info->req_parms.agent_id);
  free (con_info->req_parms.apply_min);
  free (con_info->req_parms.base);
  free (con_info->req_parms.cmd);
  free (con_info->req_parms.name);
  free (con_info->req_parms.comment);
  free (con_info->req_parms.condition);
  free (con_info->req_parms.config_id);
  free (con_info->req_parms.credential_login);
  free (con_info->req_parms.day_of_month);
  free (con_info->req_parms.domain);
  free (con_info->req_parms.duration);
  free (con_info->req_parms.duration_unit);
  free (con_info->req_parms.escalator_id);
  free (con_info->req_parms.esc_first_result);
  free (con_info->req_parms.esc_levels);
  free (con_info->req_parms.esc_max_results);
  free (con_info->req_parms.esc_min_cvss_base);
  free (con_info->req_parms.esc_notes);
  free (con_info->req_parms.esc_overrides);
  free (con_info->req_parms.esc_result_hosts_only);
  free (con_info->req_parms.esc_search_phrase);
  free (con_info->req_parms.event);
  free (con_info->req_parms.family);
  free (con_info->req_parms.group);
  free (con_info->req_parms.hour);
  free (con_info->req_parms.lsc_credential_id);
  free (con_info->req_parms.lsc_smb_credential_id);
  free (con_info->req_parms.max_checks);
  free (con_info->req_parms.max_hosts);
  free (con_info->req_parms.minute);
  free (con_info->req_parms.month);
  free (con_info->req_parms.modify_password);
  free (con_info->req_parms.method);
  free (con_info->req_parms.next);
  free (con_info->req_parms.note_task_id);
  free (con_info->req_parms.note_result_id);
  free (con_info->req_parms.schedule_id);
  free (con_info->req_parms.slave_id);
  free (con_info->req_parms.target_id);
  free (con_info->req_parms.xml_file);
  free (con_info->req_parms.role);
  free (con_info->req_parms.submit);
  free (con_info->req_parms.host);
  free (con_info->req_parms.hosts);
  free (con_info->req_parms.hosts_allow);
  free (con_info->req_parms.login);
  free (con_info->req_parms.note_id);
  free (con_info->req_parms.override_id);
  free (con_info->req_parms.override_task_id);
  free (con_info->req_parms.override_result_id);
  free (con_info->req_parms.period);
  free (con_info->req_parms.period_unit);
  free (con_info->req_parms.pw);
  free (con_info->req_parms.passphrase);
  free (con_info->req_parms.password);
  free (con_info->req_parms.port);
  free (con_info->req_parms.port_range);
  free (con_info->req_parms.public_key);
  free (con_info->req_parms.private_key);
  free (con_info->req_parms.oid);
  free (con_info->req_parms.sort_field);
  free (con_info->req_parms.sort_order);
  free (con_info->req_parms.timeout);
  free (con_info->req_parms.threat);
  free (con_info->req_parms.new_threat);
  free (con_info->req_parms.text);
  free (con_info->req_parms.task_id);
  free (con_info->req_parms.refresh_interval);
  free (con_info->req_parms.report_escalator_id);
  free (con_info->req_parms.result_id);
  free (con_info->req_parms.report_format_id);
  free (con_info->req_parms.report_id);
  free (con_info->req_parms.first_result);
  free (con_info->req_parms.max_results);
  free (con_info->req_parms.search_phrase);
  free (con_info->req_parms.min_cvss_base);
  free (con_info->req_parms.apply_min_cvss_base);
  free (con_info->req_parms.installer);
  free (con_info->req_parms.installer_filename);
  free (con_info->req_parms.installer_sig);
  free (con_info->req_parms.howto_install);
  free (con_info->req_parms.howto_use);
  free (con_info->req_parms.year);

  free_gchar_array (&con_info->req_parms.condition_data);
  free_gchar_array (&con_info->req_parms.event_data);

  if (con_info->req_parms.files)
    {
      preference_t *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.files,
                                    preference_t*,
                                    index++)))
        {
          g_free (item->name);
          g_free (item->nvt);
          g_free (item->value);
          g_free (item);
        }

      g_array_free (con_info->req_parms.files, TRUE);
    }

  if (con_info->req_parms.method_data)
    {
      method_data_param_t *item;
      int index = 0;

      while ((item = g_array_index (con_info->req_parms.method_data,
                                    method_data_param_t*,
                                    index++)))
        {
          g_free (item->key);
          g_free (item->value);
          g_free (item);
        }

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
  free_gchar_array (&con_info->req_parms.nvts);
  free_gchar_array (&con_info->req_parms.selects);
  free_gchar_array (&con_info->req_parms.trends);

  free (con_info);
  *con_cls = NULL;
}

/**
 * @brief Append a chunk to a string parameter.
 *
 * @param[in]   con_info      Connection info.
 * @param[in]   chunk_data    Incoming chunk data.
 * @param[out]  chunk_size    Size of chunk.
 * @param[out]  chunk_offset  Offset into all data.
 * @param[out]  param         Parameter.
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
static int
append_chunk_string (struct gsad_connection_info *con_info,
                     const char *chunk_data,
                     int chunk_size,
                     int chunk_offset,
                     char **param)
{
  if (chunk_size)
    {
      if (*param == NULL)
        {
          assert (chunk_offset == 0);
          *param = malloc (chunk_size + 1);
          if (*param == NULL)
            return MHD_NO;
        }
      else
        {
          char *new_param;
          if (*param == NULL)
            return MHD_NO;
          new_param = realloc (*param, strlen (*param) + chunk_size + 1);
          if (new_param == NULL)
            return MHD_NO;
          *param = new_param;
        }
      memcpy (*param + chunk_offset,
              chunk_data,
              chunk_size);
      (*param)[chunk_offset + chunk_size] = '\0';
    }
  else if (*param == NULL)
    {
      *param = malloc (100);
      **param = '\0';
    }
  con_info->answercode = MHD_HTTP_OK;
  return MHD_YES;
}

/**
 * @brief Append a chunk to a binary parameter.
 *
 * @param[in]   chunk_data    Incoming chunk data.
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
 * @brief Serves part of a POST request.
 *
 * Implements an MHD_PostDataIterator.
 *
 * Called one or more times to collect the multiple parts (key/value pairs)
 * of a POST request.  Fills the req_params of a gsad_connection_info.
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
  gboolean abort_on_insane = FALSE;

  con_info->answercode = MHD_HTTP_INTERNAL_SERVER_ERROR;
  con_info->response   = SERVER_ERROR;

  if (NULL != key)
    {
      if (!strcmp (key, "token"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.token);

      if (!strcmp (key, "caller"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.caller);

      if (!strcmp (key, "access_hosts"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.access_hosts);
      if (!strcmp (key, "agent_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.agent_id);
      if (!strcmp (key, "apply_min"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.apply_min);
      if (!strcmp (key, "authdn"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.authdn);
      if (!strcmp (key, "base"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.base);
      if (!strcmp (key, "cmd"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.cmd);
      if (!strcmp (key, "condition"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.condition);
      if (!strcmp (key, "config_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.config_id);
      if (!strcmp (key, "credential_login"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.credential_login);
      if (!strcmp (key, "day_of_month"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.day_of_month);
      if (!strcmp (key, "duration"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.duration);
      if (!strcmp (key, "duration_unit"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.duration_unit);
      if (!strcmp (key, "domain"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.domain);
      if (!strcmp (key, "enable"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.enable);
      if (!strcmp (key, "escalator_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.escalator_id);
      if (!strcmp (key, "esc_first_result"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_first_result);
      if (!strcmp (key, "esc_levels"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_levels);
      if (!strcmp (key, "esc_max_results"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_max_results);
      if (!strcmp (key, "esc_min_cvss_base"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_min_cvss_base);
      if (!strcmp (key, "esc_notes"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_notes);
      if (!strcmp (key, "esc_overrides"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_overrides);
      if (!strcmp (key, "esc_result_hosts_only"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_result_hosts_only);
      if (!strcmp (key, "esc_search_phrase"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.esc_search_phrase);
      if (!strcmp (key, "event"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.event);
      if (!strcmp (key, "group"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.group);
      if (!strcmp (key, "hour"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.hour);
      if (!strcmp (key, "lsc_credential_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.lsc_credential_id);
      if (!strcmp (key, "lsc_smb_credential_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.lsc_smb_credential_id);
      if (!strcmp (key, "max_checks"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.max_checks);
      if (!strcmp (key, "max_hosts"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.max_hosts);
      if (!strcmp (key, "minute"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.minute);
      if (!strcmp (key, "month"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.month);
      if (!strcmp (key, "modify_password"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.modify_password);
      if (!strcmp (key, "method"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.method);
      if (!strcmp (key, "name"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.name);
      if (!strcmp (key, "ldaphost"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.ldaphost);
      if (!strcmp (key, "login"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.login);
      if (!strcmp (key, "next"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.next);
      if (!strcmp (key, "note_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.note_id);
      if (!strcmp (key, "note_task_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.note_task_id);
      if (!strcmp (key, "note_result_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.note_result_id);
      if (!strcmp (key, "override_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.override_id);
      if (!strcmp (key, "override_task_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.override_task_id);
      if (!strcmp (key, "override_result_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.override_result_id);
      if (!strcmp (key, "period"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.period);
      if (!strcmp (key, "period_unit"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.period_unit);
      if (!strcmp (key, "pw"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.pw);
      if (!strcmp (key, "family"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.family);
      if (!strcmp (key, "host"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.host);
      if (!strcmp (key, "hosts"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.hosts);
      if (!strcmp (key, "hosts_allow"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.hosts_allow);
      if (!strcmp (key, "comment"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.comment);
      if (!strcmp (key, "xml_file"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.xml_file);
      if (!strcmp (key, "oid"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.oid);
      if (!strcmp (key, "passphrase"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.passphrase);
      if (!strcmp (key, "password"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.password);
      if (!strcmp (key, "role"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.role);
      if (!strcmp (key, "target_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.target_id);
      if (!strcmp (key, "target_locator"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.target_locator);
      if (!strcmp (key, "submit"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.submit);
      if (!strcmp (key, "timeout"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.timeout);
      if (!strcmp (key, "port"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.port);
      if (!strcmp (key, "port_range"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.port_range);
      if (!strcmp (key, "private_key"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.private_key);
      if (!strcmp (key, "public_key"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.public_key);
      if (!strcmp (key, "threat"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.threat);
      if (!strcmp (key, "new_threat"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.new_threat);
      if (!strcmp (key, "text"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.text);
      if (!strcmp (key, "task_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.task_id);
      if (!strcmp (key, "refresh_interval"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.refresh_interval);
      if (!strcmp (key, "result_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.result_id);
      if (!strcmp (key, "report_escalator_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.report_escalator_id);
      if (!strcmp (key, "report_format_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.report_format_id);
      if (!strcmp (key, "report_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.report_id);
      if (!strcmp (key, "first_result"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.first_result);
      if (!strcmp (key, "max_results"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.max_results);
      if (!strcmp (key, "schedule_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.schedule_id);
      if (!strcmp (key, "slave_id"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.slave_id);
      if (!strcmp (key, "sort_field"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.sort_field);
      if (!strcmp (key, "sort_order"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.sort_order);
      if (!strcmp (key, "levels"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.levels);
      if (!strcmp (key, "notes"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.notes);
      if (!strcmp (key, "overrides"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.overrides);
      if (!strcmp (key, "result_hosts_only"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.result_hosts_only);
      if (!strcmp (key, "search_phrase"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.search_phrase);
      if (!strcmp (key, "min_cvss_base"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.min_cvss_base);
      if (!strcmp (key, "apply_min_cvss_base"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.apply_min_cvss_base);
      if (!strcmp (key, "year"))
        return append_chunk_string (con_info, data, size, off,
                                    &con_info->req_parms.year);

      if (!strcmp (key, "installer"))
        {
          if (con_info->req_parms.installer_filename == NULL)
            con_info->req_parms.installer_filename = g_strdup (filename);
          if (append_chunk_binary (data,
                                   size,
                                   off,
                                   &con_info->req_parms.installer,
                                   &con_info->req_parms.installer_size))
            return MHD_NO;
          con_info->answercode = MHD_HTTP_OK;
          return MHD_YES;
        }
      if (!strcmp (key, "installer_sig"))
        {
          if (append_chunk_binary (data,
                                   size,
                                   off,
                                   &con_info->req_parms.installer_sig,
                                   &con_info->req_parms.installer_sig_size))
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
      if (!strncmp (key, "file:", strlen ("file:")))
        {
          int uuid_start = -1, uuid_end = -1, count;
          count = sscanf (key,
                          "file:%*[^[][%n%*[^]]%n]:%*s",
                          &uuid_start,
                          &uuid_end);
          if (count == 0 && uuid_start > 0 && uuid_end > 0)
            {
              preference_t preference;
              gboolean pref_already_in_array = FALSE;

              /* Just put the type in the nvt field for now, so that there
               * is something to free. */
              preference.nvt = g_strndup (key + uuid_start, uuid_end - uuid_start);
              if (abort_on_insane
                  && openvas_validate (validator, "uuid", preference.nvt))
                {
                  g_free (preference.nvt);
                  return MHD_NO;
                }

              preference.name = g_strdup (key + strlen ("file:"));
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

              if (con_info->req_parms.files != NULL)
                {
                  preference_t *item;
                  int index = 0;

                  while ((item = g_array_index (con_info->req_parms.files,
                                                preference_t*,
                                                index++)))
                    {
                      if (g_ascii_strcasecmp (item->name, preference.name) == 0)
                        {
                          g_free (preference.nvt);
                          g_free (preference.name);

                          if (append_chunk_binary (data, size, off,
                                                   (char**) &item->value,
                                                   &item->value_size))
                            return MHD_NO;

                          pref_already_in_array = TRUE;
                          break;
                        }
                    }
                }

              if (pref_already_in_array == FALSE)
                {
                  gconstpointer p;

                  preference.value = g_memdup (data, size);
                  preference.value_size = size;

                  if (con_info->req_parms.files == NULL)
                    con_info->req_parms.files
                      = g_array_new (TRUE,
                                     FALSE,
                                     sizeof (preference_t*));

                  p = g_memdup (&preference, sizeof (preference));
                  g_array_append_vals (con_info->req_parms.files,
                                       &p,
                                       1);
                }

              con_info->answercode = MHD_HTTP_OK;
              return MHD_YES;
            }
          return MHD_NO;
        }
      if (!strncmp (key, "method_data:", strlen ("method_data:")))
        {
          method_data_param_t *method_data_param;

          if (con_info->req_parms.method_data)
            {
              guint index;
              /* Search for a previous chunk. */
              index = con_info->req_parms.method_data->len;
              while (index--)
                {
                  method_data_param_t *param;
                  param = g_array_index (con_info->req_parms.method_data,
                                         method_data_param_t*,
                                         index);
                  if (strcmp (param->key, key + strlen ("method_data:")) == 0)
                    {
                      gchar *value;
                      /* Append to previous chunk. */
                      value = g_malloc (param->value_size + size + 1);
                      memcpy (value, param->value, param->value_size);
                      memcpy (value + param->value_size, data, size);
                      param->value_size += size;
                      value[param->value_size] = '\0';
                      g_free (param->value);
                      param->value = value;
                      con_info->answercode = MHD_HTTP_OK;
                      return MHD_YES;
                    }
                }
            }

          method_data_param = g_malloc (sizeof (method_data_param));
          method_data_param->key = g_strdup (key + strlen ("method_data:"));
          method_data_param->value_size = size;
          method_data_param->value = g_malloc (size + 1);
          memcpy (method_data_param->value, data, size);
          method_data_param->value[size] = '\0';

          if (con_info->req_parms.method_data == NULL)
            con_info->req_parms.method_data
             = g_array_new (TRUE,
                            FALSE,
                            sizeof (gchar*));

          g_array_append_val (con_info->req_parms.method_data, method_data_param);

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
              gboolean pref_already_in_array = FALSE;

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

              if (con_info->req_parms.preferences != NULL)
                {
                  preference_t *item;
                  int index = 0;

                  while ((item = g_array_index (con_info->req_parms.preferences,
                                                preference_t*,
                                                index++)))
                    {
                      if (g_ascii_strcasecmp (item->name, preference.name) == 0)
                        {
                          g_free (preference.nvt);
                          g_free (preference.name);

                          if (append_chunk_binary (data, size, off,
                                                   (char**) &item->value,
                                                   &item->value_size))
                            return MHD_NO;

                          pref_already_in_array = TRUE;
                          break;
                        }
                    }
                }

              if (pref_already_in_array == FALSE)
                {
                  gconstpointer p;

                  preference.value = g_memdup (data, size);
                  preference.value_size = size;

                  if (con_info->req_parms.preferences == NULL)
                    con_info->req_parms.preferences
                      = g_array_new (TRUE,
                                     FALSE,
                                     sizeof (preference_t*));

                  p = g_memdup (&preference, sizeof (preference));
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
              gboolean pref_already_in_array = FALSE;

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

              if (con_info->req_parms.passwords != NULL)
                {
                  preference_t *item;
                  int index = 0;

                  while ((item = g_array_index (con_info->req_parms.passwords,
                                                preference_t*,
                                                index++)))
                    {
                      if (g_ascii_strcasecmp (item->name, preference.name) == 0)
                        {
                          g_free (preference.nvt);
                          g_free (preference.name);

                          if (append_chunk_binary (data, size, off,
                                                   (char**) &item->value,
                                                   &item->value_size))
                            return MHD_NO;

                          pref_already_in_array = TRUE;
                          break;
                        }
                    }
                }

              if (pref_already_in_array == FALSE)
                {
                  gconstpointer p;

                  preference.value = g_memdup (data, size);
                  preference.value_size = size;

                  if (con_info->req_parms.passwords == NULL)
                    con_info->req_parms.passwords
                      = g_array_new (TRUE,
                                     FALSE,
                                     sizeof (preference_t*));

                  p = g_memdup (&preference, sizeof (preference));
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

  /* Handle the login command specially. */

  if (con_info->req_parms.cmd && !strcmp (con_info->req_parms.cmd, "login"))
    {
      if (con_info->req_parms.login && con_info->req_parms.password)
        {
          int ret;
          ret = authenticate_omp (con_info->req_parms.login,
                                  con_info->req_parms.password);
          if (ret)
            {
              time_t now;
              gchar *xml;
              char *res;
              char ctime_now[27];

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              xml = g_strdup_printf ("<login_page>"
                                     "<message>"
                                     "Login failed.%s"
                                     "</message>"
                                     "<token></token>"
                                     "<time>%s</time>"
                                     "</login_page>",
                                     ret == 2 ? "  OMP service is down." : "",
                                     ctime_now);
              res = xsl_transform (xml);
              g_free (xml);
              con_info->response = res;
            }
          else
            {
              user_t *user;
              user = user_add (con_info->req_parms.login,
                               con_info->req_parms.password);
              /* Redirect to get_tasks. */
              *user_return = user;
              return 1;
            }
        }
      else
        {
          con_info->response = gsad_message (credentials,
                                             "Internal error",
                                             __FUNCTION__,
                                             __LINE__,
                                             "An internal error occured inside GSA daemon. "
                                             "Diagnostics: Login or password missing.",
                                             "/omp?cmd=get_tasks");
        }
      con_info->answercode = MHD_HTTP_OK;
      return 3;
    }

  /* Check the session. */

  if (openvas_validate (validator, "token", con_info->req_parms.token))
    con_info->req_parms.token = NULL;

  if (con_info->req_parms.token == NULL)
    {
      con_info->response
       = gsad_message (credentials,
                       "Internal error", __FUNCTION__, __LINE__,
                       "An internal error occured inside GSA daemon. "
                       "Diagnostics: Token missing or bad.",
                       "/omp?cmd=get_tasks");
      con_info->answercode = MHD_HTTP_OK;
      return 3;
    }

  ret = user_find (con_info->req_parms.cookie, con_info->req_parms.token,
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
      char ctime_now[27];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

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
                                     con_info->req_parms.caller
                                      ? con_info->req_parms.caller
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
      char ctime_now[27];

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
  credentials->token = strdup (user->token);
  /* The caller of a POST is usually the caller of the page that the POST form
   * was on. */
  /* @todo Validate caller. */
  credentials->caller = strdup (con_info->req_parms.caller
                                 ? con_info->req_parms.caller
                                 : "");

  if (new_sid) *new_sid = g_strdup (user->cookie);

  user_release (user);

  /* Handle the usual commands. */

  if (!con_info->req_parms.cmd)
    {
      con_info->response = gsad_message (credentials,
                                         "Internal error",
                                         __FUNCTION__,
                                         __LINE__,
                                         "An internal error occured inside GSA daemon. "
                                         "Diagnostics: Empty command.",
                                         "/omp?cmd=get_tasks");
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_agent"))
    {
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      con_info->response =
        create_agent_omp (credentials,
                          con_info->req_parms.name,
                          con_info->req_parms.comment,
                          con_info->req_parms.installer,
                          con_info->req_parms.installer_size,
                          con_info->req_parms.installer_filename,
                          con_info->req_parms.installer_sig,
                          con_info->req_parms.installer_sig_size,
                          con_info->req_parms.howto_install,
                          con_info->req_parms.howto_install_size,
                          con_info->req_parms.howto_use,
                          con_info->req_parms.howto_use_size);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_escalator"))
    {
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      validate (validator, "condition", &con_info->req_parms.condition);
      validate (validator, "event", &con_info->req_parms.event);
      if (validate (validator, "method", &con_info->req_parms.method))
        ;
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
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      validate (validator, "credential_login",
                &con_info->req_parms.credential_login);
      validate (validator, "lsc_password", &con_info->req_parms.password);
      validate (validator, "lsc_password", &con_info->req_parms.passphrase);
      validate (validator, "create_credentials_type",
                &con_info->req_parms.base);
      con_info->response =
        create_lsc_credential_omp (credentials,
                                   con_info->req_parms.name,
                                   con_info->req_parms.comment,
                                   con_info->req_parms.base,
                                   con_info->req_parms.credential_login,
                                   con_info->req_parms.password,
                                   con_info->req_parms.passphrase,
                                   con_info->req_parms.public_key,
                                   con_info->req_parms.private_key);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_report"))
    {
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      validate (validator, "overrides", &con_info->req_parms.overrides);
      if ((con_info->req_parms.task_id == NULL)
          && ((con_info->req_parms.name == NULL)
              || (con_info->req_parms.comment == NULL)
              || (con_info->req_parms.overrides == NULL)
              || (con_info->req_parms.xml_file == NULL)))
        con_info->response
         = new_task_omp (credentials,
                         "Invalid parameter",
                         con_info->req_parms.overrides
                          ? strcmp (con_info->req_parms.overrides, "0")
                          : 0);
      else
        {
          validate (validator, "task_id", &con_info->req_parms.task_id);
          con_info->response =
            create_report_omp (credentials, con_info->req_parms.name,
                               con_info->req_parms.comment,
                               con_info->req_parms.overrides,
                               con_info->req_parms.xml_file,
                               con_info->req_parms.task_id);
        }
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_task"))
    {
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      if (con_info->req_parms.escalator_id
          && strcmp (con_info->req_parms.escalator_id, "--")
          && openvas_validate (validator,
                               "escalator_id",
                               con_info->req_parms.escalator_id))
        {
          free (con_info->req_parms.escalator_id);
          con_info->req_parms.escalator_id  = NULL;
        }
      if (con_info->req_parms.target_id
          && strcmp (con_info->req_parms.target_id, "--")
          && openvas_validate (validator,
                               "target_id",
                               con_info->req_parms.target_id))
        {
          free (con_info->req_parms.target_id);
          con_info->req_parms.target_id  = NULL;
        }
      if (con_info->req_parms.config_id
          && strcmp (con_info->req_parms.config_id, "--")
          && openvas_validate (validator,
                               "config_id",
                               con_info->req_parms.config_id))
        {
          free (con_info->req_parms.config_id);
          con_info->req_parms.config_id  = NULL;
        }
      if (con_info->req_parms.schedule_id
          && strcmp (con_info->req_parms.schedule_id, "--")
          && openvas_validate (validator,
                               "schedule_id",
                               con_info->req_parms.schedule_id))
        {
          free (con_info->req_parms.schedule_id);
          con_info->req_parms.schedule_id  = NULL;
        }
      if (con_info->req_parms.slave_id
          && strcmp (con_info->req_parms.slave_id, "--")
          && openvas_validate (validator,
                               "slave_id",
                               con_info->req_parms.slave_id))
        {
          free (con_info->req_parms.slave_id);
          con_info->req_parms.slave_id  = NULL;
        }
      validate (validator, "overrides", &con_info->req_parms.overrides);
      validate (validator, "max_checks", &con_info->req_parms.max_checks);
      validate (validator, "max_hosts", &con_info->req_parms.max_hosts);
      if ((con_info->req_parms.name == NULL) ||
          (con_info->req_parms.comment == NULL) ||
          (con_info->req_parms.config_id == NULL) ||
          (con_info->req_parms.overrides == NULL) ||
          (con_info->req_parms.target_id == NULL) ||
          (con_info->req_parms.escalator_id == NULL) ||
          (con_info->req_parms.slave_id == NULL) ||
          (con_info->req_parms.schedule_id == NULL) ||
          (con_info->req_parms.max_checks == NULL) ||
          (con_info->req_parms.max_hosts == NULL))
        con_info->response
         = new_task_omp (credentials,
                         "Invalid parameter",
                         con_info->req_parms.overrides
                          ? strcmp (con_info->req_parms.overrides, "0")
                          : 0);
      else
        con_info->response =
          create_task_omp (credentials, con_info->req_parms.name,
                           con_info->req_parms.comment,
                           con_info->req_parms.target_id,
                           con_info->req_parms.config_id,
                           con_info->req_parms.escalator_id,
                           con_info->req_parms.schedule_id,
                           con_info->req_parms.slave_id,
                           con_info->req_parms.overrides,
                           con_info->req_parms.max_checks,
                           con_info->req_parms.max_hosts);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_user"))
    {
      validate (validator, "login", &con_info->req_parms.login);
      validate (validator, "password", &con_info->req_parms.password);
      validate (validator, "role", &con_info->req_parms.role);
      validate (validator, "access_hosts", &con_info->req_parms.access_hosts);
      validate (validator, "hosts_allow", &con_info->req_parms.hosts_allow);
      con_info->response =
        create_user_oap (credentials,
                         con_info->req_parms.login,
                         con_info->req_parms.password,
                         con_info->req_parms.role,
                         con_info->req_parms.access_hosts,
                         con_info->req_parms.hosts_allow);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_schedule"))
    {
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      validate (validator, "hour", &con_info->req_parms.hour);
      validate (validator, "minute", &con_info->req_parms.minute);
      validate (validator, "day_of_month", &con_info->req_parms.day_of_month);
      validate (validator, "month", &con_info->req_parms.month);
      validate (validator, "year", &con_info->req_parms.year);
      validate (validator, "period", &con_info->req_parms.period);
      validate (validator, "period_unit", &con_info->req_parms.period_unit);
      validate (validator, "duration", &con_info->req_parms.duration);
      validate (validator, "duration_unit", &con_info->req_parms.duration_unit);

      con_info->response =
        create_schedule_omp (credentials,
                             con_info->req_parms.name,
                             con_info->req_parms.comment,
                             con_info->req_parms.hour,
                             con_info->req_parms.minute,
                             con_info->req_parms.day_of_month,
                             con_info->req_parms.month,
                             con_info->req_parms.year,
                             con_info->req_parms.period,
                             con_info->req_parms.period_unit,
                             con_info->req_parms.duration,
                             con_info->req_parms.duration_unit);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_slave"))
    {
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      validate (validator, "host", &con_info->req_parms.host);
      validate (validator, "port", &con_info->req_parms.port);
      validate (validator, "login", &con_info->req_parms.login);
      validate (validator, "password", &con_info->req_parms.password);
      con_info->response =
        create_slave_omp (credentials,
                          con_info->req_parms.name,
                          con_info->req_parms.comment,
                          con_info->req_parms.host,
                          con_info->req_parms.port,
                          con_info->req_parms.login,
                          con_info->req_parms.password);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_target"))
    {
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "hosts", &con_info->req_parms.hosts);
      validate (validator, "comment", &con_info->req_parms.comment);
      validate (validator, "port_range", &con_info->req_parms.port_range);
      validate (validator, "lsc_credential_id",
                &con_info->req_parms.lsc_credential_id);
      validate (validator, "lsc_credential_id",
                &con_info->req_parms.lsc_smb_credential_id);
      validate (validator, "target_locator",
                &con_info->req_parms.target_locator);
      validate (validator, "lsc_password", &con_info->req_parms.password);
      validate (validator, "login", &con_info->req_parms.login);
      validate (validator, "port", &con_info->req_parms.port);
      con_info->response =
        create_target_omp (credentials, con_info->req_parms.name,
                           con_info->req_parms.hosts,
                           con_info->req_parms.comment,
                           con_info->req_parms.port_range,
                           con_info->req_parms.lsc_credential_id,
                           con_info->req_parms.port,
                           con_info->req_parms.lsc_smb_credential_id,
                           con_info->req_parms.target_locator,
                           con_info->req_parms.login,
                           con_info->req_parms.password);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_config"))
    {
      validate (validator, "base", &con_info->req_parms.base);
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      con_info->response =
        create_config_omp (credentials, con_info->req_parms.name,
                           con_info->req_parms.comment,
                           con_info->req_parms.base);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "create_note"))
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_result") == 0))
    {
      const char *first_result;
      const char *max_results;
      unsigned int first;
      unsigned int max;

      /* Check parameters for creating the note. */

      validate (validator, "oid", &con_info->req_parms.oid);

      validate (validator, "text", &con_info->req_parms.text);

      if (strcmp (con_info->req_parms.port, "")
          && openvas_validate (validator, "port", con_info->req_parms.port))
        {
          free (con_info->req_parms.port);
          con_info->req_parms.port = NULL;
        }

      if (strcmp (con_info->req_parms.threat, "")
          && openvas_validate (validator,
                               "threat",
                               con_info->req_parms.threat))
        {
          free (con_info->req_parms.threat);
          con_info->req_parms.threat = NULL;
        }

      if (strcmp (con_info->req_parms.hosts, "")
          && openvas_validate (validator,
                               "hosts",
                               con_info->req_parms.hosts))
        {
          free (con_info->req_parms.hosts);
          con_info->req_parms.hosts = NULL;
        }

      if (strcmp (con_info->req_parms.note_task_id, "")
          && openvas_validate (validator,
                               "task_id",
                               con_info->req_parms.note_task_id))
        {
          free (con_info->req_parms.note_task_id);
          con_info->req_parms.note_task_id = NULL;
        }

      validate (validator, "note_result_id",
                &con_info->req_parms.note_result_id);

      /* Check parameters for requesting the result. */

      validate (validator, "result_id", &con_info->req_parms.result_id);
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "name", &con_info->req_parms.name);

      /* Check get_report passthrough parameters. */

      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "first_result", &con_info->req_parms.first_result);
      validate (validator, "max_results", &con_info->req_parms.max_results);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate (validator, "notes", &con_info->req_parms.notes);
      validate (validator, "overrides", &con_info->req_parms.overrides);
      validate (validator, "result_hosts_only",
                &con_info->req_parms.result_hosts_only);
      validate (validator, "search_phrase",
                &con_info->req_parms.search_phrase);
      if (openvas_validate (validator,
                            "min_cvss_base",
                            con_info->req_parms.min_cvss_base))
        {
          free (con_info->req_parms.min_cvss_base);
          con_info->req_parms.min_cvss_base = NULL;
        }
      else
        {
          if (con_info->req_parms.apply_min_cvss_base == NULL
              || (strcmp (con_info->req_parms.apply_min_cvss_base, "0") == 0))
            {
              free (con_info->req_parms.min_cvss_base);
              con_info->req_parms.min_cvss_base = g_strdup ("");
            }
        }

      /* Call the page handler. */

      first_result = con_info->req_parms.first_result;
      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      max_results = con_info->req_parms.max_results;
      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      con_info->response =
        create_note_omp (credentials,
                         con_info->req_parms.oid,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         "get_result",
                         con_info->req_parms.report_id,
                         first,
                         max,
                         con_info->req_parms.sort_field,
                         con_info->req_parms.sort_order,
                         con_info->req_parms.levels,
                         con_info->req_parms.notes,
                         con_info->req_parms.overrides,
                         con_info->req_parms.result_hosts_only,
                         con_info->req_parms.search_phrase,
                         con_info->req_parms.min_cvss_base,
                         con_info->req_parms.name,
                         con_info->req_parms.task_id,
                         con_info->req_parms.result_id);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "create_note"))
           && (con_info->req_parms.next == NULL))
    {
      const char *first_result;
      const char *max_results;
      unsigned int first;
      unsigned int max;

      /* Check parameters for creating the note. */

      validate (validator, "oid", &con_info->req_parms.oid);

      validate (validator, "text", &con_info->req_parms.text);

      if (strcmp (con_info->req_parms.port, "")
          && openvas_validate (validator, "port", con_info->req_parms.port))
        {
          free (con_info->req_parms.port);
          con_info->req_parms.port = NULL;
        }

      if (strcmp (con_info->req_parms.threat, "")
          && openvas_validate (validator,
                               "threat",
                               con_info->req_parms.threat))
        {
          free (con_info->req_parms.threat);
          con_info->req_parms.threat = NULL;
        }

      if (strcmp (con_info->req_parms.hosts, "")
          && openvas_validate (validator,
                               "hosts",
                               con_info->req_parms.hosts))
        {
          free (con_info->req_parms.hosts);
          con_info->req_parms.hosts = NULL;
        }

      if (strcmp (con_info->req_parms.note_task_id, "")
          && openvas_validate (validator,
                               "task_id",
                               con_info->req_parms.note_task_id))
        {
          free (con_info->req_parms.note_task_id);
          con_info->req_parms.note_task_id = NULL;
        }

      validate (validator, "note_result_id",
                &con_info->req_parms.note_result_id);

      /* Check parameters for requesting the report. */

      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "first_result", &con_info->req_parms.first_result);
      validate (validator, "max_results", &con_info->req_parms.max_results);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate (validator, "notes", &con_info->req_parms.notes);
      validate (validator, "overrides", &con_info->req_parms.overrides);
      validate (validator, "result_hosts_only",
                &con_info->req_parms.result_hosts_only);
      validate (validator, "search_phrase",
                &con_info->req_parms.search_phrase);
      if (openvas_validate (validator,
                            "min_cvss_base",
                            con_info->req_parms.min_cvss_base))
        {
          free (con_info->req_parms.min_cvss_base);
          con_info->req_parms.min_cvss_base = NULL;
        }
      else
        {
          if (con_info->req_parms.apply_min_cvss_base == NULL
              || (strcmp (con_info->req_parms.apply_min_cvss_base, "0") == 0))
            {
              free (con_info->req_parms.min_cvss_base);
              con_info->req_parms.min_cvss_base = g_strdup ("");
            }
        }

      /* Call the page handler. */

      first_result = con_info->req_parms.first_result;
      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      max_results = con_info->req_parms.max_results;
      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      con_info->response =
        create_note_omp (credentials,
                         con_info->req_parms.oid,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         NULL,
                         con_info->req_parms.report_id,
                         first,
                         max,
                         con_info->req_parms.sort_field,
                         con_info->req_parms.sort_order,
                         con_info->req_parms.levels,
                         con_info->req_parms.notes,
                         con_info->req_parms.overrides,
                         con_info->req_parms.result_hosts_only,
                         con_info->req_parms.search_phrase,
                         con_info->req_parms.min_cvss_base,
                         NULL, NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "create_override"))
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_result") == 0))
    {
      const char *first_result;
      const char *max_results;
      unsigned int first;
      unsigned int max;

      /* Check parameters for creating the override. */

      validate (validator, "oid", &con_info->req_parms.oid);

      validate (validator, "text", &con_info->req_parms.text);

      if (strcmp (con_info->req_parms.port, "")
          && openvas_validate (validator, "port", con_info->req_parms.port))
        {
          free (con_info->req_parms.port);
          con_info->req_parms.port = NULL;
        }

      if (strcmp (con_info->req_parms.threat, "")
          && openvas_validate (validator,
                               "threat",
                               con_info->req_parms.threat))
        {
          free (con_info->req_parms.threat);
          con_info->req_parms.threat = NULL;
        }

      if (strcmp (con_info->req_parms.hosts, "")
          && openvas_validate (validator,
                               "hosts",
                               con_info->req_parms.hosts))
        {
          free (con_info->req_parms.hosts);
          con_info->req_parms.hosts = NULL;
        }

      if (strcmp (con_info->req_parms.override_task_id, "")
          && openvas_validate (validator,
                               "task_id",
                               con_info->req_parms.override_task_id))
        {
          free (con_info->req_parms.override_task_id);
          con_info->req_parms.override_task_id = NULL;
        }

      validate (validator, "note_result_id",
                &con_info->req_parms.note_result_id);

      /* Check parameters for requesting the result. */

      validate (validator, "result_id", &con_info->req_parms.result_id);
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "overrides", &con_info->req_parms.overrides);

      /* Check get_report passthrough parameters. */

      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "first_result", &con_info->req_parms.first_result);
      validate (validator, "max_results", &con_info->req_parms.max_results);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate (validator, "notes", &con_info->req_parms.notes);
      validate (validator, "overrides", &con_info->req_parms.overrides);
      validate (validator, "result_hosts_only",
                &con_info->req_parms.result_hosts_only);
      validate (validator, "search_phrase",
                &con_info->req_parms.search_phrase);
      if (openvas_validate (validator,
                            "min_cvss_base",
                            con_info->req_parms.min_cvss_base))
        {
          free (con_info->req_parms.min_cvss_base);
          con_info->req_parms.min_cvss_base = NULL;
        }
      else
        {
          if (con_info->req_parms.apply_min_cvss_base == NULL
              || (strcmp (con_info->req_parms.apply_min_cvss_base, "0") == 0))
            {
              free (con_info->req_parms.min_cvss_base);
              con_info->req_parms.min_cvss_base = g_strdup ("");
            }
        }

      /* Call the page handler. */

      first_result = con_info->req_parms.first_result;
      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      max_results = con_info->req_parms.max_results;
      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      con_info->response =
        create_override_omp (credentials,
                             con_info->req_parms.oid,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.note_result_id,
                             "get_result",
                             con_info->req_parms.report_id,
                             first,
                             max,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.levels,
                             con_info->req_parms.notes,
                             con_info->req_parms.overrides,
                             con_info->req_parms.result_hosts_only,
                             con_info->req_parms.search_phrase,
                             con_info->req_parms.min_cvss_base,
                             con_info->req_parms.name,
                             con_info->req_parms.task_id,
                             con_info->req_parms.result_id);
    }
  else if (!strcmp (con_info->req_parms.cmd, "create_override")
           && (con_info->req_parms.next == NULL))
    {
      const char *first_result;
      const char *max_results;
      unsigned int first;
      unsigned int max;

      /* Check parameters for creating the override. */

      validate (validator, "oid", &con_info->req_parms.oid);

      validate (validator, "text", &con_info->req_parms.text);

      if (strcmp (con_info->req_parms.port, "")
          && openvas_validate (validator, "port", con_info->req_parms.port))
        {
          free (con_info->req_parms.port);
          con_info->req_parms.port = NULL;
        }

      if (strcmp (con_info->req_parms.threat, "")
          && openvas_validate (validator,
                               "threat",
                               con_info->req_parms.threat))
        {
          free (con_info->req_parms.threat);
          con_info->req_parms.threat = NULL;
        }

      if (strcmp (con_info->req_parms.new_threat, "")
          && openvas_validate (validator,
                               "threat",
                               con_info->req_parms.new_threat))
        {
          free (con_info->req_parms.new_threat);
          con_info->req_parms.new_threat = NULL;
        }

      if (strcmp (con_info->req_parms.hosts, "")
          && openvas_validate (validator,
                               "hosts",
                               con_info->req_parms.hosts))
        {
          free (con_info->req_parms.hosts);
          con_info->req_parms.hosts = NULL;
        }

      if (strcmp (con_info->req_parms.override_task_id, "")
          && openvas_validate (validator,
                               "task_id",
                               con_info->req_parms.override_task_id))
        {
          free (con_info->req_parms.override_task_id);
          con_info->req_parms.override_task_id = NULL;
        }

      validate (validator, "note_result_id",
                &con_info->req_parms.note_result_id);

      /* Check parameters for requesting the report. */

      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "first_result", &con_info->req_parms.first_result);
      validate (validator, "max_results", &con_info->req_parms.max_results);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate (validator, "notes", &con_info->req_parms.notes);
      validate (validator, "overrides", &con_info->req_parms.overrides);
      validate (validator, "result_hosts_only",
                &con_info->req_parms.result_hosts_only);
      validate (validator, "search_phrase",
                &con_info->req_parms.search_phrase);
      if (openvas_validate (validator,
                            "min_cvss_base",
                            con_info->req_parms.min_cvss_base))
        {
          free (con_info->req_parms.min_cvss_base);
          con_info->req_parms.min_cvss_base = NULL;
        }
      else
        {
          if (con_info->req_parms.apply_min_cvss_base == NULL
              || (strcmp (con_info->req_parms.apply_min_cvss_base, "0") == 0))
            {
              free (con_info->req_parms.min_cvss_base);
              con_info->req_parms.min_cvss_base = g_strdup ("");
            }
        }

      /* Call the page handler. */

      first_result = con_info->req_parms.first_result;
      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      max_results = con_info->req_parms.max_results;
      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      con_info->response =
        create_override_omp (credentials,
                             con_info->req_parms.oid,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.note_result_id,
                             NULL,
                             con_info->req_parms.report_id,
                             first,
                             max,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.levels,
                             con_info->req_parms.notes,
                             con_info->req_parms.overrides,
                             con_info->req_parms.result_hosts_only,
                             con_info->req_parms.search_phrase,
                             con_info->req_parms.min_cvss_base,
                             NULL, NULL, NULL);
    }
  else if (!strcmp (con_info->req_parms.cmd, "delete_agent"))
    {
      validate (validator, "agent_id", &con_info->req_parms.agent_id);
      con_info->response =
        delete_agent_omp (credentials, con_info->req_parms.agent_id);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "delete_task"))
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL))
    {
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "overrides", &con_info->req_parms.overrides);
      validate (validator, "page", &con_info->req_parms.next);

      con_info->response =
        delete_task_omp (credentials,
                         con_info->req_parms.task_id,
                         con_info->req_parms.overrides
                          ? strcmp (con_info->req_parms.overrides, "0") : 0,
                         con_info->req_parms.next);
    }
  else if (!strcmp (con_info->req_parms.cmd, "delete_escalator"))
    {
      validate (validator, "escalator_id", &con_info->req_parms.escalator_id);

      con_info->response =
        delete_escalator_omp (credentials, con_info->req_parms.escalator_id);
    }
  else if (!strcmp (con_info->req_parms.cmd, "delete_lsc_credential"))
    {
      validate (validator, "lsc_credential_id",
                &con_info->req_parms.lsc_credential_id);
      con_info->response =
        delete_lsc_credential_omp (credentials,
                                   con_info->req_parms.lsc_credential_id);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "delete_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_notes") == 0))
    {
      validate (validator, "note_id", &con_info->req_parms.note_id);
      con_info->response =
        delete_note_omp (credentials, con_info->req_parms.note_id,
                         "get_notes", NULL, 0, 0, NULL, NULL, NULL, NULL, NULL,
                         NULL, NULL, NULL, NULL, NULL, NULL, NULL);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_nvts") == 0)
           && (con_info->req_parms.oid != NULL))
    {
      validate (validator, "note_id", &con_info->req_parms.note_id);
      con_info->response =
        delete_note_omp (credentials, con_info->req_parms.note_id, "get_nvts",
                         NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
                         NULL, con_info->req_parms.oid, NULL, NULL, NULL);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_report") == 0)
           && (con_info->req_parms.report_id != NULL))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || (sscanf (con_info->req_parms.first_result, "%u", &first) != 1))
        first = 1;

      if (!con_info->req_parms.max_results
          || (sscanf (con_info->req_parms.max_results, "%u", &max) != 1))
        max = RESULTS_PER_PAGE;

      validate (validator, "note_id", &con_info->req_parms.note_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate_or (validator, "notes", &con_info->req_parms.notes, "0");
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      validate_or (validator,
                   "result_hosts_only",
                   &con_info->req_parms.result_hosts_only,
                   "0");
      validate_or (validator,
                   "search_phrase",
                   &con_info->req_parms.search_phrase,
                   "");

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      con_info->response =
        delete_note_omp (credentials, con_info->req_parms.note_id, "get_report",
                         con_info->req_parms.report_id, first, max,
                         con_info->req_parms.sort_field,
                         con_info->req_parms.sort_order,
                         con_info->req_parms.levels,
                         con_info->req_parms.notes,
                         con_info->req_parms.overrides,
                         con_info->req_parms.result_hosts_only,
                         con_info->req_parms.search_phrase, min_cvss_base,
                         NULL, NULL, NULL, NULL);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_result") == 0)
           && (con_info->req_parms.result_id != NULL))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || (sscanf (con_info->req_parms.first_result, "%u", &first) != 1))
        first = 1;

      if (!con_info->req_parms.max_results
          || (sscanf (con_info->req_parms.max_results, "%u", &max) != 1))
        max = RESULTS_PER_PAGE;

      validate (validator, "note_id", &con_info->req_parms.note_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate (validator, "result_id", &con_info->req_parms.result_id);
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "name", &con_info->req_parms.name);

      validate (validator, "result_id", &con_info->req_parms.result_id);
      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate_or (validator, "notes", &con_info->req_parms.notes, "0");
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      validate_or (validator,
                   "result_hosts_only",
                   &con_info->req_parms.result_hosts_only,
                   "0");
      validate_or (validator,
                   "search_phrase",
                   &con_info->req_parms.search_phrase,
                   "");

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      con_info->response =
        delete_note_omp (credentials, con_info->req_parms.note_id, "get_result",
                         con_info->req_parms.report_id, first, max,
                         con_info->req_parms.sort_field,
                         con_info->req_parms.sort_order,
                         con_info->req_parms.levels,
                         con_info->req_parms.notes,
                         con_info->req_parms.overrides,
                         con_info->req_parms.result_hosts_only,
                         con_info->req_parms.search_phrase,
                         min_cvss_base,
                         NULL,
                         con_info->req_parms.task_id,
                         con_info->req_parms.name,
                         con_info->req_parms.result_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_tasks") == 0)
           && (con_info->req_parms.task_id != NULL))
    {
      validate (validator, "note_id", &con_info->req_parms.note_id);
      validate (validator, "task_id", &con_info->req_parms.task_id);
      if (validate_or (validator, "overrides", &con_info->req_parms.overrides,
                       "0"))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while deleting a note. "
                        "The note remains intact. "
                        "Diagnostics: Required parameter was NULL.",
                        "/omp?cmd=get_notes");
      else
        con_info->response =
          delete_note_omp (credentials, con_info->req_parms.note_id,
                           "get_tasks", NULL, 0, 0, NULL, NULL, NULL, NULL,
                           con_info->req_parms.overrides, NULL, NULL, NULL,
                           NULL, con_info->req_parms.task_id, NULL, NULL);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_overrides") == 0))
    {
      validate (validator, "override_id", &con_info->req_parms.override_id);
      con_info->response =
        delete_override_omp (credentials, con_info->req_parms.override_id,
                             "get_overrides", NULL, 0, 0, NULL, NULL, NULL,
                             NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
                             NULL);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_nvts") == 0)
           && (con_info->req_parms.oid != NULL))
    {
      validate (validator, "override_id", &con_info->req_parms.override_id);
      validate (validator, "oid", &con_info->req_parms.oid);
      con_info->response =
        delete_override_omp (credentials, con_info->req_parms.override_id,
                             "get_nvts", NULL, 0, 0, NULL, NULL, NULL, NULL,
                             NULL, NULL, NULL, NULL, con_info->req_parms.oid,
                             NULL, NULL, NULL);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_report") == 0)
           && (con_info->req_parms.report_id != NULL))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || (sscanf (con_info->req_parms.first_result, "%u", &first) != 1))
        first = 1;

      if (!con_info->req_parms.max_results
          || (sscanf (con_info->req_parms.max_results, "%u", &max) != 1))
        max = RESULTS_PER_PAGE;

      validate (validator, "override_id", &con_info->req_parms.note_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate_or (validator, "notes", &con_info->req_parms.notes, "0");
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      validate_or (validator,
                   "result_hosts_only",
                   &con_info->req_parms.result_hosts_only,
                   "0");
      validate_or (validator,
                   "search_phrase",
                   &con_info->req_parms.search_phrase,
                   "");

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      con_info->response =
        delete_override_omp (credentials, con_info->req_parms.override_id,
                             "get_report",
                             con_info->req_parms.report_id,
                             first, max,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.levels,
                             con_info->req_parms.notes,
                             con_info->req_parms.overrides,
                             con_info->req_parms.result_hosts_only,
                             con_info->req_parms.search_phrase, min_cvss_base,
                             NULL, NULL, NULL, NULL);
    }

   else if ((!strcmp (con_info->req_parms.cmd, "delete_override"))
            && (con_info->req_parms.override_id != NULL)
            && (con_info->req_parms.next != NULL)
            && (strcmp (con_info->req_parms.next, "get_result") == 0)
            && (con_info->req_parms.result_id != NULL))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || (sscanf (con_info->req_parms.first_result, "%u", &first) != 1))
        first = 1;

      if (!con_info->req_parms.max_results
          || (sscanf (con_info->req_parms.max_results, "%u", &max) != 1))
        max = RESULTS_PER_PAGE;

      validate (validator, "override_id", &con_info->req_parms.override_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate (validator, "result_id", &con_info->req_parms.result_id);
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "name", &con_info->req_parms.name);

      validate (validator, "result_id", &con_info->req_parms.result_id);
      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate_or (validator, "notes", &con_info->req_parms.notes, "0");
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      validate_or (validator,
                   "result_hosts_only",
                   &con_info->req_parms.result_hosts_only,
                   "0");
      validate_or (validator,
                   "search_phrase",
                   &con_info->req_parms.search_phrase,
                   "");

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      con_info->response =
        delete_override_omp (credentials, con_info->req_parms.override_id,
                             "get_result", con_info->req_parms.report_id,
                             first, max,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.levels,
                             con_info->req_parms.notes,
                             con_info->req_parms.overrides,
                             con_info->req_parms.result_hosts_only,
                             con_info->req_parms.search_phrase, min_cvss_base,
                             NULL, con_info->req_parms.task_id,
                             con_info->req_parms.name,
                             con_info->req_parms.result_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_tasks") == 0)
           && (con_info->req_parms.task_id != NULL))
    {
      validate (validator, "override_id", &con_info->req_parms.override_id);
      con_info->response =
        delete_override_omp (credentials, con_info->req_parms.override_id,
                             "get_tasks", NULL, 0, 0, NULL, NULL, NULL, NULL,
                             NULL, NULL, NULL, NULL, NULL,
                             con_info->req_parms.task_id, NULL, NULL);
    }

  else if (!strcmp (con_info->req_parms.cmd, "delete_report"))
    {
      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      con_info->response =
        delete_report_omp (credentials, con_info->req_parms.report_id,
                           con_info->req_parms.task_id,
                           con_info->req_parms.overrides
                            ? strcmp (con_info->req_parms.overrides, "0")
                            : 0);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_report_format"))
           && (con_info->req_parms.report_format_id != NULL))
    {
      validate (validator, "report_format_id",
                &con_info->req_parms.report_format_id);
      con_info->response =
        delete_report_format_omp (credentials,
                                  con_info->req_parms.report_format_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_schedule"))
           && (con_info->req_parms.schedule_id != NULL))
    {
      validate (validator, "schedule_id", &con_info->req_parms.schedule_id);
      con_info->response =
        delete_schedule_omp (credentials, con_info->req_parms.schedule_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_slave"))
           && (con_info->req_parms.slave_id != NULL))
    {
      validate (validator, "slave_id", &con_info->req_parms.slave_id);
      con_info->response =
        delete_slave_omp (credentials, con_info->req_parms.slave_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_user"))
           && (con_info->req_parms.name != NULL))
    {
      validate (validator, "name", &con_info->req_parms.name);
      con_info->response =
        delete_user_oap (credentials, con_info->req_parms.name);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_target"))
           && (con_info->req_parms.target_id != NULL))
    {
      validate (validator, "target_id", &con_info->req_parms.target_id);
      con_info->response =
        delete_target_omp (credentials, con_info->req_parms.target_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_agent"))
           && (con_info->req_parms.agent_id != NULL))
    {
      validate (validator, "agent_id", &con_info->req_parms.agent_id);
      con_info->response =
        delete_trash_agent_omp (credentials, con_info->req_parms.agent_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_config"))
           && (con_info->req_parms.config_id != NULL))
    {
      validate (validator, "config_id", &con_info->req_parms.config_id);
      con_info->response =
        delete_trash_config_omp (credentials, con_info->req_parms.config_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_escalator"))
           && (con_info->req_parms.escalator_id != NULL))
    {
      validate (validator, "escalator_id", &con_info->req_parms.escalator_id);
      con_info->response =
        delete_trash_escalator_omp (credentials, con_info->req_parms.escalator_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_lsc_credential"))
           && (con_info->req_parms.lsc_credential_id != NULL))
    {
      validate (validator, "lsc_credential_id",
                &con_info->req_parms.lsc_credential_id);
      con_info->response =
        delete_trash_lsc_credential_omp (credentials,
                                         con_info->req_parms.lsc_credential_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_report_format"))
           && (con_info->req_parms.report_format_id != NULL))
    {
      validate (validator, "report_format_id",
                &con_info->req_parms.report_format_id);
      con_info->response =
        delete_trash_report_format_omp (credentials,
                                        con_info->req_parms.report_format_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_schedule"))
           && (con_info->req_parms.schedule_id != NULL))
    {
      validate (validator, "schedule_id", &con_info->req_parms.schedule_id);
      con_info->response =
        delete_trash_schedule_omp (credentials, con_info->req_parms.schedule_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_slave"))
           && (con_info->req_parms.slave_id != NULL))
    {
      validate (validator, "slave_id", &con_info->req_parms.slave_id);
      con_info->response =
        delete_trash_slave_omp (credentials, con_info->req_parms.slave_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_target"))
           && (con_info->req_parms.target_id != NULL))
    {
      validate (validator, "target_id", &con_info->req_parms.target_id);
      con_info->response =
        delete_trash_target_omp (credentials, con_info->req_parms.target_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_trash_task"))
           && (con_info->req_parms.task_id != NULL))
    {
      validate (validator, "task_id", &con_info->req_parms.task_id);
      con_info->response =
        delete_trash_task_omp (credentials, con_info->req_parms.task_id);
    }

  else if ((!strcmp (con_info->req_parms.cmd, "delete_config"))
           && (con_info->req_parms.config_id != NULL))
    {
      validate (validator, "config_id", &con_info->req_parms.config_id);
      con_info->response =
        delete_config_omp (credentials, con_info->req_parms.config_id);
    }

  else if (!strcmp (con_info->req_parms.cmd, "empty_trashcan"))
    {
      con_info->response =
        empty_trashcan_omp (credentials);
    }
  else if (!strcmp (con_info->req_parms.cmd, "escalate_report"))
    {
      unsigned int first, esc_first;
      unsigned int max, esc_max;
      gchar *content_type_omp;
      gsize response_size;
      char *content_disposition;
      const char *min_cvss_base, *esc_min_cvss_base;

      if (!con_info->req_parms.first_result
          || sscanf (con_info->req_parms.first_result, "%u", &first) != 1)
        first = 1;
      if (!con_info->req_parms.max_results
          || sscanf (con_info->req_parms.max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      if (!con_info->req_parms.esc_first_result
          || sscanf (con_info->req_parms.esc_first_result, "%u", &esc_first) != 1)
        esc_first = 1;
      if (!con_info->req_parms.esc_max_results
          || sscanf (con_info->req_parms.esc_max_results, "%u", &esc_max) != 1)
        esc_max = RESULTS_PER_PAGE;

      validate (validator, "report_id", &con_info->req_parms.report_id);
      validate (validator, "report_format_id",
                &con_info->req_parms.report_format_id);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      validate (validator, "levels", &con_info->req_parms.levels);
      validate_or (validator, "notes", &con_info->req_parms.notes, "0");
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      validate_or (validator,
                   "result_hosts_only",
                   &con_info->req_parms.result_hosts_only,
                   "0");
      validate_or (validator,
                   "search_phrase",
                   &con_info->req_parms.search_phrase,
                   "");
      validate (validator, "levels", &con_info->req_parms.esc_levels);
      validate_or (validator, "notes", &con_info->req_parms.esc_notes, "0");
      validate_or (validator, "overrides", &con_info->req_parms.esc_overrides,
                   "0");
      validate_or (validator,
                   "result_hosts_only",
                   &con_info->req_parms.esc_result_hosts_only,
                   "0");
      validate_or (validator,
                   "search_phrase",
                   &con_info->req_parms.esc_search_phrase,
                   "");
      validate (validator, "escalator_id",
                &con_info->req_parms.report_escalator_id);

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      if (con_info->req_parms.esc_min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.esc_min_cvss_base))
            esc_min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                esc_min_cvss_base = con_info->req_parms.esc_min_cvss_base;
              else
                esc_min_cvss_base = "";
            }
        }
      else
        esc_min_cvss_base = "";

      con_info->response =
        get_report_omp (credentials,
                        con_info->req_parms.report_id,
                        NULL,
                        con_info->req_parms.report_format_id,
                        &response_size,
                        (const unsigned int) first,
                        (const unsigned int) max,
                        con_info->req_parms.sort_field,
                        con_info->req_parms.sort_order,
                        con_info->req_parms.levels,
                        NULL, // FIX
                        con_info->req_parms.notes,
                        con_info->req_parms.overrides,
                        con_info->req_parms.result_hosts_only,
                        con_info->req_parms.search_phrase,
                        min_cvss_base,
                        con_info->req_parms.report_escalator_id,
                        (const unsigned int) esc_first,
                        (const unsigned int) esc_max,
                        con_info->req_parms.esc_levels,
                        con_info->req_parms.esc_notes,
                        con_info->req_parms.esc_overrides,
                        con_info->req_parms.esc_result_hosts_only,
                        con_info->req_parms.esc_search_phrase,
                        esc_min_cvss_base,
                        NULL,
                        NULL,
                        &content_type_omp,
                        &content_disposition);
    }
  else if (!strcmp (con_info->req_parms.cmd, "get_tasks"))
    {
      con_info->response
       = get_tasks_omp (credentials,
                        NULL,
                        con_info->req_parms.sort_field,
                        con_info->req_parms.sort_order,
                        "",
                        con_info->req_parms.overrides
                         ? strcmp (con_info->req_parms.overrides, "0")
                         : 0,
                        NULL);
    }
  else if (!strcmp (con_info->req_parms.cmd, "import_config"))
    {
      con_info->response =
        import_config_omp (credentials, con_info->req_parms.xml_file);
    }
  else if (!strcmp (con_info->req_parms.cmd, "import_report_format"))
    {
      con_info->response =
        import_report_format_omp (credentials, con_info->req_parms.xml_file);
    }
  else if (!strcmp (con_info->req_parms.cmd, "modify_auth"))
    {
      validate (validator, "group", &con_info->req_parms.group);
      validate (validator, "enable", &con_info->req_parms.enable);
      validate (validator, "authdn", &con_info->req_parms.authdn);
      validate (validator, "ldaphost", &con_info->req_parms.ldaphost);
      validate (validator, "domain", &con_info->req_parms.domain);

      con_info->response =
        modify_ldap_auth_oap (credentials,
                              con_info->req_parms.group,
                              con_info->req_parms.enable,
                              con_info->req_parms.ldaphost,
                              con_info->req_parms.authdn,
                              con_info->req_parms.domain);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "pause_task"))
           && (con_info->req_parms.task_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL))
    {
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      con_info->response =
        pause_task_omp (credentials,
                        con_info->req_parms.task_id,
                        con_info->req_parms.overrides
                         ? strcmp (con_info->req_parms.overrides, "0")
                         : 0,
                        con_info->req_parms.next);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "restore"))
           && (con_info->req_parms.target_id != NULL))
    {
      validate (validator, "uuid", &con_info->req_parms.target_id);
      con_info->response =
        restore_omp (credentials, con_info->req_parms.target_id);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "resume_paused_task"))
           && (con_info->req_parms.task_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL))
    {
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      con_info->response =
        resume_paused_task_omp (credentials,
                                con_info->req_parms.task_id,
                                con_info->req_parms.overrides
                                 ? strcmp (con_info->req_parms.overrides, "0")
                                 : 0,
                                con_info->req_parms.next);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "resume_stopped_task"))
           && (con_info->req_parms.task_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL))
    {
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      con_info->response =
        resume_stopped_task_omp (credentials,
                                 con_info->req_parms.task_id,
                                 con_info->req_parms.overrides
                                  ? strcmp (con_info->req_parms.overrides, "0")
                                  : 0,
                                 con_info->req_parms.next);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_config"))
    {
      validate (validator, "config_id", &con_info->req_parms.config_id);
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "family_page", &con_info->req_parms.submit);

      con_info->response =
        save_config_omp (credentials,
                         con_info->req_parms.config_id,
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
      validate (validator, "config_id", &con_info->req_parms.config_id);
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "family", &con_info->req_parms.family);
      con_info->response =
        save_config_family_omp (credentials,
                                con_info->req_parms.config_id,
                                con_info->req_parms.name,
                                con_info->req_parms.family,
                                con_info->req_parms.sort_field,
                                con_info->req_parms.sort_order,
                                con_info->req_parms.nvts);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_config_nvt"))
    {
      validate (validator, "config_id", &con_info->req_parms.config_id);
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "family", &con_info->req_parms.family);
      validate (validator, "oid", &con_info->req_parms.oid);
      con_info->response =
        save_config_nvt_omp (credentials,
                             con_info->req_parms.config_id,
                             con_info->req_parms.name,
                             con_info->req_parms.family,
                             con_info->req_parms.oid,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.preferences,
                             con_info->req_parms.files,
                             con_info->req_parms.passwords,
                             con_info->req_parms.timeout);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_lsc_credential"))
    {
      int change_login = &con_info->req_parms.login ? 1 : 0;
      validate (validator, "lsc_credential_id",
                &con_info->req_parms.lsc_credential_id);
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      if (change_login)
        validate (validator, "credential_login",
                  &con_info->req_parms.credential_login);
      if (con_info->req_parms.enable)
        validate (validator, "lsc_password", &con_info->req_parms.password);
      con_info->response =
        save_lsc_credential_omp (credentials,
                                 con_info->req_parms.lsc_credential_id,
                                 con_info->req_parms.name,
                                 con_info->req_parms.comment,
                                 change_login,
                                 con_info->req_parms.credential_login,
                                 con_info->req_parms.enable ? 1 : 0,
                                 con_info->req_parms.password,
                                 con_info->req_parms.next,
                                 con_info->req_parms.sort_field,
                                 con_info->req_parms.sort_order);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_note") == 0))
    {
      if (validate (validator, "note_id", &con_info->req_parms.note_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "note_task_id",
                       &con_info->req_parms.note_task_id)
          || validate (validator, "note_result_id",
                       &con_info->req_parms.note_result_id))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving a note. "
                        "The note remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_notes");
      else
        con_info->response =
          save_note_omp (credentials,
                         con_info->req_parms.note_id,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         "get_note", NULL, 0, 0, NULL, NULL, NULL, NULL,
                         NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_notes") == 0))
    {
      if (validate (validator, "note_id", &con_info->req_parms.note_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "note_task_id",
                       &con_info->req_parms.note_task_id)
          || validate (validator, "note_result_id",
                       &con_info->req_parms.note_result_id))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving a note. "
                        "The note remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_notes");
      else
        con_info->response =
          save_note_omp (credentials,
                         con_info->req_parms.note_id,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         "get_notes", NULL, 0, 0, NULL, NULL, NULL, NULL, NULL,
                         NULL, NULL, NULL, NULL, NULL, NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_nvts") == 0)
           && (con_info->req_parms.oid != NULL))
    {
      if (validate (validator, "note_id", &con_info->req_parms.note_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "note_task_id",
                       &con_info->req_parms.note_task_id)
          || validate (validator, "note_result_id",
                       &con_info->req_parms.note_result_id)
          || validate (validator, "oid", &con_info->req_parms.oid))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving a note. "
                        "The note remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_notes");
      else
        con_info->response =
          save_note_omp (credentials,
                         con_info->req_parms.note_id,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         "get_nvts", NULL, 0, 0, NULL, NULL, NULL, NULL, NULL,
                         NULL, NULL, NULL, con_info->req_parms.oid, NULL, NULL,
                         NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_report") == 0))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || sscanf (con_info->req_parms.first_result, "%u", &first) != 1)
        first = 1;

      if (!con_info->req_parms.max_results
          || sscanf (con_info->req_parms.max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      if (validate (validator, "note_id", &con_info->req_parms.note_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "note_task_id", &con_info->req_parms.note_task_id)
          || validate (validator, "note_result_id",
                       &con_info->req_parms.note_result_id)
          || validate (validator, "report_id", &con_info->req_parms.report_id)
          || validate (validator, "sort_field", &con_info->req_parms.sort_field)
          || validate (validator, "sort_order", &con_info->req_parms.sort_order)
          || validate (validator, "levels", &con_info->req_parms.levels)
          || validate_or (validator, "notes", &con_info->req_parms.notes, "0")
          || validate_or (validator, "overrides", &con_info->req_parms.overrides, "0")
          || validate_or (validator,
                          "result_hosts_only",
                          &con_info->req_parms.result_hosts_only,
                          "0")
          || validate_or (validator,
                          "search_phrase",
                          &con_info->req_parms.search_phrase,
                          "")
          || (min_cvss_base == NULL))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving a note. "
                        "The note remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_notes");
      else
        con_info->response =
          save_note_omp (credentials,
                         con_info->req_parms.note_id,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         "get_report",
                         con_info->req_parms.report_id,
                         first, max,
                         con_info->req_parms.sort_field,
                         con_info->req_parms.sort_order,
                         con_info->req_parms.levels,
                         con_info->req_parms.notes,
                         con_info->req_parms.overrides,
                         con_info->req_parms.result_hosts_only,
                         con_info->req_parms.search_phrase,
                         con_info->req_parms.min_cvss_base,
                         NULL, NULL, NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_result") == 0))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || sscanf (con_info->req_parms.first_result, "%u", &first) != 1)
        first = 1;

      if (!con_info->req_parms.max_results
          || sscanf (con_info->req_parms.max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      if (validate (validator, "note_id", &con_info->req_parms.note_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "note_task_id", &con_info->req_parms.note_task_id)
          || validate (validator, "note_result_id",
                       &con_info->req_parms.note_result_id)
          || validate (validator, "report_id", &con_info->req_parms.report_id)
          || validate (validator, "sort_field", &con_info->req_parms.sort_field)
          || validate (validator, "sort_order", &con_info->req_parms.sort_order)
          || validate (validator, "levels", &con_info->req_parms.levels)
          || validate_or (validator, "notes", &con_info->req_parms.notes, "0")
          || validate_or (validator, "overrides", &con_info->req_parms.overrides, "0")
          || validate_or (validator,
                          "result_hosts_only",
                          &con_info->req_parms.result_hosts_only,
                          "0")
          || validate_or (validator,
                          "search_phrase",
                          &con_info->req_parms.search_phrase,
                          "")
          || (min_cvss_base == NULL)
          || validate (validator, "task_id", &con_info->req_parms.task_id)
          || validate (validator, "result_id", &con_info->req_parms.report_id)
          || validate (validator, "name", &con_info->req_parms.name))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving a note. "
                        "The note remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_notes");
      else
        con_info->response =
          save_note_omp (credentials,
                         con_info->req_parms.note_id,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         "get_result",
                         con_info->req_parms.report_id,
                         first, max,
                         con_info->req_parms.sort_field,
                         con_info->req_parms.sort_order,
                         con_info->req_parms.levels,
                         con_info->req_parms.notes,
                         con_info->req_parms.overrides,
                         con_info->req_parms.result_hosts_only,
                         con_info->req_parms.search_phrase,
                         con_info->req_parms.min_cvss_base,
                         NULL,
                         con_info->req_parms.task_id,
                         con_info->req_parms.name,
                         con_info->req_parms.result_id);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_note"))
           && (con_info->req_parms.note_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL)
           && (strcmp (con_info->req_parms.next, "get_tasks") == 0)
           && (con_info->req_parms.task_id != NULL))
    {
      if (validate (validator, "note_id", &con_info->req_parms.note_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "note_task_id",
                       &con_info->req_parms.note_task_id)
          || validate (validator, "note_result_id",
                       &con_info->req_parms.note_result_id)
          || validate_or (validator, "overrides",
                          &con_info->req_parms.overrides, "0")
          || validate (validator, "task_id", &con_info->req_parms.task_id))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving a note. "
                        "The note remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_notes");
      else
        con_info->response =
          save_note_omp (credentials,
                         con_info->req_parms.note_id,
                         con_info->req_parms.text,
                         con_info->req_parms.hosts,
                         con_info->req_parms.port,
                         con_info->req_parms.threat,
                         con_info->req_parms.note_task_id,
                         con_info->req_parms.note_result_id,
                         "get_tasks", NULL, 0, 0, NULL, NULL, NULL, NULL,
                         con_info->req_parms.overrides,
                         NULL, NULL, NULL, NULL,
                         con_info->req_parms.task_id,
                         NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_override") == 0))
    {
      if (validate (validator, "override_id", &con_info->req_parms.override_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || validate (validator, "port", &con_info->req_parms.port)
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "new_threat", &con_info->req_parms.new_threat)
          || validate (validator, "override_task_id",
                       &con_info->req_parms.override_task_id)
          || validate (validator, "override_result_id",
                       &con_info->req_parms.override_result_id)
          || validate_or (validator, "overrides",
                          &con_info->req_parms.overrides, "0"))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving an override. "
                        "The override remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_overrides");
      else
        con_info->response =
          save_override_omp (credentials,
                             con_info->req_parms.override_id,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.override_result_id,
                             "get_override", NULL, 0, 0, NULL, NULL, NULL, NULL,
                             NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_overrides") == 0))
    {
      if (validate (validator, "override_id", &con_info->req_parms.override_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "new_threat", &con_info->req_parms.new_threat)
          || validate (validator, "override_task_id",
                       &con_info->req_parms.override_task_id)
          || validate (validator, "override_result_id",
                       &con_info->req_parms.override_result_id))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving an override. "
                        "The override remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_overrides");
      else
        con_info->response =
          save_override_omp (credentials,
                             con_info->req_parms.override_id,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.override_result_id,
                             "get_overrides", NULL, 0, 0, NULL, NULL, NULL,
                             NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
                             NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_nvts") == 0)
           && (con_info->req_parms.oid != NULL))
    {
      if (validate (validator, "override_id", &con_info->req_parms.override_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "new_threat", &con_info->req_parms.new_threat)
          || validate (validator, "override_task_id",
                       &con_info->req_parms.override_task_id)
          || validate (validator, "override_result_id",
                       &con_info->req_parms.override_result_id)
          || validate (validator, "oid", &con_info->req_parms.oid))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving an override. "
                        "The override remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_overrides");
      else
        con_info->response =
          save_override_omp (credentials,
                             con_info->req_parms.override_id,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.override_result_id,
                             "get_nvts", NULL, 0, 0, NULL, NULL, NULL, NULL,
                             NULL, NULL, NULL, NULL, con_info->req_parms.oid,
                             NULL, NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_override"))
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_report") == 0))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || sscanf (con_info->req_parms.first_result, "%u", &first) != 1)
        first = 1;

      if (!con_info->req_parms.max_results
          || sscanf (con_info->req_parms.max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      if (validate (validator, "override_id", &con_info->req_parms.override_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "new_threat", &con_info->req_parms.new_threat)
          || validate (validator, "override_task_id",
                       &con_info->req_parms.override_task_id)
          || validate (validator, "override_result_id",
                       &con_info->req_parms.override_result_id)
          || validate (validator, "report_id", &con_info->req_parms.report_id)
          || validate (validator, "sort_field", &con_info->req_parms.sort_field)
          || validate (validator, "sort_order", &con_info->req_parms.sort_order)
          || validate (validator, "levels", &con_info->req_parms.levels)
          || validate_or (validator, "notes", &con_info->req_parms.notes, "0")
          || validate_or (validator, "overrides", &con_info->req_parms.overrides, "0")
          || validate_or (validator,
                          "result_hosts_only",
                          &con_info->req_parms.result_hosts_only,
                          "0")
          || validate_or (validator,
                          "search_phrase",
                          &con_info->req_parms.search_phrase,
                          "")
          || (min_cvss_base == NULL))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving an override. "
                        "The override remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_overrides");
      else
        con_info->response =
          save_override_omp (credentials,
                             con_info->req_parms.override_id,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.override_result_id,
                             "get_report",
                             con_info->req_parms.report_id,
                             first, max,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.levels,
                             con_info->req_parms.notes,
                             con_info->req_parms.overrides,
                             con_info->req_parms.result_hosts_only,
                             con_info->req_parms.search_phrase,
                             con_info->req_parms.min_cvss_base,
                             NULL, NULL, NULL, NULL);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (strcmp (con_info->req_parms.next, "get_result") == 0))
    {
      unsigned int first, max;
      const char *min_cvss_base;

      if (!con_info->req_parms.first_result
          || sscanf (con_info->req_parms.first_result, "%u", &first) != 1)
        first = 1;

      if (!con_info->req_parms.max_results
          || sscanf (con_info->req_parms.max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      if (con_info->req_parms.min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base",
                                con_info->req_parms.min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              if (con_info->req_parms.apply_min
                  && strcmp (con_info->req_parms.apply_min, "0"))
                min_cvss_base = con_info->req_parms.min_cvss_base;
              else
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      if (validate (validator, "override_id", &con_info->req_parms.override_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "new_threat", &con_info->req_parms.new_threat)
          || validate (validator, "override_task_id",
                       &con_info->req_parms.override_task_id)
          || validate (validator, "override_result_id",
                       &con_info->req_parms.override_result_id)
          || validate (validator, "report_id", &con_info->req_parms.report_id)
          || validate (validator, "sort_field", &con_info->req_parms.sort_field)
          || validate (validator, "sort_order", &con_info->req_parms.sort_order)
          || validate (validator, "levels", &con_info->req_parms.levels)
          || validate_or (validator, "notes", &con_info->req_parms.notes, "0")
          || validate_or (validator, "overrides", &con_info->req_parms.overrides, "0")
          || validate_or (validator,
                          "result_hosts_only",
                          &con_info->req_parms.result_hosts_only,
                          "0")
          || validate_or (validator,
                          "search_phrase",
                          &con_info->req_parms.search_phrase,
                          "")
          || (min_cvss_base == NULL)
          || validate (validator, "task_id", &con_info->req_parms.task_id)
          || validate (validator, "result_id", &con_info->req_parms.report_id)
          || validate (validator, "name", &con_info->req_parms.name))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving an override. "
                        "The override remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_overrides");
      else
        con_info->response =
          save_override_omp (credentials,
                             con_info->req_parms.override_id,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.override_result_id,
                             "get_result",
                             con_info->req_parms.report_id,
                             first, max,
                             con_info->req_parms.sort_field,
                             con_info->req_parms.sort_order,
                             con_info->req_parms.levels,
                             con_info->req_parms.notes,
                             con_info->req_parms.overrides,
                             con_info->req_parms.result_hosts_only,
                             con_info->req_parms.search_phrase,
                             con_info->req_parms.min_cvss_base,
                             NULL,
                             con_info->req_parms.task_id,
                             con_info->req_parms.name,
                             con_info->req_parms.result_id);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_override"))
           && (con_info->req_parms.override_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL)
           && (strcmp (con_info->req_parms.next, "get_tasks") == 0)
           && (con_info->req_parms.task_id != NULL))
    {
      if (validate (validator, "override_id", &con_info->req_parms.override_id)
          || validate_or (validator, "text", &con_info->req_parms.text, "")
          || con_info->req_parms.hosts == NULL
          || (strcmp (con_info->req_parms.hosts, "")
              && validate (validator, "hosts", &con_info->req_parms.hosts))
          || con_info->req_parms.port == NULL
          || (strcmp (con_info->req_parms.port, "")
              && validate (validator, "port", &con_info->req_parms.port))
          || validate (validator, "threat", &con_info->req_parms.threat)
          || validate (validator, "new_threat", &con_info->req_parms.new_threat)
          || validate (validator, "override_task_id",
                       &con_info->req_parms.override_task_id)
          || validate (validator, "override_result_id",
                       &con_info->req_parms.override_result_id)
          || validate_or (validator, "overrides",
                          &con_info->req_parms.overrides, "0")
          || validate (validator, "task_id", &con_info->req_parms.task_id))
        con_info->response =
          gsad_message (credentials,
                        "Internal error", __FUNCTION__, __LINE__,
                        "An internal error occurred while saving an override. "
                        "The override remains the same. "
                        "Diagnostics: Syntax error in required parameter.",
                        "/omp?cmd=get_overrides");
      else
        con_info->response =
          save_override_omp (credentials,
                             con_info->req_parms.override_id,
                             con_info->req_parms.text,
                             con_info->req_parms.hosts,
                             con_info->req_parms.port,
                             con_info->req_parms.threat,
                             con_info->req_parms.new_threat,
                             con_info->req_parms.override_task_id,
                             con_info->req_parms.override_result_id,
                             "get_tasks", NULL, 0, 0, NULL, NULL, NULL, NULL,
                             con_info->req_parms.overrides,
                             NULL, NULL, NULL, NULL,
                             con_info->req_parms.task_id,
                             NULL, NULL);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_report_format"))
    {
      validate (validator, "report_format_id",
                &con_info->req_parms.report_format_id);
      validate (validator, "name", &con_info->req_parms.name);
      validate (validator, "comment", &con_info->req_parms.comment);
      validate (validator, "enable", &con_info->req_parms.enable);
      validate (validator, "page", &con_info->req_parms.next);
      con_info->response =
        save_report_format_omp (credentials,
                                con_info->req_parms.report_format_id,
                                con_info->req_parms.name,
                                con_info->req_parms.comment,
                                con_info->req_parms.enable,
                                con_info->req_parms.preferences,
                                con_info->req_parms.next,
                                con_info->req_parms.sort_field,
                                con_info->req_parms.sort_order);
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_settings"))
    {
      con_info->response =
        save_settings_oap (credentials,
                           con_info->req_parms.sort_field,
                           con_info->req_parms.sort_order,
                           con_info->req_parms.method_data);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "save_task"))
           && (con_info->req_parms.task_id != NULL)
           && (con_info->req_parms.next != NULL)
           && ((strcmp (con_info->req_parms.next, "get_tasks") == 0)
               || (strcmp (con_info->req_parms.next, "get_task") == 0)))
    {
      if ((con_info->req_parms.target_id == NULL)
          || (strcmp (con_info->req_parms.target_id, "--")))
        {
          validate (validator, "task_id", &con_info->req_parms.task_id);
          validate (validator, "name", &con_info->req_parms.name);
          validate (validator, "comment", &con_info->req_parms.comment);
          validate (validator, "escalator_id",
                    &con_info->req_parms.escalator_id);
          validate (validator, "schedule_id", &con_info->req_parms.schedule_id);
          validate (validator, "slave_id", &con_info->req_parms.slave_id);
          validate (validator, "page", &con_info->req_parms.next);
          validate (validator, "refresh_interval",
                    &con_info->req_parms.refresh_interval);
          validate (validator, "sort_field", &con_info->req_parms.sort_field);
          validate (validator, "sort_order", &con_info->req_parms.sort_order);
          validate (validator, "overrides", &con_info->req_parms.overrides);
          validate (validator, "max_checks", &con_info->req_parms.max_checks);
          validate (validator, "max_hosts", &con_info->req_parms.max_hosts);

          con_info->response =
            save_task_omp (credentials,
                           con_info->req_parms.task_id,
                           con_info->req_parms.name,
                           con_info->req_parms.comment,
                           con_info->req_parms.escalator_id,
                           con_info->req_parms.schedule_id,
                           con_info->req_parms.slave_id,
                           con_info->req_parms.next,
                           con_info->req_parms.refresh_interval,
                           con_info->req_parms.sort_field,
                           con_info->req_parms.sort_order,
                           con_info->req_parms.overrides
                            ? strcmp (con_info->req_parms.overrides, "0")
                            : 0,
                           con_info->req_parms.max_checks,
                           con_info->req_parms.max_hosts);
        }
      else
        {
          validate (validator, "task_id", &con_info->req_parms.task_id);
          validate (validator, "name", &con_info->req_parms.name);
          validate (validator, "comment", &con_info->req_parms.comment);
          validate (validator, "page", &con_info->req_parms.next);
          validate (validator, "refresh_interval",
                    &con_info->req_parms.refresh_interval);
          validate (validator, "sort_field", &con_info->req_parms.sort_field);
          validate (validator, "sort_order", &con_info->req_parms.sort_order);
          validate (validator, "overrides", &con_info->req_parms.overrides);

          con_info->response =
            save_container_task_omp (credentials,
                                     con_info->req_parms.task_id,
                                     con_info->req_parms.name,
                                     con_info->req_parms.comment,
                                     con_info->req_parms.next,
                                     con_info->req_parms.refresh_interval,
                                     con_info->req_parms.sort_field,
                                     con_info->req_parms.sort_order,
                                     con_info->req_parms.overrides
                                      ? strcmp (con_info->req_parms.overrides,
                                                "0")
                                      : 0);
        }
    }
  else if (!strcmp (con_info->req_parms.cmd, "save_user"))
    {
      validate (validator, "login", &con_info->req_parms.login);
      validate (validator, "modify_password",
                &con_info->req_parms.modify_password);
      validate (validator, "password", &con_info->req_parms.password);
      validate (validator, "role", &con_info->req_parms.role);
      validate (validator, "access_hosts", &con_info->req_parms.access_hosts);
      validate (validator, "hosts_allow", &con_info->req_parms.hosts_allow);
      con_info->response =
        save_user_oap (credentials,
                       con_info->req_parms.login,
                       con_info->req_parms.modify_password,
                       con_info->req_parms.password,
                       con_info->req_parms.role,
                       con_info->req_parms.access_hosts,
                       con_info->req_parms.hosts_allow);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "start_task"))
           && (con_info->req_parms.task_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL))
    {
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      con_info->response =
        start_task_omp (credentials,
                        con_info->req_parms.task_id,
                        con_info->req_parms.overrides
                         ? strcmp (con_info->req_parms.overrides, "0")
                         : 0,
                        con_info->req_parms.next);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "stop_task"))
           && (con_info->req_parms.task_id != NULL)
           && (con_info->req_parms.next != NULL)
           && (con_info->req_parms.overrides != NULL))
    {
      validate (validator, "task_id", &con_info->req_parms.task_id);
      validate (validator, "page", &con_info->req_parms.next);
      validate_or (validator, "overrides", &con_info->req_parms.overrides, "0");
      con_info->response =
        stop_task_omp (credentials,
                       con_info->req_parms.task_id,
                       con_info->req_parms.overrides
                        ? strcmp (con_info->req_parms.overrides, "0")
                        : 0,
                       con_info->req_parms.next);
    }
  else if (!strcmp (con_info->req_parms.cmd, "sync_feed"))
    {
      con_info->response = sync_feed_oap (credentials);
    }
  else if ((!strcmp (con_info->req_parms.cmd, "test_escalator"))
           && (con_info->req_parms.escalator_id != NULL))
    {
      validate (validator, "escalator_id", &con_info->req_parms.escalator_id);
      validate (validator, "sort_field", &con_info->req_parms.sort_field);
      validate (validator, "sort_order", &con_info->req_parms.sort_order);
      con_info->response =
        test_escalator_omp (credentials,
                            con_info->req_parms.escalator_id,
                            con_info->req_parms.sort_field,
                            con_info->req_parms.sort_order);
    }
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
  const char *agent_format = NULL;
  const char *agent_id     = NULL;
  const char *apply_overrides    = NULL;
  const char *comment      = NULL;
  const char *config_id    = NULL;
  const char *delta_report_id = NULL;
  const char *delta_states = NULL;
  const char *escalator_id = NULL;
  const char *report_escalator_id = NULL;
  const char *esc_first_result = NULL;
  const char *esc_max_results = NULL;
  const char *task_id      = NULL;
  const char *result_id    = NULL;
  const char *report_id    = NULL;
  const char *report_format_id = NULL;
  const char *note_id      = NULL;
  const char *next         = NULL;
  const char *override_id  = NULL;
  const char *override_task_id   = NULL;
  const char *override_result_id = NULL;
  const char *format       = NULL;
  const char *preference_name = NULL;
  const char *package_format = NULL;
  const char *name         = NULL;
  const char *family       = NULL;
  const char *first_result = NULL;
  const char *hosts        = NULL;
  const char *max_results  = NULL;
  const char *oid          = NULL;
  const char *sort_field   = NULL;
  const char *sort_order   = NULL;
  const char *type         = NULL;
  const char *levels       = NULL;
  const char *notes        = NULL;
  const char *overrides    = NULL;
  const char *result_hosts_only = NULL;
  const char *search_phrase = NULL;
  const char *min_cvss_base    = NULL;
  const char *esc_levels       = NULL;
  const char *esc_notes        = NULL;
  const char *esc_overrides    = NULL;
  const char *esc_result_hosts_only = NULL;
  const char *esc_search_phrase = NULL;
  const char *esc_min_cvss_base    = NULL;
  const char *port         = NULL;
  const char *threat       = NULL;
  const char *new_threat   = NULL;
  const char *text         = NULL;
  const char *refresh_interval = NULL;
  const char *duration     = NULL;
  const char *lsc_credential_id = NULL;
  const char *schedule_id  = NULL;
  const char *slave_id   = NULL;
  const char *target_id  = NULL;
  int high = 0, medium = 0, low = 0, log = 0, false_positive = 0;
  int changed = 0, gone = 0, new = 0, same = 0;

  const int CMD_MAX_SIZE = 27;   /* delete_trash_lsc_credential */
  const int VAL_MAX_SIZE = 100;

  cmd =
    (char *) MHD_lookup_connection_value (connection, MHD_GET_ARGUMENT_KIND,
                                          "cmd");
  if (openvas_validate (validator, "cmd", cmd))
    cmd = NULL;

  if ((cmd != NULL) && (strlen (cmd) <= CMD_MAX_SIZE))
    {
      tracef ("cmd: [%s]\n", cmd);

      agent_id = MHD_lookup_connection_value
                      (connection,
                       MHD_GET_ARGUMENT_KIND,
                       "agent_id");
      if (openvas_validate (validator, "agent_id", agent_id))
        agent_id = NULL;

      apply_overrides = MHD_lookup_connection_value (connection,
                                                     MHD_GET_ARGUMENT_KIND,
                                                     "apply_overrides");
      if (apply_overrides)
        {
          if (openvas_validate (validator, "apply_overrides", apply_overrides))
            apply_overrides = NULL;
        }
      else
        apply_overrides = "0";

      comment = MHD_lookup_connection_value (connection,
                                             MHD_GET_ARGUMENT_KIND,
                                             "comment");
      if (openvas_validate (validator, "comment", comment))
        comment = NULL;

      config_id = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "config_id");
      if (openvas_validate (validator, "config_id", config_id))
        config_id = NULL;

      delta_report_id = MHD_lookup_connection_value (connection,
                                                     MHD_GET_ARGUMENT_KIND,
                                                     "delta_report_id");
      if (openvas_validate (validator, "report_id", delta_report_id))
        delta_report_id = NULL;

      escalator_id = MHD_lookup_connection_value (connection,
                                                  MHD_GET_ARGUMENT_KIND,
                                                  "escalator_id");

      delta_states = MHD_lookup_connection_value (connection,
                                                  MHD_GET_ARGUMENT_KIND,
                                                  "delta_states");
      if (delta_states)
        {
          /* "delta_states" overrides "delta_state_*". */
          if (openvas_validate (validator, "delta_states", delta_states))
            delta_states = NULL;
        }
      else
        {
          const char *delta_state;

          delta_state = MHD_lookup_connection_value (connection,
                                                     MHD_GET_ARGUMENT_KIND,
                                                     "delta_state_changed");
          if (openvas_validate (validator, "delta_state_changed", delta_state))
            changed = 0;
          else
            changed = atoi (delta_state);

          delta_state = MHD_lookup_connection_value (connection,
                                                     MHD_GET_ARGUMENT_KIND,
                                                     "delta_state_gone");
          if (openvas_validate (validator, "delta_state_gone", delta_state))
            gone = 0;
          else
            gone = atoi (delta_state);

          delta_state = MHD_lookup_connection_value (connection,
                                                     MHD_GET_ARGUMENT_KIND,
                                                     "delta_state_new");
          if (openvas_validate (validator, "delta_state_new", delta_state))
            new = 0;
          else
           new = atoi (delta_state);

          delta_state = MHD_lookup_connection_value (connection,
                                                     MHD_GET_ARGUMENT_KIND,
                                                     "delta_state_same");
          if (openvas_validate (validator, "delta_state_same", delta_state))
            same = 0;
          else
            same = atoi (delta_state);
        }

      if (openvas_validate (validator, "escalator_id", escalator_id))
        escalator_id = NULL;

      report_escalator_id = MHD_lookup_connection_value (connection,
                                                         MHD_GET_ARGUMENT_KIND,
                                                         "report_escalator_id");
      if (report_escalator_id)
        {
          if (openvas_validate (validator, "escalator_id", report_escalator_id))
            report_escalator_id = NULL;
        }
      else
        report_escalator_id = "0";

      task_id = MHD_lookup_connection_value (connection,
                                             MHD_GET_ARGUMENT_KIND,
                                             "task_id");
      if (openvas_validate (validator, "task_id", task_id))
        task_id = NULL;

      result_id = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "result_id");
      if (openvas_validate (validator, "result_id", result_id))
        result_id = NULL;

      report_id = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "report_id");
      if (openvas_validate (validator, "report_id", report_id))
        report_id = NULL;

      report_format_id = MHD_lookup_connection_value (connection,
                                                      MHD_GET_ARGUMENT_KIND,
                                                      "report_format_id");
      if (openvas_validate (validator, "report_format_id", report_format_id))
        report_format_id = NULL;

      note_id = MHD_lookup_connection_value (connection,
                                             MHD_GET_ARGUMENT_KIND,
                                             "note_id");
      if (openvas_validate (validator, "note_id", note_id))
        note_id = NULL;

      override_id = MHD_lookup_connection_value (connection,
                                                 MHD_GET_ARGUMENT_KIND,
                                                 "override_id");
      if (openvas_validate (validator, "override_id", override_id))
        override_id = NULL;

      override_task_id = MHD_lookup_connection_value (connection,
                                                      MHD_GET_ARGUMENT_KIND,
                                                      "override_task_id");
      if (openvas_validate (validator, "override_task_id", override_task_id))
        override_task_id = NULL;

      override_result_id = MHD_lookup_connection_value (connection,
                                                        MHD_GET_ARGUMENT_KIND,
                                                        "override_result_id");
      if (openvas_validate (validator,
                            "override_result_id",
                            override_result_id))
        override_result_id = NULL;

      next = MHD_lookup_connection_value (connection,
                                          MHD_GET_ARGUMENT_KIND,
                                          "next");
      if (openvas_validate (validator, "page", next))
        next = NULL;

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

      preference_name = MHD_lookup_connection_value
                         (connection,
                          MHD_GET_ARGUMENT_KIND,
                          "preference_name");
      if (openvas_validate (validator, "preference_name", preference_name))
        preference_name = NULL;

      name = MHD_lookup_connection_value (connection,
                                          MHD_GET_ARGUMENT_KIND,
                                          "name");
      if (openvas_validate (validator, "name", name))
        name = NULL;

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
      if (openvas_validate (validator, "family", family))
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

      esc_first_result = MHD_lookup_connection_value (connection,
                                                      MHD_GET_ARGUMENT_KIND,
                                                      "esc_first_result");
      if (openvas_validate (validator, "first_result", esc_first_result))
        esc_first_result = NULL;

      esc_max_results = MHD_lookup_connection_value (connection,
                                                     MHD_GET_ARGUMENT_KIND,
                                                     "esc_max_results");
      if (openvas_validate (validator, "max_results", esc_max_results))
        esc_max_results = NULL;

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

      schedule_id = MHD_lookup_connection_value (connection,
                                                 MHD_GET_ARGUMENT_KIND,
                                                 "schedule_id");
      if (openvas_validate (validator, "schedule_id", schedule_id))
        schedule_id = NULL;

      type = MHD_lookup_connection_value (connection,
                                          MHD_GET_ARGUMENT_KIND,
                                          "type");
      if (openvas_validate (validator, "type", type))
        type = NULL;

      lsc_credential_id = MHD_lookup_connection_value (connection,
                                                       MHD_GET_ARGUMENT_KIND,
                                                       "lsc_credential_id");
      if (openvas_validate (validator, "lsc_credential_id", lsc_credential_id))
        lsc_credential_id = NULL;

      slave_id = MHD_lookup_connection_value (connection,
                                              MHD_GET_ARGUMENT_KIND,
                                              "slave_id");
      if (openvas_validate (validator, "slave_id", slave_id))
        slave_id = NULL;

      target_id = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "target_id");
      if (openvas_validate (validator, "target_id", target_id))
        target_id = NULL;

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

          level = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "level_false_positive");
          if (openvas_validate (validator, "level_false_positive", level))
            false_positive = 0;
          else
            false_positive = atoi (level);
        }

      notes = MHD_lookup_connection_value (connection,
                                           MHD_GET_ARGUMENT_KIND,
                                           "notes");
      if (notes)
        {
          if (openvas_validate (validator, "notes", notes))
            notes = NULL;
        }
      else
        notes = "0";

      overrides = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "overrides");
      if (overrides)
        {
          if (openvas_validate (validator, "overrides", overrides))
            overrides = NULL;
        }
      else
        overrides = "0";

      result_hosts_only = MHD_lookup_connection_value (connection,
                                                       MHD_GET_ARGUMENT_KIND,
                                                       "result_hosts_only");
      if (result_hosts_only)
        {
          if (openvas_validate (validator,
                                "result_hosts_only",
                                result_hosts_only))
            result_hosts_only = NULL;
        }
      else
        result_hosts_only = "0";

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

      min_cvss_base = MHD_lookup_connection_value (connection,
                                                   MHD_GET_ARGUMENT_KIND,
                                                   "min_cvss_base");
      if (min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base", min_cvss_base))
            min_cvss_base = NULL;
          else
            {
              const char *apply_min;
              apply_min = MHD_lookup_connection_value (connection,
                                                       MHD_GET_ARGUMENT_KIND,
                                                       "apply_min_cvss_base");
              if (apply_min == NULL || (strcmp (apply_min, "0") == 0))
                min_cvss_base = "";
            }
        }
      else
        min_cvss_base = "";

      esc_levels = MHD_lookup_connection_value (connection,
                                                MHD_GET_ARGUMENT_KIND,
                                                "esc_levels");
      if (esc_levels)
        {
          if (openvas_validate (validator, "levels", esc_levels))
            esc_levels = NULL;
        }

      esc_notes = MHD_lookup_connection_value (connection,
                                               MHD_GET_ARGUMENT_KIND,
                                               "esc_notes");
      if (esc_notes)
        {
          if (openvas_validate (validator, "notes", esc_notes))
            esc_notes = NULL;
        }
      else
        esc_notes = "0";

      esc_overrides = MHD_lookup_connection_value (connection,
                                                   MHD_GET_ARGUMENT_KIND,
                                                   "esc_overrides");
      if (esc_overrides)
        {
          if (openvas_validate (validator, "overrides", esc_overrides))
            esc_overrides = NULL;
        }
      else
        esc_overrides = "0";

      esc_result_hosts_only =
       MHD_lookup_connection_value (connection,
                                    MHD_GET_ARGUMENT_KIND,
                                    "esc_result_hosts_only");
      if (esc_result_hosts_only)
        {
          if (openvas_validate (validator,
                                "result_hosts_only",
                                esc_result_hosts_only))
            esc_result_hosts_only = NULL;
        }
      else
        esc_result_hosts_only = "0";

      esc_search_phrase = MHD_lookup_connection_value (connection,
                                                       MHD_GET_ARGUMENT_KIND,
                                                       "esc_search_phrase");
      if (esc_search_phrase)
        {
          if (openvas_validate (validator, "search_phrase", esc_search_phrase))
            esc_search_phrase = NULL;
        }
      else
        esc_search_phrase = "";

      esc_min_cvss_base = MHD_lookup_connection_value (connection,
                                                       MHD_GET_ARGUMENT_KIND,
                                                       "esc_min_cvss_base");
      if (esc_min_cvss_base)
        {
          if (openvas_validate (validator, "min_cvss_base", esc_min_cvss_base))
            esc_min_cvss_base = NULL;
          else
            {
              const char *apply_min;
              apply_min = MHD_lookup_connection_value (connection,
                                                       MHD_GET_ARGUMENT_KIND,
                                                       "esc_apply_min_cvss_base");
              if (apply_min == NULL || (strcmp (apply_min, "0") == 0))
                esc_min_cvss_base = "";
            }
        }
      else
        esc_min_cvss_base = "";

      hosts = MHD_lookup_connection_value (connection,
                                           MHD_GET_ARGUMENT_KIND,
                                           "hosts");
      if (openvas_validate (validator, "hosts", hosts))
        hosts = NULL;

      port = MHD_lookup_connection_value (connection,
                                          MHD_GET_ARGUMENT_KIND,
                                          "port");
      if (port)
        {
          if (openvas_validate (validator, "port", port))
            port = NULL;
        }

      threat = MHD_lookup_connection_value (connection,
                                            MHD_GET_ARGUMENT_KIND,
                                            "threat");
      if (threat)
        {
          if (openvas_validate (validator, "threat", threat))
            threat = NULL;
        }

      new_threat = MHD_lookup_connection_value (connection,
                                                MHD_GET_ARGUMENT_KIND,
                                                "new_threat");
      if (new_threat)
        {
          if (openvas_validate (validator, "new_threat", threat))
            threat = NULL;
        }

      text = MHD_lookup_connection_value (connection,
                                          MHD_GET_ARGUMENT_KIND,
                                          "text");
      if (text)
        {
          if (openvas_validate (validator, "text", text))
            text = NULL;
        }
      else
        text = "";
    }
  else
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: No valid command for omp.",
                         "/omp?cmd=get_tasks");

  /** @todo Pass sort_order and sort_field to all page handlers. */
  /** @todo Ensure that XSL passes on sort_order and sort_field. */

  /* Check cmd and precondition, start respective OMP command(s). */
  if ((!strcmp (cmd, "new_task"))
      && (overrides != NULL))
    return new_task_omp (credentials, NULL,
                         overrides ? strcmp (overrides, "0") : 0);

  else if ((!strcmp (cmd, "get_tasks")) && (task_id != NULL)
           && (strlen (task_id) < VAL_MAX_SIZE))
    return get_tasks_omp (credentials, task_id, sort_field, sort_order,
                          refresh_interval,
                          overrides ? strcmp (overrides, "0") : 0,
                          report_id);

  else if (!strcmp (cmd, "edit_config"))
    return get_config_omp (credentials, config_id, 1);

  else if (!strcmp (cmd, "edit_config_family"))
    return get_config_family_omp (credentials, config_id, name, family,
                                  sort_field, sort_order, 1);

  else if (!strcmp (cmd, "edit_config_nvt"))
    return get_config_nvt_omp (credentials, config_id, name, family, oid,
                               sort_field, sort_order, 1);

  else if ((!strcmp (cmd, "edit_lsc_credential"))
           && (lsc_credential_id != NULL)
           && (next != NULL)
           && ((strcmp (next, "get_lsc_credentials") == 0)
               || (strcmp (next, "get_lsc_credential") == 0)))
    return edit_lsc_credential_omp (credentials, lsc_credential_id, next,
                                    sort_field, sort_order);

  else if ((!strcmp (cmd, "edit_note"))
           && (note_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_note") == 0))
    {
      return edit_note_omp (credentials, note_id, "get_note",
                            NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL,
                            NULL, NULL, NULL, NULL, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_note"))
           && (note_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_notes") == 0))
    {
      return edit_note_omp (credentials, note_id, "get_notes",
                            NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL,
                            NULL, NULL, NULL, NULL, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_note"))
           && (note_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_nvts") == 0)
           && (oid != NULL))
    {
      return edit_note_omp (credentials, note_id, "get_nvts",
                            NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL,
                            NULL, NULL, oid, NULL, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_note"))
           && (note_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_report") == 0)
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    {
      unsigned int first, max;

      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      return edit_note_omp (credentials, note_id, "get_report", report_id,
                            first, max, sort_field, sort_order, levels,
                            notes, overrides, result_hosts_only, search_phrase,
                            min_cvss_base, NULL, NULL, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_note"))
           && (note_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_result") == 0)
           && (name != NULL)
           && (result_id != NULL)
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    {
      unsigned int first, max;

      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      return edit_note_omp (credentials, note_id, "get_result",
                            /* Parameters for next page. */
                            report_id, first, max, sort_field, sort_order,
                            levels, notes, overrides, result_hosts_only,
                            search_phrase, min_cvss_base, NULL, task_id, name,
                            result_id);
    }

  else if ((!strcmp (cmd, "edit_note"))
           && (note_id != NULL)
           && (next != NULL)
           && (overrides != NULL)
           && (strcmp (next, "get_tasks") == 0)
           && (task_id != NULL))
    {
      return edit_note_omp (credentials, note_id, "get_tasks",
                            /* Parameters for next page. */
                            NULL, 0, 0, NULL, NULL, NULL, NULL, overrides, NULL,
                            NULL, NULL, NULL, task_id, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_override"))
           && (override_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_override") == 0))
    {
      return edit_override_omp (credentials, override_id, "get_override",
                                NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL,
                                NULL, "-1", NULL, NULL, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_override"))
           && (override_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_overrides") == 0))
    {
      return edit_override_omp (credentials, override_id, "get_overrides",
                                NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL,
                                NULL, "-1", NULL, NULL, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_override"))
           && (override_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_nvts") == 0)
           && (oid != NULL))
    {
      return edit_override_omp (credentials, override_id, "get_nvts",
                                NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL,
                                NULL, "-1", oid, NULL, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_override"))
           && (override_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_report") == 0)
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    {
      unsigned int first, max;

      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      return edit_override_omp (credentials, override_id, "get_report",
                                report_id, first, max, sort_field, sort_order,
                                levels, notes, overrides, result_hosts_only,
                                search_phrase, min_cvss_base, NULL, NULL, NULL,
                                NULL);
    }

  else if ((!strcmp (cmd, "edit_override"))
           && (override_id != NULL)
           && (next != NULL)
           && (strcmp (next, "get_result") == 0)
           && (name != NULL)
           && (result_id != NULL)
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    {
      unsigned int first, max;

      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;

      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      return edit_override_omp (credentials, override_id, "get_result",
                                /* Parameters for next page. */
                                report_id, first, max, sort_field, sort_order,
                                levels, notes, overrides, result_hosts_only,
                                search_phrase, min_cvss_base, NULL, task_id,
                                name, result_id);
    }

  else if ((!strcmp (cmd, "edit_override"))
           && (override_id != NULL)
           && (next != NULL)
           && (overrides != NULL)
           && (strcmp (next, "get_tasks") == 0)
           && (task_id != NULL))
    {
      return edit_override_omp (credentials, override_id, "get_tasks",
                                /* Parameters for next page. */
                                NULL, 0, 0, NULL, NULL, NULL, NULL, overrides, NULL,
                                NULL, "-1", NULL, task_id, NULL, NULL);
    }

  else if ((!strcmp (cmd, "edit_report_format"))
           && (report_format_id != NULL)
           && (next != NULL)
           && ((strcmp (next, "get_report_formats") == 0)
               || (strcmp (next, "get_report_format") == 0)))
    return edit_report_format_omp (credentials, report_format_id, next,
                                   sort_field, sort_order);

  else if (!strcmp (cmd, "edit_settings"))
    return edit_settings_oap (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "edit_task"))
           && (task_id != NULL)
           && (next != NULL)
           && (overrides != NULL)
           && ((strcmp (next, "get_tasks") == 0)
               || (strcmp (next, "get_task") == 0)))
    return edit_task_omp (credentials, task_id, next, refresh_interval,
                          sort_field, sort_order,
                          overrides ? strcmp (overrides, "0") : 0);

  else if ((!strcmp (cmd, "edit_user")) && (name != NULL))
    return edit_user_oap (credentials, name);

  else if ((!strcmp (cmd, "export_config")) && (config_id != NULL))
    return export_config_omp (credentials, config_id, content_type,
                              content_disposition, response_size);

  else if ((!strcmp (cmd, "export_preference_file"))
           && (config_id != NULL)
           && (oid != NULL)
           && (preference_name != NULL))
    return export_preference_file_omp (credentials, config_id, oid, preference_name,
                                       content_type, content_disposition,
                                       response_size);

  else if ((!strcmp (cmd, "export_report_format"))
           && (report_format_id != NULL))
    return export_report_format_omp (credentials, report_format_id,
                                     content_type, content_disposition,
                                     response_size);

  else if (0 == strcmp (cmd, "get_agents")
           && ((agent_id == NULL && agent_format == NULL)
               || (agent_id && agent_format)))
    {
      char *html, *filename;

      if (agent_id == NULL)
        {
          get_agents_omp (credentials,
                          agent_id,
                          agent_format,
                          response_size,
                          sort_field,
                          sort_order,
                          &html,
                          NULL);
          return html;
        }

      if (get_agents_omp (credentials,
                          agent_id,
                          agent_format,
                          response_size,
                          NULL,
                          NULL,
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

  else if ((!strcmp (cmd, "get_escalator")) && (escalator_id != NULL))
    return get_escalator_omp (credentials, escalator_id, sort_field,
                              sort_order);

  else if ((!strcmp (cmd, "get_result")) && (result_id != NULL)
           && (task_id != NULL))
    return get_result_omp (credentials, result_id, task_id, name,
                           apply_overrides, NULL, report_id, first_result,
                           max_results, levels, search_phrase, notes, overrides,
                           min_cvss_base, result_hosts_only, sort_field,
                           sort_order, delta_report_id, delta_states);

  else if (!strcmp (cmd, "get_escalators"))
    return get_escalators_omp (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "get_lsc_credential")) && (lsc_credential_id != NULL))
    return get_lsc_credential_omp (credentials, lsc_credential_id, sort_field,
                                   sort_order);

  else if (!strcmp (cmd, "get_lsc_credentials")
           && ((lsc_credential_id == NULL && package_format == NULL)
               || (lsc_credential_id && package_format)))
    {
      char *html, *lsc_credential_login;

      if (lsc_credential_id == NULL)
        {
          get_lsc_credentials_omp (credentials,
                                   lsc_credential_id,
                                   package_format,
                                   response_size,
                                   sort_field,
                                   sort_order,
                                   &html,
                                   NULL);
          return html;
        }

      if (get_lsc_credentials_omp (credentials,
                                   lsc_credential_id,
                                   package_format,
                                   response_size,
                                   NULL,
                                   NULL,
                                   &html,
                                   &lsc_credential_login))
        return html;

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

  else if (!strcmp (cmd, "get_report"))
    {
      char *ret;
      unsigned int first, esc_first;
      unsigned int max, esc_max;
      gchar *content_type_omp;
      GString *levels_buffer, *delta_states_buffer;

      if (!first_result || sscanf (first_result, "%u", &first) != 1)
        first = 1;
      if (!max_results || sscanf (max_results, "%u", &max) != 1)
        max = RESULTS_PER_PAGE;

      if (!esc_first_result || sscanf (esc_first_result, "%u", &esc_first) != 1)
        esc_first = 1;
      if (!esc_max_results || sscanf (esc_max_results, "%u", &esc_max) != 1)
        esc_max = RESULTS_PER_PAGE;

      if (levels)
        levels_buffer = g_string_new (levels);
      else
        {
          levels_buffer = g_string_new ("");
          if (high) g_string_append (levels_buffer, "h");
          if (medium) g_string_append (levels_buffer, "m");
          if (low) g_string_append (levels_buffer, "l");
          if (log) g_string_append (levels_buffer, "g");
          if (false_positive) g_string_append (levels_buffer, "f");
        }

      if (delta_states)
        delta_states_buffer = g_string_new (delta_states);
      else
        {
          delta_states_buffer = g_string_new ("");
          if (changed) g_string_append (delta_states_buffer, "c");
          if (gone) g_string_append (delta_states_buffer, "g");
          if (new) g_string_append (delta_states_buffer, "n");
          if (same) g_string_append (delta_states_buffer, "s");
        }

      ret = get_report_omp (credentials, report_id, delta_report_id,
                            report_format_id,
                            response_size,
                            (const unsigned int) first,
                            (const unsigned int) max,
                            sort_field,
                            sort_order,
                            levels_buffer->str,
                            delta_states_buffer->str,
                            notes,
                            overrides,
                            result_hosts_only,
                            search_phrase,
                            min_cvss_base,
                            report_escalator_id,
                            (const unsigned int) esc_first,
                            (const unsigned int) esc_max,
                            esc_levels,
                            esc_notes,
                            esc_overrides,
                            esc_result_hosts_only,
                            esc_search_phrase,
                            esc_min_cvss_base,
                            result_id,
                            type,
                            &content_type_omp,
                            content_disposition);

      g_string_free (levels_buffer, TRUE);
      g_string_free (delta_states_buffer, TRUE);

      if (content_type_omp)
        {
          *content_type = GSAD_CONTENT_TYPE_DONE;
          *content_type_string = content_type_omp;
        }

      return ret;
    }

  else if ((!strcmp (cmd, "get_note"))
           && (note_id != NULL))
    return get_note_omp (credentials, note_id);

  else if ((!strcmp (cmd, "get_notes")))
    return get_notes_omp (credentials);

  else if ((!strcmp (cmd, "get_override"))
           && (override_id != NULL))
    return get_override_omp (credentials, override_id);

  else if ((!strcmp (cmd, "get_overrides")))
    return get_overrides_omp (credentials);

  else if ((!strcmp (cmd, "get_report_format")) && (report_format_id != NULL))
    return get_report_format_omp (credentials, report_format_id, sort_field,
                                  sort_order);

  else if (!strcmp (cmd, "get_report_formats"))
    return get_report_formats_omp (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_tasks"))
    return get_tasks_omp (credentials, NULL, sort_field, sort_order,
                          refresh_interval,
                          overrides ? strcmp (overrides, "0") : 0,
                          NULL);

  else if ((!strcmp (cmd, "get_schedule")) && (schedule_id != NULL))
    return get_schedule_omp (credentials, schedule_id, sort_field, sort_order);

  else if (!strcmp (cmd, "get_schedules"))
    return get_schedules_omp (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "get_slave")) && (slave_id != NULL))
    return get_slave_omp (credentials, slave_id, sort_field, sort_order);

  else if (!strcmp (cmd, "get_slaves"))
    return get_slaves_omp (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_system_reports"))
    return get_system_reports_omp (credentials,
                                   ((duration == NULL || (*duration == '\0'))
                                     ? "86400" : duration),
                                   ((slave_id == NULL || (*slave_id == '\0'))
                                     ? "0" : slave_id));

  else if ((!strcmp (cmd, "get_target")) && (target_id != NULL))
    return get_target_omp (credentials, target_id, sort_field, sort_order);

  else if (!strcmp (cmd, "get_targets"))
    return get_targets_omp (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_trash"))
    return get_trash_omp (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "get_user")) && (name != NULL))
    return get_user_oap (credentials, name);

  else if (!strcmp (cmd, "get_users"))
    return get_users_oap (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_feed"))
    return get_feed_oap (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_config"))
    return get_config_omp (credentials, config_id, 0);

  else if (!strcmp (cmd, "get_configs"))
    return get_configs_omp (credentials, sort_field, sort_order);

  else if (!strcmp (cmd, "get_config_family"))
    return get_config_family_omp (credentials, config_id, name, family,
                                  sort_field, sort_order, 0);

  else if (!strcmp (cmd, "get_config_nvt"))
    return get_config_nvt_omp (credentials, config_id, name, family, oid,
                               sort_field, sort_order, 0);

  else if ((!strcmp (cmd, "get_nvts")) && (oid != NULL))
    return get_nvts_omp (credentials, oid);

  else if (!strcmp (cmd, "get_settings"))
    return get_settings_oap (credentials, sort_field, sort_order);

  else if ((!strcmp (cmd, "new_note"))
           && (next != NULL)
           && (strcmp (next, "get_result") == 0)
           /* Note params. */
           && (oid != NULL)
           && (hosts != NULL)
           && (port != NULL)
           && (threat != NULL)
           && (task_id != NULL)
           && (result_id != NULL)
           /* get_report passthrough params. */
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    return new_note_omp (credentials, oid, hosts, port, threat, task_id, name,
                         result_id, "get_result", report_id, first_result,
                         max_results, sort_field, sort_order, levels, notes,
                         overrides, result_hosts_only, search_phrase,
                         min_cvss_base);

  else if ((!strcmp (cmd, "new_note"))
           && (next == NULL)
           /* Note params. */
           && (oid != NULL)
           && (hosts != NULL)
           && (port != NULL)
           && (threat != NULL)
           && (task_id != NULL)
           && (result_id != NULL)
           /* Report passthrough params. */
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    return new_note_omp (credentials, oid, hosts, port, threat, task_id,
                         name, result_id, NULL, report_id, first_result,
                         max_results, sort_field, sort_order, levels, notes,
                         overrides, result_hosts_only, search_phrase,
                         min_cvss_base);

  else if ((!strcmp (cmd, "new_override"))
           && (next != NULL)
           && (strcmp (next, "get_result") == 0)
           /* Override params. */
           && (oid != NULL)
           && (hosts != NULL)
           && (port != NULL)
           && (threat != NULL)
           && (task_id != NULL)
           && (result_id != NULL)
           /* Report passthrough params. */
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    return new_override_omp (credentials, oid, hosts, port, threat, task_id,
                             name, result_id, "get_result", report_id, first_result,
                             max_results, sort_field, sort_order, levels, notes,
                             overrides, result_hosts_only, search_phrase,
                             min_cvss_base);

  else if ((!strcmp (cmd, "new_override"))
           && (next == NULL)
           /* Override params. */
           && (oid != NULL)
           && (hosts != NULL)
           && (port != NULL)
           && (threat != NULL)
           && (task_id != NULL)
           && (result_id != NULL)
           /* Report passthrough params. */
           && (report_id != NULL)
           && (first_result != NULL)
           && (max_results != NULL)
           && (sort_field != NULL)
           && (sort_order != NULL)
           && (levels != NULL)
           && (notes != NULL)
           && (overrides != NULL)
           && (result_hosts_only != NULL)
           && (search_phrase != NULL)
           && (min_cvss_base != NULL))
    return new_override_omp (credentials, oid, hosts, port, threat, task_id,
                             name, result_id, NULL, report_id, first_result,
                             max_results, sort_field, sort_order, levels, notes,
                             overrides, result_hosts_only, search_phrase,
                             min_cvss_base);

  else if ((!strcmp (cmd, "verify_agent"))
           && (agent_id != NULL))
    return verify_agent_omp (credentials, agent_id);

  else if ((!strcmp (cmd, "verify_report_format"))
           && (report_format_id != NULL))
    return verify_report_format_omp (credentials, report_format_id);

  else
    return gsad_message (credentials,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occured inside GSA daemon. "
                         "Diagnostics: Unknown command.",
                         "/omp?cmd=get_tasks");
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

  /* Set up the expires param. */

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

  /* Add the cookie.
   *
   * Tim Brown's suggested cookie included a domain attribute.  How would
   * we get the domain in here?  Maybe a --domain option. */

  value = g_strdup_printf ("SID=%s; expires=%s; path=/; %sHTTPonly",
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

  value = g_strdup_printf ("SID=0; expires=%s; path=/; %sHTTPonly",
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
      char ctime_now[27];

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
      char *res = gsad_message (credentials,
                                "Invalid request", __FUNCTION__, __LINE__,
                                "The requested page does not exist.",
                                NULL);
      g_free (path);
      fclose (file);
      return MHD_create_response_from_data (strlen (res), (void *) res,
                                            MHD_NO, MHD_YES);
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
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      cookie = MHD_lookup_connection_value (connection,
                                            MHD_COOKIE_KIND,
                                            "SID");
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
          char ctime_now[27];
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
          char ctime_now[27];

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
      assert (user->token);
      credentials->username = strdup (user->username);
      credentials->password = strdup (user->password);
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
              gchar *page = g_strndup ((gchar *) &url[6], MAX_HELP_NAME_SIZE);
              // XXX: url subsearch could be nicer and xsl transform could
              // be generalized with the other transforms.
              time_t now;
              char ctime_now[27];
              gchar *xml;

              assert (credentials->token);

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              xml = g_markup_printf_escaped ("<envelope>"
                                             "<token>%s</token>"
                                             "<time>%s</time>"
                                             "<login>%s</login>"
                                             "<help><%s/></help>"
                                             "</envelope>",
                                             credentials->token,
                                             ctime_now,
                                             credentials->username,
                                             page);

              g_free (page);
              res = xsl_transform (xml);
            }
          response = MHD_create_response_from_data (strlen (res), res,
                                                    MHD_NO, MHD_YES);
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
                                         "SID");
      if (openvas_validate (validator, "token", sid))
        con_info->req_parms.cookie = NULL;
      else
        con_info->req_parms.cookie = g_strdup (sid);

      new_sid = NULL;
      ret = exec_omp_post (con_info, &user, &new_sid);

      if (ret == 1)
        {
          gchar *url;
          /* @todo Validate con_info->req_parms.text. */
          url = g_strdup_printf ("%s&token=%s",
                                 con_info->req_parms.text,
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
  if (check_is_dir (GSA_DATA_DIR) < 1)
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
      printf ("Copyright (C) 2010 Greenbone Networks GmbH\n");
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
