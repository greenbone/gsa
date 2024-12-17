/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';
import Dashboard from 'web/components/dashboard/dashboard';

import {
  TlsCertificatesModifiedDisplay,
  TlsCertificatesModifiedTableDisplay,
} from './modifieddisplay';
import {TimeStatusDisplay, TimeStatusTableDisplay} from './timestatusdisplay';

export const TLS_CERTIFICATES_DASHBOARD_ID =
  '9b62bf16-bf90-11e9-ad97-28d24461215b';

export const TLS_CERTFICATES_DISPLAYS = [
  TimeStatusDisplay.displayId,
  TimeStatusTableDisplay.displayId,
  TlsCertificatesModifiedDisplay.displayId,
  TlsCertificatesModifiedTableDisplay.displayId,
];

const TlsCerticatesDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [TimeStatusDisplay.displayId, TlsCertificatesModifiedDisplay.displayId],
    ]}
    id={TLS_CERTIFICATES_DASHBOARD_ID}
    permittedDisplays={TLS_CERTFICATES_DISPLAYS}
  />
);

export default TlsCerticatesDashboard;

// vim: set ts=2 sw=2 tw=80:
