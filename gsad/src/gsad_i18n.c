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
 * @file gsad_i18n.c
 * @brief I18n support for Greenbone Security Assistant.
 */

#define _GNU_SOURCE

#include "gsad_i18n.h"

#include "gsad_base.h"

#include <assert.h>
#include <dirent.h>
#include <errno.h>
#include <glib.h>
#include <libintl.h>
#include <libxml/xpath.h>
#include <libxml/xpathInternals.h>
#include <locale.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad i18n"

/**
 * @brief Convert an Accept-Language string to the LANGUAGE env variable form.
 *
 * Converts the language preferences as defined in a HTTP Accept-Language
 *  header to a colon-separated list of language codes as used by gettext
 *  in the LANGUAGE environment variable.
 *
 * @param[in]   accept_language  HTTP Accept-Language header text.
 * @return      Newly allocated string of language codes as used by gettext. If
 *              accept_language is NULL or it doesn't contain a language
 *              DEFAULT_GSAD_LANGUAGE is returned.
 */
gchar *
accept_language_to_env_fmt (const char *accept_language)
{
  if (accept_language == NULL)
    return g_strdup (DEFAULT_GSAD_LANGUAGE);

  gchar *language;
  // TODO: Convert to a colon-separated list of codes instead of
  //        just extracting the first one
  gchar **prefs, *pref;
  prefs = g_strsplit_set (accept_language, ",;", -1);

  pref = prefs[0];
  if (pref)
    {
      char *pos;
      g_strstrip (pref);
      pos = pref;
      while (pos[0] != '\0')
        {
          if (pos[0] == '-')
            pos[0] = '_';
          pos++;
        };
    }
  language = g_strdup (pref ? pref : DEFAULT_GSAD_LANGUAGE);
  g_strfreev (prefs);

  return language;
}
