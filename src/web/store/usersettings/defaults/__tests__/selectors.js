/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
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
