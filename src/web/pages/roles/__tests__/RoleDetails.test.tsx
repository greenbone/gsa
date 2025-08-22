/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Role from 'gmp/models/role';
import RoleDetails from 'web/pages/roles/RoleDetails';

describe('RoleDetails tests', () => {
  test('should render comment', () => {
    const role = new Role({
      comment: 'Test role comment',
      users: ['user1', 'user2'],
    });
    const {render} = rendererWith({capabilities: true});
    render(<RoleDetails entity={role} />);
    expect(screen.getByText('Comment')).toBeVisible();
    expect(screen.getByText('Test role comment')).toBeVisible();
  });

  test('should render users list', () => {
    const role = new Role({
      comment: 'Test role comment',
      users: ['admin', 'editor', 'viewer'],
    });
    const {render} = rendererWith({capabilities: true});
    render(<RoleDetails entity={role} />);
    expect(screen.getByText('Users')).toBeVisible();
    expect(screen.getByText('admin')).toBeVisible();
    expect(screen.getByText('editor')).toBeVisible();
    expect(screen.getByText('viewer')).toBeVisible();
  });

  test('should render empty users list when no users are provided', () => {
    const role = new Role({
      comment: 'Test role comment',
      users: [],
    });
    const {render} = rendererWith({capabilities: true});
    render(<RoleDetails entity={role} />);
    expect(screen.getByText('Users')).toBeVisible();
    const usersRow = screen.getByText('Users').closest('tr');
    expect(usersRow).toBeVisible();
  });

  test('should render with single user', () => {
    const role = new Role({
      comment: 'Single user role',
      users: ['singleUser'],
    });
    const {render} = rendererWith({capabilities: true});
    render(<RoleDetails entity={role} />);
    expect(screen.getByText('Users')).toBeVisible();
    expect(screen.getByText('singleUser')).toBeVisible();
  });

  test('should render with undefined comment', () => {
    const role = new Role({
      users: ['testUser'],
    });
    const {render} = rendererWith({capabilities: true});
    render(<RoleDetails entity={role} />);
    expect(screen.getByText('Comment')).toBeVisible();

    const commentRow = screen.getByText('Comment').closest('tr');
    expect(commentRow).toBeVisible();
  });

  test('should render with empty comment', () => {
    const role = new Role({
      comment: '',
      users: ['testUser'],
    });
    const {render} = rendererWith({capabilities: true});
    render(<RoleDetails entity={role} />);
    expect(screen.getByText('Comment')).toBeVisible();

    const commentRow = screen.getByText('Comment').closest('tr');
    expect(commentRow).toBeVisible();
  });
});
