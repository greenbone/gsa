/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {format as d3format} from 'd3-format';
import {parseFloat} from 'gmp/parser';
import {type LegendData} from 'web/components/chart/base/Legend';
import {
  percent,
  vulnsByHostsColorScale,
} from 'web/components/dashboard/display/utils';

interface BinConfig {
  min: number;
  max: number;
  color: string;
  binWidth: number;
}

interface GroupData {
  value: number;
  count: number;
  c_count: number;
}

interface HostsFilterValue {
  start: number;
  end: number;
}

export interface HostDataPoint extends LegendData {
  x: string;
  y: number;
  id: number;
  filterValue: HostsFilterValue;
}

export interface HostsData {
  groups?: GroupData[];
}

const format = d3format('0.1f');

const calculateBins = (
  minHosts: number,
  maxHosts: number,
  totalVulns: number,
): BinConfig[] => {
  if (totalVulns === 0) {
    return [];
  }

  let binQuantity = Math.ceil(Math.log2(totalVulns)) + 1;
  const binWidth =
    minHosts === maxHosts ? 1 : Math.ceil((maxHosts - minHosts) / binQuantity);
  binQuantity = Math.floor((maxHosts - minHosts) / binWidth) + 1;

  const bins: BinConfig[] = [];
  for (let binIndex = 0; binIndex < binQuantity; binIndex++) {
    const min = minHosts + binIndex * binWidth;
    const max = minHosts + (binIndex + 1) * binWidth - 1;
    const perc = binIndex / binQuantity;
    const color = String(vulnsByHostsColorScale(perc));
    bins[binIndex] = {min, max, color, binWidth};
  }
  return bins;
};

const transformHostsData = (data: HostsData = {}): HostDataPoint[] => {
  const {groups = []} = data ?? {};
  const totalVulns =
    groups.length > 0 ? Math.max(...groups.map(val => val.c_count)) : 0;
  const minHosts =
    groups.length > 0 ? Math.min(...groups.map(val => val.value)) : 0;
  const maxHosts =
    groups.length > 0 ? Math.max(...groups.map(val => val.value)) : 0;
  const bins = calculateBins(minHosts, maxHosts, totalVulns);
  return bins.map(bin => {
    const {min, max, color, binWidth} = bin;
    const binWithAllMembers = groups.filter(
      group => group.value >= min && group.value <= max,
    );
    const sumOfBinMembers = binWithAllMembers.reduce(
      (prev, current) => prev + (parseFloat(current.count) ?? 0),
      0,
    );
    const yValue = sumOfBinMembers;
    const percentValue = percent(yValue, totalVulns);
    const filterValue = {start: min, end: max};
    return {
      x: binWidth > 1 ? `${min}-${max}` : String(min),
      y: yValue,
      label: 'label',
      toolTip: `${min} - ${max}: ${yValue} (${format(percentValue)}%)`,
      color,
      id: max,
      filterValue,
    };
  });
};

export default transformHostsData;
