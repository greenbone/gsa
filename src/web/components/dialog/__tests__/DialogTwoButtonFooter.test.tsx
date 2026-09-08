/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import DialogTwoButtonFooter from 'web/components/dialog/DialogTwoButtonFooter';

describe('DialogTwoButtonFooter tests', () => {
  test('should render', () => {
    const {element} = render(<DialogTwoButtonFooter rightButtonTitle="Foo" />);

    expect(element).toBeInTheDocument();

    expect(screen.getByTestId('dialog-close-button')).toBeEnabled();

    expect(screen.getByTestId('dialog-save-button')).toHaveTextContent('Foo');
    expect(screen.getByTestId('dialog-save-button')).toBeEnabled();
    expect(screen.getByTestId('dialog-save-button')).not.toHaveAttribute(
      'data-loading',
    );
  });

  test.each([
    {isLoading: false, isSaving: false},
    {isLoading: true, isSaving: false},
    {isLoading: false, isSaving: true},
    {isLoading: true, isSaving: true},
  ])(
    'should handle buttons with isLoading=$isLoading and isSaving=$isSaving',
    ({isLoading, isSaving}) => {
      const onLeftButtonClick = testing.fn();
      const onRightButtonClick = testing.fn();

      render(
        <DialogTwoButtonFooter
          isLoading={isLoading}
          isSaving={isSaving}
          rightButtonTitle="Foo"
          onLeftButtonClick={onLeftButtonClick}
          onRightButtonClick={onRightButtonClick}
        />,
      );

      const buttonLeft = screen.getByTestId('dialog-close-button');
      const buttonRight = screen.getByTestId('dialog-save-button');

      if (isSaving) {
        expect(buttonLeft).toBeDisabled();
      } else {
        expect(buttonLeft).toBeEnabled();
      }

      if (isLoading || isSaving) {
        expect(buttonRight).toHaveAttribute('data-loading', 'true');
        expect(buttonRight).toBeDisabled();
      } else {
        expect(buttonRight).not.toHaveAttribute('data-loading');
        expect(buttonRight).toBeEnabled();
      }

      fireEvent.click(buttonLeft);
      fireEvent.click(buttonRight);

      expect(onLeftButtonClick).toHaveBeenCalledTimes(isSaving ? 0 : 1);
      expect(onRightButtonClick).toHaveBeenCalledTimes(
        isLoading || isSaving ? 0 : 1,
      );
    },
  );

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
