/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  getCredentialTypeName,
  KRB5_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALGORITHM_NONE,
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import Footnote from 'web/components/footnote/Footnote';
import TagListDisplay from 'web/components/form/TagListDisplay.js';
import Divider from 'web/components/layout/Divider';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useFeatures from 'web/hooks/useFeatures';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const CredentialDetails = ({entity}) => {
  const [_] = useTranslation();
  const features = useFeatures();

  const isCredentialStoreType = type => {
    return (
      type === CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE ||
      type === CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
      type === CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE ||
      type === CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE ||
      type === CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE ||
      type === CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE ||
      type === CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE ||
      type === CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE
    );
  };

  const {
    comment,
    credential_type,
    credentialStore,
    kdcs = [],
    realm,
    login,
    auth_algorithm,
    privacy = {
      algorithm: SNMP_PRIVACY_ALGORITHM_NONE,
    },
    targets = [],
    scanners = [],
  } = entity;

  const isCredentialStore =
    features.featureEnabled('ENABLE_CREDENTIAL_STORES') &&
    isCredentialStoreType(credential_type);

  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Type')}</TableData>
            <TableData>
              <Divider>
                <span>{getCredentialTypeName(credential_type)}</span>
                <Footnote>({credential_type})</Footnote>
              </Divider>
            </TableData>
          </TableRow>

          {/* Credential Store specific fields */}
          {isCredentialStore && (
            <>
              <TableRow>
                <TableData>{_('Vault ID')}</TableData>
                <TableData>{credentialStore?.vaultId}</TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Host Identifier')}</TableData>
                <TableData>{credentialStore?.hostIdentifier}</TableData>
              </TableRow>
            </>
          )}

          {/* Traditional credential fields */}
          {!isCredentialStore && (
            <>
              <TableRow>
                <TableData>{_('Login')}</TableData>
                <TableData>{login}</TableData>
              </TableRow>

              {credential_type === SNMP_CREDENTIAL_TYPE && (
                <>
                  <TableRow>
                    <TableData>{_('Auth Algorithm')}</TableData>
                    <TableData>{auth_algorithm}</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>{_('Privacy Algorithm')}</TableData>
                    <TableData>
                      {privacy.algorithm === SNMP_PRIVACY_ALGORITHM_NONE
                        ? _('None')
                        : privacy.algorithm}
                    </TableData>
                  </TableRow>
                </>
              )}

              {credential_type === KRB5_CREDENTIAL_TYPE && (
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
            </>
          )}

          {targets.length > 0 && (
            <TableRow>
              <TableData>{_('Targets using this Credential')}</TableData>
              <TableData>
                <HorizontalSep $wrap>
                  {targets.map(target => {
                    return (
                      <span key={target.id}>
                        <DetailsLink id={target.id} type="target">
                          {target.name}
                        </DetailsLink>
                      </span>
                    );
                  })}
                </HorizontalSep>
              </TableData>
            </TableRow>
          )}

          {scanners.length > 0 && (
            <TableRow>
              <TableData>{_('Scanners using this Credential')}</TableData>
              <TableData>
                <HorizontalSep $wrap>
                  {scanners.map(scanner => {
                    return (
                      <span key={scanner.id}>
                        <DetailsLink id={scanner.id} type="scanner">
                          {scanner.name}
                        </DetailsLink>
                      </span>
                    );
                  })}
                </HorizontalSep>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

CredentialDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default CredentialDetails;
