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
 * @file validator.c
 * @brief Validation mechanism.
 *
 * Defines a mechanism to validate strings according to named rules.
 *
 * \ref gvm_validator_new creates a new validator which must be freed
 * with \ref gvm_validator_free.  \ref gvm_validator_add adds a regular
 * expression to a validator as a rule.  \ref gvm_validate checks that a
 * given string matches a given rule.
 */

#include "validator.h"

#include <assert.h>

#undef G_LOG_DOMAIN
/**
 * @brief GLib log domain.
 */
#define G_LOG_DOMAIN "gsad vali"

/**
 * @brief Create a new validator rule.
 *
 * The validator must be freed with \ref gvm_validator_rule_free.
 *
 * @return A newly allocated validator rule.
 */
validator_rule_t *
gvm_validator_rule_new (const char *regex)
{
  validator_rule_t *rule;
  rule = g_malloc (sizeof (validator_rule_t));
  rule->regex = g_strdup (regex);
  rule->alias_for = NULL;
  rule->is_binary = FALSE;
  return rule;
}

/**
 * @brief Create a new validator rule for a binary parameter.
 *
 * The validator must be freed with \ref gvm_validator_rule_free.
 *
 * @return A newly allocated validator rule.
 */
validator_rule_t *
gvm_validator_rule_new_binary ()
{
  validator_rule_t *rule;
  rule = g_malloc (sizeof (validator_rule_t));
  rule->regex = NULL;
  rule->alias_for = NULL;
  rule->is_binary = TRUE;
  return rule;
}

/**
 * @brief Free a validator rule.
 *
 * @param  rule  Validator rule.
 */
void
gvm_validator_rule_free (validator_rule_t *rule)
{
  if (rule)
    {
      g_free (rule->alias_for);
      g_free (rule->regex);
      g_free (rule);
    }
}

/**
 * @brief Create a new validator.
 *
 * The validator must be freed with \ref gvm_validator_free.
 *
 * @return A newly allocated validator.
 */
validator_t
gvm_validator_new ()
{
  return g_hash_table_new_full (g_str_hash, g_str_equal, g_free,
                                (void (*) (gpointer)) gvm_validator_rule_free);
}

/**
 * @brief Add or overwrite a validation rule.
 *
 * @param  validator  Validator to add rule to.
 * @param  name       Name of the rule.
 * @param  regex      Validation rule as a regular expression.
 */
void
gvm_validator_add (validator_t validator, const char *name, const char *regex)
{
  g_hash_table_insert (validator, (gpointer) g_strdup (name),
                       (gpointer) gvm_validator_rule_new (regex));
}

/**
 * @brief Add or overwrite a validation rule for a binary data param.
 *
 * @param  validator  Validator to add rule to.
 * @param  name       Name of the rule.
 */
void
gvm_validator_add_binary (validator_t validator, const char *name)
{
  g_hash_table_insert (validator, (gpointer) g_strdup (name),
                       (gpointer) gvm_validator_rule_new_binary ());
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
gvm_validator_alias (validator_t validator, const char *alias, const char *name)
{
  gpointer key, value_rule;

  if (g_hash_table_lookup_extended (validator, name, &key, &value_rule))
    {
      validator_rule_t *alias_rule, *rule;
      rule = (validator_rule_t *) value_rule;
      alias_rule = gvm_validator_rule_new (rule->regex ? rule->regex : NULL);
      alias_rule->alias_for = g_strdup (name);
      g_hash_table_insert (validator, (gpointer) g_strdup (alias),
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
 *         gvm_validator_free.
 */
gchar *
gvm_validator_alias_for (validator_t validator, const char *alias)
{
  gpointer key, value_rule;

  if (g_hash_table_lookup_extended (validator, alias, &key, &value_rule))
    {
      validator_rule_t *rule;
      assert (value_rule);
      rule = (validator_rule_t *) value_rule;
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
gvm_validate (validator_t validator, const char *name, const char *value)
{
  gpointer key, value_rule;

  if (name != NULL && g_utf8_validate (name, -1, NULL) == FALSE)
    {
      g_debug ("%s: name is not valid UTF-8", __func__);
      return 1;
    }

  g_debug ("%s: name %s value %s", __func__, name, value);

  if (g_hash_table_lookup_extended (validator, name, &key, &value_rule))
    {
      validator_rule_t *rule;

      assert (value_rule);

      rule = (validator_rule_t *) value_rule;

      if (rule->is_binary)
        {
          // Skip UTF-8 and regex validation for binary data
          return 0;
        }

      if (value != NULL && g_utf8_validate (value, -1, NULL) == FALSE)
        {
          g_debug ("%s: value is not valid UTF-8", __func__);
          return 2;
        }

      if (rule->regex == NULL)
        {
          if (value == NULL)
            {
              g_debug ("%s: matched, regex NULL", __func__);
              return 0;
            }
          g_debug ("%s: failed to match, regex NULL", __func__);
          return 2;
        }

      if (value == NULL)
        {
          g_debug ("%s: failed to match, value NULL", __func__);
          return 2;
        }

      g_debug ("matching <%s> against <%s>: ", (char *) rule->regex, value);
      if (g_regex_match_simple (rule->regex, (const gchar *) value, 0, 0))
        {
          g_debug ("%s: matched", __func__);
          return 0;
        }
      g_debug ("%s: failed to match\n", __func__);
      return 2;
    }

  g_debug ("%s: failed to find name: %s", __func__, name);
  return 1;
}

/**
 * @brief Free a validator.
 *
 * @param  validator  Validator.
 */
void
gvm_validator_free (validator_t validator)
{
  if (validator)
    g_hash_table_destroy (validator);
}
