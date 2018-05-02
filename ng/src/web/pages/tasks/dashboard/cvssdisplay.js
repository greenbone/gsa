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

import PropTypes from 'web/utils/proptypes';

import CvssDisplay from 'web/components/dashboard2/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard2/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard2/registry';

import {TasksSeverityLoader} from './loaders';

export const TasksCvssDisplay = ({
  filter,
  ...props
}) => (
  <TasksSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssDisplay
        {...props}
        {...loaderProps}
        yLabel={_('# of Tasks')}
        filter={filter}
        title={({data: tdata = {}}) =>
          _('Tasks by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </TasksSeverityLoader>
);

TasksCvssDisplay.propTypes = {
  filter: PropTypes.filter,
};

TasksCvssDisplay.displayId = 'task-by-cvss';

export const TasksCvssTableDisplay = ({
  filter,
  ...props
}) => (
  <TasksSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity'), _('# of Tasks')]}
        title={({data: tdata = {}}) =>
          _('Tasks by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </TasksSeverityLoader>
);

TasksCvssTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

TasksCvssTableDisplay.displayId = 'task-by-cvss-table';

registerDisplay(TasksCvssDisplay.displayId, TasksCvssDisplay, {
  title: _('Chart: Tasks by CVSS'),
});

registerDisplay(TasksCvssTableDisplay.displayId, TasksCvssTableDisplay, {
  title: _('Table: Tasks by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
