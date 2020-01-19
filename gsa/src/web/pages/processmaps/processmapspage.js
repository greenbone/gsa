/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import BpmIcon from 'web/components/icon/bpmicon';
import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import PropTypes from 'web/utils/proptypes';

import DashboardControls from 'web/components/dashboard/controls';
import Section from 'web/components/section/section';

import withGmp from 'web/utils/withGmp';

import BpmDashboard, {BPM_DASHBOARD_ID} from './dashboard';

const ToolBarIcons = () => (
  <ManualIcon
    page="web-interface"
    anchor="displaying-the-feed-status"
    size="small"
    title={_('Help: Business Process Maps')}
  />
);

const StyledLayout = styled(Layout)`
  align-items: stretch;
`;

const ControlsDiv = styled.div`
  display: flex;
  flex-grow: 1;
  align-self: flex-end;
`;

const ProcessMapsPage = ({gmp}) => {
  return (
    <React.Fragment>
      <PageTitle title={_('Business Process Maps')} />
      <Layout flex="column">
        <ToolBarIcons />
        <Section
          img={<BpmIcon size="large" />}
          title={_('Business Process Maps')}
        />
        <StyledLayout flex="column" grow="1">
          <ControlsDiv>
            <DashboardControls dashboardId={BPM_DASHBOARD_ID} grow="1" />
          </ControlsDiv>
          <BpmDashboard />
        </StyledLayout>
      </Layout>
    </React.Fragment>
  );
};

ProcessMapsPage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(ProcessMapsPage);
