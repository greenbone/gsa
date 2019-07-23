/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import Event from '../event';

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
});
