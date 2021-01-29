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
 * @file gsad_http_handler.c
 * @brief HTTP handling of GSA.
 */

#ifndef _GSAD_HTTP_HANDLER_H
#define _GSAD_HTTP_HANDLER_H

#include "gsad_http.h"

typedef struct http_handler http_handler_t;

typedef void (*http_handler_free_func_t) (http_handler_t *);

typedef int (*http_handler_func_t) (http_connection_t *connection,
                                    const char *method, const char *url,
                                    gsad_connection_info_t *con_info,
                                    http_handler_t *handler, void *data);

http_handler_t *
http_handler_add (http_handler_t *handlers, http_handler_t *handler);

int
http_handler_next (http_connection_t *connection, const char *method,
                   const char *url, gsad_connection_info_t *con_info,
                   http_handler_t *handler, void *data);

int
http_handler_start (http_connection_t *connection, const char *method,
                    const char *url, gsad_connection_info_t *con_info,
                    http_handler_t *handler, void *data);

http_handler_t *http_handler_new (http_handler_func_t);

void
http_handler_free (http_handler_t *handler);

http_handler_t *
init_http_handlers ();

void
cleanup_http_handlers ();

http_handler_t *
url_handler_new (const gchar *regexp, http_handler_t *handler);

http_handler_t *
url_handler_add_func (http_handler_t *handlers, const gchar *regexp,
                      http_handler_func_t handle);

http_handler_t *
method_router_new ();

void
method_router_set_get_handler (http_handler_t *router, http_handler_t *handler);

void
method_router_set_post_handler (http_handler_t *router,
                                http_handler_t *handler);

#if MHD_VERSION < 0x00097002
int
#else
enum MHD_Result
#endif
handle_request (void *cls, http_connection_t *connection, const char *url,
                const char *method, const char *version,
                const char *upload_data, size_t *upload_data_size,
                void **con_cls);

#endif /* _GSAD_HTTP_HANDLER_H */
