/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import PropTypes from '../../../utils/proptypes';

import Dashboard from '../../../components/dashboard2/dashboard';

import {
  CertBundCreatedDisplay,
  CertBundCreatedTableDisplay,
} from './createddisplay';
import {CertBundCvssDisplay, CertBundCvssTableDisplay} from './cvssdisplay';
import {
  CertBundSeverityClassDisplay,
  CertBundSeverityClassTableDisplay,
} from './severityclassdisplay';

export const CERTBUND_DASHBOARD_ID = 'a6946f44-480f-4f37-8a73-28a4cd5310c4';

export const CERTBUND_DISPLAYS = [
  CertBundCreatedDisplay.displayId,
  CertBundCreatedTableDisplay.displayId,
  CertBundCvssDisplay.displayId,
  CertBundCvssTableDisplay.displayId,
  CertBundSeverityClassDisplay.displayId,
  CertBundSeverityClassTableDisplay.displayId,
];

const CertBundDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={CERTBUND_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={CERTBUND_DISPLAYS}
    defaultContent={[
      [
        CertBundSeverityClassDisplay.displayId,
        CertBundCreatedDisplay.displayId,
        CertBundCvssDisplay.displayId,
      ],
    ]}
    onFilterChanged={onFilterChanged}
  />
);

CertBundDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default CertBundDashboard;

// vim: set ts=2 sw=2 tw=80:
