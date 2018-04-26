/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';
import {withRouter} from 'react-router';

import _ from 'gmp/locale';
import {is_defined, has_value} from 'gmp/utils/identity';

import PropTypes from '../../../utils/proptypes';

import TopologyChart from '../../../components/chart/topology';
import DataDisplay from '../../../components/dashboard2/display/datadisplay';

import {HostsTopologyLoader} from './loaders';
import {registerDisplay} from '../../../components/dashboard2/registry';

const transformTopologyData = (data = []) => {
  let tdata = {};

  if (!has_value(data)) {
    return tdata;
  }

  const hostsObject = {};
  const links = [];

  data.forEach(host => {
    const {name, severity, isScanner} = host;
    const {traceroute} = host.details;
    hostsObject[name] = {
      id: name,
      name,
      severity,
      isScanner,
    };
    if (is_defined(traceroute)) {
      const splitTraceroute = traceroute.value.split(',');

      for (let i = splitTraceroute.length - 1; i > 0; i--) {
        const source = splitTraceroute[i];
        const target = splitTraceroute[i - 1];
        if (target !== '* * *' && source !== '* * *') {
          if (!is_defined(hostsObject[source])) {
            hostsObject[source] = {
              id: source,
              name: source,
            };
          }
          if (!is_defined(hostsObject[target])) {
            hostsObject[target] = {
              id: target,
              name: target,
            };
          }
          links.push({
            source: source,
            target: target,
          });
        }
        else if (target === '* * *' && i > 1) {
          if (!is_defined(hostsObject[source])) {
            hostsObject[source] = {
              id: source,
              name: source,
            };
          }
          links.push({
            source: source,
            target: splitTraceroute[i - 2],
          });
        }
      }
    };
  });
  const hosts = Object.keys(hostsObject).map(host => hostsObject[host]);
  tdata = {hosts, links};

  return tdata;
};

class HostsTopologyDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {router} = this.props;

    router.push(`/ng/host/${data.id}`);
  }

  render() {
    const {
      filter,
      ...props
    } = this.props;
    return (
      <HostsTopologyLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformTopologyData}
            title={() => _('Hosts Topology')}
          >
            {({width, height, data: tdata}) => (
              <TopologyChart
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
  router: PropTypes.object.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

const DISPLAY_ID = 'host-by-topology';

const HostsTopologyDisplayWithRouter = withRouter(HostsTopologyDisplay);

HostsTopologyDisplayWithRouter.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, HostsTopologyDisplayWithRouter, {
  title: _('Hosts Topology'),
});

export default HostsTopologyDisplayWithRouter;

// vim: set ts=2 sw=2 tw=80:
