/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import WebApplicationTargetCommand from 'gmp/commands/web-application-target';
import {type Element} from 'gmp/models/model';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

// Helper to create the correct XML structure for get response
const createWebApplicationTargetResponse = (data: Element) =>
  createEntityResponse('web_application_target', data, {
    getName: 'get_web_application_target',
    responseName: 'get_web_application_target_response',
  });

describe('WebApplicationTargetCommand tests', () => {
  test('should allow to get a web application target', async () => {
    const entityResponse = createWebApplicationTargetResponse({id: 'wat-123'});
    const http = createHttp(entityResponse);
    const command = new WebApplicationTargetCommand(http);
    const result = await command.get({id: 'wat-123'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_web_application_target',
        web_application_target_id: 'wat-123',
      },
    });
    expect(result.data.id).toEqual('wat-123');
  });

  test('should allow to create a web application target', async () => {
    const entityResponse = createActionResultResponse({id: 'wat-456'});
    const http = createHttp(entityResponse);
    const command = new WebApplicationTargetCommand(http);
    const result = await command.create({
      name: 'New Target',
      comment: 'A new target',
      urls: 'https://example.com,https://test.com',
      excludeUrls: 'https://exclude.com',
      credentialId: 'cred-1',
      reverseLookupOnly: false,
      reverseLookupUnify: true,
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_web_application_target',
        name: 'New Target',
        comment: 'A new target',
        copy: undefined,
        target_source: 'manual',
        urls: 'https://example.com,https://test.com',
        target_exclude_source: 'manual',
        exclude_urls: 'https://exclude.com',
        credential_id: 'cred-1',
        reverse_lookup_only: NO_VALUE,
        reverse_lookup_unify: YES_VALUE,
      },
    });
    expect(result.data.id).toEqual('wat-456');
  });

  test('should allow to create a web application target without optional fields', async () => {
    const entityResponse = createActionResultResponse({id: 'wat-789'});
    const http = createHttp(entityResponse);
    const command = new WebApplicationTargetCommand(http);
    await command.create({
      name: 'Minimal Target',
      urls: 'https://example.com',
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_web_application_target',
        name: 'Minimal Target',
        comment: undefined,
        copy: undefined,
        target_source: 'manual',
        urls: 'https://example.com',
        target_exclude_source: undefined,
        exclude_urls: undefined,
        credential_id: undefined,
        reverse_lookup_only: NO_VALUE,
        reverse_lookup_unify: NO_VALUE,
      },
    });
  });

  test('should allow to save a web application target', async () => {
    const entityResponse = createActionResultResponse({id: 'wat-123'});
    const http = createHttp(entityResponse);
    const command = new WebApplicationTargetCommand(http);
    const result = await command.save({
      id: 'wat-123',
      name: 'Updated Target',
      comment: 'Updated comment',
      urls: 'https://updated.com',
      excludeUrls: 'https://exclude.com',
      credentialId: 'cred-2',
      reverseLookupOnly: true,
      reverseLookupUnify: false,
      inUse: true,
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_web_application_target',
        web_application_target_id: 'wat-123',
        name: 'Updated Target',
        comment: 'Updated comment',
        target_source: 'manual',
        urls: 'https://updated.com',
        target_exclude_source: 'manual',
        exclude_urls: 'https://exclude.com',
        credential_id: 'cred-2',
        reverse_lookup_only: YES_VALUE,
        reverse_lookup_unify: NO_VALUE,
        in_use: YES_VALUE,
      },
    });
    expect(result.data.id).toEqual('wat-123');
  });

  test('should omit exclude_url when not provided in save', async () => {
    const entityResponse = createActionResultResponse({id: 'wat-123'});
    const http = createHttp(entityResponse);
    const command = new WebApplicationTargetCommand(http);
    await command.save({
      id: 'wat-123',
      urls: 'https://example.com',
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: expect.objectContaining({
        exclude_urls: undefined,
        target_exclude_source: undefined,
      }),
    });
  });
});
