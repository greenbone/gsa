/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {withRouter} from 'web/utils/withRouter';

import {_, _l} from 'gmp/locale/lang';

import {isDefined, hasValue} from 'gmp/utils/identity';

import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';

import TopologyChart from 'web/components/chart/topology';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard/registry';

import {HostsTopologyLoader} from './loaders';

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
            filter={filter}
            dataTransform={transformTopologyData}
            title={() => _('Hosts Topology')}
            showToggleLegend={false}
          >
            {({width, height, data: tdata, svgRef}) => (
              <TopologyChart
                svgRef={svgRef}
                width={width}
                height={height}
                data={tdata}
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
  navigate: PropTypes.object.isRequired,
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

// vim: set ts=2 sw=2 tw=80:
