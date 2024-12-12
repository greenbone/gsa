/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import HorizontalSep from 'web/components/layout/horizontalsep';

import {render} from 'web/utils/testing';

describe('HorizontalSep tests', () => {
  test('should render', () => {
    const {element} = render(<HorizontalSep />);
    expect(element).toMatchSnapshot();
  });

  test('should render with separator option', () => {
    const {element} = render(<HorizontalSep $separator="|" />);
    expect(element).toMatchSnapshot();
  });

  test('should render with spacing', () => {
    const {element} = render(<HorizontalSep $separator="|" $spacing="10px" />);
    expect(element).toMatchSnapshot();
  });

  test('should allow to wrap', () => {
    const {element} = render(<HorizontalSep $wrap />);
    expect(element).toMatchSnapshot();
  });
});
