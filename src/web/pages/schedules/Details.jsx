/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DateTime from 'web/components/date/DateTime';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import {Col} from 'web/entity/Page';
import {renderDuration, renderRecurrence} from 'web/pages/schedules/Render';
import PropTypes from 'web/utils/PropTypes';


const ScheduleDetails = ({entity, links = true}) => {
  const {comment, tasks = [], timezone, timezone_abbrev, event = {}} = entity;
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
              {isDefined(startDate) ? (
                <DateTime date={startDate} timezone={timezone} />
              ) : (
                '-'
              )}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Next Run')}</TableData>
            <TableData>
              {isDefined(nextDate) ? (
                <DateTime date={nextDate} timezone={timezone} />
              ) : (
                '-'
              )}
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
