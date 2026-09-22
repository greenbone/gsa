/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {entityListURL, entityURL, ROUTES, routeMatch} from 'routePaths';
import {describe, expect, test} from 'vitest';

describe('route paths', () => {
  test('keeps canonical and legacy audit paths distinct', () => {
    expect(ROUTES.auditReports.path).toBe('audit-reports');
    expect(ROUTES.auditReports.url).toBe('/audit-reports');
    expect(ROUTES.legacy.auditReports.path).toBe('auditreports');
    expect(ROUTES.legacy.auditReports.url).toBe('/auditreports');
  });

  test('provides relative router patterns for parameterized routes', () => {
    expect(ROUTES.auditReport.path).toBe('audit-report/:id');
    expect(ROUTES.auditReportDelta.path).toBe(
      'audit-report/delta/:id/:deltaid',
    );
    expect(ROUTES.legacy.auditReport.path).toBe('auditreport/:id');
  });

  test('encodes parameterized URLs', () => {
    expect(ROUTES.auditReport.url('report/id')).toBe(
      '/audit-report/report%2Fid',
    );
    expect(ROUTES.auditReportDelta.url('report/id', 'delta#1')).toBe(
      '/audit-report/delta/report%2Fid/delta%231',
    );
  });

  test('builds entity URLs from canonical route descriptors', () => {
    expect(entityURL('auditreport', 'report/id')).toBe(
      '/audit-report/report%2Fid',
    );
    expect(entityURL('operatingsystem', 'os-id')).toBe(
      '/operating-system/os-id',
    );
    expect(entityListURL('auditreport')).toBe('/audit-reports');
    expect(entityListURL('operatingsystem')).toBe('/operating-systems');
  });

  test('keeps every compatibility alias explicit', () => {
    expect(Object.keys(ROUTES.legacy)).toEqual([
      'auditReports',
      'auditReport',
      'certBundAdvisories',
      'certBundAdvisory',
      'ociImageTargets',
      'webApplicationTargets',
      'credentialStore',
      'dfnCertAdvisories',
      'dfnCertAdvisory',
      'feedStatus',
      'operatingSystems',
      'operatingSystem',
      'portLists',
      'portList',
      'reportConfigs',
      'reportConfig',
      'reportFormats',
      'reportFormat',
      'scanConfigs',
      'scanConfig',
      'tlsCertificates',
      'tlsCertificate',
      'userSettings',
      'cvssCalculator',
      'notFound',
    ]);
  });

  test('derives menu wildcard patterns from route patterns', () => {
    expect(routeMatch(ROUTES.report.path)).toBe('/report/*');
    expect(routeMatch(ROUTES.reports.path)).toBe('/reports');
  });
});
