/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
