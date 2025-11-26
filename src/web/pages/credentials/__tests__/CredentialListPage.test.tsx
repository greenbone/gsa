/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  getSelectItemElementsForSelect,
  screen,
  testBulkTrashcanDialog,
  within,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import CredentialPage from 'web/pages/credentials/CredentialListPage';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const credential = Credential.fromElement({
  _id: '6575',
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'something',
  in_use: 0,
  login: 'Admin',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  type: 'usk',
  writable: 1,
  certificate_info: {
    activation_time: '2018-10-10T11:41:23.022Z',
    expiration_time: '2019-10-10T11:41:23.022Z',
    md5_fingerprint: 'asdf',
    issuer: 'dn',
  },
});

const reloadInterval = -1;
const manualUrl = 'test/';

const createGmp = ({
  cloneCredentialResponse = {data: {id: 'foo'}},
  downloadCredentialResponse = {data: 'credential-data'},
  exportCredentialResponse = {data: 'some-data'},
  getCredentialResponse = {data: credential},
  getCredentialsResponse = {
    data: [credential],
    meta: {filter: new Filter(), counts: new CollectionCounts()},
  },
  getFiltersResponse = {
    data: [],
    meta: {filter: new Filter(), counts: new CollectionCounts()},
  },
  cloneCredential = testing.fn().mockResolvedValue(cloneCredentialResponse),
  deleteCredential = testing.fn().mockResolvedValue(undefined),
  downloadCredential = testing
    .fn()
    .mockResolvedValue(downloadCredentialResponse),
  exportCredential = testing.fn().mockResolvedValue(exportCredentialResponse),
  getCredential = testing.fn().mockResolvedValue(getCredentialResponse),
  getCredentials = testing.fn().mockResolvedValue(getCredentialsResponse),
  getFilters = testing.fn().mockResolvedValue(getFiltersResponse),
  deleteByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  deleteByModels = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByModels = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
} = {}) => {
  return {
    credential: {
      clone: cloneCredential,
      delete: deleteCredential,
      download: downloadCredential,
      export: exportCredential,
      get: getCredential,
    },
    credentials: {
      get: getCredentials,
      deleteByFilter,
      exportByFilter,
      export: exportByModels,
      delete: deleteByModels,
    },
    filters: {
      get: getFilters,
    },
    settings: {manualUrl, reloadInterval},
    user: {
      currentSettings: testing
        .fn()
        .mockResolvedValue(currentSettingsDefaultResponse),
    },
    permissions: {
      get: testing.fn().mockResolvedValue({
        data: [],
        meta: {
          filter: Filter.fromString(),
          counts: new CollectionCounts(),
        },
      }),
    },
  };
};

describe('CredentialListPage tests', () => {
  test('should render full CredentialPage', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('credential', defaultSettingFilter),
    );

    render(<CredentialPage />);

    await wait();

    // Toolbar Icons
    expect(screen.getByTitle('Help: Credentials')).toBeInTheDocument();
    expect(screen.getByTitle('New Credential')).toBeInTheDocument();

    const powerFilter = within(screen.getPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    const inputs = powerFilter.queryTextInputs();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getAllByTitle('Update Filter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove Filter')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Reset to Default Filter')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Help: Powerfilter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Filter')[0]).toBeInTheDocument();
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // table column headers
    expect(
      screen.getByRole('columnheader', {name: /name/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /type/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /login/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /actions/i}),
    ).toBeInTheDocument();

    // table row contents
    expect(
      screen.getByRole('cell', {name: /credential 1 \(something\)/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {name: /username \+ ssh key/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: /admin/i})).toBeInTheDocument();

    // table row actions
    expect(
      screen.getByTitle('Move Credential to trashcan'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Edit Credential')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Credential')).toBeInTheDocument();
    expect(screen.getByTitle('Export Credential')).toBeInTheDocument();
    expect(screen.getByTitle('Download Public Key')).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('credential', defaultSettingFilter),
    );

    render(<CredentialPage />);

    await wait();

    // export page contents
    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);
    expect(gmp.credentials.exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.credentials.deleteByFilter);
  });

  test('should allow to bulk action on selected credentials', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('credential', defaultSettingFilter),
    );

    render(<CredentialPage />);

    await wait();

    // change to apply to selection
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select an credential
    const tableBody = within(screen.getTableBody());
    const inputs = tableBody.getAllCheckBoxes();
    fireEvent.click(inputs[0]);
    expect(inputs[0]).toBeChecked();

    // export selected credential
    const exportIcon = screen.getByTitle('Export selection');
    fireEvent.click(exportIcon);
    expect(gmp.credentials.export).toHaveBeenCalled();

    // move selected credential to trashcan
    const deleteIcon = screen.getByTitle('Move selection to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.credentials.delete);
  });

  test('should allow to bulk action on filtered credentials', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('credential', defaultSettingFilter),
    );

    render(<CredentialPage />);

    await wait();

    // change to all filtered
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered credentials
    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    fireEvent.click(exportIcon);
    expect(gmp.credentials.exportByFilter).toHaveBeenCalled();

    // move all filtered credentials to trashcan
    const deleteIcon = screen.getByTitle('Move all filtered to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.credentials.deleteByFilter);
  });
});
