/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {type Date} from 'gmp/models/date';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseInt, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import LineChart, {type LineData} from 'web/components/chart/LineChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {
  createDateRangeFilter,
  totalCount,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type HostModifiedData,
  HostsModifiedLoader,
} from 'web/pages/hosts/dashboard/HostsLoaders';
import Theme from 'web/utils/theme';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';

type HostModifiedDataPoint = LineData;

interface TransformedHostModifiedData extends Array<HostModifiedDataPoint> {
  total: number;
}

type HostModifiedDataDisplayProps = DataDisplayProps<
  HostModifiedData,
  TransformedHostModifiedData
>;

type HostModifiedDisplayProps = DashboardDisplayProps;

const transformModified = (
  data: HostModifiedData | undefined = {},
): TransformedHostModifiedData => {
  const {groups = []} = data;
  const sum = totalCount(groups);
  const transformedData = groups.map(group => {
    const {value, count, c_count} = group;
    const modified = parseDate(value);
    return {
      x: modified,
      label: formattedUserSettingShortDate(modified),
      y: parseInt(count),
      y2: parseInt(c_count),
    };
  });

  const result = transformedData as unknown as TransformedHostModifiedData;
  result.total = sum;
  return result;
};

export const HostsModifiedDisplay = ({
  filterId,
  filter,
  showFilterSelection,
  onFilterIdChanged,
  onFilterChanged,
  ...props
}: HostModifiedDisplayProps) => {
  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: HOSTS_FILTER_FILTER,
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
        field: 'modified',
        filter: displayFilter,
        formatDate: date => date.format(dateFormat),
        startDate,
      }),
    );
  };

  return (
    <>
      <HostsModifiedLoader filter={filter}>
        {loaderProps => (
          <DataDisplay<
            HostModifiedData,
            HostModifiedDataDisplayProps,
            TransformedHostModifiedData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformModified}
            filter={displayFilter}
            title={({data}) =>
              _('Hosts by Modification Time (Total: {{count}})', {
                count: data.total,
              })
            }
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
                xAxisLabelOffset={30}
                xAxisLabelRotation={-20}
                y2AxisLabel={_('Total Hosts')}
                y2Line={{
                  color: Theme.darkGreenTransparent,
                  dashArray: '3, 2',
                  label: _('Total Hosts'),
                }}
                yAxisLabel={_('# of Modified Hosts')}
                yLine={{
                  color: Theme.darkGreenTransparent,
                  label: _('Modified Hosts'),
                }}
                onRangeSelected={handleRangeSelect}
              />
            )}
          </DataDisplay>
        )}
      </HostsModifiedLoader>
      {filterSelectionDialog}
    </>
  );
};

HostsModifiedDisplay.displayId = 'host-by-modification-time';

export const HostsModifiedTableDisplay = createDisplay({
  loaderComponent: HostsModifiedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label ?? '', row.y, row.y2]}
      dataTitles={[
        _('Creation Time'),
        _('# of Modified Hosts'),
        _('Total Hosts'),
      ]}
      dataTransform={transformModified}
      title={({data}) =>
        _('Hosts by Modification Time (Total: {{count}})', {count: data.total})
      }
    />
  ),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-modification-time-table',
  displayName: 'HostsModifiedTableDisplay',
});

registerDisplay(HostsModifiedDisplay, _l('Chart: Hosts by Modification Time'));

registerDisplay(
  HostsModifiedTableDisplay,
  _l('Table: Hosts by Modification Time'),
);
