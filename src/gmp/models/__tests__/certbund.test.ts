/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CertBundAdv from 'gmp/models/certbund';
import {testModel} from 'gmp/models/testing';
import {parseDate} from 'gmp/parser';

testModel(CertBundAdv, 'certbund');

describe('CertBundAdv model tests', () => {
  test('should set defaults', () => {
    const certBundAdv = new CertBundAdv();

    expect(certBundAdv.additionalInformation).toEqual([]);
    expect(certBundAdv.categories).toEqual([]);
    expect(certBundAdv.cves).toEqual([]);
    expect(certBundAdv.description).toEqual([]);
    expect(certBundAdv.effect).toBeUndefined();

    expect(certBundAdv.platform).toBeUndefined();
    expect(certBundAdv.referenceSource).toBeUndefined();
    expect(certBundAdv.referenceUrl).toBeUndefined();
    expect(certBundAdv.remoteAttack).toBeUndefined();
    expect(certBundAdv.revisionHistory).toEqual([]);
    expect(certBundAdv.risk).toBeUndefined();
    expect(certBundAdv.severity).toBeUndefined();
    expect(certBundAdv.software).toBeUndefined();
    expect(certBundAdv.summary).toBeUndefined();
    expect(certBundAdv.title).toBeUndefined();
    expect(certBundAdv.version).toBeUndefined();
  });

  test('should parse severity', () => {
    const elem = {cert_bund_adv: {severity: 8.5}};
    const certBundAdv = CertBundAdv.fromElement(elem);

    expect(certBundAdv.severity).toEqual(8.5);
  });

  test('should parse summary', () => {
    const elem = {cert_bund_adv: {summary: 'foo'}};
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.summary).toEqual('foo');
  });

  test('should parse title', () => {
    const elem = {
      cert_bund_adv: {
        title: 'foo',
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.title).toEqual('foo');
  });

  test('should parse categories', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            CategoryTree: ['foo', 'bar'],
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.categories).toEqual(['foo', 'bar']);
  });

  test('should parse single category', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            CategoryTree: 'foo',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.categories).toEqual(['foo']);
  });

  test('should parse descriptions', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Description: {
              Element: [{TextBlock: 'foo'}, {TextBlock: 'bar'}],
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.description).toEqual(['foo', 'bar']);
  });

  test('should parse single description', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Description: {
              Element: {
                TextBlock: 'foo',
              },
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.description).toEqual(['foo']);
  });

  test('should parse additional information', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Description: {
              Element: [
                {
                  Infos: {
                    Info: [
                      {
                        _Info_Issuer: 'foo',
                        _Info_URL: 'bar',
                      },
                      {
                        _Info_Issuer: 'lorem',
                        _Info_URL: 'ipsum',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    const res = [
      {
        issuer: 'foo',
        url: 'bar',
      },
      {
        issuer: 'lorem',
        url: 'ipsum',
      },
    ];
    expect(certBundAdv.additionalInformation).toEqual(res);
  });

  test('should parse single additional information', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Description: {
              Element: [
                {
                  Infos: {
                    Info: {
                      _Info_Issuer: 'foo',
                      _Info_URL: 'bar',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    const res = [
      {
        issuer: 'foo',
        url: 'bar',
      },
    ];
    expect(certBundAdv.additionalInformation).toEqual(res);
  });

  test('should parse version', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Ref_Num: {
              _update: '5',
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.version).toEqual('5');
  });

  test('should parse revision history', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            RevisionHistory: {
              Revision: [
                {
                  Number: 42,
                  Description: 'lorem ipsum',
                  Date: '2018-10-10T13:30:00+01:00',
                },
                {
                  Number: 43,
                  Description: 'lorem ipsum dolor',
                  Date: '2018-10-10T13:31:00+01:00',
                },
              ],
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    const res = [
      {
        revision: 42,
        description: 'lorem ipsum',
        date: parseDate('2018-10-10T13:30:00+01:00'),
      },
      {
        revision: 43,
        description: 'lorem ipsum dolor',
        date: parseDate('2018-10-10T13:31:00+01:00'),
      },
    ];
    expect(certBundAdv.revisionHistory).toEqual(res);
  });

  test('should parse CVEs', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            CVEList: {
              CVE: ['foo', 'bar'],
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);

    expect(certBundAdv.cves).toEqual(['foo', 'bar']);
  });

  test('should parse single CVE', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            CVEList: {
              CVE: 'foo',
            },
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);

    expect(certBundAdv.cves).toEqual(['foo']);
  });

  test('should parse platform', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Platform: 'Linux',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.platform).toEqual('Linux');
  });

  test('should parse effect', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Effect: 'foo',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.effect).toEqual('foo');
  });

  test('should parse reference source', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Reference_Source: 'foo',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.referenceSource).toEqual('foo');
  });

  test('should parse reference URL', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Reference_URL: 'https://example.com',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.referenceUrl).toEqual('https://example.com');
  });

  test('should parse remote attack', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            RemoteAttack: 'yes',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.remoteAttack).toEqual('yes');
  });

  test('should parse risk', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Risk: 'high',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.risk).toEqual('high');
  });

  test('should parse software', () => {
    const elem = {
      cert_bund_adv: {
        raw_data: {
          Advisory: {
            Software: 'foo',
          },
        },
      },
    };
    const certBundAdv = CertBundAdv.fromElement(elem);
    expect(certBundAdv.software).toEqual('foo');
  });
});
