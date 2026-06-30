/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import Schedule from 'gmp/models/schedule';

class SchedulesCommand extends EntitiesCommand<Schedule> {
  constructor(http: Http) {
    super(http, 'schedule', Schedule);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_schedules.get_schedules_response;
  }
}

export default SchedulesCommand;
