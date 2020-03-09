/* Copyright (C) 2020 Greenbone Networks GmbH
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
import {TASK_STATUS} from 'gmp/models/task';

import {GET_TASKS} from 'web/pages/tasks/graphql.js';

const lastReport = {
  uuid: '1234',
  severity: '5.0',
  timestamp: '2020-02-27T13:20:45Z',
};

const mockTask = {
  data: {
    tasks: {
      nodes: [
        {
          name: 'foo',
          uuid: '1234',
          permissions: [
            {
              name: 'Everything',
            },
          ],
          lastReport,
          reportCount: {
            total: 1,
            finished: 1,
          },
          status: TASK_STATUS.done,
          target: {
            name: 'Target',
            uuid: 'id1',
          },
          trend: null,
          comment: 'bar',
          owner: 'admin',
          preferences: null,
          schedule: null,
          alerts: [],
          scanConfig: {
            uuid: 'id2',
            name: 'lorem',
            trash: false,
          },
          scanner: {
            uuid: 'id3',
            name: 'ipsum',
            scannerType: 'dolor',
          },
          hostsOrdering: null,
          observers: {
            users: ['john', 'jane'],
            roles: [
              {
                name: 'r1',
              },
              {
                name: 'r2',
              },
            ],
            groups: [
              {
                name: 'g1',
              },
              {
                name: 'g2',
              },
            ],
          },
        },
      ],
    },
  },
};

export const mockGetTasks = [
  {
    request: {
      query: GET_TASKS,
      variables: {filterString: 'foo=bar rows=2'},
    },
    result: mockTask,
  },
  {
    request: {
      query: GET_TASKS,
      variables: {filterString: ''},
    },
    result: mockTask,
  },
  {
    request: {
      query: GET_TASKS,
      variables: {filterString: ''},
    },
    result: mockTask,
  },
];
