/* Greenbone Security Assistant
 * $Id$
 * Description: Headers for Response Data struct
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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
 * @file gsad_cmd.h
 * @brief Headers for Response Data struct
 */

#ifndef _GSAD_CMD_H
#define _GSAD_CMD_H

#include <glib.h>

#include "gsad_content_type.h" /* for content_type_t */

/**
 * @brief Response information for commands.
 */
typedef struct {
  int http_status_code;              ///> HTTP status code.
  gchar *redirect;                   ///> Redirect URL or NULL.
  content_type_t content_type;       ///> Content type. Default is text/html
  gsize content_length;              ///> Content length of the response
  const gchar *content_disposition;  ///> Content disposition
} cmd_response_data_t;

void cmd_response_data_init (cmd_response_data_t* data);

void cmd_response_data_reset (cmd_response_data_t* data);

void cmd_response_data_set_content_type (cmd_response_data_t *data,
                                         content_type_t content_type);

content_type_t cmd_response_data_get_content_type (cmd_response_data_t *data);

void cmd_response_data_set_status_code (cmd_response_data_t *data,
                                        int http_status_code);

int cmd_response_data_get_status_code (cmd_response_data_t *data);

void cmd_response_data_set_content_length (cmd_response_data_t *data,
                                           gsize content_length);

gsize cmd_response_data_get_content_length (cmd_response_data_t *data);

void cmd_response_data_set_content_disposition
  (cmd_response_data_t *data, const gchar *content_disposition);

const gchar * cmd_response_data_get_content_disposition
  (cmd_response_data_t *data);

#endif /* not _GSAD_CMD_H */
