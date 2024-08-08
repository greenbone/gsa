/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Dashboard from 'web/components/dashboard/dashboard';

import {TimeStatusDisplay, TimeStatusTableDisplay} from './timestatusdisplay';
import {
  TlsCertificatesModifiedDisplay,
  TlsCertificatesModifiedTableDisplay,
} from './modifieddisplay';

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
    id={TLS_CERTIFICATES_DASHBOARD_ID}
    permittedDisplays={TLS_CERTFICATES_DISPLAYS}
    defaultDisplays={[
      [TimeStatusDisplay.displayId, TlsCertificatesModifiedDisplay.displayId],
    ]}
  />
);

export default TlsCerticatesDashboard;

// vim: set ts=2 sw=2 tw=80:
