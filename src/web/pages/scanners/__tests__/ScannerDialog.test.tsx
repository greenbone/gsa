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
  openSelectElement,
} from 'web/testing';
import Features from 'gmp/capabilities/features';
import {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  CONTAINER_IMAGE_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  OPENVAS_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';
import ScannerDialog from 'web/pages/scanners/ScannerDialog';

const createGmp = ({enableGreenboneSensor = true} = {}) => {
  return {settings: {enableGreenboneSensor}};
};

describe('ScannerDialog tests', () => {
  test('should display defaults without scanner type provided', async () => {
    const gmp = createGmp({enableGreenboneSensor: false});
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(<ScannerDialog onSave={handleSave} />);

    expect(screen.getByName('name')).toHaveValue('Unnamed');
    expect(screen.getByName('comment')).toHaveValue(''); // comment field

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('');

    expect(screen.queryByName('host')).not.toBeInTheDocument();
    expect(screen.queryByName('port')).not.toBeInTheDocument();
    expect(screen.queryByName('caCertificate')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', {name: 'Credential'}),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: undefined,
      id: undefined,
      port: '',
    });
  });

  test('should display defaults for greenbone sensor', async () => {
    const gmp = createGmp();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        type={GREENBONE_SENSOR_SCANNER_TYPE}
        onSave={handleSave}
      />,
    );

    expect(screen.getByName('name')).toHaveValue('Unnamed');
    expect(screen.getByName('comment')).toHaveValue(''); // comment field

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Greenbone Sensor');
    expect(screen.getByName('host')).toHaveValue('localhost');
    expect(screen.queryByName('port')).not.toBeInTheDocument();
    expect(screen.queryByName('caCertificate')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', {name: 'Credential'}),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: GREENBONE_SENSOR_SCANNER_TYPE,
      id: undefined,
      port: 22,
    });
  });

  test('should display defaults for agent sensor', async () => {
    const gmp = createGmp();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        type={AGENT_CONTROLLER_SENSOR_SCANNER_TYPE}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Agent Sensor');
    expect(screen.getByName('host')).toHaveValue('localhost');
    expect(screen.getByName('port')).toHaveValue('22');
    expect(screen.queryByName('caCertificate')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', {name: 'Credential'}),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
      id: undefined,
      port: 22,
    });
  });

  test('should display defaults for openvas scanner', async () => {
    const gmp = createGmp();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_OPENVASD']),
    });

    render(<ScannerDialog type={OPENVAS_SCANNER_TYPE} onSave={handleSave} />);

    expect(screen.getByName('name')).toHaveValue('Unnamed');
    expect(screen.getByName('comment')).toHaveValue('');

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('OpenVAS Scanner');

    expect(screen.getByName('host')).toHaveValue('localhost');
    expect(screen.getByName('port')).toHaveValue('');
    expect(screen.getByName('caCertificate')).toHaveValue('');
    expect(screen.getByRole('textbox', {name: 'Credential'})).toHaveValue('');

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: OPENVAS_SCANNER_TYPE,
      id: undefined,
      port: '',
    });
  });

  test('should display defaults for openvasd scanner', async () => {
    const gmp = createGmp();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_OPENVASD']),
    });

    render(<ScannerDialog type={OPENVASD_SCANNER_TYPE} onSave={handleSave} />);

    expect(screen.getByName('name')).toHaveValue('Unnamed');
    expect(screen.getByName('comment')).toHaveValue('');
    expect(screen.getByName('host')).toHaveValue('localhost');
    expect(screen.getByName('port')).toHaveValue('443');

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('OpenVASD Scanner');
    expect(screen.getByRole('textbox', {name: 'Credential'})).toHaveValue('');
    expect(screen.getByName('caCertificate')).toHaveValue('');

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: OPENVASD_SCANNER_TYPE,
      id: undefined,
      port: 443,
    });
  });

  test('should display defaults for agent controller', async () => {
    const gmp = createGmp();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(
      <ScannerDialog
        type={AGENT_CONTROLLER_SCANNER_TYPE}
        onSave={handleSave}
      />,
    );

    expect(screen.getByName('name')).toHaveValue('Unnamed');
    expect(screen.getByName('comment')).toHaveValue('');
    expect(screen.getByName('host')).toHaveValue('localhost');
    expect(screen.getByName('port')).toHaveValue('443');

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Agent Controller');
    expect(screen.getByRole('textbox', {name: 'Credential'})).toHaveValue('');
    expect(screen.getByName('caCertificate')).toHaveValue('');

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: AGENT_CONTROLLER_SCANNER_TYPE,
      id: undefined,
      port: 443,
    });
  });

  test('should display defaults for container image scanner', async () => {
    const gmp = createGmp();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_CONTAINER_SCANNING']),
    });

    render(
      <ScannerDialog type={CONTAINER_IMAGE_SCANNER_TYPE} onSave={handleSave} />,
    );

    expect(screen.getByName('name')).toHaveValue('Unnamed');
    expect(screen.getByName('comment')).toHaveValue('');
    expect(screen.getByName('host')).toHaveValue('localhost');
    expect(screen.getByName('port')).toHaveValue('443');

    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Container Image Scanner');
    expect(screen.queryByRole('textbox', {name: 'Credential'})).toHaveValue('');
    expect(screen.queryByName('caCertificate')).toHaveValue('');

    fireEvent.click(screen.getDialogSaveButton());
    expect(handleSave).toHaveBeenCalledWith({
      caCertificate: undefined,
      host: 'localhost',
      name: 'Unnamed',
      comment: '',
      credentialId: undefined,
      type: CONTAINER_IMAGE_SCANNER_TYPE,
      id: undefined,
      port: 443,
    });
  });

  test('should display value from props', async () => {
    const gmp = createGmp();
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

  test('should allow to save dialog', async () => {
    const gmp = createGmp();
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
    const gmp = createGmp();
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
        type={AGENT_CONTROLLER_SCANNER_TYPE}
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
    expect(scannerType).toHaveValue('Agent Controller');
    await openSelectElement(scannerType);
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

  test('should allow to select all scanner types if sensors, openvasd and agents are enabled', async () => {
    const gmp = createGmp({enableGreenboneSensor: false});
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS', 'ENABLE_OPENVASD']),
    });

    render(<ScannerDialog />);

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toBe(3); // OpenVAS Scanner, OpenVASD Scanner, Agent Controller
  });

  test('should not allow to change host, port and type if scanner is in use', () => {
    const gmp = createGmp();
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
        type={OPENVASD_SCANNER_TYPE}
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
      type: OPENVASD_SCANNER_TYPE,
      id: '1234',
      port: 22,
    });
  });

  test('should allow to close the dialog', async () => {
    const gmp = createGmp();
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
    const gmp = createGmp();
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
    expect(scannerTypeItems.length).toEqual(2); // OpenVAS Scanner and Greenbone Sensor
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVAS Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('Greenbone Sensor');
  });

  test('should not render agent controller in scanner selection if agent permission is missing', async () => {
    const gmp = createGmp();
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
    expect(scannerTypeItems.length).toEqual(2); // OpenVAS Scanner, OpenVASD Scanner and Greenbone Sensor
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVAS Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('Greenbone Sensor');
  });

  test('should only render agent controller in scanner selection if sensors are not enabled', async () => {
    const gmp = createGmp({enableGreenboneSensor: false});
    const {render} = rendererWith({
      gmp,
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
    expect(scannerTypeItems.length).toEqual(2); // OpenVAS Scanner and Agent Controller
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVAS Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('Agent Controller');
  });

  test('should allow to set a CA certificate of a scanner', async () => {
    const gmp = createGmp();
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        type={OPENVAS_SCANNER_TYPE}
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
      type: OPENVAS_SCANNER_TYPE,
      id: undefined,
      port: '',
    });
  });

  test('should render openvasd in scanner selection if feature is enabled', async () => {
    const gmp = createGmp({enableGreenboneSensor: false}); // no sensor
    const {render} = rendererWith({
      gmp, // no sensor
      capabilities: true,
      features: new Features(['ENABLE_OPENVASD']),
    });

    render(<ScannerDialog type={OPENVASD_SCANNER_TYPE} />);

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('OpenVASD Scanner');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toEqual(2); // OpenVAS Scanner and OpenVASD Scanner
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVAS Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('OpenVASD Scanner');
  });

  test('should not render openvasd in scanner selection if feature is disabled', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features([]), // no OPENVASD feature
    });

    render(<ScannerDialog type={OPENVASD_SCANNER_TYPE} />);

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toEqual(2); // OpenVAS Scanner and Greenbone Sensor
    expect(scannerTypeItems[0]).toHaveTextContent('OpenVAS Scanner');
    expect(scannerTypeItems[1]).toHaveTextContent('Greenbone Sensor');
  });

  test('should not show host, port, credential and certificate if scanner type is not set', async () => {
    const gmp = createGmp({enableGreenboneSensor: false});
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AGENTS']),
    });

    render(<ScannerDialog onClose={handleClose} onSave={handleSave} />);

    expect(screen.getByRole('textbox', {name: 'Scanner Type'})).toBeVisible();
    expect(screen.getByName('name')).toBeVisible();
    expect(screen.getByName('comment')).toBeVisible();
    expect(screen.getByRole('textbox', {name: 'Scanner Type'})).toBeVisible();

    expect(screen.queryByName('host')).not.toBeInTheDocument();
    expect(screen.queryByName('port')).not.toBeInTheDocument();
    expect(screen.queryByName('caCertificate')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', {name: 'Credential'}),
    ).not.toBeInTheDocument();

    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems[1]).toHaveTextContent('Agent Controller');

    fireEvent.click(scannerTypeItems[1]); // select Agent Controller
    expect(screen.getByName('host')).toBeVisible();
    expect(screen.getByName('port')).toBeVisible();
    expect(screen.getByName('caCertificate')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: 'Credential'})).toBeVisible();
  });

  test('should show current scanner type even if feature is disabled', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features([]),
    });

    render(<ScannerDialog id="123" type={AGENT_CONTROLLER_SCANNER_TYPE} />);

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Scanner Type',
    });
    expect(scannerType).toHaveValue('Agent Controller');
    const scannerTypeItems = await getSelectItemElementsForSelect(scannerType);
    expect(scannerTypeItems.length).toBe(3); // OpenVAS Scanner, Greenbone Sensor and Agent Controller
  });

  test('should use greenbone sensor scanner as default if enabled and no initial scanner type', async () => {
    const gmp = createGmp();
    const handleClose = testing.fn();
    const handleCredentialChange = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerDialog
        onClose={handleClose}
        onCredentialChange={handleCredentialChange}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    const scannerType = screen.getByRole('textbox', {name: 'Scanner Type'});
    expect(scannerType).toHaveValue('Greenbone Sensor');
  });
});
