/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export interface DashboardItem {
  id: string;
  displayId: string;
}

export interface DashboardRow {
  id: string;
  items: Array<DashboardItem>;
  height?: number;
}

export interface DashboardData {
  title?: string;
  rows?: Array<DashboardRow>;
}

export interface DashboardSettings extends DashboardData {
  permittedDisplays?: string[];
  maxItemsPerRow?: number;
  maxRows?: number;
}

export interface StartDashboardProps {
  id: string;
  loadSettings?: (id: string, defaults: Record<string, unknown>) => void;
  saveSettings: (id: string, settings: Record<string, unknown>) => void;
  settings: DashboardSettings;
  onNewDisplay: (
    settings: Record<string, unknown>,
    dashboardId: string,
    displayId: string,
  ) => void;
  onResetDashboard: (id: string) => void;
  setDefaultSettings: (id: string, settings: Record<string, unknown>) => void;
  notify?: (message: string) => void;
}
