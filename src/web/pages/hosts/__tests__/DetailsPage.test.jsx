/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Host from 'gmp/models/host';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
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
  test('should render full DetailsPage', async () => {
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

    screen.getByTitle('Help: Hosts');
    screen.getByTitle('Host List');

    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-hosts',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/hosts',
    );

    screen.getByTitle('Create new Host');
    screen.getByTitle('Edit Host');
    screen.getByTitle('Delete Host');
    screen.getByTitle('Export Host as XML');
    screen.getByTitle('Results for this Host');
    screen.getByTitle('TLS Certificates for this Host');

    screen.getByText('Host: Foo');

    const entityInfo = within(screen.getByTestId('entity-info'));
    const idRow = entityInfo.getByText('ID:').closest('tr');
    within(idRow).getByText('12345');

    const createdRow = entityInfo.getByText('Created:').closest('tr');
    within(createdRow).getByText(
      'Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );

    const modifiedRow = entityInfo.getByText('Modified:').closest('tr');
    within(modifiedRow).getByText(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );

    const ownerRow = entityInfo.getByText('Owner:').closest('tr');
    within(ownerRow).getByText('admin');

    // Tabs
    screen.getByText('Information');
    screen.getByText('User Tags');
    screen.getByText('Permissions');

    // Details
    const detailsTable = screen.getByText('Hostname').closest('table');
    const details = within(detailsTable);
    const hostnameRow = details.getByText('Hostname').closest('tr');
    within(hostnameRow).getByText(
      text => typeof text === 'string' && text.toLowerCase().includes('foo'),
    );

    const ipRow = details.getByText('IP Address').closest('tr');
    within(ipRow).getByText('123.456.789.10');

    const commentRow = details.getByText('Comment').closest('tr');
    within(commentRow).getByText('bar');

    const osRow = details.getByText('OS').closest('tr');
    expect(osRow.querySelector('img')).toHaveAttribute(
      'src',
      '/img/os_linux.svg',
    );

    const routeRow = details.getByText('Route').closest('tr');
    within(routeRow).getByText('123.456.789.11');

    const severityRow = details.getByText('Severity').closest('tr');
    within(severityRow).getByText(
      text => typeof text === 'string' && text.includes('Critical'),
    );

    // Identifier Table
    screen.getByText('All Identifiers');
    const identifiersTable = within(screen.getByTestId('host-identifiers'));

    // Get all rows (including header)
    const identifierRows = identifiersTable.getAllByRole('row');

    // Verify identifier row content (skip header row at index 0)
    expect(identifierRows[1]).toHaveTextContent(
      'hostnamefooSun, Jun 2, 2019 2:00 PM Central European Summer TimeReport 910 (NVT 1.2.3.4.5)',
    );
    expect(identifierRows[2]).toHaveTextContent(
      'ip123.456.789.10Sun, Jun 2, 2019 2:00 PM Central European Summer TimeReport 910 (NVT 1.2.3.4.5)',
    );
    expect(identifierRows[3]).toHaveTextContent(
      'OScpe:/o:linux:kernelSun, Jun 2, 2019 2:00 PM Central European Summer TimeReport 910 (NVT 1.2.3.4.5)',
    );
  });

  test('should render user tags tab', async () => {
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

    render(<DetailsPage id="12345" />);

    const userTagsTab = screen.getByText('User Tags');
    fireEvent.click(userTagsTab);
    expect(screen.getByText('No user tags available')).toBeInTheDocument();
  });

  test('should render permissions tab', async () => {
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

    render(<DetailsPage id="12345" />);

    const permissionsTab = screen.getByText('Permissions');
    fireEvent.click(permissionsTab);
    expect(screen.getByText('No permissions available')).toBeInTheDocument();
  });

  test('should call commands', () => {
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

    const identifiersTable = within(screen.getByTestId('host-identifiers'));
    const deleteIdentifierButtons =
      identifiersTable.getAllByTitle('Delete Identifier');
    fireEvent.click(deleteIdentifierButtons[0]);
    expect(deleteIdentifier).toHaveBeenCalledWith(host.identifiers[0]);

    // export host - use testId for toolbar icon
    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(exportFunc).toHaveBeenCalledWith(host);

    // delete host - use testId for toolbar icon
    const deleteIcons = screen.getAllByTestId('delete-icon');
    fireEvent.click(deleteIcons[0]);
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

    screen.getByTitle('Create new Host');
    screen.getByTitle('Edit Host');
    screen.getByTitle('Delete Host');
    screen.getByTitle('Export Host as XML');
    screen.getByTitle('Results for this Host');
    screen.getByTitle('TLS Certificates for this Host');
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
