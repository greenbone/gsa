/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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

import {render, fireEvent} from 'web/utils/testing';

import DatePicker from '../datepicker.js';

import date from 'gmp/models/date';

describe('DatePicker component tests', () => {
  test('should render', () => {
    const adate = date('2018-11-11');
    const {element} = render(<DatePicker value={adate} />);

    expect(element).toMatchSnapshot();

    fireEvent.click(element);

    expect(element).toMatchSnapshot();
  });
});

// vim: set ts=2 sw=2 tw=80:
