/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {getUserSettingsDefaults} from '../selectors';

const createRootState = state => ({
  userSettings: {
    defaults: state,
  },
});

describe('UserSettings Defaults selector tests', () => {
  test('should return false for isLoading and undefined state', () => {
    const rootState = createRootState();
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.isLoading()).toBe(false);
  });

  test('should return true for isLoading', () => {
    const rootState = createRootState({isLoading: true});
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.isLoading()).toBe(true);
  });

  test('should return false for isLoading', () => {
    const rootState = createRootState({isLoading: false});
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.isLoading()).toBe(false);
  });

  test('should return undefined for getError and undefined state', () => {
    const rootState = createRootState();
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getError()).toBeUndefined();
  });

  test('should return error', () => {
    const rootState = createRootState({error: 'An Error'});
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getError()).toEqual('An Error');
  });

  test('should return undefined for getByName and undefined state', () => {
    const rootState = createRootState();
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getByName('foo')).toBeUndefined();
  });

  test('should return undefined for getByName and empty state', () => {
    const rootState = createRootState({});
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getByName('foo')).toBeUndefined();
  });

  test('should return undefined for getByName and empty byName', () => {
    const rootState = createRootState({byName: {}});
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getByName('foo')).toBeUndefined();
  });

  test('should return setting for getByName', () => {
    const rootState = createRootState({
      byName: {
        foo: 'bar',
      },
    });
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getByName('foo')).toEqual('bar');
  });

  test('should return undefined for getValueByName and undefined state', () => {
    const rootState = createRootState();
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getValueByName('foo')).toBeUndefined();
  });

  test('should return undefined for getValueByName and empty byName', () => {
    const rootState = createRootState({byName: {}});
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getValueByName('foo')).toBeUndefined();
  });

  test('should return undefined for getValueByName and empty value', () => {
    const rootState = createRootState({
      byName: {
        foo: {},
      },
    });
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getValueByName('foo')).toBeUndefined();
  });

  test('should return value for getValueByName', () => {
    const rootState = createRootState({
      byName: {
        foo: {
          value: 'bar',
        },
      },
    });
    const selector = getUserSettingsDefaults(rootState);

    expect(selector.getValueByName('foo')).toEqual('bar');
  });
});

// vim: set ts=2 sw=2 tw=80:
