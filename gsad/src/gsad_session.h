/* Greenbone Security Assistant

 * Description: GSAD user session handling
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

#ifndef _GSAD_SESSION_H
#define _GSAD_SESSION_H

#include <glib.h>

#include "gsad_user.h"

void session_add_user (const gchar *id, user_t *user);

void session_remove_user (const gchar *id);

user_t *session_get_user_by_id (const gchar *id);

user_t *session_get_user_by_username (const gchar *username);

void session_remove_other_sessions (const gchar *id, user_t *user);

void session_init ();

#endif