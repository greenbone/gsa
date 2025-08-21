/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Role from 'gmp/models/role';
import RoleTable from 'web/pages/roles/RoleTable';

describe('RoleTable tests', () => {
  test('should render without crashing', () => {
    const roles = [
      new Role({
        id: '1',
        name: 'Role 1',
      }),
      new Role({
        id: '2',
        name: 'Role 2',
      }),
    ];
    const {render} = rendererWith({store: true, capabilities: true});
    render(<RoleTable entities={roles} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no roles are available', () => {
    const {render} = rendererWith({store: true, capabilities: true});
    render(<RoleTable entities={[]} />);
    expect(screen.getByText('No Roles available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if roles aren't available", () => {
    const {render} = rendererWith({store: true, capabilities: true});
    const {container} = render(<RoleTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render the roles', () => {
    const roles = [
      new Role({
        id: '1',
        name: 'Role 1',
      }),
      new Role({
        id: '2',
        name: 'Role 2',
      }),
    ];
    const {render} = rendererWith({store: true, capabilities: true});
    render(<RoleTable entities={roles} />);
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(roles.length + 2);
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should allow to call action handlers', () => {
    const roles = [
      new Role({
        id: '1',
        name: 'Role 1',
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render} = rendererWith({store: true, capabilities: true});
    render(
      <RoleTable
        entities={roles}
        onRoleCloneClick={handleClone}
        onRoleDeleteClick={handleDelete}
        onRoleDownloadClick={handleDownload}
        onRoleEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(roles[0]);

    const deleteButton = screen.queryAllByRole('button', {name: /delete/i})[0];
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(roles[0]);

    const downloadButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith(roles[0]);

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(roles[0]);
  });
});
