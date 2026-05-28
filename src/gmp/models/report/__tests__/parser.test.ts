/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {
  parseErrors,
  parseCvesFromEndpoint,
  parseClosedCvesFromEndpoint,
} from 'gmp/models/report/parser';

const emptyCollectionCounts = new CollectionCounts();

describe('parseErrors', () => {
  test('should parse errors', () => {
    const filter = Filter.fromString('foo=bar rows=5');
    const report = {
      results: {
        result: [
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: 5.5,
          },
          {
            host: {
              __text: '2.2.2.2',
            },
            severity: 9.5,
          },
        ],
      },
      host: [
        {
          ip: '1.1.1.1',
          detail: [
            {
              name: 'hostname',
              value: 'foo.bar',
            },
          ],
        },

        {
          ip: '2.2.2.2',
          detail: [
            {
              name: 'hostname',
              value: 'lorem.ipsum',
            },
          ],
        },
      ],
      errors: {
        count: 2,
        error: [
          {
            host: {
              __text: '1.1.1.1',
              asset: {_asset_id: '123'},
            },
            port: '123/tcp',
            description: 'This is an error.',
            nvt: {
              _oid: '314',
              name: 'NVT1',
            },
          },
          {
            host: {
              __text: '2.2.2.2',
            },
            port: '456/tcp',
            description: 'This is another error.',
            nvt: {
              _oid: '159',
              name: 'NVT2',
            },
          },
        ],
      },
    };

    const counts = {
      first: 1,
      all: 2,
      filtered: 2,
      length: 2,
      rows: 2,
      last: 2,
    };

    const errors = parseErrors(report, filter);

    expect(errors.entities.length).toEqual(2);
    expect(errors.counts).toEqual(counts);
    expect(errors.filter).toEqual(filter);

    const [error1, error2] = errors.entities;

    expect(error1.id).toEqual('1.1.1.1:314');
    expect(error1.description).toEqual('This is an error.');
    expect(error1.host?.ip).toEqual('1.1.1.1');
    expect(error1.host?.name).toEqual('foo.bar');
    expect(error1.host?.id).toEqual('123');
    expect(error1.nvt.id).toEqual('314');
    expect(error1.nvt.name).toEqual('NVT1');
    expect(error1.port).toEqual('123/tcp');

    expect(error2.id).toEqual('2.2.2.2:159');
    expect(error2.description).toEqual('This is another error.');
    expect(error2.host?.ip).toEqual('2.2.2.2');
    expect(error2.host?.name).toEqual('lorem.ipsum');
    expect(error2.host?.id).toEqual(undefined);
    expect(error2.nvt.id).toEqual('159');
    expect(error2.nvt.name).toEqual('NVT2');
    expect(error2.port).toEqual('456/tcp');
  });

  test('should parse empty errors', () => {
    const filter = Filter.fromString('foo=bar rows=5');
    const report = {};
    const errors = parseErrors(report, filter);

    expect(errors.entities.length).toEqual(0);
    expect(errors.counts).toEqual(emptyCollectionCounts);
    expect(errors.filter).toEqual(filter);
  });
});

describe('parseCvesFromEndpoint', () => {
  test('should parse multiple cve elements', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      cves: {
        cve: [
          {
            host: '192.168.1.1',
            name: 'CVE-2019-1234',
            nvt: {_oid: '1.2.3', name: 'TestNVT'},
            severity: 7.5,
            threat: 'High',
          },
          {
            host: '192.168.1.2',
            name: 'CVE-2020-5678',
            nvt: {_oid: '2.3.4', name: 'AnotherNVT'},
            severity: 5.0,
            threat: 'Medium',
          },
        ],
      },
    };

    const result = parseCvesFromEndpoint(data, filter);

    expect(result.entities).toHaveLength(2);
    expect(result.entities[0].cveId).toEqual('CVE-2019-1234');
    expect(result.entities[0].host.ip).toEqual('192.168.1.1');
    expect(result.entities[0].source?.name).toEqual('1.2.3');
    expect(result.entities[0].source?.description).toEqual('TestNVT');
    expect(result.entities[0].severity).toEqual(7.5);
    expect(result.entities[0].id).toEqual('CVE-2019-1234-192.168.1.1-1.2.3');
    expect(result.entities[1].cveId).toEqual('CVE-2020-5678');
    expect(result.entities[1].host.ip).toEqual('192.168.1.2');
    expect(result.filter).toEqual(filter);
  });

  test('should handle a single cve element (not array)', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      cves: {
        cve: {
          host: '10.0.0.1',
          name: 'CVE-2021-9999',
          nvt: {_oid: '9.9.9', name: 'SingleNVT'},
          severity: 3.0,
          threat: 'Low',
        },
      },
    };

    const result = parseCvesFromEndpoint(data, filter);

    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].cveId).toEqual('CVE-2021-9999');
    expect(result.entities[0].host.ip).toEqual('10.0.0.1');
    expect(result.entities[0].severity).toEqual(3.0);
  });

  test('should fall back to nvt __text when name child is absent', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      cves: {
        cve: {
          host: '10.0.0.1',
          name: 'CVE-2022-0001',
          nvt: {_oid: '1.1.1', __text: 'NVT from text'},
          severity: 4.0,
        },
      },
    };

    const result = parseCvesFromEndpoint(data, filter);

    expect(result.entities[0].source?.description).toEqual('NVT from text');
  });

  test('should return empty list when cves container is missing', () => {
    const filter = Filter.fromString('first=1 rows=100');

    const result = parseCvesFromEndpoint({}, filter);

    expect(result.entities).toHaveLength(0);
    expect(result.counts).toEqual(emptyCollectionCounts);
    expect(result.filter).toEqual(filter);
  });

  test('should use server count for counts.all when provided', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      cves: {
        count: 999,
        cve: [
          {host: '1.1.1.1', name: 'CVE-A', nvt: {_oid: '1'}, severity: 5.0},
          {host: '1.1.1.1', name: 'CVE-B', nvt: {_oid: '1'}, severity: 5.0},
        ],
      },
    };

    const result = parseCvesFromEndpoint(data, filter);

    expect(result.counts.all).toEqual(999);
    expect(result.counts.filtered).toEqual(2);
  });
});

describe('parseClosedCvesFromEndpoint', () => {
  test('should parse multiple closed_cve elements', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      closed_cves: {
        closed_cve: [
          {
            host: '192.168.1.1',
            cve: 'CVE-2019-1234',
            nvt: {_oid: '1.2.3', name: 'TestNVT'},
            severity: 7.5,
            threat: 'High',
          },
          {
            host: '192.168.1.2',
            cve: 'CVE-2020-5678',
            nvt: {_oid: '2.3.4', name: 'AnotherNVT'},
            severity: 5.0,
            threat: 'Medium',
          },
        ],
      },
    };

    const result = parseClosedCvesFromEndpoint(data, filter);

    expect(result.entities).toHaveLength(2);
    expect(result.entities[0].cveId).toEqual('CVE-2019-1234');
    expect(result.entities[0].host.ip).toEqual('192.168.1.1');
    expect(result.entities[0].source?.name).toEqual('1.2.3');
    expect(result.entities[0].source?.description).toEqual('TestNVT');
    expect(result.entities[0].severity).toEqual(7.5);
    expect(result.entities[0].id).toEqual('CVE-2019-1234-192.168.1.1-1.2.3');
    expect(result.entities[1].cveId).toEqual('CVE-2020-5678');
    expect(result.entities[1].host.ip).toEqual('192.168.1.2');
    expect(result.filter).toEqual(filter);
  });

  test('should handle a single closed_cve element (not array)', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      closed_cves: {
        closed_cve: {
          host: '10.0.0.1',
          cve: 'CVE-2021-9999',
          nvt: {_oid: '9.9.9', name: 'SingleNVT'},
          severity: 3.0,
          threat: 'Low',
        },
      },
    };

    const result = parseClosedCvesFromEndpoint(data, filter);

    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].cveId).toEqual('CVE-2021-9999');
    expect(result.entities[0].host.ip).toEqual('10.0.0.1');
    expect(result.entities[0].severity).toEqual(3.0);
  });

  test('should fall back to nvt __text when name child is absent', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      closed_cves: {
        closed_cve: {
          host: '10.0.0.1',
          cve: 'CVE-2022-0001',
          nvt: {_oid: '1.1.1', __text: 'NVT from text'},
          severity: 4.0,
        },
      },
    };

    const result = parseClosedCvesFromEndpoint(data, filter);

    expect(result.entities[0].source?.description).toEqual('NVT from text');
  });

  test('should return empty list when closed_cves container is missing', () => {
    const filter = Filter.fromString('first=1 rows=100');

    const result = parseClosedCvesFromEndpoint({}, filter);

    expect(result.entities).toHaveLength(0);
    expect(result.counts).toEqual(emptyCollectionCounts);
    expect(result.filter).toEqual(filter);
  });

  test('should use server count for counts.all when provided', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      closed_cves: {
        count: 500,
        closed_cve: [
          {host: '1.1.1.1', cve: 'CVE-A', nvt: {_oid: '1'}, severity: 5.0},
          {host: '1.1.1.1', cve: 'CVE-B', nvt: {_oid: '1'}, severity: 5.0},
        ],
      },
    };

    const result = parseClosedCvesFromEndpoint(data, filter);

    expect(result.counts.all).toEqual(500);
    expect(result.counts.filtered).toEqual(2);
  });

  test('should build composite id from cve, host, and nvt oid', () => {
    const filter = Filter.fromString('first=1 rows=100');
    const data = {
      closed_cves: {
        closed_cve: {
          host: '10.0.0.1',
          cve: 'CVE-2022-0001',
          nvt: {_oid: '9.9.9', name: 'TestNVT'},
          severity: 6.0,
        },
      },
    };

    const result = parseClosedCvesFromEndpoint(data, filter);

    expect(result.entities[0].id).toEqual('CVE-2022-0001-10.0.0.1-9.9.9');
  });
});
