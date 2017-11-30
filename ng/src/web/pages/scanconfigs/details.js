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
import {is_defined} from 'gmp/utils.js';

import {OSP_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig.js';

import PropTypes from '../../utils/proptypes.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const ScanConfigDetails = ({
  entity,
}) => {
  const {
    comment,
    scan_config_type,
    scanner,
    tasks = [],
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
          {scan_config_type === OSP_SCAN_CONFIG_TYPE && is_defined(scanner) &&
            <TableRow>
              <TableData>
                {_('Scanner')}
              </TableData>
              <TableData>
                <DetailsLink
                  type="scanner"
                  id={scanner.id}
                >
                  {scanner.name}
                </DetailsLink>
              </TableData>
            </TableRow>
          }

          {tasks.length > 0 &&
            <TableRow>
              <TableData>
                {_('Tasks using this Scan Config')}
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
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

ScanConfigDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default ScanConfigDetails;

// vim: set ts=2 sw=2 tw=80:
