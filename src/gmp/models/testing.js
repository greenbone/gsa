/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable max-len */

import {isDate} from 'gmp/models/date';
import {parseDate, NO_VALUE, YES_VALUE} from 'gmp/parser';

const testId = modelClass => {
  test('should set ID only for proper ID', () => {
    const model1 = modelClass.fromElement({_id: '1337'});
    const model2 = modelClass.fromElement({});
    const model3 = modelClass.fromElement({_id: ''});

    expect(model1.id).toEqual('1337');
    expect(model2.id).toBeUndefined();
    expect(model3.id).toBeUndefined();
  });

  test('should not allow to overwrite id', () => {
    const model = modelClass.fromElement({_id: 'foo'});

    expect(() => (model.id = 'bar')).toThrow();
  });
};

export const testModelFromElement = (modelClass, type) => {
  test('should create instance of modelclass in fromElement', () => {
    const model = modelClass.fromElement();
    expect(model).toBeInstanceOf(modelClass);
  });

  test('end_time is parsed correctly', () => {
    const elem = {
      end_time: '2018-10-10T11:41:23.022Z',
    };
    const model = modelClass.fromElement(elem);

    expect(model.endTime).toBeDefined();
    expect(model.end_time).toBeUndefined();
    expect(isDate(model.endTime)).toBe(true);
  });

  test('permissions are parsed correctly', () => {
    const elem = {
      permissions: {
        permission: [{name: 'everything'}, {name: 'may_foo'}],
      },
    };
    const model = modelClass.fromElement(elem);

    expect(model.userCapabilities).toBeDefined();
    expect(model.user_capabilities).toBeUndefined();
    expect(model.userCapabilities.length).toEqual(2);
    expect(model.userCapabilities.mayAccess('foo')).toEqual(true);
  });

  test('should return undefined for userCapabilities if no permissions are given to the constructor', () => {
    const model = new modelClass();

    expect(model.userCapabilities).toBeUndefined();
  });

  test('user_tags are parsed correctly', () => {
    const elem = {
      user_tags: {
        tag: [{name: 'foo'}],
      },
    };
    const model = modelClass.fromElement(elem);

    expect(model.userTags).toBeDefined();
    expect(model.user_tags).toBeUndefined();
    expect(model.userTags[0].name).toEqual('foo');
    expect(model.userTags[0].entityType).toEqual('tag');
  });

  test('should return empty array for userTags if no tags are given', () => {
    const model = modelClass.fromElement({});

    expect(model.userTags).toEqual([]);
  });

  test('should delete owner if owners name is empty', () => {
    const elem = {owner: {name: ''}};
    const model = modelClass.fromElement(elem);

    expect(model.owner).toBeUndefined();
  });

  test('should delete comment if comment is empty', () => {
    const elem = {comment: ''};
    const model = modelClass.fromElement(elem);

    expect(model.comment).toBeUndefined();
  });

  test('entityType is applied correctly', () => {
    const model = modelClass.fromElement({});

    expect(model.entityType).toEqual(type);
  });

  test('should parse props as YES_VALUE/NO_VALUE', () => {
    const elem = {
      writable: '0',
      orphan: '1',
      active: '0',
      trash: '1',
    };
    const model = modelClass.fromElement(elem);

    expect(model.writable).toEqual(NO_VALUE);
    expect(model.orphan).toEqual(YES_VALUE);
    expect(model.active).toEqual(NO_VALUE);
    expect(model.trash).toEqual(YES_VALUE);
  });

  test('should parse creation_time as date', () => {
    const model = modelClass.fromElement({
      creation_time: '2018-10-10T08:48:46Z',
    });

    expect(model.creationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
    expect(model.creation_time).toBeUndefined();
  });

  test('should parse no given creation_time as undefined', () => {
    const model = modelClass.fromElement({});

    expect(model.creationTime).toBeUndefined();
  });

  test('should parse modification_time as date', () => {
    const model = modelClass.fromElement({
      modification_time: '2018-10-10T08:48:46Z',
    });

    expect(model.modificationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
    expect(model.modification_time).toBeUndefined();
  });

  test('should parse no given modification_time as undefined', () => {
    const model = modelClass.fromElement({});

    expect(model.modificationTime).toBeUndefined();
  });

  test('should privatize type from Model', () => {
    const model = modelClass.fromElement({type: 'foo'});

    expect(model.type).toBeUndefined();
  });
};

export const testModelMethods = (modelClass, {testIsActive = true} = {}) => {
  test('isInUse() should return correct true/false', () => {
    const model1 = modelClass.fromElement({in_use: '1'});
    const model2 = modelClass.fromElement({in_use: '0'});
    const model3 = modelClass.fromElement({in_use: '2'});
    const model4 = modelClass.fromElement();

    expect(model1.isInUse()).toBe(true);
    expect(model2.isInUse()).toBe(false);
    expect(model3.isInUse()).toBe(true);
    expect(model4.isInUse()).toBe(false);
  });

  test('isInTrash() should return correct true/false', () => {
    const model1 = modelClass.fromElement({trash: '1'});
    const model2 = modelClass.fromElement({trash: '0'});
    const model3 = modelClass.fromElement({trash: '2'});
    const model4 = modelClass.fromElement();

    expect(model1.isInTrash()).toBe(true);
    expect(model2.isInTrash()).toBe(false);
    expect(model3.isInTrash()).toBe(false);
    expect(model4.isInTrash()).toBe(false);
  });

  test('isWritable() should return correct true/false', () => {
    const model1 = modelClass.fromElement({writable: '1'});
    const model2 = modelClass.fromElement({writable: '0'});
    const model3 = modelClass.fromElement({writable: '2'});
    const model4 = modelClass.fromElement();

    expect(model1.isWritable()).toBe(true);
    expect(model2.isWritable()).toBe(false);
    expect(model3.isWritable()).toBe(false);
    expect(model4.isWritable()).toBe(true);
  });

  test('isOrphan() should return correct true/false', () => {
    const model1 = modelClass.fromElement({orphan: '1'});
    const model2 = modelClass.fromElement({orphan: '0'});
    const model3 = modelClass.fromElement({orphan: '2'});
    const model4 = modelClass.fromElement();

    expect(model1.isOrphan()).toBe(true);
    expect(model2.isOrphan()).toBe(false);
    expect(model3.isOrphan()).toBe(false);
    expect(model4.isOrphan()).toBe(false);
  });

  if (testIsActive) {
    test('isActive() should return correct true/false', () => {
      const model1 = modelClass.fromElement({active: '1'});
      const model2 = modelClass.fromElement({active: '0'});
      const model3 = modelClass.fromElement({active: '2'});
      const model4 = modelClass.fromElement();

      expect(model1.isActive()).toBe(true);
      expect(model2.isActive()).toBe(false);
      expect(model3.isActive()).toBe(false);
      expect(model4.isActive()).toBe(true);
    });
  }
};

const testModelSetProperties = modelClass => {
  test('should not throw when setting undefined properties', () => {
    const model = new modelClass();
    model.setProperties();
  });

  test('should not throw when setting empty properties', () => {
    const model = new modelClass();
    model.setProperties({});
  });

  test('should allow to set arbitrary properties', () => {
    const model = new modelClass();
    model.setProperties({foo: 'bar', bar: 1});

    expect(model.foo).toEqual('bar');
    expect(model.bar).toEqual(1);
  });

  test('should not allow to override properties', () => {
    const model = new modelClass();
    model.setProperties({foo: 'bar', bar: 1});

    expect(model.foo).toEqual('bar');
    expect(model.bar).toEqual(1);

    expect(() => {
      model.setProperties({bar: 2});
    }).toThrow();

    expect(model.foo).toEqual('bar');
    expect(model.bar).toEqual(1);
  });

  test('should not allow to set additional properties', () => {
    const model = new modelClass();
    model.setProperties({foo: 'bar', bar: 1});

    expect(model.foo).toEqual('bar');
    expect(model.bar).toEqual(1);

    model.setProperties({lorem: {}});

    expect(model.foo).toEqual('bar');
    expect(model.bar).toEqual(1);
    expect(model.lorem).toEqual({});
  });
};

const testModelGetProperties = (modelClass, type) => {
  test('should return set properties', () => {
    const model = new modelClass();
    model.setProperties({foo: 'bar', bar: 1});

    const props = model.getProperties();

    expect(props.foo).toEqual('bar');
    expect(props.bar).toEqual(1);
    expect(props.entityType).toEqual(type);
  });

  test('should return parsed default element properties', () => {
    const model = modelClass.fromElement();

    const props = model.getProperties();

    expect(props.userCapabilities).toBeDefined();
    expect(props.userCapabilities.areDefined()).toEqual(false);
    expect(props.userTags).toEqual([]);
    expect(props.entityType).toEqual(type);
  });
};

export const testModel = (modelClass, type, options) => {
  testModelFromElement(modelClass, type);
  testModelMethods(modelClass, options);
  testModelSetProperties(modelClass);
  testModelGetProperties(modelClass, type);
  testId(modelClass);
};

// vim: set ts=2 sw=2 tw=80:
