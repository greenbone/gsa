/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import Date from 'gmp/models/date';
import ScanConfig from 'gmp/models/scanconfig';
import {
  closeDialog,
  getElementOrReturnDocument,
  getRadioInputs,
} from 'web/components/testing';
import {rendererWith, fireEvent, screen} from 'web/utils/Testing';
import AdvancedTaskWizard from 'web/wizard/AdvancedTaskWizard';

const alertCapabilities = new Capabilities(['create_alert', 'get_alerts']);
const scheduleCapabilities = new Capabilities([
  'create_schedule',
  'get_schedules',
]);

const config1 = ScanConfig.fromElement({_id: '1234', name: 'config 1'});

const credential1 = Credential.fromElement({
  _id: '5678',
  name: 'credential 1',
  type: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
});
const credential2 = Credential.fromElement({
  _id: '91011',
  name: 'credential 1',
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});
const credential3 = Credential.fromElement({
  _id: '121314',
  name: 'credential 1',
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});

const credentials = [credential1, credential2, credential3];
const scanConfigs = [config1];
const startDate = Date('2020-01-01T12:10:00Z');
const taskName = 'task 1';
const targetHosts = '123.456.78.910';
const configId = '1234';
const sshCredential = '5678';
const smbCredential = '91011';
const esxiCredential = '121314';
const startMinute = 10;
const startHour = 12;
const startTimezone = 'Coordinated Universal Time';

const getFormGroupTitles = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll('.mantine-Text-root');
};

const getRadioTitles = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll('.mantine-Radio-label');
};

describe('AdvancedTaskWizard component tests', () => {
  test('should render full advanced wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <AdvancedTaskWizard
        config_id={configId}
        credentials={credentials}
        esxi_credential={esxiCredential}
        scan_configs={scanConfigs}
        smb_credential={smbCredential}
        ssh_credential={sshCredential}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        target_hosts={targetHosts}
        task_name={taskName}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formGroups = getFormGroupTitles();
    const radioInputs = getRadioInputs();
    const radioTitles = getRadioTitles();

    const selectedDate = '01/01/2020';
    const datePickerLabel = screen.getByLabelText('Start Date');
    const startDateButton = screen.getByDisplayValue(selectedDate);

    const selectedTime = '12:10';
    const timePickerLabel = screen.getByLabelText('Start Time');

    expect(startDateButton).toBeVisible();
    expect(datePickerLabel).toBeVisible();
    expect(startDateButton).toHaveValue(selectedDate);

    expect(timePickerLabel).toBeVisible();
    expect(timePickerLabel).toHaveValue(selectedTime);

    expect(formGroups[0]).toHaveTextContent('Task Name');

    expect(formGroups[1]).toHaveTextContent('Scan Config');

    expect(formGroups[2]).toHaveTextContent('Target Host(s)');
    const targetHostsInput = getByName('target_hosts');
    expect(targetHostsInput).toHaveAttribute('value', targetHosts);

    expect(formGroups[3]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '2');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Start immediately');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule:');

    expect(radioInputs[2]).toHaveAttribute('value', '0');
    expect(radioInputs[2].checked).toEqual(false);
    expect(radioTitles[2]).toHaveTextContent('Do not start automatically');

    expect(formGroups[4]).toHaveTextContent('SSH Credential');
    expect(formGroups[5]).toHaveTextContent('SMB Credential');
    expect(formGroups[6]).toHaveTextContent('ESXi Credential');

    expect(formGroups[7]).toHaveTextContent('Email report to');
  });

  test('should not render schedule without permission', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: alertCapabilities,
    });

    const {baseElement} = render(
      <AdvancedTaskWizard
        config_id={configId}
        credentials={credentials}
        esxi_credential={esxiCredential}
        scan_configs={scanConfigs}
        smb_credential={smbCredential}
        ssh_credential={sshCredential}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        target_hosts={targetHosts}
        task_name={taskName}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formGroups = getFormGroupTitles();
    const radioInputs = getRadioInputs();
    const radioTitles = getRadioTitles();

    expect(formGroups[0]).toHaveTextContent('Task Name');

    expect(formGroups[1]).toHaveTextContent('Scan Config');

    expect(formGroups[2]).toHaveTextContent('Target Host(s)');

    expect(formGroups[3]).toHaveTextContent('Start Time');

    expect(radioInputs.length).toBe(2);
    expect(baseElement).not.toHaveTextContent('Create Schedule:');

    expect(radioInputs[0]).toHaveAttribute('value', '2');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Start immediately');

    expect(radioInputs[1]).toHaveAttribute('value', '0');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Do not start automatically');

    expect(formGroups[4]).toHaveTextContent('SSH Credential');
    expect(formGroups[5]).toHaveTextContent('SMB Credential');
    expect(formGroups[6]).toHaveTextContent('ESXi Credential');

    expect(formGroups[7]).toHaveTextContent('Email report to');
  });

  test('should not render alert without permission', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: scheduleCapabilities,
    });

    const {baseElement, getByName} = render(
      <AdvancedTaskWizard
        config_id={configId}
        credentials={credentials}
        esxi_credential={esxiCredential}
        scan_configs={scanConfigs}
        smb_credential={smbCredential}
        ssh_credential={sshCredential}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        target_hosts={targetHosts}
        task_name={taskName}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formGroups = getFormGroupTitles();
    const radioInputs = getRadioInputs();
    const radioTitles = getRadioTitles();

    expect(formGroups[0]).toHaveTextContent('Task Name');

    expect(formGroups[1]).toHaveTextContent('Scan Config');

    expect(formGroups[2]).toHaveTextContent('Target Host(s)');
    const targetHostsInput = getByName('target_hosts');
    expect(targetHostsInput).toHaveAttribute('value', targetHosts);

    expect(formGroups[3]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '2');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Start immediately');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule:');

    expect(radioInputs[2]).toHaveAttribute('value', '0');
    expect(radioInputs[2].checked).toEqual(false);
    expect(radioTitles[2]).toHaveTextContent('Do not start automatically');

    expect(formGroups[4]).toHaveTextContent('SSH Credential');
    expect(formGroups[5]).toHaveTextContent('SMB Credential');
    expect(formGroups[6]).toHaveTextContent('ESXi Credential');

    expect(formGroups.length).toBe(7);
    expect(baseElement).not.toHaveTextContent('Email report to');
  });

  test('should allow to close the advanced wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <AdvancedTaskWizard
        config_id={configId}
        credentials={credentials}
        esxi_credential={esxiCredential}
        scan_configs={scanConfigs}
        smb_credential={smbCredential}
        ssh_credential={sshCredential}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        target_hosts={targetHosts}
        task_name={taskName}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    closeDialog();

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to cancel the advanced wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <AdvancedTaskWizard
        config_id={configId}
        credentials={credentials}
        esxi_credential={esxiCredential}
        scan_configs={scanConfigs}
        smb_credential={smbCredential}
        ssh_credential={sshCredential}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        target_hosts={targetHosts}
        task_name={taskName}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const cancelButton = screen.getByTestId('dialog-close-button');

    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the advanced wizard', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <AdvancedTaskWizard
        config_id={configId}
        credentials={credentials}
        esxi_credential={esxiCredential}
        scan_configs={scanConfigs}
        smb_credential={smbCredential}
        ssh_credential={sshCredential}
        start_date={startDate}
        start_hour={startHour}
        start_minute={startMinute}
        start_timezone={startTimezone}
        target_hosts={targetHosts}
        task_name={taskName}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('task_name');
    fireEvent.change(nameInput, {target: {value: 'Foo'}});

    const saveButton = screen.getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      alert_email: undefined,
      auto_start: '2',
      config_id: configId,
      credentials: [],
      esxi_credential: esxiCredential,
      scan_configs: [],
      smb_credential: smbCredential,
      ssh_credential: sshCredential,
      ssh_port: 22,
      start_date: startDate,
      start_hour: startHour,
      start_minute: startMinute,
      start_timezone: startTimezone,
      target_hosts: targetHosts,
      task_name: 'Foo',
    });
  });
});
