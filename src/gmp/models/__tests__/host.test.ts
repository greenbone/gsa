/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Host from 'gmp/models/host';
import {testModel} from 'gmp/models/testing';
import {parseDate} from 'gmp/parser';

testModel(Host, 'host');

describe('Host model tests', () => {
  test('should use defaults', () => {
    const host = new Host();
    expect(host.details).toBeUndefined();
    expect(host.hostname).toBeUndefined();
    expect(host.identifiers).toEqual([]);
    expect(host.ip).toBeUndefined();
    expect(host.os).toBeUndefined();
    expect(host.routes).toEqual([]);
    expect(host.severity).toBeUndefined();
  });

  test('should parse empty element', () => {
    const host = Host.fromElement();
    expect(host.details).toBeUndefined();
    expect(host.hostname).toBeUndefined();
    expect(host.identifiers).toEqual([]);
    expect(host.ip).toBeUndefined();
    expect(host.os).toBeUndefined();
    expect(host.routes).toEqual([]);
    expect(host.severity).toBeUndefined();
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

  test('should parse identifiers', () => {
    const host = Host.fromElement({
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
              id: 'teitl',
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
              id: 'teitl',
            },
          },
        ],
      },
    });
    expect(host.identifiers).toEqual([
      {
        creationTime: parseDate('2018-10-10T13:31:00+01:00'),
        id: '123abc',
        modificationTime: parseDate('2018-10-10T13:32:00+01:00'),
        name: 'foo',
        os: {id: 'teitl'},
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
        os: {id: 'teitl'},
        source: {
          id: '42yz',
          source_type: 'teip',
          data: 'ipsum',
          deleted: true,
        },
        value: 'foo:/3',
      },
    ]);
  });

  test('should parse hostname', () => {
    const host = Host.fromElement({
      identifiers: {
        identifier: [
          {
            name: 'hostname',
            value: 'foo',
          },
        ],
      },
    });
    const host2 = Host.fromElement({
      identifiers: {
        identifier: [
          {
            name: 'DNS-via-TargetDefinition',
            value: 'bar',
          },
        ],
      },
    });

    expect(host.hostname).toEqual('foo');
    expect(host2.hostname).toEqual('bar');
  });

  test('should parse os', () => {
    const host1 = Host.fromElement({
      host: {
        detail: [
          {
            name: 'best_os_cpe',
            value: 'cpe:/foo/bar',
          },
        ],
      },
    });
    const host2 = Host.fromElement({
      identifiers: {
        identifier: [
          {
            name: 'OS',
            value: 'cpe:/foo/bar',
          },
        ],
      },
    });

    expect(host1.os).toEqual('cpe:/foo/bar');
    expect(host2.os).toEqual('cpe:/foo/bar');
  });

  test('should parse ip', () => {
    const host = Host.fromElement({
      identifiers: {
        identifier: [
          {
            name: 'ip',
            value: '123.456.789.42',
          },
        ],
      },
    });

    expect(host.ip).toEqual('123.456.789.42');
  });

  test('should parse details', () => {
    const host = Host.fromElement({
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
    });

    expect(host.details).toEqual({
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
    });
  });

  test('should parse routes', () => {
    const host = Host.fromElement({
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
    });

    expect(host.routes).toEqual([
      [
        {
          ip: '123.456.789.42',
          id: '123abc',
          distance: 0,
          same_source: 1,
        },
      ],
    ]);
  });
});
