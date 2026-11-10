/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  activeDirectoryMockResponse,
  type DirectoryFixtureScenario,
} from 'gmp/commands/fixtures/active-directory';
import {createHttp} from 'gmp/commands/testing';
import Response from 'gmp/http/response';
import {buildUrlParams} from 'gmp/http/utils';

/** Test HTTP transport: use real XML parsing instead of mocking command data. */
export const createDirectoryHttp = (
  scenario: DirectoryFixtureScenario = 'base',
) => {
  const http = createHttp();
  http.request.mockImplementation(async (_method, options) => {
    const params = new URLSearchParams(buildUrlParams(options.args ?? {}));
    const xml = activeDirectoryMockResponse(params, scenario);
    if (xml === undefined)
      throw new Error(`Unexpected mocked command: ${params.get('cmd')}`);
    return new Response(xml);
  });
  return http;
};
