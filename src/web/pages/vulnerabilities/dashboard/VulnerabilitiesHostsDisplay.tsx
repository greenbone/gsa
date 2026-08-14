/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useRef} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import {type default as FilterType} from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
  type State,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/registry';
import transformHostsData, {
  type HostDataPoint,
  type HostsData,
} from 'web/pages/vulnerabilities/dashboard/hosts-transform';
import VulnerabilitiesHostsBarChart from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesHostsBarChart';
import {VulnerabilitiesHostsLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

interface VulnerabilitiesHostsDisplayProps extends DataDisplayProps<
  HostsData,
  State,
  HostDataPoint
> {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

const computeTotal = (data: HostsData = {}): number => {
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
    (clickData: HostDataPoint) => {
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

  const handleTransform = useCallback((data: HostsData) => {
    totalRef.current = computeTotal(data);
    return transformHostsData(data);
  }, []);

  return (
    <VulnerabilitiesHostsLoader filter={filter}>
      {loaderProps => (
        <DataDisplay<
          HostsData,
          VulnerabilitiesHostsDisplayProps,
          State,
          HostDataPoint
        >
          {...props}
          {...(loaderProps as {
            data: HostsData;
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
            <VulnerabilitiesHostsBarChart
              data={data}
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

const computeTotalForTable = (data: HostsData = {}): number => {
  const {groups = []} = data;
  return groups.length > 0 ? Math.max(...groups.map(val => val.c_count)) : 0;
};

export const VulnerabilitiesHostsTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesHostsLoader,
  displayComponent: DataTableDisplay,
  dataTransform: (data: HostsData) => transformHostsData(data),
  dataTitles: [_l('# of Hosts'), _l('# of Vulnerabilities')],
  dataRow: (row: HostDataPoint) => [row.x, String(row.y)],
  title: ({data: _tdata, originalData}) =>
    _('Vulnerabilities by Hosts (Total: {{count}})', {
      count: computeTotalForTable(originalData as HostsData),
    }),
  displayId: 'vuln-by-hosts-table',
  displayName: 'VulnerabilitiesHostsTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
} as Parameters<typeof createDisplay>[0]);

registerDisplay(
  VulnerabilitiesHostsDisplay,
  _l('Chart: Vulnerabilities by Hosts'),
);

registerDisplay(
  VulnerabilitiesHostsTableDisplay,
  _l('Table: Vulnerabilities by Hosts'),
);
