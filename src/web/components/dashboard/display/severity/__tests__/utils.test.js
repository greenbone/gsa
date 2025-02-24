/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import FilterTerm from 'gmp/models/filter/filterterm';
import {filterValueToFilterTerms} from 'web/components/dashboard/display/severity/utils';
import {CRITICAL_VALUE, LOG_VALUE} from 'web/utils/severity';

describe('filterValueToFilterTerms', () => {
  test('should return two filter terms when start and end are provided', () => {
    const start = LOG_VALUE;
    const end = CRITICAL_VALUE;
    const result = filterValueToFilterTerms({start, end});
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(FilterTerm.fromString(`severity>${start}`));
    expect(result[1]).toEqual(FilterTerm.fromString(`severity<${end}`));
  });

  test('should return equal filter term when log is requested', () => {
    const start = LOG_VALUE;
    const result = filterValueToFilterTerms({start});
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(FilterTerm.fromString(`severity=${start}`));
  });

  test('should return a single greater filter term when critical is requested', () => {
    const start = CRITICAL_VALUE;
    const result = filterValueToFilterTerms({start});
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(FilterTerm.fromString(`severity>${start}`));
  });
});
