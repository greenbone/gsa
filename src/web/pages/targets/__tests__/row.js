/* Copyright (C) 2021-2022 Greenbone AG
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
import {setLocale} from 'gmp/locale/lang';

import Target from 'gmp/models/target';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import Row from '../row';

setLocale('en');

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const target_elevate = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: 'Scan Config Default',
  comment: 'hello world',
  writable: '1',
  in_use: '1',
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: '2',
  reverse_lookup_only: '1',
  reverse_lookup_unify: '0',
  port_list: {
    _id: 'pl_id1',
    name: 'pl1',
    trash: '0',
  },
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: '22',
    trash: '0',
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
    trash: '0',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  snmp_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  tasks: {
    task: [
      {
        _id: 'task_id',
        name: 'task1',
      },
    ],
  },
});

const target_no_portlist = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: 'Scan Config Default',
  comment: 'hello world',
  writable: '1',
  in_use: '1',
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: '2',
  reverse_lookup_only: '1',
  reverse_lookup_unify: '0',
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: '22',
    trash: '0',
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
    trash: '0',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  snmp_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  tasks: {
    task: [
      {
        _id: 'task_id',
        name: 'task1',
      },
    ],
  },
});

const target_no_elevate = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: 'Scan Config Default',
  comment: 'hello world',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: '2',
  port_list: {
    _id: 'pl_id1',
    name: 'pl1',
    trash: '0',
  },
  ssh_credential: {
    _id: '',
    name: '',
    port: '',
    trash: '0',
  },
  ssh_elevate_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
  snmp_credential: {
    _id: '',
    name: '',
    trash: '0',
  },
});

describe('Target row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Row
        entity={target_no_elevate}
        onToggleDetailsClick={handleToggleDetailsClick}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const links = baseElement.querySelectorAll('a');

    expect(baseElement).toHaveTextContent('target');
    expect(baseElement).toHaveTextContent('(hello world)');

    expect(links[0]).toHaveAttribute('href', '/portlist/pl_id1');
    expect(links[0]).toHaveTextContent('pl1');

    expect(baseElement).toHaveTextContent('127.0.0.1, 192.168.0.1');

    expect(baseElement).toHaveTextContent('SMB');
    expect(links[1]).toHaveAttribute('href', '/credential/4784');
    expect(links[1]).toHaveTextContent('smb_credential');

    expect(
      screen.getAllByTitle('Move Target to trashcan')[0],
    ).toBeInTheDocument();

    expect(screen.getAllByTitle('Edit Target')[0]).toBeInTheDocument();

    expect(screen.getAllByTitle('Clone Target')[0]).toBeInTheDocument();

    expect(screen.getAllByTitle('Export Target')[0]).toBeInTheDocument();
  });

  test('should render ssh elevate credential', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Row
        entity={target_elevate}
        onToggleDetailsClick={handleToggleDetailsClick}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const links = baseElement.querySelectorAll('a');

    expect(baseElement).toHaveTextContent('target');

    expect(links[0]).toHaveAttribute('href', '/portlist/pl_id1');
    expect(links[0]).toHaveTextContent('pl1');

    expect(baseElement).toHaveTextContent('127.0.0.1, 192.168.0.1');

    expect(baseElement).toHaveTextContent('SSH');
    expect(links[1]).toHaveAttribute('href', '/credential/1235');
    expect(links[1]).toHaveTextContent('ssh');

    expect(baseElement).toHaveTextContent('SSH Elevate');
    expect(links[2]).toHaveAttribute('href', '/credential/3456');
    expect(links[2]).toHaveTextContent('ssh_elevate');

    expect(baseElement).toHaveTextContent('SMB');
    expect(links[3]).toHaveAttribute('href', '/credential/4784');
    expect(links[3]).toHaveTextContent('smb_credential');
  });

  test('should render with undefined portlist', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Row
        entity={target_no_portlist}
        onToggleDetailsClick={handleToggleDetailsClick}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const links = baseElement.querySelectorAll('a');

    expect(baseElement).toHaveTextContent('target');
    expect(baseElement).toHaveTextContent('(hello world)');

    // First link is no longer to portlist, because it shouldn't be in the table
    expect(links[0]).toHaveAttribute('href', '/credential/1235');
    expect(links[0]).toHaveTextContent('ssh');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = jest.fn();
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      store: true,
      capabilities: caps,
      router: true,
    });

    store.dispatch(setTimezone('UTC'));

    const {baseElement} = render(
      <Row
        entity={target_no_elevate}
        onToggleDetailsClick={handleToggleDetailsClick}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    // Name
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, 'foo');

    // Actions
    const cloneIcon = screen.getAllByTitle('Clone Target');
    fireEvent.click(cloneIcon[0]);
    expect(handleTargetCloneClick).toHaveBeenCalledWith(target_no_elevate);

    const deleteIcon = screen.getAllByTitle('Move Target to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleTargetDeleteClick).toHaveBeenCalledWith(target_no_elevate);

    const editIcon = screen.getAllByTitle('Edit Target');
    fireEvent.click(editIcon[0]);
    expect(handleTargetEditClick).toHaveBeenCalledWith(target_no_elevate);

    const exportIcon = screen.getAllByTitle('Export Target');
    fireEvent.click(exportIcon[0]);
    expect(handleTargetDownloadClick).toHaveBeenCalledWith(target_no_elevate);
  });

  console.warn = consoleError;
});
