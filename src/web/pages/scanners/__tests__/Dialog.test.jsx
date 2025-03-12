/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import Scanner, {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import {
  changeInputValue,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
  getSelectElement,
  queryTextInputs,
} from 'web/components/testing';
import ScannerDialog from 'web/pages/scanners/Dialog';
import {rendererWith, fireEvent} from 'web/utils/Testing';

const sensorScanner = {
  _id: '1234',
  name: 'john',
  ca_pub: 'foo',
  credential: {
    _id: '5678',
  },
  comment: 'lorem ipsum',
  type: GREENBONE_SENSOR_SCANNER_TYPE,
  host: 'mypc',
};

const cred1 = Credential.fromElement({
  _id: '5678',
  name: 'foo',
  type: CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
});

const cred2 = Credential.fromElement({
  _id: '2345',
  name: 'bar',
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});

// credentials list is necessary along with 'type' to generate
// nonempty string items for the Select component for credential_id.
// Otherwise it would fail prop validation as '' is not a valid value
// for that component.
const credentials = [cred1, cred2];

const gmp = {settings: {enableGreenboneSensor: true}};

describe('ScannerDialog component tests', () => {
  test('should render', () => {
    const elem = {_id: 'foo', type: GREENBONE_SENSOR_SCANNER_TYPE};
    const scanner = Scanner.fromElement(elem);
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <ScannerDialog
        credential_id={'5678'}
        credentials={credentials}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(getDialog()).toBeInTheDocument();
  });

  test('should display default info', () => {
    const scanner = Scanner.fromElement(sensorScanner);

    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <ScannerDialog
        credential_id={'5678'}
        credentials={credentials}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const inputs = queryTextInputs();

    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('Unnamed'); // name field

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue(''); // comment field

    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveValue('localhost');

    const select = getSelectElement();

    expect(select).toHaveValue('Greenbone Sensor');
  });

  test('should display value from props', () => {
    const scanner = Scanner.fromElement(sensorScanner);

    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <ScannerDialog
        comment={scanner.comment}
        credential_id={scanner.credential.id}
        credentials={credentials}
        host={scanner.host}
        name={scanner.name}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const inputs = queryTextInputs();

    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveAttribute('value', 'john');

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveAttribute('value', 'lorem ipsum');

    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveAttribute('value', 'mypc');

    const select = getSelectElement();

    expect(select).toHaveValue('Greenbone Sensor');
  });

  test('should save valid form state', () => {
    const scanner = Scanner.fromElement(sensorScanner);
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <ScannerDialog
        comment={scanner.comment}
        credential_id={scanner.credential.id}
        credentials={credentials}
        host={scanner.host}
        id={scanner.id}
        name={scanner.name}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const saveButton = getDialogSaveButton();

    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ca_pub: undefined,
      host: 'mypc',
      name: 'john',
      comment: 'lorem ipsum',
      credential_id: '',
      type: 5,
      id: '1234',
      port: '22',
      which_cert: undefined,
    });
  });

  test('should change fields in create dialog', () => {
    const scanner = Scanner.fromElement(sensorScanner);

    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp});

    const {getByName} = render(
      <ScannerDialog
        comment={scanner.comment}
        credential_id={scanner.credential.id}
        credentials={credentials}
        host={scanner.host}
        id={scanner.id}
        name={scanner.name}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const inputs = queryTextInputs();

    expect(inputs[0]).toHaveValue('john');
    expect(inputs[1]).toHaveValue('lorem ipsum');

    const nameInput = getByName('name');
    changeInputValue(nameInput, 'ipsum');

    const commentInput = getByName('comment');
    changeInputValue(commentInput, 'lorem');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ca_pub: undefined,
      host: 'mypc',
      name: 'ipsum',
      comment: 'lorem',
      credential_id: '',
      type: 5,
      id: '1234',
      port: '22',
      which_cert: undefined,
    });
  });

  test('should allow to close the dialog', () => {
    const elem = {_id: 'foo', type: GREENBONE_SENSOR_SCANNER_TYPE};
    const scanner = Scanner.fromElement(elem);
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <ScannerDialog
        credential_id={'5678'}
        credentials={credentials}
        scanner={scanner}
        type={scanner.scannerType}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
