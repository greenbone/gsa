/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import transformHostsData, {
  type TransformedVulnerabilitiesHostsDataItem,
  type TransformedVulnerabilitiesHostsData,
} from 'web/pages/vulnerabilities/dashboard/hosts-transform';
import VulnerabilitiesHostsBarChart from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesHostsBarChart';
import {VulnerabilitiesHostsLoader} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

type VulnerabilitiesHostsDataDisplayProps =
  DataDisplayProps<TransformedVulnerabilitiesHostsData>;

export const VulnerabilitiesHostsDisplay = createDisplay({
  loaderComponent: VulnerabilitiesHostsLoader,
  displayComponent: ({data, onFilterChanged, filter, ...props}) => {
    const transformedData = useDataTransform(data, transformHostsData);
    const handleDataClick = useCallback(
      (clickData: TransformedVulnerabilitiesHostsDataItem) => {
        if (!isDefined(onFilterChanged)) {
          return;
        }
        const {filterValue} = clickData;
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
          ? filter.and(hostFilter)
          : hostFilter;
        onFilterChanged(newFilter);
      },
      [filter, onFilterChanged],
    );
    return (
      <DataDisplay<
        TransformedVulnerabilitiesHostsData,
        VulnerabilitiesHostsDataDisplayProps
      >
        {...props}
        data={transformedData}
        filter={filter}
        showToggleLegend={false}
        title={({data}) =>
          _('Vulnerabilities by Hosts (Total: {{count}})', {
            count: data?.total ?? 0,
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
    );
  },
  displayId: 'vuln-by-hosts',
  displayName: 'VulnerabilitiesHostsDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

export const VulnerabilitiesHostsTableDisplay = createDisplay({
  loaderComponent: VulnerabilitiesHostsLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformHostsData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.x, String(row.y)]) ?? []
        }
        dataTitles={[_('# of Hosts'), _('# of Vulnerabilities')]}
        title={_('Vulnerabilities by Hosts')}
      />
    );
  },
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
