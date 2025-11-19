/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Target, {SCAN_CONFIG_DEFAULT} from 'gmp/models/target';
import TargetDetailsToolBarIcons from 'web/pages/targets/TargetDetailsTooBarIcons';

const manualUrl = 'test/';

describe('TargetDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const target = Target.fromElement({
      _id: '46264',
      name: 'target 1',
      creation_time: '2020-12-23T14:14:11Z',
      modification_time: '2021-01-04T11:54:12Z',
      in_use: 0,
      permissions: {permission: {name: 'Everything'}},
      owner: {name: 'admin'},
      writable: 1,
      port_list: {
        _id: '32323',
        name: 'All IANA assigned TCP',
        trash: 0,
      },
      hosts: '127.0.0.1, 123.456.574.64',
      exclude_hosts: '192.168.0.1',
      max_hosts: 2,
      reverse_lookup_only: 1,
      reverse_lookup_unify: 0,
      tasks: {task: {_id: '465', name: 'foo'}},
      alive_tests: {
        alive_test: SCAN_CONFIG_DEFAULT,
      },
      allow_simultaneous_ips: 1,
      krb5_credential: {
        _id: 'krb5_id',
        name: 'krb5',
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
    });
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <TargetDetailsToolBarIcons
        entity={target}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-targets',
    );
    expect(screen.getAllByTitle('Help: Targets')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/targets');
    expect(screen.getAllByTitle('Target List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const target = Target.fromElement({
      _id: '46264',
      name: 'target 1',
      creation_time: '2020-12-23T14:14:11Z',
      modification_time: '2021-01-04T11:54:12Z',
      in_use: 0,
      permissions: {permission: {name: 'Everything'}},
      owner: {name: 'admin'},
      writable: 1,
      port_list: {
        _id: '32323',
        name: 'All IANA assigned TCP',
        trash: 0,
      },
      hosts: '127.0.0.1, 123.456.574.64',
      exclude_hosts: '192.168.0.1',
      max_hosts: 2,
      reverse_lookup_only: 1,
      reverse_lookup_unify: 0,
      tasks: {task: {_id: '465', name: 'foo'}},
      alive_tests: {
        alive_test: SCAN_CONFIG_DEFAULT,
      },
      allow_simultaneous_ips: 1,
      krb5_credential: {
        _id: 'krb5_id',
        name: 'krb5',
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
    });
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <TargetDetailsToolBarIcons
        entity={target}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Target');
    const editIcon = screen.getAllByTitle('Edit Target');
    const deleteIcon = screen.getAllByTitle('Move Target to trashcan');
    const exportIcon = screen.getAllByTitle('Export Target as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleTargetCloneClick).toHaveBeenCalledWith(target);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleTargetEditClick).toHaveBeenCalledWith(target);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleTargetDeleteClick).toHaveBeenCalledWith(target);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleTargetDownloadClick).toHaveBeenCalledWith(target);
  });

  test('should not call click handlers without permission', () => {
    const noPermTarget = Target.fromElement({
      _id: '46264',
      name: 'target 1',
      creation_time: '2020-12-23T14:14:11Z',
      modification_time: '2021-01-04T11:54:12Z',
      in_use: 0,
      permissions: {permission: {name: 'get_targets'}},
      owner: {name: 'admin'},
      writable: 1,
      port_list: {
        _id: '32323',
        name: 'All IANA assigned TCP',
        trash: 0,
      },
      hosts: '127.0.0.1, 123.456.574.64',
      exclude_hosts: '192.168.0.1',
      max_hosts: 2,
      reverse_lookup_only: 1,
      reverse_lookup_unify: 0,
      tasks: {task: {_id: '465', name: 'foo'}},
      alive_tests: {
        alive_test: SCAN_CONFIG_DEFAULT,
      },
      allow_simultaneous_ips: 1,
    });

    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <TargetDetailsToolBarIcons
        entity={noPermTarget}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Target');
    const editIcon = screen.getAllByTitle('Permission to edit Target denied');
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Target to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Target as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleTargetCloneClick).toHaveBeenCalledWith(noPermTarget);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleTargetEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleTargetDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleTargetDownloadClick).toHaveBeenCalledWith(noPermTarget);
  });

  test('should (not) call click handlers for target in use', () => {
    const targetInUse = Target.fromElement({
      _id: '46264',
      name: 'target 1',
      creation_time: '2020-12-23T14:14:11Z',
      modification_time: '2021-01-04T11:54:12Z',
      in_use: 1,
      permissions: {permission: {name: 'Everything'}},
      owner: {name: 'admin'},
      writable: 1,
      port_list: {
        _id: '32323',
        name: 'All IANA assigned TCP',
        trash: 0,
      },
      hosts: '127.0.0.1, 123.456.574.64',
      exclude_hosts: '192.168.0.1',
      max_hosts: 2,
      reverse_lookup_only: 1,
      reverse_lookup_unify: 0,
      tasks: {task: {_id: '465', name: 'foo'}},
      alive_tests: {
        alive_test: SCAN_CONFIG_DEFAULT,
      },
      allow_simultaneous_ips: 1,
    });
    const handleTargetCloneClick = testing.fn();
    const handleTargetDeleteClick = testing.fn();
    const handleTargetDownloadClick = testing.fn();
    const handleTargetEditClick = testing.fn();
    const handleTargetCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <TargetDetailsToolBarIcons
        entity={targetInUse}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetCreateClick={handleTargetCreateClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
      />,
    );
    const cloneIcon = screen.getAllByTitle('Clone Target');
    const editIcon = screen.getAllByTitle('Edit Target');
    const deleteIcon = screen.getAllByTitle('Target is still in use');
    const exportIcon = screen.getAllByTitle('Export Target as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleTargetCloneClick).toHaveBeenCalledWith(targetInUse);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleTargetEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleTargetDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleTargetDownloadClick).toHaveBeenCalledWith(targetInUse);
  });
});
