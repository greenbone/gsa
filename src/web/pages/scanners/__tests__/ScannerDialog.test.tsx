/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  screen,
  rendererWith,
  fireEvent,
  getSelectItemElementsForSelect,
} from 'web/testing';
import Features from 'gmp/capabilities/features';
import {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import ScannerDialog from 'web/pages/scanners/ScannerDialog';

const gmp = {settings: {enableGreenboneSensor: true}};

describe('ScannerDialog tests', () => {
  test('should render selected greenbone sensor scanner', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const select = screen.getSelectElement();
    expect(select).toHaveValue('Greenbone Sensor');
  });

  test('should render selected agent scanner sensor', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        type={AGENT_CONTROLLER_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const select = screen.getSelectElement();
    expect(select).toHaveValue('Agent Sensor');
  });

  test('should display defaults for input fields', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(<ScannerDialog onClose={handleClose} onSave={handleSave} />);

    const inputs = screen.queryTextInputs();
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('Unnamed'); // name field
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue(''); // comment field
    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveValue('localhost');

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Greenbone Sensor');
  });

  test('should display defaults when agent controller is used', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        type={AGENT_CONTROLLER_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const inputs = screen.queryTextInputs();
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('Unnamed'); // name field
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue(''); // comment field
    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveValue('localhost');

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Agent Controller');
  });

  test('should display defaults when agent sensor is used', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        type={AGENT_CONTROLLER_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const inputs = screen.queryTextInputs();
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('Unnamed'); // name field
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue(''); // comment field
    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveValue('localhost');

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Agent Sensor');
  });

  test('should display value from props', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        comment="lorem ipsum"
        host="mypc"
        name="john"
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const inputs = screen.queryTextInputs();

    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveAttribute('value', 'john');

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveAttribute('value', 'lorem ipsum');

    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveAttribute('value', 'mypc');

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Greenbone Sensor');
  });

  test('should allow to save dialog', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        comment="lorem ipsum"
        host="mypc"
        id="1234"
        name="john"
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const saveButton = screen.getDialogSaveButton();

    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      caPub: undefined,
      host: 'mypc',
      name: 'john',
      comment: 'lorem ipsum',
      credentialId: '',
      type: GREENBONE_SENSOR_SCANNER_TYPE,
      id: '1234',
      port: undefined,
    });
  });

  test('should allow to change fields in create dialog', async () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();
    const handleScannerPortChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        comment="lorem ipsum"
        host="mypc"
        id="1234"
        name="john"
        port={22}
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerPortChange={handleScannerPortChange}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const nameInput = screen.getByName('name');
    expect(nameInput).toHaveValue('john');
    changeInputValue(nameInput, 'ipsum');

    const commentInput = screen.getByName('comment');
    expect(commentInput).toHaveValue('lorem ipsum');
    changeInputValue(commentInput, 'lorem');

    const portInput = screen.getByName('port');
    expect(portInput).toHaveValue('22');
    changeInputValue(portInput, '2222');
    expect(handleScannerPortChange).toHaveBeenCalledWith(2222);

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Greenbone Sensor');
    const scannerTypeItems = await getSelectItemElementsForSelect(select);
    expect(scannerTypeItems.length).toBe(3); // Agent Controller, Agent Sensor, Greenbone Sensor
    fireEvent.click(scannerTypeItems[1]); // select Agent Sensor
    expect(handleScannerTypeChange).toHaveBeenCalledWith(
      AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
    );

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      caPub: undefined,
      host: 'mypc',
      name: 'ipsum',
      comment: 'lorem',
      credentialId: '',
      type: GREENBONE_SENSOR_SCANNER_TYPE,
      id: '1234',
      port: 22,
    });
  });

  test('should allow to change public ca file', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();
    const handleScannerCaPubChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        comment="lorem ipsum"
        host="mypc"
        id="1234"
        name="john"
        type={AGENT_CONTROLLER_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
        onScannerCaPubChange={handleScannerCaPubChange}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const caPubInput = screen.getByName('caPub');
    expect(caPubInput).toBeInTheDocument();

    const file = new File(['file contents'], 'ca.pub', {
      type: 'application/x-pem-file',
    });
    fireEvent.change(caPubInput, {
      target: {files: [file]},
    });
    expect(handleScannerCaPubChange).toHaveBeenCalledWith(file);
  });

  test('should not allow to change host, port and type if scanner is in use', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();
    const handleScannerPortChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        comment="lorem ipsum"
        host="mypc"
        id="1234"
        name="john"
        port={22}
        scannerInUse={true}
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerPortChange={handleScannerPortChange}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const hostInput = screen.getByName('host');
    expect(hostInput).toBeDisabled();
    changeInputValue(hostInput, 'new.host');

    const portInput = screen.getByName('port');
    expect(portInput).toBeDisabled();
    changeInputValue(portInput, '2222');
    expect(handleScannerPortChange).not.toHaveBeenCalled();

    const select = screen.getSelectElement();
    expect(select).toBeDisabled();
    const scannerTypeItems = screen.queryAllByRole('option');
    expect(scannerTypeItems.length).toBe(0);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      caPub: undefined,
      host: 'mypc',
      name: 'john',
      comment: 'lorem ipsum',
      credentialId: '',
      type: GREENBONE_SENSOR_SCANNER_TYPE,
      id: '1234',
      port: 22,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should not render agent controller in scanner selection if feature is disabled', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features([]), // no ENABLE_AGENTS feature
    });

    render(
      <ScannerDialog
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const select = screen.getSelectElement();
    expect(select).toHaveValue('Greenbone Sensor');
    const scannerTypeItems = await getSelectItemElementsForSelect(select);
    expect(scannerTypeItems.length).toBe(1); // only Greenbone Sensor
    expect(scannerTypeItems[0]).toHaveTextContent('Greenbone Sensor');
  });

  test('should not render agent controller in scanner selection if agent permission is missing', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: false,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const select = screen.getSelectElement();
    expect(select).toHaveValue('Greenbone Sensor');
    const scannerTypeItems = await getSelectItemElementsForSelect(select);
    expect(scannerTypeItems.length).toBe(1); // only Greenbone Sensor
    expect(scannerTypeItems[0]).toHaveTextContent('Greenbone Sensor');
  });

  test('should only render agent controller in scanner selection if sensors are not enabled', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleScannerTypeChange = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {enableGreenboneSensor: false}}, // no sensor
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        type={AGENT_CONTROLLER_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
        onScannerTypeChange={handleScannerTypeChange}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const select = screen.getSelectElement();
    expect(select).toHaveValue('Agent Controller');
    const scannerTypeItems = await getSelectItemElementsForSelect(select);
    expect(scannerTypeItems.length).toBe(1); // only Agent Controller
    expect(scannerTypeItems[0]).toHaveTextContent('Agent Controller');
  });
});
