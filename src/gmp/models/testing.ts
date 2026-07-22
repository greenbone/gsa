/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {test, expect} from '@gsa/testing';
import {isDate} from 'gmp/models/date';
import type Model from 'gmp/models/model';
import {parseDate, NO_VALUE, YES_VALUE} from 'gmp/parser';

interface ModelElement {
  _id: string;
  [key: string]: unknown;
}

interface ModelProperties {
  id: string;
  [key: string]: unknown;
}

interface ModelClass<
  TModel extends Model,
  TElement = ModelElement,
  TProperties = ModelProperties,
> {
  fromElement: (element: TElement) => TModel;
  new (properties: TProperties): TModel;
}

interface TestOptions<TElement = ModelElement, TProperties = ModelProperties> {
  testIsActive?: boolean;
  testName?: boolean;
  testType?: boolean;
  initElementData?: TElement;
  initModelData?: TProperties;
}

const testId = <
  TModel extends Model,
  TElement = ModelElement,
  TProperties = ModelProperties,
>(
  modelClass: ModelClass<TModel, TElement, TProperties>,
) => {
  test('should parse id', () => {
    const model1 = modelClass.fromElement({_id: '1337'} as TElement);
    const model2 = modelClass.fromElement({_id: ''} as TElement);
    const model3 = modelClass.fromElement({} as TElement);

    expect(model1.id).toEqual('1337');
    expect(model2.id).toBeUndefined();
    expect(model3.id).toBeUndefined();
  });

  test.skip('should not allow to overwrite id', () => {
    const model = modelClass.fromElement({_id: 'foo'} as TElement);

    // @ts-expect-error
    expect(() => (model.id = 'bar')).toThrow();
  });
};

export const testModelFromElement = <
  TModel extends Model,
  TElement = ModelElement,
  TProperties = ModelProperties,
>(
  modelClass: ModelClass<TModel, TElement, TProperties>,
  type: string | undefined,
  {
    testName = true,
    testType = true,
    initElementData = {_id: '123'} as TElement,
    initModelData = {id: '123'} as TProperties,
  }: {
    testName?: boolean;
    testType?: boolean;
    initElementData?: TElement;
    initModelData?: TProperties;
  } = {},
) => {
  test('should create instance of model class in fromElement', () => {
    const model = modelClass.fromElement(initElementData);
    expect(model).toBeInstanceOf(modelClass);
  });

  test('should parse end time', () => {
    const model = modelClass.fromElement({
      ...initElementData,
      end_time: '2018-10-10T11:41:23.022Z',
    });
    expect(model.endTime).toBeDefined();
    expect(isDate(model.endTime)).toBe(true);
  });

  test('should parse permissions', () => {
    const model = modelClass.fromElement({
      ...initElementData,
      permissions: {
        permission: [{name: 'everything'}, {name: 'get_tasks'}],
      },
    });
    expect(model.userCapabilities).toBeDefined();
    expect(model.userCapabilities.length).toEqual(2);
    expect(model.userCapabilities.mayAccess('task')).toEqual(true);
  });

  test('should return empty userCapabilities if no permissions are given to the constructor', () => {
    const model = new modelClass(initModelData);
    expect(model.userCapabilities).toBeDefined();
    expect(model.userCapabilities.length).toEqual(0);
  });

  test('should parse user tags', () => {
    const model = modelClass.fromElement({
      ...initElementData,
      user_tags: {
        tag: [{name: 'foo'}],
      },
    });
    expect(model.userTags).toBeDefined();
    expect(model.userTags[0].name).toEqual('foo');
    expect(model.userTags[0].entityType).toEqual('tag');

    const model2 = modelClass.fromElement(initElementData);
    expect(model2.userTags).toEqual([]);
  });

  test('should parse owner', () => {
    const model = modelClass.fromElement({
      ...initElementData,
      owner: {name: ''},
    });
    expect(model.owner).toBeUndefined();

    const model2 = modelClass.fromElement({
      ...initElementData,
      owner: {name: 'foo'},
    });
    expect(model2.owner).toBeDefined();
    expect(model2.owner?.name).toEqual('foo');
  });

  test('should delete comment if comment is empty', () => {
    const model = modelClass.fromElement({
      ...initElementData,
      comment: '',
    });

    expect(model.comment).toBeUndefined();
  });

  test('should apply entityType correctly', () => {
    const model = modelClass.fromElement(initElementData);

    expect(model.entityType).toEqual(type);
  });

  test('should parse props as YES_VALUE/NO_VALUE', () => {
    const elem = {
      ...initElementData,
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
      ...initElementData,
      creation_time: '2018-10-10T08:48:46Z',
    });
    expect(model.creationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
  });

  test('should parse modification time', () => {
    const model = modelClass.fromElement({
      ...initElementData,
      modification_time: '2018-10-10T08:48:46Z',
    });
    expect(model.modificationTime).toEqual(parseDate('2018-10-10T08:48:46Z'));
  });

  if (testType) {
    test('should privatize type from Model', () => {
      const model = modelClass.fromElement({...initElementData, type: 'foo'});
      // @ts-expect-error
      expect(model.type).toBeUndefined();
      expect(model._type).toEqual('foo');
    });
  }

  if (testName) {
    test('should parse name', () => {
      const model = modelClass.fromElement({...initElementData, name: '1337'});

      expect(model.name).toEqual('1337');
    });
  }
};

export const testModelMethods = <
  TModel extends Model,
  TElement = ModelElement,
  TProperties = ModelProperties,
>(
  modelClass: ModelClass<TModel, TElement, TProperties>,
  {
    testIsActive = true,
    initElementData = {_id: '123'} as TElement,
  }: TestOptions<TElement, TProperties> = {},
) => {
  test('isInUse() should return correct true/false', () => {
    const model1 = modelClass.fromElement({...initElementData, in_use: '1'});
    const model2 = modelClass.fromElement({...initElementData, in_use: '0'});
    const model3 = modelClass.fromElement({...initElementData, in_use: '2'});
    const model4 = modelClass.fromElement({...initElementData});

    expect(model1.isInUse()).toBe(true);
    expect(model2.isInUse()).toBe(false);
    expect(model3.isInUse()).toBe(true);
    expect(model4.isInUse()).toBe(false);
  });

  test('isInTrash() should return correct true/false', () => {
    const model1 = modelClass.fromElement({...initElementData, trash: '1'});
    const model2 = modelClass.fromElement({...initElementData, trash: '0'});
    const model3 = modelClass.fromElement({...initElementData, trash: '2'});
    const model4 = modelClass.fromElement({...initElementData});

    expect(model1.isInTrash()).toBe(true);
    expect(model2.isInTrash()).toBe(false);
    expect(model3.isInTrash()).toBe(false);
    expect(model4.isInTrash()).toBe(false);
  });

  test('isWritable() should return correct true/false', () => {
    const model1 = modelClass.fromElement({...initElementData, writable: '1'});
    const model2 = modelClass.fromElement({...initElementData, writable: '0'});
    const model3 = modelClass.fromElement({...initElementData, writable: '2'});
    const model4 = modelClass.fromElement({...initElementData});

    expect(model1.isWritable()).toBe(true);
    expect(model2.isWritable()).toBe(false);
    expect(model3.isWritable()).toBe(false);
    expect(model4.isWritable()).toBe(true);
  });

  test('isOrphan() should return correct true/false', () => {
    const model1 = modelClass.fromElement({...initElementData, orphan: '1'});
    const model2 = modelClass.fromElement({...initElementData, orphan: '0'});
    const model3 = modelClass.fromElement({...initElementData, orphan: '2'});
    const model4 = modelClass.fromElement({...initElementData});

    expect(model1.isOrphan()).toBe(true);
    expect(model2.isOrphan()).toBe(false);
    expect(model3.isOrphan()).toBe(false);
    expect(model4.isOrphan()).toBe(false);
  });

  if (testIsActive) {
    test('isActive() should return correct true/false', () => {
      const model1 = modelClass.fromElement({...initElementData, active: '1'});
      const model2 = modelClass.fromElement({...initElementData, active: '0'});
      const model3 = modelClass.fromElement({...initElementData, active: '2'});
      const model4 = modelClass.fromElement({...initElementData});

      expect(model1.isActive()).toBe(true);
      expect(model2.isActive()).toBe(false);
      expect(model3.isActive()).toBe(false);
      expect(model4.isActive()).toBe(true);
    });
  }
};

export const testModel = <
  TModel extends Model,
  TElement = ModelElement,
  TProperties = ModelProperties,
>(
  modelClass: ModelClass<TModel, TElement, TProperties>,
  type: string | undefined,
  options?: TestOptions<TElement, TProperties>,
) => {
  testModelFromElement<TModel, TElement, TProperties>(
    modelClass,
    type,
    options,
  );
  testModelMethods<TModel, TElement, TProperties>(modelClass, options);
  testId<TModel, TElement, TProperties>(modelClass);
};
