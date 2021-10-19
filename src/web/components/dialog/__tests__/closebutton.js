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

import {setLocale} from 'gmp/locale/lang';

import {render, fireEvent} from 'web/utils/testing';

import {
  ICON_SIZE_LARGE_PIXELS,
  ICON_SIZE_MEDIUM_PIXELS,
} from 'web/components/icon/withIconSize';

import CloseButton from '../closebutton';

setLocale('en');

describe('Dialog CloseButton tests', () => {
  test('should render', () => {
    const {element} = render(<CloseButton onClick={() => {}} />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveAttribute('title', 'Close');
    expect(element).toHaveStyleRule('height', ICON_SIZE_MEDIUM_PIXELS);
    expect(element).toHaveStyleRule('width', ICON_SIZE_MEDIUM_PIXELS);
  });

  test('should call close handler', () => {
    const handler = jest.fn();

    const {element} = render(<CloseButton onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should render a large button', () => {
    const {element} = render(<CloseButton onClick={() => {}} size="large" />);

    expect(element).toHaveStyleRule('height', ICON_SIZE_LARGE_PIXELS);
    expect(element).toHaveStyleRule('width', ICON_SIZE_LARGE_PIXELS);
  });
});

// vim: set ts=2 sw=2 tw=80:
