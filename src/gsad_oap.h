/* Greenbone Security Assistant
 * $Id$
 * Description: Headers for GSA's OAP communication module
 *
 * Authors:
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@intevation.de>
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
 * @file gsad-oap.h
 * @brief Headers for GSA's OAP communication module
 */

#ifndef GSAD_OAP_H
#define GSAD_OAP_H

#include "gsad_base.h" /* for credentials_t */

void oap_init (int);

char * get_users_oap (credentials_t *);
char * create_user_oap (credentials_t *,
                        const char *, const char *, const char *);
char * delete_user_oap (credentials_t *, const char *);

#endif
