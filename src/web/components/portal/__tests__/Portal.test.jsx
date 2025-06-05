/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Portal from 'web/components/portal/Portal';
import {render} from 'web/testing';

describe('Portal component tests', () => {
  test('should render portal', () => {
    const {baseElement} = render(<Portal />);

    expect(baseElement).toBeVisible();
  });
});
