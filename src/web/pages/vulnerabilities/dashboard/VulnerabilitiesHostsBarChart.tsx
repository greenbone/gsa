/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import BarChart, {type BarChartProps} from 'web/components/chart/BarChart';
import {type HostDataPoint} from 'web/pages/vulnerabilities/dashboard/hosts-transform';

type VulnerabilitiesHostsBarChartDataPoint = HostDataPoint;

type VulnerabilitiesHostsBarChartProps = Omit<
  BarChartProps<VulnerabilitiesHostsBarChartDataPoint>,
  'xLabel' | 'yLabel' | 'showLegend' | 'onLegendItemClick'
>;

const VulnerabilitiesHostsBarChart = ({
  width,
  height,
  data,
  svgRef,
  onDataClick,
}: VulnerabilitiesHostsBarChartProps) => (
  <BarChart<VulnerabilitiesHostsBarChartDataPoint>
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
