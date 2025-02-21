/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import React from 'react';
import styled from 'styled-components';
import BarChart from 'web/components/chart/Bar';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {riskFactorColorScale} from 'web/components/dashboard/display/Utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {OsVulnScoreLoader} from 'web/pages/operatingsystems/dashboard/Loaders';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {resultSeverityRiskFactor} from 'web/utils/Severity';
import {formattedUserSettingLongDate} from 'web/utils/userSettingTimeDateFormatters';
import {withRouter} from 'web/utils/withRouter';


const ToolTip = styled.div`
  font-weight: normal;
  text-align: center;
  line-height: 1.2em;
`;

const transformVulnScoreData = (data = {}) => {
  const {groups = []} = data;
  const tdata = groups
    .filter(group => {
      const {stats = {}} = group;
      const {average_severity_score = 0} = stats;
      return parseFloat(average_severity_score.max) > 0;
    })
    .map(group => {
      const {stats, text, value: id} = group;
      const {hosts, modified, name} = text;
      const {average_severity, average_severity_score} = stats;
      const averageSeverity = parseSeverity(average_severity.mean);
      const riskFactor = resultSeverityRiskFactor(averageSeverity);
      const modifiedDate = formattedUserSettingLongDate(modified);
      const toolTip = (
        <ToolTip>
          <b>{name}:</b>
          <br />
          {average_severity_score.max}
          <br />
          {_('{{hosts}} Host(s) with average severity {{avgSev}}', {
            hosts: parseFloat(hosts),
            avgSev: parseFloat(averageSeverity),
          })}
          <br />
          <b>{_('Updated: ')}</b>
          {modifiedDate}
        </ToolTip>
      );

      return {
        y: parseFloat(average_severity_score.max),
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
    const {navigate} = this.props;

    navigate(`/operatingsystem/${data.id}`);
  }

  render() {
    const {filter, ...props} = this.props;
    return (
      <OsVulnScoreLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            dataTransform={transformVulnScoreData}
            filter={filter}
            showToggleLegend={false}
            title={() => _('Most Vulnerable Operating Systems')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <BarChart
                horizontal
                data={tdata}
                height={height}
                showLegend={false}
                svgRef={svgRef}
                width={width}
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
  navigate: PropTypes.func.isRequired,
};

OsVulnScoreDisplay.displayId = 'os-by-most-vulnerable';

OsVulnScoreDisplay = compose(
  withRouter,
  withFilterSelection({
    filtersFilter: OS_FILTER_FILTER,
  }),
)(OsVulnScoreDisplay);

export const OsVulnScoreTableDisplay = createDisplay({
  loaderComponent: OsVulnScoreLoader,
  displayComponent: DataTableDisplay,
  dataTitles: [_l('Operating System Name'), _l('Max. Average Severity Score')],
  dataRow: row => [row.x, row.y],
  dataTransform: transformVulnScoreData,
  title: ({data: tdata}) => _('Most Vulnerable Operating Systems'),
  displayId: 'os-by-most-vulnerable-table',
  displayName: 'OsVulnScoreTableDisplay',
  filtersFilter: OS_FILTER_FILTER,
});

registerDisplay(OsVulnScoreDisplay.displayId, OsVulnScoreDisplay, {
  title: _l('Chart: Operating Systems by Vulnerability Score'),
});

registerDisplay(OsVulnScoreTableDisplay.displayId, OsVulnScoreTableDisplay, {
  title: _l('Table: Operating Systems by Vulnerability Score'),
});
