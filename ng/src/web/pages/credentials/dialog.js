/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {is_defined, map} from 'gmp/utils';
import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  SNMP_AUTH_ALGORITHM_MD5,
  SNMP_AUTH_ALGORITHM_SHA1,
  SNMP_PRIVACY_ALOGRITHM_NONE,
  SNMP_PRIVACY_ALGORITHM_AES,
  SNMP_PRIVACY_ALGORITHM_DES,
} from 'gmp/models/credential.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities';

import SaveDialog from '../../components/dialog/savedialog.js';

import Checkbox from '../../components/form/checkbox.js';
import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import PasswordField from '../../components/form/passwordfield.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import TextField from '../../components/form/textfield.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

const type_names = {
  up: _('Username + Password'),
  usk: _('Username + SSH Key'),
  cc: _('Client Cerficate'),
  snmp: _('SNMP'),
};

const DEFAULTS = {
  allow_insecure: NO_VALUE,
  auth_algorithm: SNMP_AUTH_ALGORITHM_SHA1,
  autogenerate: NO_VALUE,
  base: USERNAME_PASSWORD_CREDENTIAL_TYPE,
  change_community: NO_VALUE,
  change_passphrase: NO_VALUE,
  change_password: NO_VALUE,
  change_privacy_password: NO_VALUE,
  comment: '',
  community: '',
  credential_login: '',
  name: _('Unnamed'),
  passphrase: '',
  password: '',
  privacy_algorithm: SNMP_PRIVACY_ALGORITHM_AES,
  privacy_password: '',
};

class CredentialsDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  handleTypeChange(base, autogenerate, onValueChange) {
    if (base !== USERNAME_PASSWORD_CREDENTIAL_TYPE &&
      base !== USERNAME_SSH_KEY_CREDENTIAL_TYPE) {
      // autogenerate is only possible with username+password and username+ssh
      autogenerate = NO_VALUE;
    }
   if (onValueChange) {
      onValueChange(base, 'base');
      onValueChange(autogenerate, 'autogenerate');
   }
  }

  render() {
    const {
      credential,
      title = _('New Credential'),
      types,
      visible = true,
      onClose,
      onSave,
    } = this.props;

    const typeOptions = map(types, type => ({
      label: type_names[type],
      value: type,
    }));

    const is_edit = is_defined(credential);

    return (
      <SaveDialog
        visible={visible}
        title={title}
        onClose={onClose}
        onSave={onSave}
        initialData={{...DEFAULTS, ...credential}}
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
                  size="30"
                  maxLength="80"
                  value={state.name}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  grow="1"
                  size="30"
                  maxLength="400"
                  value={state.comment}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Type')}>
                <Select
                  disabled={is_edit}
                  items={typeOptions}
                  value={state.base}
                  onChange={value => this.handleTypeChange(
                    value, state.autogenerate, onValueChange)}
                />
              </FormGroup>

              <FormGroup title={_('Allow insecure use')}>
                <YesNoRadio
                  name="allow_insecure"
                  value={state.allow_insecure}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Auto-generate')}
                condition={(state.base === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
                  state.base === USERNAME_SSH_KEY_CREDENTIAL_TYPE) && !is_edit}
              >
                <YesNoRadio
                  name="autogenerate"
                  value={state.autogenerate}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('SNMP Community')}
                condition={state.base === SNMP_CREDENTIAL_TYPE}
              >
                {is_edit &&
                  <Checkbox
                    name="change_community"
                    checked={state.change_community === YES_VALUE}
                    checkedValue={YES_VALUE}
                    unCheckedValue={NO_VALUE}
                    title={_('Replace existing SNMP community with')}
                    onChange={onValueChange}
                  />
                }
                <PasswordField
                  name="community"
                  value={state.community}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Username')}
                flex
                condition={
                  state.base === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
                  state.base === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
                  state.base === SNMP_CREDENTIAL_TYPE
                }
              >
                <TextField
                  name="credential_login"
                  value={state.credential_login}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Password')}
                condition={state.base === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
                    state.base === SNMP_CREDENTIAL_TYPE}
              >
                <Divider>
                  {is_edit &&
                    <Checkbox
                      name="change_password"
                      checked={state.change_password === YES_VALUE}
                      checkedValue={YES_VALUE}
                      unCheckedValue={NO_VALUE}
                      title={_('Replace existing password with')}
                      onChange={onValueChange}
                    />
                  }
                  <PasswordField
                    name="password"
                    autoComplete="new-password"
                    disabled={state.autogenerate === YES_VALUE}
                    value={state.password}
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>

              <FormGroup
                title={_('Passphrase')}
                condition={state.base === USERNAME_SSH_KEY_CREDENTIAL_TYPE}
              >
                {is_edit &&
                  <Checkbox
                    name="change_passphrase"
                    checked={state.change_passphrase === YES_VALUE}
                    checkedValue={YES_VALUE}
                    unCheckedValue={NO_VALUE}
                    title={_('Replace existing passphrase with')}
                    onChange={onValueChange}
                  />
                }
                <PasswordField
                  name="passphrase"
                  autoComplete="new-password"
                  disabled={state.autogenerate === YES_VALUE}
                  value={state.passphrase}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Privacy Password')}
                condition={state.base === SNMP_CREDENTIAL_TYPE}
              >
                {is_edit &&
                  <Checkbox
                    name="change_privacy_password"
                    checked={state.change_privacy_password === YES_VALUE}
                    checkedValue={YES_VALUE}
                    unCheckedValue={NO_VALUE}
                    title={_('Replace existing privacy password with')}
                    onChange={onValueChange}
                  />
                }
                <PasswordField
                  name="privacy_password"
                  autoComplete="new-password"
                  value={state.privacy_password}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Certificate')}
                condition={state.base === CLIENT_CERTIFICATE_CREDENTIAL_TYPE}
              >
                <FileField
                  name="certificate"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Private Key')}
                condition={
                  state.base === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
                  state.base === CLIENT_CERTIFICATE_CREDENTIAL_TYPE
                }
              >
                <FileField
                  name="private_key"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Auth Algorithm')}
                condition={state.base === SNMP_CREDENTIAL_TYPE}
              >
                <Radio
                  title="MD5"
                  checked={state.auth_algorithm === SNMP_AUTH_ALGORITHM_MD5}
                  name="auth_algorithm"
                  value={SNMP_AUTH_ALGORITHM_MD5}
                  onChange={onValueChange}
                />
                <Radio
                  title="SHA1"
                  checked={state.auth_algorithm === SNMP_AUTH_ALGORITHM_SHA1}
                  name="auth_algorithm"
                  value={SNMP_AUTH_ALGORITHM_SHA1}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup
                title={_('Privacy Algorithm')}
                condition={state.base === SNMP_CREDENTIAL_TYPE}
              >
                <Radio
                  title="AES"
                  checked={
                    state.privacy_algorithm === SNMP_PRIVACY_ALGORITHM_AES}
                  name="privacy_algorithm"
                  value={SNMP_PRIVACY_ALGORITHM_AES}
                  onChange={onValueChange}
                />
                <Radio
                  title="DES"
                  checked={
                    state.privacy_algorithm === SNMP_PRIVACY_ALGORITHM_DES}
                  name="privacy_algorithm"
                  value={SNMP_PRIVACY_ALGORITHM_DES}
                  onChange={onValueChange}
                />
                <Radio
                  title={_('None')}
                  checked={
                    state.privacy_algorithm === SNMP_PRIVACY_ALOGRITHM_NONE}
                  name="privacy_algorithm"
                  value={SNMP_PRIVACY_ALOGRITHM_NONE}
                  onChange={onValueChange}
                />
              </FormGroup>
            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
}

const pwtypes = PropTypes.oneOf([
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
]);

CredentialsDialog.propTypes = {
  allow_insecure: PropTypes.yesno,
  auth_algorithm: PropTypes.oneOf([
    SNMP_AUTH_ALGORITHM_SHA1,
    SNMP_AUTH_ALGORITHM_MD5,
  ]),
  autogenerate: PropTypes.yesno,
  base: pwtypes,
  capabilities: PropTypes.capabilities.isRequired,
  change_community: PropTypes.yesno,
  change_passphrase: PropTypes.yesno,
  change_password: PropTypes.yesno,
  change_privacy_password: PropTypes.yesno,
  comment: PropTypes.string,
  community: PropTypes.string,
  credential: PropTypes.model,
  credential_login: PropTypes.string,
  name: PropTypes.string,
  passphrase: PropTypes.string,
  password: PropTypes.string,
  privacy_algorithm: PropTypes.oneOf([
    SNMP_PRIVACY_ALGORITHM_AES,
    SNMP_PRIVACY_ALGORITHM_DES,
    SNMP_PRIVACY_ALOGRITHM_NONE,
  ]),
  privacy_password: PropTypes.string,
  title: PropTypes.string,
  types: PropTypes.arrayOf(
    pwtypes
  ),
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default withCapabilities(CredentialsDialog);

// vim: set ts=2 sw=2 tw=80:
