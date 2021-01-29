/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
 * @file gsad_session.c
 * @brief GSAD user session handling
 */

#include "gsad_session.h"

#include "gsad_user.h"
#include "utils.h" /* for str_equal */

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad session"

/**
 * @brief User session data.
 */
GPtrArray *users = NULL;

/**
 * @brief Mutex to prevent concurrent access to the session.
 */
static GMutex *mutex = NULL;

user_t *
session_get_user_by_id_internal (const gchar *id)
{
  int index;
  for (index = 0; index < users->len; index++)
    {
      user_t *item = (user_t *) g_ptr_array_index (users, index);
      const gchar *token = user_get_token (item);

      if (str_equal (id, token))
        {
          return item;
        }
    }

  return NULL;
}

void
session_remove_user_internal (const gchar *id)
{
  user_t *user = session_get_user_by_id_internal (id);

  if (user)
    {
      g_ptr_array_remove (users, (gpointer) user);

      user_free (user);
    }
}

void
session_add_user_internal (user_t *user)
{
  g_ptr_array_add (users, (gpointer) user_copy (user));
}

void
session_init ()
{
  mutex = g_malloc (sizeof (GMutex));
  g_mutex_init (mutex);
  users = g_ptr_array_new ();
}

/**
 * Find a user by a session identifier
 *
 * @return Return a copy of the user or NULL if not found
 */
user_t *
session_get_user_by_id (const gchar *id)
{
  user_t *user;

  g_mutex_lock (mutex);

  user = user_copy (session_get_user_by_id_internal (id));

  g_mutex_unlock (mutex);

  return user;
}

/**
 * Find the first user with the username
 *
 * @return Return a copy of the user or NULL if not found
 */
user_t *
session_get_user_by_username (const gchar *username)
{
  int index;
  user_t *user = NULL;

  g_mutex_lock (mutex);

  for (index = 0; index < users->len; index++)
    {
      user_t *item = (user_t *) g_ptr_array_index (users, index);
      const gchar *name = user_get_username (item);

      if (str_equal (name, username))
        {
          user = user_copy (item);
          break;
        }
    }

  g_mutex_unlock (mutex);

  return user;
}

/**
 * @brief Add user to the session "database"
 *
 * @param[in]  id     Unique identifier.
 * @param[in]  user   User.
 */
void
session_add_user (const gchar *id, user_t *user)
{
  g_mutex_lock (mutex);

  session_remove_user_internal (id);

  session_add_user_internal (user);

  g_mutex_unlock (mutex);
}

/**
 * @brief Remove a user from the session "database"
 *
 * @param[in]  id  Unique identifier.
 */
void
session_remove_user (const gchar *id)
{
  g_mutex_lock (mutex);

  session_remove_user_internal (id);

  g_mutex_unlock (mutex);
}

/**
 * @brief Removes all session of the user, except the one with the passed id.
 *
 * @param[in] id    ID of the session to keep
 * @param[in] user  The user to logout.
 *
 */
void
session_remove_other_sessions (const gchar *id, user_t *user)
{
  int index;

  g_mutex_lock (mutex);

  for (index = 0; index < users->len; index++)
    {
      user_t *item = (user_t *) g_ptr_array_index (users, index);

      const gchar *itemtoken = user_get_token (item);
      const gchar *itemname = user_get_username (item);
      const gchar *username = user_get_username (user);

      if (str_equal (itemname, username) && !str_equal (id, itemtoken))
        {
          g_debug ("%s: logging out user '%s', token '%s'", __func__,
                   itemname, itemtoken);
          g_ptr_array_remove (users, (gpointer) item);

          user_free (item);

          index--;
        }
    }

  g_mutex_unlock (mutex);
}
