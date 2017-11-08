/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';

import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALOGRITHM_NONE,
} from 'gmp/models/credential.js';

import PropTypes from '../../utils/proptypes.js';

import Footnote from '../../components/footnote/footnote.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const CredentialDetails = ({
  entity,
}) => {
  const {
    comment,
    credential_type,
    full_type,
    login,
    auth_algorithm,
    privacy = {
      algorithm: SNMP_PRIVACY_ALOGRITHM_NONE,
    },
  } = entity;
  return (
    <Layout
      flex="column"
      grow
    >
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Comment')}
            </TableData>
            <TableData>
              {comment}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Type')}
            </TableData>
            <TableData>
              <Divider>
                <span>
                  {credential_type}
                </span>
                <Footnote>
                  ({full_type})
                </Footnote>
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Allow Insecure Use')}
            </TableData>
            <TableData>
              {entity.isAllowInsecure() ? _('Yes') : _('No')}
            </TableData>
          </TableRow>

          {credential_type !== CLIENT_CERTIFICATE_CREDENTIAL_TYPE &&
            <TableRow>
              <TableData>
                {_('Login')}
              </TableData>
              <TableData>
                {login}
              </TableData>
            </TableRow>
          }
          {credential_type === SNMP_CREDENTIAL_TYPE &&
            <TableRow>
              <TableData>
                {_('Auth Algorithm')}
              </TableData>
              <TableData>
                {auth_algorithm}
              </TableData>
            </TableRow>
          }
          {credential_type === SNMP_CREDENTIAL_TYPE &&
            <TableRow>
              <TableData>
                {_('Privacy Algorithm')}
              </TableData>
              <TableData>
                {privacy.algorithm === SNMP_PRIVACY_ALOGRITHM_NONE ?
                  _('None') :
                  privacy.algorithm
                }
              </TableData>
            </TableRow>
          }
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
