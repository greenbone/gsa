/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';
import {dateTimeWithTimeZone} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import {
  scannerTypeName,
  CVE_SCANNER_TYPE,
  OSP_SCANNER_TYPE,
  PARAM_TYPE_OVALDEF_FILE,
  PARAM_TYPE_SELECTION,
  PARAM_TYPE_BOOLEAN,
} from 'gmp/models/scanner';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

import DetailsBlock from 'web/entity/block';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import SimpleTable from 'web/components/table/simpletable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const CertInfo = ({
  info,
}) => {
  const {
    activationTime,
    expirationTime,
    issuer,
    md5_fingerprint,
  } = info;
  return (
    <InfoTable>
      <colgroup>
        <Col width="10%"/>
        <Col width="90%"/>
      </colgroup>
      <TableBody>
        <TableRow>
          <TableData>
            {_('Activation')}
          </TableData>
          <TableData>
            {dateTimeWithTimeZone(activationTime)}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>
            {_('Expiration')}
          </TableData>
          <TableData>
            {dateTimeWithTimeZone(expirationTime)}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>
            {_('MD5 Fingerprint')}
          </TableData>
          <TableData>
            {md5_fingerprint}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>
            {_('Issuer')}
          </TableData>
          <TableData>
            {issuer}
          </TableData>
        </TableRow>
      </TableBody>
    </InfoTable>
  );
};

CertInfo.propTypes = {
  info: PropTypes.object.isRequired,
};

const OspScannerDetails = ({
  info,
}) => {
  const {
    scanner,
    daemon,
    protocol,
    description,
    params = [],
  } = info;
  if (isDefined(scanner.name)) {
    return (
      <div>
        <DetailsBlock
          title={_('OSP Scanner Details')}
        >
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Scanner Name')}
                </TableData>
                <TableData>
                  {scanner.name}
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('Scanner Version')}
                </TableData>
                <TableData>
                  {scanner.version}
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('OSP Daemon')}
                </TableData>
                <TableData>
                  <span>{daemon.name} {daemon.version}</span>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('Protocol')}
                </TableData>
                <TableData>
                  <span>{protocol.name} {protocol.version}</span>
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>

        <DetailsBlock
          title={_('Description')}
        >
          <pre>{description}</pre>
        </DetailsBlock>

        <DetailsBlock
          title={_('Scanner Parameters')}
        >
          <SimpleTable>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Name')}
                </TableHead>
                <TableHead>
                  {_('Description')}
                </TableHead>
                <TableHead>
                  {_('Type')}
                </TableHead>
                <TableHead>
                  {_('Default')}
                </TableHead>
                <TableHead>
                  {_('Mandatory')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {params.map(param => {
                const {param_type} = param;
                let {default: def} = param;
                if (param_type === PARAM_TYPE_OVALDEF_FILE) {
                  def = _('OVAL Definitions File List');
                }
                else if (param_type === PARAM_TYPE_SELECTION) {
                  def = _('List');
                }
                else if (param_type === PARAM_TYPE_BOOLEAN) {
                  def = renderYesNo(def);
                }
                return (
                  <TableRow
                    key={param.name}
                  >
                    <TableData>
                      {param.name}
                    </TableData>
                    <TableData>
                      {param.description}
                    </TableData>
                    <TableData>
                      {param_type}
                    </TableData>
                    <TableData>
                      {def}
                    </TableData>
                    <TableData>
                      {renderYesNo(param.mandatory)}
                    </TableData>
                  </TableRow>
                );
              })}
            </TableBody>
          </SimpleTable>
        </DetailsBlock>

      </div>
    );
  }
  return (
    <h2>{_('OSP Scanner is offline')}</h2>
  );
};

OspScannerDetails.propTypes = {
  info: PropTypes.object.isRequired,
};

const ScannerDetails = ({
  entity,
}) => {
  const {
    comment,
    scanner_type,
    host,
    port,
    credential,
    tasks = [],
    configs = [],
    info,
  } = entity;
  return (
    <Layout
      flex="column"
      grow
    >
      <InfoTable>
        <TableBody>
          {isDefined(comment) &&
            <TableRow>
              <TableData>
                {_('Comment')}
              </TableData>
              <TableData>
                {comment}
              </TableData>
            </TableRow>
          }

          <TableRow>
            <TableData>
              {_('Scanner Type')}
            </TableData>
            <TableData>
              {scannerTypeName(scanner_type)}
            </TableData>
          </TableRow>

          {!entity.hasUnixSocket() &&
            <TableRow>
              <TableData>
                {_('Host')}
              </TableData>
              <TableData>
                {scanner_type === CVE_SCANNER_TYPE ?
                  <span>{_('N/A (Builtin Scanner)')}</span> :
                  host
                }
              </TableData>
            </TableRow>
          }

          {!entity.hasUnixSocket() &&
            <TableRow>
              <TableData>
                {_('Port')}
              </TableData>
              <TableData>
                {scanner_type === CVE_SCANNER_TYPE ?
                  <span>{_('N/A (Builtin Scanner)')}</span> :
                  port
                }
              </TableData>
            </TableRow>
          }

          {isDefined(credential) &&
            <TableRow>
              <TableData>
                {_('Credential')}
              </TableData>
              <TableData>
                <DetailsLink
                  id={credential.id}
                  type="credential"
                >
                  {credential.name}
                </DetailsLink>
              </TableData>
            </TableRow>
          }

          {tasks.length > 0 &&
            <TableRow>
              <TableData>
                {_('Tasks using this Scanner')}
              </TableData>
              <TableData>
                <Divider wrap>
                  {tasks.map(task => (
                    <DetailsLink
                      key={task.id}
                      id={task.id}
                      type="task"
                    >
                      {task.name}
                    </DetailsLink>
                  ))}
                </Divider>
              </TableData>
            </TableRow>
          }

          {configs.length > 0 &&
            <TableRow>
              <TableData>
                {_('Scan Configs using this Scanner')}
              </TableData>
              <TableData>
                <Divider wrap>
                  {configs.map(config => (
                    <DetailsLink
                      key={config.id}
                      id={config.id}
                      type="scanconfig"
                    >
                      {config.name}
                    </DetailsLink>
                  ))}
                </Divider>
              </TableData>
            </TableRow>
          }
        </TableBody>
      </InfoTable>

      {scanner_type === OSP_SCANNER_TYPE && isDefined(info) &&
        <OspScannerDetails
          info={info}
        />
      }

      {!entity.hasUnixSocket() && isDefined(credential) &&
          isDefined(credential.certificate_info) &&
          <DetailsBlock
            title={_('Client Certificate (from Credential)')}
          >
            <CertInfo
              info={credential.certificate_info}
            />
          </DetailsBlock>
      }
    </Layout>
  );
};

ScannerDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default ScannerDetails;

// vim: set ts=2 sw=2 tw=80:
