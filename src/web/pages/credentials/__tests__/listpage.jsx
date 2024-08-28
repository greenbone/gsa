/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import CredentialPage, {ToolBarIcons} from '../listpage';
import {
  clickElement,
  getCheckBoxes,
  getPowerFilter,
  getSelectElement,
  getSelectItemElementsForSelect,
  getTableBody,
  getTableFooter,
  getTextInputs,
  testBulkTrashcanDialog,
} from 'web/components/testing';

const credential = Credential.fromElement({
  _id: '6575',
  allow_insecure: 1,
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'blah',
  formats: {format: 'pem'},
  full_type: 'Username + SSH Key',
  in_use: 0,
  login: '',
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

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_credentials']);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getSetting;
let getFilters;
let getCredentials;
let renewSession;

beforeEach(() => {
  currentSettings = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
  getSetting = testing.fn().mockResolvedValue({
    filter: null,
  });
  getFilters = testing.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getCredentials = testing.fn().mockResolvedValue({
    data: [credential],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('CredentialPage tests', () => {
  test('should render full CredentialPage', async () => {
    const gmp = {
      credentials: {
        get: getCredentials,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting},
    };

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

    const {baseElement} = render(<CredentialPage />);

    await wait();

    const powerFilter = getPowerFilter();
    const select = getSelectElement(powerFilter);
    const inputs = getTextInputs(powerFilter);

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Credentials')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Credential')[0]).toBeInTheDocument();

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

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Type');
    expect(header[2]).toHaveTextContent('Allow insecure use');
    expect(header[3]).toHaveTextContent('Login');
    expect(header[4]).toHaveTextContent('Actions');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('credential 1');
    expect(row[1]).toHaveTextContent('(blah)');
    expect(row[1]).toHaveTextContent('Username + SSH Key');
    expect(row[1]).toHaveTextContent('Yes');

    expect(
      screen.getAllByTitle('Move Credential to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Credential')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Clone Credential')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Credential')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Download Public Key')[0]).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      credentials: {
        get: getCredentials,
        deleteByFilter,
        exportByFilter,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting},
    };

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
    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    await clickElement(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    await clickElement(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });

  test('should allow to bulk action on selected credentials', async () => {
    // mock cache issues will cause these tests to randomly fail. Will fix later.
    const deleteByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      credentials: {
        get: getCredentials,
        delete: deleteByIds,
        export: exportByIds,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting},
    };

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
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select an credential
    const tableBody = getTableBody();
    const inputs = getCheckBoxes(tableBody);
    await clickElement(inputs[1]);

    // export selected credential
    const exportIcon = screen.getAllByTitle('Export selection')[0];
    await clickElement(exportIcon);
    expect(exportByIds).toHaveBeenCalled();

    // move selected credential to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan')[0];
    await clickElement(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByIds);
  });

  test('should allow to bulk action on filtered credentials', async () => {
    // mock cache issues will cause these tests to randomly fail. Will fix later.
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      credentials: {
        get: getCredentials,
        deleteByFilter,
        exportByFilter,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting},
    };

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
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered credentials
    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    await clickElement(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered credentials to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan')[0];
    await clickElement(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });
});

describe('CredentialPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleCredentialCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onCredentialCreateClick={handleCredentialCreateClick} />,
    );

    const links = element.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Credentials')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-credentials',
    );
  });

  test('should call click handlers', () => {
    const handleCredentialCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons onCredentialCreateClick={handleCredentialCreateClick} />,
    );

    const newIcon = screen.getAllByTitle('New Credential');

    expect(newIcon[0]).toBeInTheDocument();

    fireEvent.click(newIcon[0]);
    expect(handleCredentialCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleCredentialCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    const {queryAllByTestId} = render(
      <ToolBarIcons onCredentialCreateClick={handleCredentialCreateClick} />,
    );

    const icons = queryAllByTestId('svg-icon'); // this test is probably appropriate to keep in the old format
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Credentials');
  });
});
