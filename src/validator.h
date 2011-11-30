/* Greenbone Security Assistant (set for openvas-libraries/base)
 * $Id$
 * Description: String validator.
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
 * @file validator.h
 * @brief Headers/structs for a string validator.
 */

#ifndef _VALIDATOR_H
#define _VALIDATOR_H

#include <glib.h>

/**
 * @brief A set of name rule pairs.
 */
typedef GHashTable *validator_t;

/**
 * @brief A validator rule.
 */
struct validator_rule
{
  gchar *alias_for;   ///< Name of the rule for which this is an alias.
  gchar *regex;       ///< Regular expression.
};

/**
 * @brief A validator rule.
 */
typedef struct validator_rule validator_rule_t;

validator_t openvas_validator_new ();
void openvas_validator_add (validator_t, const char *, const char *);
int openvas_validator_alias (validator_t, const char *, const char *);
gchar *openvas_validator_alias_for (validator_t, const char *);
int openvas_validate (validator_t, const char *, const char *);
void openvas_validator_free (validator_t);

#endif /* not _VALIDATOR_H */
