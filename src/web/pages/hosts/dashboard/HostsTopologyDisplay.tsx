/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import type Host from 'gmp/models/host';
import {isDefined} from 'gmp/utils/identity';
import HostsTopologyChart, {
  type HostsTopologyChartHost,
  type HostsTopologyChartData,
  type HostsTopologyChartLink,
} from 'web/components/chart/HostsTopologyChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {HostsTopologyLoader} from 'web/pages/hosts/dashboard/HostsLoaders';

type HostsTopologyDataDisplayProps = DataDisplayProps<HostsTopologyChartData>;

const transformTopologyData = (
  data: Host[] | undefined = [],
): HostsTopologyChartData => {
  const hostsObject: Record<string, HostsTopologyChartHost> = {};
  const routes = new Set();
  const links: HostsTopologyChartLink[] = [];

  data.forEach(host => {
    const {name, severity, details, id} = host;
    const {traceroute} = details ?? {};

    hostsObject[name as string] = {
      id: name as string,
      uuid: id,
      name,
      severity,
      links: [],
    };

    if (isDefined(traceroute?.value)) {
      const splitTraceroute = traceroute.value.split(',');

      for (let i = splitTraceroute.length - 1; i > 0; i--) {
        const source = splitTraceroute[i];
        let target = splitTraceroute[i - 1];

        if (target === '* * *' && source === '* * *') {
          continue;
        }

        if (target === '* * *' && i > 1) {
          target = splitTraceroute[i - 2];
        }

        const route = `${source}>${target}`;

        if (routes.has(route)) {
          continue;
        }

        routes.add(route);

        const newLink: HostsTopologyChartLink = {
          source,
          target,
        };

        const sourceHost = hostsObject[source];

        if (isDefined(sourceHost)) {
          sourceHost.links?.push(newLink);
        } else {
          hostsObject[source] = {
            id: source,
            name: source,
            links: [newLink],
          };
        }

        const targetHost = hostsObject[target];

        if (isDefined(targetHost)) {
          targetHost.links?.push(newLink);
        } else {
          hostsObject[target] = {
            id: target,
            name: target,
            links: [newLink],
          };
        }

        links.push(newLink);
      }
    }
  });

  const hosts = Object.values(hostsObject);
  return {hosts, links};
};

export const HostsTopologyDisplay = createDisplay({
  loaderComponent: HostsTopologyLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const severityRating = gmp.settings.severityRating;
    const transformedData = useDataTransform(data, transformTopologyData);
    return (
      <DataDisplay<HostsTopologyChartData, HostsTopologyDataDisplayProps>
        {...props}
        data={transformedData}
        showToggleLegend={false}
        title={() => _('Hosts Topology')}
      >
        {({width, height, data, svgRef}) => (
          <HostsTopologyChart
            data={data}
            height={height}
            severityRating={severityRating}
            svgRef={svgRef}
            width={width}
          />
        )}
      </DataDisplay>
    );
  },
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-topology',
  displayName: 'HostsTopologyDisplay',
});

registerDisplay(HostsTopologyDisplay, _l('Chart: Hosts Topology'));

export default HostsTopologyDisplay;
