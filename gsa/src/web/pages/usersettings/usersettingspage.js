/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import React from 'react';
import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {ALL_FILTER} from 'gmp/models/filter';
import {
  filterEmptyScanConfig,
  openVasScanConfigsFilter,
  ospScanConfigsFilter,
} from 'gmp/models/scanconfig';
import {openVasScannersFilter, ospScannersFilter} from 'gmp/models/scanner';

import {YES_VALUE, parseYesNo} from 'gmp/parser';

import {hasValue, isDefined} from 'gmp/utils/identity';

import ManualIcon from 'web/components/icon/manualicon';
import MySettingsIcon from 'web/components/icon/mysettingsicon';
import EditIcon from 'web/components/icon/editicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import DetailsLink from 'web/components/link/detailslink';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import {
  loadEntities as loadAlerts,
  loadEntity as loadAlert,
  selector as alertsSelector,
} from 'web/store/entities/alerts';
import {
  loadEntities as loadCredentials,
  selector as credentialsSelector,
} from 'web/store/entities/credentials';
import {
  loadEntities as loadFilters,
  selector as filtersSelector,
} from 'web/store/entities/filters';
import {
  loadEntities as loadPortLists,
  selector as portListsSelector,
} from 'web/store/entities/portlists';
import {
  loadEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';
import {
  loadEntities as loadScanConfigs,
  selector as scanConfigsSelector,
} from 'web/store/entities/scanconfigs';
import {
  loadEntities as loadScanners,
  selector as scannersSelector,
} from 'web/store/entities/scanners';
import {
  loadEntities as loadSchedules,
  selector as schedulesSelector,
} from 'web/store/entities/schedules';
import {
  loadEntities as loadTargets,
  selector as targetsSelector,
} from 'web/store/entities/targets';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';

import {getTimezone} from 'web/store/usersettings/selectors';
import {
  updateTimezone,
  renewSessionTimeout,
} from 'web/store/usersettings/actions';

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import compose from 'web/utils/compose';
import Languages, {BROWSER_LANGUAGE} from 'web/utils/languages';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import SettingsDialog from './dialog';

const FIRST_COL_WIDTH = '250px';

const getLangNameByCode = code => {
  const language = Languages[code];
  return isDefined(language) ? `${language.name}` : null;
};

const SettingTableRow = ({setting, title, type}) => {
  const {comment, id, name} = setting;
  return (
    <TableRow title={comment}>
      <TableData>{title}</TableData>
      <TableData>
        <Layout>
          {isDefined(id) && (
            <DetailsLink id={id} type={type}>
              {name}
            </DetailsLink>
          )}
        </Layout>
      </TableData>
    </TableRow>
  );
};

SettingTableRow.propTypes = {
  setting: PropTypes.object,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const ToolBarIcons = ({capabilities, disableEditIcon, onEditSettingsClick}) => {
  const mayEdit = capabilities.mayEdit('setting');
  const editIconTitle = mayEdit
    ? _('Edit My Settings')
    : _('Permission to edit settings denied');

  return (
    <Layout>
      <IconDivider>
        <ManualIcon
          size="small"
          page="web-interface"
          anchor="changing-the-user-settings"
          title={_('Help: My Settings')}
        />
        <EditIcon
          disabled={disableEditIcon || !mayEdit}
          size="small"
          title={editIconTitle}
          onClick={onEditSettingsClick}
        />
      </IconDivider>
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  disableEditIcon: PropTypes.bool.isRequired,
  onEditSettingsClick: PropTypes.func.isRequired,
};

class UserSettings extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      activeTab: 0,
      dialogVisible: false,
      disableEditIcon: true,
    };

    this.openDialog = this.openDialog.bind(this);
    this.handleActivateTab = this.handleActivateTab.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentDidMount() {
    this.loadSettings();
    this.loadEntities();
  }

  handleActivateTab(index) {
    this.handleInteraction();

    this.setState({activeTab: index});
  }

  loadEntities() {
    this.props.loadAlerts();
    this.props.loadCredentials();
    this.props.loadFilters();
    this.props.loadPortLists();
    this.props.loadReportFormats();
    this.props.loadScanConfigs();
    this.props.loadScanners();
    this.props.loadSchedules();
    this.props.loadTargets();
  }

  loadSettings() {
    this.props
      .loadFilterDefaults()
      .then(() => {
        this.setState({disableEditIcon: false});
      })
      .catch(() => {
        this.setState({disableEditIcon: false});
      });
    this.props.loadSettings();
  }

  openDialog() {
    this.setState({dialogVisible: true});
    this.handleInteraction();
  }

  closeDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseDialog() {
    this.closeDialog();
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleSaveSettings(data) {
    const {gmp} = this.props;
    const {userInterfaceLanguage = BROWSER_LANGUAGE, timezone} = data;

    this.handleInteraction();

    return gmp.user.saveSettings(data).then(() => {
      this.closeDialog();
      this.props.setLocale(
        userInterfaceLanguage === BROWSER_LANGUAGE
          ? undefined
          : userInterfaceLanguage,
      );
      this.props.setTimezone(timezone);

      this.loadSettings();
    });
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  render() {
    const {activeTab, dialogVisible, disableEditIcon} = this.state;
    let {
      capabilities,
      filters,
      alerts,
      credentials,
      scanconfigs = [],
      scanners = [],
      portlists,
      reportformats,
      schedules,
      targets,
      isLoading = true,
      timezone,
      userInterfaceLanguage = {},
      rowsPerPage = {},
      maxRowsPerPage = {},
      detailsExportFileName = {},
      listExportFileName = {},
      reportExportFileName = {},
      dynamicSeverity = {},
      defaultSeverity = {},
      defaultAlert = {},
      defaultEsxiCredential = {},
      defaultOspScanConfig = {},
      defaultOspScanner = {},
      defaultOpenvasScanConfig = {},
      defaultOpenvasScanner = {},
      defaultPortList = {},
      defaultReportFormat = {},
      defaultSmbCredential = {},
      defaultSnmpCredential = {},
      defaultSshCredential = {},
      defaultSchedule = {},
      defaultTarget = {},
      alertsFilter,
      configsFilter,
      credentialsFilter,
      filtersFilter,
      groupsFilter,
      hostsFilter,
      notesFilter,
      operatingSystemsFilter,
      overridesFilter,
      permissionsFilter,
      portListsFilter,
      reportsFilter,
      reportFormatsFilter,
      resultsFilter,
      rolesFilter,
      scannersFilter,
      schedulesFilter,
      tagsFilter,
      targetsFilter,
      tasksFilter,
      ticketsFilter,
      tlsCertificatesFilter,
      usersFilter,
      vulnerabilitiesFilter,
      cpeFilter,
      cveFilter,
      nvtFilter,
      ovalFilter,
      certBundFilter,
      dfnCertFilter,
      autoCacheRebuild = {},
    } = this.props;

    alertsFilter = hasValue(alertsFilter) ? alertsFilter : {};
    configsFilter = hasValue(configsFilter) ? configsFilter : {};
    credentialsFilter = hasValue(credentialsFilter) ? credentialsFilter : {};
    filtersFilter = hasValue(filtersFilter) ? filtersFilter : {};
    groupsFilter = hasValue(groupsFilter) ? groupsFilter : {};
    hostsFilter = hasValue(hostsFilter) ? hostsFilter : {};
    notesFilter = hasValue(notesFilter) ? notesFilter : {};
    operatingSystemsFilter = hasValue(operatingSystemsFilter)
      ? operatingSystemsFilter
      : {};
    overridesFilter = hasValue(overridesFilter) ? overridesFilter : {};
    permissionsFilter = hasValue(permissionsFilter) ? permissionsFilter : {};
    portListsFilter = hasValue(portListsFilter) ? portListsFilter : {};
    reportsFilter = hasValue(reportsFilter) ? reportsFilter : {};
    reportFormatsFilter = hasValue(reportFormatsFilter)
      ? reportFormatsFilter
      : {};
    resultsFilter = hasValue(resultsFilter) ? resultsFilter : {};
    rolesFilter = hasValue(rolesFilter) ? rolesFilter : {};
    scannersFilter = hasValue(scannersFilter) ? scannersFilter : {};
    schedulesFilter = hasValue(schedulesFilter) ? schedulesFilter : {};
    tagsFilter = hasValue(tagsFilter) ? tagsFilter : {};
    targetsFilter = hasValue(targetsFilter) ? targetsFilter : {};
    tasksFilter = hasValue(tasksFilter) ? tasksFilter : {};
    ticketsFilter = hasValue(ticketsFilter) ? ticketsFilter : {};
    tlsCertificatesFilter = hasValue(tlsCertificatesFilter)
      ? tlsCertificatesFilter
      : {};
    usersFilter = hasValue(usersFilter) ? usersFilter : {};
    vulnerabilitiesFilter = hasValue(vulnerabilitiesFilter)
      ? vulnerabilitiesFilter
      : {};
    cpeFilter = hasValue(cpeFilter) ? cpeFilter : {};
    cveFilter = hasValue(cveFilter) ? cveFilter : {};
    nvtFilter = hasValue(nvtFilter) ? nvtFilter : {};
    ovalFilter = hasValue(ovalFilter) ? ovalFilter : {};
    certBundFilter = hasValue(certBundFilter) ? certBundFilter : {};
    dfnCertFilter = hasValue(dfnCertFilter) ? dfnCertFilter : {};

    const openVasScanConfigs = scanconfigs.filter(openVasScanConfigsFilter);
    const ospScanConfigs = scanconfigs.filter(ospScanConfigsFilter);
    const openVasScanners = scanners.filter(openVasScannersFilter);
    const ospScanners = scanners.filter(ospScannersFilter);

    return (
      <React.Fragment>
        <PageTitle title={_('My Settings')} />
        <Layout flex="column">
          <ToolBarIcons
            capabilities={capabilities}
            disableEditIcon={disableEditIcon}
            onEditSettingsClick={this.openDialog}
          />
          <Section
            img={<MySettingsIcon size="large" />}
            title={_('My Settings')}
          />
          {isLoading ? (
            <Loading />
          ) : (
            <React.Fragment>
              <TabLayout grow="1" align={['start', 'end']}>
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={this.handleActivateTab}
                >
                  <Tab>{_('General')}</Tab>
                  <Tab>{_('Severity')}</Tab>
                  <Tab>{_('Defaults')}</Tab>
                  {capabilities.mayAccess('filter') && (
                    <Tab>{_('Filters')}</Tab>
                  )}
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Table>
                      <colgroup width={FIRST_COL_WIDTH} />
                      <TableBody>
                        <TableRow>
                          <TableData>{_('Timezone')}</TableData>
                          <TableData>{timezone}</TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>{_('Password')}</TableData>
                          <TableData>********</TableData>
                        </TableRow>
                        <TableRow title={userInterfaceLanguage.comment}>
                          <TableData>{_('User Interface Language')}</TableData>
                          <TableData>
                            {getLangNameByCode(userInterfaceLanguage.value)}
                          </TableData>
                        </TableRow>
                        <TableRow title={rowsPerPage.comment}>
                          <TableData>{_('Rows Per Page')}</TableData>
                          <TableData>{rowsPerPage.value}</TableData>
                        </TableRow>
                        <TableRow title={detailsExportFileName.comment}>
                          <TableData>{_('Details Export File Name')}</TableData>
                          <TableData>{detailsExportFileName.value}</TableData>
                        </TableRow>
                        <TableRow title={listExportFileName.comment}>
                          <TableData>{_('List Export File Name')}</TableData>
                          <TableData>{listExportFileName.value}</TableData>
                        </TableRow>
                        <TableRow title={reportExportFileName.comment}>
                          <TableData>{_('Report Export File Name')}</TableData>
                          <TableData>{reportExportFileName.value}</TableData>
                        </TableRow>
                        <TableRow title={maxRowsPerPage.comment}>
                          <TableData>
                            {_('Max Rows Per Page (immutable)')}
                          </TableData>
                          <TableData>{maxRowsPerPage.value}</TableData>
                        </TableRow>
                        <TableRow title={autoCacheRebuild.comment}>
                          <TableData>{_('Auto Cache Rebuild')}</TableData>
                          <TableData>
                            {isDefined(autoCacheRebuild.value)
                              ? parseYesNo(autoCacheRebuild.value) === YES_VALUE
                                ? _('Yes')
                                : _('No')
                              : ''}
                          </TableData>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabPanel>
                  <TabPanel>
                    <Table>
                      <colgroup width={FIRST_COL_WIDTH} />
                      <TableBody>
                        <TableRow title={dynamicSeverity.comment}>
                          <TableData>{_('Dynamic Severity')}</TableData>
                          <TableData>
                            {isDefined(dynamicSeverity.value)
                              ? parseYesNo(dynamicSeverity.value) === YES_VALUE
                                ? _('Yes')
                                : _('No')
                              : ''}
                          </TableData>
                        </TableRow>
                        <TableRow title={defaultSeverity.comment}>
                          <TableData>{_('Default Severity')}</TableData>
                          <TableData>{defaultSeverity.value}</TableData>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabPanel>

                  <TabPanel>
                    <Table>
                      <colgroup width={FIRST_COL_WIDTH} />
                      <TableBody>
                        {capabilities.mayAccess('alert') && (
                          <SettingTableRow
                            setting={defaultAlert}
                            title={_('Default Alert')}
                            type="alert"
                          />
                        )}
                        {capabilities.mayAccess('credential') && (
                          <SettingTableRow
                            setting={defaultEsxiCredential}
                            title={_('Default ESXi Credential')}
                            type="credential"
                          />
                        )}
                        {capabilities.mayAccess('scanconfig') && (
                          <SettingTableRow
                            setting={defaultOspScanConfig}
                            title={_('Default OSP Scan Config')}
                            type="scanconfig"
                          />
                        )}
                        {capabilities.mayAccess('scanner') && (
                          <SettingTableRow
                            setting={defaultOspScanner}
                            title={_('Default OSP Scanner')}
                            type="scanner"
                          />
                        )}
                        {capabilities.mayAccess('scanconfig') && (
                          <SettingTableRow
                            setting={defaultOpenvasScanConfig}
                            title={_('Default OpenVAS Scan Config')}
                            type="scanconfig"
                          />
                        )}
                        {capabilities.mayAccess('scanner') && (
                          <SettingTableRow
                            setting={defaultOpenvasScanner}
                            title={_('Default OpenVAS Scanner')}
                            type="scanner"
                          />
                        )}
                        {capabilities.mayAccess('portlist') && (
                          <SettingTableRow
                            setting={defaultPortList}
                            title={_('Default Port List')}
                            type="portlist"
                          />
                        )}
                        {capabilities.mayAccess('reportformat') && (
                          <SettingTableRow
                            setting={defaultReportFormat}
                            title={_('Default Report Format')}
                            type="reportformat"
                          />
                        )}
                        {capabilities.mayAccess('credential') && (
                          <SettingTableRow
                            setting={defaultSmbCredential}
                            title={_('Default SMB Credential')}
                            type="credential"
                          />
                        )}
                        {capabilities.mayAccess('credential') && (
                          <SettingTableRow
                            setting={defaultSnmpCredential}
                            title={_('Default SNMP Credential')}
                            type="credential"
                          />
                        )}
                        {capabilities.mayAccess('credential') && (
                          <SettingTableRow
                            setting={defaultSshCredential}
                            title={_('Default SSH Credential')}
                            type="credential"
                          />
                        )}
                        {capabilities.mayAccess('schedule') && (
                          <SettingTableRow
                            setting={defaultSchedule}
                            title={_('Default Schedule')}
                            type="schedule"
                          />
                        )}
                        {capabilities.mayAccess('target') && (
                          <SettingTableRow
                            setting={defaultTarget}
                            title={_('Default Target')}
                            type="target"
                          />
                        )}
                      </TableBody>
                    </Table>
                  </TabPanel>

                  {capabilities.mayAccess('filter') && (
                    <TabPanel>
                      <Table>
                        <colgroup width={FIRST_COL_WIDTH} />
                        <TableBody>
                          <SettingTableRow
                            setting={alertsFilter}
                            title={_('Alerts Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={configsFilter}
                            title={_('Configs Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={credentialsFilter}
                            title={_('Credentials Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={filtersFilter}
                            title={_('Filters Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={groupsFilter}
                            title={_('Groups Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={hostsFilter}
                            title={_('Hosts Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={notesFilter}
                            title={_('Notes Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={operatingSystemsFilter}
                            title={_('Operating Systems Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={overridesFilter}
                            title={_('Overrides Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={permissionsFilter}
                            title={_('Permissions Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={portListsFilter}
                            title={_('Port Lists Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={reportsFilter}
                            title={_('Reports Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={reportFormatsFilter}
                            title={_('Report Formats Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={resultsFilter}
                            title={_('Results Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={rolesFilter}
                            title={_('Roles Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={scannersFilter}
                            title={_('Scanners Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={schedulesFilter}
                            title={_('Schedules Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={tagsFilter}
                            title={_('Tags Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={targetsFilter}
                            title={_('Targets Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={tasksFilter}
                            title={_('Tasks Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={ticketsFilter}
                            title={_('Tickets Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={tlsCertificatesFilter}
                            title={_('TLS Certificates Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={usersFilter}
                            title={_('Users Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={vulnerabilitiesFilter}
                            title={_('Vulnerabilities Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={cpeFilter}
                            title={_('CPE Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={cveFilter}
                            title={_('CVE Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={nvtFilter}
                            title={_('NVT Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={ovalFilter}
                            title={_('OVAL Definitions Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={certBundFilter}
                            title={_('CERT-Bund Advisories Filter')}
                            type="filter"
                          />
                          <SettingTableRow
                            setting={dfnCertFilter}
                            title={_('DFN-CERT Advisories Filter')}
                            type="filter"
                          />
                        </TableBody>
                      </Table>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </React.Fragment>
          )}
          {dialogVisible && !isLoading && (
            <SettingsDialog
              alerts={alerts}
              filters={filters}
              credentials={credentials}
              openVasScanConfigs={openVasScanConfigs}
              ospScanConfigs={ospScanConfigs}
              openVasScanners={openVasScanners}
              ospScanners={ospScanners}
              portLists={portlists}
              reportFormats={reportformats}
              schedules={schedules}
              targets={targets}
              timezone={timezone}
              userInterfaceLanguage={userInterfaceLanguage.value}
              rowsPerPage={rowsPerPage.value}
              maxRowsPerPage={maxRowsPerPage.value}
              detailsExportFileName={detailsExportFileName.value}
              listExportFileName={listExportFileName.value}
              reportExportFileName={reportExportFileName.value}
              autoCacheRebuild={autoCacheRebuild.value}
              dynamicSeverity={dynamicSeverity.value}
              defaultSeverity={defaultSeverity.value}
              defaultAlert={defaultAlert.id}
              defaultEsxiCredential={defaultEsxiCredential.id}
              defaultOspScanConfig={defaultOspScanConfig.id}
              defaultOspScanner={defaultOspScanner.id}
              defaultOpenvasScanConfig={defaultOpenvasScanConfig.id}
              defaultOpenvasScanner={defaultOpenvasScanner.id}
              defaultPortList={defaultPortList.id}
              defaultReportFormat={defaultReportFormat.id}
              defaultSmbCredential={defaultSmbCredential.id}
              defaultSnmpCredential={defaultSnmpCredential.id}
              defaultSshCredential={defaultSshCredential.id}
              defaultSchedule={defaultSchedule.id}
              defaultTarget={defaultTarget.id}
              alertsFilter={alertsFilter.id}
              configsFilter={configsFilter.id}
              credentialsFilter={credentialsFilter.id}
              filtersFilter={filtersFilter.id}
              groupsFilter={groupsFilter.id}
              hostsFilter={hostsFilter.id}
              notesFilter={notesFilter.id}
              operatingSystemsFilter={operatingSystemsFilter.id}
              overridesFilter={overridesFilter.id}
              permissionsFilter={permissionsFilter.id}
              portListsFilter={portListsFilter.id}
              reportsFilter={reportsFilter.id}
              reportFormatsFilter={reportFormatsFilter.id}
              resultsFilter={resultsFilter.id}
              rolesFilter={rolesFilter.id}
              scannersFilter={scannersFilter.id}
              schedulesFilter={schedulesFilter.id}
              tagsFilter={tagsFilter.id}
              targetsFilter={targetsFilter.id}
              tasksFilter={tasksFilter.id}
              ticketsFilter={ticketsFilter.id}
              tlsCertificatesFilter={tlsCertificatesFilter.id}
              usersFilter={usersFilter.id}
              vulnerabilitiesFilter={vulnerabilitiesFilter.id}
              cpeFilter={cpeFilter.id}
              cveFilter={cveFilter.id}
              nvtFilter={nvtFilter.id}
              ovalFilter={ovalFilter.id}
              certBundFilter={certBundFilter.id}
              dfnCertFilter={dfnCertFilter.id}
              onClose={this.handleCloseDialog}
              onSave={this.handleSaveSettings}
              onValueChange={this.handleValueChange}
            />
          )}
        </Layout>
      </React.Fragment>
    );
  }
}

UserSettings.propTypes = {
  alerts: PropTypes.array,
  alertsFilter: PropTypes.object,
  autoCacheRebuild: PropTypes.object,
  capabilities: PropTypes.capabilities.isRequired,
  certBundFilter: PropTypes.object,
  configsFilter: PropTypes.object,
  cpeFilter: PropTypes.object,
  credentials: PropTypes.array,
  credentialsFilter: PropTypes.object,
  cveFilter: PropTypes.object,
  defaultAlert: PropTypes.object,
  defaultEsxiCredential: PropTypes.object,
  defaultOpenvasScanConfig: PropTypes.object,
  defaultOpenvasScanner: PropTypes.object,
  defaultOspScanConfig: PropTypes.object,
  defaultOspScanner: PropTypes.object,
  defaultPortList: PropTypes.object,
  defaultReportFormat: PropTypes.object,
  defaultSchedule: PropTypes.object,
  defaultSeverity: PropTypes.object,
  defaultSmbCredential: PropTypes.object,
  defaultSnmpCredential: PropTypes.object,
  defaultSshCredential: PropTypes.object,
  defaultTarget: PropTypes.object,
  detailsExportFileName: PropTypes.object,
  dfnCertFilter: PropTypes.object,
  dynamicSeverity: PropTypes.object,
  filters: PropTypes.array,
  filtersFilter: PropTypes.object,
  gmp: PropTypes.gmp.isRequired,
  groupsFilter: PropTypes.object,
  hostsFilter: PropTypes.object,
  isLoading: PropTypes.bool,
  listExportFileName: PropTypes.object,
  loadAlerts: PropTypes.func.isRequired,
  loadCredentials: PropTypes.func.isRequired,
  loadFilterDefaults: PropTypes.func.isRequired,
  loadFilters: PropTypes.func.isRequired,
  loadPortLists: PropTypes.func.isRequired,
  loadReportFormats: PropTypes.func.isRequired,
  loadScanConfigs: PropTypes.func.isRequired,
  loadScanners: PropTypes.func.isRequired,
  loadSchedules: PropTypes.func.isRequired,
  loadSettings: PropTypes.func.isRequired,
  loadTargets: PropTypes.func.isRequired,
  maxRowsPerPage: PropTypes.object,
  notesFilter: PropTypes.object,
  nvtFilter: PropTypes.object,
  operatingSystemsFilter: PropTypes.object,
  ovalFilter: PropTypes.object,
  overridesFilter: PropTypes.object,
  permissionsFilter: PropTypes.object,
  portListsFilter: PropTypes.object,
  portlists: PropTypes.array,
  reportExportFileName: PropTypes.object,
  reportFormatsFilter: PropTypes.object,
  reportformats: PropTypes.array,
  reportsFilter: PropTypes.object,
  resultsFilter: PropTypes.object,
  rolesFilter: PropTypes.object,
  rowsPerPage: PropTypes.object,
  scanconfigs: PropTypes.array,
  scanners: PropTypes.array,
  scannersFilter: PropTypes.object,
  schedules: PropTypes.array,
  schedulesFilter: PropTypes.object,
  setLocale: PropTypes.func.isRequired,
  setTimezone: PropTypes.func.isRequired,
  tagsFilter: PropTypes.object,
  targets: PropTypes.array,
  targetsFilter: PropTypes.object,
  tasksFilter: PropTypes.object,
  ticketsFilter: PropTypes.object,
  timezone: PropTypes.string,
  tlsCertificatesFilter: PropTypes.object,
  userInterfaceLanguage: PropTypes.object,
  usersFilter: PropTypes.object,
  vulnerabilitiesFilter: PropTypes.object,
  onInteraction: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => {
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const userDefaultFilterSelector = getUserSettingsDefaultFilter(rootState);

  const userInterfaceLanguage = userDefaultsSelector.getByName(
    'userinterfacelanguage',
  );
  const rowsPerPage = userDefaultsSelector.getByName('rowsperpage');
  const detailsExportFileName = userDefaultsSelector.getByName(
    'detailsexportfilename',
  );
  const listExportFileName = userDefaultsSelector.getByName(
    'listexportfilename',
  );
  const reportExportFileName = userDefaultsSelector.getByName(
    'reportexportfilename',
  );
  const maxRowsPerPage = userDefaultsSelector.getByName('maxrowsperpage');
  const autoCacheRebuild = userDefaultsSelector.getByName('autocacherebuild');

  const defaultSeverity = userDefaultsSelector.getByName('defaultseverity');
  const dynamicSeverity = userDefaultsSelector.getByName('dynamicseverity');

  const defaultAlertId = userDefaultsSelector.getValueByName('defaultalert');
  const defaultEsxiCredentialId = userDefaultsSelector.getValueByName(
    'defaultesxicredential',
  );
  const defaultOspScanConfigId = userDefaultsSelector.getValueByName(
    'defaultospscanconfig',
  );
  const defaultOspScannerId = userDefaultsSelector.getValueByName(
    'defaultospscanner',
  );
  const defaultOpenvasScanConfigId = userDefaultsSelector.getValueByName(
    'defaultopenvasscanconfig',
  );
  const defaultOpenvasScannerId = userDefaultsSelector.getValueByName(
    'defaultopenvasscanner',
  );

  const defaultPortListId = userDefaultsSelector.getValueByName(
    'defaultportlist',
  );
  const defaultReportFormatId = userDefaultsSelector.getValueByName(
    'defaultreportformat',
  );
  const defaultSmbCredentialId = userDefaultsSelector.getValueByName(
    'defaultsmbcredential',
  );
  const defaultSnmpCredentialId = userDefaultsSelector.getValueByName(
    'defaultsnmpcredential',
  );
  const defaultSshCredentialId = userDefaultsSelector.getValueByName(
    'defaultsshcredential',
  );
  const defaultScheduleId = userDefaultsSelector.getValueByName(
    'defaultschedule',
  );
  const defaultTargetId = userDefaultsSelector.getValueByName('defaulttarget');

  const alertsSel = alertsSelector(rootState);
  const credentialsSel = credentialsSelector(rootState);
  const filtersSel = filtersSelector(rootState);
  const portListsSel = portListsSelector(rootState);
  const reportFormatsSel = reportFormatsSelector(rootState);
  const scannersSel = scannersSelector(rootState);
  const scanConfigsSel = scanConfigsSelector(rootState);
  const schedulesSel = schedulesSelector(rootState);
  const targetsSel = targetsSelector(rootState);

  // select entities with these IDs
  const defaultAlert = alertsSel.getEntity(defaultAlertId);
  const defaultEsxiCredential = credentialsSel.getEntity(
    defaultEsxiCredentialId,
  );
  const defaultOspScanConfig = scanConfigsSel.getEntity(defaultOspScanConfigId);
  const defaultOspScanner = scannersSel.getEntity(defaultOspScannerId);
  const defaultOpenvasScanConfig = scanConfigsSel.getEntity(
    defaultOpenvasScanConfigId,
  );
  const defaultOpenvasScanner = scannersSel.getEntity(defaultOpenvasScannerId);
  const defaultPortList = portListsSel.getEntity(defaultPortListId);
  const defaultReportFormat = reportFormatsSel.getEntity(defaultReportFormatId);
  const defaultSmbCredential = credentialsSel.getEntity(defaultSmbCredentialId);
  const defaultSnmpCredential = credentialsSel.getEntity(
    defaultSnmpCredentialId,
  );
  const defaultSshCredential = credentialsSel.getEntity(defaultSshCredentialId);
  const defaultSchedule = schedulesSel.getEntity(defaultScheduleId);
  const defaultTarget = targetsSel.getEntity(defaultTargetId);
  const alertsFilter = userDefaultFilterSelector.getFilter('alert');
  const configsFilter = userDefaultFilterSelector.getFilter('scanconfig');
  const credentialsFilter = userDefaultFilterSelector.getFilter('credential');
  const filtersFilter = userDefaultFilterSelector.getFilter('filter');
  const groupsFilter = userDefaultFilterSelector.getFilter('group');
  const hostsFilter = userDefaultFilterSelector.getFilter('host');
  const notesFilter = userDefaultFilterSelector.getFilter('note');
  const operatingSystemsFilter = userDefaultFilterSelector.getFilter(
    'operatingsystem',
  );
  const overridesFilter = userDefaultFilterSelector.getFilter('override');
  const permissionsFilter = userDefaultFilterSelector.getFilter('permission');
  const portListsFilter = userDefaultFilterSelector.getFilter('portlist');
  const reportsFilter = userDefaultFilterSelector.getFilter('report');
  const reportFormatsFilter = userDefaultFilterSelector.getFilter(
    'reportformat',
  );
  const resultsFilter = userDefaultFilterSelector.getFilter('result');
  const rolesFilter = userDefaultFilterSelector.getFilter('role');
  const scannersFilter = userDefaultFilterSelector.getFilter('scanner');
  const schedulesFilter = userDefaultFilterSelector.getFilter('schedule');
  const tagsFilter = userDefaultFilterSelector.getFilter('tag');
  const targetsFilter = userDefaultFilterSelector.getFilter('target');
  const tasksFilter = userDefaultFilterSelector.getFilter('task');
  const ticketsFilter = userDefaultFilterSelector.getFilter('ticket');
  const tlsCertificatesFilter = userDefaultFilterSelector.getFilter(
    'tlscertificate',
  );
  const usersFilter = userDefaultFilterSelector.getFilter('user');
  const vulnerabilitiesFilter = userDefaultFilterSelector.getFilter(
    'vulnerability',
  );
  const cpeFilter = userDefaultFilterSelector.getFilter('cpe');
  const cveFilter = userDefaultFilterSelector.getFilter('cve');
  const certBundFilter = userDefaultFilterSelector.getFilter('certbund');
  const dfnCertFilter = userDefaultFilterSelector.getFilter('dfncert');
  const nvtFilter = userDefaultFilterSelector.getFilter('nvt');
  const ovalFilter = userDefaultFilterSelector.getFilter('ovaldef');

  let scanconfigs = scanConfigsSel.getEntities(ALL_FILTER);
  if (isDefined(scanconfigs)) {
    scanconfigs = scanconfigs.filter(filterEmptyScanConfig);
  }

  return {
    alerts: alertsSel.getEntities(ALL_FILTER),
    credentials: credentialsSel.getEntities(ALL_FILTER),
    filters: filtersSel.getEntities(ALL_FILTER),
    portlists: portListsSel.getEntities(ALL_FILTER),
    reportformats: reportFormatsSel.getEntities(ALL_FILTER),
    scanconfigs,
    scanners: scannersSel.getEntities(ALL_FILTER),
    schedules: schedulesSel.getEntities(ALL_FILTER),
    targets: targetsSel.getEntities(ALL_FILTER),
    timezone: getTimezone(rootState),
    userInterfaceLanguage,
    rowsPerPage,
    detailsExportFileName,
    listExportFileName,
    reportExportFileName,
    maxRowsPerPage,
    defaultSeverity,
    dynamicSeverity,
    isLoading: userDefaultsSelector.isLoading(),
    defaultAlert,
    defaultEsxiCredential,
    defaultOspScanConfig,
    defaultOspScanner,
    defaultOpenvasScanConfig,
    defaultOpenvasScanner,
    defaultPortList,
    defaultReportFormat,
    defaultSmbCredential,
    defaultSnmpCredential,
    defaultSshCredential,
    defaultSchedule,
    defaultTarget,
    alertsFilter,
    configsFilter,
    credentialsFilter,
    filtersFilter,
    groupsFilter,
    hostsFilter,
    notesFilter,
    operatingSystemsFilter,
    overridesFilter,
    permissionsFilter,
    portListsFilter,
    reportsFilter,
    reportFormatsFilter,
    resultsFilter,
    rolesFilter,
    scannersFilter,
    schedulesFilter,
    tagsFilter,
    targetsFilter,
    tasksFilter,
    ticketsFilter,
    tlsCertificatesFilter,
    usersFilter,
    vulnerabilitiesFilter,
    cpeFilter,
    cveFilter,
    certBundFilter,
    dfnCertFilter,
    nvtFilter,
    ovalFilter,
    autoCacheRebuild,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadAlerts: () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
  loadCredentials: () => dispatch(loadCredentials(gmp)(ALL_FILTER)),
  loadFilters: () => dispatch(loadFilters(gmp)(ALL_FILTER)),
  loadFilterDefaults: () =>
    Promise.all([
      dispatch(loadUserSettingsDefaultFilter(gmp)('alert')),
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
      dispatch(loadUserSettingsDefaultFilter(gmp)('ovaldef')),
    ]),
  loadPortLists: () => dispatch(loadPortLists(gmp)(ALL_FILTER)),
  loadReportFormats: () => dispatch(loadReportFormats(gmp)(ALL_FILTER)),
  loadScanConfigs: () => dispatch(loadScanConfigs(gmp)(ALL_FILTER)),
  loadScanners: () => dispatch(loadScanners(gmp)(ALL_FILTER)),
  loadSchedules: () => dispatch(loadSchedules(gmp)(ALL_FILTER)),
  loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
  loadTargets: () => dispatch(loadTargets(gmp)(ALL_FILTER)),
  loadAlert: id => dispatch(loadAlert(gmp)(id)),
  onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
  setLocale: locale => gmp.setLocale(locale),
  setTimezone: timezone => dispatch(updateTimezone(gmp)(timezone)),
});

export default compose(
  withGmp,
  withCapabilities,
  connect(mapStateToProps, mapDispatchToProps),
)(UserSettings);

// vim: set ts=2 sw=2 tw=80:
