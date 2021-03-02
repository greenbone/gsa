/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {_l} from 'gmp/locale/lang';

import {scaleOrdinal, scaleLinear} from 'd3-scale';

import {parseInt} from 'gmp/parser';

import {
  ERROR,
  DEBUG,
  FALSE_POSITIVE,
  LOG,
  LOW,
  MEDIUM,
  HIGH,
  NA,
} from 'web/utils/severity';

export const totalCount = (groups = []) => {
  if (groups.length === 0) {
    return 0;
  }
  return groups
    .map(group => parseInt(group.count))
    .reduce((prev, cur) => prev + cur);
};

export const percent = (count, sum) =>
  ((parseInt(count) / sum) * 100).toFixed(1);

export const randomColor = () => {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16);
};

export const activeDaysColorScale = scaleOrdinal()
  .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .range([
    '#01558e',
    '#97b5d1',
    '#8fbfa5',
    '#7fb290',
    '#70a47c',
    '#609769',
    '#508a55',
    '#407d42',
    '#2f712f',
    '#1b641b',
  ]);

export const riskFactorColorScale = scaleOrdinal()
  .domain([ERROR, DEBUG, FALSE_POSITIVE, NA, LOG, LOW, MEDIUM, HIGH])
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
  .domain([0, 0.05, 0.25, 0.5, 0.75, 0.95, 1.0])
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
  '': _l('None'),
  general_note: _l('General note'),
  executable_version: _l('Executable version'),
  package: _l('Package check'),
  registry: _l('Registry check'),
  remote_active: _l('Remote active'),
  remote_analysis: _l('Remote analysis'),
  remote_app: _l('Remote app'),
  remote_banner: _l('Remote banner'),
  remote_probe: _l('Remote probe'),
  remote_banner_unreliable: _l('Unreliable rem. banner'),
  executable_version_unreliable: _l('Unreliable exec. version'),
  remote_vul: _l('Remote vulnerability'),
  exploit: _l('Exploit'),
};

export const qodColorScale = scaleOrdinal()
  .domain([1, 30, 50, 70, 75, 80, 95, 97, 98, 99, 100])
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
    'silver', // ''
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

export const OVAL_CLASS_TYPES = {
  compliance: _l('Compliance'),
  inventory: _l('Inventory'),
  miscellaneous: _l('Miscellaneous'),
  patch: _l('Patch'),
  vulnerability: _l('Vulnerability'),
};

export const ovalClassColorScale = scaleOrdinal()
  .domain(Object.keys(OVAL_CLASS_TYPES))
  .range([
    '#a9c9ce', // compliance
    '#024277', // inventory
    '#2ca02c', // miscellaneous
    '#8fbfa5', // patch
    'orange', // vulnerability
  ]);

export const SEC_INFO_TYPES = {
  cert_bund_adv: _l('CERT-Bund Advisories'),
  cpe: _l('CPEs'),
  cve: _l('CVEs'),
  dfn_cert_adv: _l('DFN-CERT Advisories'),
  nvt: _l('NVTs'),
  ovaldef: _l('OVAL Definitions'),
};

export const secInfoTypeColorScale = scaleOrdinal()
  .domain(Object.keys(SEC_INFO_TYPES))
  .range([
    '#011f4b', // CERT-Bund Advisories
    '#596d8a', // CPEs
    '#a9c9ce', // CVEs
    '#98df8a', // DFN-CERT Advisories
    '#80c674', // Nvts
    '#53984a', // OVAL Definitions
  ]);

// vim: set ts=2 sw=2 tw=80:
