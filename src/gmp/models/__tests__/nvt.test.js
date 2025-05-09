/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import Info from 'gmp/models/info';
import Nvt, {getRefs, hasRefType, getFilteredRefIds} from 'gmp/models/nvt';
import {testModelFromElement, testModelMethods} from 'gmp/models/testing';

describe('nvt Model tests', () => {
  testModelFromElement(Nvt, 'nvt');
  testModelMethods(Nvt);

  test('should parse NVT oid as id', () => {
    const nvt1 = Nvt.fromElement({_oid: '42.1337'});
    const nvt2 = Nvt.fromElement({});
    const nvt3 = Nvt.fromElement({nvt: {_oid: '1.2.3'}});

    expect(nvt1.id).toEqual('42.1337');
    expect(nvt1.oid).toEqual('42.1337');
    expect(nvt2.id).toBeUndefined();
    expect(nvt2.oid).toBeUndefined();
    expect(nvt3.oid).toEqual('1.2.3');
    expect(nvt3.id).toEqual('1.2.3');
  });

  test('should not allow to overwrite id', () => {
    const nvt = Nvt.fromElement({_oid: 'foo'});

    expect(() => (nvt.id = 'bar')).toThrow();
  });

  test('should be instance of Info', () => {
    const nvt = new Nvt();
    const nvt2 = Nvt.fromElement({});

    expect(nvt).toBeInstanceOf(Info);
    expect(nvt2).toBeInstanceOf(Info);
  });

  test('should parse nvt_type', () => {
    const nvt1 = Nvt.fromElement({_type: 'foo'});
    const nvt2 = Nvt.fromElement({nvt: {_type: 'foo'}});

    expect(nvt1.nvtType).toEqual('foo');
    expect(nvt2.nvtType).toEqual('foo');
  });

  test('should parse tags', () => {
    const nvt1 = Nvt.fromElement({tags: 'bv=/A:P|st=vf'});
    const nvt2 = Nvt.fromElement({});
    const nvt3 = Nvt.fromElement({nvt: {tags: 'bv=/A:P|st=vf'}});
    const nvt4 = Nvt.fromElement({nvt: {tags: 'bv='}});
    const res = {
      bv: '/A:P',
      st: 'vf',
    };

    expect(nvt1.tags).toEqual(res);
    expect(nvt2.tags).toEqual({});
    expect(nvt3.tags).toEqual(res);
    expect(nvt4.tags.bv).toBeUndefined();
  });

  test('should parse refs', () => {
    const elem = {
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
    };
    const nvt1 = Nvt.fromElement(elem);
    const nvt2 = Nvt.fromElement({});
    const nvt3 = Nvt.fromElement({nvt: elem});

    expect(nvt1.cves).toEqual(['cveId', 'cve_idId']);
    expect(nvt2.cves).toEqual([]);
    expect(nvt1.certs).toEqual([
      {id: 'dfn-certId', type: 'dfn-cert'},
      {id: 'DFN-certId', type: 'dfn-cert'},
      {id: 'cert-bundId', type: 'cert-bund'},
    ]);
    expect(nvt2.certs).toEqual([]);
    expect(nvt1.xrefs).toEqual([{ref: 'customId', type: 'custom-type'}]);
    expect(nvt2.xrefs).toEqual([]);

    expect(nvt3.cves).toEqual(['cveId', 'cve_idId']);
    expect(nvt3.certs).toEqual([
      {id: 'dfn-certId', type: 'dfn-cert'},
      {id: 'DFN-certId', type: 'dfn-cert'},
      {id: 'cert-bundId', type: 'cert-bund'},
    ]);
    expect(nvt3.xrefs).toEqual([{ref: 'customId', type: 'custom-type'}]);
  });

  test('should parse severity from cvss_base', () => {
    const nvt1 = Nvt.fromElement({cvss_base: '8.5'});
    const nvt2 = Nvt.fromElement({cvss_base: ''});
    const nvt3 = Nvt.fromElement({nvt: {cvss_base: '9.5'}});

    expect(nvt1.severity).toEqual(8.5);
    expect(nvt1.cvss_base).toBeUndefined();
    expect(nvt2.severity).toBeUndefined();
    expect(nvt2.cvss_base).toBeUndefined();
    expect(nvt3.cvss_base).toBeUndefined();
    expect(nvt3.severity).toEqual(9.5);
  });

  test('should parse severity and origin from severities', () => {
    const nvt1 = Nvt.fromElement({
      severities: {
        severity: {
          score: 9.4,
          origin: 'Vendor',
          date: '2021-03-10T06:40:13Z',
        },
      },
      score: '6.6',
    });
    const nvt2 = Nvt.fromElement({
      severities: {
        severity: {
          score: 7.4,
          origin: 'Greenbone',
          date: '2020-03-10T06:40:13Z',
        },
      },
      score: '',
    });
    const nvt3 = Nvt.fromElement({
      severities: {
        severity: {
          score: 1.0,
          origin: '',
        },
      },
    });

    expect(nvt1.severity).toEqual(9.4);
    expect(nvt1.severityOrigin).toEqual('Vendor');
    expect(nvt1.severityDate).toEqual(date('2021-03-10T06:40:13Z'));
    expect(nvt1.cvss_base).toBeUndefined();
    expect(nvt2.severity).toEqual(7.4);
    expect(nvt2.cvss_base).toBeUndefined();
    expect(nvt2.severityOrigin).toEqual('Greenbone');
    expect(nvt2.severityDate).toEqual(date('2020-03-10T06:40:13Z'));
    expect(nvt3.cvss_base).toBeUndefined();
    expect(nvt3.severity).toEqual(1.0);
    expect(nvt3.severityOrigin).toEqual('');
    expect(nvt3.severityDate).toBeUndefined();
  });

  test('should fall back to cvss_base when <severity> is missing from <severities>', () => {
    const nvt = Nvt.fromElement({
      cvss_base: '10.0',
      severities: {},
    });

    expect(nvt.severity).toEqual(10.0);
    expect(nvt.severityOrigin).toBeUndefined();
    expect(nvt.severityDate).toBeUndefined();
    expect(nvt.cvss_base).toBeUndefined();
  });

  test('should parse preferences', () => {
    const elem = {
      preferences: {
        preference: [
          {
            nvt: '123',
            foo: 'bar',
            lorem: 'ipsum',
          },
        ],
      },
    };
    const res = [
      {
        foo: 'bar',
        lorem: 'ipsum',
      },
    ];
    const nvt1 = Nvt.fromElement({});
    const nvt2 = Nvt.fromElement(elem);
    const nvt3 = Nvt.fromElement({nvt: elem});

    expect(nvt1.preferences).toEqual([]);
    expect(nvt2.preferences).toEqual(res);
    expect(nvt3.preferences).toEqual(res);
  });

  test('should parse xrefs with correct protocol', () => {
    const nvt1 = Nvt.fromElement({refs: {ref: [{_id: '42'}]}});
    const nvt2 = Nvt.fromElement({refs: {ref: [{_type: 'URL', _id: '42'}]}});
    const nvt3 = Nvt.fromElement({
      refs: {ref: [{_type: 'URL', _id: 'http://42'}]},
    });
    const nvt4 = Nvt.fromElement({
      refs: {ref: [{_type: 'URL', _id: 'https://42'}]},
    });
    const nvt5 = Nvt.fromElement({
      refs: {ref: [{_type: 'URL', _id: 'ftp://42'}]},
    });
    const nvt6 = Nvt.fromElement({
      refs: {ref: [{_type: 'URL', _id: 'ftps://42'}]},
    });
    const nvt7 = Nvt.fromElement({refs: {ref: [{_id: 'ftps://42'}]}});
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
    expect(nvt7.xref).toBeUndefined();
    expect(nvt8.xrefs).toEqual([{ref: 'https://42', type: 'url'}]);
  });

  test('should parse qod', () => {
    const nvt1 = Nvt.fromElement({});
    const nvt2 = Nvt.fromElement({qod: {value: ''}});
    const nvt3 = Nvt.fromElement({qod: {value: '75.5'}});
    const nvt4 = Nvt.fromElement({qod: {type: ''}});
    const nvt5 = Nvt.fromElement({qod: {type: 'foo'}});
    const nvt6 = Nvt.fromElement({qod: {value: '75.5', type: 'foo'}});
    const nvt7 = Nvt.fromElement({nvt: {qod: {value: '75.5', type: 'foo'}}});

    expect(nvt1.qod).toBeUndefined();
    expect(nvt2.qod.value).toBeUndefined();
    expect(nvt3.qod.value).toEqual(75.5);
    expect(nvt4.qod.type).toBeUndefined();
    expect(nvt5.qod.type).toEqual('foo');
    expect(nvt6.qod).toEqual({value: 75.5, type: 'foo'});
    expect(nvt7.qod).toEqual({value: 75.5, type: 'foo'});
  });

  test('should parse default_timeout', () => {
    const nvt1 = Nvt.fromElement({});
    const nvt2 = Nvt.fromElement({default_timeout: ''});
    const nvt3 = Nvt.fromElement({default_timeout: '123'});
    const nvt4 = Nvt.fromElement({nvt: {default_timeout: '123'}});

    expect(nvt1.defaultTimeout).toBeUndefined();
    expect(nvt2.defaultTimeout).toBeUndefined();
    expect(nvt3.defaultTimeout).toEqual(123);
    expect(nvt3.default_timeout).toBeUndefined();
    expect(nvt4.defaultTimeout).toEqual(123);
    expect(nvt4.default_timeout).toBeUndefined();
  });

  test('should parse timeout', () => {
    const nvt1 = Nvt.fromElement({});
    const nvt2 = Nvt.fromElement({timeout: ''});
    const nvt3 = Nvt.fromElement({timeout: '123'});
    const nvt4 = Nvt.fromElement({nvt: {timeout: '123'}});

    expect(nvt1.timeout).toBeUndefined();
    expect(nvt2.timeout).toBeUndefined();
    expect(nvt3.timeout).toEqual(123);
    expect(nvt4.timeout).toEqual(123);
  });

  test('should parse unified solution type', () => {
    const nvt = Nvt.fromElement({
      solution: {
        _type: 'foo',
        _method: 'bar',
        __text: 'Some description',
        lorem: 'ipsum',
      },
    });

    expect(nvt.solution.type).toEqual('foo');
    expect(nvt.solution.method).toEqual('bar');
    expect(nvt.solution.description).toEqual('Some description');
    expect(nvt.solution.lorem).toBeUndefined();
  });

  test('should set correct solution information for log NVTs', () => {
    const nvt1 = Nvt.fromElement({
      solution: {
        _type: 'foo',
      },
      severities: {
        severity: {
          score: 0,
        },
      },
    });
    const res1 = {
      type: 'foo',
      description: undefined,
      method: undefined,
    };
    const nvt2 = Nvt.fromElement({
      solution: {
        __text: 'bar',
      },
      severities: {
        severity: {
          score: 0,
        },
      },
    });
    const res2 = {
      type: undefined,
      description: 'bar',
      method: undefined,
    };
    const nvt3 = Nvt.fromElement({
      solution: {
        _method: 'baz',
      },
      severities: {
        severity: {
          score: 0,
        },
      },
    });
    const res3 = {
      type: undefined,
      description: undefined,
      method: 'baz',
    };
    const nvt4 = Nvt.fromElement({
      solution: {
        _type: '',
        __text: 'foo',
      },
      severities: {
        severity: {
          score: 0,
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
        ref: [
          {
            foo: 'bar',
          },
        ],
      },
    });

    expect(refs.length).toEqual(1);
    expect(refs[0]).toEqual({foo: 'bar'});
  });

  test('should return all refs', () => {
    const refs = getRefs({
      refs: {
        ref: [
          {
            foo: 'bar',
          },
          {
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

  describe('NVT model method tests', () => {
    test('isDeprecated() returns correct true/false', () => {
      const nvt1 = Nvt.fromElement({
        tags: 'summary=foo|deprecated=1',
      });
      const nvt2 = Nvt.fromElement({
        tags: 'summary=bar',
      });
      const nvt3 = Nvt.fromElement({
        tags: 'summary=lorem|deprecated=0',
      });
      expect(nvt1.tags.summary).toEqual('foo');
      expect(nvt1.isDeprecated()).toEqual(true);
      expect(nvt2.tags.summary).toEqual('bar');
      expect(nvt2.isDeprecated()).toEqual(false);
      expect(nvt3.tags.summary).toEqual('lorem');
      expect(nvt3.isDeprecated()).toEqual(false);
    });
  });
});
