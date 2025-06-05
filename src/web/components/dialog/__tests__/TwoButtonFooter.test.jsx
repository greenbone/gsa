/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import DialogTwoButtonFooter from 'web/components/dialog/TwoButtonFooter';
import {render, fireEvent, screen} from 'web/testing';

describe('DialogTwoButtonFooter tests', () => {
  test('should render', () => {
    const {element} = render(<DialogTwoButtonFooter rightButtonTitle="Foo" />);

    expect(element).toBeInTheDocument();

    // ensure button is rendered
    screen.getByTestId('dialog-close-button');

    expect(screen.getByTestId('dialog-save-button')).toHaveTextContent('Foo');
  });

  test('should render loading and disable cancel button', () => {
    render(<DialogTwoButtonFooter loading={true} rightButtonTitle="Foo" />);

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
      <DialogTwoButtonFooter leftButtonTitle="Bar" rightButtonTitle="Foo" />,
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
        leftButtonTitle="Bar"
        rightButtonTitle="Foo"
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
