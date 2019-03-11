/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/* eslint-disable max-len */
import React from 'react';

import {render, fireEvent} from 'web/utils/testing';
import Theme from 'web/utils/theme';

import {ICON_SIZE_SMALL_PIXELS} from './withIconSize';

export const testIcon = Icon => {
  test('should render', () => {
    const {element} = render(<Icon />);

    expect(element).toMatchSnapshot();

    expect(element).toHaveStyleRule('width', ICON_SIZE_SMALL_PIXELS);
    expect(element).toHaveStyleRule('height', ICON_SIZE_SMALL_PIXELS);
  });

  test('should handle click', () => {
    const handler = jest.fn();
    const {element} = render(<Icon onClick={handler} value="1" />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('1');
  });

  test('should change appearance when disabled', () => {
    const {element} = render(<Icon disabled={true} />);

    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: '& svg path',
    });
  });

  test('should not call clickhandler when disabled', () => {
    const handler = jest.fn();
    const {element} = render(<Icon disabled={true} onClick={handler} />);

    fireEvent.click(element);

    expect(handler).not.toHaveBeenCalled();
  });
};

// vim: set ts=2 sw=2 tw=80:
