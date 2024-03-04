/* Copyright (C) 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import Dashboard from 'web/components/dashboard/dashboard';

import {
  ReportComplianceDisplay,
  ReportComplianceTableDisplay,
} from './statusdisplay';

export const AUDIT_REPORTS_DASHBOARD_ID =
  '8083d77b-05bb-4b17-ab39-c81175cb512c';

export const AUDIT_REPORTS_DISPLAYS = [
  ReportComplianceDisplay.displayId,
  ReportComplianceTableDisplay.displayId,
];

const AuditReportsDashboard = props => (
  <Dashboard
    {...props}
    id={AUDIT_REPORTS_DASHBOARD_ID}
    permittedDisplays={AUDIT_REPORTS_DISPLAYS}
    defaultDisplays={[
      [
        ReportComplianceDisplay.displayId,
        ReportComplianceTableDisplay.displayId,
      ],
    ]}
  />
);

export default AuditReportsDashboard;

// vim: set ts=2 sw=2 tw=80:
