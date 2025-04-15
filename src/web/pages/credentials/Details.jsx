/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALGORITHM_NONE,
  getCredentialTypeName,
} from 'gmp/models/credential';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import Footnote from 'web/components/footnote/Footnote';
import Divider from 'web/components/layout/Divider';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import PropTypes from 'web/utils/PropTypes';

const CredentialDetails = ({entity}) => {
  const [_] = useTranslation();
  const {
    comment,
    credential_type,
    login,
    auth_algorithm,
    privacy = {
      algorithm: SNMP_PRIVACY_ALGORITHM_NONE,
    },
    targets = [],
    scanners = [],
  } = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
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

          <TableRow>
            <TableData>{_('Allow Insecure Use')}</TableData>
            <TableData>
              {entity.isAllowInsecure() ? _('Yes') : _('No')}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Login')}</TableData>
            <TableData>{login}</TableData>
          </TableRow>
          {credential_type === SNMP_CREDENTIAL_TYPE && (
            <TableRow>
              <TableData>{_('Auth Algorithm')}</TableData>
              <TableData>{auth_algorithm}</TableData>
            </TableRow>
          )}
          {credential_type === SNMP_CREDENTIAL_TYPE && (
            <TableRow>
              <TableData>{_('Privacy Algorithm')}</TableData>
              <TableData>
                {privacy.algorithm === SNMP_PRIVACY_ALGORITHM_NONE
                  ? _('None')
                  : privacy.algorithm}
              </TableData>
            </TableRow>
          )}

          {targets.length > 0 && (
            <TableRow>
              <TableData>{_('Targets using this Credential')}</TableData>
              <TableData>
                <HorizontalSep $wrap>
                  {targets.map(target => {
                    const [_] = useTranslation();

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
                    const [_] = useTranslation();

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
