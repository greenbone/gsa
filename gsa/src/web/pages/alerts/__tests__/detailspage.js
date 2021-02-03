/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';

import Alert from 'gmp/models/alert';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {setTimezone} from 'web/store/usersettings/actions';

import {
  createGetAlertQueryMock,
  createCloneAlertQueryMock,
  createDeleteAlertQueryMock,
  createExportAlertsByIdsQueryMock,
  alert1,
  alert2,
  alert3,
} from 'web/graphql/__mocks__/alerts';

import {createGetReportFormatsQueryMock} from 'web/graphql/__mocks__/reportformats';

import {createGetPermissionsQueryMock} from 'web/graphql/__mocks__/permissions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '1',
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

const parsedAlert = Alert.fromObject(alert1);
const parsedAlert2 = Alert.fromObject(alert2);
const parsedAlert3 = Alert.fromObject(alert3);

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

describe('Alert Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetAlertQueryMock('1', alert1);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=1 first=1 rows=-1',
    });
    const [
      reportFormatsMock,
      reportFormatsResult,
    ] = createGetReportFormatsQueryMock();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, reportFormatsMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement, element} = render(<Detailspage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();
    expect(reportFormatsResult).toHaveBeenCalled();

    expect(element).toHaveTextContent('Alert: alert 1');

    const links = baseElement.querySelectorAll('a');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Alerts');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-alerts',
    );

    expect(icons[1]).toHaveAttribute('title', 'Alerts List');
    expect(links[1]).toHaveAttribute('href', '/alerts');

    expect(element).toHaveTextContent('ID:1');
    expect(element).toHaveTextContent('Created:Thu, Aug 6, 2020 1:34 PM CEST');
    expect(element).toHaveTextContent('Modified:Thu, Aug 6, 2020 1:34 PM CEST');
    expect(element).toHaveTextContent('Owner:admin');

    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

    expect(element).toHaveTextContent('Task run status changed to Done');
    expect(element).toHaveTextContent('Always');
    expect(element).toHaveTextContent('Alemba vFire');

    expect(element).toHaveTextContent('Results Filter');
    expect(element).toHaveTextContent('resultFilter');

    expect(element).toHaveTextContent('Base URL');
    expect(element).toHaveTextContent('127.0.0.1');

    expect(element).toHaveTextContent('Alemba Client ID');
    expect(element).toHaveTextContent('clientID');

    expect(element).toHaveTextContent('Call Template');
    expect(element).toHaveTextContent('bar');

    expect(element).toHaveTextContent('Call Type');
    expect(element).toHaveTextContent('foo');

    expect(element).toHaveTextContent('Active');
    expect(element).toHaveTextContent('Yes');

    expect(element).toHaveTextContent('Impact');
    expect(element).toHaveTextContent('baz');

    expect(element).toHaveTextContent('Partition');
    expect(element).toHaveTextContent('lorem');

    expect(element).toHaveTextContent('Urgency');
    expect(element).toHaveTextContent('hello');
  });

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetAlertQueryMock('1', alert1);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=1 first=1 rows=-1',
    });
    const [
      reportFormatsMock,
      reportFormatsResult,
    ] = createGetReportFormatsQueryMock();
    const [renewQueryMock, renewQueryResult] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, reportFormatsMock, renewQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();
    expect(reportFormatsResult).toHaveBeenCalled();
    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(baseElement).toHaveTextContent('User Tags(1)');
    fireEvent.click(tabs[0]);

    expect(baseElement).toHaveTextContent('alert:unnamed');
    expect(renewQueryResult).toHaveBeenCalled();
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetAlertQueryMock('1', alert1);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=1 first=1 rows=-1',
    });
    const [
      reportFormatsMock,
      reportFormatsResult,
    ] = createGetReportFormatsQueryMock();
    const [renewQueryMock, renewQueryResult] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, reportFormatsMock, renewQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();
    expect(reportFormatsResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('Permissions');
    fireEvent.click(tabs[1]);

    expect(renewQueryResult).toHaveBeenCalled();

    // permission 1
    expect(baseElement).toHaveTextContent('Name');
    expect(baseElement).toHaveTextContent('get_foo');

    expect(baseElement).toHaveTextContent('Description');
    expect(baseElement).toHaveTextContent(
      'User admin has read access to Alert alert 1',
    );

    expect(baseElement).toHaveTextContent('Resource Type');
    expect(baseElement).toHaveTextContent('Alert');

    expect(baseElement).toHaveTextContent('Resource');
    expect(baseElement).toHaveTextContent('alert 1');

    expect(baseElement).toHaveTextContent('Subject Type');
    expect(baseElement).toHaveTextContent('User');

    expect(baseElement).toHaveTextContent('Subject');
    expect(baseElement).toHaveTextContent('admin');

    // permission 2
    expect(baseElement).toHaveTextContent('Name');
    expect(baseElement).toHaveTextContent('get_bar');

    expect(baseElement).toHaveTextContent('Description');
    expect(baseElement).toHaveTextContent(
      'Role stormtroopers has read access to Alert alert 1',
    );

    expect(baseElement).toHaveTextContent('Resource Type');
    expect(baseElement).toHaveTextContent('Alert');

    expect(baseElement).toHaveTextContent('Resource');
    expect(baseElement).toHaveTextContent('alert 1');

    expect(baseElement).toHaveTextContent('Subject Type');
    expect(baseElement).toHaveTextContent('Role');

    expect(baseElement).toHaveTextContent('Subject');
    expect(baseElement).toHaveTextContent('admin');

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks).toHaveLength(4);

    expect(detailsLinks[0]).toHaveAttribute('href', '/alert/1');
    expect(detailsLinks[1]).toHaveAttribute('href', '/user/234');
    expect(detailsLinks[2]).toHaveAttribute('href', '/alert/1');
    expect(detailsLinks[3]).toHaveAttribute('href', '/role/344');
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
    const [mock, resultFunc] = createGetAlertQueryMock('1', alert1);
    const [cloneMock, cloneResult] = createCloneAlertQueryMock();
    const [deleteMock, deleteResult] = createDeleteAlertQueryMock();
    const [exportMock, exportResult] = createExportAlertsByIdsQueryMock(['1']);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=1 first=1 rows=-1',
    });
    const [
      reportFormatsMock,
      reportFormatsResult,
    ] = createGetReportFormatsQueryMock();

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
        reportFormatsMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    render(<Detailspage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();
    expect(reportFormatsResult).toHaveBeenCalled();

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');
    fireEvent.click(icons[3]);

    await wait();

    expect(cloneResult).toHaveBeenCalled();

    expect(icons[5]).toHaveAttribute('title', 'Move Alert to trashcan');
    fireEvent.click(icons[5]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();

    expect(icons[6]).toHaveAttribute('title', 'Export Alert as XML');
    fireEvent.click(icons[6]);

    await wait();

    expect(exportResult).toHaveBeenCalled();
  });
});

describe('Alert ToolBarIcons tests', () => {
  test('should render', () => {
    const handleAlertCloneClick = jest.fn();
    const handleAlertDeleteClick = jest.fn();
    const handleAlertDownloadClick = jest.fn();
    const handleAlertEditClick = jest.fn();
    const handleAlertCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={parsedAlert}
        onAlertCloneClick={handleAlertCloneClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
        onAlertCreateClick={handleAlertCreateClick}
      />,
    );

    const icons = screen.getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-alerts',
    );
    expect(icons[0]).toHaveAttribute('title', 'Help: Alerts');

    expect(links[1]).toHaveAttribute('href', '/alerts');
    expect(icons[1]).toHaveAttribute('title', 'Alerts List');
  });

  test('should call click handlers', () => {
    const handleAlertCloneClick = jest.fn();
    const handleAlertDeleteClick = jest.fn();
    const handleAlertDownloadClick = jest.fn();
    const handleAlertEditClick = jest.fn();
    const handleAlertCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedAlert}
        onAlertCloneClick={handleAlertCloneClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
        onAlertCreateClick={handleAlertCreateClick}
      />,
    );

    const icons = screen.getAllByTestId('svg-icon');

    fireEvent.click(icons[3]);
    expect(handleAlertCloneClick).toHaveBeenCalledWith(parsedAlert);
    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');

    fireEvent.click(icons[4]);
    expect(handleAlertEditClick).toHaveBeenCalledWith(parsedAlert);
    expect(icons[4]).toHaveAttribute('title', 'Edit Alert');

    fireEvent.click(icons[5]);
    expect(handleAlertDeleteClick).toHaveBeenCalledWith(parsedAlert);
    expect(icons[5]).toHaveAttribute('title', 'Move Alert to trashcan');

    fireEvent.click(icons[6]);
    expect(handleAlertDownloadClick).toHaveBeenCalledWith(parsedAlert);
    expect(icons[6]).toHaveAttribute('title', 'Export Alert as XML');
  });

  test('should not call click handlers without permission', () => {
    const handleAlertCloneClick = jest.fn();
    const handleAlertDeleteClick = jest.fn();
    const handleAlertDownloadClick = jest.fn();
    const handleAlertEditClick = jest.fn();
    const handleAlertCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedAlert2}
        onAlertCloneClick={handleAlertCloneClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
        onAlertCreateClick={handleAlertCreateClick}
      />,
    );

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');
    fireEvent.click(icons[3]);
    expect(handleAlertCloneClick).toHaveBeenCalledWith(parsedAlert2);
    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');

    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to edit Alert denied',
    );
    fireEvent.click(icons[4]);
    expect(handleAlertEditClick).not.toHaveBeenCalled();

    fireEvent.click(icons[5]);
    expect(handleAlertDeleteClick).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute(
      'title',
      'Permission to move Alert to trashcan denied',
    );

    fireEvent.click(icons[6]);
    expect(handleAlertDownloadClick).toHaveBeenCalledWith(parsedAlert2);
    expect(icons[6]).toHaveAttribute('title', 'Export Alert as XML');
  });

  test('should (not) call click handlers for alert in use', () => {
    const handleAlertCloneClick = jest.fn();
    const handleAlertDeleteClick = jest.fn();
    const handleAlertDownloadClick = jest.fn();
    const handleAlertEditClick = jest.fn();
    const handleAlertCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedAlert3}
        onAlertCloneClick={handleAlertCloneClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
        onAlertCreateClick={handleAlertCreateClick}
      />,
    );

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');
    fireEvent.click(icons[3]);
    expect(handleAlertCloneClick).toHaveBeenCalledWith(parsedAlert3);
    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');

    expect(icons[4]).toHaveAttribute('title', 'Edit Alert');
    fireEvent.click(icons[4]);
    expect(handleAlertEditClick).toHaveBeenCalled();

    fireEvent.click(icons[5]);
    expect(handleAlertDeleteClick).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Alert is still in use');

    fireEvent.click(icons[6]);
    expect(handleAlertDownloadClick).toHaveBeenCalledWith(parsedAlert3);
    expect(icons[6]).toHaveAttribute('title', 'Export Alert as XML');
  });
});
