/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import type ReportReport from 'gmp/models/report/report';
import type {TaskStatus} from 'gmp/models/task';
import type {ReportSubEntities} from 'web/hooks/use-query/use-report-sub-entities';
import {
  buildReportTabDefinitions,
  TAB_KEYS,
} from 'web/pages/reports/details/ReportTabDefinitions';

const thresholdConfig = {
  showInitialLoading: false,
  showThresholdMessage: false,
  isUpdating: false,
  threshold: 0,
  onFilterChanged: () => {},
  onFilterEditClick: () => {},
};

const entities = {
  hosts: {data: undefined, isError: false, isFetching: false},
  ports: {data: undefined, isError: false, isFetching: false},
  applications: {data: undefined, isError: false, isFetching: false},
  operatingSystems: {data: undefined, isError: false, isFetching: false},
  cves: {data: undefined, isError: false, isFetching: false},
  closedCves: {data: undefined, isError: false, isFetching: false},
  tlsCertificates: {data: undefined, isError: false, isFetching: false},
  errors: {data: undefined, isError: false, isFetching: false},
} as unknown as ReportSubEntities;

const baseParams = {
  activeReport: {} as ReportReport,
  activeFilter: Filter.fromString(''),
  reportId: 'report-123',
  isImport: false,
  isAgentScanning: false,
  isContainerScanning: false,
  isUpdating: false,
  progress: 0,
  status: 'Stopped' as TaskStatus,
  resultsCounts: undefined,
  thresholdConfig,
  reportEntities: entities,
  onFilterAddLogLevelClick: () => {},
  onFilterDecreaseMinQoDClick: () => {},
  onFilterEditClick: () => {},
  onFilterRemoveClick: () => {},
  onFilterRemoveSeverityClick: () => {},
  onTargetEditClick: () => {},
  onTlsCertificateDownloadClick: () => {},
  onTagSuccess: () => {},
  onError: () => {},
};

describe('buildReportTabDefinitions', () => {
  test('should exclude specific tabs when web application scanning is enabled', () => {
    const tabs = buildReportTabDefinitions({
      ...baseParams,
      isWebApplicationScanning: true,
    });

    const keys = tabs.map(tab => tab.key);

    expect(keys).toContain(TAB_KEYS.information);
    expect(keys).toContain(TAB_KEYS.results);
    expect(keys).toContain(TAB_KEYS.hosts);
    expect(keys).toContain(TAB_KEYS.ports);
    expect(keys).toContain(TAB_KEYS.errors);
    expect(keys).toContain(TAB_KEYS.usertags);

    expect(keys).not.toContain(TAB_KEYS.applications);
    expect(keys).not.toContain(TAB_KEYS.os);
    expect(keys).not.toContain(TAB_KEYS.cves);
    expect(keys).not.toContain(TAB_KEYS.closedcves);
    expect(keys).not.toContain(TAB_KEYS.tlscerts);
  });

  test('should include all tabs when web application scanning is disabled', () => {
    const tabs = buildReportTabDefinitions({
      ...baseParams,
      isWebApplicationScanning: false,
    });

    const keys = tabs.map(tab => tab.key);

    expect(keys).toContain(TAB_KEYS.applications);
    expect(keys).toContain(TAB_KEYS.os);
    expect(keys).toContain(TAB_KEYS.cves);
    expect(keys).toContain(TAB_KEYS.closedcves);
    expect(keys).toContain(TAB_KEYS.tlscerts);
  });
});
