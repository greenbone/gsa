/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import SubscriptionProvider from 'web/components/provider/subscriptionprovider';

import DashboardControls from 'web/components/dashboard/controls';

import Section from 'web/components/section/section';

import AssetsDashboard, {ASSETS_DASHBOARD_ID} from './dashboard';

const AssetsPage = () => (
  <SubscriptionProvider>
    {({notify}) => (
      <Section
        title={_('Assets Dashboard')}
        img="asset.svg"
        extra={
          <DashboardControls
            dashboardId={ASSETS_DASHBOARD_ID}
          />
        }
      >
        <AssetsDashboard
          notify={notify}
        />
      </Section>
    )}
  </SubscriptionProvider>
);

export default AssetsPage;

// vim: set ts=2 sw=2 tw=80:
