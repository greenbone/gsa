/* Copyright (C) 2009-2021 Greenbone Networks GmbH
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
 * @file gsad_base.c
 * @brief Base functionality of GSA.
 */

#include "gsad_base.h"

#include "gsad_params.h"

#include <glib.h>
#include <libxml/parser.h> /* for xmlHasFeature() */
#include <string.h>        /* for strlen() */
#include <sys/param.h>
#ifndef __FreeBSD__
#include <malloc.h>
#endif

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad base"

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
  if (!xmlHasFeature (XML_WITH_THREAD))
    return 1;
  /* Required by libxml for thread safety. */
  xmlInitParser ();
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
  xmlCleanupParser ();
  return 0;
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
 * @brief Return string from ctime_r with newline replaces with terminator.
 *
 * @param[in]  time    Time.
 * @param[out] string  Time string.
 *
 * @return Return from ctime_r applied to time, with newline stripped off.
 */
char *
ctime_r_strip_newline (time_t *time, char *string)
{
  struct tm *tm;

  tm = localtime (time);
  if (tm == NULL || (strftime (string, 199, "%c %Z", tm) == 0))
    {
      string[0] = '\0';
      return string;
    }
  return string;
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
  g_free (((param_t *) param)->value);
  g_free (((param_t *) param)->original_value);
  g_free (((param_t *) param)->filename);
  params_free (((param_t *) param)->values);
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
 * @brief Get boolean value of param.
 *
 * @param[in]  params  Params.
 * @param[in]  name    Name.
 *
 * @return 1 if param present and != 0, else 0.
 */
gboolean
params_value_bool (params_t *params, const char *name)
{
  param_t *param;
  param = g_hash_table_lookup (params, name);

  return param ? strcmp (param->value, "0") != 0 : 0;
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

void
params_remove (params_t *params, const char *name)
{
  g_hash_table_remove (params, (gconstpointer *) name);
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

  new_value = realloc (param->value, param->value_size + chunk_size + 1);
  if (new_value == NULL)
    return NULL;
  param->value = new_value;
  memcpy (param->value + chunk_offset, chunk_data, chunk_size);
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
params_iterator_next (params_iterator_t *iterator, char **name, param_t **param)
{
  return g_hash_table_iter_next (iterator, (gpointer *) name,
                                 (gpointer *) param);
}
