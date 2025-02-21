/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import Filter, {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import React from 'react';
import WordCloudChart from 'web/components/chart/WordCloud';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {randomColor} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {ResultsDescriptionWordCountLoader} from 'web/pages/results/dashboard/Loaders';
import PropTypes from 'web/utils/PropTypes';


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
            dataTransform={transformWordCountData}
            filter={filter}
            showToggleLegend={false}
            title={() => _('Results Description Word Cloud')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <WordCloudChart
                data={tdata}
                height={height}
                svgRef={svgRef}
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
