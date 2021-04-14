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

import {setLocale} from 'gmp/locale/lang';

import Override from 'gmp/models/override';

import {isDefined} from 'gmp/utils/identity';

import {
  createCloneOverrideQueryMock,
  createDeleteOverrideQueryMock,
  createExportOverridesByIdsQueryMock,
  createGetOverrideQueryMock,
  detailsOverride,
  inUseOverride,
  noPermOverride,
} from 'web/graphql/__mocks__/overrides';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {createGetPermissionsQueryMock} from 'web/graphql/__mocks__/permissions';

import {entityLoadingActions} from 'web/store/entities/overrides';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '456',
  }),
}));

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

const parsedOverride = Override.fromObject(detailsOverride);
const parsedNoPermOverride = Override.fromObject(noPermOverride);
const parsedInUseOverride = Override.fromObject(inUseOverride);

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

describe('Override detailspage tests', () => {
  test('should render full detailspage', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetOverrideQueryMock();
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=456 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('override text');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Overrides')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-overrides',
    );

    expect(screen.getAllByTitle('Override List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/overrides');

    expect(baseElement).toHaveTextContent('ID:456');
    expect(baseElement).toHaveTextContent(
      'Created:Fri, Feb 19, 2021 3:14 PM CET',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM CET',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

    expect(baseElement).toHaveTextContent('NVT Name');
    expect(baseElement).toHaveTextContent('foo nvt');

    expect(baseElement).toHaveTextContent('NVT OID');
    expect(baseElement).toHaveTextContent('123');

    expect(baseElement).toHaveTextContent('Active');
    expect(baseElement).toHaveTextContent('Yes');

    expect(baseElement).toHaveTextContent('Application');

    expect(baseElement).toHaveTextContent('Hosts');
    expect(baseElement).toHaveTextContent('127.0.0.1');

    expect(baseElement).toHaveTextContent('Port');
    expect(baseElement).toHaveTextContent('66/tcp');

    expect(baseElement).toHaveTextContent('Severity');
    expect(baseElement).toHaveTextContent('> 0.0');

    expect(baseElement).toHaveTextContent('Task');
    expect(baseElement).toHaveTextContent('task x');

    expect(baseElement).toHaveTextContent('Result');
    expect(baseElement).toHaveTextContent('result name');

    expect(baseElement).toHaveTextContent('Appearance');

    expect(baseElement).toHaveTextContent(
      'Override from Severity > 0.0 to 9.0',
    );

    expect(baseElement).toHaveTextContent('override text');
  });

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetOverrideQueryMock(
      '456',
      detailsOverride,
    );
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=456 first=1 rows=-1',
    });
    const [
      renewSessionMock,
      renewSessionResult,
    ] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, renewSessionMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    await wait();
    expect(renewSessionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('override:unnamed');
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetOverrideQueryMock(
      '456',
      detailsOverride,
    );
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=456 first=1 rows=-1',
      },
      {permissions: null},
    );
    const [
      renewSessionMock,
      renewSessionResult,
    ] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, renewSessionMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('Permissions');
    fireEvent.click(tabs[1]);

    await wait();

    expect(renewSessionResult).toHaveBeenCalled();
    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const [renewQueryMock] = createRenewSessionQueryMock();
    const [mock, resultFunc] = createGetOverrideQueryMock(
      '456',
      detailsOverride,
    );
    const [cloneMock, cloneResult] = createCloneOverrideQueryMock();
    const [deleteMock, deleteResult] = createDeleteOverrideQueryMock();
    const [exportMock, exportResult] = createExportOverridesByIdsQueryMock([
      '456',
    ]);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=456 first=1 rows=-1',
    });

    const gmp = {
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
      queryMocks: [
        renewQueryMock,
        mock,
        cloneMock,
        deleteMock,
        exportMock,
        permissionMock,
      ],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('456', parsedOverride));

    render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const cloneIcon = screen.getAllByTitle('Clone Override');
    expect(cloneIcon[0]).toBeInTheDocument();

    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(cloneResult).toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Override as XML');
    expect(exportIcon[0]).toBeInTheDocument();

    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Override to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();

    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });
});

describe('Override ToolBarIcons tests', () => {
  test('should render', () => {
    const handleOverrideCloneClick = jest.fn();
    const handleOverrideDeleteClick = jest.fn();
    const handleOverrideDownloadClick = jest.fn();
    const handleOverrideEditClick = jest.fn();
    const handleOverrideCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={parsedOverride}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
        onOverrideCreateClick={handleOverrideCreateClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-overrides',
    );
    expect(screen.getAllByTitle('Help: Overrides')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/overrides');
    expect(screen.getAllByTitle('Override List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleOverrideCloneClick = jest.fn();
    const handleOverrideDeleteClick = jest.fn();
    const handleOverrideDownloadClick = jest.fn();
    const handleOverrideEditClick = jest.fn();
    const handleOverrideCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedOverride}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
        onOverrideCreateClick={handleOverrideCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Override');
    const editIcon = screen.getAllByTitle('Edit Override');
    const deleteIcon = screen.getAllByTitle('Move Override to trashcan');
    const exportIcon = screen.getAllByTitle('Export Override as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleOverrideCloneClick).toHaveBeenCalledWith(parsedOverride);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleOverrideEditClick).toHaveBeenCalledWith(parsedOverride);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleOverrideDeleteClick).toHaveBeenCalledWith(parsedOverride);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(parsedOverride);
  });

  test('should not call click handlers without permission', () => {
    const handleOverrideCloneClick = jest.fn();
    const handleOverrideDeleteClick = jest.fn();
    const handleOverrideDownloadClick = jest.fn();
    const handleOverrideEditClick = jest.fn();
    const handleOverrideCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedNoPermOverride}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
        onOverrideCreateClick={handleOverrideCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Override');
    const editIcon = screen.getAllByTitle('Permission to edit Override denied');
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Override to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Override as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleOverrideCloneClick).toHaveBeenCalledWith(parsedNoPermOverride);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleOverrideEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleOverrideDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(
      parsedNoPermOverride,
    );
  });

  test('should call correct click handlers for override in use', () => {
    const handleOverrideCloneClick = jest.fn();
    const handleOverrideDeleteClick = jest.fn();
    const handleOverrideDownloadClick = jest.fn();
    const handleOverrideEditClick = jest.fn();
    const handleOverrideCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedInUseOverride}
        onOverrideCloneClick={handleOverrideCloneClick}
        onOverrideDeleteClick={handleOverrideDeleteClick}
        onOverrideDownloadClick={handleOverrideDownloadClick}
        onOverrideEditClick={handleOverrideEditClick}
        onOverrideCreateClick={handleOverrideCreateClick}
      />,
    );
    const cloneIcon = screen.getAllByTitle('Clone Override');
    const editIcon = screen.getAllByTitle('Edit Override');
    const deleteIcon = screen.getAllByTitle('Override is still in use');
    const exportIcon = screen.getAllByTitle('Export Override as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleOverrideCloneClick).toHaveBeenCalledWith(parsedInUseOverride);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleOverrideEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleOverrideDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(
      parsedInUseOverride,
    );
  });
});
