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
import {isDefined} from 'gmp/utils/identity';
import {DEFAULT_SEVERITY_RATING, type SeverityRating} from 'gmp/utils/severity';
import BubbleChart from 'web/components/chart/BubbleChart';
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
import {severityFormat} from 'web/utils/Render';
import {resultSeverityRiskFactor, _NA, NA_VALUE} from 'web/utils/severity';

interface TransformTaskHighResultsDataProps {
  severityRating?: SeverityRating;
}

interface TransformedTaskHighResultsDataItem {
  value: number;
  label: string;
  severity: string;
  color: string;
  toolTip: string;
  id?: string;
}

type TransformedTaskHighResultsData = TransformedTaskHighResultsDataItem[];

type TaskHighResultsDataDisplayProps =
  DataDisplayProps<TransformedTaskHighResultsData>;

const format = d3format('0.2f');

const transformHighResultsData = (
  data: TaskHighResultsData = {},
  {
    severityRating = DEFAULT_SEVERITY_RATING,
  }: TransformTaskHighResultsDataProps = {},
): TransformedTaskHighResultsData => {
  const {groups = []} = data;

  return groups
    .filter(group => {
      const {text = {}} = group;
      const {high_per_host = 0} = text;
      return (parseFloat(high_per_host) ?? 0) > 0;
    })
    .map(group => {
      const {text = {}, value: id} = group;
      const {name} = text;
      const high_per_host = parseFloat(text.high_per_host);
      const severity = parseSeverity(text.severity) ?? NA_VALUE;
      const riskFactor = resultSeverityRiskFactor(severity, severityRating);
      const displaySeverity = isDefined(severity)
        ? severityFormat(severity)
        : String(_NA);
      const displayHighHost = format(high_per_host);
      return {
        value: high_per_host,
        label: name,
        severity: displaySeverity,
        color: riskFactorColorScale(riskFactor),
        toolTip: `${name}: ${displayHighHost} (Severity ${displaySeverity})`,
        id,
      } as TransformedTaskHighResultsDataItem;
    });
};

export const TasksHighResultsDisplay = createDisplay({
  loaderComponent: TasksHighResultsLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformHighResultsData, {
      severityRating: gmp.settings.severityRating,
    });
    const navigate = useNavigate();
    const handleDataClick = useCallback(
      (data: TransformedTaskHighResultsDataItem) => {
        void navigate(`/task/${data.id}`);
      },
      [navigate],
    );
    return (
      <DataDisplay<
        TransformedTaskHighResultsData,
        TaskHighResultsDataDisplayProps
      >
        {...props}
        data={transformedData}
        showToggleLegend={false}
        title={() => _('Tasks by High Results per Host')}
      >
        {({width, height, data, svgRef}) => (
          <BubbleChart
            data={data}
            height={height}
            svgRef={svgRef}
            width={width}
            onDataClick={handleDataClick}
          />
        )}
      </DataDisplay>
    );
  },
  displayId: 'task-by-high-results',
  displayName: 'TasksHighResultsDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksHighResultsTableDisplay = createDisplay({
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
          transformedData?.map(row => [row.label, row.value, row.severity]) ??
          []
        }
        dataTitles={[_('Task Name'), _('High per Host'), _('Severity')]}
        title={() => _('Tasks by High Results per Host')}
      />
    );
  },
  displayId: 'task-by-high-results-table',
  displayName: 'TasksHighResultsTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(
  TasksHighResultsDisplay,
  _l('Chart: Tasks by High Results per Host'),
);

registerDisplay(
  TasksHighResultsTableDisplay,
  _l('Table: Tasks by High Results per Host'),
);
