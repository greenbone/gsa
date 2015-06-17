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
 * @brief mutex for locale environment variables
 */
static GMutex locale_env_mutex;

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

  if (msgid_obj->stringval && strcmp ((char*) msgid_obj->stringval, ""))
    {
      char *old_LC_ALL;
      char *old_LANGUAGE;
      gchar *msgid = NULL;
      char *gettext_result = NULL;

      g_mutex_lock (&locale_env_mutex);

      old_LC_ALL = getenv ("LC_ALL");
      old_LANGUAGE = getenv ("LANGUAGE");

      setenv ("LC_ALL", "en_US.UTF8", 1);
      setenv ("LANGUAGE", (char*)lang_obj->stringval, 1);
      setlocale (LC_ALL, "");

      if (context_obj)
        msgid = g_strdup_printf ("%s%s%s",
                                 (gchar*) context_obj->stringval,
                                 GETTEXT_CONTEXT_GLUE,
                                 (gchar*) msgid_obj->stringval);
      else
        msgid = g_strdup ((gchar*) msgid_obj->stringval);

      textdomain ("gsad_xsl");
      gettext_result = gettext (msgid);
      result_str = (xmlChar*) g_strdup ((gettext_result != msgid)
                                        ? gettext_result
                                        : "### N/A ###");
      g_free (msgid);

      if (old_LC_ALL)
        setenv ("LC_ALL", old_LC_ALL, 1);
      else
        unsetenv ("LC_ALL");

      if (old_LANGUAGE)
        setenv ("LANGUAGE", old_LANGUAGE, 1);
      else
        unsetenv ("LANGUAGE");
      setlocale (LC_MESSAGES, "");

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

  if (msgid_obj->stringval && strcmp ((char*) msgid_obj->stringval, ""))
    {
      char *old_LC_ALL;
      char *old_LANGUAGE;
      gchar *msgid = NULL;
      gchar *msgid_pl = NULL;
      unsigned long count;
      char *gettext_result = NULL;

      g_mutex_lock (&locale_env_mutex);

      old_LC_ALL = getenv ("LC_ALL");
      old_LANGUAGE = getenv ("LANGUAGE");

      setenv ("LC_ALL", "en_US.UTF8", 1);
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

      textdomain ("gsad_xsl");
      gettext_result = ngettext (msgid, msgid_pl, count);
      result_str = (xmlChar*) g_strdup ((gettext_result != msgid
                                         && gettext_result != msgid_pl)
                                        ? gettext_result
                                        : "### N/A ###");
      g_free (msgid);

      if (old_LC_ALL)
        setenv ("LC_ALL", old_LC_ALL, 1);
      else
        unsetenv ("LC_ALL");

      if (old_LANGUAGE)
        setenv ("LANGUAGE", old_LANGUAGE, 1);
      else
        unsetenv ("LANGUAGE");
      setlocale (LC_MESSAGES, "");

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

  if (bindtextdomain ("gsad_xsl", GSA_LOCALE_DIR) == NULL)
    {
      g_critical ("%s: Failed to bind text domain for gettext", __FUNCTION__);
      abort ();
    }

}