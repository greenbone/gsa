/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALGORITHM_AES,
  SNMP_PRIVACY_ALGORITHM_DES,
  SNMP_PRIVACY_ALGORITHM_NONE,
  SNMP_AUTH_ALGORITHM_MD5,
  SNMP_AUTH_ALGORITHM_SHA1,
  type CredentialType,
  type SNMPAuthAlgorithmType,
  type SNMPPrivacyAlgorithmType,
} from 'gmp/models/credential';
import FormGroup from 'web/components/form/FormGroup';
import MultiValueTextField from 'web/components/form/MultiValueTextField';
import Radio from 'web/components/form/Radio';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';

interface CredentialStoreDialogFieldsProps {
  credentialType: CredentialType;
  vaultId?: string;
  hostIdentifier?: string;
  realm?: string;
  kdcs?: string[];
  privacyHostIdentifier?: string;
  privacyAlgorithm?: SNMPPrivacyAlgorithmType;
  authAlgorithm?: SNMPAuthAlgorithmType;
  onValueChange: (value: unknown, name?: string) => void;
  validateKdc: (val: string) => boolean;
}

const CredentialStoreDialogFields = ({
  credentialType,
  vaultId,
  hostIdentifier,
  realm,
  kdcs = [],
  privacyHostIdentifier,
  privacyAlgorithm,
  authAlgorithm,
  onValueChange,
  validateKdc,
}: Readonly<CredentialStoreDialogFieldsProps>) => {
  const [_] = useTranslation();

  return (
    <>
      <TextField
        name="vaultId"
        title={_('Vault ID')}
        value={vaultId}
        onChange={onValueChange}
      />
      <TextField
        name="hostIdentifier"
        title={_('Host Identifier')}
        value={hostIdentifier}
        onChange={onValueChange}
      />
      {credentialType === CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE && (
        <>
          <TextField
            name="realm"
            title={_('Realm')}
            value={realm}
            onChange={onValueChange}
          />
          <MultiValueTextField
            name="kdcs"
            placeholder={_(
              'Enter hostname or IP address, then press Enter to add KDC',
            )}
            title={_('Key Distribution Center')}
            validate={validateKdc}
            value={kdcs}
            onChange={(value, name) => onValueChange(value, name ?? 'kdcs')}
          />
        </>
      )}
      {credentialType === CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE && (
        <>
          <TextField
            name="privacyHostIdentifier"
            title={_('Privacy Host Identifier')}
            value={privacyHostIdentifier}
            onChange={onValueChange}
          />
          <FormGroup direction="row" title={_('Privacy Algorithm')}>
            <Radio
              checked={privacyAlgorithm === SNMP_PRIVACY_ALGORITHM_AES}
              name="privacyAlgorithm"
              title="AES"
              value={SNMP_PRIVACY_ALGORITHM_AES}
              onChange={onValueChange}
            />
            <Radio
              checked={privacyAlgorithm === SNMP_PRIVACY_ALGORITHM_DES}
              name="privacyAlgorithm"
              title="DES"
              value={SNMP_PRIVACY_ALGORITHM_DES}
              onChange={onValueChange}
            />
            <Radio
              checked={privacyAlgorithm === SNMP_PRIVACY_ALGORITHM_NONE}
              name="privacyAlgorithm"
              title={_('None')}
              value={SNMP_PRIVACY_ALGORITHM_NONE}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup direction="row" title={_('Auth Algorithm')}>
            <Radio
              checked={authAlgorithm === SNMP_AUTH_ALGORITHM_MD5}
              name="authAlgorithm"
              title="MD5"
              value={SNMP_AUTH_ALGORITHM_MD5}
              onChange={onValueChange}
            />
            <Radio
              checked={authAlgorithm === SNMP_AUTH_ALGORITHM_SHA1}
              name="authAlgorithm"
              title="SHA1"
              value={SNMP_AUTH_ALGORITHM_SHA1}
              onChange={onValueChange}
            />
          </FormGroup>
        </>
      )}
    </>
  );
};

export default CredentialStoreDialogFields;
