/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  type default as Credential,
  type CredentialType,
  type SNMPAuthAlgorithmType,
  type SNMPPrivacyAlgorithmType,
  CERTIFICATE_CREDENTIAL_TYPE,
  getCredentialTypeName,
  KRB5_CREDENTIAL_TYPE,
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
} from 'gmp/models/credential';
import {parseBoolean} from 'gmp/parser';
import {first, map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import MultiValueTextField from 'web/components/form/MultiValueTextField';
import PasswordField from 'web/components/form/PasswordField';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import useCredentialStore, {
  isCredentialStoreType,
} from 'web/hooks/useCredentialStore';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import CredentialStoreDialogFields from 'web/pages/credentials/CredentialStoreDialogFields';

interface CredentialDialogValues {
  autogenerate: boolean;
  certificate?: File;
  credentialType: CredentialType;
  hostIdentifier?: string;
  privateKey?: File;
  privacyHostIdentifier?: string;
  publicKey?: File;
  vaultId?: string;
}

interface CredentialDialogDefaultValues {
  authAlgorithm?: SNMPAuthAlgorithmType;
  comment?: string;
  community?: string;
  credentialLogin?: string;
  hostIdentifier?: string;
  id?: string;
  kdcs?: string[];
  name: string;
  passphrase?: string;
  password?: string;
  privacyAlgorithm?: SNMPPrivacyAlgorithmType;
  privacyHostIdentifier?: string;
  privacyPassword?: string;
  realm?: string;
  vaultId?: string;
}

export type CredentialDialogState = CredentialDialogValues &
  CredentialDialogDefaultValues;

interface CredentialDialogProps {
  authAlgorithm?: SNMPAuthAlgorithmType;
  autogenerate?: boolean;
  comment?: string;
  community?: string;
  credential?: Credential;
  credentialLogin?: string;
  credentialType?: CredentialType;
  name?: string;
  passphrase?: string;
  password?: string;
  privacyAlgorithm?: SNMPPrivacyAlgorithmType;
  privacyHostIdentifier?: string;
  privacyPassword?: string;
  title?: string;
  types?: readonly CredentialType[];
  vaultId?: string;
  hostIdentifier?: string;
  onClose?: () => void;
  onErrorClose?: () => void;
  onSave?: (state: CredentialDialogState) => Promise<void> | void;
}

const validateFile = async (
  file: File,
  line: string | RegExp,
  errorMessage: string,
) => {
  const content = await file.text();
  if (!isString(content)) {
    throw new Error(errorMessage);
  }
  if (isString(line) && !content.startsWith(line)) {
    throw new Error(errorMessage);
  }
  if (line instanceof RegExp && !line.test(content)) {
    throw new Error(errorMessage);
  }
};

const PGP_PUBLIC_KEY_LINE = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
const CLIENT_CERTIFICATE_LINE = '-----BEGIN CERTIFICATE-----';
const CLIENT_PRIVATE_KEY_LINE = '-----BEGIN PRIVATE KEY-----';
const SSH_KEY_REGEX = /-----BEGIN \w+ PRIVATE KEY-----/;

const CredentialDialog = ({
  authAlgorithm = SNMP_AUTH_ALGORITHM_SHA1,
  autogenerate: initialAutogenerate = false,
  comment = '',
  community,
  credential,
  credentialLogin,
  credentialType: initialCredentialType,
  hostIdentifier,
  name,
  passphrase,
  password,
  privacyAlgorithm = SNMP_PRIVACY_ALGORITHM_AES,
  privacyHostIdentifier,
  privacyPassword,
  title,
  types = [],
  vaultId,
  onClose,
  onErrorClose,
  onSave,
}: CredentialDialogProps) => {
  const [_] = useTranslation();

  title = title ?? _('New Credential');
  name = name ?? _('Unnamed');

  const [credentialType, setCredentialType] = useState<
    CredentialType | undefined
  >(initialCredentialType);
  const [autogenerate, setAutogenerate] = useState<boolean>(
    initialAutogenerate &&
      (initialCredentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
        initialCredentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE),
  );
  const [error, setError] = useState<string | undefined>();
  const [certificate, setCertificate] = useState<File | undefined>(undefined);
  const [privateKey, setPrivateKey] = useState<File | undefined>(undefined);
  const [publicKey, setPublicKey] = useState<File | undefined>(undefined);
  const [changeCommunity, setChangeCommunity] = useState<boolean>(false);
  const [changePassphrase, setChangePassphrase] = useState<boolean>(false);
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [changePrivacyPassword, setChangePrivacyPassword] =
    useState<boolean>(false);

  const isEdit = isDefined(credential);

  const setCredentialTypeAndAutoGenerate = (
    type: CredentialType | undefined,
    autogenerate: boolean = false,
  ) => {
    if (
      type !== USERNAME_PASSWORD_CREDENTIAL_TYPE &&
      type !== USERNAME_SSH_KEY_CREDENTIAL_TYPE
    ) {
      // autogenerate is only possible with username+password and username+ssh
      autogenerate = false;
    }
    setCredentialType(type);
    setAutogenerate(autogenerate);
  };

  const handlePublicGPGKeyChange = async (file: File | undefined) => {
    try {
      if (isDefined(file)) {
        await validateFile(
          file,
          PGP_PUBLIC_KEY_LINE,
          _('Not a valid PGP file'),
        );
      }
      setPublicKey(file);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleClientCertificateChange = async (file: File | undefined) => {
    try {
      if (isDefined(file)) {
        await validateFile(
          file,
          CLIENT_CERTIFICATE_LINE,
          _('Not a valid Client Certificate file'),
        );
      }
      setCertificate(file);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleCertificateChange = (file: File | undefined) => {
    setCertificate(file);
  };

  const handleClientKeyChange = async (file: File | undefined) => {
    try {
      if (isDefined(file)) {
        await validateFile(
          file,
          CLIENT_PRIVATE_KEY_LINE,
          _('Not a valid Client Private Key file'),
        );
      }
      setPrivateKey(file);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handlePrivateKeyChange = async (file: File | undefined) => {
    try {
      if (isDefined(file)) {
        await validateFile(
          file,
          SSH_KEY_REGEX,
          _('Not a valid Private SSH Key file'),
        );
      }
      setPrivateKey(file);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleErrorClose = () => {
    if (isDefined(onErrorClose)) {
      onErrorClose();
    }
    setError(undefined);
  };

  const handleError = (e: Error) => {
    setError(e.message);
  };

  const validateKdc = (val: string) => {
    const invalid = !val.includes(' ');
    if (!invalid) {
      setError(_('Invalid kdc value(s)'));
    }
    return invalid;
  };

  const gmp = useGmp();
  const features = useFeatures();

  const enabledTypes = types.filter(type => {
    return !(
      (type === KRB5_CREDENTIAL_TYPE && !gmp.settings.enableKrb5) ||
      (isCredentialStoreType(type) &&
        !features.featureEnabled('ENABLE_CREDENTIAL_STORES'))
    );
  });

  const typeOptions = map(enabledTypes, type => ({
    label: getCredentialTypeName(type),
    value: type,
  }));

  let cType = credentialType;

  if (!isDefined(cType)) {
    if (types.includes(USERNAME_PASSWORD_CREDENTIAL_TYPE)) {
      cType = USERNAME_PASSWORD_CREDENTIAL_TYPE;
    } else {
      cType = first(types as CredentialType[]);
    }
  }

  const isCredentialStoreEnabled = useCredentialStore(cType as CredentialType);

  return (
    <SaveDialog<CredentialDialogValues, CredentialDialogDefaultValues>
      defaultValues={{
        authAlgorithm,
        comment,
        community,
        credentialLogin,
        name,
        passphrase,
        password,
        privacyAlgorithm,
        privacyHostIdentifier,
        privacyPassword,
        id: credential?.id,
        kdcs: credential?.kdcs,
        realm: credential?.realm,
        vaultId,
        hostIdentifier,
      }}
      error={error}
      title={title}
      values={{
        autogenerate,
        credentialType: cType as CredentialType,
        publicKey,
        privateKey,
        certificate,
      }}
      onClose={onClose}
      onError={handleError}
      onErrorClose={handleErrorClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <TextField
              name="name"
              title={_('Name')}
              value={state.name}
              onChange={onValueChange}
            />

            <TextField
              name="comment"
              title={_('Comment')}
              value={state.comment}
              onChange={onValueChange}
            />

            <Select
              disabled={isEdit || types.length < 2}
              items={typeOptions}
              label={_('Type')}
              value={state.credentialType}
              onChange={value =>
                setCredentialTypeAndAutoGenerate(
                  value as CredentialType,
                  state.autogenerate,
                )
              }
            />

            {isCredentialStoreEnabled && (
              <CredentialStoreDialogFields
                authAlgorithm={state.authAlgorithm}
                credentialType={state.credentialType}
                hostIdentifier={state.hostIdentifier}
                kdcs={state.kdcs}
                privacyAlgorithm={state.privacyAlgorithm}
                privacyHostIdentifier={state.privacyHostIdentifier}
                realm={state.realm}
                validateKdc={validateKdc}
                vaultId={state.vaultId}
                onValueChange={(value, name) =>
                  onValueChange(
                    value as string | boolean | string[] | File | undefined,
                    name,
                  )
                }
              />
            )}

            {(state.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              state.credentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE) &&
              !isEdit && (
                <FormGroup title={_('Auto-generate')}>
                  <YesNoRadio<boolean>
                    convert={parseBoolean}
                    name="autogenerate"
                    noValue={false}
                    value={state.autogenerate}
                    yesValue={true}
                    onChange={value =>
                      setCredentialTypeAndAutoGenerate(
                        state.credentialType,
                        value,
                      )
                    }
                  />
                </FormGroup>
              )}

            {state.credentialType === SNMP_CREDENTIAL_TYPE && (
              <FormGroup direction="row" title={_('SNMP Community')}>
                {isEdit && (
                  <Checkbox<boolean>
                    checked={changeCommunity}
                    checkedValue={true}
                    name="changeCommunity"
                    title={_('Replace existing SNMP community with')}
                    unCheckedValue={false}
                    onChange={value => setChangeCommunity(value)}
                  />
                )}
                <PasswordField
                  disabled={isEdit && changeCommunity}
                  grow="1"
                  name="community"
                  value={state.community}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {(state.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              state.credentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
              state.credentialType === SNMP_CREDENTIAL_TYPE ||
              state.credentialType === KRB5_CREDENTIAL_TYPE) && (
              <TextField
                name="credentialLogin"
                title={_('Username')}
                value={state.credentialLogin}
                onChange={onValueChange}
              />
            )}

            {(state.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE ||
              state.credentialType === SNMP_CREDENTIAL_TYPE ||
              state.credentialType === KRB5_CREDENTIAL_TYPE ||
              state.credentialType === PASSWORD_ONLY_CREDENTIAL_TYPE) && (
              <FormGroup direction="row" title={_('Password')}>
                {isEdit && (
                  <Checkbox<boolean>
                    checked={changePassword}
                    checkedValue={true}
                    name="changePassword"
                    title={_('Replace existing password with')}
                    unCheckedValue={false}
                    onChange={value => setChangePassword(value)}
                  />
                )}
                <PasswordField
                  autoComplete="new-password"
                  disabled={state.autogenerate || (isEdit && !changePassword)}
                  grow="1"
                  name="password"
                  value={state.password}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {state.credentialType === CERTIFICATE_CREDENTIAL_TYPE && (
              <FileField
                name="certificate"
                title={_('Client Certificate')}
                value={state.certificate}
                onChange={handleClientCertificateChange}
              />
            )}

            {(state.credentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
              state.credentialType === CERTIFICATE_CREDENTIAL_TYPE) && (
              <>
                <FileField
                  name="privateKey"
                  title={
                    state.credentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE
                      ? _('Private SSH Key')
                      : _('Client Private Key')
                  }
                  value={state.privateKey}
                  onChange={
                    state.credentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE
                      ? handlePrivateKeyChange
                      : handleClientKeyChange
                  }
                />

                <FormGroup
                  direction="row"
                  title={
                    state.credentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE
                      ? _('Passphrase for Private SSH Key')
                      : _('Passphrase for Client Private Key')
                  }
                >
                  {isEdit && (
                    <Checkbox<boolean>
                      checked={changePassphrase}
                      checkedValue={true}
                      name="changePassphrase"
                      title={_('Replace existing passphrase with')}
                      unCheckedValue={false}
                      onChange={value => setChangePassphrase(value)}
                    />
                  )}
                  <PasswordField
                    autoComplete="new-password"
                    disabled={
                      (state.autogenerate &&
                        state.credentialType !== CERTIFICATE_CREDENTIAL_TYPE) ||
                      (isEdit && !changePassphrase)
                    }
                    grow="1"
                    name="passphrase"
                    value={state.passphrase}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </>
            )}

            {state.credentialType === SNMP_CREDENTIAL_TYPE && (
              <>
                <FormGroup direction="row" title={_('Privacy Password')}>
                  {isEdit && (
                    <Checkbox<boolean>
                      checked={changePrivacyPassword}
                      checkedValue={true}
                      name="changePrivacyPassword"
                      title={_('Replace existing privacy password with')}
                      unCheckedValue={false}
                      onChange={value => setChangePrivacyPassword(value)}
                    />
                  )}
                  <PasswordField
                    autoComplete="new-password"
                    disabled={
                      state.autogenerate || (isEdit && !changePrivacyPassword)
                    }
                    grow="1"
                    name="privacyPassword"
                    value={state.privacyPassword}
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup direction="row" title={_('Auth Algorithm')}>
                  <Radio
                    checked={state.authAlgorithm === SNMP_AUTH_ALGORITHM_MD5}
                    name="authAlgorithm"
                    title="MD5"
                    value={SNMP_AUTH_ALGORITHM_MD5}
                    onChange={onValueChange}
                  />
                  <Radio
                    checked={state.authAlgorithm === SNMP_AUTH_ALGORITHM_SHA1}
                    name="authAlgorithm"
                    title="SHA1"
                    value={SNMP_AUTH_ALGORITHM_SHA1}
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup direction="row" title={_('Privacy Algorithm')}>
                  <Radio
                    checked={
                      state.privacyAlgorithm === SNMP_PRIVACY_ALGORITHM_AES
                    }
                    name="privacyAlgorithm"
                    title="AES"
                    value={SNMP_PRIVACY_ALGORITHM_AES}
                    onChange={onValueChange}
                  />
                  <Radio
                    checked={
                      state.privacyAlgorithm === SNMP_PRIVACY_ALGORITHM_DES
                    }
                    name="privacyAlgorithm"
                    title="DES"
                    value={SNMP_PRIVACY_ALGORITHM_DES}
                    onChange={onValueChange}
                  />
                  <Radio
                    checked={
                      state.privacyAlgorithm === SNMP_PRIVACY_ALGORITHM_NONE
                    }
                    name="privacyAlgorithm"
                    title={_('None')}
                    value={SNMP_PRIVACY_ALGORITHM_NONE}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </>
            )}

            {state.credentialType === PGP_CREDENTIAL_TYPE && (
              <FileField
                name="publicKey"
                title={_('Public PGP Key')}
                value={state.publicKey}
                onChange={handlePublicGPGKeyChange}
              />
            )}

            {state.credentialType === SMIME_CREDENTIAL_TYPE && (
              <FileField
                name="certificate"
                title={_('S/MIME Certificate')}
                onChange={handleCertificateChange}
              />
            )}

            {state.credentialType === KRB5_CREDENTIAL_TYPE && (
              <>
                <TextField
                  name="realm"
                  title={_('Realm')}
                  value={state.realm}
                  onChange={onValueChange}
                />
                <MultiValueTextField
                  name="kdcs"
                  placeholder={_(
                    'Enter hostname or IP address, then press Enter to add KDC',
                  )}
                  title={_('Key Distribution Center')}
                  validate={validateKdc}
                  value={state.kdcs}
                  onChange={onValueChange}
                />
              </>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

export default CredentialDialog;
