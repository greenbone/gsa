/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
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
