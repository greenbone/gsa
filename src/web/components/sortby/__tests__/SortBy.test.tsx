/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith} from 'web/testing';
import SortBy from 'web/components/sortby/SortBy';

describe('SortBy tests', () => {
  test('should render with children and handle click', () => {
    const clickHandler = testing.fn();
    const {render} = rendererWith();

    const {element} = render(
      <SortBy by="name" onClick={clickHandler}>
        Sort by Name
      </SortBy>,
    );

    expect(element).toHaveTextContent('Sort by Name');
    fireEvent.click(element);
    expect(clickHandler).toHaveBeenCalledWith('name');
  });

  test('should apply className', () => {
    const {render} = rendererWith();

    const {element} = render(
      <SortBy by="date" className="custom-class">
        Sort by Date
      </SortBy>,
    );

    expect(element).toHaveClass('custom-class');
  });

  test("should call onClick handler with 'by' prop", () => {
    const clickHandler = testing.fn();
    const {render} = rendererWith();

    const {element} = render(
      <SortBy by="priority" onClick={clickHandler}>
        Sort by Priority
      </SortBy>,
    );

    fireEvent.click(element);
    expect(clickHandler).toHaveBeenCalledWith('priority');
  });
});
