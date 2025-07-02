/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {scannerTypeName, CVE_SCANNER_TYPE} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import CertInfo from 'web/components/certinfo/CertInfo';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/Block';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ScannerDetails = ({entity}) => {
  const [_] = useTranslation();
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
                {tasks.map(task => {
                  return (
                    <span key={task.id}>
                      <DetailsLink id={task.id} type="task">
                        {task.name}
                      </DetailsLink>
                    </span>
                  );
                })}
              </TableData>
            </TableRow>
          )}

          {configs.length > 0 && (
            <TableRow>
              <TableData>{_('Scan Configs using this Scanner')}</TableData>
              <TableData>
                {configs.map(config => {
                  return (
                    <span key={config.id}>
                      <DetailsLink id={config.id} type="scanconfig">
                        {config.name}
                      </DetailsLink>
                    </span>
                  );
                })}
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
