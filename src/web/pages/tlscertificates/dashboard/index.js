/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
