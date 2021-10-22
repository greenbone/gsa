/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import {DEFAULT_FILTER_SETTINGS} from 'gmp/commands/users';

import Filter from 'gmp/models/filter';

import {
  defaultFilterLoadingActions,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR,
  loadUserSettingsDefaultFilter,
} from '../actions';

describe('defaultFilterLoadingActions tests', () => {
  test('should create a request action', () => {
    const action = defaultFilterLoadingActions.request('foo');

    expect(action).toEqual({
      type: USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST,
      entityType: 'foo',
    });
  });

  test('should create a success action', () => {
    const filter = Filter.fromString('foo=bar');
    const action = defaultFilterLoadingActions.success('foo', filter);

    expect(action).toEqual({
      type: USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS,
      entityType: 'foo',
      filter,
    });
  });

  test('should create an error action', () => {
    const action = defaultFilterLoadingActions.error(
      'foo',
      'An error occurred',
    );

    expect(action).toEqual({
      type: USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR,
      entityType: 'foo',
      error: 'An error occurred',
    });
  });
});

const createState = (type, state) => ({
  userSettings: {
    defaultFilters: {
      [type]: state,
    },
  },
});

describe('loadUserSettingsDefaultFilter tests', () => {
  test('should resolve if default is loaded already', () => {
    const getSetting = jest.fn();
    const getFilter = jest.fn();
    const gmp = {
      user: {
        getSetting,
      },
      filter: {
        get: getFilter,
      },
    };
    const state = createState('foo', {
      isLoading: true,
    });

    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);

    return loadUserSettingsDefaultFilter(gmp)('foo')(dispatch, getState).then(
      () => {
        expect(getState).toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
        expect(getSetting).not.toHaveBeenCalled();
        expect(getFilter).not.toHaveBeenCalled();
      },
    );
  });

  test('should dispatch success if setting is not available', () => {
    const entityType = 'task';
    const getSetting = jest.fn().mockResolvedValue({
      data: {},
    });
    const getFilter = jest.fn();
    const gmp = {
      user: {
        getSetting,
      },
      filter: {
        get: getFilter,
      },
    };
    const state = createState(entityType, {
      isLoading: false,
    });

    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);

    return loadUserSettingsDefaultFilter(gmp)(entityType)(
      dispatch,
      getState,
    ).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        defaultFilterLoadingActions.request(entityType),
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        defaultFilterLoadingActions.success(entityType, null),
      );
      expect(getSetting).toHaveBeenCalledWith(
        DEFAULT_FILTER_SETTINGS[entityType],
      );
      expect(getFilter).not.toHaveBeenCalled();
    });
  });

  test('should dispatch error if loading the setting errors', () => {
    const entityType = 'task';
    const getSetting = jest.fn().mockRejectedValue('An error');
    const getFilter = jest.fn();
    const gmp = {
      user: {
        getSetting,
      },
      filter: {
        get: getFilter,
      },
    };
    const state = createState(entityType, {
      isLoading: false,
    });

    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);

    return loadUserSettingsDefaultFilter(gmp)(entityType)(
      dispatch,
      getState,
    ).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        defaultFilterLoadingActions.request(entityType),
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        defaultFilterLoadingActions.error(entityType, 'An error'),
      );
      expect(getSetting).toHaveBeenCalledWith(
        DEFAULT_FILTER_SETTINGS[entityType],
      );
      expect(getFilter).not.toHaveBeenCalled();
    });
  });

  test('should dispatch success', () => {
    const filter = Filter.fromString('foo=bar');
    const entityType = 'task';
    const getSetting = jest.fn().mockResolvedValue({
      data: {
        value: 'foo',
      },
    });
    const getFilter = jest.fn().mockResolvedValue({data: filter});
    const gmp = {
      user: {
        getSetting,
      },
      filter: {
        get: getFilter,
      },
    };
    const state = createState(entityType, {
      isLoading: false,
    });

    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);

    return loadUserSettingsDefaultFilter(gmp)(entityType)(
      dispatch,
      getState,
    ).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        defaultFilterLoadingActions.request(entityType),
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        defaultFilterLoadingActions.success(entityType, filter),
      );
      expect(getSetting).toHaveBeenCalledWith(
        DEFAULT_FILTER_SETTINGS[entityType],
      );
      expect(getFilter).toHaveBeenCalledWith({id: 'foo'});
    });
  });

  test('should dispatch error if getFilter fails', () => {
    const entityType = 'task';
    const getSetting = jest.fn().mockResolvedValue({
      data: {
        value: 'foo',
      },
    });
    const getFilter = jest.fn().mockRejectedValue('An error');
    const gmp = {
      user: {
        getSetting,
      },
      filter: {
        get: getFilter,
      },
    };
    const state = createState(entityType, {
      isLoading: false,
    });

    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(state);

    return loadUserSettingsDefaultFilter(gmp)(entityType)(
      dispatch,
      getState,
    ).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        defaultFilterLoadingActions.request(entityType),
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        defaultFilterLoadingActions.error(entityType, 'An error'),
      );
      expect(getSetting).toHaveBeenCalledWith(
        DEFAULT_FILTER_SETTINGS[entityType],
      );
      expect(getFilter).toHaveBeenCalledWith({id: 'foo'});
    });
  });
});
