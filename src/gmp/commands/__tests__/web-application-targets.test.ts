/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import WebApplicationTargetsCommand from 'gmp/commands/web-application-targets';
import {
  createEntitiesResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import WebApplicationTarget from 'gmp/models/web-application-target';

describe('WebApplicationTargetsCommand tests', () => {
  test('should fetch web application targets', async () => {
    const response = createEntitiesResponse('web_application_target', [
      {
        _id: 'wat-1',
        name: 'First target',
        urls: 'https://example.com,https://www.example.com',
        exclude_urls: 'https://example.com/admin',
        reverse_lookup_only: '1',
        reverse_lookup_unify: '0',
      },
      {
        _id: 'wat-2',
        name: 'Second target',
        urls: 'https://test.example.com',
      },
    ]);
    const http = createHttp(response);
    const command = new WebApplicationTargetsCommand(http);

    const result = await command.get();

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_web_application_targets'},
    });
    expect(result.data).toEqual([
      new WebApplicationTarget({
        id: 'wat-1',
        name: 'First target',
        urls: ['https://example.com', 'https://www.example.com'],
        excludeUrls: ['https://example.com/admin'],
        reverseLookupOnly: true,
        reverseLookupUnify: false,
      }),
      new WebApplicationTarget({
        id: 'wat-2',
        name: 'Second target',
        urls: ['https://test.example.com'],
        excludeUrls: [],
        reverseLookupOnly: false,
        reverseLookupUnify: false,
      }),
    ]);
  });

  test('should fetch targets with a custom filter', async () => {
    const response = createEntitiesResponse('web_application_target', [
      {_id: 'wat-3', name: 'Filtered target'},
    ]);
    const http = createHttp(response);
    const command = new WebApplicationTargetsCommand(http);

    const result = await command.get({filter: "name='Filtered target'"});

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_web_application_targets',
        filter: "name='Filtered target'",
      },
    });
    expect(result.data[0].id).toBe('wat-3');
  });

  test('should fetch all web application targets', async () => {
    const response = createEntitiesResponse('web_application_target', [
      {_id: 'wat-4', name: 'Target'},
    ]);
    const http = createHttp(response);
    const command = new WebApplicationTargetsCommand(http);

    await command.getAll();

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_web_application_targets',
        filter: 'first=1 rows=-1',
      },
    });
  });

  test('should export targets by their ids', async () => {
    const http = createHttp(createResponse({success: true}));
    const command = new WebApplicationTargetsCommand(http);

    await command.exportByIds(['wat-1', 'wat-2']);

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'web_application_target',
        bulk_select: 1,
        'bulk_selected:wat-1': 1,
        'bulk_selected:wat-2': 1,
      },
    });
  });
});
