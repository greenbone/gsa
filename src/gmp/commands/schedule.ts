/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import {type Element} from 'gmp/models/model';
import Schedule, {type ScheduleElement} from 'gmp/models/schedule';

interface ScheduleCreateParams {
  name: string;
  comment?: string;
  icalendar: string;
  timezone: string;
}

interface ScheduleSaveParams extends ScheduleCreateParams {
  id: string;
}

const log = logger.getLogger('gmp.commands.schedules');

class ScheduleCommand extends EntityCommand<Schedule, ScheduleElement> {
  constructor(http: Http) {
    super(http, 'schedule', Schedule);
  }

  create({name, comment = '', icalendar, timezone}: ScheduleCreateParams) {
    log.debug('Creating new schedule', {name, comment, icalendar, timezone});
    return this.action({
      cmd: 'create_schedule',
      name,
      comment,
      icalendar,
      timezone,
    });
  }

  save({id, name, comment = '', icalendar, timezone}: ScheduleSaveParams) {
    log.debug('Saving schedule', {comment, icalendar, id, name, timezone});
    return this.action({
      cmd: 'save_schedule',
      comment,
      id,
      icalendar,
      name,
      timezone,
    });
  }

  getElementFromRoot(root: Element): ScheduleElement {
    // @ts-expect-error
    return root.get_schedule.get_schedules_response.schedule;
  }
}

export default ScheduleCommand;
