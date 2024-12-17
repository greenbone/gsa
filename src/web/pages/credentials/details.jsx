/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {
  SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALOGRITHM_NONE,
  getCredentialTypeName,
} from 'gmp/models/credential';
import React from 'react';
import Footnote from 'web/components/footnote/footnote';
import Divider from 'web/components/layout/divider';
import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import {Col} from 'web/entity/page';
import PropTypes from 'web/utils/proptypes';

const CredentialDetails = ({entity}) => {
  const {
    comment,
    credential_type,
    login,
    auth_algorithm,
    privacy = {
      algorithm: SNMP_PRIVACY_ALOGRITHM_NONE,
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
                {privacy.algorithm === SNMP_PRIVACY_ALOGRITHM_NONE
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
                  {targets.map(target => (
                    <span key={target.id}>
                      <DetailsLink id={target.id} type="target">
                        {target.name}
                      </DetailsLink>
                    </span>
                  ))}
                </HorizontalSep>
              </TableData>
            </TableRow>
          )}

          {scanners.length > 0 && (
            <TableRow>
              <TableData>{_('Scanners using this Credential')}</TableData>
              <TableData>
                <HorizontalSep $wrap>
                  {scanners.map(scanner => (
                    <span key={scanner.id}>
                      <DetailsLink id={scanner.id} type="scanner">
                        {scanner.name}
                      </DetailsLink>
                    </span>
                  ))}
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
