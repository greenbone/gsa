/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {parseInfoEntities} from 'gmp/collection/parser';
import Model, {Element} from 'gmp/models/model';

describe('parseInfoEntities test', () => {
  test('should return empty array', () => {
    const response = {
      info: [],
    };
    const name = 'test';
    const modelClass = {
      fromElement: testing.fn(),
    };
    const filterFunc = testing.fn();

    const result = parseInfoEntities(response, name, modelClass, filterFunc);

    expect(result).toEqual([]);
  });

  test('should return parsed entities', () => {
    const response = {
      info: [
        {id: '1', something: 'test1'},
        {id: '2', something: 'test2'},
      ],
    };
    const name = 'test';
    const modelClass = {
      fromElement: (element: Element) =>
        ({
          id: element.id,
          name: element.something,
        }) as Model,
    };
    const filterFunc = () => true;

    const result = parseInfoEntities(response, name, modelClass, filterFunc);

    expect(result).toEqual([
      {id: '1', name: 'test1'},
      {id: '2', name: 'test2'},
    ]);
  });

  test('should allow to filter elements', () => {
    const response = {
      info: [
        {id: '1', something: 'test1'},
        {id: '2', something: 'test2'},
      ],
    };
    const name = 'test';
    const modelClass = {
      fromElement: (element: Element) =>
        ({
          id: element.id,
          name: element.something,
        }) as Model,
    };
    const filterFunc = (element: Element) => element.id !== '1';

    const result = parseInfoEntities(response, name, modelClass, filterFunc);

    expect(result).toEqual([{id: '2', name: 'test2'}]);
  });
});
