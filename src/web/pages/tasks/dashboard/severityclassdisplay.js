/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import {_, _l} from 'gmp/locale/lang';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';

import SeverityClassDisplay from 'web/components/dashboard/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {TasksSeverityLoader} from './loaders';

export const TasksSeverityDisplay = createDisplay({
  displayComponent: SeverityClassDisplay,
  loaderComponent: TasksSeverityLoader,
  title: ({data: tdata}) =>
    _('Tasks by Severity Class (Total: {{count}})', {count: tdata.total}),
  displayId: 'task-by-severity-class',
  displayName: 'TasksSeverityDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksSeverityTableDisplay = createDisplay({
  displayComponent: SeverityClassTableDisplay,
  loaderComponent: TasksSeverityLoader,
  dataTitles: [_l('Severity'), _l('# of Tasks')],
  title: ({data: tdata}) =>
    _('Tasks by Severity Class (Total: {{count}})', {count: tdata.total}),
  displayId: 'task-by-severity-class-table',
  displayName: 'TasksSeverityTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(
  TasksSeverityTableDisplay.displayId,
  TasksSeverityTableDisplay,
  {
    title: _l('Table: Tasks by Severity Class'),
  },
);

registerDisplay(TasksSeverityDisplay.displayId, TasksSeverityDisplay, {
  title: _l('Chart: Tasks by Severity Class'),
});

// vim: set ts=2 sw=2 tw=80:
