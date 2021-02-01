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

import SeverityBar from 'web/components/bar/severitybar';

import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const OvaldefDetails = ({entity}) => {
  const {
    title,
    severity,
    version,
    cve_refs,
    deprecation,
    file,
    metadata,
  } = entity;
  return (
    <Layout flex="column" grow="1">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(title) && (
            <TableRow>
              <TableData>{_('Title')}</TableData>
              <TableData>{title}</TableData>
            </TableRow>
          )}

          {isDefined(version) && (
            <TableRow>
              <TableData>{_('Version')}</TableData>
              <TableData>{version}</TableData>
            </TableRow>
          )}

          {isDefined(entity.class) && (
            <TableRow>
              <TableData>{_('Definition Class')}</TableData>
              <TableData>{entity.class}</TableData>
            </TableRow>
          )}

          {isDefined(cve_refs) && (
            <TableRow>
              <TableData>{_('Referenced CVEs')}</TableData>
              <TableData>{cve_refs}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Severity')}</TableData>
            <TableData>
              <SeverityBar severity={severity} />
            </TableData>
          </TableRow>

          {isDefined(entity.isDeprecated) && entity.isDeprecated() && (
            <TableRow>
              <TableData>{_('Deprecated')}</TableData>
              <TableData>{deprecation}</TableData>
            </TableRow>
          )}

          {isDefined(file) && (
            <TableRow>
              <TableData>{_('File')}</TableData>
              <TableData>{file}</TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>

      {isDefined(metadata) && (
        <div>
          <h2>{_('Description')}</h2>
          <p>
            {isDefined(metadata.description) ? metadata.description : _('None')}
          </p>
        </div>
      )}
    </Layout>
  );
};

OvaldefDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default OvaldefDetails;

// vim: set ts=2 sw=2 tw=80:
