/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';

import {setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Table from '../table';

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
    const handlePolicyCloneClick = jest.fn();
    const handleCreateAuditClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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
        filter={filter}
        entities={[policy, policy2, policy3]}
        entitiesCounts={counts}
        onPolicyCloneClick={handlePolicyCloneClick}
        onCreateAuditClick={handleCreateAuditClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handlePolicyCloneClick = jest.fn();
    const handleCreateAuditClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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

    const {element, getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[policy, policy2, policy3]}
        entitiesCounts={counts}
        onPolicyCloneClick={handlePolicyCloneClick}
        onCreateAuditClick={handleCreateAuditClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    expect(element).not.toHaveTextContent('Comment');

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[0]);
    expect(icons[0]).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('Comment');
  });

  test('should call click handlers', () => {
    const handlePolicyCloneClick = jest.fn();
    const handleCreateAuditClick = jest.fn();
    const handlePolicyDeleteClick = jest.fn();
    const handlePolicyDownloadClick = jest.fn();
    const handlePolicyEditClick = jest.fn();

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

    const {getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[policy, policy2, policy3]}
        entitiesCounts={counts}
        onPolicyCloneClick={handlePolicyCloneClick}
        onCreateAuditClick={handleCreateAuditClick}
        onPolicyDeleteClick={handlePolicyDeleteClick}
        onPolicyDownloadClick={handlePolicyDownloadClick}
        onPolicyEditClick={handlePolicyEditClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[5]);
    expect(handlePolicyDeleteClick).toHaveBeenCalledWith(policy);
    expect(icons[5]).toHaveAttribute('title', 'Move Policy to trashcan');

    fireEvent.click(icons[6]);
    expect(handlePolicyEditClick).toHaveBeenCalledWith(policy);
    expect(icons[6]).toHaveAttribute('title', 'Edit Policy');

    fireEvent.click(icons[7]);
    expect(handlePolicyCloneClick).toHaveBeenCalledWith(policy);
    expect(icons[7]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[8]);
    expect(handleCreateAuditClick).toHaveBeenCalledWith(policy);
    expect(icons[8]).toHaveAttribute('title', 'Create Audit from Policy');

    fireEvent.click(icons[9]);
    expect(handlePolicyDownloadClick).toHaveBeenCalledWith(policy);
    expect(icons[9]).toHaveAttribute('title', 'Export Policy');
  });
});
