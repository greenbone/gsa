/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import logger from 'gmp/log';
import Schedule from 'gmp/models/schedule';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.schedules');

class ScheduleCommand extends EntityCommand {
  constructor(http) {
    super(http, 'schedule', Schedule);
  }

  create(args) {
    const {name, comment = '', icalendar, timezone} = args;
    log.debug('Creating new schedule', args);
    return this.action({
      cmd: 'create_schedule',
      name,
      comment,
      icalendar,
      timezone,
    });
  }

  save(args) {
    const {comment = '', icalendar, id, name, timezone} = args;

    const data = {
      cmd: 'save_schedule',
      comment,
      id,
      icalendar,
      name,
      timezone,
    };
    log.debug('Saving schedule', args, data);
    return this.action(data);
  }

  getElementFromRoot(root) {
    return root.get_schedule.get_schedules_response.schedule;
  }
}

class SchedulesCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'schedule', Schedule);
  }

  getEntitiesResponse(root) {
    return root.get_schedules.get_schedules_response;
  }
}

registerCommand('schedule', ScheduleCommand);
registerCommand('schedules', SchedulesCommand);

// vim: set ts=2 sw=2 tw=80:
