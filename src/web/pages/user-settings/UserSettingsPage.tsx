/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {MySettingsIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import DefaultSettings from 'web/pages/user-settings/DefaultsSettings';
import FilterSettings from 'web/pages/user-settings/FilterSettings';
import GeneralSettings from 'web/pages/user-settings/GeneralSettings';
import SeveritySettings from 'web/pages/user-settings/SeveritySettings';
import useUserSettingsActions from 'web/pages/user-settings/useUserSettingsActions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

export const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <Layout>
      <IconDivider>
        <ManualIcon
          anchor="changing-the-user-settings"
          page="web-interface"
          size="small"
          title={_('Help: My Settings')}
        />
      </IconDivider>
    </Layout>
  );
};

const UserSettings = () => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();

  const {
    loadAlerts,
    loadCredentials,
    loadFilters,
    loadPortLists,
    loadScanConfigs,
    loadScanners,
    loadSchedules,
    loadTargets,
    loadUserSettings,
    loadFilterDefaults,
  } = useUserSettingsActions();

  const [disableEditIcon, setDisableEditIcon] = useState<boolean>(true);

  const isLoading: boolean = useShallowEqualSelector(state =>
    getUserSettingsDefaults(state).isLoading(),
  );

  const loadEntities = () => {
    loadAlerts();
    loadCredentials();
    loadFilters();
    loadPortLists();
    loadScanConfigs();
    loadScanners();
    loadSchedules();
    loadTargets();
  };

  const loadSettings = () => {
    loadFilterDefaults()
      .then(() => setDisableEditIcon(false))
      .catch(() => setDisableEditIcon(false));
    loadUserSettings();
  };

  useEffect(() => {
    loadSettings();
    loadEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageTitle title={_('My Settings')} />
      <Layout flex="column">
        <ToolBarIcons />
        <Section
          img={<MySettingsIcon size="large" />}
          title={_('My Settings')}
        />

        {isLoading && <Loading />}

        {!isLoading && (
          <TabsContainer flex="column" grow="1">
            <TabLayout align={['start', 'end']} grow="1">
              <TabList align={['start', 'stretch']}>
                <Tab>{_('General')}</Tab>
                <Tab>{_('Severity')}</Tab>
                <Tab>{_('Defaults')}</Tab>
                {capabilities?.mayAccess('filter') && <Tab>{_('Filters')}</Tab>}
              </TabList>
            </TabLayout>

            <Tabs>
              <TabPanels>
                <TabPanel>
                  <GeneralSettings disableEditIcon={disableEditIcon} />
                </TabPanel>
                <TabPanel>
                  <SeveritySettings disableEditIcon={disableEditIcon} />
                </TabPanel>

                <TabPanel>
                  <DefaultSettings disableEditIcon={disableEditIcon} />
                </TabPanel>

                {capabilities?.mayAccess('filter') && (
                  <TabPanel>
                    <FilterSettings disableEditIcon={disableEditIcon} />
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </TabsContainer>
        )}
      </Layout>
    </>
  );
};

export default UserSettings;
