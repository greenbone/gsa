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

import Capabilities from 'gmp/capabilities/capabilities';

import Date, {setLocale} from 'gmp/models/date';

import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import ScanConfig from 'gmp/models/scanconfig';

import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import AdvancedTaskWizard from '../advancedtaskwizard';

setLocale('en');

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
const startTimezone = 'UTC';

describe('AdvancedTaskWizard component tests', () => {
  test('should render full advanced wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <AdvancedTaskWizard
        credentials={credentials}
        scanConfigs={scanConfigs}
        startDate={startDate}
        taskName={taskName}
        targetHosts={targetHosts}
        configId={configId}
        sshCredential={sshCredential}
        smbCredential={smbCredential}
        esxiCredential={esxiCredential}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formgroups = screen.getAllByTestId('formgroup-title');
    const radioInputs = screen.getAllByTestId('radio-input');
    const radioTitles = screen.getAllByTestId('radio-title');

    expect(formgroups[0]).toHaveTextContent('Task Name');

    expect(formgroups[1]).toHaveTextContent('Scan Config');

    expect(formgroups[2]).toHaveTextContent('Target Host(s)');
    const targetHostsInput = getByName('targetHosts');
    expect(targetHostsInput).toHaveAttribute('value', targetHosts);

    expect(formgroups[3]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '2');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Start immediately');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule:');

    expect(radioInputs[2]).toHaveAttribute('value', '0');
    expect(radioInputs[2].checked).toEqual(false);
    expect(radioTitles[2]).toHaveTextContent('Do not start automatically');

    expect(formgroups[4]).toHaveTextContent('SSH Credential');
    expect(formgroups[5]).toHaveTextContent('SMB Credential');
    expect(formgroups[6]).toHaveTextContent('ESXi Credential');

    expect(formgroups[7]).toHaveTextContent('Email report to');
  });

  test('should not render schedule without permission', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: alertCapabilities,
    });

    const {baseElement} = render(
      <AdvancedTaskWizard
        credentials={credentials}
        scanConfigs={scanConfigs}
        startDate={startDate}
        taskName={taskName}
        targetHosts={targetHosts}
        configId={configId}
        sshCredential={sshCredential}
        smbCredential={smbCredential}
        esxiCredential={esxiCredential}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formgroups = screen.getAllByTestId('formgroup-title');
    const radioInputs = screen.getAllByTestId('radio-input');
    const radioTitles = screen.getAllByTestId('radio-title');

    expect(formgroups[0]).toHaveTextContent('Task Name');

    expect(formgroups[1]).toHaveTextContent('Scan Config');

    expect(formgroups[2]).toHaveTextContent('Target Host(s)');

    expect(formgroups[3]).toHaveTextContent('Start Time');

    expect(radioInputs.length).toBe(2);
    expect(baseElement).not.toHaveTextContent('Create Schedule:');

    expect(radioInputs[0]).toHaveAttribute('value', '2');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Start immediately');

    expect(radioInputs[1]).toHaveAttribute('value', '0');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Do not start automatically');

    expect(formgroups[4]).toHaveTextContent('SSH Credential');
    expect(formgroups[5]).toHaveTextContent('SMB Credential');
    expect(formgroups[6]).toHaveTextContent('ESXi Credential');

    expect(formgroups[7]).toHaveTextContent('Email report to');
  });

  test('should not render alert without permission', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: scheduleCapabilities,
    });

    const {baseElement, getByName} = render(
      <AdvancedTaskWizard
        credentials={credentials}
        scanConfigs={scanConfigs}
        startDate={startDate}
        taskName={taskName}
        targetHosts={targetHosts}
        configId={configId}
        sshCredential={sshCredential}
        smbCredential={smbCredential}
        esxiCredential={esxiCredential}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const formgroups = screen.getAllByTestId('formgroup-title');
    const radioInputs = screen.getAllByTestId('radio-input');
    const radioTitles = screen.getAllByTestId('radio-title');

    expect(formgroups[0]).toHaveTextContent('Task Name');

    expect(formgroups[1]).toHaveTextContent('Scan Config');

    expect(formgroups[2]).toHaveTextContent('Target Host(s)');
    const targetHostsInput = getByName('targetHosts');
    expect(targetHostsInput).toHaveAttribute('value', targetHosts);

    expect(formgroups[3]).toHaveTextContent('Start Time');
    expect(radioInputs[0]).toHaveAttribute('value', '2');
    expect(radioInputs[0].checked).toEqual(true);
    expect(radioTitles[0]).toHaveTextContent('Start immediately');

    expect(radioInputs[1]).toHaveAttribute('value', '1');
    expect(radioInputs[1].checked).toEqual(false);
    expect(radioTitles[1]).toHaveTextContent('Create Schedule:');

    expect(radioInputs[2]).toHaveAttribute('value', '0');
    expect(radioInputs[2].checked).toEqual(false);
    expect(radioTitles[2]).toHaveTextContent('Do not start automatically');

    expect(formgroups[4]).toHaveTextContent('SSH Credential');
    expect(formgroups[5]).toHaveTextContent('SMB Credential');
    expect(formgroups[6]).toHaveTextContent('ESXi Credential');

    expect(formgroups.length).toBe(7);
    expect(baseElement).not.toHaveTextContent('Email report to');
  });

  test('should allow to close the advanced wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <AdvancedTaskWizard
        credentials={credentials}
        scanConfigs={scanConfigs}
        startDate={startDate}
        taskName={taskName}
        targetHosts={targetHosts}
        configId={configId}
        sshCredential={sshCredential}
        smbCredential={smbCredential}
        esxiCredential={esxiCredential}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getByTestId('dialog-title-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to cancel the advanced wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <AdvancedTaskWizard
        credentials={credentials}
        scanConfigs={scanConfigs}
        startDate={startDate}
        taskName={taskName}
        targetHosts={targetHosts}
        configId={configId}
        sshCredential={sshCredential}
        smbCredential={smbCredential}
        esxiCredential={esxiCredential}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const cancelButton = screen.getByTestId('dialog-close-button');

    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the advanced wizard', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <AdvancedTaskWizard
        credentials={credentials}
        scanConfigs={scanConfigs}
        startDate={startDate}
        taskName={taskName}
        targetHosts={targetHosts}
        configId={configId}
        sshCredential={sshCredential}
        smbCredential={smbCredential}
        esxiCredential={esxiCredential}
        startTimezone={startTimezone}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('taskName');
    fireEvent.change(nameInput, {target: {value: 'Foo'}});

    const saveButton = screen.getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      alertEmail: undefined,
      autoStart: '2',
      configId: configId,
      credentials: [],
      esxiCredential: esxiCredential,
      scanConfigs: [],
      smbCredential: smbCredential,
      sshCredential: sshCredential,
      sshPort: 22,
      startDate: startDate,
      startTimezone: startTimezone,
      targetHosts: targetHosts,
      taskName: 'Foo',
    });
  });
});
