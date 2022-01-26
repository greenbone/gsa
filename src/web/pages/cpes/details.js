/* Copyright (C) 2017-2022 Greenbone Networks GmbH
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

import PropTypes from 'web/utils/proptypes.js';

import SeverityBar from 'web/components/bar/severitybar.js';

import DateTime from 'web/components/date/datetime';

import DetailsLink from 'web/components/link/detailslink';

import Layout from 'web/components/layout/layout.js';

import InfoTable from 'web/components/table/infotable.js';
import TableBody from 'web/components/table/body.js';
import TableData from 'web/components/table/data.js';
import TableRow from 'web/components/table/row.js';

import {Col} from 'web/entity/page';

const CpeDetails = ({entity, links = true}) => {
  const {title, nvdId, deprecatedBy, updateTime, status, severity} = entity;
  return (
    <Layout flex="column" grow="1">
      {!isDefined(title) && (
        <p>
          {_(
            'This CPE does not appear in the CPE dictionary but is ' +
              'referenced by one or more CVE.',
          )}
        </p>
      )}

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
          {isDefined(nvdId) && (
            <TableRow>
              <TableData>{_('NVD ID')}</TableData>
              <TableData>{nvdId}</TableData>
            </TableRow>
          )}
          {isDefined(deprecatedBy) && (
            <TableRow>
              <TableData>{_('Deprecated By')}</TableData>
              <TableData>
                <DetailsLink id={deprecatedBy} type="cpe" textOnly={!links}>
                  {deprecatedBy}
                </DetailsLink>
              </TableData>
            </TableRow>
          )}
          {isDefined(updateTime) && (
            <TableRow>
              <TableData>{_('Last updated')}</TableData>
              <TableData>
                <DateTime date={updateTime} />
              </TableData>
            </TableRow>
          )}
          {isDefined(status) && (
            <TableRow>
              <TableData>{_('Status')}</TableData>
              <TableData>{status}</TableData>
            </TableRow>
          )}
          {isDefined(severity) && (
            <TableRow>
              <TableData>{_('Severity')}</TableData>
              <TableData>
                <SeverityBar severity={severity} />
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

CpeDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default CpeDetails;

// vim: set ts=2 sw=2 tw=80:
