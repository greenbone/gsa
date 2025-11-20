/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Target, {SCAN_CONFIG_DEFAULT} from 'gmp/models/target';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import TargetTableRow from 'web/pages/targets/TargetTableRow';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const targetElevate = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: {alive_test: SCAN_CONFIG_DEFAULT},
  comment: 'hello world',
  writable: YES_VALUE,
  in_use: YES_VALUE,
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: 2,
  reverse_lookup_only: YES_VALUE,
  reverse_lookup_unify: NO_VALUE,
  port_list: {
    _id: 'pl_id1',
    name: 'pl1',
  },
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: 22,
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
  },
  snmp_credential: {
    _id: '',
    name: '',
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

const targetNoPortlist = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: {alive_test: SCAN_CONFIG_DEFAULT},
  comment: 'hello world',
  writable: YES_VALUE,
  in_use: YES_VALUE,
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: 2,
  reverse_lookup_only: YES_VALUE,
  reverse_lookup_unify: NO_VALUE,
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: 22,
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
  },
  snmp_credential: {
    _id: '',
    name: '',
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

const targetNoElevate = Target.fromElement({
  _id: 'foo',
  name: 'target',
  owner: {name: 'admin'},
  alive_tests: {alive_test: SCAN_CONFIG_DEFAULT},
  comment: 'hello world',
  writable: YES_VALUE,
  in_use: NO_VALUE,
  permissions: {permission: [{name: 'Everything'}]},
  hosts: '127.0.0.1, 192.168.0.1',
  exclude_hosts: '',
  max_hosts: 2,
  port_list: {
    _id: 'pl_id1',
    name: 'pl1',
  },
  krb5_credential: {
    _id: 'krb5_id',
    name: 'krb5',
  },
  ssh_credential: {
    _id: '',
    name: '',
    port: undefined,
  },
  ssh_elevate_credential: {
    _id: '',
    name: '',
  },
  smb_credential: {
    _id: '4784',
    name: 'smb_credential',
  },
  esxi_credential: {
    _id: '',
    name: '',
  },
  snmp_credential: {
    _id: '',
    name: '',
  },
});

describe('TargetRow tests', () => {
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <TargetTableRow
        entity={targetNoElevate}
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

    expect(screen.getByText(/SMB \(NTLM\)/)).toBeVisible();
    const smbLink = screen.getByText('smb_credential');
    expect(smbLink).toHaveAttribute('href', '/credential/4784');

    expect(screen.getAllByTitle('Move Target to trashcan')[0]).toBeVisible();
    expect(screen.getAllByTitle('Edit Target')[0]).toBeVisible();
    expect(screen.getAllByTitle('Clone Target')[0]).toBeVisible();
    expect(screen.getAllByTitle('Export Target')[0]).toBeVisible();
  });

  test('should render Kerberos credentials, when KRB5 is enabled', () => {
    const gmp = {
      settings: {enableKrb5: true},
    };

    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <TargetTableRow
        entity={targetNoElevate}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(screen.getByText(/SMB \(Kerberos\)/)).toBeVisible();
    const kerberosLink = screen.getByText('krb5');
    expect(kerberosLink).toHaveAttribute('href', '/credential/krb5_id');
  });

  test('should render ssh elevate credential', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <TargetTableRow
        entity={targetElevate}
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

    expect(screen.getByText(/SMB \(NTLM\)/)).toBeVisible();
    const smbLink = screen.getByText('smb_credential');
    expect(smbLink).toHaveAttribute('href', '/credential/4784');
  });

  test('should render with undefined portlist', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();

    const {render, store} = rendererWithTableBody({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <TargetTableRow
        entity={targetNoPortlist}
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

    const {render, store} = rendererWithTableBody({
      gmp,
      store: true,
      capabilities: caps,
      router: true,
    });

    store.dispatch(setUsername('admin'));
    store.dispatch(setTimezone('UTC'));

    render(
      <TargetTableRow
        entity={targetNoElevate}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    fireEvent.click(screen.getByText('target'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(
      targetNoElevate,
      'foo',
    );

    // Actions
    fireEvent.click(screen.getAllByTitle('Clone Target')[0]);
    expect(handleTargetCloneClick).toHaveBeenCalledWith(targetNoElevate);

    fireEvent.click(screen.getAllByTitle('Move Target to trashcan')[0]);
    expect(handleTargetDeleteClick).toHaveBeenCalledWith(targetNoElevate);

    fireEvent.click(screen.getAllByTitle('Edit Target')[0]);
    expect(handleTargetEditClick).toHaveBeenCalledWith(targetNoElevate);

    fireEvent.click(screen.getAllByTitle('Export Target')[0]);
    expect(handleTargetDownloadClick).toHaveBeenCalledWith(targetNoElevate);
  });
});
