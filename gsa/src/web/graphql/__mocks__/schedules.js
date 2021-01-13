/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';

import {
  GET_SCHEDULES,
  GET_SCHEDULE,
  CREATE_SCHEDULE,
  MODIFY_SCHEDULE,
  EXPORT_SCHEDULES_BY_IDS,
  EXPORT_SCHEDULES_BY_FILTER,
  DELETE_SCHEDULES_BY_IDS,
  DELETE_SCHEDULES_BY_FILTER,
  CLONE_SCHEDULE,
} from '../schedules';

export const schedule1 = deepFreeze({
  id: 'foo',
  name: 'schedule 1',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.4.0~dev1~git-5f8b6cf-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nUID:foo\nDTSTAMP:20210111T134141Z\nEND:VEVENT\nEND:VCALENDAR',
  timezone: 'UTC',
  userTags: null,
  permissions: [{name: 'Everything'}],
  owner: 'admin',
  comment: 'hello world',
  writable: true,
  inUse: false,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
});

export const inUseSchedule = deepFreeze({
  id: 'foo',
  name: 'schedule 1',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.4.0~dev1~git-5f8b6cf-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nUID:foo\nDTSTAMP:20210111T134141Z\nEND:VEVENT\nEND:VCALENDAR',
  timezone: 'UTC',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'schedule:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  permissions: [{name: 'Everything'}],
  owner: 'admin',
  comment: 'hello world',
  writable: true,
  inUse: true,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
});

export const noPermSchedule = deepFreeze({
  id: 'foo',
  name: 'schedule 1',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.4.0~dev1~git-5f8b6cf-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nUID:foo\nDTSTAMP:20210111T134141Z\nEND:VEVENT\nEND:VCALENDAR',
  timezone: 'UTC',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'schedule:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  permissions: [{name: 'get_schedules'}],
  owner: 'admin',
  comment: 'hello world',
  writable: true,
  inUse: false,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
});

const mockSchedules = {
  edges: [
    {
      node: schedule1,
    },
  ],
  counts: {
    total: 1,
    filtered: 1,
    offset: 0,
    limit: 10,
    length: 1,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'c2NoZWR1bGU6MA==',
    endCursor: 'c2NoZWR1bGU6MA==',
    lastPageCursor: 'c2NoZWR1bGU6MA==',
  },
};

export const createGetSchedulesQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      schedules: mockSchedules,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_SCHEDULES,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createGetScheduleQueryMock = (
  scheduleId = 'foo',
  schedule = schedule1,
) => createGenericQueryMock(GET_SCHEDULE, {schedule}, {id: scheduleId});

export const createScheduleInput = {
  id: '12345',
  name: 'schedule 1',
  icalendar: `BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
  BEGIN:VEVENT
  UID:foo
  DTSTAMP:20190715T124352Z
  DTSTART:20190716T040000
  END:VEVENT
  END:VCALENDAR
  `,
  comment: 'foobar',
};

const createScheduleResult = {
  createSchedule: {
    id: '12345',
    status: 200,
  },
};

export const createCreateScheduleQueryMock = () =>
  createGenericQueryMock(CREATE_SCHEDULE, createScheduleResult, {
    input: createScheduleInput,
  });

export const modifyScheduleInput = {
  id: '12345',
  name: 'loremipsum',
  comment: 'silence',
};

const modifyScheduleResult = {
  modifySchedule: {
    ok: true,
  },
};

export const createModifyScheduleQueryMock = () =>
  createGenericQueryMock(MODIFY_SCHEDULE, modifyScheduleResult, {
    input: modifyScheduleInput,
  });

const exportSchedulesByIdsResult = {
  exportSchedulesByIds: {
    exportedEntities:
      '<get_schedules_response status="200" status_text="OK" />',
  },
};

export const createExportSchedulesByIdsQueryMock = (ids = ['foo']) =>
  createGenericQueryMock(EXPORT_SCHEDULES_BY_IDS, exportSchedulesByIdsResult, {
    ids,
  });

const exportSchedulesByFilterResult = {
  exportSchedulesByFilter: {
    exportedEntities:
      '<get_schedules_response status="200" status_text="OK" />',
  },
};

export const createExportSchedulesByFilterQueryMock = (
  filterString = 'foo',
) => {
  return createGenericQueryMock(
    EXPORT_SCHEDULES_BY_FILTER,
    exportSchedulesByFilterResult,
    {filterString},
  );
};

const bulkDeleteByIdsResult = {
  deleteSchedulesByIds: {
    ok: true,
  },
};

export const createDeleteSchedulesByIdsQueryMock = (scheduleIds = ['foo']) =>
  createGenericQueryMock(DELETE_SCHEDULES_BY_IDS, bulkDeleteByIdsResult, {
    ids: scheduleIds,
  });

const bulkDeleteByFilterResult = {
  deleteSchedulesByFilter: {
    ok: true,
  },
};

export const createDeleteSchedulesByFilterQueryMock = (filterString = 'foo') =>
  createGenericQueryMock(DELETE_SCHEDULES_BY_FILTER, bulkDeleteByFilterResult, {
    filterString,
  });

const deleteScheduleResult = {
  deleteScheduleByIds: {
    ok: true,
    status: 200,
  },
};

export const createDeleteScheduleQueryMock = (scheduleId = 'foo') =>
  createGenericQueryMock(DELETE_SCHEDULES_BY_IDS, deleteScheduleResult, {
    ids: [scheduleId],
  });

export const createCloneScheduleQueryMock = (
  scheduleId = 'foo',
  newScheduleId = 'bar',
) =>
  createGenericQueryMock(
    CLONE_SCHEDULE,
    {
      cloneSchedule: {
        id: newScheduleId,
      },
    },
    {id: scheduleId},
  );
