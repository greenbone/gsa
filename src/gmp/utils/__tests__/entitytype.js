/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {parseModelFromElement} from 'gmp/model';
import Nvt from 'gmp/models/nvt';
import Host from 'gmp/models/host';

import {
  getEntityType,
  pluralizeType,
  normalizeType,
  apiType,
  typeName,
} from '../entitytype';

describe('getEntityType function tests', () => {
  test('should return undefined for undefined model', () => {
    expect(getEntityType()).toBeUndefined();
  });

  test('should return entity type of object', () => {
    const model = {entityType: 'foo'};

    expect(getEntityType(model)).toEqual('foo');
  });

  test('should return entity type of model', () => {
    const model = parseModelFromElement({}, 'foo');

    expect(getEntityType(model)).toEqual('foo');
  });

  test('should return entity type for info models', () => {
    const model = Nvt.fromElement({});

    expect(getEntityType(model)).toEqual('nvt');
  });

  test('should return entity type for asset models', () => {
    const model = Host.fromElement({});

    expect(getEntityType(model)).toEqual('host');
  });
});

describe('pluralizeType function tests', () => {
  test('should not pluralize info', () => {
    expect(pluralizeType('info')).toEqual('info');
  });

  test('should not pluralize an already pluralized term', () => {
    expect(pluralizeType('foos')).toEqual('foos');
    expect(pluralizeType('tasks')).toEqual('tasks');
  });

  test('should pluralize term', () => {
    expect(pluralizeType('foo')).toEqual('foos');
    expect(pluralizeType('task')).toEqual('tasks');
  });

  test('should pluralize special plural types', () => {
    expect(pluralizeType('vulnerability')).toEqual('vulns');
    expect(pluralizeType('policy')).toEqual('policies');
  });
});

describe('normalizeType function tests', () => {
  test('should normalize types', () => {
    expect(normalizeType('os')).toEqual('operatingsystem');
    expect(normalizeType('cert_bund_adv')).toEqual('certbund');
    expect(normalizeType('dfn_cert_adv')).toEqual('dfncert');
    expect(normalizeType('port_list')).toEqual('portlist');
    expect(normalizeType('port_range')).toEqual('portrange');
    expect(normalizeType('report_config')).toEqual('reportconfig');
    expect(normalizeType('report_format')).toEqual('reportformat');
    expect(normalizeType('config')).toEqual('scanconfig');
    expect(normalizeType('vuln')).toEqual('vulnerability');
  });

  test('should pass through already normalize types', () => {
    expect(normalizeType('task')).toEqual('task');
    expect(normalizeType('target')).toEqual('target');
    expect(normalizeType('reportformat')).toEqual('reportformat');
    expect(normalizeType('scanconfig')).toEqual('scanconfig');
  });

  test('should pass through unknown types', () => {
    expect(normalizeType('foo')).toEqual('foo');
  });
});

describe('apiType function tests', () => {
  test('should convert entity types', () => {
    expect(apiType('operatingsystem')).toEqual('os');
    expect(apiType('certbund')).toEqual('cert_bund_adv');
    expect(apiType('dfncert')).toEqual('dfn_cert_adv');
    expect(apiType('portlist')).toEqual('port_list');
    expect(apiType('portrange')).toEqual('port_range');
    expect(apiType('reportconfig')).toEqual('report_config');
    expect(apiType('reportformat')).toEqual('report_format');
    expect(apiType('scanconfig')).toEqual('config');
    expect(apiType('vulnerability')).toEqual('vuln');
  });

  test('should pass through already converted types', () => {
    expect(apiType('task')).toEqual('task');
    expect(apiType('target')).toEqual('target');
    expect(apiType('report_format')).toEqual('report_format');
    expect(apiType('config')).toEqual('config');
  });

  test('should pass through unknown types', () => {
    expect(apiType('foo')).toEqual('foo');
  });
});

describe('typeName function tests', () => {
  test('should pass through unknown types', () => {
    expect(typeName('foo')).toEqual('foo');
  });

  test('should convert entity types', () => {
    expect(typeName('task')).toEqual('Task');
    expect(typeName('operatingsystem')).toEqual('Operating System');
    expect(typeName('os')).toEqual('Operating System');
    expect(typeName('certbund')).toEqual('CERT-Bund Advisory');
    expect(typeName('dfncert')).toEqual('DFN-CERT Advisory');
    expect(typeName('portlist')).toEqual('Port List');
    expect(typeName('portrange')).toEqual('Port Range');
    expect(typeName('reportconfig')).toEqual('Report Config');
    expect(typeName('scanconfig')).toEqual('Scan Config');
    expect(typeName('config')).toEqual('Scan Config');
    expect(typeName('vulnerability')).toEqual('Vulnerability');
  });
});

// vim: set ts=2 sw=2 tw=80:
