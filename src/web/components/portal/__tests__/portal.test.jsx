/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/testing';

import Portal from '../portal';

describe('Portal component tests', () => {
  test('should render portal', () => {
    const {baseElement} = render(<Portal />);

    expect(baseElement).toBeVisible();
  });
});
