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

#include "tracef.h"
#include "validator.h"

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad vali"

/**
 * @file validator.c
 * @brief Validation mechanism.
 *
 * Defines a mechanism to validate strings according to named rules.
 *
 * \ref openvas_validator_new creates a new validator which must be freed
 * with \ref openvas_validator_free.  \ref openvas_validator_add adds a regular
 * expression to a validator as a rule.  \ref openvas_validate checks that a
 * given string matches a given rule.
 */

/**
 * @brief Create a new validator.
 *
 * The validator must be freed with \ref openvas_validator_free.
 *
 * @return A newly allocated validator.
 */
validator_t
openvas_validator_new ()
{
  return g_hash_table_new_full (g_str_hash,
                                g_str_equal,
                                g_free,
                                g_free);
}

/**
 * @brief Add or overwrite a validation rule.
 *
 * @param  validator  Validator to add rule to.
 * @param  name       Name of the rule.
 * @param  regex      Validation rule as a regular expression.
 */
void
openvas_validator_add (validator_t validator,
                       const char *name,
                       const char *regex)
{
  g_hash_table_insert (validator,
                       (gpointer) g_strdup (name),
                       (gpointer) g_strdup (regex));
}

/**
 * @brief Make an alias for a rule name.
 *
 * @param  validator  Validator to add alias to.
 * @param  alias      Name of alias for rule.
 * @param  name       Name of the rule.
 *
 * @return 0 success, -1 error.
 */
int
openvas_validator_alias (validator_t validator,
                         const char *alias,
                         const char *name)
{
  gpointer key, regex;

  if (g_hash_table_lookup_extended (validator, name, &key, &regex))
    {
      g_hash_table_insert (validator,
                           (gpointer) g_strdup (alias),
                           (gpointer) (regex ? g_strdup (regex) : NULL));
      return 0;
    }
  return -1;
}

/**
 * @brief Validate a string for a given rule.
 *
 * @param  validator  Validator to validate from.
 * @param  name       Name of rule.
 * @param  value      Value to validate.
 *
 * @return 0 if valid \arg value is valid, 1 if failed to find \arg name in
 *         validator, 2 if value failed to match the regexp.
 */
int
openvas_validate (validator_t validator, const char *name, const char *value)
{
  gpointer key, regex;

  tracef ("%s: name %s value %s", __FUNCTION__, name, value);

  if (g_hash_table_lookup_extended (validator, name, &key, &regex))
    {
      if (regex == NULL)
        {
          if (value == NULL)
            {
              tracef ("%s: matched, regex NULL", __FUNCTION__);
              return 0;
            }
          tracef ("%s: failed to match, regex NULL", __FUNCTION__);
          return 2;
        }

      if (value == NULL)
        {
          tracef ("%s: failed to match, value NULL", __FUNCTION__);
          return 2;
        }

      tracef ("matching <%s> against <%s>: ", (char *) regex, value);
      if (g_regex_match_simple ((const gchar *) regex,
                                (const gchar *) value,
                                0,
                                0))
        {
          tracef ("%s: matched", __FUNCTION__);
          return 0;
        }
      tracef ("%s: failed to match\n", __FUNCTION__);
      return 2;
    }

  tracef ("%s: failed to find name: %s", __FUNCTION__, name);
  return 1;
}

/**
 * @brief Free a validator.
 *
 * @param  validator  Validator.
 */
void
openvas_validator_free (validator_t validator)
{
  if (validator) g_hash_table_destroy (validator);
}
