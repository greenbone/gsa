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

import {autobind, map, is_defined, first, extend} from '../../utils.js';
import _ from '../../locale.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import FileField from '../form/filefield.js';
import YesNoRadio from  '../form/yesnoradio.js';
import PasswordField from '../form/passwordfield.js';
import Radio from '../form/radio.js';

const type_names = {
  up: _('Usename + Password'),
  usk: _('Username + SSH Key'),
  cc: _('Client Cerficate'),
  snmp: _('SNMP'),
};

const DEFAULT_TITLE = _('Create new Credential');

export class CredentialsDialog extends Dialog {

  constructor(...args) {
    super(...args);

    autobind(this, 'on');
  }

  defaultState() {
    return extend(super.defaultState(), {
      base: 'up',
      width: 800,
      name: _('unnamed'),
      comment: '',
      allow_insecure: 0,
      autogenerate: 0,
      community: '',
      credential_login: '',
      lsc_password: '',
      passphrase: '',
      privacy_password: '',
      auth_algorithm: 'sha1',
      privacy_algorithm: 'aes',

    });
  }

  show(types, title) {
    if (!is_defined(types)) {
      types = Object.keys(type_names);
    }
    if (!is_defined(title)) {
      title = DEFAULT_TITLE;
    }
    this.setState({visible: true, types, base: first(types), title});
  }

  save() {
    let {gmp} = this.context;
    return gmp.credential.create(this.state).then(credential => {
      this.close();
      return credential;
    }, xhr => {
      this.showErrorMessage(xhr.action_result.message);
      throw new Error('Credentials creation failed. Reason: ' +
        xhr.action_result.message);
    });
  }

  onTypeChange(base) {
    let {autogenerate} = this.state;
    if (base !== 'up' && base !== 'usk') {
      // autogenerate is only possible with username+password and username+ssh
      autogenerate = 0;
    }
    this.setState({base, autogenerate});
  }

  renderContent() {
    let {name, comment, types, base, allow_insecure, autogenerate,
      community, credential_login, lsc_password, privacy_password,
      auth_algorithm, privacy_algorithm, passphrase} = this.state;
    let type_opts = map(types, type => {
      return (
        <option value={type} key={type}>{type_names[type]}</option>
      );
    });

    return (
      <Layout flex="column">

        <FormGroup title={_('Name')}>
          <TextField name="name"
            grow="1"
            value={name} size="30"
            onChange={this.onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField name="comment"
            grow="1"
            value={comment}
            size="30" maxLength="400"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Type')}>
          <Select2 onChange={this.onTypeChange} value={base}>
            {type_opts}
          </Select2>
        </FormGroup>

        <FormGroup title={_('Allow insecure user')}>
          <YesNoRadio value={allow_insecure}
            name="allow_insecure"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Auto-generate')}
          condition={base === 'up' || base === 'usk'}>
          <YesNoRadio value={autogenerate}
            name="autogenerate"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('SNMP Community')}
          condition={base === 'snmp'}>
          <PasswordField value={community}
            name="community"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Username')}
          condition={base === 'up' || base === 'usk' || base === 'snmp'}>
          <TextField value={credential_login}
            name="credential_login"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Password')}
          condition={base === 'up' || base === 'snmp'}>
          <PasswordField value={lsc_password}
            disabled={autogenerate === 1}
            name="lsc_password"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Passphrase')}
          condition={base === 'usk'}>
          <PasswordField value={passphrase}
            disabled={autogenerate === 1}
            name="passphrase"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Privacy Password')}
          condition={base === 'snmp'}>
          <PasswordField value={privacy_password}
            name="privacy_password"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Certificate')}
          condition={base === 'cc'}>
          <FileField name="certificate" onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Private Key')}
          condition={base === 'usk' || base === 'cc'}>
          <FileField name="private_key" onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Auth Algorithm')}
          condition={base === 'snmp'}>
          <Radio
            value="md5"
            title="MD5"
            checked={auth_algorithm === 'md5'}
            name="auth_algorithm"
            onChange={this.onValueChange}/>
          <Radio
            value="sha1"
            title="SHA1"
            checked={auth_algorithm === 'sha1'}
            name="auth_algorithm"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Privacy Algorithm')}
          condition={base === 'snmp'}>
          <Radio
            value="aes"
            title="AED"
            checked={privacy_algorithm === 'aes'}
            name="privacy_algorithm"
            onChange={this.onValueChange}/>
          <Radio
            value="des"
            title="DES"
            checked={privacy_algorithm === 'des'}
            name="privacy_algorithm"
            onChange={this.onValueChange}/>
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

CredentialsDialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default CredentialsDialog;

// vim: set ts=2 sw=2 tw=80:
