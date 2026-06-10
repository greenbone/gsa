/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {
  createAggregatesResponse,
  createEntitiesResponse,
  createHttp,
} from 'gmp/commands/testing';
import VulnerabilitiesCommand from 'gmp/commands/vulnerabilities';

describe('VulnerabilitiesCommand tests', () => {
  test('should get vulnerabilities list', async () => {
    const response = createEntitiesResponse('vuln', [{_id: '123'}]);
    const fakeHttp = createHttp(response);
    const cmd = new VulnerabilitiesCommand(fakeHttp);

    const result = await cmd.get();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_vulns',
      },
    });
    expect(result.data[0].id).toEqual('123');
  });

  test('getSeverityAggregates should request vuln severity aggregates', async () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);
    const cmd = new VulnerabilitiesCommand(fakeHttp);

    await cmd.getSeverityAggregates();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'vuln',
        group_column: 'severity',
      },
    });
  });

  test('getHostAggregates should request vuln host aggregates', async () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);
    const cmd = new VulnerabilitiesCommand(fakeHttp);

    await cmd.getHostAggregates();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'vuln',
        group_column: 'hosts',
      },
    });
  });
});
