/* Copyright (C) 2019-2022 Greenbone Networks GmbH
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
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import Policy from 'gmp/models/policy';

import {setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Row from '../row';

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
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleToggleDetailsClick = jest.fn();
    const handlePolicyClone = jest.fn();
    const handlePolicyDelete = jest.fn();
    const handlePolicyDownload = jest.fn();
    const handlePolicyEdit = jest.fn();
    const handleCreateAudit = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    const {baseElement} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onCreateAuditClick={handleCreateAudit}
      />,
    );

    expect(baseElement).toMatchSnapshot();
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

    const handleToggleDetailsClick = jest.fn();
    const handlePolicyClone = jest.fn();
    const handlePolicyDelete = jest.fn();
    const handlePolicyDownload = jest.fn();
    const handlePolicyEdit = jest.fn();
    const handleCreateAudit = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
    });

    store.dispatch(setUsername('username'));

    const {getAllByTestId} = render(
      <Row
        entity={policy}
        onToggleDetailsClick={handleToggleDetailsClick}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onCreateAuditClick={handleCreateAudit}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Policy owned by user');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = jest.fn();
    const handlePolicyClone = jest.fn();
    const handlePolicyDelete = jest.fn();
    const handlePolicyDownload = jest.fn();
    const handlePolicyEdit = jest.fn();
    const handleCreateAudit = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onCreateAuditClick={handleCreateAudit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handlePolicyDelete).toHaveBeenCalledWith(entity);
    expect(icons[0]).toHaveAttribute('title', 'Move Policy to trashcan');

    fireEvent.click(icons[1]);
    expect(handlePolicyEdit).toHaveBeenCalledWith(entity);
    expect(icons[1]).toHaveAttribute('title', 'Edit Policy');

    fireEvent.click(icons[2]);
    expect(handlePolicyClone).toHaveBeenCalledWith(entity);
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(handleCreateAudit).toHaveBeenCalledWith(entity);
    expect(icons[3]).toHaveAttribute('title', 'Create Audit from Policy');

    fireEvent.click(icons[4]);
    expect(handlePolicyDownload).toHaveBeenCalledWith(entity);
    expect(icons[4]).toHaveAttribute('title', 'Export Policy');
  });

  test('should not call click handlers without permissions', () => {
    const handleToggleDetailsClick = jest.fn();
    const handlePolicyClone = jest.fn();
    const handlePolicyDelete = jest.fn();
    const handlePolicyDownload = jest.fn();
    const handlePolicyEdit = jest.fn();
    const handleCreateAudit = jest.fn();

    const policy = Policy.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '1',
    });

    const wrongCaps = new Capabilities(['authenticate']);

    const {render, store} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={policy}
        onToggleDetailsClick={handleToggleDetailsClick}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onCreateAuditClick={handleCreateAudit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toBe(4);
    // because the icon for "create audit from policy" is not rendered

    fireEvent.click(icons[0]);
    expect(handlePolicyDelete).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute(
      'title',
      'Permission to move Policy to trashcan denied',
    );

    fireEvent.click(icons[1]);
    expect(handlePolicyEdit).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute(
      'title',
      'Permission to edit Policy denied',
    );

    fireEvent.click(icons[2]);
    expect(handlePolicyClone).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to clone Policy denied',
    );

    fireEvent.click(icons[3]);
    expect(handlePolicyDownload).toHaveBeenCalledWith(policy);
    expect(icons[3]).toHaveAttribute('title', 'Export Policy');
  });

  test('should (not) call click handlers if policy is in use', () => {
    const handleToggleDetailsClick = jest.fn();
    const handlePolicyClone = jest.fn();
    const handlePolicyDelete = jest.fn();
    const handlePolicyDownload = jest.fn();
    const handlePolicyEdit = jest.fn();
    const handleCreateAudit = jest.fn();

    const policy = Policy.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '1',
      writable: '1',
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={policy}
        onToggleDetailsClick={handleToggleDetailsClick}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onCreateAuditClick={handleCreateAudit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handlePolicyDelete).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute('title', 'Policy is still in use');

    fireEvent.click(icons[1]);
    expect(handlePolicyEdit).toHaveBeenCalledWith(policy);
    expect(icons[1]).toHaveAttribute('title', 'Edit Policy');

    fireEvent.click(icons[2]);
    expect(handlePolicyClone).toHaveBeenCalledWith(policy);
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(handleCreateAudit).toHaveBeenCalledWith(policy);
    expect(icons[3]).toHaveAttribute('title', 'Create Audit from Policy');

    fireEvent.click(icons[4]);
    expect(handlePolicyDownload).toHaveBeenCalledWith(policy);
    expect(icons[4]).toHaveAttribute('title', 'Export Policy');
  });

  test('should (not) call click handlers if policy is not writable', () => {
    const handleToggleDetailsClick = jest.fn();
    const handlePolicyClone = jest.fn();
    const handlePolicyDelete = jest.fn();
    const handlePolicyDownload = jest.fn();
    const handlePolicyEdit = jest.fn();
    const handleCreateAudit = jest.fn();

    const policy = Policy.fromElement({
      _id: '1234',
      name: 'foo',
      comment: 'bar',
      in_use: '0',
      writable: '0',
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={policy}
        onToggleDetailsClick={handleToggleDetailsClick}
        onPolicyCloneClick={handlePolicyClone}
        onPolicyDeleteClick={handlePolicyDelete}
        onPolicyDownloadClick={handlePolicyDownload}
        onPolicyEditClick={handlePolicyEdit}
        onCreateAuditClick={handleCreateAudit}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handlePolicyDelete).not.toHaveBeenCalled();
    expect(icons[0]).toHaveAttribute('title', 'Policy is not writable');

    fireEvent.click(icons[1]);
    expect(handlePolicyEdit).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Policy is not writable');

    fireEvent.click(icons[2]);
    expect(handlePolicyClone).toHaveBeenCalledWith(policy);
    expect(icons[2]).toHaveAttribute('title', 'Clone Policy');

    fireEvent.click(icons[3]);
    expect(handleCreateAudit).toHaveBeenCalledWith(policy);
    expect(icons[3]).toHaveAttribute('title', 'Create Audit from Policy');

    fireEvent.click(icons[4]);
    expect(handlePolicyDownload).toHaveBeenCalledWith(policy);
    expect(icons[4]).toHaveAttribute('title', 'Export Policy');
  });

  console.warn = consoleError;
});
