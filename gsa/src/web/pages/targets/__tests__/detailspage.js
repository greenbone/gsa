/* Copyright (C) 2021 Greenbone Networks GmbH
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

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Target from 'gmp/models/target';

import {isDefined} from 'gmp/utils/identity';

import {entityLoadingActions} from 'web/store/entities/targets';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

let getTarget;
let getEntities;
let currentSettings;
let renewSession;

beforeEach(() => {
  getTarget = jest.fn().mockResolvedValue({
    data: target,
  });

  getEntities = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

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
  alive_tests: 'Scan Config Default',
  allow_simultaneous_ips: 1,
  port_range: '1-5',
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
});

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
  alive_tests: 'Scan Config Default',
  allow_simultaneous_ips: 1,
  port_range: '1-5',
});

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
  alive_tests: 'Scan Config Default',
  allow_simultaneous_ips: 1,
  port_range: '1-5',
});

describe('Target Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const gmp = {
      target: {
        get: getTarget,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    const {baseElement, element} = render(<Detailspage id="46264" />);

    expect(element).toHaveTextContent('Target: target 1');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Targets')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-targets',
    );

    expect(screen.getAllByTitle('Target List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/targets');

    expect(element).toHaveTextContent('ID:46264');
    expect(element).toHaveTextContent('Created:Wed, Dec 23, 2020 3:14 PM CET');
    expect(element).toHaveTextContent('Modified:Mon, Jan 4, 2021 12:54 PM CET');
    expect(element).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    expect(spans[11]).toHaveTextContent('Permissions');

    expect(element).toHaveTextContent('Included');
    expect(element).toHaveTextContent('127.0.0.1');
    expect(element).toHaveTextContent('123.456.574.64');

    expect(element).toHaveTextContent('Excluded');
    expect(element).toHaveTextContent('192.168.0.1');

    expect(element).toHaveTextContent('Maximum Number of Hosts');
    expect(element).toHaveTextContent('2');

    expect(element).toHaveTextContent('Reverse Lookup Only');
    expect(element).toHaveTextContent('Yes');

    expect(element).toHaveTextContent('Reverse Lookup Unify');
    expect(element).toHaveTextContent('No');

    expect(element).toHaveTextContent('Alive Test');
    expect(element).toHaveTextContent('Scan Config Default');

    expect(element).toHaveTextContent('Port List');
    expect(links[2]).toHaveAttribute('href', '/portlist/32323');
    expect(element).toHaveTextContent('All IANA assigned TCP');

    expect(element).toHaveTextContent('Credentials');

    expect(element).toHaveTextContent('SSH');
    expect(element).toHaveTextContent('ssh');
    expect(links[3]).toHaveAttribute('href', '/credential/1235');
    expect(element).toHaveTextContent('on Port 22');

    expect(element).toHaveTextContent('SSH elevate credential');
    expect(element).toHaveTextContent('ssh_elevate');
    expect(links[4]).toHaveAttribute('href', '/credential/3456');

    expect(element).toHaveTextContent('SMB');
    expect(element).toHaveTextContent('smb_credential');
    expect(links[5]).toHaveAttribute('href', '/credential/4784');

    expect(element).toHaveTextContent('Tasks using this Target (1)');
    expect(links[6]).toHaveAttribute('href', '/task/465');
    expect(element).toHaveTextContent('foo');
  });

  test('should render user tags tab', () => {
    const gmp = {
      target: {
        get: getTarget,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', target));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');

    fireEvent.click(spans[9]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      target: {
        get: getTarget,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    const {baseElement} = render(<Detailspage id="46264" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[11]).toHaveTextContent('Permissions');

    fireEvent.click(spans[11]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const clone = jest.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      target: {
        get: getTarget,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('46264', target));

    render(<Detailspage id="46264" />);

    await wait();

    const cloneIcon = screen.getAllByTitle('Clone Target');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(clone).toHaveBeenCalledWith(target);

    const exportIcon = screen.getAllByTitle('Export Target as XML');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(target);

    const deleteIcon = screen.getAllByTitle('Move Target to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteFunc).toHaveBeenCalledWith({id: target.id});
  });
});

describe('Target ToolBarIcons tests', () => {
  test('should render', () => {
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();
    const handleTargetCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={target}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onTargetCreateClick={handleTargetCreateClick}
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
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();
    const handleTargetCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={target}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onTargetCreateClick={handleTargetCreateClick}
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
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();
    const handleTargetCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noPermTarget}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onTargetCreateClick={handleTargetCreateClick}
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
    const handleTargetCloneClick = jest.fn();
    const handleTargetDeleteClick = jest.fn();
    const handleTargetDownloadClick = jest.fn();
    const handleTargetEditClick = jest.fn();
    const handleTargetCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={targetInUse}
        onTargetCloneClick={handleTargetCloneClick}
        onTargetDeleteClick={handleTargetDeleteClick}
        onTargetDownloadClick={handleTargetDownloadClick}
        onTargetEditClick={handleTargetEditClick}
        onTargetCreateClick={handleTargetCreateClick}
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
