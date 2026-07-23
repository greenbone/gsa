/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import BaseFilter from 'gmp/models/filter/base-filter';
import {
  VULNS_HOSTS,
  VULNS_SEVERITY,
  vulnsHostsLoader,
  vulnsSeverityLoader,
} from 'web/pages/vulns/dashboard/VulnsLoaders';
import {
  DASHBOARD_DATA_LOADING_ERROR,
  DASHBOARD_DATA_LOADING_REQUEST,
  DASHBOARD_DATA_LOADING_SUCCESS,
} from 'web/store/dashboard/data/actions';

describe('Vulns Loaders', () => {
  test('should export severity data ID', () => {
    expect(VULNS_SEVERITY).toBe('vulns-severity');
  });

  test('should export hosts data ID', () => {
    expect(VULNS_HOSTS).toBe('vulns-hosts');
  });

  test('should export vulnsSeverityLoader as a function', () => {
    expect(typeof vulnsSeverityLoader).toBe('function');
  });

  test('should export vulnsHostsLoader as a function', () => {
    expect(typeof vulnsHostsLoader).toBe('function');
  });

  test('vulnsSeverityLoader should load and dispatch severity aggregates', () => {
    const data = [{value: 5, count: 10}];
    const mockGetSeverityAggregates = testing.fn().mockResolvedValue({data});
    const gmp = {
      vulns: {
        getSeverityAggregates: mockGetSeverityAggregates,
      },
    };
    const filter = BaseFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnsSeverityLoader({gmp, filter})(dispatch, getState).then(() => {
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

  test('vulnsSeverityLoader should dispatch an error when loading fails', () => {
    const error = new Error('An error');
    const mockGetSeverityAggregates = testing.fn().mockRejectedValue(error);
    const gmp = {
      vulns: {
        getSeverityAggregates: mockGetSeverityAggregates,
      },
    };
    const filter = BaseFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnsSeverityLoader({gmp, filter})(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_ERROR,
        id: VULNS_SEVERITY,
        filter,
        error,
      });
    });
  });

  test('vulnsHostsLoader should load and dispatch host aggregates', () => {
    const data = [{value: 1, count: 5}];
    const mockGetHostAggregates = testing.fn().mockResolvedValue({data});
    const gmp = {
      vulns: {
        getHostAggregates: mockGetHostAggregates,
      },
    };
    const filter = BaseFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnsHostsLoader({gmp, filter})(dispatch, getState).then(() => {
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
    });
  });

  test('vulnsHostsLoader should dispatch an error when loading fails', () => {
    const error = new Error('An error');
    const mockGetHostAggregates = testing.fn().mockRejectedValue(error);
    const gmp = {
      vulns: {
        getHostAggregates: mockGetHostAggregates,
      },
    };
    const filter = BaseFilter.fromString('first=1 rows=10');
    const dispatch = testing.fn();
    const getState = testing.fn();

    return vulnsHostsLoader({gmp, filter})(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_ERROR,
        id: VULNS_HOSTS,
        filter,
        error,
      });
    });
  });
});
