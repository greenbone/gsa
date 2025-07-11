/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SYSTEM_DEFAULT} from 'gmp/locale/date';
import {ALL_FILTER} from 'gmp/models/filter';
import {filterEmptyScanConfig} from 'gmp/models/scanconfig';
import {openVasScannersFilter} from 'gmp/models/scanner';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {MySettingsIcon} from 'web/components/icon';
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
import useGmp from 'web/hooks/useGmp';
import useLanguage from 'web/hooks/useLanguage';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import DefaultSettings from 'web/pages/user-settings/DefaultsSettings';
import SettingsDialog from 'web/pages/user-settings/Dialog/Dialog';
import FilterSettings from 'web/pages/user-settings/FilterSettings';
import GeneralSettings from 'web/pages/user-settings/GeneralSettings';
import SeveritySettings from 'web/pages/user-settings/SeveritySettings';
import {ToolBarIcons} from 'web/pages/user-settings/UserSettingsPageComponents';
import {
  loadEntities as loadAlertsAction,
  loadEntity as loadAlertAction,
  selector as alertsSelector,
} from 'web/store/entities/alerts';
import {
  loadEntities as loadCredentialsAction,
  selector as credentialsSelector,
} from 'web/store/entities/credentials';
import {
  loadEntities as loadFiltersAction,
  selector as filtersSelector,
} from 'web/store/entities/filters';
import {
  loadEntities as loadPortListsAction,
  selector as portListsSelector,
} from 'web/store/entities/portlists';
import {
  loadEntities as loadScanConfigsAction,
  selector as scanConfigsSelector,
} from 'web/store/entities/scanconfigs';
import {
  loadEntities as loadScannersAction,
  selector as scannersSelector,
} from 'web/store/entities/scanners';
import {
  loadEntities as loadSchedulesAction,
  selector as schedulesSelector,
} from 'web/store/entities/schedules';
import {
  loadEntities as loadTargetsAction,
  selector as targetsSelector,
} from 'web/store/entities/targets';
import {
  updateTimezone,
  renewSessionTimeout,
} from 'web/store/usersettings/actions';
import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getTimezone} from 'web/store/usersettings/selectors';
import {BROWSER_LANGUAGE} from 'web/utils/Languages';

const useUserSettingsActions = () => {
  const dispatch = useDispatch();
  const gmp = useGmp();

  const loadAlerts = useCallback(
    () => dispatch(loadAlertsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadCredentials = useCallback(
    () => dispatch(loadCredentialsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadFilters = useCallback(
    () => dispatch(loadFiltersAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadPortLists = useCallback(
    () => dispatch(loadPortListsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadScanConfigs = useCallback(
    () => dispatch(loadScanConfigsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadScanners = useCallback(
    () => dispatch(loadScannersAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadSchedules = useCallback(
    () => dispatch(loadSchedulesAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadTargets = useCallback(
    () => dispatch(loadTargetsAction(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );
  const loadUserSettings = useCallback(
    () => dispatch(loadUserSettingDefaults(gmp)()),
    [dispatch, gmp],
  );
  const loadAlert = useCallback(
    id => dispatch(loadAlertAction(gmp)(id)),
    [dispatch, gmp],
  );
  const onInteraction = useCallback(
    () => dispatch(renewSessionTimeout(gmp)()),
    [dispatch, gmp],
  );
  const setTimezone = useCallback(
    timezone => dispatch(updateTimezone(gmp)(timezone)),
    [dispatch, gmp],
  );

  const loadFilterDefaults = useCallback(() => {
    return Promise.all([
      dispatch(loadUserSettingsDefaultFilter(gmp)('alert')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('auditreport')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('scanconfig')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('credential')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('filter')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('group')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('host')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('note')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('operatingsystem')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('override')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('permission')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('portlist')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('report')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('reportformat')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('result')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('role')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('scanner')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('schedule')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('tag')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('target')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('task')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('ticket')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('tlscertificate')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('user')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('vulnerability')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('cpe')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('cve')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('certbund')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('dfncert')),
      dispatch(loadUserSettingsDefaultFilter(gmp)('nvt')),
    ]);
  }, [dispatch, gmp]);

  return {
    loadAlerts,
    loadCredentials,
    loadFilters,
    loadPortLists,
    loadScanConfigs,
    loadScanners,
    loadSchedules,
    loadTargets,
    loadUserSettings,
    loadAlert,
    loadFilterDefaults,
    onInteraction,
    setTimezone,
  };
};

const UserSettings = () => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const [language, setLanguage] = useLanguage();
  const gmp = useGmp();
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
    onInteraction,
    setTimezone,
  } = useUserSettingsActions();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [disableEditIcon, setDisableEditIcon] = useState(true);

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);
  const userDefaultFilterSelector = useShallowEqualSelector(
    getUserSettingsDefaultFilter,
  );
  const isLoading = useShallowEqualSelector(state =>
    getUserSettingsDefaults(state).isLoading(),
  );

  // Removed unused `userInterfaceLanguage` as GeneralSettings handles it

  const userInterfaceTimeFormat =
    userDefaultsSelector.getByName('userinterfacetimeformat') || {};

  const userInterfaceDateFormat =
    userDefaultsSelector.getByName('userinterfacedateformat') || {};

  const rowsPerPage = userDefaultsSelector.getByName('rowsperpage') || {};

  const detailsExportFileName =
    userDefaultsSelector.getByName('detailsexportfilename') || {};

  const listExportFileName =
    userDefaultsSelector.getByName('listexportfilename') || {};

  const reportExportFileName =
    userDefaultsSelector.getByName('reportexportfilename') || {};
  const maxRowsPerPage = userDefaultsSelector.getByName('maxrowsperpage') || {};

  const autoCacheRebuild =
    userDefaultsSelector.getByName('autocacherebuild') || {};

  const defaultSeverity = useMemo(
    () => userDefaultsSelector.getByName('defaultseverity') || {},
    [userDefaultsSelector],
  );
  const dynamicSeverity = useMemo(
    () => userDefaultsSelector.getByName('dynamicseverity') || {},
    [userDefaultsSelector],
  );

  const defaultAlertId = userDefaultsSelector.getValueByName('defaultalert');
  const defaultEsxiCredentialId = userDefaultsSelector.getValueByName(
    'defaultesxicredential',
  );
  const defaultOpenvasScanConfigId = userDefaultsSelector.getValueByName(
    'defaultopenvasscanconfig',
  );
  const defaultSmbCredentialId = userDefaultsSelector.getValueByName(
    'defaultesxicredential',
  );
  const defaultSnmpCredentialId = userDefaultsSelector.getValueByName(
    'defaultsnmpcredential',
  );
  const defaultSshCredentialId = userDefaultsSelector.getValueByName(
    'defaultesxicredential',
  );
  const defaultScheduleId =
    userDefaultsSelector.getValueByName('defaultschedule');
  const defaultTargetId = userDefaultsSelector.getValueByName('defaulttarget');
  const defaultPortListId =
    userDefaultsSelector.getValueByName('defaultportlist');
  const defaultOpenvasScannerId = userDefaultsSelector.getValueByName(
    'defaultopenvasscanner',
  );

  const defaultAlert = useShallowEqualSelector(
    state => alertsSelector(state).getEntity(defaultAlertId) || [],
  );

  const defaultEsxiCredential = useShallowEqualSelector(
    state =>
      credentialsSelector(state).getEntity(defaultEsxiCredentialId) || {},
  );

  const defaultOpenvasScanConfig = useShallowEqualSelector(
    state =>
      scanConfigsSelector(state).getEntity(defaultOpenvasScanConfigId) || {},
  );

  const defaultSmbCredential = useShallowEqualSelector(
    state => credentialsSelector(state).getEntity(defaultSmbCredentialId) || {},
  );

  const defaultSnmpCredential = useShallowEqualSelector(
    state =>
      credentialsSelector(state).getEntity(defaultSnmpCredentialId) || {},
  );

  const defaultSshCredential = useShallowEqualSelector(
    state => credentialsSelector(state).getEntity(defaultSshCredentialId) || {},
  );

  const defaultSchedule = useShallowEqualSelector(
    state => schedulesSelector(state).getEntity(defaultScheduleId) || {},
  );

  const defaultTarget = useShallowEqualSelector(
    state => targetsSelector(state).getEntity(defaultTargetId) || {},
  );

  const defaultPortList = useShallowEqualSelector(
    state => portListsSelector(state).getEntity(defaultPortListId) || [],
  );

  const defaultOpenvasScanner = useShallowEqualSelector(
    state => scannersSelector(state).getEntity(defaultOpenvasScannerId) || [],
  );

  const isUserInterfaceTimeDateDefault = {
    value:
      userInterfaceTimeFormat.value === SYSTEM_DEFAULT &&
      userInterfaceDateFormat.value === SYSTEM_DEFAULT
        ? YES_VALUE
        : NO_VALUE,
  };

  const alerts = useShallowEqualSelector(state =>
    alertsSelector(state).getEntities(ALL_FILTER),
  );

  const credentials = useShallowEqualSelector(state =>
    credentialsSelector(state).getEntities(ALL_FILTER),
  );

  const scanners = useShallowEqualSelector(state =>
    scannersSelector(state).getEntities(ALL_FILTER),
  );

  const targets = useShallowEqualSelector(state =>
    targetsSelector(state).getEntities(ALL_FILTER),
  );

  const schedules = useShallowEqualSelector(state =>
    schedulesSelector(state).getEntities(ALL_FILTER),
  );

  const portlists = useShallowEqualSelector(state =>
    portListsSelector(state).getEntities(ALL_FILTER),
  );

  const filters = useShallowEqualSelector(state =>
    filtersSelector(state).getEntities(ALL_FILTER),
  );

  const scanconfigs =
    useShallowEqualSelector(state =>
      scanConfigsSelector(state).getEntities(ALL_FILTER),
    )?.filter(filterEmptyScanConfig) || [];

  const timezone = useShallowEqualSelector(getTimezone);

  const alertsFilter = userDefaultFilterSelector?.getFilter('alert') || {};
  const auditReportsFilter =
    userDefaultFilterSelector?.getFilter('auditreport') || {};
  const configsFilter =
    userDefaultFilterSelector?.getFilter('scanconfig') || {};
  const credentialsFilter =
    userDefaultFilterSelector?.getFilter('credential') || {};
  const filtersFilter = userDefaultFilterSelector?.getFilter('filter') || {};
  const groupsFilter = userDefaultFilterSelector?.getFilter('group') || {};
  const hostsFilter = userDefaultFilterSelector?.getFilter('host') || {};
  const notesFilter = userDefaultFilterSelector?.getFilter('note') || {};
  const operatingSystemsFilter =
    userDefaultFilterSelector?.getFilter('operatingsystem') || {};
  const overridesFilter =
    userDefaultFilterSelector?.getFilter('override') || {};
  const permissionsFilter =
    userDefaultFilterSelector?.getFilter('permission') || {};
  const portListsFilter =
    userDefaultFilterSelector?.getFilter('portlist') || {};
  const reportsFilter = userDefaultFilterSelector?.getFilter('report') || {};
  const reportFormatsFilter =
    userDefaultFilterSelector?.getFilter('reportformat') || {};
  const resultsFilter = userDefaultFilterSelector?.getFilter('result') || {};
  const rolesFilter = userDefaultFilterSelector?.getFilter('role') || {};
  const scannersFilter = userDefaultFilterSelector?.getFilter('scanner') || {};
  const schedulesFilter =
    userDefaultFilterSelector?.getFilter('schedule') || {};
  const tagsFilter = userDefaultFilterSelector?.getFilter('tag') || {};
  const targetsFilter = userDefaultFilterSelector?.getFilter('target') || {};
  const tasksFilter = userDefaultFilterSelector?.getFilter('task') || {};
  const ticketsFilter = userDefaultFilterSelector?.getFilter('ticket') || {};
  const tlsCertificatesFilter =
    userDefaultFilterSelector?.getFilter('tlscertificate') || {};
  const usersFilter = userDefaultFilterSelector?.getFilter('user') || {};
  const vulnerabilitiesFilter =
    userDefaultFilterSelector?.getFilter('vulnerability') || {};
  const cpeFilter = userDefaultFilterSelector?.getFilter('cpe') || {};
  const cveFilter = userDefaultFilterSelector?.getFilter('cve') || {};
  const certBundFilter = userDefaultFilterSelector?.getFilter('certbund') || {};
  const dfnCertFilter = userDefaultFilterSelector?.getFilter('dfncert') || {};
  const nvtFilter = userDefaultFilterSelector?.getFilter('nvt') || {};

  const openVasScanners = scanners?.filter(openVasScannersFilter);

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

  // Severity settings now managed in SeveritySettings component

  const openDialog = () => {
    setDialogVisible(true);
    handleInteraction();
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseDialog = () => {
    closeDialog();
    handleInteraction();
  };

  const handleInteraction = () => {
    onInteraction();
  };

  const handleSaveSettings = async data => {
    try {
      const {userInterfaceLanguage = BROWSER_LANGUAGE, timezone: tz} = data;
      await gmp.user.saveSettings(data);
      setDialogVisible(false);
      setLanguage(
        userInterfaceLanguage === BROWSER_LANGUAGE
          ? undefined
          : userInterfaceLanguage,
      );
      setTimezone(tz);

      localStorage.setItem(
        'userInterfaceTimeFormat',
        data.userInterfaceTimeFormat,
      );
      localStorage.setItem(
        'userInterfaceDateFormat',
        data.userInterfaceDateFormat,
      );

      loadSettings();
    } catch (error) {
      console.error(error);

      throw error;
    }
  };

  const handleValueChange = (value, name) => {
    // dynamic state update
    if (name === 'dialogVisible') setDialogVisible(value);
    if (name === 'disableEditIcon') setDisableEditIcon(value);
  };

  // `autoCacheRebuildValue` is now handled by GeneralSettings

  return (
    <>
      <PageTitle title={_('My Settings')} />
      <Layout flex="column">
        <ToolBarIcons
          disableEditIcon={disableEditIcon}
          onEditSettingsClick={openDialog}
        />
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
                {capabilities.mayAccess('filter') && <Tab>{_('Filters')}</Tab>}
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

                {capabilities.mayAccess('filter') && (
                  <TabPanel>
                    <FilterSettings disableEditIcon={disableEditIcon} />
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </TabsContainer>
        )}
        {dialogVisible && !isLoading && (
          <SettingsDialog
            alerts={alerts}
            alertsFilter={alertsFilter.id}
            auditReportsFilter={auditReportsFilter.id}
            autoCacheRebuild={autoCacheRebuild.value}
            certBundFilter={certBundFilter.id}
            configsFilter={configsFilter.id}
            cpeFilter={cpeFilter.id}
            credentials={credentials}
            credentialsFilter={credentialsFilter.id}
            cveFilter={cveFilter.id}
            defaultAlert={defaultAlert.id}
            defaultEsxiCredential={defaultEsxiCredential.id}
            defaultOpenvasScanConfig={defaultOpenvasScanConfig.id}
            defaultOpenvasScanner={defaultOpenvasScanner.id}
            defaultPortList={defaultPortList.id}
            defaultSchedule={defaultSchedule.id}
            defaultSeverity={defaultSeverity.value}
            defaultSmbCredential={defaultSmbCredential.id}
            defaultSnmpCredential={defaultSnmpCredential.id}
            defaultSshCredential={defaultSshCredential.id}
            defaultTarget={defaultTarget.id}
            detailsExportFileName={detailsExportFileName.value}
            dfnCertFilter={dfnCertFilter.id}
            dynamicSeverity={dynamicSeverity.value}
            filters={filters}
            filtersFilter={filtersFilter.id}
            groupsFilter={groupsFilter.id}
            hostsFilter={hostsFilter.id}
            isUserInterfaceTimeDateDefault={
              isUserInterfaceTimeDateDefault.value
            }
            listExportFileName={listExportFileName.value}
            maxRowsPerPage={maxRowsPerPage.value}
            notesFilter={notesFilter.id}
            nvtFilter={nvtFilter.id}
            openVasScanConfigs={scanconfigs}
            openVasScanners={openVasScanners}
            operatingSystemsFilter={operatingSystemsFilter.id}
            overridesFilter={overridesFilter.id}
            permissionsFilter={permissionsFilter.id}
            portLists={portlists}
            portListsFilter={portListsFilter.id}
            reportExportFileName={reportExportFileName.value}
            reportFormatsFilter={reportFormatsFilter.id}
            reportsFilter={reportsFilter.id}
            resultsFilter={resultsFilter.id}
            rolesFilter={rolesFilter.id}
            rowsPerPage={rowsPerPage.value}
            scannersFilter={scannersFilter.id}
            schedules={schedules}
            schedulesFilter={schedulesFilter.id}
            tagsFilter={tagsFilter.id}
            targets={targets}
            targetsFilter={targetsFilter.id}
            tasksFilter={tasksFilter.id}
            ticketsFilter={ticketsFilter.id}
            timezone={timezone}
            tlsCertificatesFilter={tlsCertificatesFilter.id}
            userInterfaceDateFormat={userInterfaceDateFormat.value}
            userInterfaceLanguage={language}
            userInterfaceTimeFormat={userInterfaceTimeFormat.value}
            usersFilter={usersFilter.id}
            vulnerabilitiesFilter={vulnerabilitiesFilter.id}
            onClose={handleCloseDialog}
            onSave={handleSaveSettings}
            onValueChange={handleValueChange}
          />
        )}
      </Layout>
    </>
  );
};

export default UserSettings;
