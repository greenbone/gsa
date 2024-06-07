/* Copyright (C) 2019-2022 Greenbone AG
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

import MultiStepFooter from 'web/components/dialog/multistepfooter';

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
    render(<MultiStepFooter rightButtonTitle="Foo" loading={true} />);

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
        rightButtonTitle="Foo"
        leftButtonTitle="Bar"
        previousButtonTitle="Back"
        nextButtonTitle="Forward"
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
        rightButtonTitle="Foo"
        leftButtonTitle="Bar"
        onLeftButtonClick={handler1}
        onRightButtonClick={handler2}
        onPreviousButtonClick={handler3}
        onNextButtonClick={handler4}
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
        rightButtonTitle="Foo"
        prevDisabled={true}
        nextDisabled={true}
      />,
    );

    expect(getPreviousButton()).toBeDisabled();
    expect(getNextButton()).toBeDisabled();
  });
});
