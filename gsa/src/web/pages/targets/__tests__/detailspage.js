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

import Target from 'gmp/models/target';

import {isDefined} from 'gmp/utils/identity';

import {createGetPermissionsQueryMock} from 'web/graphql/__mocks__/permissions';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {
  createGetTargetQueryMock,
  mockTarget,
  inUseTarget,
  noPermTarget,
  createCloneTargetQueryMock,
  createDeleteTargetsByIdsQueryMock,
  createExportTargetsByIdsQueryMock,
} from 'web/graphql/__mocks__/targets';

import {entityLoadingActions} from 'web/store/entities/targets';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '159',
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

const target = Target.fromObject(mockTarget);

const targetInUse = Target.fromObject(inUseTarget);

const targetNoPerm = Target.fromObject(noPermTarget);

describe('Target Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetTargetQueryMock();
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=159 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock],
    });

    store.dispatch(setTimezone('CET'));

    store.dispatch(entityLoadingActions.success('159', target));

    const {baseElement} = render(<Detailspage id="159" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('Target: target 1');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Targets')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-targets',
    );

    expect(screen.getAllByTitle('Target List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/targets');

    expect(baseElement).toHaveTextContent('ID:159');
    expect(baseElement).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM CET',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM CET',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

    expect(baseElement).toHaveTextContent('Included');
    expect(baseElement).toHaveTextContent('123.234.345.456 127.0.0.1');

    expect(baseElement).toHaveTextContent('Excluded');
    expect(baseElement).toHaveTextContent('192.168.0.1');

    expect(baseElement).toHaveTextContent('Maximum Number of Hosts');
    expect(baseElement).toHaveTextContent('2');

    expect(baseElement).toHaveTextContent('Reverse Lookup Only');
    expect(baseElement).toHaveTextContent('Yes');

    expect(baseElement).toHaveTextContent('Reverse Lookup Unify');
    expect(baseElement).toHaveTextContent('No');

    expect(baseElement).toHaveTextContent('Alive Test');
    expect(baseElement).toHaveTextContent('ICMP Ping');

    expect(baseElement).toHaveTextContent('Port List');
    expect(links[2]).toHaveAttribute('href', '/portlist/pl1');
    expect(baseElement).toHaveTextContent('list');

    expect(baseElement).toHaveTextContent('Credentials');
    expect(baseElement).toHaveTextContent('SSH');
    expect(links[3]).toHaveAttribute('href', '/credential/ssh1');
    expect(baseElement).toHaveTextContent('ssh');
    expect(baseElement).toHaveTextContent('on Port 22');

    expect(baseElement).toHaveTextContent('Tasks using this Target (1)');
    expect(baseElement).toHaveTextContent('task 1');
    expect(links[4]).toHaveAttribute('href', '/task/t1');
  });

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetTargetQueryMock();
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=159 first=1 rows=-1',
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

    const {baseElement} = render(<Detailspage id="159" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    await wait();

    expect(renewSessionResult).toHaveBeenCalled();

    const links = baseElement.querySelectorAll('a');
    expect(baseElement).toHaveTextContent('target:unnamed');
    expect(links[3]).toHaveAttribute('href', '/tag/345');
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetTargetQueryMock();
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=159 first=1 rows=-1',
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

    const {baseElement} = render(<Detailspage id="159" />);

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
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };
    const [renewQueryMock] = createRenewSessionQueryMock();
    const [mock, resultFunc] = createGetTargetQueryMock();
    const [cloneMock, cloneResult] = createCloneTargetQueryMock();
    const [deleteMock, deleteResult] = createDeleteTargetsByIdsQueryMock();
    const [exportMock, exportResult] = createExportTargetsByIdsQueryMock();
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=159 first=1 rows=-1',
    });

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

    store.dispatch(entityLoadingActions.success('159', target));

    render(<Detailspage id="159" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const cloneIcon = screen.getAllByTitle('Clone Target');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(cloneResult).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Target to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Target as XML');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();
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
        entity={targetNoPerm}
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

    expect(handleTargetCloneClick).toHaveBeenCalledWith(targetNoPerm);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleTargetEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleTargetDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleTargetDownloadClick).toHaveBeenCalledWith(targetNoPerm);
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
