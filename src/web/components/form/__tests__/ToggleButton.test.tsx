/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import ToggleButton from 'web/components/form/ToggleButton';
import Theme from 'web/utils/Theme';

describe('ToggleButton tests', () => {
  test('should render', () => {
    render(<ToggleButton />);

    const button = screen.getByTestId('toggle-button');
    expect(button).toHaveStyleRule('width', '32px');
    expect(button).toHaveStyleRule('cursor', 'pointer');
    expect(button).toHaveStyleRule('color', Theme.darkGray);
    expect(button).toHaveStyleRule('background-color', Theme.lightGray);
    expect(button).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    render(<ToggleButton disabled={true} />);

    const button = screen.getByTestId('toggle-button');
    expect(button).toHaveStyleRule('cursor', 'default');
    expect(button).toHaveStyleRule('color', Theme.mediumGray);
    expect(button).toHaveStyleRule('background-color', Theme.lightGray);
  });

  test('should render in checked state', () => {
    render(<ToggleButton checked={true} />);

    const button = screen.getByTestId('toggle-button');
    expect(button).toHaveStyleRule('cursor', 'pointer');
    expect(button).toHaveStyleRule('color', Theme.white);
    expect(button).toHaveStyleRule('background-color', Theme.lightGreen);
  });

  test('should call onToggle handler', () => {
    const handler = testing.fn();
    render(<ToggleButton onToggle={handler} />);

    const button = screen.getByTestId('toggle-button');
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledWith(true, undefined);
  });

  test('should call onToggle handler with name', () => {
    const handler = testing.fn();
    render(<ToggleButton name="foo" onToggle={handler} />);

    const button = screen.getByTestId('toggle-button');
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledWith(true, 'foo');
  });

  test('should toggle checked state', () => {
    const handler = testing.fn();
    render(<ToggleButton checked={true} name="foo" onToggle={handler} />);

    const button = screen.getByTestId('toggle-button');
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledWith(false, 'foo');
  });

  test('should not call handler if disabled', () => {
    const handler = testing.fn();
    render(<ToggleButton disabled={true} onToggle={handler} />);

    const button = screen.getByTestId('toggle-button');
    fireEvent.click(button);
    expect(handler).not.toHaveBeenCalled();
  });
});
