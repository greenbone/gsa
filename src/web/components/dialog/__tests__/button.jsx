/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import Button from '../button';

describe('Dialog Button tests', () => {
  test('should call click handler', () => {
    const handler = testing.fn();

    const {element} = render(<Button onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should render button', () => {
    const {element} = render(<Button />);

    expect(element).toMatchSnapshot();

    expect(element).toHaveStyleRule('background', Theme.green);
  });

  test('should render button when loading', () => {
    const {element} = render(<Button loading={true} />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveStyleRule(
      'background',
      `${Theme.green} url(/img/loading.gif) center center no-repeat`,
    );
  });
});

// vim: set ts=2 sw=2 tw=80:
