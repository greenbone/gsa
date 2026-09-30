/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
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
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
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

type HostModifiedHighDataPoint = LineData;

interface TransformedHostHighModifiedData extends Array<HostModifiedHighDataPoint> {
  total: number;
}

type HostModifiedHighDataDisplayProps =
  DataDisplayProps<TransformedHostHighModifiedData>;

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

export const HostsModifiedHighDisplay = createDisplay({
  loaderComponent: HostsModifiedLoader,
  displayComponent: ({data, onFilterChanged, filter, ...props}) => {
    const transformedData = useDataTransform(data, transformModified);
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
            field: 'modified',
            filter,
            formatDate: date => date.format(dateFormat),
            startDate,
          }),
        );
      },
      [onFilterChanged, filter],
    );
    return (
      <DataDisplay<
        TransformedHostHighModifiedData,
        HostModifiedHighDataDisplayProps
      >
        {...props}
        data={transformedData}
        filter={filter}
        title={({data}) =>
          _('Hosts (High) by Modification Time (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
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
    );
  },
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-high-modification-time',
  displayName: 'HostsModifiedHighDisplay',
});

export const HostsModifiedHighTableDisplay = createDisplay({
  loaderComponent: HostsModifiedLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformModified);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label ?? '', row.y, row.y2]) ?? []
        }
        dataTitles={[
          _('Creation Time'),
          _('# of Modified Hosts (High)'),
          _('Total Hosts (High)'),
        ]}
        title={({data}) =>
          _('Hosts (High) by Modification Time (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
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
