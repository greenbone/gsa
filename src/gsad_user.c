/* Greenbone Security Assistant
 * $Id$
 * Description: GSAD user handling
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

#include "gsad_user.h"
#include "gsad_base.h" /* for set_language_code */
#include "gsad_settings.h"
#include "gsad_omp_auth.h"

#include <assert.h> /* for asset */
#include <string.h> /* for strcmp */

#include <gvm/util/uuidutils.h> /* for gvm_uuid_make */


/**
 * @brief User session data.
 */
GPtrArray *users = NULL;

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
  const gchar * guest_username = get_guest_username ();

  g_mutex_lock (mutex);
  for (index = 0; index < users->len; index++)
    {
      user_t *item;
      item = (user_t*) g_ptr_array_index (users, index);
      if (strcmp (item->username, username) == 0)
        {
          if (time (NULL) - item->time > (get_session_timeout () * 60))
            g_ptr_array_remove (users, (gpointer) item);
        }
    }
  user = g_malloc (sizeof (user_t));
  user->cookie = gvm_uuid_make ();
  user->token = gvm_uuid_make ();
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
  const gchar * guest_username = get_guest_username ();
  const gchar * guest_password = get_guest_password ();
  int session_timeout = get_session_timeout ();

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
      if (time (NULL) - user->time > (get_session_timeout () * 60))
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

credentials_t *
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
  credentials->sid = g_strdup (user->cookie);

  return credentials;
}

void
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
  g_free (creds->sid);
  /* params, chart_prefs and last_filt_ids are not duplicated. */
  g_free (creds);
}

/**
 * @brief Removes the users token
 *
 * @param[in]  credentials  Use credentials.
 *
 * @return 0 success, -1 error.
 */
int
logout (credentials_t *credentials)
{
  if (credentials->token == NULL)
    return 0;

  return token_user_remove (credentials->token);
}

void
init_users ()
{
  mutex = g_malloc (sizeof (GMutex));
  g_mutex_init (mutex);
  users = g_ptr_array_new ();
}

