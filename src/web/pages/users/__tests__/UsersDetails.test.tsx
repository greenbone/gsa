/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import User, {
  ACCESS_ALLOW_ALL,
  ACCESS_DENY_ALL,
  AUTH_METHOD_LDAP,
  AUTH_METHOD_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import UserDetails, {
  convertAllow,
  convertAuthMethod,
} from 'web/pages/users/UserDetails';

const user = User.fromElement({
  _id: '1234',
  comment: 'test comment',
  name: 'user 1',
  role: {_id: 'role1', name: 'Admin'},
  groups: {
    group: [{_id: 'group1', name: 'Group 1'}],
  },
  hosts: {
    __text: '192.168.1.1',
    _allow: ACCESS_ALLOW_ALL,
  },
});

const gmp = {
  session: createSession({username: 'admin'}),
};

describe('users details helpers', () => {
  test('should convert auth method labels', () => {
    expect(convertAuthMethod(AUTH_METHOD_LDAP, message => message)).toBe(
      'LDAP',
    );
    expect(convertAuthMethod(AUTH_METHOD_RADIUS, message => message)).toBe(
      'RADIUS',
    );
    expect(convertAuthMethod(AUTH_METHOD_PASSWORD, message => message)).toBe(
      'Local',
    );
  });

  test('should convert host access labels', () => {
    expect(
      convertAllow(
        {allow: ACCESS_ALLOW_ALL, addresses: ['127.0.0.1']},
        (message, options) =>
          message.replace('{{addresses}}', String(options?.addresses)),
      ),
    ).toBe('Allow all and deny from 127.0.0.1');

    expect(
      convertAllow(
        {allow: ACCESS_DENY_ALL, addresses: ['127.0.0.1']},
        (message, options) =>
          message.replace('{{addresses}}', String(options?.addresses)),
      ),
    ).toBe('Deny all and allow from 127.0.0.1');

    expect(convertAllow({allow: ACCESS_ALLOW_ALL, addresses: []}, m => m)).toBe(
      'Allow all',
    );
  });
});

describe('UserDetails', () => {
  test('should render details without links when links is false', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(<UserDetails entity={user} links={false} />);

    screen.getByText('test comment');
    screen.getByText('Admin');
    screen.getByText('Group 1');
    screen.getByText('Allow all and deny from 192.168.1.1');
    screen.getByText('Local');
    expect(screen.queryByRole('link', {name: 'Admin'})).toBeNull();
  });
});
