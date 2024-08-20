/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import Target from '../target';

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

// vim: set ts=2 sw=2 tw=80:
