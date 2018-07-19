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
import React from 'react';
import glamorous from 'glamorous';
import {connect} from 'react-redux';

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';

import SaveDialog from 'web/components/dialog/savedialog';

import Section from 'web/components/section/section';

import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';
import withCapabilities from 'web/utils/withCapabilities';
import PropTypes from 'web/utils/proptypes';

import DefaultsPart from './defaultspart';
import FilterPart from './filterpart';
import GeneralPart from './generalpart';
import SeverityPart from './severitypart';

// necessary to stretch FormGroups to full width inside of Section
const FormGroupSizer = glamorous.div({
  width: '100%',
});

let UserSettingsDialog = ({
    alerts,
    credentials,
    filters,
    scanConfigs,
    scanners,
    portLists,
    reportFormats,
    schedules,
    targets,
    timezone,
    userInterfaceLanguage,
    rowsPerPage,
    maxRowsPerPage,
    detailsExportFileName,
    listExportFileName,
    reportExportFileName,
    autoCacheRebuild,
    severityClass,
    dynamicSeverity,
    defaultSeverity,
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
    nvtFilter,
    ovalFilter,
    certBundFilter,
    dfnCertFilter,
    secInfoFilter,
    onClose,
    onSave,
    capabilities,
  }) => {

  const settings = {
    timezone,
    oldPassword: '',
    newPassword: '',
    confPassword: '',
    userInterfaceLanguage,
    rowsPerPage,
    maxRowsPerPage,
    detailsExportFileName,
    listExportFileName,
    reportExportFileName,
    autoCacheRebuild,
    severityClass,
    dynamicSeverity,
    defaultSeverity,
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
    nvtFilter,
    ovalFilter,
    certBundFilter,
    dfnCertFilter,
    secInfoFilter,
  };

  return (
    <SaveDialog
      title={_('Edit User Settings')}
      onClose={onClose}
      onSave={onSave}
      defaultValues={settings}
    >
      {({
        values,
        onValueChange,
      }) => {
        return (
          <React.Fragment>
            <Section title={_('General Settings')} foldable>
              <FormGroupSizer>
                <GeneralPart
                  timezone={values.timezone}
                  oldPassword={values.oldPassword}
                  newPassword={values.newPassword}
                  confPassword={values.confPassword}
                  userInterfaceLanguage={values.userInterfaceLanguage}
                  rowsPerPage={values.rowsPerPage}
                  maxRowsPerPage={values.maxRowsPerPage}
                  detailsExportFileName={values.detailsExportFileName}
                  listExportFileName={values.listExportFileName}
                  reportExportFileName={values.reportExportFileName}
                  autoCacheRebuild={values.autoCacheRebuild}
                  onChange={onValueChange}
                />
              </FormGroupSizer>
            </Section>
            <Section title={_('Severity Settings')} foldable>
              <FormGroupSizer>
                <SeverityPart
                  severityClass={values.severityClass}
                  dynamicSeverity={values.dynamicSeverity}
                  defaultSeverity={values.defaultSeverity}
                  onChange={onValueChange}
                />
              </FormGroupSizer>
            </Section>
            <Section title={_('Defaults Settings')} foldable>
              <FormGroupSizer>
                <DefaultsPart
                  alerts={alerts}
                  credentials={credentials}
                  scanConfigs={scanConfigs}
                  scanners={scanners}
                  portLists={portLists}
                  reportFormats={reportFormats}
                  schedules={schedules}
                  targets={targets}
                  defaultAlert={values.defaultAlert}
                  defaultEsxiCredential={values.defaultEsxiCredential}
                  defaultOspScanConfig={values.defaultOspScanConfig}
                  defaultOspScanner={values.defaultOspScanner}
                  defaultOpenvasScanConfig={values.defaultOpenvasScanConfig}
                  defaultOpenvasScanner={values.defaultOpenvasScanner}
                  defaultPortList={values.defaultPortList}
                  defaultReportFormat={values.defaultReportFormat}
                  defaultSmbCredential={values.defaultSmbCredential}
                  defaultSnmpCredential={values.defaultSnmpCredential}
                  defaultSshCredential={values.defaultSshCredential}
                  defaultSchedule={values.defaultSchedule}
                  defaultTarget={values.defaultTarget}
                  onChange={onValueChange}
                />
              </FormGroupSizer>
            </Section>
            {capabilities.mayAccess('filter') &&
              <Section title={_('Filter Settings')} foldable>
                <FormGroupSizer>
                  <FilterPart
                    agentsFilter={values.agentsFilter}
                    alertsFilter={values.alertsFilter}
                    assetsFilter={values.assetsFilter}
                    configsFilter={values.configsFilter}
                    credentialsFilter={values.credentialsFilter}
                    filtersFilter={values.filtersFilter}
                    notesFilter={values.notesFilter}
                    overridesFilter={values.overridesFilter}
                    permissionsFilter={values.permissionsFilter}
                    portListsFilter={values.portListsFilter}
                    reportsFilter={values.reportsFilter}
                    reportFormatsFilter={values.reportFormatsFilter}
                    resultsFilter={values.resultsFilter}
                    rolesFilter={values.rolesFilter}
                    schedulesFilter={values.schedulesFilter}
                    tagsFilter={values.tagsFilter}
                    targetsFilter={values.targetsFilter}
                    tasksFilter={values.tasksFilter}
                    cpeFilter={values.cpeFilter}
                    cveFilter={values.cveFilter}
                    nvtFilter={values.nvtFilter}
                    ovalFilter={values.ovalFilter}
                    certBundFilter={values.certBundFilter}
                    dfnCertFilter={values.dfnCertFilter}
                    secInfoFilter={values.secInfoFilter}
                    filters={filters}
                    onChange={onValueChange}
                  />
                </FormGroupSizer>
              </Section>
            }
          </React.Fragment>
        );
      }}
    </SaveDialog>
  );
};

UserSettingsDialog.propTypes = {
  agentsFilter: PropTypes.string,
  alerts: PropTypes.array,
  alertsFilter: PropTypes.string,
  assetsFilter: PropTypes.string,
  autoCacheRebuild: PropTypes.string,
  capabilities: PropTypes.capabilities.isRequired,
  certBundFilter: PropTypes.string,
  configsFilter: PropTypes.string,
  cpeFilter: PropTypes.string,
  credentials: PropTypes.array,
  credentialsFilter: PropTypes.string,
  cveFilter: PropTypes.string,
  defaultAlert: PropTypes.string,
  defaultEsxiCredential: PropTypes.string,
  defaultOpenvasScanConfig: PropTypes.string,
  defaultOpenvasScanner: PropTypes.string,
  defaultOspScanConfig: PropTypes.string,
  defaultOspScanner: PropTypes.string,
  defaultPortList: PropTypes.string,
  defaultReportFormat: PropTypes.string,
  defaultSchedule: PropTypes.string,
  defaultSeverity: PropTypes.string,
  defaultSmbCredential: PropTypes.string,
  defaultSnmpCredential: PropTypes.string,
  defaultSshCredential: PropTypes.string,
  defaultTarget: PropTypes.string,
  detailsExportFileName: PropTypes.string,
  dfnCertFilter: PropTypes.string,
  dynamicSeverity: PropTypes.string,
  filters: PropTypes.array,
  filtersFilter: PropTypes.string,
  listExportFileName: PropTypes.string,
  maxRowsPerPage: PropTypes.string,
  notesFilter: PropTypes.string,
  nvtFilter: PropTypes.string,
  ovalFilter: PropTypes.string,
  overridesFilter: PropTypes.string,
  permissionsFilter: PropTypes.string,
  portLists: PropTypes.array,
  portListsFilter: PropTypes.string,
  reportExportFileName: PropTypes.string,
  reportFormats: PropTypes.array,
  reportFormatsFilter: PropTypes.string,
  reportsFilter: PropTypes.string,
  resultsFilter: PropTypes.string,
  rolesFilter: PropTypes.string,
  rowsPerPage: PropTypes.string,
  scanConfigs: PropTypes.array,
  scanners: PropTypes.array,
  schedules: PropTypes.array,
  schedulesFilter: PropTypes.string,
  secInfoFilter: PropTypes.string,
  severityClass: PropTypes.string,
  tagsFilter: PropTypes.string,
  targets: PropTypes.array,
  targetsFilter: PropTypes.string,
  tasksFilter: PropTypes.string,
  timezone: PropTypes.string,
  userInterfaceLanguage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

UserSettingsDialog = connect(rootState => {
  const entities = isDefined(rootState.entities) ?
    rootState.entities : [];
  return {
    entities,
  };
})(UserSettingsDialog);

export default compose(
  withGmp,
  withCapabilities,
)(UserSettingsDialog);

// vim: set ts=2 sw=2 tw=80:
