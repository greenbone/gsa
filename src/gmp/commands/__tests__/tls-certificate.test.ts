/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';
import TlsCertificateCommand from 'gmp/commands/tls-certificate';

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
