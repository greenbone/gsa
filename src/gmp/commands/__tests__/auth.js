/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
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
