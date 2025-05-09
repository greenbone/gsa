/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import ToggleButton from 'web/components/form/ToggleButton';
import {render, fireEvent} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';

describe('ToggleButton tests', () => {
  test('should render', () => {
    const {element} = render(<ToggleButton />);

    expect(element).toHaveStyleRule('width', '32px');
    expect(element).toHaveStyleRule('cursor', 'pointer');
    expect(element).toHaveStyleRule('color', Theme.darkGray);
    expect(element).toHaveStyleRule('background-color', Theme.lightGray);
    expect(element).toMatchSnapshot();
  });

  test('should render in disabled state', () => {
    const {element} = render(<ToggleButton disabled={true} />);

    expect(element).toHaveStyleRule('cursor', 'default');
    expect(element).toHaveStyleRule('color', Theme.mediumGray);
    expect(element).toHaveStyleRule('background-color', Theme.lightGray);
  });

  test('should render in checked state', () => {
    const {element} = render(<ToggleButton checked={true} />);

    expect(element).toHaveStyleRule('cursor', 'pointer');
    expect(element).toHaveStyleRule('color', Theme.white);
    expect(element).toHaveStyleRule('background-color', Theme.lightGreen);
  });

  test('should call onToggle handler', () => {
    const handler = testing.fn();
    const {element} = render(<ToggleButton onToggle={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith(true, undefined);
  });

  test('should call onToggle handler with name', () => {
    const handler = testing.fn();
    const {element} = render(<ToggleButton name="foo" onToggle={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith(true, 'foo');
  });

  test('should toggle checked state', () => {
    const handler = testing.fn();
    const {element} = render(
      <ToggleButton checked={true} name="foo" onToggle={handler} />,
    );

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith(false, 'foo');
  });

  test('should not call handler if disabled', () => {
    const handler = testing.fn();
    const {element} = render(
      <ToggleButton disabled={true} onToggle={handler} />,
    );

    fireEvent.click(element);

    expect(handler).not.toHaveBeenCalled();
  });
});
