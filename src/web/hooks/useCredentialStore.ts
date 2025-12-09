/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  type CredentialType,
} from 'gmp/models/credential';
import useFeatures from 'web/hooks/useFeatures';

/**
 * Helper function to check if a credential type is a credential store type.
 */
export const isCredentialStoreType = (type: CredentialType) =>
  type === CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE ||
  type === CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
  type === CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE ||
  type === CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE ||
  type === CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE ||
  type === CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE ||
  type === CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE ||
  type === CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE;

/**
 * Custom hook to determine if a credential is a credential store type and if the feature is enabled.
 */
const useCredentialStore = (credentialType: CredentialType): boolean => {
  const features = useFeatures();

  return (
    features.featureEnabled('ENABLE_CREDENTIAL_STORES') &&
    isCredentialStoreType(credentialType)
  );
};

export default useCredentialStore;
