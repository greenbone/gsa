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
import React from 'react';

import _ from 'gmp/locale';

import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALOGRITHM_NONE,
  getCredentialTypeName,
} from 'gmp/models/credential';

import Footnote from 'web/components/footnote/footnote';

import Divider from 'web/components/layout/divider';
import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
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
    <Layout flex="column" grow>
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

          {credential_type !== CLIENT_CERTIFICATE_CREDENTIAL_TYPE && (
            <TableRow>
              <TableData>{_('Login')}</TableData>
              <TableData>{login}</TableData>
            </TableRow>
          )}
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
                <HorizontalSep wrap>
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
                <HorizontalSep wrap>
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

// vim: set ts=2 sw=2 tw=80:
