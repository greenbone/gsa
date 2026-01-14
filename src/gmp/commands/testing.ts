/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {testing} from '@gsa/testing';
import type Http from 'gmp/http/http';
import Response, {type Meta} from 'gmp/http/response';
import {type Element} from 'gmp/models/model';

interface ActionResultResponse {
  action?: string;
  id?: string;
  message?: string;
}

const entitiesRange = {
  _start: '1',
  _max: '1000',
};

const createEntitiesCounts = (entities: Element[]) => ({
  __text: entities.length,
  _filtered: entities.length,
  _page: entities.length,
});

export const createPlainResponse = <TData = Element>(
  data: TData = {} as TData,
) => new Response<TData>(data);

export const createResponse = <TData = Element>(data: TData = {} as TData) =>
  createPlainResponse({
    envelope: data,
  });

export const createEntitiesResponse = (
  name: string,
  entities: Element[],
  {
    getName = `get_${name}s`,
    responseName = `get_${name}s_response`,
    pluralName = `${name}s`,
    countName = `${name}_count`,
  }: {
    getName?: string;
    responseName?: string;
    pluralName?: string;
    countName?: string;
  } = {},
) =>
  createResponse({
    [getName]: {
      [responseName]: {
        [name]: entities,
        [pluralName]: entitiesRange,
        [countName]: createEntitiesCounts(entities),
      },
    },
  });

export const createEntityResponse = (
  name: string,
  entity?: Element,
  {
    getName = `get_${name}`,
    responseName = `get_${name}s_response`,
  }: {
    getName?: string;
    responseName?: string;
  } = {},
) =>
  createResponse({
    [getName]: {
      [responseName]: {
        [name]: entity,
      },
    },
  });

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

export const createInfoResponse = (infoData: Element) =>
  createEntityResponse('info', [infoData] as unknown as Element, {
    responseName: 'get_info_response',
  });

export const createInfoEntitiesResponse = (entities: Element[]) =>
  createEntitiesResponse('info', entities, {
    getName: 'get_info',
    responseName: 'get_info_response',
  });

export const createHttp = <TData = Element, TMeta extends Meta = Meta>(
  response?: TData | Response<TData, TMeta>,
) =>
  ({
    request: testing.fn().mockResolvedValue(response),
  }) as unknown as Http;

export const createHttpError = (error: Error) =>
  ({
    request: testing.fn().mockRejectedValue(error),
  }) as unknown as Http;

export const createHttpMany = (responses: Element[] | Response[]) => {
  let i = 0;
  return {
    request: testing
      .fn()
      .mockImplementation(() => Promise.resolve(responses[i++])),
  } as unknown as Http;
};
