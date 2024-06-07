/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';

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

    if (!isDefined(onFilterChanged)) {
      return;
    }

    const {filterValue = {}} = data;
    const {start, end} = filterValue;

    let statusFilter;

    if (isDefined(start) && isDefined(end) && start >= 0) {
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
        statusTerm = FilterTerm.fromString(`severity=${start}`);
      } else {
        statusTerm = FilterTerm.fromString('severity=""');
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
