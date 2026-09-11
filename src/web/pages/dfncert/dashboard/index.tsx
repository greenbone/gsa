/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  DfnCertsCreatedDisplay,
  DfnCertsCreatedTableDisplay,
} from 'web/pages/dfncert/dashboard/DfnCertCreatedDisplay';
import {
  DfnCertCvssDisplay,
  DfnCertCvssTableDisplay,
} from 'web/pages/dfncert/dashboard/DfnCertCvssDisplay';
import {
  DfnCertSeverityClassDisplay,
  DfnCertSeverityClassTableDisplay,
} from 'web/pages/dfncert/dashboard/DfnCertSeverityClassDisplay';

interface DfnCertDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const DFNCERT_DASHBOARD_ID = '9812ea49-682d-4f99-b3cc-eca051d1ce59';

export const DFNCERT_DISPLAYS = [
  DfnCertsCreatedDisplay.displayId,
  DfnCertsCreatedTableDisplay.displayId,
  DfnCertCvssDisplay.displayId,
  DfnCertCvssTableDisplay.displayId,
  DfnCertSeverityClassDisplay.displayId,
  DfnCertSeverityClassTableDisplay.displayId,
];

const DfnCertDashboard = (props: DfnCertDashboardProps) => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        DfnCertSeverityClassDisplay.displayId,
        DfnCertsCreatedDisplay.displayId,
        DfnCertCvssDisplay.displayId,
      ],
    ]}
    id={DFNCERT_DASHBOARD_ID}
    permittedDisplays={DFNCERT_DISPLAYS}
  />
);

export default DfnCertDashboard;
