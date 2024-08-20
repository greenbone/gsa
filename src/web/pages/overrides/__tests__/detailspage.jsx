/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Override from 'gmp/models/override';

import {entityLoadingActions} from 'web/store/entities/overrides';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

const override = Override.fromElement({
  _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  new_severity: '-1', // false positive
  nvt: {
    _oid: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  severity: '0.1',
  task: {
    name: 'task x',
    _id: '42',
  },
  text: 'override text',
  writable: 1,
});

const overrideInUse = Override.fromElement({
  _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 1,
  modification_time: '2021-01-04T11:54:12Z',
  new_severity: '-1', // false positive
  nvt: {
    _oid: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  severity: '0.1',
  text: 'override text',
  writable: 1,
});

const noPermOverride = Override.fromElement({
  _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  new_severity: '-1', // false positive
  nvt: {
    _oid: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'get_overrides'}},
  port: '666',
  severity: '0.1',
  text: 'override text',
  writable: 1,
});

const getOverride = testing.fn().mockResolvedValue({
  data: override,
});

const getEntities = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Override detailspage tests', () => {
  test('should render full detailspage', () => {
    const gmp = {
      override: {
        get: getOverride,
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

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        override,
      ),
    );

    const {baseElement, element} = render(
      <Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    expect(element).toHaveTextContent('override text');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Overrides')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-overrides',
    );

    expect(screen.getAllByTitle('Override List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/overrides');

    expect(element).toHaveTextContent(
      'ID:6d00d22f-551b-4fbe-8215-d8615eff73ea',
    );
    expect(element).toHaveTextContent('Created:Wed, Dec 23, 2020 3:14 PM CET');
    expect(element).toHaveTextContent('Modified:Mon, Jan 4, 2021 12:54 PM CET');
    expect(element).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    expect(spans[11]).toHaveTextContent('Permissions');

    expect(element).toHaveTextContent('NVT Name');
    expect(element).toHaveTextContent('foo nvt');

    expect(element).toHaveTextContent('NVT OID');
    expect(element).toHaveTextContent('123');

    expect(element).toHaveTextContent('Active');
    expect(element).toHaveTextContent('Yes');

    expect(element).toHaveTextContent('Application');

    expect(element).toHaveTextContent('Hosts');
    expect(element).toHaveTextContent('127.0.0.1');

    expect(element).toHaveTextContent('Port');
    expect(element).toHaveTextContent('666');

    expect(element).toHaveTextContent('Severity');
    expect(element).toHaveTextContent('Any');

    expect(element).toHaveTextContent('Task');
    expect(element).toHaveTextContent('task x');

    expect(element).toHaveTextContent('Result');
    expect(element).toHaveTextContent('Any');

    expect(element).toHaveTextContent('Appearance');

    expect(element).toHaveTextContent(
      'Override from Severity > 0.0 to False Positive',
    );

    expect(element).toHaveTextContent('override text');
  });

  test('should render user tags tab', () => {
    const gmp = {
      override: {
        get: getOverride,
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

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        override,
      ),
    );

    const {baseElement} = render(
      <Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');

    fireEvent.click(spans[9]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      override: {
        get: getOverride,
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

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        override,
      ),
    );

    const {baseElement} = render(
      <Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

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
      override: {
        get: getOverride,
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

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        override,
      ),
    );

    render(<Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />);

    await wait();

    const cloneIcon = screen.getAllByTitle('Clone Override');
    expect(cloneIcon[0]).toBeInTheDocument();

    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(clone).toHaveBeenCalledWith(override);

    const exportIcon = screen.getAllByTitle('Export Override as XML');
    expect(exportIcon[0]).toBeInTheDocument();

    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(override);

    const deleteIcon = screen.getAllByTitle('Move Override to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();

    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteFunc).toHaveBeenCalledWith({id: override.id});
  });
});

describe('Override ToolBarIcons tests', () => {
  test('should render', () => {
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={override}
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
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={override}
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
    expect(handleOverrideCloneClick).toHaveBeenCalledWith(override);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleOverrideEditClick).toHaveBeenCalledWith(override);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleOverrideDeleteClick).toHaveBeenCalledWith(override);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(override);
  });

  test('should not call click handlers without permission', () => {
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noPermOverride}
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

    expect(handleOverrideCloneClick).toHaveBeenCalledWith(noPermOverride);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleOverrideEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleOverrideDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(noPermOverride);
  });

  test('should call correct click handlers for override in use', () => {
    const handleOverrideCloneClick = testing.fn();
    const handleOverrideDeleteClick = testing.fn();
    const handleOverrideDownloadClick = testing.fn();
    const handleOverrideEditClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={overrideInUse}
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

    expect(handleOverrideCloneClick).toHaveBeenCalledWith(overrideInUse);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleOverrideEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleOverrideDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleOverrideDownloadClick).toHaveBeenCalledWith(overrideInUse);
  });
});
