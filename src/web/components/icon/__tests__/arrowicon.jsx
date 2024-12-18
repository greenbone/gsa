/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {ICON_SIZE_SMALL_PIXELS} from 'web/hooks/useIconSize';
import {render, fireEvent} from 'web/utils/testing';

import ArrowIcon from '../arrowicon';

describe('ArrowIcon component tests', () => {
  test('should render', () => {
    const {element} = render(<ArrowIcon />);

    expect(element).toHaveStyleRule('width', ICON_SIZE_SMALL_PIXELS);
    expect(element).toHaveStyleRule('height', ICON_SIZE_SMALL_PIXELS);
  });

  test('should render upwards icon', () => {
    const {element} = render(<ArrowIcon />);

    expect(element).toHaveTextContent('▲');
  });

  test('should render downwards icon', () => {
    const {element} = render(<ArrowIcon down={true} />);

    expect(element).toHaveTextContent('▼');
  });

  test('should handle click', () => {
    const handler = testing.fn();
    const {element} = render(<ArrowIcon onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });
});
