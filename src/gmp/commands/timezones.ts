/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {map} from 'gmp/utils/array';

class TimezonesCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_timezones'});
  }

  async get() {
    const response = await this.httpGetWithTransform();
    const {data} = response;
    const {timezone: timezones} =
      // @ts-expect-error
      data.get_timezones.get_timezones_response;
    return response.set(map(timezones, tz => tz));
  }
}

export default TimezonesCommand;
