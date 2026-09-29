/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformSeverityData from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';
import SeverityClassTableDisplay from 'web/components/dashboard/display/severity/SeverityClassTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {TasksSeverityLoader} from 'web/pages/tasks/dashboard/TaskLoaders';

export const TasksSeverityDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassDisplay
        {...props}
        data={transformedData}
        title={({data}) =>
          _('Tasks by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'task-by-severity-class',
  displayName: 'TasksSeverityDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksSeverityTableDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformSeverityData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <SeverityClassTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of Tasks')]}
        title={({data}) =>
          _('Tasks by Severity Class (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'task-by-severity-class-table',
  displayName: 'TasksSeverityTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(
  TasksSeverityTableDisplay,
  _l('Table: Tasks by Severity Class'),
);

registerDisplay(TasksSeverityDisplay, _l('Chart: Tasks by Severity Class'));
