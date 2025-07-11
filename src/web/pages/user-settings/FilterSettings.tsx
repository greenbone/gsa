/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {DEFAULT_FILTER_SETTINGS} from 'gmp/commands/users';
import {ALL_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import Select from 'web/components/form/Select';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import StripedTable from 'web/components/table/StripedTable';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import EditableSettingRow from 'web/pages/user-settings/EditableSettingRow';
import useSettingSave from 'web/pages/user-settings/useSettingSave';
import {selector as filtersSelector} from 'web/store/entities/filters';
import {
  defaultFilterLoadingActions,
  loadUserSettingsDefaultFilter,
} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';

const FILTER_NAMES = [
  'alertsFilter',
  'auditReportsFilter',
  'configsFilter',
  'credentialsFilter',
  'filtersFilter',
  'groupsFilter',
  'hostsFilter',
  'notesFilter',
  'operatingSystemsFilter',
  'overridesFilter',
  'permissionsFilter',
  'portListsFilter',
  'reportsFilter',
  'reportFormatsFilter',
  'resultsFilter',
  'rolesFilter',
  'scannersFilter',
  'schedulesFilter',
  'tagsFilter',
  'targetsFilter',
  'tasksFilter',
  'ticketsFilter',
  'tlsCertificatesFilter',
  'usersFilter',
  'vulnerabilitiesFilter',
  'cpeFilter',
  'cveFilter',
  'nvtFilter',
  'certBundFilter',
  'dfnCertFilter',
] as const;

const FILTER_NAME_TO_ENTITY_TYPE: Record<string, string> = {
  alertsFilter: 'alert',
  auditReportsFilter: 'auditreport',
  configsFilter: 'scanconfig',
  credentialsFilter: 'credential',
  filtersFilter: 'filter',
  groupsFilter: 'group',
  hostsFilter: 'host',
  notesFilter: 'note',
  operatingSystemsFilter: 'operatingsystem',
  overridesFilter: 'override',
  permissionsFilter: 'permission',
  portListsFilter: 'portlist',
  reportsFilter: 'report',
  reportFormatsFilter: 'reportformat',
  resultsFilter: 'result',
  rolesFilter: 'role',
  scannersFilter: 'scanner',
  schedulesFilter: 'schedule',
  tagsFilter: 'tag',
  targetsFilter: 'target',
  tasksFilter: 'task',
  ticketsFilter: 'ticket',
  tlsCertificatesFilter: 'tlscertificate',
  usersFilter: 'user',
  vulnerabilitiesFilter: 'vulnerability',
  cpeFilter: 'cpe',
  cveFilter: 'cve',
  nvtFilter: 'nvt',
  certBundFilter: 'certbund',
  dfnCertFilter: 'dfncert',
};

const getFilterSettingId = (filterName: string): string => {
  const entityType = FILTER_NAME_TO_ENTITY_TYPE[filterName];
  if (!entityType) {
    throw new Error(`Unknown filter name: ${filterName}`);
  }
  const settingId =
    DEFAULT_FILTER_SETTINGS[entityType as keyof typeof DEFAULT_FILTER_SETTINGS];
  return settingId;
};

const FILTER_TYPE_MAP: Record<string, string> = {
  alerts: 'alert',
  auditReports: 'audit_report',
  configs: 'config',
  credentials: 'credential',
  filters: 'filter',
  groups: 'group',
  hosts: 'host',
  notes: 'note',
  operatingSystems: 'os',
  overrides: 'override',
  permissions: 'permission',
  portLists: 'port_list',
  reportFormats: 'report_format',
  results: 'result',
  roles: 'role',
  scanners: 'scanner',
  schedules: 'schedule',
  tags: 'tag',
  targets: 'target',
  tasks: 'task',
  tickets: 'ticket',
  tlsCertificates: 'tls_certificate',
  users: 'user',
  vulnerabilities: 'vuln',
  cpe: 'info',
  cve: 'info',
  nvt: 'info',
  certBund: 'info',
  dfnCert: 'info',
};

const isReportFilter = (key: string) => key === 'reportsFilter';

const getFilterTypeFromKey = (key: string): string => {
  if (isReportFilter(key)) {
    return 'report';
  }

  for (const [mapKey, filterType] of Object.entries(FILTER_TYPE_MAP)) {
    if (key.includes(mapKey)) {
      return filterType;
    }
  }

  return '';
};

const getFilterTitle = (key: string, _: (text: string) => string): string => {
  const titleMap: Record<string, string> = {
    alertsFilter: _('Alerts Filter'),
    auditReportsFilter: _('Audit Reports Filter'),
    configsFilter: _('Configs Filter'),
    credentialsFilter: _('Credentials Filter'),
    filtersFilter: _('Filters Filter'),
    groupsFilter: _('Groups Filter'),
    hostsFilter: _('Hosts Filter'),
    notesFilter: _('Notes Filter'),
    operatingSystemsFilter: _('Operating Systems Filter'),
    overridesFilter: _('Overrides Filter'),
    permissionsFilter: _('Permissions Filter'),
    portListsFilter: _('Port Lists Filter'),
    reportsFilter: _('Reports Filter'),
    reportFormatsFilter: _('Report Formats Filter'),
    resultsFilter: _('Results Filter'),
    rolesFilter: _('Roles Filter'),
    scannersFilter: _('Scanners Filter'),
    schedulesFilter: _('Schedules Filter'),
    tagsFilter: _('Tags Filter'),
    targetsFilter: _('Targets Filter'),
    tasksFilter: _('Tasks Filter'),
    ticketsFilter: _('Tickets Filter'),
    tlsCertificatesFilter: _('TLS Certificates Filter'),
    usersFilter: _('Users Filter'),
    vulnerabilitiesFilter: _('Vulnerabilities Filter'),
    cpeFilter: _('CPE Filter'),
    cveFilter: _('CVE Filter'),
    nvtFilter: _('NVT Filter'),
    certBundFilter: _('CERT-Bund Advisories Filter'),
    dfnCertFilter: _('DFN-CERT Advisories Filter'),
  };
  return titleMap[key] || key;
};

export const FilterSettings = () => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const filtersSel = useShallowEqualSelector(getUserSettingsDefaults);
  const filtersDefaultSelector = useShallowEqualSelector(
    getUserSettingsDefaultFilter,
  );

  const {
    getErrorMessage,
    saveSetting,
    onInteraction,
    setErrorMessage,
    clearErrorMessage,
  } = useSettingSave();

  const filters =
    useShallowEqualSelector(state =>
      filtersSelector(state).getEntities(ALL_FILTER),
    ) ?? [];

  const editModes = useMemo(
    () =>
      FILTER_NAMES.reduce(
        (acc, name) => {
          acc[name] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    [],
  );
  const [isEditing, setIsEditing] = useState(editModes);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    FILTER_NAMES.forEach(name => {
      const entityType = FILTER_NAME_TO_ENTITY_TYPE[name];
      if (entityType) {
        const filter = filtersDefaultSelector?.getFilter(entityType);
        const filterId = filter?.id || '';
        setValues(values => ({...values, [name]: filterId}));
      }
    });
  }, [filtersDefaultSelector]);

  const saveField = async (key: (typeof FILTER_NAMES)[number]) => {
    try {
      const settingId = getFilterSettingId(key);
      const entityType = FILTER_NAME_TO_ENTITY_TYPE[key];

      if (!settingId) {
        setErrorMessage(key, _('Cannot save filter: missing setting ID.'));
        return;
      }

      if (entityType) {
        dispatch(
          defaultFilterLoadingActions.optimisticUpdate(entityType, values[key]),
        );
      }

      await saveSetting(settingId, key, values[key], value =>
        setIsEditing(editState => ({...editState, [key]: value})),
      );

      if (entityType) {
        setValues(prevValues => ({
          ...prevValues,
          [key]: values[key],
        }));
      }
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      // @ts-expect-error
      const message = error.message ?? _('Failed to save filter setting');
      setErrorMessage(key, message);

      const entityType = FILTER_NAME_TO_ENTITY_TYPE[key];
      if (entityType) {
        // @ts-expect-error
        dispatch(loadUserSettingsDefaultFilter(gmp)(entityType));
      }
    }
  };
  const cancelField = (key: (typeof FILTER_NAMES)[number]) => {
    const entityType = FILTER_NAME_TO_ENTITY_TYPE[key];
    const filter = filtersDefaultSelector?.getFilter(entityType);
    setValues(previousValues => ({...previousValues, [key]: filter?.id || ''}));
    setIsEditing(previousEditingState => ({
      ...previousEditingState,
      [key]: false,
    }));
    clearErrorMessage(key);
    onInteraction();
  };

  return (
    <StripedTable>
      <colgroup>
        <col width="30%" />
        <col width="55%" />
        <col width="15%" />
      </colgroup>
      <TableHeader>
        <tr>
          <TableHead>{_('Filter')}</TableHead>
          <TableHead>{_('Value')}</TableHead>
          <TableHead>{_('Actions')}</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {FILTER_NAMES.map(key => {
          const setting = filtersSel.getByName(key) ?? {};
          const currentVal = values[key];

          const filterType = getFilterTypeFromKey(key);

          const filterItems = filters.filter(
            filter => filter.filter_type === filterType,
          );

          const selectItems = renderSelectItems(
            filterItems.map(filter => ({
              name: filter.name ?? filter.id,
              id: filter.id,
              deprecated: filter.deprecated,
            })),
            UNSET_VALUE,
            _('None'),
          );

          const selectedFilter = filters.find(f => f.id === currentVal);
          let viewValue = _('None');
          if (selectedFilter) {
            viewValue = selectedFilter.name ?? selectedFilter.id;
          } else if (currentVal) {
            const entityType = FILTER_NAME_TO_ENTITY_TYPE[key];
            if (entityType) {
              viewValue = `${entityType} Filter`;
            } else {
              viewValue = currentVal;
            }
          }

          return (
            <EditableSettingRow
              key={key}
              disableEditIcon={false}
              editComponent={
                <Select
                  items={selectItems}
                  name={key}
                  value={currentVal || UNSET_VALUE}
                  onChange={newValues => {
                    setValues(updatedValues => ({
                      ...updatedValues,
                      [key]: newValues === UNSET_VALUE ? '' : newValues,
                    }));
                    onInteraction();
                  }}
                />
              }
              errorMessage={getErrorMessage(key)}
              isEditMode={isEditing[key]}
              label={getFilterTitle(key, _)}
              title={setting.comment}
              viewComponent={
                <Layout>
                  {isDefined(currentVal) && currentVal !== '' ? (
                    <DetailsLink id={currentVal} type="filter">
                      {viewValue}
                    </DetailsLink>
                  ) : (
                    <span>{viewValue}</span>
                  )}
                </Layout>
              }
              onCancel={() => cancelField(key)}
              onEdit={() => {
                setIsEditing(editState => ({...editState, [key]: true}));
                onInteraction();
              }}
              onSave={() => saveField(key)}
            />
          );
        })}
      </TableBody>
    </StripedTable>
  );
};

export default FilterSettings;
