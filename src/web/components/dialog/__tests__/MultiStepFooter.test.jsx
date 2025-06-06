/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import MultiStepFooter from 'web/components/dialog/MultiStepFooter';

const getRightButton = () => screen.getByTestId('dialog-save-button');
const getLeftButton = () => screen.getByTestId('dialog-close-button');
const getNextButton = () => screen.getByTestId('dialog-next-button');
const getPreviousButton = () => screen.getByTestId('dialog-previous-button');

describe('MultiStepFooter tests', () => {
  test('should render', () => {
    const {element} = render(<MultiStepFooter rightButtonTitle="Foo" />);

    expect(element).toBeInTheDocument();

    // ensure buttons are rendered
    getRightButton();
    getLeftButton();
    getNextButton();
    getPreviousButton();
  });

  test('should render loading and disable cancel button', () => {
    render(<MultiStepFooter loading={true} rightButtonTitle="Foo" />);

    getRightButton();

    expect(getLeftButton()).toHaveAttribute('disabled');
  });

  test('should render footer with default titles', () => {
    render(<MultiStepFooter rightButtonTitle="Foo" />);

    expect(getLeftButton()).toHaveTextContent('Cancel');
    expect(getPreviousButton()).toHaveTextContent('🠬');
    expect(getNextButton()).toHaveTextContent('🠮');
    expect(getRightButton()).toHaveTextContent('Foo');
  });

  test('should render footer with custom titles', () => {
    render(
      <MultiStepFooter
        leftButtonTitle="Bar"
        nextButtonTitle="Forward"
        previousButtonTitle="Back"
        rightButtonTitle="Foo"
      />,
    );

    expect(getLeftButton()).toHaveTextContent('Bar');
    expect(getPreviousButton()).toHaveTextContent('Back');
    expect(getNextButton()).toHaveTextContent('Forward');
    expect(getRightButton()).toHaveTextContent('Foo');
  });

  test('should call click handlers', () => {
    const handler1 = testing.fn();
    const handler2 = testing.fn();
    const handler3 = testing.fn();
    const handler4 = testing.fn();

    render(
      <MultiStepFooter
        leftButtonTitle="Bar"
        rightButtonTitle="Foo"
        onLeftButtonClick={handler1}
        onNextButtonClick={handler4}
        onPreviousButtonClick={handler3}
        onRightButtonClick={handler2}
      />,
    );

    fireEvent.click(getLeftButton());
    expect(handler1).toHaveBeenCalled();

    fireEvent.click(getPreviousButton());
    expect(handler3).toHaveBeenCalled();

    fireEvent.click(getNextButton());
    expect(handler4).toHaveBeenCalled();

    fireEvent.click(getRightButton());
    expect(handler2).toHaveBeenCalled();
  });

  test('should disable previous and next button', () => {
    render(
      <MultiStepFooter
        nextDisabled={true}
        prevDisabled={true}
        rightButtonTitle="Foo"
      />,
    );

    expect(getPreviousButton()).toBeDisabled();
    expect(getNextButton()).toBeDisabled();
  });
});
