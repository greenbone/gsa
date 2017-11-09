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

import {
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
} from 'gmp/models/alert.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import Condition from './condition.js';
import Event from './event.js';
import Method from './method.js';

const AlertDetails = ({
  capabilities,
  entity,
  links = true,
}) => {
  const {
    comment,
    condition,
    event,
    method,
    tasks = [],
    filter,
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
              {_('Condition')}
            </TableData>
            <TableData>
              <Condition
                condition={condition}
                event={event}
              />
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Event')}
            </TableData>
            <TableData>
              <Event event={event}/>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Method')}
            </TableData>
            <TableData>
              <Method
                method={method}
                details={true}
              />
            </TableData>
          </TableRow>

          {is_defined(method.data) && is_defined(method.data.details_url) &&
            is_defined(method.data.details_url.value) &&
            (event.type === EVENT_TYPE_NEW_SECINFO ||
            event.type === EVENT_TYPE_UPDATED_SECINFO) &&
            <TableRow>
              <TableData>
                {_('Details URL')}
              </TableData>
              <TableData>
                {method.data.details_url.value}
              </TableData>
            </TableRow>
          }

          {capabilities.mayAccess('filter') && is_defined(filter) &&
            <TableRow>
              <TableData>
                {_('Results Filter')}
              </TableData>
              <TableData>
                <DetailsLink
                  legacy
                  id={filter.id}
                  type="filter"
                >
                  {filter.name}
                </DetailsLink>
              </TableData>
            </TableRow>
          }

          <TableRow>
            <TableData>
              {_('Active')}
            </TableData>
            <TableData>
              {entity.isActive() ?
                _('Yes') : _('No')
              }
            </TableData>
          </TableRow>

          {tasks.length > 0 &&
            <TableRow>
              <TableData>
                {_('Task using this Alert')}
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

AlertDetails.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default withCapabilities(AlertDetails);

// vim: set ts=2 sw=2 tw=80:
