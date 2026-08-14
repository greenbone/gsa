/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {parseDate} from 'gmp/parser';
import transformCreated from 'web/components/dashboard/display/created/created-transform';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

describe('transformCreated', () => {
  test('should return an empty array when no data is provided', () => {
    expect(transformCreated()).toEqual([]);
  });

  test('should transform dates and both count series', () => {
    const firstDate = '2024-01-15T12:00:00Z';
    const secondDate = '2024-01-16T12:00:00Z';
    const result = transformCreated({
      groups: [
        {value: firstDate, count: '4', c_count: '6'},
        {value: secondDate, count: '2', c_count: '3'},
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      label: formattedUserSettingShortDate(parseDate(firstDate)),
      x: parseDate(firstDate),
      y: 4,
      y2: 6,
    });
    expect(result[1]).toMatchObject({
      label: formattedUserSettingShortDate(parseDate(secondDate)),
      x: parseDate(secondDate),
      y: 2,
      y2: 3,
    });
  });

  test('should preserve undefined values for invalid counts', () => {
    const result = transformCreated({
      groups: [
        {value: '2024-01-15', count: 'invalid', c_count: 'also-invalid'},
      ],
    });

    expect(result[0]).toMatchObject({y: undefined, y2: undefined});
  });
});
