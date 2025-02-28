/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Target from 'gmp/models/target';
import Row from 'web/pages/targets/Row';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen} from 'web/utils/Testing';


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
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

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
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
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
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

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
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
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
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

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
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
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
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

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
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
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
