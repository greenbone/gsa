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
import {shortDate} from 'gmp/locale/date';

import Filter, {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';

import {parseInt, parseDate} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import LineChart, {lineDataPropType} from 'web/components/chart/line';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import {totalCount} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import {TlsCertificatesModifiedLoader} from './loaders';

const transformModified = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);
  const tdata = groups.map(group => {
    const {value, count, c_count} = group;
    const modified = parseDate(value);
    return {
      x: modified,
      label: shortDate(modified),
      y: parseInt(count),
      y2: parseInt(c_count),
    };
  });

  tdata.total = sum;
  return tdata;
};

export class TlsCertificatesModifiedDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleRangeSelect = this.handleRangeSelect.bind(this);
  }

  handleRangeSelect(start, end) {
    const {filter, onFilterChanged} = this.props;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    let {x: startDate} = start;
    let {x: endDate} = end;
    const dateFormat = 'YYYY-MM-DDTHH:mm';

    let newFilter = isDefined(filter) ? filter.copy() : new Filter();

    if (isDefined(startDate)) {
      if (startDate.isSame(endDate)) {
        startDate = startDate.clone().subtract(1, 'day');
        endDate = endDate.clone().add(1, 'day');
      }

      const startTerm = FilterTerm.fromString(
        `modified>${startDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(startTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(startTerm));
      }
    }

    if (isDefined(endDate)) {
      const endTerm = FilterTerm.fromString(
        `modified<${endDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(endTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(endTerm));
      }
    }

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, ...props} = this.props;
    return (
      <TlsCertificatesModifiedLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformModified}
            filter={filter}
            title={({data: tdata}) =>
              _('TLS Certificates by Modification Time (Total: {{count}})', {
                count: tdata.total,
              })
            }
          >
            {({width, height, data: tdata, svgRef, state}) => (
              <LineChart
                timeline
                svgRef={svgRef}
                width={width}
                height={height}
                data={tdata}
                yAxisLabel={_('# of Modified TLS Certificates')}
                y2AxisLabel={_('Total TLS Certificates')}
                xAxisLabel={_('Time')}
                yLine={{
                  color: Theme.darkGreenTransparent,
                  label: _('Modified TLS Certificates'),
                }}
                y2Line={{
                  color: Theme.darkGreenTransparent,
                  dashArray: '3, 2',
                  label: _('Total TLS Certificates'),
                }}
                showLegend={state.showLegend}
                onRangeSelected={this.handleRangeSelect}
              />
            )}
          </DataDisplay>
        )}
      </TlsCertificatesModifiedLoader>
    );
  }
}

TlsCertificatesModifiedDisplay.propTypes = {
  filter: PropTypes.filter,
  xAxisLabel: PropTypes.string,
  y2AxisLabel: PropTypes.string,
  y2Line: lineDataPropType,
  yAxisLabel: PropTypes.string,
  yLine: lineDataPropType,
  onFilterChanged: PropTypes.func,
};

TlsCertificatesModifiedDisplay = withFilterSelection({
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
})(TlsCertificatesModifiedDisplay);

TlsCertificatesModifiedDisplay.displayId =
  'tls-certificates-by-modification-time';

export const TlsCertificatesModifiedTableDisplay = createDisplay({
  loaderComponent: TlsCertificatesModifiedLoader,
  displayComponent: DataTableDisplay,
  dataTransform: transformModified,
  title: ({data: tdata}) =>
    _('TLS Certificates by Modification Time (Total: {{count}})', {
      count: tdata.total,
    }),
  dataTitles: [
    _l('Creation Time'),
    _l('# of Modified Certificates'),
    _l('Total Certificates'),
  ],
  dataRow: row => [row.label, row.y, row.y2],
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
  displayId: 'tls-certificates-by-modification-time-table',
  displayName: 'TlsCertificatesModifiedTableDisplay',
});

registerDisplay(
  TlsCertificatesModifiedDisplay.displayId,
  TlsCertificatesModifiedDisplay,
  {
    title: _l('Chart: TLS Certificates by Modification Time'),
  },
);

registerDisplay(
  TlsCertificatesModifiedTableDisplay.displayId,
  TlsCertificatesModifiedTableDisplay,
  {
    title: _l('Table: TLS Certificates by Modification Time'),
  },
);

// vim: set ts=2 sw=2 tw=80:
