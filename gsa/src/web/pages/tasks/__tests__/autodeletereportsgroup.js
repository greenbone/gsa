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

import {render, fireEvent} from 'web/utils/testing';

import AutoDeleteReportsGroup from '../autodeletereportsgroup';
import {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_NO,
} from 'gmp/models/task';

describe('AutoDeleteReportsGroup tests', () => {
  test('should render dialog group', () => {
    const handleChange = jest.fn();

    const {element} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should allow to change auto delete no', () => {
    const handleChange = jest.fn();

    const {queryAllByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const [autoDeleteNoRadio] = queryAllByTestId('radio-input');

    fireEvent.click(autoDeleteNoRadio);

    expect(handleChange).toHaveBeenCalledWith(AUTO_DELETE_NO, 'auto_delete');
  });

  test('should allow to change auto delete keep', () => {
    const handleChange = jest.fn();

    const {queryAllByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_NO}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const [, autoDeleteKeepRadio] = queryAllByTestId('radio-input');

    fireEvent.click(autoDeleteKeepRadio);

    expect(handleChange).toHaveBeenCalledWith(AUTO_DELETE_KEEP, 'auto_delete');
  });

  test('should allow to change auto delete keep value', () => {
    const handleChange = jest.fn();

    const {getByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_KEEP}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const autoDeleteKeepData = getByTestId('spinner-input');

    fireEvent.change(autoDeleteKeepData, {target: {value: 10}});

    expect(handleChange).toHaveBeenCalledWith(10, 'auto_delete_data');
  });

  test('should not allow to change auto delete keep value', () => {
    const handleChange = jest.fn();

    const {getByTestId} = render(
      <AutoDeleteReportsGroup
        autoDelete={AUTO_DELETE_NO}
        autoDeleteData={AUTO_DELETE_KEEP_DEFAULT_VALUE}
        onChange={handleChange}
      />,
    );

    const autoDeleteKeepData = getByTestId('spinner-input');

    fireEvent.change(autoDeleteKeepData, {target: {value: 10}});

    expect(handleChange).not.toHaveBeenCalled();

    expect(autoDeleteKeepData).toBeDisabled();
  });
});
