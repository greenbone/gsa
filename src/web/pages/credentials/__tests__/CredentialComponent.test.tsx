/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {screen, rendererWith, wait, fireEvent} from 'web/testing';
import Response from 'gmp/http/response';
import Credential from 'gmp/models/credential';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import CredentialComponent from 'web/pages/credentials/CredentialComponent';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const defaultGetCredentialResponse = new Response(new Credential({id: '123'}));
const createGmp = ({
  cloneCredentialResponse = {id: '123'},
  createCredentialResponse = {id: '123'},
  deleteCredentialResponse = undefined,
  downloadCredentialResponse = {data: 'some-data'},
  downloadInstallerResponse = {data: 'some-data'},
  getCredentialResponse = defaultGetCredentialResponse,
  saveCredentialResponse = {id: '123'},
  cloneCredential = testing.fn().mockResolvedValue(cloneCredentialResponse),
  createCredential = testing.fn().mockResolvedValue(createCredentialResponse),
  deleteCredential = testing.fn().mockResolvedValue(deleteCredentialResponse),
  downloadCredential = testing
    .fn()
    .mockResolvedValue(downloadCredentialResponse),
  downloadInstaller = testing.fn().mockResolvedValue(downloadInstallerResponse),
  getCredential = testing.fn().mockResolvedValue(getCredentialResponse),
  saveCredential = testing.fn().mockResolvedValue(saveCredentialResponse),
} = {}) => {
  return {
    settings: {
      enableKrb5: true,
    },
    credential: {
      clone: cloneCredential,
      create: createCredential,
      delete: deleteCredential,
      download: downloadInstaller,
      export: downloadCredential,
      get: getCredential,
      save: saveCredential,
    },
    user: {
      currentSettings,
    },
  };
};

describe('CredentialComponent tests', () => {
  test('should render without crashing', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent>
        {() => <div>Some Content</div>}
      </CredentialComponent>,
    );
    await wait();
    expect(screen.getByText('Some Content')).toBeInTheDocument();
  });

  test('should open and close CredentialDialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </CredentialComponent>,
    );

    await wait();

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Credential')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('New Credential')).not.toBeInTheDocument();
  });

  test('should allow creating a new credential', async () => {
    const gmp = createGmp();
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </CredentialComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Credential')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByText('New Credential')).not.toBeInTheDocument();
    expect(onCreateError).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledWith({id: '123'});
  });

  test('should call onCreateError if creating a new credential fails', async () => {
    const error = new Error('error');
    const gmp = createGmp({
      createCredential: testing.fn().mockRejectedValue(error),
    });
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={create} />}
      </CredentialComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Credential')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    expect(screen.queryByText('New Credential')).not.toBeInTheDocument();
    expect(onCreateError).toHaveBeenCalledWith(error);
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('should call onSaveError if saving a credential fails', async () => {
    const credential = new Credential({id: '123', name: 'foo'});
    const credentialResponse = new Response(credential);
    const error = new Error('error');
    const gmp = createGmp({
      getCredentialResponse: credentialResponse,
      saveCredential: testing.fn().mockRejectedValue(error),
    });
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button data-testid="open" onClick={() => edit(credential)} />
        )}
      </CredentialComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('Edit Credential foo')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByText('Edit Credential foo')).not.toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should allow cloning a credential', async () => {
    const gmp = createGmp();
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new Credential({id: '123'}))}
          />
        )}
      </CredentialComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloneError).not.toHaveBeenCalled();
    expect(onCloned).toHaveBeenCalledExactlyOnceWith({id: '123'});
  });

  test('should call onCloneError when cloning a credential fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const gmp = createGmp({
      cloneCredential: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new Credential({id: '123'}))}
          />
        )}
      </CredentialComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloned).not.toHaveBeenCalled();
    expect(onCloneError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should allow deleting a credential', async () => {
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new Credential({id: '123'}))}
          />
        )}
      </CredentialComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleteError).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  test('should call onDeleteError when deleting a credential fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const gmp = createGmp({
      deleteCredential: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new Credential({id: '123'}))}
          />
        )}
      </CredentialComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onDeleteError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should allow downloading a credential', async () => {
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button
            data-testid="button"
            onClick={() => download(new Credential({id: '123'}))}
          />
        )}
      </CredentialComponent>,
    );
    await wait();

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloadError).not.toHaveBeenCalled();
    expect(onDownloaded).toHaveBeenCalledWith({
      data: 'some-data',
      filename: 'credential-123.xml',
    });
  });

  test('should call onDownloadError when downloading a credential fails', async () => {
    const error = new Error('error');
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const gmp = createGmp({
      downloadCredential: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button
            data-testid="button"
            onClick={() => download(new Credential({id: '123'}))}
          />
        )}
      </CredentialComponent>,
    );
    await wait();

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloaded).not.toHaveBeenCalled();
    expect(onDownloadError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should allow downloading a credential installer', async () => {
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent
        onInstallerDownloadError={onDownloadError}
        onInstallerDownloaded={onDownloaded}
      >
        {({downloadInstaller}) => (
          <Button
            data-testid="button"
            onClick={() =>
              downloadInstaller(new Credential({id: '123'}), 'rpm')
            }
          />
        )}
      </CredentialComponent>,
    );
    await wait();

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(gmp.credential.download).toHaveBeenCalledWith({id: '123'}, 'rpm');
    expect(onDownloadError).not.toHaveBeenCalled();
    expect(onDownloaded).toHaveBeenCalledWith({
      data: 'some-data',
      filename: 'credential-123.rpm',
    });
  });

  test('should call onInstallerDownloadError when downloading a credential installer fails', async () => {
    const error = new Error('error');
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const gmp = createGmp({
      downloadInstaller: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp});
    render(
      <CredentialComponent
        onInstallerDownloadError={onDownloadError}
        onInstallerDownloaded={onDownloaded}
      >
        {({downloadInstaller}) => (
          <Button
            data-testid="button"
            onClick={() =>
              downloadInstaller(new Credential({id: '123'}), 'rpm')
            }
          />
        )}
      </CredentialComponent>,
    );
    await wait();

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloaded).not.toHaveBeenCalled();
    expect(onDownloadError).toHaveBeenCalledExactlyOnceWith(error);
  });
});
