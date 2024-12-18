/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {SYSTEM_DEFAULT} from 'gmp/locale/date';
import {parseFloat, parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback, useState} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import SaveDialog from 'web/components/dialog/savedialog';
import useFormValidation from 'web/components/form/useFormValidation';
import useFormValues from 'web/components/form/useFormValues';
import Column from 'web/components/layout/column';
import Section from 'web/components/section/section';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

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

const UserSettingsDialogComponent = ({
  alerts,
  credentials,
  filters,
  openVasScanConfigs,
  openVasScanners,
  portLists,
  schedules,
  targets,
  timezone,
  userInterfaceTimeFormat,
  userInterfaceDateFormat,
  isUserInterfaceTimeDateDefault,
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
    userInterfaceTimeFormat,
    userInterfaceDateFormat,
    isUserInterfaceTimeDateDefault,
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
      values={formValues}
      onClose={onClose}
      onErrorClose={() => setError()}
      onSave={validate}
    >
      {({values}) => (
        <React.Fragment>
          <Section foldable title={_('General Settings')}>
            <FormGroupSizer>
              <GeneralPart
                autoCacheRebuild={values.autoCacheRebuild}
                confPassword={values.confPassword}
                detailsExportFileName={values.detailsExportFileName}
                errors={errors}
                isUserInterfaceTimeDateDefault={
                  values.isUserInterfaceTimeDateDefault
                }
                listExportFileName={values.listExportFileName}
                maxRowsPerPage={values.maxRowsPerPage}
                newPassword={values.newPassword}
                oldPassword={values.oldPassword}
                reportExportFileName={values.reportExportFileName}
                rowsPerPage={values.rowsPerPage}
                shouldWarn={hasError}
                timezone={values.timezone}
                userInterfaceDateFormat={values.userInterfaceDateFormat}
                userInterfaceLanguage={values.userInterfaceLanguage}
                userInterfaceTimeFormat={values.userInterfaceTimeFormat}
                onChange={handleValueChange}
              />
            </FormGroupSizer>
          </Section>
          <Section foldable title={_('Severity Settings')}>
            <FormGroupSizer>
              <SeverityPart
                defaultSeverity={values.defaultSeverity}
                dynamicSeverity={values.dynamicSeverity}
                severityClass={values.severityClass}
                onChange={handleValueChange}
              />
            </FormGroupSizer>
          </Section>
          <Section foldable title={_('Defaults Settings')}>
            <FormGroupSizer>
              <DefaultsPart
                alerts={alerts}
                credentials={credentials}
                defaultAlert={values.defaultAlert}
                defaultEsxiCredential={values.defaultEsxiCredential}
                defaultOpenvasScanConfig={values.defaultOpenvasScanConfig}
                defaultOpenvasScanner={values.defaultOpenvasScanner}
                defaultPortList={values.defaultPortList}
                defaultSchedule={values.defaultSchedule}
                defaultSmbCredential={values.defaultSmbCredential}
                defaultSnmpCredential={values.defaultSnmpCredential}
                defaultSshCredential={values.defaultSshCredential}
                defaultTarget={values.defaultTarget}
                openVasScanConfigs={openVasScanConfigs}
                openVasScanners={openVasScanners}
                portLists={portLists}
                schedules={schedules}
                targets={targets}
                onChange={handleValueChange}
              />
            </FormGroupSizer>
          </Section>
          {capabilities.mayAccess('filter') && (
            <Section foldable title={_('Filter Settings')}>
              <FormGroupSizer>
                <FilterPart
                  alertsFilter={values.alertsFilter}
                  auditReportsFilter={values.auditReportsFilter}
                  certBundFilter={values.certBundFilter}
                  configsFilter={values.configsFilter}
                  cpeFilter={values.cpeFilter}
                  credentialsFilter={values.credentialsFilter}
                  cveFilter={values.cveFilter}
                  dfnCertFilter={values.dfnCertFilter}
                  filters={filters}
                  filtersFilter={values.filtersFilter}
                  groupsFilter={values.groupsFilter}
                  hostsFilter={values.hostsFilter}
                  notesFilter={values.notesFilter}
                  nvtFilter={values.nvtFilter}
                  operatingSystemsFilter={values.operatingSystemsFilter}
                  overridesFilter={values.overridesFilter}
                  permissionsFilter={values.permissionsFilter}
                  portListsFilter={values.portListsFilter}
                  reportFormatsFilter={values.reportFormatsFilter}
                  reportsFilter={values.reportsFilter}
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

UserSettingsDialogComponent.propTypes = {
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
  userInterfaceDateFormat: PropTypes.oneOf(['wmdy', 'wdmy', SYSTEM_DEFAULT]),
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
  isUserInterfaceTimeDateDefault: PropTypes.oneOfType([YES_VALUE, NO_VALUE]),
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
  userInterfaceTimeFormat: PropTypes.oneOf([12, 24, SYSTEM_DEFAULT]),
  tlsCertificatesFilter: PropTypes.string,
  userInterfaceLanguage: PropTypes.string,
  usersFilter: PropTypes.string,
  vulnerabilitiesFilter: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

const UserSettingsDialog = connect(rootState => {
  const entities = isDefined(rootState.entities) ? rootState.entities : [];
  return {
    entities,
  };
})(UserSettingsDialogComponent);

export default UserSettingsDialog;
