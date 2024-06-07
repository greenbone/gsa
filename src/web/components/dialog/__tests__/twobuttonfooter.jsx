/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import DialogTwoButtonFooter from '../twobuttonfooter';

describe('DialogTwoButtonFooter tests', () => {
  test('should render', () => {
    const {element} = render(<DialogTwoButtonFooter rightButtonTitle="Foo" />);

    expect(element).toMatchSnapshot();

    const button = element.querySelector('button[title="Foo"]');

    expect(button).toHaveStyleRule('background', Theme.green);
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
      `${Theme.green} url(/img/loading.gif) center center no-repeat`,
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
    const handler1 = testing.fn();
    const handler2 = testing.fn();

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
