/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';

import CertBundFilterDialog from './filterdialog';
import CertBundTable from './table';

import CertBundDashboard, {CERTBUND_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = props => (
  <ManualIcon
    page="vulnerabilitymanagement"
    anchor="cert-bund"
    title={_('Help: CERT-Bund Advisories')}
  />
);

const Page = props => (
  <EntitiesPage
    {...props}
    createFilterType="info"
    dashboard2={CertBundDashboard}
    dashboardControls={() => (
      <DashboardControls dashboardId={CERTBUND_DASHBOARD_ID}/>
    )}
    filterEditDialog={CertBundFilterDialog}
    sectionIcon="cert_bund_adv.svg"
    table={CertBundTable}
    title={_('CERT-Bund Advisories')}
    toolBarIcons={ToolBarIcons}
  />
);

export default withEntitiesContainer('certbund', {
  filtersFilter: CERTBUND_FILTER_FILTER,
})(Page);

// vim: set ts=2 sw=2 tw=80:
