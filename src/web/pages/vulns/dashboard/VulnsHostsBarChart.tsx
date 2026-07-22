/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_} from 'gmp/locale/lang';
import BarChart from 'web/components/chart/Bar';
import {type HostDataPoint} from 'web/pages/vulns/dashboard/VulnsHostsDisplay';

interface HostsBarChartProps {
  width: number;
  height: number;
  data: HostDataPoint[];
  svgRef: React.RefObject<SVGSVGElement>;
  onDataClick?: (dataPoint: {
    x: number;
    y: number;
    filterValue?: {start?: number; end?: number};
  }) => void;
}

const HostsBarChart = ({
  width,
  height,
  data,
  svgRef,
  onDataClick,
}: HostsBarChartProps) => (
  <BarChart
    data={data.map(d => ({...d, x: Number(d.x)}))}
    height={height}
    showLegend={false}
    svgRef={svgRef}
    width={width}
    xLabel={_('# of Hosts')}
    yLabel={_('# of Vulnerabilities')}
    onDataClick={
      onDataClick as ((dataPoint: {x: number; y: number}) => void) | undefined
    }
  />
);

export default HostsBarChart;
