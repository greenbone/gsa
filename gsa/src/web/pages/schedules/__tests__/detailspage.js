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
import Schedule from 'gmp/models/schedule';

import {isDefined} from 'gmp/utils/identity';

import {
  createCloneScheduleQueryMock,
  createDeleteScheduleQueryMock,
  createExportSchedulesByIdsQueryMock,
  createGetScheduleQueryMock,
  mockSchedule,
  noPermSchedule,
  inUseSchedule,
} from 'web/graphql/__mocks__/schedules';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {createGetPermissionsQueryMock} from 'web/graphql/__mocks__/permissions';

import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'foo',
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

const schedule = Schedule.fromElement({
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.4.0~dev1~git-5f8b6cf-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nUID:84198224-d124-4194-a9e8-6f99ded72482\nDTSTAMP:20210111T134141Z\nEND:VEVENT\nEND:VCALENDAR',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  name: 'schedule 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  timezone: 'UTC',
  writable: 1,
  _id: '12345',
});

const scheduleInUse = Schedule.fromObject(inUseSchedule);

const noPerm = Schedule.fromObject(noPermSchedule);

const getEntities = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Schedule Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetScheduleQueryMock('foo', mockSchedule);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=foo first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="foo" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('Schedule: schedule 1');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Schedules')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-schedules',
    );

    expect(screen.getAllByTitle('Schedules List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/schedules');

    expect(baseElement).toHaveTextContent('ID:foo');
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

    expect(baseElement).toHaveTextContent('Comment');
    expect(baseElement).toHaveTextContent('hello world');

    expect(baseElement).toHaveTextContent('First Run');
    expect(baseElement).toHaveTextContent('Mon, Jan 4, 2021 11:54 AM UTC');

    expect(baseElement).toHaveTextContent('Next Run');
    expect(baseElement).toHaveTextContent('-');

    expect(baseElement).toHaveTextContent('Timezone');
    expect(baseElement).toHaveTextContent('UTC');

    expect(baseElement).toHaveTextContent('Recurrence');
    expect(baseElement).toHaveTextContent('Once');

    expect(baseElement).toHaveTextContent('Duration');
    expect(baseElement).toHaveTextContent('Entire Operation');
  });

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScheduleQueryMock('foo', mockSchedule);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=foo first=1 rows=-1',
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

    const {baseElement} = render(<Detailspage id="foo" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    await wait();

    expect(renewSessionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScheduleQueryMock('foo', mockSchedule);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=foo first=1 rows=-1',
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

    const {baseElement} = render(<Detailspage id="foo" />);

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
    const [mock, resultFunc] = createGetScheduleQueryMock('foo', mockSchedule);
    const [cloneMock, cloneResult] = createCloneScheduleQueryMock();
    const [deleteMock, deleteResult] = createDeleteScheduleQueryMock();
    const [exportMock, exportResult] = createExportSchedulesByIdsQueryMock([
      'foo',
    ]);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=foo first=1 rows=-1',
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

    render(<Detailspage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(cloneResult).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Schedule to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Schedule as XML');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();
  });
});

describe('Schedule ToolBarIcons tests', () => {
  test('should render', () => {
    const handleScheduleCloneClick = jest.fn();
    const handleScheduleDeleteClick = jest.fn();
    const handleScheduleDownloadClick = jest.fn();
    const handleScheduleEditClick = jest.fn();
    const handleScheduleCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={schedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
        onScheduleCreateClick={handleScheduleCreateClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-schedules',
    );
    expect(screen.getAllByTitle('Help: Schedules')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/schedules');
    expect(screen.getAllByTitle('Schedules List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleScheduleCloneClick = jest.fn();
    const handleScheduleDeleteClick = jest.fn();
    const handleScheduleDownloadClick = jest.fn();
    const handleScheduleEditClick = jest.fn();
    const handleScheduleCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={schedule}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
        onScheduleCreateClick={handleScheduleCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    const editIcon = screen.getAllByTitle('Edit Schedule');
    const deleteIcon = screen.getAllByTitle('Move Schedule to trashcan');
    const exportIcon = screen.getAllByTitle('Export Schedule as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleScheduleCloneClick).toHaveBeenCalledWith(schedule);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleScheduleEditClick).toHaveBeenCalledWith(schedule);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleScheduleDeleteClick).toHaveBeenCalledWith(schedule);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(schedule);
  });

  test('should not call click handlers without permission', () => {
    const handleScheduleCloneClick = jest.fn();
    const handleScheduleDeleteClick = jest.fn();
    const handleScheduleDownloadClick = jest.fn();
    const handleScheduleEditClick = jest.fn();
    const handleScheduleCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noPerm}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
        onScheduleCreateClick={handleScheduleCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    const editIcon = screen.getAllByTitle('Permission to edit Schedule denied');
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Schedule to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Schedule as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleScheduleCloneClick).toHaveBeenCalledWith(noPerm);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleScheduleEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleScheduleDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(noPerm);
  });

  test('should (not) call click handlers for schedule in use', () => {
    const handleScheduleCloneClick = jest.fn();
    const handleScheduleDeleteClick = jest.fn();
    const handleScheduleDownloadClick = jest.fn();
    const handleScheduleEditClick = jest.fn();
    const handleScheduleCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={scheduleInUse}
        onScheduleCloneClick={handleScheduleCloneClick}
        onScheduleDeleteClick={handleScheduleDeleteClick}
        onScheduleDownloadClick={handleScheduleDownloadClick}
        onScheduleEditClick={handleScheduleEditClick}
        onScheduleCreateClick={handleScheduleCreateClick}
      />,
    );
    const cloneIcon = screen.getAllByTitle('Clone Schedule');
    const editIcon = screen.getAllByTitle('Edit Schedule');
    const deleteIcon = screen.getAllByTitle('Schedule is still in use');
    const exportIcon = screen.getAllByTitle('Export Schedule as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleScheduleCloneClick).toHaveBeenCalledWith(scheduleInUse);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleScheduleEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleScheduleDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleScheduleDownloadClick).toHaveBeenCalledWith(scheduleInUse);
  });
});
