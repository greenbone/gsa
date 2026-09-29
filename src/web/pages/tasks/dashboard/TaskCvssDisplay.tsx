/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import transformCvssData from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {TasksSeverityLoader} from 'web/pages/tasks/dashboard/TaskLoaders';

export const TasksCvssDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssDisplay
        {...props}
        data={transformedData}
        title={({data}) =>
          _('Tasks by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
        yLabel={_('# of Tasks')}
      />
    );
  },
  displayId: 'task-by-cvss',
  displayName: 'TasksCvssDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksCvssTableDisplay = createDisplay({
  loaderComponent: TasksSeverityLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformCvssData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <CvssTableDisplay
        {...props}
        data={transformedData}
        dataTitles={[_('Severity'), _('# of Tasks')]}
        title={({data}) =>
          _('Tasks by CVSS (Total: {{count}})', {count: data?.total ?? 0})
        }
      />
    );
  },
  filtersFilter: TASKS_FILTER_FILTER,
  displayId: 'task-by-cvss-table',
  displayName: 'TasksCvssTableDisplay',
});

registerDisplay(TasksCvssDisplay, _l('Chart: Tasks by CVSS'));

registerDisplay(TasksCvssTableDisplay, _l('Table: Tasks by CVSS'));
