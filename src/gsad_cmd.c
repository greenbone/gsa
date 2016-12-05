/* Greenbone Security Assistant
 * $Id$
 * Description: Response data handling
 *
 * Authors:
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
 * @file gsad_cmd.c
 * @brief Response data handling
 */

#include "gsad_cmd.h"

#include <string.h> /* for memset */
#include <microhttpd.h> /* for MHD_HTTP_OK */

/**
 * @brief Initializes a cmd_response_data_t struct.
 *
 * @param[in]  data  The cmd_response_data_t struct to initialize
 */
void
cmd_response_data_init (cmd_response_data_t* data)
{
  data->http_status_code = MHD_HTTP_OK;
  data->redirect = NULL;
}

/**
 * @brief Clears a cmd_response_data_t struct.
 *
 * @param[in]  data  Struct to reset.
 */
void
cmd_response_data_reset (cmd_response_data_t* data)
{
  memset (data, 0, sizeof (cmd_response_data_t));
}
