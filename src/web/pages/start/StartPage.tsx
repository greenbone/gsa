/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import {v4 as uuid} from 'uuid';
import {isDefined} from 'gmp/utils/identity';
import {
  addDisplayToSettings,
  canAddDisplay,
  convertDefaultDisplays,
} from 'web/components/dashboard/Utils';
import {
  DashboardIcon,
  TrashcanIcon,
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
import TabsContainer from 'web/components/tab/TabsContainer';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ConfirmRemoveDialog from 'web/pages/start/ConfirmRemoveDialog';
import Dashboard from 'web/pages/start/Dashboard';
import EditDashboardDialog from 'web/pages/start/EditDashboardDialog';
import NewDashboardDialog, {
  DEFAULT_DISPLAYS,
} from 'web/pages/start/NewDashboardDialog';
import {
  type DashboardData,
  type DashboardSettings,
} from 'web/pages/start/types';
import {loadSettings, saveSettings} from 'web/store/dashboard/settings/actions';
import getDashboardSettingsSelector, {
  DashboardSetting,
} from 'web/store/dashboard/settings/selectors';

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

const StartPage = () => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const dispatch = useDispatch();

  const loadSettingsAction = useCallback(
    (id: string, defaults: Record<string, unknown>) => {
      // @ts-expect-error
      dispatch(loadSettings(gmp)(id, defaults));
    },
    [dispatch, gmp],
  );

  const saveDashboardSettings = useCallback(
    (id: string, defaults: Record<string, unknown>) => {
      // @ts-expect-error
      dispatch(saveSettings(gmp)(id, defaults));
    },
    [dispatch, gmp],
  );

  const settingsSelector = useSelector(getDashboardSettingsSelector);
  const settings = settingsSelector.getById(DASHBOARD_ID);
  const isLoading = settingsSelector.getIsLoading(DASHBOARD_ID);

  const getDashboardSettings = (dashboardId: string): DashboardSettings => {
    if (!dashboardSelector) {
      return {};
    }
    return dashboardSelector.getById(dashboardId);
  };

  const [showConfirmRemoveDialog, setShowConfirmRemoveDialog] = useState(false);
  const [showNewDashboardDialog, setShowNewDashboardDialog] = useState(false);
  const [showEditDashboardDialog, setShowEditDashboardDialog] = useState(false);
  const [removeDashboardId, setRemoveDashboardId] = useState('');
  const [editDashboardId, setEditDashboardId] = useState('');

  const dashboardSelector = useMemo(
    () => (settings ? new DashboardSetting(settings) : undefined),
    [settings],
  );

  useEffect(() => {
    const DEFAULTS = getDefaults(_);
    loadSettingsAction(DASHBOARD_ID, DEFAULTS);
  }, [loadSettingsAction, _, gmp]);

  const updateSettings = (newSettings: Record<string, unknown>) => {
    saveDashboardSettings(DASHBOARD_ID, {
      ...(settings || {}),
      ...newSettings,
    });
  };

  const handleRemoveDashboard = (dashboardId: string) => {
    const dashboards = getDashboards();

    if (dashboards.length <= 1) {
      return;
    }

    const {byId = {}, defaults = {}} = settings || {};

    const byIdCopy = {...byId};
    delete byIdCopy[dashboardId];
    const defaultsCopy = {...defaults};
    delete defaultsCopy[dashboardId];

    setShowConfirmRemoveDialog(false);

    updateSettings({
      byId: byIdCopy,
      dashboards: dashboards.filter((id: string) => id !== dashboardId),
      defaults: defaultsCopy,
    });
  };

  const handleOpenConfirmRemoveDashboardDialog = (id: string) => {
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

  const handleOpenEditDashboardDialog = (id: string) => {
    setEditDashboardId(id);
    setShowEditDashboardDialog(true);
  };

  const handleCloseEditDashboardDialog = () => {
    setShowEditDashboardDialog(false);
  };

  const handleSaveDashboardSettings = (
    dashboardId: string,
    dashboardSettings: DashboardData,
  ) => {
    updateDashboardSettings(dashboardId, dashboardSettings);
  };

  const handleSetDefaultSettings = (
    dashboardId: string,
    defaultSettings: Record<string, unknown>,
  ) => {
    updateDashboardDefaults(dashboardId, defaultSettings);
  };

  const handleResetDashboard = (dashboardId: string) => {
    const defaults = getDashboardDefaults(dashboardId);
    updateDashboardSettings(dashboardId, defaults);
  };

  const handleAddNewDisplay = (
    oldSettings: DashboardSettings,
    dashboardId: string,
    displayId: string,
  ) => {
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
  }: {
    title: string;
    defaultDisplays?: string[][];
  }): void => {
    const {byId = {}} = settings || {};
    const dashboards = getDashboards();

    const id = uuid();

    const newDashboardSetting: unknown = {
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

    updateSettings(newSettings);
    closeNewDashboardDialog();
  };

  const handleSaveEditDashboard = ({
    dashboardId,
    dashboardTitle,
  }: {
    dashboardId: string;
    dashboardTitle: string;
  }): void => {
    updateDashboardSettings(dashboardId, {title: dashboardTitle});
    setShowEditDashboardDialog(false);
  };

  const updateDashboardSettings = (
    dashboardId: string,
    newSettings: DashboardData,
  ) => {
    const {byId = {}} = settings || {};
    const oldSettings = getDashboardSettings(dashboardId);

    updateSettings({
      byId: {
        ...byId,
        [dashboardId]: {
          ...oldSettings,
          ...newSettings,
        },
      },
    });
  };

  const updateDashboardDefaults = (
    dashboardId: string,
    newDefaults: Record<string, unknown>,
  ) => {
    const {defaults = {}} = settings || {};

    updateSettings({
      defaults: {
        ...defaults,
        [dashboardId]: newDefaults,
      },
    });
  };

  const getDashboards = (): string[] => {
    const {dashboards = [], byId = {}} = settings || {};
    return dashboards.filter((id: string) => isDefined(byId[id]));
  };

  const getDashboardDefaults = (
    dashboardId: string,
  ): Record<string, unknown> => {
    if (!dashboardSelector) {
      return {};
    }
    return dashboardSelector.getDefaultsById(dashboardId);
  };

  const getDashboardTitle = (dashboardId: string): string => {
    const dashboardSettings = getDashboardSettings(dashboardId);
    return dashboardSettings.title || '';
  };

  const getDashboardDisplayIds = (dashboardId: string): string[][] => {
    const dashboardSettings = getDashboardSettings(dashboardId);
    const {rows = []} = dashboardSettings;
    return rows.map(row => {
      const {items = []} = row;
      return items.map(item => item.displayId);
    });
  };

  const dashboards = getDashboards();
  const canAdd = dashboards.length < MAX_DASHBOARDS;

  return (
    <>
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
          <TabsContainer flex="column" grow="1">
            <TabLayout align={['start', 'end']} grow="1">
              <TabList align={['start', 'stretch']}>
                {dashboards.map(id => {
                  const title = getDashboardTitle(id);
                  return (
                    <StyledTab key={id}>
                      <Divider margin="13px">
                        <span>{title}</span>{' '}
                        <EditIcon
                          size="tiny"
                          title={_('Edit Dashboard Title')}
                          onClick={() => handleOpenEditDashboardDialog(id)}
                        />
                        {dashboards.length > 1 && (
                          <IconDivider margin="3px">
                            <TrashcanIcon
                              size="tiny"
                              title={_('Remove Dashboard')}
                              onClick={() => {
                                handleOpenConfirmRemoveDashboardDialog(id);
                              }}
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
                    onClick={canAdd ? handleOpenNewDashboardDialog : undefined}
                  />
                </Layout>
              </TabList>
            </TabLayout>

            <Tabs>
              <TabPanels>
                {dashboards.map((id: string) => {
                  const dashboardSettings = getDashboardSettings(id);
                  return (
                    <TabPanel key={id}>
                      <SubscriptionProvider>
                        {({notify}) => (
                          <Dashboard
                            id={id}
                            notify={notify}
                            saveSettings={handleSaveDashboardSettings}
                            setDefaultSettings={handleSetDefaultSettings}
                            settings={dashboardSettings}
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
          </TabsContainer>
        )}
      </Section>
      {showConfirmRemoveDialog && (
        <ConfirmRemoveDialog
          dashboardId={removeDashboardId}
          dashboardTitle={getDashboardTitle(removeDashboardId)}
          onConfirm={handleRemoveDashboard}
          onDeny={handleCloseConfirmRemoveDashboardDialog}
        />
      )}
      {showNewDashboardDialog && (
        <NewDashboardDialog
          additionalDisplayChoices={dashboards.map((id: string) => ({
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
    </>
  );
};

export default StartPage;
