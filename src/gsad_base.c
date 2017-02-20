/* Greenbone Security Assistant
 * $Id$
 * Description: Base functionalities of GSA.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2009 Greenbone Networks GmbH
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
 * @file gsad_base.c
 * @brief Base functionality of GSA.
 */

/**
 * @brief Location of XSL file.
 */
#define XSL_PATH "gsad.xsl"

#include "gsad_base.h"

#include <openvas/omp/xml.h>

#include <glib.h>
#include <microhttpd.h> /* for HTTP status codes */
#ifdef USE_LIBXSLT
#include "xslt_i18n.h"
#include <libxml/parser.h>
#include <libexslt/exslt.h>
#include <string.h> /* for strlen() */
#include <libxslt/xsltInternals.h> /* for xsltStylesheetPtr */
#include <libxslt/transform.h> /* for xsltApplyStylesheet() */
#include <libxslt/xsltutils.h> /* for xsltSaveResultToString() */
#include <malloc.h>
#else
#include <string.h>
#include <sys/wait.h>
#include <errno.h>
#endif

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad base"

/**
 * @brief Version from vendor, or NULL.
 */
gchar *vendor_version = NULL;

gchar *label_name = NULL;

/**
 * @brief The chroot state: 0 = no chroot, 1 = chroot used
 */
static int chroot_state = 0;

/**
 * @brief The http_only state: 0 = using HTTPS, 1 = HTTP only
 */
static int http_only = 0;

/**
 * @brief Base init.
 *
 * @return 0 success, 1 XML needs thread support.
 */
int
gsad_base_init ()
{
#ifdef USE_LIBXSLT
  if (!xmlHasFeature (XML_WITH_THREAD))
    return 1;
  /* Required by libxml for thread safety. */
  xmlInitParser ();
#endif
  return 0;
}

/**
 * @brief Base init.
 *
 * @return 0 success, -1 error.
 */
int
gsad_base_cleanup ()
{
#ifdef USE_LIBXSLT
  xsltCleanupGlobals ();
  xmlCleanupParser ();
#endif
  return 0;
}

/**
 * @brief Gets the chroot state.
 *
 * @return  The chroot state: 0 = no chroot, 1 = chroot in effect
 */
int
get_chroot_state ()
{
  return chroot_state;
}

/**
 * @brief Sets the chroot state.
 *
 * @param[in]  state The new chroot state.
 */
void
set_chroot_state (int state)
{
  chroot_state = state;
}

/**
 * @brief Gets the http_only state.
 *
 * @return  The http_only state: 0 = using HTTPS, 1 = HTTP only
 */
int
get_http_only ()
{
  return http_only;
}

/**
 * @brief Sets the http_only state.
 *
 * @param[in]  state The new http_only state.
 */
void
set_http_only (int state)
{
  http_only = state;
}

/**
 * @brief Set the vendor version.
 *
 * @param[in]  version  Vendor version.
 */
void
vendor_version_set (const gchar *version)
{
  g_free (vendor_version);
  vendor_version = g_strdup (version);
}

/**
 * @brief Get the vendor version.
 *
 * @return Vendor version.
 */
const gchar *
vendor_version_get ()
{
  return vendor_version ? vendor_version : "";
}

/**
 * @brief Get the login label name.
 *
 * @return login label name
 */
const gchar *
label_name_get ()
{
  return label_name;
}

/**
 * @brief Set the login label.
 *
 * @param[in]  name  New login label name.
 *
 * @return 0 on success -1 if name contains invalid characters
 */
int
label_name_set (const gchar *name)
{
  if (!g_regex_match_simple ("^[a-zA-Z0-9\\-_\\.\\:]+$", name, 0, 0))
    return -1;

  g_free (label_name);
  label_name = g_strdup (name);
  return 0;
}

/**
 * @brief Set language code of user.
 *
 * Caller must handle locking.
 *
 * @param[in]   lang      Language slot. May be a language name or code
 * @param[in]   language  User Interface Language.
 */
void
set_language_code (gchar **lang, const gchar *language)
{
  if (language == NULL || strcmp (language, "Browser Language") == 0)
    *lang = NULL;
  else if (strcmp (language, "Chinese") == 0)
    *lang = g_strdup ("zh_CN");
  else if (strcmp (language, "English") == 0)
    *lang = g_strdup ("en");
  else if (strcmp (language, "German") == 0)
    *lang = g_strdup ("de");
  else
    *lang = g_strdup (language);
}

/**
 * @brief Return string from ctime_r with newline replaces with terminator.
 *
 * @param[in]  time    Time.
 * @param[out] string  Time string.
 *
 * @return Return from ctime_r applied to time, with newline stripped off.
 */
char*
ctime_r_strip_newline (time_t *time, char *string)
{
  struct tm *tm;

  tm = localtime (time);
  if (tm == NULL
      || (strftime (string,
                    199,
                    "%c %Z",
                    tm)
          == 0))
    {
      string[0] = '\0';
      return string;
    }
  return string;
}

/**
 * @brief HTML returned when XSL transform fails.
 */
#define FAIL_HTML                                                       \
 "<html>"                                                               \
 "<body>"                                                               \
 "An internal server error has occurred during XSL transformation."     \
 "</body>"                                                              \
 "</html>"

/**
 * @brief XSL Transformation.
 *
 * Transforms XML by applying a given XSL stylesheet, usually into HTML.
 *
 * @param[in]  xml_text        The XML text to transform.
 * @param[in]  xsl_stylesheet  The file name of the XSL stylesheet to use.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return HTML output from XSL transformation.
 */
char *
xsl_transform_with_stylesheet (const char *xml_text,
                               const char *xsl_stylesheet,
                               cmd_response_data_t *response_data)
{
#ifdef USE_LIBXSLT
  xsltStylesheetPtr cur = NULL;
  xmlDocPtr doc, res;
  xmlChar *doc_txt_ptr = NULL;
  int doc_txt_len;

  g_debug ("xsl stylesheet: [%s]\n", xml_text);
  g_debug ("text to transform: [%s]\n", xml_text);

  exsltRegisterAll ();
  register_i18n_ext_module ();

  xmlSubstituteEntitiesDefault (1);
  xmlLoadExtDtdDefaultValue = 1;
  cur = xsltParseStylesheetFile ((const xmlChar *) xsl_stylesheet);
  if (cur == NULL)
    {
      g_warning ("Failed to parse stylesheet %s", xsl_stylesheet);
      if (response_data)
        response_data->http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
      return g_strdup (FAIL_HTML);
    }

  doc = xmlParseMemory (xml_text, strlen (xml_text));
  if (doc == NULL)
    {
      g_warning ("Failed to parse stylesheet %s", xsl_stylesheet);
      xsltFreeStylesheet (cur);
      if (response_data)
        response_data->http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
      return g_strdup (FAIL_HTML);
    }

  res = xsltApplyStylesheet (cur, doc, NULL);
  if (res == NULL)
    {
      g_warning ("Failed to apply stylesheet %s", xsl_stylesheet);
      xsltFreeStylesheet (cur);
      xmlFreeDoc (doc);
      if (response_data)
        response_data->http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
      return g_strdup (FAIL_HTML);
    }
  xmlFreeDoc (doc);

  if (xsltSaveResultToString (&doc_txt_ptr, &doc_txt_len, res, cur) < 0)
    {
      g_warning ("Failed to store transformation result.");
      xsltFreeStylesheet (cur);
      xmlFreeDoc (res);
      if (response_data)
        response_data->http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
      return g_strdup (FAIL_HTML);
    }

  xsltFreeStylesheet (cur);
  xmlFreeDoc (res);
  malloc_trim (0);

  return (char *) doc_txt_ptr;
#else
  int content_fd;
  gint exit_status;
  gchar **cmd;
  gboolean success = TRUE;
  gchar *standard_out = NULL;
  gchar *standard_err = NULL;
  char content_file[] = "/tmp/gsa_xsl_transform_XXXXXX";
  GError *error;

  /* Create a temporary file. */

  content_fd = mkstemp (content_file);
  if (content_fd == -1)
    {
      g_warning ("%s: mkstemp: %s\n", __FUNCTION__, strerror (errno));
      return g_strdup (FAIL_HTML);
    }

  /* Copy text to temporary file. */

  g_debug ("text to transform: [%s]\n", xml_text);

  error = NULL;
  g_file_set_contents (content_file, xml_text, strlen (xml_text), &error);
  if (error)
    {
      g_warning ("%s", error->message);
      g_error_free (error);
      unlink (content_file);
      close (content_fd);
      return g_strdup (FAIL_HTML);
    }

  /* Run xsltproc on the temporary file. */

  cmd = (gchar **) g_malloc (4 * sizeof (gchar *));
  cmd[0] = g_strdup ("xsltproc");
  cmd[1] = g_strdup (xsl_stylesheet);
  cmd[2] = g_strdup (content_file);
  cmd[3] = NULL;
  g_debug ("%s: Spawning in parent dir: %s %s %s\n",
           __FUNCTION__, cmd[0], cmd[1], cmd[2]);
  if ((g_spawn_sync (NULL,
                     cmd,
                     NULL,                  /* Environment. */
                     G_SPAWN_SEARCH_PATH,
                     NULL,                  /* Setup function. */
                     NULL,
                     &standard_out,
                     &standard_err,
                     &exit_status,
                     NULL)
       == FALSE)
      || (WIFEXITED (exit_status) == 0)
      || WEXITSTATUS (exit_status))
    {
      g_debug ("%s: failed to transform the xml: %d (WIF %i, WEX %i)",
               __FUNCTION__,
               exit_status,
               WIFEXITED (exit_status),
               WEXITSTATUS (exit_status));
      g_debug ("%s: stderr: %s\n", __FUNCTION__, standard_err);
      g_debug ("%s: stdout: %s\n", __FUNCTION__, standard_out);
      success = FALSE;
    }

  /* Cleanup. */

  g_free (cmd[0]);
  g_free (cmd[1]);
  g_free (cmd[2]);
  g_free (cmd);
  g_free (standard_err);

  unlink (content_file);
  close (content_fd);

  if (success)
    return standard_out;

  g_free (standard_out);

  if (response_data)
    response_data->http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
  return g_strdup (FAIL_HTML);
#endif
}

/**
 * @brief XSL Transformation.
 *
 * Does the transformation from XML to HTML applying omp.xsl.
 *
 * @param[in]  xml_text  The XML text to transform.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return HTML output from XSL transformation.
 */
char *
xsl_transform (const char *xml_text, cmd_response_data_t *response_data)
{
  return xsl_transform_with_stylesheet (xml_text, XSL_PATH, response_data);
}

/**
 * @brief Handles fatal errors.
 *
 * @todo Make it accept formatted strings.
 *
 * @param[in]  credentials  User authentication information.
 * @param[in]  title     The title for the message.
 * @param[in]  function  The function in which the error occurred.
 * @param[in]  line      The line number at which the error occurred.
 * @param[in]  msg       The response message.
 * @param[in]  backurl   The URL offered to get back to a sane situation.
 *                       If NULL, the tasks page is used.
 * @param[out] response_data   Extra data return for the HTTP response.
 *
 * @return An HTML document as a newly allocated string.
 */
char *
gsad_message (credentials_t *credentials, const char *title,
              const char *function, int line, const char *msg,
              const char *backurl, cmd_response_data_t* response_data)
{
  gchar *xml, *message, *resp;
  const char* xml_flag;

  if (credentials && credentials->params)
    xml_flag = params_value (credentials->params, "xml");
  else
    xml_flag = NULL;

  if (function)
    {
      message = g_strdup_printf ("<gsad_response>"
                                 "<title>%s: %s:%i (GSA %s)</title>"
                                 "<message>%s</message>"
                                 "<backurl>%s</backurl>"
                                 "<token>%s</token>"
                                 "</gsad_response>",
                                 title,
                                 function,
                                 line,
                                 GSAD_VERSION,
                                 msg,
                                 backurl ? backurl : "/omp?cmd=get_tasks",
                                 credentials ? credentials->token : "");
    }
  else
    {
      message = g_strdup_printf ("<gsad_response>"
                                 "<title>%s (GSA %s)</title>"
                                 "<message>%s</message>"
                                 "<backurl>%s</backurl>"
                                 "<token>%s</token>"
                                 "</gsad_response>",
                                 title,
                                 GSAD_VERSION,
                                 msg,
                                 backurl ? backurl : "/omp?cmd=get_tasks",
                                 credentials ? credentials->token : "");
    }

  if (credentials)
    {
      gchar *pre;
      time_t now;
      char ctime_now[200];

      now = time (NULL);
      ctime_r_strip_newline (&now, ctime_now);

      pre = g_markup_printf_escaped
              ("<envelope>"
               "<version>%s</version>"
               "<vendor_version>%s</vendor_version>"
               "<token>%s</token>"
               "<time>%s</time>"
               "<login>%s</login>"
               "<role>%s</role>"
               "<i18n>%s</i18n>"
               "<charts>%i</charts>"
               "<client_address>%s</client_address>",
               GSAD_VERSION,
               vendor_version_get (),
               credentials->token,
               ctime_now,
               credentials->username,
               credentials->role,
               credentials->language,
               credentials->charts,
               credentials->client_address);
      xml = g_strdup_printf ("%s%s"
                              "<capabilities>%s</capabilities>"
                              "</envelope>",
                              pre,
                              message,
                              credentials->capabilities);
      g_free (pre);
    }
  else
    {
      xml = g_strdup (message);
    }
  g_free (message);

  if (xml_flag && strcmp (xml_flag, "0"))
    return xml;

  resp = xsl_transform (xml, response_data);
  if (resp == NULL)
    {
      resp = g_strdup ("<html>"
                       "<body>"
                       "An internal server error has occurred during XSL"
                       " transformation."
                       "</body>"
                       "</html>");
      response_data->http_status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
    }
  g_free (xml);
  return resp;
}

/**
 * @brief Generate XML for login page.
 *
 * @param[in]  message      Login screen message, or NULL.
 * @param[out] token        Token, or NULL.
 * @param[out] time         Time.
 * @param[out] url          URL.
 * @param[out] i18n         i18n language code, or NULL.
 * @param[out] guest        Username for guest login, or NULL.
 *
 * @return Freshly allocated login XML.
 */
gchar *
login_xml (const gchar *message, const gchar *token, const gchar *time,
           const gchar *url, const gchar *i18n, const gchar *guest)
{
  GString *xml;
  const gchar *label = label_name_get();

  xml = g_string_new ("");
  xml_string_append (xml,
                     "<login_page>"
                     "<version>%s</version>"
                     "<vendor_version>%s</vendor_version>"
                     "<token>%s</token>"
                     "<http_only>%d</http_only>"
                     "<time>%s</time>",
                     GSAD_VERSION,
                     vendor_version_get (),
                     token ? token : "",
                     get_http_only (),
                     time);

  if (label)
    xml_string_append(xml,
                      "<label>%s</label>",
                      label);
  if (message)
    xml_string_append (xml,
                       "<message>%s</message>",
                       message);
  if (url)
    xml_string_append (xml,
                       "<url>%s</url>",
                       url);
  if (i18n)
    xml_string_append (xml,
                       "<i18n>%s</i18n>",
                       i18n);
  if (guest)
    xml_string_append (xml,
                       "<guest><username>%s</username></guest>",
                       guest);
  g_string_append (xml, "</login_page>");

  return g_string_free (xml, FALSE);
}


/* Params. */

/**
 * @brief Free a param.
 *
 * @param[in]  param  Param.
 */
static void
param_free (gpointer param)
{
  g_free (((param_t*) param)->value);
  g_free (((param_t*) param)->original_value);
  g_free (((param_t*) param)->filename);
  params_free (((param_t*)param)->values);
  g_free (param);
}

/**
 * @brief Make a params.
 *
 * @return Freshly allocated params.  Free with params_free.
 */
params_t *
params_new ()
{
  return g_hash_table_new_full (g_str_hash, g_str_equal, g_free, param_free);
}

/**
 * @brief Make a params.
 *
 * @param[in]  params  Params.
 */
void
params_free (params_t *params)
{
  if (params)
    g_hash_table_destroy (params);
}

/**
 * @brief Get param.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return Param if present, else NULL.
 */
param_t *
params_get (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param;
}

/**
 * @brief Get whether a param was given at all.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return 1 if given, else 0.
 */
int
params_given (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param ? 1 : 0;
}

/**
 * @brief Get value of param.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return Value if param present, else NULL.
 */
const char *
params_value (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param ? param->value : NULL;
}

/**
 * @brief Get the size of the value of param.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return Size if param present, else -1.
 */
int
params_value_size (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param ? param->value_size : -1;
}

/**
 * @brief Get original value of param, before validation.
 *
 * Only set if validation failed.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return Value if param present, else NULL.
 */
const char *
params_original_value (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param ? param->original_value : NULL;
}

/**
 * @brief Get filename of param.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return Filename if param present and has a filename, else NULL.
 */
const char *
params_filename (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param ? param->filename : NULL;
}

/**
 * @brief Get values of param.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return Values if param present, else NULL.
 */
params_t *
params_values (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param ? param->values : NULL;
}

/**
 * @brief Get whether a param is valid.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return 1 if param present and valid, else 0.
 */
int
params_valid (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);
  return param ? param->valid : 0;
}

/**
 * @brief Add a param.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 * @param[in]  value   Value.  Must be a string.
 */
param_t *
params_add (params_t *params, const char *name, const char *value)
{
  param_t *param;

  if (name == NULL)
    name = "";
  if (value == NULL)
    value = "";

  param = g_malloc0 (sizeof (param_t));
  param->valid = 0;
  param->valid_utf8 = 0;
  param->value = g_strdup (value);
  param->value_size = strlen (value);
  param->array_len = 0;
  g_hash_table_insert (params, g_strdup (name), param);
  return param;
}

/**
 * @brief Append binary data to a param.
 *
 * Appended data always has an extra NULL terminator.
 *
 * @param[in]  params        Params.
 * @param[in]  name          Name.
 * @param[in]  chunk_data    Data to append.
 * @param[in]  chunk_size    Number of bytes to copy.
 * @param[in]  chunk_offset  Offset in bytes into data from which to start.
 *
 * @return Param appended to, or NULL on memory error.
 */
param_t *
params_append_bin (params_t *params, const char *name, const char *chunk_data,
                   int chunk_size, int chunk_offset)
{
  param_t *param;
  char *new_value;

  param = params_get (params, name);

  if (param == NULL)
    {
      char *value;

      value = g_malloc0 (chunk_size + 1);
      memcpy (value + chunk_offset, chunk_data, chunk_size);

      param = params_add (params, name, "");
      g_free (param->value);
      param->value = value;
      param->value_size = chunk_size;
      return param;
    }

  new_value = realloc (param->value,
                       param->value_size + chunk_size + 1);
  if (new_value == NULL)
    return NULL;
  param->value = new_value;
  memcpy (param->value + chunk_offset,
          chunk_data,
          chunk_size);
  param->value[chunk_offset + chunk_size] = '\0';
  param->value_size += chunk_size;

  return param;
}

/**
 * @brief Increment a params iterator.
 *
 * @param[in]   iterator  Iterator.
 * @param[out]  name      Name of param.
 * @param[out]  param     Param.
 *
 * @return TRUE if there was a next element, else FALSE.
 */
gboolean
params_iterator_next (params_iterator_t *iterator, char **name,
                      param_t **param)
{
  return g_hash_table_iter_next (iterator, (gpointer*) name, (gpointer*) param);
}
