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
#include <math.h>
#include <string.h>
#include <locale.h>
#include <stdlib.h>

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad i18n"

/**
 * @brief
 */
#define GSA_XSL_TEXTDOMAIN "gsad_xsl"

/**
 * @brief Whether gettext functions are enabled
 */
static int ext_gettext_enabled = 0;

/**
 * @brief Installed languages.
 */
static GList *installed_languages = NULL;

/**
 * @brief Known language names
 */
static GHashTable *language_names = NULL;
static GHashTable *native_language_names = NULL;

/**
 * @brief Get whether gettext functions for extensions are enabled.
 *
 * @return  0 gettext is disabled, 1 gettext is enabled.
 */
int
get_ext_gettext_enabled ()
{
  return ext_gettext_enabled;
}

/**
 * @brief Enable or disable gettext functions for extensions.
 *
 * @param enabled  0 to disable, any other to enable.
 */
void
set_ext_gettext_enabled (int enabled)
{
  ext_gettext_enabled = (enabled != 0);
}

/**
 * @brief Initialize the list of available languages.
 *
 * @return 0: success, -1: error
 */
int
init_language_lists ()
{
  FILE *lang_names_file;
  const char *locale_dir_name;
  DIR *locale_dir;
  struct dirent *entry;

  if (installed_languages != NULL)
    {
      g_warning ("%s: Language lists already initialized.", __FUNCTION__);
      return -1;
    }

  /* Init data structures */
  language_names = g_hash_table_new_full (g_str_hash, g_str_equal,
                                          g_free, g_free);

  native_language_names = g_hash_table_new_full (g_str_hash, g_str_equal,
                                                 g_free, g_free);

  // installed_languages starts initialized as NULL

  /* Add presets "Browser Language" and "English" */
  installed_languages = g_list_append (installed_languages,
                                       g_strdup ("Browser Language"));
  installed_languages = g_list_append (installed_languages,
                                       g_strdup ("en"));
  g_hash_table_insert (language_names,
                       g_strdup ("Browser Language"),
                       g_strdup ("Browser Language"));
  g_hash_table_insert (native_language_names,
                       g_strdup ("Browser Language"),
                       g_strdup ("Browser Language"));
  g_hash_table_insert (language_names,
                       g_strdup ("en"), g_strdup ("English"));
  g_hash_table_insert (native_language_names,
                       g_strdup ("en"), g_strdup ("English"));

  /* Get language names */
  lang_names_file = fopen (GSA_DATA_DIR "/language_names.tsv", "r");
  if (lang_names_file)
    {
      size_t len;
      char *line = NULL;
      while (getline (&line, &len, lang_names_file) != -1)
        {
          g_strstrip (line);
          if (line [0] != '\0' && line [0] != '#')
            {
              gchar **columns;
              gchar *code, *name, *native_name;
              columns = g_strsplit (line, "\t", 3);
              code = columns [0];
              name = code ? columns [1] : NULL;
              native_name = name ? columns [2] : NULL;
              if (code && name)
                g_hash_table_insert (language_names,
                                     g_strdup (code),
                                     g_strdup (name));
              if (code && native_name)
                g_hash_table_insert (native_language_names,
                                     g_strdup (code),
                                     g_strdup (native_name));
              g_strfreev (columns);
            }
          g_free (line);
          line = NULL;
        }
      fclose (lang_names_file);
    }
  else
    {
      g_warning ("%s: Failed to open language names file: %s",
                 __FUNCTION__, strerror (errno));
    }

  /* Get installed translations */
  locale_dir_name = get_chroot_state () ? GSA_CHROOT_LOCALE_DIR 
                                        : GSA_LOCALE_DIR;
  locale_dir = opendir (locale_dir_name);

  if (locale_dir == NULL)
    {
      g_warning ("%s: Failed to open locale directory \"%s\": %s",
                 __FUNCTION__, GSA_LOCALE_DIR, strerror (errno));
      return -1;
    }

  while ((entry = readdir (locale_dir)) != 0)
    {
      if (entry->d_name[0] != '.'
          && strlen (entry->d_name) >= 2
          && entry->d_type == DT_DIR
          && strcmp (entry->d_name, "en")
          && strcmp (entry->d_name, "Browser Language"))
        {
          FILE *mo_file;
          gchar *lang_mo_path;
          lang_mo_path = g_build_filename (locale_dir_name,
                                           entry->d_name,
                                           "LC_MESSAGES",
                                           GSA_XSL_TEXTDOMAIN ".mo",
                                           NULL);

          mo_file = fopen (lang_mo_path, "r");
          if (mo_file)
            {
              fclose (mo_file);
              installed_languages
                = g_list_insert_sorted (installed_languages,
                                        g_strdup (entry->d_name),
                                        (GCompareFunc) strcmp);
            }
          else
            {
              if (errno != ENOENT)
                g_warning ("%s: Failed to open %s: %s",
                           __FUNCTION__, lang_mo_path, strerror (errno));
            }
          g_free (lang_mo_path);
        }
    }
  closedir (locale_dir);

  GString *test = g_string_new ("");
  buffer_languages_xml (test);
  g_debug ("%s: Initialized language lists", __FUNCTION__);
  g_string_free (test, TRUE);

  return 0;
}

/**
 * @brief Write the list of installed languages to a buffer as XML.
 *
 * @param[in] buffer  A GString buffer to write to.
 */
void
buffer_languages_xml (GString *buffer)
{
  GList *langs_list;
  assert (buffer);

  langs_list = g_list_first (installed_languages);

  g_string_append (buffer, "<gsa_languages>");
  while (langs_list)
    {
      gchar *lang_code, *lang_name, *native_name, *language_escaped;

      lang_code = (gchar*) langs_list->data;

      lang_name = g_hash_table_lookup (language_names, lang_code);
      if (lang_name == NULL)
        lang_name = lang_code;

      native_name = g_hash_table_lookup (native_language_names, lang_code);
      if (native_name == NULL)
        native_name = lang_name;

      language_escaped
        = g_markup_printf_escaped ("<language>"
                                   "<code>%s</code>"
                                   "<name>%s</name>"
                                   "<native_name>%s</native_name>"
                                   "</language>",
                                   lang_code,
                                   lang_name,
                                   native_name);
      g_string_append (buffer, language_escaped);
      g_free (language_escaped);
      langs_list = g_list_nth (langs_list, 1);
    }
  g_string_append (buffer, "</gsa_languages>");
}

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
accept_language_to_env_fmt (const char* accept_language)
{
  if (accept_language == NULL)
    return g_strdup (DEFAULT_GSAD_LANGUAGE);

  gchar *language;
  // TODO: Convert to a colon-separated list of codes instead of
  //        just extracting the first one
  gchar **prefs, *pref;
  prefs = g_strsplit_set (accept_language, ",;", -1);

  pref = prefs [0];
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
