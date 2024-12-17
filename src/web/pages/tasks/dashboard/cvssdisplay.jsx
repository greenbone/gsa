/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/cvsstabledisplay';  
import {registerDisplay} from 'web/components/dashboard/registry';

import {TasksSeverityLoader} from './loaders';

export const TasksCvssDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: CvssDisplay,
  yLabel: _l('# of Tasks'),
  title: ({data: tdata = {}}) =>
    _('Tasks by CVSS (Total: {{count}})', {count: tdata.total}),
  displayId: 'task-by-cvss',
  displayName: 'TasksCvssDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksCvssTableDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: CvssTableDisplay,
  dataTitles: [_l('Severity'), _l('# of Tasks')],
  title: ({data: tdata = {}}) =>
    _('Tasks by CVSS (Total: {{count}})', {count: tdata.total}),
  filtersFilter: TASKS_FILTER_FILTER,
  displayId: 'task-by-cvss-table',
  displayName: 'TasksCvssTableDisplay',
});

registerDisplay(TasksCvssDisplay.displayId, TasksCvssDisplay, {
  title: _l('Chart: Tasks by CVSS'),
});

registerDisplay(TasksCvssTableDisplay.displayId, TasksCvssTableDisplay, {
  title: _l('Table: Tasks by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
