/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import date from '../date';

import Event from '../event';

const ICAL_FORMAT = 'YYYYMMDD[T]HHmmss[Z]';

describe('Event model tests', () => {
  test('should parse event start from icalendar without timzeone', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event.event).toBeDefined();

    const {startDate: eventStartDate} = event.event;

    expect(eventStartDate).toBeDefined();
    expect(eventStartDate.utcOffset()).toEqual(0);

    // no timezone in ical should be considered as datetime in passed timezone (Europe/Berlin)
    const {startDate} = event;
    expect(startDate.hour()).toEqual(4);
    expect(startDate.tz('UTC').hour()).toEqual(2);
  });

  test('should parse event start from icalendar using utc', () => {
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000Z
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event.event).toBeDefined();

    const {startDate: eventStartDate} = event.event;

    expect(eventStartDate).toBeDefined();
    expect(eventStartDate.utcOffset()).toEqual(0);

    const {startDate} = event;
    expect(startDate.hour()).toEqual(6);
    expect(startDate.tz('UTC').hour()).toEqual(4);
  });

  test('should calculate start date as next date for daily recurrence', () => {
    const now = date.tz('utc').minutes(0).seconds(0).milliseconds(0);
    const startDate = now.clone().add(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
RRULE:FREQ=DAILY
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // next event should be start date
    expect(nextDate.isSame(startDate)).toEqual(true);
  });

  test('should calculate next day as next day for daily recurrence', () => {
    const now = date.tz('utc').minutes(0).seconds(0).milliseconds(0);
    const startDate = now.clone().subtract(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
RRULE:FREQ=DAILY
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // next event should be next day
    expect(nextDate.isSame(startDate)).toEqual(false);
    expect(nextDate.isAfter(startDate)).toEqual(true);

    const rDate = startDate.clone().add(1, 'day');
    expect(nextDate.isSame(rDate)).toEqual(true);
  });

  test('should calculate start date as next date for no recurrence', () => {
    const now = date.tz('utc').minutes(0).seconds(0).milliseconds(0);
    const startDate = now.clone().add(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // next event should be start date
    expect(nextDate.isSame(startDate)).toEqual(true);
  });

  test('should calculate no next date for no recurrence if start date is already over', () => {
    const startDate = date.tz('utc').minutes(0).seconds(0).milliseconds(0);
    const now = startDate.clone().add(1, 'hour');
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTART:${startDate.format(ICAL_FORMAT)}
DTSTAMP:${now.format(ICAL_FORMAT)}
END:VEVENT
END:VCALENDAR
`;

    const event = Event.fromIcal(icalendar, 'Europe/Berlin');

    expect(event).toBeDefined();

    const {nextDate} = event;

    // there should be no next event
    expect(nextDate).toBeUndefined();
  });
});
