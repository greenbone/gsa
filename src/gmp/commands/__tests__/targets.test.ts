/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import TargetsCommand from 'gmp/commands/targets';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import Target from 'gmp/models/target';

describe('TargetsCommand tests', () => {
  test('should fetch targets with default params', async () => {
    const response = createEntitiesResponse('target', [
      {_id: '1', name: 'Target1'},
      {_id: '2', name: 'Target2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TargetsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_targets'},
    });
    expect(result.data).toEqual([
      new Target({id: '1', name: 'Target1'}),
      new Target({id: '2', name: 'Target2'}),
    ]);
  });

  test('should fetch targets with custom params', async () => {
    const response = createEntitiesResponse('target', [
      {_id: '3', name: 'Target3'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TargetsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Target3'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_targets', filter: "name='Target3'"},
    });
    expect(result.data).toEqual([new Target({id: '3', name: 'Target3'})]);
  });

  test('should fetch all targets', async () => {
    const response = createEntitiesResponse('target', [
      {_id: '4', name: 'Target4'},
      {_id: '5', name: 'Target5'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TargetsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_targets', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Target({id: '4', name: 'Target4'}),
      new Target({id: '5', name: 'Target5'}),
    ]);
  });
});
