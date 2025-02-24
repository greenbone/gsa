/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';

const createState = state => ({
  dashboardSettings: {
    ...state,
  },
});

describe('dashboard settings selector init tests', () => {
  test('should not crash with undefined state', () => {
    const id = 'a1';
    const selector = getDashboardSettings();

    expect(selector.getById(id)).toBeUndefined();
    expect(selector.getIsLoading(id)).toEqual(false);
    expect(selector.getError(id)).toBeUndefined();
    expect(selector.getDefaultsById(id)).toEqual({});
    expect(selector.hasSettings(id)).toBe(false);
  });

  test('should not crash with empty state', () => {
    const id = 'a1';
    const selector = getDashboardSettings({});

    expect(selector.getById(id)).toBeUndefined();
    expect(selector.getIsLoading(id)).toEqual(false);
    expect(selector.getError(id)).toBeUndefined();
    expect(selector.getDefaultsById(id)).toEqual({});
    expect(selector.hasSettings(id)).toBe(false);
  });

  test('should not crash with empty dashboadSettings', () => {
    const id = 'a1';
    const rootState = createState({});

    const selector = getDashboardSettings(rootState);

    expect(selector.getById(id)).toBeUndefined();
    expect(selector.getIsLoading(id)).toBe(false);
    expect(selector.getError(id)).toBeUndefined();
    expect(selector.getDefaultsById(id)).toEqual({});
    expect(selector.hasSettings(id)).toBe(false);
  });
});

describe('dashboard setting selector isLoading tests', () => {
  test('should return isLoading', () => {
    const id = 'a1';
    const rootState = createState({
      isLoading: {
        [id]: true,
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getIsLoading(id)).toBe(true);
  });
});

describe('dashboard setting selector getError tests', () => {
  test('should return error', () => {
    const id = 'a1';
    const rootState = createState({
      errors: {
        [id]: 'An error',
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getError(id)).toEqual('An error');
  });
});

describe('dashboard setting selector getById tests', () => {
  test('should return settings', () => {
    const id = 'a1';
    const rootState = createState({
      byId: {
        [id]: {
          foo: 'bar',
        },
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getById(id)).toEqual({foo: 'bar'});
  });

  test('should return undefined if unknown id is passed', () => {
    const rootState = createState({
      byId: {},
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getById('a')).toBeUndefined();
  });
});

describe('dashboard setting selector getDefaultsById tests', () => {
  test('should return defaults', () => {
    const id = 'a1';
    const rootState = createState({
      defaults: {
        [id]: ['a', 'b'],
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getDefaultsById(id)).toEqual(['a', 'b']);
  });

  test('should return empty object if unknown id is passed', () => {
    const rootState = createState({
      defaults: {},
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getDefaultsById('a')).toEqual({});
  });
});

describe('dashboard setting selector hasSettings tests', () => {
  test('should return false for undefined state', () => {
    const selector = getDashboardSettings();

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return false for empty state', () => {
    const selector = getDashboardSettings({});

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return false for empty byId', () => {
    const rootState = createState({
      byId: {},
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return false for undefined id in byId', () => {
    const rootState = createState({
      byId: {
        a: undefined,
      },
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return true for empty id in byId', () => {
    const rootState = createState({
      byId: {
        a: {},
      },
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('a')).toBe(true);
  });

  test('should return false for other id in byId', () => {
    const rootState = createState({
      byId: {
        a: {},
      },
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('b')).toBe(false);
  });
});
