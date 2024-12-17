/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {scannerTypeName, CVE_SCANNER_TYPE} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import CertInfo from 'web/components/certinfo/certinfo';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import DetailsBlock from 'web/entity/block';
import {Col} from 'web/entity/page';
import PropTypes from 'web/utils/proptypes';

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
    <Layout grow flex="column">
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
