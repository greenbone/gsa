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
 * Copyright (C) 2009-2016 Greenbone Networks GmbH
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
 * \section copying License
 * \verbinclude COPYING
 *
 * \subsection copying_gplv2 GPLv2
 * \verbinclude COPYING.GPL
 *
 * \subsection copying_bsd3 BSD-3
 * \verbinclude COPYING.BSD3
 *
 * \subsection copying_mit MIT
 * \verbinclude COPYING.MIT
 */

/**
 * @brief The Glib fatal mask, redefined to leave out G_LOG_FLAG_RECURSION.
 */

#define _GNU_SOURCE /* for strcasecmp */

#include <arpa/inet.h>
#include <assert.h>
#include <errno.h>
#include <gcrypt.h>
#include <glib.h>
#include <gnutls/gnutls.h>
#include <langinfo.h>
#include <locale.h>
#include <netinet/in.h>
#include <openvas/misc/openvas_logging.h>
#include <openvas/base/openvas_file.h>
#include <openvas/base/openvas_networking.h>
#include <openvas/base/pidfile.h>
#include <openvas/omp/xml.h>
#include <openvas/misc/openvas_uuid.h>
#include <pthread.h>
#include <pwd.h> /* for getpwnam */
#include <grp.h> /* for setgroups */
#include <signal.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#if __linux
#include <sys/prctl.h>
#endif
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
/* This must follow the system includes. */
#include <microhttpd.h>

#include "gsad_base.h"
#include "gsad_omp.h"
#include "validator.h"
#include "xslt_i18n.h"

#ifdef GIT_REV_AVAILABLE
#include "gitrevision.h"
#endif

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad main"

#undef G_LOG_FATAL_MASK
#define G_LOG_FATAL_MASK G_LOG_LEVEL_ERROR

/**
 * @brief The symbol is deprecated, but older versions (0.9.37 - Debian
 * jessie) don't define it yet.
 */
#ifndef MHD_HTTP_NOT_ACCEPTABLE
#define MHD_HTTP_NOT_ACCEPTABLE MHD_HTTP_METHOD_NOT_ACCEPTABLE
#endif

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
#define MAX_FILE_NAME_SIZE 128

/**
 * @brief Max number of minutes between activity in a session.
 */
#define SESSION_TIMEOUT 15

/**
 * @brief Default value for client_watch_interval
 */
#define DEFAULT_CLIENT_WATCH_INTERVAL 1

/**
 * @brief Default face name.
 */
#define DEFAULT_GSAD_FACE "classic"

/**
 * @brief Default value for HTTP header "X-Frame-Options"
 */
#define DEFAULT_GSAD_X_FRAME_OPTIONS "SAMEORIGIN"

/**
 * @brief Default value for HTTP header "Content-Security-Policy"
 */
#define DEFAULT_GSAD_CONTENT_SECURITY_POLICY \
 "default-src 'self' 'unsafe-inline';"       \
 " img-src 'self' blob:;"                    \
 " frame-ancestors 'self'"

/**
 * @brief Default value for HTTP header "X-Frame-Options" for guest charts
 */
#define DEFAULT_GSAD_GUEST_CHART_X_FRAME_OPTIONS "SAMEORIGIN"

/**
 * @brief Default guest charts value for HTTP header "Content-Security-Policy"
 */
#define DEFAULT_GSAD_GUEST_CHART_CONTENT_SECURITY_POLICY \
 "default-src 'self' 'unsafe-inline';"                   \
 " img-src 'self' blob:;"                                \
 " frame-ancestors *"

/**
 * @brief Default "max-age" for HTTP header "Strict-Transport-Security"
 */
#define DEFAULT_GSAD_HSTS_MAX_AGE 31536000

/**
 * @brief Flag for signal handler.
 */
volatile int termination_signal = 0;

/**
 * @brief Libgcrypt thread callback definition for libgcrypt < 1.6.0.
 */
#if GCRYPT_VERSION_NUMBER < 0x010600
GCRY_THREAD_OPTION_PTHREAD_IMPL;
#endif

/**
 * @brief Title for "Page not found" messages.
 */
const char *NOT_FOUND_TITLE
  = "Invalid request";

/**
 * @brief Main message for "Page not found" messages.
 */
const char *NOT_FOUND_MESSAGE
  = "The requested page or file does not exist.";

/**
 * @brief Error page HTML.
 */
const char *ERROR_PAGE = "<html><body>HTTP Method not supported</body></html>";

/**
 * @brief Bad request error HTML.
 */
char *BAD_REQUEST_PAGE =
  "<html><body>Bad request.</body></html>";

/**
 * @brief Server error HTML.
 */
char *SERVER_ERROR =
  "<html><body>An internal server error has occurred.</body></html>";

/*
 * UTF-8 Error page HTML.
 */
#define UTF8_ERROR_PAGE(location) \
  "<html>"                                                            \
  "<head><title>Invalid request</title></head>"                       \
  "<body>The request contained invalid UTF-8 in " location ".</body>" \
  "</html>"

/*
 * Host HTTP header error page.
 */
#define HOST_HEADER_ERROR_PAGE \
  "<html>"                                                            \
  "<head><title>Invalid request</title></head>"                       \
  "<body>The request contained an unknown or invalid Host header."    \
  " If you are trying to access GSA via its hostname or a proxy,"     \
  " make sure GSA is set up to allow it."                             \
  "</body>"                                                           \
  "</html>"

/**
 * @brief The handle on the embedded HTTP daemon.
 */
struct MHD_Daemon *gsad_daemon;

/**
 * @brief The IP addresses of this program, "the GSAD".
 */
GSList *address_list = NULL;

/**
 * @brief Host names and IP accepted in the "Host" HTTP header
 */
GHashTable *gsad_header_hosts = NULL;

/**
 * @brief Location for redirection server.
 */
gchar *redirect_location = NULL;

/**
 * @brief PID of redirect child in parent, 0 in child.
 */
pid_t redirect_pid = 0;

/**
 * @brief PID of unix socket child in parent, 0 in child.
 */
pid_t unix_pid = 0;

/**
 * @brief Unix socket to listen on.
 */
int unix_socket = 0;

/** @todo Ensure the accesses to these are thread safe. */

/**
 * @brief Logging parameters, as passed to setup_log_handlers.
 */
GSList *log_config = NULL;

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
 * @brief Guest username.
 */
gchar *guest_username = NULL;

/**
 * @brief Guest password.
 */
gchar *guest_password = NULL;

/**
 * @brief User session data.
 */
GPtrArray *users = NULL;

/**
 * @brief Current value for HTTP header "X-Frame-Options"
 */
gchar *http_x_frame_options;

/**
 * @brief Current value for HTTP header "Content-Security-Policy"
 */
gchar *http_content_security_policy;

/**
 * @brief Current guest chart specific value for HTTP header "X-Frame-Options"
 */
gchar *http_guest_chart_x_frame_options;

/**
 * @brief Current guest chart value for HTTP header "Content-Security-Policy"
 */
gchar *http_guest_chart_content_security_policy;

/**
 * @brief Current value of for HTTP header "Strict-Transport-Security"
 */
gchar *http_strict_transport_security;

/**
 * @brief Current preference for using X_Real_IP from HTTP header
 */
gboolean ignore_http_x_real_ip;

/**
 * @brief Whether chroot is used
 */
int chroot_state = 0;

/**
 * @brief Interval in seconds to check whether client connection was closed.
 */
int client_watch_interval = DEFAULT_CLIENT_WATCH_INTERVAL;

/**
 * @brief Add security headers to a MHD response.
 */
void
add_security_headers (struct MHD_Response *response)
{
  if (strcmp (http_x_frame_options, ""))
    MHD_add_response_header (response, "X-Frame-Options",
                             http_x_frame_options);
  if (strcmp (http_content_security_policy, ""))
    MHD_add_response_header (response, "Content-Security-Policy",
                             http_content_security_policy);
  if (http_strict_transport_security)
    MHD_add_response_header (response, "Strict-Transport-Security",
                             http_strict_transport_security);
}

/**
 * @brief Add guest chart content security headers to a MHD response.
 */
void
add_guest_chart_content_security_headers (struct MHD_Response *response)
{
  if (strcmp (http_x_frame_options, ""))
    MHD_add_response_header (response, "X-Frame-Options",
                             http_guest_chart_x_frame_options);
  if (strcmp (http_content_security_policy, ""))
    MHD_add_response_header (response, "Content-Security-Policy",
                             http_guest_chart_content_security_policy);
}

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
  gchar *severity;     ///< Severity class.
  gchar *capabilities; ///< Capabilities.
  gchar *language;     ///< User Interface Language, in short form like "en".
  gchar *pw_warning;   ///< Password policy warning.
  char *address;       ///< Client's IP address.
  time_t time;         ///< Login time.
  int charts;          ///< Whether to show charts for this user.
  GTree *chart_prefs;  ///< Chart preferences.
  gchar *autorefresh; ///< Auto-Refresh interval
  GTree *last_filt_ids;///< Last used filter ids.
  int guest;           ///< Whether the user is a guest.
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
 * Creates and initializes a user object with given parameters
 *
 * It's up to the caller to release the returned user.
 *
 * @param[in]  username      Name of user.
 * @param[in]  password      Password for user.
 * @param[in]  timezone      Timezone of user.
 * @param[in]  severity      Severity class setting of user.
 * @param[in]  role          Role of user.
 * @param[in]  capabilities  Capabilities of manager.
 * @param[in]  language      User Interface Language (language name or code)
 * @param[in]  pw_warning    Password policy warning.
 * @param[in]  chart_prefs   The chart preferences.
 * @param[in]  autorefresh   The autorefresh preference.
 * @param[in]  address       Client's IP address.
 *
 * @return Added user.
 */
user_t *
user_add (const gchar *username, const gchar *password, const gchar *timezone,
          const gchar *severity, const gchar *role, const gchar *capabilities,
          const gchar *language, const gchar *pw_warning, GTree *chart_prefs,
          const gchar *autorefresh, const char *address)
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
          if (time (NULL) - item->time > (session_timeout * 60))
            g_ptr_array_remove (users, (gpointer) item);
        }
    }
  user = g_malloc (sizeof (user_t));
  user->cookie = openvas_uuid_make ();
  user->token = openvas_uuid_make ();
  user->username = g_strdup (username);
  user->password = g_strdup (password);
  user->role = g_strdup (role);
  user->timezone = g_strdup (timezone);
  user->severity = g_strdup (severity);
  user->capabilities = g_strdup (capabilities);
  user->pw_warning = pw_warning ? g_strdup (pw_warning) : NULL;
  user->chart_prefs = chart_prefs;
  user->autorefresh = g_strdup (autorefresh);
  user->last_filt_ids = g_tree_new_full ((GCompareDataFunc) g_strcmp0,
                                         NULL, g_free, g_free);
  g_ptr_array_add (users, (gpointer) user);
  set_language_code (&user->language, language);
  user->time = time (NULL);
  user->charts = 0;
  if (guest_username)
    user->guest = strcmp (username, guest_username) ? 0 : 1;
  else
    user->guest = 0;
  user->address = g_strdup (address);
  return user;
}

#define USER_OK 0
#define USER_BAD_TOKEN 1
#define USER_EXPIRED_TOKEN 2
#define USER_BAD_MISSING_COOKIE 3
#define USER_BAD_MISSING_TOKEN 4
#define USER_GUEST_LOGIN_FAILED 5
#define USER_OMP_DOWN 6
#define USER_IP_ADDRESS_MISSMATCH 7
#define USER_GUEST_LOGIN_ERROR -1

/**
 * @brief Find a user, given a token and cookie.
 *
 * If a user is returned, it's up to the caller to release the user.
 *
 * @param[in]   cookie       Token in cookie.
 * @param[in]   token        Token request parameter.
 * @param[in]   address      Client's IP address.
 * @param[out]  user_return  User.
 *
 * @return 0 ok (user in user_return), 1 bad token, 2 expired token,
 *         3 bad/missing cookie, 4 bad/missing token, 5 guest login failed,
 *         6 OMP down for guest login, 7 IP address mismatch, -1 error during
 *         guest login.
 */
int
user_find (const gchar *cookie, const gchar *token, const char *address,
           user_t **user_return)
{
  int ret;
  user_t *user = NULL;
  int index;
  if (token == NULL)
    return USER_BAD_MISSING_TOKEN;

  if (guest_username && token && (strcmp (token, "guest") == 0))
    {
      int ret;
      gchar *timezone, *role, *capabilities, *severity, *language;
      gchar *pw_warning, *autorefresh;
      GTree *chart_prefs;

      if (cookie)
        {
          /* Look for an existing guest user from the same browser (that is,
           * with the same cookie). */

          g_mutex_lock (mutex);
          for (index = 0; index < users->len; index++)
            {
              user_t *item;
              item = (user_t*) g_ptr_array_index (users, index);
              if (item->guest && (strcmp (item->cookie, cookie) == 0))
                {
                  user = item;
                  break;
                }
            }
          if (user)
            {
              *user_return = user;
              user->time = time (NULL);
              return USER_OK;
            }
          g_mutex_unlock (mutex);
        }

      /* Log in as guest. */

      ret = authenticate_omp (guest_username,
                              guest_password,
                              &role,
                              &timezone,
                              &severity,
                              &capabilities,
                              &language,
                              &pw_warning,
                              &chart_prefs,
                              &autorefresh);
      if (ret == 1)
        return USER_GUEST_LOGIN_FAILED;
      else if (ret == 2)
        return USER_OMP_DOWN;
      else if (ret == -1)
        return USER_GUEST_LOGIN_ERROR;
      else
        {
          user_t *user;
          user = user_add (guest_username, guest_password, timezone, severity,
                           role, capabilities, language, pw_warning,
                           chart_prefs, autorefresh, address);
          *user_return = user;
          g_free (timezone);
          g_free (severity);
          g_free (capabilities);
          g_free (language);
          g_free (role);
          g_free (pw_warning);
          g_free (autorefresh);
          return USER_OK;
        }
    }

  g_mutex_lock (mutex);
  ret = USER_OK;
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
                ret = USER_EXPIRED_TOKEN;
              else
                ret = USER_BAD_MISSING_COOKIE;
              break;
            }
          user = item;
          break;
        }
    }
  if (user)
    {
      /* Verify that the user address matches the client's address. */
      if (strcmp (address, user->address))
        ret = USER_IP_ADDRESS_MISSMATCH;
      else if (time (NULL) - user->time > (session_timeout * 60))
        ret = USER_EXPIRED_TOKEN;
      else
        {
          *user_return = user;
          user->time = time (NULL);
          /* FIXME mutex is not unlocked */
          return USER_OK;
        }
    }
  else if (ret == 0)
    /* should it be really USER_EXPIRED_TOKEN?
     * No user has been found therefore the token couldn't even expire */
    ret = USER_EXPIRED_TOKEN;
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set timezone of user.
 *
 * @param[in]   token     User token.
 * @param[in]   timezone  Timezone.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_timezone (const gchar *token, const gchar *timezone)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
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
 * @param[in]   token     User token.
 * @param[in]   password  Password.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_password (const gchar *token, const gchar *password)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          g_free (item->password);
          g_free (item->pw_warning);
          item->password = g_strdup (password);
          item->pw_warning = NULL;
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set severity class of user.
 *
 * @param[in]   token     User token.
 * @param[in]   severity  Severity class.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_severity (const gchar *token, const gchar *severity)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          g_free (item->severity);
          item->severity = g_strdup (severity);
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set language of user.
 *
 * @param[in]   token     User token.
 * @param[in]   language  Language.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_language (const gchar *token, const gchar *language)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          g_free (item->language);
          set_language_code (&item->language, language);
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set charts setting of user.
 *
 * @param[in]   token      User token.
 * @param[in]   charts    Whether to show charts.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_charts (const gchar *token, const int charts)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          item->charts = charts;
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set a chart preference of a user.
 *
 * @param[in]   token       User token.
 * @param[in]   pref_id     ID of the chart preference.
 * @param[in]   pref_value  Preference value to set.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_chart_pref (const gchar *token, gchar* pref_id, gchar *pref_value)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          g_tree_replace (item->chart_prefs,
                          pref_id, pref_value);
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Set default autorefresh interval of user.
 *
 * @param[in]   token        User token.
 * @param[in]   autorefresh  Autorefresh interval.
 *
 * @return 0 ok, 1 failed to find user.
 */
int
user_set_autorefresh (const gchar *token, const gchar *autorefresh)
{
  int index, ret;
  ret = 1;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->token, token) == 0)
        {
          g_free (item->autorefresh);
          item->autorefresh = g_strdup (autorefresh);
          ret = 0;
          break;
        }
    }
  g_mutex_unlock (mutex);
  return ret;
}

/**
 * @brief Logs out all sessions of a given user, except the current one.
 *
 * @param[in]   username        User name.
 * @param[in]   credentials     Current user's credentials.
 *
 * @return 0 ok, -1 error.
 */
int
user_logout_all_sessions (const gchar *username, credentials_t *credentials)
{
  int index;
  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->username, username) == 0
          && strcmp (item->token, credentials->token))
        {
          g_debug ("%s: logging out user '%s', token '%s'",
                   __FUNCTION__, item->username, item->token);
          g_ptr_array_remove (users, (gpointer) item);
          index --;
        }
    }
  g_mutex_unlock (mutex);

  return 0;
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
 * @brief Find a user, given a token.
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
 * @param[in]  token  User's token.
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
                         "^((bulk_delete)"
                         "|(clone)"
                         "|(create_agent)"
                         "|(create_asset)"
                         "|(create_config)"
                         "|(create_container_task)"
                         "|(create_credential)"
                         "|(create_alert)"
                         "|(create_filter)"
                         "|(create_group)"
                         "|(create_host)"
                         "|(create_note)"
                         "|(create_override)"
                         "|(create_permission)"
                         "|(create_permissions)"
                         "|(create_port_list)"
                         "|(create_port_range)"
                         "|(create_report)"
                         "|(create_role)"
                         "|(create_scanner)"
                         "|(create_schedule)"
                         "|(create_tag)"
                         "|(create_target)"
                         "|(create_task)"
                         "|(cvss_calculator)"
                         "|(create_user)"
                         "|(dashboard)"
                         "|(delete_agent)"
                         "|(delete_asset)"
                         "|(delete_config)"
                         "|(delete_credential)"
                         "|(delete_alert)"
                         "|(delete_filter)"
                         "|(delete_group)"
                         "|(delete_note)"
                         "|(delete_override)"
                         "|(delete_permission)"
                         "|(delete_port_list)"
                         "|(delete_port_range)"
                         "|(delete_report)"
                         "|(delete_report_format)"
                         "|(delete_role)"
                         "|(delete_scanner)"
                         "|(delete_schedule)"
                         "|(delete_tag)"
                         "|(delete_target)"
                         "|(delete_task)"
                         "|(delete_trash_agent)"
                         "|(delete_trash_config)"
                         "|(delete_trash_alert)"
                         "|(delete_trash_credential)"
                         "|(delete_trash_filter)"
                         "|(delete_trash_group)"
                         "|(delete_trash_note)"
                         "|(delete_trash_override)"
                         "|(delete_trash_permission)"
                         "|(delete_trash_port_list)"
                         "|(delete_trash_report_format)"
                         "|(delete_trash_role)"
                         "|(delete_trash_scanner)"
                         "|(delete_trash_schedule)"
                         "|(delete_trash_tag)"
                         "|(delete_trash_target)"
                         "|(delete_trash_task)"
                         "|(delete_user)"
                         "|(delete_user_confirm)"
                         "|(download_agent)"
                         "|(download_credential)"
                         "|(download_ssl_cert)"
                         "|(download_ca_pub)"
                         "|(download_key_pub)"
                         "|(edit_agent)"
                         "|(edit_alert)"
                         "|(edit_asset)"
                         "|(edit_config)"
                         "|(edit_config_family)"
                         "|(edit_config_nvt)"
                         "|(edit_credential)"
                         "|(edit_filter)"
                         "|(edit_group)"
                         "|(edit_my_settings)"
                         "|(edit_note)"
                         "|(edit_override)"
                         "|(edit_permission)"
                         "|(edit_port_list)"
                         "|(edit_report_format)"
                         "|(edit_role)"
                         "|(edit_scanner)"
                         "|(edit_schedule)"
                         "|(edit_tag)"
                         "|(edit_target)"
                         "|(edit_task)"
                         "|(edit_user)"
                         "|(auth_settings)"
                         "|(empty_trashcan)"
                         "|(alert_report)"
                         "|(export_agent)"
                         "|(export_agents)"
                         "|(export_alert)"
                         "|(export_alerts)"
                         "|(export_asset)"
                         "|(export_assets)"
                         "|(export_config)"
                         "|(export_configs)"
                         "|(export_credential)"
                         "|(export_credentials)"
                         "|(export_filter)"
                         "|(export_filters)"
                         "|(export_group)"
                         "|(export_groups)"
                         "|(export_note)"
                         "|(export_notes)"
                         "|(export_omp_doc)"
                         "|(export_override)"
                         "|(export_overrides)"
                         "|(export_permission)"
                         "|(export_permissions)"
                         "|(export_port_list)"
                         "|(export_port_lists)"
                         "|(export_preference_file)"
                         "|(export_report_format)"
                         "|(export_report_formats)"
                         "|(export_result)"
                         "|(export_results)"
                         "|(export_role)"
                         "|(export_roles)"
                         "|(export_scanner)"
                         "|(export_scanners)"
                         "|(export_schedule)"
                         "|(export_schedules)"
                         "|(export_tag)"
                         "|(export_tags)"
                         "|(export_target)"
                         "|(export_targets)"
                         "|(export_task)"
                         "|(export_tasks)"
                         "|(export_user)"
                         "|(export_users)"
                         "|(get_agent)"
                         "|(get_agents)"
                         "|(get_aggregate)"
                         "|(get_asset)"
                         "|(get_assets)"
                         "|(get_assets_chart)"
                         "|(get_config)"
                         "|(get_config_family)"
                         "|(get_config_nvt)"
                         "|(get_configs)"
                         "|(get_feeds)"
                         "|(get_credential)"
                         "|(get_credentials)"
                         "|(get_filter)"
                         "|(get_filters)"
                         "|(get_alert)"
                         "|(get_alerts)"
                         "|(get_group)"
                         "|(get_groups)"
                         "|(get_info)"
                         "|(get_my_settings)"
                         "|(get_note)"
                         "|(get_notes)"
                         "|(get_nvts)"
                         "|(get_override)"
                         "|(get_overrides)"
                         "|(get_permission)"
                         "|(get_permissions)"
                         "|(get_port_list)"
                         "|(get_port_lists)"
                         "|(get_protocol_doc)"
                         "|(get_report)"
                         "|(get_reports)"
                         "|(get_report_format)"
                         "|(get_report_formats)"
                         "|(get_report_section)"
                         "|(get_result)"
                         "|(get_results)"
                         "|(get_role)"
                         "|(get_roles)"
                         "|(get_scanner)"
                         "|(get_scanners)"
                         "|(get_schedule)"
                         "|(get_schedules)"
                         "|(get_system_reports)"
                         "|(get_tag)"
                         "|(get_tags)"
                         "|(get_target)"
                         "|(get_targets)"
                         "|(get_task)"
                         "|(get_tasks)"
                         "|(get_tasks_chart)"
                         "|(get_trash)"
                         "|(get_user)"
                         "|(get_users)"
                         "|(import_config)"
                         "|(import_port_list)"
                         "|(import_report)"
                         "|(import_report_format)"
                         "|(login)"
                         "|(move_task)"
                         "|(new_agent)"
                         "|(new_alert)"
                         "|(new_config)"
                         "|(new_container_task)"
                         "|(new_credential)"
                         "|(new_filter)"
                         "|(new_group)"
                         "|(new_host)"
                         "|(new_note)"
                         "|(new_override)"
                         "|(new_permission)"
                         "|(new_permissions)"
                         "|(new_port_list)"
                         "|(new_port_range)"
                         "|(new_report_format)"
                         "|(new_role)"
                         "|(new_scanner)"
                         "|(new_schedule)"
                         "|(new_tag)"
                         "|(new_target)"
                         "|(new_task)"
                         "|(new_user)"
                         "|(process_bulk)"
                         "|(restore)"
                         "|(resume_task)"
                         "|(run_wizard)"
                         "|(test_alert)"
                         "|(save_agent)"
                         "|(save_alert)"
                         "|(save_asset)"
                         "|(save_auth)"
                         "|(save_chart_preference)"
                         "|(save_config)"
                         "|(save_config_family)"
                         "|(save_config_nvt)"
                         "|(save_container_task)"
                         "|(save_credential)"
                         "|(save_filter)"
                         "|(save_group)"
                         "|(save_my_settings)"
                         "|(save_note)"
                         "|(save_override)"
                         "|(save_permission)"
                         "|(save_port_list)"
                         "|(save_report_format)"
                         "|(save_role)"
                         "|(save_scanner)"
                         "|(save_schedule)"
                         "|(save_tag)"
                         "|(save_target)"
                         "|(save_task)"
                         "|(save_user)"
                         "|(start_task)"
                         "|(stop_task)"
                         "|(sync_feed)"
                         "|(sync_scap)"
                         "|(sync_cert)"
                         "|(sync_config)"
                         "|(toggle_tag)"
                         "|(upload_config)"
                         "|(upload_port_list)"
                         "|(upload_report)"
                         "|(verify_agent)"
                         "|(verify_report_format)"
                         "|(verify_scanner)"
                         "|(wizard)"
                         "|(wizard_get))$");

  openvas_validator_add (validator, "action_message", "(?s)^.*$");
  openvas_validator_add (validator, "action_status", "(?s)^.*$");
  openvas_validator_add (validator, "active", "^(-1|-2|[0-9]+)$");
  openvas_validator_add (validator, "agent_format", "^(installer)$");
  openvas_validator_add (validator, "agent_id",     "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "aggregate_mode", "^[a-z0-9_]+$");
  openvas_validator_add (validator, "aggregate_type", "^(agent|alert|config|credential|filter|group|host|nvt|note|os|override|permission|port_list|report|report_format|result|role|scanner|schedule|tag|target|task|user|allinfo|cve|cpe|ovaldef|cert_bund_adv|dfn_cert_adv)$");
  openvas_validator_add (validator, "alive_tests", "^(Scan Config Default|ICMP Ping|TCP-ACK Service Ping|TCP-SYN Service Ping|ARP Ping|ICMP & TCP-ACK Service Ping|ICMP & ARP Ping|TCP-ACK Service & ARP Ping|ICMP, TCP-ACK Service & ARP Ping|Consider Alive)$");
  openvas_validator_add (validator, "apply_filter", "^(no|no_pagination|full)$");
  openvas_validator_add (validator, "asset_name",   "(?s)^.*$");
  openvas_validator_add (validator, "asset_type",   "^(host|os)$");
  openvas_validator_add (validator, "asset_id",     "^([[:alnum:]-_.:\\/~()']|&amp;)+$");
  openvas_validator_add (validator, "auth_algorithm",   "^(md5|sha1)$");
  openvas_validator_add (validator, "auth_method",  "^(0|1|2)$");
  /* Defined in RFC 2253. */
  openvas_validator_add (validator, "authdn",       "^.{0,200}%s.{0,200}$");
  openvas_validator_add (validator, "auto_delete",       "^(no|keep)$");
  openvas_validator_add (validator, "auto_delete_data",  "^(.*){0,10}$");
  openvas_validator_add (validator, "autofp",       "^(0|1|2)$");
  openvas_validator_add (validator, "autofp_value", "^(1|2)$");
  openvas_validator_add (validator, "boolean",    "^(0|1)$");
  openvas_validator_add (validator, "bulk_selected:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "bulk_selected:value", "(?s)^.*$");
  openvas_validator_add (validator, "caller",     "^.*$");
  openvas_validator_add (validator, "certificate",   "(?s)^.*$");
  openvas_validator_add (validator, "chart_gen:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "chart_gen:value", "(?s)^.*$");
  openvas_validator_add (validator, "chart_init:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "chart_init:value", "(?s)^.*$");
  openvas_validator_add (validator, "chart_preference_id", "^(.*){0,400}$");
  openvas_validator_add (validator, "chart_preference_value", "^(.*){0,400}$");
  openvas_validator_add (validator, "comment",    "^[-_;':()@[:alnum:]äüöÄÜÖß, \\./]{0,400}$");
  openvas_validator_add (validator, "config_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "osp_config_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "condition",  "^[[:alnum:] ]{0,100}$");
  openvas_validator_add (validator, "credential_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "create_credentials_type", "^(gen|pass|key)$");
  openvas_validator_add (validator, "credential_login", "^[-_[:alnum:]\\.@\\\\]{0,40}$");
  openvas_validator_add (validator, "condition_data:name", "^(.*){0,400}$");
  openvas_validator_add (validator, "condition_data:value", "(?s)^.*$");
  openvas_validator_add (validator, "cvss_av",       "^(L|A|N)$");
  openvas_validator_add (validator, "cvss_ac",       "^(H|M|L)$");
  openvas_validator_add (validator, "cvss_au",       "^(M|S|N)$");
  openvas_validator_add (validator, "cvss_c",       "^(N|P|C)$");
  openvas_validator_add (validator, "cvss_i",       "^(N|P|C)$");
  openvas_validator_add (validator, "cvss_a",       "^(N|P|C)$");
  openvas_validator_add (validator, "cvss_vector",       "^AV:(L|A|N)/AC:(H|M|L)/A(u|U):(M|S|N)/C:(N|P|C)/I:(N|P|C)/A:(N|P|C)$");
  openvas_validator_add (validator, "min_qod", "^(|100|[1-9]?[0-9]|)$");
  openvas_validator_add (validator, "day_of_month", "^(0??[1-9]|[12][0-9]|30|31)$");
  openvas_validator_add (validator, "days",         "^(-1|[0-9]+)$");
  openvas_validator_add (validator, "data_column", "^[_[:alnum:]]{1,80}$");
  openvas_validator_add (validator, "data_columns:name",  "^[0123456789]{1,5}$");
  openvas_validator_add (validator, "data_columns:value", "^[_[:alnum:]]{1,80}$");
  openvas_validator_add (validator, "default_severity", "^(|10\\.0|[0-9]\\.[0-9])$");
  openvas_validator_add (validator, "delta_states", "^(c|g|n|s){0,4}$");
  openvas_validator_add (validator, "details_fname", "^([[:alnum:]_-]|%[%CcDFMmNTtUu])+$");
  openvas_validator_add (validator, "domain",     "^[-[:alnum:]\\.]{1,80}$");
  openvas_validator_add (validator, "email",      "^[^@ ]{1,150}@[^@ ]{1,150}$");
  openvas_validator_add (validator, "email_list", "^[^@ ]{1,150}@[^@ ]{1,150}(, *[^@ ]{1,150}@[^@ ]{1,150})*$");
  openvas_validator_add (validator, "alert_id",   "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "alert_id_optional", "^(--|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "event_data:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "event_data:value", "(?s)^.*$");
  openvas_validator_add (validator, "family",     "^[-_[:alnum:] :.]{1,200}$");
  openvas_validator_add (validator, "family_page", "^[-_[:alnum:] :.]{1,200}$");
  openvas_validator_add (validator, "file",         "(?s)^.*$");
  openvas_validator_add (validator, "file:name",    "^.*[[0-9abcdefABCDEF\\-]{1,40}]:.*$");
  openvas_validator_add (validator, "file:value",   "^yes$");
  openvas_validator_add (validator, "settings_changed:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "settings_changed:value", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "settings_default:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "settings_default:value", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "settings_filter:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "settings_filter:value", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "first",        "^[0-9]+$");
  openvas_validator_add (validator, "first_group", "^[0-9]+$");
  openvas_validator_add (validator, "first_result", "^[0-9]+$");
  openvas_validator_add (validator, "filter",       "^(.*){0,1000}$");
  openvas_validator_add (validator, "format_id", "^[a-z0-9\\-]+$");
  /* Validator for  save_auth group, e.g. "method:ldap_connect". */
  openvas_validator_add (validator, "group",        "^method:(ldap_connect|radius_connect)$");
  openvas_validator_add (validator, "group_column", "^[_[:alnum:]]{1,80}$");
  openvas_validator_add (validator, "max",          "^(-?[0-9]+|)$");
  openvas_validator_add (validator, "max_results",  "^[0-9]+$");
  openvas_validator_add (validator, "format",     "^[-[:alnum:]]{1,15}$");
  openvas_validator_add (validator, "host",       "^[[:alnum:]:\\.]{1,80}$");
  openvas_validator_add (validator, "hostport",   "^[-[:alnum:]\\. :]{1,80}$");
  openvas_validator_add (validator, "hostpath",   "^[-[:alnum:]\\. :/]{1,80}$");
  openvas_validator_add (validator, "hosts",      "^[-[:alnum:],: \\./]+$");
  openvas_validator_add (validator, "hosts_allow", "^(0|1)$");
  openvas_validator_add (validator, "hosts_opt",  "^[-[:alnum:], \\./]*$");
  openvas_validator_add (validator, "hosts_ordering", "^(sequential|random|reverse)$");
  openvas_validator_add (validator, "hour",        "^([01]?[0-9]|2[0-3])$");
  openvas_validator_add (validator, "howto_use",   "(?s)^.*$");
  openvas_validator_add (validator, "howto_install",  "(?s)^.*$");
  openvas_validator_add (validator, "id",             "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "id_optional",    "^(--|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "id_or_empty",    "^(|[a-z0-9\\-]+)$");
  openvas_validator_add (validator, "id_list:name",    "^ *[0-9]+ *$");
  openvas_validator_add (validator, "id_list:value",    "^[[:alnum:]\\-_ ]+:[a-z0-9\\-]+$");
  openvas_validator_add (validator, "ifaces_allow", "^(0|1)$");
  openvas_validator_add (validator, "include_id_list:name",  "^[[:alnum:]\\-_ ]+$");
  openvas_validator_add (validator, "include_id_list:value", "^(0|1)$");
  openvas_validator_add (validator, "installer",      "(?s)^.*$");
  openvas_validator_add (validator, "installer_sig",  "(?s)^.*$");
  openvas_validator_add (validator, "lang",
                         "^(Browser Language|"
                         "([a-z]{2,3})(_[A-Z]{2})?(@[[:alnum:]_-]+)?"
                         "(:([a-z]{2,3})(_[A-Z]{2})?(@[[:alnum:]_-]+)?)*)$");
  openvas_validator_add (validator, "levels",       "^(h|m|l|g|f){0,5}$");
  openvas_validator_add (validator, "list_fname", "^([[:alnum:]_-]|%[%CcDFMmNTtUu])+$");
  /* Used for users, credentials, and scanner login name. */
  openvas_validator_add (validator, "login",      "^[[:alnum:]-_@.]+$");
  openvas_validator_add (validator, "lsc_password", "^.{0,40}$");
  openvas_validator_add (validator, "max_result", "^[0-9]+$");
  openvas_validator_add (validator, "max_groups", "^-?[0-9]+$");
  openvas_validator_add (validator, "minute",     "^[0-5]{0,1}[0-9]{1,1}$");
  openvas_validator_add (validator, "month",      "^((0??[1-9])|1[012])$");
  openvas_validator_add (validator, "note_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "note_result_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "override_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "override_result_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "name",       "^[#-_[:alnum:], \\./]{1,80}$");
  openvas_validator_add (validator, "info_name",  "(?s)^.*$");
  openvas_validator_add (validator, "info_type",  "(?s)^.*$");
  openvas_validator_add (validator, "info_id",  "^([[:alnum:]-_.:\\/~()']|&amp;)+$");
  openvas_validator_add (validator, "details", "^[0-1]$");
  /* Number is special cased in params_mhd_validate to remove the space. */
  openvas_validator_add (validator, "number",     "^ *[0-9]+ *$");
  openvas_validator_add (validator, "optional_number", "^[0-9]*$");
  openvas_validator_add (validator, "oid",        "^([0-9.]{1,80}|CVE-[-0-9]{1,14})$");
  openvas_validator_add (validator, "page",       "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "package_format", "^(pem|key|rpm|deb|exe)$");
  openvas_validator_add (validator, "password",   "^.{0,40}$");
  openvas_validator_add (validator, "password:value", "(?s)^.*$");
  openvas_validator_add (validator, "port",       "^.{1,60}$");
  openvas_validator_add (validator, "port_range", "^((default)|([-0-9, TU:]{1,400}))$");
  openvas_validator_add (validator, "port_type", "^(tcp|udp)$");
  /** @todo Better regex. */
  openvas_validator_add (validator, "preference_name", "^(.*){0,400}$");
  openvas_validator_add (validator, "preference:name",  "^([^[]*\\[[^]]*\\]:.*){0,400}$");
  openvas_validator_add (validator, "preference:value", "(?s)^.*$");
  openvas_validator_add (validator, "prev_action", "(?s)^.*$");
  openvas_validator_add (validator, "privacy_algorithm",   "^(aes|des|)$");
  openvas_validator_add (validator, "private_key",      "(?s)^.*$");
  openvas_validator_add (validator, "protocol_format",  "^(html|rnc|xml)$");
  openvas_validator_add (validator, "pw",         "^[[:alnum:]]{1,10}$");
  openvas_validator_add (validator, "xml_file",   "(?s)^.*$");
  openvas_validator_add (validator, "definitions_file",   "(?s)^.*$");
  openvas_validator_add (validator, "ca_pub",   "(?s)^.*$");
  openvas_validator_add (validator, "which_cert",   "^(default|existing|new)$");
  openvas_validator_add (validator, "key_pub",   "(?s)^.*$");
  openvas_validator_add (validator, "key_priv",   "(?s)^.*$");
  openvas_validator_add (validator, "radiuskey",   "^.{0,40}$");
  openvas_validator_add (validator, "range_type", "^(duration|until_end|from_start|start_to_end)$");
  openvas_validator_add (validator, "related:name",  "^(.*){0,400}$");
  openvas_validator_add (validator, "related:value", "^(.*){0,400}$");
  openvas_validator_add (validator, "report_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "report_fname", "^([[:alnum:]_-]|%[%CcDFMmNTtUu])+$");
  openvas_validator_add (validator, "report_format_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "report_section",
                                    "^(summary|results|hosts|ports"
                                    "|closed_cves|vulns|os|apps|errors"
                                    "|topology|ssl_certs|cves)$");
  openvas_validator_add (validator, "result_id",        "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "role",             "^[[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "optional_task_id", "^[a-z0-9\\-]*$");
  openvas_validator_add (validator, "permission",       "^([_a-z]{1,1000}|Super)$");
  openvas_validator_add (validator, "port_list_id",     "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "port_range_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "resource_type",
                         "^(agent|alert|asset|config|credential|filter|group|host|nvt|note|os|override|permission|port_list|report|report_format|result|role|scanner|schedule|tag|target|task|user|info|cve|cpe|ovaldef|cert_bund_adv|dfn_cert_adv|"
                         "Agent|Alert|Asset|Config|Credential|Filter|Group|Host|Note|NVT|Operating System|Override|Permission|Port List|Report|Report Format|Result|Role|Scanner|Schedule|Tag|Target|Task|User|SecInfo|CVE|CPE|OVAL Definition|CERT-Bund Advisory|DFN-CERT Advisory)$");
  openvas_validator_add (validator, "resource_id",    "^[[:alnum:]-_.:\\/~]*$");
  openvas_validator_add (validator, "optional_resource_type",
                         "^(agent|alert|asset|config|credential|filter|group|host|note|nvt|os|override|permission|port_list|report|report_format|result|role|scanner|schedule|tag|target|task|user|info|"
                         "Agent|Alert|Asset|Config|Credential|Filter|Group|Host|Note|NVT|Operating System|Override|Permission|Port List|Report|Report Format|Result|Role|Scanner|Schedule|Tag|Target|Task|User|SecInfo|)$");
  openvas_validator_add (validator, "select:value", "^(.*){0,400}$");
  openvas_validator_add (validator, "ssl_cert",        "^(.*){0,2000}$");
  openvas_validator_add (validator, "method_data:name", "^(.*){0,400}$");
  openvas_validator_add (validator, "method_data:value", "(?s)^.*$");
  openvas_validator_add (validator, "nvt:name",          "(?s)^.*$");
  openvas_validator_add (validator, "restrict_credential_type", "^[a-z0-9\\_|]+$");
  openvas_validator_add (validator, "subject_type",  "^(group|role|user)$");
  openvas_validator_add (validator, "summary",    "^.{0,400}$");
  openvas_validator_add (validator, "tag_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "tag_name",       "^[\\:-_[:alnum:], \\./]{1,80}$");
  openvas_validator_add (validator, "tag_value",       "^[\\-_@[:alnum:], \\./]{0,200}$");
  openvas_validator_add (validator, "target_id",  "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "task_id",    "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "term",       "^.{0,1000}");
  openvas_validator_add (validator, "text",       "^.{0,1000}");
  openvas_validator_add (validator, "text_columns:name",  "^[0123456789]{1,5}$");
  openvas_validator_add (validator, "text_columns:value", "^[_[:alnum:]]{1,80}$");
  openvas_validator_add (validator, "threat",     "^(High|Medium|Low|Alarm|Log|False Positive|)$");
  openvas_validator_add (validator, "trend",       "^(0|1)$");
  openvas_validator_add (validator, "trend:value", "^(0|1)$");
  openvas_validator_add (validator, "type",       "^(assets|prognostic)$");
  openvas_validator_add (validator, "search_phrase", "^[[:alnum:][:punct:] äöüÄÖÜß]{0,400}$");
  openvas_validator_add (validator, "sort_field", "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "sort_order", "^(ascending|descending)$");
  openvas_validator_add (validator, "sort_stat", "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "sort_fields:name", "^[0123456789]{1,5}$");
  openvas_validator_add (validator, "sort_fields:value", "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "sort_orders:name", "^[0123456789]{1,5}$");
  openvas_validator_add (validator, "sort_orders:value", "^(ascending|descending)$");
  openvas_validator_add (validator, "sort_stats:name", "^[0123456789]{1,5}$");
  openvas_validator_add (validator, "sort_stats:value", "^[_[:alnum:] ]{1,40}$");
  openvas_validator_add (validator, "target_source", "^(asset_hosts|file|import|manual)$");
  openvas_validator_add (validator, "timezone",      "^.{0,1000}$");
  openvas_validator_add (validator, "token", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "scanner_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "cve_scanner_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "osp_scanner_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "schedule_id", "^[a-z0-9\\-]+$");
  openvas_validator_add (validator, "severity", "^(-1(\\.0)?|[0-9](\\.[0-9])?|10(\\.0)?)$");
  openvas_validator_add (validator, "severity_class", "^(classic|nist|bsi|pci\\-dss)$");
  openvas_validator_add (validator, "severity_optional", "^(-1(\\.0)?|[0-9](\\.[0-9])?|10(\\.0)?)?$");
  openvas_validator_add (validator, "source_iface", "^(.*){1,16}$");
  openvas_validator_add (validator, "uuid",       "^[0-9abcdefABCDEF\\-]{1,40}$");
  /* This must be "login" with space and comma. */
  openvas_validator_add (validator, "users",      "^[[:alnum:]-_@., ]*$");
  openvas_validator_add (validator, "x_field", "^[\\[\\]_[:alnum:]]{1,80}$");
  openvas_validator_add (validator, "y_fields:name", "^[0-9]{1,5}$");
  openvas_validator_add (validator, "y_fields:value", "^[\\[\\]_[:alnum:]]{1,80}$");
  openvas_validator_add (validator, "year",       "^[0-9]+$");
  openvas_validator_add (validator, "z_fields:name", "^[0-9]{1,5}$");
  openvas_validator_add (validator, "z_fields:value", "^[\\[\\]_[:alnum:]]{1,80}$");
  openvas_validator_add (validator, "calendar_unit", "^(second|minute|hour|day|week|month|year|decade)$");
  openvas_validator_add (validator, "chart_title", "(?s)^.*$");

  /* Beware, the rule must be defined before the alias. */

  openvas_validator_alias (validator, "add_tag", "boolean");
  openvas_validator_alias (validator, "alert_id_2", "alert_id");
  openvas_validator_alias (validator, "alert_id_optional:name",  "number");
  openvas_validator_alias (validator, "alert_id_optional:value", "alert_id_optional");
  openvas_validator_alias (validator, "alerts",     "optional_number");
  openvas_validator_alias (validator, "alert_ids:name",  "number");
  openvas_validator_alias (validator, "alert_ids:value", "alert_id_optional");
  openvas_validator_alias (validator, "allow_insecure", "boolean");
  openvas_validator_alias (validator, "alterable", "boolean");
  openvas_validator_alias (validator, "apply_overrides", "boolean");
  openvas_validator_alias (validator, "autogenerate", "boolean");
  openvas_validator_alias (validator, "auto_cache_rebuild", "boolean");
  openvas_validator_alias (validator, "base",            "name");
  openvas_validator_alias (validator, "build_filter",    "boolean");
  /* the "bulk_[...].x" parameters are used to identify the image type
   *  form element used to submit the form for process_bulk */
  openvas_validator_alias (validator, "bulk_create.x", "number");
  openvas_validator_alias (validator, "bulk_delete.x", "number");
  openvas_validator_alias (validator, "bulk_export.x", "number");
  openvas_validator_alias (validator, "bulk_trash.x",  "number");
  openvas_validator_alias (validator, "bulk_select",   "number");
  openvas_validator_alias (validator, "change_community", "boolean");
  openvas_validator_alias (validator, "change_passphrase", "boolean");
  openvas_validator_alias (validator, "change_password", "boolean");
  openvas_validator_alias (validator, "change_privacy_password", "boolean");
  openvas_validator_alias (validator, "charts", "boolean");
  openvas_validator_alias (validator, "chart_type", "name");
  openvas_validator_alias (validator, "chart_template", "name");
  openvas_validator_alias (validator, "community", "lsc_password");
  openvas_validator_alias (validator, "custom_severity", "boolean");
  openvas_validator_alias (validator, "current_user", "boolean");
  openvas_validator_alias (validator, "dashboard_name", "name");
  openvas_validator_alias (validator, "debug",           "boolean");
  openvas_validator_alias (validator, "delta_report_id",     "report_id");
  openvas_validator_alias (validator, "delta_state_changed", "boolean");
  openvas_validator_alias (validator, "delta_state_gone", "boolean");
  openvas_validator_alias (validator, "delta_state_new", "boolean");
  openvas_validator_alias (validator, "delta_state_same", "boolean");
  openvas_validator_alias (validator, "duration",     "optional_number");
  openvas_validator_alias (validator, "duration_unit", "calendar_unit");
  openvas_validator_alias (validator, "dynamic_severity", "boolean");
  openvas_validator_alias (validator, "enable",       "boolean");
  openvas_validator_alias (validator, "enable_stop",             "boolean");
  openvas_validator_alias (validator, "end_day", "day_of_month");
  openvas_validator_alias (validator, "end_hour", "hour");
  openvas_validator_alias (validator, "end_minute", "minute");
  openvas_validator_alias (validator, "end_month", "month");
  openvas_validator_alias (validator, "end_year", "year");
  openvas_validator_alias (validator, "esxi_credential_id", "credential_id");
  openvas_validator_alias (validator, "filt_id",            "id");
  openvas_validator_alias (validator, "filter_extra",       "filter");
  openvas_validator_alias (validator, "filter_id",          "id");
  openvas_validator_alias (validator, "filterbox",          "boolean");
  openvas_validator_alias (validator, "from_file",          "boolean");
  openvas_validator_alias (validator, "force_wizard",       "boolean");
  openvas_validator_alias (validator, "get_name",           "name");
  openvas_validator_alias (validator, "grant_full",         "boolean");
  openvas_validator_alias (validator, "group_id",           "id");
  openvas_validator_alias (validator, "group_ids:name",     "number");
  openvas_validator_alias (validator, "group_ids:value",    "id_optional");
  openvas_validator_alias (validator, "groups",             "optional_number");
  openvas_validator_alias (validator, "host_search_phrase", "search_phrase");
  openvas_validator_alias (validator, "host_first_result",  "first_result");
  openvas_validator_alias (validator, "host_max_results",   "max_results");
  openvas_validator_alias (validator, "host_levels",        "levels");
  openvas_validator_alias (validator, "host_count",         "number");
  openvas_validator_alias (validator, "hosts_manual",       "hosts");
  openvas_validator_alias (validator, "hosts_filter",       "filter");
  openvas_validator_alias (validator, "exclude_hosts",      "hosts");
  openvas_validator_alias (validator, "in_assets",          "boolean");
  openvas_validator_alias (validator, "in_use",             "boolean");
  openvas_validator_alias (validator, "include_related",   "number");
  openvas_validator_alias (validator, "inheritor_id",       "id");
  openvas_validator_alias (validator, "ignore_pagination",   "boolean");
  openvas_validator_alias (validator, "refresh_interval", "number");
  openvas_validator_alias (validator, "event",        "condition");
  openvas_validator_alias (validator, "access_hosts", "hosts_opt");
  openvas_validator_alias (validator, "access_ifaces", "hosts_opt");
  openvas_validator_alias (validator, "max_checks",   "number");
  openvas_validator_alias (validator, "max_hosts",    "number");
  openvas_validator_alias (validator, "method",       "condition");
  openvas_validator_alias (validator, "modify_password", "number");
  openvas_validator_alias (validator, "ldaphost",     "hostport");
  openvas_validator_alias (validator, "level_high",   "boolean");
  openvas_validator_alias (validator, "level_medium", "boolean");
  openvas_validator_alias (validator, "level_low",    "boolean");
  openvas_validator_alias (validator, "level_log",    "boolean");
  openvas_validator_alias (validator, "level_false_positive", "boolean");
  openvas_validator_alias (validator, "method_data:to_address:", "email_list");
  openvas_validator_alias (validator, "method_data:from_address:", "email");
  openvas_validator_alias (validator, "new_severity", "severity_optional");
  openvas_validator_alias (validator, "new_severity_from_list", "severity_optional");
  openvas_validator_alias (validator, "new_threat",   "threat");
  openvas_validator_alias (validator, "next",         "page");
  openvas_validator_alias (validator, "next_next",    "page");
  openvas_validator_alias (validator, "next_error",   "page");
  openvas_validator_alias (validator, "next_id",      "info_id");
  openvas_validator_alias (validator, "next_type",    "resource_type");
  openvas_validator_alias (validator, "next_subtype", "info_type");
  openvas_validator_alias (validator, "next_xml",      "boolean");
  openvas_validator_alias (validator, "notes",        "boolean");
  openvas_validator_alias (validator, "note_task_id", "optional_task_id");
  openvas_validator_alias (validator, "note_task_uuid", "note_task_id");
  openvas_validator_alias (validator, "note_result_uuid", "note_result_id");
  openvas_validator_alias (validator, "no_chart_links",        "boolean");
  openvas_validator_alias (validator, "no_filter_history", "boolean");
  openvas_validator_alias (validator, "no_redirect", "boolean");
  openvas_validator_alias (validator, "nvt:value",         "uuid");
  openvas_validator_alias (validator, "old_login", "login");
  openvas_validator_alias (validator, "old_password", "password");
  openvas_validator_alias (validator, "original_overrides",  "boolean");
  openvas_validator_alias (validator, "overrides",        "boolean");
  openvas_validator_alias (validator, "override_task_id", "optional_task_id");
  openvas_validator_alias (validator, "override_task_uuid", "override_task_id");
  openvas_validator_alias (validator, "override_result_uuid", "override_result_id");
  openvas_validator_alias (validator, "owner", "name");
  openvas_validator_alias (validator, "passphrase",   "lsc_password");
  openvas_validator_alias (validator, "password:name", "preference_name");
  openvas_validator_alias (validator, "permission", "name");
  openvas_validator_alias (validator, "permission_id", "id");
  openvas_validator_alias (validator, "permission_group_id", "id");
  openvas_validator_alias (validator, "permission_role_id",  "id");
  openvas_validator_alias (validator, "permission_user_id",  "id");
  openvas_validator_alias (validator, "port_manual",       "port");
  openvas_validator_alias (validator, "port_range_end",    "number");
  openvas_validator_alias (validator, "port_range_start",  "number");
  openvas_validator_alias (validator, "pos",               "number");
  openvas_validator_alias (validator, "privacy_password", "lsc_password");
  openvas_validator_alias (validator, "radiushost",     "hostport");
  openvas_validator_alias (validator, "restrict_type", "resource_type");
  openvas_validator_alias (validator, "result_hosts_only", "boolean");
  openvas_validator_alias (validator, "result_task_id", "optional_task_id");
  openvas_validator_alias (validator, "report_result_id",  "result_id");
  openvas_validator_alias (validator, "replace_task_id",   "boolean");
  openvas_validator_alias (validator, "reverse_lookup_only", "boolean");
  openvas_validator_alias (validator, "reverse_lookup_unify", "boolean");
  openvas_validator_alias (validator, "role_id",           "id");
  openvas_validator_alias (validator, "role_ids:name",  "number");
  openvas_validator_alias (validator, "role_ids:value", "id_optional");
  openvas_validator_alias (validator, "roles",             "optional_number");
  openvas_validator_alias (validator, "period",       "optional_number");
  openvas_validator_alias (validator, "period_unit",  "calendar_unit");
  openvas_validator_alias (validator, "scanner_host",     "hostpath");
  openvas_validator_alias (validator, "scanner_type", "number");
  openvas_validator_alias (validator, "schedules_only", "boolean");
  openvas_validator_alias (validator, "schedule_periods", "number");
  openvas_validator_alias (validator, "select:name",  "family");
  openvas_validator_alias (validator, "show_all",     "boolean");
  openvas_validator_alias (validator, "slave_id",     "id");
  openvas_validator_alias (validator, "smb_credential_id", "credential_id");
  openvas_validator_alias (validator, "snmp_credential_id", "credential_id");
  openvas_validator_alias (validator, "ssh_credential_id", "credential_id");
  openvas_validator_alias (validator, "start_day", "day_of_month");
  openvas_validator_alias (validator, "start_hour", "hour");
  openvas_validator_alias (validator, "start_minute", "minute");
  openvas_validator_alias (validator, "start_month", "month");
  openvas_validator_alias (validator, "start_year", "year");
  openvas_validator_alias (validator, "subgroup_column", "group_column");
  openvas_validator_alias (validator, "subject_id",   "id");
  openvas_validator_alias (validator, "subject_id_optional", "id_optional");
  openvas_validator_alias (validator, "subject_name",   "name");
  openvas_validator_alias (validator, "subtype", "asset_type");
  openvas_validator_alias (validator, "task_filter",  "filter");
  openvas_validator_alias (validator, "task_filt_id", "filt_id");
  openvas_validator_alias (validator, "timeout",      "boolean");
  openvas_validator_alias (validator, "trend:name",   "family");
  openvas_validator_alias (validator, "user_id",      "id");
  openvas_validator_alias (validator, "user_id_optional", "id_optional");
  openvas_validator_alias (validator, "xml",          "boolean");
  openvas_validator_alias (validator, "esc_filter",        "filter");
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
  struct MHD_PostProcessor *postprocessor; ///< POST processor.
  char *response;                          ///< HTTP response text.
  params_t *params;                        ///< Request parameters.
  char *cookie;                            ///< Value of SID cookie param.
  char *language;                          ///< Language code e.g. en
  int connectiontype;                      ///< 1=POST, 2=GET.
  int answercode;                          ///< HTTP response code.
  enum content_type content_type;          ///< Content type of response.
  char *content_disposition;               ///< Content disposition of reponse.
  size_t content_length;                   ///< Content length.
  gchar *redirect;                         ///< Redirect URL.
};

#ifdef SERVE_STATIC_ASSETS
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
#endif

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
      g_debug ("con_info was NULL!\n");
      return;
    }

  g_debug ("connectiontype=%d\n", con_info->connectiontype);

  if (con_info->connectiontype == 1)
    {
      if (NULL != con_info->postprocessor)
        {
          MHD_destroy_post_processor (con_info->postprocessor);
        }
    }

  params_free (con_info->params);
  g_free (con_info->cookie);
  g_free (con_info->content_disposition);
  g_free (con_info->language);
  g_free (con_info);
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
  if ((strncmp (name, "bulk_selected:", strlen ("bulk_selected:")) == 0)
      || (strncmp (name, "chart_gen:", strlen ("chart_gen:")) == 0)
      || (strncmp (name, "chart_init:", strlen ("chart_init:")) == 0)
      || (strncmp (name, "condition_data:", strlen ("condition_data:")) == 0)
      || (strncmp (name, "data_columns:", strlen ("data_columns:")) == 0)
      || (strncmp (name, "event_data:", strlen ("event_data:")) == 0)
      || (strncmp (name, "settings_changed:", strlen ("settings_changed:"))
          == 0)
      || (strncmp (name, "settings_default:", strlen ("settings_default:"))
          == 0)
      || (strncmp (name, "settings_filter:", strlen ("settings_filter:")) == 0)
      || (strncmp (name, "file:", strlen ("file:")) == 0)
      || (strncmp (name, "include_id_list:", strlen ("include_id_list:")) == 0)
      || (strncmp (name, "parameter:", strlen ("parameter:")) == 0)
      || (strncmp (name, "password:", strlen ("password:")) == 0)
      || (strncmp (name, "preference:", strlen ("preference:")) == 0)
      || (strncmp (name, "select:", strlen ("select:")) == 0)
      || (strncmp (name, "text_columns:", strlen ("text_columns:")) == 0)
      || (strncmp (name, "trend:", strlen ("trend:")) == 0)
      || (strncmp (name, "method_data:", strlen ("method_data:")) == 0)
      || (strncmp (name, "nvt:", strlen ("nvt:")) == 0)
      || (strncmp (name, "alert_id_optional:", strlen ("alert_id_optional:"))
          == 0)
      || (strncmp (name, "group_id_optional:", strlen ("group_id_optional:"))
          == 0)
      || (strncmp (name, "role_id_optional:", strlen ("role_id_optional:"))
          == 0)
      || (strncmp (name, "related:", strlen ("related:")) == 0)
      || (strncmp (name, "sort_fields:", strlen ("sort_fields:")) == 0)
      || (strncmp (name, "sort_orders:", strlen ("sort_orders:")) == 0)
      || (strncmp (name, "sort_stats:", strlen ("sort_stats:")) == 0)
      || (strncmp (name, "y_fields:", strlen ("y_fields:")) == 0)
      || (strncmp (name, "z_fields:", strlen ("z_fields:")) == 0))
    {
      param_t *param;
      const char *colon;
      gchar *prefix;

      colon = strchr (name, ':');

      /* Hashtable param, like for radios. */

      if ((colon - name) == (strlen (name) - 1))
        {
          /* name: "example:", value "abc". */

          params_append_bin (params, name, chunk_data, chunk_size, chunk_offset);

          return MHD_YES;
        }

      /* name: "nvt:1.3.6.1.4.1.25623.1.0.105058", value "1". */

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

  /*
   * Array param
   * Can be accessed like a hashtable param,with ascending numbers as the
   *  key, which are automatically generated instead of being part of the
   *  full name.
   * For example multiple instances of "x:" in the request
   *  become "x:1", "x:2", "x:3", etc.
   */
  if ((strcmp (name, "alert_ids:") == 0)
      || (strcmp(name, "role_ids:") == 0)
      || (strcmp(name, "group_ids:") == 0)
      || (strcmp(name, "id_list:") == 0))
    {
      param_t *param;
      gchar *index_str;

      param = params_get (params, name);

      if (param == NULL)
        {
          param = params_add (params, name, "");
          param->values = params_new ();
        }
      else if (param->values == NULL)
        param->values = params_new ();

      if (chunk_offset == 0)
        param->array_len += 1;

      index_str = g_strdup_printf ("%d", param->array_len);

      params_append_bin (param->values, index_str, chunk_data, chunk_size,
                         chunk_offset);

      g_free (index_str);

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
 * @param[in]  parent_name  Name of the parent param.
 * @param[in]  params       Values.
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

      /* Item specific value validator like "method_data:to_adddress:". */
      if ((g_utf8_validate (name, -1, NULL) == FALSE)
          || (g_utf8_validate (param->value, -1, NULL) == FALSE))
        {
          param->original_value = param->value;
          param->value = NULL;
          param->value_size = 0;
          param->valid = 0;
          param->valid_utf8 = 0;
          item_name = NULL;
        }
      else switch (openvas_validate (validator,
                                     (item_name = g_strdup_printf ("%s%s:",
                                                                   parent_name,
                                                                   name)),
                                     param->value))
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
                param->valid_utf8 = 1;

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

      param->valid_utf8 = (g_utf8_validate (name, -1, NULL)
                           && (param->value == NULL
                               || g_utf8_validate (param->value, -1, NULL)));

      if ((!g_str_has_prefix (name, "osp_pref_")
           && openvas_validate (validator, name, param->value)))
        {
          param->original_value = param->value;
          param->value = NULL;
          param->valid = 0;
        }
      else
        {
          const gchar *alias_for;

          param->valid = 1;

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
    con_info->response = name ## _omp (&connection, credentials, \
                                       con_info->params, &response_data);

static credentials_t *
credentials_new (user_t *user, const char *language, const char *client_address)
{
  credentials_t *credentials;

  assert (user->username);
  assert (user->password);
  assert (user->role);
  assert (user->timezone);
  assert (user->capabilities);
  assert (user->token);
  credentials = g_malloc0 (sizeof (credentials_t));
  credentials->username = g_strdup (user->username);
  credentials->password = g_strdup (user->password);
  credentials->role = g_strdup (user->role);
  credentials->timezone = g_strdup (user->timezone);
  credentials->severity = g_strdup (user->severity);
  credentials->capabilities = g_strdup (user->capabilities);
  credentials->token = g_strdup (user->token);
  credentials->charts = user->charts;
  credentials->chart_prefs = user->chart_prefs;
  credentials->pw_warning = user->pw_warning ? g_strdup (user->pw_warning)
                                             : NULL;
  credentials->language = g_strdup (language);
  credentials->autorefresh = user->autorefresh
                              ? g_strdup (user->autorefresh) : NULL;
  credentials->last_filt_ids = user->last_filt_ids;
  credentials->client_address = g_strdup (client_address);
  credentials->guest = user->guest;

  return credentials;
}

static void
credentials_free (credentials_t *creds)
{
  if (!creds)
    return;

  g_free (creds->username);
  g_free (creds->password);
  g_free (creds->role);
  g_free (creds->timezone);
  g_free (creds->token);
  g_free (creds->caller);
  g_free (creds->current_page);
  g_free (creds->capabilities);
  g_free (creds->language);
  g_free (creds->severity);
  g_free (creds->pw_warning);
  g_free (creds->client_address);
  g_free (creds->autorefresh);
  /* params, chart_prefs and last_filt_ids are not duplicated. */
  g_free (creds);
}

/**
 * @brief Handle a complete POST request.
 *
 * Ensures there is a command, then depending on the command validates
 * parameters and calls the appropriate OMP function (like
 * create_task_omp).
 *
 * @param[in]   con_info        Connection info.
 * @param[out]  user_return     User after successful login.
 * @param[out]  new_sid         SID when appropriate to attach.
 * @param[out]  client_address  Client address.
 *
 * @return 0 after authenticated page, 1 after login, 2 after logout,
 *         3 after internal error or login failure.
 */
int
exec_omp_post (struct gsad_connection_info *con_info, user_t **user_return,
               gchar **new_sid, const char *client_address)
{
  int ret;
  user_t *user;
  credentials_t *credentials;
  const char *cmd, *caller, *language;
  cmd_response_data_t response_data;
  cmd_response_data_init (&response_data);
  const char *xml_flag;
  xml_flag = params_value (con_info->params, "xml");
  openvas_connection_t connection;

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
          gchar *timezone, *role, *capabilities, *severity, *language;
          gchar *pw_warning, *autorefresh;
          GTree *chart_prefs;
          ret = authenticate_omp (params_value (con_info->params, "login"),
                                  password,
                                  &role,
                                  &timezone,
                                  &severity,
                                  &capabilities,
                                  &language,
                                  &pw_warning,
                                  &chart_prefs,
                                  &autorefresh);
          if (ret)
            {
              time_t now;
              gchar *xml;
              char *res;
              char ctime_now[200];

              if (ret == -1 || ret == 2)
                response_data.http_status_code = MHD_HTTP_SERVICE_UNAVAILABLE;
              else
                response_data.http_status_code = MHD_HTTP_UNAUTHORIZED;

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              xml = login_xml
                     (ret == 2
                       ? "Login failed."
                         "  Waiting for OMP service to become available."
                       : (ret == -1
                           ? "Login failed."
                             "  Error during authentication."
                           : "Login failed."),
                      NULL,
                      ctime_now,
                      NULL,
                      con_info->language
                       ? con_info->language
                       : DEFAULT_GSAD_LANGUAGE,
                      guest_username ? guest_username : "");

              if (xml_flag && strcmp (xml_flag, "0"))
                res = xml;
              else
                {
                  res = xsl_transform (xml, &response_data);
                  g_free (xml);
                }
              con_info->response = res;
              con_info->answercode = response_data.http_status_code;

              g_warning ("Authentication failure for '%s' from %s",
                         params_value (con_info->params, "login") ?: "",
                         client_address);
            }
          else
            {
              user_t *user;
              user = user_add (params_value (con_info->params, "login"),
                               password, timezone, severity, role, capabilities,
                               language, pw_warning, chart_prefs, autorefresh,
                               client_address);

              g_message ("Authentication success for '%s' from %s",
                         params_value (con_info->params, "login") ?: "",
                         client_address);

              /* Redirect to get_tasks. */
              *user_return = user;
              g_free (timezone);
              g_free (severity);
              g_free (capabilities);
              g_free (language);
              g_free (role);
              g_free (pw_warning);
              g_free (autorefresh);
              cmd_response_data_reset (&response_data);
              return 1;
            }
        }
      else
        {
          time_t now;
          gchar *xml;
          char *res;
          char ctime_now[200];

          response_data.http_status_code = MHD_HTTP_UNAUTHORIZED;

          now = time (NULL);
          ctime_r_strip_newline (&now, ctime_now);

          xml = login_xml ("Login failed.", NULL, ctime_now, NULL,
                           con_info->language ? con_info->language
                                              : DEFAULT_GSAD_LANGUAGE,
                           guest_username ? guest_username : "");
          if (xml_flag && strcmp (xml_flag, "0"))
            res = xml;
          else
            {
              res = xsl_transform (xml, &response_data);
              g_free (xml);
            }
          con_info->response = res;
          con_info->answercode = response_data.http_status_code;
          g_warning ("Authentication failure for '%s' from %s",
                     params_value (con_info->params, "login") ?: "",
                     client_address);
        }
      cmd_response_data_reset (&response_data);
      return 3;
    }

  /* Check the session. */

  if (params_value (con_info->params, "token") == NULL)
    {
      response_data.http_status_code = MHD_HTTP_BAD_REQUEST;
      if (params_given (con_info->params, "token") == 0)
        con_info->response
         = gsad_message (NULL,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred inside GSA daemon. "
                         "Diagnostics: Token missing.",
                         "/omp?cmd=get_tasks", &response_data);
      else
        con_info->response
         = gsad_message (NULL,
                         "Internal error", __FUNCTION__, __LINE__,
                         "An internal error occurred inside GSA daemon. "
                         "Diagnostics: Token bad.",
                         "/omp?cmd=get_tasks", &response_data);
      con_info->answercode = response_data.http_status_code;
      cmd_response_data_reset (&response_data);
      return 3;
    }

  ret = user_find (con_info->cookie, params_value (con_info->params, "token"),
                   client_address, &user);
  if (ret == USER_BAD_TOKEN)
    {
      response_data.http_status_code = MHD_HTTP_BAD_REQUEST;
      con_info->response
       = gsad_message (NULL,
                       "Internal error", __FUNCTION__, __LINE__,
                       "An internal error occurred inside GSA daemon. "
                       "Diagnostics: Bad token.",
                       "/omp?cmd=get_tasks", &response_data);
      con_info->answercode = response_data.http_status_code;
      cmd_response_data_reset (&response_data);
      return 3;
    }

  if (ret == USER_EXPIRED_TOKEN)
    {
      time_t now;
      gchar *xml;
      char ctime_now[200];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      caller = params_value (con_info->params, "caller");

      if (caller && g_utf8_validate (caller, -1, NULL) == FALSE)
        {
          caller = NULL;
          g_warning ("%s - caller is not valid UTF-8", __FUNCTION__);
        }

      /* @todo Validate caller. */

      xml = login_xml ("Session has expired.  Please login again.",
                       NULL,
                       ctime_now,
                       caller
                        ? caller
                        : "",
                       con_info->language
                        ? con_info->language
                        : DEFAULT_GSAD_LANGUAGE,
                       guest_username ? guest_username : "");
      response_data.http_status_code = MHD_HTTP_UNAUTHORIZED;
      if (xml_flag && strcmp (xml_flag, "0"))
        con_info->response = xml;
      else
        {
          con_info->response = xsl_transform (xml, &response_data);
          g_free (xml);
        }
      con_info->answercode = response_data.http_status_code;
      cmd_response_data_reset (&response_data);
      return 2;
    }

  if (ret == USER_BAD_MISSING_COOKIE || ret == USER_IP_ADDRESS_MISSMATCH)
    {
      time_t now;
      gchar *xml;
      char ctime_now[200];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      xml = login_xml ("Cookie missing or bad.  Please login again.",
                       NULL,
                       ctime_now,
                       NULL,
                       con_info->language
                        ? con_info->language
                        : DEFAULT_GSAD_LANGUAGE,
                       guest_username ? guest_username : "");
      response_data.http_status_code = MHD_HTTP_UNAUTHORIZED;
      if (xml_flag && strcmp (xml_flag, "0"))
        con_info->response = xml;
      else
        {
          con_info->response = xsl_transform (xml, &response_data);
          g_free (xml);
        }
      con_info->answercode = response_data.http_status_code;
      cmd_response_data_reset (&response_data);
      return 2;
    }

  if (ret == USER_GUEST_LOGIN_FAILED || ret == USER_OMP_DOWN ||
          ret == USER_GUEST_LOGIN_ERROR)
    {
      time_t now;
      gchar *xml;
      char ctime_now[200];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      response_data.http_status_code = MHD_HTTP_SERVICE_UNAVAILABLE;
      xml = login_xml (ret == USER_OMP_DOWN
                        ? "Login failed.  OMP service is down."
                        : (ret == USER_GUEST_LOGIN_ERROR
                            ? "Login failed.  Error during authentication."
                            : "Login failed."),
                       NULL,
                       ctime_now,
                       NULL,
                       con_info->language
                        ? con_info->language
                        : DEFAULT_GSAD_LANGUAGE,
                       guest_username ? guest_username : "");
      if (xml_flag && strcmp (xml_flag, "0"))
        con_info->response = xml;
      else
        {
          con_info->response = xsl_transform (xml, &response_data);
          g_free (xml);
        }
      con_info->answercode = response_data.http_status_code;
      cmd_response_data_reset (&response_data);
      return 2;
    }

  if (ret)
    abort ();

  /* From here, the user is authenticated. */


  language = user->language ?: con_info->language ?: DEFAULT_GSAD_LANGUAGE;
  credentials = credentials_new (user, language, client_address);
  credentials->params = con_info->params; // FIXME remove params from credentials
  gettimeofday (&credentials->cmd_start, NULL);

  /* The caller of a POST is usually the caller of the page that the POST form
   * was on. */
  caller = params_value (con_info->params, "caller");
  if (caller && g_utf8_validate (caller, -1, NULL) == FALSE)
    {
      g_warning ("%s - caller is not valid UTF-8", __FUNCTION__);
      caller = NULL;
    }
  credentials->caller = g_strdup (caller ?: "");

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

  /* Connect to manager */
  switch (manager_connect (credentials, &connection, &response_data))
    {
      case 0:
        break;
      case -1:
        con_info->answercode = MHD_HTTP_SERVICE_UNAVAILABLE;
        con_info->response = logout (credentials,
                                     "Logged out.  OMP service is down.",
                                     &response_data);
        return 2;
        break;
      case -2:
        con_info->answercode = MHD_HTTP_INTERNAL_SERVER_ERROR;
        con_info->response
          = gsad_message (credentials,
                          "Internal error", __FUNCTION__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Could not authenticate to manager "
                          "daemon.",
                          "/omp?cmd=get_tasks",
                          &response_data);
        return 2;
      default:
        con_info->answercode = MHD_HTTP_INTERNAL_SERVER_ERROR;
        con_info->response
          = gsad_message (credentials,
                          "Internal error", __FUNCTION__, __LINE__,
                          "An internal error occurred. "
                          "Diagnostics: Failure to connect to manager "
                          "daemon.",
                          "/omp?cmd=get_tasks",
                          &response_data);
        return 2;
    }


  /* Handle the usual commands. */

  if (!cmd)
    {
      response_data.http_status_code = MHD_HTTP_BAD_REQUEST;
      con_info->response = gsad_message (credentials,
                                         "Internal error",
                                         __FUNCTION__,
                                         __LINE__,
                                         "An internal error occurred inside GSA daemon. "
                                         "Diagnostics: Empty command.",
                                         "/omp?cmd=get_tasks", &response_data);
    }
  ELSE (bulk_delete)
  ELSE (clone)
  ELSE (create_agent)
  ELSE (create_alert)
  ELSE (create_asset)
  ELSE (create_container_task)
  ELSE (create_credential)
  ELSE (create_filter)
  ELSE (create_group)
  ELSE (create_host)
  ELSE (create_permission)
  ELSE (create_permissions)
  ELSE (create_port_list)
  ELSE (create_port_range)
  ELSE (create_report)
  ELSE (create_task)
  ELSE (create_user)
  ELSE (create_role)
  ELSE (create_scanner)
  ELSE (create_schedule)
  ELSE (create_tag)
  ELSE (create_target)
  ELSE (create_config)
  ELSE (create_note)
  ELSE (create_override)
  ELSE (delete_agent)
  ELSE (delete_asset)
  ELSE (delete_task)
  ELSE (delete_alert)
  ELSE (delete_credential)
  ELSE (delete_filter)
  ELSE (delete_group)
  ELSE (delete_note)
  ELSE (delete_override)
  ELSE (delete_permission)
  ELSE (delete_port_list)
  ELSE (delete_port_range)
  ELSE (delete_report)
  ELSE (delete_report_format)
  ELSE (delete_role)
  ELSE (delete_scanner)
  ELSE (delete_schedule)
  ELSE (delete_user)
  ELSE (delete_tag)
  ELSE (delete_target)
  ELSE (delete_trash_agent)
  ELSE (delete_trash_config)
  ELSE (delete_trash_alert)
  ELSE (delete_trash_credential)
  ELSE (delete_trash_filter)
  ELSE (delete_trash_group)
  ELSE (delete_trash_note)
  ELSE (delete_trash_override)
  ELSE (delete_trash_permission)
  ELSE (delete_trash_port_list)
  ELSE (delete_trash_report_format)
  ELSE (delete_trash_role)
  ELSE (delete_trash_scanner)
  ELSE (delete_trash_schedule)
  ELSE (delete_trash_tag)
  ELSE (delete_trash_target)
  ELSE (delete_trash_task)
  ELSE (delete_config)
  ELSE (empty_trashcan)
  else if (!strcmp (cmd, "alert_report"))
    {
      con_info->response = get_report_section_omp
                            (&connection, credentials, con_info->params,
                             &response_data);
    }
  ELSE (import_config)
  ELSE (import_port_list)
  ELSE (import_report)
  ELSE (import_report_format)
  else if (!strcmp (cmd, "process_bulk"))
    {
      con_info->response =  process_bulk_omp (&connection,
                                              credentials,
                                              con_info->params,
                                              &con_info->content_type,
                                              &con_info->content_disposition,
                                              &con_info->content_length,
                                              &response_data);
    }
  ELSE (move_task)
  ELSE (restore)
  ELSE (resume_task)
  ELSE (run_wizard)
  ELSE (save_agent)
  ELSE (save_alert)
  ELSE (save_asset)
  ELSE (save_auth)
  else if (!strcmp (cmd, "save_chart_preference"))
    {
      gchar *pref_id, *pref_value;

      con_info->response = save_chart_preference_omp (&connection,
                                                      credentials,
                                                      con_info->params,
                                                      &pref_id, &pref_value,
                                                      &response_data);
      if (pref_id && pref_value)
        user_set_chart_pref (credentials->token, pref_id, pref_value);
    }
  ELSE (save_config)
  ELSE (save_config_family)
  ELSE (save_config_nvt)
  ELSE (save_credential)
  ELSE (save_filter)
  ELSE (save_group)
  else if (!strcmp (cmd, "save_my_settings"))
    {
      char *timezone, *password, *severity, *language;
      con_info->response = save_my_settings_omp (&connection,
                                                 credentials, con_info->params,
                                                 con_info->language,
                                                 &timezone, &password,
                                                 &severity, &language,
                                                 &response_data);
      if (timezone)
        /* credentials->timezone set in save_my_settings_omp before XSLT. */
        user_set_timezone (credentials->token, timezone);
      if (password)
        {
          /* credentials->password set in save_my_settings_omp before XSLT. */
          user_set_password (credentials->token, password);

          user_logout_all_sessions (credentials->username, credentials);
        }
      if (severity)
        /* credentials->severity set in save_my_settings_omp before XSLT. */
        user_set_severity (credentials->token, severity);
      if (language)
        /* credentials->language is set in save_my_settings_omp before XSLT. */
        user_set_language (credentials->token, language);

      g_free (timezone);
      g_free (password);
      g_free (severity);
      g_free (language);
    }
  ELSE (save_note)
  ELSE (save_override)
  ELSE (save_permission)
  ELSE (save_port_list)
  ELSE (save_report_format)
  ELSE (save_role)
  ELSE (save_scanner)
  ELSE (save_schedule)
  ELSE (save_tag)
  ELSE (save_target)
  ELSE (save_task)
  ELSE (save_container_task)
  else if (!strcmp (cmd, "save_user"))
    {
      char *password, *modified_user;
      int logout;
      con_info->response = save_user_omp (&connection, credentials,
                                          con_info->params,
                                          &password, &modified_user, &logout,
                                          &response_data);
      if (modified_user && logout)
        user_logout_all_sessions (modified_user, credentials);

      if (password)
        /* credentials->password set in save_user_omp before XSLT. */
        user_set_password (credentials->token, password);

      g_free (password);
    }
  ELSE (start_task)
  ELSE (stop_task)
  ELSE (sync_feed)
  ELSE (sync_scap)
  ELSE (sync_cert)
  ELSE (test_alert)
  ELSE (toggle_tag)
  ELSE (verify_agent)
  ELSE (verify_report_format)
  ELSE (verify_scanner)
  else
    {
      response_data.http_status_code = MHD_HTTP_BAD_REQUEST;
      con_info->response = gsad_message (credentials,
                                         "Internal error",
                                         __FUNCTION__,
                                         __LINE__,
                                         "An internal error occurred inside GSA daemon. "
                                         "Diagnostics: Unknown command.",
                                         "/omp?cmd=get_tasks", &response_data);
    }

  if (response_data.redirect)
    {
      con_info->answercode = MHD_HTTP_SEE_OTHER;
      con_info->redirect = response_data.redirect;
    }
  else
    con_info->answercode = response_data.http_status_code;

  cmd_response_data_reset (&response_data);
  credentials_free (credentials);
  openvas_connection_close (&connection);
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
  if ((strncmp (name, "bulk_selected:", strlen ("bulk_selected:")) == 0)
      || (strncmp (name, "chart_gen:", strlen ("chart_gen:")) == 0)
      || (strncmp (name, "chart_init:", strlen ("chart_init:")) == 0)
      || (strncmp (name, "condition_data:", strlen ("condition_data:")) == 0)
      || (strncmp (name, "data_columns:", strlen ("data_columns:")) == 0)
      || (strncmp (name, "event_data:", strlen ("event_data:")) == 0)
      || (strncmp (name, "settings_changed:", strlen ("settings_changed:"))
          == 0)
      || (strncmp (name, "settings_default:", strlen ("settings_default:"))
          == 0)
      || (strncmp (name, "settings_filter:", strlen ("settings_filter:")) == 0)
      || (strncmp (name, "file:", strlen ("file:")) == 0)
      || (strncmp (name, "include_id_list:", strlen ("include_id_list:")) == 0)
      || (strncmp (name, "parameter:", strlen ("parameter:")) == 0)
      || (strncmp (name, "password:", strlen ("password:")) == 0)
      || (strncmp (name, "preference:", strlen ("preference:")) == 0)
      || (strncmp (name, "select:", strlen ("select:")) == 0)
      || (strncmp (name, "text_columns:", strlen ("text_columns:")) == 0)
      || (strncmp (name, "trend:", strlen ("trend:")) == 0)
      || (strncmp (name, "method_data:", strlen ("method_data:")) == 0)
      || (strncmp (name, "nvt:", strlen ("nvt:")) == 0)
      || (strncmp (name, "alert_id_optional:", strlen ("alert_id_optional:"))
          == 0)
      || (strncmp (name, "group_id_optional:", strlen ("group_id_optional:"))
          == 0)
      || (strncmp (name, "role_id_optional:", strlen ("role_id_optional:"))
          == 0)
      || (strncmp (name, "related:", strlen ("related:")) == 0)
      || (strncmp (name, "sort_fields:", strlen ("sort_fields:")) == 0)
      || (strncmp (name, "sort_orders:", strlen ("sort_orders:")) == 0)
      || (strncmp (name, "sort_stats:", strlen ("sort_stats:")) == 0)
      || (strncmp (name, "y_fields:", strlen ("y_fields:")) == 0)
      || (strncmp (name, "z_fields:", strlen ("z_fields:")) == 0))
    {
      param_t *param;
      const char *colon;
      gchar *prefix;

      /* Hashtable param, like for radios. */

      colon = strchr (name, ':');

      if ((colon - name) == (strlen (name) - 1))
        {
          params_append_bin (params, name, value, strlen (value), 0);

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

      params_append_bin (param->values, colon + 1, value, strlen (value), 0);

      return MHD_YES;
    }

  /*
   * Array param (See params_append_mhd for a description)
   */
  if ((strcmp (name, "alert_ids:") == 0)
      || (strcmp(name, "role_ids:") == 0)
      || (strcmp(name, "group_ids:") == 0)
      || (strcmp(name, "id_list:") == 0))
    {
      param_t *param;
      gchar *index_str;

      param = params_get (params, name);

      if (param == NULL)
        {
          param = params_add (params, name, "");
          param->values = params_new ();
        }
      else if (param->values == NULL)
        param->values = params_new ();

      param->array_len += 1;

      index_str = g_strdup_printf ("%d", param->array_len);

      params_append_bin (param->values, index_str, value, strlen (value), 0);

      g_free (index_str);

      return MHD_YES;
    }

  /* Single value param. */

  params_add ((params_t *) params, name, value);
  return MHD_YES;
}

/*
 * Connection watcher thread data
 */
typedef struct {
  int client_socket_fd;
  openvas_connection_t *openvas_connection;
  int connection_closed;
  pthread_mutex_t mutex;
} connection_watcher_data_t;

/**
 * @brief  Create a new connection watcher thread data structure.
 *
 * @param[in]  openvas_connection   OpenVAS connection to close if client
 *                                   connection closes.
 * @param[in]  client_socket_fd File descriptor of client connection to watch.
 *
 * @return  Newly allocated watcher thread data.
 */
static connection_watcher_data_t*
connection_watcher_data_new (openvas_connection_t *openvas_connection,
                             int client_socket_fd)
{
  connection_watcher_data_t *watcher_data;
  watcher_data = g_malloc (sizeof (connection_watcher_data_t));

  watcher_data->openvas_connection = openvas_connection;
  watcher_data->client_socket_fd = client_socket_fd;
  watcher_data->connection_closed = 0;
  pthread_mutex_init  (&(watcher_data->mutex), NULL);

  return watcher_data;
}

/**
 * @brief   Thread start routine watching the client connection.
 *
 * @param[in] data  The connection data watcher struct.
 *
 * @return  Always NULL.
 */
static void*
watch_client_connection (void* data)
{
  int active;
  connection_watcher_data_t *watcher_data;

  pthread_setcancelstate (PTHREAD_CANCEL_DISABLE, NULL);
  watcher_data = (connection_watcher_data_t*) data;

  pthread_mutex_lock (&(watcher_data->mutex));
  active = 1;
  pthread_mutex_unlock (&(watcher_data->mutex));

  while (active)
    {
      pthread_setcancelstate (PTHREAD_CANCEL_ENABLE, NULL);
      sleep (client_watch_interval);
      pthread_setcancelstate (PTHREAD_CANCEL_DISABLE, NULL);

      pthread_mutex_lock (&(watcher_data->mutex));

      if (watcher_data->connection_closed)
        {
          active = 0;
          pthread_mutex_unlock (&(watcher_data->mutex));
          break;
        }
      int ret;
      char buf[1];
      errno = 0;
      ret = recv (watcher_data->client_socket_fd, buf, 1, MSG_PEEK);

      if (ret >= 0)
        {
          if (watcher_data->connection_closed == 0)
            {
              watcher_data->connection_closed = 1;
              active = 0;
              g_debug ("%s: Client connection closed", __FUNCTION__);

              if (watcher_data->openvas_connection->tls)
                {
                  openvas_connection_t *gvm_conn;
                  gvm_conn = watcher_data->openvas_connection;
                  gnutls_bye (gvm_conn->session, GNUTLS_SHUT_RDWR);
                }
              else
                {
                  openvas_connection_close (watcher_data->openvas_connection);
                }
            }
        }

      pthread_mutex_unlock (&(watcher_data->mutex));
    }

  return NULL;
}


#undef ELSE

/**
 * @brief Add else branch for an OMP operation.
 */
#define ELSE(name) \
  else if (!strcmp (cmd, G_STRINGIFY (name))) \
    ret = name ## _omp (&connection, credentials, params, response_data);

/**
 * @brief Handle a complete GET request.
 *
 * After some input checking, depending on the cmd parameter of the connection,
 * issue an omp command (via *_omp functions).
 *
 * @param[in]   con                  Connection.
 * @param[in]   credentials          User credentials.
 * @param[out]  content_type         Return location for the content type of
 *                                   the response.
 * @param[out]  content_type_string  Return location for dynamic content type.
 * @param[out]  content_disposition  Return location for the
 *                                   content_disposition, if any.
 * @param[out]  response_size        Return location for response size, if any.
 * @param[in]   response_data        Response data.  Return info is written
 *                                   into here.
 *
 * @return Newly allocated response string.
 */
char *
exec_omp_get (struct MHD_Connection *con,
              credentials_t *credentials,
              enum content_type* content_type,
              gchar **content_type_string,
              char** content_disposition,
              gsize* response_size,
              cmd_response_data_t *response_data)
{
  openvas_connection_t connection;
  char *cmd = NULL;
  const int CMD_MAX_SIZE = 27;   /* delete_trash_lsc_credential */
  params_t *params;
  char *ret;
  pthread_t watch_thread;
  connection_watcher_data_t *watcher_data;

  cmd =
    (char *) MHD_lookup_connection_value (con, MHD_GET_ARGUMENT_KIND,
                                          "cmd");
  if (cmd == NULL)
    {
      cmd = "dashboard";  // TODO: Allow settings for face + users(?)
    }

  if (openvas_validate (validator, "cmd", cmd))
    cmd = NULL;

  if ((cmd != NULL) && (strlen (cmd) <= CMD_MAX_SIZE))
    {
      g_debug ("cmd: [%s]\n", cmd);

      params = params_new ();

      MHD_get_connection_values (con, MHD_GET_ARGUMENT_KIND,
                                 params_mhd_add, params);

      params_mhd_validate (params);
      credentials->params = params;
    }
  else
    {
      response_data->http_status_code = MHD_HTTP_BAD_REQUEST;
      return gsad_message (credentials,
                          "Internal error", __FUNCTION__, __LINE__,
                          "An internal error occurred inside GSA daemon. "
                          "Diagnostics: No valid command for omp.",
                          "/omp?cmd=get_tasks", response_data);
    }


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

  /* Connect to manager */
  switch (manager_connect (credentials, &connection, response_data))
    {
      case 0:
        break;
      case -1:
        return logout (credentials,
                       "Logged out.  OMP service is down.",
                       response_data);
      case -2:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred. "
                             "Diagnostics: Could not authenticate to manager "
                             "daemon.",
                             "/omp?cmd=get_tasks",
                             response_data);
      default:
        return gsad_message (credentials,
                             "Internal error", __FUNCTION__, __LINE__,
                             "An internal error occurred. "
                             "Diagnostics: Failure to connect to manager "
                             "daemon.",
                             "/omp?cmd=get_tasks",
                             response_data);
    }

  /* Set page display settings */

  /* Show / hide charts */
  if (params_given (params, "charts"))
    {
      const char* charts;
      charts = params_value (params, "charts");
      credentials->charts = atoi (charts);
      user_set_charts (credentials->token, credentials->charts);
    }

  gettimeofday (&credentials->cmd_start, NULL);

  if (client_watch_interval)
    {
      const union MHD_ConnectionInfo *mhd_con_info;
      mhd_con_info
        = MHD_get_connection_info (con,
                                   MHD_CONNECTION_INFO_CONNECTION_FD);

      watcher_data = connection_watcher_data_new (&connection,
                                                  mhd_con_info->connect_fd);

      pthread_create (&watch_thread, NULL,
                      watch_client_connection, watcher_data);
    }
  else
    {
      watcher_data = NULL;
    }

  /** @todo Ensure that XSL passes on sort_order and sort_field. */

  /* Check cmd and precondition, start respective OMP command(s). */

  if (!strcmp (cmd, "cvss_calculator"))
    ret = cvss_calculator (&connection, credentials, params, response_data);

  else if (!strcmp (cmd, "dashboard"))
    ret = dashboard (&connection, credentials, params, response_data);

  else if (!strcmp (cmd, "new_filter"))
    ret = new_filter_omp (&connection, credentials, params, response_data);

  ELSE (new_container_task)
  ELSE (new_target)
  ELSE (new_tag)
  ELSE (new_task)
  ELSE (new_user)
  ELSE (new_alert)
  ELSE (new_group)
  ELSE (new_role)
  ELSE (get_assets_chart)
  ELSE (get_task)
  ELSE (get_tasks)
  ELSE (get_tasks_chart)
  ELSE (delete_user_confirm)
  ELSE (edit_agent)
  ELSE (edit_alert)
  ELSE (edit_asset)
  ELSE (edit_config)
  ELSE (edit_config_family)
  ELSE (edit_config_nvt)
  ELSE (edit_credential)
  ELSE (edit_filter)
  ELSE (edit_group)
  ELSE (edit_my_settings)
  ELSE (edit_note)
  ELSE (edit_override)
  ELSE (edit_permission)
  ELSE (edit_port_list)
  ELSE (edit_report_format)
  ELSE (edit_role)
  ELSE (edit_scanner)
  ELSE (edit_schedule)
  ELSE (edit_tag)
  ELSE (edit_target)
  ELSE (edit_task)
  ELSE (edit_user)
  ELSE (auth_settings)

  else if (!strcmp (cmd, "export_agent"))
    ret = export_agent_omp (&connection, credentials, params, content_type,
                            content_disposition, response_size,
                            response_data);

  else if (!strcmp (cmd, "export_agents"))
    ret = export_agents_omp (&connection, credentials, params, content_type,
                              content_disposition, response_size,
                              response_data);

  else if (!strcmp (cmd, "export_alert"))
    ret = export_alert_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size,
                             response_data);

  else if (!strcmp (cmd, "export_alerts"))
    ret = export_alerts_omp (&connection, credentials, params, content_type,
                              content_disposition, response_size,
                              response_data);

  else if (!strcmp (cmd, "export_asset"))
    ret = export_asset_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size,
                             response_data);

  else if (!strcmp (cmd, "export_assets"))
    ret = export_assets_omp (&connection, credentials, params, content_type,
                              content_disposition, response_size,
                              response_data);

  else if (!strcmp (cmd, "export_config"))
    ret = export_config_omp (&connection, credentials, params, content_type,
                              content_disposition, response_size,
                              response_data);

  else if (!strcmp (cmd, "export_configs"))
    ret = export_configs_omp (&connection, credentials, params, content_type,
                               content_disposition, response_size,
                               response_data);

  else if (!strcmp (cmd, "download_credential"))
    {
      char *html;
      gchar *credential_login;
      const char *credential_id;
      const char *package_format;

      package_format = params_value (params, "package_format");
      credential_login = NULL;
      credential_id = params_value (params, "credential_id");

      if (download_credential_omp (&connection,
                                   credentials,
                                   params,
                                   response_size,
                                   &html,
                                   &credential_login,
                                   response_data))
        ret = html;

      /* Returned above if package_format was NULL. */
      content_type_from_format_string (content_type, package_format);
      g_free (*content_disposition);
      *content_disposition = g_strdup_printf
                              ("attachment; filename=credential-%s.%s",
                               (credential_login
                                && strcmp (credential_login, ""))
                                  ? credential_login
                                  : credential_id,
                               (strcmp (package_format, "key") == 0
                                 ? "pub"
                                 : package_format));
      g_free (credential_login);

      ret = html;
    }

  else if (!strcmp (cmd, "export_credential"))
    ret = export_credential_omp (&connection, credentials, params, content_type,
                                  content_disposition, response_size,
                                  response_data);

  else if (!strcmp (cmd, "export_credentials"))
    ret = export_credentials_omp (&connection, credentials, params,
                                  content_type, content_disposition,
                                  response_size, response_data);

  else if (!strcmp (cmd, "export_filter"))
    ret = export_filter_omp (&connection, credentials, params, content_type,
                              content_disposition, response_size,
                              response_data);

  else if (!strcmp (cmd, "export_filters"))
    ret = export_filters_omp (&connection, credentials, params, content_type,
                               content_disposition, response_size,
                               response_data);

  else if (!strcmp (cmd, "export_group"))
    ret = export_group_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size,
                             response_data);

  else if (!strcmp (cmd, "export_groups"))
    ret = export_groups_omp (&connection, credentials, params, content_type,
                              content_disposition, response_size,
                              response_data);

  else if (!strcmp (cmd, "export_note"))
    ret = export_note_omp (&connection, credentials, params, content_type,
                            content_disposition, response_size,
                            response_data);

  else if (!strcmp (cmd, "export_notes"))
    ret = export_notes_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size,
                             response_data);

  else if (!strcmp (cmd, "export_omp_doc"))
    ret = export_omp_doc_omp (&connection, credentials, params, content_type,
                               content_disposition, response_size,
                               response_data);

  else if (!strcmp (cmd, "export_override"))
    ret = export_override_omp (&connection, credentials, params, content_type,
                                content_disposition, response_size,
                                response_data);

  else if (!strcmp (cmd, "export_overrides"))
    ret = export_overrides_omp (&connection, credentials, params, content_type,
                                 content_disposition, response_size,
                                 response_data);

  else if (!strcmp (cmd, "export_permission"))
    ret = export_permission_omp (&connection, credentials, params, content_type,
                                  content_disposition, response_size,
                                  response_data);

  else if (!strcmp (cmd, "export_permissions"))
    ret = export_permissions_omp (&connection, credentials, params, content_type,
                                   content_disposition, response_size,
                                   response_data);

  else if (!strcmp (cmd, "export_port_list"))
    ret = export_port_list_omp (&connection, credentials, params, content_type,
                                 content_disposition, response_size,
                                 response_data);

  else if (!strcmp (cmd, "export_port_lists"))
    ret = export_port_lists_omp (&connection, credentials, params, content_type,
                                  content_disposition, response_size,
                                  response_data);

  else if (!strcmp (cmd, "export_preference_file"))
    ret = export_preference_file_omp (&connection, credentials, params,
                                      content_type, content_disposition,
                                      response_size, response_data);

  else if (!strcmp (cmd, "export_report_format"))
    ret = export_report_format_omp (&connection, credentials, params,
                                    content_type, content_disposition,
                                    response_size, response_data);

  else if (!strcmp (cmd, "export_report_formats"))
    ret = export_report_formats_omp (&connection, credentials, params,
                                     content_type, content_disposition,
                                     response_size, response_data);

  else if (!strcmp (cmd, "export_result"))
    ret = export_result_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size, response_data);

  else if (!strcmp (cmd, "export_results"))
    ret = export_results_omp (&connection, credentials, params, content_type,
                               content_disposition, response_size,
                               response_data);

  else if (!strcmp (cmd, "export_role"))
    ret = export_role_omp (&connection, credentials, params, content_type,
                            content_disposition, response_size,
                            response_data);

  else if (!strcmp (cmd, "export_roles"))
    ret = export_roles_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size,
                             response_data);

  else if (!strcmp (cmd, "export_scanner"))
    ret = export_scanner_omp (&connection, credentials, params, content_type,
                               content_disposition, response_size,
                               response_data);

  else if (!strcmp (cmd, "export_scanners"))
    ret = export_scanners_omp (&connection, credentials, params, content_type,
                                 content_disposition, response_size,
                                response_data);

  else if (!strcmp (cmd, "export_schedule"))
    ret = export_schedule_omp (&connection, credentials, params, content_type,
                                content_disposition, response_size,
                                response_data);

  else if (!strcmp (cmd, "export_schedules"))
    ret = export_schedules_omp (&connection, credentials, params, content_type,
                                 content_disposition, response_size,
                                 response_data);

  else if (!strcmp (cmd, "export_tag"))
    ret = export_tag_omp (&connection, credentials, params, content_type,
                           content_disposition, response_size,
                           response_data);

  else if (!strcmp (cmd, "export_tags"))
    ret = export_tags_omp (&connection, credentials, params, content_type,
                            content_disposition, response_size,
                            response_data);

  else if (!strcmp (cmd, "export_target"))
    ret = export_target_omp (&connection, credentials, params, content_type,
                              content_disposition, response_size,
                              response_data);

  else if (!strcmp (cmd, "export_targets"))
    ret = export_targets_omp (&connection, credentials, params, content_type,
                               content_disposition, response_size,
                               response_data);

  else if (!strcmp (cmd, "export_task"))
    ret = export_task_omp (&connection, credentials, params, content_type,
                            content_disposition, response_size,
                            response_data);

  else if (!strcmp (cmd, "export_tasks"))
    ret = export_tasks_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size,
                             response_data);

  else if (!strcmp (cmd, "export_user"))
    ret = export_user_omp (&connection, credentials, params, content_type,
                            content_disposition, response_size,
                            response_data);

  else if (!strcmp (cmd, "export_users"))
    ret = export_users_omp (&connection, credentials, params, content_type,
                             content_disposition, response_size,
                             response_data);

  ELSE (get_agent)
  ELSE (get_agents)
  ELSE (get_asset)
  ELSE (get_assets)

  else if (!strcmp (cmd, "download_agent"))
    {
      char *html, *filename;

      if (download_agent_omp (&connection, credentials,
                              params,
                              response_size,
                              &html,
                              &filename,
                              response_data))
        ret = html;

      *content_type = GSAD_CONTENT_TYPE_OCTET_STREAM;
      g_free (*content_disposition);
      *content_disposition = g_strdup_printf ("attachment; filename=%s",
                                              filename);
      g_free (filename);

      ret = html;
    }

  else if (!strcmp (cmd, "download_ssl_cert"))
    {
      *content_type = GSAD_CONTENT_TYPE_APP_KEY;
      g_free (*content_disposition);
      *content_disposition = g_strdup_printf
                              ("attachment; filename=ssl-cert-%s.pem",
                               params_value (params, "name"));

      ret = download_ssl_cert (&connection, credentials, params, response_size,
                                response_data);
    }

  else if (!strcmp (cmd, "download_ca_pub"))
    {
      *content_type = GSAD_CONTENT_TYPE_APP_KEY;
      g_free (*content_disposition);
      *content_disposition = g_strdup_printf
                              ("attachment; filename=scanner-ca-pub-%s.pem",
                               params_value (params, "scanner_id"));
      ret = download_ca_pub (&connection, credentials, params, response_size,
                              response_data);
    }

  else if (!strcmp (cmd, "download_key_pub"))
    {
      *content_type = GSAD_CONTENT_TYPE_APP_KEY;
      g_free (*content_disposition);
      *content_disposition = g_strdup_printf
                              ("attachment; filename=scanner-key-pub-%s.pem",
                               params_value (params, "scanner_id"));
      ret = download_key_pub (&connection, credentials, params, response_size,
                               response_data);
    }

  ELSE (get_aggregate)
  ELSE (get_alert)
  ELSE (get_alerts)
  ELSE (get_credential)
  ELSE (get_credentials)
  ELSE (get_filter)
  ELSE (get_filters)
  ELSE (get_group)
  ELSE (get_groups)
  ELSE (get_info)
  ELSE (get_my_settings)
  ELSE (get_note)
  ELSE (get_notes)
  ELSE (get_override)
  ELSE (get_overrides)
  ELSE (get_permission)
  ELSE (get_permissions)
  ELSE (get_port_list)
  ELSE (get_port_lists)

  else if (!strcmp (cmd, "get_report"))
    {
      gchar *content_type_omp;
      ret = get_report_omp (&connection, credentials,
                            params,
                            response_size,
                            &content_type_omp,
                            content_disposition,
                            response_data);

      if (content_type_omp)
        {
          *content_type = GSAD_CONTENT_TYPE_DONE;
          *content_type_string = content_type_omp;
        }
    }

  ELSE (get_reports)
  ELSE (get_result)
  ELSE (get_results)
  ELSE (get_report_format)
  ELSE (get_report_formats)
  ELSE (get_report_section)
  ELSE (get_role)
  ELSE (get_roles)
  ELSE (get_scanner)
  ELSE (get_scanners)
  ELSE (get_schedule)
  ELSE (get_schedules)
  ELSE (get_system_reports)
  ELSE (get_tag)
  ELSE (get_tags)
  ELSE (get_target)
  ELSE (get_targets)
  ELSE (get_trash)
  ELSE (get_user)
  ELSE (get_users)
  ELSE (get_feeds)
  ELSE (get_config)
  ELSE (get_configs)
  ELSE (get_config_family)
  ELSE (get_config_nvt)
  ELSE (get_nvts)
  ELSE (get_protocol_doc)
  ELSE (new_agent)
  ELSE (new_host)
  ELSE (new_config)
  ELSE (new_credential)
  ELSE (new_note)
  ELSE (new_override)
  ELSE (new_permission)
  ELSE (new_permissions)
  ELSE (new_port_list)
  ELSE (new_port_range)
  ELSE (new_report_format)
  ELSE (new_scanner)
  ELSE (new_schedule)
  ELSE (upload_config)
  ELSE (upload_port_list)
  ELSE (upload_report)
  ELSE (sync_config)
  ELSE (wizard)
  ELSE (wizard_get)

  else
    {
      response_data->http_status_code = MHD_HTTP_BAD_REQUEST;
      ret = gsad_message (credentials,
                          "Internal error", __FUNCTION__, __LINE__,
                          "An internal error occurred inside GSA daemon. "
                          "Diagnostics: Unknown command.",
                          "/omp?cmd=get_tasks",
                          response_data);
    }

  if (watcher_data)
    {
      pthread_mutex_lock (&(watcher_data->mutex));
      if (watcher_data->connection_closed == 0 
          || watcher_data->openvas_connection->tls)
        {
          openvas_connection_close (watcher_data->openvas_connection);
        }
      watcher_data->connection_closed = 1;
      pthread_mutex_unlock (&(watcher_data->mutex));
      pthread_cancel (watch_thread);
      pthread_join (watch_thread, NULL);
      g_free (watcher_data);
    }
  else
    {
      openvas_connection_close (&connection);
    }

  return ret;
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
  int ret, timeout;
  gchar *value;
  gchar *locale;
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

  locale = g_strdup (setlocale (LC_ALL, NULL));
  setlocale (LC_ALL, "C");

  timeout = session_timeout * 60 + 30;

  now = time (NULL);
  expire_time = now + timeout;
  if (localtime_r (&expire_time, &expire_time_broken) == NULL)
    abort ();
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d %b %Y %T GMT",
                  &expire_time_broken);
  if (ret == 0)
    abort ();

  setlocale (LC_ALL, locale);
  g_free (locale);

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
                           "=%s; expires=%s; max-age=%d; path=/; %sHTTPonly",
                           sid,
                           expires,
                           timeout,
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
  gchar *locale;
  char expires[EXPIRES_LENGTH + 1];
  struct tm expire_time_broken;
  time_t expire_time;

  /* Set up the expires param. */
  locale = g_strdup (setlocale (LC_ALL, NULL));
  setlocale (LC_ALL, "C");

  expire_time = time (NULL);
  if (localtime_r (&expire_time, &expire_time_broken) == NULL)
    abort ();
  ret = strftime (expires, EXPIRES_LENGTH, "%a, %d %b %Y %T GMT",
                  &expire_time_broken);
  if (ret == 0)
    abort ();

  setlocale (LC_ALL, locale);
  g_free (locale);

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
      case GSAD_CONTENT_TYPE_IMAGE_SVG:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "image/svg+xml");
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
      case GSAD_CONTENT_TYPE_TEXT_JS:
        MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                 "text/javascript");
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
 * @brief Add all local IP addresses to a GHashTable.
 *
 * @param[in] hashtable       The hashtable to add the addresses to.
 * @param[in] include_ipv6    Whether to include IPv6 addresses.
 * @param[in] localhost_only  Whether to add only localhost, 127.0.0.1 and ::1.
 */
void
add_local_addresses (GHashTable *hashtable, int include_ipv6,
                     int localhost_only)
{
  struct ifaddrs *ifaddr, *ifa;
  int family, ret;
  char host[NI_MAXHOST];

  // Basic loopback addresses
  g_hash_table_add (gsad_header_hosts, g_strdup ("localhost"));
  g_hash_table_add (gsad_header_hosts, g_strdup ("127.0.0.1"));
  if (include_ipv6)
    g_hash_table_add (gsad_header_hosts, g_strdup ("::1"));

  // Other interface addresses
  if (localhost_only == 0 && getifaddrs(&ifaddr) != -1)
    {
      for (ifa = ifaddr; ifa != NULL; ifa = ifa->ifa_next)
        {
          if (ifa->ifa_addr == NULL)
            continue;

          family = ifa->ifa_addr->sa_family;

          if (family == AF_INET || (include_ipv6 && family == AF_INET6))
            {
              ret = getnameinfo(ifa->ifa_addr,
                                (family == AF_INET) 
                                  ? sizeof(struct sockaddr_in) 
                                  : sizeof(struct sockaddr_in6),
                                host, NI_MAXHOST,
                                NULL, 0, NI_NUMERICHOST);
              if (ret != 0) {
                g_warning ("%s: getnameinfo() failed: %s\n",
                           __FUNCTION__, gai_strerror(ret));
                return;
              }

              g_hash_table_insert (hashtable, g_strdup (host), NULL);
            }
        }
      freeifaddrs(ifaddr);
    }
}

/**
 * @brief Verify if a hostname or IP address refers to the gsad.
 *
 * @param[in] host  The name or address to check.
 *
 * @return 0 valid, 1 invalid.
 */
static int
host_is_gsad (const char *host)
{
  if (host == NULL)
    return 0;

  return host ? g_hash_table_contains (gsad_header_hosts, host) : 0;
}

/**
 * Verify a Host HTTP header.
 *
 * @param[in] host_header  Host header value.
 *
 * @return 0 valid, 1 invalid UTF-8, 2 otherwise invalid, -1 error.
 */
static int
validate_host_header (const char *host_header)
{
  int ret;
  int char_index, colon_index, bracket_index;
  gchar *host;

  if (host_header == NULL || strlen (host_header) == 0)
    return 2;
  else if (g_utf8_validate (host_header, -1, NULL) == FALSE)
    return 1;

  /*
   * Find brackets and colons for detecting IPv6 addresses and port.
   */
  bracket_index = -1;
  colon_index = -1;
  for (char_index = strlen (host_header) - 1;
       char_index >= 0;
       char_index --)
    {
      if (host_header[char_index] == ']' && bracket_index == -1)
        bracket_index = char_index;
      if (host_header[char_index] == ':' && colon_index == -1)
        colon_index = char_index;
    }

  if (bracket_index != -1 && host_header[0] == '['
      && (colon_index == bracket_index + 1 || colon_index < bracket_index))
    {
      /*
       * IPv6 address which starts with a square bracket and
       *  where the last colon is right after a closing bracket,
       *  e.g. "[::1]:9392" -> "::1" or inside brackets, e.g. "[::1]" -> "::1".
       */
      host = g_strndup (host_header + 1, bracket_index - 1);
    }
  else if (colon_index > 0 && bracket_index == -1)
    {
      /*
       * Hostname or IPv4 address (no brackets) with a port after the colon,
       *  e.g. "127.0.0.1:9393" -> "127.0.0.1".
       */
      host = g_strndup (host_header, colon_index);
    }
  else if (colon_index == -1 && bracket_index == -1)
    {
      /*
       * Hostname or IPv4 address (no brackets) without any colon for a port,
       *  e.g. "127.0.0.1".
       */
      host = g_strdup (host_header);
    }
  else
    {
      /*
       * Invalid because colon or brackets are in unexpected places.
       */
      host = NULL;
    }

  g_debug ("%s: header: '%s' -> host: '%s'", __FUNCTION__, host_header, host);

  ret = host_is_gsad (host) ? 0 : 2;
  g_free (host);

  return ret;
}

/**
 * @brief Sends a HTTP response.
 *
 * @param[in]  connection           The connection handle.
 * @param[in]  content              The content.
 * @param[in]  status_code          The HTTP status code.
 * @param[in]  sid                  Session ID, or NULL.
 * @param[in]  content_type         The content type.
 * @param[in]  content_disposition  The content disposition or NULL.
 * @param[in]  content_length       Content length, 0 for strlen (content).
 *
 * @return MHD_YES on success, MHD_NO on error.
 */
int
send_response (struct MHD_Connection *connection, const char *content,
               int status_code, const gchar *sid,
               enum content_type content_type,
               const char *content_disposition,
               size_t content_length)
{
  struct MHD_Response *response;
  size_t size = (content_length ? content_length : strlen (content));
  int ret;

  response = MHD_create_response_from_buffer (size, (void *) content,
                                              MHD_RESPMEM_MUST_COPY);
  gsad_add_content_type_header (response, &content_type);

  if (content_disposition)
    MHD_add_response_header (response, "Content-Disposition",
                             content_disposition);

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
  add_security_headers (response);
  ret = MHD_queue_response (connection, status_code, response);
  MHD_destroy_response (response);
  return ret;
}

/**
 * @brief Sends a HTTP redirection to an uri.
 *
 * @param[in]  connection  The connection handle.
 * @param[in]  uri         The full URI to redirect to.
 * @param[in]  user        User to add cookie for, or NULL.
 *
 * @return MHD_NO in case of a problem. Else MHD_YES.
 */
int
send_redirect_to_uri (struct MHD_Connection *connection, const char *uri,
                      user_t *user)
{
  int ret;
  struct MHD_Response *response;
  char *body;

  /* Some libmicrohttp versions get into an endless loop in https mode
     if an empty body is passed.  As a workaround and because it is
     anyway suggested by the HTTP specs, we provide a short body.  We
     assume that uri does not need to be quoted.  */
  body = g_strdup_printf ("<html><body>Code 303 - Redirecting to"
                          " <a href=\"%s\">%s<a/></body></html>\n",
                          uri, uri);
  response = MHD_create_response_from_buffer (strlen (body), body,
                                              MHD_RESPMEM_MUST_FREE);

  if (!response)
    {
      g_warning ("%s: failed to create response, dropping request",
                 __FUNCTION__);
      return MHD_NO;
    }
  ret = MHD_add_response_header (response, MHD_HTTP_HEADER_LOCATION, uri);
  if (!ret)
    {
      MHD_destroy_response (response);
      g_warning ("%s: failed to add location header, dropping request",
                 __FUNCTION__);
      return MHD_NO;
    }

  if (user)
    {
      if (attach_sid (response, user->cookie) == MHD_NO)
        {
          MHD_destroy_response (response);
          g_warning ("%s: failed to attach SID, dropping request",
                     __FUNCTION__);
          return MHD_NO;
        }
    }

  MHD_add_response_header (response, MHD_HTTP_HEADER_EXPIRES, "-1");
  MHD_add_response_header (response, MHD_HTTP_HEADER_CACHE_CONTROL, "no-cache");

  add_security_headers (response);
  ret = MHD_queue_response (connection, MHD_HTTP_SEE_OTHER, response);
  MHD_destroy_response (response);
  return ret;
}

#undef MAX_HOST_LEN

/**
 * @brief Maximum length of the host portion of the redirect address.
 */
#define MAX_HOST_LEN 1000

/**
 * @brief Sends an HTTP redirection response to an urn.
 *
 * @param[in]  connection   The connection handle.
 * @param[in]  urn          The full urn to redirect to.
 * @param[in]  user         User to add cookie for, or NULL.
 *
 * @return MHD_NO in case of a problem. Else MHD_YES.
 */
int
send_redirect_to_urn (struct MHD_Connection *connection, const char *urn,
                      user_t *user)
{
  const char *host, *protocol;
  char uri[MAX_HOST_LEN];

  host = MHD_lookup_connection_value (connection, MHD_HEADER_KIND,
                                      MHD_HTTP_HEADER_HOST);

  switch (validate_host_header (host))
    {
      case 0:
        // Header is valid
        break;
      case 1:
        // Invalid UTF-8
        send_response (connection,
                       UTF8_ERROR_PAGE ("'Host' header"),
                       MHD_HTTP_BAD_REQUEST, NULL,
                       GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
        return MHD_YES;
      case 2:
      default:
        // Otherwise invalid
        send_response (connection,
                       HOST_HEADER_ERROR_PAGE,
                       MHD_HTTP_BAD_REQUEST, NULL,
                       GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
        return MHD_YES;
    }

  protocol = MHD_lookup_connection_value (connection, MHD_HEADER_KIND,
                                          "X-Forwarded-Protocol");
  if (protocol && g_utf8_validate (protocol, -1, NULL) == FALSE)
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("'X-Forwarded-Protocol' header"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }
  else if ((protocol == NULL)
           || (strcmp(protocol, "http") && strcmp(protocol, "https")))
    {
      if (use_secure_cookie)
        protocol = "https";
      else
        protocol = "http";
    }

  snprintf (uri, sizeof (uri), "%s://%s%s", protocol, host, urn);
  return send_redirect_to_uri (connection, uri, user);
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
      con_info = g_malloc0 (sizeof (struct gsad_connection_info));
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
      send_response (connection, ERROR_PAGE, MHD_HTTP_NOT_ACCEPTABLE,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  /* Redirect every URL to the default file on the HTTPS port. */
  host = MHD_lookup_connection_value (connection,
                                      MHD_HEADER_KIND,
                                      "Host");
  switch (validate_host_header (host))
    {
      case 0:
        // Header is valid
        break;
      case 1:
        // Invalid UTF-8
        send_response (connection,
                       UTF8_ERROR_PAGE ("'Host' header"),
                       MHD_HTTP_BAD_REQUEST, NULL,
                       GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
        return MHD_YES;
      case 2:
      default:
        // Otherwise invalid
        send_response (connection,
                       HOST_HEADER_ERROR_PAGE,
                       MHD_HTTP_BAD_REQUEST, NULL,
                       GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
        return MHD_YES;
    }
  /* [IPv6 or IPv4-mapped IPv6]:port */
  if (sscanf (host, "[%" G_STRINGIFY(MAX_HOST_LEN) "[0-9a-f:.]]:%*i", name)
      == 1)
    {
      char *name6 = g_strdup_printf ("[%s]", name);
      location = g_strdup_printf (redirect_location, name6);
      g_free (name6);
    }
  /* IPv4:port */
  else if (sscanf (host, "%" G_STRINGIFY(MAX_HOST_LEN) "[^:]:%*i", name) == 1)
    location = g_strdup_printf (redirect_location, name);
  else
    location = g_strdup_printf (redirect_location, host);
  if (send_redirect_to_uri (connection, location, NULL) == MHD_NO)
    {
      g_free (location);
      return MHD_NO;
    }
  g_free (location);
  return MHD_YES;
}

/**
 * @brief At least maximum length of rfc2822 format date.
 */
#define DATE_2822_LEN 100

#ifdef SERVE_STATIC_ASSETS
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
  cmd_response_data_t response_data;

  cmd_response_data_init (&response_data);

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

  file = fopen (path, "r"); /* this file is just read and sent */

  if (file == NULL)
    {
      g_debug ("File %s failed, ", path);
      g_free (path);
      struct MHD_Response *response;

      *http_response_code = MHD_HTTP_NOT_FOUND;
      cmd_response_data_reset (&response_data);
      gchar *msg = gsad_message (NULL,
                                 NOT_FOUND_TITLE, NULL, 0,
                                 NOT_FOUND_MESSAGE,
                                 "/login/login.html", NULL);
      response = MHD_create_response_from_buffer (strlen (msg),
                                                  (void *) msg,
                                                  MHD_RESPMEM_MUST_COPY);
      g_free (msg);
      return response;
    }

  /* Guess content type. */
  if (strstr (path, ".png"))
    *content_type = GSAD_CONTENT_TYPE_IMAGE_PNG;
  else if (strstr (path, ".svg"))
    *content_type = GSAD_CONTENT_TYPE_IMAGE_SVG;
  else if (strstr (path, ".html"))
    *content_type = GSAD_CONTENT_TYPE_TEXT_HTML;
  else if (strstr (path, ".css"))
    *content_type = GSAD_CONTENT_TYPE_TEXT_CSS;
  else if (strstr (path, ".js"))
    *content_type = GSAD_CONTENT_TYPE_TEXT_JS;
  else if (strstr (path, ".txt"))
    *content_type = GSAD_CONTENT_TYPE_TEXT_PLAIN;
  /** @todo Set content disposition? */

  struct stat buf;
  g_debug ("Default file successful.\n");
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
      response_data.http_status_code = MHD_HTTP_NOT_FOUND;
      char *res = gsad_message (NULL,
                                NOT_FOUND_TITLE, NULL, 0,
                                NOT_FOUND_MESSAGE,
                                NULL, &response_data);
      *http_response_code = response_data.http_status_code;
      g_free (path);
      fclose (file);
      cmd_response_data_reset (&response_data);
      ret = MHD_create_response_from_buffer (strlen (res), (void *) res,
                                             MHD_RESPMEM_MUST_FREE);
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
  *http_response_code = response_data.http_status_code;
  cmd_response_data_reset (&response_data);
  return response;
}
#endif

/**
 * @brief Send response for handle_request.
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
  int ret;

  if (remove_cookie)
    if (remove_sid (response) == MHD_NO)
      {
        MHD_destroy_response (response);
        g_warning ("%s: failed to remove SID, dropping request",
                   __FUNCTION__);
        return MHD_NO;
      }
  gsad_add_content_type_header (response, content_type);
  if (content_disposition != NULL)
    {
      MHD_add_response_header (response, "Content-Disposition",
                               content_disposition);
      g_free (content_disposition);
    }
  ret = MHD_queue_response (connection, http_response_code, response);
  if (ret == MHD_NO)
    {
      /* Assume this was due to a bad request, to keep the MHD "Internal
       * application error" out of the log. */
      send_response (connection, BAD_REQUEST_PAGE, MHD_HTTP_NOT_ACCEPTABLE,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }
  MHD_destroy_response (response);
  return ret;
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
  if (value == NULL)
    /* http://foo/bar?key */
    return MHD_YES;
  if (key == NULL)
    {
      assert (0);
      return MHD_YES;
    }
  /* http://foo/bar?key=value */
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
 * @brief Get the client's address.
 *
 * @param[in]   conn             Connection.
 * @param[out]  client_address   Buffer to store client address. Must have at
 *                               least INET6_ADDRSTRLEN bytes.
 *
 * @return  0 success, 1 invalid UTF-8 in X-Real-IP header
 */
static int
get_client_address (struct MHD_Connection *conn, char *client_address)
{
  const char* x_real_ip;

  /* First try X-Real-IP header (unless told to ignore), then MHD connection. */

  x_real_ip = MHD_lookup_connection_value (conn,
                                           MHD_HEADER_KIND,
                                           "X-Real-IP");

  if (!ignore_http_x_real_ip
      && x_real_ip && g_utf8_validate (x_real_ip, -1, NULL) == FALSE)
    return 1;
  else if (!ignore_http_x_real_ip && x_real_ip != NULL)
    strncpy (client_address, x_real_ip, INET6_ADDRSTRLEN);
  else if (unix_socket)
    strncpy (client_address, "unix_socket", INET6_ADDRSTRLEN);
  else
    {
      const union MHD_ConnectionInfo* info;

      info = MHD_get_connection_info (conn, MHD_CONNECTION_INFO_CLIENT_ADDRESS);
      sockaddr_as_str ((struct sockaddr_storage *) info->client_addr,
                       client_address);
    }
  return 0;
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
handle_request (void *cls, struct MHD_Connection *connection,
                 const char *url, const char *method,
                 const char *version, const char *upload_data,
                 size_t * upload_data_size, void **con_cls)
{
  const char *url_base = "/";
  char *default_file = "/login/login.html", client_address[INET6_ADDRSTRLEN];
  enum content_type content_type;
  char *content_disposition = NULL;
  gsize response_size = 0;
  int http_response_code = MHD_HTTP_OK;
  const char *xml_flag = NULL;
  int ret;
  openvas_connection_t con;

  /* Never respond on first call of a GET. */
  if ((!strcmp (method, "GET")) && *con_cls == NULL)
    {
      struct gsad_connection_info *con_info;

      /* First call for this request, a GET. */

      /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
      con_info = g_malloc0 (sizeof (struct gsad_connection_info));
      con_info->params = params_new ();
      con_info->connectiontype = 2;

      *con_cls = (void *) con_info;
      return MHD_YES;
    }

  /* If called with undefined URL, abort request handler. */
  if (&url[0] == NULL)
    {
      send_response (connection, BAD_REQUEST_PAGE, MHD_HTTP_NOT_ACCEPTABLE,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  /* Prevent guest link from leading to URL redirection. */
  if (url && (url[0] == '/') && (url[1] == '/'))
    {
      gchar *msg = gsad_message (NULL,
                                 NOT_FOUND_TITLE, NULL, 0,
                                 NOT_FOUND_MESSAGE,
                                 "/login/login.html", NULL);
      send_response (connection, msg, MHD_HTTP_NOT_FOUND,
                    NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      g_free (msg);
      return MHD_YES;
    }

  /* Many Glib functions require valid UTF-8. */
  if (url && (g_utf8_validate (url, -1, NULL) == FALSE))
    {
      send_response (connection,
                     UTF8_ERROR_PAGE ("URL"),
                     MHD_HTTP_BAD_REQUEST, NULL,
                     GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  /* Only accept GET and POST methods and send ERROR_PAGE in other cases. */
  if (strcmp (method, "GET") && strcmp (method, "POST"))
    {
      send_response (connection, ERROR_PAGE, MHD_HTTP_METHOD_NOT_ALLOWED,
                     NULL, GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
      return MHD_YES;
    }

  /* Redirect the base URL to the login page.  Serve the login page
   * even if the user is already logged in.
   *
   * This might make users think that they have been logged out.  The only
   * way to logout, however, is with a token.  I guess this is where a cookie
   * would be useful. */

  g_debug ("============= url: %s\n", reconstruct_url (connection, url));

  if (!strcmp (&url[0], url_base))
    {
      return send_redirect_to_urn (connection, default_file, NULL);
    }

  if ((!strcmp (method, "GET"))
        && (!strncmp (&url[0], "/login/", strlen ("/login/")))
        && !url[strlen ("/login/")])
    {
      return send_redirect_to_urn (connection, default_file, NULL);
    }

  /* Set HTTP Header values. */

  if (!strcmp (method, "GET"))
    {
      const char *token, *cookie, *accept_language, *xml_flag;
      const char *omp_cgi_base = "/omp";
      gchar *language;
      struct MHD_Response *response;
      credentials_t *credentials;
      user_t *user;
      gchar *sid;
      char *res;

      token = NULL;
      cookie = NULL;

      xml_flag = MHD_lookup_connection_value (connection,
                                              MHD_GET_ARGUMENT_KIND,
                                              "xml");

      /* Second or later call for this request, a GET. */

      content_type = GSAD_CONTENT_TYPE_TEXT_HTML;

      /* Special case the login page, stylesheet and icon. */

      if (!strcmp (url, default_file))
        {
          time_t now;
          gchar *xml;
          char *res;
          char ctime_now[200];
          const char* accept_language;
          gchar *language;
          cmd_response_data_t response_data;
          cmd_response_data_init (&response_data);

          now = time (NULL);
          ctime_r_strip_newline (&now, ctime_now);

          accept_language = MHD_lookup_connection_value (connection,
                                                         MHD_HEADER_KIND,
                                                         "Accept-Language");
          if (accept_language
              && g_utf8_validate (accept_language, -1, NULL) == FALSE)
            {
              send_response (connection,
                             UTF8_ERROR_PAGE ("'Accept-Language' header"),
                             MHD_HTTP_BAD_REQUEST, NULL,
                             GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
              return MHD_YES;
            }
          language = accept_language_to_env_fmt (accept_language);
          xml = login_xml (NULL,
                           NULL,
                           ctime_now,
                           NULL,
                           language,
                           guest_username ? guest_username : "");
          g_free (language);
          if (xml_flag && strcmp (xml_flag, "0"))
            res = xml;
          else
            {
              res = xsl_transform (xml, &response_data);
              g_free (xml);
            }
          response = MHD_create_response_from_buffer (strlen (res), res,
                                                  MHD_RESPMEM_MUST_FREE);
          add_security_headers (response);
          cmd_response_data_reset (&response_data);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

#ifdef SERVE_STATIC_ASSETS

      if (!strcmp (url, "/favicon.ico")
          || !strcmp (url, "/favicon.gif")
          || !strcmp (url, "/robots.txt"))
        {
          response = file_content_response (NULL,
                                            connection, url,
                                            &http_response_code,
                                            &content_type,
                                            &content_disposition);
          add_security_headers (response);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        0);
        }

      /* Allow the decorative images and scripts to anyone. */

      if (strncmp (url, "/img/", strlen ("/img/")) == 0
          || strncmp (url, "/js/", strlen ("/js/")) == 0
          || strncmp (url, "/css/", strlen ("/css/")) == 0)
        {
          response = file_content_response (NULL,
                                            connection, url,
                                            &http_response_code,
                                            &content_type,
                                            &content_disposition);
          add_security_headers (response);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        0);
        }
#endif

      /* Setup credentials from token. */

      token = MHD_lookup_connection_value (connection,
                                           MHD_GET_ARGUMENT_KIND,
                                           "token");
      if (token == NULL)
        {
          g_debug ("%s: Missing token in arguments", __FUNCTION__);
          cookie = NULL;
          ret = USER_BAD_MISSING_TOKEN;
        }
      else
        {
          if (openvas_validate (validator, "token", token))
            token = NULL;

          cookie = MHD_lookup_connection_value (connection,
                                                MHD_COOKIE_KIND,
                                                SID_COOKIE_NAME);
          if (openvas_validate (validator, "token", cookie))
            cookie = NULL;

          get_client_address (connection, client_address);
          ret = get_client_address (connection, client_address);
          if (ret == 1)
            {
              send_response (connection,
                             UTF8_ERROR_PAGE ("'X-Real-IP' header"),
                             MHD_HTTP_BAD_REQUEST, NULL,
                             GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
              return MHD_YES;
            }

          ret = user_find (cookie, token, client_address, &user);
        }

      if (ret == USER_BAD_TOKEN || ret == USER_GUEST_LOGIN_FAILED
          || ret == USER_OMP_DOWN || ret == USER_GUEST_LOGIN_ERROR)
        {
          cmd_response_data_t response_data;
          cmd_response_data_init (&response_data);
          if (ret == 1)
            {
              response_data.http_status_code = MHD_HTTP_BAD_REQUEST;
              res = gsad_message (NULL,
                                  "Internal error", __FUNCTION__, __LINE__,
                                  "An internal error occurred inside GSA daemon. "
                                  "Diagnostics: Bad token.",
                                  "/omp?cmd=get_tasks", &response_data);
            }
          else
            {
              time_t now;
              gchar *xml;
              char ctime_now[200];

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              accept_language = MHD_lookup_connection_value (connection,
                                                             MHD_HEADER_KIND,
                                                             "Accept-Language");
              if (accept_language
                  && g_utf8_validate (accept_language, -1, NULL) == FALSE)
                {
                  send_response (connection,
                                UTF8_ERROR_PAGE ("'Accept-Language' header"),
                                MHD_HTTP_BAD_REQUEST, NULL,
                                GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
                  return MHD_YES;
                }
              language = accept_language_to_env_fmt (accept_language);
              xml = login_xml (ret == 6
                                ? "Login failed.  OMP service is down."
                                : (ret == -1
                                    ? "Login failed.  Error during authentication."
                                    : "Login failed."),
                               NULL,
                               ctime_now,
                               NULL,
                               language,
                               guest_username ? guest_username : "");
              response_data.http_status_code = MHD_HTTP_SERVICE_UNAVAILABLE;
              g_free (language);
              if (xml_flag && strcmp (xml_flag, "0"))
                res = xml;
              else
                {
                  res = xsl_transform (xml, &response_data);
                  g_free (xml);
                }
            }
          response = MHD_create_response_from_buffer (strlen (res), res,
                                                      MHD_RESPMEM_MUST_FREE);
          http_response_code = response_data.http_status_code;
          add_security_headers (response);
          cmd_response_data_reset (&response_data);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      if ((ret == USER_EXPIRED_TOKEN) || (ret == USER_BAD_MISSING_COOKIE)
          || (ret == USER_BAD_MISSING_TOKEN)
          || (ret == USER_IP_ADDRESS_MISSMATCH))
        {
          time_t now;
          gchar *xml;
          char *res;
          gchar *full_url;
          char ctime_now[200];
          const char *cmd;
          int export;
          cmd_response_data_t response_data;
          cmd_response_data_init (&response_data);

          now = time (NULL);
          ctime_r_strip_newline (&now, ctime_now);

          cmd = MHD_lookup_connection_value (connection,
                                             MHD_GET_ARGUMENT_KIND,
                                             "cmd");

          export = 0;
          if (cmd && g_utf8_validate (cmd, -1, NULL))
            {
              if (strncmp (cmd, "export", strlen ("export")) == 0)
                export = 1;
              else if (strcmp (cmd, "get_report") == 0)
                {
                  const char *report_format_id;

                  report_format_id = MHD_lookup_connection_value
                                      (connection,
                                       MHD_GET_ARGUMENT_KIND,
                                       "report_format_id");
                  if (report_format_id
                      && g_utf8_validate (report_format_id, -1, NULL))
                    export = 1;
                }
            }

          accept_language = MHD_lookup_connection_value (connection,
                                                         MHD_HEADER_KIND,
                                                         "Accept-Language");
          if (accept_language
              && g_utf8_validate (accept_language, -1, NULL) == FALSE)
            {
              send_response (connection,
                             UTF8_ERROR_PAGE ("'Accept-Language' header"),
                             MHD_HTTP_BAD_REQUEST, NULL,
                             GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
              return MHD_YES;
            }
          language = accept_language_to_env_fmt (accept_language);

          if ((export == 0) && strncmp (url, "/logout", strlen ("/logout")))
            {
              full_url = reconstruct_url (connection, url);
              if (full_url && g_utf8_validate (full_url, -1, NULL) == FALSE)
                {
                  g_free (full_url);
                  full_url = NULL;
                }
            }
          else
            full_url = NULL;

          if (ret == USER_EXPIRED_TOKEN)
            {
              if (strncmp (url, "/logout", strlen ("/logout")))
                response_data.http_status_code = MHD_HTTP_UNAUTHORIZED;
              else
                response_data.http_status_code = MHD_HTTP_BAD_REQUEST;
            }
          else
            response_data.http_status_code = MHD_HTTP_UNAUTHORIZED;

          xml = login_xml
                 ((ret == USER_EXPIRED_TOKEN)
                   ? (strncmp (url, "/logout", strlen ("/logout"))
                       ? "Session has expired.  Please login again."
                       : "Already logged out.")
                   : ((ret == USER_BAD_MISSING_COOKIE)
                      ? "Cookie missing or bad.  Please login again."
                      : "Token missing or bad.  Please login again."),
                  NULL,
                  ctime_now,
                  full_url ? full_url : "",
                  language,
                  guest_username ? guest_username : "");

          g_free (language);
          g_free (full_url);
          if (xml_flag && strcmp (xml_flag, "0"))
            res = xml;
          else
            {
              res = xsl_transform (xml, &response_data);
              g_free (xml);
            }

          http_response_code = response_data.http_status_code;
          response = MHD_create_response_from_buffer (strlen (res), res,
                                                      MHD_RESPMEM_MUST_FREE);
          add_security_headers (response);
          cmd_response_data_reset (&response_data);
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

      if (!strncmp (url, "/logout", strlen ("/logout")))
        {
          time_t now;
          gchar *xml;
          char ctime_now[200];
          cmd_response_data_t response_data;
          cmd_response_data_init (&response_data);

          now = time (NULL);
          ctime_r_strip_newline (&now, ctime_now);

          user_remove (user);

          accept_language = MHD_lookup_connection_value (connection,
                                                         MHD_HEADER_KIND,
                                                         "Accept-Language");
          if (accept_language
              && g_utf8_validate (accept_language, -1, NULL) == FALSE)
            {
              send_response (connection,
                             UTF8_ERROR_PAGE ("'Accept-Language' header"),
                             MHD_HTTP_BAD_REQUEST, NULL,
                             GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
              return MHD_YES;
            }
          language = accept_language_to_env_fmt (accept_language);
          xml = login_xml ("Successfully logged out.",
                           NULL,
                           ctime_now,
                           NULL,
                           language,
                           guest_username ? guest_username : "");
          g_free (language);
          http_response_code = response_data.http_status_code;
          if (xml_flag && strcmp (xml_flag, "0"))
            res = xml;
          else
            {
              res = xsl_transform (xml, &response_data);
              g_free (xml);
            }
          response = MHD_create_response_from_buffer (strlen (res), res,
                                                      MHD_RESPMEM_MUST_FREE);
          cmd_response_data_reset (&response_data);
          add_security_headers (response);
          return handler_send_response (connection,
                                        response,
                                        &content_type,
                                        content_disposition,
                                        http_response_code,
                                        1);
        }

      language = g_strdup (user->language);
      if (!language)
        /* Accept-Language: de; q=1.0, en; q=0.5 */
        {
          accept_language = MHD_lookup_connection_value
                              (connection, MHD_HEADER_KIND, "Accept-Language");
          if (accept_language
              && g_utf8_validate (accept_language, -1, NULL) == FALSE)
            {
              send_response (connection,
                             UTF8_ERROR_PAGE ("'Accept-Language' header"),
                             MHD_HTTP_BAD_REQUEST, NULL,
                             GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
              return MHD_YES;
            }
          language = accept_language_to_env_fmt (accept_language);
          credentials = credentials_new (user, language, client_address);
          g_free (language);
        }
      else
        credentials = credentials_new (user, language, client_address);

      credentials->caller = reconstruct_url (connection, url);
      if (credentials->caller
          && g_utf8_validate (credentials->caller, -1, NULL) == FALSE)
        {
          g_free (credentials->caller);
          credentials->caller = NULL;
        }

      sid = g_strdup (user->cookie);

      user_release (user);

      /* Serve the request. */

      if (!strncmp (&url[0], omp_cgi_base, strlen (omp_cgi_base)))
        {
          /* URL requests to run OMP command. */

          unsigned int res_len = 0;
          gchar *content_type_string = NULL;

          cmd_response_data_t response_data;
          cmd_response_data_init (&response_data);

          res = exec_omp_get (connection, credentials, &content_type,
                              &content_type_string, &content_disposition,
                              &response_size, &response_data);
          if (response_size > 0)
            {
              res_len = response_size;
              response_size = 0;
            }
          else
            {
              res_len = strlen (res);

              xml_flag = credentials->params
                          ? params_value (credentials->params, "xml")
                          : NULL;
              if (xml_flag && strcmp (xml_flag, "0"))
                content_type = GSAD_CONTENT_TYPE_APP_XML;
            }

          response = MHD_create_response_from_buffer (res_len, (void *) res,
                                                      MHD_RESPMEM_MUST_FREE);
          if (content_type_string)
            {
              MHD_add_response_header (response, MHD_HTTP_HEADER_CONTENT_TYPE,
                                       content_type_string);
              g_free (content_type_string);
            }

          if (response_data.redirect)
            {
              MHD_add_response_header (response, MHD_HTTP_HEADER_LOCATION,
                                       response_data.redirect);
              http_response_code = MHD_HTTP_SEE_OTHER;
            }
          else
            {
              http_response_code = response_data.http_status_code;
            }

          cmd_response_data_reset (&response_data);
        }
      /* URL does not request OMP command but perhaps a special GSAD command? */
      else if (!strncmp (&url[0], "/system_report/",
                         strlen ("/system_report/")))
        {
          params_t *params;
          gsize res_len = 0;
          const char *slave_id;

          params = params_new ();

          MHD_get_connection_values (connection, MHD_GET_ARGUMENT_KIND,
                                    params_mhd_add, params);

          params_mhd_validate (params);

          slave_id = MHD_lookup_connection_value (connection,
                                                  MHD_GET_ARGUMENT_KIND,
                                                  "slave_id");
          if (slave_id && openvas_validate (validator, "slave_id", slave_id))
            {
              g_free (sid);
              credentials_free (credentials);
              g_warning ("%s: failed to validate slave_id, dropping request",
                         __FUNCTION__);
              return MHD_NO;
            }

          cmd_response_data_t response_data;
          cmd_response_data_init (&response_data);

          /* Connect to manager */
          switch (manager_connect (credentials, &con, &response_data))
            {
              case 0:
                res = get_system_report_omp (&con,
                                             credentials,
                                             &url[0] + strlen ("/system_report/"),
                                             params,
                                             &content_type,
                                             &response_size,
                                             &response_data);
                break;
              case -1:
                res = logout (credentials,
                              "Logged out.  OMP service is down.",
                              &response_data);
                break;
              case -2:
               res = gsad_message (credentials,
                                   "Internal error", __FUNCTION__, __LINE__,
                                   "An internal error occurred. "
                                   "Diagnostics: Could not authenticate to manager "
                                   "daemon.",
                                   "/omp?cmd=get_tasks",
                                   &response_data);
                break;
              default:
                res = gsad_message (credentials,
                                    "Internal error", __FUNCTION__, __LINE__,
                                    "An internal error occurred. "
                                    "Diagnostics: Failure to connect to manager daemon.",
                                    "/omp?cmd=get_tasks",
                                    &response_data);
                break;
            }
          openvas_connection_close (&con);

          if (response_size > 0)
            {
              res_len = response_size;
            }
          else
            {
              res_len = strlen (res);
            }

          if (res == NULL)
            {
              g_free (sid);
              credentials_free (credentials);
              g_warning ("%s: failed to get system reports, dropping request",
                         __FUNCTION__);
              return MHD_NO;
            }
          response = MHD_create_response_from_buffer ((unsigned int) res_len,
                                                      res, MHD_RESPMEM_MUST_FREE);

          http_response_code = response_data.http_status_code;
          cmd_response_data_reset (&response_data);
        }
      else if (!strncmp (&url[0], "/help/",
                         strlen ("/help/")))
        {
          cmd_response_data_t response_data;
          cmd_response_data_init (&response_data);

          if (!g_ascii_isalpha (url[6]))
            {
              response_data.http_status_code = MHD_HTTP_BAD_REQUEST;
              res = gsad_message (credentials,
                                  "Invalid request", __FUNCTION__, __LINE__,
                                  "The requested help page does not exist.",
                                  "/help/contents.html", &response_data);
            }
          else
            {
              gchar **preferred_languages;
              gchar *xsl_filename = NULL;
              gchar *page = g_strndup ((gchar *) &url[6], MAX_FILE_NAME_SIZE);
              GHashTable *template_attributes;
              int template_found = 0;

              // Disallow names that would be invalid for XML elements
              if (g_regex_match_simple ("^(?!xml)[[:alpha:]_][[:alnum:]-_.]*$",
                                        page, G_REGEX_CASELESS, 0) == 0)
                {
                  g_free (page);
                  page = g_strdup ("_invalid_");
                }
              // XXX: url subsearch could be nicer and xsl transform could
              // be generalized with the other transforms.
              time_t now;
              char ctime_now[200];
              gchar *xml, *pre;
              int index;

              assert (credentials->token);

              now = time (NULL);
              ctime_r_strip_newline (&now, ctime_now);

              pre = g_markup_printf_escaped
                     ("<envelope>"
                      "<version>%s</version>"
                      "<vendor_version>%s</vendor_version>"
                      "<token>%s</token>"
                      "<time>%s</time>"
                      "<login>%s</login>"
                      "<role>%s</role>"
                      "<i18n>%s</i18n>"
                      "<charts>%i</charts>"
                      "<guest>%d</guest>"
                      "<client_address>%s</client_address>"
                      "<help><%s/></help>",
                      GSAD_VERSION,
                      vendor_version_get (),
                      credentials->token,
                      ctime_now,
                      credentials->username,
                      credentials->role,
                      credentials->language,
                      credentials->charts,
                      credentials->guest,
                      credentials->client_address,
                      page);
              xml = g_strdup_printf ("%s"
                                     "<capabilities>%s</capabilities>"
                                     "</envelope>",
                                     pre,
                                     credentials->capabilities);
              g_free (pre);

              preferred_languages = g_strsplit (credentials->language, ":", 0);

              index = 0;
              while (preferred_languages [index] && xsl_filename == NULL)
                {
                  gchar *help_language;
                  help_language = g_strdup (preferred_languages [index]);
                  xsl_filename = g_strdup_printf ("help_%s.xsl",
                                                  help_language);
                  if (access (xsl_filename, R_OK) != 0)
                    {
                      g_free (xsl_filename);
                      xsl_filename = NULL;
                      if (strchr (help_language, '_'))
                        {
                          *strchr (help_language, '_') = '\0';
                          xsl_filename = g_strdup_printf ("help_%s.xsl",
                                                          help_language);
                          if (access (xsl_filename, R_OK) != 0)
                            {
                              g_free (xsl_filename);
                              xsl_filename = NULL;
                            }
                        }
                    }
                  g_free (help_language);
                  index ++;
                }

              template_attributes
                = g_hash_table_new (g_str_hash, g_str_equal);

              g_hash_table_insert (template_attributes, "match", page);
              g_hash_table_insert (template_attributes, "mode", "help");

              // Try to find the requested page template
              if (xsl_filename)
                {
                  template_found
                    = find_element_in_xml_file (xsl_filename, "xsl:template",
                                                template_attributes);
                }

              if (template_found == 0)
                {
                  // Try finding page template again in default help
                  template_found
                    = find_element_in_xml_file ("help.xsl", "xsl:template",
                                                template_attributes);
                }

              if (template_found == 0)
                {
                  response_data.http_status_code = MHD_HTTP_NOT_FOUND;
                  res = gsad_message (credentials,
                                      NOT_FOUND_TITLE, NULL, 0,
                                      NOT_FOUND_MESSAGE,
                                      "/help/contents.html", &response_data);
                }
              else if (xsl_filename)
                {
                  res = xsl_transform_with_stylesheet (xml, xsl_filename,
                                                       &response_data);

                }
              else
                {
                  res = xsl_transform_with_stylesheet (xml, "help.xsl",
                                                       &response_data);
                }

              g_strfreev (preferred_languages);
              g_free (xsl_filename);
              g_free (page);
            }
          if (res == NULL)
            {
              response_data.http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
              res = gsad_message (credentials,
                                  "Invalid request", __FUNCTION__, __LINE__,
                                  "Error generating help page.",
                                  "/help/contents.html", &response_data);
            }
          http_response_code = response_data.http_status_code;
          response = MHD_create_response_from_buffer (strlen (res), res,
                                                      MHD_RESPMEM_MUST_FREE);
          cmd_response_data_reset (&response_data);
        }
      else
        {
          /* URL requests neither an OMP command nor a special GSAD command,
           * so it is a simple file. */
          /* Serve a file. */
#ifdef SERVE_STATIC_ASSETS
          response = file_content_response (credentials,
                                            connection, url,
                                            &http_response_code,
                                            &content_type,
                                            &content_disposition);
#else
          gchar *msg = gsad_message (NULL,
                                     NOT_FOUND_TITLE, NULL, 0,
                                     NOT_FOUND_MESSAGE,
                                     "/login/login.html", NULL);
          response = MHD_create_response_from_buffer (strlen (msg),
                                                      (void *) msg,
                                                      MHD_RESPMEM_MUST_COPY);
          g_free (msg);
#endif
        }

      if (response)
        {
          const char* cmd;

          if (credentials->params)
            cmd = params_value (credentials->params, "cmd");
          else
            cmd = NULL;

          if (attach_sid (response, sid) == MHD_NO)
            {
              g_free (sid);
              MHD_destroy_response (response);
              g_warning ("%s: failed to attach SID, dropping request",
                         __FUNCTION__);
              return MHD_NO;
            }
          g_free (sid);

          if (guest_password
              && strcmp (credentials->username, guest_username) == 0
              && cmd
              && (strcmp (cmd, "get_aggregate") == 0
                  || strcmp (cmd, "get_assets_chart") == 0
                  || strcmp (cmd, "get_tasks_chart") == 0))
            {
              add_guest_chart_content_security_headers (response);
            }
          else
            {
              add_security_headers (response);
            }

          credentials_free (credentials);
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
          credentials_free (credentials);
          g_warning ("%s: memory or file access problem, dropping request",
                     __FUNCTION__);
          return MHD_NO;
        }
    }

  if (!strcmp (method, "POST"))
    {
      user_t *user;
      const char *sid, *accept_language;
      gchar *new_sid;
      int ret;

      if (NULL == *con_cls)
        {
          /* First call for this request, a POST. */

          struct gsad_connection_info *con_info;

          /* Freed by MHD_OPTION_NOTIFY_COMPLETED callback, free_resources. */
          con_info = g_malloc0 (sizeof (struct gsad_connection_info));

          con_info->postprocessor =
            MHD_create_post_processor (connection, POST_BUFFER_SIZE,
                                       serve_post, (void *) con_info);
          if (NULL == con_info->postprocessor)
            {
              g_free (con_info);
              /* Both bad request or running out of memory will lead here, but
               * we return the Bad Request page always, to prevent bad requests
               * from leading to "Internal application error" in the log. */
              send_response (connection, BAD_REQUEST_PAGE,
                             MHD_HTTP_NOT_ACCEPTABLE, NULL,
                             GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
              return MHD_YES;
            }
          con_info->params = params_new ();
          con_info->connectiontype = 1;
          con_info->answercode = MHD_HTTP_OK;
          con_info->content_type = GSAD_CONTENT_TYPE_TEXT_HTML;
          con_info->content_disposition = NULL;
          con_info->content_length = 0;
          con_info->redirect = NULL;

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

      accept_language = MHD_lookup_connection_value (connection,
                                                     MHD_HEADER_KIND,
                                                     "Accept-Language");
      if (accept_language
          && g_utf8_validate (accept_language, -1, NULL) == FALSE)
        {
          send_response (connection,
                         UTF8_ERROR_PAGE ("'Accept-Language' header"),
                         MHD_HTTP_BAD_REQUEST, NULL,
                         GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
          return MHD_YES;
        }
      con_info->language = accept_language_to_env_fmt (accept_language);

      get_client_address (connection, client_address);
      ret = get_client_address (connection, client_address);
      if (ret == 1)
        {
          send_response (connection,
                         UTF8_ERROR_PAGE ("'X-Real-IP' header"),
                         MHD_HTTP_BAD_REQUEST, NULL,
                         GSAD_CONTENT_TYPE_TEXT_HTML, NULL, 0);
          return MHD_YES;
        }

      user = NULL;
      new_sid = NULL;
      ret = exec_omp_post (con_info, &user, &new_sid, client_address);

      if (ret == 1)
        {
          gchar *url;
          url = g_strdup_printf ("%s&token=%s",
                                 params_value (con_info->params, "text"),
                                 user->token);
          user_release (user);
          ret = send_redirect_to_urn (connection, url, user);
          g_free (url);
          return ret;
        }

      if (con_info->redirect)
        {
          ret = send_redirect_to_uri (connection, con_info->redirect, user);
          g_free (con_info->redirect);
          con_info->redirect = NULL;
        }
      else
        {
          xml_flag = con_info->params
            ? params_value (con_info->params, "xml")
            : NULL;

          if (xml_flag && strcmp (xml_flag, "0"))
            {
              content_type = GSAD_CONTENT_TYPE_APP_XML;
            }
          else
          {
            content_type = con_info->content_type;
          }

          ret = send_response (connection, con_info->response,
              con_info->answercode,
              new_sid ? new_sid : "0",
              content_type,
              con_info->content_disposition,
              con_info->content_length);
        }

      g_free (new_sid);
      return ret;
    }

  assert (0);
  g_warning ("%s: something went wrong, dropping request",
             __FUNCTION__);
  return MHD_NO;
}


/**
 * @brief Attempt to drop privileges (become another user).
 *
 * @param[in]  user_pw  User details of new user.
 *
 * @return TRUE if successfull, FALSE if failed (will g_critical in fail case).
 */
static gboolean
drop_privileges (struct passwd * user_pw)
{
  if (setgroups (0, NULL))
    {
      g_critical ("%s: failed to set groups: %s\n", __FUNCTION__,
                  strerror (errno));
      return FALSE;
    }
  if (setgid (user_pw->pw_gid))
    {
      g_critical ("%s: failed to drop group privileges: %s\n", __FUNCTION__,
                  strerror (errno));
      return FALSE;
    }
  if (setuid (user_pw->pw_uid))
    {
      g_critical ("%s: failed to drop user privileges: %s\n", __FUNCTION__,
                  strerror (errno));
      return FALSE;
    }

  return TRUE;
}

/**
 * @brief Chroot and drop privileges, if requested.
 *
 * @param[in]  do_chroot  Whether to chroot.
 * @param[in]  drop       Username to drop privileges to.  Null for no dropping.
 * @param[in]  subdir     Subdirectory of GSA_DATA_DIR to chroot or chdir to.
 *
 * @return 0 success, 1 failed (will g_critical in fail case).
 */
static int
chroot_drop_privileges (gboolean do_chroot, gchar *drop,
                        const gchar *subdir)
{
  struct passwd *user_pw;

  if (drop)
    {
      user_pw = getpwnam (drop);
      if (user_pw == NULL)
        {
          g_critical ("%s: Failed to drop privileges."
                      "  Could not determine UID and GID for user \"%s\"!\n",
                      __FUNCTION__,
                      drop);
          return 1;
        }
    }
  else
    user_pw = NULL;

  if (do_chroot)
    {
      /* Chroot into state dir. */

      if (chroot (GSA_DATA_DIR))
        {
          g_critical ("%s: Failed to chroot to \"%s\": %s\n",
                      __FUNCTION__,
                      GSA_DATA_DIR,
                      strerror (errno));
          return 1;
        }
      set_chroot_state (1);
    }

  if (user_pw && (drop_privileges (user_pw) == FALSE))
    {
      g_critical ("%s: Failed to drop privileges\n",
                  __FUNCTION__);
      return 1;
    }

  if (do_chroot)
    {
      gchar* root_face_dir = g_build_filename ("/", subdir, NULL);
      if (chdir (root_face_dir))
        {
          g_critical ("%s: failed change to chroot root directory (%s): %s\n",
                      __FUNCTION__,
                      root_face_dir,
                      strerror (errno));
          g_free (root_face_dir);
          return 1;
        }
      g_free (root_face_dir);
    }
  else
    {
      gchar* data_dir = g_build_filename (GSA_DATA_DIR, subdir, NULL);
      if (chdir (data_dir))
        {
          g_critical ("%s: failed to change to \"%s\": %s\n",
                      __FUNCTION__,
                      data_dir,
                      strerror (errno));
          g_free (data_dir);
          return 1;
        }
      g_free (data_dir);
    }

  return 0;
}

/**
 * @brief Log function callback used for GNUTLS debugging
 *
 * This is used only for debugging, thus we write to stderr.
 *
 * Fixme: It would be nice if we could use the regular log functions
 * but the order of initialization in gsad is a bit strange.
 */
static void
my_gnutls_log_func (int level, const char *text)
{
  fprintf (stderr, "[%d] (%d) %s", getpid (), level, text);
  if (*text && text[strlen (text) -1] != '\n')
    putc ('\n', stderr);
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
gsad_init ()
{
  g_debug ("Initializing the Greenbone Security Assistant...\n");

  /* Init Glib. */
  mutex = g_malloc (sizeof (GMutex));
  g_mutex_init (mutex);
  users = g_ptr_array_new ();

  /* Check for required files. */
  if (openvas_file_check_is_dir (GSA_DATA_DIR) < 1)
    {
      g_critical ("%s: Could not access %s!\n", __FUNCTION__, GSA_DATA_DIR);
      return MHD_NO;
    }

  /* Init GCRYPT. */
  /* Register thread callback structure for libgcrypt < 1.6.0. */
#if GCRYPT_VERSION_NUMBER < 0x010600
  gcry_control (GCRYCTL_SET_THREAD_CBS, &gcry_threads_pthread);
#endif

  /* Version check should be the very first call because it makes sure that
   * important subsystems are intialized.
   * We pass NULL to gcry_check_version to disable the internal version mismatch
   * test. */
  if (!gcry_check_version (NULL))
    {
      g_critical ("%s: libgcrypt version check failed\n", __FUNCTION__);
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

  g_debug ("Initialization of GSA successful.\n");
  return MHD_YES;
}

/**
 * @brief Cleanup routine for GSAD.
 *
 * This routine will stop the http server, free log resources
 * and remove the pidfile.
 */
void
gsad_cleanup ()
{
  if (redirect_pid) kill (redirect_pid, SIGTERM);
  if (unix_pid) kill (unix_pid, SIGTERM);

  MHD_stop_daemon (gsad_daemon);

  if (log_config) free_log_configuration (log_config);

  gsad_base_cleanup ();

  pidfile_remove ("gsad");
}

/**
 * @brief Handle a SIGINT signal.
 *
 * @param[in]  signal  The signal that caused this function to run.
 */
void
handle_signal_exit (int signal)
{
  termination_signal = signal;
}

/**
 * @brief Register the signal handlers.
 *
 * @todo Use sigaction () instead of signal () to register signal handlers.
 *
 * @return 0 on success, -1 on failure.
 */
static int
register_signal_handlers ()
{
  if (signal (SIGTERM, handle_signal_exit) == SIG_ERR
      || signal (SIGINT, handle_signal_exit) == SIG_ERR
      || signal (SIGHUP, SIG_IGN) == SIG_ERR
      || signal (SIGPIPE, SIG_IGN) == SIG_ERR
#ifdef USE_LIBXSLT
      || signal (SIGCHLD, SIG_IGN) == SIG_ERR)
#else
      || signal (SIGCHLD, SIG_DFL) == SIG_ERR)
#endif
    return -1;
  return 0;
}

static void
mhd_logger (void *arg, const char *fmt, va_list ap)
{
  char buf[1024];

  vsnprintf (buf, sizeof (buf), fmt, ap);
  va_end (ap);
  g_warning ("MHD: %s", buf);
}

static struct MHD_Daemon *
start_unix_http_daemon (const char *unix_socket_path,
                        int handler (void *, struct MHD_Connection *,
                                     const char *, const char *, const char *,
                                     const char *, size_t *, void **))
{
  struct sockaddr_un addr;
  struct stat ustat;
  mode_t oldmask = 0;

  unix_socket = socket (AF_UNIX, SOCK_STREAM, 0);
  if (unix_socket == -1)
    {
      g_warning ("%s: Couldn't create UNIX socket", __FUNCTION__);
      return NULL;
    }
  addr.sun_family = AF_UNIX;
  strncpy (addr.sun_path, unix_socket_path, sizeof (addr.sun_path));
  if (!stat (addr.sun_path, &ustat))
    {
      /* Remove socket so we can bind(). Keep same permissions when recreating
       * it. */
      unlink (addr.sun_path);
      oldmask = umask (~ustat.st_mode);
    }
  if (bind (unix_socket, (struct sockaddr *) &addr, sizeof (struct sockaddr_un))
      == -1)
    {
      g_warning ("%s: Error on bind(%s): %s", __FUNCTION__,
                 unix_socket_path, strerror (errno));
      return NULL;
    }
  if (oldmask)
    umask (oldmask);
  if (listen (unix_socket, 128) == -1)
    {
      g_warning ("%s: Error on listen(): %s", __FUNCTION__, strerror (errno));
      return NULL;
    }

  return MHD_start_daemon
          (MHD_USE_THREAD_PER_CONNECTION | MHD_USE_DEBUG, 0,
           NULL, NULL, handler, NULL, MHD_OPTION_NOTIFY_COMPLETED,
           free_resources, NULL, MHD_OPTION_LISTEN_SOCKET, unix_socket,
           MHD_OPTION_PER_IP_CONNECTION_LIMIT, 30,
           MHD_OPTION_EXTERNAL_LOGGER, mhd_logger, NULL, MHD_OPTION_END);
}

static struct MHD_Daemon *
start_http_daemon (int port,
                   int handler (void *, struct MHD_Connection *, const char *,
                                const char *, const char *, const char *,
                                size_t *, void **),
                   struct sockaddr_storage *address)
{
  int ipv6_flag;

  if (address->ss_family == AF_INET6)
/* LibmicroHTTPD 0.9.28 and higher. */
#if MHD_VERSION >= 0x00092800
    ipv6_flag = MHD_USE_DUAL_STACK;
#else
    ipv6_flag = MHD_USE_IPv6;
#endif
  else
    ipv6_flag = MHD_NO_FLAG;
  return MHD_start_daemon
          (MHD_USE_THREAD_PER_CONNECTION | MHD_USE_DEBUG | ipv6_flag, port,
           NULL, NULL, handler, NULL, MHD_OPTION_NOTIFY_COMPLETED,
           free_resources, NULL, MHD_OPTION_SOCK_ADDR, address,
           MHD_OPTION_PER_IP_CONNECTION_LIMIT, 30,
           MHD_OPTION_EXTERNAL_LOGGER, mhd_logger, NULL, MHD_OPTION_END);
}

static struct MHD_Daemon *
start_https_daemon (int port, const char *key, const char *cert,
                    const char *priorities, const char *dh_params,
                    struct sockaddr_storage *address)
{
  int ipv6_flag;

  if (address->ss_family == AF_INET6)
/* LibmicroHTTPD 0.9.28 and higher. */
#if MHD_VERSION >= 0x00092800
    ipv6_flag = MHD_USE_DUAL_STACK;
#else
    ipv6_flag = MHD_USE_IPv6;
#endif
  else
    ipv6_flag = MHD_NO_FLAG;
  return MHD_start_daemon
          (MHD_USE_THREAD_PER_CONNECTION | MHD_USE_DEBUG | MHD_USE_SSL
           | ipv6_flag, port, NULL, NULL, &handle_request, NULL,
           MHD_OPTION_HTTPS_MEM_KEY, key,
           MHD_OPTION_HTTPS_MEM_CERT, cert,
           MHD_OPTION_NOTIFY_COMPLETED, free_resources, NULL,
           MHD_OPTION_SOCK_ADDR, address,
           MHD_OPTION_PER_IP_CONNECTION_LIMIT, 30,
           MHD_OPTION_HTTPS_PRIORITIES, priorities,
           MHD_OPTION_EXTERNAL_LOGGER, mhd_logger, NULL,
/* LibmicroHTTPD 0.9.35 and higher. */
#if MHD_VERSION >= 0x00093500
           dh_params ? MHD_OPTION_HTTPS_MEM_DHPARAMS : MHD_OPTION_END,
           dh_params,
#endif
           MHD_OPTION_END);
}

/**
 * @brief Set port to listen on.
 *
 * @param[in]  address          Address struct for which to set the port.
 * @param[in]  port             Port to listen on.
 */
static void
gsad_address_set_port (struct sockaddr_storage *address, int port)
{
  struct sockaddr_in *gsad_address = (struct sockaddr_in *) address;
  struct sockaddr_in6 *gsad_address6 = (struct sockaddr_in6 *) address;

  gsad_address->sin_port = htons (port);
  gsad_address6->sin6_port = htons (port);
}

/**
 * @brief Initalizes the address to listen on.
 *
 * If an address is given explicitly, it will also be allowed in a Host header.
 *
 * @param[in]  address_str      Address to listen on.
 * @param[in]  port             Port to listen on.
 *
 * @return 0 on success, 1 on failure.
 */
static int
gsad_address_init (const char *address_str, int port)
{
  struct sockaddr_storage *address = g_malloc0 (sizeof (*address));
  struct sockaddr_in *gsad_address = (struct sockaddr_in *) address;
  struct sockaddr_in6 *gsad_address6 = (struct sockaddr_in6 *) address;

  gsad_address_set_port (address, port);
  if (address_str)
    {
      if (inet_pton (AF_INET6, address_str, &gsad_address6->sin6_addr) > 0)
        address->ss_family = AF_INET6;
      else if (inet_pton (AF_INET, address_str, &gsad_address->sin_addr) > 0)
        address->ss_family = AF_INET;
      else
        {
          g_warning ("Failed to create GSAD address %s", address_str);
          g_free (address);
          return 1;
        }
      g_hash_table_add (gsad_header_hosts, g_strdup (address_str));
    }
  else
    {
      gsad_address->sin_addr.s_addr = INADDR_ANY;
      gsad_address6->sin6_addr = in6addr_any;
      if (ipv6_is_enabled ())
        address->ss_family = AF_INET6;
      else
        address->ss_family = AF_INET;
    }
  address_list = g_slist_append (address_list, address);
  return 0;
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
  gchar *old_locale;
  char *locale;
  int gsad_port;
  int gsad_redirect_port = DEFAULT_GSAD_REDIRECT_PORT;
  int gsad_manager_port = DEFAULT_OPENVAS_MANAGER_PORT;
  sigset_t sigmask_all, sigmask_current;

  /* Initialise. */

  if (gsad_init () == MHD_NO)
    {
      g_critical ("%s: Initialization failed!\nExiting...\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Process command line options. */

  static gboolean do_chroot = FALSE;
  static gchar *drop = NULL;
  static gboolean foreground = FALSE;
  static gboolean http_only = FALSE;
  static gboolean print_version = FALSE;
  static gboolean no_redirect = FALSE;
  static gboolean secure_cookie = FALSE;
  static int timeout = SESSION_TIMEOUT;
  static gchar **gsad_address_string = NULL;
  static gchar **gsad_header_host_strings = NULL;
  static gchar *gsad_manager_address_string = NULL;
  static gchar *gsad_manager_unix_socket_path = NULL;
  static gchar *gsad_port_string = NULL;
  static gchar *gsad_redirect_port_string = NULL;
  static gchar *gsad_manager_port_string = NULL;
  static gchar *gsad_vendor_version_string = NULL;
  static gchar *gsad_login_label_name = NULL;
  static gchar *ssl_private_key_filename = OPENVAS_SERVER_KEY;
  static gchar *ssl_certificate_filename = OPENVAS_SERVER_CERTIFICATE;
  static gchar *dh_params_filename = NULL;
  static gchar *unix_socket_path = NULL;
  static gchar *gnutls_priorities = "NORMAL";
  static int debug_tls = 0;
  static gchar *face_name = NULL;
  static gchar *guest_user = NULL;
  static gchar *guest_pass = NULL;
  static gchar *http_frame_opts = DEFAULT_GSAD_X_FRAME_OPTIONS;
  static gchar *http_csp = DEFAULT_GSAD_CONTENT_SECURITY_POLICY;
  static gchar *http_guest_chart_frame_opts
                  = DEFAULT_GSAD_GUEST_CHART_X_FRAME_OPTIONS;
  static gchar *http_guest_chart_csp
                  = DEFAULT_GSAD_GUEST_CHART_CONTENT_SECURITY_POLICY;
  static int hsts_enabled = FALSE;
  static int hsts_max_age = DEFAULT_GSAD_HSTS_MAX_AGE;
  static gboolean ignore_x_real_ip = FALSE;
  static int verbose = 0;
  GError *error = NULL;
  GOptionContext *option_context;
  static GOptionEntry option_entries[] = {
    {"allow-header-host", '\0',
     0, G_OPTION_ARG_STRING_ARRAY, &gsad_header_host_strings,
     "Allow <host> as hostname/address part of a Host header."
     "<host>" },
    {"drop-privileges", '\0',
     0, G_OPTION_ARG_STRING, &drop,
     "Drop privileges to <user>.", "<user>" },
    {"foreground", 'f',
     0, G_OPTION_ARG_NONE, &foreground,
     "Run in foreground.", NULL},
    {"http-only", '\0',
     0, G_OPTION_ARG_NONE, &http_only,
     "Serve HTTP only, without SSL.", NULL},
    /** @todo This is 'a' in Manager. */
    {"listen", '\0',
     0, G_OPTION_ARG_STRING_ARRAY, &gsad_address_string,
     "Listen on <address>.", "<address>" },
    {"mlisten", '\0',
     0, G_OPTION_ARG_STRING, &gsad_manager_address_string,
     "Manager address.", "<address>" },
    {"port", 'p',
     0, G_OPTION_ARG_STRING, &gsad_port_string,
     "Use port number <number>.", "<number>"},
    {"mport", 'm',
     0, G_OPTION_ARG_STRING, &gsad_manager_port_string,
     "Use manager port number <number>.", "<number>"},
    {"rport", 'r',
     0, G_OPTION_ARG_STRING, &gsad_redirect_port_string,
     "Redirect HTTP from this port number <number>.", "<number>"},
    {"no-redirect", '\0',
     0, G_OPTION_ARG_NONE, &no_redirect,
     "Don't redirect HTTP to HTTPS.", NULL },
    {"verbose", 'v',
     0, G_OPTION_ARG_NONE, &verbose,
     "Has no effect.  See INSTALL for logging config.", NULL },
    {"version", 'V',
     0, G_OPTION_ARG_NONE, &print_version,
     "Print version and exit.", NULL},
    {"vendor-version", '\0',
     0, G_OPTION_ARG_STRING, &gsad_vendor_version_string,
     "Use <string> as version in interface.", "<string>"},
    {"login-label", '\0',
     0, G_OPTION_ARG_STRING, &gsad_login_label_name,
     "Use <string> as login label.", "<string>"},
    {"ssl-private-key", 'k',
     0, G_OPTION_ARG_FILENAME, &ssl_private_key_filename,
     "Use <file> as the private key for HTTPS", "<file>"},
    {"ssl-certificate", 'c',
     0, G_OPTION_ARG_FILENAME, &ssl_certificate_filename,
     "Use <file> as the certificate for HTTPS", "<file>"},
    {"dh-params", '\0',
     0, G_OPTION_ARG_FILENAME, &dh_params_filename,
     "Diffie-Hellman parameters file", "<file>"},
    {"do-chroot", '\0',
     0, G_OPTION_ARG_NONE, &do_chroot,
     "Do chroot.", NULL},
    {"secure-cookie", '\0',
     0, G_OPTION_ARG_NONE, &secure_cookie,
     "Use a secure cookie (implied when using HTTPS).", NULL},
    {"timeout", '\0',
     0, G_OPTION_ARG_INT, &timeout,
     "Minutes of user idle time before session expires.", "<number>"},
    {"client-watch-interval", '\0',
     0, G_OPTION_ARG_INT, &client_watch_interval,
     "Check if client connection was closed every <number> seconds."
     " 0 to disable. Defaults to " G_STRINGIFY (DEFAULT_CLIENT_WATCH_INTERVAL)
     " seconds.",
     "<number>"},
    {"debug-tls", 0,
     0, G_OPTION_ARG_INT, &debug_tls,
     "Enable TLS debugging at <level>", "<level>"},
    {"gnutls-priorities", '\0',
     0, G_OPTION_ARG_STRING, &gnutls_priorities,
     "GnuTLS priorities string.", "<string>"},
    {"face", 0,
     0, G_OPTION_ARG_STRING, &face_name,
     "Use interface files from subdirectory <dir>", "<dir>"},
    {"guest-username", 0,
     0, G_OPTION_ARG_STRING, &guest_user,
     "Username for guest user.  Enables guest logins.", "<name>"},
    {"guest-password", 0,
     0, G_OPTION_ARG_STRING, &guest_pass,
     "Password for guest user.  Defaults to guest username.", "<password>"},
    {"http-frame-opts", 0,
     0, G_OPTION_ARG_STRING, &http_frame_opts,
     "X-Frame-Options HTTP header.  Defaults to \""
     DEFAULT_GSAD_X_FRAME_OPTIONS "\".", "<frame-opts>"},
    {"http-csp", 0,
     0, G_OPTION_ARG_STRING, &http_csp,
     "Content-Security-Policy HTTP header.  Defaults to \""
     DEFAULT_GSAD_CONTENT_SECURITY_POLICY"\".", "<csp>"},
    {"http-guest-chart-frame-opts", 0,
     0, G_OPTION_ARG_STRING, &http_guest_chart_frame_opts,
     "X-Frame-Options HTTP header for guest charts.  Defaults to \""
     DEFAULT_GSAD_GUEST_CHART_X_FRAME_OPTIONS "\".", "<frame-opts>"},
    {"http-guest-chart-csp", 0,
     0, G_OPTION_ARG_STRING, &http_guest_chart_csp,
     "Content-Security-Policy HTTP header.  Defaults to \""
     DEFAULT_GSAD_GUEST_CHART_CONTENT_SECURITY_POLICY"\".", "<csp>"},
    {"http-sts", 0,
     0, G_OPTION_ARG_NONE, &hsts_enabled,
     "Enable HTTP Strict-Tranport-Security header.", NULL},
    {"http-sts-max-age", 0,
     0, G_OPTION_ARG_INT, &hsts_max_age,
     "max-age in seconds for HTTP Strict-Tranport-Security header."
     "  Defaults to \"" G_STRINGIFY (DEFAULT_GSAD_HSTS_MAX_AGE) "\".",
     "<max-age>"},
    {"ignore-x-real-ip", '\0',
     0, G_OPTION_ARG_NONE, &ignore_x_real_ip,
     "Do not use X-Real-IP to determine the client address.", NULL},
    {"unix-socket", '\0',
     0, G_OPTION_ARG_FILENAME, &unix_socket_path,
     "Path to unix socket to listen on", "<file>"},
    {"munix-socket", '\0',
     0, G_OPTION_ARG_FILENAME, &gsad_manager_unix_socket_path,
     "Path to Manager unix socket", "<file>"},
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
  g_option_context_free (option_context);

  http_x_frame_options = http_frame_opts;
  http_content_security_policy = http_csp;
  http_guest_chart_x_frame_options = http_guest_chart_frame_opts;
  http_guest_chart_content_security_policy = http_guest_chart_csp;

  set_http_only (!!http_only);

  if (http_only == FALSE && hsts_enabled)
    {
      http_strict_transport_security
        = g_strdup_printf ("max-age=%d",
                           hsts_max_age >= 0 ? hsts_max_age
                                             : DEFAULT_GSAD_HSTS_MAX_AGE);
    }
  else
    http_strict_transport_security = NULL;

  ignore_http_x_real_ip = ignore_x_real_ip;

  if (register_signal_handlers ())
    {
      g_critical ("Failed to register signal handlers!\n");
      exit (EXIT_FAILURE);
    }

  if (print_version)
    {
      printf ("Greenbone Security Assistant %s\n", GSAD_VERSION);
#ifdef GSAD_GIT_REVISION
      printf ("GIT revision %s\n", GSAD_GIT_REVISION);
#endif
      if (debug_tls)
        {
          printf ("gnutls %s\n", gnutls_check_version (NULL));
          printf ("libmicrohttpd %s\n", MHD_get_version ());
        }
      printf ("Copyright (C) 2010-2016 Greenbone Networks GmbH\n");
      printf ("License GPLv2+: GNU GPL version 2 or later\n");
      printf
        ("This is free software: you are free to change and redistribute it.\n"
         "There is NO WARRANTY, to the extent permitted by law.\n\n");
      exit (EXIT_SUCCESS);
    }

  if (debug_tls)
    {
      gnutls_global_set_log_function (my_gnutls_log_func);
      gnutls_global_set_log_level (debug_tls);
    }

  switch (gsad_base_init ())
    {
      case 1:
        g_critical ("%s: libxml must be compiled with thread support\n",
                    __FUNCTION__);
        exit (EXIT_FAILURE);
    }

  if (gsad_vendor_version_string)
    vendor_version_set (gsad_vendor_version_string);

  if (gsad_login_label_name)
    {
      if (label_name_set (gsad_login_label_name))
        {
          g_critical ("Invalid character in login label name\n");
          exit (EXIT_FAILURE);
        }
    }

  if (no_redirect && gsad_redirect_port_string)
    {
      g_warning ("--no-redirect option given with --rport");
      return 1;
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

#ifdef GSAD_GIT_REVISION
  g_message ("Starting GSAD version %s (GIT revision %s)\n",
             GSAD_VERSION,
             GSAD_GIT_REVISION);
#else
  g_message ("Starting GSAD version %s\n",
             GSAD_VERSION);
#endif

  /* Finish processing the command line options. */

  use_secure_cookie = secure_cookie;

  if ((timeout < 1) || (timeout > 1440))
    {
      g_critical ("%s: Timeout must be a number from 1 to 1440\n",
                  __FUNCTION__);
      exit (EXIT_FAILURE);
    }
  session_timeout = timeout;

  if (client_watch_interval < 0)
    {
      client_watch_interval = 0;
    }

  if (guest_user)
    {
      guest_username = guest_user;
      guest_password = guest_pass ? guest_pass : guest_user;
    }

  gsad_port = http_only ? DEFAULT_GSAD_HTTP_PORT : DEFAULT_GSAD_HTTPS_PORT;

  if (gsad_port_string)
    {
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
      gsad_manager_port = atoi (gsad_manager_port_string);
      if (gsad_manager_port <= 0 || gsad_manager_port >= 65536)
        {
          g_critical ("%s: Manager port must be a number between 0 and 65536\n",
                      __FUNCTION__);
          exit (EXIT_FAILURE);
        }
    }

  /* Set and test the base locale for XSLt gettext */
  old_locale = g_strdup (setlocale (LC_ALL, NULL));

  locale = setlocale (LC_ALL, "");
  if (locale == NULL)
    {
      g_warning ("%s: "
                 "Failed to set locale according to environment variables,"
                 " gettext translations are disabled.",
                 __FUNCTION__);
      set_ext_gettext_enabled (0);
    }
  else if (strcmp (locale, "C") == 0)
    {
      g_message ("%s: Locale for gettext extensions set to \"C\","
                 " gettext translations are disabled.",
                 __FUNCTION__);
      set_ext_gettext_enabled (0);
    }
  else
    {
      if (strcasestr (locale, "en_") != locale)
          {
            g_warning ("%s: Locale defined by environment variables"
                       " is not an \"en_...\" one.",
                      __FUNCTION__);
            set_ext_gettext_enabled (0);
          }

      if (strcasecmp (nl_langinfo (CODESET), "UTF-8"))
        g_warning ("%s: Locale defined by environment variables"
                   " does not use UTF-8 encoding.",
                   __FUNCTION__);

      g_debug ("%s: gettext translation extensions are enabled"
               " (using locale \"%s\").",
               __FUNCTION__, locale);
      set_ext_gettext_enabled (1);
    }

  setlocale (LC_ALL, old_locale);
  g_free (old_locale);

  init_language_lists ();

  if (gsad_redirect_port_string)
    {
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
      g_debug ("Forking...\n");
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

  if (http_only)
    no_redirect = TRUE;

  if (unix_socket_path)
    {
      /* Fork for the unix socket server. */
      g_debug ("Forking for unix socket...\n");
      pid_t pid = fork ();
      switch (pid)
        {
        case 0:
          /* Child. */
#if __linux
          if (prctl (PR_SET_PDEATHSIG, SIGKILL))
            g_warning ("%s: Failed to change parent death signal;"
                       " unix socket process will remain if parent is killed:"
                       " %s\n",
                       __FUNCTION__,
                       strerror (errno));
#endif
          break;
        case -1:
          /* Parent when error. */
          g_warning ("%s: Failed to fork for unix socket!\n", __FUNCTION__);
          exit (EXIT_FAILURE);
          break;
        default:
          /* Parent. */
          unix_pid = pid;
          no_redirect = TRUE;
          break;
        }
    }

  if (!no_redirect)
    {
      /* Fork for the redirect server. */
      g_debug ("Forking for redirect...\n");
      pid_t pid = fork ();
      switch (pid)
        {
        case 0:
          /* Child. */
#if __linux
          if (prctl (PR_SET_PDEATHSIG, SIGKILL))
            g_warning ("%s: Failed to change parent death signal;"
                       " redirect process will remain if parent is killed:"
                       " %s\n",
                       __FUNCTION__,
                       strerror (errno));
#endif
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
          no_redirect = TRUE;
          break;
        }
    }

  /* Register the cleanup function. */

  if (atexit (&gsad_cleanup))
    {
      g_critical ("%s: Failed to register cleanup function!\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Write pidfile. */

  if (pidfile_create ("gsad"))
    {
      g_critical ("%s: Could not write PID file.\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }

  /* Initialize addresses and accepted host headers for HTTP header */
  gsad_header_hosts = g_hash_table_new_full (g_str_hash, g_str_equal,
                                             g_free, NULL);

  if (gsad_address_string)
    {
      // Allow basic loopback addresses in Host header
      add_local_addresses (gsad_header_hosts, ipv6_is_enabled (), 1);
      // Listen to given addresses and allow them in Host header
      while (*gsad_address_string)
        {
          if (gsad_address_init (*gsad_address_string, gsad_port))
            return 1;
          gsad_address_string++;
        }
    }
  else
    {
      // Allow all local interface addresses in Host Header
      add_local_addresses (gsad_header_hosts, ipv6_is_enabled (), 0);
      // Listen on all addresses
      if (gsad_address_init (NULL, gsad_port))
        return 1;
    }

  if (gsad_header_host_strings)
    while (*gsad_header_host_strings)
      {
        g_hash_table_add (gsad_header_hosts,
                          g_strdup (*gsad_header_host_strings));
        gsad_header_host_strings ++;
      }

  g_debug ("Accepting %d host addresses in Host headers",
          g_hash_table_size (gsad_header_hosts));
  if (verbose)
    {
      GHashTableIter iter;
      char *hostname;
      g_hash_table_iter_init (&iter, gsad_header_hosts);
      while (g_hash_table_iter_next (&iter, (void**)(&hostname), NULL))
        {
          g_debug ("- %s\n", hostname);
        }
    }

  if (!no_redirect)
    {
      /* Start the HTTP to HTTPS redirect server. */
      GSList *list = address_list;

      while (list)
        {
         gsad_address_set_port (list->data, gsad_redirect_port);
          gsad_daemon = start_http_daemon (gsad_redirect_port, redirect_handler,
                                           list->data);
          list = list->next;
        }

      if (gsad_daemon == NULL)
        {
          g_warning ("%s: start_http_daemon redirect failed !", __FUNCTION__);
          return EXIT_FAILURE;
        }
      else
        {
          g_debug ("GSAD started successfully and is redirecting on port %d.\n",
                   gsad_redirect_port);
        }
    }
  else if (unix_socket_path && !unix_pid)
    {
      /* Start the unix socket server. */

      omp_init (gsad_manager_unix_socket_path,
                gsad_manager_address_string,
                gsad_manager_port);

      gsad_daemon = start_unix_http_daemon (unix_socket_path, handle_request);

      if (gsad_daemon == NULL)
        {
          g_warning ("%s: start_unix_http_daemon failed !", __FUNCTION__);
          return EXIT_FAILURE;
        }
      else
        {
          g_debug ("GSAD started successfully and is listening on unix"
                   " socket %s.\n",
                   unix_socket_path);
        }
    }
  else
    {
      /* Start the real server. */

      omp_init (gsad_manager_unix_socket_path,
                gsad_manager_address_string,
                gsad_manager_port);

      if (http_only)
        {
          GSList *list = address_list;

          while (list)
            {
              gsad_daemon = start_http_daemon (gsad_port, handle_request,
                                               list->data);
              if (gsad_daemon == NULL && gsad_port_string == NULL)
                {
                  g_warning ("Binding to port %d failed, trying default port"
                             " %d next.", gsad_port, DEFAULT_GSAD_PORT);
                  gsad_port = DEFAULT_GSAD_PORT;
                  gsad_address_set_port (list->data, gsad_port);
                  gsad_daemon = start_http_daemon (gsad_port, handle_request,
                                                   list->data);
                }
              list = list->next;
            }
        }
      else
        {
          gchar *ssl_private_key = NULL;
          gchar *ssl_certificate = NULL;
          gchar *dh_params = NULL;
          GSList *list = address_list;

          use_secure_cookie = 1;

          if (!g_file_get_contents (ssl_private_key_filename, &ssl_private_key,
                                    NULL, &error))
            {
              g_critical ("%s: Could not load private SSL key from %s: %s\n",
                          __FUNCTION__,
                          ssl_private_key_filename,
                          error->message);
              g_error_free (error);
              exit (EXIT_FAILURE);
            }

          if (!g_file_get_contents (ssl_certificate_filename, &ssl_certificate,
                                    NULL, &error))
            {
              g_critical ("%s: Could not load SSL certificate from %s: %s\n",
                          __FUNCTION__,
                          ssl_certificate_filename,
                          error->message);
              g_error_free (error);
              exit (EXIT_FAILURE);
            }

          if (dh_params_filename &&
              !g_file_get_contents (dh_params_filename, &dh_params, NULL,
                                    &error))
            {
              g_critical ("%s: Could not load SSL certificate from %s: %s\n",
                          __FUNCTION__, dh_params_filename, error->message);
              g_error_free (error);
              exit (EXIT_FAILURE);
            }

          while (list)
            {
              gsad_daemon = start_https_daemon
                             (gsad_port, ssl_private_key, ssl_certificate,
                              gnutls_priorities, dh_params, list->data);
              if (gsad_daemon == NULL && gsad_port_string == NULL)
                {
                  g_warning ("Binding to port %d failed, trying default port"
                             " %d next.", gsad_port, DEFAULT_GSAD_PORT);
                  gsad_port = DEFAULT_GSAD_PORT;
                  gsad_address_set_port (list->data, gsad_port);
                  gsad_daemon = start_https_daemon
                                 (gsad_port, ssl_private_key, ssl_certificate,
                                  gnutls_priorities, dh_params, list->data);
                }
              list = list->next;
            }
        }

      if (gsad_daemon == NULL)
        {
          g_critical ("%s: start_https_daemon failed!\n", __FUNCTION__);
          return EXIT_FAILURE;
        }
      else
        {
          g_debug ("GSAD started successfully and is listening on port %d.\n",
                   gsad_port);
        }
    }

  /* Chroot and drop privileges, if requested. */

  if (chroot_drop_privileges (do_chroot, drop,
                              face_name ? face_name : DEFAULT_GSAD_FACE))
    {
      if (face_name && strcmp (face_name, DEFAULT_GSAD_FACE))
        {
          g_critical ("%s: Cannot use custom face \"%s\".\n",
                      __FUNCTION__, face_name);
          exit (EXIT_FAILURE);
        }
      else
        {
          g_critical ("%s: Cannot use default face \"%s\"!\n",
                      __FUNCTION__, DEFAULT_GSAD_FACE);
          exit (EXIT_FAILURE);
        }
    }

  /* Wait forever for input or interrupts. */


  if (sigfillset (&sigmask_all))
    {
      g_critical ("%s: Error filling signal set\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }
  if (pthread_sigmask (SIG_BLOCK, &sigmask_all, &sigmask_current))
    {
      g_critical ("%s: Error setting signal mask\n", __FUNCTION__);
      exit (EXIT_FAILURE);
    }
  while (1)
    {
      if (termination_signal)
        {
          g_debug ("Received %s signal.\n", sys_siglist[termination_signal]);
          gsad_cleanup ();
          /* Raise signal again, to exit with the correct return value. */
          signal (termination_signal, SIG_DFL);
          raise (termination_signal);
        }

      if (pselect (0, NULL, NULL, NULL, NULL, &sigmask_current) == -1)
        {
          if (errno == EINTR)
            continue;
          g_critical ("%s: pselect: %s\n", __FUNCTION__, strerror (errno));
          exit (EXIT_FAILURE);
        }
    }
  return EXIT_SUCCESS;
}
