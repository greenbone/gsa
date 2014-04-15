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

#include <assert.h>

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
 * @brief Create a new validator rule.
 *
 * The validator must be freed with \ref openvas_validator_rule_free.
 *
 * @return A newly allocated validator.
 */
validator_rule_t *
openvas_validator_rule_new (const char *regex)
{
  validator_rule_t *rule;
  rule = g_malloc (sizeof (validator_rule_t));
  rule->regex = g_strdup (regex);
  rule->alias_for = NULL;
  return rule;
}


/**
 * @brief Free a validator rule.
 *
 * @param  rule  Validator rule.
 */
void
openvas_validator_rule_free (validator_rule_t *rule)
{
  if (rule)
    {
      g_free (rule->alias_for);
      g_free (rule->regex);
    }
}

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
                                (void (*) (gpointer)) openvas_validator_rule_free);
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
                       (gpointer) openvas_validator_rule_new (regex));
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
  gpointer key, value_rule;

  if (g_hash_table_lookup_extended (validator, name, &key, &value_rule))
    {
      validator_rule_t *alias_rule, *rule;
      rule = (validator_rule_t*) value_rule;
      alias_rule = openvas_validator_rule_new (rule->regex
                                                ? rule->regex
                                                : NULL);
      alias_rule->alias_for = g_strdup (name);
      g_hash_table_insert (validator,
                           (gpointer) g_strdup (alias),
                           (gpointer) alias_rule);
      return 0;
    }
  return -1;
}

/**
 * @brief Get the name of the rule for which a rule is an alias.
 *
 * @param  validator  Validator.
 * @param  alias      Name of alias.
 *
 * @return Rule name if \p alias is an alias, else NULL.  Freed by
 *         openvas_validator_free.
 */
gchar *
openvas_validator_alias_for (validator_t validator, const char *alias)
{
  gpointer key, value_rule;

  if (g_hash_table_lookup_extended (validator, alias, &key, &value_rule))
    {
      validator_rule_t *rule;
      assert (value_rule);
      rule = (validator_rule_t*) value_rule;
      return rule->alias_for;
    }
  return NULL;
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
  gpointer key, value_rule;

  tracef ("%s: name %s value %s", __FUNCTION__, name, value);

  if (g_hash_table_lookup_extended (validator, name, &key, &value_rule))
    {
      validator_rule_t *rule;

      assert (value_rule);

      rule = (validator_rule_t*) value_rule;

      if (rule->regex == NULL)
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

      tracef ("matching <%s> against <%s>: ", (char *) rule->regex, value);
      if (g_regex_match_simple (rule->regex,
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
