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
import Response from 'gmp/http/response';

const entitiesRange = {
  _start: '1',
  _max: '1000',
};

const createEntitiesCounts = entities => ({
  __text: entities.length,
  _filtered: entities.length,
  _page: entities.length,
});

export const createResponse = data => new Response({}, data);

export const createEntitiesResponse = (name, entities) =>
  createResponse({
    [`get_${name}s`]: {
      [`get_${name}s_response`]: {
        [name]: entities,
        [`${name}s`]: entitiesRange,
        [`${name}_count`]: createEntitiesCounts(entities),
      },
    },
  });

export const createEntityResponse = (name, entity) =>
  createResponse({
    [`get_${name}`]: {
      [`get_${name}s_response`]: {
        [name]: entity,
      },
    },
  });

export const createActionResultResponse = () =>
  createResponse({
    action_result: {
      action: 'ipsum',
      id: 'foo',
      message: 'OK',
    },
  });

export const createAggregatesResponse = (data = {}) =>
  createResponse({
    get_aggregate: {
      get_aggregates_response: {
        aggregate: data,
      },
    },
  });

export const createHttp = response => ({
  request: jest.fn().mockReturnValue(Promise.resolve(response)),
});

// vim: set ts=2 sw=2 tw=80:
