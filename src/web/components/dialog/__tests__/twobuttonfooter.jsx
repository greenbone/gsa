/* Copyright (C) 2018-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, screen} from 'web/utils/testing';

import DialogTwoButtonFooter from '../twobuttonfooter';

describe('DialogTwoButtonFooter tests', () => {
  test('should render', () => {
    const {element} = render(<DialogTwoButtonFooter rightButtonTitle="Foo" />);

    expect(element).toBeInTheDocument();

    // ensure button is rendered
    screen.getByTestId('dialog-close-button');

    expect(screen.getByTestId('dialog-save-button')).toHaveTextContent('Foo');
  });

  test('should render loading and disable cancel button', () => {
    render(<DialogTwoButtonFooter rightButtonTitle="Foo" loading={true} />);

    // ensure button is rendered
    screen.getByTestId('dialog-save-button');

    const buttonLeft = screen.getByTestId('dialog-close-button');
    expect(buttonLeft).toHaveAttribute('disabled');
  });

  test('should render footer with default title', () => {
    render(<DialogTwoButtonFooter rightButtonTitle="Foo" />);

    const buttonLeft = screen.getByTestId('dialog-close-button');
    const buttonRight = screen.getByTestId('dialog-save-button');

    expect(buttonLeft).toHaveTextContent('Cancel');
    expect(buttonRight).toHaveTextContent('Foo');
  });

  test('should render footer with custom titles', () => {
    render(
      <DialogTwoButtonFooter rightButtonTitle="Foo" leftButtonTitle="Bar" />,
    );

    const buttonLeft = screen.getByTestId('dialog-close-button');
    const buttonRight = screen.getByTestId('dialog-save-button');

    expect(buttonLeft).toHaveTextContent('Bar');
    expect(buttonRight).toHaveTextContent('Foo');
  });

  test('should call click handlers', () => {
    const handler1 = testing.fn();
    const handler2 = testing.fn();

    render(
      <DialogTwoButtonFooter
        rightButtonTitle="Foo"
        leftButtonTitle="Bar"
        onLeftButtonClick={handler1}
        onRightButtonClick={handler2}
      />,
    );

    const buttonLeft = screen.getByTestId('dialog-close-button');
    const buttonRight = screen.getByTestId('dialog-save-button');

    fireEvent.click(buttonLeft);

    expect(handler1).toHaveBeenCalled();

    fireEvent.click(buttonRight);

    expect(handler2).toHaveBeenCalled();
  });
});
