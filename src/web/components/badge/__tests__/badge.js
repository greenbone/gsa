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

import Badge from '../badge';
import ReportIcon from 'web/components/icon/reporticon';

describe('Badge tests', () => {
  test('should render badge', () => {
    const {element} = render(
      <Badge content="1">
        <ReportIcon />
      </Badge>,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render content', () => {
    const {element} = render(<Badge content="1" />);

    expect(element).toHaveTextContent('1');
  });

  test('should render backgroundColor', () => {
    const {getByTestId} = render(<Badge backgroundColor="blue" content="1" />);
    const icon = getByTestId('badge-icon');

    expect(icon).toHaveStyleRule('background-color', 'blue');
  });

  test('should render color', () => {
    const {getByTestId} = render(<Badge color="blue" content="1" />);
    const icon = getByTestId('badge-icon');

    expect(icon).toHaveStyleRule('color', 'blue');
  });

  test('should render position', () => {
    const {getByTestId} = render(<Badge position="bottom" content="1" />);
    const icon = getByTestId('badge-icon');

    expect(icon).toHaveStyleRule('bottom', '-8px');
  });

  test('should not be dynamic', () => {
    const {getByTestId} = render(<Badge dynamic={false} content="1" />);

    const icon = getByTestId('badge-icon');
    expect(icon).toHaveStyleRule('right', '-8px');
  });
});
