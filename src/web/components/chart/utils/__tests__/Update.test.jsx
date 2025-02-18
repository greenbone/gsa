/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {shouldUpdate} from '../Update';

describe('shouldUpdate tests', () => {
  test('should update if data identity has changed', () => {
    expect(shouldUpdate({data: {}}, {data: {}})).toEqual(true);
  });

  test('should update if width has changed', () => {
    expect(shouldUpdate({width: 100}, {width: 200})).toEqual(true);
  });

  test('should update if height has changed', () => {
    expect(shouldUpdate({height: 100}, {height: 200})).toEqual(true);
  });

  test('should update if showLegend has changed', () => {
    expect(shouldUpdate({showLegend: false}, {showLegend: true})).toEqual(true);
  });

  test('should not update if data identity has not changed', () => {
    const data = {foo: 1};
    expect(shouldUpdate({data}, {data})).toEqual(false);
  });

  test('should not update if width has not changed', () => {
    expect(shouldUpdate({width: 100}, {width: 100})).toEqual(false);
  });

  test('should not update if height has not changed', () => {
    expect(shouldUpdate({height: 100}, {height: 100})).toEqual(false);
  });

  test('should not update if showLegend has not changed', () => {
    expect(shouldUpdate({showLegend: true}, {showLegend: true})).toEqual(false);
  });

  test('should not update if unknown prop has changed', () => {
    expect(shouldUpdate({foo: false}, {foo: true})).toEqual(false);
  });
});
