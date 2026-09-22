import {describe, expect, test} from 'vitest';
import {ROUTES} from '../route-paths';

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
});
