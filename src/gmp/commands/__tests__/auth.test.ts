/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {AuthenticationCommand} from 'gmp/commands/auth';
import {createActionResultResponse, createHttp} from 'gmp/commands/testing';

describe('AuthenticationCommand tests', () => {
  test('should enable ldap', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const authdn = 'cn=%s,dc=devel,dc=foo,dc=bar';
    const certificate = new File(['foobar'], 'foobar.pem');
    const ldapHost = 'foo.bar';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    await cmd.saveLdap({
      authdn,
      certificate,
      enable: true,
      ldapHost,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        authdn,
        certificate,
        cmd: 'save_auth',
        enable: 1,
        group: 'method:ldap_connect',
        ldaphost: ldapHost,
      },
    });
  });

  test('should disable ldap', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const authdn = 'cn=%s,dc=devel,dc=foo,dc=bar';
    const certificate = new File(['foobar'], 'foobar.pem');
    const ldapHost = 'foo.bar';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    await cmd.saveLdap({
      authdn,
      certificate,
      enable: false,
      ldapHost,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        authdn,
        certificate,
        cmd: 'save_auth',
        enable: 0,
        group: 'method:ldap_connect',
        ldaphost: ldapHost,
      },
    });
  });

  test('should enable radius', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const radiusHost = 'foo.bar';
    const radiusKey = 'foo';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    await cmd.saveRadius({enable: true, radiusHost, radiusKey});
    expect(fakeHttp.request).toBeCalledWith('post', {
      data: {
        cmd: 'save_auth',
        enable: 1,
        group: 'method:radius_connect',
        radiushost: radiusHost,
        radiuskey: radiusKey,
      },
    });
  });

  test('should disable radius', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const radiusHost = 'foo.bar';
    const radiusKey = 'foo';

    expect.hasAssertions();

    const cmd = new AuthenticationCommand(fakeHttp);
    await cmd.saveRadius({enable: false, radiusHost, radiusKey});
    expect(fakeHttp.request).toBeCalledWith('post', {
      data: {
        cmd: 'save_auth',
        enable: 0,
        group: 'method:radius_connect',
        radiushost: radiusHost,
        radiuskey: radiusKey,
      },
    });
  });
});
