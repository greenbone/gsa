/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {test, expect} from '@gsa/testing';
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

  test.skip('should not allow to overwrite id', () => {
    const model = modelClass.fromElement({_id: 'foo'});

    expect(() => (model.id = 'bar')).toThrow();
  });
};

export const testModelFromElement = (
  modelClass,
  type,
  {testName = true} = {},
) => {
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

  test('should return empty userCapabilities if no permissions are given to the constructor', () => {
    const model = new modelClass();

    expect(model.userCapabilities).toBeDefined();
    expect(model.userCapabilities.length).toEqual(0);
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

  if (testName) {
    test('should ensure name is parsed as string', () => {
      const model = modelClass.fromElement({name: 1337});

      expect(model.name).toEqual('1337');
    });
  }
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

export const testModel = (modelClass, type, options) => {
  testModelFromElement(modelClass, type, options);
  testModelMethods(modelClass, options);
  testId(modelClass);
};
