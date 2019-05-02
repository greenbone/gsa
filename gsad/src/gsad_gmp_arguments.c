/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

#include "gsad_gmp_arguments.h"

gmp_arguments_t *
gmp_arguments_new ()
{
  return g_hash_table_new_full (g_str_hash, g_str_equal, g_free, g_free);
}

void
gmp_arguments_ref (gmp_arguments_t *arguments)
{
  g_hash_table_ref (arguments);
}

void
gmp_arguments_free (gmp_arguments_t *arguments)
{
  if (arguments != NULL)
    {
      g_hash_table_unref (arguments);
    }
}

void
gmp_arguments_add (gmp_arguments_t *arguments, const gchar *key,
                   const gchar *value)
{
  g_hash_table_insert (arguments, g_strdup (key), g_strdup (value));
}

gchar *
gmp_arguments_string (gmp_arguments_t *arguments)
{
  if (arguments == NULL)
    {
      return g_strdup ("");
    }

  GHashTableIter iter;
  const gchar *key = NULL, *value = NULL;
  gchar *escaped_value;
  GString *argumentslist;

  argumentslist = g_string_new (NULL);

  g_hash_table_iter_init (&iter, arguments);
  while (g_hash_table_iter_next (&iter, (gpointer *) &key, (gpointer *) &value))
    {
      escaped_value = g_markup_escape_text (value, -1);

      g_string_append_printf (argumentslist, "%s=\"%s\" ", key, escaped_value);

      g_free (escaped_value);
    }

  gchar *retval = argumentslist->str;

  g_string_free (argumentslist, FALSE);

  return retval;
}

gboolean
gmp_arguments_has (gmp_arguments_t *arguments, const gchar *key)
{
  return g_hash_table_contains (arguments, (gconstpointer *) key);
}
