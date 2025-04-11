/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Icon from 'web/components/icon/Icon';
import {ICON_SIZE_LARGE_PIXELS} from 'web/hooks/useIconSize';
import {fireEvent, render} from 'web/utils/Testing';

describe('Icon', () => {
  test('renders with specified size', () => {
    const {element} = render(<Icon img="test.svg" size="large" />);
    const icon = element;
    expect(icon).toHaveStyle({
      width: ICON_SIZE_LARGE_PIXELS,
      height: ICON_SIZE_LARGE_PIXELS,
    });
  });

  test('calls onClick when clicked', () => {
    const handleClick = testing.fn();
    const {element} = render(<Icon img="test.svg" onClick={handleClick} />);
    const icon = element;
    fireEvent.click(icon);
    expect(handleClick).toHaveBeenCalled();
  });
});
