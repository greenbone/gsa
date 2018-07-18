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
import Filter, {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat} from 'gmp/parser';
import {is_defined} from 'gmp/utils/identity';
import {is_empty} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';

import WordCloudChart from 'web/components/chart/wordcloud';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {randomColor} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import {ResultsDescriptionWordCountLoader} from './loaders';

const transformWordCountData = (data = {}) => {
  const {groups = []} = data;
  const tdata = groups
    .map(group => {
      const {count, value} = group;
      return {
        value: parseFloat(count),
        label: value,
        color: randomColor(),
        filterValue: value,
      };
    });
  return tdata;
};

export class ResultsDescriptionWordCloudDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(filterValue) {
    const {onFilterChanged, filter} = this.props;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    let wordFilter;

    if (!is_empty(filterValue)) {
      const wordTerm = FilterTerm.fromString(`description~"${filterValue}"`);

      if (is_defined(filter) && filter.hasTerm(wordTerm)) {
        return;
      }
      wordFilter = Filter.fromTerm(wordTerm);
    }

    const newFilter = is_defined(filter) ? filter.copy().and(wordFilter) :
      wordFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      filter,
      onFilterChanged,
      ...props
    } = this.props;

    return (
      <ResultsDescriptionWordCountLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformWordCountData}
            title={({data: tdata}) =>
            _('Results Description Word Cloud')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <WordCloudChart
                svgRef={svgRef}
                data={tdata}
                displayLegend={false}
                height={height}
                width={width}
                onDataClick={is_defined(onFilterChanged) ?
                  this.handleDataClick : undefined}
              />
            )}
          </DataDisplay>
        )}
      </ResultsDescriptionWordCountLoader>
    );
  }
}

ResultsDescriptionWordCloudDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

ResultsDescriptionWordCloudDisplay = withFilterSelection({
  filtersFilter: RESULTS_FILTER_FILTER,
})(ResultsDescriptionWordCloudDisplay);

ResultsDescriptionWordCloudDisplay.displayId = 'result-by-desc-words';

export const ResultsDescriptionWordCloudTableDisplay = createDisplay({
  loaderComponent: ResultsDescriptionWordCountLoader,
  displayComponent: DataTableDisplay,
  dataTransform: transformWordCountData,
  dataTitles: [
    _('Description'),
    _('Word Count'),
  ],
  dataRow: row => [row.label, row.value],
  title: ({data: tdata}) => _('Results Description Word Cloud'),
  displayId: 'result-by-desc-words-table',
  displayName: 'ResultsDescriptionWordCloudTableDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

registerDisplay(ResultsDescriptionWordCloudDisplay.displayId,
  ResultsDescriptionWordCloudDisplay, {
    title: _('Chart: Results Description Word Cloud'),
  },
);

registerDisplay(ResultsDescriptionWordCloudTableDisplay.displayId,
  ResultsDescriptionWordCloudTableDisplay, {
    title: _('Table: Results Description Word Cloud'),
  },
);

// vim: set ts=2 sw=2 tw=80:
