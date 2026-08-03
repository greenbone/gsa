/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  testing,
  beforeEach,
  afterEach,
} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import SortableResizer from 'web/components/sortable/SortableResizer';

describe('SortableResizer', () => {
  beforeEach(() => {
    testing.useFakeTimers();
  });

  afterEach(() => testing.useRealTimers());

  test('should render the resizer handle', () => {
    render(<SortableResizer />);

    expect(screen.getByTestId('resizer')).toBeInTheDocument();
  });

  test('should call onResize when dragging', () => {
    const onResize = testing.fn();
    render(<SortableResizer onResize={onResize} />);

    const resizer = screen.getByTestId('resizer');
    fireEvent.mouseDown(resizer, {buttons: 1, pageY: 0});
    document.dispatchEvent(
      new MouseEvent('mousemove', {bubbles: true, cancelable: true}),
    );
    testing.runAllTimers();

    // jsdom does not support setting pageY in MouseEvent init, so diffY is always 0
    expect(onResize).toHaveBeenCalledWith(0);
  });

  test('should not call onResize when no handler is provided', () => {
    render(<SortableResizer />);

    const resizer = screen.getByTestId('resizer');
    fireEvent.mouseDown(resizer, {buttons: 1, pageY: 100});

    expect(() =>
      document.dispatchEvent(
        new MouseEvent('mousemove', {bubbles: true, cancelable: true}),
      ),
    ).not.toThrow();
  });

  test('should remove document listeners on mouseup', () => {
    const onResize = testing.fn();
    render(<SortableResizer onResize={onResize} />);

    const resizer = screen.getByTestId('resizer');
    fireEvent.mouseDown(resizer, {buttons: 1, pageY: 100});

    document.dispatchEvent(
      new MouseEvent('mouseup', {bubbles: true, cancelable: true}),
    );
    onResize.mockClear();

    document.dispatchEvent(
      new MouseEvent('mousemove', {bubbles: true, cancelable: true}),
    );

    expect(onResize).not.toHaveBeenCalled();
  });
});
