/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../locale.js';

import PropTypes from './proptypes.js';
import Section from './section.js';

import Dashboard from './dashboard/dashboard.js';
import DashboardControls from './dashboard/controls.js';

import HostCharts from './hosts/charts.js';
import OsCharts from './os/charts.js';

export const AssetsPage = (props, {cache}) => {
  return (
    <Section title={_('Assets Dashboard')} img="asset.svg"
      extra={<DashboardControls/>}>
      <Dashboard
        configPrefId="0320e0db-bf30-4d4f-9379-b0a022d07cf7"
        defaultControllersString={'host-by-most-vulnerable|' +
          'host-by-topology|os-by-most-vulnerable#os-by-severity-class|' +
          'host-by-modification-time'}
        defaultControllerString="host-by-severity-class"
        maxComponents="8">
        <HostCharts cache={cache}/>
        <OsCharts cache={cache}/>
      </Dashboard>
    </Section>
  );
};

AssetsPage.contextTypes = {
  cache: PropTypes.object,
};

export default AssetsPage;

// vim: set ts=2 sw=2 tw=80:
