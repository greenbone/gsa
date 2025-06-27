/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import Nvt, {getRefs, hasRefType, getFilteredRefIds} from 'gmp/models/nvt';
import {testModelFromElement, testModelMethods} from 'gmp/models/testing';

describe('Nvt model tests', () => {
  testModelFromElement(Nvt, 'nvt');
  testModelMethods(Nvt);

  test('should use defaults for Nvt', () => {
    const nvt = new Nvt();

    expect(nvt.certs).toEqual([]);
    expect(nvt.cves).toEqual([]);
    expect(nvt.defaultTimeout).toBeUndefined();
    expect(nvt.epss).toBeUndefined();
    expect(nvt.family).toBeUndefined();
    expect(nvt.id).toBeUndefined();
    expect(nvt.oid).toBeUndefined();
    expect(nvt.preferences).toEqual([]);
    expect(nvt.qod).toBeUndefined();
    expect(nvt.severity).toBeUndefined();
    expect(nvt.severityDate).toBeUndefined();
    expect(nvt.severityOrigin).toBeUndefined();
    expect(nvt.solution).toBeUndefined();
    expect(nvt.tags).toEqual({});
    expect(nvt.timeout).toBeUndefined();
    expect(nvt.xrefs).toEqual([]);
  });

  test('should parse NVT from element', () => {
    const nvt = Nvt.fromElement({});

    expect(nvt.certs).toEqual([]);
    expect(nvt.cves).toEqual([]);
    expect(nvt.defaultTimeout).toBeUndefined();
    expect(nvt.epss).toBeUndefined();
    expect(nvt.family).toBeUndefined();
    expect(nvt.id).toBeUndefined();
    expect(nvt.oid).toBeUndefined();
    expect(nvt.preferences).toEqual([]);
    expect(nvt.qod).toBeUndefined();
    expect(nvt.severity).toBeUndefined();
    expect(nvt.severityDate).toBeUndefined();
    expect(nvt.severityOrigin).toBeUndefined();
    expect(nvt.solution).toBeUndefined();
    expect(nvt.tags).toEqual({});
    expect(nvt.timeout).toBeUndefined();
    expect(nvt.xrefs).toEqual([]);
  });

  test('should parse NVT oid as id', () => {
    const nvt1 = Nvt.fromElement({});
    const nvt2 = Nvt.fromElement({nvt: {_oid: '1.2.3'}});

    expect(nvt1.id).toBeUndefined();
    expect(nvt1.oid).toBeUndefined();
    expect(nvt2.oid).toEqual('1.2.3');
    expect(nvt2.id).toEqual('1.2.3');
  });

  test('should parse tags', () => {
    const nvt1 = Nvt.fromElement({nvt: {tags: 'bv=/A:P|st=vf'}});
    const nvt2 = Nvt.fromElement({nvt: {tags: 'bv='}});
    const res = {
      bv: '/A:P',
      st: 'vf',
    };

    expect(nvt1.tags).toEqual(res);
    expect(nvt2.tags.bv).toBeUndefined();
  });

  test('should parse refs', () => {
    const elem = {
      nvt: {
        refs: {
          ref: [
            {
              _id: 'cveId',
              _type: 'cve',
            },
            {
              _id: 'cve_idId',
              _type: 'cve_id',
            },
            {
              _id: 'dfn-certId',
              _type: 'dfn-cert',
            },
            {
              _id: 'DFN-certId',
              _type: 'DFN-cert',
            },
            {
              _id: 'cert-bundId',
              _type: 'cert-bund',
            },
            {
              _id: 'customId',
              _type: 'Custom-type',
            },
          ],
        },
      },
    };
    const nvt1 = Nvt.fromElement(elem);

    expect(nvt1.certs).toEqual([
      {id: 'dfn-certId', type: 'dfn-cert'},
      {id: 'DFN-certId', type: 'dfn-cert'},
      {id: 'cert-bundId', type: 'cert-bund'},
    ]);
    expect(nvt1.xrefs).toEqual([{ref: 'customId', type: 'custom-type'}]);
  });

  test('should parse severity from cvss_base', () => {
    const nvt1 = Nvt.fromElement({nvt: {cvss_base: 9.5}});

    expect(nvt1.severity).toEqual(9.5);
  });

  test('should parse severity, severity date and severity origin from severities', () => {
    const nvt1 = Nvt.fromElement({
      nvt: {
        severities: {
          severity: {
            score: 9.4,
            origin: 'Vendor',
            date: '2021-03-10T06:40:13Z',
          },
        },
        cvss_base: 10.0, // should not be used
      },
    });
    const nvt2 = Nvt.fromElement({
      nvt: {
        severities: {
          severity: {
            score: 7.4,
            origin: 'Greenbone',
            date: '2020-03-10T06:40:13Z',
          },
        },
      },
    });
    const nvt3 = Nvt.fromElement({
      nvt: {
        severities: {
          severity: {
            score: 1.0,
            origin: '',
          },
        },
      },
    });

    expect(nvt1.severity).toEqual(9.4);
    expect(nvt1.severityOrigin).toEqual('Vendor');
    expect(nvt1.severityDate).toEqual(date('2021-03-10T06:40:13Z'));
    expect(nvt2.severity).toEqual(7.4);
    expect(nvt2.severityOrigin).toEqual('Greenbone');
    expect(nvt2.severityDate).toEqual(date('2020-03-10T06:40:13Z'));
    expect(nvt3.severity).toEqual(1.0);
    expect(nvt3.severityOrigin).toEqual('');
    expect(nvt3.severityDate).toBeUndefined();
  });

  test('should fall back to cvss_base when severity is missing', () => {
    const nvt = Nvt.fromElement({
      nvt: {
        cvss_base: 10.0,
        severities: {},
      },
    });

    expect(nvt.severity).toEqual(10.0);
    expect(nvt.severityOrigin).toBeUndefined();
    expect(nvt.severityDate).toBeUndefined();
  });

  test('should parse preferences', () => {
    const elem = {
      nvt: {
        preferences: {
          preference: [
            {
              id: 1,
              name: 'foo',
              value: 'bar',
              nvt: {
                _oid: '1.2.3',
              },
            },
          ],
        },
      },
    };
    const res = [
      {
        id: 1,
        name: 'foo',
        value: 'bar',
      },
    ];
    const nvt = Nvt.fromElement(elem);

    expect(nvt.preferences).toEqual(res);
  });

  test('should parse xrefs with correct protocol', () => {
    const nvt1 = Nvt.fromElement({nvt: {refs: {ref: [{_id: '42'}]}}});
    const nvt2 = Nvt.fromElement({
      nvt: {refs: {ref: [{_type: 'URL', _id: '42'}]}},
    });
    const nvt3 = Nvt.fromElement({
      nvt: {
        refs: {ref: [{_type: 'URL', _id: 'http://42'}]},
      },
    });
    const nvt4 = Nvt.fromElement({
      nvt: {
        refs: {ref: [{_type: 'URL', _id: 'https://42'}]},
      },
    });
    const nvt5 = Nvt.fromElement({
      nvt: {
        refs: {ref: [{_type: 'URL', _id: 'ftp://42'}]},
      },
    });
    const nvt6 = Nvt.fromElement({
      nvt: {
        refs: {ref: [{_type: 'URL', _id: 'ftps://42'}]},
      },
    });
    const nvt7 = Nvt.fromElement({nvt: {refs: {ref: [{_id: 'ftps://42'}]}}});
    const nvt8 = Nvt.fromElement({
      nvt: {
        refs: {ref: [{_type: 'URL', _id: 'https://42'}]},
      },
    });

    expect(nvt1.xrefs).toEqual([{ref: '42', type: 'other'}]);
    expect(nvt2.xrefs).toEqual([{ref: 'http://42', type: 'url'}]);
    expect(nvt3.xrefs).toEqual([{ref: 'http://42', type: 'url'}]);
    expect(nvt4.xrefs).toEqual([{ref: 'https://42', type: 'url'}]);
    expect(nvt5.xrefs).toEqual([{ref: 'ftp://42', type: 'url'}]);
    expect(nvt6.xrefs).toEqual([{ref: 'ftps://42', type: 'url'}]);
    expect(nvt7.xrefs).toEqual([{ref: 'ftps://42', type: 'other'}]);
    expect(nvt8.xrefs).toEqual([{ref: 'https://42', type: 'url'}]);
  });

  test('should parse qod', () => {
    const nvt1 = Nvt.fromElement({nvt: {qod: {value: ''}}});
    const nvt2 = Nvt.fromElement({nvt: {qod: {value: '75.5'}}});
    const nvt3 = Nvt.fromElement({nvt: {qod: {type: ''}}});
    const nvt4 = Nvt.fromElement({nvt: {qod: {type: 'foo'}}});
    const nvt5 = Nvt.fromElement({nvt: {qod: {value: '75.5', type: 'foo'}}});

    expect(nvt1.qod?.value).toBeUndefined();
    expect(nvt2.qod?.value).toEqual(75.5);
    expect(nvt3.qod?.type).toBeUndefined();
    expect(nvt4.qod?.type).toEqual('foo');
    expect(nvt5.qod).toEqual({value: 75.5, type: 'foo'});
  });

  test('should parse default timeout', () => {
    const nvt1 = Nvt.fromElement({nvt: {default_timeout: ''}});
    const nvt2 = Nvt.fromElement({nvt: {default_timeout: '123'}});

    expect(nvt1.defaultTimeout).toBeUndefined();
    expect(nvt2.defaultTimeout).toEqual(123);
  });

  test('should parse timeout', () => {
    const nvt1 = Nvt.fromElement({nvt: {timeout: ''}});
    const nvt2 = Nvt.fromElement({nvt: {timeout: '123'}});

    expect(nvt1.timeout).toBeUndefined();
    expect(nvt2.timeout).toEqual(123);
  });

  test('should parse unified solution type', () => {
    const nvt = Nvt.fromElement({
      nvt: {
        solution: {
          _type: 'foo',
          _method: 'bar',
          __text: 'Some description',
        },
      },
    });

    expect(nvt.solution?.type).toEqual('foo');
    expect(nvt.solution?.method).toEqual('bar');
    expect(nvt.solution?.description).toEqual('Some description');
  });

  test('should set correct solution information for log NVTs', () => {
    const nvt1 = Nvt.fromElement({
      nvt: {
        solution: {
          _type: 'foo',
        },
        severities: {
          severity: {
            score: 0,
          },
        },
      },
    });
    const res1 = {
      type: 'foo',
      description: undefined,
      method: undefined,
    };
    const nvt2 = Nvt.fromElement({
      nvt: {
        solution: {
          __text: 'bar',
        },
        severities: {
          severity: {
            score: 0,
          },
        },
      },
    });
    const res2 = {
      type: undefined,
      description: 'bar',
      method: undefined,
    };
    const nvt3 = Nvt.fromElement({
      nvt: {
        solution: {
          _method: 'baz',
        },
        severities: {
          severity: {
            score: 0,
          },
        },
      },
    });
    const res3 = {
      type: undefined,
      description: undefined,
      method: 'baz',
    };
    const nvt4 = Nvt.fromElement({
      nvt: {
        solution: {
          _type: '',
          __text: 'foo',
        },
        severities: {
          severity: {
            score: 0,
          },
        },
      },
    });
    const res4 = {
      type: undefined,
      description: 'foo',
      method: undefined,
    };

    expect(nvt1.solution).toEqual(res1);
    expect(nvt2.solution).toEqual(res2);
    expect(nvt3.solution).toEqual(res3);
    expect(nvt4.solution).toEqual(res4);
  });

  test('should parse family', () => {
    const nvt1 = Nvt.fromElement({nvt: {family: 'foo'}});
    const nvt2 = Nvt.fromElement({nvt: {family: ''}});

    expect(nvt1.family).toEqual('foo');
    expect(nvt2.family).toBeUndefined();
  });

  test('should parse epss', () => {
    const nvt1 = Nvt.fromElement({
      nvt: {
        epss: {
          maxEpss: {
            percentile: 0.5,
            score: 0.7,
            cve: {
              _id: 'CVE-2023-1234',
              severity: 5.0,
            },
          },
          maxSeverity: {
            percentile: 0.8,
            score: 0.9,
            cve: {
              _id: 'CVE-2023-5678',
              severity: 6.0,
            },
          },
        },
      },
    });
    const nvt2 = Nvt.fromElement({
      nvt: {
        epss: {
          maxEpss: {
            percentile: 0.5,
            score: 0.7,
            cve: {
              _id: 'CVE-2023-1234',
              severity: 5.0,
            },
          },
        },
      },
    });
    const nvt3 = Nvt.fromElement({
      nvt: {
        epss: {
          maxSeverity: {
            percentile: 0.8,
            score: 0.9,
            cve: {
              _id: 'CVE-2023-5678',
              severity: 6.0,
            },
          },
        },
      },
    });

    expect(nvt1.epss?.maxEpss).toEqual({
      percentile: 0.5,
      score: 0.7,
      cve: {id: 'CVE-2023-1234', severity: 5.0},
    });
    expect(nvt1.epss?.maxSeverity).toEqual({
      percentile: 0.8,
      score: 0.9,
      cve: {id: 'CVE-2023-5678', severity: 6.0},
    });
    expect(nvt2.epss?.maxEpss).toEqual({
      percentile: 0.5,
      score: 0.7,
      cve: {id: 'CVE-2023-1234', severity: 5.0},
    });
    expect(nvt2.epss?.maxSeverity).toBeUndefined();
    expect(nvt3.epss?.maxEpss).toBeUndefined();
    expect(nvt3.epss?.maxSeverity).toEqual({
      percentile: 0.8,
      score: 0.9,
      cve: {id: 'CVE-2023-5678', severity: 6.0},
    });
  });
});

describe('getRefs tests', () => {
  test('should return empty array for undefined element', () => {
    const refs = getRefs();

    expect(refs).toEqual([]);
  });

  test('should return empty array for empty object', () => {
    const refs = getRefs({});

    expect(refs).toEqual([]);
  });

  test('should return empty array for empty refs', () => {
    const refs = getRefs({refs: {}});

    expect(refs).toEqual([]);
  });

  test('should return refs ref', () => {
    const refs = getRefs({
      refs: {
        ref: [],
      },
    });

    expect(refs).toEqual([]);
  });

  test('should return array for single ref', () => {
    const refs = getRefs({
      refs: {
        ref: {
          _id: 'foo',
          _type: 'bar',
        },
      },
    });

    expect(refs.length).toEqual(1);
    expect(refs[0]).toEqual({_type: 'bar', _id: 'foo'});
  });

  test('should return all refs', () => {
    const refs = getRefs({
      refs: {
        ref: [
          {
            // @ts-expect-error
            foo: 'bar',
          },
          {
            // @ts-expect-error
            lorem: 'ipsum',
          },
        ],
      },
    });

    expect(refs.length).toEqual(2);
    expect(refs[0]).toEqual({foo: 'bar'});
    expect(refs[1]).toEqual({lorem: 'ipsum'});
  });
});

describe('hasRefType tests', () => {
  test('should return false for undefined ref', () => {
    expect(hasRefType('foo')()).toEqual(false);
  });

  test('should return false for empty ref', () => {
    expect(hasRefType('foo')({})).toEqual(false);
  });

  test('should return false for non string type', () => {
    // @ts-expect-error
    expect(hasRefType('foo')({_type: 1})).toEqual(false);
  });

  test('should return false when searching for other type', () => {
    expect(hasRefType('foo')({_type: 'bar'})).toEqual(false);
  });

  test('should return true when searching for same type', () => {
    expect(hasRefType('foo')({_type: 'foo'})).toEqual(true);
  });

  test('should ignore case for type', () => {
    expect(hasRefType('foo')({_type: 'Foo'})).toEqual(true);
    expect(hasRefType('foo')({_type: 'FOO'})).toEqual(true);
    expect(hasRefType('foo')({_type: 'FoO'})).toEqual(true);
  });
});

describe('getFilteredRefIds tests', () => {
  test('should return empty array for undefined refs', () => {
    const refs = getFilteredRefIds(undefined, 'foo');

    expect(refs).toEqual([]);
  });

  test('should return empty array for empty refs', () => {
    const refs = getFilteredRefIds([], 'foo');

    expect(refs).toEqual([]);
  });

  test('should return empty array when searching for other ref types', () => {
    const refs = getFilteredRefIds(
      [
        {
          _type: 'bar',
          _id: '1',
        },
        {
          _type: 'ipsum',
          _id: '2',
        },
      ],
      'foo',
    );

    expect(refs).toEqual([]);
  });

  test('should return ids of same type only', () => {
    const refs = getFilteredRefIds(
      [
        {
          _type: 'bar',
          _id: '1',
        },
        {
          _type: 'foo',
          _id: '2',
        },
        {
          _type: 'ipsum',
          _id: '3',
        },
        {
          _type: 'foo',
          _id: '4',
        },
      ],
      'foo',
    );

    expect(refs.length).toEqual(2);
    expect(refs).toEqual(['2', '4']);
  });
});

describe('Nvt model method tests', () => {
  test('isDeprecated() returns correct true/false', () => {
    const nvt1 = new Nvt({
      tags: {
        summary: 'foo',
        deprecated: '1',
      },
    });
    const nvt2 = new Nvt({
      tags: {
        summary: 'bar',
      },
    });
    const nvt3 = new Nvt({
      tags: {
        summary: 'lorem',
        deprecated: '0',
      },
    });
    expect(nvt1.tags.summary).toEqual('foo');
    expect(nvt1.isDeprecated()).toEqual(true);
    expect(nvt2.tags.summary).toEqual('bar');
    expect(nvt2.isDeprecated()).toEqual(false);
    expect(nvt3.tags.summary).toEqual('lorem');
    expect(nvt3.isDeprecated()).toEqual(false);
  });
});
