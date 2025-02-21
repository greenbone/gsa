/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/Testing';

import Toolbar from '../Toolbar';

describe('Toolbar tests', () => {
  test('should render', () => {
    const {element} = render(<Toolbar />);

    expect(element).toMatchSnapshot();
  });
});
