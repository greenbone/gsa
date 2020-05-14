/* Copyright (C) 2016-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, {useState, useEffect} from 'react';

import {v4 as uuid} from 'uuid';

import memoize from 'memoize-one';

import styled from 'styled-components';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings, {
  DashboardSetting,
} from 'web/store/dashboard/settings/selectors';

import {
  addDisplayToSettings,
  canAddDisplay,
  convertDefaultDisplays,
} from 'web/components/dashboard/utils';

import DashboardIcon from 'web/components/icon/dashboardicon';
import DeleteIcon from 'web/components/icon/deleteicon';
import EditIcon from 'web/components/icon/editicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

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
import NewDashboardDialog, {DEFAULT_DISPLAYS} from './newdashboarddialog';
import EditDashboardDialog from './editdashboarddialog';
import Divider from 'web/components/layout/divider';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

const DASHBOARD_ID = 'd97eca9f-0386-4e5d-88f2-0ed7f60c0646';
const OVERVIEW_DASHBOARD_ID = '84fbe9f5-8ad4-43f0-9712-850182abb003';
const DEFAULT_OVERVIEW_DISPLAYS = convertDefaultDisplays(DEFAULT_DISPLAYS);

const getDefaults = () => ({
  dashboards: [OVERVIEW_DASHBOARD_ID],
  byId: {
    [OVERVIEW_DASHBOARD_ID]: {
      ...DEFAULT_OVERVIEW_DISPLAYS,
      title: _('Overview'),
    },
  },
});

const DEFAULT_TAB = 0;
const MAX_DASHBOARDS = 10;

const StyledNewIcon = styled(NewIcon)`
  margin: 0 10px;
`;

const StyledTab = styled(Tab)`
  & svg {
    opacity: 0.3;
  }
  :hover svg {
    opacity: 1;
  }
`;

const ToolBarIcons = () => (
  <ManualIcon
    page="web-interface"
    anchor="dashboards-and-dashboard-displays"
    title={_('Help: Dashboards')}
  />
);

const StartPage = props => {
  const [, renewSession] = useUserSessionTimeout();

  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [showConfirmRemoveDialog, setShowConfirmRemoveDialog] = useState(false);
  const [showNewDashboardDialog, setShowNewDashboardDialog] = useState(false);
  const [removeDashboardId, setRemoveDashboardId] = useState();
  const [editDashboardId, setEditDashboardId] = useState();
  const [showEditDashboardDialog, setShowEditDashboardDialog] = useState();

  const getDashboardSelector = memoize(
    settings => new DashboardSetting(settings),
  );

  useEffect(() => {
    const DEFAULTS = getDefaults();
    props.loadSettings(DASHBOARD_ID, DEFAULTS);
  }, []);

  const saveSettings = newSettings => {
    props.saveSettings(DASHBOARD_ID, {
      ...props.settings,
      ...newSettings,
    });
  };

  const handleRemoveDashboard = dashboardId => {
    const dashboards = getDashboards();

    if (dashboards.length <= 1) {
      return;
    }

    const {settings = {}} = props;
    const {byId = {}, defaults = {}} = settings;

    const byIdCopy = {...byId};
    delete byIdCopy[dashboardId];
    const defaultsCopy = {...defaults};
    delete defaultsCopy[dashboardId];

    setShowConfirmRemoveDialog(false);
    setActiveTab(DEFAULT_TAB);

    saveSettings({
      byId: byIdCopy,
      dashboards: dashboards.filter(id => id !== dashboardId),
      defaults: defaultsCopy,
    });
  };

  const handleOpenConfirmRemoveDashboardDialog = id => {
    setShowConfirmRemoveDialog(true);
    setRemoveDashboardId(id);
  };

  const handleCloseConfirmRemoveDashboardDialog = () => {
    setShowConfirmRemoveDialog(false);
  };

  const closeNewDashboardDialog = () => {
    setShowNewDashboardDialog(false);
  };

  const handleOpenNewDashboardDialog = () => {
    setShowNewDashboardDialog(true);
  };

  const handleCloseNewDashboardDialog = () => {
    closeNewDashboardDialog();
  };

  const handleOpenEditDashboardDialog = id => {
    setEditDashboardId(id);
    setShowEditDashboardDialog(true);
  };

  const handleCloseEditDashboardDialog = () => {
    setShowEditDashboardDialog(false);
  };

  const handleActivateTab = tab => {
    setActiveTab(tab);
  };

  const handleSaveDashboardSettings = (dashboardId, settings) => {
    updateDashboardSettings(dashboardId, settings);
  };

  const handleLoadDashboardSettings = () => {
    // do nothing
    // all defaults and settings are already provided
  };

  const handleSetDefaultSettings = (dashboardId, defaultSettings) => {
    updateDashboardDefaults(dashboardId, defaultSettings);
  };

  const handleResetDashboard = dashboardId => {
    const settings = getDashboardDefaults(dashboardId);
    updateDashboardSettings(dashboardId, settings);
  };

  const handleAddNewDisplay = (oldSettings, dashboardId, displayId) => {
    if (!isDefined(displayId) || !isDefined(dashboardId)) {
      return;
    }

    if (!canAddDisplay(oldSettings)) {
      return;
    }

    const newSettings = addDisplayToSettings(oldSettings, displayId);
    updateDashboardSettings(dashboardId, newSettings);
  };

  const handleAddNewDashboard = ({
    title,
    defaultDisplays = DEFAULT_DISPLAYS,
  }) => {
    const {settings = {}} = props;
    const {byId = {}} = settings;
    const dashboards = getDashboards();

    const id = uuid();

    const newDashboardSetting = {
      ...convertDefaultDisplays(defaultDisplays),
      title,
    };

    const newSettings = {
      dashboards: [...dashboards, id],
      byId: {
        ...byId,
        [id]: newDashboardSetting,
      },
    };

    saveSettings(newSettings);

    closeNewDashboardDialog();

    // change to new dashboard tab
    setActiveTab(dashboards.length);
  };

  const handleSaveEditDashboard = ({dashboardId, dashboardTitle}) => {
    updateDashboardSettings(dashboardId, {title: dashboardTitle});
    setShowEditDashboardDialog(false);
  };

  const handleResetDashboards = () => {
    // reset all dashboards
    // currently not assigned to a handler
    // const {byId, defaults} = this.props;
    // const DEFAULTS = getDefaults();
    // this.saveSettings({
    //   ...DEFAULTS,
    //   byId: {
    //     ...byId,
    //     [OVERVIEW_DASHBOARD_ID]: {
    //       ...DEFAULTS.byId[OVERVIEW_DASHBOARD_ID],
    //       ...defaults[OVERVIEW_DASHBOARD_ID],
    //     },
    //   },
    // });
  };

  const updateDashboardSettings = (dashboardId, newSettings) => {
    const {byId = {}} = props.settings;
    const oldSettings = getDashboardSettings(dashboardId);

    saveSettings({
      byId: {
        ...byId,
        [dashboardId]: {
          ...oldSettings,
          ...newSettings,
        },
      },
    });
  };

  const updateDashboardDefaults = (dashboardId, newDefaults) => {
    const {defaults = {}} = props.settings;
    saveSettings({
      defaults: {
        ...defaults,
        [dashboardId]: newDefaults,
      },
    });
  };

  const getDashboards = () => {
    const {settings = {}} = props;
    const {dashboards = [], byId = {}} = settings;
    return dashboards.filter(id => isDefined(byId[id]));
  };

  const getDashboardSettings = dashboardId => {
    const {settings = {}} = props;
    const selector = getDashboardSelector(settings);
    return selector.getById(dashboardId);
  };

  const getDashboardDefaults = dashboardId => {
    const {settings = {}} = props;
    const selector = getDashboardSelector(settings);
    return selector.getDefaultsById(dashboardId);
  };

  const getDashboardTitle = dashboardId => {
    const dashboardSettings = getDashboardSettings(dashboardId);
    return dashboardSettings.title;
  };

  const getDashboardDisplayIds = dashboardId => {
    const dashboardSettings = getDashboardSettings(dashboardId);
    const {rows = []} = dashboardSettings;
    return rows.map(row => {
      const {items = []} = row;
      return items.map(item => item.displayId);
    });
  };

  const {isLoading} = props;

  const dashboards = getDashboards();

  const canAdd = dashboards.length < MAX_DASHBOARDS;
  return (
    <React.Fragment>
      <PageTitle title={_('Dashboards')} />
      <ToolBarIcons />
      <Section title={_('Dashboards')} img={<DashboardIcon size="large" />}>
        {isLoading ? (
          <Loading />
        ) : (
          <React.Fragment>
            <TabLayout grow="1" align={['start', 'end']}>
              <TabList
                active={activeTab}
                align={['start', 'stretch']}
                onActivateTab={handleActivateTab}
              >
                {dashboards.map(id => {
                  const title = getDashboardTitle(id);
                  return (
                    <StyledTab key={id}>
                      <Divider margin="13px">
                        <span>{title}</span>
                        {dashboards.length > 1 && (
                          <IconDivider margin="3px">
                            <EditIcon
                              size="tiny"
                              title={_('Edit Dashboard Title')}
                              onClick={() => handleOpenEditDashboardDialog(id)} // eslint-disable-line max-len
                            />
                            <DeleteIcon
                              size="tiny"
                              title={_('Remove Dashboard')}
                              onClick={() =>
                                handleOpenConfirmRemoveDashboardDialog(id)
                              } // eslint-disable-line max-len
                            />
                          </IconDivider>
                        )}
                      </Divider>
                    </StyledTab>
                  );
                })}

                <Layout align={['center', 'center']} grow>
                  <StyledNewIcon
                    title={
                      canAdd
                        ? _('Add new Dashboard')
                        : _('Dashboards limit reached')
                    }
                    active={canAdd}
                    onClick={canAdd ? handleOpenNewDashboardDialog : undefined}
                  />
                </Layout>
              </TabList>
            </TabLayout>

            <Tabs active={activeTab}>
              <TabPanels>
                {dashboards.map(id => {
                  const settings = getDashboardSettings(id);
                  return (
                    <TabPanel key={id}>
                      <SubscriptionProvider>
                        {({notify}) => (
                          <Dashboard
                            settings={settings}
                            id={id}
                            loadSettings={handleLoadDashboardSettings}
                            notify={notify}
                            saveSettings={handleSaveDashboardSettings}
                            setDefaultSettings={handleSetDefaultSettings}
                            onInteraction={renewSession}
                            onNewDisplay={handleAddNewDisplay}
                            onResetDashboard={handleResetDashboard}
                          />
                        )}
                      </SubscriptionProvider>
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          </React.Fragment>
        )}
      </Section>
      {showConfirmRemoveDialog && (
        <ConfirmRemoveDialog
          dashboardId={removeDashboardId}
          dashboardTitle={getDashboardTitle(removeDashboardId)}
          onDeny={handleCloseConfirmRemoveDashboardDialog}
          onConfirm={handleRemoveDashboard}
        />
      )}
      {showNewDashboardDialog && (
        <NewDashboardDialog
          additionalDisplayChoices={dashboards.map(id => ({
            label: getDashboardTitle(id),
            key: id,
            value: getDashboardDisplayIds(id),
          }))}
          onClose={handleCloseNewDashboardDialog}
          onSave={handleAddNewDashboard}
        />
      )}
      {showEditDashboardDialog && (
        <EditDashboardDialog
          dashboardId={editDashboardId}
          dashboardTitle={getDashboardTitle(editDashboardId)}
          onClose={handleCloseEditDashboardDialog}
          onSave={handleSaveEditDashboard}
        />
      )}
    </React.Fragment>
  );
};

StartPage.propTypes = {
  error: PropTypes.toString,
  isLoading: PropTypes.bool,
  loadSettings: PropTypes.func.isRequired,
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    byId: PropTypes.object.isRequired,
    dashboards: PropTypes.arrayOf(PropTypes.string).isRequired,
    defaults: PropTypes.object.isRequired,
  }),
};

const mapStateToProps = rootState => {
  const settingsSelector = getDashboardSettings(rootState);
  const settings = settingsSelector.getById(DASHBOARD_ID);
  const isLoading = settingsSelector.getIsLoading(DASHBOARD_ID);
  const error = settingsSelector.getError(DASHBOARD_ID);

  return {
    error,
    isLoading,
    settings,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadSettings: (id, defaults) => dispatch(loadSettings(gmp)(id, defaults)),
  saveSettings: (id, settings) => dispatch(saveSettings(gmp)(id, settings)),
  setDefaultSettings: (id, settings) =>
    dispatch(setDashboardSettingDefaults(id, settings)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(StartPage);

// vim: set ts=2 sw=2 tw=80:
