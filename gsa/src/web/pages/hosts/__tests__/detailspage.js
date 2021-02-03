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

import {setLocale} from 'gmp/locale/lang';

import Host from 'gmp/models/host';

import {isDefined} from 'gmp/utils/identity';

import {
  createGetHostQueryMock,
  host as hostMock,
  hostWithoutPermission as hostWithoutPermissionMock,
} from 'web/graphql/__mocks__/hosts';
import {createGetPermissionsQueryMock} from 'web/graphql/__mocks__/permissions';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

// setup

setLocale('en');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '12345',
  }),
}));

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const reloadInterval = -1;
const manualUrl = 'test/';

// mock entity

const host = Host.fromObject(hostMock);
const hostWithoutPermission = Host.fromObject(hostWithoutPermissionMock);

// mock gmp commands

let currentSettings;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Host Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const [mock, resultFunc] = createGetHostQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [
      permissionQueryMock,
      permissionResult,
    ] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=12345 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

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
    expect(baseElement).toHaveTextContent('Host: Foo');
    expect(baseElement).toHaveTextContent('ID:12345');
    expect(baseElement).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

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

    // ToDo
    // expect(table[0]).toHaveTextContent('Route');
    // expect(table[0]).toHaveTextContent('123.456.789.10123.456.789.11');

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

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const [mock, resultFunc] = createGetHostQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [
      permissionQueryMock,
      permissionResult,
    ] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=12345 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const [mock, resultFunc] = createGetHostQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [
      permissionQueryMock,
      permissionResult,
    ] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=12345 first=1 rows=-1',
      },
      {permissions: null},
    );

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('Permissions');
    fireEvent.click(tabs[1]);

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
        deleteIdentifier,
        delete: deleteFunc,
        export: exportFunc,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const [mock, resultFunc] = createGetHostQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [
      permissionQueryMock,
      permissionResult,
    ] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=12345 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

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
