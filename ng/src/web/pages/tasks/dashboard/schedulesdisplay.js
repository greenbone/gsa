/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../../utils/proptypes';

import ScheduleChart from '../../../components/chart/schedule';

import DataDisplay from '../../../components/dashboard2/display/datadisplay';

import {TasksSchedulesLoader} from './loaders';

const transformScheduleData = (data = []) => {
  return data
    .filter(task => is_defined(task.schedule))
    .map(task => {
      const {schedule, name} = task;
      return {
        label: name,
        start: schedule.next_time,
        duration: schedule.duration,
        period: schedule.period,
        periods: schedule.periods,
        periodMonth: schedule.period_months,
      };
    });
};

const TasksSchedulesDisplay = ({
  filter,
  ...props
}) => (
  <TasksSchedulesLoader
    filter={filter}
  >
    {loaderProps => (
      <DataDisplay
        {...props}
        {...loaderProps}
        dataTransform={transformScheduleData}
        title={() => _('Next Scheduled Tasks')}
      >
        {({width, height, data: tdata}) => (
          <ScheduleChart
            width={width}
            height={height}
            data={tdata}
          />
        )}
      </DataDisplay>
    )}
  </TasksSchedulesLoader>
);

TasksSchedulesDisplay.propTypes = {
  filter: PropTypes.filter,
};

export default TasksSchedulesDisplay;

// vim: set ts=2 sw=2 tw=80:
