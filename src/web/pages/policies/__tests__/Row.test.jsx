/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Policy from 'gmp/models/policy';
import Row from 'web/pages/policies/Row';
import {setUsername} from 'web/store/usersettings/actions';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const entity = Policy.fromElement({
  _id: '1234',
  name: 'foo',
  comment: 'bar',
  in_use: '0',
  writable: '1',
  permissions: {permission: [{name: 'everything'}]},
});

describe('Row tests', () => {
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handlePolicyClone = testing.fn();
    const handlePolicyDelete = testing.fn();
    const handlePolicyDownload = testing.fn();
    const handlePolicyEdit = testing.fn();
    const handleCreateAudit = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      store: true,
    });
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={entity}
        onCreateAuditClick={handleCreateAudit}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toBeVisible();
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('(bar)');
  });

  test('should render observer icon', () => {
    const policy = Policy.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
      owner: {name: 'user'},
      permissions: {permission: [{name: 'everything'}]},
    });

    const handleToggleDetailsClick = testing.fn();
    const handlePolicyClone = testing.fn();
    const handlePolicyDelete = testing.fn();
    const handlePolicyDownload = testing.fn();
    const handlePolicyEdit = testing.fn();
    const handleCreateAudit = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      store: true,
    });

    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={policy}
        onCreateAuditClick={handleCreateAudit}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const observerIcon = screen.getByTestId('observer-icon');
    expect(observerIcon).toHaveAttribute('title', 'Policy owned by user');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();
    const handlePolicyClone = testing.fn();
    const handlePolicyDelete = testing.fn();
    const handlePolicyDownload = testing.fn();
    const handlePolicyEdit = testing.fn();
    const handleCreateAudit = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={entity}
        onCreateAuditClick={handleCreateAudit}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(entity, '1234');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Policy to trashcan');
    fireEvent.click(deleteIcon);
    expect(handlePolicyDelete).toHaveBeenCalledWith(entity);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(editIcon);
    expect(handlePolicyEdit).toHaveBeenCalledWith(entity);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(handlePolicyClone).toHaveBeenCalledWith(entity);

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'Create Audit from Policy');
    fireEvent.click(newIcon);
    expect(handleCreateAudit).toHaveBeenCalledWith(entity);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy');
    fireEvent.click(exportIcon);
    expect(handlePolicyDownload).toHaveBeenCalledWith(entity);
  });

  test('should not call click handlers without permissions', () => {
    const handleToggleDetailsClick = testing.fn();
    const handlePolicyClone = testing.fn();
    const handlePolicyDelete = testing.fn();
    const handlePolicyDownload = testing.fn();
    const handlePolicyEdit = testing.fn();
    const handleCreateAudit = testing.fn();

    const policy = Policy.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
    });

    const wrongCaps = new Capabilities(['authenticate']);

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: wrongCaps,
      store: true,
    });
    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={policy}
        onCreateAuditClick={handleCreateAudit}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(policy, '1234');

    // because the icon for "create audit from policy" is not rendered
    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Policy to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handlePolicyDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Policy denied',
    );
    fireEvent.click(editIcon);
    expect(handlePolicyEdit).not.toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Policy denied',
    );
    fireEvent.click(cloneIcon);
    expect(handlePolicyClone).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy');
    fireEvent.click(exportIcon);
    expect(handlePolicyDownload).toHaveBeenCalledWith(policy);
  });

  test('should (not) call click handlers if policy is in use', () => {
    const handleToggleDetailsClick = testing.fn();
    const handlePolicyClone = testing.fn();
    const handlePolicyDelete = testing.fn();
    const handlePolicyDownload = testing.fn();
    const handlePolicyEdit = testing.fn();
    const handleCreateAudit = testing.fn();

    const policy = Policy.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '1',
      writable: '1',
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={policy}
        onCreateAuditClick={handleCreateAudit}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(policy, '1234');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Policy is still in use');
    fireEvent.click(deleteIcon);
    expect(handlePolicyDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(editIcon);
    expect(handlePolicyEdit).toHaveBeenCalledWith(policy);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(handlePolicyClone).toHaveBeenCalledWith(policy);

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'Create Audit from Policy');
    fireEvent.click(newIcon);
    expect(handleCreateAudit).toHaveBeenCalledWith(policy);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy');
    fireEvent.click(exportIcon);
    expect(handlePolicyDownload).toHaveBeenCalledWith(policy);
  });

  test('should (not) call click handlers if policy is not writable', () => {
    const handleToggleDetailsClick = testing.fn();
    const handlePolicyClone = testing.fn();
    const handlePolicyDelete = testing.fn();
    const handlePolicyDownload = testing.fn();
    const handlePolicyEdit = testing.fn();
    const handleCreateAudit = testing.fn();

    const policy = Policy.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '0',
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={policy}
        onCreateAuditClick={handleCreateAudit}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(policy, '1234');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Policy is not writable');
    fireEvent.click(deleteIcon);
    expect(handlePolicyDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Policy is not writable');
    fireEvent.click(editIcon);
    expect(handlePolicyEdit).not.toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(handlePolicyClone).toHaveBeenCalledWith(policy);

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'Create Audit from Policy');
    fireEvent.click(newIcon);
    expect(handleCreateAudit).toHaveBeenCalledWith(policy);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Policy');
    fireEvent.click(exportIcon);
    expect(handlePolicyDownload).toHaveBeenCalledWith(policy);
  });
});
