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

import CreateScanConfigDialog from '../dialog';

describe('CreateScanConfigDialog component tests', () => {
  test('should render dialog with base config as default', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getAllByTestId} = render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formgroups = getAllByTestId('formgroup-title');
    const radioInputs = getAllByTestId('radio-input');
    const radioTitles = getAllByTestId('radio-title');

    expect(formgroups[0]).toHaveTextContent('Name');

    expect(formgroups[1]).toHaveTextContent('Comment');

    expect(formgroups[2]).toHaveTextContent('Base');

    expect(radioInputs[0]).toHaveAttribute(
      'value',
      'd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663',
    );
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Base with a minimum set of NVTs');

    expect(radioInputs[1]).toHaveAttribute(
      'value',
      '085569ce-73ed-11df-83c3-002264764cea',
    );
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Empty, static and fast');

    expect(radioInputs[2]).toHaveAttribute(
      'value',
      'daba56c8-73ec-11df-a475-002264764cea',
    );
    expect(radioInputs[2].checked).toEqual(false);
    expect(radioTitles[2]).toHaveTextContent('Full and fast');
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-title-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to cancel the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByTestId} = render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const cancelButton = getByTestId('dialog-close-button');

    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByName, getByTestId} = render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    fireEvent.change(nameInput, {target: {value: 'foo'}});

    const commentInput = getByName('comment');
    fireEvent.change(commentInput, {target: {value: 'bar'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      baseScanConfig: 'd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663',
      comment: 'bar',
      name: 'foo',
      scannerId: undefined,
    });
  });

  test('should allow to change the base', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {getByName, getByTestId, getAllByTestId} = render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    fireEvent.change(nameInput, {target: {value: 'foo'}});

    const commentInput = getByName('comment');
    fireEvent.change(commentInput, {target: {value: 'bar'}});

    const radioInputs = getAllByTestId('radio-input');
    fireEvent.click(radioInputs[1]);

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      baseScanConfig: '085569ce-73ed-11df-83c3-002264764cea',
      comment: 'bar',
      name: 'foo',
      scannerId: undefined,
    });
  });
});
