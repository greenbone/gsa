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
 * @file gsad_user.h
 * @brief GSAD user handling
 */

#ifndef _GSAD_USER_H
#define _GSAD_USER_H

#include "gsad_params.h"

#include <glib.h>

#define USER_OK 0
#define USER_BAD_TOKEN 1
#define USER_EXPIRED_TOKEN 2
#define USER_BAD_MISSING_COOKIE 3
#define USER_BAD_MISSING_TOKEN 4
#define USER_GMP_DOWN 6
#define USER_IP_ADDRESS_MISSMATCH 7

/**
 * @brief User information type, for sessions.
 */
typedef struct user user_t;

void
user_free (user_t *user);

user_t *
user_copy (user_t *user);

int
user_find (const gchar *cookie, const gchar *token, const char *address,
           user_t **user_return);

user_t *
user_add (const gchar *username, const gchar *password, const gchar *timezone,
          const gchar *role, const gchar *capabilities,
          const gchar *language, const gchar *pw_warning, const char *address);

void
user_set_timezone (user_t *user, const gchar *timezone);

void
user_set_username (user_t *user, const gchar *username);

void
user_set_password (user_t *user, const gchar *password);

void
user_set_language (user_t *user, const gchar *language);

const gchar *
user_get_username (user_t *user);

const gchar *
user_get_password (user_t *user);

const gchar *
user_get_language (user_t *user);

const gchar *
user_get_cookie (user_t *user);

const gchar *
user_get_token (user_t *user);

const gchar *
user_get_timezone (user_t *user);

const gchar *
user_get_client_address (user_t *user);

const gchar *
user_get_role (user_t *user);

const gchar *
user_get_password_warning (user_t *user);

const gchar *
user_get_capabilities (user_t *user);

const time_t
user_get_session_timeout (user_t *user);

int
user_logout (user_t *user);

void
user_renew_session (user_t *user);

#endif /* _GSAD_USER_H_ */
