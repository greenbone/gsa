/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/* eslint-disable max-len */

import {isDate} from 'gmp/models/date';
import Ovaldef from 'gmp/models/ovaldef';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {testModel} from 'gmp/models/testing';

testModel(Ovaldef, 'ovaldef');

describe('Ovaldef model tests', () => {
  test('should parse severity', () => {
    const ovaldef = new Ovaldef({max_cvss: '8.5'});

    expect(ovaldef.severity).toEqual(8.5);
    expect(ovaldef.max_cvss).toBeUndefined();
  });

  test('should parse deprecated', () => {
    const ovaldef1 = new Ovaldef({deprecated: '0'});
    const ovaldef2 = new Ovaldef({deprecated: '1'});

    expect(ovaldef1.deprecated).toEqual(NO_VALUE);
    expect(ovaldef2.deprecated).toEqual(YES_VALUE);
  });

  test('isDeprecated() should return correct true/false', () => {
    const ovaldef1 = new Ovaldef({deprecated: '0'});
    const ovaldef2 = new Ovaldef({deprecated: '1'});

    expect(ovaldef1.isDeprecated()).toEqual(false);
    expect(ovaldef2.isDeprecated()).toEqual(true);
  });

  test('should parse definition', () => {
    const elem = {
      raw_data: {
        definition: {
          _id: '123abc',
          _version: '42',
          _class: 'foo',
          _depreacted: '0',
        },
      },
    };
    const ovaldef = new Ovaldef(elem);
    const ovaldef2 = new Ovaldef({});
    const ovaldef3 = new Ovaldef({raw_data: {}});

    expect(ovaldef.short_id).toEqual('123abc');
    expect(ovaldef.version).toEqual('42');
    expect(ovaldef.class).toEqual('foo');
    expect(ovaldef.deprecation).toEqual('0');
    expect(ovaldef2.affecteds).toEqual([]);
    expect(ovaldef2.references).toEqual([]);
    expect(ovaldef2.criterias).toEqual([]);
    expect(ovaldef3.affecteds).toEqual([]);
    expect(ovaldef3.references).toEqual([]);
    expect(ovaldef3.criterias).toEqual([]);
  });

  test('should parse metadata', () => {
    const elem = {
      raw_data: {
        definition: {
          metadata: {
            affected: {
              product: ['foo', 'bar'],
              platform: ['lorem', 'ipsum'],
              _family: 'dolor',
            },
            reference: [
              {
                _ref_id: 'CVE-1',
                _source: 'CVE',
                _ref_url: 'prot://url',
              },
            ],
            oval_repository: {
              status: 'accep',
              dates: {
                sit: {
                  __text: 'amet',
                  _date: '2018-10-10T11:41:23.022Z',
                  contributor: [
                    {
                      __text: 'han',
                      _organization: 'rebels',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    };
    const ovaldef = new Ovaldef(elem);

    expect(ovaldef.affecteds[0].products).toEqual(['foo', 'bar']);
    expect(ovaldef.affecteds[0].platforms).toEqual(['lorem', 'ipsum']);
    expect(ovaldef.affecteds[0].family).toEqual('dolor');
    expect(ovaldef.references[0].id).toEqual('CVE-1');
    expect(ovaldef.references[0].source).toEqual('CVE');
    expect(ovaldef.references[0].type).toEqual('cve');
    expect(ovaldef.references[0].url).toEqual('prot://url');
    expect(ovaldef.repository.status).toEqual('accep');
    expect(isDate(ovaldef.repository.changes[0].date)).toEqual(true);
    expect(ovaldef.repository.changes[0].contributors).toEqual([
      {name: 'han', organization: 'rebels'},
    ]);
    expect(ovaldef.repository.changes[0].description).toEqual('amet');
    expect(ovaldef.repository.changes[0].name).toEqual('sit');
  });

  test('should return empty arrays if no metadata is given', () => {
    const ovaldef = new Ovaldef({});

    expect(ovaldef.affecteds).toEqual([]);
    expect(ovaldef.references).toEqual([]);
  });

  test('should parse criteria', () => {
    const elem = {
      raw_data: {
        definition: {
          criteria: [
            {
              criterion: [
                {
                  _applicability_check: 'foo',
                  _comment: 'bar',
                  _negate: 'true',
                  _test_ref: 'ref',
                },
              ],
              criteria: {
                criterion: {
                  _applicability_check: 'lorem',
                  _comment: 'ipsum',
                  _negate: 'false',
                  _test_ref: 'ref2',
                },
              },
            },
          ],
        },
      },
    };
    const ovaldef = new Ovaldef(elem);

    expect(ovaldef.criterias[0].criterions[0].applicability_check).toEqual(
      'foo',
    );
    expect(ovaldef.criterias[0].criterions[0].comment).toEqual('bar');
    expect(ovaldef.criterias[0].criterions[0].negate).toEqual(true);
    expect(ovaldef.criterias[0].criterions[0].test_ref).toEqual('ref');
    expect(
      ovaldef.criterias[0].criterias[0].criterions[0].applicability_check,
    ).toEqual('lorem');
    expect(ovaldef.criterias[0].criterias[0].criterions[0].comment).toEqual(
      'ipsum',
    );
    expect(ovaldef.criterias[0].criterias[0].criterions[0].negate).toEqual(
      false,
    );
    expect(ovaldef.criterias[0].criterias[0].criterions[0].test_ref).toEqual(
      'ref2',
    );
  });

  test('should parse criteria extend_definitions', () => {
    const elem = {
      raw_data: {
        definition: {
          criteria: {
            extend_definition: [
              {
                _applicability_check: 'foo',
                _comment: 'bar',
                _negate: 'false',
                _definition_ref: 'ref',
              },
            ],
          },
        },
      },
    };
    const ovaldef = new Ovaldef(elem);

    expect(
      ovaldef.criterias[0].extend_definitions[0].applicability_check,
    ).toEqual('foo');
    expect(ovaldef.criterias[0].extend_definitions[0].comment).toEqual('bar');
    expect(ovaldef.criterias[0].extend_definitions[0].negate).toEqual(false);
    expect(ovaldef.criterias[0].extend_definitions[0].definition_ref).toEqual(
      'ref',
    );
  });

  test('should parse criteria comment', () => {
    const elem = {
      raw_data: {
        definition: {
          criteria: {
            _comment: 'lorem',
          },
        },
      },
    };
    const ovaldef = new Ovaldef(elem);

    expect(ovaldef.criterias[0].comment).toEqual('lorem');
  });

  test('should parse criteria operator', () => {
    const elem = {
      raw_data: {
        definition: {
          criteria: {
            _operator: 'and',
          },
        },
      },
    };
    const ovaldef = new Ovaldef(elem);

    expect(ovaldef.criterias[0].operator).toEqual('and');
  });

  test('should parse criteria negate and return correct true/false', () => {
    const elem = {
      raw_data: {
        definition: {
          criteria: {
            _negate: 'true',
          },
        },
      },
    };
    const elem2 = {
      raw_data: {
        definition: {
          criteria: {
            _negate: 'False',
          },
        },
      },
    };
    const ovaldef = new Ovaldef(elem);
    const ovaldef2 = new Ovaldef(elem2);

    expect(ovaldef.criterias[0].negate).toEqual(true);
    expect(ovaldef2.criterias[0].negate).toEqual(false);
  });

  test('should return empty arrays if no definition is given', () => {
    const ovaldef = new Ovaldef({});

    expect(ovaldef.affecteds).toEqual([]);
    expect(ovaldef.references).toEqual([]);
    expect(ovaldef.criterias).toEqual([]);
  });

  test('should delete raw_data', () => {
    const ovaldef = new Ovaldef({});

    expect(ovaldef.raw_data).toBeUndefined();
  });

  test('should return deprecated as yes/no', () => {
    const ovaldef1 = new Ovaldef({deprecated: '0'});
    const ovaldef2 = new Ovaldef({deprecated: '1'});

    expect(ovaldef1.deprecated).toEqual(NO_VALUE);
    expect(ovaldef2.deprecated).toEqual(YES_VALUE);
  });

  test('isDeprecated() should return correct true/false', () => {
    const ovaldef1 = new Ovaldef({deprecated: '0'});
    const ovaldef2 = new Ovaldef({deprecated: '1'});

    expect(ovaldef1.isDeprecated()).toEqual(false);
    expect(ovaldef2.isDeprecated()).toEqual(true);
  });
});
