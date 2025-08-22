/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {test, expect} from '@gsa/testing';
import {isDate} from 'gmp/models/date';
import Model from 'gmp/models/model';
import {parseDate, NO_VALUE, YES_VALUE} from 'gmp/parser';

interface ModelClass<T extends Model> {
  fromElement: (element?: Record<string, unknown>) => T;
  new (properties?: Record<string, unknown>): T;
}

interface TestOptions {
  testIsActive?: boolean;
  testName?: boolean;
}

const testId = <T extends Model>(modelClass: ModelClass<T>) => {
  test('should parse id', () => {
    const model1 = modelClass.fromElement({_id: '1337'});
    const model2 = modelClass.fromElement();
    const model3 = modelClass.fromElement({_id: ''});

    expect(model1.id).toEqual('1337');
    expect(model2.id).toBeUndefined();
    expect(model3.id).toBeUndefined();
  });

  test.skip('should not allow to overwrite id', () => {
    const model = modelClass.fromElement({_id: 'foo'});

    // @ts-expect-error
    expect(() => (model.id = 'bar')).toThrow();
  });
};

export const testModelFromElement = <T extends Model>(
  modelClass: ModelClass<T>,
  type: string,
  {testName = true}: {testName?: boolean} = {},
) => {
  test('should create instance of model class in fromElement', () => {
    const model = modelClass.fromElement();
    expect(model).toBeInstanceOf(modelClass);
  });

  test('should parse end time', () => {
    const model = modelClass.fromElement({
      end_time: '2018-10-10T11:41:23.022Z',
    });
    expect(model.endTime).toBeDefined();
    expect(isDate(model.endTime)).toBe(true);
  });

  test('should parse permissions', () => {
    const model = modelClass.fromElement({
      permissions: {
        permission: [{name: 'everything'}, {name: 'may_foo'}],
      },
    });
    expect(model.userCapabilities).toBeDefined();
    expect(model.userCapabilities.length).toEqual(2);
    expect(model.userCapabilities.mayAccess('foo')).toEqual(true);
  });

  test('should return empty userCapabilities if no permissions are given to the constructor', () => {
    const model = new modelClass();
    expect(model.userCapabilities).toBeDefined();
    expect(model.userCapabilities.length).toEqual(0);
  });

  test('should parse user tags', () => {
    const model = modelClass.fromElement({
      user_tags: {
        tag: [{_id: 'tag1', name: 'foo'}],
      },
    });
    expect(model.userTags).toBeDefined();
    expect(model.userTags[0].name).toEqual('foo');
    expect(model.userTags[0].entityType).toEqual('tag');

    const model2 = modelClass.fromElement();
    expect(model2.userTags).toEqual([]);
  });

  test('should parse owner', () => {
    const model = modelClass.fromElement({owner: {name: ''}});
    expect(model.owner).toBeUndefined();

    const model2 = modelClass.fromElement({
      owner: {name: 'foo'},
    });
    expect(model2.owner).toBeDefined();
    expect(model2.owner?.name).toEqual('foo');
  });

  test('should delete comment if comment is empty', () => {
    const elem = {comment: ''};
    const model = modelClass.fromElement(elem);

    expect(model.comment).toBeUndefined();
  });

  test('should apply entityType correctly', () => {
    const model = modelClass.fromElement();

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

  test('should parse creation time', () => {
    const model = modelClass.fromElement({
      creation_time: '2018-10-10T08:48:46Z',
    });
    expect(model.creationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
  });

  test('should parse modification time', () => {
    const model = modelClass.fromElement({
      modification_time: '2018-10-10T08:48:46Z',
    });
    expect(model.modificationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
  });

  test('should privatize type from Model', () => {
    const model = modelClass.fromElement({type: 'foo'});
    // @ts-expect-error
    expect(model.type).toBeUndefined();
    expect(model._type).toEqual('foo');
  });

  if (testName) {
    test('should parse name', () => {
      const model = modelClass.fromElement({name: 1337});

      expect(model.name).toEqual('1337');
    });
  }
};

export const testModelMethods = <T extends Model>(
  modelClass: ModelClass<T>,
  {testIsActive = true} = {},
) => {
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

export const testModel = <T extends Model>(
  modelClass: ModelClass<T>,
  type: string,
  options?: TestOptions,
) => {
  testModelFromElement(modelClass, type, options);
  testModelMethods(modelClass, options);
  testId(modelClass);
};
