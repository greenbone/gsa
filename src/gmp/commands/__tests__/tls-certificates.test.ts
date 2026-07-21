/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  createAggregatesResponse,
  createEntitiesResponse,
  createHttp,
} from 'gmp/commands/testing';
import TlsCertificatesCommand from 'gmp/commands/tls-certificates';
import {ALL_FILTER} from 'gmp/models/filter';
import BaseFilter from 'gmp/models/filter/base-filter';
import TlsCertificate from 'gmp/models/tls-certificate';

describe('TlsCertificatesCommand tests', () => {
  test('should fetch all TLS certificates', async () => {
    const response = createEntitiesResponse('tls_certificate', [
      {
        _id: '1',
        certificate: {
          __text: 'foo',
        },
      },
      {
        _id: '2',
        certificate: {
          __text: 'bar',
        },
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificatesCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tls_certificates',
        filter: ALL_FILTER.toFilterString(),
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should fetch TLS certificates with default params', async () => {
    const response = createEntitiesResponse('tls_certificate', [
      {
        _id: '1',
        certificate: {
          __text: 'foo',
        },
      },
      {
        _id: '2',
        certificate: {
          __text: 'foo',
        },
      },
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tls_certificates',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should fetch TLS certificates with custom params', async () => {
    const response = createEntitiesResponse('tls_certificate', [
      {
        _id: '1',
        certificate: {
          __text: 'foo',
        },
      },
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get({filter: "certificate='foo'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tls_certificates',
        filter: "certificate='foo'",
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(1);
  });

  test('should fetch time status aggregates for TLS certificates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 'valid', count: 15},
        {value: 'expired', count: 8},
      ],
    });
    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificatesCommand(fakeHttp);
    const result = await cmd.getTimeStatusAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'tls_certificate',
        group_column: 'time_status',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 'valid', count: 15},
        {value: 'expired', count: 8},
      ],
    });
  });

  test('should fetch modified aggregates for TLS certificates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: '2024-01-01', count: 5},
        {value: '2024-02-01', count: 3},
      ],
    });
    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificatesCommand(fakeHttp);
    const result = await cmd.getModifiedAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'tls_certificate',
        group_column: 'modified',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: '2024-01-01', count: 5},
        {value: '2024-02-01', count: 3},
      ],
    });
  });

  test('should allow to export TLS certificates by filter', async () => {
    const response = createEntitiesResponse('tls_certificate', []);
    const fakeHttp = createHttp(response);

    const filter = BaseFilter.fromString("certificate='foo'");

    const cmd = new TlsCertificatesCommand(fakeHttp);
    await cmd.exportByFilter(filter);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'tls_certificate',
        bulk_select: 0,
        filter: "certificate='foo'",
      },
    });
  });

  test('should allow to export TLS certificates by ids', async () => {
    const response = createEntitiesResponse('tls_certificate', []);
    const fakeHttp = createHttp(response);

    const cmd = new TlsCertificatesCommand(fakeHttp);

    const ids = ['123', '456'];

    await cmd.exportByIds(ids);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'tls_certificate',
        bulk_select: 1,
      },
    });
  });

  test('should allow to export TLS certificates', async () => {
    const response = createEntitiesResponse('tls_certificate', []);
    const fakeHttp = createHttp(response);

    const cmd = new TlsCertificatesCommand(fakeHttp);

    const entities = [
      new TlsCertificate({id: '123'}),
      new TlsCertificate({id: '456'}),
    ];

    await cmd.export(entities);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'tls_certificate',
        bulk_select: 1,
      },
    });
  });

  test('should allow to delete TLS certificates by ids', async () => {
    const response = createEntitiesResponse('tls_certificate', []);
    const fakeHttp = createHttp(response);

    const cmd = new TlsCertificatesCommand(fakeHttp);

    const ids = ['123', '456'];

    const result = await cmd.deleteByIds(ids);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_delete',
        resource_type: 'tls_certificate',
      },
    });
    expect(result.data).toEqual(ids);
  });

  test('should allow to delete TLS certificates', async () => {
    const response = createEntitiesResponse('tls_certificate', []);
    const fakeHttp = createHttp(response);

    const cmd = new TlsCertificatesCommand(fakeHttp);

    const entities = [
      new TlsCertificate({id: '123'}),
      new TlsCertificate({id: '456'}),
    ];

    const result = await cmd.delete(entities);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_delete',
        resource_type: 'tls_certificate',
      },
    });
    expect(result.data).toEqual(entities);
  });
});
