/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {AuthenticationCommand} from '../auth';

import {createActionResultResponse, createHttp} from '../testing';

describe('AuthenticationCommand tests', () => {
  test('should enable ldap', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const authdn = 'cn=%s,dc=devel,dc=foo,dc=bar';
    const certificate = 'foobar';
    const ldaphost = 'foo.bar';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    return cmd
      .saveLdap({
        authdn,
        certificate,
        enable: true,
        ldaphost,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            authdn,
            certificate,
            cmd: 'save_auth',
            enable: 1,
            group: 'method:ldap_connect',
            ldaphost,
          },
        });
      });
  });

  test('should disable ldap', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const authdn = 'cn=%s,dc=devel,dc=foo,dc=bar';
    const certificate = 'foobar';
    const ldaphost = 'foo.bar';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    return cmd
      .saveLdap({
        authdn,
        certificate,
        enable: false,
        ldaphost,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            authdn,
            certificate,
            cmd: 'save_auth',
            enable: 0,
            group: 'method:ldap_connect',
            ldaphost,
          },
        });
      });
  });

  test('should enable radius', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const radiushost = 'foo.bar';
    const radiuskey = 'foo';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    return cmd.saveRadius({enable: true, radiushost, radiuskey}).then(() => {
      expect(fakeHttp.request).toBeCalledWith('post', {
        data: {
          cmd: 'save_auth',
          enable: 1,
          group: 'method:radius_connect',
          radiushost,
          radiuskey,
        },
      });
    });
  });

  test('should disable radius', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const radiushost = 'foo.bar';
    const radiuskey = 'foo';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    return cmd.saveRadius({enable: false, radiushost, radiuskey}).then(() => {
      expect(fakeHttp.request).toBeCalledWith('post', {
        data: {
          cmd: 'save_auth',
          enable: 0,
          group: 'method:radius_connect',
          radiushost,
          radiuskey,
        },
      });
    });
  });
});
