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

import {isDefined} from 'gmp/utils/identity';

import {
  scannerTypeName,
  CVE_SCANNER_TYPE,
  OSP_SCANNER_TYPE,
  PARAM_TYPE_SELECTION,
  PARAM_TYPE_BOOLEAN,
} from 'gmp/models/scanner';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

import DetailsBlock from 'web/entity/block';

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import DateTime from 'web/components/date/datetime';
import InfoTable from 'web/components/table/infotable';
import SimpleTable from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const CertInfo = ({info}) => {
  const {activationTime, expirationTime, issuer, md5_fingerprint} = info;
  return (
    <InfoTable>
      <colgroup>
        <Col width="10%" />
        <Col width="90%" />
      </colgroup>
      <TableBody>
        <TableRow>
          <TableData>{_('Activation')}</TableData>
          <TableData>
            {isDefined(activationTime) ? (
              <DateTime date={activationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>{_('Expiration')}</TableData>
          <TableData>
            {isDefined(expirationTime) ? (
              <DateTime date={expirationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>{_('MD5 Fingerprint')}</TableData>
          <TableData>{md5_fingerprint}</TableData>
        </TableRow>

        <TableRow>
          <TableData>{_('Issuer')}</TableData>
          <TableData>{issuer}</TableData>
        </TableRow>
      </TableBody>
    </InfoTable>
  );
};

CertInfo.propTypes = {
  info: PropTypes.object.isRequired,
};

const OspScannerDetails = ({info}) => {
  const {scanner, daemon, protocol, description, params = []} = info;
  if (isDefined(scanner.name)) {
    return (
      <div>
        <DetailsBlock title={_('OSP Scanner Details')}>
          <InfoTable>
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              <TableRow>
                <TableData>{_('Scanner Name')}</TableData>
                <TableData>{scanner.name}</TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('Scanner Version')}</TableData>
                <TableData>{scanner.version}</TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('OSP Daemon')}</TableData>
                <TableData>
                  <span>
                    {daemon.name} {daemon.version}
                  </span>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('Protocol')}</TableData>
                <TableData>
                  <span>
                    {protocol.name} {protocol.version}
                  </span>
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>

        <DetailsBlock title={_('Description')}>
          <pre>{description}</pre>
        </DetailsBlock>

        <DetailsBlock title={_('Scanner Parameters')}>
          <SimpleTable>
            <TableHeader>
              <TableRow>
                <TableHead>{_('Name')}</TableHead>
                <TableHead>{_('Description')}</TableHead>
                <TableHead>{_('Type')}</TableHead>
                <TableHead>{_('Default')}</TableHead>
                <TableHead>{_('Mandatory')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {params.map(param => {
                const {param_type} = param;
                let {default: def} = param;
                if (param_type === PARAM_TYPE_SELECTION) {
                  def = _('List');
                } else if (param_type === PARAM_TYPE_BOOLEAN) {
                  def = renderYesNo(def);
                }
                return (
                  <TableRow key={param.name}>
                    <TableData>{param.name}</TableData>
                    <TableData>{param.description}</TableData>
                    <TableData>{param_type}</TableData>
                    <TableData>{def}</TableData>
                    <TableData>{renderYesNo(param.mandatory)}</TableData>
                  </TableRow>
                );
              })}
            </TableBody>
          </SimpleTable>
        </DetailsBlock>
      </div>
    );
  }
  return <h2>{_('OSP Scanner is offline')}</h2>;
};

OspScannerDetails.propTypes = {
  info: PropTypes.object.isRequired,
};

const ScannerDetails = ({entity}) => {
  const {
    comment,
    scannerType,
    host,
    port,
    credential,
    tasks = [],
    configs = [],
    info,
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

      {scannerType === OSP_SCANNER_TYPE && isDefined(info) && (
        <OspScannerDetails info={info} />
      )}

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
