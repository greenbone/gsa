/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, type ReactNode} from 'react';
import {useNavigate} from 'react-router';
import styled from 'styled-components';
import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {DEFAULT_SEVERITY_RATING, type SeverityRating} from 'gmp/utils/severity';
import BarChart from 'web/components/chart/BarChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {
  HostsVulnerabilityScoreLoader,
  type VulnScoreData,
} from 'web/pages/hosts/dashboard/HostsLoaders';
import {ROUTES} from 'web/route-paths';
import {resultSeverityRiskFactor} from 'web/utils/severity';
import {formattedUserSettingLongDate} from 'web/utils/user-setting-time-date-formatters';

export interface TransformedVulnScoreDataItem {
  y: number;
  x: string;
  label: string;
  color: string;
  toolTip: ReactNode;
  id?: string;
}

type TransformedVulnScoreData = TransformedVulnScoreDataItem[];

export interface TransformVulnScoreDataProps {
  severityRating?: SeverityRating;
}

type HostVulnScoreDataDisplayProps = DataDisplayProps<TransformedVulnScoreData>;

const ToolTip = styled.div`
  font-weight: normal;
  text-align: center;
  line-height: 1.2em;
`;

const transformVulnScoreData = (
  data: VulnScoreData | undefined = {},
  {severityRating = DEFAULT_SEVERITY_RATING}: TransformVulnScoreDataProps = {},
): TransformedVulnScoreDataItem[] => {
  const {groups = []} = data;
  const transformedData = groups
    .filter(group => {
      const {stats = {}} = group;
      const {severity} = stats;
      return (parseFloat(severity?.max) ?? 0) > 0;
    })
    .map(group => {
      const {stats = {}, text, value: id} = group;
      const {modified, name} = text;
      const {severity} = stats;
      const averageSeverity = parseSeverity(severity?.mean) ?? 0;
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
            sevMax: severity?.max ?? 0,
            riskFactor,
          })}
          <br />
          <b>{_('Updated: ')}</b>
          {modifiedDate}
        </ToolTip>
      );

      return {
        y: parseFloat(severity?.max) ?? 0,
        x: name,
        label: name,
        color: riskFactorColorScale(riskFactor),
        toolTip,
        id,
      };
    });
  return transformedData.reverse();
};

export const HostsVulnerabilityScoreDisplay = createDisplay({
  loaderComponent: HostsVulnerabilityScoreLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const navigate = useNavigate();
    const transformedData = useDataTransform(data, transformVulnScoreData, {
      severityRating: gmp.settings.severityRating,
    });
    const handleDataClick = useCallback(
      (data: TransformedVulnScoreDataItem) => {
        void navigate(ROUTES.host.url(data.id ?? ''));
      },
      [navigate],
    );
    return (
      <DataDisplay<TransformedVulnScoreData, HostVulnScoreDataDisplayProps>
        {...props}
        data={transformedData}
        showToggleLegend={false}
        title={() => _('Most Vulnerable Hosts')}
      >
        {({width, height, data, svgRef}) => (
          <BarChart
            horizontal
            data={data}
            height={height}
            svgRef={svgRef}
            width={width}
            xLabel={_('Vulnerability (Severity) Score')}
            onDataClick={handleDataClick}
          />
        )}
      </DataDisplay>
    );
  },
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-most-vulnerable',
  displayName: 'HostsVulnScoreDisplay',
});

export const HostsVulnerabilityScoreTableDisplay = createDisplay({
  loaderComponent: HostsVulnerabilityScoreLoader,
  displayComponent: ({data, ...props}) => {
    const gmp = useGmp();
    const transformedData = useDataTransform(data, transformVulnScoreData, {
      severityRating: gmp.settings.severityRating,
    });
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.x, row.y]) ?? []
        }
        dataTitles={[_('Host Name'), _('Max. average Severity Score')]}
        title={() => _('Most Vulnerable Hosts')}
      />
    );
  },
  filtersFilter: HOSTS_FILTER_FILTER,
  displayName: 'HostsVulnScoreTableDisplay',
  displayId: 'host-by-most-vulnerable-table',
});

registerDisplay(
  HostsVulnerabilityScoreDisplay,
  _l('Chart: Hosts by Vulnerability Score'),
);

registerDisplay(
  HostsVulnerabilityScoreTableDisplay,
  _l('Table: Hosts by Vulnerability Score'),
);
