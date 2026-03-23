/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Filter from 'gmp/models/filter';
import Override from 'gmp/models/override';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import DetailsPage from 'web/pages/overrides/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/overrides';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const reloadInterval = -1;
const manualUrl = 'test/';

const override = Override.fromElement({
  _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  new_severity: -1, // false positive
  nvt: {
    _oid: '123',
    name: 'foo nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  severity: 0.1,
  task: {
    name: 'task x',
    _id: '42',
  },
  text: 'override text',
  writable: 1,
});

const createGmp = ({
  currentSettingsResponse = currentSettingsDefaultResponse,
  getOverrideResponse = new Response(override),
  getPermissionsResponse = new Response([], {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  }),
  cloneOverrideResponse = new Response({data: {id: 'foo'}}),
  deleteOverrideResponse = new Response({foo: 'bar'}),
  exportOverrideResponse = new Response({foo: 'bar'}),
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  getEntities = testing.fn().mockResolvedValue(getPermissionsResponse),
  getOverride = testing.fn().mockResolvedValue(getOverrideResponse),
  getPermissions = testing.fn().mockResolvedValue(getPermissionsResponse),
  cloneOverride = testing.fn().mockResolvedValue(cloneOverrideResponse),
  deleteOverride = testing.fn().mockResolvedValue(deleteOverrideResponse),
  exportOverride = testing.fn().mockResolvedValue(exportOverrideResponse),
} = {}) => {
  return {
    override: {
      get: getOverride,
      clone: cloneOverride,
      delete: deleteOverride,
      export: exportOverride,
    },
    permissions: {
      get: getPermissions,
    },
    settings: {manualUrl, reloadInterval},
    user: {
      currentSettings,
    },
  };
};

describe('OverrideDetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    render(<DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />);

    screen.getByTitle('Help: Overrides');
    screen.getByTitle('Override List');
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-overrides',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/overrides',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    const infoRows = entityInfo.getAllByRole('row');
    expect(infoRows[0]).toHaveTextContent(
      'ID:6d00d22f-551b-4fbe-8215-d8615eff73ea',
    );
    expect(infoRows[1]).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM Central European Standard',
    );
    expect(infoRows[2]).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM Central European Standard',
    );
    expect(infoRows[3]).toHaveTextContent('Owner:admin');

    const tablist = screen.getByRole('tablist');
    within(tablist).getByRole('tab', {name: /^information/i});
    within(tablist).getByRole('tab', {name: /^user tags/i});
    within(tablist).getByRole('tab', {name: /^permissions/i});

    // Details section - use simple text queries
    screen.getByText('foo nvt');
    screen.getByText('123');
    screen.getByText(/^Yes$/); // Active

    screen.getByRole('heading', {name: /^Application/i});

    screen.getByText('127.0.0.1');
    screen.getByText('666');
    screen.getByText('> 0.0');
    screen.getByText('task x');
    // 'Any' appears twice, so just verify it exists
    screen.getByText('Any');

    screen.getByRole('heading', {name: /^Appearance/i});

    screen.getByRole('heading', {
      name: /^Override from Severity > 0\.0 to False Positive/i,
    });
    expect(screen.getByTestId('override-box')).toHaveTextContent(
      'override text',
    );
  });

  test('should render user tags tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    const {container} = render(
      <DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    const tablist = screen.getByRole('tablist');
    const permissionsTab = within(tablist).getByRole('tab', {
      name: /^permissions/i,
    });
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should render permissions tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    const {container} = render(
      <DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    const tablist = screen.getByRole('tablist');
    const permissionsTab = within(tablist).getByRole('tab', {
      name: /^permissions/i,
    });
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    render(<DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />);

    const cloneIcon = screen.getByTitle('Clone Override');
    expect(cloneIcon).toBeInTheDocument();
    fireEvent.click(cloneIcon);
    expect(gmp.override.clone).toHaveBeenCalledWith(override);

    const exportIcon = screen.getByTitle('Export Override as XML');
    expect(exportIcon).toBeInTheDocument();
    fireEvent.click(exportIcon);
    expect(gmp.override.export).toHaveBeenCalledWith(override);

    const deleteIcon = screen.getByTitle('Move Override to trashcan');
    expect(deleteIcon).toBeInTheDocument();
    fireEvent.click(deleteIcon);
    expect(gmp.override.delete).toHaveBeenCalledWith({id: override.id});
  });
});
