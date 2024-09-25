/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useState} from 'react';

import styled from 'styled-components';

import {connect} from 'react-redux';

import {isDefined} from 'gmp/utils/identity';

import {parseFloat, parseYesNo} from 'gmp/parser';

import SaveDialog from 'web/components/dialog/savedialog';

import Section from 'web/components/section/section';
import Column from 'web/components/layout/column';

import useFormValues from 'web/components/form/useFormValues';
import useFormValidation from 'web/components/form/useFormValidation';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/hooks/useCapabilities';

import DefaultsPart from './defaultspart';
import FilterPart from './filterpart';
import GeneralPart from './generalpart';
import SeverityPart from './severitypart';
import {userSettingsRules} from './validationrules';

// necessary to stretch FormGroups to full width inside of Section
const FormGroupSizer = styled(Column)`
  width: 100%;
`;

const fieldsToValidate = ['rowsPerPage'];

let UserSettingsDialog = ({
  alerts,
  credentials,
  filters,
  openVasScanConfigs,
  openVasScanners,
  portLists,
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
  defaultOpenvasScanConfig,
  defaultOpenvasScanner,
  defaultPortList,
  defaultSmbCredential,
  defaultSnmpCredential,
  defaultSshCredential,
  defaultSchedule,
  defaultTarget,
  alertsFilter,
  auditReportsFilter,
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
  certBundFilter,
  dfnCertFilter,
  onClose,
  onSave,
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
    defaultOpenvasScanConfig,
    defaultOpenvasScanner,
    defaultPortList,
    defaultSmbCredential,
    defaultSnmpCredential,
    defaultSshCredential,
    defaultSchedule,
    defaultTarget,
    alertsFilter,
    auditReportsFilter,
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
    certBundFilter,
    dfnCertFilter,
  };

  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const [error, setError] = useState();
  const [formValues, handleValueChange] = useFormValues(settings);

  const handleSave = useCallback(
    values => {
      onSave(values).catch(err => {
        setError(err.message);
      });
    },
    [onSave],
  );

  const {hasError, errors, validate} = useFormValidation(
    userSettingsRules,
    formValues,
    {
      onValidationSuccess: handleSave,
      onValidationError: setError,
      fieldsToValidate,
    },
  );

  return (
    <SaveDialog
      error={error}
      title={_('Edit User Settings')}
      onClose={onClose}
      onErrorClose={() => setError()}
      onSave={validate}
      values={formValues}
    >
      {({values}) => (
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
                errors={errors}
                shouldWarn={hasError}
                onChange={handleValueChange}
              />
            </FormGroupSizer>
          </Section>
          <Section title={_('Severity Settings')} foldable>
            <FormGroupSizer>
              <SeverityPart
                dynamicSeverity={values.dynamicSeverity}
                defaultSeverity={values.defaultSeverity}
                severityClass={values.severityClass}
                onChange={handleValueChange}
              />
            </FormGroupSizer>
          </Section>
          <Section title={_('Defaults Settings')} foldable>
            <FormGroupSizer>
              <DefaultsPart
                alerts={alerts}
                credentials={credentials}
                openVasScanConfigs={openVasScanConfigs}
                openVasScanners={openVasScanners}
                portLists={portLists}
                schedules={schedules}
                targets={targets}
                defaultAlert={values.defaultAlert}
                defaultEsxiCredential={values.defaultEsxiCredential}
                defaultOpenvasScanConfig={values.defaultOpenvasScanConfig}
                defaultOpenvasScanner={values.defaultOpenvasScanner}
                defaultPortList={values.defaultPortList}
                defaultSmbCredential={values.defaultSmbCredential}
                defaultSnmpCredential={values.defaultSnmpCredential}
                defaultSshCredential={values.defaultSshCredential}
                defaultSchedule={values.defaultSchedule}
                defaultTarget={values.defaultTarget}
                onChange={handleValueChange}
              />
            </FormGroupSizer>
          </Section>
          {capabilities.mayAccess('filter') && (
            <Section title={_('Filter Settings')} foldable>
              <FormGroupSizer>
                <FilterPart
                  alertsFilter={values.alertsFilter}
                  auditReportsFilter={values.auditReportsFilter}
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
                  certBundFilter={values.certBundFilter}
                  dfnCertFilter={values.dfnCertFilter}
                  filters={filters}
                  onChange={handleValueChange}
                />
              </FormGroupSizer>
            </Section>
          )}
        </React.Fragment>
      )}
    </SaveDialog>
  );
};

UserSettingsDialog.propTypes = {
  alerts: PropTypes.array,
  alertsFilter: PropTypes.string,
  auditReportsFilter: PropTypes.string,
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
  defaultPortList: PropTypes.string,
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
  overridesFilter: PropTypes.string,
  permissionsFilter: PropTypes.string,
  portLists: PropTypes.array,
  portListsFilter: PropTypes.string,
  reportExportFileName: PropTypes.string,
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

export default UserSettingsDialog;

// vim: set ts=2 sw=2 tw=80:
