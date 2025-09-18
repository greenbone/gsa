/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import Event from 'gmp/models/event';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface ScheduleElement extends ModelElement {
  icalendar?: string;
  tasks?: {
    task?: ModelElement | ModelElement[];
  };
  timezone?: string;
  timezone_abbrev?: string;
}

interface ScheduleProperties extends ModelProperties {
  event?: Event;
  tasks?: Model[];
  timezone?: string;
  timezone_abbrev?: string;
}

const log = logger.getLogger('gmp.models.schedule');

class Schedule extends Model {
  static readonly entityType = 'schedule';

  readonly event?: Event;
  readonly tasks: Model[];
  readonly timezone?: string;
  readonly timezone_abbrev?: string;

  constructor({
    event,
    tasks = [],
    timezone,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    timezone_abbrev,
    ...properties
  }: ScheduleProperties = {}) {
    super(properties);

    this.event = event;
    this.tasks = tasks;
    this.timezone = timezone;
    this.timezone_abbrev = timezone_abbrev;
  }

  static fromElement(element?: ScheduleElement): Schedule {
    return new Schedule(this.parseElement(element));
  }

  static parseElement(element: ScheduleElement = {}): ScheduleProperties {
    const ret = super.parseElement(element) as ScheduleProperties;

    const {timezone, icalendar, timezone_abbrev} = element;

    ret.timezone = timezone;
    ret.timezone_abbrev = timezone_abbrev;

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
    }

    ret.tasks = map(element.tasks?.task, task =>
      Model.fromElement(task, 'task'),
    );

    return ret;
  }
}

export default Schedule;
