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
import Filter, {OVALDEFS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat} from 'gmp/parser';
import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../../utils/proptypes';

import DonutChart from '../../../components/chart/donut3d';
import DataDisplay from '../../../components/dashboard/display/datadisplay';
import DataTableDisplay from '../../../components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import {
  totalCount,
  percent,
  ovalClassColorScale,
  OVAL_CLASS_TYPES,
} from '../../../components/dashboard/display/utils';
import {registerDisplay} from '../../../components/dashboard/registry';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len

import {OvaldefClassLoader} from './loaders';

const transformClassData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);
    return {
      value: parseFloat(count),
      label: OVAL_CLASS_TYPES[value],
      toolTip: `${OVAL_CLASS_TYPES[value]}: ${perc}% (${count})`,
      color: ovalClassColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

export class OvaldefClassDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue} = data;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    const classTerm = FilterTerm.fromString(`class="${filterValue}"`);

    if (is_defined(filter) && filter.hasTerm(classTerm)) {
      return;
    }
    const classFilter = Filter.fromTerm(classTerm);

    const newFilter = is_defined(filter) ? filter.copy().and(classFilter) :
      classFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      filter,
      onFilterChanged,
      ...props
    } = this.props;

    return (
      <OvaldefClassLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformClassData}
            dataTitles={[_('Class'), _('# of OVAL Definitions')]}
            dataRow={row => [row.label, row.value]}
            title={({data: tdata}) =>
              _('OVAL Definitions by Class (Total: {{count}})',
              {count: tdata.total})}
          >
            {({width, height, data: tdata, svgRef}) => (
              <DonutChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                onDataClick={is_defined(onFilterChanged) ?
                  this.handleDataClick : undefined}
              />
            )}
          </DataDisplay>
        )}
      </OvaldefClassLoader>
    );
  }
}

OvaldefClassDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func.isRequired,
};

OvaldefClassDisplay = withFilterSelection({
  filtersFilter: OVALDEFS_FILTER_FILTER,
})(OvaldefClassDisplay);

OvaldefClassDisplay.displayId = 'ovaldef-by-class';

export const OvaldefClassTableDisplay = createDisplay({
  loaderComponent: OvaldefClassLoader,
  displayComponent: DataTableDisplay,
  title: ({data: tdata}) =>
    _('OVAL Definitions by Class (Total: {{count}})', {count: tdata.total}),
  dataTitles: [_('Class'), _('# of OVAL Defs')],
  dataRow: row => [row.label, row.value],
  dataTransform: transformClassData,
  displayId: 'ovaldef-by-class-table',
  displayName: 'OvaldefClassTableDisplay',
  filtersFilter: OVALDEFS_FILTER_FILTER,
});

registerDisplay(OvaldefClassDisplay.displayId, OvaldefClassDisplay, {
  title: _('Chart: OVAL Definitions by Class'),
});

registerDisplay(OvaldefClassTableDisplay.displayId, OvaldefClassTableDisplay, {
  title: _('Table: OVAL Definitions by Class'),
});

// vim: set ts=2 sw=2 tw=80:
