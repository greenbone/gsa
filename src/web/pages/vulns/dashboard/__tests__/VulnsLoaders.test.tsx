/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  VULNS_HOSTS,
  VULNS_SEVERITY,
  vulnsHostsLoader,
  vulnsSeverityLoader,
} from 'web/pages/vulns/dashboard/VulnsLoaders';

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

  test('vulnsSeverityLoader should call gmp.vulns.getSeverityAggregates', () => {
    const mockData = {data: [{value: 5.0, count: 10}]};
    const mockGetSeverityAggregates = testing.fn().mockResolvedValue(mockData);
    const gmp = {
      vulns: {
        getSeverityAggregates: mockGetSeverityAggregates,
      },
    };
    const filter = {toFilterString: () => 'first=1 rows=10'};

    const loaderFunc = vulnsSeverityLoader({gmp, filter});
    expect(typeof loaderFunc).toBe('function');
  });

  test('vulnsHostsLoader should call gmp.vulns.getHostAggregates', () => {
    const mockData = {data: [{value: 1, count: 5}]};
    const mockGetHostAggregates = testing.fn().mockResolvedValue(mockData);
    const gmp = {
      vulns: {
        getHostAggregates: mockGetHostAggregates,
      },
    };
    const filter = {toFilterString: () => 'first=1 rows=10'};

    const loaderFunc = vulnsHostsLoader({gmp, filter});
    expect(typeof loaderFunc).toBe('function');
  });
});
