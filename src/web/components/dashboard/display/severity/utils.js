/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import FilterTerm from 'gmp/models/filter/filterterm';
import {isDefined} from 'gmp/utils/identity';
import {LOG_VALUE} from 'web/utils/severity';

/**
 * Converts filter values to filter terms based on severity range.
 *
 * @param {Object} params - The filter values.
 * @param {(string|number)} params.start - The start value of the filter range.
 * @param {(string|number)} params.end - The end value of the filter range.
 * @returns {FilterTerm[]} An array of FilterTerm objects representing the filter terms.
 */
export const filterValueToFilterTerms = ({start, end}) => {
  if (isDefined(end)) {
    const startTerm = FilterTerm.fromString(`severity>${start}`);
    const endTerm = FilterTerm.fromString(`severity<${end}`);
    return [startTerm, endTerm];
  }
  if (start > LOG_VALUE) {
    return [FilterTerm.fromString(`severity>${start}`)];
  }
  return [FilterTerm.fromString(`severity=${start}`)];
};
