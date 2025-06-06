/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/testing';
import Loading from 'web/components/loading/Loading';

describe('Loading component tests', () => {
  test('should render', () => {
    const {element} = render(<Loading />);

    expect(element).toBeVisible();
  });
});
