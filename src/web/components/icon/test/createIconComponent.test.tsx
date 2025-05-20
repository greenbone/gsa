/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {getIconStyling} from 'web/components/icon/createIconComponents';

describe('getIconStyling', () => {
  test('should return correct styling for Lucide icons', () => {
    const result = getIconStyling(true);

    expect(result).toEqual({
      strokeWidth: 1.5,
      style: undefined,
    });
  });

  test('should return correct styling for Lucide icons with color', () => {
    const result = getIconStyling(true, 'red');

    expect(result).toEqual({
      strokeWidth: 1.5,
      style: undefined,
    });
  });

  test('should return correct styling for non-Lucide icons', () => {
    const result = getIconStyling(false);

    expect(result).toEqual({
      strokeWidth: undefined,
      style: {
        color: undefined,
        fill: 'var(--mantine-color-gray-5)',
      },
    });
  });

  test('should return correct styling for non-Lucide icons with color', () => {
    const result = getIconStyling(false, 'blue');

    expect(result).toEqual({
      strokeWidth: undefined,
      style: {
        color: 'blue',
        fill: 'var(--mantine-color-gray-5)',
      },
    });
  });

  test('should return correct styling for active non-Lucide icons', () => {
    const result = getIconStyling(false, undefined, true);

    expect(result).toEqual({
      strokeWidth: undefined,
      style: {
        color: undefined,
        fill: undefined,
      },
    });
  });

  test('should return correct styling for active non-Lucide icons with color', () => {
    const result = getIconStyling(false, 'green', true);

    expect(result).toEqual({
      strokeWidth: undefined,
      style: {
        color: 'green',
        fill: undefined,
      },
    });
  });
});
