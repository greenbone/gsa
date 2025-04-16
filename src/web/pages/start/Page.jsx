/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import memoize from 'memoize-one';
import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {v4 as uuid} from 'uuid';
import {
  addDisplayToSettings,
  canAddDisplay,
  convertDefaultDisplays,
} from 'web/components/dashboard/Utils';
import {
  DashboardIcon,
  DeleteIcon,
  EditIcon,
  NewIcon,
} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Loading from 'web/components/loading/Loading';
import SubscriptionProvider from 'web/components/provider/SubscriptionProvider';
import Section from 'web/components/section/Section';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import useTranslation from 'web/hooks/useTranslation';
import ConfirmRemoveDialog from 'web/pages/start/ConfirmRemoveDialog';
import Dashboard from 'web/pages/start/Dashboard';
import EditDashboardDialog from 'web/pages/start/EditDashboardDialog';
import NewDashboardDialog, {
  DEFAULT_DISPLAYS,
} from 'web/pages/start/NewDashboardDialog';
import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import getDashboardSettings, {
  DashboardSetting,
} from 'web/store/dashboard/settings/selectors';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';
const DASHBOARD_ID = 'd97eca9f-0386-4e5d-88f2-0ed7f60c0646';
const OVERVIEW_DASHBOARD_ID = '84fbe9f5-8ad4-43f0-9712-850182abb003';
const DEFAULT_OVERVIEW_DISPLAYS = convertDefaultDisplays(DEFAULT_DISPLAYS);

const getDefaults = _ => ({
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

const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <ManualIcon
      anchor="dashboards-and-dashboard-displays"
      page="web-interface"
      title={_('Help: Dashboards')}
    />
  );
};

class StartPage extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      activeTab: DEFAULT_TAB,
      showConfirmRemoveDialog: false,
      showNewDashboardDialog: false,
    };

    this.handleActivateTab = this.handleActivateTab.bind(this);

    this.handleOpenConfirmRemoveDashboardDialog =
      this.handleOpenConfirmRemoveDashboardDialog.bind(this);
    this.handleCloseConfirmRemoveDashboardDialog =
      this.handleCloseConfirmRemoveDashboardDialog.bind(this);

    this.handleRemoveDashboard = this.handleRemoveDashboard.bind(this);

    this.handleLoadDashboardSettings =
      this.handleLoadDashboardSettings.bind(this);
    this.handleSaveDashboardSettings =
      this.handleSaveDashboardSettings.bind(this);

    this.handleResetDashboard = this.handleResetDashboard.bind(this);
    this.handleAddNewDisplay = this.handleAddNewDisplay.bind(this);

    this.handleOpenNewDashboardDialog =
      this.handleOpenNewDashboardDialog.bind(this);
    this.handleCloseNewDashboardDialog =
      this.handleCloseNewDashboardDialog.bind(this);

    this.handleAddNewDashboard = this.handleAddNewDashboard.bind(this);

    this.handleResetDashboards = this.handleResetDashboards.bind(this);
    this.handleSetDefaultSettings = this.handleSetDefaultSettings.bind(this);

    this.handleCloseEditDashboardDialog =
      this.handleCloseEditDashboardDialog.bind(this);
    this.handleSaveEditDashboard = this.handleSaveEditDashboard.bind(this);

    this.getDashboardSelector = memoize(
      settings => new DashboardSetting(settings),
    );
  }

  componentDidMount() {
    const {_} = this.props;
    const DEFAULTS = getDefaults(_);
    this.props.loadSettings(DASHBOARD_ID, DEFAULTS);
  }

  saveSettings(newSettings) {
    this.props.saveSettings(DASHBOARD_ID, {
      ...this.props.settings,
      ...newSettings,
    });
  }

  handleRemoveDashboard(dashboardId) {
    const dashboards = this.getDashboards();

    if (dashboards.length <= 1) {
      return;
    }

    const {settings = {}} = this.props;
    const {byId = {}, defaults = {}} = settings;

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
    });
  }

  handleOpenConfirmRemoveDashboardDialog(id) {
    this.setState({
      showConfirmRemoveDialog: true,
      removeDashboardId: id,
    });
  }

  handleCloseConfirmRemoveDashboardDialog() {
    this.setState({showConfirmRemoveDialog: false});
  }

  closeNewDashboardDialog() {
    this.setState({showNewDashboardDialog: false});
  }

  handleOpenNewDashboardDialog() {
    this.setState({showNewDashboardDialog: true});
  }

  handleCloseNewDashboardDialog() {
    this.closeNewDashboardDialog();
  }

  handleOpenEditDashboardDialog(id) {
    this.setState({
      editDashboardId: id,
      showEditDashboardDialog: true,
    });
  }

  handleCloseEditDashboardDialog() {
    this.setState({showEditDashboardDialog: false});
  }

  handleActivateTab(tab) {
    this.setState({activeTab: tab});
  }

  handleSaveDashboardSettings(dashboardId, settings) {
    this.updateDashboardSettings(dashboardId, settings);
  }

  handleLoadDashboardSettings() {
    // do nothing
    // all defaults and settings are already provided
  }

  handleSetDefaultSettings(dashboardId, defaultSettings) {
    this.updateDashboardDefaults(dashboardId, defaultSettings);
  }

  handleResetDashboard(dashboardId) {
    const settings = this.getDashboardDefaults(dashboardId);
    this.updateDashboardSettings(dashboardId, settings);
  }

  handleAddNewDisplay(oldSettings, dashboardId, displayId) {
    if (!isDefined(displayId) || !isDefined(dashboardId)) {
      return;
    }

    if (!canAddDisplay(oldSettings)) {
      return;
    }

    const newSettings = addDisplayToSettings(oldSettings, displayId);
    this.updateDashboardSettings(dashboardId, newSettings);
  }

  handleAddNewDashboard({title, defaultDisplays = DEFAULT_DISPLAYS}) {
    const {settings = {}} = this.props;
    const {byId = {}} = settings;
    const dashboards = this.getDashboards();

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

    this.saveSettings(newSettings);

    this.closeNewDashboardDialog();

    // change to new dashboard tab
    this.setState({activeTab: dashboards.length});
  }

  handleSaveEditDashboard({dashboardId, dashboardTitle}) {
    this.updateDashboardSettings(dashboardId, {title: dashboardTitle});
    this.setState({showEditDashboardDialog: false});
  }

  handleResetDashboards() {
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
  }

  updateDashboardSettings(dashboardId, newSettings) {
    const {byId = {}} = this.props.settings;
    const oldSettings = this.getDashboardSettings(dashboardId);

    this.saveSettings({
      byId: {
        ...byId,
        [dashboardId]: {
          ...oldSettings,
          ...newSettings,
        },
      },
    });
  }

  updateDashboardDefaults(dashboardId, newDefaults) {
    const {defaults = {}} = this.props.settings;
    this.saveSettings({
      defaults: {
        ...defaults,
        [dashboardId]: newDefaults,
      },
    });
  }

  getDashboards() {
    const {settings = {}} = this.props;
    const {dashboards = [], byId = {}} = settings;
    return dashboards.filter(id => isDefined(byId[id]));
  }

  getDashboardSettings(dashboardId) {
    const {settings = {}} = this.props;
    const selector = this.getDashboardSelector(settings);
    return selector.getById(dashboardId);
  }

  getDashboardDefaults(dashboardId) {
    const {settings = {}} = this.props;
    const selector = this.getDashboardSelector(settings);
    return selector.getDefaultsById(dashboardId);
  }

  getDashboardTitle(dashboardId) {
    const dashboardSettings = this.getDashboardSettings(dashboardId);
    return dashboardSettings.title;
  }

  getDashboardDisplayIds(dashboardId) {
    const dashboardSettings = this.getDashboardSettings(dashboardId);
    const {rows = []} = dashboardSettings;
    return rows.map(row => {
      const {items = []} = row;
      return items.map(item => item.displayId);
    });
  }

  render() {
    const {_} = this.props;

    const {isLoading} = this.props;
    const {
      activeTab,
      editDashboardId,
      removeDashboardId,
      showEditDashboardDialog,
      showNewDashboardDialog,
      showConfirmRemoveDialog,
    } = this.state;

    const dashboards = this.getDashboards();

    const canAdd = dashboards.length < MAX_DASHBOARDS;
    return (
      <React.Fragment>
        <PageTitle title={_('Dashboards')} />
        <span>
          {' '}
          {/* span prevents Toolbar from growing */}
          <ToolBarIcons />
        </span>
        <Section img={<DashboardIcon size="large" />} title={_('Dashboards')}>
          {isLoading ? (
            <Loading />
          ) : (
            <React.Fragment>
              <TabLayout align={['start', 'end']} grow="1">
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={this.handleActivateTab}
                >
                  {dashboards.map(id => {
                    const title = this.getDashboardTitle(id);
                    return (
                      <StyledTab key={id}>
                        <Divider margin="13px">
                          <span>{title}</span>
                          {dashboards.length > 1 && (
                            <IconDivider margin="3px">
                              <EditIcon
                                size="tiny"
                                title={_('Edit Dashboard Title')}
                                onClick={() =>
                                  this.handleOpenEditDashboardDialog(id)
                                }
                              />
                              <DeleteIcon
                                size="tiny"
                                title={_('Remove Dashboard')}
                                onClick={() =>
                                  this.handleOpenConfirmRemoveDashboardDialog(
                                    id,
                                  )
                                }
                              />
                            </IconDivider>
                          )}
                        </Divider>
                      </StyledTab>
                    );
                  })}

                  <Layout grow align={['center', 'center']}>
                    <StyledNewIcon
                      active={canAdd}
                      data-testid="add-dashboard"
                      title={
                        canAdd
                          ? _('Add new Dashboard')
                          : _('Dashboards limit reached')
                      }
                      onClick={
                        canAdd ? this.handleOpenNewDashboardDialog : undefined
                      }
                    />
                  </Layout>
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  {dashboards.map(id => {
                    const settings = this.getDashboardSettings(id);
                    return (
                      <TabPanel key={id}>
                        <SubscriptionProvider>
                          {({notify}) => (
                            <Dashboard
                              id={id}
                              loadSettings={this.handleLoadDashboardSettings}
                              notify={notify}
                              saveSettings={this.handleSaveDashboardSettings}
                              setDefaultSettings={this.handleSetDefaultSettings}
                              settings={settings}
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
          )}
        </Section>
        {showConfirmRemoveDialog && (
          <ConfirmRemoveDialog
            dashboardId={removeDashboardId}
            dashboardTitle={this.getDashboardTitle(removeDashboardId)}
            onConfirm={this.handleRemoveDashboard}
            onDeny={this.handleCloseConfirmRemoveDashboardDialog}
          />
        )}
        {showNewDashboardDialog && (
          <NewDashboardDialog
            additionalDisplayChoices={dashboards.map(id => ({
              label: this.getDashboardTitle(id),
              key: id,
              value: this.getDashboardDisplayIds(id),
            }))}
            onClose={this.handleCloseNewDashboardDialog}
            onSave={this.handleAddNewDashboard}
          />
        )}
        {showEditDashboardDialog && (
          <EditDashboardDialog
            dashboardId={editDashboardId}
            dashboardTitle={this.getDashboardTitle(editDashboardId)}
            onClose={this.handleCloseEditDashboardDialog}
            onSave={this.handleSaveEditDashboard}
          />
        )}
      </React.Fragment>
    );
  }
}

StartPage.propTypes = {
  error: PropTypes.toString,
  isLoading: PropTypes.bool,
  loadSettings: PropTypes.func.isRequired,
  renewSessionTimeout: PropTypes.func.isRequired,
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    byId: PropTypes.object.isRequired,
    dashboards: PropTypes.arrayOf(PropTypes.string).isRequired,
    defaults: PropTypes.object.isRequired,
  }),
  _: PropTypes.func.isRequired,
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
  renewSessionTimeout: () => dispatch(renewSessionTimeout(gmp)()),
  setDefaultSettings: (id, settings) =>
    dispatch(setDashboardSettingDefaults(id, settings)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(withTranslation(StartPage));
