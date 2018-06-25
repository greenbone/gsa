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

import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';
import {
  renderDuration,
  renderRecurrence,
} from './render.js';

const ScheduleDetails = ({
  entity,
  links = true,
}) => {
  const {
    comment,
    tasks = [],
    timezone,
    timezone_abbrev,
    event,
  } = entity;
  const {startDate, nextDate, duration, recurrence} = event;
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
              {_('First Run')}
            </TableData>
            <TableData>
              {longDate(startDate)}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Next Run')}
            </TableData>
            <TableData>
              {is_defined(nextDate) ? longDate(nextDate) : '-'}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Timezone')}
            </TableData>
            <TableData>
              <Divider>
                <span>{timezone}</span>
                {is_defined(timezone_abbrev) && timezone !== timezone_abbrev &&
                  <span>({timezone_abbrev})</span>
                }
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Recurrence')}
            </TableData>
            <TableData>
              {renderRecurrence(recurrence)}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Duration')}
            </TableData>
            <TableData>
              {renderDuration(duration)}
            </TableData>
          </TableRow>

          {/* don't show empty tasks because schedules list doesn't provide
           any */}
          {tasks.length > 0 &&
            <TableRow>
              <TableData>
                {_('Tasks using this Schedule')}
              </TableData>
              <TableData>
                <Divider>
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

ScheduleDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ScheduleDetails;

// vim: set ts=2 sw=2 tw=80:
