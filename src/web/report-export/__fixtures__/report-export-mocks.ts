/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import {createSession} from 'gmp/testing';

export const exportPayload = {
  reportId: 'report-uuid',
  reportFormatId: 'format-uuid',
};

export const exportData = (
  status: string,
  progress = 'generating',
  id = 'export-uuid-1',
) => ({id, status, progress, owner: {name: 'test-user'}});

export const ownedExportData = (
  status: string,
  progress = 'generating',
  id = 'export-uuid-1',
) => ({
  ...exportData(status, progress, id),
  extension: 'xml',
});

export const inventoryResponse = (exports_: unknown[]) => ({
  data: exports_,
  meta: {
    counts: new CollectionCounts({
      first: 1,
      rows: 100,
      filtered: exports_.length,
      length: exports_.length,
    }),
  },
});

export const createGmp = (exports_: Record<string, unknown>[] = []) => {
  let createCount = 0;
  const inventory = {exports: exports_};
  return {
    inventory,
    session: createSession({token: 'test-token', username: 'test-user'}),
    settings: {
      reloadInterval: 15000,
      reloadIntervalActive: 3000,
      reloadIntervalInactive: 60000,
    },
    reportexport: {
      // gvmd answers with an id for both newly created and reused exports
      exportScanReport: testing
        .fn()
        .mockImplementation(() =>
          Promise.resolve({data: {id: `export-uuid-${++createCount}`}}),
        ),
      exportAuditReport: testing.fn().mockResolvedValue({
        data: {id: 'audit-export-uuid'},
      }),
      exportDeltaScanReport: testing.fn().mockResolvedValue({
        data: {id: 'delta-scan-export-uuid'},
      }),
      exportDeltaAuditReport: testing.fn().mockResolvedValue({
        data: {id: 'delta-audit-export-uuid'},
      }),
      // per-export status read; statuses are driven via the inventory list
      get: testing
        .fn()
        .mockImplementation(
          async ({reportExportId}: {reportExportId: string}) => ({
            data: inventory.exports.find(item => item.id === reportExportId),
          }),
        ),
      downloadReportExport: testing.fn().mockResolvedValue({
        data: new ArrayBuffer(8),
      }),
      cancelReportExport: testing.fn().mockResolvedValue({}),
    },
  };
};

export const changeSession = (
  gmp: {session: {token?: string; username?: string; listener: (() => void)[]}},
  token?: string,
  username?: string,
) => {
  gmp.session.token = token;
  gmp.session.username = username;
  gmp.session.listener.forEach(listener => listener());
};
