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

import {resultSeverityRiskFactor} from '../../../utils/severity';
import PropTypes from '../../../utils/proptypes';

import BarChart from '../../../components/chart/bar';

import DataDisplay from '../../../components/dashboard2/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard2/display/datatabledisplay'; // eslint-disable-line max-len
import {
  riskFactorColorScale,
} from '../../../components/dashboard2/display/utils';
import {registerDisplay} from 'web/components/dashboard2/registry';

import {HostsVulnScoreLoader} from './loaders';

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
      const {severity = 0} = stats;
      return parse_float(severity.max) > 0;
    })
    .map(group => {
      const {stats, text, value: id} = group;
      const {modified, name} = text;
      const {severity} = stats;
      const averageSeverity = parse_severity(severity.mean);
      const riskFactor = resultSeverityRiskFactor(averageSeverity);
      const modifiedDate = moment(modified).format('lll');
      const toolTip = (
        <ToolTip>
          <b>{name}:</b><br/>
          {_('{{sevMax}}: ({{riskFactor}})',
            {
              sevMax: severity.max,
              riskFactor,
            })}<br/>
          <b>{_('Updated: ')}</b>{modifiedDate}
        </ToolTip>
      );

      return {
        y: parse_float(severity.max),
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
    const {router} = this.props;

    router.push(`/ng/host/${data.id}`);
  }

  render() {
    const {
      filter,
      ...props
    } = this.props;
    return (
      <HostsVulnScoreLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformVulnScoreData}
            title={() => _('Most Vulnerable Hosts')}
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
      </HostsVulnScoreLoader>
    );
  }
}

HostsVulnScoreDisplay.propTypes = {
  filter: PropTypes.filter,
  router: PropTypes.object.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

HostsVulnScoreDisplay = withRouter(HostsVulnScoreDisplay);

HostsVulnScoreDisplay.displayId = 'host-by-most-vulnerable';

export const HostsVulnScoreTableDisplay = ({
  filter,
  ...props
}) => (
  <HostsVulnScoreLoader
    filter={filter}
  >
    {loaderProps => (
      <DataTableDisplay
        {...props}
        {...loaderProps}
        dataTransform={transformVulnScoreData}
        dataTitles={[
          _('Host Name'),
          _('Max. average Severity Score'),
        ]}
        dataRow={({row}) => [row.x, row.y]}
        title={() => _('Most Vulnerable Hosts')}
      />
    )}
  </HostsVulnScoreLoader>
);

HostsVulnScoreTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

HostsVulnScoreTableDisplay.displayId = 'host-by-most-vulnerable-table';

registerDisplay(HostsVulnScoreDisplay.displayId, HostsVulnScoreDisplay, {
    title: _('Chart: Hosts by Vulnerability Score'),
  },
);

registerDisplay(HostsVulnScoreTableDisplay.displayId,
  HostsVulnScoreTableDisplay, {
    title: _('Table: Hosts by Vulnerability Score'),
  },
);

// vim: set ts=2 sw=2 tw=80:
