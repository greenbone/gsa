/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import FilterTerm from 'gmp/models/filter/filter-term';
import {filterValueToFilterTerms} from 'web/components/dashboard/display/severity/utils';
import {CRITICAL_VALUE, LOG_VALUE} from 'web/utils/severity';

describe('filterValueToFilterTerms', () => {
  test('should return two filter terms when start and end are provided', () => {
    const start = String(LOG_VALUE);
    const end = String(CRITICAL_VALUE);
    const result = filterValueToFilterTerms({start, end});
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(FilterTerm.fromString(`severity>${start}`));
    expect(result[1]).toEqual(FilterTerm.fromString(`severity<${end}`));
  });

  test('should return equal filter term when log is requested', () => {
    const start = String(LOG_VALUE);
    const result = filterValueToFilterTerms({start});
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(FilterTerm.fromString(`severity=${start}`));
  });

  test('should return equal filter term for negative severity values', () => {
    const start = '-1';
    const result = filterValueToFilterTerms({start});
    expect(result).toEqual([FilterTerm.fromString(`severity=${start}`)]);
  });

  test('should return equal filter term for invalid start values', () => {
    const start = 'invalid';
    const result = filterValueToFilterTerms({start});
    expect(result).toEqual([FilterTerm.fromString(`severity=${start}`)]);
  });

  test('should return a single greater filter term when critical is requested', () => {
    const start = String(CRITICAL_VALUE);
    const result = filterValueToFilterTerms({start});
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(FilterTerm.fromString(`severity>${start}`));
  });

  test('should return an empty array when start is undefined', () => {
    const result = filterValueToFilterTerms({});
    expect(result).toEqual([]);
  });
});
