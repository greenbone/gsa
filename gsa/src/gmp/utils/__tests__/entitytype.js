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

import {getEntityType, pluralizeType, normalizeType} from '../entitytype';

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

  test('should return info type for info models', () => {
    const model = new Nvt({});

    expect(getEntityType(model)).toEqual('nvt');
  });

  test('should return asset type for asset models', () => {
    const model = new Host({});

    expect(getEntityType(model)).toEqual('host');
  });

  test('should return info if not info_type is defined', () => {
    const model = new Model({}, 'info');

    expect(getEntityType(model)).toEqual('info');
  });

  test('should return asset if not asset_type is defined', () => {
    const model = new Model({}, 'asset');

    expect(getEntityType(model)).toEqual('asset');
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


// vim: set ts=2 sw=2 tw=80:
