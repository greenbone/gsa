/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
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
} from 'gmp/models/credential';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import InfoIcon from 'web/components/icon/InfoIcon';
import NewIcon from 'web/components/icon/NewIcon';
import Row from 'web/components/layout/Row';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';

const DEFAULT_PORT = 22;

const DEFAULT_PORT_LIST_ID = 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5';
const DEFAULT_PORT_LIST_NAME = 'OpenVAS Default';

const DEFAULT_PORT_LISTS = [
  {
    id: DEFAULT_PORT_LIST_ID,
    name: DEFAULT_PORT_LIST_NAME,
  },
];

const ALIVE_TESTS_DEFAULT = 'Scan Config Default';

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
];

const TargetDialog = ({
  aliveTests = ALIVE_TESTS_DEFAULT,
  allowSimultaneousIPs = YES_VALUE,
  comment = '',
  credentials = [],
  esxiCredentialId = UNSET_VALUE,
  excludeHosts = '',
  hosts = '',
  hostsCount,
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
  ...initial
}) => {
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
    types: SSH_CREDENTIAL_TYPES,
    title: _('Create new SSH credential'),
  };

  const NEW_SSH_ELEVATE = {
    idField: 'sshElevateCredentialId',
    types: SSH_ELEVATE_CREDENTIAL_TYPES,
    title: _('Create new SSH elevate credential'),
  };

  const NEW_SMB = {
    idField: 'smbCredentialId',
    title: _('Create new SMB credential'),
    types: SMB_CREDENTIAL_TYPES,
  };

  const NEW_ESXI = {
    idField: 'esxiCredentialId',
    title: _('Create new ESXi credential'),
    types: ESXI_CREDENTIAL_TYPES,
  };

  const NEW_SNMP = {
    idField: 'snmpCredentialId',
    title: _('Create new SNMP credential'),
    types: SNMP_CREDENTIAL_TYPES,
  };

  const NEW_KRB5 = {
    idField: 'krb5CredentialId',
    title: _('Create new Kerberos credential'),
    types: KRB5_CREDENTIAL_TYPES,
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

  const gmp = useGmp()

  return (
    <SaveDialog
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
                  onChange={onValueChange}
                />

                {state.hostsCount && (
                  <Radio
                    checked={state.targetSource === 'assetHosts'}
                    disabled={inUse}
                    name="targetSource"
                    title={_('From host assets ({{count}} hosts)', {
                      count: state.hostsCount,
                    })}
                    value="assetHosts"
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
                  onChange={onValueChange}
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

            {capabilities.mayOp('get_port_lists') && (
              <FormGroup direction="row" title={_('Port List')}>
                <Select
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(portLists)}
                  name="portListId"
                  value={state.portListId}
                  onChange={onPortListChange}
                />
                {!inUse && (
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

            {capabilities.mayOp('get_credentials') && (
              <h4>{_('Credentials for authenticated checks')}</h4>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup title={_('SSH')}>
                <Row>
                  <Select
                    disabled={inUse}
                    grow="1"
                    items={renderSelectItems(sshCredentials, UNSET_VALUE)}
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
                    <NewIcon
                      title={_('Create a new credential')}
                      value={NEW_SSH}
                      onClick={onNewCredentialsClick}
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
                        elevateUpCredentials,
                        UNSET_VALUE,
                      )}
                      name="sshElevateCredentialId"
                      value={state.sshElevateCredentialId}
                      onChange={onSshElevateCredentialChange}
                    />
                    {!inUse && (
                      <NewIcon
                        title={_('Create a new credential')}
                        value={NEW_SSH_ELEVATE}
                        onClick={onNewCredentialsClick}
                      />
                    )}
                  </Row>
                )}
              </FormGroup>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup direction="row" title={_('SMB')}>
                <Select
                  disabled={inUse || state.krb5CredentialId !== UNSET_VALUE}
                  grow="1"
                  items={renderSelectItems(upCredentials, UNSET_VALUE)}
                  name="smbCredentialId"
                  value={state.smbCredentialId}
                  onChange={onSmbCredentialChange}
                />
                {!inUse && (
                  <NewIcon
                    title={_('Create a new credential')}
                    value={NEW_SMB}
                    onClick={onNewCredentialsClick}
                  />
                )}
              </FormGroup>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup direction="row" title={_('ESXi')}>
                <Select
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(upCredentials, UNSET_VALUE)}
                  name="esxiCredentialId"
                  value={state.esxiCredentialId}
                  onChange={onEsxiCredentialChange}
                />
                {!inUse && (
                  <NewIcon
                    title={_('Create a new credential')}
                    value={NEW_ESXI}
                    onClick={onNewCredentialsClick}
                  />
                )}
              </FormGroup>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup direction="row" title={_('SNMP')}>
                <Select
                  disabled={inUse}
                  grow="1"
                  items={renderSelectItems(snmpCredentials, UNSET_VALUE)}
                  name="snmpCredentialId"
                  value={state.snmpCredentialId}
                  onChange={onSnmpCredentialChange}
                />
                {!inUse && (
                  <NewIcon
                    title={_('Create a new credential')}
                    value={NEW_SNMP}
                    onClick={onNewCredentialsClick}
                  />
                )}
              </FormGroup>
            )}

            {gmp.settings.enableKrb5 && capabilities.mayOp('get_credentials') && (
              <FormGroup direction="row" title={_('Kerberos')}>
                <Select
                  disabled={inUse || state.smbCredentialId !== UNSET_VALUE}
                  grow="1"
                  items={renderSelectItems(krb5Credentials, UNSET_VALUE)}
                  name="krb5CredentialId"
                  value={state.krb5CredentialId}
                  onChange={onKrb5CredentialChange}
                />
                {!inUse && (
                  <NewIcon
                    title={_('Create a new credential')}
                    value={NEW_KRB5}
                    onClick={onNewCredentialsClick}
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

TargetDialog.propTypes = {
  aliveTests: PropTypes.oneOf([ALIVE_TESTS_DEFAULT, ...ALIVE_TESTS]),
  allowSimultaneousIPs: PropTypes.yesno,
  comment: PropTypes.string,
  credentials: PropTypes.array,
  esxiCredentialId: PropTypes.idOrZero,
  excludeHosts: PropTypes.string,
  hosts: PropTypes.string,
  hostsCount: PropTypes.number,
  inUse: PropTypes.bool,
  name: PropTypes.string,
  port: PropTypes.numberOrNumberString,
  portListId: PropTypes.idOrZero,
  portLists: PropTypes.array,
  reverseLookupOnly: PropTypes.yesno,
  reverseLookupUnify: PropTypes.yesno,
  smbCredentialId: PropTypes.idOrZero,
  snmpCredentialId: PropTypes.idOrZero,
  sshCredentialId: PropTypes.idOrZero,
  sshElevateCredentialId: PropTypes.idOrZero,
  krb5CredentialId: PropTypes.idOrZero,
  targetExcludeSource: PropTypes.oneOf(['manual', 'file']),
  targetSource: PropTypes.oneOf(['manual', 'file', 'assetHosts']),
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onEsxiCredentialChange: PropTypes.func.isRequired,
  onNewCredentialsClick: PropTypes.func.isRequired,
  onNewPortListClick: PropTypes.func.isRequired,
  onPortListChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSmbCredentialChange: PropTypes.func.isRequired,
  onSnmpCredentialChange: PropTypes.func.isRequired,
  onSshCredentialChange: PropTypes.func.isRequired,
  onSshElevateCredentialChange: PropTypes.func.isRequired,
  onKrb5CredentialChange: PropTypes.func.isRequired,
};

export default TargetDialog;
