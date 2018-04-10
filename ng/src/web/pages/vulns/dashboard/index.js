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

import VulnsCvssDisplay from './cvssdisplay';
import VulnsSeverityDisplay from './severityclassdisplay';

const VulnerabilitiesDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    filter={filter}
    components={{
      'vulns-cvss': VulnsCvssDisplay,
      'vulns-severity-class': VulnsSeverityDisplay,
    }}
    defaultContent={[
      [
        'vulns-cvss',
        'vulns-severity-class',
      ],
    ]}
    onFilterChanged={onFilterChanged}
  />
);

VulnerabilitiesDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default VulnerabilitiesDashboard;

// vim: set ts=2 sw=2 tw=80:
