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
import {isDefined, hasValue} from 'gmp/utils/identity';

import ActionResult from 'gmp/models/actionresult';

import {filter_string} from 'gmp/models/filter/utils';

import HttpCommand from './http';

export const BULK_SELECT_BY_IDS = 1;
export const BULK_SELECT_BY_FILTER = 0;

class GmpCommand extends HttpCommand {
  getParams(params = {}, extraParams, options) {
    const {filter, ...other} = params;
    const rparams = super.getParams(other, extraParams, options);

    if (hasValue(filter)) {
      if (isDefined(filter.id)) {
        rparams.filter_id = filter.id;
      } else {
        rparams.filter = filter_string(filter);
      }
    }

    return rparams;
  }

  transformActionResult(response) {
    return response.setData(new ActionResult(response.data));
  }

  /**
   * Creates a HTTP POST Request returning an ActionResult
   *
   * @param {*} args  Arguments to be passed to httpPost
   *
   * @returns {Promise} A Promise returning a Response with an
   *                    ActionResult model as data
   */
  action(...args) {
    return this.httpPost(...args).then(this.transformActionResult);
  }
}

export default GmpCommand;

// vim: set ts=2 sw=2 tw=80:
