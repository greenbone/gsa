/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useRef} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {registerDisplay} from 'web/components/dashboard/registry';
import transformHostsData, {
  type TransformedVulnerabilitiesHostsDataItem,
  type TransformedVulnerabilitiesHostsData,
  type VulnerabilitiesHostsData,
} from 'web/pages/vulnerabilities/dashboard/hosts-transform';
import VulnerabilitiesHostsBarChart from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesHostsBarChart';
import {VulnerabilitiesHostsLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

type VulnerabilitiesHostsDataDisplayProps = DataDisplayProps<
  VulnerabilitiesHostsData,
  TransformedVulnerabilitiesHostsData
>;

type VulnerabilitiesHostsDisplayProps = DashboardDisplayProps;

const computeTotal = (data: VulnerabilitiesHostsData = {}): number => {
  const {groups = []} = data;
  return groups.length > 0 ? Math.max(...groups.map(val => val.c_count)) : 0;
};

export const VulnerabilitiesHostsDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: VulnerabilitiesHostsDisplayProps) => {
  const totalRef = useRef(0);

  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: VULNS_FILTER_FILTER,
    onFilterIdChanged,
  });

  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleDataClick = useCallback(
    (clickData: TransformedVulnerabilitiesHostsDataItem) => {
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
          isDefined(displayFilter) &&
          displayFilter.hasTerm(startTerm) &&
          displayFilter.hasTerm(endTerm)
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
          isDefined(displayFilter) &&
          displayFilter.hasTerm(hostTerm)
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

      const newFilter = isDefined(displayFilter)
        ? displayFilter.and(hostFilter)
        : hostFilter;
      onFilterChanged(newFilter);
    },
    [displayFilter, onFilterChanged],
  );

  const handleTransform = useCallback((data?: VulnerabilitiesHostsData) => {
    totalRef.current = computeTotal(data);
    return transformHostsData(data);
  }, []);

  return (
    <>
      <VulnerabilitiesHostsLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            VulnerabilitiesHostsData,
            VulnerabilitiesHostsDataDisplayProps,
            TransformedVulnerabilitiesHostsData
          >
            {...props}
            {...(loaderProps as {
              data: VulnerabilitiesHostsData;
              isLoading: boolean;
            })}
            dataTransform={handleTransform}
            filter={displayFilter}
            showToggleLegend={false}
            title={() =>
              _('Vulnerabilities by Hosts (Total: {{count}})', {
                count: totalRef.current,
              })
            }
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
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
      {filterSelectionDialog}
    </>
  );
};

VulnerabilitiesHostsDisplay.displayId = 'vuln-by-hosts';

export const VulnerabilitiesHostsTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesHostsLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.x, String(row.y)]) ?? []
      }
      dataTitles={[_('# of Hosts'), _('# of Vulnerabilities')]}
      dataTransform={transformHostsData}
      title={() => _('Vulnerabilities by Hosts')}
    />
  ),
  displayId: 'vuln-by-hosts-table',
  displayName: 'VulnerabilitiesHostsTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

registerDisplay(
  VulnerabilitiesHostsDisplay,
  _l('Chart: Vulnerabilities by Hosts'),
);

registerDisplay(
  VulnerabilitiesHostsTableDisplay,
  _l('Table: Vulnerabilities by Hosts'),
);
