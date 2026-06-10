/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  testing,
} from '@gsa/testing';
import HttpCommand from 'gmp/commands/http';
import {
  createHttp,
  createHttpError,
  createResponse,
} from 'gmp/commands/testing';
import Gmp from 'gmp/gmp';
import Settings from 'gmp/settings';
import {createSession, createStorage} from 'gmp/testing';

let origLocation: Location;

describe('Gmp tests', () => {
  beforeAll(() => {
    origLocation = globalThis.location;
    // @ts-expect-error
    globalThis.location = {protocol: 'http:', host: 'localhost:9392'};
  });

  afterAll(() => {
    globalThis.location = origLocation;
  });

  test('should login user', async () => {
    const token = 'foo';
    const http = createHttp(createResponse({token}), {
      apiServer: 'localhost',
      apiProtocol: 'http:',
    });

    const storage = createStorage();
    const session = createSession();
    const settings = new Settings(storage);
    const gmp = new Gmp({settings, http, session});

    await gmp.login('foo', 'bar');
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        login: 'foo',
        password: 'bar',
      },
      url: 'http://localhost/login',
    });
    expect(session.login).toHaveBeenCalledWith({token, username: 'foo'});
  });

  test('should not login if request fails', async () => {
    const http = createHttpError(new Error('An error'), {
      apiServer: 'localhost',
      apiProtocol: 'http:',
    });
    const storage = createStorage();
    const session = createSession();
    const settings = new Settings(storage);
    const gmp = new Gmp({settings, http, session});

    try {
      return await gmp.login('foo', 'bar');
    } catch (error) {
      expect(http.request).toHaveBeenCalledWith('post', {
        data: {
          login: 'foo',
          password: 'bar',
        },
        url: 'http://localhost/login',
      });
      expect((error as Error).message).toEqual('An error');
      expect(session.login).not.toHaveBeenCalled();
    }
  });

  test('should allow to logout', () => {
    const storage = createStorage();
    const session = createSession();
    const settings = new Settings(storage);
    const gmp = new Gmp({settings, session});

    gmp.logout();

    expect(session.logout).toHaveBeenCalled();
  });

  test('should call logout handlers after logout', () => {
    const storage = createStorage();
    const session = createSession();
    const settings = new Settings(storage);
    const gmp = new Gmp({settings, session});
    const handler = testing.fn();
    const unsub = gmp.subscribeToLogout(handler);

    gmp.logout();

    expect(handler).toHaveBeenCalled();

    unsub();
  });

  test('should do logout user if user is logged in', async () => {
    const token = 'foo';
    const http = createHttp(createResponse());
    const storage = createStorage({token});
    const session = createSession({token});
    const settings = new Settings(storage, {apiServer: 'localhost'});
    const gmp = new Gmp({settings, http, session});

    expect(session.isLoggedIn()).toEqual(true);

    await gmp.doLogout();
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        token: 'foo',
      },
      url: 'http://localhost/logout',
    });
    expect(session.logout).toHaveBeenCalled();
  });

  test('should notify handler on do logout success', async () => {
    const http = createHttp(createResponse({}));
    const handler = testing.fn();
    const storage = createStorage();
    const session = createSession();
    const settings = new Settings(storage, {apiServer: 'localhost'});
    const gmp = new Gmp({settings, http, session});

    gmp.subscribeToLogout(handler);

    expect(session.isLoggedIn()).toEqual(true);

    await gmp.doLogout();

    expect(handler).toHaveBeenCalled();
  });

  test('should ignore do logout api call failure', async () => {
    const http = createHttpError(new Error('An error'));
    const handler = testing.fn();
    const storage = createStorage();
    const session = createSession();
    const settings = new Settings(storage, {
      apiServer: 'localhost',
      logLevel: 'silent',
    });
    const gmp = new Gmp({settings, http, session});

    gmp.subscribeToLogout(handler);

    expect(session.isLoggedIn()).toEqual(true);

    await gmp.doLogout();

    expect(handler).toHaveBeenCalled();
  });

  test('should not do logout if not logged int', async () => {
    const http = createHttp(createResponse({}));
    const handler = testing.fn();
    const session = createSession({isLoggedIn: () => false});
    const storage = createStorage();
    const settings = new Settings(storage, {apiServer: 'localhost'});
    const gmp = new Gmp({settings, http, session});

    gmp.subscribeToLogout(handler);

    expect(session.isLoggedIn()).toEqual(false);

    await gmp.doLogout();

    expect(handler).not.toHaveBeenCalled();
  });

  test.each([
    'agent',
    'agents',
    'agentgroup',
    'agentgroups',
    'agentinstaller',
    'agentinstallers',
    'alert',
    'alerts',
    'audit',
    'audits',
    'auth',
    'certbund',
    'certbunds',
    'cpe',
    'cpes',
    'credential',
    'credentials',
    'credentialstore',
    'credentialstores',
    'cve',
    'cves',
    'dashboard',
    'dfncert',
    'dfncerts',
    'feedstatus',
    'filter',
    'filters',
    'nvt',
    'nvtfamilies',
    'nvts',
    'ociimagetarget',
    'ociimagetargets',
    'performance',
    'permission',
    'permissions',
    'policy',
    'policies',
    'portlist',
    'portlists',
    'report',
    'reportapplications',
    'reportclosedcves',
    'reportconfig',
    'reportconfigs',
    'reportcves',
    'reporterrors',
    'reportformat',
    'reportformats',
    'reporthosts',
    'reportoperatingsystems',
    'reportports',
    'reports',
    'reporttlscertificates',
    'resourcenames',
    'result',
    'results',
    'role',
    'roles',
    'scanner',
    'scanners',
    'tag',
    'tags',
    'target',
    'targets',
    'task',
    'tasks',
    'timezones',
    'trashcan',
    'user',
    'users',
    'vuln',
    'vulns',
    'wizard',
    // registered commands (side-effect imports via registerCommand)
    'auditreport',
    'auditreports',
    'group',
    'groups',
    'host',
    'hosts',
    'license',
    'note',
    'notes',
    'operatingsystem',
    'operatingsystems',
    'override',
    'overrides',
    'scanconfig',
    'scanconfigs',
    'schedule',
    'schedules',
    'ticket',
    'tickets',
    'tlscertificate',
    'tlscertificates',
  ])('should expose command %s', name => {
    const storage = createStorage();
    const session = createSession();
    const settings = new Settings(storage);
    const gmp = new Gmp({settings, session});

    expect(gmp[name]).toBeInstanceOf(HttpCommand);
  });
});
