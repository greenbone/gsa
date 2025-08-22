/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {DEFAULT_FILTER_SETTINGS} from 'gmp/commands/user';
import Filter from 'gmp/models/filter';
import {
  defaultFilterLoadingActions,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR,
  loadUserSettingsDefaultFilter,
} from 'web/store/usersettings/defaultfilters/actions';

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

  test('should create an optimistic update action', () => {
    const filter = {id: 'filterId123'};
    const action = defaultFilterLoadingActions.optimisticUpdate('foo', filter);

    expect(action).toEqual({
      type: 'USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE',
      entityType: 'foo',
      filter,
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
    const getSetting = testing.fn();
    const getFilter = testing.fn();
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

    const dispatch = testing.fn();
    const getState = testing.fn().mockReturnValue(state);

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
    const getSetting = testing.fn().mockResolvedValue({
      data: {},
    });
    const getFilter = testing.fn();
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

    const dispatch = testing.fn();
    const getState = testing.fn().mockReturnValue(state);

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
    const getSetting = testing.fn().mockRejectedValue('An error');
    const getFilter = testing.fn();
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

    const dispatch = testing.fn();
    const getState = testing.fn().mockReturnValue(state);

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
    const getSetting = testing.fn().mockResolvedValue({
      data: {
        value: 'foo',
      },
    });
    const getFilter = testing.fn().mockResolvedValue({data: filter});
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

    const dispatch = testing.fn();
    const getState = testing.fn().mockReturnValue(state);

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
    const getSetting = testing.fn().mockResolvedValue({
      data: {
        value: 'foo',
      },
    });
    const getFilter = testing.fn().mockRejectedValue('An error');
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

    const dispatch = testing.fn();
    const getState = testing.fn().mockReturnValue(state);

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
