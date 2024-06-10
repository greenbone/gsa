/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter, {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

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
  const tdata = groups.map(group => {
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

    if (!isDefined(onFilterChanged)) {
      return;
    }

    let wordFilter;

    if (!isEmpty(filterValue)) {
      const wordTerm = FilterTerm.fromString(`description~"${filterValue}"`);

      if (isDefined(filter) && filter.hasTerm(wordTerm)) {
        return;
      }
      wordFilter = Filter.fromTerm(wordTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(wordFilter)
      : wordFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <ResultsDescriptionWordCountLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformWordCountData}
            title={() => _('Results Description Word Cloud')}
            showToggleLegend={false}
          >
            {({width, height, data: tdata, svgRef}) => (
              <WordCloudChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                onDataClick={
                  isDefined(onFilterChanged) ? this.handleDataClick : undefined
                }
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
  dataTitles: [_l('Description'), _l('Word Count')],
  dataRow: row => [row.label, row.value],
  title: () => _('Results Description Word Cloud'),
  displayId: 'result-by-desc-words-table',
  displayName: 'ResultsDescriptionWordCloudTableDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

registerDisplay(
  ResultsDescriptionWordCloudDisplay.displayId,
  ResultsDescriptionWordCloudDisplay,
  {
    title: _l('Chart: Results Description Word Cloud'),
  },
);

registerDisplay(
  ResultsDescriptionWordCloudTableDisplay.displayId,
  ResultsDescriptionWordCloudTableDisplay,
  {
    title: _l('Table: Results Description Word Cloud'),
  },
);

// vim: set ts=2 sw=2 tw=80:
