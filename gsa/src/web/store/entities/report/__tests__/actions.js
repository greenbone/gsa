/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import Filter from 'gmp/models/filter';

import {isFunction} from 'gmp/utils/identity';

import {types} from 'web/store/entities/utils/actions';

import {createState, testEntityActions} from 'web/store/entities/utils/testing';

import {
  loadReport,
  loadReportIfNeeded,
  loadReportWithThreshold,
  reportActions,
} from '../actions';
import {reportIdentifier} from '../selectors';

const entityType = 'report';

testEntityActions('report', reportActions);

describe('loadReport function tests', () => {
  test('should load report successfully', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect(loadReport).toBeDefined();
    expect(isFunction(loadReport)).toBe(true);

    expect.assertions(7);

    return loadReport(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: true, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should load report with results filter successfully', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      [entityType]: {
        get,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect(loadReport).toBeDefined();
    expect(isFunction(loadReport)).toBe(true);

    expect.assertions(7);

    return loadReport(gmp)(id, {filter})(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: true, filter});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        filter,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        filter,
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should not load report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: true,
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect.assertions(3);

    return loadReport(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(get).not.toBeCalled();
    });
  });

  test('should fail loading entity with an error', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      [id]: {
        isLoading: false,
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockRejectedValue('An Error');

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect.assertions(5);

    return loadReport(gmp)(id)(dispatch, getState).catch(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: true, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_ERROR,
        entityType,
        error: 'An Error',
        id,
      });
    });
  });
});

describe('report loadReportIfNeeded function tests', () => {
  test('should load report successfully if needed', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockResolvedValue({data: {foo: 'bar'}});

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect.assertions(7);

    expect(loadReportIfNeeded).toBeDefined();
    expect(isFunction(loadReportIfNeeded)).toBe(true);

    return loadReportIfNeeded(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: false, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should not load report if report is already in store', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
      byId: {
        [id]: 'a1',
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect.assertions(3);

    return loadReportIfNeeded(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(get).not.toBeCalled();
    });
  });

  test('should load report with results filter successfully if needed', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockResolvedValue({data: {foo: 'bar'}});

    const gmp = {
      [entityType]: {
        get,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect.assertions(7);

    expect(loadReportIfNeeded).toBeDefined();
    expect(isFunction(loadReportIfNeeded)).toBe(true);

    return loadReportIfNeeded(gmp)(id, {filter})(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(get).toBeCalledWith({id}, {details: false, filter});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType,
          filter,
          data: {foo: 'bar'},
          id,
        });
      },
    );
  });

  test('should not load report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: true,
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect.assertions(3);

    return loadReportIfNeeded(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(get).not.toBeCalled();
    });
  });

  test('should fail loading entity with an error', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      [id]: {
        isLoading: false,
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockRejectedValue('An Error');

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect.assertions(5);

    return loadReportIfNeeded(gmp)(id)(dispatch, getState).catch(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: false, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          id,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_ERROR,
          entityType,
          error: 'An Error',
          id,
        },
      ]);
    });
  });
});

describe('loadReportWithThreshold tests', () => {
  test('should only load "simple" report', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = jest.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      [entityType]: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadReportWithThreshold).toBeDefined();
    expect(isFunction(loadReportWithThreshold)).toBe(true);

    expect.assertions(7);

    return loadReportWithThreshold(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: false, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        data: report,
        id,
      });
    });
  });

  test('should load "full" report', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = jest.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      [entityType]: {
        get,
      },
      settings: {
        reportResultsThreshold: 100001,
      },
    };

    expect(loadReportWithThreshold).toBeDefined();
    expect(isFunction(loadReportWithThreshold)).toBe(true);

    expect.assertions(11);

    return loadReportWithThreshold(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toHaveBeenCalledTimes(2);
      expect(get).toHaveBeenNthCalledWith(
        1,
        {id},
        {details: false, filter: undefined},
      );
      expect(get).toHaveBeenNthCalledWith(
        2,
        {id},
        {details: true, filter: undefined},
      );
      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        data: report,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(3, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(4, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        data: report,
        id,
      });
    });
  });

  test('should only load "simple" report with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const rootState = createState(entityType, {
      isLoading: {
        [reportIdentifier(id, filter)]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = jest.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      [entityType]: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadReportWithThreshold).toBeDefined();
    expect(isFunction(loadReportWithThreshold)).toBe(true);

    expect.assertions(7);

    return loadReportWithThreshold(gmp)(id, {filter})(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(get).toBeCalledWith({id}, {details: false, filter});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType,
          filter,
          data: report,
          id,
        });
      },
    );
  });

  test('should load "full" report with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const rootState = createState(entityType, {
      isLoading: {
        [reportIdentifier(id, filter)]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = jest.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      [entityType]: {
        get,
      },
      settings: {
        reportResultsThreshold: 100001,
      },
    };

    expect(loadReportWithThreshold).toBeDefined();
    expect(isFunction(loadReportWithThreshold)).toBe(true);

    expect.assertions(11);

    return loadReportWithThreshold(gmp)(id, {filter})(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(get).toHaveBeenCalledTimes(2);
        expect(get).toHaveBeenNthCalledWith(1, {id}, {details: false, filter});
        expect(get).toHaveBeenNthCalledWith(2, {id}, {details: true, filter});
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType,
          filter,
          data: report,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(4, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType,
          filter,
          data: report,
          id,
        });
      },
    );
  });

  test('should not load report if already loading', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: true,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = jest.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      [entityType]: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadReportWithThreshold).toBeDefined();
    expect(isFunction(loadReportWithThreshold)).toBe(true);

    expect.assertions(5);

    return loadReportWithThreshold(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  test('should not load report if already loading with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const rootState = createState(entityType, {
      isLoading: {
        [reportIdentifier(id, filter)]: true,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = jest.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      [entityType]: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadReportWithThreshold).toBeDefined();
    expect(isFunction(loadReportWithThreshold)).toBe(true);

    expect.assertions(5);

    return loadReportWithThreshold(gmp)(id, {filter})(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(get).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
      },
    );
  });
});
