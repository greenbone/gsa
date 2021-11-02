/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {render} from 'web/utils/testing';

import Img from '../img';

describe('Img tests', () => {
  test('should render', () => {
    const {element} = render(
      <Img alt="Greenbone Security Assistant" src="greenbone.svg" />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render img with attributes', () => {
    const {element} = render(
      <Img alt="Greenbone Security Assistant" src="greenbone.svg" />,
    );

    expect(element).toHaveAttribute('alt', 'Greenbone Security Assistant');
    expect(element).toHaveAttribute('src', '/img/greenbone.svg');
  });
});
