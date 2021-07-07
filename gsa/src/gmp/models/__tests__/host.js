/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import Asset from 'gmp/models/asset';
import Host from 'gmp/models/host';
import {testModel} from 'gmp/models/testing';

import {parseDate} from 'gmp/parser';

/* eslint-disable max-len */

testModel(Host, 'host');

describe('Host model tests', () => {
  test('should be instance of Asset', () => {
    const host = Host.fromElement({});

    expect(host).toBeInstanceOf(Asset);
  });

  test('should parse severity', () => {
    const elem = {
      host: {
        severity: {
          value: '8.5',
        },
      },
    };
    const elem2 = {
      host: {
        severity: {
          value: '10',
        },
      },
    };
    const host = Host.fromElement(elem);
    const host2 = Host.fromElement(elem2);

    expect(host.severity).toEqual(8.5);
    expect(host2.severity).toEqual(10);
  });

  test('should parse Identifiers and always return an array', () => {
    const elem = {
      identifiers: {
        identifier: [
          {
            _id: '123abc',
            name: 'foo',
            value: 'bar:/3',
            creation_time: '2018-10-10T13:31:00+01:00',
            modification_time: '2018-10-10T13:32:00+01:00',
            source: {
              _id: '42xy',
              type: 'teip',
              data: 'ipsum',
              deleted: 0,
            },
            os: {
              title: 'teitl',
            },
          },
          {
            _id: '321abc',
            name: 'bar',
            value: 'foo:/3',
            creation_time: '2018-10-10T13:31:00+01:00',
            modification_time: '2018-10-10T13:32:00+01:00',
            source: {
              _id: '42yz',
              type: 'teip',
              data: 'ipsum',
              deleted: 1,
            },
            os: {
              title: 'teitl',
            },
          },
        ],
      },
    };
    const host = Host.fromElement(elem);
    const host2 = Host.fromElement({});
    const res = [
      {
        creationTime: parseDate('2018-10-10T13:31:00+01:00'),
        id: '123abc',
        modificationTime: parseDate('2018-10-10T13:32:00+01:00'),
        name: 'foo',
        os: {title: 'teitl'},
        source: {
          id: '42xy',
          source_type: 'teip',
          data: 'ipsum',
          deleted: false,
        },
        value: 'bar:/3',
      },
      {
        creationTime: parseDate('2018-10-10T13:31:00+01:00'),
        id: '321abc',
        modificationTime: parseDate('2018-10-10T13:32:00+01:00'),
        name: 'bar',
        os: {title: 'teitl'},
        source: {
          id: '42yz',
          source_type: 'teip',
          data: 'ipsum',
          deleted: true,
        },
        value: 'foo:/3',
      },
    ];
    expect(host.identifiers).toEqual(res);
    expect(host2.identifiers).toEqual([]);
  });

  test('should return hostname identifier, set alternative or undefined', () => {
    const elem = {
      identifiers: {
        identifier: [
          {
            name: 'hostname',
            value: 'foo',
          },
        ],
      },
    };
    const elem2 = {
      identifiers: {
        identifier: [
          {
            name: 'DNS-via-TargetDefinition',
            value: 'bar',
          },
        ],
      },
    };
    const elem3 = {
      identifiers: {
        identifier: [
          {
            name: 'notavailable',
            value: 'no',
          },
        ],
      },
    };
    const host = Host.fromElement(elem);
    const host2 = Host.fromElement(elem2);
    const host3 = Host.fromElement(elem3);

    expect(host.hostname).toEqual('foo');
    expect(host2.hostname).toEqual('bar');
    expect(host3.hostname).toBeUndefined();
  });

  test('should parse best_os_cpe', () => {
    const elem1 = {
      host: {
        detail: [
          {
            name: 'best_os_cpe',
            value: 'cpe:/foo/bar',
          },
        ],
      },
    };

    const elem2 = {
      identifiers: {
        identifier: [
          {
            name: 'OS',
            value: 'cpe:/foo/bar',
          },
        ],
      },
    };

    const elem3 = {
      identifiers: {
        identifier: [
          {
            name: 'notavailable',
            value: 'no',
          },
        ],
      },
    };

    const elem4 = {
      host: {
        severity: {
          value: '8.5',
        },
      },
    };

    const host1 = Host.fromElement(elem1);
    const host2 = Host.fromElement(elem2);
    const host3 = Host.fromElement(elem3);
    const host4 = Host.fromElement(elem4);

    expect(host1.os).toEqual('cpe:/foo/bar');
    expect(host2.os).toEqual('cpe:/foo/bar');
    expect(host3.os).toBeUndefined();
    expect(host4.os).toBeUndefined();
  });

  test('should return ip identifier', () => {
    const elem = {
      identifiers: {
        identifier: [
          {
            name: 'ip',
            value: '123.456.789.42',
          },
        ],
      },
    };
    const host = Host.fromElement(elem);

    expect(host.ip).toEqual('123.456.789.42');
  });

  test('should parse details', () => {
    const elem = {
      host: {
        detail: [
          {
            name: 'foo',
            value: 'c:/.2',
            source: {
              _id: '123abc',
            },
          },
          {
            name: 'bar',
            value: 'c:/.3',
            source: {
              _id: '42xy',
            },
          },
        ],
      },
    };
    const res = {
      foo: {
        source: {
          id: '123abc',
        },
        value: 'c:/.2',
      },
      bar: {
        source: {
          id: '42xy',
        },
        value: 'c:/.3',
      },
    };
    const host = Host.fromElement(elem);

    expect(host.details).toEqual(res);
  });

  test('should parse routes', () => {
    const elem = {
      host: {
        routes: {
          route: [
            {
              host: [
                {
                  _id: '123abc',
                  _distance: '0',
                  _same_source: '1',
                  ip: '123.456.789.42',
                },
              ],
            },
          ],
        },
      },
    };
    const res = [
      [
        {
          ip: '123.456.789.42',
          id: '123abc',
          distance: 0,
          same_source: 1,
        },
      ],
    ];
    const host = Host.fromElement(elem);

    expect(host.routes).toEqual(res);
  });

  test('should return empty array if no routes are given', () => {
    const host = Host.fromElement({});

    expect(host.routes).toEqual([]);
  });

  test('should delete host attribute', () => {
    const elem = {
      host: {},
    };
    const host = Host.fromElement(elem);

    expect(host.host).toBeUndefined();
  });
});
