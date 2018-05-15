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

import {withRouter} from 'react-router';

import glamorous from 'glamorous';

import moment from 'moment';

import _ from 'gmp/locale';

import {parse_float, parse_severity} from 'gmp/parser';

import {OS_FILTER_FILTER} from 'gmp/models/filter';

import {resultSeverityRiskFactor} from 'web/utils/severity';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';

import BarChart from 'web/components/chart/bar';

import DataDisplay from 'web/components/dashboard2/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard2/display/datatabledisplay'; // eslint-disable-line max-len
import withFilterSelection from 'web/components/dashboard2/display/withFilterSelection'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard2/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard2/registry';
import {
  riskFactorColorScale,
} from 'web/components/dashboard2/display/utils';

import {OsVulnScoreLoader} from './loaders';

const ToolTip = glamorous.div({
    fontWeight: 'normal',
    textAlign: 'center',
    lineHeight: '1.2em',
  });

const transformVulnScoreData = (data = {}, {severityClass}) => {
  const {groups = []} = data;
  const tdata = groups
    .filter(group => {
      const {stats = {}} = group;
      const {average_severity_score = 0} = stats;
      return parse_float(average_severity_score.max) > 0;
    })
    .map(group => {
      const {stats, text, value: id} = group;
      const {hosts, modified, name} = text;
      const {average_severity, average_severity_score} = stats;
      const averageSeverity = parse_severity(average_severity.mean);
      const riskFactor = resultSeverityRiskFactor(averageSeverity);
      const modifiedDate = moment(modified).format('lll');
      const toolTip = (
        <ToolTip>
          <b>{name}:</b><br/>
          {average_severity_score.max}<br/>
          {_('{{hosts}} Host(s) with average severity {{avgSev}}',
            {
              hosts: parse_float(hosts),
              avgSev: parse_float(averageSeverity),
            })}<br/>
          <b>{_('Updated: ')}</b>{modifiedDate}
        </ToolTip>
      );

      return {
        y: parse_float(average_severity_score.max),
        x: name,
        label: name,
        color: riskFactorColorScale(riskFactor),
        toolTip,
        id,
      };
    });
  return tdata.reverse();
};

export class OsVulnScoreDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {router} = this.props;

    router.push(`/ng/operatingsystem/${data.id}`);
  }

  render() {
    const {
      filter,
      ...props
    } = this.props;
    return (
      <OsVulnScoreLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformVulnScoreData}
            title={() => _('Most Vulnerable Operating Systems')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BarChart
                svgRef={svgRef}
                horizontal
                displayLegend={false}
                width={width}
                height={height}
                data={tdata}
                xLabel={_('Vulnerability (Severity) Score')}
                onDataClick={this.handleDataClick}
              />
            )}
          </DataDisplay>
        )}
      </OsVulnScoreLoader>
    );
  }
}

OsVulnScoreDisplay.propTypes = {
  filter: PropTypes.filter,
  router: PropTypes.object.isRequired,
};

OsVulnScoreDisplay.displayId = 'os-by-most-vulnerable';

OsVulnScoreDisplay = compose(
  withRouter,
  withFilterSelection({
    filtersFilter: OS_FILTER_FILTER,
  })
)(OsVulnScoreDisplay);

export const OsVulnScoreTableDisplay = createDisplay({
  loaderComponent: OsVulnScoreLoader,
  displayComponent: DataTableDisplay,
  dataTitles: [
    _('Operating Sytem Name'),
    _('Max. Average Severity Score'),
  ],
  dataRow: row => [row.x, row.y],
  dataTransform: transformVulnScoreData,
  title: ({data: tdata}) => _('Most Vulnerable Operating Systems'),
  displayId: 'os-by-most-vulnerable-table',
  displayName: 'OsVulnScoreTableDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

registerDisplay(
  OsVulnScoreDisplay.displayId, OsVulnScoreDisplay, {
    title: _('Chart: Operating Systems by Vulnerability Score'),
  },
);

registerDisplay(
  OsVulnScoreTableDisplay.displayId,
  OsVulnScoreTableDisplay, {
    title: _('Table: Operating Systems by Vulnerability Score'),
  }
);

// vim: set ts=2 sw=2 tw=80:
