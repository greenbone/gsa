/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import React, {useEffect, useReducer} from 'react';

import {_} from 'gmp/locale/lang';

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
  PASSWORD_ONLY_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  SMIME_CREDENTIAL_TYPE,
  VFIRE_CREDENTIAL_TYPES,
  ALL_CREDENTIAL_TYPES,
  getCredentialTypeName,
} from 'gmp/models/credential';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';
import {first, map} from 'gmp/utils/array';

import SaveDialog from 'web/components/dialog/savedialog';

import Checkbox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import stateReducer, {updateState} from 'web/utils/stateReducer';

const PGP_PUBLIC_KEY_LINE = '-----BEGIN PGP PUBLIC KEY BLOCK-----';

const CredentialsDialog = ({
  allow_insecure = NO_VALUE,
  auth_algorithm = SNMP_AUTH_ALGORITHM_SHA1,
  autogenerate,
  change_community = NO_VALUE,
  change_passphrase = NO_VALUE,
  change_password = NO_VALUE,
  change_privacy_password = NO_VALUE,
  comment = '',
  community = '',
  credential,
  credential_login = '',
  credential_type,
  error,
  name = _('Unnamed'),
  passphrase = '',
  password = '',
  privacy_algorithm = SNMP_PRIVACY_ALGORITHM_AES,
  privacy_password = '',
  title = _('New Credential'),
  types,
  onClose,
  onErrorClose,
  onSave,
}) => {
  const [state, dispatchState] = useReducer(stateReducer, {});

  const setCredentialTypeAndAutoGenerate = (
    credential_type, // eslint-disable-line no-shadow
    autogenerate = NO_VALUE, // eslint-disable-line no-shadow
  ) => {
    if (
      credential_type !== USERNAME_PASSWORD_CREDENTIAL_TYPE &&
      credential_type !== USERNAME_SSH_KEY_CREDENTIAL_TYPE
    ) {
      // autogenerate is only possible with username+password and username+ssh
      autogenerate = NO_VALUE;
    }

    dispatchState(updateState({autogenerate, credential_type}));
  };

  useEffect(() => {
    setCredentialTypeAndAutoGenerate(credential_type, autogenerate);
  }, [credential_type, autogenerate]);

  useEffect(() => {
    if (isDefined(error)) {
      dispatchState(updateState({error}));
    } else {
      dispatchState(updateState({error: null}));
    }
  }, [error]);

  // eslint-disable-next-line no-shadow
  const handleCredentialTypeChange = (credential_type, autogenerate) => {
    setCredentialTypeAndAutoGenerate(credential_type, autogenerate);
  };

  const handlePublicKeyChange = file => {
    const reader = new FileReader();
    reader.onload = e => {
      const {result} = e.target;
      if (result.startsWith(PGP_PUBLIC_KEY_LINE)) {
        dispatchState(updateState({public_key: result}));
      } else {
        dispatchState(updateState({error: _('Not a valid PGP file')}));
      }
    };
    reader.readAsText(file);
  };

  const handleErrorClose = () => {
    if (isDefined(onErrorClose)) {
      onErrorClose();
    }

    dispatchState(updateState({error: undefined}));
  };

  // eslint-disable-next-line no-shadow
  const handleError = error => {
    dispatchState(updateState({error: error.message}));
  };

  let {credential_type: credentialTypeFromState} = state;

  const {
    autogenerate: autoGenerateFromState,
    public_key,
    error: stateError,
  } = state;

  const typeOptions = map(types, type => ({
    label: getCredentialTypeName(type),
    value: type,
  }));

  const is_edit = isDefined(credential);

  if (!isDefined(credentialTypeFromState)) {
    if (types.includes(USERNAME_PASSWORD_CREDENTIAL_TYPE)) {
      credentialTypeFromState = USERNAME_PASSWORD_CREDENTIAL_TYPE;
    } else {
      credentialTypeFromState = first(types);
    }
  }

  const data = {
    allow_insecure,
    auth_algorithm,
    change_community,
    change_passphrase,
    change_password,
    change_privacy_password,
    comment,
    community,
    credential_login,
    name,
    passphrase,
    password,
    privacy_algorithm,
    privacy_password,
    id: isDefined(credential) ? credential.id : undefined,
  };

  const values = {
    autogenerate: autoGenerateFromState,
    credential_type: credentialTypeFromState,
    public_key,
  };

  return (
    <SaveDialog
      title={title}
      defaultValues={data}
      error={stateError}
      values={values}
      onErrorClose={handleErrorClose}
      onError={handleError}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: formState, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                size="30"
                value={formState.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                grow="1"
                size="30"
                value={formState.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Type')}>
              <Select
                disabled={is_edit}
                items={typeOptions}
                value={formState.credential_type}
                onChange={value =>
                  handleCredentialTypeChange(value, formState.autogenerate)
                }
              />
            </FormGroup>

            <FormGroup title={_('Allow insecure use')}>
              <YesNoRadio
                name="allow_insecure"
                value={formState.allow_insecure}
                onChange={onValueChange}
              />
            </FormGroup>

            {(formState.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              formState.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE) &&
              !is_edit && (
                <FormGroup title={_('Auto-generate')}>
                  <YesNoRadio
                    name="autogenerate"
                    value={formState.autogenerate}
                    onChange={value =>
                      handleCredentialTypeChange(
                        formState.credential_type,
                        value,
                      )
                    }
                  />
                </FormGroup>
              )}

            {formState.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup title={_('SNMP Community')}>
                {is_edit && (
                  <Checkbox
                    name="change_community"
                    checked={formState.change_community === YES_VALUE}
                    checkedValue={YES_VALUE}
                    unCheckedValue={NO_VALUE}
                    title={_('Replace existing SNMP community with')}
                    onChange={onValueChange}
                  />
                )}
                <PasswordField
                  name="community"
                  value={formState.community}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {(formState.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              formState.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
              formState.credential_type === SNMP_CREDENTIAL_TYPE) && (
              <FormGroup title={_('Username')} flex>
                <TextField
                  name="credential_login"
                  value={formState.credential_login}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {(formState.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              formState.credential_type === SNMP_CREDENTIAL_TYPE ||
              formState.credential_type === VFIRE_CREDENTIAL_TYPES ||
              formState.credential_type === PASSWORD_ONLY_CREDENTIAL_TYPE) && (
              <FormGroup title={_('Password')}>
                <Divider>
                  {is_edit && (
                    <Checkbox
                      name="change_password"
                      checked={formState.change_password === YES_VALUE}
                      checkedValue={YES_VALUE}
                      unCheckedValue={NO_VALUE}
                      title={_('Replace existing password with')}
                      onChange={onValueChange}
                    />
                  )}
                  <PasswordField
                    name="password"
                    autoComplete="new-password"
                    disabled={formState.autogenerate === YES_VALUE}
                    value={formState.password}
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>
            )}

            {(formState.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
              formState.credential_type ===
                CLIENT_CERTIFICATE_CREDENTIAL_TYPE) && (
              <FormGroup title={_('Passphrase')}>
                <Divider>
                  {is_edit && (
                    <Checkbox
                      name="change_passphrase"
                      checked={formState.change_passphrase === YES_VALUE}
                      checkedValue={YES_VALUE}
                      unCheckedValue={NO_VALUE}
                      title={_('Replace existing passphrase with')}
                      onChange={onValueChange}
                    />
                  )}
                  <PasswordField
                    name="passphrase"
                    autoComplete="new-password"
                    disabled={formState.autogenerate === YES_VALUE}
                    value={formState.passphrase}
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>
            )}

            {formState.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup title={_('Privacy Password')}>
                <Divider>
                  {is_edit && (
                    <Checkbox
                      name="change_privacy_password"
                      checked={formState.change_privacy_password === YES_VALUE}
                      checkedValue={YES_VALUE}
                      unCheckedValue={NO_VALUE}
                      title={_('Replace existing privacy password with')}
                      onChange={onValueChange}
                    />
                  )}
                  <PasswordField
                    name="privacy_password"
                    autoComplete="new-password"
                    value={formState.privacy_password}
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>
            )}

            {formState.credential_type ===
              CLIENT_CERTIFICATE_CREDENTIAL_TYPE && (
              <FormGroup title={_('Certificate')}>
                <FileField name="certificate" onChange={onValueChange} />
              </FormGroup>
            )}

            {(formState.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
              formState.credential_type ===
                CLIENT_CERTIFICATE_CREDENTIAL_TYPE) && (
              <FormGroup title={_('Private Key')}>
                <FileField name="private_key" onChange={onValueChange} />
              </FormGroup>
            )}

            {formState.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup title={_('Auth Algorithm')}>
                <Radio
                  title="MD5"
                  checked={formState.auth_algorithm === SNMP_AUTH_ALGORITHM_MD5}
                  name="auth_algorithm"
                  value={SNMP_AUTH_ALGORITHM_MD5}
                  onChange={onValueChange}
                />
                <Radio
                  title="SHA1"
                  checked={
                    formState.auth_algorithm === SNMP_AUTH_ALGORITHM_SHA1
                  }
                  name="auth_algorithm"
                  value={SNMP_AUTH_ALGORITHM_SHA1}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {formState.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup title={_('Privacy Algorithm')}>
                <Radio
                  title="AES"
                  checked={
                    formState.privacy_algorithm === SNMP_PRIVACY_ALGORITHM_AES
                  }
                  name="privacy_algorithm"
                  value={SNMP_PRIVACY_ALGORITHM_AES}
                  onChange={onValueChange}
                />
                <Radio
                  title="DES"
                  checked={
                    formState.privacy_algorithm === SNMP_PRIVACY_ALGORITHM_DES
                  }
                  name="privacy_algorithm"
                  value={SNMP_PRIVACY_ALGORITHM_DES}
                  onChange={onValueChange}
                />
                <Radio
                  title={_('None')}
                  checked={
                    formState.privacy_algorithm === SNMP_PRIVACY_ALOGRITHM_NONE
                  }
                  name="privacy_algorithm"
                  value={SNMP_PRIVACY_ALOGRITHM_NONE}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {formState.credential_type === PGP_CREDENTIAL_TYPE && (
              <FormGroup title={_('PGP Public Key')}>
                <FileField name="public_key" onChange={handlePublicKeyChange} />
              </FormGroup>
            )}

            {formState.credential_type === SMIME_CREDENTIAL_TYPE && (
              <FormGroup title={_('S/MIME Certificate')}>
                <FileField name="certificate" onChange={onValueChange} />
              </FormGroup>
            )}
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

const pwtypes = PropTypes.oneOf(ALL_CREDENTIAL_TYPES);

CredentialsDialog.propTypes = {
  allow_insecure: PropTypes.yesno,
  auth_algorithm: PropTypes.oneOf([
    SNMP_AUTH_ALGORITHM_SHA1,
    SNMP_AUTH_ALGORITHM_MD5,
  ]),
  autogenerate: PropTypes.yesno,
  change_community: PropTypes.yesno,
  change_passphrase: PropTypes.yesno,
  change_password: PropTypes.yesno,
  change_privacy_password: PropTypes.yesno,
  comment: PropTypes.string,
  community: PropTypes.string,
  credential: PropTypes.model,
  credential_login: PropTypes.string,
  credential_type: pwtypes,
  error: PropTypes.error,
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
  types: PropTypes.arrayOf(pwtypes),
  onClose: PropTypes.func.isRequired,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default CredentialsDialog; // capabilities don't seem to be used in this dialog

// vim: set ts=2 sw=2 tw=80:
