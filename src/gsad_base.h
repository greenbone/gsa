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
 * @file gsad_base.h
 * @brief Headers/structs used generally in GSA.
 */

#ifndef _GSAD_BASE_H
#define _GSAD_BASE_H

#include <glib.h>

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
 *  @brief Structure of credential related information.
 */
typedef struct
{
  char *username;     ///< Name of user.
  char *password;     ///< User's password.
  char *role;         ///< User's role.
  char *timezone;     ///< User's timezone.
  char *token;        ///< Session token.
  char *caller;       ///< Caller URL, for POST relogin.
  char *current_page; ///< Current page URL, for refresh.
  char *capabilities; ///< Capabilites of manager.
  char *language;     ///< Accept-Language browser header.
  char *severity;     ///< Severity class.
  params_t *params;   ///< Request parameters.
  char *autorefresh;  ///< Auto-refresh interval.
  GTree *last_filt_ids; ///< Last filter ids.
} credentials_t;

int gsad_base_init ();
void set_language_code (gchar **, const gchar *);
char *ctime_r_strip_newline (time_t *, char *);
char * xsl_transform_with_stylesheet (const char *, const char *);
char * xsl_transform (const char *);
char * gsad_message (credentials_t *, const char *, const char *, int,
                     const char *, const char *);

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
  GSAD_CONTENT_TYPE_TEXT_PLAIN,
  GSAD_CONTENT_TYPE_OCTET_STREAM
} ;


/* Params. */

/**
 * @brief Request parameter.
 */
struct param
{
  int valid;             /* Validation flag. */
  int valid_utf8;        /* UTF8 validation flag. */
  gchar *value;          /* Value. */
  gchar *original_value; /* Original value, before validation. */
  gchar *filename;       /* Filename. */
  int value_size;        /* Size of value, excluding trailing NULL. */
  params_t *values;      /* Multiple binary values. */
};

/**
 * @brief Request parameter.
 */
typedef struct param param_t;

params_t *params_new ();

void params_free (params_t *);

int params_given (params_t *, const char *);

const char *params_value (params_t *, const char *);

int params_value_size (params_t *, const char *);

const char *params_original_value (params_t *, const char *);

const char *params_filename (params_t *, const char *);

params_t *params_values (params_t *, const char *);

param_t *params_get (params_t *, const char *);

int params_valid (params_t *, const char *);

param_t *params_add (params_t *, const char *, const char *);

param_t *params_append_bin (params_t *, const char *, const char *, int, int);

#define params_iterator_t GHashTableIter

#define params_iterator_init g_hash_table_iter_init

gboolean params_iterator_next (params_iterator_t *, char **, param_t **);

/* default refresh interval setting */
int user_set_autorefresh (const gchar*, const gchar*);

#endif /* not _GSAD_BASE_H */
