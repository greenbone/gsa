/* Copyright (C) 2015-2021 Greenbone Networks GmbH
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
 * @file gsad_i18n.h
 * @brief I18n support for Greenbone Security Assistant.
 */

#ifndef _GSAD_I18N_H
#define _GSAD_I18N_H

#include <glib.h>

/**
 * @brief Default language code, used when Accept-Language header is missing.
 */
#define DEFAULT_GSAD_LANGUAGE "en"

gchar *
accept_language_to_env_fmt (const char *);

#endif /* not _GSAD_I18N_H */
