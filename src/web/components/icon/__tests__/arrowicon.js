/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';

import ArrowIcon from '../arrowicon';

import {ICON_SIZE_SMALL_PIXELS} from '../withIconSize';

describe('ArrowIcon component tests', () => {
  test('should render', () => {
    const {element} = render(<ArrowIcon />);

    expect(element).toMatchSnapshot();

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
    const handler = jest.fn();
    const {element} = render(<ArrowIcon onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
