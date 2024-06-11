/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/icon';
import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render} from 'web/utils/testing';
import {ICON_SIZE_LARGE_PIXELS} from 'web/hooks/useIconSize';

describe('Icon', () => {
  test('renders without crashing', () => {
    const {container} = render(<Icon img="test.svg" />);
    expect(container.firstChild).toBeVisible();
  });

  test('renders with specified size', () => {
    const {container} = render(<Icon img="test.svg" size="large" />);
    const icon = container.firstChild;
    expect(icon).toHaveStyle({
      width: ICON_SIZE_LARGE_PIXELS,
      height: ICON_SIZE_LARGE_PIXELS,
    });
  });

  test('calls onClick when clicked', () => {
    const handleClick = testing.fn();
    const {container} = render(<Icon img="test.svg" onClick={handleClick} />);
    const icon = container.firstChild;
    fireEvent.click(icon);
    expect(handleClick).toHaveBeenCalled();
  });
});
