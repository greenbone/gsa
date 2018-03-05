/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';
import {NO_VALUE} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';
import {render_select_items, UNSET_VALUE} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import TextField from '../../components/form/textfield.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import NewIcon from '../../components/icon/newicon.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import {
  snmp_credential_filter,
  ssh_credential_filter,
  ESXI_CREDENTIAL_TYPES,
  SMB_CREDENTIAL_TYPES,
  SNMP_CREDENTIAL_TYPES,
  SSH_CREDENTIAL_TYPES,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential.js';

const DEFAULT_PORT_LIST_ID = 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5';
const ALIVE_TESTS_DEFAULT = 'Scan Config Default';

const ALIVE_TESTS = [
  'ICMP Ping', 'TCP-ACK Service Ping', 'TCP-SYN Service Ping',
  'ARP Ping', 'ICMP & TCP-ACK Service Ping',
  'ICMP & ARP Ping', 'TCP-ACK Service & ARP Ping',
  'ICMP, TCP-ACK Service & ARP Ping', 'Consider Alive',
];

const ALIVE_TESTS_ITEMS = [{
    value: ALIVE_TESTS_DEFAULT,
    label: _(ALIVE_TESTS_DEFAULT),
  },
  ...ALIVE_TESTS.map(value => ({value, label: value})),
];

const NEW_SSH = {
  id_field: 'ssh_credential_id',
  types: SSH_CREDENTIAL_TYPES,
  title: _('Create new SSH credential'),
};

const NEW_SMB = {
  id_field: 'smb_credential_id',
  title: _('Create new SMB credential'),
  types: SMB_CREDENTIAL_TYPES,
};

const NEW_ESXI = {
  id_field: 'esxi_credential_id',
  title: _('Create new ESXi credential'),
  types: ESXI_CREDENTIAL_TYPES,
};

const NEW_SNMP = {
  id_field: 'snmp_credential_id',
  title: _('Create new SNMP credential'),
  types: SNMP_CREDENTIAL_TYPES,
};

const DEFAULTS = {
  alive_tests: ALIVE_TESTS_DEFAULT,
  comment: '',
  esxi_credential_id: UNSET_VALUE,
  name: _('Unnamed'),
  port: 22,
  port_list_id: DEFAULT_PORT_LIST_ID,
  reverse_lookup_only: NO_VALUE,
  reverse_lookup_unify: NO_VALUE,
  smb_credential_id: UNSET_VALUE,
  snmp_credential_id: UNSET_VALUE,
  ssh_credential_id: UNSET_VALUE,
  target_source: 'manual',
  target_exclude_source: 'manual',
};

const TargetDialog = ({
  alive_tests,
  comment = '',
  credentials,
  esxi_credential_id,
  exclude_hosts,
  hosts,
  hosts_count,
  in_use = false,
  name,
  port,
  port_list_id,
  port_lists,
  reverse_lookup_only,
  reverse_lookup_unify,
  smb_credential_id,
  snmp_credential_id,
  ssh_credential_id,
  target_source,
  target_exclude_source,
  title = _('New Note'),
  visible = true,
  onClose,
  onNewCredentialsClick,
  onNewPortListClick,
  onSave,
  ...initial
}, {capabilities}) => {

  let ssh_credentials;
  let up_credentials;
  let snmp_credentials;

  if (is_defined(credentials)) {
    ssh_credentials = credentials.filter(ssh_credential_filter);
    up_credentials = credentials.filter(value =>
      value.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE);
    snmp_credentials = credentials.filter(snmp_credential_filter);
  }

  const data = {
    ...DEFAULTS,
    ...initial,
  };

  if (is_defined(alive_tests)) {
    data.alive_tests = alive_tests;
  };
  if (is_defined(comment)) {
    data.comment = comment;
  };
  if (is_defined(credentials)) {
    data.credentials = credentials;
  };
  if (is_defined(esxi_credential_id)) {
    data.esxi_credential_id = esxi_credential_id;
  };
  if (is_defined(exclude_hosts)) {
    data.exclude_hosts = exclude_hosts;
  };
  if (is_defined(hosts)) {
    data.hosts = hosts;
  };
  if (is_defined(hosts_count)) {
    data.hosts_count = hosts_count;
  };
  if (is_defined(in_use)) {
    data.in_use = in_use;
  };
  if (is_defined(name)) {
    data.name = name;
  };
  if (is_defined(port)) {
    data.port = port;
  };
  if (is_defined(port_list_id)) {
    data.port_list_id = port_list_id;
  };
  if (is_defined(port_lists)) {
    data.port_lists = port_lists;
  };
  if (is_defined(reverse_lookup_only)) {
    data.reverse_lookup_only = reverse_lookup_only;
  };
  if (is_defined(reverse_lookup_unify)) {
    data.reverse_lookup_unify = reverse_lookup_unify;
  };
  if (is_defined(smb_credential_id)) {
    data.smb_credential_id = smb_credential_id;
  };
  if (is_defined(snmp_credential_id)) {
    data.snmp_credential_id = snmp_credential_id;
  };
  if (is_defined(ssh_credential_id)) {
    data.ssh_credential_id = ssh_credential_id;
  };
  if (is_defined(target_source)) {
    data.target_source = target_source;
  };
  if (is_defined(target_exclude_source)) {
    data.target_exclude_source = target_exclude_source;
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={data}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
                maxLength="80"/>
            </FormGroup>

            <FormGroup
              title={_('Comment')}
              flex="column">
              <TextField
                name="comment"
                value={state.comment}
                size="30"
                maxLength="400"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup
              title={_('Hosts')}
              flex="column">
              <Divider flex="column">
                <Divider>
                  <Radio
                    value="manual"
                    title={_('Manual')}
                    name="target_source"
                    disabled={state.in_use}
                    onChange={onValueChange}
                    checked={state.target_source === 'manual'}/>
                  <TextField
                    grow="1"
                    disabled={state.in_use || state.target_source !== 'manual'}
                    value={state.hosts}
                    name="hosts"
                    onChange={onValueChange}/>
                </Divider>

                <Divider>
                  <Radio
                    title={_('From file')}
                    name="target_source"
                    value="file"
                    disabled={state.in_use}
                    onChange={onValueChange}
                    checked={state.target_source === 'file'}/>
                  <FileField
                    name="file"
                    disabled={state.in_use}
                    onChange={onValueChange}/>
                </Divider>
              </Divider>

              {state.hosts_count &&
                <Layout flex box>
                  <Radio
                    title={_('From host assets ({{count}} hosts)',
                      {count: state.hosts_count})}
                    name="target_source"
                    value="asset_hosts"
                    disabled={state.in_use}
                    onChange={onValueChange}
                    checked={state.target_source === 'asset_hosts'}/>
                </Layout>
              }

            </FormGroup>

            <FormGroup
              title={_('Exclude Hosts')}
              flex="column">
              <Divider flex="column">
                <Divider>
                  <Radio
                    value="manual"
                    title={_('Manual')}
                    name="target_exclude_source"
                    disabled={state.in_use}
                    onChange={onValueChange}
                    checked={state.target_exclude_source === 'manual'}/>
                  <TextField
                    grow="1"
                    disabled=
                      {state.in_use || state.target_exclude_source !== 'manual'}
                    value={exclude_hosts}
                    name="exclude_hosts"
                    onChange={onValueChange}/>
                </Divider>

                <Divider>
                  <Radio
                    title={_('From file')}
                    name="target_exclude_source"
                    value="file"
                    disabled={state.in_use}
                    onChange={onValueChange}
                    checked={state.target_exclude_source === 'file'}/>
                  <FileField
                    name="exclude_file"
                    disabled={state.in_use}
                    onChange={onValueChange}/>
                </Divider>
              </Divider>
            </FormGroup>

            <FormGroup title={_('Reverse Lookup Only')}>
              <YesNoRadio
                name="reverse_lookup_only"
                value={state.reverse_lookup_only}
                disabled={state.in_use}
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Reverse Lookup Unify')}>
              <YesNoRadio
                name="reverse_lookup_unify"
                value={state.reverse_lookup_unify}
                disabled={state.in_use}
                onChange={onValueChange}/>
            </FormGroup>

            {capabilities.mayOp('get_port_lists') &&
              <FormGroup title={_('Port List')}>
                <Divider>
                  <Select
                    onChange={onValueChange}
                    name="port_list_id"
                    disabled={state.in_use}
                    value={state.port_list_id}
                    items={render_select_items(state.port_lists)}
                  />
                  {!state.in_use &&
                    <Layout box flex>
                      <NewIcon
                        title={_('Create a new port list')}
                        onClick={onNewPortListClick}/>
                    </Layout>
                  }
                </Divider>
              </FormGroup>
            }

            <FormGroup title={_('Alive Test')}>
              <Select
                name="alive_tests"
                onChange={onValueChange}
                value={state.alive_tests}
                items={ALIVE_TESTS_ITEMS}
              />
            </FormGroup>

            {capabilities.mayOp('get_credentials') &&
              <h4>
                {_('Credentials for authenticated checks')}
              </h4>
            }

            {capabilities.mayOp('get_credentials') &&
              <FormGroup title={_('SSH')}>
                <Divider>
                  <Select
                    box
                    name="ssh_credential_id"
                    onChange={onValueChange}
                    disabled={state.in_use}
                    value={state.ssh_credential_id}
                    items=
                      {render_select_items(ssh_credentials, UNSET_VALUE)}
                  />
                  <Layout>
                    {_('on port')}
                  </Layout>
                  <TextField
                    size="6"
                    name="port"
                    value={state.port}
                    disabled={state.in_use}
                    onChange={onValueChange}/>
                  {!state.in_use &&
                    <Layout>
                      <NewIcon
                        value={NEW_SSH}
                        onClick={onNewCredentialsClick}
                        title={_('Create a new credential')}/>
                    </Layout>
                  }
                </Divider>
              </FormGroup>
            }

            {capabilities.mayOp('get_credentials') &&
              <FormGroup title={_('SMB')}>
                <Divider>
                  <Select
                    onChange={onValueChange}
                    name="smb_credential_id"
                    disabled={state.in_use}
                    value={state.smb_credential_id}
                    items={render_select_items(up_credentials, UNSET_VALUE)}
                  />
                  {!in_use &&
                    <Layout box flex>
                      <NewIcon
                        value={NEW_SMB}
                        onClick={onNewCredentialsClick}
                        title={_('Create a new credential')}/>
                    </Layout>
                  }
                </Divider>
              </FormGroup>
            }

            {capabilities.mayOp('get_credentials') &&
              <FormGroup title={_('ESXi')}>
                <Divider>
                  <Select
                    disabled={state.in_use}
                    onChange={onValueChange}
                    name="esxi_credential_id"
                    value={state.esxi_credential_id}
                    items={render_select_items(up_credentials, UNSET_VALUE)}
                  />
                  {!state.in_use &&
                    <Layout box flex>
                      <NewIcon
                        value={NEW_ESXI}
                        onClick={onNewCredentialsClick}
                        title={_('Create a new credential')}/>
                    </Layout>
                  }
                </Divider>
              </FormGroup>
            }

            {capabilities.mayOp('get_credentials') &&
              <FormGroup title={_('SNMP')}>
                <Divider>
                  <Select
                    disabled={state.in_use}
                    onChange={onValueChange}
                    name="snmp_credential_id"
                    value={state.snmp_credential_id}
                    items=
                      {render_select_items(snmp_credentials, UNSET_VALUE)}
                  />
                  {!in_use &&
                    <Layout box flex>
                      <NewIcon
                        value={NEW_SNMP}
                        onClick={onNewCredentialsClick}
                        title={_('Create a new credential')}/>
                    </Layout>
                  }
                </Divider>
              </FormGroup>
            }
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

TargetDialog.propTypes = {
  alive_tests: PropTypes.oneOf([ALIVE_TESTS_DEFAULT, ...ALIVE_TESTS]),
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
  target_exclude_source: PropTypes.oneOf([
    'manual', 'file',
  ]),
  target_source: PropTypes.oneOf([
    'manual', 'file', 'asset_hosts',
  ]),
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onNewCredentialsClick: PropTypes.func,
  onNewPortListClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

TargetDialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default TargetDialog;

// vim: set ts=2 sw=2 tw=80:
