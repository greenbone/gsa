/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import PageTitle from 'web/components/layout/pagetitle';

import {render} from 'web/utils/testing';

describe('PageTitle tests', () => {
  test('should render', () => {
    const {element} = render(<PageTitle />);
    expect(element).toMatchSnapshot();
  });

  test('Should render default title', () => {
    const defaultTitle = 'Greenbone Security Assistant';
    render(<PageTitle />);

    expect(global.window.document.title).toBe(defaultTitle);
  });

  test('Should render custom title', () => {
    const title = 'foo';
    const defaultTitle = 'Greenbone Security Assistant';
    render(<PageTitle title={title} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title);
  });

  test('should update value', () => {
    const title1 = 'foo';
    const title2 = 'bar';
    const defaultTitle = 'Greenbone Security Assistant';
    const {rerender} = render(<PageTitle title={title1} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title1);

    rerender(<PageTitle title={title2} />);

    expect(global.window.document.title).toBe(defaultTitle + ' - ' + title2);
  });
});
