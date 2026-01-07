/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {parseInt} from 'gmp/parser';
import {map} from 'gmp/utils/array';

class NvtFamiliesCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_nvt_families'});
  }

  async get() {
    const response = await this.httpGetWithTransform();
    const {data} = response;
    const {family: families} =
      // @ts-expect-error
      data.get_nvt_families.get_nvt_families_response.families;
    return response.set(
      map(families, family => ({
        name: family.name,
        maxNvtCount: parseInt(family.max_nvt_count),
      })),
    );
  }
}

export default NvtFamiliesCommand;
