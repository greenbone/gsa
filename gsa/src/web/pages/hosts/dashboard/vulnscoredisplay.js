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

import {withRouter} from 'react-router-dom';

import styled from 'styled-components';

import {_, _l} from 'gmp/locale/lang';
import {longDate} from 'gmp/locale/date';

import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';

import {parseFloat, parseSeverity} from 'gmp/parser';

import BarChart from 'web/components/chart/bar';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';
import {resultSeverityRiskFactor} from 'web/utils/severity';

import {HostsVulnScoreLoader} from './loaders';

const ToolTip = styled.div`
  font-weight: normal;
  text-align: center;
  line-height: 1.2em;
`;

const transformVulnScoreData = (data = {}, {severityClass}) => {
  const {groups = []} = data;
  const tdata = groups
    .filter(group => {
      const {stats = {}} = group;
      const {severity = 0} = stats;
      return parseFloat(severity.max) > 0;
    })
    .map(group => {
      const {stats, text, value: id} = group;
      const {modified, name} = text;
      const {severity} = stats;
      const averageSeverity = parseSeverity(severity.mean);
      const riskFactor = resultSeverityRiskFactor(averageSeverity);
      const modifiedDate = longDate(modified);
      const toolTip = (
        <ToolTip>
          <b>{name}:</b>
          <br />
          {_('{{sevMax}}: ({{riskFactor}})', {
            sevMax: severity.max,
            riskFactor,
          })}
          <br />
          <b>{_('Updated: ')}</b>
          {modifiedDate}
        </ToolTip>
      );

      return {
        y: parseFloat(severity.max),
        x: name,
        label: name,
        color: riskFactorColorScale(riskFactor),
        toolTip,
        id,
      };
    });
  return tdata.reverse();
};

export class HostsVulnScoreDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {history} = this.props;

    history.push(`/host/${data.id}`);
  }

  render() {
    const {filter, ...props} = this.props;
    return (
      <HostsVulnScoreLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformVulnScoreData}
            title={() => _('Most Vulnerable Hosts')}
            showToggleLegend={false}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BarChart
                svgRef={svgRef}
                horizontal
                showLegend={false}
                width={width}
                height={height}
                data={tdata}
                xLabel={_('Vulnerability (Severity) Score')}
                onDataClick={this.handleDataClick}
              />
            )}
          </DataDisplay>
        )}
      </HostsVulnScoreLoader>
    );
  }
}

HostsVulnScoreDisplay.propTypes = {
  filter: PropTypes.filter,
  history: PropTypes.object.isRequired,
};

HostsVulnScoreDisplay = compose(
  withRouter,
  withFilterSelection({
    filtersFilter: HOSTS_FILTER_FILTER,
  }),
)(HostsVulnScoreDisplay);

HostsVulnScoreDisplay.displayId = 'host-by-most-vulnerable';

export const HostsVulnScoreTableDisplay = createDisplay({
  loaderComponent: HostsVulnScoreLoader,
  displayComponent: DataTableDisplay,
  dataTransform: transformVulnScoreData,
  dataTitles: [_l('Host Name'), _l('Max. average Severity Score')],
  dataRow: row => [row.x, row.y],
  title: () => _('Most Vulnerable Hosts'),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'HostsVulnScoreTableDisplay',
  displayName: 'host-by-most-vulnerable-table',
});

registerDisplay(HostsVulnScoreDisplay.displayId, HostsVulnScoreDisplay, {
  title: _l('Chart: Hosts by Vulnerability Score'),
});

registerDisplay(
  HostsVulnScoreTableDisplay.displayId,
  HostsVulnScoreTableDisplay,
  {
    title: _l('Table: Hosts by Vulnerability Score'),
  },
);

// vim: set ts=2 sw=2 tw=80:
