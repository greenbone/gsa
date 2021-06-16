/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';
import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
} from 'gmp/models/credential';

import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import TargetDialog from 'web/pages/targets/dialog';

setLocale('en');

const cred1 = Credential.fromElement({
  _id: '5678',
  name: 'client certificate',
  type: CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
});

const cred2 = Credential.fromElement({
  _id: '2345',
  name: 'username+password',
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});

const cred3 = Credential.fromElement({
  _id: '5463',
  name: 'up2',
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});

const credentials = [cred1, cred2, cred3];

const gmp = {settings: {enableGreenboneSensor: true}};

describe('TargetDialog component tests', () => {
  test('should render with default values', () => {
    const handleClose = jest.fn();
    const handleChange = jest.fn();
    const handleSave = jest.fn();
    const handleCreate = jest.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        credentials={credentials}
        onClose={handleClose}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onEsxiCredentialChange={handleChange}
        onSmbCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
        onSave={handleSave}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');
    const formgroups = screen.getAllByTestId('formgroup-title');
    const radioTitles = screen.getAllByTestId('radio-title');
    const radioInputs = screen.getAllByTestId('radio-input');

    expect(radioInputs.length).toEqual(10);

    expect(formgroups[0]).toHaveTextContent('Name');
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveAttribute('value', 'Unnamed'); // name field

    expect(formgroups[1]).toHaveTextContent('Comment');
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveAttribute('value', ''); // comment field

    expect(formgroups[2]).toHaveTextContent('Hosts');
    expect(radioTitles[0]).toHaveTextContent('Manual');
    expect(radioInputs[0]).toHaveAttribute('name', 'target_source');
    expect(radioInputs[0]).toHaveAttribute('value', 'manual');
    expect(radioInputs[0]).toHaveAttribute('checked');

    expect(inputs[3]).toHaveAttribute('name', 'hosts');
    expect(inputs[3]).toHaveAttribute('value', '');

    expect(radioTitles[1]).toHaveTextContent('From file');
    expect(radioInputs[1]).toHaveAttribute('name', 'target_source');
    expect(radioInputs[1]).toHaveAttribute('value', 'file');
    expect(radioInputs[1]).not.toHaveAttribute('checked');

    expect(inputs[5]).toHaveAttribute('name', 'file');
    expect(inputs[5]).toHaveAttribute('disabled');

    expect(formgroups[3]).toHaveTextContent('Exclude Hosts');
    expect(radioTitles[2]).toHaveTextContent('Manual');
    expect(radioInputs[2]).toHaveAttribute('name', 'target_exclude_source');
    expect(radioInputs[2]).toHaveAttribute('value', 'manual');
    expect(radioInputs[2]).toHaveAttribute('checked');

    expect(inputs[7]).toHaveAttribute('name', 'exclude_hosts');
    expect(inputs[7]).toHaveAttribute('value', '');

    expect(radioTitles[3]).toHaveTextContent('From file');
    expect(radioInputs[3]).toHaveAttribute('name', 'target_exclude_source');
    expect(radioInputs[3]).toHaveAttribute('value', 'file');
    expect(radioInputs[3]).not.toHaveAttribute('checked');

    expect(inputs[9]).toHaveAttribute('name', 'exclude_file');
    expect(inputs[9]).toHaveAttribute('disabled');

    expect(formgroups[4]).toHaveTextContent(
      'Allow simultaneous scanning via multiple IPs',
    );
    expect(radioTitles[4]).toHaveTextContent('Yes');
    expect(radioInputs[4]).toHaveAttribute('value', '1');
    expect(radioInputs[4]).toHaveAttribute('checked');

    expect(radioTitles[5]).toHaveTextContent('No');
    expect(radioInputs[5]).toHaveAttribute('name', 'allowSimultaneousIPs');
    expect(radioInputs[5]).toHaveAttribute('value', '0');
    expect(radioInputs[5]).not.toHaveAttribute('checked');

    const selectedValues = screen.getAllByTestId('select-selected-value');

    expect(baseElement).not.toHaveTextContent('Elevate privileges'); // elevate privileges should not be rendered without valid ssh_credential_id
    expect(selectedValues.length).toEqual(6); // Should only have 6 selects

    expect(formgroups[5]).toHaveTextContent('Port List');
    expect(selectedValues[0]).toHaveTextContent('OpenVAS Default');
    expect(
      screen.getAllByTitle('Create a new port list')[0],
    ).toBeInTheDocument();

    expect(formgroups[6]).toHaveTextContent('Alive Test');
    expect(selectedValues[1]).toHaveTextContent('Scan Config Default');

    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(8); // Each icon has both a span and an svg icon. There should be 4 total

    expect(formgroups[7]).toHaveTextContent('SSH');
    expect(selectedValues[2]).toHaveTextContent('--');
    expect(baseElement).toHaveTextContent('on port');

    expect(formgroups[8]).toHaveTextContent('SMB');
    expect(selectedValues[3]).toHaveTextContent('--');

    expect(formgroups[9]).toHaveTextContent('ESXi');
    expect(selectedValues[4]).toHaveTextContent('--');

    expect(formgroups[10]).toHaveTextContent('SNMP');
    expect(selectedValues[5]).toHaveTextContent('--');

    expect(formgroups[11]).toHaveTextContent('Reverse Lookup Only');
    expect(radioTitles[6]).toHaveTextContent('Yes');
    expect(radioInputs[6]).toHaveAttribute('value', '1');
    expect(radioInputs[6]).not.toHaveAttribute('checked');

    expect(radioTitles[7]).toHaveTextContent('No');
    expect(radioInputs[7]).toHaveAttribute('name', 'reverse_lookup_only');
    expect(radioInputs[7]).toHaveAttribute('value', '0');
    expect(radioInputs[7]).toHaveAttribute('checked');

    expect(formgroups[12]).toHaveTextContent('Reverse Lookup Unify');
    expect(radioTitles[8]).toHaveTextContent('Yes');
    expect(radioInputs[8]).toHaveAttribute('value', '1');
    expect(radioInputs[8]).not.toHaveAttribute('checked');

    expect(radioTitles[9]).toHaveTextContent('No');
    expect(radioInputs[9]).toHaveAttribute('name', 'reverse_lookup_unify');
    expect(radioInputs[9]).toHaveAttribute('value', '0');
    expect(radioInputs[9]).toHaveAttribute('checked');
  });

  test('should display value from props', () => {
    const handleClose = jest.fn();
    const handleChange = jest.fn();
    const handleSave = jest.fn();
    const handleCreate = jest.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        credentials={credentials}
        id={'foo'}
        alive_tests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        exclude_hosts={''}
        hosts={'123.455.67.434'}
        in_use={false}
        name={'target'}
        reverse_lookup_only={0}
        reverse_lookup_unify={0}
        smb_credential_id={'2345'}
        target_title={'Edit Target target'}
        onClose={handleClose}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onEsxiCredentialChange={handleChange}
        onSmbCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
        onSave={handleSave}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');
    const formgroups = screen.getAllByTestId('formgroup-title');
    const radioTitles = screen.getAllByTestId('radio-title');
    const radioInputs = screen.getAllByTestId('radio-input');

    expect(radioInputs.length).toEqual(10);

    expect(formgroups[0]).toHaveTextContent('Name');
    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveAttribute('value', 'target'); // name field

    expect(formgroups[1]).toHaveTextContent('Comment');
    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveAttribute('value', 'hello world'); // comment field

    expect(formgroups[2]).toHaveTextContent('Hosts');
    expect(radioTitles[0]).toHaveTextContent('Manual');
    expect(radioInputs[0]).toHaveAttribute('name', 'target_source');
    expect(radioInputs[0]).toHaveAttribute('value', 'manual');
    expect(radioInputs[0]).toHaveAttribute('checked');

    expect(inputs[3]).toHaveAttribute('name', 'hosts');
    expect(inputs[3]).toHaveAttribute('value', '123.455.67.434');

    expect(radioTitles[1]).toHaveTextContent('From file');
    expect(radioInputs[1]).toHaveAttribute('name', 'target_source');
    expect(radioInputs[1]).toHaveAttribute('value', 'file');
    expect(radioInputs[1]).not.toHaveAttribute('checked');

    expect(inputs[5]).toHaveAttribute('name', 'file');
    expect(inputs[5]).toHaveAttribute('disabled');

    expect(formgroups[3]).toHaveTextContent('Exclude Hosts');
    expect(radioTitles[2]).toHaveTextContent('Manual');
    expect(radioInputs[2]).toHaveAttribute('name', 'target_exclude_source');
    expect(radioInputs[2]).toHaveAttribute('value', 'manual');
    expect(radioInputs[2]).toHaveAttribute('checked');

    expect(inputs[7]).toHaveAttribute('name', 'exclude_hosts');
    expect(inputs[7]).toHaveAttribute('value', '');

    expect(radioTitles[3]).toHaveTextContent('From file');
    expect(radioInputs[3]).toHaveAttribute('name', 'target_exclude_source');
    expect(radioInputs[3]).toHaveAttribute('value', 'file');
    expect(radioInputs[3]).not.toHaveAttribute('checked');

    expect(inputs[9]).toHaveAttribute('name', 'exclude_file');
    expect(inputs[9]).toHaveAttribute('disabled');

    expect(formgroups[4]).toHaveTextContent(
      'Allow simultaneous scanning via multiple IPs',
    );
    expect(radioTitles[4]).toHaveTextContent('Yes');
    expect(radioInputs[4]).toHaveAttribute('value', '1');
    expect(radioInputs[4]).not.toHaveAttribute('checked');

    expect(radioTitles[5]).toHaveTextContent('No');
    expect(radioInputs[5]).toHaveAttribute('name', 'allowSimultaneousIPs');
    expect(radioInputs[5]).toHaveAttribute('value', '0');
    expect(radioInputs[5]).toHaveAttribute('checked');

    const selectedValues = screen.getAllByTestId('select-selected-value');
    expect(selectedValues.length).toEqual(6);

    expect(formgroups[5]).toHaveTextContent('Port List');
    expect(selectedValues[0]).toHaveTextContent('OpenVAS Default');
    expect(
      screen.getAllByTitle('Create a new port list')[0],
    ).toBeInTheDocument();

    expect(formgroups[6]).toHaveTextContent('Alive Test');
    expect(selectedValues[1]).toHaveTextContent('Scan Config Default');

    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(8); // Each icon has both a span and an svg icon. There should be 4 total

    expect(formgroups[7]).toHaveTextContent('SSH');
    expect(selectedValues[2]).toHaveTextContent('--');
    expect(baseElement).toHaveTextContent('on port');

    expect(formgroups[8]).toHaveTextContent('SMB');
    expect(selectedValues[3]).toHaveTextContent('username+password');

    expect(formgroups[9]).toHaveTextContent('ESXi');
    expect(selectedValues[4]).toHaveTextContent('--');

    expect(formgroups[10]).toHaveTextContent('SNMP');
    expect(selectedValues[5]).toHaveTextContent('--');

    expect(formgroups[11]).toHaveTextContent('Reverse Lookup Only');
    expect(radioTitles[6]).toHaveTextContent('Yes');
    expect(radioInputs[6]).toHaveAttribute('value', '1');
    expect(radioInputs[6]).not.toHaveAttribute('checked');

    expect(radioTitles[7]).toHaveTextContent('No');
    expect(radioInputs[7]).toHaveAttribute('name', 'reverse_lookup_only');
    expect(radioInputs[7]).toHaveAttribute('value', '0');
    expect(radioInputs[7]).toHaveAttribute('checked');

    expect(formgroups[12]).toHaveTextContent('Reverse Lookup Unify');
    expect(radioTitles[8]).toHaveTextContent('Yes');
    expect(radioInputs[8]).toHaveAttribute('value', '1');
    expect(radioInputs[8]).not.toHaveAttribute('checked');

    expect(radioTitles[9]).toHaveTextContent('No');
    expect(radioInputs[9]).toHaveAttribute('name', 'reverse_lookup_unify');
    expect(radioInputs[9]).toHaveAttribute('value', '0');
    expect(radioInputs[9]).toHaveAttribute('checked');
  });

  test('should allow to change values and save the dialog', () => {
    const handleClose = jest.fn();
    const handleChange = jest.fn();
    const handleSave = jest.fn();
    const handleCreate = jest.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {getByTestId, getByName, getAllByName} = render(
      <TargetDialog
        credentials={credentials}
        id={'foo'}
        alive_tests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        exclude_hosts={''}
        hosts={'123.455.67.434'}
        in_use={false}
        name={'target'}
        reverse_lookup_only={0}
        reverse_lookup_unify={0}
        smb_credential_id={'2345'}
        target_title={'Edit Target target'}
        onClose={handleClose}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onEsxiCredentialChange={handleChange}
        onSmbCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
        onSave={handleSave}
      />,
    );

    // text input
    const nameInput = getByName('name');
    fireEvent.change(nameInput, {target: {value: 'ross'}});

    // radio input
    const simultaneousIPInput = getAllByName('allowSimultaneousIPs');
    expect(simultaneousIPInput.length).toBe(2);

    expect(simultaneousIPInput[0]).not.toHaveAttribute('checked');
    expect(simultaneousIPInput[0]).toHaveAttribute('value', '1');

    expect(simultaneousIPInput[1]).toHaveAttribute('checked');
    expect(simultaneousIPInput[1]).toHaveAttribute('value', '0');

    fireEvent.click(simultaneousIPInput[0]); // radio button check yes

    const saveButton = getByTestId('dialog-save-button');

    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      alive_tests: 'Scan Config Default',
      allowSimultaneousIPs: 1,
      comment: 'hello world',
      esxi_credential_id: '0',
      exclude_hosts: '',
      hosts: '123.455.67.434',
      hosts_count: undefined,
      id: 'foo',
      in_use: false,
      name: 'ross',
      port: 22,
      port_list_id: 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5',
      reverse_lookup_only: 0,
      reverse_lookup_unify: 0,
      smb_credential_id: '2345',
      snmp_credential_id: '0',
      ssh_credential_id: '0',
      ssh_elevate_credential_id: '0',
      target_exclude_source: 'manual',
      target_source: 'manual',
      target_title: 'Edit Target target',
    });
  });

  test('should render elevate privilege option if ssh credential is defined', () => {
    const handleClose = jest.fn();
    const handleChange = jest.fn();
    const handleSave = jest.fn();
    const handleCreate = jest.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        credentials={credentials}
        id={'foo'}
        alive_tests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        exclude_hosts={''}
        hosts={'123.455.67.434'}
        in_use={false}
        name={'target'}
        reverse_lookup_only={0}
        reverse_lookup_unify={0}
        smb_credential_id={'2345'}
        ssh_credential_id={'2345'}
        target_title={'Edit Target target'}
        onClose={handleClose}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onEsxiCredentialChange={handleChange}
        onSmbCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toHaveTextContent('Elevate privileges');

    const selectedValues = screen.getAllByTestId('select-selected-value');
    expect(selectedValues.length).toEqual(7); // Should have 7 selects

    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(10); // Each icon has both a span and an svg icon. There should be 5 total, including elevate privileges
  });

  test('ssh elevate credential dropdown should only allow username + password options and remove ssh credential from list', () => {
    const handleClose = jest.fn();
    const handleChange = jest.fn();
    const handleSave = jest.fn();
    const handleCreate = jest.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement, queryAllByTestId} = render(
      <TargetDialog
        credentials={credentials}
        id={'foo'}
        alive_tests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        exclude_hosts={''}
        hosts={'123.455.67.434'}
        in_use={false}
        name={'target'}
        reverse_lookup_only={0}
        reverse_lookup_unify={0}
        smb_credential_id={'23456'}
        ssh_credential_id={'2345'}
        target_title={'Edit Target target'}
        onClose={handleClose}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onEsxiCredentialChange={handleChange}
        onSmbCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toHaveTextContent('Elevate privileges');

    const selectedValues = screen.getAllByTestId('select-selected-value');
    expect(selectedValues.length).toEqual(7); // Should have 7 selects

    const selectOpenButton = screen.getAllByTestId('select-open-button');
    let selectItems = queryAllByTestId('select-item');

    expect(selectItems.length).toBe(0);

    fireEvent.click(selectOpenButton[3]);

    selectItems = queryAllByTestId('select-item');
    expect(selectItems.length).toBe(2); // "original" ssh option removed

    expect(selectItems[0]).toHaveTextContent('--'); // null option
    expect(selectItems[1]).toHaveTextContent('up2');
  });

  test('should disable editing certain fields if target is in use', () => {
    const handleClose = jest.fn();
    const handleChange = jest.fn();
    const handleSave = jest.fn();
    const handleCreate = jest.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement, queryAllByTitle} = render(
      <TargetDialog
        credentials={credentials}
        id={'foo'}
        alive_tests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        exclude_hosts={''}
        hosts={'123.455.67.434'}
        in_use={true}
        name={'target'}
        reverse_lookup_only={0}
        reverse_lookup_unify={0}
        smb_credential_id={'23456'}
        ssh_credential_id={'2345'}
        ssh_elevate_credential_id={'2345'}
        target_title={'Edit Target target'}
        onClose={handleClose}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onEsxiCredentialChange={handleChange}
        onSmbCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toHaveTextContent('Elevate privileges');

    const newIcons = queryAllByTitle('Create a new credential');
    expect(newIcons.length).toBe(0); // no new credential can be created

    const selectedValues = screen.getAllByTestId('select-selected-value');
    expect(selectedValues.length).toEqual(7); // Should have 7 selects

    expect(selectedValues[0]).toHaveTextContent('OpenVAS Default');
    expect(selectedValues[0]).toHaveAttribute('disabled');

    expect(selectedValues[1]).toHaveTextContent('Scan Config Default');
    expect(selectedValues[2]).toHaveTextContent('username+password');
    expect(selectedValues[2]).toHaveAttribute('disabled');

    expect(selectedValues[3]).toHaveTextContent('2345');
    expect(selectedValues[3]).toHaveAttribute('disabled');
    expect(selectedValues[4]).toHaveTextContent('23456');
    expect(selectedValues[4]).toHaveAttribute('disabled');

    expect(selectedValues[5]).toHaveTextContent('--');
    expect(selectedValues[5]).toHaveAttribute('disabled');

    expect(selectedValues[6]).toHaveTextContent('--');
    expect(selectedValues[6]).toHaveAttribute('disabled');
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleChange = jest.fn();
    const handleSave = jest.fn();
    const handleCreate = jest.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {getByTestId} = render(
      <TargetDialog
        credentials={credentials}
        onClose={handleClose}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onEsxiCredentialChange={handleChange}
        onSmbCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
