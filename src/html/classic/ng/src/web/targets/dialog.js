/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import  _ from '../../locale.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {render_options} from '../render.js';

import {withDialog} from '../dialog/dialog.js';

import FileField from '../form/filefield.js';
import FormGroup from '../form/formgroup.js';
import Radio from '../form/radio.js';
import Select2 from '../form/select2.js';
import TextField from '../form/textfield.js';
import YesNoRadio from '../form/yesnoradio.js';

import NewIcon from '../icons/newicon.js';

import {SSH_CREDENTIAL_TYPES, SMB_CREDENTIAL_TYPES, ESXI_CREDENTIAL_TYPES,
  SNMP_CREDENTIAL_TYPES, USERNAME_PASSWORD_CREDENTIAL_TYPE,
  ssh_credential_filter, snmp_credential_filter,
} from '../../gmp/models/credential.js';

const DEFAULT_PORT_LIST_ID = 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5';
const ALIVE_TESTS_DEFAULT = 'Scan Config Default';

const ALIVE_TESTS = [
  'ICMP Ping', 'TCP-ACK Service Ping', 'TCP-SYN Service Ping',
  'ARP Ping', 'ICMP & TCP-ACK Service Ping',
  'ICMP & ARP Ping', 'TCP-ACK Service & ARP Ping',
  'ICMP, TCP-ACK Service & ARP Ping', 'Consider Alive',
  ALIVE_TESTS_DEFAULT,
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

const TargetDialog = ({name, comment = '', target_source,
    hosts, exclude_hosts, reverse_lookup_only, reverse_lookup_unify,
    port_list_id, port_lists, alive_tests, ssh_credential_id, credentials,
    port, smb_credential_id, esxi_credential_id, snmp_credential_id,
    hosts_count, onValueChange, onNewCredentialsClick, onNewPortListClick,
    ...props},
    {capabilities}) => {

  let ssh_credentials = credentials.filter(ssh_credential_filter);
  let up_credentials = credentials.filter(value =>
    value.type === USERNAME_PASSWORD_CREDENTIAL_TYPE);
  let snmp_credentials = credentials.filter(snmp_credential_filter);

  return (
    <Layout flex="column">
      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          grow="1"
          value={name}
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup
        title={_('Comment')}
        flex="column">
        <TextField
          name="comment"
          value={comment}
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup
        title={_('Hosts')}
        flex="column">
        <Layout flex box>
          <Radio
            value="manual"
            title={_('Manual')}
            name="target_source"
            onChange={onValueChange}
            checked={target_source === 'manual'}/>
          <TextField
            grow="1"
            disabled={target_source !== 'manual'}
            value={hosts}
            name="hosts"
            onChange={onValueChange}/>
        </Layout>

        <Layout flex box>
          <Radio
            title={_('From file')}
            name="target_source"
            value="file"
            onChange={onValueChange}
            checked={target_source === 'file'}/>
          <FileField
            name="file"
            onChange={onValueChange}/>
        </Layout>

        {hosts_count &&
          <Layout flex box>
            <Radio
              title={_('From host assets ({{count}} hosts)',
                {count: hosts_count})}
              name="target_source"
              value="asset_hosts"
              onChange={onValueChange}
              checked={target_source === 'asset_hosts'}/>
          </Layout>
        }

      </FormGroup>

      <FormGroup title={_('Exclude Hosts')}>
        <TextField
          name="exclude_hosts"
          value={exclude_hosts}
          grow="1"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Reverse Lookup Only')}>
        <YesNoRadio
          name="reverse_lookup_only"
          value={reverse_lookup_only}
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Reverse Lookup Unify')}>
        <YesNoRadio
          name="reverse_lookup_unify"
          value={reverse_lookup_unify}
          onChange={onValueChange}/>
      </FormGroup>

      {capabilities.mayOp('get_port_lists') &&
        <FormGroup title={_('Port List')}>
          <Select2
            onChange={onValueChange}
            name="port_list_id"
            value={port_list_id}>
            {render_options(port_lists)}
          </Select2>
          <Layout box flex>
            <NewIcon
              title={_('Create a new port list')}
              onClick={onNewPortListClick}/>
          </Layout>
        </FormGroup>
      }

      <FormGroup title={_('Alive Test')}>
        <Select2
          name="alive_tests"
          onChange={onValueChange}
          value={alive_tests}>
          <option value="Scan Config Default">
            {_('Scan Config Default')}
          </option>
          {ALIVE_TESTS.map(value =>
            <option key={value} value={value}>{value}</option>)
          }
        </Select2>
      </FormGroup>

      {capabilities.mayOp('get_credentials') &&
        <h4>
          {_('Credentials for authenticated checks')}
        </h4>
      }

      {capabilities.mayOp('get_credentials') &&
        <FormGroup title={_('SSH')}>
          <Select2
            box
            name="ssh_credential_id"
            onChange={onValueChange}
            value={ssh_credential_id}>
            {render_options(ssh_credentials, 0)}
          </Select2>
          <Layout box flex>
            {_('on port')}
          </Layout>
          <TextField
            size="6"
            name="port"
            value={port}
            onChange={onValueChange}/>
          <Layout box flex>
            <NewIcon
              value={NEW_SSH}
              onClick={onNewCredentialsClick}
              title={_('Create a new credential')}/>
          </Layout>
        </FormGroup>
      }

      {capabilities.mayOp('get_credentials') &&
        <FormGroup title={_('SMB')}>
          <Select2
            onChange={onValueChange}
            name="smb_credential_id"
            value={smb_credential_id}>
            {render_options(up_credentials, 0)}
          </Select2>
          <Layout box flex>
            <NewIcon
              value={NEW_SMB}
              onClick={onNewCredentialsClick}
              title={_('Create a new credential')}/>
          </Layout>
        </FormGroup>
      }

      {capabilities.mayOp('get_credentials') &&
        <FormGroup title={_('ESXi')}>
          <Select2
            onChange={onValueChange}
            name="esxi_credential_id"
            value={esxi_credential_id}>
            {render_options(up_credentials, 0)}
          </Select2>
          <Layout box flex>
            <NewIcon
              value={NEW_ESXI}
              onClick={onNewCredentialsClick}
              title={_('Create a new credential')}/>
          </Layout>
        </FormGroup>
      }

      {capabilities.mayOp('get_credentials') &&
        <FormGroup title={_('SNMP')}>
          <Select2
            onChange={onValueChange}
            name="snmp_credential_id"
            value={snmp_credential_id}>
            {render_options(snmp_credentials, 0)}
          </Select2>
          <Layout box flex>
            <NewIcon
              value={NEW_SNMP}
              onClick={onNewCredentialsClick}
              title={_('Create a new credential')}/>
          </Layout>
        </FormGroup>
      }
    </Layout>
  );
};

TargetDialog.propTypes = {
  name: React.PropTypes.string,
  comment: React.PropTypes.string,
  target_source: React.PropTypes.oneOf([
    'manual', 'file', 'asset_hosts',
  ]),
  hosts: React.PropTypes.string,
  hosts_count: React.PropTypes.number,
  exclude_hosts: React.PropTypes.string,
  reverse_lookup_only: PropTypes.yesno,
  reverse_lookup_unify: PropTypes.yesno,
  port_list_id: PropTypes.idOrZero,
  port_lists: PropTypes.arrayLike,
  alive_tests: React.PropTypes.oneOf(ALIVE_TESTS),
  credentials: PropTypes.arrayLike,
  ssh_credential_id: PropTypes.idOrZero,
  port: PropTypes.number,
  smb_credential_id: PropTypes.idOrZero,
  esxi_credential_id: PropTypes.idOrZero,
  snmp_credential_id: PropTypes.idOrZero,
  onValueChange: React.PropTypes.func,
  onNewCredentialsClick: React.PropTypes.func,
  onNewPortListClick: React.PropTypes.func,
};

TargetDialog.contextTypes = {
  capabilities: React.PropTypes.object.isRequired,
};

export default withDialog(TargetDialog, {
  title: _('New Target'),
  footer: _('Save'),
  defaultState: {
    alive_tests: ALIVE_TESTS_DEFAULT,
    comment: '',
    credentials: [],
    esxi_credential_id: 0,
    name: _('Unnamed'),
    port: 22,
    port_list_id: DEFAULT_PORT_LIST_ID,
    port_lists: [],
    reverse_lookup_only: 0,
    reverse_lookup_unify: 0,
    smb_credential_id: 0,
    snmp_credential_id: 0,
    ssh_credential_id: 0,
    target_source: 'manual',
  },
});

// vim: set ts=2 sw=2 tw=80:
