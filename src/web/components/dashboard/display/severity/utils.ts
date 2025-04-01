/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import FilterTerm from 'gmp/models/filter/filterterm';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {LOG_VALUE} from 'web/utils/severity';

interface FilterValueToFilterTermsParams {
  start?: string;
  end?: string;
}

type FilterValueToFilterTermsReturnType = [FilterTerm?, FilterTerm?];

/**
 * Converts filter values to filter terms based on severity range.
 *
 * @param params - The filter values.
 * @param params.start - The start value of the filter range.
 * @param params.end - The end value of the filter range.
 * @returns An array of FilterTerm objects representing the filter terms.
 */
export const filterValueToFilterTerms = ({
  start,
  end,
}: FilterValueToFilterTermsParams): FilterValueToFilterTermsReturnType => {
  if (!isDefined(start)) {
    return [];
  }
  if (isDefined(end)) {
    const startTerm = FilterTerm.fromString(`severity>${start}`);
    const endTerm = FilterTerm.fromString(`severity<${end}`);
    return [startTerm, endTerm];
  }
  const startAsNumber = parseFloat(start);
  if (isDefined(startAsNumber) && startAsNumber > LOG_VALUE) {
    return [FilterTerm.fromString(`severity>${start}`)];
  }
  return [FilterTerm.fromString(`severity=${start}`)];
};
