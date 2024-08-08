/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {ALL_FILTER} from 'gmp/models/filter';

import defaults from 'gmp/http/transform/default';

import {
  createActionResultResponse,
  createEntitiesResponse,
  createEntityResponse,
  createHttp,
} from '../testing';
import {
  TlsCertificateCommand,
  TlsCertificatesCommand,
} from '../tlscertificates';

describe('TlsCertificateCommand tests', () => {
  test('should return a single TLS certificate', () => {
    const response = createEntityResponse('tls_certificate', {
      _id: 'foo',
      certificate: {__text: 'lorem'},
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TlsCertificateCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_tls_certificate',
          tls_certificate_id: 'foo',
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });

  test('should delete a TLS certificate', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TlsCertificateCommand(fakeHttp);
    return cmd
      .delete({
        id: 'foo',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'delete_tls_certificate',
            tls_certificate_id: 'foo',
          },
        });
      });
  });

  test('should export a TLS certificate', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TlsCertificateCommand(fakeHttp);
    return cmd
      .export({
        id: 'foo',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'bulk_export',
            resource_type: 'tls_certificate',
            bulk_select: 1,
            'bulk_selected:foo': 1,
          },
          transform: {
            ...defaults,
          },
        });
      });
  });
});

describe('TlsCertifcatesCommand tests', () => {
  test('should return all TLS certificates', () => {
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

    expect.hasAssertions();

    const cmd = new TlsCertificatesCommand(fakeHttp);
    return cmd.getAll().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_tls_certificates',
          filter: ALL_FILTER.toFilterString(),
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should return TLS certificates', () => {
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

    expect.hasAssertions();

    const cmd = new TlsCertificatesCommand(fakeHttp);
    return cmd.get().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_tls_certificates',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });
});
