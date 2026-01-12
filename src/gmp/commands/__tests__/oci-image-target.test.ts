/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import OciImageTargetCommand from 'gmp/commands/oci-image-target';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import {type Element} from 'gmp/models/model';
import {YES_VALUE} from 'gmp/parser';

// Helper to create the correct XML structure for get response
const createOciImageTargetResponse = (data: Element) =>
  createEntityResponse('oci_image_target', data, {
    getName: 'get_oci_image_target',
    responseName: 'get_oci_image_target_response',
  });

describe('OciImageTargetCommand tests', () => {
  test('should allow to get an oci image target', async () => {
    const entityResponse = createOciImageTargetResponse({id: 'oci-123'});
    const http = createHttp(entityResponse);
    const command = new OciImageTargetCommand(http);
    const result = await command.get({id: 'oci-123'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_oci_image_target', oci_image_target_id: 'oci-123'},
    });
    expect(result.data.id).toEqual('oci-123');
  });

  test('should allow to save an oci image target', async () => {
    const entityResponse = createActionResultResponse({id: 'oci-123'});
    const http = createHttp(entityResponse);
    const command = new OciImageTargetCommand(http);
    const result = await command.save({
      id: 'oci-123',
      name: 'Test Target',
      comment: 'Test comment',
      imageReferences: 'ref1,ref2',
      credentialId: 'cred-1',
      reverseLookupOnly: true,
      reverseLookupUnify: false,
      inUse: true,
      targetSource: 'src',
      targetExcludeSource: 'ex-src',
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_oci_image_target',
        oci_image_target_id: 'oci-123',
        name: 'Test Target',
        comment: 'Test comment',
        image_references: 'ref1,ref2',
        credential_id: 'cred-1',
        reverse_lookup_only: YES_VALUE,
        reverse_lookup_unify: 0,
        in_use: YES_VALUE,
        target_source: 'src',
        target_exclude_source: 'ex-src',
      },
    });
    expect(result.data.id).toEqual('oci-123');
  });

  test('should allow to create an oci image target', async () => {
    const entityResponse = createActionResultResponse({id: 'oci-456'});
    const http = createHttp(entityResponse);
    const command = new OciImageTargetCommand(http);
    const result = await command.create({
      name: 'New Target',
      comment: 'A new target',
      imageReferences: 'img1',
      credentialId: 'cred-2',
      hosts: 'host1',
      excludeHosts: 'host2',
      reverseLookupOnly: false,
      reverseLookupUnify: true,
      targetSource: 'src2',
      targetExcludeSource: 'ex-src2',
      file: 'file.txt',
      excludeFile: 'exfile.txt',
      hostsFilter: 'filter',
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_oci_image_target',
        name: 'New Target',
        comment: 'A new target',
        target_source: 'src2',
        target_exclude_source: 'ex-src2',
        hosts: 'host1',
        image_references: 'img1',
        exclude_hosts: 'host2',
        reverse_lookup_only: 0,
        reverse_lookup_unify: YES_VALUE,
        credential_id: 'cred-2',
        file: 'file.txt',
        exclude_file: 'exfile.txt',
        hosts_filter: 'filter',
      },
    });
    expect(result.data.id).toEqual('oci-456');
  });
});
