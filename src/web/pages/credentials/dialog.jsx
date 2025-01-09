/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  ALL_CREDENTIAL_TYPES,
  getCredentialTypeName,
  PASSWORD_ONLY_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  SMIME_CREDENTIAL_TYPE,
  SNMP_AUTH_ALGORITHM_MD5,
  SNMP_AUTH_ALGORITHM_SHA1,
  SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALGORITHM_AES,
  SNMP_PRIVACY_ALGORITHM_DES,
  SNMP_PRIVACY_ALGORITHM_NONE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  VFIRE_CREDENTIAL_TYPES,
} from 'gmp/models/credential';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {first, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {useEffect, useState} from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import Checkbox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

const PGP_PUBLIC_KEY_LINE = '-----BEGIN PGP PUBLIC KEY BLOCK-----';

const CredentialsDialog = props => {
  const [_] = useTranslation();

  const [credentialType, setCredentialType] = useState();
  const [autogenerate, setAutogenerate] = useState();
  const [publicKey, setPublicKey] = useState();
  const [error, setError] = useState();

  const {
    credential,
    title = _('New Credential'),
    types = [],
    allow_insecure,
    auth_algorithm = SNMP_AUTH_ALGORITHM_SHA1,
    change_community,
    change_passphrase,
    change_password,
    change_privacy_password,
    comment = '',
    community = '',
    credential_login = '',
    name = _('Unnamed'),
    passphrase = '',
    password = '',
    privacy_algorithm = SNMP_PRIVACY_ALGORITHM_AES,
    privacy_password = '',
    onClose,
    onSave,
  } = props;

  const isEdit = isDefined(credential);

  useEffect(() => {
    const {autogenerate: pAutogen, credential_type} = props;
    setCredentialTypeAndAutoGenerate(credential_type, pAutogen);
  }, [props]);

  const setCredentialTypeAndAutoGenerate = (type, autogenerate) => {
    if (
      type !== USERNAME_PASSWORD_CREDENTIAL_TYPE &&
      type !== USERNAME_SSH_KEY_CREDENTIAL_TYPE
    ) {
      // autogenerate is only possible with username+password and username+ssh
      autogenerate = NO_VALUE;
    }
    setCredentialType(type);
    setAutogenerate(autogenerate);
  };

  const handleCredentialTypeChange = (type, autogenerate) => {
    setCredentialTypeAndAutoGenerate(type, autogenerate);
  };

  const handlePublicKeyChange = file => {
    const reader = new FileReader();
    reader.onload = e => {
      const {result} = e.target;
      if (result.startsWith(PGP_PUBLIC_KEY_LINE)) {
        setPublicKey(result);
      } else {
        setError(_('Not a valid PGP file'));
      }
    };
    reader.readAsText(file);
  };

  const handleErrorClose = () => {
    const {onErrorClose} = props;
    if (isDefined(onErrorClose)) {
      onErrorClose();
    }
    setError(undefined);
  };

  const handleError = e => {
    setError(e.message);
  };

  let cType = credentialType;

  const typeOptions = map(types, type => ({
    label: getCredentialTypeName(type),
    value: type,
  }));

  if (!isDefined(cType)) {
    if (types.includes(USERNAME_PASSWORD_CREDENTIAL_TYPE)) {
      cType = USERNAME_PASSWORD_CREDENTIAL_TYPE;
    } else {
      cType = first(types);
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
    autogenerate,
    credential_type: cType,
    public_key: publicKey,
  };

  return (
    <SaveDialog
      defaultValues={data}
      error={error}
      title={title}
      values={values}
      onClose={onClose}
      onError={handleError}
      onErrorClose={handleErrorClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
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

            <FormGroup title={_('Type')}>
              <Select
                disabled={isEdit}
                items={typeOptions}
                value={state.credential_type}
                onChange={value =>
                  handleCredentialTypeChange(value, state.autogenerate)
                }
              />
            </FormGroup>

            <FormGroup title={_('Allow insecure use')}>
              <YesNoRadio
                name="allow_insecure"
                value={state.allow_insecure}
                onChange={onValueChange}
              />
            </FormGroup>

            {(state.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              state.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE) &&
              !isEdit && (
                <FormGroup title={_('Auto-generate')}>
                  <YesNoRadio
                    name="autogenerate"
                    value={state.autogenerate}
                    onChange={value =>
                      handleCredentialTypeChange(state.credential_type, value)
                    }
                  />
                </FormGroup>
              )}

            {state.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup direction="row" title={_('SNMP Community')}>
                {isEdit && (
                  <Checkbox
                    checked={state.change_community === YES_VALUE}
                    checkedValue={YES_VALUE}
                    name="change_community"
                    title={_('Replace existing SNMP community with')}
                    unCheckedValue={NO_VALUE}
                    onChange={onValueChange}
                  />
                )}
                <PasswordField
                  disabled={state.change_community === NO_VALUE}
                  grow="1"
                  name="community"
                  value={state.community}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {(state.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              state.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
              state.credential_type === SNMP_CREDENTIAL_TYPE) && (
              <FormGroup title={_('Username')}>
                <TextField
                  name="credential_login"
                  value={state.credential_login}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {(state.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              state.credential_type === SNMP_CREDENTIAL_TYPE ||
              state.credential_type === VFIRE_CREDENTIAL_TYPES ||
              state.credential_type === PASSWORD_ONLY_CREDENTIAL_TYPE) && (
              <FormGroup direction="row" title={_('Password')}>
                {isEdit && (
                  <Checkbox
                    checked={state.change_password === YES_VALUE}
                    checkedValue={YES_VALUE}
                    name="change_password"
                    title={_('Replace existing password with')}
                    unCheckedValue={NO_VALUE}
                    onChange={onValueChange}
                  />
                )}
                <PasswordField
                  autoComplete="new-password"
                  disabled={
                    state.autogenerate === YES_VALUE ||
                    state.change_password === NO_VALUE
                  }
                  grow="1"
                  name="password"
                  value={state.password}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {state.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
              <FormGroup direction="row" title={_('Passphrase')}>
                {isEdit && (
                  <Checkbox
                    checked={state.change_passphrase === YES_VALUE}
                    checkedValue={YES_VALUE}
                    name="change_passphrase"
                    title={_('Replace existing passphrase with')}
                    unCheckedValue={NO_VALUE}
                    onChange={onValueChange}
                  />
                )}
                <PasswordField
                  autoComplete="new-password"
                  disabled={
                    state.autogenerate === YES_VALUE ||
                    state.change_passphrase === NO_VALUE
                  }
                  grow="1"
                  name="passphrase"
                  value={state.passphrase}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {state.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup direction="row" title={_('Privacy Password')}>
                {isEdit && (
                  <Checkbox
                    checked={state.change_privacy_password === YES_VALUE}
                    checkedValue={YES_VALUE}
                    name="change_privacy_password"
                    title={_('Replace existing privacy password with')}
                    unCheckedValue={NO_VALUE}
                    onChange={onValueChange}
                  />
                )}
                <PasswordField
                  autoComplete="new-password"
                  disabled={state.change_privacy_password === NO_VALUE}
                  grow="1"
                  name="privacy_password"
                  value={state.privacy_password}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {state.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE && (
              <FormGroup title={_('Private Key')}>
                <FileField name="private_key" onChange={onValueChange} />
              </FormGroup>
            )}

            {state.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup direction="row" title={_('Auth Algorithm')}>
                <Radio
                  checked={state.auth_algorithm === SNMP_AUTH_ALGORITHM_MD5}
                  name="auth_algorithm"
                  title="MD5"
                  value={SNMP_AUTH_ALGORITHM_MD5}
                  onChange={onValueChange}
                />
                <Radio
                  checked={state.auth_algorithm === SNMP_AUTH_ALGORITHM_SHA1}
                  name="auth_algorithm"
                  title="SHA1"
                  value={SNMP_AUTH_ALGORITHM_SHA1}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {state.credential_type === SNMP_CREDENTIAL_TYPE && (
              <FormGroup direction="row" title={_('Privacy Algorithm')}>
                <Radio
                  checked={
                    state.privacy_algorithm === SNMP_PRIVACY_ALGORITHM_AES
                  }
                  name="privacy_algorithm"
                  title="AES"
                  value={SNMP_PRIVACY_ALGORITHM_AES}
                  onChange={onValueChange}
                />
                <Radio
                  checked={
                    state.privacy_algorithm === SNMP_PRIVACY_ALGORITHM_DES
                  }
                  name="privacy_algorithm"
                  title="DES"
                  value={SNMP_PRIVACY_ALGORITHM_DES}
                  onChange={onValueChange}
                />
                <Radio
                  checked={
                    state.privacy_algorithm === SNMP_PRIVACY_ALGORITHM_NONE
                  }
                  name="privacy_algorithm"
                  title={_('None')}
                  value={SNMP_PRIVACY_ALGORITHM_NONE}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {state.credential_type === PGP_CREDENTIAL_TYPE && (
              <FormGroup title={_('PGP Public Key')}>
                <FileField name="public_key" onChange={handlePublicKeyChange} />
              </FormGroup>
            )}

            {state.credential_type === SMIME_CREDENTIAL_TYPE && (
              <FormGroup title={_('S/MIME Certificate')}>
                <FileField name="certificate" onChange={onValueChange} />
              </FormGroup>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

const pwTypes = PropTypes.oneOf(ALL_CREDENTIAL_TYPES);

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
  credential_type: pwTypes,
  name: PropTypes.string,
  passphrase: PropTypes.string,
  password: PropTypes.string,
  privacy_algorithm: PropTypes.oneOf([
    SNMP_PRIVACY_ALGORITHM_AES,
    SNMP_PRIVACY_ALGORITHM_DES,
    SNMP_PRIVACY_ALGORITHM_NONE,
  ]),
  privacy_password: PropTypes.string,
  title: PropTypes.string,
  types: PropTypes.arrayOf(pwTypes),
  onClose: PropTypes.func.isRequired,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default CredentialsDialog;
