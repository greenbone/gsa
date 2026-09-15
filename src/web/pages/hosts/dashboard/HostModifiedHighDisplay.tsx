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
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';

type HostModifiedHighDataPoint = LineData;

interface TransformedHostHighModifiedData extends Array<HostModifiedHighDataPoint> {
  total: number;
}

type HostModifiedHighDataDisplayProps = DataDisplayProps<
  HostModifiedData,
  TransformedHostHighModifiedData
>;

type HostModifiedHighDisplayProps = DashboardDisplayProps;

const transformModified = (
  data: HostModifiedData | undefined = {},
): TransformedHostHighModifiedData => {
  let {groups = []} = data;
  groups = groups.filter(group => group.subgroup?.value === 'High');
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

  const result = transformedData as unknown as TransformedHostHighModifiedData;
  result.total = sum;
  return result;
};

export const HostsModifiedHighDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: HostModifiedHighDisplayProps) => {
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
            HostModifiedHighDataDisplayProps,
            TransformedHostHighModifiedData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformModified}
            filter={displayFilter}
            title={({data}) =>
              _('Hosts (High) by Modification Time (Total: {{count}})', {
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
                y2AxisLabel={_('Total Hosts (High)')}
                y2Line={{
                  color: Theme.darkGreenTransparent,
                  dashArray: '3, 2',
                  label: _('Total Hosts (High)'),
                }}
                yAxisLabel={_('# of Modified Hosts (High)')}
                yLine={{
                  color: Theme.darkGreenTransparent,
                  label: _('Modified Hosts (High)'),
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

HostsModifiedHighDisplay.displayId = 'host-by-high-modification-time';

export const HostsModifiedHighTableDisplay = createDisplay({
  loaderComponent: HostsModifiedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label ?? '', row.y, row.y2]}
      dataTitles={[
        _('Creation Time'),
        _('# of Modified Hosts (High)'),
        _('Total Hosts (High)'),
      ]}
      dataTransform={transformModified}
      title={({data}) =>
        _('Hosts (High) by Modification Time (Total: {{count}})', {
          count: data.total,
        })
      }
    />
  ),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-high-modification-time-table',
  displayName: 'HostsModifiedHighTableDisplay',
});

registerDisplay(
  HostsModifiedHighDisplay,
  _l('Chart: Hosts (High) by Modification Time'),
);

registerDisplay(
  HostsModifiedHighTableDisplay,
  _l('Table: Hosts (High) by Modification Time'),
);
