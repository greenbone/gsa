/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import Dashboard from 'web/components/dashboard/Dashboard';
import {
  TlsCertificatesModifiedDisplay,
  TlsCertificatesModifiedTableDisplay,
} from 'web/pages/tlscertificates/dashboard/TlsCertificateModifiedDisplay';
import {
  TlsCertificateTimeStatusDisplay,
  TlsCertificateTimeStatusTableDisplay,
} from 'web/pages/tlscertificates/dashboard/TlsCertificateTimeStatusDisplay';

interface TlsCertificatesDashboardProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

export const TLS_CERTIFICATES_DASHBOARD_ID =
  '9b62bf16-bf90-11e9-ad97-28d24461215b';

export const TLS_CERTIFICATES_DISPLAYS = [
  TlsCertificateTimeStatusDisplay.displayId,
  TlsCertificateTimeStatusTableDisplay.displayId,
  TlsCertificatesModifiedDisplay.displayId,
  TlsCertificatesModifiedTableDisplay.displayId,
];

const TlsCertificatesDashboard = (props: TlsCertificatesDashboardProps) => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        TlsCertificateTimeStatusDisplay.displayId,
        TlsCertificatesModifiedDisplay.displayId,
      ],
    ]}
    id={TLS_CERTIFICATES_DASHBOARD_ID}
    permittedDisplays={TLS_CERTIFICATES_DISPLAYS}
  />
);

export default TlsCertificatesDashboard;
