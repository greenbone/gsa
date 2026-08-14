/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import transformHostsData from 'web/pages/vulnerabilities/dashboard/hosts-transform';

describe('transformHostsData', () => {
  test('should return an empty array when no data is provided', () => {
    expect(transformHostsData()).toEqual([]);
  });

  test('should return no data for empty groups', () => {
    expect(transformHostsData({groups: []})).toEqual([]);
  });

  test('should create a zero-host bucket for a single group', () => {
    const result = transformHostsData({
      groups: [{value: 0, count: 4, c_count: 4}],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      x: '0',
      y: 4,
      id: 0,
      filterValue: {start: 0, end: 0},
      toolTip: '0 - 0: 4 (100.0%)',
    });
  });

  test('should group host values into ranges and aggregate their counts', () => {
    const result = transformHostsData({
      groups: [
        {value: 0, count: 2, c_count: 5},
        {value: 4, count: 3, c_count: 5},
        {value: 5, count: 4, c_count: 5},
      ],
    });

    expect(result).toHaveLength(3);
    expect(result.map(({x, y}) => ({x, y}))).toEqual([
      {x: '0-1', y: 2},
      {x: '2-3', y: 0},
      {x: '4-5', y: 7},
    ]);
    expect(result.map(({filterValue}) => filterValue)).toEqual([
      {start: 0, end: 1},
      {start: 2, end: 3},
      {start: 4, end: 5},
    ]);
  });

  test('should calculate tooltip percentages against the total vulnerabilities', () => {
    const result = transformHostsData({
      groups: [
        {value: 0, count: 2, c_count: 10},
        {value: 4, count: 3, c_count: 10},
      ],
    });

    expect(result.map(({toolTip}) => toolTip)).toEqual([
      '0 - 0: 2 (20.0%)',
      '1 - 1: 0 (0.0%)',
      '2 - 2: 0 (0.0%)',
      '3 - 3: 0 (0.0%)',
      '4 - 4: 3 (30.0%)',
    ]);
  });
});
