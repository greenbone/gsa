/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import Model from 'gmp/model';
import Nvt from 'gmp/models/nvt';
import Host from 'gmp/models/host';

import {
  getEntityType,
  pluralizeType,
  normalizeType,
  apiType,
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
    const model = new Model({}, 'foo');

    expect(getEntityType(model)).toEqual('foo');
  });

  test('should return entity type for info models', () => {
    const model = new Nvt({});

    expect(getEntityType(model)).toEqual('nvt');
  });

  test('should return entity type for asset models', () => {
    const model = new Host({});

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

});

describe('normalizeType function tests', () => {

  test('should normalize types', () => {
    expect(normalizeType('os')).toEqual('operatingsystem');
    expect(normalizeType('cert_bund_adv')).toEqual('certbund');
    expect(normalizeType('dfn_cert_adv')).toEqual('dfncert');
    expect(normalizeType('port_list')).toEqual('portlist');
    expect(normalizeType('port_range')).toEqual('portrange');
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

  test('should pass through unkown types', () => {
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

  test('should pass through unkown types', () => {
    expect(apiType('foo')).toEqual('foo');
  });

});

// vim: set ts=2 sw=2 tw=80:
