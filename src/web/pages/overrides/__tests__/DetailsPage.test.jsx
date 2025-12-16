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
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
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

    expect(screen.getByTitle('Help: Overrides')).toBeInTheDocument();
    expect(screen.getByTitle('Override List')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-overrides',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/overrides',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /ID:/})).toHaveTextContent(
      'ID:6d00d22f-551b-4fbe-8215-d8615eff73ea',
    );
    expect(entityInfo.getByRole('row', {name: /Created:/})).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM Central European Standard',
    );
    expect(entityInfo.getByRole('row', {name: /Modified:/})).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM Central European Standard',
    );
    expect(entityInfo.getByRole('row', {name: /Owner:/})).toHaveTextContent(
      'Owner:admin',
    );

    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^permissions/i}),
    ).toBeInTheDocument();

    expect(screen.getByRole('row', {name: /^NVT Name/i})).toHaveTextContent(
      'foo nvt',
    );
    expect(screen.getByRole('row', {name: /^NVT OID/i})).toHaveTextContent(
      '123',
    );
    expect(screen.getByRole('row', {name: /^Active/i})).toHaveTextContent(
      'Yes',
    );

    expect(
      screen.getByRole('heading', {name: /^Application/i}),
    ).toBeInTheDocument();

    expect(screen.getByRole('row', {name: /^Hosts/i})).toHaveTextContent(
      '127.0.0.1',
    );
    expect(screen.getByRole('row', {name: /^Port/i})).toHaveTextContent('666');
    expect(screen.getByRole('row', {name: /^Severity/i})).toHaveTextContent(
      '> 0.0',
    );
    expect(screen.getByRole('row', {name: /^Task/i})).toHaveTextContent(
      'task x',
    );
    expect(screen.getByRole('row', {name: /^Result/i})).toHaveTextContent(
      'Any',
    );

    expect(
      screen.getByRole('heading', {name: /^Appearance/i}),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /^Override from Severity > 0\.0 to False Positive/i,
      }),
    ).toBeInTheDocument();
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

    const permissionsTab = screen.getByRole('tab', {name: /^permissions/i});
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

    const permissionsTab = screen.getByRole('tab', {name: /^permissions/i});
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
