/* Greenbone Security Assistant
 * $Id$
 * Description: Base functionalities of GSA.
 *
 * Authors:
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Matthew Mundell <matthew.mundell@intevation.de>
 *
 * Copyright:
 * Copyright (C) 2009 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * or, at your option, any later version as published by the Free
 * Software Foundation
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
 * @brief Base functionalities of GSA.
 */

#include <string.h> /* for strlen() */
#include <libxslt/xsltInternals.h> /* for xsltStylesheetPtr */
#include <libxslt/transform.h> /* for xsltApplyStylesheet() */
#include <libxslt/xsltutils.h> /* for xsltSaveResultToString() */

/**
 * @brief XSL Transformation.
 *
 * Does the transformation from XML to HTML applying the given xsl stylesheet.
 *
 * @param[in]  xml_file The xml file to tranform.
 * @param[in]  xsl_file The xsl file to apply for tranformation.
 */
char *
xsl_transform (char *xml_file, char *xsl_file)
{
  xsltStylesheetPtr cur = NULL;
  xmlDocPtr doc, res;
  const xmlChar *xsl;
  xmlChar *doc_txt_ptr = NULL;
  int doc_txt_len;
  const char *stream = xml_file;

  xmlSubstituteEntitiesDefault (1);
  xmlLoadExtDtdDefaultValue = 1;
  xsl = (const xmlChar *) xsl_file;
  cur = xsltParseStylesheetFile (xsl);

  doc = xmlParseMemory (stream, strlen (xml_file));
  res = xsltApplyStylesheet (cur, doc, NULL);
  xsltSaveResultToString (&doc_txt_ptr, &doc_txt_len, res, cur);

  xsltFreeStylesheet (cur);
  xmlFreeDoc (res);
  xmlFreeDoc (doc);

  xsltCleanupGlobals ();
  xmlCleanupParser ();
  return (char *) doc_txt_ptr;
}
