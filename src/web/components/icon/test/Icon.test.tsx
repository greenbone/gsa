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
import {fireEvent, render, screen} from 'web/testing';
import Icon from 'web/components/icon/Icon';
import {
  ICON_SIZE_LARGE_PIXELS,
  ICON_SIZE_SMALL_PIXELS,
} from 'web/hooks/useIconSize';

describe('Icon', () => {
  beforeEach(() => {
    globalThis.fetch = testing.fn(
      async () => ({text: async () => ''}) as Response,
    );
  });

  afterEach(() => {
    testing.restoreAllMocks();
  });

  test('renders with the specified large size', () => {
    const {element} = render(<Icon img="test.svg" size="large" />);

    expect(element).toHaveStyle({
      width: ICON_SIZE_LARGE_PIXELS,
      height: ICON_SIZE_LARGE_PIXELS,
    });
  });

  test('renders with the default small size when no size is given', () => {
    const {element} = render(<Icon img="test.svg" />);

    expect(element).toHaveStyle({
      width: ICON_SIZE_SMALL_PIXELS,
      height: ICON_SIZE_SMALL_PIXELS,
    });
  });

  test('calls onClick with value when clicked', () => {
    const handleClick = testing.fn();
    const {element} = render(
      <Icon img="test.svg" value="task-42" onClick={handleClick} />,
    );

    fireEvent.click(element);

    expect(handleClick).toHaveBeenCalledWith('task-42');
  });

  test('does not call onClick when it is not provided', () => {
    const handleClick = testing.fn();
    const {element} = render(<Icon img="test.svg" />);

    fireEvent.click(element);

    expect(handleClick).not.toHaveBeenCalled();
  });

  test('renders an anchor when the to prop is provided', () => {
    render(<Icon img="test.svg" to="/tasks" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/tasks');
  });

  test('does not render an anchor when the to prop is omitted', () => {
    render(<Icon img="test.svg" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
