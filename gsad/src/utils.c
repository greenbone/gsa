/* Copyright (C) 2018 Greenbone Networks GmbH
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

/**
 * @file utils.c
 * @brief Utility functions in GSAD
 */

#include "utils.h"

#include <string.h> // For strcmp

/**
 * @brief Check if two strings are equal
 *
 * @return TRUE if string are equal
 */
gboolean
str_equal (const gchar *str1, const gchar *str2)
{
  return strcmp (str1, str2) == 0;
}

/**
 * @brief Capitalize a type or command name and replace underscores.
 *
 * @param[in]  input  The input string.
 *
 * @return The newly allocated capitalized type or command name.
 */
gchar *
capitalize (const char *input)
{
  gchar *output;
  if (input == NULL)
    return NULL;
  else
    {
      int first_letter = 1;
      int pos = 0;
      output = g_strdup (input);

      while (output[pos])
        {
          if (g_ascii_isalpha (output[pos]) && first_letter)
            {
              output[pos] = g_ascii_toupper (output[pos]);
              first_letter = 0;
            }
          else if (output[pos] == '_')
            {
              output[pos] = ' ';
              first_letter = 1;
            }
          pos++;
        }
      return output;
    }
}
