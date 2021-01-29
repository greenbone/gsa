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
 * @file gsad_credentials.h
 * @brief GSAD credentials handling
 */

#ifndef _GSAD_CREDENTIALS_H
#define _GSAD_CREDENTIALS_H

#include "gsad_user.h"

#include <glib.h>

typedef struct credentials credentials_t;

credentials_t *
credentials_new (user_t *user, const gchar *language);

void
credentials_free (credentials_t *creds);

user_t *
credentials_get_user (credentials_t *creds);

const gchar *
credentials_get_current_page (credentials_t *creds);

const gchar *
credentials_get_language (credentials_t *creds);

void
credentials_start_cmd (credentials_t *creds);

double
credentials_get_cmd_duration (credentials_t *creds);

#endif /* _GSAD_CREDENTIALS_H */
