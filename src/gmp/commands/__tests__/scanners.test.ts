/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ScannersCommand from 'gmp/commands/scanners';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import Scanner, {
  OPENVAS_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';

describe('ScannersCommand tests', () => {
  test('should fetch with default params', async () => {
    const response = createEntitiesResponse('scanner', [
      {_id: '1', name: 'Scanner 1', type: OPENVASD_SCANNER_TYPE},
      {_id: '2', name: 'Scanner 2', type: OPENVAS_SCANNER_TYPE},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new ScannersCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_scanners'},
    });
    expect(result.data).toEqual([
      new Scanner({
        id: '1',
        name: 'Scanner 1',
        scannerType: OPENVASD_SCANNER_TYPE,
      }),
      new Scanner({
        id: '2',
        name: 'Scanner 2',
        scannerType: OPENVAS_SCANNER_TYPE,
      }),
    ]);
  });

  test('should fetch with custom params', async () => {
    const response = createEntitiesResponse('scanner', [
      {_id: '3', name: 'Scanner 1', type: OPENVASD_SCANNER_TYPE},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new ScannersCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Scanner 1'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_scanners', filter: "name='Scanner 1'"},
    });
    expect(result.data).toEqual([
      new Scanner({
        id: '3',
        name: 'Scanner 1',
        scannerType: OPENVASD_SCANNER_TYPE,
      }),
    ]);
  });

  test('should all roles', async () => {
    const response = createEntitiesResponse('scanner', [
      {_id: '4', name: 'Scanner 1', type: OPENVASD_SCANNER_TYPE},
      {_id: '5', name: 'Scanner 2', type: OPENVAS_SCANNER_TYPE},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new ScannersCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_scanners', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Scanner({
        id: '4',
        name: 'Scanner 1',
        scannerType: OPENVASD_SCANNER_TYPE,
      }),
      new Scanner({
        id: '5',
        name: 'Scanner 2',
        scannerType: OPENVAS_SCANNER_TYPE,
      }),
    ]);
  });
});
