/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Toolbar from 'web/components/bar/Toolbar';
import {render} from 'web/testing';

describe('Toolbar tests', () => {
  test('should render', () => {
    const {element} = render(<Toolbar />);

    expect(element).toMatchSnapshot();
  });
});
