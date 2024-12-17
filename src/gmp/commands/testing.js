/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {testing} from '@gsa/testing';
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
  request: testing.fn().mockReturnValue(Promise.resolve(response)),
});

export const createHttpMany = responses => {
  let i = 0;
  return {
    request: testing
      .fn()
      .mockImplementation(() => Promise.resolve(responses[i++])),
  };
};
