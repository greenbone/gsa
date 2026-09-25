/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {TasksSeverityLoader} from 'web/pages/tasks/dashboard/TaskLoaders';

export const TasksSeverityDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: props => (
    <SeverityClassDisplay
      {...props}
      title={({data}) =>
        _('Tasks by Severity Class (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
    />
  ),
  displayId: 'task-by-severity-class',
  displayName: 'TasksSeverityDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksSeverityTableDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: props => (
    <SeverityClassTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of Tasks')]}
      title={({data}) =>
        _('Tasks by Severity Class (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
    />
  ),
  displayId: 'task-by-severity-class-table',
  displayName: 'TasksSeverityTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(
  TasksSeverityTableDisplay,
  _l('Table: Tasks by Severity Class'),
);

registerDisplay(TasksSeverityDisplay, _l('Chart: Tasks by Severity Class'));
