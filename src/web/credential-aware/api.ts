/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** API of the isolated credential-aware task review service. */
export interface InventoryItem {
  id: string;
  name: string;
  type?: string;
  hosts?: string;
  ip?: string;
  review_managed?: boolean;
}

export interface Inventory {
  targets: InventoryItem[];
  credentials: InventoryItem[];
  configs: InventoryItem[];
  scanners: InventoryItem[];
  assets: InventoryItem[];
}

export interface AssetOverride {
  asset_id: string;
  service: string;
  credential_id: string;
  enabled: boolean;
}

export interface TaskUnit {
  host: string;
  credentials: Record<string, string>;
  applied_overrides?: AssetOverride[];
}

export interface TaskPlan {
  name: string;
  units: TaskUnit[];
  scan_units?: Array<{
    hosts: string[];
    credentials: Record<string, string>;
  }>;
}

export interface TaskGroup {
  id: string;
  name: string;
  native_task_id: string;
  children: Array<{
    host: string;
    hosts?: string[];
    task_id: string;
    target_id: string;
    credentials: Record<string, string>;
  }>;
}

export interface GroupChildSummary {
  host: string;
  hosts?: string[];
  task_id: string;
  target_id: string;
  status: string;
  report_id: string | null;
  result_count?: number;
  error?: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  native_task_id: string | null;
  native_report_id: string | null;
  native_error: string | null;
  status: string;
  host_count: number;
  done_count: number;
  report_count: number;
  children: GroupChildSummary[];
}

export interface GroupResult {
  id: string;
  name: string;
  host: string;
  port: string;
  severity: string;
  threat: string;
  nvt_oid: string;
  description: string;
  task_id: string;
  report_id: string;
}

export interface GroupReport extends GroupSummary {
  result_count: number;
  offset: number;
  limit: number;
  results: GroupResult[];
  filter: string;
  complete: boolean;
}

export interface TaskRequest {
  backend_mode: 'enhanced';
  name: string;
  target_ids: string[];
  config_id: string;
  scanner_id: string;
  overrides: [];
}

export async function credentialAwareApi<T>(
  token: string | undefined,
  path: string,
  body?: unknown,
): Promise<T> {
  if (!token) {
    throw new Error('Sign in to GSA before using credential-aware scans.');
  }
  const response = await fetch(`/credential-api/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-GSA-Token': token,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as {error?: string};
      message = data.error || message;
    } catch {
      // GSAD returns a non-JSON response when the GSA session has expired.
    }
    if (response.status === 401 || response.status === 403) {
      message = 'Your GSA session has expired. Sign in again.';
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function downloadCombinedReport(
  token: string | undefined,
  groupId: string,
): Promise<void> {
  if (!token) {
    throw new Error('Sign in to GSA before downloading a combined report.');
  }
  const response = await fetch(
    `/credential-api/groups/${encodeURIComponent(groupId)}/report.csv`,
    {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {'X-GSA-Token': token},
    },
  );
  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      message = ((await response.json()) as {error?: string}).error || message;
    } catch {
      // GSAD may return HTML after session expiry.
    }
    throw new Error(message);
  }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `combined-scan-${groupId}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
