/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  createActionResultResponse,
  createEntitiesResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import {
  TlsCertificateCommand,
  TlsCertificatesCommand,
} from 'gmp/commands/tls-certificates';
import {ALL_FILTER} from 'gmp/models/filter';

describe('TlsCertificateCommand tests', () => {
  test('should return a single TLS certificate', async () => {
    const response = createEntityResponse('tls_certificate', {
      _id: 'foo',
      certificate: {__text: 'lorem'},
    });
    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificateCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tls_certificate',
        tls_certificate_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should delete a TLS certificate', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificateCommand(fakeHttp);
    await cmd.delete({
      id: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_tls_certificate',
        tls_certificate_id: 'foo',
      },
    });
  });

  test('should export a TLS certificate', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new TlsCertificateCommand(fakeHttp);
    await cmd.export({
      id: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'tls_certificate',
        bulk_select: 1,
        'bulk_selected:foo': 1,
      },
    });
  });
});

describe('TlsCertificatesCommand tests', () => {
  test('should return all TLS certificates', async () => {
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

  test('should return TLS certificates', async () => {
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
});
