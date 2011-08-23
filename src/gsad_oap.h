/* Greenbone Security Assistant
 * $Id$
 * Description: Headers for GSA's OAP communication module.
 *
 * Authors:
 * Matthew Mundell <matthew.mundell@greenbone.net>
 * Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
 * Michael Wiegand <michael.wiegand@greenbone.net>
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
 * @file gsad_oap.h
 * @brief Headers for GSA's OAP communication module
 */

#ifndef _GSAD_OAP_H
#define _GSAD_OAP_H

#include "gsad_base.h" /* for credentials_t */

void oap_init (const gchar *, int);

char * edit_user_oap (credentials_t *, params_t *);
char * get_user_oap (credentials_t *, const char *);
char * get_users_oap (credentials_t *, const char *, const char *);
char * create_user_oap (credentials_t *, params_t *);
char * delete_user_oap (credentials_t *, params_t *);
char * save_user_oap (credentials_t *, params_t *);
char * get_feed_oap (credentials_t *, const char *, const char *);
char * sync_feed_oap (credentials_t *);
char * get_settings_oap (credentials_t *, const char *, const char *);
char * edit_settings_oap (credentials_t *, params_t *);
char * save_settings_oap (credentials_t * credentials, const char *,
                          const char *, GArray *);
char * modify_ldap_auth_oap (credentials_t * credentials, const char * method,
                             const char * enable, const char * ldaphost,
                             const char * authdn, const char * domain);

#endif /* not _GSAD_OAP_H */
