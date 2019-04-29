/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DateTime from 'web/components/date/datetime';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import {renderDuration, renderRecurrence} from './render';

const ScheduleDetails = ({entity, links = true}) => {
  const {comment, tasks = [], timezone, timezone_abbrev, event} = entity;
  const {startDate, nextDate, duration, recurrence} = event;
  return (
    <Layout grow flex="column">
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
            <TableData>{_('First Run')}</TableData>
            <TableData>
              <DateTime date={startDate} />
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Next Run')}</TableData>
            <TableData>
              {isDefined(nextDate) ? <DateTime date={nextDate} /> : '-'}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Timezone')}</TableData>
            <TableData>
              <Divider>
                <span>{timezone}</span>
                {isDefined(timezone_abbrev) && timezone !== timezone_abbrev && (
                  <span>({timezone_abbrev})</span>
                )}
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Recurrence')}</TableData>
            <TableData>{renderRecurrence(recurrence)}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Duration')}</TableData>
            <TableData>{renderDuration(duration)}</TableData>
          </TableRow>

          {/* don't show empty tasks because schedules list doesn't provide
           any */}
          {tasks.length > 0 && (
            <TableRow>
              <TableDataAlignTop>
                {_('Tasks using this Schedule')}
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
