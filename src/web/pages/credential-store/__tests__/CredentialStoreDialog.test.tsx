/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {changeInputValue, fireEvent, render, screen, within} from 'web/testing';
import CredentialStoreDialog from 'web/pages/credential-store/CredentialStoreDialog';

describe('CredentialStoreDialog tests', () => {
  test('should render without issues and close', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<CredentialStoreDialog onClose={onClose} onSave={onSave} />);

    screen.getByText('Edit Credential Store');

    const close = screen.getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onSave when save button is clicked with default values', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<CredentialStoreDialog onClose={onClose} onSave={onSave} />);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      active: true,
      appId: '',
      comment: '',
      host: '',
      path: '',
      port: '',
      passphrase: '',
    });
  });

  test('should allow to change fields and upload a file', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<CredentialStoreDialog onClose={onClose} onSave={onSave} />);

    const dialog = within(screen.getDialog());

    const appIdInput = dialog.getByName('appId');
    changeInputValue(appIdInput, 'my-app');

    const hostInput = dialog.getByName('host');
    changeInputValue(hostInput, 'example.com');

    const pathInput = dialog.getByName('path');
    changeInputValue(pathInput, '/path');

    const portInput = dialog.getByName('port');
    changeInputValue(portInput, '1234');

    const commentInput = dialog.getByName('comment');
    changeInputValue(commentInput, 'some comment');

    const passphraseInput = dialog.getByName('passphrase');
    changeInputValue(passphraseInput, 'secret');

    // toggle active checkbox (initially true -> after click should be false)
    const activeCheckbox = dialog.getByLabelText('Active');
    fireEvent.click(activeCheckbox);

    // upload a client certificate file
    const file = new File(['cert'], 'cert.pem', {
      type: 'application/x-pem-file',
    });
    const clientCertInput = dialog.getByName('clientCertificate');
    fireEvent.change(clientCertInput, {target: {files: [file]}});

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      active: false,
      appId: 'my-app',
      comment: 'some comment',
      host: 'example.com',
      path: '/path',
      port: '1234',
      passphrase: 'secret',
      clientCertificate: file,
    });
  });

  test('should save provided initial props', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <CredentialStoreDialog
        active={false}
        appId="pre-app"
        comment="pre-comment"
        host="pre-host"
        path="pre-path"
        port="999"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      active: false,
      appId: 'pre-app',
      comment: 'pre-comment',
      host: 'pre-host',
      path: 'pre-path',
      port: '999',
      passphrase: '',
    });
  });

  test('should upload multiple file inputs and save them', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<CredentialStoreDialog onClose={onClose} onSave={onSave} />);

    const key = new File(['key'], 'key.pem', {type: 'application/x-pem-file'});
    const p12 = new File(['p12'], 'file.p12', {type: 'application/x-pkcs12'});
    const ca = new File(['ca'], 'ca.pem', {type: 'application/x-pem-file'});

    const clientKeyInput = screen.getByName('clientKey');
    fireEvent.change(clientKeyInput, {target: {files: [key]}});

    const pkcs12Input = screen.getByName('pkcs12File');
    fireEvent.change(pkcs12Input, {target: {files: [p12]}});

    const serverCaInput = screen.getByName('serverCaCertificate');
    fireEvent.change(serverCaInput, {target: {files: [ca]}});

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      active: true,
      appId: '',
      comment: '',
      host: '',
      path: '',
      port: '',
      passphrase: '',
      clientKey: key,
      pkcs12File: p12,
      serverCaCertificate: ca,
    });
  });
});
