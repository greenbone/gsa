/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Target from 'gmp/models/target';
import Row from 'web/pages/targets/Row';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWithTable, fireEvent, screen} from 'web/utils/Testing';

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
  krb5_credential: {
    _id: 'krb5_id',
    name: 'krb5',
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
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={target_no_elevate}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(screen.getByText('target')).toBeVisible();
    expect(screen.getByText('(hello world)')).toBeVisible();

    const portlistLink = screen.getByText('pl1');
    expect(portlistLink).toHaveAttribute('href', '/portlist/pl_id1');

    expect(screen.getByText('127.0.0.1, 192.168.0.1')).toBeVisible();

    expect(screen.getByText(/SMB/)).toBeVisible();
    const smbLink = screen.getByText('smb_credential');
    expect(smbLink).toHaveAttribute('href', '/credential/4784');

    expect(screen.getAllByTitle('Move Target to trashcan')[0]).toBeVisible();
    expect(screen.getAllByTitle('Edit Target')[0]).toBeVisible();
    expect(screen.getAllByTitle('Clone Target')[0]).toBeVisible();
    expect(screen.getAllByTitle('Export Target')[0]).toBeVisible();
  });

  test('should render Kerberos credentials, when KRB5 is enabled', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    gmp.settings.enableKrb5 = true

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={target_no_elevate}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(screen.getByText(/Kerberos/)).toBeVisible();
    const kerberosLink = screen.getByText('krb5');
    expect(kerberosLink).toHaveAttribute('href', '/credential/krb5_id');
  })

  test('should render ssh elevate credential', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={target_elevate}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(screen.getByText('target')).toBeVisible();

    const portlistLink = screen.getByText('pl1');
    expect(portlistLink).toHaveAttribute('href', '/portlist/pl_id1');

    expect(screen.getByText('127.0.0.1, 192.168.0.1')).toBeVisible();

    expect(screen.getByText(/SSH\s*:/)).toBeVisible();
    const sshLink = screen.getByText('ssh');
    expect(sshLink).toHaveAttribute('href', '/credential/1235');

    expect(screen.getByText(/SSH Elevate/)).toBeVisible();
    const sshElevateLink = screen.getByText('ssh_elevate');
    expect(sshElevateLink).toHaveAttribute('href', '/credential/3456');

    expect(screen.getByText(/SMB/)).toBeVisible();
    const smbLink = screen.getByText('smb_credential');
    expect(smbLink).toHaveAttribute('href', '/credential/4784');
  });

  test('should render with undefined portlist', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <Row
        entity={target_no_portlist}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(screen.getByText('target')).toBeVisible();
    expect(screen.getByText('(hello world)')).toBeVisible();

    expect(screen.getByText(/SSH\s*:/)).toBeVisible();
    const sshLink = screen.getByText('ssh');
    expect(sshLink).toHaveAttribute('href', '/credential/1235');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      store: true,
      capabilities: caps,
      router: true,
    });

    store.dispatch(setUsername('admin'));
    store.dispatch(setTimezone('UTC'));

    render(
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
    fireEvent.click(screen.getByText('target'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, 'foo');

    // Actions
    fireEvent.click(screen.getAllByTitle('Clone Target')[0]);
    expect(handleTargetCloneClick).toHaveBeenCalledWith(target_no_elevate);

    fireEvent.click(screen.getAllByTitle('Move Target to trashcan')[0]);
    expect(handleTargetDeleteClick).toHaveBeenCalledWith(target_no_elevate);

    fireEvent.click(screen.getAllByTitle('Edit Target')[0]);
    expect(handleTargetEditClick).toHaveBeenCalledWith(target_no_elevate);

    fireEvent.click(screen.getAllByTitle('Export Target')[0]);
    expect(handleTargetDownloadClick).toHaveBeenCalledWith(target_no_elevate);
  });
});
