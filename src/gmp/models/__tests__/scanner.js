/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/model';
import Credential from 'gmp/models/credential';
import {isDate} from 'gmp/models/date';
import Scanner, {
  scannerTypeName,
  openVasScannersFilter,
  CVE_SCANNER_TYPE,
  OPENVAS_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {testModel} from 'gmp/models/testing';
import {YES_VALUE} from 'gmp/parser';

testModel(Scanner, 'scanner');

describe('Scanner model tests', () => {
  test('should parse type', () => {
    const scanner = Scanner.fromElement({type: '42'});

    expect(scanner.scannerType).toEqual(42);
  });

  test('should parse credential', () => {
    const elem = {
      credential: {
        _id: '123abc',
      },
    };
    const elem2 = {
      credential: {
        _id: '',
      },
    };
    const scanner = Scanner.fromElement(elem);
    const scanner2 = Scanner.fromElement(elem2);

    expect(scanner.credential).toBeInstanceOf(Credential);
    expect(scanner.credential.id).toEqual('123abc');
    expect(scanner.credential.entityType).toEqual('credential');
    expect(scanner2.credential).toBeUndefined();
  });

  test('should parse ca_pub', () => {
    const elem = {
      ca_pub: {},
    };
    const scanner = Scanner.fromElement({});
    const scanner2 = Scanner.fromElement(elem);

    expect(scanner.caPub).toBeUndefined();
    expect(scanner2.caPub).toEqual({certificate: {}});
    expect(scanner.ca_pub).toBeUndefined();
  });

  test('should parse ca_pub_info', () => {
    const elem = {
      ca_pub: 'foo',
      ca_pub_info: {
        activation_time: '2018-10-10T23:00:00.000+0000',
        expiration_time: '2018-10-10T23:59:00.000+0000',
      },
    };
    const scanner = Scanner.fromElement(elem);

    expect(isDate(scanner.caPub.info.activationTime)).toEqual(true);
    expect(isDate(scanner.caPub.info.expirationTime)).toEqual(true);
    expect(scanner.ca_pub_info).toBeUndefined();
  });

  test('should parse tasks', () => {
    const elem = {
      tasks: {
        task: [{id: '123'}],
      },
    };
    const scanner = Scanner.fromElement(elem);

    expect(scanner.tasks[0]).toBeInstanceOf(Model);
    expect(scanner.tasks[0].entityType).toEqual('task');
    expect(scanner.tasks[0].id).toEqual('123');
  });

  test('should return empty array if no tasks are given', () => {
    const scanner = Scanner.fromElement({});

    expect(scanner.tasks).toEqual([]);
  });

  test('should parse configs', () => {
    const elem = {
      configs: {
        config: [{id: '123'}],
      },
    };
    const scanner = Scanner.fromElement(elem);

    expect(scanner.configs[0]).toBeInstanceOf(Model);
    expect(scanner.configs[0].entityType).toEqual('scanconfig');
    expect(scanner.configs[0].id).toEqual('123');
  });

  test('should return empty array if no configs are given', () => {
    const scanner = Scanner.fromElement({});

    expect(scanner.configs).toEqual([]);
  });

  test('should parse info', () => {
    const elem = {
      info: {
        scanner: {
          name: 'foo',
          version: '42',
        },
        daemon: {
          version: '1337',
        },
        protocol: {
          name: 'bar',
        },
        description: 'lorem',
        params: {
          param: [
            {
              name: 'ipsum',
              description: 'dolor',
              type: 'sit',
              mandatory: '1',
              default: 'amet',
            },
          ],
        },
      },
    };
    const elem2 = {
      info: {
        description: '',
        params: '',
      },
    };
    const paramsRes = {
      name: 'ipsum',
      description: 'dolor',
      paramType: 'sit',
      mandatory: YES_VALUE,
      default: 'amet',
    };
    const scanner = Scanner.fromElement(elem);
    const scanner2 = Scanner.fromElement(elem2);

    expect(scanner.info.scanner.name).toEqual('foo');
    expect(scanner.info.scanner.version).toEqual('42');
    expect(scanner.info.daemon.name).toBeUndefined();
    expect(scanner.info.daemon.version).toEqual('1337');
    expect(scanner.info.protocol.name).toEqual('bar');
    expect(scanner.info.protocol.version).toBeUndefined();
    expect(scanner.info.params[0]).toEqual(paramsRes);
    expect(scanner.info.params[0].paramType).toEqual('sit');
    expect(scanner.info.params.param).toBeUndefined();
    expect(scanner2.info.description).toBeUndefined();
    expect(scanner2.info.params).toBeUndefined();
  });

  test('isClonable() should return correct true/false', () => {
    const elem1 = {type: CVE_SCANNER_TYPE};
    const elem2 = {type: OPENVAS_SCANNER_TYPE};
    const elem3 = {type: GREENBONE_SENSOR_SCANNER_TYPE};

    const scanner1 = Scanner.fromElement(elem1);
    const scanner2 = Scanner.fromElement(elem2);
    const scanner3 = Scanner.fromElement(elem3);

    expect(scanner1.isClonable()).toEqual(false);
    expect(scanner2.isClonable()).toEqual(false);
    expect(scanner3.isClonable()).toEqual(true);
  });

  test('isWritable() should return correct true/false', () => {
    const elem1 = {type: CVE_SCANNER_TYPE};
    const elem2 = {type: OPENVAS_SCANNER_TYPE};
    const elem3 = {type: GREENBONE_SENSOR_SCANNER_TYPE};

    const scanner1 = Scanner.fromElement(elem1);
    const scanner2 = Scanner.fromElement(elem2);
    const scanner3 = Scanner.fromElement(elem3);

    expect(scanner1.isClonable()).toEqual(false);
    expect(scanner2.isClonable()).toEqual(false);
    expect(scanner3.isClonable()).toEqual(true);
  });

  test('hasUnixSocket() should return correct true/false', () => {
    const scanner1 = Scanner.fromElement({host: '/foo'});
    const scanner2 = Scanner.fromElement({host: 'bar'});
    const scanner3 = Scanner.fromElement({host: {}});

    expect(scanner1.hasUnixSocket()).toEqual(true);
    expect(scanner2.hasUnixSocket()).toEqual(false);
    expect(scanner3.hasUnixSocket()).toEqual(false);
  });
});

describe('Scanner model function tests', () => {
  test('scannerTypeName() should return scanner type', () => {
    const type1 = scannerTypeName(OPENVAS_SCANNER_TYPE);
    const type2 = scannerTypeName(CVE_SCANNER_TYPE);
    const type3 = scannerTypeName(4);
    const type4 = scannerTypeName(GREENBONE_SENSOR_SCANNER_TYPE);
    const type5 = scannerTypeName(42);

    expect(type1).toEqual('OpenVAS Scanner');
    expect(type2).toEqual('CVE Scanner');
    expect(type3).toEqual('Unknown type (4)');
    expect(type4).toEqual('Greenbone Sensor');
    expect(type5).toEqual('Unknown type (42)');
  });

  test('openVasScannersFilter should return filter with correct true/false', () => {
    const config1 = {scannerType: 4}; // unkown
    const config2 = {scannerType: 2}; // OpenVAS Scanner

    expect(openVasScannersFilter(config1)).toEqual(false);
    expect(openVasScannersFilter(config2)).toEqual(true);
  });
});
// vim: set ts=2 sw=2 tw=80:
