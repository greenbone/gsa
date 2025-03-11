/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined, hasValue} from 'gmp/utils/identity';
import React from 'react';
import TopologyChart from 'web/components/chart/Topology';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {HostsTopologyLoader} from 'web/pages/hosts/dashboard/Loaders';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {withRouter} from 'web/utils/withRouter';

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

export class HostsTopologyDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {navigate} = this.props;

    navigate(`/host/${data.id}`);
  }

  render() {
    const {filter, ...props} = this.props;
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
              <TopologyChart
                data={tdata}
                height={height}
                svgRef={svgRef}
                width={width}
                onDataClick={this.handleDataClick}
              />
            )}
          </DataDisplay>
        )}
      </HostsTopologyLoader>
    );
  }
}

HostsTopologyDisplay.propTypes = {
  filter: PropTypes.filter,
  navigate: PropTypes.func.isRequired,
};

const DISPLAY_ID = 'host-by-topology';

HostsTopologyDisplay = compose(
  withRouter,
  withFilterSelection({
    filtersFilter: HOSTS_FILTER_FILTER,
  }),
)(HostsTopologyDisplay);

HostsTopologyDisplay.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, HostsTopologyDisplay, {
  title: _l('Chart: Hosts Topology'),
});
