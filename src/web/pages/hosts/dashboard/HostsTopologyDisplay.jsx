/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useNavigate} from 'react-router';
import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined, hasValue} from 'gmp/utils/identity';
import HostsTopologyChart from 'web/components/chart/HostsTopologyChart';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import useGmp from 'web/hooks/useGmp';
import {HostsTopologyLoader} from 'web/pages/hosts/dashboard/Loaders';
import PropTypes from 'web/utils/PropTypes';

const transformTopologyData = (data = []) => {
  if (!hasValue(data)) {
    return {};
  }

  const hostsObject = {};
  const routes = new Set();
  const links = [];

  data.forEach(host => {
    const {name, severity, isScanner, details, id} = host;
    const {traceroute} = details;

    hostsObject[name] = {
      id: name,
      uuid: id,
      name,
      severity,
      isScanner,
      links: [],
    };

    if (isDefined(traceroute)) {
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

        const newLink = {
          source,
          target,
        };

        const sourceHost = hostsObject[source];

        if (isDefined(sourceHost)) {
          sourceHost.links.push(newLink);
        } else {
          hostsObject[source] = {
            id: source,
            name: source,
            links: [newLink],
          };
        }

        const targetHost = hostsObject[target];

        if (isDefined(targetHost)) {
          targetHost.links.push(newLink);
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

const HostsTopologyDisplay = withFilterSelection({
  filtersFilter: HOSTS_FILTER_FILTER,
})(({filter, ...props}) => {
  const gmp = useGmp();
  const navigate = useNavigate();
  const severityRating = gmp.settings.severityRating;
  const handleDataClick = data => {
    navigate(`/host/${data.id}`);
  };
  return (
    <HostsTopologyLoader filter={filter}>
      {loaderProps => (
        <DataDisplay
          {...props}
          {...loaderProps}
          dataTransform={transformTopologyData}
          filter={filter}
          showToggleLegend={false}
          title={() => _('Hosts Topology')}
        >
          {({width, height, data: tdata, svgRef}) => (
            <HostsTopologyChart
              data={tdata}
              height={height}
              severityRating={severityRating}
              svgRef={svgRef}
              width={width}
              onDataClick={handleDataClick}
            />
          )}
        </DataDisplay>
      )}
    </HostsTopologyLoader>
  );
});

HostsTopologyDisplay.propTypes = {
  filter: PropTypes.filter,
};

const DISPLAY_ID = 'host-by-topology';

HostsTopologyDisplay.displayId = DISPLAY_ID;

export default HostsTopologyDisplay;

registerDisplay(DISPLAY_ID, HostsTopologyDisplay, {
  title: _l('Chart: Hosts Topology'),
});
