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
