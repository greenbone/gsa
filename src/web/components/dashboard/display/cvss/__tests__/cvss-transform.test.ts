/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import transformCvssData, {
  cvssDataRow,
} from 'web/components/dashboard/display/cvss/cvss-transform';
import {
  CRITICAL,
  ERROR,
  FALSE_POSITIVE,
  HIGH,
  LOG,
  LOW,
  NA,
} from 'web/utils/severity';

describe('cvssDataRow', () => {
  test('should return the x and y values', () => {
    const data = {
      color: '#000000',
      filterValue: {},
      label: 'Low',
      toolTip: 'Low',
      x: '1',
      y: 2,
    };

    expect(cvssDataRow(data)).toEqual(['1', '2']);
  });
});

describe('transformCvssData', () => {
  test('should return all empty CVSS buckets with a zero total', () => {
    const result = transformCvssData();

    expect(result).toHaveLength(13);
    expect(result.total).toBe(0);
    expect(result.every(({y}) => y === 0)).toBe(true);
  });

  test('should aggregate scores into their CVSS buckets', () => {
    const result = transformCvssData({
      groups: [
        {value: '0.2', count: 2},
        {value: '0.9', count: 3},
        {value: '1.2', count: 4},
        {value: '1.9', count: 5},
        {value: '10.0', count: 6},
      ],
    });

    expect(result.total).toBe(20);
    expect(result.find(({x}) => x === '0.1')?.y).toBe(5);
    expect(result.find(({x}) => x === '1')?.y).toBe(9);
    expect(result.find(({x}) => x === '10')?.y).toBe(6);
  });

  test('should map invalid and special severity values to their labels', () => {
    const result = transformCvssData({
      groups: [
        {value: undefined, count: 1},
        {value: '-1', count: 2},
        {value: '-3', count: 3},
      ],
    });

    expect(result.find(({x}) => x === NA)).toMatchObject({y: 1, label: NA});
    expect(result.find(({x}) => x === FALSE_POSITIVE)).toMatchObject({
      y: 2,
      label: FALSE_POSITIVE,
    });
    expect(result.find(({x}) => x === ERROR)).toMatchObject({
      y: 3,
      label: ERROR,
    });
  });

  test('should create range filters for score buckets', () => {
    const result = transformCvssData({
      groups: [
        {value: '0', count: 1},
        {value: '0.5', count: 1},
        {value: '7.5', count: 1},
        {value: '10', count: 1},
      ],
    });

    expect(result.find(({x}) => x === LOG)?.filterValue).toEqual({
      start: '0',
    });
    expect(result.find(({x}) => x === '0.1')?.filterValue).toEqual({
      start: '0.0',
      end: '1.0',
    });
    expect(result.find(({x}) => x === '7')?.filterValue).toEqual({
      start: '6.9',
      end: '8.0',
    });
    expect(result.find(({x}) => x === '10')?.filterValue).toEqual({
      start: '10',
    });
  });

  test('should format tooltips for score buckets', () => {
    const result = transformCvssData({
      groups: [
        {value: '0', count: 1},
        {value: '0.5', count: 1},
        {value: '7.5', count: 1},
        {value: '10', count: 1},
      ],
    });

    expect(result.find(({x}) => x === LOG)?.toolTip).toBe('Log: 25.0% (1)');
    expect(result.find(({x}) => x === '0.1')?.toolTip).toBe(
      `0.1 - 0.9 (${LOW}): 25.0% (1)`,
    );
    expect(result.find(({x}) => x === '7')?.toolTip).toBe(
      `7.0 - 7.9 (${HIGH}): 25.0% (1)`,
    );
    expect(result.find(({x}) => x === '10')?.toolTip).toBe(
      `10.0 (${CRITICAL}): 25.0% (1)`,
    );
  });

  test('should use the configured severity rating', () => {
    const result = transformCvssData(
      {groups: [{value: '9.0', count: 1}]},
      {severityRating: 'CVSSv2'},
    );

    expect(result.find(({x}) => x === '9')?.label).not.toBe(CRITICAL);
  });
});
