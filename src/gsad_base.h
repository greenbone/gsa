/* Greenbone Security Assistant
 * $Id$
 * Description: Headers/structs used generally in GSA
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
 * @file gsad_base.h
 * @brief Headers/structs used generally in GSA.
 */

#ifndef _GSAD_BASE_H
#define _GSAD_BASE_H

#include <glib.h>
#include <sys/time.h>

#include "gsad_user.h" /* for credentials_t */

/**
 * @brief Initial filtered results per page on the report summary.
 */
#define RESULTS_PER_PAGE 100

/** @brief Answer for invalid input. */
#define GSAD_MESSAGE_INVALID                                                      \
  "<gsad_msg status_text=\"%s\" operation=\"%s\">"                                \
  "At least one entered value contains invalid characters or exceeds"             \
  " a size limit.  You may use the Back button of your browser to adjust"         \
  " the entered values.  If in doubt, the online help of the respective section"  \
  " will lead you to the appropriate help page."                                  \
  "</gsad_msg>"

/** @brief Answer for invalid input. */
#define GSAD_MESSAGE_INVALID_PARAM(op)                                            \
  "<gsad_msg status_text=\"Invalid parameter\" operation=\"" op "\">"             \
  "At least one entered value contains invalid characters or exceeds"             \
  " a size limit.  You may use the Back button of your browser to adjust"         \
  " the entered values.  If in doubt, the online help of the respective section"  \
  " will lead you to the appropriate help page."                                  \
  "</gsad_msg>"

#define params_t GHashTable

/**
 * @brief Response information for commands.
 */
typedef struct {
  int http_status_code;  ///> HTTP status code.
  gchar *redirect;       ///> Redirect URL or NULL.
} cmd_response_data_t;

int gsad_base_init ();
int gsad_base_cleanup ();
int get_chroot_state ();
void set_chroot_state (int);
void set_language_code (gchar **, const gchar *);
char *ctime_r_strip_newline (time_t *, char *);
char * xsl_transform_with_stylesheet (const char *, const char *,
                                      cmd_response_data_t *);
char * xsl_transform (const char *, cmd_response_data_t *);
char * gsad_message (credentials_t *, const char *, const char *, int,
                     const char *, const char *, cmd_response_data_t *);
gchar *login_xml (const gchar *, const gchar *, const gchar *, const gchar *,
                  const gchar *, const gchar *);

/**
 * @brief Content types.
 */
enum content_type
{
  GSAD_CONTENT_TYPE_APP_DEB,
  GSAD_CONTENT_TYPE_APP_EXE,
  GSAD_CONTENT_TYPE_APP_HTML,
  GSAD_CONTENT_TYPE_APP_KEY,
  GSAD_CONTENT_TYPE_APP_NBE,
  GSAD_CONTENT_TYPE_APP_PDF,
  GSAD_CONTENT_TYPE_APP_RPM,
  GSAD_CONTENT_TYPE_APP_XML,
  GSAD_CONTENT_TYPE_DONE,         ///< Special marker.
  GSAD_CONTENT_TYPE_IMAGE_PNG,
  GSAD_CONTENT_TYPE_TEXT_CSS,
  GSAD_CONTENT_TYPE_TEXT_HTML,
  GSAD_CONTENT_TYPE_TEXT_JS,
  GSAD_CONTENT_TYPE_TEXT_PLAIN,
  GSAD_CONTENT_TYPE_OCTET_STREAM,
  GSAD_CONTENT_TYPE_IMAGE_SVG,
  GSAD_CONTENT_TYPE_IMAGE_GIF
} ;


/* temporary setting to show charts - defined in gsad.c */
int user_set_charts (const gchar*, const int);

/* default refresh interval setting */
int user_set_autorefresh (const gchar*, const gchar*);

#endif /* not _GSAD_BASE_H */
