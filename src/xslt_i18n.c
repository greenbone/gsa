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

  if (nargs < 2 && nargs > 3)
    {
      xsltGenericError (ctxt, "Expected 2 or 3 arguments, got %d", nargs);
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
      char *old_LC_ALL = getenv ("LC_ALL");
      char *old_LANGUAGE = getenv ("LANGUAGE");
      gchar *msgid = NULL;
      char *gettext_result = NULL;

      g_mutex_lock (&locale_env_mutex);

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

      setenv ("LC_ALL", old_LC_ALL, 1);
      setenv ("LANGUAGE", old_LANGUAGE, 1);
      setlocale (LC_MESSAGES, "");

      g_mutex_unlock (&locale_env_mutex);
    }
  else
    result_str = (xmlChar*) strdup ("");

  result_obj = xmlXPathNewString (result_str);

  xmlXPathFreeObject (lang_obj);
  xmlXPathFreeObject (msgid_obj);
//   free (result_str);

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