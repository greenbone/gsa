/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Credential, {
  snmp_credential_filter,
  ssh_credential_filter,
  ESXI_CREDENTIAL_TYPES,
  SMB_CREDENTIAL_TYPES,
  SNMP_CREDENTIAL_TYPES,
  SSH_CREDENTIAL_TYPES,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  SSH_ELEVATE_CREDENTIAL_TYPES,
  KRB5_CREDENTIAL_TYPES,
  krb5CredentialFilter,
  ALL_CREDENTIAL_TYPES,
} from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import PortList from 'gmp/models/portlist';
import {AliveTests} from 'gmp/models/target';
import {NO_VALUE, YES_VALUE, YesNo} from 'gmp/parser';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {InfoIcon, NewIcon} from 'web/components/icon';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {
  RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

type TargetSource = 'manual' | 'file' | 'asset_hosts';
type TargetExcludeSource = 'manual' | 'file';
type CredentialType = (typeof ALL_CREDENTIAL_TYPES)[number];

interface NewCredential {
  idField: string;
  title: string;
  types: CredentialType[];
}

interface TargetDialogValues {
  esxiCredentialId: string;
  krb5CredentialId: string;
  portListId: string;
  smbCredentialId: string;
  snmpCredentialId: string;
  sshCredentialId: string;
  sshElevateCredentialId: string;
}

interface TargetDialogDefaultValues {
  aliveTests: AliveTests;
  allowSimultaneousIPs: YesNo;
  comment: string;
  excludeHosts: string;
  hosts: string;
  hostsCount?: number;
  hostsFilter?: Filter;
  inUse: boolean;
  name: string;
  port: number | string;
  reverseLookupOnly: YesNo;
  reverseLookupUnify: YesNo;
  targetExcludeSource: TargetExcludeSource;
  targetSource: TargetSource;
}

type TargetDialogData = TargetDialogValues & TargetDialogDefaultValues;

interface TargetDialogProps {
  aliveTests?: AliveTests;
  allowSimultaneousIPs?: YesNo;
  comment?: string;
  credentials?: Credential[];
  esxiCredentialId?: string;
  excludeHosts?: string;
  hosts?: string;
  hostsCount?: number;
  hostsFilter?: Filter;
  inUse?: boolean;
  name?: string;
  port?: number | string;
  portListId?: string;
  portLists?: PortList[];
  reverseLookupOnly?: YesNo;
  reverseLookupUnify?: YesNo;
  smbCredentialId?: string;
  snmpCredentialId?: string;
  sshCredentialId?: string;
  sshElevateCredentialId?: string;
  krb5CredentialId?: string;
  targetSource?: TargetSource;
  targetExcludeSource?: TargetExcludeSource;
  title?: string;
  onClose?: () => void;
  onNewCredentialsClick?: (newCredential: NewCredential) => void;
  onNewPortListClick?: () => void;
  onPortListChange?: (portListId: string) => void;
  onSshCredentialChange?: (sshCredentialId: string) => void;
  onSmbCredentialChange?: (smbCredentialId: string) => void;
  onEsxiCredentialChange?: (esxiCredentialId: string) => void;
  onKrb5CredentialChange?: (krb5CredentialId: string) => void;
  onSnmpCredentialChange?: (snmpCredentialId: string) => void;
  onSshElevateCredentialChange?: (sshElevateCredentialId: string) => void;
  onSave?: (data: TargetDialogData) => void | Promise<void>;
}

export const DEFAULT_PORT = 22;

const DEFAULT_PORT_LIST_ID = 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5';
export const DEFAULT_PORT_LIST_NAME = 'OpenVAS Default';

const DEFAULT_PORT_LISTS = [
  new PortList({
    id: DEFAULT_PORT_LIST_ID,
    name: DEFAULT_PORT_LIST_NAME,
  }),
];

export const ALIVE_TESTS_DEFAULT = 'Scan Config Default' as AliveTests;

const ALIVE_TESTS = [
  'ICMP Ping',
  'TCP-ACK Service Ping',
  'TCP-SYN Service Ping',
  'ARP Ping',
  'ICMP & TCP-ACK Service Ping',
  'ICMP & ARP Ping',
  'TCP-ACK Service & ARP Ping',
  'ICMP, TCP-ACK Service & ARP Ping',
  'Consider Alive',
] as AliveTests[];

const TargetDialog = ({
  aliveTests = ALIVE_TESTS_DEFAULT,
  allowSimultaneousIPs = YES_VALUE,
  comment = '',
  credentials = [],
  esxiCredentialId = UNSET_VALUE,
  excludeHosts = '',
  hosts = '',
  hostsCount,
  hostsFilter,
  inUse = false,
  name,
  port = DEFAULT_PORT,
  portListId = DEFAULT_PORT_LIST_ID,
  portLists = DEFAULT_PORT_LISTS,
  reverseLookupOnly = NO_VALUE,
  reverseLookupUnify = NO_VALUE,
  smbCredentialId = UNSET_VALUE,
  snmpCredentialId = UNSET_VALUE,
  sshCredentialId = UNSET_VALUE,
  sshElevateCredentialId = UNSET_VALUE,
  krb5CredentialId = UNSET_VALUE,
  targetSource = 'manual',
  targetExcludeSource = 'manual',
  title,
  onClose,
  onNewCredentialsClick,
  onNewPortListClick,
  onSave,
  onPortListChange,
  onSshCredentialChange,
  onSmbCredentialChange,
  onEsxiCredentialChange,
  onKrb5CredentialChange,
  onSnmpCredentialChange,
  onSshElevateCredentialChange,
  // initial should be removed when all users of the TargetDialog are converted
  // to typescript and all additional props are known
  ...initial
}: TargetDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  name = name || _('Unnamed');
  title = title || _('New Target');

  const ALIVE_TESTS_ITEMS = [
    {
      value: ALIVE_TESTS_DEFAULT,
      label: _('Scan Config Default'),
    },
    ...ALIVE_TESTS.map(value => ({value, label: value})),
  ];

  const NEW_SSH = {
    idField: 'sshCredentialId',
    types: SSH_CREDENTIAL_TYPES as CredentialType[],
    title: _('Create new SSH credential'),
  };

  const NEW_SSH_ELEVATE = {
    idField: 'sshElevateCredentialId',
    types: SSH_ELEVATE_CREDENTIAL_TYPES as CredentialType[],
    title: _('Create new SSH elevate credential'),
  };

  const NEW_SMB = {
    idField: 'smbCredentialId',
    title: _('Create new SMB credential'),
    types: SMB_CREDENTIAL_TYPES as CredentialType[],
  };

  const NEW_ESXI = {
    idField: 'esxiCredentialId',
    title: _('Create new ESXi credential'),
    types: ESXI_CREDENTIAL_TYPES as CredentialType[],
  };

  const NEW_SNMP = {
    idField: 'snmpCredentialId',
    title: _('Create new SNMP credential'),
    types: SNMP_CREDENTIAL_TYPES as CredentialType[],
  };

  const NEW_KRB5 = {
    idField: 'krb5CredentialId',
    title: _('Create new Kerberos credential'),
    types: KRB5_CREDENTIAL_TYPES as CredentialType[],
  };

  const sshCredentials = credentials.filter(
    value =>
      ssh_credential_filter(value) && value.id !== sshElevateCredentialId,
  );
  // filter out ssh_elevate_credential_id. If ssh_elevate_credential_id is UNSET_VALUE, this is ok. Because the Select will add back the UNSET_VALUE
  const upCredentials = credentials.filter(
    value => value.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  const elevateUpCredentials = upCredentials.filter(
    value => value.id !== sshCredentialId,
  );
  const snmpCredentials = credentials.filter(snmp_credential_filter);

  const krb5Credentials = credentials.filter(krb5CredentialFilter);

  const uncontrolledValues = {
    ...initial,
    aliveTests,
    comment,
    name,
    port,
    excludeHosts,
    hosts,
    hostsCount,
    hostsFilter,
    inUse,
    reverseLookupOnly,
    reverseLookupUnify,
    targetSource,
    targetExcludeSource,
    allowSimultaneousIPs,
  };

  const controlledValues = {
    portListId,
    esxiCredentialId,
    smbCredentialId,
    snmpCredentialId,
    sshCredentialId,
    sshElevateCredentialId,
    krb5CredentialId,
  };

  const gmp = useGmp();
  const enableKrb5 = gmp.settings.enableKrb5;
  return (
    <SaveDialog<TargetDialogValues, TargetDialogDefaultValues>
      defaultValues={uncontrolledValues}
      title={title}
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                grow="1"
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Hosts')}>
              <Row>
                <Radio
                  checked={state.targetSource === 'manual'}
                  disabled={inUse}
                  name="targetSource"
                  title={_('Manual')}
                  value="manual"
                  onChange={onValueChange}
                />
                <TextField
                  disabled={inUse || state.targetSource !== 'manual'}
                  grow="1"
                  name="hosts"
                  value={state.hosts}
                  onChange={onValueChange}
                />
              </Row>
              <Row>
                <Radio
                  checked={state.targetSource === 'file'}
                  disabled={inUse}
                  name="targetSource"
                  title={_('From file')}
                  value="file"
                  onChange={onValueChange}
                />
                <FileField
                  disabled={inUse || state.targetSource !== 'file'}
                  grow="1"
                  name="file"
                  onChange={
                    onValueChange as (value?: File, name?: string) => void
                  }
                />

                {state.hostsCount && (
                  <Radio
                    checked={state.targetSource === 'asset_hosts'}
                    disabled={inUse}
                    name="targetSource"
                    title={_('From host assets ({{count}} hosts)', {
                      count: state.hostsCount,
                    })}
                    value="asset_hosts"
                    onChange={onValueChange}
                  />
                )}
              </Row>
            </FormGroup>

            <FormGroup title={_('Exclude Hosts')}>
              <Row>
                <Radio
                  checked={state.targetExcludeSource === 'manual'}
                  disabled={inUse}
                  name="targetExcludeSource"
                  title={_('Manual')}
                  value="manual"
                  onChange={onValueChange}
                />
                <TextField
                  disabled={inUse || state.targetExcludeSource !== 'manual'}
                  grow="1"
                  name="excludeHosts"
                  value={state.excludeHosts}
                  onChange={onValueChange}
                />
              </Row>
              <Row>
                <Radio
                  checked={state.targetExcludeSource === 'file'}
                  disabled={inUse}
                  name="targetExcludeSource"
                  title={_('From file')}
                  value="file"
                  onChange={onValueChange}
                />
                <FileField
                  disabled={inUse || state.targetExcludeSource !== 'file'}
                  grow="1"
                  name="excludeFile"
                  onChange={
                    onValueChange as (value?: File, name?: string) => void
                  }
                />
              </Row>
            </FormGroup>

            <FormGroup
              title={_('Allow simultaneous scanning via multiple IPs')}
            >
              <YesNoRadio
                name="allowSimultaneousIPs"
                value={state.allowSimultaneousIPs}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayAccess('port_lists') && (
              <FormGroup direction="row" title={_('Port List')}>
                <Select
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(
                    portLists as RenderSelectItemProps[],
                  )}
                  name="portListId"
                  value={state.portListId}
                  onChange={onPortListChange}
                />
                {!inUse && capabilities.mayCreate('port_lists') && (
                  <NewIcon
                    title={_('Create a new port list')}
                    onClick={onNewPortListClick}
                  />
                )}
              </FormGroup>
            )}

            <FormGroup title={_('Alive Test')}>
              <Select
                items={ALIVE_TESTS_ITEMS}
                name="aliveTests"
                value={state.aliveTests}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayAccess('credentials') && (
              <h4>{_('Credentials for authenticated checks')}</h4>
            )}

            {capabilities.mayAccess('credentials') && (
              <FormGroup title={_('SSH')}>
                <Row>
                  <Select
                    disabled={inUse}
                    grow="1"
                    items={renderSelectItems(
                      sshCredentials as RenderSelectItemProps[],
                      UNSET_VALUE,
                    )}
                    name="sshCredentialId"
                    value={state.sshCredentialId}
                    onChange={onSshCredentialChange}
                  />
                  {_('on port')}
                  <TextField
                    disabled={inUse}
                    name="port"
                    value={state.port}
                    onChange={onValueChange}
                  />
                  {!inUse && (
                    <NewIcon<NewCredential>
                      title={_('Create a new credential')}
                      value={NEW_SSH}
                      onClick={
                        onNewCredentialsClick as (value?: NewCredential) => void
                      }
                    />
                  )}
                </Row>
                {state.sshCredentialId !== UNSET_VALUE && (
                  <Row>
                    <InfoIcon
                      title={_(
                        'This feature is experimental and may ' +
                          'not work reliable under all circumstances.',
                      )}
                    />
                    <span>{_('Elevate privileges')}</span>
                    <Select
                      disabled={inUse}
                      grow="1"
                      items={renderSelectItems(
                        elevateUpCredentials as RenderSelectItemProps[],
                        UNSET_VALUE,
                      )}
                      name="sshElevateCredentialId"
                      value={state.sshElevateCredentialId}
                      onChange={onSshElevateCredentialChange}
                    />
                    {!inUse && (
                      <NewIcon<NewCredential>
                        title={_('Create a new credential')}
                        value={NEW_SSH_ELEVATE}
                        onClick={
                          onNewCredentialsClick as (
                            value?: NewCredential,
                          ) => void
                        }
                      />
                    )}
                  </Row>
                )}
              </FormGroup>
            )}

            {enableKrb5 && capabilities.mayAccess('credentials') && (
              <FormGroup direction="row" title={_('SMB (Kerberos)')}>
                <Select
                  data-testid="krb5-credential-select"
                  disabled={inUse || state.smbCredentialId !== UNSET_VALUE}
                  grow="1"
                  items={renderSelectItems(
                    krb5Credentials as RenderSelectItemProps[],
                    UNSET_VALUE,
                  )}
                  name="krb5CredentialId"
                  value={state.krb5CredentialId}
                  onChange={onKrb5CredentialChange}
                />
                {!inUse && capabilities.mayCreate('credentials') && (
                  <NewIcon<NewCredential>
                    title={_('Create a new credential')}
                    value={NEW_KRB5}
                    onClick={
                      onNewCredentialsClick as (value?: NewCredential) => void
                    }
                  />
                )}
              </FormGroup>
            )}

            {capabilities.mayAccess('credentials') && (
              <FormGroup direction="row" title={_('SMB (NTLM)')}>
                <Select
                  data-testid="smb-credential-select"
                  disabled={inUse || state.krb5CredentialId !== UNSET_VALUE}
                  grow="1"
                  items={renderSelectItems(
                    upCredentials as RenderSelectItemProps[],
                    UNSET_VALUE,
                  )}
                  name="smbCredentialId"
                  value={state.smbCredentialId}
                  onChange={onSmbCredentialChange}
                />
                {!inUse && capabilities.mayCreate('credentials') && (
                  <NewIcon<NewCredential>
                    title={_('Create a new credential')}
                    value={NEW_SMB}
                    onClick={
                      onNewCredentialsClick as (value?: NewCredential) => void
                    }
                  />
                )}
              </FormGroup>
            )}

            {capabilities.mayAccess('credentials') && (
              <FormGroup direction="row" title={_('ESXi')}>
                <Select
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(
                    upCredentials as RenderSelectItemProps[],
                    UNSET_VALUE,
                  )}
                  name="esxiCredentialId"
                  value={state.esxiCredentialId}
                  onChange={onEsxiCredentialChange}
                />
                {!inUse && capabilities.mayCreate('credentials') && (
                  <NewIcon<NewCredential>
                    title={_('Create a new credential')}
                    value={NEW_ESXI}
                    onClick={
                      onNewCredentialsClick as (value?: NewCredential) => void
                    }
                  />
                )}
              </FormGroup>
            )}

            {capabilities.mayAccess('credentials') && (
              <FormGroup direction="row" title={_('SNMP')}>
                <Select
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(
                    snmpCredentials as RenderSelectItemProps[],
                    UNSET_VALUE,
                  )}
                  name="snmpCredentialId"
                  value={state.snmpCredentialId}
                  onChange={onSnmpCredentialChange}
                />
                {!inUse && capabilities.mayCreate('credentials') && (
                  <NewIcon<NewCredential>
                    title={_('Create a new credential')}
                    value={NEW_SNMP}
                    onClick={
                      onNewCredentialsClick as (value?: NewCredential) => void
                    }
                  />
                )}
              </FormGroup>
            )}

            <FormGroup title={_('Reverse Lookup Only')}>
              <YesNoRadio
                disabled={inUse}
                name="reverseLookupOnly"
                value={state.reverseLookupOnly}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Reverse Lookup Unify')}>
              <YesNoRadio
                disabled={inUse}
                name="reverseLookupUnify"
                value={state.reverseLookupUnify}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

export default TargetDialog;
