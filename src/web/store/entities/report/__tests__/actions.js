/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Filter from 'gmp/models/filter';

import {isFunction} from 'gmp/utils/identity';

import {types} from 'web/store/entities/utils/actions';

import {createState, testEntityActions} from 'web/store/entities/utils/testing';

import {
  auditReportActions,
  deltaReportActions,
  loadReport,
  loadAuditReport,
  loadAuditReportIfNeeded,
  loadAuditReportWithThreshold,
  loadDeltaReport,
  loadDeltaAuditReport,
  loadReportIfNeeded,
  loadReportWithThreshold,
  reportActions,
} from '../actions';

import {reportIdentifier} from '../selectors';

testEntityActions('report', reportActions);
testEntityActions('deltaReport', deltaReportActions);
testEntityActions('auditreport', auditReportActions);

describe('loadReport function tests', () => {
  test('should load report successfully', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      report: {
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
        entityType: 'report',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'report',
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should load report with results filter successfully', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      report: {
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
        entityType: 'report',
        filter,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'report',
        filter,
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should not load report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: true,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      report: {
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

  test('should fail loading report with an error', () => {
    const id = 'a1';
    const rootState = createState('report', {
      [id]: {
        isLoading: false,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockRejectedValue('An Error');

    const gmp = {
      report: {
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
        entityType: 'report',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_ERROR,
        entityType: 'report',
        error: 'An Error',
        id,
      });
    });
  });
});

describe('report loadReportIfNeeded function tests', () => {
  test('should load report successfully if needed', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({data: {foo: 'bar'}});

    const gmp = {
      report: {
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
        entityType: 'report',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'report',
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should not load report if report is already in store', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: false,
      },
      byId: {
        [id]: 'a1',
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      report: {
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
    const rootState = createState('report', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({data: {foo: 'bar'}});

    const gmp = {
      report: {
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
          entityType: 'report',
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'report',
          filter,
          data: {foo: 'bar'},
          id,
        });
      },
    );
  });

  test('should not load report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: true,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      report: {
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

  test('should fail loading report with an error', () => {
    const id = 'a1';
    const rootState = createState('report', {
      [id]: {
        isLoading: false,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockRejectedValue('An Error');

    const gmp = {
      report: {
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
          entityType: 'report',
          id,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_ERROR,
          entityType: 'report',
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
    const rootState = createState('report', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      report: {
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
        entityType: 'report',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'report',
        data: report,
        id,
      });
    });
  });

  test('should load "full" report', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      report: {
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
        entityType: 'report',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'report',
        data: report,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(3, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'report',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(4, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'report',
        data: report,
        id,
      });
    });
  });

  test('should only load "simple" report with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const rootState = createState('report', {
      isLoading: {
        [reportIdentifier(id, filter)]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      report: {
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
          entityType: 'report',
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'report',
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
    const rootState = createState('report', {
      isLoading: {
        [reportIdentifier(id, filter)]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      report: {
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
          entityType: 'report',
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'report',
          filter,
          data: report,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'report',
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(4, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'report',
          filter,
          data: report,
          id,
        });
      },
    );
  });

  test('should not load report if already loading', () => {
    const id = 'a1';
    const rootState = createState('report', {
      isLoading: {
        [id]: true,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      report: {
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
    const rootState = createState('report', {
      isLoading: {
        [reportIdentifier(id, filter)]: true,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const report = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: report,
    });

    const gmp = {
      report: {
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

describe('loadDeltaReport function tests', () => {
  test('should load delta report successfully', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      report: {
        getDelta,
      },
    };

    expect(loadDeltaReport).toBeDefined();
    expect(isFunction(loadDeltaReport)).toBe(true);

    return loadDeltaReport(gmp)(id, deltaId)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(getDelta).toBeCalledWith({id}, {id: deltaId}, {filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'deltaReport',
          id: identifier,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'deltaReport',
          data: {foo: 'bar'},
          id: identifier,
        },
      ]);
    });
  });

  test('should load delta report with results filter successfully', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      report: {
        getDelta,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect(loadDeltaReport).toBeDefined();
    expect(isFunction(loadDeltaReport)).toBe(true);

    return loadDeltaReport(gmp)(
      id,
      deltaId,
      filter,
    )(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(getDelta).toBeCalledWith({id}, {id: deltaId}, {filter});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'deltaReport',
          id: identifier,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'deltaReport',
          data: {foo: 'bar'},
          id: identifier,
        },
      ]);
    });
  });

  test('should not load delta report if isLoading is true', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: true,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      report: {
        getDelta,
      },
    };

    return loadDeltaReport(gmp)(id, deltaId)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(getDelta).not.toBeCalled();
    });
  });

  test('should fail loading delta report with an error', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      [identifier]: {
        isLoading: false,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockRejectedValue('An Error');

    const gmp = {
      report: {
        getDelta,
      },
    };

    return loadDeltaReport(gmp)(id, deltaId)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(getDelta).toBeCalledWith({id}, {id: deltaId}, {filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'deltaReport',
          id: identifier,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_ERROR,
          entityType: 'deltaReport',
          error: 'An Error',
          id: identifier,
        },
      ]);
    });
  });
});

describe('loadAuditReport function tests', () => {
  test('should load audit report successfully', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      auditreport: {
        get,
      },
    };

    expect(loadAuditReport).toBeDefined();
    expect(isFunction(loadAuditReport)).toBe(true);

    expect.assertions(7);

    return loadAuditReport(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: true, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'auditreport',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'auditreport',
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should load audit report with results filter successfully', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      auditreport: {
        get,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect(loadAuditReport).toBeDefined();
    expect(isFunction(loadAuditReport)).toBe(true);

    expect.assertions(7);

    return loadAuditReport(gmp)(id, {filter})(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: true, filter});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'auditreport',
        filter,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'auditreport',
        filter,
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should not load audit report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: true,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      auditreport: {
        get,
      },
    };

    expect.assertions(3);

    return loadAuditReport(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(get).not.toBeCalled();
    });
  });

  test('should fail loading audit report with an error', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      [id]: {
        isLoading: false,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockRejectedValue('An Error');

    const gmp = {
      auditreport: {
        get,
      },
    };

    expect.assertions(5);

    return loadAuditReport(gmp)(id)(dispatch, getState).catch(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: true, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'auditreport',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_ERROR,
        entityType: 'auditreport',
        error: 'An Error',
        id,
      });
    });
  });
});

describe('report loadAuditReportIfNeeded function tests', () => {
  test('should load audit report successfully if needed', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({data: {foo: 'bar'}});

    const gmp = {
      auditreport: {
        get,
      },
    };

    expect.assertions(7);

    expect(loadAuditReportIfNeeded).toBeDefined();
    expect(isFunction(loadAuditReportIfNeeded)).toBe(true);

    return loadAuditReportIfNeeded(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: false, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'auditreport',
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'auditreport',
        data: {foo: 'bar'},
        id,
      });
    });
  });

  test('should not load audit report if report is already in store', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: false,
      },
      byId: {
        [id]: 'a1',
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      auditreport: {
        get,
      },
    };

    expect.assertions(3);

    return loadAuditReportIfNeeded(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(get).not.toBeCalled();
    });
  });

  test('should load audit report with results filter successfully if needed', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue({data: {foo: 'bar'}});

    const gmp = {
      auditreport: {
        get,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect.assertions(7);

    expect(loadAuditReportIfNeeded).toBeDefined();
    expect(isFunction(loadAuditReportIfNeeded)).toBe(true);

    return loadAuditReportIfNeeded(gmp)(id, {filter})(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(get).toBeCalledWith({id}, {details: false, filter});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'auditreport',
          filter,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'auditreport',
          filter,
          data: {foo: 'bar'},
          id,
        });
      },
    );
  });

  test('should not audit load report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: true,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      auditreport: {
        get,
      },
    };

    expect.assertions(3);

    return loadAuditReportIfNeeded(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(get).not.toBeCalled();
    });
  });

  test('should fail loading audit report with an error', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      [id]: {
        isLoading: false,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const get = testing.fn().mockRejectedValue('An Error');

    const gmp = {
      auditreport: {
        get,
      },
    };

    expect.assertions(5);

    return loadAuditReportIfNeeded(gmp)(id)(dispatch, getState).catch(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: false, filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'auditreport',
          id,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_ERROR,
          entityType: 'auditreport',
          error: 'An Error',
          id,
        },
      ]);
    });
  });
});

describe('loadAuditReportWithThreshold tests', () => {
  test('should only load "simple" audit report', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const auditreport = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: auditreport,
    });

    const gmp = {
      auditreport: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadAuditReportWithThreshold).toBeDefined();
    expect(isFunction(loadAuditReportWithThreshold)).toBe(true);

    expect.assertions(7);

    return loadAuditReportWithThreshold(gmp)(id)(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(get).toBeCalledWith({id}, {details: false, filter: undefined});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'auditreport',
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'auditreport',
          data: auditreport,
          id,
        });
      },
    );
  });

  test('should load "full" audit report', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const auditreport = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: auditreport,
    });

    const gmp = {
      auditreport: {
        get,
      },
      settings: {
        reportResultsThreshold: 100001,
      },
    };

    expect(loadAuditReportWithThreshold).toBeDefined();
    expect(isFunction(loadAuditReportWithThreshold)).toBe(true);

    expect.assertions(11);

    return loadAuditReportWithThreshold(gmp)(id)(dispatch, getState).then(
      () => {
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
          entityType: 'auditreport',
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'auditreport',
          data: auditreport,
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'auditreport',
          id,
        });
        expect(dispatch).toHaveBeenNthCalledWith(4, {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'auditreport',
          data: auditreport,
          id,
        });
      },
    );
  });

  test('should only load "simple" audit report with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const rootState = createState('auditreport', {
      isLoading: {
        [reportIdentifier(id, filter)]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const auditreport = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: auditreport,
    });

    const gmp = {
      auditreport: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadAuditReportWithThreshold).toBeDefined();
    expect(isFunction(loadAuditReportWithThreshold)).toBe(true);

    expect.assertions(7);

    return loadAuditReportWithThreshold(gmp)(id, {filter})(
      dispatch,
      getState,
    ).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {details: false, filter});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'auditreport',
        filter,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'auditreport',
        filter,
        data: auditreport,
        id,
      });
    });
  });

  test('should load "full" audit report with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const rootState = createState('auditreport', {
      isLoading: {
        [reportIdentifier(id, filter)]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const auditreport = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: auditreport,
    });

    const gmp = {
      auditreport: {
        get,
      },
      settings: {
        reportResultsThreshold: 100001,
      },
    };

    expect(loadAuditReportWithThreshold).toBeDefined();
    expect(isFunction(loadAuditReportWithThreshold)).toBe(true);

    expect.assertions(11);

    return loadAuditReportWithThreshold(gmp)(id, {filter})(
      dispatch,
      getState,
    ).then(() => {
      expect(getState).toBeCalled();
      expect(get).toHaveBeenCalledTimes(2);
      expect(get).toHaveBeenNthCalledWith(1, {id}, {details: false, filter});
      expect(get).toHaveBeenNthCalledWith(2, {id}, {details: true, filter});
      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'auditreport',
        filter,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'auditreport',
        filter,
        data: auditreport,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(3, {
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'auditreport',
        filter,
        id,
      });
      expect(dispatch).toHaveBeenNthCalledWith(4, {
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'auditreport',
        filter,
        data: auditreport,
        id,
      });
    });
  });

  test('should not load audit report if already loading', () => {
    const id = 'a1';
    const rootState = createState('auditreport', {
      isLoading: {
        [id]: true,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const auditreport = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: auditreport,
    });

    const gmp = {
      auditreport: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadAuditReportWithThreshold).toBeDefined();
    expect(isFunction(loadAuditReportWithThreshold)).toBe(true);

    expect.assertions(5);

    return loadAuditReportWithThreshold(gmp)(id)(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(get).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
      },
    );
  });

  test('should not audit load report if already loading with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const rootState = createState('auditreport', {
      isLoading: {
        [reportIdentifier(id, filter)]: true,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const auditreport = {
      report: {
        results: {
          counts: {
            filtered: 10000,
          },
        },
      },
    };

    const get = testing.fn().mockResolvedValue({
      data: auditreport,
    });

    const gmp = {
      auditreport: {
        get,
      },
      settings: {
        reportResultsThreshold: 1000,
      },
    };

    expect(loadAuditReportWithThreshold).toBeDefined();
    expect(isFunction(loadAuditReportWithThreshold)).toBe(true);

    expect.assertions(5);

    return loadAuditReportWithThreshold(gmp)(id, {filter})(
      dispatch,
      getState,
    ).then(() => {
      expect(getState).toBeCalled();
      expect(get).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});

describe('loadDeltaAuditReport function tests', () => {
  test('should load delta audit report successfully', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaAuditReport', {
      isLoading: {
        [identifier]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      auditreport: {
        getDelta,
      },
    };

    expect(loadDeltaAuditReport).toBeDefined();
    expect(isFunction(loadDeltaAuditReport)).toBe(true);

    return loadDeltaAuditReport(gmp)(id, deltaId)(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(getDelta).toBeCalledWith(
          {id},
          {id: deltaId},
          {filter: undefined},
        );
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([
          {
            type: types.ENTITY_LOADING_REQUEST,
            entityType: 'deltaAuditReport',
            id: identifier,
          },
        ]);
        expect(dispatch.mock.calls[1]).toEqual([
          {
            type: types.ENTITY_LOADING_SUCCESS,
            entityType: 'deltaAuditReport',
            data: {foo: 'bar'},
            id: identifier,
          },
        ]);
      },
    );
  });

  test('should load delta audit report with results filter successfully', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaAuditReport', {
      isLoading: {
        [identifier]: false,
      },
    });
    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockResolvedValue({
      data: {foo: 'bar'},
    });

    const gmp = {
      auditreport: {
        getDelta,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect(loadDeltaAuditReport).toBeDefined();
    expect(isFunction(loadDeltaReport)).toBe(true);

    return loadDeltaAuditReport(gmp)(
      id,
      deltaId,
      filter,
    )(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(getDelta).toBeCalledWith({id}, {id: deltaId}, {filter});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'deltaAuditReport',
          id: identifier,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'deltaAuditReport',
          data: {foo: 'bar'},
          id: identifier,
        },
      ]);
    });
  });

  test('should not load audit delta report if isLoading is true', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaAuditReport', {
      isLoading: {
        [identifier]: true,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockResolvedValue([{id: 'foo'}]);

    const gmp = {
      auditreport: {
        getDelta,
      },
    };

    return loadDeltaAuditReport(gmp)(id, deltaId)(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(dispatch).not.toBeCalled();
        expect(getDelta).not.toBeCalled();
      },
    );
  });

  test('should fail loading audit delta report with an error', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaAuditReport', {
      [identifier]: {
        isLoading: false,
      },
    });

    const getState = testing.fn().mockReturnValue(rootState);

    const dispatch = testing.fn();

    const getDelta = testing.fn().mockRejectedValue('An Error');

    const gmp = {
      auditreport: {
        getDelta,
      },
    };

    return loadDeltaAuditReport(gmp)(id, deltaId)(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(getDelta).toBeCalledWith(
          {id},
          {id: deltaId},
          {filter: undefined},
        );
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([
          {
            type: types.ENTITY_LOADING_REQUEST,
            entityType: 'deltaAuditReport',
            id: identifier,
          },
        ]);
        expect(dispatch.mock.calls[1]).toEqual([
          {
            type: types.ENTITY_LOADING_ERROR,
            entityType: 'deltaAuditReport',
            error: 'An Error',
            id: identifier,
          },
        ]);
      },
    );
  });
});
