/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ScannerCommand from 'gmp/commands/scanner';
import {
  createHttp,
  createActionResultResponse,
  createEntityResponse,
} from 'gmp/commands/testing';
import Scanner, {OPENVASD_SCANNER_TYPE} from 'gmp/models/scanner';

describe('ScannerCommand tests', () => {
  test('should send the correct data to create a scanner', async () => {
    const response = createActionResultResponse({
      action: 'create_scanner',
      id: '123',
      message: 'Scanner created successfully',
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    const result = await cmd.create({
      name: 'Test Scanner',
      host: '127.0.0.1',
      port: 9390,
      type: OPENVASD_SCANNER_TYPE,
      comment: 'Test comment',
      caCertificate: 'test-ca-pub' as unknown as File,
      credentialId: 'test-credential-id',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_scanner',
        name: 'Test Scanner',
        comment: 'Test comment',
        credential_id: 'test-credential-id',
        scanner_host: '127.0.0.1',
        scanner_type: OPENVASD_SCANNER_TYPE,
        port: 9390,
        ca_pub: 'test-ca-pub',
      },
    });
    expect(result.data.id).toEqual('123');
  });

  test('should send the correct data to save a scanner', async () => {
    const response = createActionResultResponse({
      action: 'save_scanner',
      id: '123',
      message: 'Scanner updated successfully',
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    await cmd.save({
      id: '123',
      name: 'Updated Scanner',
      host: '127.0.0.1',
      port: 9390,
      type: OPENVASD_SCANNER_TYPE,
      comment: 'Updated comment',
      caCertificate: 'updated-ca-pub' as unknown as File,
      credentialId: 'updated-credential-id',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_scanner',
        scanner_id: '123',
        name: 'Updated Scanner',
        comment: 'Updated comment',
        credential_id: 'updated-credential-id',
        scanner_host: '127.0.0.1',
        scanner_type: OPENVASD_SCANNER_TYPE,
        port: 9390,
        ca_pub: 'updated-ca-pub',
      },
    });
  });

  test('should allow to keep credential and cert unchanged when saving a scanner', async () => {
    const response = createActionResultResponse({
      action: 'save_scanner',
      id: '123',
      message: 'Scanner updated successfully',
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    await cmd.save({
      id: '123',
      name: 'Updated Scanner',
      host: '127.0.0.1',
      port: 9390,
      type: OPENVASD_SCANNER_TYPE,
      comment: 'Updated comment',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_scanner',
        ca_pub: undefined,
        credential_id: undefined,
        scanner_id: '123',
        name: 'Updated Scanner',
        comment: 'Updated comment',
        scanner_host: '127.0.0.1',
        scanner_type: OPENVASD_SCANNER_TYPE,
        port: 9390,
      },
    });
  });

  test('should send the correct data to verify a scanner', async () => {
    const response = createActionResultResponse({
      action: 'verify_scanner',
      id: '123',
      message: 'OK',
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    await cmd.verify({id: '123'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'verify_scanner',
        scanner_id: '123',
      },
    });
  });

  test('should allow to get scanner', async () => {
    const response = createEntityResponse('scanner', {
      id: '123',
      name: 'Test Scanner',
      type: OPENVASD_SCANNER_TYPE,
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    const result = await cmd.get({id: '123'});
    expect(result.data).toEqual(
      new Scanner({
        id: '123',
        name: 'Test Scanner',
        scannerType: OPENVASD_SCANNER_TYPE,
      }),
    );
  });
});
