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

import NvtsCvssDisplay from './cvssdisplay';
import NvtsFamilyDisplay from './familydisplay';
import NvtsSeverityDisplay from './severityclassdisplay';
import NvtsQodDisplay from './qoddisplay';
import NvtsQodTypeDisplay from './qodtypedisplay';

export const NVTS_DASHBOARD_ID = 'f68d9369-1945-477b-968f-121c6029971b';

const NvtsDashboard = ({
  filter,
  onFilterChanged,
}) => (
  <Dashboard
    id={NVTS_DASHBOARD_ID}
    filter={filter}
    components={{
      'nvt-by-cvss': NvtsCvssDisplay,
      'nvt-by-family': NvtsFamilyDisplay,
      'nvt-by-severity-class': NvtsSeverityDisplay,
      'nvt-by-qod': NvtsQodDisplay,
      'nvt-by-qod_type': NvtsQodTypeDisplay,
    }}
    defaultContent={[
      [
        'nvt-by-cvss',
        'nvt-by-family',
        'nvt-by-severity-class',
      ],
      [
        'nvt-by-qod',
        'nvt-by-qod_type',
      ],
    ]}
    defaultDisplay="nvt-by-cvss"
    maxItemsPerRow={4}
    maxRows={4}
    onFilterChanged={onFilterChanged}
  />
);

NvtsDashboard.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

export default NvtsDashboard;

// vim: set ts=2 sw=2 tw=80:
