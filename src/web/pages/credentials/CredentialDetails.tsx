/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Credential,
  getCredentialTypeName,
  KRB5_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALGORITHM_NONE,
  type CredentialType,
} from 'gmp/models/credential';
import Footnote from 'web/components/footnote/Footnote';
import TagListDisplay from 'web/components/form/TagListDisplay.js';
import Divider from 'web/components/layout/Divider';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useCredentialStore from 'web/hooks/useCredentialStore';
import useTranslation from 'web/hooks/useTranslation';
import CredentialDetailsColGroup from 'web/pages/credentials/CredentialDetailsColGroup';
import CredentialStoreFields from 'web/pages/credentials/CredentialStoreFields';

interface CredentialDetailsProps {
  entity: Credential;
}

const CredentialDetails = ({entity}: CredentialDetailsProps) => {
  const [_] = useTranslation();
  // useCredentialStore hook encapsulates feature flag and type logic

  const {
    authAlgorithm,
    comment,
    credentialStore,
    kdcs = [],
    login,
    privacyAlgorithm,
    realm,
    scanners = [],
    targets = [],
  } = entity;

  const credentialType = entity.credentialType as CredentialType;

  const isCredentialStore = useCredentialStore(credentialType);

  return (
    <Layout grow flex="column">
      <InfoTable size="full">
        <CredentialDetailsColGroup />
        <TableBody>
          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Type')}</TableData>
            <TableData>
              <Divider>
                <span>{getCredentialTypeName(credentialType)}</span>
                <Footnote>({credentialType})</Footnote>
              </Divider>
            </TableData>
          </TableRow>

          {/* Credential Store specific fields */}
          {isCredentialStore && (
            <CredentialStoreFields
              authAlgorithm={authAlgorithm}
              credentialStore={credentialStore}
              credentialType={credentialType}
              kdcs={kdcs}
              privacyAlgorithm={privacyAlgorithm}
              privacyHostIdentifier={entity.privacyHostIdentifier}
              realm={realm}
            />
          )}

          {/* Traditional credential fields */}
          {!isCredentialStore && (
            <>
              <TableRow>
                <TableData>{_('Login')}</TableData>
                <TableData>{login}</TableData>
              </TableRow>

              {credentialType === SNMP_CREDENTIAL_TYPE && (
                <>
                  <TableRow>
                    <TableData>{_('Auth Algorithm')}</TableData>
                    <TableData>{authAlgorithm}</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>{_('Privacy Algorithm')}</TableData>
                    <TableData>
                      {privacyAlgorithm === SNMP_PRIVACY_ALGORITHM_NONE
                        ? _('None')
                        : privacyAlgorithm}
                    </TableData>
                  </TableRow>
                </>
              )}

              {credentialType === KRB5_CREDENTIAL_TYPE && (
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
                        <DetailsLink id={target.id as string} type="target">
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
                        <DetailsLink id={scanner.id as string} type="scanner">
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

export default CredentialDetails;
