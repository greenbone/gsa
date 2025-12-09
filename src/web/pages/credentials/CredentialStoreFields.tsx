/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  type CredentialType,
} from 'gmp/models/credential';
import TagListDisplay from 'web/components/form/TagListDisplay.js';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';

interface CredentialStoreFieldsProps {
  credentialType: CredentialType;
  credentialStore?: {vaultId?: string; hostIdentifier?: string};
  realm?: string;
  kdcs?: string[];
  authAlgorithm?: string;
  privacyAlgorithm?: string;
  privacyHostIdentifier?: string;
}

const CredentialStoreFields = ({
  credentialType,
  credentialStore,
  realm,
  kdcs = [],
  authAlgorithm,
  privacyAlgorithm,
  privacyHostIdentifier,
}: Readonly<CredentialStoreFieldsProps>) => {
  const [_] = useTranslation();

  return (
    <>
      <TableRow>
        <TableData>{_('Vault ID')}</TableData>
        <TableData>{credentialStore?.vaultId}</TableData>
      </TableRow>
      <TableRow>
        <TableData>{_('Host Identifier')}</TableData>
        <TableData>{credentialStore?.hostIdentifier}</TableData>
      </TableRow>
      {/* Show Realm and KDC for Credential Store Kerberos */}
      {credentialType === CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE && (
        <>
          <TableRow>
            <TableData>{_('Realm')}</TableData>
            <TableData>{realm}</TableData>
          </TableRow>
          <TableRow>
            <TableData>{_('Key Distribution Center')}</TableData>
            <TableData>
              <TagListDisplay values={kdcs} />
            </TableData>
          </TableRow>
        </>
      )}
      {/* Show SNMP fields for Credential Store SNMP */}
      {credentialType === CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE && (
        <>
          <TableRow>
            <TableData>{_('Auth Algorithm')}</TableData>
            <TableData>{authAlgorithm}</TableData>
          </TableRow>
          <TableRow>
            <TableData>{_('Privacy Algorithm')}</TableData>
            <TableData>{privacyAlgorithm}</TableData>
          </TableRow>
          <TableRow>
            <TableData>{_('Privacy Host Identifier')}</TableData>
            <TableData>{privacyHostIdentifier}</TableData>
          </TableRow>
        </>
      )}
    </>
  );
};

export default CredentialStoreFields;
