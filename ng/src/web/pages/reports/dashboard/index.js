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

import {ReportsCvssDisplay, ReportsCvssTableDisplay} from './cvssdisplay';
import {
  ReportsSeverityDisplay,
  ReportsSeverityTableDisplay,
} from './severityclassdisplay';
import {
  ReportsHighResultsDisplay,
  ReportsHighResultsTableDisplay,
} from './highresultsdisplay';

export const REPORTS_DASHBOARD_ID = 'e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071';

export const REPORTS_DISPLAYS = [
  ReportsCvssDisplay.displayId,
  ReportsHighResultsDisplay.displayId,
  ReportsSeverityDisplay.displayId,
  ReportsCvssTableDisplay.displayId,
  ReportsHighResultsTableDisplay.displayId,
  ReportsSeverityTableDisplay.displayId,
];

const ReportsDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={REPORTS_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={REPORTS_DISPLAYS}
    defaultContent={[
      [
        ReportsSeverityDisplay.displayId,
        ReportsHighResultsDisplay.displayId,
        ReportsCvssDisplay.displayId,
      ],
    ]}
    onFilterChanged={onFilterChanged}
  />
);

ReportsDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default ReportsDashboard;

// vim: set ts=2 sw=2 tw=80:
