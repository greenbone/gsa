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
import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Layout from '../../components/layout/layout.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const CpeDetails = ({
  entity,
}) => {
  const {
    title,
    nvd_id,
    deprecated_by,
    updateTime,
    status,
    severity,
  } = entity;
  return (
    <Layout
      flex="column"
      grow="1">

      {!isDefined(title) &&
        <p>
          {_('This CPE does not appear in the CPE dictionary but is ' +
             'referenced by one or more CVE.')}
        </p>
      }

      <InfoTable>
        <TableBody>
          {isDefined(title) &&
            <TableRow>
              <TableData>
                {_('Title')}
              </TableData>
              <TableData>
                {title}
              </TableData>
            </TableRow>
          }
          {isDefined(nvd_id) &&
            <TableRow>
              <TableData>
                {_('NVD ID')}
              </TableData>
              <TableData>
                {nvd_id}
              </TableData>
            </TableRow>
          }
          {isDefined(deprecated_by) &&
            <TableRow>
              <TableData>
                {_('Deprectated By')}
              </TableData>
              <TableData>
                {deprecated_by}
              </TableData>
            </TableRow>
          }
          {isDefined(updateTime) &&
            <TableRow>
              <TableData>
                {_('Last updated')}
              </TableData>
              <TableData>
                {longDate(updateTime)}
              </TableData>
            </TableRow>
          }
          {isDefined(status) &&
            <TableRow>
              <TableData>
                {_('Status')}
              </TableData>
              <TableData>
                {status}
              </TableData>
            </TableRow>
          }
          {isDefined(severity) &&
            <TableRow>
              <TableData>
                {_('Severity')}
              </TableData>
              <TableData>
                <SeverityBar
                  severity={severity}
                />
              </TableData>
            </TableRow>
          }
        </TableBody>
      </InfoTable>

    </Layout>
  );
};

CpeDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default CpeDetails;

// vim: set ts=2 sw=2 tw=80:
