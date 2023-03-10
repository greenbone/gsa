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
import React from 'react';

import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Host from 'gmp/models/host';

import {isDefined} from 'gmp/utils/identity';

import {entityLoadingActions} from 'web/store/entities/hosts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

// setup

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const reloadInterval = -1;
const manualUrl = 'test/';

// mock entity

const host = Host.fromElement({
  _id: '12345',
  name: 'Foo',
  comment: 'bar',
  owner: {name: 'admin'},
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'everything'}]},
  host: {
    severity: {
      value: 10.0,
    },
    detail: [
      {
        name: 'best_os_cpe',
        value: 'cpe:/o:linux:kernel',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
      {
        name: 'best_os_txt',
        value: 'Linux/Unix',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
      {
        name: 'traceroute',
        value: '123.456.789.10,123.456.789.11',
        source: {
          _id: '910',
          type: 'Report',
        },
      },
    ],
    routes: {
      route: [
        {
          host: [
            {
              _id: '10',
              ip: '123.456.789.10',
            },
            {
              _id: '01',
              ip: '123.456.789.11',
            },
          ],
        },
      ],
    },
  },
  identifiers: {
    identifier: [
      {
        _id: '5678',
        name: 'hostname',
        value: 'foo',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
      },
      {
        _id: '1112',
        name: 'ip',
        value: '123.456.789.10',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
      },
      {
        _id: '1314',
        name: 'OS',
        value: 'cpe:/o:linux:kernel',
        creation_time: '2019-06-02T12:00:22Z',
        modification_time: '2019-06-03T11:00:22Z',
        source: {
          _id: '910',
          type: 'Report Host Detail',
          data: '1.2.3.4.5',
        },
        os: {
          _id: '1314',
          title: 'TestOs',
        },
      },
    ],
  },
});

const hostWithoutPermission = Host.fromElement({
  _id: '12345',
  name: 'Foo',
  comment: 'bar',
  owner: {name: 'admin'},
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'get_assets'}]},
  host: {
    severity: {
      value: 10.0,
    },
  },
});

// mock gmp commands

let getHost;
let getPermissions;
let currentSettings;
let renewSession;

beforeEach(() => {
  getHost = jest.fn().mockResolvedValue({
    data: host,
  });

  getPermissions = jest.fn().mockResolvedValue({
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

describe('Host Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const gmp = {
      host: {
        get: getHost,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', host));

    const {baseElement, element} = render(<Detailspage id="12345" />);

    // Toolbar Icons
    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Hosts')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-hosts',
    );

    expect(screen.getAllByTitle('Host List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/hosts');

    expect(screen.getAllByTitle('Create new Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Delete Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Host as XML')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Results for this Host')[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByTitle('TLS Certificates for this Host')[0],
    ).toBeInTheDocument();

    // Header
    expect(element).toHaveTextContent('Host: Foo');
    expect(element).toHaveTextContent('ID:12345');
    expect(element).toHaveTextContent('Created:Sun, Jun 2, 2019 2:00 PM CEST');
    expect(element).toHaveTextContent('Modified:Mon, Jun 3, 2019 1:00 PM CEST');
    expect(element).toHaveTextContent('Owner:admin');

    // Tabs
    const spans = baseElement.querySelectorAll('span');
    expect(spans[10]).toHaveTextContent('User Tags');
    expect(spans[12]).toHaveTextContent('Permissions');

    // Details
    const table = baseElement.querySelectorAll('table');

    expect(table[0]).toHaveTextContent('Hostname');
    expect(table[0]).toHaveTextContent('foo');

    expect(table[0]).toHaveTextContent('IP Address');
    expect(table[0]).toHaveTextContent('123.456.789.10');

    expect(table[0]).toHaveTextContent('Comment');
    expect(table[0]).toHaveTextContent('bar');

    expect(table[0]).toHaveTextContent('OS');
    expect(table[0]).toHaveTextContent('Linux Kernel');
    const osImage = baseElement.querySelector('img');
    expect(osImage).toHaveAttribute('src', '/img/os_linux.svg');

    expect(table[0]).toHaveTextContent('Route');
    expect(table[0]).toHaveTextContent('123.456.789.10123.456.789.11');

    expect(table[0]).toHaveTextContent('Severity');
    expect(table[0]).toHaveTextContent('10.0 (High)');

    // Identifier Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Value');
    expect(header[2]).toHaveTextContent('Created');
    expect(header[3]).toHaveTextContent('Source');
    expect(header[4]).toHaveTextContent('Actions');

    // Rows
    const row = table[1].querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('hostname');
    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('Sun, Jun 2, 2019 2:00 PM CEST');
    expect(row[1]).toHaveTextContent('Report 910 (NVT 1.2.3.4.5)');

    expect(row[2]).toHaveTextContent('ip');
    expect(row[2]).toHaveTextContent('123.456.789.10');
    expect(row[2]).toHaveTextContent('Sun, Jun 2, 2019 2:00 PM CEST');
    expect(row[2]).toHaveTextContent('Report 910 (NVT 1.2.3.4.5)');

    expect(row[3]).toHaveTextContent('OS');
    expect(row[3]).toHaveTextContent('cpe:/o:linux:kernel');
    expect(row[3]).toHaveTextContent('Sun, Jun 2, 2019 2:00 PM CEST');
    expect(row[3]).toHaveTextContent('Report 910 (NVT 1.2.3.4.5)');
  });

  test('should render user tags tab', () => {
    const gmp = {
      host: {
        get: getHost,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', host));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');

    expect(spans[10]).toHaveTextContent('User Tags');
    fireEvent.click(spans[10]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      host: {
        get: getHost,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', host));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');

    expect(spans[12]).toHaveTextContent('Permissions');
    fireEvent.click(spans[12]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const deleteIdentifier = jest.fn().mockResolvedValue({
      foo: 'bar',
    });
    const deleteFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });
    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      host: {
        get: getHost,
        deleteIdentifier,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', host));

    render(<Detailspage id="12345" />);

    await wait();

    // delete identifier

    fireEvent.click(screen.getAllByTitle('Delete Identifier')[0]);

    await wait();

    expect(deleteIdentifier).toHaveBeenCalledWith(host.identifiers[0]);

    // export host

    fireEvent.click(screen.getAllByTitle('Export Host as XML')[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(host);

    // delete host

    fireEvent.click(screen.getAllByTitle('Delete Host')[0]);

    await wait();

    expect(deleteFunc).toHaveBeenCalledWith({id: host.id});
  });
});

describe('Host ToolBarIcons tests', () => {
  test('should render', () => {
    const handleHostCreateClick = jest.fn();
    const handleHostDeleteClick = jest.fn();
    const handleHostDownloadClick = jest.fn();
    const handleHostEditClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={host}
        onHostCreateClick={handleHostCreateClick}
        onHostDeleteClick={handleHostDeleteClick}
        onHostDownloadClick={handleHostDownloadClick}
        onHostEditClick={handleHostEditClick}
      />,
    );

    const links = element.querySelectorAll('a');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons.length).toBe(8);

    expect(screen.getAllByTitle('Help: Hosts')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-hosts',
    );

    expect(screen.getAllByTitle('Host List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/hosts');

    expect(screen.getAllByTitle('Create new Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Delete Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Host as XML')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Results for this Host')[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByTitle('TLS Certificates for this Host')[0],
    ).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleHostCreateClick = jest.fn();
    const handleHostDeleteClick = jest.fn();
    const handleHostDownloadClick = jest.fn();
    const handleHostEditClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={host}
        onHostCreateClick={handleHostCreateClick}
        onHostDeleteClick={handleHostDeleteClick}
        onHostDownloadClick={handleHostDownloadClick}
        onHostEditClick={handleHostEditClick}
      />,
    );

    fireEvent.click(screen.getAllByTitle('Create new Host')[0]);
    expect(handleHostCreateClick).toHaveBeenCalled();

    fireEvent.click(screen.getAllByTitle('Edit Host')[0]);
    expect(handleHostEditClick).toHaveBeenCalledWith(host);

    fireEvent.click(screen.getAllByTitle('Delete Host')[0]);
    expect(handleHostDeleteClick).toHaveBeenCalledWith(host);

    fireEvent.click(screen.getAllByTitle('Export Host as XML')[0]);
    expect(handleHostDownloadClick).toHaveBeenCalledWith(host);
  });

  test('should not call click handlers without permission', () => {
    const handleHostCreateClick = jest.fn();
    const handleHostDeleteClick = jest.fn();
    const handleHostDownloadClick = jest.fn();
    const handleHostEditClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={hostWithoutPermission}
        onHostCreateClick={handleHostCreateClick}
        onHostDeleteClick={handleHostDeleteClick}
        onHostDownloadClick={handleHostDownloadClick}
        onHostEditClick={handleHostEditClick}
      />,
    );

    fireEvent.click(screen.getAllByTitle('Create new Host')[0]);
    expect(handleHostCreateClick).toHaveBeenCalled();

    expect(screen.queryByTitle('Edit Host')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByTitle('Permission to edit Host denied')[0]);
    expect(handleHostEditClick).not.toHaveBeenCalled();

    expect(screen.queryByTitle('Delete Host')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getAllByTitle('Permission to delete Host denied')[0],
    );
    expect(handleHostDeleteClick).not.toHaveBeenCalledWith(host);

    fireEvent.click(screen.getAllByTitle('Export Host as XML')[0]);
    expect(handleHostDownloadClick).toHaveBeenCalledWith(hostWithoutPermission);
  });
});
