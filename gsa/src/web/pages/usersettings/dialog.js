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

import styled from 'styled-components';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {parseFloat, parseYesNo} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import SaveDialog from 'web/components/dialog/savedialog';

import Section from 'web/components/section/section';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import useFormValidation, {
  syncVariables,
} from 'web/components/form/useFormValidation';
import {userSettingsRules} from './validationrules';

import DefaultsPart from './defaultspart';
import FilterPart from './filterpart';
import GeneralPart from './generalpart';
import SeverityPart from './severitypart';

// necessary to stretch FormGroups to full width inside of Section
const FormGroupSizer = styled.div`
  width: 100%;
`;

let UserSettingsDialog = ({
  alerts,
  credentials,
  filters,
  openVasScanConfigs,
  ospScanConfigs,
  openVasScanners,
  ospScanners,
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
  alertsFilter,
  configsFilter,
  credentialsFilter,
  filtersFilter,
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
    dynamicSeverity: parseYesNo(dynamicSeverity),
    defaultSeverity: parseFloat(defaultSeverity),
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
  };

  const validationSchema = {
    rowsPerPage,
  };

  const {
    shouldWarn,
    formValues,
    handleValueChange,
    validityStatus,
    handleSubmit,
  } = useFormValidation(validationSchema, userSettingsRules, onSave);

  return (
    <SaveDialog
      title={_('Edit User Settings')}
      onClose={onClose}
      onSave={handleSubmit}
      defaultValues={settings}
    >
      {({values, onValueChange}) => {
        syncVariables(values, formValues);
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
                  validityStatus={validityStatus}
                  shouldWarn={shouldWarn}
                  onChange={handleValueChange}
                />
              </FormGroupSizer>
            </Section>
            <Section title={_('Severity Settings')} foldable>
              <FormGroupSizer>
                <SeverityPart
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
                  openVasScanConfigs={openVasScanConfigs}
                  ospScanConfigs={ospScanConfigs}
                  openVasScanners={openVasScanners}
                  ospScanners={ospScanners}
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
            {capabilities.mayAccess('filter') && (
              <Section title={_('Filter Settings')} foldable>
                <FormGroupSizer>
                  <FilterPart
                    alertsFilter={values.alertsFilter}
                    configsFilter={values.configsFilter}
                    credentialsFilter={values.credentialsFilter}
                    filtersFilter={values.filtersFilter}
                    groupsFilter={values.groupsFilter}
                    hostsFilter={values.hostsFilter}
                    notesFilter={values.notesFilter}
                    operatingSystemsFilter={values.operatingSystemsFilter}
                    overridesFilter={values.overridesFilter}
                    permissionsFilter={values.permissionsFilter}
                    portListsFilter={values.portListsFilter}
                    reportsFilter={values.reportsFilter}
                    reportFormatsFilter={values.reportFormatsFilter}
                    resultsFilter={values.resultsFilter}
                    rolesFilter={values.rolesFilter}
                    scannersFilter={values.scannersFilter}
                    schedulesFilter={values.schedulesFilter}
                    tagsFilter={values.tagsFilter}
                    targetsFilter={values.targetsFilter}
                    tasksFilter={values.tasksFilter}
                    ticketsFilter={values.ticketsFilter}
                    tlsCertificatesFilter={values.tlsCertificatesFilter}
                    usersFilter={values.usersFilter}
                    vulnerabilitiesFilter={values.vulnerabilitiesFilter}
                    cpeFilter={values.cpeFilter}
                    cveFilter={values.cveFilter}
                    nvtFilter={values.nvtFilter}
                    ovalFilter={values.ovalFilter}
                    certBundFilter={values.certBundFilter}
                    dfnCertFilter={values.dfnCertFilter}
                    filters={filters}
                    onChange={onValueChange}
                  />
                </FormGroupSizer>
              </Section>
            )}
          </React.Fragment>
        );
      }}
    </SaveDialog>
  );
};

UserSettingsDialog.propTypes = {
  alerts: PropTypes.array,
  alertsFilter: PropTypes.string,
  autoCacheRebuild: PropTypes.number,
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
  defaultSeverity: PropTypes.number,
  defaultSmbCredential: PropTypes.string,
  defaultSnmpCredential: PropTypes.string,
  defaultSshCredential: PropTypes.string,
  defaultTarget: PropTypes.string,
  detailsExportFileName: PropTypes.string,
  dfnCertFilter: PropTypes.string,
  dynamicSeverity: PropTypes.number,
  filters: PropTypes.array,
  filtersFilter: PropTypes.string,
  groupsFilter: PropTypes.string,
  hostsFilter: PropTypes.string,
  listExportFileName: PropTypes.string,
  maxRowsPerPage: PropTypes.number,
  notesFilter: PropTypes.string,
  nvtFilter: PropTypes.string,
  openVasScanConfigs: PropTypes.array,
  openVasScanners: PropTypes.array,
  operatingSystemsFilter: PropTypes.string,
  ospScanConfigs: PropTypes.array,
  ospScanners: PropTypes.array,
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
  rowsPerPage: PropTypes.number,
  scannersFilter: PropTypes.string,
  schedules: PropTypes.array,
  schedulesFilter: PropTypes.string,
  tagsFilter: PropTypes.string,
  targets: PropTypes.array,
  targetsFilter: PropTypes.string,
  tasksFilter: PropTypes.string,
  ticketsFilter: PropTypes.string,
  timezone: PropTypes.string,
  tlsCertificatesFilter: PropTypes.string,
  userInterfaceLanguage: PropTypes.string,
  usersFilter: PropTypes.string,
  vulnerabilitiesFilter: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

UserSettingsDialog = connect(rootState => {
  const entities = isDefined(rootState.entities) ? rootState.entities : [];
  return {
    entities,
  };
})(UserSettingsDialog);

export default compose(withGmp, withCapabilities)(UserSettingsDialog);

// vim: set ts=2 sw=2 tw=80:
