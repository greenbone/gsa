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
 * @file gsad_session.h
 * @brief GSAD user session handling
 */

#ifndef _GSAD_SESSION_H
#define _GSAD_SESSION_H

#include "gsad_user.h"

#include <glib.h>

void
session_add_user (const gchar *id, user_t *user);

void
session_remove_user (const gchar *id);

user_t *
session_get_user_by_id (const gchar *id);

user_t *
session_get_user_by_username (const gchar *username);

void
session_remove_other_sessions (const gchar *id, user_t *user);

void
session_init ();

#endif
