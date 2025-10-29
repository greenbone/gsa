/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {goToDetails, goToList} from 'web/entity/navigation';

describe('goToDetails', () => {
  test('should return a function', () => {
    const navigate = testing.fn();
    goToDetails('type', navigate);
    expect(goToDetails).toBeInstanceOf(Function);
  });

  test('should throw an error if navigate is not provided', () => {
    expect(() => goToDetails('type')).toThrowError(
      'navigate function is required for goToDetails',
    );
    expect(() => goToDetails('type', {})).toThrowError(
      'navigate function is required for goToDetails',
    );
    expect(() => goToDetails('type', {navigation: true})).toThrowError(
      'navigate function is required for goToDetails',
    );
  });

  test('should navigate to the details page', () => {
    const navigate = testing.fn();
    const goToDetailsFn = goToDetails('type', navigate);
    goToDetailsFn({data: {id: 1}});
    expect(navigate).toHaveBeenCalledWith('/type/1');
  });
});

describe('goToList', () => {
  test('should return a function', () => {
    const navigate = testing.fn();
    expect(goToList('type', navigate)).toBeInstanceOf(Function);
  });

  test('should throw an error if navigate is not provided', () => {
    expect(() => goToList('type')).toThrowError(
      'navigate function is required for goToList',
    );
    expect(() => goToList('type', {})).toThrowError(
      'navigate function is required for goToList',
    );
    expect(() => goToList('type', {navigation: true})).toThrowError(
      'navigate function is required for goToList',
    );
  });

  test('should navigate to the list page', () => {
    const navigate = testing.fn();
    const goToListFn = goToList('type', navigate);
    goToListFn();
    expect(navigate).toHaveBeenCalledWith('/type');
  });
});
