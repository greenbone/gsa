/* Greenbone Security Assistant
 * $Id$
 * Description: I18n support for Greenbone Security Assistant.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2015 Greenbone Networks GmbH
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

#ifndef _GSAD_I18N_H
#define _GSAD_I18N_H

#include <glib.h>

/**
 * @brief Default language code, used when Accept-Language header is missing.
 */
#define DEFAULT_GSAD_LANGUAGE "en"

int get_ext_gettext_enabled ();

void set_ext_gettext_enabled (int);

gchar* accept_language_to_env_fmt (const char*);

#endif /* not _GSAD_I18N_H */
