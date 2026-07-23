/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  VULNS_HOSTS,
  VULNS_SEVERITY,
  vulnerabilitiesHostsLoader,
  vulnerabilitiesSeverityLoader,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';
import {
  DASHBOARD_DATA_LOADING_ERROR,
  DASHBOARD_DATA_LOADING_REQUEST,
  DASHBOARD_DATA_LOADING_SUCCESS,
} from 'web/store/dashboard/data/actions';

describe('Vulnerabilities Loaders', () => {
  test('should export severity data ID', () => {
    expect(VULNS_SEVERITY).toBe('vulns-severity');
  });

  test('should export hosts data ID', () => {
    expect(VULNS_HOSTS).toBe('vulns-hosts');
  });

  test('should export vulnerabilitiesSeverityLoader as a function', () => {
    expect(typeof vulnerabilitiesSeverityLoader).toBe('function');
  });

  test('should export vulnerabilitiesHostsLoader as a function', () => {
    expect(typeof vulnerabilitiesHostsLoader).toBe('function');
  });

  test('vulnerabilitiesSeverityLoader should load and dispatch severity aggregates', () => {
    const data = [{value: 5, count: 10}];
    const mockGetSeverityAggregates = testing.fn().mockResolvedValue({data});
    const gmp = {
      vulns: {
        getSeverityAggregates: mockGetSeverityAggregates,
      },
    };
    const filter = QueryFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnerabilitiesSeverityLoader({gmp, filter})(
      dispatch,
      getState,
    ).then(() => {
      expect(mockGetSeverityAggregates).toHaveBeenCalledWith({filter});
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: DASHBOARD_DATA_LOADING_REQUEST,
        id: VULNS_SEVERITY,
        filter,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_SUCCESS,
        id: VULNS_SEVERITY,
        filter,
        data,
      });
    });
  });

  test('vulnerabilitiesSeverityLoader should dispatch an error when loading fails', () => {
    const error = new Error('An error');
    const mockGetSeverityAggregates = testing.fn().mockRejectedValue(error);
    const gmp = {
      vulns: {
        getSeverityAggregates: mockGetSeverityAggregates,
      },
    };
    const filter = QueryFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnerabilitiesSeverityLoader({gmp, filter})(
      dispatch,
      getState,
    ).then(() => {
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_ERROR,
        id: VULNS_SEVERITY,
        filter,
        error,
      });
    });
  });

  test('vulnerabilitiesHostsLoader should load and dispatch host aggregates', () => {
    const data = [{value: 1, count: 5}];
    const mockGetHostAggregates = testing.fn().mockResolvedValue({data});
    const gmp = {
      vulns: {
        getHostAggregates: mockGetHostAggregates,
      },
    };
    const filter = QueryFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnerabilitiesHostsLoader({gmp, filter})(dispatch, getState).then(
      () => {
        expect(mockGetHostAggregates).toHaveBeenCalledWith({filter});
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: DASHBOARD_DATA_LOADING_REQUEST,
          id: VULNS_HOSTS,
          filter,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: DASHBOARD_DATA_LOADING_SUCCESS,
          id: VULNS_HOSTS,
          filter,
          data,
        });
      },
    );
  });

  test('vulnerabilitiesHostsLoader should dispatch an error when loading fails', () => {
    const error = new Error('An error');
    const mockGetHostAggregates = testing.fn().mockRejectedValue(error);
    const gmp = {
      vulns: {
        getHostAggregates: mockGetHostAggregates,
      },
    };
    const filter = QueryFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnerabilitiesHostsLoader({gmp, filter})(dispatch, getState).then(
      () => {
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: DASHBOARD_DATA_LOADING_ERROR,
          id: VULNS_HOSTS,
          filter,
          error,
        });
      },
    );
  });
});
