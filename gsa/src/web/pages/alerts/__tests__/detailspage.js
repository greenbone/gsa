/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import CollectionCounts from 'gmp/collection/collectioncounts';

import Alert from 'gmp/models/alert';
import Filter from 'gmp/models/filter';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {entityLoadingActions} from 'web/store/entities/alerts';
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

const alert = Alert.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  permissions: {permission: [{name: 'everything'}]},
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  active: 1,
  condition: 'Always',
  event: {
    data: {
      name: 'status',
      __text: 'Done',
    },
    __text: 'Task run status changed',
  },
  filter: {
    _id: 'filter id',
    name: 'report results filter',
  },
  method: {
    __text: 'SMB',
  },
});

const observedAlert = Alert.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  permissions: {permission: [{name: 'get_alerts'}]},
});

const alertInUse = Alert.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  permissions: {permission: [{name: 'everything'}]},
  inUse: true,
});

const getAlert = jest.fn().mockResolvedValue({
  data: alert,
});

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

describe('Alert Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const gmp = {
      alert: {
        get: getAlert,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
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

    store.dispatch(entityLoadingActions.success('12345', alert));

    const {baseElement, element} = render(<Detailspage id="12345" />);

    expect(element).toHaveTextContent('Alert: foo');

    const links = baseElement.querySelectorAll('a');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Alerts');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-alerts',
    );

    expect(icons[1]).toHaveAttribute('title', 'Alerts List');
    expect(links[1]).toHaveAttribute('href', '/alerts');

    expect(element).toHaveTextContent('ID:1234');
    expect(element).toHaveTextContent('Created:Tue, Jul 16, 2019 8:31 AM CEST');
    expect(element).toHaveTextContent(
      'Modified:Tue, Jul 16, 2019 8:44 AM CEST',
    );
    expect(element).toHaveTextContent('Owner:admin');

    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('bar');

    expect(element).toHaveTextContent('Task run status changed to Done');
    expect(element).toHaveTextContent('Always');
    expect(element).toHaveTextContent('SMB');
    expect(element).toHaveTextContent('report results filter');
    expect(element).toHaveTextContent('Yes');
  });

  test('should render user tags tab', () => {
    const gmp = {
      alert: {
        get: getAlert,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
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

    store.dispatch(entityLoadingActions.success('12345', alert));

    const {baseElement} = render(<Detailspage id="12345" />);

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      alert: {
        get: getAlert,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
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

    store.dispatch(entityLoadingActions.success('12345', alert));

    const {baseElement} = render(<Detailspage id="12345" />);

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('Permissions');
    fireEvent.click(tabs[1]);

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
      alert: {
        get: getAlert,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };
    const [renewQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [renewQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', alert));

    render(<Detailspage id="12345" />);

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');
    fireEvent.click(icons[3]);

    await wait();

    expect(clone).toHaveBeenCalledWith(alert);

    expect(icons[5]).toHaveAttribute('title', 'Move Alert to trashcan');
    fireEvent.click(icons[5]);

    await wait();

    expect(deleteFunc).toHaveBeenCalledWith({id: alert.id});

    expect(icons[6]).toHaveAttribute('title', 'Export Alert as XML');
    fireEvent.click(icons[6]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(alert);
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
        entity={alert}
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
        entity={alert}
        onAlertCloneClick={handleAlertCloneClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
        onAlertCreateClick={handleAlertCreateClick}
      />,
    );

    const icons = screen.getAllByTestId('svg-icon');

    fireEvent.click(icons[3]);
    expect(handleAlertCloneClick).toHaveBeenCalledWith(alert);
    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');

    fireEvent.click(icons[4]);
    expect(handleAlertEditClick).toHaveBeenCalledWith(alert);
    expect(icons[4]).toHaveAttribute('title', 'Edit Alert');

    fireEvent.click(icons[5]);
    expect(handleAlertDeleteClick).toHaveBeenCalledWith(alert);
    expect(icons[5]).toHaveAttribute('title', 'Move Alert to trashcan');

    fireEvent.click(icons[6]);
    expect(handleAlertDownloadClick).toHaveBeenCalledWith(alert);
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
        entity={observedAlert}
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
    expect(handleAlertCloneClick).toHaveBeenCalledWith(observedAlert);
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
    expect(handleAlertDownloadClick).toHaveBeenCalledWith(observedAlert);
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
        entity={alertInUse}
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
    expect(handleAlertCloneClick).toHaveBeenCalledWith(alertInUse);
    expect(icons[3]).toHaveAttribute('title', 'Clone Alert');

    expect(icons[4]).toHaveAttribute('title', 'Edit Alert');
    fireEvent.click(icons[4]);
    expect(handleAlertEditClick).toHaveBeenCalled();

    fireEvent.click(icons[5]);
    expect(handleAlertDeleteClick).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Alert is still in use');

    fireEvent.click(icons[6]);
    expect(handleAlertDownloadClick).toHaveBeenCalledWith(alertInUse);
    expect(icons[6]).toHaveAttribute('title', 'Export Alert as XML');
  });
});
