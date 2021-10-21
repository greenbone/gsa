/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';

import {render, fireEvent} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import MultiStepFooter from 'web/components/dialog/multistepfooter';

setLocale('en');

describe('MultiStepFooter tests', () => {
  test('should render', () => {
    const {element} = render(<MultiStepFooter rightButtonTitle="Foo" />);

    expect(element).toMatchSnapshot();

    const button = element.querySelector('button[title="Foo"]');
    const prevButton = element.querySelector('button[title="🠬"]');
    const nextButton = element.querySelector('button[title="🠮"]');

    expect(button).toHaveStyleRule('background', Theme.lightGreen);
    expect(prevButton).toHaveStyleRule('background', Theme.white);
    expect(nextButton).toHaveStyleRule('background', Theme.white);
  });

  test('should render loading and disable cancel button', () => {
    const {element} = render(
      <MultiStepFooter rightButtonTitle="Foo" loading={true} />,
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

  test('should render footer with default titles', () => {
    const {element} = render(<MultiStepFooter rightButtonTitle="Foo" />);

    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(4);

    expect(buttons[0]).toHaveAttribute('title', 'Cancel');
    expect(buttons[0]).toHaveTextContent('Cancel');
    expect(buttons[1]).toHaveAttribute('title', '🠬');
    expect(buttons[1]).toHaveTextContent('🠬');
    expect(buttons[2]).toHaveAttribute('title', '🠮');
    expect(buttons[2]).toHaveTextContent('🠮');
    expect(buttons[3]).toHaveAttribute('title', 'Foo');
    expect(buttons[3]).toHaveTextContent('Foo');
  });

  test('should render footer with custom titles', () => {
    const {element} = render(
      <MultiStepFooter
        rightButtonTitle="Foo"
        leftButtonTitle="Bar"
        previousButtonTitle="Back"
        nextButtonTitle="Forward"
      />,
    );

    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(4);

    expect(buttons[0]).toHaveAttribute('title', 'Bar');
    expect(buttons[0]).toHaveTextContent('Bar');
    expect(buttons[1]).toHaveAttribute('title', 'Back');
    expect(buttons[1]).toHaveTextContent('Back');
    expect(buttons[2]).toHaveAttribute('title', 'Forward');
    expect(buttons[2]).toHaveTextContent('Forward');
    expect(buttons[3]).toHaveAttribute('title', 'Foo');
    expect(buttons[3]).toHaveTextContent('Foo');
  });

  test('should call click handlers', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();
    const handler4 = jest.fn();

    const {element} = render(
      <MultiStepFooter
        rightButtonTitle="Foo"
        leftButtonTitle="Bar"
        onLeftButtonClick={handler1}
        onRightButtonClick={handler2}
        onPreviousButtonClick={handler3}
        onNextButtonClick={handler4}
      />,
    );

    const buttons = element.querySelectorAll('button');

    expect(buttons).toHaveLength(4);

    fireEvent.click(buttons[0]);

    expect(handler1).toHaveBeenCalled();

    fireEvent.click(buttons[1]);

    expect(handler3).toHaveBeenCalled();

    fireEvent.click(buttons[2]);

    expect(handler4).toHaveBeenCalled();

    fireEvent.click(buttons[3]);

    expect(handler2).toHaveBeenCalled();
  });

  test('should disable previous and next button', () => {
    const {element} = render(
      <MultiStepFooter
        rightButtonTitle="Foo"
        prevDisabled={true}
        nextDisabled={true}
      />,
    );

    const prevButton = element.querySelector('button[title="🠬"]');
    const nextButton = element.querySelector('button[title="🠮"]');

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});

// vim: set ts=2 sw=2 tw=80:
