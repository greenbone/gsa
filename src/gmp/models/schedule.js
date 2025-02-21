/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import Model, {parseModelFromElement} from 'gmp/model';
import Event from 'gmp/models/event';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';


const log = logger.getLogger('gmp.models.schedule');

class Schedule extends Model {
  static entityType = 'schedule';

  static parseElement(element) {
    const ret = super.parseElement(element);

    const {timezone, icalendar} = element;

    if (isDefined(icalendar)) {
      try {
        ret.event = Event.fromIcal(icalendar, timezone);
      } catch (error) {
        log.error(
          'Could not parse ical data of Schedule',
          ret.id,
          error,
          icalendar,
        );
      }

      delete ret.icalendar;
    }

    // remove legacy schedule fields
    delete ret.first_time;
    delete ret.next_time;
    delete ret.duration;
    delete ret.period;
    delete ret.periods;
    delete ret.period_months;
    delete ret.simple_duration;
    delete ret.simple_period;

    if (isDefined(ret.tasks)) {
      ret.tasks = map(ret.tasks.task, task =>
        parseModelFromElement(task, 'task'),
      );
    } else {
      ret.tasks = [];
    }

    return ret;
  }
}

export default Schedule;
