/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  rendererWith,
  screen,
  wait,
  within,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import CredentialStore from 'gmp/models/credential-store';
import Filter from 'gmp/models/filter';
import CredentialStorePage from 'web/pages/credential-store/CredentialStorePage';

describe('CredentialStorePage tests', () => {
  test('should render credential store and allow editing and saving', async () => {
    const credentialStore = CredentialStore.fromElement({
      _id: 'cs1',
      name: 'Test Store',
      active: 1,
      host: 'h',
      path: 'p',
      port: '8080',
      version: '1.0',
      comment: 'c',
      preferences: {
        preference: [{name: 'app_id', value: 'initial-app'}],
      },
    });

    const get = testing.fn().mockResolvedValue({
      data: [credentialStore],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const modify = testing.fn().mockResolvedValue({});
    const verify = testing.fn().mockResolvedValue({});

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify, verify},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    await wait();

    // Table content (wait for async load)
    await screen.findByText('Credential Store');
    await screen.findByText('Test Store');
    await screen.findByText('h');
    await screen.findByText('p');
    await screen.findByText('8080');

    // open edit dialog
    const edit = await screen.findByTitle('Edit Credential Store');
    fireEvent.click(edit);

    // dialog opened with app id prefilled
    await screen.findByText('Edit Credential Store');
    const dialog = within(screen.getDialog());
    const appIdInput = dialog.getByName('appId');
    expect(appIdInput).toHaveValue('initial-app');

    changeInputValue(appIdInput, 'new-app');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    // wait for mutation to execute
    await wait();

    // mutate should be called with expected params (first arg only)
    expect(modify).toHaveBeenCalled();
    expect(modify.mock.calls[0][0]).toEqual({
      id: 'cs1',
      active: true,
      appId: 'new-app',
      comment: 'c',
      host: 'h',
      path: 'p',
      port: '8080',
      clientCertificate: undefined,
      clientKey: undefined,
      pkcs12File: undefined,
      passphrase: '',
      serverCaCertificate: undefined,
    });
  });

  test('should verify credential store connection successfully', async () => {
    const credentialStore = CredentialStore.fromElement({
      _id: 'cs1',
      name: 'Test Store',
      active: 1,
      host: 'h',
      path: 'p',
      port: '8080',
      version: '1.0',
      comment: 'c',
      preferences: {
        preference: [{name: 'app_id', value: 'initial-app'}],
      },
    });

    const get = testing.fn().mockResolvedValue({
      data: [credentialStore],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const modify = testing.fn().mockResolvedValue({});
    const verify = testing.fn().mockResolvedValue({});

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify, verify},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    await wait();

    // click test connection pill
    const testPill = await screen.findByTitle('Test Connection');
    fireEvent.click(testPill);

    // should call verify and show success
    await screen.findAllByText('Connection successful');
    expect(verify).toHaveBeenCalled();
    expect(verify.mock.calls[0][0]).toEqual({id: 'cs1'});
  });

  test('should not call verify and show failure when app_id missing', async () => {
    const credentialStore = CredentialStore.fromElement({
      _id: 'cs1',
      name: 'Test Store',
      active: 1,
      host: 'h',
      path: 'p',
      port: '8080',
      version: '1.0',
      comment: 'c',
      // no preferences
    });

    const get = testing.fn().mockResolvedValue({
      data: [credentialStore],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const modify = testing.fn().mockResolvedValue({});
    const verify = testing.fn().mockResolvedValue({});

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify, verify},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    await wait();

    const testPill = await screen.findByTitle('Test Connection');
    fireEvent.click(testPill);

    // should not call verify and should show connection failed
    await screen.findAllByText('Connection failed');
    expect(verify).not.toHaveBeenCalled();
  });

  test('should show failed when verification throws an error', async () => {
    const credentialStore = CredentialStore.fromElement({
      _id: 'cs1',
      name: 'Test Store',
      active: 1,
      host: 'h',
      path: 'p',
      port: '8080',
      version: '1.0',
      comment: 'c',
      preferences: {
        preference: [{name: 'app_id', value: 'initial-app'}],
      },
    });

    const get = testing.fn().mockResolvedValue({
      data: [credentialStore],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const modify = testing.fn().mockResolvedValue({});
    const verify = testing.fn().mockRejectedValue(new Error('boom'));

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify, verify},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    await wait();

    const testPill = await screen.findByTitle('Test Connection');
    fireEvent.click(testPill);

    // should call verify and show connection failed
    await screen.findAllByText('Connection failed');
    expect(verify).toHaveBeenCalled();
    expect(verify.mock.calls[0][0]).toEqual({id: 'cs1'});
  });

  test('should show error when credential store has no id on test', async () => {
    const credentialStore = CredentialStore.fromElement({
      name: 'No ID Store',
      active: 1,
      host: 'h',
      path: 'p',
      port: '8080',
      version: '1.0',
      comment: 'c',
    });

    const get = testing.fn().mockResolvedValue({
      data: [credentialStore],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const modify = testing.fn().mockResolvedValue({});
    const verify = testing.fn().mockResolvedValue({});

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify, verify},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    await wait();

    const testPill = await screen.findByTitle('Test Connection');
    fireEvent.click(testPill);

    // should not call verify and should show connection failed
    await screen.findAllByText('Connection failed');
    expect(verify).not.toHaveBeenCalled();
  });

  test('should not call modify when saving and credential store has no id', async () => {
    const credentialStore = CredentialStore.fromElement({
      name: 'No ID Store',
      active: 1,
      host: 'h',
      path: 'p',
      port: '8080',
      version: '1.0',
      comment: 'c',
    });

    const get = testing.fn().mockResolvedValue({
      data: [credentialStore],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const modify = testing.fn().mockResolvedValue({});
    const verify = testing.fn().mockResolvedValue({});

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify, verify},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    await wait();

    // open edit dialog
    const edit = await screen.findByTitle('Edit Credential Store');
    fireEvent.click(edit);

    // dialog opened
    await screen.findByText('Edit Credential Store');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    // ensure modify wasn't called due to missing id
    await wait();
    expect(modify).not.toHaveBeenCalled();
  });

  test('should render error state when fetching credential stores fails', async () => {
    const get = testing.fn().mockRejectedValue(new Error('fetch failed'));

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify: testing.fn(), verify: testing.fn()},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    // should render error message
    await screen.findByText('Error loading credential store: fetch failed');
  });

  test('should show no credential store configured message when none exist', async () => {
    const get = testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: Filter.fromString(), counts: new CollectionCounts()},
    });

    const gmp = {
      credentialstores: {get},
      credentialstore: {modify: testing.fn(), verify: testing.fn()},
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(<CredentialStorePage />);

    await screen.findByText('No credential store configured.');
  });
});
