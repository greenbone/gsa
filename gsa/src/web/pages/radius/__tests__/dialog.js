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

import {render, fireEvent} from 'web/utils/testing';

import Dialog from '../dialog';

describe('RADIUS dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {baseElement} = render(
      <Dialog
        enable={true}
        radiushost="foo"
        radiuskey="bar"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('should save data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <Dialog
        enable={true}
        radiushost="foo"
        radiuskey="bar"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const checkBox = getByTestId('dialog-save-button');
    fireEvent.click(checkBox);
    expect(handleSave).toHaveBeenCalledWith({
      enable: true,
      radiushost: 'foo',
      radiuskey: 'bar',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <Dialog
        enable={true}
        radiushost="foo"
        radiuskey="bar"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <Dialog
        enable={true}
        radiushost="foo"
        radiuskey="bar"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const checkBox = getByTestId('enable-checkbox');
    fireEvent.click(checkBox);

    const radiusHostTextField = getByTestId('radiushost-textfield');
    fireEvent.change(radiusHostTextField, {target: {value: 'lorem'}});

    const radiusKeyTextField = getByTestId('radiuskey-textfield');
    fireEvent.change(radiusKeyTextField, {target: {value: 'ipsum'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      radiushost: 'lorem',
      enable: false,
      radiuskey: 'ipsum',
    });
  });
});
