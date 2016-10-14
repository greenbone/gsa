/* Greenbone Security Assistant
 * $Id$
 * Description: Translation libxslt extension of Greenbone Security Assistant.
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

#include "xslt_i18n.h"
#include "gsad_base.h"
#include <assert.h>
#include <dirent.h>
#include <errno.h>
#include <glib.h>
#include <libintl.h>
#include <libxml/xpath.h>
#include <libxml/xpathInternals.h>
#include <libxslt/xsltutils.h>
#include <math.h>
#include <string.h>
#include <locale.h>
#include <stdlib.h>

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad xslt"

#ifndef GETTEXT_CONTEXT_GLUE
#define GETTEXT_CONTEXT_GLUE "\004"
#endif /* not GETTEXT_CONTEXT_GLUE */

/**
 * @brief Namespace URI for the i18n XSLT extension
 */
#define GSA_I18N_EXT_URI "http://openvas.org/i18n"

/**
 * @brief
 */
#define GSA_XSL_TEXTDOMAIN "gsad_xsl"

/**
 * @brief mutex for locale environment variables
 */
static GMutex locale_env_mutex;

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
 * @brief XSLT extension function: gettext wrapper
 *
 * @param[in] ctxt    XPath parser context
 * @param[in] nargs   Number of arguments
 */
static void
xslt_ext_gettext (xmlXPathParserContextPtr ctxt,
                  int nargs)
{
  xmlXPathObjectPtr lang_obj, msgid_obj, context_obj;
  xmlChar* result_str;
  xmlXPathObjectPtr result_obj;

  /*
   * Function arguments:
   * - language
   * - msgid
   * - context (optional)
   */

  if (nargs < 2 || nargs > 3)
    {
      xsltGenericError (xsltGenericErrorContext,
                        "gettext : Expected 2 or 3 arguments, got %d\n",
                        nargs);
      return;
    }

  if (nargs == 3)
    {
      context_obj = valuePop (ctxt);
      if (context_obj->type != XPATH_STRING)
        {
          valuePush (ctxt, context_obj);
          xmlXPathStringFunction (ctxt, 1);
          context_obj = valuePop (ctxt);
        }
    }
  else
    context_obj = NULL;

  msgid_obj = valuePop (ctxt);
  if (msgid_obj->type != XPATH_STRING)
    {
      valuePush (ctxt, msgid_obj);
      xmlXPathStringFunction (ctxt, 1);
      msgid_obj = valuePop (ctxt);
    }

  lang_obj = valuePop (ctxt);
  if (lang_obj->type != XPATH_STRING)
    {
      valuePush (ctxt, lang_obj);
      xmlXPathStringFunction (ctxt, 1);
      lang_obj = valuePop (ctxt);
    }

  if (ext_gettext_enabled == 0)
    {
      valuePush (ctxt, msgid_obj);

      xmlXPathFreeObject (lang_obj);
      if (context_obj)
        xmlXPathFreeObject (context_obj);

      return;
    }

  if (msgid_obj->stringval && strcmp ((char*) msgid_obj->stringval, ""))
    {
      gchar *old_locale;
      char *old_LANGUAGE;
      gchar *msgid = NULL;
      char *gettext_result = NULL;

      g_mutex_lock (&locale_env_mutex);

      old_locale = g_strdup (setlocale (LC_ALL, NULL));
      old_LANGUAGE = getenv ("LANGUAGE");
      setenv ("LANGUAGE", (char*)lang_obj->stringval, 1);
      setlocale (LC_ALL, "");

      if (context_obj)
        msgid = g_strdup_printf ("%s%s%s",
                                 (gchar*) context_obj->stringval,
                                 GETTEXT_CONTEXT_GLUE,
                                 (gchar*) msgid_obj->stringval);
      else
        msgid = g_strdup ((gchar*) msgid_obj->stringval);

      textdomain (GSA_XSL_TEXTDOMAIN);
      gettext_result = gettext (msgid);
      result_str = (xmlChar*) g_strdup ((gettext_result != msgid)
                                        ? gettext_result
                                        : "### N/A ###");
      g_free (msgid);

      if (old_LANGUAGE)
        setenv ("LANGUAGE", old_LANGUAGE, 1);
      else
        unsetenv ("LANGUAGE");
      setlocale (LC_ALL, old_locale);
      g_free (old_locale);

      g_mutex_unlock (&locale_env_mutex);
    }
  else
    result_str = (xmlChar*) g_strdup ("");

  result_obj = xmlXPathNewString (result_str);

  xmlXPathFreeObject (lang_obj);
  xmlXPathFreeObject (msgid_obj);
  if (context_obj)
    xmlXPathFreeObject (context_obj);
  g_free (result_str);

  valuePush (ctxt, result_obj);
}

/**
 * @brief XSLT extension function: ngettext wrapper
 *
 * @param[in] ctxt    XPath parser context
 * @param[in] nargs   Number of arguments
 */
static void
xslt_ext_ngettext (xmlXPathParserContextPtr ctxt,
                  int nargs)
{
  xmlXPathObjectPtr lang_obj, msgid_obj, msgid_pl_obj, count_obj, context_obj;
  xmlChar* result_str;
  xmlXPathObjectPtr result_obj;

  /*
   * Function arguments:
   * - language
   * - msgid
   * - msgid_plural
   * - count
   * - context (optional)
   */

  if (nargs < 4 || nargs > 5)
    {
      xsltGenericError (xsltGenericErrorContext,
                        "ngettext : Expected 4 or 5 arguments, got %d\n",
                        nargs);
      return;
    }

  if (nargs == 5)
    {
      context_obj = valuePop (ctxt);
      if (context_obj->type != XPATH_STRING)
        {
          valuePush (ctxt, context_obj);
          xmlXPathStringFunction (ctxt, 1);
          context_obj = valuePop (ctxt);
        }
    }
  else
    context_obj = NULL;

  count_obj = valuePop (ctxt);
  if (count_obj->type != XPATH_NUMBER)
    {
      valuePush (ctxt, count_obj);
      xmlXPathNumberFunction (ctxt, 1);
      count_obj = valuePop (ctxt);

      if (count_obj->type != XPATH_NUMBER || isnan (count_obj->floatval))
        xsltGenericError (xsltGenericErrorContext,
                          "ngettext : 4th argument cannot be converted"
                          " to a valid number\n");
    }

  msgid_pl_obj = valuePop (ctxt);
  if (msgid_pl_obj->type != XPATH_STRING)
    {
      valuePush (ctxt, msgid_pl_obj);
      xmlXPathStringFunction (ctxt, 1);
      msgid_pl_obj = valuePop (ctxt);
    }

  msgid_obj = valuePop (ctxt);
  if (msgid_obj->type != XPATH_STRING)
    {
      valuePush (ctxt, msgid_obj);
      xmlXPathStringFunction (ctxt, 1);
      msgid_obj = valuePop (ctxt);
    }

  lang_obj = valuePop (ctxt);
  if (lang_obj->type != XPATH_STRING)
    {
      valuePush (ctxt, lang_obj);
      xmlXPathStringFunction (ctxt, 1);
      lang_obj = valuePop (ctxt);
    }

  if (ext_gettext_enabled == 0)
    {
      unsigned long count;

      count = (unsigned long) count_obj->floatval;

      if (count == 1)
        {
          xmlXPathFreeObject (msgid_pl_obj);
          valuePush (ctxt, msgid_obj);
        }
      else
        {
          xmlXPathFreeObject (msgid_obj);
          valuePush (ctxt, msgid_pl_obj);
        }

      xmlXPathFreeObject (lang_obj);
      xmlXPathFreeObject (count_obj);
      if (context_obj)
        xmlXPathFreeObject (context_obj);

      return;
    }

  if (msgid_obj->stringval && strcmp ((char*) msgid_obj->stringval, ""))
    {
      gchar *old_locale;
      char *old_LANGUAGE;
      gchar *msgid = NULL;
      gchar *msgid_pl = NULL;
      unsigned long count;
      char *gettext_result = NULL;

      g_mutex_lock (&locale_env_mutex);

      old_locale = g_strdup (setlocale (LC_ALL, NULL));
      old_LANGUAGE = getenv ("LANGUAGE");
      setenv ("LANGUAGE", (char*)lang_obj->stringval, 1);
      setlocale (LC_ALL, "");

      if (context_obj)
        msgid = g_strdup_printf ("%s%s%s",
                                 (gchar*) context_obj->stringval,
                                 GETTEXT_CONTEXT_GLUE,
                                 (gchar*) msgid_obj->stringval);
      else
        msgid = g_strdup ((gchar*) msgid_obj->stringval);

      if (context_obj && context_obj->stringval)
        msgid_pl = g_strdup_printf ("%s%s%s",
                                 (gchar*) context_obj->stringval,
                                 GETTEXT_CONTEXT_GLUE,
                                 (gchar*) msgid_pl_obj->stringval);
      else
        msgid_pl = g_strdup ((gchar*) msgid_pl_obj->stringval);

      count = (unsigned long) count_obj->floatval;

      textdomain (GSA_XSL_TEXTDOMAIN);
      gettext_result = ngettext (msgid, msgid_pl, count);
      result_str = (xmlChar*) g_strdup ((gettext_result != msgid
                                         && gettext_result != msgid_pl)
                                        ? gettext_result
                                        : "### N/A ###");
      g_free (msgid);

      if (old_LANGUAGE)
        setenv ("LANGUAGE", old_LANGUAGE, 1);
      else
        unsetenv ("LANGUAGE");
      setlocale (LC_ALL, old_locale);
      g_free (old_locale);

      g_mutex_unlock (&locale_env_mutex);
    }
  else
    result_str = (xmlChar*) g_strdup ("");

  result_obj = xmlXPathNewString (result_str);

  xmlXPathFreeObject (lang_obj);
  xmlXPathFreeObject (msgid_obj);
  xmlXPathFreeObject (msgid_pl_obj);
  xmlXPathFreeObject (count_obj);
  if (context_obj)
    xmlXPathFreeObject (context_obj);
  g_free (result_str);

  valuePush (ctxt, result_obj);
}

/**
 * @brief XSLT extension function: KDE-style string formatting
 *
 * @param[in] ctxt    XPath parser context
 * @param[in] nargs   Number of arguments
 */
static void
xslt_ext_strformat (xmlXPathParserContextPtr ctxt,
                    int nargs)
{
  GArray *format_args;
  int i, pos, format_string_len, in_string_number;
  xmlXPathObjectPtr format_string_obj, result_obj;
  gchar *format_string;
  GString *result_str, *number_str;

  /*
   * Function arguments:
   * - format_string
   * - format_args (variadic)
   */

  format_args = g_array_sized_new (TRUE, TRUE, sizeof (gchar*), nargs-1);

  for (i = 0; i < nargs-1; i++)
    {
      xmlXPathObjectPtr format_arg_obj;
      gchar *new_string;

      format_arg_obj = valuePop (ctxt);
      if (format_arg_obj->type != XPATH_STRING)
        {
          valuePush (ctxt, format_arg_obj);
          xmlXPathStringFunction (ctxt, 1);
          format_arg_obj = valuePop (ctxt);
        }

      new_string = g_strdup ((gchar*) format_arg_obj->stringval);
      g_array_prepend_val (format_args, new_string);
      xmlXPathFreeObject (format_arg_obj);
      format_arg_obj = NULL;
    }

  format_string_obj = valuePop (ctxt);
  if (format_string_obj->type != XPATH_STRING)
    {
      valuePush (ctxt, format_string_obj);
      xmlXPathStringFunction (ctxt, 1);
      format_string_obj = valuePop (ctxt);
    }
  format_string = g_strdup ((gchar*) format_string_obj->stringval);
  xmlXPathFreeObject (format_string_obj);

  result_str = g_string_sized_new (strlen (format_string));
  number_str = g_string_sized_new (3);
  format_string_len = strlen (format_string);
  in_string_number = 0;

  for (pos = 0; pos <= format_string_len; pos++)
    {
      if (in_string_number)
        {
          if (format_string [pos] >= '0' && format_string [pos] <= '9')
            {
              g_string_append_c (number_str, format_string [pos]);
            }
          else
            {
              int arg_number = atoi (number_str->str);

              if (arg_number > 0 && arg_number <= format_args->len)
                {
                  g_string_append (result_str,
                                   g_array_index (format_args, gchar*,
                                                  arg_number - 1));
                }

              g_string_append_c (result_str, format_string [pos]);
              g_string_erase (number_str, 0, number_str->len);
              in_string_number = 0;
            }
        }
      else
        {
          if (format_string [pos] == '%')
            in_string_number = 1;
          else
            g_string_append_c (result_str, format_string [pos]);
        }
    }

  result_obj = xmlXPathNewString ((xmlChar*) result_str->str);

  {
    guint index = format_args->len;
    while (index--)
      g_free (g_array_index (format_args, gchar*, index));
    g_array_free (format_args, TRUE);
  }
  g_free (format_string);
  g_string_free (number_str, TRUE);
  g_string_free (result_str, TRUE);
  valuePush (ctxt, result_obj);
}

/**
 * @brief Initialize the i18n XSLT extension module.
 *
 * @param[in] ctxt  xslt transform context
 * @param[in] URI   namespace URI
 */
static void*
init_i18n_module (xsltTransformContextPtr ctxt,
                  const xmlChar *URI)
{
  xsltRegisterExtFunction (ctxt,
                           (xmlChar*) "gettext",
                           URI,
                           xslt_ext_gettext);

  xsltRegisterExtFunction (ctxt,
                           (xmlChar*) "ngettext",
                           URI,
                           xslt_ext_ngettext);

  xsltRegisterExtFunction (ctxt,
                           (xmlChar*) "strformat",
                           URI,
                           xslt_ext_strformat);

  return NULL;
};

/**
 * @brief Initialize the i18n XSLT extension module.
 *
 * @param[in] ctxt  xslt transform context
 * @param[in] URI   namespace URI
 * @param[in] data  extra data
 */
static void
shutdown_i18n_module (xsltTransformContextPtr ctxt,
                      const xmlChar *URI,
                      void *data)
{
  xsltUnregisterExtModuleFunction ((xmlChar*) "gettext",
                                   URI);
  xsltUnregisterExtModuleFunction ((xmlChar*) "ngettext",
                                   URI);
  xsltUnregisterExtModuleFunction ((xmlChar*) "strformat",
                                   URI);
};

/**
 * @brief Register the i18n XSLT extension module.
 */
void
register_i18n_ext_module ()
{
  g_debug ("Registering i18n XSLT module");

  xsltRegisterExtModule((xmlChar*) GSA_I18N_EXT_URI,
                        init_i18n_module,
                        shutdown_i18n_module);

  if (bindtextdomain (GSA_XSL_TEXTDOMAIN,
                      get_chroot_state () ? GSA_CHROOT_LOCALE_DIR
                                          : GSA_LOCALE_DIR)
      == NULL)
    {
      g_critical ("%s: Failed to bind text domain for gettext", __FUNCTION__);
      abort ();
    }

}

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
