/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import DfnCertAdv from 'gmp/models/dfncert';
import {testModel} from 'gmp/models/testing';

testModel(DfnCertAdv, 'dfncert');

describe('DfnCertAdv model tests', () => {
  test('should set defaults', () => {
    const dfnCertAdv = new DfnCertAdv();

    expect(dfnCertAdv.severity).toBeUndefined();
    expect(dfnCertAdv.additionalLinks).toEqual([]);
    expect(dfnCertAdv.advisoryLink).toBeUndefined();
    expect(dfnCertAdv.summary).toBeUndefined();
    expect(dfnCertAdv.cves).toEqual([]);
    expect(dfnCertAdv.title).toBeUndefined();
  });

  test('should parse empty element', () => {
    const dfnCertAdv = DfnCertAdv.fromElement();

    expect(dfnCertAdv.severity).toBeUndefined();
    expect(dfnCertAdv.additionalLinks).toEqual([]);
    expect(dfnCertAdv.advisoryLink).toBeUndefined();
    expect(dfnCertAdv.summary).toBeUndefined();
    expect(dfnCertAdv.cves).toEqual([]);
    expect(dfnCertAdv.title).toBeUndefined();
  });

  test('should parse severity correctly', () => {
    const dfnCertAdv = DfnCertAdv.fromElement({dfn_cert_adv: {severity: 5.0}});
    const dfnCertAdv2 = DfnCertAdv.fromElement({
      dfn_cert_adv: {severity: 10.0},
    });

    expect(dfnCertAdv.severity).toEqual(5.0);
    expect(dfnCertAdv2.severity).toEqual(10);
  });

  test('should parse advisory links', () => {
    const elem = {
      dfn_cert_adv: {
        raw_data: {
          entry: {
            link: [
              {
                _rel: 'alternate',
                _href: 'prot://url',
              },
              {
                _href: 'prot://url2',
              },
              {
                _href: 'prot://url3',
              },
            ],
          },
        },
      },
    };
    const dfnCertAdv = DfnCertAdv.fromElement(elem);

    expect(dfnCertAdv.advisoryLink).toEqual('prot://url');
    expect(dfnCertAdv.additionalLinks).toEqual(['prot://url2', 'prot://url3']);
  });

  test('should parse summary', () => {
    const elem = {
      dfn_cert_adv: {
        raw_data: {
          entry: {
            summary: {
              __text: 'foo',
            },
          },
        },
      },
    };
    const dfnCertAdv = DfnCertAdv.fromElement(elem);

    expect(dfnCertAdv.summary).toEqual('foo');
  });

  test('should parse CVEs', () => {
    const elem = {
      dfn_cert_adv: {
        raw_data: {
          entry: {
            cve: ['lorem', 'ipsum', 'dolor'],
          },
        },
      },
    };
    const dfnCertAdv = DfnCertAdv.fromElement(elem);

    expect(dfnCertAdv.cves).toEqual(['lorem', 'ipsum', 'dolor']);
  });

  test('should parse title', () => {
    const elem = {
      dfn_cert_adv: {
        title: 'Test Title',
      },
    };
    const dfnCertAdv = DfnCertAdv.fromElement(elem);

    expect(dfnCertAdv.title).toEqual('Test Title');
  });
});
