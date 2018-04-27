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

import ResultsCvssDisplay from './cvssdisplay';
import ResultsSeverityDisplay from './severityclassdisplay';

export const RESULTS_DASHBOARD_ID = '0b8ae70d-d8fc-4418-8a72-e65ac8d2828e';

const ResultsDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={RESULTS_DASHBOARD_ID}
    filter={filter}
    permittedDisplays={[
      ResultsCvssDisplay.displayId,
      ResultsSeverityDisplay.displayId,
    ]}
    defaultContent={[
      [
        ResultsSeverityDisplay.displayId,
        ResultsCvssDisplay.displayId,
      ],
    ]}
    maxItemsPerRow={4}
    maxRows={4}
    onFilterChanged={onFilterChanged}
  />
);

ResultsDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default ResultsDashboard;

// vim: set ts=2 sw=2 tw=80:
