/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
      const {family: families} =
        data.get_nvt_families.get_nvt_families_response.families;
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
