/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {parseInt} from 'gmp/parser.js';

import {map} from 'gmp/utils/array.js';

import GmpCommand from './gmp.js';

import registerCommand from '../command.js';

export class NvtFamiliesCommand extends GmpCommand {
  constructor(http) {
    super(http, {cmd: 'get_nvt_families'});
  }

  get(params, options) {
    return this.httpGet(params, options).then(response => {
      const {data} = response;
      const {
        family: families,
      } = data.get_nvt_families.get_nvt_families_response.families;
      return response.set(
        map(families, family => ({
          name: family.name,
          maxNvtCount: parseInt(family.max_nvt_count),
        })),
      );
    });
  }
}

registerCommand('nvtfamilies', NvtFamiliesCommand);

// vim: set ts=2 sw=2 tw=80:
