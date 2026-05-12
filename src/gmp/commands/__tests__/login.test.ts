/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import LoginCommand from 'gmp/commands/login';
import {createResponse, createHttp} from 'gmp/commands/testing';
import {type Envelope} from 'gmp/http/transform/fast-xml';
import date from 'gmp/models/date';

describe('LoginCommand tests', () => {
  test('should return Login model on successful login', async () => {
    testing.useFakeTimers();
    const response = createResponse<Envelope>({
      token: 'abc123',
      timezone: 'UTC',
      i18n: 'en',
      session: 3600,
      jwt: 'jwt_token',
      client_address: '127.0.0.123',
    });
    const fakeHttp = createHttp(response, {
      apiProtocol: 'https',
      apiServer: 'example.com',
    });
    const cmd = new LoginCommand(fakeHttp);
    const loginModel = await cmd.login('user', 'pass');
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        login: 'user',
        password: 'pass',
      },
      url: 'https://example.com/login',
    });
    expect(loginModel.token).toEqual('abc123');
    expect(loginModel.timezone).toEqual('UTC');
    expect(loginModel.locale).toEqual('en');
    expect(loginModel.sessionTimeout).toEqual(date('1970-01-01T01:00:00.000Z'));
    expect(loginModel.jwt).toEqual('jwt_token');

    testing.useRealTimers();
  });
});
