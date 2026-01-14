/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CertBundAdvisoriesCommand from 'gmp/commands/cert-bund-advisories';
import {
  createAggregatesResponse,
  createHttp,
  createInfoEntitiesResponse,
} from 'gmp/commands/testing';
import CertBundAdv from 'gmp/models/cert-bund';

describe('CertBundAdvisoriesCommand tests', () => {
  test('should fetch cert bund advisories with default params', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        cert_bund_adv: {
          severity: 10.0,
        },
      },
      {
        _id: '2',
        name: 'User',
        cert_bund_adv: {
          severity: 5.0,
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CertBundAdvisoriesCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_info', info_type: 'cert_bund_adv'},
    });
    expect(result.data).toEqual([
      new CertBundAdv({
        id: '1',
        name: 'Admin',
        severity: 10.0,
      }),
      new CertBundAdv({
        id: '2',
        name: 'User',
        severity: 5.0,
      }),
    ]);
  });

  test('should fetch cert bund advisories with custom params', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        cert_bund_adv: {
          severity: 10.0,
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CertBundAdvisoriesCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Admin'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_info',
        info_type: 'cert_bund_adv',
        filter: "name='Admin'",
      },
    });
    expect(result.data).toEqual([
      new CertBundAdv({
        id: '1',
        name: 'Admin',
        severity: 10.0,
      }),
    ]);
  });

  test('should fetch all cert bund advisories', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        cert_bund_adv: {
          severity: 10.0,
        },
      },
      {
        _id: '2',
        name: 'User',
        cert_bund_adv: {
          severity: 5.0,
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CertBundAdvisoriesCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_info',
        info_type: 'cert_bund_adv',
        filter: 'first=1 rows=-1',
      },
    });
    expect(result.data).toEqual([
      new CertBundAdv({
        id: '1',
        name: 'Admin',
        severity: 10.0,
      }),
      new CertBundAdv({
        id: '2',
        name: 'User',
        severity: 5.0,
      }),
    ]);
  });

  test('should fetch severity aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new CertBundAdvisoriesCommand(fakeHttp);
    const result = await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'cert_bund_adv',
        group_column: 'severity',
        info_type: 'cert_bund_adv',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch created aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new CertBundAdvisoriesCommand(fakeHttp);
    const result = await cmd.getCreatedAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'cert_bund_adv',
        group_column: 'created',
        info_type: 'cert_bund_adv',
      },
    });
    expect(result.data).toEqual({groups: []});
  });
});
