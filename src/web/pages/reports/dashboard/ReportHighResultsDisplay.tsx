/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {type Date} from 'gmp/models/date';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseInt, parseFloat, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import LineChart, {type LineData} from 'web/components/chart/LineChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {createDateRangeFilter} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type ReportHighResultsData,
  ReportsHighResultsLoader,
} from 'web/pages/reports/dashboard/ReportLoaders';
import Theme from 'web/utils/theme';
import {formattedUserSettingLongDate} from 'web/utils/user-setting-time-date-formatters';

interface TransformedReportHighResultsDataItem {
  label: string;
  x: Date;
  y: number;
  y2: number;
}

type TransformedReportHighResultsData = TransformedReportHighResultsDataItem[];

type ReportsHighResultsDataDisplayProps =
  DataDisplayProps<TransformedReportHighResultsData>;

const transformHighResults = (
  data: ReportHighResultsData = {},
): TransformedReportHighResultsData => {
  const {groups = []} = data;
  return groups.map(group => {
    const reportDate = parseDate(group.value);
    return {
      label: formattedUserSettingLongDate(reportDate),
      x: reportDate,
      y: parseInt(group.stats.high.max),
      y2: parseFloat(group.stats.high_per_host.max),
    } as TransformedReportHighResultsDataItem;
  });
};

export const ReportsHighResultsDisplay = createDisplay({
  loaderComponent: ReportsHighResultsLoader,
  displayComponent: ({data, filter, onFilterChanged, ...props}) => {
    const transformedData = useDataTransform(data, transformHighResults);
    const handleRangeSelect = useCallback(
      (start: LineData, end: LineData) => {
        if (!isDefined(onFilterChanged)) {
          return;
        }

        const startDate = start.x as Date;
        const endDate = end.x as Date;
        const dateFormat = 'YYYY-MM-DDTHH:mm';

        onFilterChanged(
          createDateRangeFilter({
            endDate,
            field: 'date',
            filter,
            formatDate: date => date.format(dateFormat),
            startDate,
          }),
        );
      },
      [filter, onFilterChanged],
    );
    return (
      <DataDisplay<
        TransformedReportHighResultsData,
        ReportsHighResultsDataDisplayProps
      >
        {...props}
        data={transformedData}
        filter={filter}
        title={() => _('Reports with High Results')}
      >
        {({width, height, data, svgRef, state}) => (
          <LineChart
            timeline
            data={data}
            height={height}
            showLegend={state.showLegend}
            svgRef={svgRef}
            width={width}
            xAxisLabel={_('Time')}
            y2AxisLabel={_('Max High per Host')}
            y2Line={{
              color: Theme.darkGreenTransparent,
              dashArray: '3, 2',
              label: _('Max High per Host'),
            }}
            yAxisLabel={_('Max High')}
            yLine={{
              color: Theme.darkGreenTransparent,
              label: _('Max High'),
            }}
            onRangeSelected={handleRangeSelect}
          />
        )}
      </DataDisplay>
    );
  },
  displayId: 'report-by-high-results',
  displayName: 'ReportsHighResultsDisplay',
  filtersFilter: REPORTS_FILTER_FILTER,
});

export const ReportsHighResultsTableDisplay = createDisplay({
  loaderComponent: ReportsHighResultsLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformHighResults);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label, row.y, row.y2]) ?? []
        }
        dataTitles={[_('Created Time'), _('Max High'), _('Max High per Host')]}
        title={() => _('Reports with High Results')}
      />
    );
  },
  filtersFilter: REPORTS_FILTER_FILTER,
  displayName: 'ReportsHighResultsTableDisplay',
  displayId: 'report-by-high-results-table',
});

registerDisplay(
  ReportsHighResultsDisplay,
  _l('Chart: Reports with high Results'),
);

registerDisplay(
  ReportsHighResultsTableDisplay,
  _l('Table: Reports with high Results'),
);
