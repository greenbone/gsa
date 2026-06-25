/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import PortListsCommand from 'gmp/commands/port-lists';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import PortList from 'gmp/models/port-list';

describe('PortListsCommand tests', () => {
  test('should fetch port lists with default params', async () => {
    const response = createEntitiesResponse('port_list', [
      {_id: '1', name: 'PL-Default'},
      {_id: '2', name: 'PL-Custom'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new PortListsCommand(fakeHttp);
    const result = await cmd.get();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_port_lists'},
    });
    expect(result.data).toEqual([
      new PortList({id: '1', name: 'PL-Default'}),
      new PortList({id: '2', name: 'PL-Custom'}),
    ]);
  });

  test('should fetch port lists with custom params', async () => {
    const response = createEntitiesResponse('port_list', [
      {_id: '3', name: 'PL-Filtered'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new PortListsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='PL-Filtered'"});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_port_lists', filter: "name='PL-Filtered'"},
    });
    expect(result.data).toEqual([new PortList({id: '3', name: 'PL-Filtered'})]);
  });

  test('should fetch all port lists', async () => {
    const response = createEntitiesResponse('port_list', [
      {_id: '4', name: 'PL-A'},
      {_id: '5', name: 'PL-B'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new PortListsCommand(fakeHttp);
    const result = await cmd.getAll();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_port_lists', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new PortList({id: '4', name: 'PL-A'}),
      new PortList({id: '5', name: 'PL-B'}),
    ]);
  });
});
