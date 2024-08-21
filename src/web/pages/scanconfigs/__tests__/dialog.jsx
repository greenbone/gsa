/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import CreateScanConfigDialog from '../dialog';

describe('CreateScanConfigDialog component tests', () => {
  test('should render dialog with base config as default', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
