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
  wait,
} from 'web/testing';
import Features from 'gmp/capabilities/features';
import {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';
import ScannerDialog from 'web/pages/scanners/ScannerDialog';

const gmp = {settings: {enableGreenboneSensor: true}};

describe('ScannerDialog tests', () => {
  test('should render selected greenbone sensor scanner', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Greenbone Sensor');
  });

  test('should render selected agent scanner sensor', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();

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
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Agent Sensor');
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

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('');
  });

  test('should display defaults when agent controller is used', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
      />,
    );

    const inputs = screen.queryTextInputs();
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('Unnamed'); // name field
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue(''); // comment field
    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveValue('localhost');

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Agent Controller');
    const credential = screen.getByRole('textbox', {name: 'Credential'});
    expect(credential).toHaveValue('');
  });

  test('should display defaults when agent sensor is used', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
      />,
    );

    const inputs = screen.queryTextInputs();
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('Unnamed'); // name field
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue(''); // comment field
    expect(inputs[2]).toHaveAttribute('name', 'host');
    expect(inputs[2]).toHaveValue('localhost');

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Agent Sensor');
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

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Greenbone Sensor');
  });

  test('should allow to save dialog', () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();

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
      />,
    );

    const saveButton = screen.getDialogSaveButton();

    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'mypc',
      name: 'john',
      comment: 'lorem ipsum',
      credentialId: undefined,
      type: GREENBONE_SENSOR_SCANNER_TYPE,
      id: '1234',
      port: 22,
    });
  });

  test('should allow to change fields in create dialog', async () => {
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();

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
      />,
    );

    const nameInput = screen.getByName('name');
    expect(nameInput).toHaveValue('john');
    changeInputValue(nameInput, 'ipsum');

    const commentInput = screen.getByName('comment');
    expect(commentInput).toHaveValue('lorem ipsum');
    changeInputValue(commentInput, 'lorem');
    expect(commentInput).toHaveValue('lorem');

    const portInput = screen.getByName('port');
    expect(portInput).toHaveValue('22');
    changeInputValue(portInput, '2222');
    expect(portInput).toHaveValue('2222');

    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('Greenbone Sensor');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toBe(4); // OpenVASD Scanner, Agent Controller, Agent Sensor, Greenbone Sensor
    fireEvent.click(screen.getByRole('option', {name: 'Agent Sensor'})); // select Agent Sensor
    expect(scannerType).toHaveValue('Agent Sensor');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'mypc',
      name: 'ipsum',
      comment: 'lorem',
      credentialId: undefined,
      type: AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
      id: '1234',
      port: 2222,
    });
  });

  test('should not allow to change host, port and type if scanner is in use', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

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
        onSave={handleSave}
      />,
    );

    const hostInput = screen.getByName('host');
    expect(hostInput).toBeDisabled();
    changeInputValue(hostInput, 'new.host');
    expect(hostInput).toHaveValue('mypc');

    const portInput = screen.getByName('port');
    expect(portInput).toBeDisabled();
    changeInputValue(portInput, '2222');

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toBeDisabled();
    const scannerTypeItems = screen.queryAllByRole('option');
    expect(scannerTypeItems.length).toBe(0);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'mypc',
      name: 'john',
      comment: 'lorem ipsum',
      credentialId: undefined,
      type: GREENBONE_SENSOR_SCANNER_TYPE,
      id: '1234',
      port: 22,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(<ScannerDialog onClose={handleClose} onSave={handleSave} />);

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should not render agent controller in scanner selection if feature is disabled', async () => {
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features([]), // no ENABLE_AGENTS feature
    });

    render(<ScannerDialog type={GREENBONE_SENSOR_SCANNER_TYPE} />);

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('Greenbone Sensor');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toBe(2); // OpenVASD Scanner and Greenbone Sensor
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVASD Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('Greenbone Sensor');
  });

  test('should not render agent controller in scanner selection if agent permission is missing', async () => {
    const {render} = rendererWith({
      gmp,
      capabilities: false,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(<ScannerDialog type={GREENBONE_SENSOR_SCANNER_TYPE} />);

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('Greenbone Sensor');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toBe(2); // OpenVASDScanner and Greenbone Sensor
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVASD Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('Greenbone Sensor');
  });

  test('should only render agent controller in scanner selection if sensors are not enabled', async () => {
    const {render} = rendererWith({
      gmp: {settings: {enableGreenboneSensor: false}}, // no sensor
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(<ScannerDialog type={AGENT_CONTROLLER_SCANNER_TYPE} />);

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('Agent Controller');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toBe(2); // OpenVASD Scanner and Agent Controller
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVASD Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('Agent Controller');
  });

  test('should allow to set a CA certificate of a scanner', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        type={OPENVASD_SCANNER_TYPE}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );
    const caCertificateInput = screen.getByName('caCertificate');
    const content =
      '-----BEGIN CERTIFICATE-----\nfoo\n-----END CERTIFICATE-----';
    const file = new File([content], 'ca.crt', {
      type: 'text/plain',
    });
    // jsdom does not implement file.text() so we need to mock it
    file.text = testing.fn().mockResolvedValue(content);
    fireEvent.change(caCertificateInput, {
      target: {files: [file]},
    });

    // wait for the file to be read
    await wait();

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: file,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: OPENVASD_SCANNER_TYPE,
      id: undefined,
      port: 443,
    });
  });
});
