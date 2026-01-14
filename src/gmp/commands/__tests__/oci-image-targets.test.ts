/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import OciImageTargetsCommand from 'gmp/commands/oci-image-targets';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import OciImageTarget from 'gmp/models/oci-image-target';

describe('OciImageTargetsCommand tests', () => {
  test('should fetch oci image targets with default params', async () => {
    const response = createEntitiesResponse('oci_image_target', [
      {_id: '1', name: 'Target1'},
      {_id: '2', name: 'Target2'},
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new OciImageTargetsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_oci_image_targets'},
    });
    expect(result.data).toEqual([
      new OciImageTarget({id: '1', name: 'Target1'}),
      new OciImageTarget({id: '2', name: 'Target2'}),
    ]);
  });

  test('should fetch oci image targets with custom filter', async () => {
    const response = createEntitiesResponse('oci_image_target', [
      {_id: '3', name: 'Target3'},
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new OciImageTargetsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Target3'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_oci_image_targets',
        filter: "name='Target3'",
      },
    });
    expect(result.data).toEqual([
      new OciImageTarget({id: '3', name: 'Target3'}),
    ]);
  });

  test('should fetch all oci image targets', async () => {
    const response = createEntitiesResponse('oci_image_target', [
      {_id: '4', name: 'Target4'},
      {_id: '5', name: 'Target5'},
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new OciImageTargetsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_oci_image_targets', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new OciImageTarget({id: '4', name: 'Target4'}),
      new OciImageTarget({id: '5', name: 'Target5'}),
    ]);
  });
});
