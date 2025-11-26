/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, fireEvent, wait} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Credential, {
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import CredentialDetailsPage from 'web/pages/credentials/CredentialDetailsPage';
import {entityLoadingActions} from 'web/store/entities/credentials';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const reloadInterval = -1;
const manualUrl = 'test/';

const credential = Credential.fromElement({
  _id: '6575',
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'some comment',
  in_use: 0,
  login: '',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  type: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  writable: 1,
});

const createGmp = ({
  cloneCredentialResponse = {data: {id: 'foo'}},
  downloadCredentialResponse = {data: 'credential-data'},
  exportCredentialResponse = {data: 'some-data'},
  getCredentialResponse = {data: credential},
  cloneCredential = testing.fn().mockResolvedValue(cloneCredentialResponse),
  deleteCredential = testing.fn().mockResolvedValue(undefined),
  downloadCredential = testing
    .fn()
    .mockResolvedValue(downloadCredentialResponse),
  exportCredential = testing.fn().mockResolvedValue(exportCredentialResponse),
  getCredential = testing.fn().mockResolvedValue(getCredentialResponse),
} = {}) => {
  return {
    credential: {
      clone: cloneCredential,
      delete: deleteCredential,
      download: downloadCredential,
      export: exportCredential,
      get: getCredential,
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

describe('CredentialDetailsPage tests', () => {
  test('should render full DetailsPage', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('6575', credential));

    render(<CredentialDetailsPage id="6575" />);

    expect(screen.getByTitle('Help: Credentials')).toBeInTheDocument();
    expect(screen.getByTitle('Credential List')).toBeInTheDocument();

    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-credentials',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/credentials',
    );

    const entityInfo = screen.getByTestId('entity-info');
    expect(entityInfo).toHaveTextContent('ID:6575');
    expect(entityInfo).toHaveTextContent(
      'Created:Wed, Dec 16, 2020 4:23 PM Central European Standard',
    );
    expect(entityInfo).toHaveTextContent(
      'Modified:Tue, Mar 2, 2021 11:28 AM Central European Standard',
    );
    expect(entityInfo).toHaveTextContent('Owner:admin');

    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^permissions/i}),
    ).toBeInTheDocument();

    expect(screen.getByRole('cell', {name: /^comment/i})).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {name: /^some comment/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: /^type/i})).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {name: /username \+ ssh key/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: /^login/i})).toBeInTheDocument();
  });

  test('should render user tags tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('6575', credential));

    const {container} = render(<CredentialDetailsPage id="6575" />);

    const userTagsTab = screen.getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('6575', credential));

    const {container} = render(<CredentialDetailsPage id="6575" />);

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

    store.dispatch(entityLoadingActions.success('6575', credential));

    render(<CredentialDetailsPage id="6575" />);

    const cloneIcon = screen.getByTitle('Clone Credential');
    fireEvent.click(cloneIcon);
    expect(gmp.credential.clone).toHaveBeenCalledWith(credential);

    const exportIcon = screen.getByTitle('Export Credential as XML');
    fireEvent.click(exportIcon);
    expect(gmp.credential.export).toHaveBeenCalledWith({id: credential.id});

    const deleteIcon = screen.getByTitle('Move Credential to trashcan');
    fireEvent.click(deleteIcon);
    expect(gmp.credential.delete).toHaveBeenCalledWith({id: credential.id});

    const downloadDebIcon = screen.getByTitle('Download Debian (.deb) Package');
    fireEvent.click(downloadDebIcon);
    expect(gmp.credential.download).toHaveBeenCalledWith(
      {id: credential.id},
      'deb',
    );

    const downloadRpmIcon = screen.getByTitle('Download RPM (.rpm) Package');
    fireEvent.click(downloadRpmIcon);
    expect(gmp.credential.download).toHaveBeenCalledWith(
      {id: credential.id},
      'rpm',
    );

    const downloadPublicKeyIcon = screen.getByTitle('Download Public Key');
    fireEvent.click(downloadPublicKeyIcon);
    expect(gmp.credential.download).toHaveBeenCalledWith(
      {id: credential.id},
      'key',
    );
  });

  test('should navigate to cloned credential after clone', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      showLocation: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('6575', credential));

    render(<CredentialDetailsPage id="6575" />);

    const cloneIcon = screen.getByTitle('Clone Credential');
    fireEvent.click(cloneIcon);

    await wait();
    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/credential/foo',
    );
  });

  test('should navigate to credentials list after delete', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      showLocation: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('6575', credential));

    render(<CredentialDetailsPage id="6575" />);

    const deleteIcon = screen.getByTitle('Move Credential to trashcan');
    fireEvent.click(deleteIcon);

    await wait();
    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/credentials',
    );
  });
});
