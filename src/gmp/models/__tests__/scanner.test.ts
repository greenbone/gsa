/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Credential from 'gmp/models/credential';
import {isDate} from 'gmp/models/date';
import Scanner, {
  scannerTypeName,
  openVasScannersFilter,
  CVE_SCANNER_TYPE,
  OPENVAS_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
  OPENVASD_SENSOR_SCANNER_TYPE,
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {testModel} from 'gmp/models/testing';
import {YES_VALUE} from 'gmp/parser';

testModel(Scanner, 'scanner', {
  testType: false,
});

describe('Scanner model tests', () => {
  test('should use defaults', () => {
    const scanner = new Scanner();
    expect(scanner.caPub).toBeUndefined();
    expect(scanner.configs).toEqual([]);
    expect(scanner.credential).toBeUndefined();
    expect(scanner.info).toBeUndefined();
    expect(scanner.host).toBeUndefined();
    expect(scanner.scannerType).toBeUndefined();
    expect(scanner.tasks).toEqual([]);
    expect(scanner.port).toBeUndefined();
  });

  test('should parse empty element', () => {
    const scanner = Scanner.fromElement({});
    expect(scanner.caPub).toBeUndefined();
    expect(scanner.configs).toEqual([]);
    expect(scanner.credential).toBeUndefined();
    expect(scanner.info).toBeUndefined();
    expect(scanner.host).toBeUndefined();
    expect(scanner.scannerType).toBeUndefined();
    expect(scanner.tasks).toEqual([]);
    expect(scanner.port).toBeUndefined();
  });

  test('should parse type', () => {
    const scanner = Scanner.fromElement({type: '42'});

    expect(scanner.scannerType).toEqual('42');
  });

  test('should parse credential', () => {
    const scanner = Scanner.fromElement({
      credential: {
        _id: '123abc',
      },
    });
    const scanner2 = Scanner.fromElement({
      credential: {
        _id: '',
      },
    });

    expect(scanner.credential).toBeInstanceOf(Credential);
    expect(scanner?.credential?.id).toEqual('123abc');
    expect(scanner?.credential?.entityType).toEqual('credential');
    expect(scanner2.credential).toBeUndefined();
  });

  test('should parse ca pub', () => {
    const scanner = Scanner.fromElement({
      ca_pub: '',
    });
    expect(scanner.caPub).toBeUndefined();
    const scanner2 = Scanner.fromElement({
      ca_pub: 'foobar',
    });
    expect(scanner2.caPub).toEqual({certificate: 'foobar'});
  });

  test('should parse ca pub info', () => {
    const elem = {
      ca_pub: 'foo',
      ca_pub_info: {
        activation_time: '2018-10-10T23:00:00.000+0000',
        expiration_time: '2018-10-10T23:59:00.000+0000',
      },
    };
    const scanner = Scanner.fromElement(elem);

    expect(isDate(scanner?.caPub?.info?.activationTime)).toEqual(true);
    expect(isDate(scanner?.caPub?.info?.expirationTime)).toEqual(true);
  });

  test('should parse tasks', () => {
    const scanner = Scanner.fromElement({
      tasks: {
        task: [{_id: '123'}],
      },
    });

    expect(scanner.tasks[0].entityType).toEqual('task');
    expect(scanner.tasks[0].id).toEqual('123');
  });

  test('should parse scan configs', () => {
    const scanner = Scanner.fromElement({
      configs: {
        config: [{_id: '123'}],
      },
    });

    expect(scanner.configs[0].entityType).toEqual('scanconfig');
    expect(scanner.configs[0].id).toEqual('123');
  });

  test('should parse scanner info', () => {
    const scanner = Scanner.fromElement({
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
              paramType: 'sit',
              mandatory: 1,
              default: 'amet',
            },
          ],
        },
      },
    });
    const scanner2 = Scanner.fromElement({
      info: {
        description: '',
        params: {},
      },
    });

    expect(scanner.info?.scanner?.name).toEqual('foo');
    expect(scanner.info?.scanner?.version).toEqual('42');
    expect(scanner.info?.daemon?.name).toBeUndefined();
    expect(scanner.info?.daemon?.version).toEqual('1337');
    expect(scanner.info?.protocol?.name).toEqual('bar');
    expect(scanner.info?.protocol?.version).toBeUndefined();
    const scannerParam = scanner.info?.params?.[0];
    expect(scannerParam).toEqual({
      name: 'ipsum',
      description: 'dolor',
      paramType: 'sit',
      mandatory: YES_VALUE,
      default: 'amet',
    });
    expect(scanner2.info?.description).toBeUndefined();
    expect(scanner2.info?.params).toEqual([]);
  });

  test('should parse port', () => {
    const scanner = Scanner.fromElement({
      // @ts-expect-error
      port: '9392',
    });
    const scanner2 = Scanner.fromElement({
      // @ts-expect-error
      port: 'not-a-number',
    });
    const scanner3 = Scanner.fromElement({
      // @ts-expect-error
      port: '',
    });
    const scanner4 = Scanner.fromElement({port: 1234});

    expect(scanner.port).toEqual(9392);
    expect(scanner2.port).toBeUndefined();
    expect(scanner3.port).toBeUndefined();
    expect(scanner4.port).toEqual(1234);
  });
});

describe('Scanner model method tests', () => {
  test('isCloneable() should return correct true/false', () => {
    const scanner1 = new Scanner({scannerType: CVE_SCANNER_TYPE});
    const scanner2 = new Scanner({scannerType: OPENVAS_SCANNER_TYPE});
    const scanner3 = new Scanner({scannerType: GREENBONE_SENSOR_SCANNER_TYPE});

    expect(scanner1.isCloneable()).toEqual(false);
    expect(scanner2.isCloneable()).toEqual(false);
    expect(scanner3.isCloneable()).toEqual(true);
  });

  test('isWritable() should return correct true/false', () => {
    const scanner1 = new Scanner({scannerType: CVE_SCANNER_TYPE});
    const scanner2 = new Scanner({scannerType: OPENVAS_SCANNER_TYPE});
    const scanner3 = new Scanner({scannerType: GREENBONE_SENSOR_SCANNER_TYPE});

    expect(scanner1.isWritable()).toEqual(false);
    expect(scanner2.isWritable()).toEqual(false);
    expect(scanner3.isWritable()).toEqual(true);
  });

  test('hasUnixSocket() should return correct true/false', () => {
    const scanner1 = new Scanner({host: '/foo'});
    const scanner2 = new Scanner({host: 'bar'});
    const scanner3 = new Scanner({host: ''});

    expect(scanner1.hasUnixSocket()).toEqual(true);
    expect(scanner2.hasUnixSocket()).toEqual(false);
    expect(scanner3.hasUnixSocket()).toEqual(false);
  });
});

describe('Scanner model function tests', () => {
  test('scannerTypeName() should return scanner type', () => {
    expect(scannerTypeName(OPENVAS_SCANNER_TYPE)).toEqual('OpenVAS Scanner');
    expect(scannerTypeName(CVE_SCANNER_TYPE)).toEqual('CVE Scanner');
    expect(scannerTypeName(4)).toEqual('Unknown scanner type (4)');
    expect(scannerTypeName(GREENBONE_SENSOR_SCANNER_TYPE)).toEqual(
      'Greenbone Sensor',
    );
    expect(scannerTypeName('42')).toEqual('Unknown scanner type (42)');
    expect(scannerTypeName(OPENVASD_SCANNER_TYPE)).toEqual('OpenVASD Scanner');
    expect(scannerTypeName(OPENVASD_SENSOR_SCANNER_TYPE)).toEqual(
      'OpenVASD Sensor',
    );
    expect(scannerTypeName(AGENT_CONTROLLER_SCANNER_TYPE)).toEqual(
      'Agent Scanner',
    );
    expect(scannerTypeName(AGENT_CONTROLLER_SENSOR_SCANNER_TYPE)).toEqual(
      'Agent Sensor',
    );
    expect(scannerTypeName(undefined)).toEqual('Unknown scanner type');
  });

  test('openVasScannersFilter should return filter with correct true/false', () => {
    // @ts-expect-error
    expect(openVasScannersFilter({scannerType: 42})).toEqual(false);
    expect(
      openVasScannersFilter({scannerType: GREENBONE_SENSOR_SCANNER_TYPE}),
    ).toEqual(false);
    expect(openVasScannersFilter({scannerType: OPENVAS_SCANNER_TYPE})).toEqual(
      true,
    );
  });
});
