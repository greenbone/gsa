/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Features from 'gmp/capabilities/features';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import WebApplicationTarget from 'gmp/models/web-application-target';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import WebApplicationTargetsListPage from 'web/pages/web-application-targets/WebApplicationTargetsListPage';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getSetting = testing.fn().mockResolvedValue({filter: null});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
  }),
);

const makeTarget = (id = 'wat1') =>
  WebApplicationTarget.fromElement({
    _id: id,
    name: 'web app target',
    urls: 'https://example.com',
    credential: {_id: 'cred1', name: 'cred'},
    creation_time: '2026-01-01T00:00:00Z',
    modification_time: '2026-01-02T00:00:00Z',
    owner: {name: 'admin'},
    permissions: {permission: [{name: 'everything'}]},
  });

const createGmp = ({
  getWebApplicationTargets = testing.fn().mockResolvedValue({
    data: [makeTarget()],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts({
        first: 1,
        all: 1,
        filtered: 1,
        length: 1,
        rows: 10,
      }),
    },
  }),
  deleteBulk = testing.fn().mockResolvedValue({foo: 'bar'}),
  exportBulk = testing.fn().mockResolvedValue({data: 'exported data'}),
} = {}) => ({
  webapplicationtarget: {
    create: testing.fn().mockResolvedValue({id: 'created-id'}),
    save: testing.fn().mockResolvedValue({id: 'saved-id'}),
    clone: testing.fn().mockResolvedValue({id: 'cloned-id'}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({foo: 'bar'}),
  },
  webapplicationtargets: {
    get: getWebApplicationTargets,
    delete: deleteBulk,
    export: exportBulk,
  },
  filters: {
    get: getFilters,
  },
  settings: {
    manualUrl,
  },
  session: createSession({token: 'token'}),
  user: {currentSettings, getSetting},
});

describe('WebApplicationTargetsListPage tests', () => {
  test('should render full WebApplicationTargetsListPage', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_WEB_APPLICATION_SCANNING']),
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success(
        'web_application_targets',
        defaultSettingFilter,
      ),
    );

    render(<WebApplicationTargetsListPage />);

    await screen.findByText(/web app target/i);

    // Toolbar
    expect(
      screen.getByTitle('Help: Web Application Targets'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('New Web Application Target')).toBeInTheDocument();

    expect(screen.getByTestId('table-header-sort-by-name')).toBeInTheDocument();
    expect(screen.getByTestId('table-header-sort-by-url')).toBeInTheDocument();
    expect(screen.getByText('Credential')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Row contents
    expect(screen.getByText('web app target')).toBeInTheDocument();
    expect(screen.getByText('cred')).toBeInTheDocument();

    // Row actions
    expect(
      screen.getByTitle('Clone Web Application Target'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Export Web Application Target'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Edit Web Application Target'),
    ).toBeInTheDocument();
  });

  test('should call commands for bulk actions', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success(
        'web_application_targets',
        defaultSettingFilter,
      ),
    );

    render(<WebApplicationTargetsListPage />);

    await screen.findByText(/web app target/i);

    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);
    await wait();
    expect(gmp.webapplicationtargets.export).toHaveBeenCalled();

    const deleteIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(deleteIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const moveToTrashcanButton = screen.getByText('Move to Trashcan');
    fireEvent.click(moveToTrashcanButton);
    await wait();

    expect(gmp.webapplicationtargets.delete).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: false, router: true});

    const {element} = render(<WebApplicationTargetsListPage />);

    expect(element).toBeVisible();

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();
  });
});
