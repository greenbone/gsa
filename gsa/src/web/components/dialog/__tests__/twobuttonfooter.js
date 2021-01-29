/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import DialogTwoButtonFooter from '../twobuttonfooter';

describe('DialogTwoButtonFooter tests', () => {
  test('should render', () => {
    const {element} = render(<DialogTwoButtonFooter rightButtonTitle="Foo" />);

    expect(element).toMatchSnapshot();

    const button = element.querySelector('button[title="Foo"]');

    expect(button).toHaveStyleRule('background', Theme.lightGreen);
  });

  test('should render loading and disable cancel button', () => {
    const {element} = render(
      <DialogTwoButtonFooter rightButtonTitle="Foo" loading={true} />,
    );

    expect(element).toMatchSnapshot();

    const button = element.querySelector('button[title="Foo"]');
    const buttonLeft = element.querySelector('button[title="Cancel"]');

    expect(button).toHaveStyleRule(
      'background',
      `${Theme.lightGreen} url(/img/loading.gif) center center no-repeat`,
    );
    expect(buttonLeft).toHaveAttribute('disabled');
  });

  test('should render footer with default title', () => {
    const {element} = render(<DialogTwoButtonFooter rightButtonTitle="Foo" />);

    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(2);

    expect(buttons[0]).toHaveAttribute('title', 'Cancel');
    expect(buttons[0]).toHaveTextContent('Cancel');
    expect(buttons[1]).toHaveAttribute('title', 'Foo');
    expect(buttons[1]).toHaveTextContent('Foo');
  });

  test('should render footer with custom titles', () => {
    const {element} = render(
      <DialogTwoButtonFooter rightButtonTitle="Foo" leftButtonTitle="Bar" />,
    );

    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(2);

    expect(buttons[0]).toHaveAttribute('title', 'Bar');
    expect(buttons[0]).toHaveTextContent('Bar');
    expect(buttons[1]).toHaveAttribute('title', 'Foo');
    expect(buttons[1]).toHaveTextContent('Foo');
  });

  test('should call click handlers', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const {element} = render(
      <DialogTwoButtonFooter
        rightButtonTitle="Foo"
        leftButtonTitle="Bar"
        onLeftButtonClick={handler1}
        onRightButtonClick={handler2}
      />,
    );

    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);

    expect(handler1).toHaveBeenCalled();

    fireEvent.click(buttons[1]);

    expect(handler2).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
