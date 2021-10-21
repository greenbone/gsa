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
import ReportTlsCertificate from '../tlscertificate';

describe('ReportTlsCertificate tests', () => {
  test('should init ports', () => {
    const cert1 = new ReportTlsCertificate();

    expect(cert1.ports).toBeDefined();
    expect(cert1.ports.length).toEqual(0);

    const cert2 = ReportTlsCertificate.fromElement();

    expect(cert2.ports).toBeDefined();
    expect(cert2.ports.length).toEqual(0);
  });

  test('should create new ReportTlsCertificate from fingerprint', () => {
    const cert = ReportTlsCertificate.fromElement({fingerprint: 'foo'});

    expect(cert.fingerprint).toEqual('foo');
    expect(cert.ports).toEqual([]);

    /* test properties which are set during parsing */
    expect(cert.port).toBeUndefined();
    expect(cert.ip).toBeUndefined();
    expect(cert.details).toBeUndefined();
    expect(cert.data).toBeUndefined();
    expect(cert._data).toBeUndefined();
    expect(cert.hostname).toBeUndefined();
  });

  test('should allow to set id data', () => {
    const cert = ReportTlsCertificate.fromElement({fingerprint: 'foo'});

    cert.ip = '1.2.3.4';
    cert.port = '123';

    expect(cert.id).toEqual('1.2.3.4:123:foo');
  });

  test('should allow to copy a tls certificate', () => {
    const cert = ReportTlsCertificate.fromElement({fingerprint: 'foo'});

    cert.ip = '1.2.3.4';
    cert.port = '123';
    cert.data = {foo: 'bar'};
    cert._data = {a: 1};
    cert.hostname = 'foo.bar';
    cert.details = {lorem: 2};

    const cert2 = cert.copy();

    expect(cert.ip).toEqual('1.2.3.4');
    expect(cert.port).toEqual('123');
    expect(cert.data).toEqual({foo: 'bar'});
    expect(cert._data).toEqual({a: 1});
    expect(cert.hostname).toEqual('foo.bar');
    expect(cert.details).toEqual({lorem: 2});
    expect(cert2.id).toEqual('1.2.3.4:123:foo');
  });

  test('should allow to add a port', () => {
    const cert = ReportTlsCertificate.fromElement({fingerprint: 'foo'});

    cert.ip = '1.2.3.4';
    cert.port = '123';

    expect(cert.id).toEqual('1.2.3.4:123:foo');

    cert.addPort('234');

    expect(cert.port).toEqual('123');
    expect(cert.ports.length).toEqual(1);
    expect(cert.ports[0]).toEqual(234);
  });
});
