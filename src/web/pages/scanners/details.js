/* Copyright (C) 2017-2022 Greenbone AG
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

import {isDefined} from 'gmp/utils/identity';

import {scannerTypeName, CVE_SCANNER_TYPE} from 'gmp/models/scanner';

import PropTypes from 'web/utils/proptypes';

import DetailsBlock from 'web/entity/block';

import CertInfo from 'web/components/certinfo/certinfo';

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const ScannerDetails = ({entity}) => {
  const {
    comment,
    scannerType,
    host,
    port,
    credential,
    tasks = [],
    configs = [],
  } = entity;
  return (
    <Layout flex="column" grow>
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(comment) && (
            <TableRow>
              <TableData>{_('Comment')}</TableData>
              <TableData>{comment}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Scanner Type')}</TableData>
            <TableData>{scannerTypeName(scannerType)}</TableData>
          </TableRow>

          {!entity.hasUnixSocket() && (
            <TableRow>
              <TableData>{_('Host')}</TableData>
              <TableData>
                {scannerType === CVE_SCANNER_TYPE ? (
                  <span>{_('N/A (Builtin Scanner)')}</span>
                ) : (
                  host
                )}
              </TableData>
            </TableRow>
          )}

          {!entity.hasUnixSocket() && (
            <TableRow>
              <TableData>{_('Port')}</TableData>
              <TableData>
                {scannerType === CVE_SCANNER_TYPE ? (
                  <span>{_('N/A (Builtin Scanner)')}</span>
                ) : (
                  port
                )}
              </TableData>
            </TableRow>
          )}

          {isDefined(credential) && (
            <TableRow>
              <TableData>{_('Credential')}</TableData>
              <TableData>
                <DetailsLink id={credential.id} type="credential">
                  {credential.name}
                </DetailsLink>
              </TableData>
            </TableRow>
          )}

          {tasks.length > 0 && (
            <TableRow>
              <TableDataAlignTop>
                {_('Tasks using this Scanner')}
              </TableDataAlignTop>
              <TableData>
                {tasks.map(task => (
                  <span key={task.id}>
                    <DetailsLink id={task.id} type="task">
                      {task.name}
                    </DetailsLink>
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}

          {configs.length > 0 && (
            <TableRow>
              <TableData>{_('Scan Configs using this Scanner')}</TableData>
              <TableData>
                {configs.map(config => (
                  <span key={config.id}>
                    <DetailsLink id={config.id} type="scanconfig">
                      {config.name}
                    </DetailsLink>
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>

      {!entity.hasUnixSocket() &&
        isDefined(credential) &&
        isDefined(credential.certificate_info) && (
          <DetailsBlock title={_('Client Certificate (from Credential)')}>
            <CertInfo info={credential.certificate_info} />
          </DetailsBlock>
        )}
    </Layout>
  );
};

ScannerDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default ScannerDetails;

// vim: set ts=2 sw=2 tw=80:
