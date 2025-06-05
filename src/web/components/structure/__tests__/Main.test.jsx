/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Main from 'web/components/structure/Main';
import {render} from 'web/testing';

describe('Main tests', () => {
  test('should render main', () => {
    const {element} = render(<Main />);

    expect(element).toMatchSnapshot();
  });
});
