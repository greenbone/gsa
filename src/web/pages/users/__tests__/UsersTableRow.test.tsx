/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import TableData from 'web/components/table/TableData';
import UsersTableRow from 'web/pages/users/UsersTableRow';

const user = User.fromElement({
  _id: '1234',
  comment: 'test comment',
  name: 'user 1',
  role: [
    {_id: '', name: 'Role without id'},
    {_id: 'role1', name: 'Admin'},
  ],
  groups: {
    group: [
      {_id: '', name: 'Group without id'},
      {_id: 'group1', name: 'Group 1'},
    ],
  },
  hosts: {
    __text: '192.168.1.1',
    _allow: '0',
  },
});

const gmp = {
  session: createSession({username: 'admin'}),
};

describe('users Row', () => {
  test('should render row data and fallback names without ids', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(
      <table>
        <tbody>
          <UsersTableRow
            actionsComponent={() => <TableData>Custom Actions</TableData>}
            entity={user}
            links={false}
          />
        </tbody>
      </table>,
    );

    screen.getByText('user 1');
    screen.getByText('Admin');
    screen.getByText('Role without id');
    screen.getByText('Group 1');
    screen.getByText('Group without id');
    screen.getByText('Allow all and deny from 192.168.1.1');
    screen.getByText('Local');
    screen.getByText('Custom Actions');
  });
});
