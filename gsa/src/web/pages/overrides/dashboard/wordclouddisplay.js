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
import Filter, {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import {parse_float} from 'gmp/parser';
import {is_defined} from 'gmp/utils/identity';
import {is_empty} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';

import WordCloudChart from 'web/components/chart/wordcloud';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import {randomColor} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import {OverridesWordCountLoader} from './loaders';

const transformWordCountData = (data = {}) => {
  const {groups = []} = data;
  const tdata = groups
    .map(group => {
      const {count, value} = group;
      return {
        value: parse_float(count),
        label: value,
        color: randomColor(),
        filterValue: value,
      };
    });
  return tdata;
};

export class OverridesWordCloudDisplay extends React.Component {

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
      const wordTerm = FilterTerm.fromString(`text~"${filterValue}"`);

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
      <OverridesWordCountLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformWordCountData}
            title={({data: tdata}) =>
            _('Overrides Text Word Cloud')}
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
      </OverridesWordCountLoader>
    );
  }
}

OverridesWordCloudDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

OverridesWordCloudDisplay = withFilterSelection({
  filtersFilter: OVERRIDES_FILTER_FILTER,
})(OverridesWordCloudDisplay);

OverridesWordCloudDisplay.displayId = 'override-by-text-words';

export const OverridesWordCloudTableDisplay = createDisplay({
  loaderComponent: OverridesWordCountLoader,
  displayComponent: DataTableDisplay,
  dataTransform: transformWordCountData,
  dataRow: row => [row.label, row.value],
  dataTitles: [
    _('Text'),
    _('Count'),
  ],
  title: ({data: tdata}) => _('Overrides Text Word Cloud'),
  displayId: 'override-by-text-words-table',
  displayName: 'OverridesWordCloudTableDisplay',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(OverridesWordCloudDisplay.displayId,
  OverridesWordCloudDisplay, {
    title: _('Chart: Overrides Text Word Cloud'),
  },
);

registerDisplay(OverridesWordCloudTableDisplay.displayId,
  OverridesWordCloudTableDisplay, {
    title: _('Table: Overrides Text Word Cloud'),
  },
);

// vim: set ts=2 sw=2 tw=80:
