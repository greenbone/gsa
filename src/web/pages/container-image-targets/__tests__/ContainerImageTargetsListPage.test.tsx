/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import OciImageTarget from 'gmp/models/oci-image-target';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import ContainerImageTargetsListPage from 'web/pages/container-image-targets/ContainerImageTargetsListPage';
import {setUsername} from 'web/store/usersettings/actions';
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

const makeTarget = (id = 'oci1') =>
  OciImageTarget.fromElement({
    _id: id,
    name: 'oci target',
    image_references: 'registry.example.com/repo/image:latest',
    credential: {_id: 'cred1', name: 'cred'},
    creation_time: '2025-01-01T00:00:00Z',
    modification_time: '2025-01-02T00:00:00Z',
    owner: {name: 'admin'},
    permissions: {permission: [{name: 'everything'}]},
  });

describe('ContainerImageTargetsListPage tests', () => {
  test('should render full ContainerImageTargetsListPage', async () => {
    const target = makeTarget();

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });

    const getOciImageTargets = testing.fn().mockResolvedValue({
      data: [target],
      meta: {filter: Filter.fromString(), counts},
    });

    const gmp = {
      ociimagetarget: {
        create: testing.fn().mockResolvedValue({id: 'created-id'}),
        save: testing.fn().mockResolvedValue({id: 'saved-id'}),
        clone: testing.fn().mockResolvedValue({id: 'cloned-id'}),
        delete: testing.fn().mockResolvedValue(undefined),
        export: testing.fn().mockResolvedValue({foo: 'bar'}),
      },
      ociimagetargets: {
        get: getOciImageTargets,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, token: 'token'},
      user: {currentSettings, getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success(
        'container_image_targets',
        defaultSettingFilter,
      ),
    );

    render(<ContainerImageTargetsListPage />);

    await screen.findByText(/oci target/i);

    // Toolbar
    expect(
      screen.getByTitle('Help: Container Image Targets'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('New Container Image Target')).toBeInTheDocument();

    expect(screen.getByTestId('table-header-sort-by-name')).toBeInTheDocument();
    expect(
      screen.getByTestId('table-header-sort-by-image_references'),
    ).toBeInTheDocument();
    expect(screen.getByText('Credential')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Row contents
    expect(screen.getByText('oci target')).toBeInTheDocument();
    expect(
      screen.getByText('registry.example.com/repo/image:latest'),
    ).toBeInTheDocument();
    expect(screen.getByText('cred')).toBeInTheDocument();

    // Row actions
    expect(
      screen.getByTitle('Clone Container Image Target'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Export Container Image Target'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Edit Container Image Target'),
    ).toBeInTheDocument();
  });

  test('should call commands for bulk actions', async () => {
    const target = makeTarget();

    const deleteBulk = testing.fn().mockResolvedValue({foo: 'bar'});
    const exportBulk = testing.fn().mockResolvedValue({data: 'exported data'});

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });

    const getOciImageTargets = testing.fn().mockResolvedValue({
      data: [target],
      meta: {filter: Filter.fromString(), counts},
    });

    const gmp = {
      ociimagetarget: {
        create: testing.fn().mockResolvedValue({id: 'created-id'}),
        save: testing.fn().mockResolvedValue({id: 'saved-id'}),
        clone: testing.fn().mockResolvedValue({id: 'cloned-id'}),
        delete: testing.fn().mockResolvedValue(undefined),
        export: testing.fn().mockResolvedValue({foo: 'bar'}),
      },
      ociimagetargets: {
        get: getOciImageTargets,
        delete: deleteBulk,
        export: exportBulk,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, token: 'token'},
      user: {currentSettings, getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success(
        'container_image_targets',
        defaultSettingFilter,
      ),
    );

    render(<ContainerImageTargetsListPage />);

    // Wait for the row to appear (react-query + async hooks)
    await screen.findByText(/oci target/i);

    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);
    await wait();
    expect(exportBulk).toHaveBeenCalled();

    const deleteIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(deleteIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const moveToTrashcanButton = screen.getByText('Move to Trashcan');
    fireEvent.click(moveToTrashcanButton);
    await wait();

    expect(deleteBulk).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const getOciImageTargets = testing.fn().mockResolvedValue({
      data: [makeTarget()],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const gmp = {
      ociimagetarget: {
        create: testing.fn().mockResolvedValue({id: 'created-id'}),
        save: testing.fn().mockResolvedValue({id: 'saved-id'}),
        clone: testing.fn().mockResolvedValue({id: 'cloned-id'}),
        delete: testing.fn().mockResolvedValue(undefined),
        export: testing.fn().mockResolvedValue({foo: 'bar'}),
      },
      ociimagetargets: {
        get: getOciImageTargets,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, token: 'token'},
      user: {currentSettings, getSetting},
    };

    const {render} = rendererWith({gmp, capabilities: false, router: true});

    const {element} = render(<ContainerImageTargetsListPage />);

    expect(element).toBeVisible();

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();
  });
});
