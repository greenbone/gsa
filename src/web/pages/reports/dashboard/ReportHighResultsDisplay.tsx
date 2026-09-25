/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {type Date} from 'gmp/models/date';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseInt, parseFloat, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import LineChart, {type LineData} from 'web/components/chart/LineChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
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

type ReportsHighResultsDataDisplayProps = DataDisplayProps<
  ReportHighResultsData,
  TransformedReportHighResultsData
>;

type ReportHighResultsDisplayProps = DashboardDisplayProps;

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

export const ReportsHighResultsDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: ReportHighResultsDisplayProps) => {
  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: REPORTS_FILTER_FILTER,
    onFilterIdChanged,
  });

  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleRangeSelect = (start: LineData, end: LineData) => {
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
        filter: displayFilter,
        formatDate: date => date.format(dateFormat),
        startDate,
      }),
    );
  };

  return (
    <>
      <ReportsHighResultsLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            ReportHighResultsData,
            ReportsHighResultsDataDisplayProps,
            TransformedReportHighResultsData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformHighResults}
            filter={displayFilter}
            title={() => _('Reports with High Results')}
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
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
        )}
      </ReportsHighResultsLoader>
      {filterSelectionDialog}
    </>
  );
};

ReportsHighResultsDisplay.displayId = 'report-by-high-results';

export const ReportsHighResultsTableDisplay = createDisplay({
  loaderComponent: ReportsHighResultsLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.label, row.y, row.y2]) ?? []
      }
      dataTitles={[_('Created Time'), _('Max High'), _('Max High per Host')]}
      dataTransform={transformHighResults}
      title={() => _('Reports with High Results')}
    />
  ),
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
