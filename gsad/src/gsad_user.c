/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file gsad_user.c
 * @brief GSAD user handling
 */

#include "gsad_user.h"

#include "gsad_base.h" /* for set_language_code */
#include "gsad_gmp_auth.h"
#include "gsad_session.h"
#include "gsad_settings.h"
#include "utils.h"

#include <assert.h>             /* for asset */
#include <gvm/util/uuidutils.h> /* for gvm_uuid_make */
#include <string.h>             /* for strcmp */

#define BROWSER_LANGUAGE "Browser Language"

/**
 * @brief User information structure, for sessions.
 */
struct user
{
  gchar *cookie;       ///< Cookie token.
  gchar *token;        ///< Request session token.
  gchar *username;     ///< Login name.
  gchar *password;     ///< Password.
  gchar *role;         ///< Role.
  gchar *timezone;     ///< Timezone.
  gchar *capabilities; ///< Capabilities.
  gchar *language;     ///< User Interface Language.
  gchar *pw_warning;   ///< Password policy warning.
  gchar *address;      ///< Client's IP address.
  time_t time;         ///< Login time.
};

void
user_renew_session (user_t *user)
{
  user->time = time (NULL);
}

user_t *
user_new ()
{
  user_t *user = g_malloc0 (sizeof (user_t));
  return user;
}

user_t *
user_new_with_data (const gchar *username, const gchar *password,
                    const gchar *timezone,
                    const gchar *role, const gchar *capabilities,
                    const gchar *language, const gchar *pw_warning,
                    const gchar *address)
{
  user_t *user = user_new ();

  user->cookie = gvm_uuid_make ();
  user->token = gvm_uuid_make ();

  user->username = g_strdup (username);
  user->password = g_strdup (password);
  user->timezone = g_strdup (timezone);
  user->role = g_strdup (role);
  user->capabilities = g_strdup (capabilities);
  user->language = g_strdup (language);
  user->pw_warning = g_strdup (pw_warning);
  user->address = g_strdup (address);

  user_set_language (user, language);
  user_renew_session (user);

  return user;
}

void
user_free (user_t *user)
{
  if (!user)
    {
      return;
    }

  g_free (user->cookie);
  g_free (user->token);
  g_free (user->username);
  g_free (user->password);
  g_free (user->role);
  g_free (user->timezone);
  g_free (user->capabilities);
  g_free (user->language);
  g_free (user->pw_warning);
  g_free (user->address);
  g_free (user);
}

user_t *
user_copy (user_t *user)
{
  if (!user)
    {
      return NULL;
    }

  user_t *copy = user_new ();

  copy->cookie = g_strdup (user->cookie);
  copy->token = g_strdup (user->token);
  copy->username = g_strdup (user->username);
  copy->password = g_strdup (user->password);
  copy->role = g_strdup (user->role);
  copy->timezone = g_strdup (user->timezone);
  copy->capabilities = g_strdup (user->capabilities);
  copy->language = g_strdup (user->language);
  copy->pw_warning = g_strdup (user->pw_warning);
  copy->address = g_strdup (user->address);
  copy->time = user->time;

  return copy;
}

gboolean
user_session_expired (user_t *user)
{
  return (time (NULL) - user->time) > (get_session_timeout () * 60);
}

const gchar *
user_get_username (user_t *user)
{
  return user->username;
}

const gchar *
user_get_language (user_t *user)
{
  return user->language;
}

const gchar *
user_get_cookie (user_t *user)
{
  return user->cookie;
}

const gchar *
user_get_token (user_t *user)
{
  return user->token;
}

const gchar *
user_get_capabilities (user_t *user)
{
  return user->capabilities;
}

const gchar *
user_get_password_warning (user_t *user)
{
  return user->pw_warning;
}

const gchar *
user_get_timezone (user_t *user)
{
  return user->timezone;
}

const gchar *
user_get_client_address (user_t *user)
{
  return user->address;
}

const gchar *
user_get_role (user_t *user)
{
  return user->role;
}

const gchar *
user_get_password (user_t *user)
{
  return user->password;
}

const time_t
user_get_session_timeout (user_t *user)
{
  return user->time + (get_session_timeout () * 60);
}

/**
 * @brief Set timezone of user.
 *
 * @param[in]   user      User.
 * @param[in]   timezone  Timezone.
 *
 */
void
user_set_timezone (user_t *user, const gchar *timezone)
{
  g_free (user->timezone);

  user->timezone = g_strdup (timezone);
}

/**
 * @brief Set password of user.
 *
 * @param[in]   user      User.
 * @param[in]   password  Password.
 *
 */
void
user_set_password (user_t *user, const gchar *password)
{
  g_free (user->password);
  g_free (user->pw_warning);

  user->password = g_strdup (password);
  user->pw_warning = NULL;
}

/**
 * @brief Set language of user.
 *
 * @param[in]   user      User.
 * @param[in]   language  Language.
 *
 */
void
user_set_language (user_t *user, const gchar *language)
{
  g_free (user->language);

  if (language == NULL || str_equal (language, BROWSER_LANGUAGE))
    {
      user->language = NULL;
    }
  else
    {
      user->language = g_strdup (language);
    }
}

/**
 * @brief Set username of user.
 *
 * @param[in]   user      User.
 * @param[in]   username  Username.
 *
 */
void
user_set_username (user_t *user, const gchar *username)
{
  g_free (user->username);
  user->username = g_strdup (username);
}

/**
 * @brief Logout a user
 *
 * @param[in]  user  User.
 *
 * @return 0 success, -1 error.
 */
int
user_logout (user_t *user)
{
  user_t *fuser = session_get_user_by_id (user->token);

  if (fuser)
    {
      session_remove_user (fuser->token);
      user_free (fuser);
      return 0;
    }

  return -1;
}

/**
 * @brief Add a user.
 *
 * Creates and initializes a user object with given parameters
 *
 * It's up to the caller to free the returned user.
 *
 * @param[in]  username      Name of user.
 * @param[in]  password      Password for user.
 * @param[in]  timezone      Timezone of user.
 * @param[in]  role          Role of user.
 * @param[in]  capabilities  Capabilities of manager.
 * @param[in]  language      User Interface Language (language name or code)
 * @param[in]  pw_warning    Password policy warning.
 * @param[in]  address       Client's IP address.
 *
 * @return Added user.
 */
user_t *
user_add (const gchar *username, const gchar *password, const gchar *timezone,
          const gchar *role, const gchar *capabilities,
          const gchar *language, const gchar *pw_warning, const char *address)
{
  user_t *user = session_get_user_by_username (username);

  if (user && user_session_expired (user))
    {
      session_remove_user (user->token);
      user_free (user);
    }

  user = user_new_with_data (username, password, timezone, role,
                             capabilities, language, pw_warning, address);

  session_add_user (user->token, user);

  return user;
}

/**
 * @brief Find a user, given a token and cookie.
 *
 * If a user is returned, the session of the user is renewed and it's up to the
 * caller to free the user.
 *
 * @param[in]   cookie       Token in cookie.
 * @param[in]   token        Token request parameter.
 * @param[in]   address      Client's IP address.
 * @param[out]  user_return  Copy of the User or NULL in error cases.
 *
 * @return 0 ok (user in user_return),
 *         1 bad token,
 *         2 expired token,
 *         3 bad/missing cookie,
 *         4 bad/missing token,
 *         7 IP address mismatch,
 */
int
user_find (const gchar *cookie, const gchar *token, const char *address,
           user_t **user_return)
{
  user_t *user = NULL;
  if (token == NULL)
    return USER_BAD_MISSING_TOKEN;

  user = session_get_user_by_id (token);

  if (user)
    {
      if (user_session_expired (user))
        {
          session_remove_user (user->token);
          user_free (user);
          return USER_EXPIRED_TOKEN;
        }

      else if ((cookie == NULL) || !str_equal (user->cookie, cookie))
        {
          user_free (user);
          return USER_BAD_MISSING_COOKIE;
        }

      /* Verify that the user address matches the client's address. */
      else if (address == NULL || !str_equal (address, user->address))
        {
          user_free (user);
          return USER_IP_ADDRESS_MISSMATCH;
        }
      else
        {
          session_add_user (user->token, user);

          *user_return = user;
          return USER_OK;
        }
    }

  /* should it be really USER_EXPIRED_TOKEN?
   * No user has been found therefore the token couldn't even expire */
  return USER_EXPIRED_TOKEN;
}
