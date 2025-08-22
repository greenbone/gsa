/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, screen, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Permission from 'gmp/models/permission';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import PermissionTableRow from 'web/pages/permissions/PermissionTableRow';
import {setUsername} from 'web/store/usersettings/actions';

const permission = Permission.fromElement({
  _id: '1',
  name: 'get_tasks',
  comment: 'Test permission',
  creation_time: '2025-07-16T06:31:29Z',
  modification_time: '2025-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: YES_VALUE,
  in_use: NO_VALUE,
  resource: {_id: 'resource123', type: 'config'},
  subject: {_id: 'subject123', type: 'user'},
});

const handleClone = testing.fn();
const handleDelete = testing.fn();
const handleDownload = testing.fn();
const handleEdit = testing.fn();
const handleToggle = testing.fn();

describe('PermissionTableRow tests', () => {
  test('should render entity name', async () => {
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });

    store.dispatch(setUsername('foo'));

    render(
      <PermissionTableRow
        entity={permission}
        onToggleDetailsClick={() => {}}
      />,
    );

    expect(screen.getByText('get_tasks')).toBeVisible();
  });

  test('should call onToggleDetailsClick when EntityNameTableData is clicked', async () => {
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });

    store.dispatch(setUsername('foo'));
    render(
      <PermissionTableRow
        entity={permission}
        onToggleDetailsClick={handleToggle}
      />,
    );

    const details = screen.getByTestId('row-details-toggle');
    fireEvent.click(details);
    expect(handleToggle).toHaveBeenCalledWith(permission, '1');
  });

  test('should render default actions', async () => {
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <PermissionTableRow
        entity={permission}
        onPermissionCloneClick={handleClone}
        onPermissionDeleteClick={handleDelete}
        onPermissionDownloadClick={handleDownload}
        onPermissionEditClick={handleEdit}
        onToggleDetailsClick={() => {}}
      />,
    );

    expect(screen.getByRole('button', {name: /delete/i})).toBeVisible();
    expect(screen.getByRole('button', {name: /edit/i})).toBeVisible();
    expect(screen.getByRole('button', {name: /clone/i})).toBeVisible();
    expect(screen.getByRole('button', {name: /export/i})).toBeVisible();
  });

  test('should render permission description', async () => {
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <PermissionTableRow
        entity={permission}
        onToggleDetailsClick={() => {}}
      />,
    );

    expect(screen.getByText(/get_tasks/)).toBeVisible();
  });

  test('should handle permission without resource', async () => {
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <PermissionTableRow
        entity={permission}
        onToggleDetailsClick={() => {}}
      />,
    );

    expect(screen.getByText('get_tasks')).toBeVisible();
  });

  test('should handle permission without subject', async () => {
    const permission = Permission.fromElement({
      _id: '1',
      name: 'get_tasks',
      comment: 'Test permission without subject',
      creation_time: '2025-07-16T06:31:29Z',
      modification_time: '2025-07-16T06:44:55Z',
      owner: {name: 'admin'},
      writable: YES_VALUE,
      in_use: NO_VALUE,
      resource: {_id: 'resource123', type: 'config'},
    });
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <PermissionTableRow
        entity={permission}
        onToggleDetailsClick={() => {}}
      />,
    );

    expect(screen.getByText('get_tasks')).toBeVisible();
  });

  test('should call action handlers when action buttons are clicked', async () => {
    (
      permission as Permission & {userCapabilities: EverythingCapabilities}
    ).userCapabilities = new EverythingCapabilities();

    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <PermissionTableRow
        entity={permission}
        onPermissionCloneClick={handleClone}
        onPermissionDeleteClick={handleDelete}
        onPermissionDownloadClick={handleDownload}
        onPermissionEditClick={handleEdit}
        onToggleDetailsClick={() => {}}
      />,
    );

    const deleteButton = screen.getByRole('button', {name: /delete/i});
    const editButton = screen.getByRole('button', {name: /edit/i});
    const cloneButton = screen.getByRole('button', {name: /clone/i});
    const exportButton = screen.getByRole('button', {name: /export/i});

    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(permission);

    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(permission);

    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(permission);

    fireEvent.click(exportButton);
    expect(handleDownload).toHaveBeenCalledWith(permission);
  });
});
