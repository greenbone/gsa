/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import BaseModel, {parseBaseModelProperties} from 'gmp/models/basemodel';
import date from 'gmp/models/date';

describe('BaseModel tests', () => {
  test('should create an instance of BaseModel', () => {
    const model = new BaseModel();
    expect(model.id).toBeUndefined();
    expect(model.creationTime).toBeUndefined();
    expect(model.modificationTime).toBeUndefined();
    expect(model._type).toBeUndefined();
  });

  test('should create empty BaseModel from element', () => {
    const element = {};
    const model = BaseModel.fromElement(element);
    expect(model.id).toBeUndefined();
    expect(model.creationTime).toBeUndefined();
    expect(model.modificationTime).toBeUndefined();
    expect(model._type).toBeUndefined();
  });

  test('should parse properties from element', () => {
    const element = {
      _id: '1',
      creation_time: '2024-01-01T00:00:00Z',
      modification_time: '2024-01-02T00:00:00Z',
      type: 'test',
    };
    const model = BaseModel.fromElement(element);

    expect(model.id).toEqual('1');
    expect(model.creationTime).toEqual(date('2024-01-01T00:00:00.000Z'));
    expect(model.modificationTime).toEqual(date('2024-01-02T00:00:00.000Z'));
    expect(model._type).toEqual('test');
  });
});

describe('parseBaseModelProperties tests', () => {
  test('should return empty properties for empty element', () => {
    const properties = parseBaseModelProperties({});
    expect(properties).toEqual({});
  });

  test('should parse properties from BaseModelElement', () => {
    const element = {
      _id: '1',
      creation_time: '2024-01-01T00:00:00Z',
      modification_time: '2024-01-02T00:00:00Z',
      type: 'test',
    };
    const properties = parseBaseModelProperties(element);

    expect(properties.id).toEqual('1');
    expect(properties.creationTime).toEqual(date('2024-01-01T00:00:00.000Z'));
    expect(properties.modificationTime).toEqual(
      date('2024-01-02T00:00:00.000Z'),
    );
    expect(properties._type).toEqual('test');
  });
});
