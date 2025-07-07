/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import {
  renderSelectItems,
  UNSET_VALUE,
  RenderSelectItemProps,
} from 'web/utils/Render';

interface FilterPartProps {
  alertsFilter?: string;
  auditReportsFilter?: string;
  certBundFilter?: string;
  configsFilter?: string;
  cpeFilter?: string;
  credentialsFilter?: string;
  cveFilter?: string;
  dfnCertFilter?: string;
  filters?: Filter[];
  filtersFilter?: string;
  groupsFilter?: string;
  hostsFilter?: string;
  notesFilter?: string;
  nvtFilter?: string;
  operatingSystemsFilter?: string;
  overridesFilter?: string;
  permissionsFilter?: string;
  portListsFilter?: string;
  reportFormatsFilter?: string;
  reportsFilter?: string;
  resultsFilter?: string;
  rolesFilter?: string;
  scannersFilter?: string;
  schedulesFilter?: string;
  tagsFilter?: string;
  targetsFilter?: string;
  tasksFilter?: string;
  ticketsFilter?: string;
  tlsCertificatesFilter?: string;
  usersFilter?: string;
  vulnerabilitiesFilter?: string;
  onChange?: (value: string, name?: string) => void;
}
interface DefaultSettingFieldProps {
  title: string | {toString(): string};
  items?: RenderSelectItemProps[];
  name: string;
  value?: string;
  onChange?: (value: string, name?: string) => void;
}

const filterFilters = (filters: Filter[], type: string) =>
  filters.filter(filter => filter.filter_type === type);

const DefaultSettingField = ({
  title,
  items = [],
  name,
  value,
  onChange,
}: DefaultSettingFieldProps) => {
  return (
    <FormGroup title={String(title)}>
      <Select
        items={renderSelectItems(items, UNSET_VALUE)}
        name={name}
        value={value}
        onChange={onChange}
      />
    </FormGroup>
  );
};

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
}: FilterPartProps) => {
  const [_] = useTranslation();
  const defaultFields = [
    {
      title: _('Alerts Filter'),
      items: filterFilters(filters, 'alert'),
      name: 'alertsFilter',
      value: alertsFilter,
    },
    {
      title: _('Audit Reports Filter'),
      items: filterFilters(filters, 'audit_report'),
      name: 'auditReportsFilter',
      value: auditReportsFilter,
    },
    {
      title: _('Scan Configs Filter'),
      items: filterFilters(filters, 'config'),
      name: 'configsFilter',
      value: configsFilter,
    },
    {
      title: _('Credentials Filter'),
      items: filterFilters(filters, 'credential'),
      name: 'credentialsFilter',
      value: credentialsFilter,
    },
    {
      title: _('Filters Filter'),
      items: filterFilters(filters, 'filter'),
      name: 'filtersFilter',
      value: filtersFilter,
    },
    {
      title: _('Groups Filter'),
      items: filterFilters(filters, 'group'),
      name: 'groupsFilter',
      value: groupsFilter,
    },
    {
      title: _('Hosts Filter'),
      items: filterFilters(filters, 'host'),
      name: 'hostsFilter',
      value: hostsFilter,
    },
    {
      title: _('Notes Filter'),
      items: filterFilters(filters, 'note'),
      name: 'notesFilter',
      value: notesFilter,
    },
    {
      title: _('Operating Systems Filter'),
      items: filterFilters(filters, 'os'),
      name: 'operatingSystemsFilter',
      value: operatingSystemsFilter,
    },
    {
      title: _('Overrides Filter'),
      items: filterFilters(filters, 'override'),
      name: 'overridesFilter',
      value: overridesFilter,
    },
    {
      title: _('Permissions Filter'),
      items: filterFilters(filters, 'permission'),
      name: 'permissionsFilter',
      value: permissionsFilter,
    },
    {
      title: _('Port Lists Filter'),
      items: filterFilters(filters, 'port_list'),
      name: 'portListsFilter',
      value: portListsFilter,
    },
    {
      title: _('Reports Filter'),
      items: filterFilters(filters, 'report'),
      name: 'reportsFilter',
      value: reportsFilter,
    },
    {
      title: _('Report Formats Filter'),
      items: filterFilters(filters, 'report_format'),
      name: 'reportFormatsFilter',
      value: reportFormatsFilter,
    },
    {
      title: _('Results Filter'),
      items: filterFilters(filters, 'result'),
      name: 'resultsFilter',
      value: resultsFilter,
    },
    {
      title: _('Roles Filter'),
      items: filterFilters(filters, 'role'),
      name: 'rolesFilter',
      value: rolesFilter,
    },
    {
      title: _('Scanners Filter'),
      items: filterFilters(filters, 'scanner'),
      name: 'scannersFilter',
      value: scannersFilter,
    },
    {
      title: _('Schedules Filter'),
      items: filterFilters(filters, 'schedule'),
      name: 'schedulesFilter',
      value: schedulesFilter,
    },
    {
      title: _('Tags Filter'),
      items: filterFilters(filters, 'tag'),
      name: 'tagsFilter',
      value: tagsFilter,
    },
    {
      title: _('Targets Filter'),
      items: filterFilters(filters, 'target'),
      name: 'targetsFilter',
      value: targetsFilter,
    },
    {
      title: _('Tasks Filter'),
      items: filterFilters(filters, 'task'),
      name: 'tasksFilter',
      value: tasksFilter,
    },
    {
      title: _('Tickets Filter'),
      items: filterFilters(filters, 'ticket'),
      name: 'ticketsFilter',
      value: ticketsFilter,
    },
    {
      title: _('TLS Certificates Filter'),
      items: filterFilters(filters, 'tls_certificate'),
      name: 'tlsCertificatesFilter',
      value: tlsCertificatesFilter,
    },
    {
      title: _('Users Filter'),
      items: filterFilters(filters, 'user'),
      name: 'usersFilter',
      value: usersFilter,
    },
    {
      title: _('Vulnerabilities Filter'),
      items: filterFilters(filters, 'vuln'),
      name: 'vulnerabilitiesFilter',
      value: vulnerabilitiesFilter,
    },
    {
      title: _('CPE Filter'),
      items: filterFilters(filters, 'info'),
      name: 'cpeFilter',
      value: cpeFilter,
    },
    {
      title: _('CVE Filter'),
      items: filterFilters(filters, 'info'),
      name: 'cveFilter',
      value: cveFilter,
    },
    {
      title: _('NVT Filter'),
      items: filterFilters(filters, 'info'),
      name: 'nvtFilter',
      value: nvtFilter,
    },
    {
      title: _('CERT-Bund Advisories Filter'),
      items: filterFilters(filters, 'info'),
      name: 'certBundFilter',
      value: certBundFilter,
    },
    {
      title: _('DFN-CERT Advisories Filter'),
      items: filterFilters(filters, 'info'),
      name: 'dfnCertFilter',
      value: dfnCertFilter,
    },
  ];
  return (
    <>
      {defaultFields.map(field => (
        <DefaultSettingField
          key={field.name}
          // @ts-expect-error Filter id and name are currently returning undefined but both are always defined here
          items={field.items}
          name={field.name}
          title={field.title}
          value={field.value}
          onChange={onChange}
        />
      ))}
    </>
  );
};

export default FilterPart;
