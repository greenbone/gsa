/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import GlobalStyles from 'web/components/layout/GlobalStyles';

describe('GlobalStyles', () => {
  test('should mount without throwing', () => {
    expect(() => render(<GlobalStyles />)).not.toThrow();
  });
});
