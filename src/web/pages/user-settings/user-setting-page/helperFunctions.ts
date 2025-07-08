/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import Languages from 'web/utils/Languages';

/**
 * Get the language name by its code
 *
 * @param {string} code - The language code to look up
 * @returns {string|null} - The language name or null if not found
 */
export const getLangNameByCode = (code: string): string | null => {
  const language = Languages[code];
  return isDefined(language) ? `${language.name}` : null;
};
