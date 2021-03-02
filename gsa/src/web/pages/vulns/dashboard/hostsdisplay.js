/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {format as d3format} from 'd3-format';

import {_, _l} from 'gmp/locale/lang';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter, {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

import BarChart from 'web/components/chart/bar';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {
  vulnsByHostsColorScale,
  percent,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import PropTypes from 'web/utils/proptypes';

import {VulnsHostsLoader} from './loaders';

const format = d3format('0.1f');

const calculateBins = (minHosts, maxHosts, totalVulns) => {
  if (totalVulns === 0) {
    return [];
  }

  // calculate number of bins dependent on number of all vulns
  let binQuantity = Math.ceil(Math.log2(totalVulns)) + 1;
  const binWidth =
    minHosts === maxHosts ? 1 : Math.ceil((maxHosts - minHosts) / binQuantity);
  binQuantity = Math.floor((maxHosts - minHosts) / binWidth) + 1;

  // set borders and color of bins
  const bins = [];
  for (let binIndex = 0; binIndex < binQuantity; binIndex++) {
    const min = minHosts + binIndex * binWidth;
    const max = minHosts + (binIndex + 1) * binWidth - 1;

    const perc = binIndex / binQuantity;
    const color = vulnsByHostsColorScale(perc);

    bins[binIndex] = {
      min,
      max,
      color,
      binWidth,
    };
  }
  return bins;
};

const transformHostsData = (data = {}) => {
  const {groups = []} = data;

  // get highest cumulative count of vulns to use as total
  const totalVulns =
    groups.length > 0 ? Math.max(...groups.map(val => val.c_count)) : 0;

  // get lowest and highest count of hosts to specify range
  const minHosts =
    groups.length > 0 ? Math.min(...groups.map(val => val.value)) : 0;
  const maxHosts =
    groups.length > 0 ? Math.max(...groups.map(val => val.value)) : 0;

  const bins = calculateBins(minHosts, maxHosts, totalVulns);

  const tdata = bins.map(bin => {
    const {min, max, color, binWidth} = bin;
    const binWithAllMembers = groups.filter(
      group => group.value >= min && group.value <= max,
    );
    const sumOfBinMembers = binWithAllMembers.reduce(
      (prev, current) => prev + parseFloat(current.count),
      0,
    );
    const yValue = sumOfBinMembers;
    const perc = percent(yValue, totalVulns);

    const filterValue = {
      start: min,
      end: max,
    };

    return {
      x: binWidth > 1 ? `${min}-${max}` : min,
      y: yValue,
      label: 'label',
      toolTip: `${min} - ${max}: ${yValue} (${format(perc)}%)`,
      color: color,
      id: max,
      filterValue,
    };
  });

  tdata.total = totalVulns;
  return tdata;
};

export class VulnsHostsDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    const {filterValue = {}} = data;
    const {start, end} = filterValue;

    let hostFilter;

    if (isDefined(start) && start > 0) {
      const startTerm = FilterTerm.fromString(`hosts>${start - 1}`);
      const endTerm = FilterTerm.fromString(`hosts<${end + 1}`);

      if (
        isDefined(filter) &&
        filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)
      ) {
        return;
      }
      hostFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    } else {
      let hostTerm;

      if (isDefined(start)) {
        if (start === 0) {
          hostTerm = FilterTerm.fromString(`hosts=${start}`);
        }
      } else {
        hostTerm = FilterTerm.fromString(`hosts=""`);
      }

      if (isDefined(filter) && filter.hasTerm(hostTerm)) {
        return;
      }

      hostFilter = Filter.fromTerm(hostTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(hostFilter)
      : hostFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <VulnsHostsLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformHostsData}
            title={({data: tdata}) =>
              _('Vulnerabilities by Hosts (Total: {{count}})', {
                count: tdata.total,
              })
            }
            showToggleLegend={false}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BarChart
                svgRef={svgRef}
                data={tdata}
                showLegend={false}
                height={height}
                width={width}
                xLabel={_('# of Hosts')}
                yLabel={_('# of Vulnerabilities')}
                onDataClick={
                  isDefined(onFilterChanged) ? this.handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </VulnsHostsLoader>
    );
  }
}

VulnsHostsDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

VulnsHostsDisplay = withFilterSelection({
  filtersFilter: VULNS_FILTER_FILTER,
})(VulnsHostsDisplay);

VulnsHostsDisplay.displayId = 'vuln-by-hosts';

export const VulnsHostsTableDisplay = createDisplay({
  loaderComponent: VulnsHostsLoader,
  displayComponent: DataTableDisplay,
  dataTransform: transformHostsData,
  dataTitles: [_l('# of Hosts'), _l('# of Vulnerabilities')],
  dataRow: row => [row.x, row.y],
  title: ({data: tdata}) =>
    _('Vulnerabilities by Hosts (Total: {{count}})', {count: tdata.total}),
  displayId: 'vuln-by-hosts-table',
  displayName: 'VulnsHostsTableDisplay',
  filtersFilter: VULNS_FILTER_FILTER,
});

registerDisplay(VulnsHostsDisplay.displayId, VulnsHostsDisplay, {
  title: _l('Chart: Vulnerabilities by Hosts'),
});

registerDisplay(VulnsHostsTableDisplay.displayId, VulnsHostsTableDisplay, {
  title: _l('Table: Vulnerabilities by Hosts'),
});

// vim: set ts=2 sw=2 tw=80:
