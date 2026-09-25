/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {format as d3format} from 'd3-format';
import {useNavigate} from 'react-router';
import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {DEFAULT_SEVERITY_RATING, type SeverityRating} from 'gmp/utils/severity';
import BarChart from 'web/components/chart/BarChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
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

type TaskMostHighResultsDataDisplayProps = DataDisplayProps<
  TaskHighResultsData,
  TransformedTaskHighResultsData,
  TransformTasksMostHighResultsProps
>;

type TaskMostHighResultsDisplayProps = DashboardDisplayProps;

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

export const TasksMostHighResultsDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: TaskMostHighResultsDisplayProps) => {
  const navigate = useNavigate();
  const gmp = useGmp();

  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: TASKS_FILTER_FILTER,
    onFilterIdChanged,
  });

  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleDataClick = (data: TransformedTaskHighResultsDataItem) => {
    void navigate(`/task/${data.id}`);
  };

  const severityRating = gmp.settings.severityRating;
  return (
    <>
      <TasksHighResultsLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            TaskHighResultsData,
            TaskMostHighResultsDataDisplayProps,
            TransformedTaskHighResultsData,
            TransformTasksMostHighResultsProps
          >
            {...props}
            {...loaderProps}
            dataRow={transformedData =>
              transformedData?.map(row => [row.x, row.y]) ?? []
            }
            dataTitles={[_('Task Name'), _('Max. High per Host')]}
            dataTransform={transformHighResultsData}
            filter={displayFilter}
            severityRating={severityRating}
            showToggleLegend={false}
            title={() => _('Tasks with most High Results per Host')}
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
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
        )}
      </TasksHighResultsLoader>
      {filterSelectionDialog}
    </>
  );
};

TasksMostHighResultsDisplay.displayId = 'task-by-most-high-results';

export const TasksMostHighResultsTableDisplay = createDisplay({
  loaderComponent: TasksHighResultsLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.x, row.y]) ?? []
      }
      dataTitles={[_('Task Name'), _('Max. High per Host')]}
      dataTransform={transformHighResultsData}
      title={() => _('Tasks with most High Results per Host')}
    />
  ),
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
