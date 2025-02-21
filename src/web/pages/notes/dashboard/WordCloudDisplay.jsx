/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import Filter, {NOTES_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import React from 'react';
import WordCloudChart from 'web/components/chart/WordCloud';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {randomColor} from 'web/components/dashboard/display/Utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import PropTypes from 'web/utils/PropTypes';

import {NotesWordCountLoader} from './Loaders';

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

export class NotesWordCloudDisplay extends React.Component {
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
      const wordTerm = FilterTerm.fromString(`text~"${filterValue}"`);

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
      <NotesWordCountLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformWordCountData}
            filter={filter}
            showToggleLegend={false}
            title={() => _('Notes Text Word Cloud')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <WordCloudChart
                data={tdata}
                displayLegend={false}
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
      </NotesWordCountLoader>
    );
  }
}

NotesWordCloudDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

NotesWordCloudDisplay = withFilterSelection({
  filtersFilter: NOTES_FILTER_FILTER,
})(NotesWordCloudDisplay);

NotesWordCloudDisplay.displayId = 'note-by-text-words';

export const NotesWordCloudTableDisplay = createDisplay({
  loaderComponent: NotesWordCountLoader,
  displayComponent: DataTableDisplay,
  dataTransform: transformWordCountData,
  dataRow: row => [row.label, row.value],
  dataTitles: [_l('Text'), _l('Count')],
  title: ({data: tdata}) => _('Notes Text Word Cloud'),
  displayId: 'note-by-text-words-table',
  displayName: 'NotesWordCloudTableDisplay',
  filtersFilter: NOTES_FILTER_FILTER,
});

registerDisplay(NotesWordCloudDisplay.displayId, NotesWordCloudDisplay, {
  title: _l('Chart: Notes Text Word Cloud'),
});

registerDisplay(
  NotesWordCloudTableDisplay.displayId,
  NotesWordCloudTableDisplay,
  {
    title: _l('Table: Notes Text Word Cloud'),
  },
);
