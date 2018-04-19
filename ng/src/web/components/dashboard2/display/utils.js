/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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
import 'core-js/fn/object/keys';

import _ from 'gmp/locale';

import {scaleOrdinal, scaleLinear} from 'd3-scale';

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

export const vulnsByHostsColorScale = scaleLinear()
  .domain([0, 0.05, 0.25, 0.50, 0.75, 0.95, 1.00])
  .range([
    '#008644',
    '#55B200',
    '#94D800',
    '#E6E600',
    '#EDBA00',
    '#EC6E00',
    '#D63900',
  ]);

export const QOD_TYPES = {
  '': _('None'),
  general_note: _('General note'),
  executable_version: _('Executable version'),
  package: _('Package check'),
  registry: _('Registry check'),
  remote_active: _('Remote active'),
  remote_analysis: _('Remote analysis'),
  remote_app: _('Remote app'),
  remote_banner: _('Remote banner'),
  remote_probe: _('Remote probe'),
  remote_banner_unreliable: _('Unreliable rem. banner'),
  executable_version_unreliable: _('Unreliable exec. version'),
  remote_vul: _('Remote vulnerability'),
  exploit: _('Exploit'),
};

export const qodColorScale = scaleOrdinal()
  .domain([1, 30, 50, 70, 76, 80, 95, 97, 98, 99, 100])
  .range([
    '#011f4b',
    '#023061',
    '#024277',
    '#01558e',
    '#3c70a5',
    '#6c92bb',
    '#97b5d1',
    '#a9c9ce',
    '#87bc99',
    '#61ae65',
    '#2ca02c',
  ]);

export const qodTypeColorScale = scaleOrdinal()
  .domain(Object.keys(QOD_TYPES))
  .range([
    'silver',  // ''
    '#555555', // general_note
    '#011f4b', // executable_version
    '#596d8a', // package
    '#a9c9ce', // registry
    '#98df8a', // remote_active
    '#80c674', // remote_analysis
    '#69af5f', // remote_app
    '#53984a', // remote_banner
    '#3c8136', // remote_probe
    '#e6e600', // remote_banner_unreliable
    '#ffff99', // executable_version_unreliable
    '#ff9933', // remote_vul
    '#d62728', // Exploit
  ]);

// vim: set ts=2 sw=2 tw=80:
