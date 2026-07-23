/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useRef} from 'react';
import {format as d3format} from 'd3-format';
import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import {type default as FilterType} from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
  type State,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {
  percent,
  vulnsByHostsColorScale,
} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import HostsBarChart from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesHostsBarChart';
import {VulnerabilitiesHostsLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

interface BinConfig {
  min: number;
  max: number;
  color: string;
  binWidth: number;
}

interface GroupData {
  value: number;
  count: number;
  c_count: number;
}

export interface HostDataPoint {
  x: string;
  y: number;
  label: string;
  toolTip: string;
  color: string;
  id: number;
  filterValue: {start: number; end: number};
}

interface VulnerabilitiesHostsDisplayProps extends DataDisplayProps<
  {groups?: GroupData[]},
  State,
  HostDataPoint
> {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

const format = d3format('0.1f');

const calculateBins = (
  minHosts: number,
  maxHosts: number,
  totalVulns: number,
): BinConfig[] => {
  if (totalVulns === 0) {
    return [];
  }

  let binQuantity = Math.ceil(Math.log2(totalVulns)) + 1;
  const binWidth =
    minHosts === maxHosts ? 1 : Math.ceil((maxHosts - minHosts) / binQuantity);
  binQuantity = Math.floor((maxHosts - minHosts) / binWidth) + 1;

  const bins: BinConfig[] = [];
  for (let binIndex = 0; binIndex < binQuantity; binIndex++) {
    const min = minHosts + binIndex * binWidth;
    const max = minHosts + (binIndex + 1) * binWidth - 1;
    const perc = binIndex / binQuantity;
    const color = String(vulnsByHostsColorScale(perc));
    bins[binIndex] = {min, max, color, binWidth};
  }
  return bins;
};

const transformHostsData = (data: {groups?: GroupData[]}): HostDataPoint[] => {
  const {groups = []} = data ?? {};
  const totalVulns =
    groups.length > 0 ? Math.max(...groups.map(val => val.c_count)) : 0;
  const minHosts =
    groups.length > 0 ? Math.min(...groups.map(val => val.value)) : 0;
  const maxHosts =
    groups.length > 0 ? Math.max(...groups.map(val => val.value)) : 0;
  const bins = calculateBins(minHosts, maxHosts, totalVulns);
  return bins.map(bin => {
    const {min, max, color, binWidth} = bin;
    const binWithAllMembers = groups.filter(
      group => group.value >= min && group.value <= max,
    );
    const sumOfBinMembers = binWithAllMembers.reduce(
      (prev, current) => prev + (parseFloat(current.count) ?? 0),
      0,
    );
    const yValue = sumOfBinMembers;
    const perc = percent(yValue, totalVulns);
    const filterValue = {start: min, end: max};
    return {
      x: binWidth > 1 ? `${min}-${max}` : String(min),
      y: yValue,
      label: 'label',
      toolTip: `${min} - ${max}: ${yValue} (${format(perc)}%)`,
      color,
      id: max,
      filterValue,
    };
  });
};

const computeTotal = (data: {groups?: GroupData[]} = {}): number => {
  const {groups = []} = data;
  return groups.length > 0 ? Math.max(...groups.map(val => val.c_count)) : 0;
};

const VulnerabilitiesHostsDisplayInner = ({
  filter,
  onFilterChanged,
  ...props
}: VulnerabilitiesHostsDisplayProps) => {
  const totalRef = useRef(0);

  const handleDataClick = useCallback(
    (clickData: {filterValue?: {start?: number; end?: number}}) => {
      if (!isDefined(onFilterChanged)) {
        return;
      }
      const {filterValue = {start: undefined, end: undefined}} = clickData;
      const {start, end} = filterValue;
      let hostFilter: QueryFilter | undefined;

      if (isDefined(start) && start > 0) {
        const startTerm = FilterTerm.fromString(`hosts>${start - 1}`);
        const endTerm = FilterTerm.fromString(`hosts<${(end ?? 0) + 1}`);
        if (
          isDefined(filter) &&
          filter.hasTerm(startTerm) &&
          filter.hasTerm(endTerm)
        ) {
          return;
        }
        hostFilter = QueryFilter.fromTerm(startTerm).and(
          QueryFilter.fromTerm(endTerm),
        );
      } else {
        let hostTerm: FilterTerm | undefined;
        if (isDefined(start) && start === 0) {
          hostTerm = FilterTerm.fromString(`hosts=${start}`);
        } else if (!isDefined(start)) {
          hostTerm = FilterTerm.fromString(`hosts=""`);
        }
        if (
          isDefined(hostTerm) &&
          isDefined(filter) &&
          filter.hasTerm(hostTerm)
        ) {
          return;
        }
        if (isDefined(hostTerm)) {
          hostFilter = QueryFilter.fromTerm(hostTerm);
        }
      }

      if (!isDefined(hostFilter)) {
        return;
      }

      const newFilter = isDefined(filter)
        ? filter.copy().and(hostFilter)
        : hostFilter;
      onFilterChanged(newFilter);
    },
    [filter, onFilterChanged],
  );

  const handleTransform = useCallback((data: {groups?: GroupData[]}) => {
    totalRef.current = computeTotal(data);
    return transformHostsData(data);
  }, []);

  return (
    <VulnerabilitiesHostsLoader filter={filter}>
      {loaderProps => (
        <DataDisplay<
          {groups?: GroupData[]},
          VulnerabilitiesHostsDisplayProps,
          State,
          HostDataPoint
        >
          {...props}
          {...(loaderProps as {
            data: {groups?: GroupData[]};
            isLoading: boolean;
          })}
          dataTransform={handleTransform}
          filter={filter}
          title={() =>
            _('Vulnerabilities by Hosts (Total: {{count}})', {
              count: totalRef.current,
            })
          }
        >
          {({width, height, data, svgRef}) => (
            <HostsBarChart
              data={data as HostDataPoint[]}
              height={height}
              svgRef={svgRef}
              width={width}
              onDataClick={
                isDefined(onFilterChanged) ? handleDataClick : undefined
              }
            />
          )}
        </DataDisplay>
      )}
    </VulnerabilitiesHostsLoader>
  );
};

const VulnerabilitiesHostsDisplay = withFilterSelection({
  filtersFilter: VULNS_FILTER_FILTER,
})(VulnerabilitiesHostsDisplayInner);

VulnerabilitiesHostsDisplay.displayId = 'vuln-by-hosts';

export {VulnerabilitiesHostsDisplay};

const computeTotalForTable = (data: {groups?: GroupData[]} = {}): number => {
  const {groups = []} = data;
  return groups.length > 0 ? Math.max(...groups.map(val => val.c_count)) : 0;
};

export const VulnerabilitiesHostsTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesHostsLoader,
  displayComponent: DataTableDisplay,
  dataTransform: (data: {groups?: GroupData[]}) => transformHostsData(data),
  dataTitles: [_l('# of Hosts'), _l('# of Vulnerabilities')],
  dataRow: (row: HostDataPoint) => [row.x, String(row.y)],
  title: ({data: _tdata, originalData}) =>
    _('Vulnerabilities by Hosts (Total: {{count}})', {
      count: computeTotalForTable(originalData as {groups?: GroupData[]}),
    }),
  displayId: 'vuln-by-hosts-table',
  displayName: 'VulnerabilitiesHostsTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
} as Parameters<typeof createDisplay>[0]);

registerDisplay(
  VulnerabilitiesHostsDisplay.displayId,
  VulnerabilitiesHostsDisplay,
  {
    title: _l('Chart: Vulnerabilities by Hosts'),
  },
);

registerDisplay(
  VulnerabilitiesHostsTableDisplay.displayId,
  VulnerabilitiesHostsTableDisplay,
  {
    title: _l('Table: Vulnerabilities by Hosts'),
  },
);
