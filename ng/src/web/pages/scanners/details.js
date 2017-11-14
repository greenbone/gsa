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

import _, {long_date} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import {
  scanner_type_name,
  CVE_SCANNER_TYPE,
  OSP_SCANNER_TYPE,
  PARAM_TYPE_OVALDEF_FILE,
  PARAM_TYPE_SELECTION,
  PARAM_TYPE_BOOLEAN,
} from 'gmp/models/scanner.js';

import PropTypes from '../../utils/proptypes.js';
import {render_yesno} from '../../utils/render.js';

import DetailsBlock from '../../entity/block.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import SimpleTable from '../../components/table/simpletable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

const CertInfo = ({
  info,
}) => {
  const {
    activation_time,
    expiration_time,
    issuer,
    md5_fingerprint,
  } = info;
  return (
    <InfoTable>
      <TableBody>
        <TableRow>
          <TableData>
            {_('Activation')}
          </TableData>
          <TableData>
            {long_date(activation_time)}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>
            {_('Expiration')}
          </TableData>
          <TableData>
            {long_date(expiration_time)}
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
  if (is_defined(scanner.name)) {
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
                  def = render_yesno(def);
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
                      {render_yesno(param.mandatory)}
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
          {is_defined(comment) &&
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
              {scanner_type_name(scanner_type)}
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

          {is_defined(credential) &&
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
                      type="config"
                      legacy
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

      {scanner_type === OSP_SCANNER_TYPE && is_defined(info) &&
        <OspScannerDetails
          info={info}
        />
      }

      {!entity.hasUnixSocket() && is_defined(credential) &&
          is_defined(credential.certificate_info) &&
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
