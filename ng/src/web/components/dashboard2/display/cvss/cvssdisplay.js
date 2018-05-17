/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import {is_defined} from 'gmp/utils/identity';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import {NA_VALUE} from 'web/utils/severity';

import BarChart from 'web/components/chart/bar';

import DataDisplay from '../datadisplay';

import transformCvssData from './cvsstransform';

class CvssDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    const {filterValue = {}} = data;
    const {start, end} = filterValue;

    let statusFilter;

    if (is_defined(start) && start > 0 && end < 10) {
      const startTerm = FilterTerm.fromString(`severity>${start}`);
      const endTerm = FilterTerm.fromString(`severity<${end}`);

      if (is_defined(filter) && filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)) {
        return;
      }

      statusFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    }
    else {
      let statusTerm;

      if (is_defined(start)) {

        if (start > 0) {
          statusTerm = FilterTerm.fromString(`severity>${start}`);
        }
        else if (start === NA_VALUE) {
          statusTerm = FilterTerm.fromString('severity=""');
        }
        else {
          statusTerm = FilterTerm.fromString(`severity=${start}`);
        }
      }

      if (is_defined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      statusFilter = Filter.fromTerm(statusTerm);
    }

    const newFilter = is_defined(filter) ? filter.copy().and(statusFilter) :
      statusFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      title,
      yLabel,
      xLabel = _('Severity'),
      onFilterChanged,
      ...props
    } = this.props;
    return (
      <DataDisplay
        {...props}
        dataTransform={transformCvssData}
        title={title}
      >
        {({width, height, data, svgRef}) => (
          <BarChart
            svgRef={svgRef}
            displayLegend={false}
            width={width}
            height={height}
            data={data}
            xLabel={xLabel}
            yLabel={yLabel}
            onDataClick={is_defined(onFilterChanged) ?
              this.handleDataClick : undefined}
          />
        )}
      </DataDisplay>
    );
  }
}

CvssDisplay.propTypes = {
  filter: PropTypes.filter,
  title: PropTypes.func.isRequired,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  onFilterChanged: PropTypes.func,
};

export default CvssDisplay;

// vim: set ts=2 sw=2 tw=80:
