/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {format as d3format} from 'd3-format';
import {useNavigate} from 'react-router';
import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {DEFAULT_SEVERITY_RATING, type SeverityRating} from 'gmp/utils/severity';
import BarChart from 'web/components/chart/BarChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {
  type TaskHighResultsData,
  TasksHighResultsLoader,
} from 'web/pages/tasks/dashboard/TaskLoaders';
import {resultSeverityRiskFactor} from 'web/utils/severity';

interface TransformTasksMostHighResultsProps {
  severityRating?: SeverityRating;
}

interface TransformedTaskHighResultsDataItem {
  x: string;
  y: number;
  label: string;
  color: string;
  toolTip: string;
  id: string;
}

type TransformedTaskHighResultsData = TransformedTaskHighResultsDataItem[];

type TaskMostHighResultsDataDisplayProps =
  DataDisplayProps<TransformedTaskHighResultsData>;

const format = d3format('0.2f');

const transformHighResultsData = (
  data: TaskHighResultsData = {},
  {
    severityRating = DEFAULT_SEVERITY_RATING,
  }: TransformTasksMostHighResultsProps = {},
): TransformedTaskHighResultsData => {
  const {groups = []} = data;

  return groups
    .filter(group => {
      const {text = {}} = group;
      const {high_per_host = 0} = text;
      return (parseFloat(high_per_host) ?? 0) > 0;
    })
    .map(group => {
      const {text, value: id} = group;
      const name = text?.name;
      const high_per_host = parseFloat(text?.high_per_host);
      const severity = parseSeverity(text?.severity) as number;
      const riskFactor = resultSeverityRiskFactor(severity, severityRating);
      return {
        y: high_per_host,
        x: name,
        label: name,
        color: riskFactorColorScale(riskFactor),
        toolTip: `${name}: ${format(high_per_host)}`,
        id,
      } as TransformedTaskHighResultsDataItem;
    });
};

export const TasksMostHighResultsDisplay = createDisplay({
  loaderComponent: TasksHighResultsLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const navigate = useNavigate();
    const handleDataClick = useCallback(
      (data: TransformedTaskHighResultsDataItem) => {
        void navigate(`/task/${data.id}`);
      },
      [navigate],
    );
    const transformedData = useDataTransform(data, transformHighResultsData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <DataDisplay<
        TransformedTaskHighResultsData,
        TaskMostHighResultsDataDisplayProps
      >
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.x, row.y]) ?? []
        }
        dataTitles={[_('Task Name'), _('Max. High per Host')]}
        showToggleLegend={false}
        title={() => _('Tasks with most High Results per Host')}
      >
        {({width, height, data, svgRef}) => (
          <BarChart
            horizontal
            data={data}
            height={height}
            svgRef={svgRef}
            width={width}
            xLabel={_('Results per Host')}
            onDataClick={handleDataClick}
          />
        )}
      </DataDisplay>
    );
  },
  displayId: 'task-by-most-high-results',
  displayName: 'TasksMostHighResultsDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksMostHighResultsTableDisplay = createDisplay({
  loaderComponent: TasksHighResultsLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformHighResultsData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.x, row.y]) ?? []
        }
        dataTitles={[_('Task Name'), _('Max. High per Host')]}
        title={() => _('Tasks with most High Results per Host')}
      />
    );
  },
  displayId: 'task-by-most-high-results-table',
  displayName: 'TasksMostHighResultsTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(
  TasksMostHighResultsDisplay,
  _l('Chart: Tasks with most High Results per Host'),
);

registerDisplay(
  TasksMostHighResultsTableDisplay,
  _l('Table: Tasks with most High Results per Host'),
);
