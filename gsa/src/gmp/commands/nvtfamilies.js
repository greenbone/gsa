/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import registerCommand from 'gmp/command';

import {parseInt} from 'gmp/parser';

import {map} from 'gmp/utils/array';

import GmpCommand from './gmp';

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
