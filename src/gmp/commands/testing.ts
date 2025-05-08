/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {testing} from '@gsa/testing';
import GmpHttp from 'gmp/http/gmp';
import Rejection from 'gmp/http/rejection';
import Response, {Meta} from 'gmp/http/response';
import {Element} from 'gmp/model';

const entitiesRange = {
  _start: '1',
  _max: '1000',
};

const createEntitiesCounts = (entities: Element[]) => ({
  __text: entities.length,
  _filtered: entities.length,
  _page: entities.length,
});

export const createResponse = (data: Element) =>
  new Response({} as XMLHttpRequest, data);

export const createEntitiesResponse = (name: string, entities: Element[]) =>
  createResponse({
    [`get_${name}s`]: {
      [`get_${name}s_response`]: {
        [name]: entities,
        [`${name}s`]: entitiesRange,
        [`${name}_count`]: createEntitiesCounts(entities),
      },
    },
  });

export const createEntityResponse = (name: string, entity: Element) =>
  createResponse({
    [`get_${name}`]: {
      [`get_${name}s_response`]: {
        [name]: entity,
      },
    },
  });

interface ActionResultResponse {
  action?: string;
  id?: string;
  message?: string;
}

export const createActionResultResponse = ({
  action = 'ipsum',
  id = 'foo',
  message = 'OK',
}: ActionResultResponse = {}) =>
  createResponse({
    action_result: {
      action,
      id,
      message,
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

export const createHttp = <
  TData extends Element = Element,
  TMeta extends Meta = Meta,
>(
  response?: Element | Response<TData, TMeta>,
) =>
  ({
    request: testing.fn().mockResolvedValue(response),
  }) as unknown as GmpHttp;

export const createHttpError = (error: Error | Rejection) =>
  ({
    request: testing.fn().mockRejectedValue(error),
  }) as unknown as GmpHttp;

export const createHttpMany = (responses: Element[] | Response[]) => {
  let i = 0;
  return {
    request: testing
      .fn()
      .mockImplementation(() => Promise.resolve(responses[i++])),
  } as unknown as GmpHttp;
};
