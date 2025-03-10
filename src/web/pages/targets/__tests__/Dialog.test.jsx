/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  KRB5_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import {
  changeInputValue,
  getDialogCloseButton,
  getDialogSaveButton,
  queryFileInputs,
  getRadioInputs,
  queryAllSelectElements,
  getSelectItemElementsForSelect,
  queryTextInputs,
} from 'web/components/testing';
import TargetDialog from 'web/pages/targets/Dialog';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/Testing';

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

const cred4 = Credential.fromElement({
  id: '6536',
  name: 'ssh_key',
  type: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
});

const cred5 = Credential.fromElement({
  _id: '2345',
  name: 'krb5_key',
  type: KRB5_CREDENTIAL_TYPE,
});

const credentials = [cred1, cred2, cred3, cred4, cred5];

const gmp = {settings: {
  enableGreenboneSensor: true,
  enableKrb5: false,
}};

describe('TargetDialog component tests', () => {
  test('should render with default values', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        credentials={credentials}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    const inputs = queryTextInputs();
    const fileInputs = queryFileInputs();
    const radioInputs = getRadioInputs();

    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('Unnamed'); // name field

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue(''); // comment field

    expect(radioInputs[0]).toHaveAttribute('name', 'targetSource');
    expect(radioInputs[0]).toHaveAttribute('value', 'manual');
    expect(radioInputs[0]).toBeChecked();

    expect(inputs[2]).toHaveAttribute('name', 'hosts');
    expect(inputs[2]).toHaveValue('');

    expect(radioInputs[1]).toHaveAttribute('name', 'targetSource');
    expect(radioInputs[1]).toHaveAttribute('value', 'file');
    expect(radioInputs[1]).not.toBeChecked();

    expect(fileInputs[0]).toBeDisabled();

    expect(radioInputs[2]).toHaveAttribute('name', 'targetExcludeSource');
    expect(radioInputs[2]).toHaveAttribute('value', 'manual');
    expect(radioInputs[2]).toBeChecked();

    expect(inputs[3]).toHaveAttribute('name', 'excludeHosts');
    expect(inputs[3]).toHaveValue('');

    expect(radioInputs[3]).toHaveAttribute('name', 'targetExcludeSource');
    expect(radioInputs[3]).toHaveAttribute('value', 'file');
    expect(radioInputs[3]).not.toBeChecked();

    expect(fileInputs[1]).toBeDisabled();

    expect(radioInputs[4]).toHaveAttribute('value', '1');
    expect(radioInputs[4]).toBeChecked();

    expect(radioInputs[5]).toHaveAttribute('name', 'allowSimultaneousIPs');
    expect(radioInputs[5]).toHaveAttribute('value', '0');
    expect(radioInputs[5]).not.toBeChecked();

    const selects = queryAllSelectElements();

    expect(baseElement).not.toHaveTextContent('Elevate privileges'); // elevate privileges should not be rendered without valid sshCredentialId

    expect(selects[0]).toHaveValue('OpenVAS Default');
    expect(
      screen.getAllByTitle('Create a new port list')[0],
    ).toBeInTheDocument();

    expect(selects[1]).toHaveValue('Scan Config Default');

    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(8); // Each icon has both a span and an svg icon. There should be 4 total (Kerberos is disabled by default)

    expect(selects[2]).toHaveValue('--');
    expect(baseElement).toHaveTextContent('on port');
    expect(selects[3]).toHaveValue('--');
    expect(selects[4]).toHaveValue('--');
    expect(selects[5]).toHaveValue('--');

    expect(radioInputs[6]).toHaveAttribute('value', '1');
    expect(radioInputs[6]).not.toBeChecked();

    expect(radioInputs[7]).toHaveAttribute('name', 'reverseLookupOnly');
    expect(radioInputs[7]).toHaveAttribute('value', '0');
    expect(radioInputs[7]).toBeChecked();

    expect(radioInputs[8]).toHaveAttribute('value', '1');
    expect(radioInputs[8]).not.toBeChecked();

    expect(radioInputs[9]).toHaveAttribute('name', 'reverseLookupUnify');
    expect(radioInputs[9]).toHaveAttribute('value', '0');
    expect(radioInputs[9]).toBeChecked();
  });

  test('should display value from props', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        aliveTests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        credentials={credentials}
        excludeHosts={''}
        hosts={'123.455.67.434'}
        id={'foo'}
        inUse={false}
        name={'target'}
        reverseLookupOnly={0}
        reverseLookupUnify={0}
        smbCredentialId={'2345'}
        targetTitle={'Edit Target target'}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    const inputs = queryTextInputs();
    const radioInputs = getRadioInputs();
    const fileInputs = queryFileInputs();
    const selects = queryAllSelectElements();

    expect(inputs[0]).toHaveAttribute('name', 'name');
    expect(inputs[0]).toHaveValue('target'); // name field

    expect(inputs[1]).toHaveAttribute('name', 'comment');
    expect(inputs[1]).toHaveValue('hello world'); // comment field

    expect(radioInputs[0]).toHaveAttribute('name', 'targetSource');
    expect(radioInputs[0]).toHaveAttribute('value', 'manual');
    expect(radioInputs[0]).toBeChecked();

    expect(inputs[2]).toHaveAttribute('name', 'hosts');
    expect(inputs[2]).toHaveAttribute('value', '123.455.67.434');

    expect(radioInputs[1]).toHaveAttribute('name', 'targetSource');
    expect(radioInputs[1]).toHaveAttribute('value', 'file');
    expect(radioInputs[1]).not.toBeChecked();

    expect(fileInputs[0]).toHaveAttribute('disabled');

    expect(radioInputs[2]).toHaveAttribute('name', 'targetExcludeSource');
    expect(radioInputs[2]).toHaveAttribute('value', 'manual');
    expect(radioInputs[2]).toBeChecked();

    expect(inputs[3]).toHaveAttribute('name', 'excludeHosts');
    expect(inputs[3]).toHaveValue('');

    expect(radioInputs[3]).toHaveAttribute('name', 'targetExcludeSource');
    expect(radioInputs[3]).toHaveAttribute('value', 'file');
    expect(radioInputs[3]).not.toBeChecked();

    expect(fileInputs[1]).toBeDisabled();

    expect(radioInputs[4]).toHaveAttribute('value', '1');
    expect(radioInputs[4]).not.toBeChecked();

    expect(radioInputs[5]).toHaveAttribute('name', 'allowSimultaneousIPs');
    expect(radioInputs[5]).toHaveAttribute('value', '0');
    expect(radioInputs[5]).toBeChecked();

    expect(selects[0]).toHaveValue('OpenVAS Default');
    expect(
      screen.getAllByTitle('Create a new port list')[0],
    ).toBeInTheDocument();

    expect(selects[1]).toHaveValue('Scan Config Default');

    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(8); // Each icon has both a span and an svg icon. There should be 4 total (Kerberos is disabled by default)

    expect(baseElement).toHaveTextContent('on port');

    expect(selects[2]).toHaveValue('--');
    expect(selects[3]).toHaveValue('username+password');
    expect(selects[4]).toHaveValue('--');
    expect(selects[5]).toHaveValue('--');

    expect(radioInputs[6]).toHaveAttribute('value', '1');
    expect(radioInputs[6]).not.toBeChecked();

    expect(radioInputs[7]).toHaveAttribute('name', 'reverseLookupOnly');
    expect(radioInputs[7]).toHaveAttribute('value', '0');
    expect(radioInputs[7]).toBeChecked();

    expect(radioInputs[8]).toHaveAttribute('value', '1');
    expect(radioInputs[8]).not.toBeChecked();

    expect(radioInputs[9]).toHaveAttribute('name', 'reverseLookupUnify');
    expect(radioInputs[9]).toHaveAttribute('value', '0');
    expect(radioInputs[9]).toBeChecked();
  });

  test('should allow to change values and save the dialog', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {getByName, getAllByName} = render(
      <TargetDialog
        aliveTests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        credentials={credentials}
        excludeHosts={''}
        hosts={'123.455.67.434'}
        id={'foo'}
        inUse={false}
        name={'target'}
        reverseLookupOnly={0}
        reverseLookupUnify={0}
        smbCredentialId={'2345'}
        targetTitle={'Edit Target target'}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    // text input
    const nameInput = getByName('name');
    changeInputValue(nameInput, 'ross');

    // radio input
    const simultaneousIPInput = getAllByName('allowSimultaneousIPs');
    expect(simultaneousIPInput.length).toBe(2);

    expect(simultaneousIPInput[0]).not.toBeChecked();
    expect(simultaneousIPInput[0]).toHaveAttribute('value', '1');

    expect(simultaneousIPInput[1]).toBeChecked();
    expect(simultaneousIPInput[1]).toHaveAttribute('value', '0');

    fireEvent.click(simultaneousIPInput[0]); // radio button check yes

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      aliveTests: 'Scan Config Default',
      allowSimultaneousIPs: 1,
      comment: 'hello world',
      esxiCredentialId: '0',
      excludeHosts: '',
      hosts: '123.455.67.434',
      hostsCount: undefined,
      id: 'foo',
      inUse: false,
      name: 'ross',
      port: 22,
      portListId: 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5',
      reverseLookupOnly: 0,
      reverseLookupUnify: 0,
      smbCredentialId: '2345',
      snmpCredentialId: '0',
      sshCredentialId: '0',
      sshElevateCredentialId: '0',
      krb5CredentialId: '0',
      targetExcludeSource: 'manual',
      targetSource: 'manual',
      targetTitle: 'Edit Target target',
    });
  });

  test('should render elevate privilege option if ssh credential is defined', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        aliveTests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        credentials={credentials}
        excludeHosts={''}
        hosts={'123.455.67.434'}
        id={'foo'}
        inUse={false}
        name={'target'}
        reverseLookupOnly={0}
        reverseLookupUnify={0}
        smbCredentialId={'2345'}
        sshCredentialId={'2345'}
        targetTitle={'Edit Target target'}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    expect(baseElement).toHaveTextContent('Elevate privileges');

    const selects = queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(10); // Each icon has both a span and an svg icon. There should be 5 total, including elevate privileges (Kerberos is disabled by default)
  });

  test('ssh elevate credential dropdown should only allow username + password options and remove ssh credential from list', async () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        aliveTests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        credentials={credentials}
        excludeHosts={''}
        hosts={'123.455.67.434'}
        id={'foo'}
        inUse={false}
        name={'target'}
        reverseLookupOnly={0}
        reverseLookupUnify={0}
        smbCredentialId={'5463'}
        sshCredentialId={'2345'}
        targetTitle={'Edit Target target'}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    expect(baseElement).toHaveTextContent('Elevate privileges');

    const selects = queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    const selectItems = await getSelectItemElementsForSelect(selects[3]);
    expect(selectItems.length).toBe(2); // "original" ssh option removed

    expect(selectItems[0]).toHaveTextContent('--'); // null option
    expect(selectItems[1]).toHaveTextContent('up2');
  });

  test.each([
    [
      'Kerberos credential should disable smb credential dropdown',
      'krb5_key',
      0,
      1,
    ],
    [
      'smb credential should disable kerberos credential dropdown',
      'OpenVAS Default',
      1,
      0,
    ],
  ])('%s', async (_, credentialValue, selectIndex, disabledIndex) => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetDialog
        aliveTests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        credentials={credentials}
        excludeHosts={''}
        hosts={'123.455.67.434'}
        id={'foo'}
        inUse={false}
        krb5CredentialId={'2345'}
        name={'target'}
        reverseLookupOnly={0}
        reverseLookupUnify={0}
        smbCredentialId={'5463'}
        targetTitle={'Edit Target target'}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    const selects = queryAllSelectElements();

    fireEvent.change(selects[selectIndex], {target: {value: '--'}});
    expect(selects[selectIndex]).toHaveValue('--');

    fireEvent.change(selects[selectIndex], {target: {value: credentialValue}});
    expect(selects[selectIndex]).toHaveValue(credentialValue);

    await wait(() => expect(selects[disabledIndex]).toBeDisabled());
  });

  test('ssh credential dropdown should remove ssh elevate credential from list', async () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement} = render(
      <TargetDialog
        aliveTests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        credentials={credentials}
        excludeHosts={''}
        hosts={'123.455.67.434'}
        id={'foo'}
        inUse={false}
        name={'target'}
        reverseLookupOnly={0}
        reverseLookupUnify={0}
        sshCredentialId={'2345'}
        sshElevateCredentialId={'5463'}
        targetTitle={'Edit Target target'}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    expect(baseElement).toHaveTextContent('Elevate privileges');

    const selects = queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    const selectItems = await getSelectItemElementsForSelect(selects[2]);
    expect(selectItems.length).toBe(3); // ssh elevate option removed

    expect(selectItems[0]).toHaveTextContent('--'); // null option
    expect(selectItems[1]).toHaveTextContent('username+password');
    expect(selectItems[2]).toHaveTextContent('ssh_key');
  });

  test('should disable editing certain fields if target is in use', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    const {baseElement, queryAllByTitle} = render(
      <TargetDialog
        aliveTests={'Scan Config Default'}
        allowSimultaneousIPs={0}
        comment={'hello world'}
        credentials={credentials}
        excludeHosts={''}
        hosts={'123.455.67.434'}
        id={'foo'}
        inUse={true}
        name={'target'}
        reverseLookupOnly={0}
        reverseLookupUnify={0}
        sshCredentialId={'2345'}
        sshElevateCredentialId={'5463'}
        targetTitle={'Edit Target target'}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    expect(baseElement).toHaveTextContent('Elevate privileges');

    const newIcons = queryAllByTitle('Create a new credential');
    expect(newIcons.length).toBe(0); // no new credential can be created

    const selects = queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    expect(selects[0]).toHaveValue('OpenVAS Default');
    expect(selects[0]).toBeDisabled();

    expect(selects[1]).toHaveValue('Scan Config Default');
    expect(selects[2]).toHaveValue('username+password');
    expect(selects[2]).toBeDisabled();

    expect(selects[3]).toHaveValue('up2');
    expect(selects[3]).toBeDisabled();
    expect(selects[4]).toHaveValue('--');
    expect(selects[4]).toBeDisabled();

    expect(selects[5]).toHaveValue('--');
    expect(selects[5]).toBeDisabled();

    expect(selects[6]).toHaveValue('--');
    expect(selects[6]).toBeDisabled();
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetDialog
        credentials={credentials}
        onClose={handleClose}
        onEsxiCredentialChange={handleChange}
        onKrb5CredentialChange={handleChange}
        onNewCredentialsClick={handleCreate}
        onNewPortListClick={handleCreate}
        onPortListChange={handleChange}
        onSave={handleSave}
        onSmbCredentialChange={handleChange}
        onSnmpCredentialChange={handleChange}
        onSshCredentialChange={handleChange}
        onSshElevateCredentialChange={handleChange}
      />,
    );

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
