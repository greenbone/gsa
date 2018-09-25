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

import uuid from 'uuid/v4';

import styled from 'styled-components';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import {
  canAddDisplay,
  addDisplayToSettings,
  loadSettings,
  saveSettings,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings from 'web/store/dashboard/settings/selectors';
import {renewSessionTimeout} from 'web/store/usersettings/actions';

import CloseButton from 'web/components/dialog/closebutton';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import SubscriptionProvider from 'web/components/provider/subscriptionprovider';

import Section from 'web/components/section/section';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import Dashboard from './dashboard';
import ConfirmRemoveDialog from './confirmremovedialog';
import NewDashboardDialog from './newdashboarddialog';

const DASHBOARD_ID = 'd97eca9f-0386-4e5d-88f2-0ed7f60c0646';
const OVERVIEW_DASHBOARD_ID = '84fbe9f5-8ad4-43f0-9712-850182abb003';

const getDefaults = () => ({
  dashboards: [
    OVERVIEW_DASHBOARD_ID,
  ],
  byId: {
    [OVERVIEW_DASHBOARD_ID]: {
      title: _('Overview'),
    },
  },
});

const DEFAULT_TAB = 0;
const MAX_DASHBOARDS = 10;

const StyledNewIcon = styled(NewIcon)`
  margin: 0 10px;
`;

class StartPage extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      activeTab: DEFAULT_TAB,
      showConfirmRemoveDialog: false,
      showNewDashboardDialog: false,
    };

    this.handleActivateTab = this.handleActivateTab.bind(this);

    this.handleConfirmRemoveDashboard =
      this.handleConfirmRemoveDashboard.bind(this);
    this.handleConfirmRemoveDialogClose =
      this.handleConfirmRemoveDialogClose.bind(this);

    this.handleRemoveDashboard = this.handleRemoveDashboard.bind(this);

    this.handleLoadDashboardSettings =
      this.handleLoadDashboardSettings.bind(this);
    this.handleSaveDashboardSettings =
      this.handleSaveDashboardSettings.bind(this);

    this.handleResetDashboard = this.handleResetDashboard.bind(this);
    this.handleAddNewDisplay = this.handleAddNewDisplay.bind(this);

    this.handleOpenNewDashboardDialog =
      this.handleOpenNewDashboardDialog.bind(this);
    this.handleNewDashboardDialogClose =
      this.handleNewDashboardDialogClose.bind(this);

    this.handleAddNewDashboard = this.handleAddNewDashboard.bind(this);

    this.handleResetDashboards = this.handleResetDashboards.bind(this);
  }

  componentDidMount() {
    this.props.loadSettings(DASHBOARD_ID);
  }

  saveSettings(settings) {
    const {byId, defaults, dashboards} = this.props;

    this.props.saveSettings(DASHBOARD_ID, {
      byId,
      defaults,
      dashboards,
      ...settings,
    });
  }

  handleRemoveDashboard(dashboardId) {
    const {byId, dashboards, defaults = {}} = this.props;

    if (dashboards.length <= 1) {
      return;
    }

    const byIdCopy = {...byId};
    delete byIdCopy[dashboardId];

    const defaultsCopy = {...defaults};
    delete defaultsCopy[dashboardId];

    this.setState({
      showConfirmRemoveDialog: false,
      activeTab: DEFAULT_TAB,
    });

    this.saveSettings({
      byId: byIdCopy,
      dashboards: dashboards.filter(id => id !== dashboardId),
      defaults: defaultsCopy,
      removeDashboardId: undefined,
    });
  }

  handleConfirmRemoveDashboard(event, id) {
    event.preventDefault();
    event.stopPropagation(); // don't activate tab

    this.setState({
      showConfirmRemoveDialog: true,
      removeDashboardId: id,
    });
  }

  handleConfirmRemoveDialogClose() {
    this.setState({showConfirmRemoveDialog: false});
  }

  closeNewDashboardDialog() {
    this.setState({showNewDashboardDialog: false});
  }

  handleOpenNewDashboardDialog() {
    this.setState({showNewDashboardDialog: true});
  }

  handleNewDashboardDialogClose() {
    this.closeNewDashboardDialog();
  }

  handleActivateTab(tab) {
    this.setState({activeTab: tab});
  }

  handleSaveDashboardSettings(dashboardId, settings) {
    const {byId} = this.props;

    this.saveSettings({
      byId: {
        ...byId,
        [dashboardId]: {
          ...byId[dashboardId],
          ...settings,
        },
      },
    });
  }

  handleLoadDashboardSettings(dashboardId, defaultSettings) {
    const {byId, defaults = {}} = this.props;

    this.saveSettings({
      byId: {
        ...byId,
        [dashboardId]: {
          ...defaultSettings,
          ...byId[dashboardId],
        },
      },
      defaults: {
        ...defaults,
        [dashboardId]: {
          ...defaults[dashboardId],
          ...defaultSettings,
        },
      },
    });
  }

  handleResetDashboard(dashboardId) {
    const {byId, defaults = {}} = this.props;

    this.saveSettings({
      byId: {
        ...byId,
        [dashboardId]: {
          ...byId[dashboardId],
          ...defaults[dashboardId],
        },
      },
    });
  }

  handleAddNewDisplay(dashboardId, displayId) {
    if (!isDefined(displayId) || !isDefined(dashboardId)) {
      return;
    }

    const {byId} = this.props;
    const settings = byId[dashboardId];

    if (!canAddDisplay(settings)) {
      return;
    }

    const newSettings = addDisplayToSettings(settings, displayId);

    this.saveSettings({
      byId: {
        ...byId,
        [dashboardId]: newSettings,
      },
    });
  }

  handleAddNewDashboard({title}) {
    const {byId, dashboards} = this.props;

    const id = uuid();

    this.saveSettings({
      dashboards: [
        ...dashboards,
        id,
      ],
      byId: {
        ...byId,
        [id]: {
          title,
        },
      },
    });

    this.closeNewDashboardDialog();

    // change to new dashboard tab
    this.setState({activeTab: dashboards.length});
  }

  handleResetDashboards() {
    // reset all dashboards
    // currently not assigned to a handler

    const {byId, defaults} = this.props;
    const DEFAULTS = getDefaults();

    this.saveSettings({
      ...DEFAULTS,
      byId: {
        ...byId,
        [OVERVIEW_DASHBOARD_ID]: {
          ...DEFAULTS.byId[OVERVIEW_DASHBOARD_ID],
          ...defaults[OVERVIEW_DASHBOARD_ID],
        },
      },
    });
  }

  render() {
    const {
      activeTab,
      removeDashboardId,
      showNewDashboardDialog,
      showConfirmRemoveDialog,
    } = this.state;

    const {
      byId = {},
      isLoading = false,
    } = this.props;

    let {
      dashboards = [],
    } = this.props;

    dashboards = dashboards.filter(id => isDefined(byId[id]));

    const canAdd = dashboards.length < MAX_DASHBOARDS;
    return (
      <React.Fragment>
        <Section
          title={_('Dashboards')}
          img="dashboard.svg"
        >
          {isLoading ?
            <Loading/> :
            <React.Fragment>

              <TabLayout
                grow="1"
                align={['start', 'end']}
              >
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={this.handleActivateTab}
                >
                  {dashboards.map(id => {
                    const dashboard = byId[id];
                    const {title} = dashboard;
                    return (
                      <Tab
                        key={id}
                      >
                        <Divider>
                          <span>{title}</span>
                          {dashboards.length > 1 &&
                            <CloseButton
                              size="small"
                              title={_('Remove Dashboard')}
                              onClick={event =>
                                this.handleConfirmRemoveDashboard(event, id)}
                            />
                          }
                        </Divider>
                      </Tab>
                    );
                  })}

                  <Layout
                    align={['center', 'center']}
                    grow
                  >
                    <StyledNewIcon
                      title={canAdd ?
                        _('Add new Dashboard') :
                        _('Dashboards limit reached')
                      }
                      active={canAdd}
                      onClick={canAdd ?
                        this.handleOpenNewDashboardDialog :
                        undefined
                      }
                    />
                  </Layout>
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  {dashboards.map(id => {
                    const dashboard = byId[id];
                    const {rows, title, ...settings} = dashboard;
                    return (
                      <TabPanel
                        key={id}
                      >
                        <SubscriptionProvider>
                          {({notify}) => (
                            <Dashboard
                              {...settings}
                              id={id}
                              isLoading={false}
                              items={rows}
                              loadSettings={this.handleLoadDashboardSettings}
                              notify={notify}
                              saveSettings={this.handleSaveDashboardSettings}
                              onInteraction={this.props.renewSessionTimeout}
                              onNewDisplay={this.handleAddNewDisplay}
                              onResetDashboard={this.handleResetDashboard}
                            />
                          )}
                        </SubscriptionProvider>
                      </TabPanel>
                    );
                  })}
                </TabPanels>
              </Tabs>
            </React.Fragment>
          }
        </Section>
        {showConfirmRemoveDialog &&
          <ConfirmRemoveDialog
            dashboardId={removeDashboardId}
            dashboardTitle={byId[removeDashboardId].title}
            onDeny={this.handleConfirmRemoveDialogClose}
            onConfirm={this.handleRemoveDashboard}
          />
        }
        {showNewDashboardDialog &&
          <NewDashboardDialog
            onClose={this.handleNewDashboardDialogClose}
            onSave={this.handleAddNewDashboard}
          />
        }
      </React.Fragment>
    );
  }
}

StartPage.propTypes = {
  byId: PropTypes.object,
  dashboards: PropTypes.array,
  defaults: PropTypes.object,
  isLoading: PropTypes.bool,
  loadSettings: PropTypes.func.isRequired,
  renewSessionTimeout: PropTypes.func.isRequired,
  saveSettings: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => {
  const settingsSelector = getDashboardSettings(rootState);
  const settings = settingsSelector.getById(DASHBOARD_ID);
  const {rows} = settings || {};
  let {byId, defaults, dashboards} = settings || {};
  const DEFAULTS = getDefaults();

  if (isDefined(rows)) {
    byId = {
      [OVERVIEW_DASHBOARD_ID]: {
        ...DEFAULTS.byId[OVERVIEW_DASHBOARD_ID],
        rows,
      },
    };
    dashboards = [OVERVIEW_DASHBOARD_ID];
  }

  const props = {
    isLoading: settingsSelector.getIsLoading(),
    ...DEFAULTS,
    byId: {
      ...DEFAULTS.byId,
      ...byId,
    },
    defaults: {
      ...DEFAULTS.defaults,
      ...defaults,
    },
  };

  if (isDefined(dashboards)) {
    props.dashboards = dashboards;
  }

  return props;
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadSettings: (id, defaults) =>
    dispatch(loadSettings({gmp})(id, defaults)),
  saveSettings: (id, settings) =>
    dispatch(saveSettings({gmp})(id, settings)),
  renewSessionTimeout: () => dispatch(renewSessionTimeout(gmp)()),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(StartPage);

// vim: set ts=2 sw=2 tw=80:
