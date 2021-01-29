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
  gboolean is_binary; ///< Whether to expect raw byte data, skip UTF-8 checks.
};

/**
 * @brief A validator rule.
 */
typedef struct validator_rule validator_rule_t;

validator_t
gvm_validator_new ();

void
gvm_validator_add (validator_t, const char *, const char *);

void
gvm_validator_add_binary (validator_t, const char *);

int
gvm_validator_alias (validator_t, const char *, const char *);

gchar *
gvm_validator_alias_for (validator_t, const char *);

int
gvm_validate (validator_t, const char *, const char *);

void gvm_validator_free (validator_t);

#endif /* not _VALIDATOR_H */
