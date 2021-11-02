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

import {_, _l} from 'gmp/locale/lang';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter, {OVALDEFS_FILTER_FILTER} from 'gmp/models/filter';

import {parseFloat} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import DonutChart from 'web/components/chart/donut';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/datadisplayicons'; // eslint-disable-line max-len
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import {
  totalCount,
  percent,
  ovalClassColorScale,
  OVAL_CLASS_TYPES,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len

import PropTypes from 'web/utils/proptypes';

import {OvaldefClassLoader} from './loaders';

const transformClassData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);
    return {
      value: parseFloat(count),
      label: `${OVAL_CLASS_TYPES[value]}`,
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

    if (!isDefined(onFilterChanged)) {
      return;
    }

    const classTerm = FilterTerm.fromString(`class="${filterValue}"`);

    if (isDefined(filter) && filter.hasTerm(classTerm)) {
      return;
    }
    const classFilter = Filter.fromTerm(classTerm);

    const newFilter = isDefined(filter)
      ? filter.copy().and(classFilter)
      : classFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <OvaldefClassLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformClassData}
            dataTitles={[_('Class'), _('# of OVAL Definitions')]}
            dataRow={row => [row.label, row.value]}
            title={({data: tdata}) =>
              _('OVAL Definitions by Class (Total: {{count}})', {
                count: tdata.total,
              })
            }
            initialState={{
              show3d: true,
            }}
            icons={renderDonutChartIcons}
          >
            {({width, height, data: tdata, svgRef, state}) => (
              <DonutChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                show3d={state.show3d}
                showLegend={state.showLegend}
                onDataClick={
                  isDefined(onFilterChanged) ? this.handleDataClick : undefined
                }
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
  dataTitles: [_l('Class'), _l('# of OVAL Defs')],
  dataRow: row => [row.label, row.value],
  dataTransform: transformClassData,
  displayId: 'ovaldef-by-class-table',
  displayName: 'OvaldefClassTableDisplay',
  filtersFilter: OVALDEFS_FILTER_FILTER,
});

registerDisplay(OvaldefClassDisplay.displayId, OvaldefClassDisplay, {
  title: _l('Chart: OVAL Definitions by Class'),
});

registerDisplay(OvaldefClassTableDisplay.displayId, OvaldefClassTableDisplay, {
  title: _l('Table: OVAL Definitions by Class'),
});

// vim: set ts=2 sw=2 tw=80:
