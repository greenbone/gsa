/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {goToDetails, goToList} from 'web/entity/navigation';

describe('goToDetails', () => {
  test('should return a function', () => {
    const navigate = testing.fn();
    goToDetails('task', navigate);
    expect(goToDetails).toBeInstanceOf(Function);
  });

  test('should throw an error if navigate is not provided', () => {
    expect(() => goToDetails('task')).toThrow(
      'navigate function is required for goToDetails',
    );
    expect(() => goToDetails('task', {})).toThrow(
      'navigate function is required for goToDetails',
    );
    expect(() => goToDetails('task', {navigation: true})).toThrow(
      'navigate function is required for goToDetails',
    );
  });

  test('should navigate to the details page', () => {
    const navigate = testing.fn();
    const goToDetailsFn = goToDetails('task', navigate);
    goToDetailsFn({data: {id: 1}});
    expect(navigate).toHaveBeenCalledWith('/task/1');
  });
});

describe('goToList', () => {
  test('should return a function', () => {
    const navigate = testing.fn();
    expect(goToList('task', navigate)).toBeInstanceOf(Function);
  });

  test('should throw an error if navigate is not provided', () => {
    expect(() => goToList('task')).toThrow(
      'navigate function is required for goToList',
    );
    expect(() => goToList('task', {})).toThrow(
      'navigate function is required for goToList',
    );
    expect(() => goToList('task', {navigation: true})).toThrow(
      'navigate function is required for goToList',
    );
  });

  test('should navigate to the list page', () => {
    const navigate = testing.fn();
    const goToListFn = goToList('task', navigate);
    goToListFn();
    expect(navigate).toHaveBeenCalledWith('/tasks');
  });
});
