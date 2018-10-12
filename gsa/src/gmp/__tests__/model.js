/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {isDate} from 'gmp/models/date';
import {parseDate, NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Model tests', () => {

  test('end_time is parsed correctly', () => {
    const elem = {
      end_time: '2018-10-10T11:41:23.022Z',
    };
    const model = new Model(elem);
    expect(model.endTime).toBeDefined();
    expect(model.end_time).toBeUndefined();
    expect(isDate(model.endTime)).toBe(true);
  });

  test('permissions are parsed correctly', () => {
    const elem = {
      permissions: {
        permission: [
          {name: 'everything'},
          {name: 'may_foo'},
        ],
      },
    };
    const model = new Model(elem);
    expect(model.userCapabilities).toBeDefined();
    expect(model.user_capabilities).toBeUndefined();
    expect(model.userCapabilities.length).toEqual(2);
    expect(model.userCapabilities.mayAccess('foo')).toEqual(true);
  });

  test('should return undefined for userCapabilities if no permissions ' +
    'are given', () => {
      const model = new Model();
      expect(model.userCapabilities).toBeUndefined();
    });

  test('user_tags are parsed correctly', () => {
    const elem = {
      user_tags: {
        tag: [
          {name: 'foo'},
        ],
      },
    };
    const model = new Model(elem);

    expect(model.userTags).toBeDefined();
    expect(model.user_tags).toBeUndefined();
    expect(model.userTags[0].name).toEqual('foo');
    expect(model.userTags[0].entityType).toEqual('tag');
  });

  test('should return empty array for userTags if no tags are given', () => {
    const model = new Model({});
    expect(model.userTags).toEqual([]);
  });

  test('should delete owner if owners name is empty', () => {
    const elem = {owner: {name: ''}};
    const model = new Model(elem);
    expect(model.owner).toBeUndefined();
  });

  test('should delete comment if comment is empty', () => {
    const elem = {comment: ''};
    const model = new Model(elem);
    expect(model.comment).toBeUndefined();
  });

  test('entityType is "unknown" when no entity is used to initialize', () => {
    const model = new Model({});
    expect(model.entityType).toBe('unknown');
  });

  test('entityType equals type of entity that was used to initialize', () => {
    const model = new Model({}, 'foo');
    expect(model.entityType).toBe('foo');
  });

  test('should parse props as YES_VALUE/NO_VALUE', () => {
    const elem = {
      in_use: '1',
      writable: '0',
    };
    const model = new Model(elem);

    expect(model.in_use).toEqual(YES_VALUE);
    expect(model.writable).toEqual(NO_VALUE);
  });

});

describe('Model parse_properties function test', () => {

  test('should set ID only for proper ID', () => {
    const model1 = new Model({_id: '1337'});
    const model2 = new Model({});
    const model3 = new Model({_id: ''});

    expect(model1.id).toEqual('1337');
    expect(model2.id).toBeUndefined();
    expect(model3.id).toBeUndefined();
  });

  test('should parse creation_time as date', () => {
    const model = new Model({creation_time: '2018-10-10T08:48:46Z'});

    expect(model.creationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
    expect(model.creation_time).toBeUndefined();
  });

  test('should parse no given creation_time as undefined', () => {
    const model = new Model({});

    expect(model.creationTime).toBeUndefined();
  });

  test('should parse modification_time as date', () => {
    const model = new Model({modification_time: '2018-10-10T08:48:46Z'});

    expect(model.modificationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
    expect(model.modification_time).toBeUndefined();
  });

  test('should parse no given modification_time as undefined', () => {
    const model = new Model({});

    expect(model.modificationTime).toBeUndefined();
  });

  test('should privatize type from Model', () => {
    const model = new Model({type: 'foo'});

    expect(model.type).toBeUndefined();
  });
});

describe('Model set_properties function test', () => {
  test('should not allow to overwrite id', () => {
    const model = new Model({_id: 'foo'});

    expect(() => model.id = 'bar').toThrow();
  });
});

describe('Model methods tests', () => {

    test('isInUse() should return correct true/false', () => {
      const model1 = new Model({in_use: '1'});
      const model2 = new Model({in_use: '0'});
      expect(model1.isInUse()).toBe(true);
      expect(model2.isInUse()).toBe(false);
    });

    test('isInTrash() should return correct true/false', () => {
      const model1 = new Model({trash: '1'});
      const model2 = new Model({trash: '0'});
      expect(model1.isInTrash()).toBe(true);
      expect(model2.isInTrash()).toBe(false);
    });

    test('isWritable() should return correct true/false', () => {
      const model1 = new Model({writable: '1'});
      const model2 = new Model({writable: '0'});
      expect(model1.isWritable()).toBe(true);
      expect(model2.isWritable()).toBe(false);
    });

    test('isOrphan() should return correct true/false', () => {
      const model1 = new Model({orphan: '1'});
      const model2 = new Model({orphan: '0'});
      expect(model1.isOrphan()).toBe(true);
      expect(model2.isOrphan()).toBe(false);
    });

    test('isActive() should return correct true/false', () => {
      const model1 = new Model({active: '1'});
      const model2 = new Model({active: '0'});
      expect(model1.isActive()).toBe(true);
      expect(model2.isActive()).toBe(false);
    });
});
