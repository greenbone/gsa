/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import {CRITICAL, HIGH, LOW, LOG, MEDIUM} from 'web/utils/severity';

describe('transformSeverityData', () => {
  test('should return an empty result with a zero total for empty data', () => {
    const result = transformSeverityData();

    expect(result).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  test('should group and sort severity classes by severity', () => {
    const result = transformSeverityData({
      groups: [
        {value: '7.5', count: 2},
        {value: '4.5', count: 3},
        {value: '0.5', count: 4},
        {value: '9.5', count: 1},
        {value: '7.8', count: 5},
      ],
    });

    expect(result.total).toBe(15);
    expect(result.map(({label}) => label)).toEqual([
      LOW,
      MEDIUM,
      HIGH,
      CRITICAL,
    ]);
    expect(result.map(({value}) => value)).toEqual([4, 3, 7, 1]);
  });

  test('should create filter values for each standard severity class', () => {
    const result = transformSeverityData({
      groups: [
        {value: '0', count: 1},
        {value: '0.1', count: 1},
        {value: '4.0', count: 1},
        {value: '7.0', count: 1},
        {value: '9.0', count: 1},
      ],
    });

    expect(
      result.map(({label, filterValue}) => ({label, filterValue})),
    ).toEqual([
      {label: LOG, filterValue: {start: '0'}},
      {label: LOW, filterValue: {start: '0.1', end: '3.9'}},
      {label: MEDIUM, filterValue: {start: '4.0', end: '6.9'}},
      {label: HIGH, filterValue: {start: '7.0', end: '8.9'}},
      {label: CRITICAL, filterValue: {start: '9.0'}},
    ]);
  });

  test('should format tooltips for each standard severity class', () => {
    const result = transformSeverityData({
      groups: [
        {value: '0', count: 1},
        {value: '0.1', count: 1},
        {value: '4.0', count: 1},
        {value: '7.0', count: 1},
        {value: '9.0', count: 1},
      ],
    });

    expect(result.map(({toolTip}) => toolTip)).toEqual([
      'Log: 20.0% (1)',
      'Low (0.1 - 3.9): 20.0% (1)',
      'Medium (4.0 - 6.9): 20.0% (1)',
      'High (7.0 - 8.9): 20.0% (1)',
      'Critical (9.0 - 10.0): 20.0% (1)',
    ]);
  });

  test('should group unparseable values as NA without a filter value', () => {
    const result = transformSeverityData({
      groups: [
        {value: undefined, count: 2},
        {value: 'not-a-severity', count: 3},
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({value: 5, filterValue: {}});
    expect(result.total).toBe(5);
  });
});
