/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Model from 'gmp/models/model';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import UsersTableRow from 'web/pages/users/UsersTableRow';

const createUser = (props: {
  id?: string;
  name: string;
  roles?: {_id: string; name: string}[];
}) =>
  new User({
    id: props.id ?? '1234',
    name: props.name,
    comment: 'test comment',
    roles: (props.roles ?? []).map(r => Model.fromElement(r, 'role')),
    userCapabilities: new EverythingCapabilities(),
  });

const user = createUser({
  name: 'user 1',
  roles: [
    {_id: '', name: 'Role without id'},
    {_id: 'role1', name: 'Admin'},
  ],
});

const superAdminUser = createUser({
  id: '5678',
  name: 'super admin',
  roles: [{_id: '9c5a6ec6-6fe2-11e4-8cb6-406186ea4fc5', name: 'Super Admin'}],
});

const createGmp = () => ({
  session: createSession({username: 'admin'}),
});

describe('UsersTableRow', () => {
  test('should render row data and fallback names without ids', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <UsersTableRow
        entity={user}
        links={false}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    screen.getByText('user 1');
    screen.getByText('Admin');
    screen.getByText('Role without id');
  });

  test('should render action buttons', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <UsersTableRow
        entity={user}
        onToggleDetailsClick={testing.fn()}
        onUserCloneClick={testing.fn()}
        onUserDeleteClick={testing.fn()}
        onUserDownloadClick={testing.fn()}
        onUserEditClick={testing.fn()}
      />,
    );

    screen.getByTitle('Delete User');
    screen.getByTitle('Edit User');
    screen.getByTitle('Clone User');
    screen.getByTitle('Export User');
  });

  test('should call action handlers', () => {
    const handleEdit = testing.fn();
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();

    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <UsersTableRow
        entity={user}
        onToggleDetailsClick={testing.fn()}
        onUserCloneClick={handleClone}
        onUserDeleteClick={handleDelete}
        onUserDownloadClick={handleDownload}
        onUserEditClick={handleEdit}
      />,
    );

    fireEvent.click(screen.getByTitle('Edit User'));
    expect(handleEdit).toHaveBeenCalledWith(user);

    fireEvent.click(screen.getByTitle('Clone User'));
    expect(handleClone).toHaveBeenCalledWith(user);

    fireEvent.click(screen.getByTitle('Delete User'));
    expect(handleDelete).toHaveBeenCalledWith(user);

    fireEvent.click(screen.getByTitle('Export User'));
    expect(handleDownload).toHaveBeenCalledWith(user);
  });

  test('should not render clone button for super admin user', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <UsersTableRow
        entity={superAdminUser}
        onToggleDetailsClick={testing.fn()}
        onUserCloneClick={testing.fn()}
        onUserDeleteClick={testing.fn()}
        onUserDownloadClick={testing.fn()}
        onUserEditClick={testing.fn()}
      />,
    );

    expect(screen.getByTitle('Clone User')).toBeDisabled();
    screen.getByTitle('Delete User');
    screen.getByTitle('Edit User');
    screen.getByTitle('Export User');
  });
});
