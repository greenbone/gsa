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

import React from 'react';

import {render} from 'web/utils/testing';

import Trend from '../trend';

import {setLocale} from 'gmp/locale/lang';

setLocale('en');

describe('Task Trend tests', () => {
  test('should render', () => {
    const {element} = render(<Trend name="up" />);

    expect(element).toMatchSnapshot();
  });

  test('should render trend up icon', () => {
    const {element} = render(<Trend name="up" />);

    expect(element).toHaveAttribute('title', 'Severity increased');
    expect(element).toHaveTextContent('trend_up.svg');
  });

  test('should render trend down icon', () => {
    const {element} = render(<Trend name="down" />);

    expect(element).toHaveAttribute('title', 'Severity decreased');
    expect(element).toHaveTextContent('trend_down.svg');
  });

  test('should render trend less icon', () => {
    const {element} = render(<Trend name="less" />);

    expect(element).toHaveAttribute('title', 'Vulnerability count decreased');
    expect(element).toHaveTextContent('trend_less.svg');
  });

  test('should render trend more icon', () => {
    const {element} = render(<Trend name="more" />);

    expect(element).toHaveAttribute('title', 'Vulnerability count increased');
    expect(element).toHaveTextContent('trend_more.svg');
  });

  test('should render trend no change icon', () => {
    const {element} = render(<Trend name="same" />);

    expect(element).toHaveAttribute('title', 'Vulnerabilities did not change');
    expect(element).toHaveTextContent('trend_nochange.svg');
  });
});
