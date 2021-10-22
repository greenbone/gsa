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
import Theme from 'web/utils/theme';

import Button from '../button';

describe('Dialog Button tests', () => {
  test('should call click handler', () => {
    const handler = jest.fn();

    const {element} = render(<Button onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should render button', () => {
    const {element} = render(<Button />);

    expect(element).toMatchSnapshot();

    expect(element).toHaveStyleRule('background', Theme.lightGreen);
  });

  test('should render button when loading', () => {
    const {element} = render(<Button loading={true} />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveStyleRule(
      'background',
      `${Theme.lightGreen} url(/img/loading.gif) center center no-repeat`,
    );
  });
});

// vim: set ts=2 sw=2 tw=80:
