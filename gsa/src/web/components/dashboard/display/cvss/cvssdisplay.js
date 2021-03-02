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

import _ from 'gmp/locale';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import BarChart from 'web/components/chart/bar';

import DataDisplay from 'web/components/dashboard/display/datadisplay';

import PropTypes from 'web/utils/proptypes';
import {NA_VALUE} from 'web/utils/severity';

import transformCvssData from './cvsstransform';

class CvssDisplay extends React.Component {
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

    let statusFilter;

    if (isDefined(start) && start > 0 && end < 10) {
      const startTerm = FilterTerm.fromString(`severity>${start}`);
      const endTerm = FilterTerm.fromString(`severity<${end}`);

      if (
        isDefined(filter) &&
        filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)
      ) {
        return;
      }

      statusFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    } else {
      let statusTerm;

      if (isDefined(start)) {
        if (start > 0) {
          statusTerm = FilterTerm.fromString(`severity>${start}`);
        } else if (start === NA_VALUE) {
          statusTerm = FilterTerm.fromString('severity=""');
        } else {
          statusTerm = FilterTerm.fromString(`severity=${start}`);
        }
      }

      if (isDefined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      statusFilter = Filter.fromTerm(statusTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(statusFilter)
      : statusFilter;

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
        showToggleLegend={false}
      >
        {({width, height, data, svgRef}) => (
          <BarChart
            svgRef={svgRef}
            showLegend={false}
            width={width}
            height={height}
            data={data}
            xLabel={xLabel}
            yLabel={yLabel}
            onDataClick={
              isDefined(onFilterChanged) ? this.handleDataClick : undefined
            }
          />
        )}
      </DataDisplay>
    );
  }
}

CvssDisplay.propTypes = {
  filter: PropTypes.filter,
  title: PropTypes.func.isRequired,
  xLabel: PropTypes.toString,
  yLabel: PropTypes.toString,
  onFilterChanged: PropTypes.func,
};

export default CvssDisplay;

// vim: set ts=2 sw=2 tw=80:
