/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import BarChart, {type BarChartProps} from 'web/components/chart/BarChart';
import {type TransformedVulnerabilitiesHostsDataItem} from 'web/pages/vulnerabilities/dashboard/hosts-transform';

type VulnerabilitiesHostsBarChartDataItem =
  TransformedVulnerabilitiesHostsDataItem;

type VulnerabilitiesHostsBarChartProps = Omit<
  BarChartProps<VulnerabilitiesHostsBarChartDataItem>,
  'xLabel' | 'yLabel' | 'showLegend' | 'onLegendItemClick'
>;

const VulnerabilitiesHostsBarChart = ({
  width,
  height,
  data,
  svgRef,
  onDataClick,
}: VulnerabilitiesHostsBarChartProps) => (
  <BarChart<VulnerabilitiesHostsBarChartDataItem>
    data={data}
    height={height}
    svgRef={svgRef}
    width={width}
    xLabel={_('# of Hosts')}
    yLabel={_('# of Vulnerabilities')}
    onDataClick={onDataClick}
  />
);

export default VulnerabilitiesHostsBarChart;
