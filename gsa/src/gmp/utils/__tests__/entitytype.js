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

import {getEntityType} from '../entitytype';

describe('getEntityType function tests', () => {

  test('should return undefined for undefined model', () => {
    expect(getEntityType()).toBeUndefined();
  });

  test('should return entity type of object', () => {
    const model = {entity_type: 'foo'};

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

});

// vim: set ts=2 sw=2 tw=80:
