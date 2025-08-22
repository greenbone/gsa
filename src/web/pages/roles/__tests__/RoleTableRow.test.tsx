/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, screen, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Role from 'gmp/models/role';
import RoleTableRow from 'web/pages/roles/RoleTableRow';
import {setUsername} from 'web/store/usersettings/actions';

describe('RoleTableRow tests', () => {
  test('should render entity name', async () => {
    const role = new Role({
      id: '1',
      name: 'Test Role',
      userCapabilities: new EverythingCapabilities(),
    });
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(<RoleTableRow entity={role} />);
    expect(screen.getByText('Test Role')).toBeVisible();
  });

  test('should call onToggleDetailsClick when EntityNameTableData is clicked', async () => {
    const role = new Role({
      id: '1',
      name: 'Test Role',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleToggle = testing.fn();
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(<RoleTableRow entity={role} onToggleDetailsClick={handleToggle} />);

    const details = screen.getByTestId('row-details-toggle');
    fireEvent.click(details);
    expect(handleToggle).toHaveBeenCalledWith(role, '1');
  });

  test('should render default actions', async () => {
    const role = new Role({
      id: '1',
      name: 'Test Role',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <RoleTableRow
        entity={role}
        onRoleCloneClick={handleClone}
        onRoleDeleteClick={handleDelete}
        onRoleDownloadClick={handleDownload}
        onRoleEditClick={handleEdit}
      />,
    );

    expect(screen.getByRole('button', {name: /delete/i})).toBeVisible();
    expect(screen.getByRole('button', {name: /edit/i})).toBeVisible();
    expect(screen.getByRole('button', {name: /clone/i})).toBeVisible();
    expect(screen.getByRole('button', {name: /export/i})).toBeVisible();
  });
});
