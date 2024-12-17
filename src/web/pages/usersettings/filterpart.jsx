/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

const filterFilters = (filters, type) =>
  filters.filter(filter => filter.filter_type === type);

const FilterPart = ({
  alertsFilter,
  auditReportsFilter,
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
  cveFilter,
  cpeFilter,
  nvtFilter,
  certBundFilter,
  dfnCertFilter,
  filters = [],
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <React.Fragment>
      <FormGroup title={_('Alerts Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'alert'),
            UNSET_VALUE,
          )}
          name="alertsFilter"
          value={alertsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Audit Reports Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'audit_report'),
            UNSET_VALUE,
          )}
          name="auditReportsFilter"
          value={auditReportsFilter}
          onChange={onChange}
        />
        </FormGroup>
      <FormGroup title={_('Scan Configs Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'config'),
            UNSET_VALUE,
          )}
          name="configsFilter"
          value={configsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Credentials Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'credential'),
            UNSET_VALUE,
          )}
          name="credentialsFilter"
          value={credentialsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Filters Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'filter'),
            UNSET_VALUE,
          )}
          name="filtersFilter"
          value={filtersFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Groups Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'group'),
            UNSET_VALUE,
          )}
          name="groupsFilter"
          value={groupsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Hosts Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'host'), UNSET_VALUE)}
          name="hostsFilter"
          value={hostsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Notes Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'note'), UNSET_VALUE)}
          name="notesFilter"
          value={notesFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Operating Systems Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'os'), UNSET_VALUE)}
          name="operatingSystemsFilter"
          value={operatingSystemsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Overrides Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'override'),
            UNSET_VALUE,
          )}
          name="overridesFilter"
          value={overridesFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Permissions Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'permission'),
            UNSET_VALUE,
          )}
          name="permissionsFilter"
          value={permissionsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Port Lists Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'port_list'),
            UNSET_VALUE,
          )}
          name="portListsFilter"
          value={portListsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Reports Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'report'),
            UNSET_VALUE,
          )}
          name="reportsFilter"
          value={reportsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Report Formats Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'report_format'),
            UNSET_VALUE,
          )}
          name="reportFormatsFilter"
          value={reportFormatsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Results Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'result'),
            UNSET_VALUE,
          )}
          name="resultsFilter"
          value={resultsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Roles Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'role'), UNSET_VALUE)}
          name="rolesFilter"
          value={rolesFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Scanners Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'scanner'),
            UNSET_VALUE,
          )}
          name="scannersFilter"
          value={scannersFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Schedules Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'schedule'),
            UNSET_VALUE,
          )}
          name="schedulesFilter"
          value={schedulesFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Tags Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'tag'), UNSET_VALUE)}
          name="tagsFilter"
          value={tagsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Targets Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'target'),
            UNSET_VALUE,
          )}
          name="targetsFilter"
          value={targetsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Tasks Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'task'), UNSET_VALUE)}
          name="tasksFilter"
          value={tasksFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Tickets Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'ticket'),
            UNSET_VALUE,
          )}
          name="ticketsFilter"
          value={ticketsFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('TLS Certificates Filter')} titleSize="3">
        <Select
          items={renderSelectItems(
            filterFilters(filters, 'tls_certificate'),
            UNSET_VALUE,
          )}
          name="tlsCertificatesFilter"
          value={tlsCertificatesFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Users Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'user'), UNSET_VALUE)}
          name="usersFilter"
          value={usersFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Vulnerabilities Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'vuln'), UNSET_VALUE)}
          name="vulnerabilitiesFilter"
          value={vulnerabilitiesFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('CPE Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          name="cpeFilter"
          value={cpeFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('CVE Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          name="cveFilter"
          value={cveFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('NVT Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          name="nvtFilter"
          value={nvtFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('CERT-Bund Advisories Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          name="certBundFilter"
          value={certBundFilter}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('DFN-CERT Advisories Filter')} titleSize="3">
        <Select
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          name="dfnCertFilter"
          value={dfnCertFilter}
          onChange={onChange}
        />
      </FormGroup>
    </React.Fragment>
  );
};

FilterPart.propTypes = {
  alertsFilter: PropTypes.string,
  auditReportsFilter: PropTypes.string,
  certBundFilter: PropTypes.string,
  configsFilter: PropTypes.string,
  cpeFilter: PropTypes.string,
  credentialsFilter: PropTypes.string,
  cveFilter: PropTypes.string,
  dfnCertFilter: PropTypes.string,
  filters: PropTypes.array,
  filtersFilter: PropTypes.string,
  groupsFilter: PropTypes.string,
  hostsFilter: PropTypes.string,
  notesFilter: PropTypes.string,
  nvtFilter: PropTypes.string,
  operatingSystemsFilter: PropTypes.string,
  overridesFilter: PropTypes.string,
  permissionsFilter: PropTypes.string,
  portListsFilter: PropTypes.string,
  reportFormatsFilter: PropTypes.string,
  reportsFilter: PropTypes.string,
  resultsFilter: PropTypes.string,
  rolesFilter: PropTypes.string,
  scannersFilter: PropTypes.string,
  schedulesFilter: PropTypes.string,
  tagsFilter: PropTypes.string,
  targetsFilter: PropTypes.string,
  tasksFilter: PropTypes.string,
  ticketsFilter: PropTypes.string,
  tlsCertificatesFilter: PropTypes.string,
  usersFilter: PropTypes.string,
  vulnerabilitiesFilter: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterPart;

// vim: set ts=2 sw=2 tw=80:
