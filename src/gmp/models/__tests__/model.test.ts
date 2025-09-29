/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model, {parseModelFromElement} from 'gmp/models/model';
import {testModel} from 'gmp/models/testing';

describe('Model tests', () => {
  testModel(Model, undefined);
});

describe('parseModelFromElement tests', () => {
  test('should parse model', () => {
    const element = {
      _id: '1',
    };
    // @ts-expect-error
    const model = parseModelFromElement(element);

    expect(model.id).toEqual('1');
    expect(model).toBeInstanceOf(Model);
    expect(model.entityType).toBeUndefined();
  });

  test('should parse model and set entity type', () => {
    const element = {
      _id: '1',
    };
    const model = parseModelFromElement(element, 'task');

    expect(model.id).toEqual('1');
    expect(model).toBeInstanceOf(Model);
    expect(model.entityType).toEqual('task');
  });
});
