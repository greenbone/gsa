/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, wait, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Host from 'gmp/models/host';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import DetailsPage, {ToolBarIcons} from 'web/pages/hosts/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/hosts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

// setup

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

beforeEach(() => {
  getHost = testing.fn().mockResolvedValue({
    data: host,
  });

  getPermissions = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);
});

describe('Host DetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = {
      host: {
        get: getHost,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {
        manualUrl,
        reloadInterval,
        severityRating: SEVERITY_RATING_CVSS_3,
      },
      user: {currentSettings},
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

    render(<DetailsPage id="12345" />);

    expect(screen.getByTitle('Help: Hosts')).toBeInTheDocument();
    expect(screen.getByTitle('Host List')).toBeInTheDocument();

    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-hosts',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/hosts',
    );

    expect(screen.getByTitle('Create new Host')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Host')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Host')).toBeInTheDocument();
    expect(screen.getByTitle('Export Host as XML')).toBeInTheDocument();
    expect(screen.getByTitle('Results for this Host')).toBeInTheDocument();
    expect(
      screen.getByTitle('TLS Certificates for this Host'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {name: /host: foo/i}),
    ).toBeInTheDocument();

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /id/i})).toHaveTextContent(
      'ID:12345',
    );
    expect(entityInfo.getByRole('row', {name: /created/i})).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /modified/i})).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /owner/i})).toHaveTextContent(
      'Owner:admin',
    );

    // Tabs
    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^permissions/i}),
    ).toBeInTheDocument();

    // Details
    expect(
      screen.getByRole('row', {name: /^Hostname foo/}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {name: /^IP Address 123.456.789.10/}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {name: /^comment bar/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {name: /^os linux kernel/i}),
    ).toBeInTheDocument();
    const osImage = screen
      .getByRole('row', {name: /^os linux kernel/i})
      .querySelector('img');
    expect(osImage).toHaveAttribute('src', '/img/os_linux.svg');

    expect(screen.getByRole('row', {name: /^route/i})).toHaveTextContent(
      /123\.456\.789\.10123\.456\.789\.11/,
    );
    expect(screen.getByRole('row', {name: /^severity/i})).toHaveTextContent(
      /10\.0 \(Critical\)/,
    );

    // Identifier Table
    expect(
      screen.getByRole('heading', {name: /^all identifiers/i}),
    ).toBeInTheDocument();
    const identifiersTable = within(screen.getByTestId('host-identifiers'));

    // Rows
    expect(
      identifiersTable.getByRole('row', {name: /^hostname/i}),
    ).toHaveTextContent(
      'hostnamefooSun, Jun 2, 2019 2:00 PM Central European Summer TimeReport 910 (NVT 1.2.3.4.5)',
    );
    expect(identifiersTable.getByRole('row', {name: /^ip/i})).toHaveTextContent(
      'ip123.456.789.10Sun, Jun 2, 2019 2:00 PM Central European Summer TimeReport 910 (NVT 1.2.3.4.5)',
    );
    expect(identifiersTable.getByRole('row', {name: /^os/i})).toHaveTextContent(
      'OScpe:/o:linux:kernelSun, Jun 2, 2019 2:00 PM Central European Summer TimeReport 910 (NVT 1.2.3.4.5)',
    );
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

    const {container} = render(<DetailsPage id="12345" />);

    const userTagsTab = screen.getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
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

    const {container} = render(<DetailsPage id="12345" />);

    const permissionsTab = screen.getByRole('tab', {name: /^permissions/i});
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const deleteIdentifier = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const exportFunc = testing.fn().mockResolvedValue({
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

    render(<DetailsPage id="12345" />);

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
    const handleHostCreateClick = testing.fn();
    const handleHostDeleteClick = testing.fn();
    const handleHostDownloadClick = testing.fn();
    const handleHostEditClick = testing.fn();

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
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Hosts',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-hosts',
    );

    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'Host List',
    );
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
    const handleHostCreateClick = testing.fn();
    const handleHostDeleteClick = testing.fn();
    const handleHostDownloadClick = testing.fn();
    const handleHostEditClick = testing.fn();

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

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'Create new Host');
    fireEvent.click(newIcon);
    expect(handleHostCreateClick).toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Host');
    fireEvent.click(editIcon);
    expect(handleHostEditClick).toHaveBeenCalledWith(host);

    const deleteIcon = screen.getAllByTestId('delete-icon')[0];
    fireEvent.click(deleteIcon);
    expect(handleHostDeleteClick).toHaveBeenCalledWith(host);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Host as XML');
    fireEvent.click(exportIcon);
    expect(handleHostDownloadClick).toHaveBeenCalledWith(host);
  });

  test('should not call click handlers without permission', () => {
    const handleHostCreateClick = testing.fn();
    const handleHostDeleteClick = testing.fn();
    const handleHostDownloadClick = testing.fn();
    const handleHostEditClick = testing.fn();

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

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'Create new Host');
    fireEvent.click(newIcon);
    expect(handleHostCreateClick).toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Permission to edit Host denied');
    fireEvent.click(editIcon);
    expect(handleHostEditClick).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTestId('delete-icon')[0];
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to delete Host denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleHostDeleteClick).not.toHaveBeenCalledWith(host);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Host as XML');
    fireEvent.click(exportIcon);
    expect(handleHostDownloadClick).toHaveBeenCalledWith(hostWithoutPermission);
  });
});
