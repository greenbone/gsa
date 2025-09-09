/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  getSelectItemElementsForSelect,
  screen,
  fireEvent,
  wait,
  rendererWith,
  changeSelectInput,
} from 'web/testing';
import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CERTIFICATE_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  KRB5_CREDENTIAL_TYPE,
  ESXI_CREDENTIAL_TYPES,
  SSH_CREDENTIAL_TYPES,
  SMB_CREDENTIAL_TYPES,
  SNMP_CREDENTIAL_TYPES,
} from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import {ALIVE_TESTS} from 'gmp/models/target';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import TargetDialog, {
  ALIVE_TESTS_DEFAULT,
  DEFAULT_PORT_LIST_NAME,
} from 'web/pages/targets/TargetDialog';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/Render';

const cred1 = new Credential({
  id: '5678',
  name: 'client certificate',
  credential_type: CERTIFICATE_CREDENTIAL_TYPE,
});

const cred2 = new Credential({
  id: '2345',
  name: 'username+password',
  credential_type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});

const cred3 = new Credential({
  id: '5463',
  name: 'up2',
  credential_type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});

const cred4 = new Credential({
  id: '6536',
  name: 'ssh_key',
  credential_type: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
});

const cred5 = new Credential({
  id: '2345',
  name: 'krb5_key',
  credential_type: KRB5_CREDENTIAL_TYPE,
});

const credentials = [cred1, cred2, cred3, cred4, cred5];

const gmp = {
  settings: {
    enableGreenboneSensor: true,
    enableKrb5: false,
  },
};

describe('TargetDialog tests', () => {
  test('should render with default values', () => {
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

    const fileInputs = screen.queryFileInputs();

    const nameField = screen.getByName('name');
    expect(nameField).toHaveValue('Unnamed');

    const commentField = screen.getByName('comment');
    expect(commentField).toHaveValue('');

    const hostsField = screen.getByName('hosts');
    expect(hostsField).toHaveValue('');

    const targetSourceInputs = screen.getAllByName('targetSource');
    expect(targetSourceInputs[0]).toHaveAttribute('value', 'manual');
    expect(targetSourceInputs[0]).toBeChecked();
    expect(targetSourceInputs[1]).toHaveAttribute('name', 'targetSource');
    expect(targetSourceInputs[1]).toHaveAttribute('value', 'file');
    expect(targetSourceInputs[1]).not.toBeChecked();

    expect(fileInputs[0]).toBeDisabled();

    const targetExcludeSourceInputs = screen.getAllByName(
      'targetExcludeSource',
    );
    expect(targetExcludeSourceInputs[0]).toHaveAttribute('value', 'manual');
    expect(targetExcludeSourceInputs[0]).toBeChecked();
    expect(targetExcludeSourceInputs[1]).toHaveAttribute(
      'name',
      'targetExcludeSource',
    );
    expect(targetExcludeSourceInputs[1]).toHaveAttribute('value', 'file');
    expect(targetExcludeSourceInputs[1]).not.toBeChecked();

    const excludeHostsField = screen.getByName('excludeHosts');
    expect(excludeHostsField).toHaveValue('');

    expect(fileInputs[1]).toBeDisabled();

    const allowSimultaneousIPsInputs = screen.getAllByName(
      'allowSimultaneousIPs',
    );
    expect(allowSimultaneousIPsInputs[0]).toHaveAttribute('value', '1');
    expect(allowSimultaneousIPsInputs[0]).toBeChecked();
    expect(allowSimultaneousIPsInputs[1]).toHaveAttribute('value', '0');
    expect(allowSimultaneousIPsInputs[1]).not.toBeChecked();

    expect(screen.getDialogContent()).not.toHaveTextContent(
      'Elevate privileges',
    ); // elevate privileges should not be rendered without valid sshCredentialId

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toEqual(6); // Should have 6 selects (Kerberos is disabled by default)
    expect(selects[0]).toHaveValue(DEFAULT_PORT_LIST_NAME); // alive test select
    expect(selects[1]).toHaveValue(ALIVE_TESTS_DEFAULT); // alive test select
    expect(selects[2]).toHaveValue(UNSET_LABEL); // ssh credential select
    expect(selects[3]).toHaveValue(UNSET_LABEL); // elevate privilege select
    expect(selects[4]).toHaveValue(UNSET_LABEL); // smb credential select
    expect(selects[5]).toHaveValue(UNSET_LABEL); // esxi credential select

    expect(screen.getByTitle('Create a new port list')).toBeInTheDocument();
    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(4); // Each icon has both a span and an svg icon. There should be 4 total (Kerberos is disabled by default)

    const reverseLookupOnlyInputs = screen.getAllByName('reverseLookupOnly');
    expect(reverseLookupOnlyInputs[0]).toHaveAttribute('value', '1');
    expect(reverseLookupOnlyInputs[0]).not.toBeChecked();
    expect(reverseLookupOnlyInputs[1]).toHaveAttribute('value', '0');
    expect(reverseLookupOnlyInputs[1]).toBeChecked();

    const reverseLookupUnifyInputs = screen.getAllByName('reverseLookupUnify');
    expect(reverseLookupUnifyInputs[0]).toHaveAttribute('value', '1');
    expect(reverseLookupUnifyInputs[0]).not.toBeChecked();
    expect(reverseLookupUnifyInputs[1]).toHaveAttribute('value', '0');
    expect(reverseLookupUnifyInputs[1]).toBeChecked();
  });

  test('should display value from props', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetDialog
        aliveTests={ALIVE_TESTS.SCAN_CONFIG_DEFAULT}
        allowSimultaneousIPs={NO_VALUE}
        comment="hello world"
        credentials={credentials}
        excludeHosts={''}
        hosts="123.455.67.434"
        inUse={false}
        name="target"
        reverseLookupOnly={NO_VALUE}
        reverseLookupUnify={NO_VALUE}
        smbCredentialId="2345"
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

    const fileInputs = screen.queryFileInputs();

    const nameField = screen.getByName('name');
    expect(nameField).toHaveValue('target');

    const commentField = screen.getByName('comment');
    expect(commentField).toHaveValue('hello world');

    const hostsField = screen.getByName('hosts');
    expect(hostsField).toHaveValue('123.455.67.434');

    const targetSourceInputs = screen.getAllByName('targetSource');
    expect(targetSourceInputs[0]).toHaveAttribute('value', 'manual');
    expect(targetSourceInputs[0]).toBeChecked();
    expect(targetSourceInputs[1]).toHaveAttribute('name', 'targetSource');
    expect(targetSourceInputs[1]).toHaveAttribute('value', 'file');
    expect(targetSourceInputs[1]).not.toBeChecked();

    expect(fileInputs[0]).toHaveAttribute('disabled');

    const targetExcludeSourceInputs = screen.getAllByName(
      'targetExcludeSource',
    );
    expect(targetExcludeSourceInputs[0]).toHaveAttribute('value', 'manual');
    expect(targetExcludeSourceInputs[0]).toBeChecked();
    expect(targetExcludeSourceInputs[1]).toHaveAttribute(
      'name',
      'targetExcludeSource',
    );
    expect(targetExcludeSourceInputs[1]).toHaveAttribute('value', 'file');
    expect(targetExcludeSourceInputs[1]).not.toBeChecked();

    const excludeHostsField = screen.getByName('excludeHosts');
    expect(excludeHostsField).toHaveValue('');

    expect(fileInputs[1]).toBeDisabled();

    const allowSimultaneousIPsInputs = screen.getAllByName(
      'allowSimultaneousIPs',
    );
    expect(allowSimultaneousIPsInputs[0]).toHaveAttribute('value', '1');
    expect(allowSimultaneousIPsInputs[0]).not.toBeChecked();
    expect(allowSimultaneousIPsInputs[1]).toHaveAttribute('value', '0');
    expect(allowSimultaneousIPsInputs[1]).toBeChecked();

    expect(screen.getDialogContent()).not.toHaveTextContent(
      'Elevate privileges',
    ); // elevate privileges should not be rendered without valid sshCredentialId

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toEqual(6); // Should have 6 selects (Kerberos is disabled by default)
    expect(selects[0]).toHaveValue(DEFAULT_PORT_LIST_NAME); // alive test select
    expect(selects[1]).toHaveValue(ALIVE_TESTS_DEFAULT); // alive test select
    expect(selects[2]).toHaveValue(UNSET_LABEL); // ssh credential select
    expect(selects[3]).toHaveValue('username+password'); // elevate privilege select
    expect(selects[4]).toHaveValue(UNSET_LABEL); // smb credential select
    expect(selects[5]).toHaveValue(UNSET_LABEL); // esxi credential select

    expect(screen.getByTitle('Create a new port list')).toBeInTheDocument();
    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(4); // Each icon has both a span and an svg icon. There should be 4 total (Kerberos is disabled by default)

    const reverseLookupOnlyInputs = screen.getAllByName('reverseLookupOnly');
    expect(reverseLookupOnlyInputs[0]).toHaveAttribute('value', '1');
    expect(reverseLookupOnlyInputs[0]).not.toBeChecked();
    expect(reverseLookupOnlyInputs[1]).toHaveAttribute('value', '0');
    expect(reverseLookupOnlyInputs[1]).toBeChecked();

    const reverseLookupUnifyInputs = screen.getAllByName('reverseLookupUnify');
    expect(reverseLookupUnifyInputs[0]).toHaveAttribute('value', '1');
    expect(reverseLookupUnifyInputs[0]).not.toBeChecked();
    expect(reverseLookupUnifyInputs[1]).toHaveAttribute('value', '0');
    expect(reverseLookupUnifyInputs[1]).toBeChecked();
  });

  test('should allow to change values and save the dialog', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetDialog
        aliveTests={ALIVE_TESTS.SCAN_CONFIG_DEFAULT}
        allowSimultaneousIPs={NO_VALUE}
        comment="hello world"
        credentials={credentials}
        excludeHosts=""
        hosts="123.455.67.434"
        inUse={false}
        name="target"
        reverseLookupOnly={NO_VALUE}
        reverseLookupUnify={YES_VALUE}
        smbCredentialId="2345"
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
    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'ross');

    // radio input
    const simultaneousIPInput = screen.getAllByName('allowSimultaneousIPs');
    expect(simultaneousIPInput.length).toBe(2);
    expect(simultaneousIPInput[0]).not.toBeChecked();
    expect(simultaneousIPInput[0]).toHaveAttribute('value', '1');
    expect(simultaneousIPInput[1]).toBeChecked();
    expect(simultaneousIPInput[1]).toHaveAttribute('value', '0');

    fireEvent.click(simultaneousIPInput[0]); // radio button check yes

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      aliveTests: ALIVE_TESTS.SCAN_CONFIG_DEFAULT,
      allowSimultaneousIPs: YES_VALUE,
      comment: 'hello world',
      esxiCredentialId: UNSET_VALUE,
      excludeHosts: '',
      hosts: '123.455.67.434',
      hostsCount: undefined,
      inUse: false,
      name: 'ross',
      port: 22,
      portListId: 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5',
      reverseLookupOnly: 0,
      reverseLookupUnify: YES_VALUE,
      smbCredentialId: '2345',
      snmpCredentialId: UNSET_VALUE,
      sshCredentialId: UNSET_VALUE,
      sshElevateCredentialId: UNSET_VALUE,
      krb5CredentialId: UNSET_VALUE,
      targetExcludeSource: 'manual',
      targetSource: 'manual',
    });
  });

  test('should render elevate privilege option if ssh credential is defined', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <TargetDialog
        aliveTests={ALIVE_TESTS.SCAN_CONFIG_DEFAULT}
        allowSimultaneousIPs={NO_VALUE}
        comment="hello world"
        credentials={credentials}
        excludeHosts=""
        hosts="123.455.67.434"
        inUse={false}
        name="target"
        reverseLookupOnly={NO_VALUE}
        reverseLookupUnify={NO_VALUE}
        smbCredentialId="2345"
        sshCredentialId="2345"
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

    expect(screen.getDialogContent()).toHaveTextContent('Elevate privileges');

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    const createCredentialIcons = screen.getAllByTitle(
      'Create a new credential',
    );
    expect(createCredentialIcons.length).toEqual(5); // Each icon has both a span and an svg icon. There should be 5 total, including elevate privileges (Kerberos is disabled by default)
  });

  test('ssh elevate credential dropdown should only allow username + password options and remove ssh credential from list', async () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <TargetDialog
        aliveTests={ALIVE_TESTS.SCAN_CONFIG_DEFAULT}
        allowSimultaneousIPs={NO_VALUE}
        comment="hello world"
        credentials={credentials}
        excludeHosts=""
        hosts="123.455.67.434"
        inUse={false}
        name="target"
        reverseLookupOnly={NO_VALUE}
        reverseLookupUnify={NO_VALUE}
        smbCredentialId="5463"
        sshCredentialId="2345"
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

    expect(screen.getDialogContent()).toHaveTextContent('Elevate privileges');

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    const selectItems = await getSelectItemElementsForSelect(selects[3]);
    expect(selectItems.length).toBe(2); // "original" ssh option removed

    expect(selectItems[0]).toHaveTextContent('--'); // null option
    expect(selectItems[1]).toHaveTextContent('up2');
  });

  test.each([
    {
      name: 'Kerberos credential should disable smb credential dropdown',
      credentialValue: 'krb5_key',
      getSelectElement: () =>
        screen.getByTestId<HTMLSelectElement>('krb5-credential-select'),
      getDisabledElement: () =>
        screen.getByTestId<HTMLSelectElement>('smb-credential-select'),
    },
    {
      name: 'smb credential should disable kerberos credential dropdown',
      credentialValue: 'OpenVAS Default',
      getDisabledElement: () =>
        screen.getByTestId<HTMLSelectElement>('krb5-credential-select'),
      getSelectElement: () =>
        screen.getByTestId<HTMLSelectElement>('smb-credential-select'),
    },
  ])(
    '$name',
    async ({
      credentialValue,
      getSelectElement,
      getDisabledElement,
    }: {
      credentialValue: string;
      getSelectElement: () => HTMLSelectElement;
      getDisabledElement: () => HTMLSelectElement;
    }) => {
      const handleClose = testing.fn();
      const handleChange = testing.fn();
      const handleSave = testing.fn();
      const handleCreate = testing.fn();

      const gmp = {
        settings: {
          enableGreenboneSensor: true,
          enableKrb5: true,
        },
      };
      const {render} = rendererWith({gmp, capabilities: true});

      render(
        <TargetDialog
          aliveTests={ALIVE_TESTS.SCAN_CONFIG_DEFAULT}
          allowSimultaneousIPs={NO_VALUE}
          comment="hello world"
          credentials={credentials}
          excludeHosts=""
          hosts="123.455.67.434"
          inUse={false}
          krb5CredentialId="2345"
          name="target"
          reverseLookupOnly={NO_VALUE}
          reverseLookupUnify={NO_VALUE}
          smbCredentialId="5463"
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

      const selectElement = getSelectElement();
      const disabledElement = getDisabledElement();

      changeSelectInput(UNSET_LABEL, selectElement);
      expect(selectElement).toHaveValue(UNSET_LABEL);

      changeSelectInput(credentialValue, selectElement);
      expect(selectElement).toHaveValue(credentialValue);

      await wait();

      expect(disabledElement).toBeDisabled();
    },
  );

  test('ssh credential dropdown should remove ssh elevate credential from list', async () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetDialog
        aliveTests={ALIVE_TESTS.SCAN_CONFIG_DEFAULT}
        allowSimultaneousIPs={NO_VALUE}
        comment="hello world"
        credentials={credentials}
        excludeHosts=""
        hosts="123.455.67.434"
        inUse={false}
        name="target"
        reverseLookupOnly={NO_VALUE}
        reverseLookupUnify={NO_VALUE}
        sshCredentialId="2345"
        sshElevateCredentialId="5463"
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

    expect(screen.getDialogContent()).toHaveTextContent('Elevate privileges');

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    const selectItems = await getSelectItemElementsForSelect(selects[2]);
    expect(selectItems.length).toBe(3); // ssh elevate option removed

    expect(selectItems[0]).toHaveTextContent(UNSET_LABEL); // null option
    expect(selectItems[1]).toHaveTextContent('username+password');
    expect(selectItems[2]).toHaveTextContent('ssh_key');
  });

  test('should disable editing certain fields if target is in use', () => {
    const handleClose = testing.fn();
    const handleChange = testing.fn();
    const handleSave = testing.fn();
    const handleCreate = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetDialog
        aliveTests={ALIVE_TESTS.SCAN_CONFIG_DEFAULT}
        allowSimultaneousIPs={NO_VALUE}
        comment="hello world"
        credentials={credentials}
        excludeHosts=""
        hosts="123.455.67.434"
        inUse={true}
        name="target"
        reverseLookupOnly={NO_VALUE}
        reverseLookupUnify={NO_VALUE}
        sshCredentialId="2345"
        sshElevateCredentialId="5463"
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

    expect(screen.getDialogContent()).toHaveTextContent('Elevate privileges');

    const newIcons = screen.queryAllByTitle('Create a new credential');
    expect(newIcons.length).toBe(0); // no new credential can be created

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toEqual(7); // Should have 7 selects (Kerberos is disabled by default)

    expect(selects[0]).toHaveValue('OpenVAS Default');
    expect(selects[0]).toBeDisabled();

    expect(selects[1]).toHaveValue(ALIVE_TESTS.SCAN_CONFIG_DEFAULT);
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

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to create a target from asset hosts', () => {
    const handleSave = testing.fn();
    const hostsFilter = new Filter({filter_type: 'asset'});

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <TargetDialog
        hostsCount={10}
        hostsFilter={hostsFilter}
        targetSource="asset_hosts"
        onSave={handleSave}
      />,
    );

    const targetSourceInputs = screen.getAllByName('targetSource');
    expect(targetSourceInputs[0]).toHaveAttribute('value', 'manual');
    expect(targetSourceInputs[0]).not.toBeChecked();
    expect(targetSourceInputs[1]).toHaveAttribute('value', 'file');
    expect(targetSourceInputs[1]).not.toBeChecked();
    expect(targetSourceInputs[2]).toHaveAttribute('value', 'asset_hosts');
    expect(targetSourceInputs[2]).toBeChecked();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      aliveTests: ALIVE_TESTS.SCAN_CONFIG_DEFAULT,
      allowSimultaneousIPs: YES_VALUE,
      comment: '',
      esxiCredentialId: UNSET_VALUE,
      excludeHosts: '',
      hosts: '',
      hostsCount: 10,
      hostsFilter,
      inUse: false,
      name: 'Unnamed',
      port: 22,
      portListId: 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5',
      reverseLookupOnly: 0,
      reverseLookupUnify: 0,
      smbCredentialId: UNSET_VALUE,
      snmpCredentialId: UNSET_VALUE,
      sshCredentialId: UNSET_VALUE,
      sshElevateCredentialId: UNSET_VALUE,
      krb5CredentialId: UNSET_VALUE,
      targetExcludeSource: 'manual',
      targetSource: 'asset_hosts',
    });
  });

  describe('New Credential Icons', () => {
    test.each([
      [
        'new-icon-esxi',
        'esxiCredentialId',
        'Create new ESXi credential',
        ESXI_CREDENTIAL_TYPES,
      ],
      [
        'new-icon-ssh',
        'sshCredentialId',
        'Create new SSH credential',
        SSH_CREDENTIAL_TYPES,
      ],

      [
        'new-icon-smb',
        'smbCredentialId',
        'Create new SMB credential',
        SMB_CREDENTIAL_TYPES,
      ],
      [
        'new-icon-snmp',
        'snmpCredentialId',
        'Create new SNMP credential',
        SNMP_CREDENTIAL_TYPES,
      ],
    ])(
      'should render NewIcon for %s when conditions are met',
      (testId, idField, title, types) => {
        const handleCreate = testing.fn();

        const {render} = rendererWith({gmp, capabilities: true});

        render(
          <TargetDialog
            credentials={credentials}
            inUse={false}
            onNewCredentialsClick={handleCreate}
          />,
        );

        const newIcon = screen.getByTestId(testId);
        expect(newIcon).toBeInTheDocument();
        fireEvent.click(newIcon);
        expect(handleCreate).toHaveBeenCalledWith({
          idField,
          title,
          types,
        });
      },
    );
  });
});
