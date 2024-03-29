/* Copyright (C) 2019-2022 Greenbone AG
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

import date from 'gmp/models/date';

import {render} from 'web/utils/testing';

import Footer from '../footer';

describe('Footer tests', () => {
  test('should render footer with copyright', () => {
    const currentYear = date().year();
    const {element} = render(<Footer />);

    expect(element).toMatchSnapshot();
    expect(element).toHaveTextContent(
      'Copyright © 2009-' +
        currentYear +
        ' by Greenbone AG, www.greenbone.net',
    );
  });
});
