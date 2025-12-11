/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ResourceNamesCommand from 'gmp/commands/resource-names';
import {createResponse, createHttp} from 'gmp/commands/testing';
import {type EntityType} from 'gmp/utils/entity-type';

const createResourceNamesResponse = ({
  type,
  resources,
}: {
  type: string;
  resources?: unknown;
}) =>
  createResponse({
    get_resource_names: {
      get_resource_names_response: {
        type,
        resource: resources,
      },
    },
  });

describe('ResourceNamesCommand tests', () => {
  test('should return resource names', async () => {
    const response = createResourceNamesResponse({
      type: 'task',
      resources: [
        {
          name: 'cpe:/o:canonical:ubuntu_linux:18.04',
          _id: '5b6b6aef-b320-42ca-899f-3161ee2a4195',
        },
        {
          name: 'cpe:/o:debian:debian_linux',
          _id: 'f2fa6833-fe34-4e04-a60c-6c5dc1ed0fcf',
        },
        {
          name: 'cpe:/o:microsoft:windows',
          _id: '19c091f0-a687-4dc3-b482-7d191ead4bb3',
        },
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new ResourceNamesCommand(fakeHttp);
    const resp = await cmd.getAll({resourceType: 'task'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_resource_names',
        filter: 'first=1 rows=-1',
        resource_type: 'task',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(3);
    expect(data[0].id).toEqual('5b6b6aef-b320-42ca-899f-3161ee2a4195');
    expect(data[0].name).toEqual('cpe:/o:canonical:ubuntu_linux:18.04');
    expect(data[0].type).toEqual('task');
    expect(data[1].id).toEqual('f2fa6833-fe34-4e04-a60c-6c5dc1ed0fcf');
    expect(data[1].name).toEqual('cpe:/o:debian:debian_linux');
    expect(data[1].type).toEqual('task');
    expect(data[2].id).toEqual('19c091f0-a687-4dc3-b482-7d191ead4bb3');
    expect(data[2].name).toEqual('cpe:/o:microsoft:windows');
    expect(data[2].type).toEqual('task');
  });

  test('should return names from one resource', async () => {
    const response = createResourceNamesResponse({
      type: 'filter',
      resources: {
        name: 'Filter_1',
        _id: 'b0059c62-ce13-4ef0-adb7-75a04757668b',
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new ResourceNamesCommand(fakeHttp);
    const resp = await cmd.getAll({resourceType: 'filter'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_resource_names',
        filter: 'first=1 rows=-1',
        resource_type: 'filter',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(1);
    expect(data[0].id).toEqual('b0059c62-ce13-4ef0-adb7-75a04757668b');
    expect(data[0].name).toEqual('Filter_1');
    expect(data[0].type).toEqual('filter');
  });

  test('should return no names', async () => {
    const response = createResourceNamesResponse({type: 'note'});
    const fakeHttp = createHttp(response);
    const cmd = new ResourceNamesCommand(fakeHttp);
    const resp = await cmd.getAll({resourceType: 'note'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_resource_names',
        filter: 'first=1 rows=-1',
        resource_type: 'note',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(0);
  });

  test.each([
    ['audit', 'audit'],
    ['auditreport', 'audit_report'],
    ['certbund', 'cert_bund_adv'],
    ['cpe', 'cpe'],
    ['cve', 'cve'],
    ['dfncert', 'dfn_cert_adv'],
    ['operatingsystem', 'os'],
    ['host', 'host'],
    ['nvt', 'nvt'],
    ['policy', 'policy'],
    ['scanconfig', 'config'],
  ])('should support resource type %s', async (entityType, resourceType) => {
    const response = createResourceNamesResponse({type: resourceType});
    const fakeHttp = createHttp(response);
    const cmd = new ResourceNamesCommand(fakeHttp);
    const resp = await cmd.get({resourceType: entityType as EntityType});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_resource_names',
        resource_type: resourceType,
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(0);
  });
});
