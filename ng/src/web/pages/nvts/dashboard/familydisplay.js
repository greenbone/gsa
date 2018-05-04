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

import _ from 'gmp/locale';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

import {parse_float, parse_severity} from 'gmp/parser';

import {is_defined} from 'gmp/utils/identity';
import {is_empty} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';
import {severityFormat} from 'web/utils/render';
import {resultSeverityRiskFactor} from 'web/utils/severity';

import BubbleChart from 'web/components/chart/bubble';

import DataDisplay from 'web/components/dashboard2/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard2/display/datatabledisplay'; // eslint-disable-line max-len
import {riskFactorColorScale} from 'web/components/dashboard2/display/utils';
import {registerDisplay} from 'web/components/dashboard2/registry';

import {NvtsFamilyLoader} from './loaders';

const transformFamilyData = (data = {}, {severityClass}) => {
  const {groups = []} = data;
  const totalNvts = groups.reduce((prev, current) =>
    prev + parse_float(current.count), 0);

  const tdata = groups
    .map(family => {
      const {count, value} = family;
      const severity = parse_severity(family.stats.severity.mean);
      const riskFactor = resultSeverityRiskFactor(severity, severityClass);
      const formattedSeverity = severityFormat(severity);
      const toolTip = _('{{value}}: {{count}} (severity: {{severity}})',
        {
          value: value,
          count: count,
          severity: formattedSeverity,
        });

      return {
        value: parse_float(count),
        color: riskFactorColorScale(riskFactor),
        label: value,
        toolTip,
        severity: formattedSeverity,
        filterValue: value,
      };
    });

  tdata.total = totalNvts;
  return tdata;
};

export class NvtsFamilyDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    const {filterValue = ''} = data;

    let familyFilter;

    if (!is_empty(filterValue)) {
      const familyTerm = FilterTerm.fromString(`family="${filterValue}"`);

      if (is_defined(filter) && filter.hasTerm(familyTerm)) {
        return;
      }
      familyFilter = Filter.fromTerm(familyTerm);
    }

    const newFilter = is_defined(filter) ? filter.copy().and(familyFilter) :
      familyFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      filter,
      ...props
    } = this.props;

    return (
      <NvtsFamilyLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformFamilyData}
            title={({data: tdata}) =>
            _('NVTS by Family (Total: {{count}})', {count: tdata.total})}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BubbleChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                onDataClick={this.handleDataClick}
              />
            )}
          </DataDisplay>
        )}
      </NvtsFamilyLoader>
    );
  }
}

NvtsFamilyDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
};

NvtsFamilyDisplay.displayId = 'nvt-by-family';

export const NvtsFamilyTableDisplay = ({
  filter,
  ...props
}) => (
  <NvtsFamilyLoader
    filter={filter}
  >
    {loaderProps => (
      <DataTableDisplay
        {...props}
        {...loaderProps}
        dataTitles={[
          _('NVT Familiy'),
          _('# of NVTs'),
          _('Severity'),
        ]}
        dataRow={({row}) => [row.label, row.value, row.severity]}
        dataTransform={transformFamilyData}
        title={({data: tdata}) =>
          _('NVTS by Family (Total: {{count}})', {count: tdata.total})}
      />
    )}
  </NvtsFamilyLoader>
);

NvtsFamilyTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

NvtsFamilyTableDisplay.displayId = 'nvt-by-family-table';

registerDisplay(NvtsFamilyDisplay.displayId, NvtsFamilyDisplay, {
  title: _('Chart: NVTs by Family'),
});

registerDisplay(NvtsFamilyTableDisplay.displayId, NvtsFamilyTableDisplay, {
  title: _('Table: NVTs by Family'),
});

// vim: set ts=2 sw=2 tw=80:
