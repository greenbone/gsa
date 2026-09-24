/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {useNavigate} from 'react-router';
import styled from 'styled-components';
import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {DEFAULT_SEVERITY_RATING, type SeverityRating} from 'gmp/utils/severity';
import BarChart from 'web/components/chart/BarChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {
  HostsVulnScoreLoader,
  type VulnScoreData,
} from 'web/pages/hosts/dashboard/HostsLoaders';
import {ROUTES} from 'web/route-paths';
import {resultSeverityRiskFactor} from 'web/utils/severity';
import {formattedUserSettingLongDate} from 'web/utils/user-setting-time-date-formatters';

type HostVulnScoreDataDisplayProps = DataDisplayProps<
  VulnScoreData,
  TransformedVulnScoreData[],
  TransformVulnScoreDataProps
>;

type HostVulnCoreDisplayProps = DashboardDisplayProps;

export interface TransformedVulnScoreData {
  y: number;
  x: string;
  label: string;
  color: string;
  toolTip: ReactNode;
  id?: string;
}

export interface TransformVulnScoreDataProps {
  severityRating?: SeverityRating;
}

const ToolTip = styled.div`
  font-weight: normal;
  text-align: center;
  line-height: 1.2em;
`;

const transformVulnScoreData = (
  data: VulnScoreData | undefined = {},
  {severityRating = DEFAULT_SEVERITY_RATING}: TransformVulnScoreDataProps = {},
): TransformedVulnScoreData[] => {
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

const HostsVulnScoreDisplay = ({
  filterId,
  filter,
  showFilterSelection,
  onFilterIdChanged,
  ...props
}: HostVulnCoreDisplayProps) => {
  const gmp = useGmp();
  const navigate = useNavigate();
  const handleDataClick = (data: TransformedVulnScoreData) => {
    void navigate(ROUTES.host.url(data.id ?? ''));
  };
  const severityRating = gmp.settings.severityRating;
  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: HOSTS_FILTER_FILTER,
    onFilterIdChanged,
  });
  const displayFilter = showFilterSelection ? selectedFilter : filter;
  return (
    <>
      <HostsVulnScoreLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            VulnScoreData,
            HostVulnScoreDataDisplayProps,
            TransformedVulnScoreData[],
            TransformVulnScoreDataProps
          >
            {...props}
            {...loaderProps}
            dataTransform={transformVulnScoreData}
            filter={displayFilter}
            severityRating={severityRating}
            showToggleLegend={false}
            title={() => _('Most Vulnerable Hosts')}
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
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
        )}
      </HostsVulnScoreLoader>
      {filterSelectionDialog}
    </>
  );
};

HostsVulnScoreDisplay.displayId = 'host-by-most-vulnerable';

export {HostsVulnScoreDisplay};

export const HostsVulnScoreTableDisplay = createDisplay({
  loaderComponent: HostsVulnScoreLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.x, row.y]}
      dataTitles={[_('Host Name'), _('Max. average Severity Score')]}
      dataTransform={transformVulnScoreData}
      title={() => _('Most Vulnerable Hosts')}
    />
  ),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'HostsVulnScoreTableDisplay',
  displayName: 'host-by-most-vulnerable-table',
});

registerDisplay(
  HostsVulnScoreDisplay,
  _l('Chart: Hosts by Vulnerability Score'),
);

registerDisplay(
  HostsVulnScoreTableDisplay,
  _l('Table: Hosts by Vulnerability Score'),
);
