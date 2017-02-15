/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import {map} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import {withDialog} from '../dialog/dialog.js';

import FileField from '../form/filefield.js';
import FormGroup from '../form/formgroup.js';
import PasswordField from '../form/passwordfield.js';
import Radio from '../form/radio.js';
import Select2 from '../form/select2.js';
import TextField from '../form/textfield.js';
import YesNoRadio from '../form/yesnoradio.js';

const type_names = {
  up: _('Usename + Password'),
  usk: _('Username + SSH Key'),
  cc: _('Client Cerficate'),
  snmp: _('SNMP'),
};

class CredentialsDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  handleTypeChange(base) {
    let {autogenerate, onValueChange} = this.props;
    if (base !== 'up' && base !== 'usk') {
      // autogenerate is only possible with username+password and username+ssh
      autogenerate = 0;
    }

    if (onValueChange) {
      onValueChange(base, 'base');
      onValueChange(autogenerate, 'autogenerate');
    }
  }

  render() {
    let {name, comment, types, base, allow_insecure, autogenerate,
      community, credential_login, lsc_password, privacy_password,
      auth_algorithm, privacy_algorithm, passphrase,
      onValueChange} = this.props;

    let type_opts = map(types, type => {
      return (
        <option value={type} key={type}>{type_names[type]}</option>
      );
    });

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

        <FormGroup title={_('Comment')}>
          <TextField
            name="comment"
            grow="1"
            value={comment}
            size="30"
            maxLength="400"
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Type')}>
          <Select2
            onChange={this.handleTypeChange}
            value={base}>
            {type_opts}
          </Select2>
        </FormGroup>

        <FormGroup title={_('Allow insecure user')}>
          <YesNoRadio
            name="allow_insecure"
            value={allow_insecure}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Auto-generate')}
          condition={base === 'up' || base === 'usk'}>
          <YesNoRadio
            name="autogenerate"
            value={autogenerate}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('SNMP Community')}
          condition={base === 'snmp'}>
          <PasswordField
            name="community"
            value={community}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Username')}
          condition={base === 'up' || base === 'usk' || base === 'snmp'}>
          <TextField
            name="credential_login"
            value={credential_login}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Password')}
          condition={base === 'up' || base === 'snmp'}>
          <PasswordField
            name="lsc_password"
            value={lsc_password}
            disabled={autogenerate === 1}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Passphrase')}
          condition={base === 'usk'}>
          <PasswordField
            name="passphrase"
            value={passphrase}
            disabled={autogenerate === 1}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Privacy Password')}
          condition={base === 'snmp'}>
          <PasswordField
            name="privacy_password"
            value={privacy_password}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Certificate')}
          condition={base === 'cc'}>
          <FileField
            name="certificate"
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Private Key')}
          condition={base === 'usk' || base === 'cc'}>
          <FileField
            name="private_key"
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Auth Algorithm')}
          condition={base === 'snmp'}>
          <Radio
            value="md5"
            title="MD5"
            checked={auth_algorithm === 'md5'}
            name="auth_algorithm"
            onChange={onValueChange}/>
          <Radio
            value="sha1"
            title="SHA1"
            checked={auth_algorithm === 'sha1'}
            name="auth_algorithm"
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Privacy Algorithm')}
          condition={base === 'snmp'}>
          <Radio
            value="aes"
            title="AED"
            checked={privacy_algorithm === 'aes'}
            name="privacy_algorithm"
            onChange={onValueChange}/>
          <Radio
            value="des"
            title="DES"
            checked={privacy_algorithm === 'des'}
            name="privacy_algorithm"
            onChange={onValueChange}/>
          <Radio
            value=""
            title={_('None')}
            checked={privacy_algorithm === ''}
            name="privacy_algorithm"
            onChange={this.onValueChange}/>
        </FormGroup>
      </Layout>
    );
  }
}

const pwtypes =  React.PropTypes.oneOf([
  'up', 'usk', 'cc', 'snmp',
]);

CredentialsDialog.propTypes = {
  name: React.PropTypes.string,
  comment: React.PropTypes.string,
  types: React.PropTypes.arrayOf(
    pwtypes
  ),
  base: pwtypes,
  allow_insecure: PropTypes.yesno,
  autogenerate: PropTypes.yesno,
  community: React.PropTypes.string,
  credential_login: React.PropTypes.string,
  lsc_password: React.PropTypes.string,
  privacy_password: React.PropTypes.string,
  auth_algorithm: React.PropTypes.oneOf([
    'md5', 'sha1',
  ]),
  privacy_algorithm: React.PropTypes.oneOf([
    'aes', 'des', '',
  ]),
  passphrase: React.PropTypes.string,
  onValueChange: React.PropTypes.func,
};

CredentialsDialog.contextTypes = {
  capabilities: React.PropTypes.object.isRequired,
};

export default withDialog(CredentialsDialog, {
  title: _('New Credential'),
  footer: _('Save'),
  defaultState: {
    name: _('Unnamed'),
    comment: '',
    base: 'up',
    allow_insecure: 0,
    autogenerate: 0,
    community: '',
    credential_login: '',
    lsc_password: '',
    passphrase: '',
    privacy_password: '',
    auth_algorithm: 'sha1',
    privacy_algorithm: 'aes',
  },
});

// vim: set ts=2 sw=2 tw=80:
