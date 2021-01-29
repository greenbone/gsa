/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
#ifndef _GSAD_GMP_ARGUMENTS_H
#define _GSAD_GMP_ARGUMENTS_H

#include <glib.h>

typedef GHashTable gmp_arguments_t;

gmp_arguments_t *
gmp_arguments_new ();

void
gmp_arguments_free (gmp_arguments_t *);

void
gmp_arguments_add (gmp_arguments_t *, const char *, const char *);

gchar *
gmp_arguments_string (gmp_arguments_t *);

gboolean
gmp_arguments_has (gmp_arguments_t *, const gchar *);

#endif
