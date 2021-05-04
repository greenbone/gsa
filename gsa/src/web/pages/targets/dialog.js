/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {_, _l} from 'gmp/locale/lang';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import {
  snmp_credential_filter,
  ssh_credential_filter,
  ESXI_CREDENTIAL_TYPES,
  SMB_CREDENTIAL_TYPES,
  SNMP_CREDENTIAL_TYPES,
  SSH_CREDENTIAL_TYPES,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

const DEFAULT_PORT = 22;

const DEFAULT_PORT_LIST_ID = 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5';
const DEFAULT_PORT_LIST_NAME = 'OpenVAS Default';

const DEFAULT_PORT_LISTS = [
  {
    id: DEFAULT_PORT_LIST_ID,
    name: DEFAULT_PORT_LIST_NAME,
  },
];

const ALIVE_TESTS_DEFAULT = 'SCAN_CONFIG_DEFAULT';

const ALIVE_TEST_ITEMS = [
  {
    value: ALIVE_TESTS_DEFAULT,
    label: _l('Scan Config Default'),
  },
  {value: 'ICMP_PING', label: _l('ICMP Ping')},
  {value: 'TCP_ACK_SERVICE_PING', label: _l('TCP-ACK Service Ping')},
  {value: 'TCP_SYN_SERVICE_PING', label: _l('TCP-SYN Service Ping')},
  {value: 'ARP_PING', label: _l('ARP Ping')},
  {
    value: 'ICMP_AND_TCP_ACK_SERVICE_PING',
    label: _l('ICMP & TCP-ACK Service Ping'),
  },
  {value: 'ICMP_AND_ARP_PING', label: _l('ICMP & ARP Ping')},
  {
    value: 'TCP_ACK_SERVICE_AND_ARP_PING',
    label: _l('TCP-ACK Service & ARP Ping'),
  },
  {
    value: 'ICMP_TCP_ACK_SERVICE_AND_ARP_PING',
    label: _l('ICMP, TCP-ACK Service & ARP Ping'),
  },
  {value: 'CONSIDER_ALIVE', label: _l('Consider Alive')},
];

const ALIVE_TESTS = ALIVE_TEST_ITEMS.map(alive_test => alive_test.value);

const NEW_SSH = {
  id_field: 'ssh_credential_id',
  types: SSH_CREDENTIAL_TYPES,
  title: _l('Create new SSH credential'),
};

const NEW_SMB = {
  id_field: 'smb_credential_id',
  title: _l('Create new SMB credential'),
  types: SMB_CREDENTIAL_TYPES,
};

const NEW_ESXI = {
  id_field: 'esxi_credential_id',
  title: _l('Create new ESXi credential'),
  types: ESXI_CREDENTIAL_TYPES,
};

const NEW_SNMP = {
  id_field: 'snmp_credential_id',
  title: _l('Create new SNMP credential'),
  types: SNMP_CREDENTIAL_TYPES,
};

const TargetDialog = ({
  aliveTest = ALIVE_TESTS_DEFAULT,
  allowSimultaneousIPs = YES_VALUE,
  capabilities,
  comment = '',
  credentials = [],
  esxiCredentialId = UNSET_VALUE,
  excludeHosts = '',
  hosts = '',
  hostsCount,
  inUse = false,
  name = _('Unnamed'),
  port = DEFAULT_PORT,
  portListId = DEFAULT_PORT_LIST_ID,
  portLists = DEFAULT_PORT_LISTS,
  reverseLookupOnly = NO_VALUE,
  reverseLookupUnify = NO_VALUE,
  smbCredentialId = UNSET_VALUE,
  snmpCredentialId = UNSET_VALUE,
  sshCredentialId = UNSET_VALUE,
  targetSource = 'manual',
  targetExcludeSource = 'manual',
  title = _('New Target'),
  onClose,
  onNewCredentialsClick,
  onNewPortListClick,
  onSave,
  onPortListChange,
  onSshCredentialChange,
  onSmbCredentialChange,
  onEsxiCredentialChange,
  onSnmpCredentialChange,
  ...initial
}) => {
  const sshCredentials = credentials.filter(ssh_credential_filter);
  const upCredentials = credentials.filter(
    value => value.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  const snmpCredentials = credentials.filter(snmp_credential_filter);

  const uncontrolledValues = {
    ...initial,
    aliveTest,
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
  };

  return (
    <SaveDialog
      title={title}
      defaultValues={uncontrolledValues}
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                size="30"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')} flex="column">
              <TextField
                name="comment"
                size="30"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Hosts')} flex="column">
              <Divider flex="column">
                <Divider>
                  <Radio
                    title={_('Manual')}
                    name="targetSource"
                    disabled={inUse}
                    checked={state.targetSource === 'manual'}
                    value="manual"
                    onChange={onValueChange}
                  />
                  <TextField
                    grow="1"
                    disabled={inUse || state.targetSource !== 'manual'}
                    name="hosts"
                    value={state.hosts}
                    onChange={onValueChange}
                  />
                </Divider>

                <Divider>
                  <Radio
                    title={_('From file')}
                    name="targetSource"
                    disabled={inUse}
                    checked={state.targetSource === 'file'}
                    value="file"
                    onChange={onValueChange}
                  />
                  <FileField
                    name="file"
                    disabled={inUse || state.targetSource !== 'file'}
                    onChange={onValueChange}
                  />
                </Divider>
              </Divider>

              {state.hostsCount && (
                <Layout>
                  <Radio
                    title={_('From host assets ({{count}} hosts)', {
                      count: state.hostsCount,
                    })}
                    name="targetSource"
                    disabled={inUse}
                    checked={state.targetSource === 'asset_hosts'}
                    value="asset_hosts"
                    onChange={onValueChange}
                  />
                </Layout>
              )}
            </FormGroup>

            <FormGroup title={_('Exclude Hosts')} flex="column">
              <Divider flex="column">
                <Divider>
                  <Radio
                    title={_('Manual')}
                    name="targetExcludeSource"
                    disabled={inUse}
                    checked={state.targetExcludeSource === 'manual'}
                    value="manual"
                    onChange={onValueChange}
                  />
                  <TextField
                    grow="1"
                    disabled={inUse || state.targetExcludeSource !== 'manual'}
                    name="excludeHosts"
                    value={state.excludeHosts}
                    onChange={onValueChange}
                  />
                </Divider>

                <Divider>
                  <Radio
                    title={_('From file')}
                    name="targetExcludeSource"
                    disabled={inUse}
                    checked={state.targetExcludeSource === 'file'}
                    value="file"
                    onChange={onValueChange}
                  />
                  <FileField
                    name="excludeFile"
                    disabled={inUse || state.targetExcludeSource !== 'file'}
                    onChange={onValueChange}
                  />
                </Divider>
              </Divider>
            </FormGroup>

            <FormGroup
              title={_('Allow simultaneous scanning via multiple IPs')}
              flex="column"
            >
              <YesNoRadio
                name="allowSimultaneousIPs"
                value={state.allowSimultaneousIPs}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayOp('get_port_lists') && (
              <FormGroup title={_('Port List')}>
                <Divider>
                  <Select
                    name="portListId"
                    disabled={inUse}
                    items={renderSelectItems(portLists)}
                    value={state.portListId}
                    onChange={onPortListChange}
                  />
                  {!inUse && (
                    <Layout>
                      <NewIcon
                        title={_('Create a new port list')}
                        onClick={onNewPortListClick}
                      />
                    </Layout>
                  )}
                </Divider>
              </FormGroup>
            )}

            <FormGroup title={_('Alive Test')}>
              <Select
                name="aliveTest"
                items={ALIVE_TEST_ITEMS}
                value={state.aliveTest}
                onChange={onValueChange}
              />
            </FormGroup>

            {capabilities.mayOp('get_credentials') && (
              <h4>{_('Credentials for authenticated checks')}</h4>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup title={_('SSH')}>
                <Divider>
                  <Select
                    name="sshCredentialId"
                    disabled={inUse}
                    items={renderSelectItems(sshCredentials, UNSET_VALUE)}
                    value={state.sshCredentialId}
                    onChange={onSshCredentialChange}
                  />
                  <Layout>{_('on port')}</Layout>
                  <TextField
                    size="6"
                    name="port"
                    disabled={inUse}
                    value={state.port}
                    onChange={onValueChange}
                  />
                  {!inUse && (
                    <Layout>
                      <NewIcon
                        title={_('Create a new credential')}
                        value={NEW_SSH}
                        onClick={onNewCredentialsClick}
                      />
                    </Layout>
                  )}
                </Divider>
              </FormGroup>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup title={_('SMB')}>
                <Divider>
                  <Select
                    name="smbCredentialId"
                    disabled={inUse}
                    items={renderSelectItems(upCredentials, UNSET_VALUE)}
                    value={state.smbCredentialId}
                    onChange={onSmbCredentialChange}
                  />
                  {!inUse && (
                    <Layout>
                      <NewIcon
                        title={_('Create a new credential')}
                        value={NEW_SMB}
                        onClick={onNewCredentialsClick}
                      />
                    </Layout>
                  )}
                </Divider>
              </FormGroup>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup title={_('ESXi')}>
                <Divider>
                  <Select
                    disabled={inUse}
                    name="esxiCredentialId"
                    items={renderSelectItems(upCredentials, UNSET_VALUE)}
                    value={state.esxiCredentialId}
                    onChange={onEsxiCredentialChange}
                  />
                  {!inUse && (
                    <Layout>
                      <NewIcon
                        title={_('Create a new credential')}
                        value={NEW_ESXI}
                        onClick={onNewCredentialsClick}
                      />
                    </Layout>
                  )}
                </Divider>
              </FormGroup>
            )}

            {capabilities.mayOp('get_credentials') && (
              <FormGroup title={_('SNMP')}>
                <Divider>
                  <Select
                    disabled={inUse}
                    name="snmpCredentialId"
                    items={renderSelectItems(snmpCredentials, UNSET_VALUE)}
                    value={state.snmpCredentialId}
                    onChange={onSnmpCredentialChange}
                  />
                  {!inUse && (
                    <Layout>
                      <NewIcon
                        title={_('Create a new credential')}
                        value={NEW_SNMP}
                        onClick={onNewCredentialsClick}
                      />
                    </Layout>
                  )}
                </Divider>
              </FormGroup>
            )}

            <FormGroup title={_('Reverse Lookup Only')}>
              <YesNoRadio
                name="reverseLookupOnly"
                disabled={inUse}
                value={state.reverseLookupOnly}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Reverse Lookup Unify')}>
              <YesNoRadio
                name="reverseLookupUnify"
                disabled={inUse}
                value={state.reverseLookupUnify}
                onChange={onValueChange}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

TargetDialog.propTypes = {
  aliveTest: PropTypes.oneOf(ALIVE_TESTS),
  allowSimultaneousIPs: PropTypes.bool,
  capabilities: PropTypes.capabilities.isRequired,
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
  targetExcludeSource: PropTypes.oneOf(['manual', 'file']),
  targetSource: PropTypes.oneOf(['manual', 'file', 'asset_hosts']),
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
};

export default withCapabilities(TargetDialog);

// vim: set ts=2 sw=2 tw=80:
