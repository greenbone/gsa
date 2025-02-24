/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Target from 'web/components/link/Target';
import {render} from 'web/utils/Testing';


describe('Target tests', () => {
  test('should render Target', () => {
    const {element} = render(<Target id="foo" />);
    expect(element).toHaveAttribute('id', 'foo');
  });

  test('should apply styling', () => {
    const {element} = render(<Target id="foo" />);
    expect(element).toMatchSnapshot();
  });
});
