/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
 * @file gsad_params.h
 * @brief Http Parameter handling in GSA
 */

#ifndef _GSAD_PARAMS_H
#define _GSAD_PARAMS_H

#include <glib.h>
#include <microhttpd.h>

#define params_t GHashTable

/* Params. */

/**
 * @brief Request parameter.
 */
struct param
{
  gchar *value;          /**< Value. */
  gchar *original_value; /**< Original value, before validation. */
  gchar *filename;       /**< Filename. */
  params_t *values;      /**< Multiple binary values. */
  int valid;             /**< Validation flag. */
  int valid_utf8;        /**< UTF8 validation flag. */
  int value_size;        /**< Size of value, excluding trailing NULL. */
  int array_len;         /**< The number of items of "array" params */
};

/**
 * @brief Request parameter.
 */
typedef struct param param_t;

params_t *
params_new ();

void
params_free (params_t *);

int
params_given (params_t *, const char *);

const char *
params_value (params_t *, const char *);

int
params_value_size (params_t *, const char *);

gboolean
params_value_bool (params_t *, const char *);

const char *
params_original_value (params_t *, const char *);

const char *
params_filename (params_t *, const char *);

params_t *
params_values (params_t *, const char *);

param_t *
params_get (params_t *, const char *);

int
params_valid (params_t *, const char *);

param_t *
params_add (params_t *, const char *, const char *);

void
params_remove (params_t *, const char *);

param_t *
params_append_bin (params_t *, const char *, const char *, int, int);

#define params_iterator_t GHashTableIter

#define params_iterator_init g_hash_table_iter_init

gboolean
params_iterator_next (params_iterator_t *, char **, param_t **);

#if MHD_VERSION < 0x00097002
int
#else
enum MHD_Result
#endif
params_mhd_add (void *params, enum MHD_ValueKind kind, const char *name,
                const char *value);

void
params_mhd_validate (void *params);

#endif /* _GSAD_PARAMS_H */
