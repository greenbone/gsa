/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Alert from 'gmp/models/alert';
import Filter from 'gmp/models/filter';
import Detailspage, {ToolBarIcons} from 'web/pages/alerts/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/alerts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/Testing';


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

let getAlert;
let getEntities;
let currentSettings;
let renewSession;

beforeEach(() => {
  getAlert = testing.fn().mockResolvedValue({
    data: alert,
  });

  getEntities = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = testing.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
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
      reportconfigs: {
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

    const {baseElement} = render(<Detailspage id="12345" />);

    expect(baseElement).toHaveTextContent('Alert: foo');

    const links = baseElement.querySelectorAll('a');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Alerts');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-alerts',
    );

    expect(icons[1]).toHaveAttribute('title', 'Alerts List');
    expect(links[1]).toHaveAttribute('href', '/alerts');

    expect(baseElement).toHaveTextContent('ID:1234');
    expect(baseElement).toHaveTextContent(
      'Created:Tue, Jul 16, 2019 8:31 AM CEST',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Tue, Jul 16, 2019 8:44 AM CEST',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    expect(spans[11]).toHaveTextContent('Permissions');

    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');

    expect(baseElement).toHaveTextContent('Task run status changed to Done');
    expect(baseElement).toHaveTextContent('Always');
    expect(baseElement).toHaveTextContent('SMB');
    expect(baseElement).toHaveTextContent('report results filter');
    expect(baseElement).toHaveTextContent('Yes');
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
      reportconfigs: {
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

    const spans = baseElement.querySelectorAll('span');

    expect(spans[9]).toHaveTextContent('User Tags');
    fireEvent.click(spans[9]);

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
      reportconfigs: {
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

    const spans = baseElement.querySelectorAll('span');

    expect(spans[11]).toHaveTextContent('Permissions');
    fireEvent.click(spans[11]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = testing.fn().mockResolvedValue({
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
      reportconfigs: {
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
    const handleAlertCloneClick = testing.fn();
    const handleAlertDeleteClick = testing.fn();
    const handleAlertDownloadClick = testing.fn();
    const handleAlertEditClick = testing.fn();
    const handleAlertCreateClick = testing.fn();

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
        onAlertCreateClick={handleAlertCreateClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
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
    const handleAlertCloneClick = testing.fn();
    const handleAlertDeleteClick = testing.fn();
    const handleAlertDownloadClick = testing.fn();
    const handleAlertEditClick = testing.fn();
    const handleAlertCreateClick = testing.fn();

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
        onAlertCreateClick={handleAlertCreateClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
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
    const handleAlertCloneClick = testing.fn();
    const handleAlertDeleteClick = testing.fn();
    const handleAlertDownloadClick = testing.fn();
    const handleAlertEditClick = testing.fn();
    const handleAlertCreateClick = testing.fn();

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
        onAlertCreateClick={handleAlertCreateClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
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
    const handleAlertCloneClick = testing.fn();
    const handleAlertDeleteClick = testing.fn();
    const handleAlertDownloadClick = testing.fn();
    const handleAlertEditClick = testing.fn();
    const handleAlertCreateClick = testing.fn();

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
        onAlertCreateClick={handleAlertCreateClick}
        onAlertDeleteClick={handleAlertDeleteClick}
        onAlertDownloadClick={handleAlertDownloadClick}
        onAlertEditClick={handleAlertEditClick}
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
