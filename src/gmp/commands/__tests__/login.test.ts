/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import LoginCommand from 'gmp/commands/login';
import {
  createResponse,
  createHttp,
  createHttpError,
} from 'gmp/commands/testing';
import {ResponseRejection} from 'gmp/http/rejection';
import date from 'gmp/models/date';
import {type LoginData} from 'gmp/models/login';

describe('LoginCommand tests', () => {
  test('should return Login model on successful login', async () => {
    testing.useFakeTimers();
    testing.setSystemTime(new Date('1970-01-01T00:00:00.000Z'));

    const response = createResponse<LoginData>({
      token: 'abc123',
      timezone: 'UTC',
      i18n: 'en',
      jwt: 'jwt_token',
      client_address: '127.0.0.123',
      duration: 180, // 3 minutes
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
    expect(loginModel.sessionTimeout).toEqual(date('1970-01-01T00:03:00.000Z'));
    expect(loginModel.jwt).toEqual('jwt_token');

    testing.useRealTimers();
  });

  test.each([
    [401, 'Bad login information'],
    [404, 'Could not connect to server'],
    [500, 'GMP error during authentication'],
    [
      503,
      'The Greenbone Vulnerability Manager service is not responding. This could be due to system maintenance. Please try again later, check the system status, or contact your system administrator.',
    ],
  ])(
    'should translate a %s response rejection',
    async (status, expectedMessage) => {
      const rejection = new ResponseRejection(
        {status} as XMLHttpRequest,
        'original error',
      );
      const cmd = new LoginCommand(
        createHttpError(rejection, {
          apiProtocol: 'https',
          apiServer: 'example.com',
        }),
      );

      await expect(cmd.login('user', 'pass')).rejects.toMatchObject({
        message: expectedMessage,
      });
    },
  );

  test('should preserve the original message for an unmapped response status', async () => {
    const rejection = new ResponseRejection(
      {status: 400} as XMLHttpRequest,
      'original error',
    );
    const cmd = new LoginCommand(
      createHttpError(rejection, {
        apiProtocol: 'https',
        apiServer: 'example.com',
      }),
    );

    await expect(cmd.login('user', 'pass')).rejects.toMatchObject({
      message: 'original error',
    });
  });

  test('should rethrow non-response errors unchanged', async () => {
    const error = new Error('network error');
    const cmd = new LoginCommand(
      createHttpError(error, {
        apiProtocol: 'https',
        apiServer: 'example.com',
      }),
    );

    await expect(cmd.login('user', 'pass')).rejects.toBe(error);
  });
});
