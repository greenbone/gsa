/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {deepFreeze} from 'web/utils/testing';

import {GET_SCHEDULES, GET_SCHEDULE} from '../schedules';

const schedule1 = deepFreeze({
  id: '42',
  name: 'schedule 1',
  icalendar: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
END:VEVENT
END:VCALENDAR
`,
});

const schedule2 = deepFreeze({
  id: '1337',
  name: 'schedule 2',
  icalendar: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
END:VEVENT
END:VCALENDAR
`,
});

const schedule3 = deepFreeze({
  id: '3',
  name: 'schedule 3',
  icalendar: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
END:VEVENT
END:VCALENDAR
`,
});

const schedule4 = deepFreeze({
  id: '4',
  name: 'schedule 4',
  icalendar: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
END:VEVENT
END:VCALENDAR
`,
});

const mockSchedules = {
  edges: [
    {
      node: schedule1,
    },
    {
      node: schedule2,
    },
    {
      node: schedule3,
    },
    {
      node: schedule4,
    },
  ],
  counts: {
    total: 4,
    filtered: 4,
    offset: 0,
    limit: 10,
    length: 4,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'schedule:0',
    endCursor: 'schedule:1',
    lastPageCursor: 'schedule:5',
  },
};

export const createGetSchedulesQueryMock = ({
  filterString,
  after,
  previous,
  first,
  last,
} = {}) => {
  const queryResult = {
    data: {
      schedules: mockSchedules,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    filterString,
    after,
    previous,
    first,
    last,
  };

  const queryMock = {
    request: {
      query: GET_SCHEDULES,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createGetScheduleQueryMock = (id, schedule = schedule1) => {
  const queryResult = {
    data: {
      schedule,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_SCHEDULE,
      variables: {
        id,
      },
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
