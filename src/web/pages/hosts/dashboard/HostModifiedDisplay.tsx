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

type HostModifiedDataPoint = LineData;

interface TransformedHostModifiedData extends Array<HostModifiedDataPoint> {
  total: number;
}

type HostModifiedDataDisplayProps =
  DataDisplayProps<TransformedHostModifiedData>;

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

export const HostsModifiedDisplay = createDisplay({
  loaderComponent: HostsModifiedLoader,
  displayComponent: ({data, onFilterChanged, filter, ...props}) => {
    const transformedData = useDataTransform(data, transformModified);
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
          filter: filter,
          formatDate: date => date.format(dateFormat),
          startDate,
        }),
      );
    };
    return (
      <DataDisplay<TransformedHostModifiedData, HostModifiedDataDisplayProps>
        {...props}
        data={transformedData}
        filter={filter}
        title={({data}) =>
          _('Hosts by Modification Time (Total: {{count}})', {
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
    );
  },
  displayId: 'host-by-modification-time',
  displayName: 'HostsModifiedDisplay',
  filtersFilter: HOSTS_FILTER_FILTER,
});

export const HostsModifiedTableDisplay = createDisplay({
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
          _('# of Modified Hosts'),
          _('Total Hosts'),
        ]}
        title={({data}) =>
          _('Hosts by Modification Time (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-modification-time-table',
  displayName: 'HostsModifiedTableDisplay',
});

registerDisplay(HostsModifiedDisplay, _l('Chart: Hosts by Modification Time'));

registerDisplay(
  HostsModifiedTableDisplay,
  _l('Table: Hosts by Modification Time'),
);
