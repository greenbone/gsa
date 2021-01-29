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

import _ from 'gmp/locale';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

const filterFilters = (filters, type) =>
  filters.filter(filter => filter.filter_type === type);

const FilterPart = ({
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
  cveFilter,
  cpeFilter,
  nvtFilter,
  ovalFilter,
  certBundFilter,
  dfnCertFilter,
  filters = [],
  onChange,
}) => {
  return (
    <React.Fragment>
      <FormGroup title={_('Alerts Filter')} titleSize="3">
        <Select
          name="alertsFilter"
          value={alertsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'alert'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Scan Configs Filter')} titleSize="3">
        <Select
          name="configsFilter"
          value={configsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'config'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Credentials Filter')} titleSize="3">
        <Select
          name="credentialsFilter"
          value={credentialsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'credential'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Filters Filter')} titleSize="3">
        <Select
          name="filtersFilter"
          value={filtersFilter}
          items={renderSelectItems(
            filterFilters(filters, 'filter'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Groups Filter')} titleSize="3">
        <Select
          name="groupsFilter"
          value={groupsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'group'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Hosts Filter')} titleSize="3">
        <Select
          name="hostsFilter"
          value={hostsFilter}
          items={renderSelectItems(filterFilters(filters, 'host'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Notes Filter')} titleSize="3">
        <Select
          name="notesFilter"
          value={notesFilter}
          items={renderSelectItems(filterFilters(filters, 'note'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Operating Systems Filter')} titleSize="3">
        <Select
          name="operatingSystemsFilter"
          value={operatingSystemsFilter}
          items={renderSelectItems(filterFilters(filters, 'os'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Overrides Filter')} titleSize="3">
        <Select
          name="overridesFilter"
          value={overridesFilter}
          items={renderSelectItems(
            filterFilters(filters, 'override'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Permissions Filter')} titleSize="3">
        <Select
          name="permissionsFilter"
          value={permissionsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'permission'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Port Lists Filter')} titleSize="3">
        <Select
          name="portListsFilter"
          value={portListsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'port_list'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Reports Filter')} titleSize="3">
        <Select
          name="reportsFilter"
          value={reportsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'report'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Report Formats Filter')} titleSize="3">
        <Select
          name="reportFormatsFilter"
          value={reportFormatsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'report_format'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Results Filter')} titleSize="3">
        <Select
          name="resultsFilter"
          value={resultsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'result'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Roles Filter')} titleSize="3">
        <Select
          name="rolesFilter"
          value={rolesFilter}
          items={renderSelectItems(filterFilters(filters, 'role'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Scanners Filter')} titleSize="3">
        <Select
          name="scannersFilter"
          value={scannersFilter}
          items={renderSelectItems(
            filterFilters(filters, 'scanner'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Schedules Filter')} titleSize="3">
        <Select
          name="schedulesFilter"
          value={schedulesFilter}
          items={renderSelectItems(
            filterFilters(filters, 'schedule'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Tags Filter')} titleSize="3">
        <Select
          name="tagsFilter"
          value={tagsFilter}
          items={renderSelectItems(filterFilters(filters, 'tag'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Targets Filter')} titleSize="3">
        <Select
          name="targetsFilter"
          value={targetsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'target'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Tasks Filter')} titleSize="3">
        <Select
          name="tasksFilter"
          value={tasksFilter}
          items={renderSelectItems(filterFilters(filters, 'task'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Tickets Filter')} titleSize="3">
        <Select
          name="ticketsFilter"
          value={ticketsFilter}
          items={renderSelectItems(
            filterFilters(filters, 'ticket'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('TLS Certificates Filter')} titleSize="3">
        <Select
          name="tlsCertificatesFilter"
          value={tlsCertificatesFilter}
          items={renderSelectItems(
            filterFilters(filters, 'tls_certificate'),
            UNSET_VALUE,
          )}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Users Filter')} titleSize="3">
        <Select
          name="usersFilter"
          value={usersFilter}
          items={renderSelectItems(filterFilters(filters, 'user'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('Vulnerabilities Filter')} titleSize="3">
        <Select
          name="vulnerabilitiesFilter"
          value={vulnerabilitiesFilter}
          items={renderSelectItems(filterFilters(filters, 'vuln'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('CPE Filter')} titleSize="3">
        <Select
          name="cpeFilter"
          value={cpeFilter}
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('CVE Filter')} titleSize="3">
        <Select
          name="cveFilter"
          value={cveFilter}
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('NVT Filter')} titleSize="3">
        <Select
          name="nvtFilter"
          value={nvtFilter}
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('OVAL Definitions Filter')} titleSize="3">
        <Select
          name="ovalFilter"
          value={ovalFilter}
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('CERT-Bund Advisories Filter')} titleSize="3">
        <Select
          name="certBundFilter"
          value={certBundFilter}
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup title={_('DFN-CERT Advisories Filter')} titleSize="3">
        <Select
          name="dfnCertFilter"
          value={dfnCertFilter}
          items={renderSelectItems(filterFilters(filters, 'info'), UNSET_VALUE)}
          onChange={onChange}
        />
      </FormGroup>
    </React.Fragment>
  );
};

FilterPart.propTypes = {
  alertsFilter: PropTypes.string,
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
  ovalFilter: PropTypes.string,
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

export default withCapabilities(FilterPart);

// vim: set ts=2 sw=2 tw=80:
