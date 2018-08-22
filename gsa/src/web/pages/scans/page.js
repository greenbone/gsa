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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import DashboardControls from 'web/components/dashboard/controls.js';

import Section from 'web/components/section/section.js';

import {renewSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import ScansDashboard, {SCANS_DASHBOARD_ID} from './dashboard.js';
import SubscriptionProvider from 'web/components/provider/subscriptionprovider.js'; // eslint-disable-line

const ScansPage = ({
  onInteraction,
}) => (
  <SubscriptionProvider>
    {({notify}) => (
      <Section
        title={_('Scans Dashboard')}
        img="scan.svg"
        extra={
          <DashboardControls
            dashboardId={SCANS_DASHBOARD_ID}
            onInteraction={onInteraction}
          />
        }
      >
        <ScansDashboard
          notify={notify}
          onInteraction={onInteraction}
        />
      </Section>
    )}
  </SubscriptionProvider>
);

ScansPage.propTypes = {
  onInteraction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  onInteraction: () => dispatch(renewSessionTimeout({gmp})),
});

export default compose(
  withGmp,
  connect(undefined, mapDispatchToProps),
)(ScansPage);

// vim: set ts=2 sw=2 tw=80:
