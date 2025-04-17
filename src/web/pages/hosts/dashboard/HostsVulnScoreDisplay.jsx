/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {DEFAULT_SEVERITY_RATING} from 'gmp/utils/severity';
import React from 'react';
import {useNavigate} from 'react-router';
import styled from 'styled-components';
import BarChart from 'web/components/chart/Bar';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';
import {registerDisplay} from 'web/components/dashboard/Registry';
import useGmp from 'web/hooks/useGmp';
import {HostsVulnScoreLoader} from 'web/pages/hosts/dashboard/Loaders';
import PropTypes from 'web/utils/PropTypes';
import {resultSeverityRiskFactor} from 'web/utils/severity';
import {formattedUserSettingLongDate} from 'web/utils/userSettingTimeDateFormatters';

const ToolTip = styled.div`
  font-weight: normal;
  text-align: center;
  line-height: 1.2em;
`;

const transformVulnScoreData = (
  data = {},
  {severityRating = DEFAULT_SEVERITY_RATING},
) => {
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
      const riskFactor = resultSeverityRiskFactor(
        averageSeverity,
        severityRating,
      );
      const modifiedDate = formattedUserSettingLongDate(modified);
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

const HostsVulnScoreDisplay = withFilterSelection({
  filtersFilter: HOSTS_FILTER_FILTER,
})(({filter, ...props}) => {
  const gmp = useGmp();
  const navigate = useNavigate();
  const handleDataClick = data => {
    navigate(`/host/${data.id}`);
  };
  const severityRating = gmp.settings.severityRating;
  return (
    <HostsVulnScoreLoader filter={filter}>
      {loaderProps => (
        <DataDisplay
          {...props}
          {...loaderProps}
          dataTransform={transformVulnScoreData}
          filter={filter}
          severityRating={severityRating}
          showToggleLegend={false}
          title={() => _('Most Vulnerable Hosts')}
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
              onDataClick={handleDataClick}
            />
          )}
        </DataDisplay>
      )}
    </HostsVulnScoreLoader>
  );
});

HostsVulnScoreDisplay.propTypes = {
  filter: PropTypes.filter,
};

HostsVulnScoreDisplay.displayId = 'host-by-most-vulnerable';

export {HostsVulnScoreDisplay};

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
