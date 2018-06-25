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
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const FilterDetails = ({
  entity,
}) => {
  const {
    comment,
    filter_type,
    alerts = [],
  } = entity;
  return (
    <Layout
      grow
      flex="column"
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
              {_('Term')}
            </TableData>
            <TableData>
              {entity.toFilterString()}
            </TableData>
          </TableRow>


          <TableRow>
            <TableData>
              {_('Type')}
            </TableData>
            <TableData>
              {filter_type}
            </TableData>
          </TableRow>

          {alerts.length > 0 &&
            <TableRow>
              <TableData>
                {_('Alerts using this Filter')}
              </TableData>
              <TableData>
                <Divider wrap>
                  {alerts.map(alert => (
                    <DetailsLink
                      key={alert.id}
                      id={alert.id}
                      type="alert"
                    >
                      {alert.name}
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

FilterDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default FilterDetails;

// vim: set ts=2 sw=2 tw=80:
