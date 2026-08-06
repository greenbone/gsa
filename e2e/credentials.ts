/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const username = process.env.E2E_USERNAME;
export const password = process.env.E2E_PASSWORD;
export const hasCredentials = Boolean(username && password);
export const credentialsRequiredMessage =
  'Set E2E_USERNAME and E2E_PASSWORD in .env.e2e.local or shell environment.';
