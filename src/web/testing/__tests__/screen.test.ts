/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen} from 'web/components/testing';

describe('screen', () => {
  test('should export screen', () => {
    expect(screen).toBeDefined();
    expect(typeof screen.getByRole).toBe('function');
    expect(typeof screen.getByTestId).toBe('function');
  });

  test('should have custom queries', () => {
    expect(screen.getRadioInputs).toBeDefined();
    expect(typeof screen.getRadioInputs).toBe('function');
    expect(screen.getSelectItemElements).toBeDefined();
    expect(typeof screen.getSelectItemElements).toBe('function');
    expect(screen.getSelectElement).toBeDefined();
    expect(typeof screen.getSelectElement).toBe('function');
  });

  test('should have debug function', () => {
    expect(screen.debug).toBeDefined();
    expect(typeof screen.debug).toBe('function');
  });
});
