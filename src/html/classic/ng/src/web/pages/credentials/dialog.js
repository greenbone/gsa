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

import  _ from 'gmp/locale.js';
import {is_defined, map} from 'gmp/utils.js';
import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import withDialog from '../../components/dialog/withDialog.js';

import Checkbox from '../../components/form/checkbox.js';
import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import PasswordField from '../../components/form/passwordfield.js';
import Radio from '../../components/form/radio.js';
import Select2 from '../../components/form/select2.js';
import TextField from '../../components/form/textfield.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

const type_names = {
  up: _('Username + Password'),
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
    if (base !== USERNAME_PASSWORD_CREDENTIAL_TYPE &&
      base !== USERNAME_SSH_KEY_CREDENTIAL_TYPE) {
      // autogenerate is only possible with username+password and username+ssh
      autogenerate = 0;
    }

    if (onValueChange) {
      onValueChange(base, 'base');
      onValueChange(autogenerate, 'autogenerate');
    }
  }

  render() {
    let {
      allow_insecure,
      auth_algorithm,
      autogenerate,
      base,
      change_community,
      change_passphrase,
      change_password,
      change_privacy_password,
      comment,
      community,
      credential,
      credential_login,
      name,
      passphrase,
      password,
      privacy_algorithm,
      privacy_password,
      types,
      onValueChange,
    } = this.props;

    let type_opts = map(types, type => {
      return (
        <option value={type} key={type}>{type_names[type]}</option>
      );
    });

    let is_edit = is_defined(credential);

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
            disabled={is_edit}
            value={base}>
            {type_opts}
          </Select2>
        </FormGroup>

        <FormGroup title={_('Allow insecure use')}>
          <YesNoRadio
            name="allow_insecure"
            value={allow_insecure}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Auto-generate')}
          condition={(base === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
            base === USERNAME_SSH_KEY_CREDENTIAL_TYPE) && !is_edit}>
          <YesNoRadio
            name="autogenerate"
            value={autogenerate}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('SNMP Community')}
          condition={base === SNMP_CREDENTIAL_TYPE}>
          {is_edit &&
            <Checkbox
              name="change_community"
              checked={change_community === '1'}
              checkedValue="1"
              unCheckedValue="0"
              title={_('Replace existing SNMP community with')}
              onChange={onValueChange}/>
          }
          <PasswordField
            name="community"
            value={community}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Username')}
          flex
          condition={
            base === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
            base === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
            base === SNMP_CREDENTIAL_TYPE
          }>
          <TextField
            name="credential_login"
            value={credential_login}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Password')}
          condition={base === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              base === SNMP_CREDENTIAL_TYPE}>
          {is_edit &&
            <Checkbox
              name="change_password"
              checked={change_password === '1'}
              checkedValue="1"
              unCheckedValue="0"
              title={_('Replace existing password with')}
              onChange={onValueChange}/>
          }
          <PasswordField
            name="password"
            value={password}
            autoComplete="new-password"
            disabled={autogenerate === 1}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Passphrase')}
          condition={base === USERNAME_SSH_KEY_CREDENTIAL_TYPE}>
          {is_edit &&
            <Checkbox
              name="change_passphrase"
              checked={change_passphrase === '1'}
              checkedValue="1"
              unCheckedValue="0"
              title={_('Replace existing passphrase with')}
              onChange={onValueChange}/>
          }
          <PasswordField
            name="passphrase"
            value={passphrase}
            autoComplete="new-password"
            disabled={autogenerate === 1}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Privacy Password')}
          condition={base === SNMP_CREDENTIAL_TYPE}>
          {is_edit &&
            <Checkbox
              name="change_privacy_password"
              checked={change_privacy_password === '1'}
              checkedValue="1"
              unCheckedValue="0"
              title={_('Replace existing privacy password with')}
              onChange={onValueChange}/>
          }
          <PasswordField
            name="privacy_password"
            autoComplete="new-password"
            value={privacy_password}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Certificate')}
          condition={base === CLIENT_CERTIFICATE_CREDENTIAL_TYPE}>
          <FileField
            name="certificate"
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Private Key')}
          condition={
            base === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
            base === CLIENT_CERTIFICATE_CREDENTIAL_TYPE
          }>
          <FileField
            name="private_key"
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Auth Algorithm')}
          condition={base === SNMP_CREDENTIAL_TYPE}>
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
          condition={base === SNMP_CREDENTIAL_TYPE}>
          <Radio
            value="aes"
            title="AES"
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

const pwtypes =  PropTypes.oneOf([
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
]);

CredentialsDialog.propTypes = {
  name: PropTypes.string,
  comment: PropTypes.string,
  types: PropTypes.arrayOf(
    pwtypes
  ),
  change_community: PropTypes.yesno,
  change_passphrase: PropTypes.yesno,
  change_password: PropTypes.yesno,
  change_privacy_password: PropTypes.yesno,
  base: pwtypes,
  allow_insecure: PropTypes.yesno,
  autogenerate: PropTypes.yesno,
  community: PropTypes.string,
  credential: PropTypes.model,
  credential_login: PropTypes.string,
  password: PropTypes.string,
  privacy_password: PropTypes.string,
  auth_algorithm: PropTypes.oneOf([
    'md5', 'sha1',
  ]),
  privacy_algorithm: PropTypes.oneOf([
    'aes', 'des', '',
  ]),
  passphrase: PropTypes.string,
  onValueChange: PropTypes.func,
};

CredentialsDialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withDialog({
  title: _('New Credential'),
  footer: _('Save'),
  defaultState: {
    allow_insecure: 0,
    auth_algorithm: 'sha1',
    autogenerate: 0,
    base: USERNAME_PASSWORD_CREDENTIAL_TYPE,
    change_community: '0',
    change_passphrase: '0',
    change_password: '0',
    change_privacy_password: '0',
    comment: '',
    community: '',
    credential_login: '',
    name: _('Unnamed'),
    passphrase: '',
    password: '',
    privacy_algorithm: 'aes',
    privacy_password: '',
  },
})(CredentialsDialog);

// vim: set ts=2 sw=2 tw=80:
