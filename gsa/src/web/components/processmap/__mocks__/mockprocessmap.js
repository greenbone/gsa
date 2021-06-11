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
export const getMockProcessMap = () => {
  const mockProcessMap = {
    edges: {11: {id: '11', source: '21', target: '22', type: 'edge'}},
    processes: {
      21: {
        color: '#f0a519',
        comment: 'bar',
        derivedSeverity: 5,
        id: '21',
        name: 'foo',
        severity: 5,
        tagId: '31',
        type: 'process',
        x: 600,
        y: 300,
      },
      22: {
        color: '#f0a519',
        comment: 'ipsum',
        derivedSeverity: 5,
        id: '22',
        name: 'lorem',
        severity: undefined,
        tagId: '32',
        type: 'process',
        x: 300,
        y: 200,
      },
      23: {
        color: '#c83814',
        comment: 'world',
        derivedSeverity: 10,
        id: '23',
        name: 'hello',
        severity: 10,
        tagId: 33,
        type: 'process',
        x: 600,
        y: 200,
      },
    },
  };
  return {
    mockProcessMap,
    processes: mockProcessMap.processes,
    edges: mockProcessMap.edges,
  };
};
