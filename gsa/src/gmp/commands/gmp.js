/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import {isDefined} from '../utils/identity';

import ActionResult from '../models/actionresult';

import {filter_string} from '../models/filter/utils.js';

import HttpCommand from './http.js';

export const BULK_SELECT_BY_IDS = 1;
export const BULK_SELECT_BY_FILTER = 0;

class GmpCommand extends HttpCommand {
  getParams(params = {}, extra_params = {}) {
    const {filter, ...other} = params;
    const rparams = super.getParams(other, extra_params);

    if (isDefined(filter)) {
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
