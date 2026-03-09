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

  test('should save a scanner', async () => {
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

  test('should remove a credential when saving a scanner', async () => {
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
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_scanner',
        ca_pub: 'updated-ca-pub',
        credential_id: '',
        scanner_id: '123',
        name: 'Updated Scanner',
        comment: 'Updated comment',
        scanner_host: '127.0.0.1',
        scanner_type: OPENVASD_SCANNER_TYPE,
        port: 9390,
      },
    });
  });

  test('should remove ca cert when saving a scanner', async () => {
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
      credentialId: '123',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_scanner',
        ca_pub: '',
        credential_id: '123',
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

  test('should allow to get scanner without details by default', async () => {
    const response = createEntityResponse('scanner', {
      id: '123',
      name: 'Test Scanner',
      type: OPENVASD_SCANNER_TYPE,
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    const result = await cmd.get({id: '123'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_scanner',
        scanner_id: '123',
        details: '1',
      },
    });
    expect(result.data).toEqual(
      new Scanner({
        id: '123',
        name: 'Test Scanner',
        scannerType: OPENVASD_SCANNER_TYPE,
      }),
    );
  });

  test('should allow to get scanner with details when requested', async () => {
    const response = createEntityResponse('scanner', {
      id: '123',
      name: 'Test Scanner',
      type: OPENVASD_SCANNER_TYPE,
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    const result = await cmd.get({id: '123'}, {details: true});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_scanner',
        scanner_id: '123',
        details: '1',
      },
    });
    expect(result.data).toEqual(
      new Scanner({
        id: '123',
        name: 'Test Scanner',
        scannerType: OPENVASD_SCANNER_TYPE,
      }),
    );
  });

  test('should allow to get scanner explicitly without details', async () => {
    const response = createEntityResponse('scanner', {
      id: '123',
      name: 'Test Scanner',
      type: OPENVASD_SCANNER_TYPE,
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    const result = await cmd.get({id: '123'}, {details: false});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_scanner',
        scanner_id: '123',
        details: '1',
      },
    });
    expect(result.data).toEqual(
      new Scanner({
        id: '123',
        name: 'Test Scanner',
        scannerType: OPENVASD_SCANNER_TYPE,
      }),
    );
  });

  test('should modify agent control config with all parameters', async () => {
    const response = createActionResultResponse({
      action: 'modify_agent_control_scan_config',
      id: '123',
      message: 'Config updated successfully',
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    await cmd.modifyAgentControlConfig({
      id: '123',
      attempts: 3,
      delayInSeconds: 10,
      maxJitterInSeconds: 5,
      bulkSize: 100,
      bulkThrottleTimeInMs: 500,
      indexerDirDepth: 3,
      schedulerCronTimes: ['0 0 * * *', '0 12 * * *'],
      intervalInSeconds: 60,
      missUntilInactive: 3,
      updateToLatest: 1,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent_control_scan_config',
        agent_control_id: '123',
        attempts: 3,
        delay_in_seconds: 10,
        max_jitter_in_seconds: 5,
        bulk_size: 100,
        bulk_throttle_time_in_ms: 500,
        indexer_dir_depth: 3,
        'scheduler_cron_times:': '0 0 * * *,0 12 * * *',
        interval_in_seconds: 60,
        miss_until_inactive: 3,
        update_to_latest: 1,
      },
    });
  });

  test('should modify agent control config with partial parameters', async () => {
    const response = createActionResultResponse({
      action: 'modify_agent_control_scan_config',
      id: '123',
      message: 'Config updated successfully',
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    await cmd.modifyAgentControlConfig({
      id: '123',
      attempts: 5,
      schedulerCronTimes: ['0 2 * * *'],
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent_control_scan_config',
        agent_control_id: '123',
        attempts: 5,
        'scheduler_cron_times:': '0 2 * * *',
      },
    });
  });

  test('should modify agent control config without scheduler cron times if empty', async () => {
    const response = createActionResultResponse({
      action: 'modify_agent_control_scan_config',
      id: '123',
      message: 'Config updated successfully',
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScannerCommand(fakeHttp);
    await cmd.modifyAgentControlConfig({
      id: '123',
      attempts: 5,
      schedulerCronTimes: [],
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'modify_agent_control_scan_config',
        agent_control_id: '123',
        attempts: 5,
      },
    });
  });
});
