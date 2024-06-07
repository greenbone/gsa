/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import Main from '../main';

describe('Main tests', () => {
  test('should render main', () => {
    const {element} = render(<Main />);

    expect(element).toMatchSnapshot();
  });
});
