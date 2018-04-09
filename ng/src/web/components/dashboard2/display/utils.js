/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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
import {scaleOrdinal} from 'd3-scale';

import {parse_int} from 'gmp/parser';

import {
  ERROR,
  DEBUG,
  FALSE_POSITIVE,
  LOG,
  LOW,
  MEDIUM,
  HIGH,
  NA,
} from '../../../utils/severity';

export const totalCount = (groups = []) => {
  if (groups.length === 0) {
    return 0;
  }
  return groups.map(group => parse_int(group.count))
    .reduce((prev, cur) => prev + cur);
};

export const EMPTY = [];
EMPTY.total = 0;

export const percent = (count, sum) =>
  (parse_int(count) / sum * 100).toFixed(1);

export const riskFactorColorScale = scaleOrdinal()
  .domain([
    ERROR,
    DEBUG,
    FALSE_POSITIVE,
    NA,
    LOG,
    LOW,
    MEDIUM,
    HIGH,
  ])
  .range([
    '#800000',
    '#008080',
    '#808080',
    'silver',
    '#DDDDDD',
    'skyblue',
    'orange',
    '#D80000',
  ]);

// vim: set ts=2 sw=2 tw=80:
