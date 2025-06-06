/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import Table from 'web/pages/policies/Table';
import {setUsername} from 'web/store/usersettings/actions';

const policy = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
});

const policy2 = Policy.fromElement({
  _id: '123456',
  name: 'lorem',
  comment: 'ipsum',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
});

const policy3 = Policy.fromElement({
  _id: '1234567',
  name: 'hello',
  comment: 'world',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 2,
});

const filter = Filter.fromString('rows=2');

describe('Policies table tests', () => {
  test('should render', () => {
    const handlePolicyCloneClick = testing.fn();
    const handleCreateAuditClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Table
        entities={[policy, policy2, policy3]}
        entitiesCounts={counts}
        filter={filter}
        onCreateAuditClick={handleCreateAuditClick}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    expect(baseElement).toBeVisible();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handlePolicyCloneClick = testing.fn();
    const handleCreateAuditClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {element} = render(
      <Table
        entities={[policy, policy2, policy3]}
        entitiesCounts={counts}
        filter={filter}
        onCreateAuditClick={handleCreateAuditClick}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    expect(element).not.toHaveTextContent('Comment');

    const unfoldIcon = screen.getByTestId('fold-state-icon-unfold');
    expect(unfoldIcon).toHaveAttribute('title', 'Unfold all details');
    fireEvent.click(unfoldIcon);
    expect(element).toHaveTextContent('Comment');
  });

  test('should call click handlers', () => {
    const handlePolicyCloneClick = testing.fn();
    const handleCreateAuditClick = testing.fn();
    const handlePolicyDeleteClick = testing.fn();
    const handlePolicyDownloadClick = testing.fn();
    const handlePolicyEditClick = testing.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    render(
      <Table
        entities={[policy, policy2, policy3]}
        entitiesCounts={counts}
        filter={filter}
        onCreateAuditClick={handleCreateAuditClick}
        onPolicyCloneClick={handlePolicyCloneClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const deleteIcon = screen.getAllByTestId('trashcan-icon')[0];
    expect(deleteIcon).toHaveAttribute('title', 'Move Policy to trashcan');
    fireEvent.click(deleteIcon);
    expect(handlePolicyDeleteClick).toHaveBeenCalledWith(policy);

    const editIcon = screen.getAllByTestId('edit-icon')[0];
    expect(editIcon).toHaveAttribute('title', 'Edit Policy');
    fireEvent.click(editIcon);
    expect(handlePolicyEditClick).toHaveBeenCalledWith(policy);

    const cloneIcon = screen.getAllByTestId('clone-icon')[0];
    expect(cloneIcon).toHaveAttribute('title', 'Clone Policy');
    fireEvent.click(cloneIcon);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy);

    const newIcon = screen.getAllByTestId('new-icon')[0];
    expect(newIcon).toHaveAttribute('title', 'Create Audit from Policy');
    fireEvent.click(newIcon);
    expect(handleCreateAuditClick).toHaveBeenCalledWith(policy);

    const exportIcon = screen.getAllByTestId('export-icon')[0];
    expect(exportIcon).toHaveAttribute('title', 'Export Policy');
    fireEvent.click(exportIcon);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy);
  });
});
