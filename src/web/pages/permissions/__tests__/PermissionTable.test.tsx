/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Permission from 'gmp/models/permission';
import PermissionTable from 'web/pages/permissions/PermissionTable';

describe('PermissionTable tests', () => {
  test('should render without crashing', () => {
    const permissions = [
      Permission.fromElement({
        _id: '1',
        name: 'Permission 1',
      }),
      Permission.fromElement({
        _id: '2',
        name: 'Permission 2',
      }),
    ];
    const {render} = rendererWith({store: true, capabilities: true});
    render(<PermissionTable entities={permissions} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no permissions are available', () => {
    const {render} = rendererWith({store: true, capabilities: true});
    render(<PermissionTable entities={[]} />);
    expect(screen.getByText('No permissions available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if permissions aren't available", () => {
    const {render} = rendererWith({store: true, capabilities: true});
    const {container} = render(<PermissionTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render the permissions', () => {
    const permissions = [
      Permission.fromElement({
        _id: '1',
        name: 'Permission 1',
      }),
      Permission.fromElement({
        _id: '2',
        name: 'Permission 2',
      }),
    ];
    const {render} = rendererWith({store: true, capabilities: true});
    render(<PermissionTable entities={permissions} />);
    expect(screen.getByText('Permission 1')).toBeInTheDocument();
    expect(screen.getByText('Permission 2')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(permissions.length + 2);
    const headers = screen.queryAllByRole('columnheader');
    expect(headers).toHaveLength(7);
  });

  test('should allow to call action handlers', () => {
    const permissions = [
      new Permission({
        id: '1',
        name: 'Permission 1',
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const handlePermissionCloneClick = testing.fn();
    const handlePermissionDeleteClick = testing.fn();
    const handlePermissionDownloadClick = testing.fn();
    const handlePermissionEditClick = testing.fn();
    const {render} = rendererWith({store: true, capabilities: true});
    render(
      <PermissionTable
        entities={permissions}
        onPermissionCloneClick={handlePermissionCloneClick}
        onPermissionDeleteClick={handlePermissionDeleteClick}
        onPermissionDownloadClick={handlePermissionDownloadClick}
        onPermissionEditClick={handlePermissionEditClick}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handlePermissionCloneClick).toHaveBeenCalledWith(permissions[0]);

    const deleteButton = screen.queryAllByRole('button', {
      name: /delete|trash|move.*trashcan/i,
    })[0];
    fireEvent.click(deleteButton);
    expect(handlePermissionDeleteClick).toHaveBeenCalledWith(permissions[0]);

    const downloadButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(downloadButton);
    expect(handlePermissionDownloadClick).toHaveBeenCalledWith(permissions[0]);

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);
    expect(handlePermissionEditClick).toHaveBeenCalledWith(permissions[0]);
  });
});
