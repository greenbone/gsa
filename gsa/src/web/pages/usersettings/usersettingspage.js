/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import 'core-js/fn/object/entries';

import React from 'react';
import {connect} from 'react-redux';
import _ from 'gmp/locale';
import {YES_VALUE, parseYesNo} from 'gmp/parser';
import {hasValue, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import ManualIcon from 'web/components/icon/manualicon';
import EditIcon from 'web/components/icon/editicon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

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

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import compose from 'web/utils/compose';
import Languages from 'web/utils/languages';
import PropTypes from 'web/utils/proptypes';
import {
  SEVERITY_CLASS_NIST,
  SEVERITY_CLASS_BSI,
  SEVERITY_CLASS_PCI_DSS,
} from 'web/utils/severity';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import {loadFunc} from 'web/store/usersettings/actions';
import {
  getIsLoading,
  getData,
  getUserSettings,
} from 'web/store/usersettings/selectors';
import {loadTimezone} from 'web/store/usersettings/timezone/actions';
import {getTimezone} from 'web/store/usersettings/timezone/selectors';

import SettingsDialog from './dialog';

const FIRST_COL_WIDTH = '250px';
export const SEVERITY_CLASSES = [
  {id: SEVERITY_CLASS_NIST, name: 'NVD Vulnerability Severity Ratings'},
  {id: SEVERITY_CLASS_BSI, name: 'BSI Schwachstellenampel (Germany)'},
  {id: SEVERITY_CLASS_PCI_DSS, name: 'PCI-DSS'},
];

const getLangNameByCode = code => {
  const language = Languages[code];
  return isDefined(language) ? language.name : null;
};

const SettingTableRow = ({
  setting,
  title,
  type,
}) => {
  const {
    comment,
    id,
    name,
  } = setting;
  return (
    <TableRow title={comment}>
      <TableData>
        {title}
      </TableData>
      <TableData>
        <Layout>
          {isDefined(id) &&
            <DetailsLink
              id={id}
              type={type}
            >
              {name}
            </DetailsLink>
          }
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

const ToolBarIcons = ({onEditSettingsClick}) => (
  <Layout flex>
    <IconDivider>
      <ManualIcon
        size="medium"
        page="gui_introduction"
        anchor="my-settings"
        title={_('Help: My Settings')}
      />
      <EditIcon
        size="medium"
        title={_('Edit My Settings')}
        onClick={onEditSettingsClick}
      />
    </IconDivider>
  </Layout>
);

ToolBarIcons.propTypes = {
  onEditSettingsClick: PropTypes.func.isRequired,
};

class UserSettings extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
    };

    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentDidMount() {
    this.props.loadSettings();
    this.props.loadTimezone();
    this.loadEntities();
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

  openDialog() {
    this.setState({dialogVisible: true});
  }

  closeDialog() {
    this.setState({dialogVisible: false});
  }

  getSeverityClassNameById(id) {
    const specifiedClass = SEVERITY_CLASSES.find(
      clas => {
        return clas.id === id;
      }
    );
    return isDefined(specifiedClass) ? specifiedClass.name : undefined;
  }

  handleSaveSettings(data) {
    const {gmp} = this.props;
    return gmp.user.saveSettings(data)
      .then(() => {
        this.props.loadSettings();
        this.props.loadTimezone();
      });
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  render() {
    const {
      dialogVisible,
    } = this.state;
    const {
      capabilities,
      filters,
      alerts,
      credentials,
      scanconfigs,
      scanners,
      portlists,
      reportformats,
      schedules,
      targets,
      isLoading = true,
      timezone,
      userInterfaceLanguage,
      rowsPerPage,
      maxRowsPerPage,
      detailsExportFileName,
      listExportFileName,
      reportExportFileName,
      severityClass,
      dynamicSeverity,
      defaultSeverity,
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
      agentsFilter = {},
      alertsFilter = {},
      assetsFilter = {},
      configsFilter = {},
      credentialsFilter = {},
      filtersFilter = {},
      notesFilter = {},
      overridesFilter = {},
      permissionsFilter = {},
      portListsFilter = {},
      reportsFilter = {},
      reportFormatsFilter = {},
      resultsFilter = {},
      rolesFilter = {},
      schedulesFilter = {},
      tagsFilter = {},
      targetsFilter = {},
      tasksFilter = {},
      cpeFilter = {},
      cveFilter = {},
      nvtFilter = {},
      ovalFilter = {},
      certBundFilter = {},
      dfnCertFilter = {},
      secInfoFilter = {},
      autoCacheRebuild = {},
    } = this.props;

    if (isLoading) {
      return <Loading/>;
    };
    return (
      <Layout flex="column">
        <ToolBarIcons
          onEditSettingsClick={this.openDialog}
        />
        <Section
          img="my_setting.svg"
          title={_('My Settings')}
        />

        <Section title={_('General Settings')} foldable>
          <Table>
            <colgroup width={FIRST_COL_WIDTH}/>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Timezone')}
                </TableData>
                <TableData>
                  {timezone.value}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('Password')}
                </TableData>
                <TableData>
                  ********
                </TableData>
              </TableRow>
              <TableRow title={userInterfaceLanguage.comment}>
                <TableData>
                  {_('User Interface Language')}
                </TableData>
                <TableData>
                  {getLangNameByCode(userInterfaceLanguage.value)}
                </TableData>
              </TableRow>
              <TableRow title={rowsPerPage.comment}>
                <TableData>
                  {_('Rows Per Page')}
                </TableData>
                <TableData>
                  {rowsPerPage.value}
                </TableData>
              </TableRow>
              <TableRow title={detailsExportFileName.comment}>
                <TableData>
                  {_('Details Export File Name')}
                </TableData>
                <TableData>
                  {detailsExportFileName.value}
                </TableData>
              </TableRow>
              <TableRow title={listExportFileName.comment}>
                <TableData>
                  {_('List Export File Name')}
                </TableData>
                <TableData>
                  {listExportFileName.value}
                </TableData>
              </TableRow>
              <TableRow title={reportExportFileName.comment}>
                <TableData>
                  {_('Report Export File Name')}
                </TableData>
                <TableData>
                  {reportExportFileName.value}
                </TableData>
              </TableRow>
              <TableRow title={maxRowsPerPage.comment}>
                <TableData>
                  {_('Max Rows Per Page (immutable)')}
                </TableData>
                <TableData>
                  {maxRowsPerPage.value}
                </TableData>
              </TableRow>
              <TableRow title={autoCacheRebuild.comment}>
                <TableData>
                  {_('Auto Cache Rebuild')}
                </TableData>
                <TableData>
                  {isDefined(autoCacheRebuild.value) ?
                    parseYesNo(autoCacheRebuild.value) === YES_VALUE ?
                      _('Yes') : _('No') :
                    ''
                  }
                </TableData>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title={_('Severity Settings')} foldable>
          <Table>
            <colgroup width={FIRST_COL_WIDTH}/>
            <TableBody>
              <TableRow title={severityClass.comment}>
                <TableData>
                  {_('Severity Class')}
                </TableData>
                <TableData>
                  {this.getSeverityClassNameById(severityClass.value)}
                </TableData>
              </TableRow>
              <TableRow title={dynamicSeverity.comment}>
                <TableData>
                  {_('Dynamic Severity')}
                </TableData>
                <TableData>
                  {isDefined(dynamicSeverity.value) ?
                    parseYesNo(dynamicSeverity.value) === YES_VALUE ?
                      _('Yes') : _('No') :
                    ''
                  }
                </TableData>
              </TableRow>
              <TableRow title={defaultSeverity.comment}>
                <TableData>
                  {_('Default Severity')}
                </TableData>
                <TableData>
                  {defaultSeverity.value}
                </TableData>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title={_('Defaults Settings')} foldable>
          <Table>
            <colgroup width={FIRST_COL_WIDTH}/>
            <TableBody>
              {capabilities.mayAccess('alert') &&
                <SettingTableRow
                  setting={defaultAlert}
                  title={_('Default Alert')}
                  type="alert"
                />
              }
              {capabilities.mayAccess('credential') &&
                <SettingTableRow
                  setting={defaultEsxiCredential}
                  title={_('Default ESXi Credential')}
                  type="credential"
                />
              }
              {capabilities.mayAccess('scanconfig') &&
                <SettingTableRow
                  setting={defaultOspScanConfig}
                  title={_('Default OSP Scan Config')}
                  type="scanconfig"
                />
              }
              {capabilities.mayAccess('scanner') &&
                <SettingTableRow
                  setting={defaultOspScanner}
                  title={_('Default OSP Scanner')}
                  type="scanner"
                />
              }
              {capabilities.mayAccess('scanconfig') &&
                <SettingTableRow
                  setting={defaultOpenvasScanConfig}
                  title={_('Default OpenVAS Scan Config')}
                  type="scanconfig"
                />
              }
              {capabilities.mayAccess('scanner') &&
                <SettingTableRow
                  setting={defaultOpenvasScanner}
                  title={_('Default OpenVAS Scanner')}
                  type="scanner"
                />
              }
              {capabilities.mayAccess('portlist') &&
                <SettingTableRow
                  setting={defaultPortList}
                  title={_('Default Port List')}
                  type="portlist"
                />
              }
              {capabilities.mayAccess('reportformat') &&
                <SettingTableRow
                  setting={defaultReportFormat}
                  title={_('Default Report Format')}
                  type="reportformat"
                />
              }
              {capabilities.mayAccess('credential') &&
                <SettingTableRow
                  setting={defaultSmbCredential}
                  title={_('Default SMB Credential')}
                  type="credential"
                />
              }
              {capabilities.mayAccess('credential') &&
                <SettingTableRow
                  setting={defaultSnmpCredential}
                  title={_('Default SNMP Credential')}
                  type="credential"
                />
              }
              {capabilities.mayAccess('credential') &&
                <SettingTableRow
                  setting={defaultSshCredential}
                  title={_('Default SSH Credential')}
                  type="credential"
                />
              }
              {capabilities.mayAccess('schedule') &&
                <SettingTableRow
                  setting={defaultSchedule}
                  title={_('Default Schedule')}
                  type="schedule"
                />
              }
              {capabilities.mayAccess('target') &&
                <SettingTableRow
                  setting={defaultTarget}
                  title={_('Default Target')}
                  type="target"
                />
              }
            </TableBody>
          </Table>
        </Section>

        {capabilities.mayAccess('filter') &&
          <Section title={_('Filter Settings')} foldable>
            <Table>
              <colgroup width={FIRST_COL_WIDTH}/>
              <TableBody>
                <SettingTableRow
                  setting={agentsFilter}
                  title={_('Agents Filter')}
                  type="filter"
                />
                <SettingTableRow
                  setting={alertsFilter}
                  title={_('Alerts Filter')}
                  type="filter"
                />
                <SettingTableRow
                  setting={assetsFilter}
                  title={_('Assets Filter')}
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
                  setting={notesFilter}
                  title={_('Notes Filter')}
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
                <SettingTableRow
                  setting={secInfoFilter}
                  title={_('SecInfo Filter')}
                  type="filter"
                />
              </TableBody>
            </Table>
          </Section>
        }
        {dialogVisible && !isLoading &&
          <SettingsDialog
            alerts={alerts}
            filters={filters}
            credentials={credentials}
            scanConfigs={scanconfigs}
            scanners={scanners}
            portLists={portlists}
            reportFormats={reportformats}
            schedules={schedules}
            targets={targets}
            timezone={timezone.value}
            userInterfaceLanguage={userInterfaceLanguage.value}
            rowsPerPage={rowsPerPage.value}
            maxRowsPerPage={maxRowsPerPage.value}
            detailsExportFileName={detailsExportFileName.value}
            listExportFileName={listExportFileName.value}
            reportExportFileName={reportExportFileName.value}
            autoCacheRebuild={autoCacheRebuild.value}
            severityClass={severityClass.value === '' ?
              undefined : severityClass.value}
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
            agentsFilter={agentsFilter.id}
            alertsFilter={alertsFilter.id}
            assetsFilter={assetsFilter.id}
            configsFilter={configsFilter.id}
            credentialsFilter={credentialsFilter.id}
            filtersFilter={filtersFilter.id}
            notesFilter={notesFilter.id}
            overridesFilter={overridesFilter.id}
            permissionsFilter={permissionsFilter.id}
            portListsFilter={portListsFilter.id}
            reportsFilter={reportsFilter.id}
            reportFormatsFilter={reportFormatsFilter.id}
            resultsFilter={resultsFilter.id}
            rolesFilter={rolesFilter.id}
            schedulesFilter={schedulesFilter.id}
            tagsFilter={tagsFilter.id}
            targetsFilter={targetsFilter.id}
            tasksFilter={tasksFilter.id}
            cpeFilter={cpeFilter.id}
            cveFilter={cveFilter.id}
            nvtFilter={nvtFilter.id}
            ovalFilter={ovalFilter.id}
            certBundFilter={certBundFilter.id}
            dfnCertFilter={dfnCertFilter.id}
            secInfoFilter={secInfoFilter.id}
            onClose={this.closeDialog}
            onSave={this.handleSaveSettings}
            onValueChange={this.handleValueChange}
          />
        }
      </Layout>
    );
  }
}

UserSettings.propTypes = {
  agentsFilter: PropTypes.object,
  alerts: PropTypes.array,
  alertsFilter: PropTypes.object,
  assetsFilter: PropTypes.object,
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
  isLoading: PropTypes.bool,
  listExportFileName: PropTypes.object,
  loadAlerts: PropTypes.func,
  loadCredentials: PropTypes.func,
  loadFilters: PropTypes.func,
  loadPortLists: PropTypes.func,
  loadReportFormats: PropTypes.func,
  loadScanConfigs: PropTypes.func,
  loadScanners: PropTypes.func,
  loadSchedules: PropTypes.func,
  loadSettings: PropTypes.func,
  loadTargets: PropTypes.func,
  loadTimezone: PropTypes.func,
  maxRowsPerPage: PropTypes.object,
  notesFilter: PropTypes.object,
  nvtFilter: PropTypes.object,
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
  schedules: PropTypes.array,
  schedulesFilter: PropTypes.object,
  secInfoFilter: PropTypes.object,
  severityClass: PropTypes.object,
  tagsFilter: PropTypes.object,
  targets: PropTypes.array,
  targetsFilter: PropTypes.object,
  tasksFilter: PropTypes.object,
  timezone: PropTypes.object,
  userInterfaceLanguage: PropTypes.object,
};

const mapStateToProps = rootState => {
  const state = getUserSettings(rootState);

  let userInterfaceLanguage;
  let rowsPerPage;
  let detailsExportFileName;
  let listExportFileName;
  let reportExportFileName;
  let maxRowsPerPage;
  let autoCacheRebuild;

  let severityClass;
  let defaultSeverity;
  let dynamicSeverity;

  let defaultAlertId;
  let defaultEsxiCredentialId;
  let defaultOspScanConfigId;
  let defaultOspScannerId;
  let defaultOpenvasScanConfigId;
  let defaultOpenvasScannerId;
  let defaultPortListId;
  let defaultReportFormatId;
  let defaultSmbCredentialId;
  let defaultSnmpCredentialId;
  let defaultSshCredentialId;
  let defaultScheduleId;
  let defaultTargetId;

  let agentsFilterId;
  let alertsFilterId;
  let assetsFilterId;
  let configsFilterId;
  let credentialsFilterId;
  let filtersFilterId;
  let notesFilterId;
  let overridesFilterId;
  let permissionsFilterId;
  let portListsFilterId;
  let reportsFilterId;
  let reportFormatsFilterId;
  let resultsFilterId;
  let rolesFilterId;
  let schedulesFilterId;
  let tagsFilterId;
  let targetsFilterId;
  let tasksFilterId;
  let cpeFilterId;
  let cveFilterId;
  let certBundFilterId;
  let dfnCertFilterId;
  let nvtFilterId;
  let ovalFilterId;
  let secInfoFilterId;

  // get IDs of settings values
  if (isDefined(state) && hasValue(getData(state))) {

    userInterfaceLanguage =
      isDefined(getData(state).userinterfacelanguage) ?
      getData(state).userinterfacelanguage : undefined;
    rowsPerPage =
      isDefined(getData(state).rowsperpage) ?
      getData(state).rowsperpage : undefined;
    detailsExportFileName =
      isDefined(getData(state).detailsexportfilename) ?
      getData(state).detailsexportfilename : undefined;
    listExportFileName =
      isDefined(getData(state).listexportfilename) ?
      getData(state).listexportfilename : undefined;
    reportExportFileName =
      isDefined(getData(state).reportexportfilename) ?
      getData(state).reportexportfilename : undefined;
    maxRowsPerPage =
      isDefined(getData(state).maxrowsperpage) ?
      getData(state).maxrowsperpage : undefined;
    autoCacheRebuild =
      isDefined(getData(state).autocacherebuild) ?
      getData(state).autocacherebuild : undefined;

    severityClass =
      isDefined(getData(state).severityclass) ?
      getData(state).severityclass : undefined;
    defaultSeverity =
      isDefined(getData(state).defaultseverity) ?
      getData(state).defaultseverity : undefined;
    dynamicSeverity =
      isDefined(getData(state).dynamicseverity) ?
      getData(state).dynamicseverity : undefined;

    defaultAlertId = isDefined(getData(state).defaultalert) ?
      getData(state).defaultalert.value : undefined;
    defaultEsxiCredentialId = isDefined(getData(state).defaultesxicredential) ?
      getData(state).defaultesxicredential.value : undefined;
    defaultOspScanConfigId = isDefined(getData(state).defaultospscanconfig) ?
      getData(state).defaultospscanconfig.value : undefined;
    defaultOspScannerId = isDefined(getData(state).defaultospscanner) ?
      getData(state).defaultospscanner.value : undefined;
    defaultOpenvasScanConfigId =
      isDefined(getData(state).defaultopenvasscanconfig) ?
      getData(state).defaultopenvasscanconfig.value : undefined;
    defaultOpenvasScannerId = isDefined(getData(state).defaultopenvasscanner) ?
      getData(state).defaultopenvasscanner.value : undefined;
    defaultPortListId = isDefined(getData(state).defaultportlist) ?
      getData(state).defaultportlist.value : undefined;
    defaultReportFormatId = isDefined(getData(state).defaultreportformat) ?
      getData(state).defaultreportformat.value : undefined;
    defaultSmbCredentialId = isDefined(getData(state).defaultsmbcredential) ?
      getData(state).defaultsmbcredential.value : undefined;
    defaultSnmpCredentialId = isDefined(getData(state).defaultsnmpcredential) ?
      getData(state).defaultsnmpcredential.value : undefined;
    defaultSshCredentialId = isDefined(getData(state).defaultsshcredential) ?
      getData(state).defaultsshcredential.value : undefined;
    defaultScheduleId = isDefined(getData(state).defaultschedule) ?
      getData(state).defaultschedule.value : undefined;
    defaultTargetId = isDefined(getData(state).defaulttarget) ?
      getData(state).defaulttarget.value : undefined;

    agentsFilterId = isDefined(getData(state).agentsfilter) ?
      getData(state).agentsfilter.value : undefined;
    alertsFilterId = isDefined(getData(state).alertsfilter) ?
      getData(state).alertsfilter.value : undefined;
    assetsFilterId = isDefined(getData(state).assetsfilter) ?
      getData(state).assetsfilter.value : undefined;
    configsFilterId = isDefined(getData(state).configsfilter) ?
      getData(state).configsfilter.value : undefined;
    credentialsFilterId = isDefined(getData(state).credentialsfilter) ?
      getData(state).credentialsfilter.value : undefined;
    filtersFilterId = isDefined(getData(state).filtersfilter) ?
      getData(state).filtersfilter.value : undefined;
    notesFilterId = isDefined(getData(state).notesfilter) ?
      getData(state).notesfilter.value : undefined;
    overridesFilterId = isDefined(getData(state).overridesfilter) ?
      getData(state).overridesfilter.value : undefined;
    permissionsFilterId = isDefined(getData(state).permissionsfilter) ?
      getData(state).permissionsfilter.value : undefined;
    portListsFilterId = isDefined(getData(state).portlistsfilter) ?
      getData(state).portlistsfilter.value : undefined;
    reportsFilterId = isDefined(getData(state).reportsfilter) ?
      getData(state).reportsfilter.value : undefined;
    reportFormatsFilterId = isDefined(getData(state).reportformatsfilter) ?
      getData(state).reportformatsfilter.value : undefined;
    resultsFilterId = isDefined(getData(state).resultsfilter) ?
      getData(state).resultsfilter.value : undefined;
    rolesFilterId = isDefined(getData(state).rolesfilter) ?
      getData(state).rolesfilter.value : undefined;
    schedulesFilterId = isDefined(getData(state).schedulesfilter) ?
      getData(state).schedulesfilter.value : undefined;
    tagsFilterId = isDefined(getData(state).tagsfilter) ?
      getData(state).tagsfilter.value : undefined;
    targetsFilterId = isDefined(getData(state).targetsfilter) ?
      getData(state).targetsfilter.value : undefined;
    tasksFilterId = isDefined(getData(state).tasksfilter) ?
      getData(state).tasksfilter.value : undefined;
    cpeFilterId = isDefined(getData(state).cpefilter) ?
      getData(state).cpefilter.value : undefined;
    cveFilterId = isDefined(getData(state).cvefilter) ?
      getData(state).cvefilter.value : undefined;
    certBundFilterId = isDefined(getData(state).certbundfilter) ?
      getData(state).certbundfilter.value : undefined;
    dfnCertFilterId = isDefined(getData(state).dfncertfilter) ?
      getData(state).dfncertfilter.value : undefined;
    nvtFilterId = isDefined(getData(state).nvtfilter) ?
      getData(state).nvtfilter.value : undefined;
    ovalFilterId = isDefined(getData(state).ovalfilter) ?
      getData(state).ovalfilter.value : undefined;
    secInfoFilterId = isDefined(getData(state).allsecinfofilter) ?
      getData(state).allsecinfofilter.value : undefined;

  }
  // select entities with these IDs
  const defaultAlert =
    alertsSelector(rootState).getEntity(defaultAlertId);
  const defaultEsxiCredential =
    credentialsSelector(rootState).getEntity(defaultEsxiCredentialId);
  const defaultOspScanConfig =
    scanConfigsSelector(rootState).getEntity(defaultOspScanConfigId);
  const defaultOspScanner =
    scannersSelector(rootState).getEntity(defaultOspScannerId);
  const defaultOpenvasScanConfig =
    scanConfigsSelector(rootState).getEntity(defaultOpenvasScanConfigId);
  const defaultOpenvasScanner =
    scannersSelector(rootState).getEntity(defaultOpenvasScannerId);
  const defaultPortList =
    portListsSelector(rootState).getEntity(defaultPortListId);
  const defaultReportFormat =
    reportFormatsSelector(rootState).getEntity(defaultReportFormatId);
  const defaultSmbCredential =
    credentialsSelector(rootState).getEntity(defaultSmbCredentialId);
  const defaultSnmpCredential =
    credentialsSelector(rootState).getEntity(defaultSnmpCredentialId);
  const defaultSshCredential =
    credentialsSelector(rootState).getEntity(defaultSshCredentialId);
  const defaultSchedule =
    schedulesSelector(rootState).getEntity(defaultScheduleId);
  const defaultTarget =
    targetsSelector(rootState).getEntity(defaultTargetId);
  const agentsFilter =
    filtersSelector(rootState).getEntity(agentsFilterId);
  const alertsFilter =
    filtersSelector(rootState).getEntity(alertsFilterId);
  const assetsFilter =
    filtersSelector(rootState).getEntity(assetsFilterId);
  const configsFilter =
    filtersSelector(rootState).getEntity(configsFilterId);
  const credentialsFilter =
    filtersSelector(rootState).getEntity(credentialsFilterId);
  const filtersFilter =
    filtersSelector(rootState).getEntity(filtersFilterId);
  const notesFilter =
    filtersSelector(rootState).getEntity(notesFilterId);
  const overridesFilter =
    filtersSelector(rootState).getEntity(overridesFilterId);
  const permissionsFilter =
    filtersSelector(rootState).getEntity(permissionsFilterId);
  const portListsFilter =
    filtersSelector(rootState).getEntity(portListsFilterId);
  const reportsFilter =
    filtersSelector(rootState).getEntity(reportsFilterId);
  const reportFormatsFilter =
    filtersSelector(rootState).getEntity(reportFormatsFilterId);
  const resultsFilter =
    filtersSelector(rootState).getEntity(resultsFilterId);
  const rolesFilter =
    filtersSelector(rootState).getEntity(rolesFilterId);
  const schedulesFilter =
    filtersSelector(rootState).getEntity(schedulesFilterId);
  const tagsFilter =
    filtersSelector(rootState).getEntity(tagsFilterId);
  const targetsFilter =
    filtersSelector(rootState).getEntity(targetsFilterId);
  const tasksFilter =
    filtersSelector(rootState).getEntity(tasksFilterId);
  const cpeFilter =
    filtersSelector(rootState).getEntity(cpeFilterId);
  const cveFilter =
    filtersSelector(rootState).getEntity(cveFilterId);
  const certBundFilter =
    filtersSelector(rootState).getEntity(certBundFilterId);
  const dfnCertFilter =
    filtersSelector(rootState).getEntity(dfnCertFilterId);
  const nvtFilter =
    filtersSelector(rootState).getEntity(nvtFilterId);
  const ovalFilter =
    filtersSelector(rootState).getEntity(ovalFilterId);
  const secInfoFilter =
    filtersSelector(rootState).getEntity(secInfoFilterId);

  return {
    alerts: alertsSelector(rootState).getEntities(),
    credentials: credentialsSelector(rootState).getEntities(),
    filters: filtersSelector(rootState).getEntities(),
    portlists: portListsSelector(rootState).getEntities(),
    reportformats: reportFormatsSelector(rootState).getEntities(),
    scanconfigs: scanConfigsSelector(rootState).getEntities(),
    scanners: scannersSelector(rootState).getEntities(),
    schedules: schedulesSelector(rootState).getEntities(),
    targets: targetsSelector(rootState).getEntities(),
    timezone: getTimezone(rootState),
    userInterfaceLanguage,
    rowsPerPage,
    detailsExportFileName,
    listExportFileName,
    reportExportFileName,
    maxRowsPerPage,
    severityClass,
    defaultSeverity,
    dynamicSeverity,
    isLoading: getIsLoading(state),
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
    agentsFilter,
    alertsFilter,
    assetsFilter,
    configsFilter,
    credentialsFilter,
    filtersFilter,
    notesFilter,
    overridesFilter,
    permissionsFilter,
    portListsFilter,
    reportsFilter,
    reportFormatsFilter,
    resultsFilter,
    rolesFilter,
    schedulesFilter,
    tagsFilter,
    targetsFilter,
    tasksFilter,
    cpeFilter,
    cveFilter,
    certBundFilter,
    dfnCertFilter,
    nvtFilter,
    ovalFilter,
    secInfoFilter,
    autoCacheRebuild,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadAlerts: () => dispatch(loadAlerts({gmp})),
  loadCredentials: () => dispatch(loadCredentials({gmp})),
  loadFilters: () => dispatch(loadFilters({gmp})),
  loadPortLists: () => dispatch(loadPortLists({gmp})),
  loadReportFormats: () => dispatch(loadReportFormats({gmp})),
  loadScanConfigs: () => dispatch(loadScanConfigs({gmp})),
  loadScanners: () => dispatch(loadScanners({gmp})),
  loadSchedules: () => dispatch(loadSchedules({gmp})),
  loadSettings: () => dispatch(loadFunc({gmp})),
  loadTargets: () => dispatch(loadTargets({gmp})),
  loadTimezone: () => dispatch(loadTimezone({gmp})),
  loadAlert: id => dispatch(loadAlert({gmp, id})),
});

export default compose(
  withGmp,
  withCapabilities,
  connect(mapStateToProps, mapDispatchToProps),
)(UserSettings);

// vim: set ts=2 sw=2 tw=80:
