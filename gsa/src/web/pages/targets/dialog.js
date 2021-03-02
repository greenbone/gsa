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

import {NO_VALUE} from 'gmp/parser';

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

const ALIVE_TESTS_ITEMS = [
  {
    value: ALIVE_TESTS_DEFAULT,
    label: _l(ALIVE_TESTS_DEFAULT),
  },
  ...ALIVE_TESTS.map(value => ({value, label: value})),
];

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
  alive_tests = ALIVE_TESTS_DEFAULT,
  capabilities,
  comment = '',
  credentials = [],
  esxi_credential_id = UNSET_VALUE,
  exclude_hosts = '',
  hosts = '',
  hosts_count,
  in_use = false,
  name = _('Unnamed'),
  port = DEFAULT_PORT,
  port_list_id = DEFAULT_PORT_LIST_ID,
  port_lists = DEFAULT_PORT_LISTS,
  reverse_lookup_only = NO_VALUE,
  reverse_lookup_unify = NO_VALUE,
  smb_credential_id = UNSET_VALUE,
  snmp_credential_id = UNSET_VALUE,
  ssh_credential_id = UNSET_VALUE,
  target_source = 'manual',
  target_exclude_source = 'manual',
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
  const ssh_credentials = credentials.filter(ssh_credential_filter);
  const up_credentials = credentials.filter(
    value => value.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE,
  );
  const snmp_credentials = credentials.filter(snmp_credential_filter);

  const uncontrolledValues = {
    ...initial,
    alive_tests,
    comment,
    name,
    port,
    exclude_hosts,
    hosts,
    hosts_count,
    in_use,
    reverse_lookup_only,
    reverse_lookup_unify,
    target_source,
    target_exclude_source,
  };

  const controlledValues = {
    port_list_id,
    esxi_credential_id,
    smb_credential_id,
    snmp_credential_id,
    ssh_credential_id,
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
                    name="target_source"
                    disabled={in_use}
                    checked={state.target_source === 'manual'}
                    value="manual"
                    onChange={onValueChange}
                  />
                  <TextField
                    grow="1"
                    disabled={in_use || state.target_source !== 'manual'}
                    name="hosts"
                    value={state.hosts}
                    onChange={onValueChange}
                  />
                </Divider>

                <Divider>
                  <Radio
                    title={_('From file')}
                    name="target_source"
                    disabled={in_use}
                    checked={state.target_source === 'file'}
                    value="file"
                    onChange={onValueChange}
                  />
                  <FileField
                    name="file"
                    disabled={in_use || state.target_source !== 'file'}
                    onChange={onValueChange}
                  />
                </Divider>
              </Divider>

              {state.hosts_count && (
                <Layout>
                  <Radio
                    title={_('From host assets ({{count}} hosts)', {
                      count: state.hosts_count,
                    })}
                    name="target_source"
                    disabled={in_use}
                    checked={state.target_source === 'asset_hosts'}
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
                    name="target_exclude_source"
                    disabled={in_use}
                    checked={state.target_exclude_source === 'manual'}
                    value="manual"
                    onChange={onValueChange}
                  />
                  <TextField
                    grow="1"
                    disabled={
                      in_use || state.target_exclude_source !== 'manual'
                    }
                    name="exclude_hosts"
                    value={state.exclude_hosts}
                    onChange={onValueChange}
                  />
                </Divider>

                <Divider>
                  <Radio
                    title={_('From file')}
                    name="target_exclude_source"
                    disabled={in_use}
                    checked={state.target_exclude_source === 'file'}
                    value="file"
                    onChange={onValueChange}
                  />
                  <FileField
                    name="exclude_file"
                    disabled={in_use || state.target_exclude_source !== 'file'}
                    onChange={onValueChange}
                  />
                </Divider>
              </Divider>
            </FormGroup>

            {capabilities.mayOp('get_port_lists') && (
              <FormGroup title={_('Port List')}>
                <Divider>
                  <Select
                    name="port_list_id"
                    disabled={in_use}
                    items={renderSelectItems(port_lists)}
                    value={state.port_list_id}
                    onChange={onPortListChange}
                  />
                  {!in_use && (
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
                name="alive_tests"
                items={ALIVE_TESTS_ITEMS}
                value={state.alive_tests}
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
                    name="ssh_credential_id"
                    disabled={in_use}
                    items={renderSelectItems(ssh_credentials, UNSET_VALUE)}
                    value={state.ssh_credential_id}
                    onChange={onSshCredentialChange}
                  />
                  <Layout>{_('on port')}</Layout>
                  <TextField
                    size="6"
                    name="port"
                    disabled={in_use}
                    value={state.port}
                    onChange={onValueChange}
                  />
                  {!in_use && (
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
                    name="smb_credential_id"
                    disabled={in_use}
                    items={renderSelectItems(up_credentials, UNSET_VALUE)}
                    value={state.smb_credential_id}
                    onChange={onSmbCredentialChange}
                  />
                  {!in_use && (
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
                    disabled={in_use}
                    name="esxi_credential_id"
                    items={renderSelectItems(up_credentials, UNSET_VALUE)}
                    value={state.esxi_credential_id}
                    onChange={onEsxiCredentialChange}
                  />
                  {!in_use && (
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
                    disabled={in_use}
                    name="snmp_credential_id"
                    items={renderSelectItems(snmp_credentials, UNSET_VALUE)}
                    value={state.snmp_credential_id}
                    onChange={onSnmpCredentialChange}
                  />
                  {!in_use && (
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
                name="reverse_lookup_only"
                disabled={in_use}
                value={state.reverse_lookup_only}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Reverse Lookup Unify')}>
              <YesNoRadio
                name="reverse_lookup_unify"
                disabled={in_use}
                value={state.reverse_lookup_unify}
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
  alive_tests: PropTypes.oneOf([ALIVE_TESTS_DEFAULT, ...ALIVE_TESTS]),
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  credentials: PropTypes.array,
  esxi_credential_id: PropTypes.idOrZero,
  exclude_hosts: PropTypes.string,
  hosts: PropTypes.string,
  hosts_count: PropTypes.number,
  in_use: PropTypes.bool,
  name: PropTypes.string,
  port: PropTypes.numberOrNumberString,
  port_list_id: PropTypes.idOrZero,
  port_lists: PropTypes.array,
  reverse_lookup_only: PropTypes.yesno,
  reverse_lookup_unify: PropTypes.yesno,
  smb_credential_id: PropTypes.idOrZero,
  snmp_credential_id: PropTypes.idOrZero,
  ssh_credential_id: PropTypes.idOrZero,
  target_exclude_source: PropTypes.oneOf(['manual', 'file']),
  target_source: PropTypes.oneOf(['manual', 'file', 'asset_hosts']),
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
