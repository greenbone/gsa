/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';

import {DEFAULT_SETTINGS} from 'gmp/commands/users';
import {ALL_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import Select from 'web/components/form/Select';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useCapabilities from 'web/hooks/useCapabilities';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import EditableSettingRow from 'web/pages/user-settings/EditableSettingRow';
import useSettingSave from 'web/pages/user-settings/useSettingSave';

import {selector as alertsSelector} from 'web/store/entities/alerts';
import {selector as credentialsSelector} from 'web/store/entities/credentials';
import {selector as portListsSelector} from 'web/store/entities/portlists';
import {selector as scanConfigsSelector} from 'web/store/entities/scanconfigs';
import {selector as scannersSelector} from 'web/store/entities/scanners';
import {selector as schedulesSelector} from 'web/store/entities/schedules';
import {selector as targetsSelector} from 'web/store/entities/targets';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';

interface Setting<T> {
  id?: string;
  value?: T;
  comment?: string;
}

interface DefaultSettingsProps {
  disableEditIcon?: boolean;
}

const FIELD_NAMES = [
  'defaultalert',
  'defaultesxicredential',
  'defaultopenvasscanconfig',
  'defaultopenvasscanner',
  'defaultportlist',
  'defaultsmbcredential',
  'defaultsnmpcredential',
  'defaultsshcredential',
  'defaultschedule',
  'defaulttarget',
] as const;

type FieldName = (typeof FIELD_NAMES)[number];

const ENTITY_TYPE_MAP: Record<FieldName, string> = {
  defaultalert: 'alert',
  defaultesxicredential: 'credential',
  defaultopenvasscanconfig: 'scanconfig',
  defaultopenvasscanner: 'scanner',
  defaultportlist: 'portlist',
  defaultsmbcredential: 'credential',
  defaultsnmpcredential: 'credential',
  defaultsshcredential: 'credential',
  defaultschedule: 'schedule',
  defaulttarget: 'target',
};

export const DefaultSettings = ({
  disableEditIcon = false,
}: DefaultSettingsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const defaultsSel = useShallowEqualSelector(getUserSettingsDefaults);

  const {
    getErrorMessage,
    saveSetting,
    onInteraction,
    clearErrorMessage,
    setErrorMessage,
  } = useSettingSave();

  const alerts = useShallowEqualSelector(state =>
    alertsSelector(state).getEntities(ALL_FILTER),
  );
  const creds = useShallowEqualSelector(state =>
    credentialsSelector(state).getEntities(ALL_FILTER),
  );
  const scanconfs = useShallowEqualSelector(state =>
    scanConfigsSelector(state).getEntities(ALL_FILTER),
  );
  const scanners = useShallowEqualSelector(state =>
    scannersSelector(state).getEntities(ALL_FILTER),
  );
  const ports = useShallowEqualSelector(state =>
    portListsSelector(state).getEntities(ALL_FILTER),
  );
  const scheds = useShallowEqualSelector(state =>
    schedulesSelector(state).getEntities(ALL_FILTER),
  );
  const targets = useShallowEqualSelector(state =>
    targetsSelector(state).getEntities(ALL_FILTER),
  );

  const ITEMS_MAP: Record<
    FieldName,
    {id: string; name: string; deprecated?: string}[]
  > = {
    defaultalert: alerts ?? [],
    defaultesxicredential: creds ?? [],
    defaultopenvasscanconfig: scanconfs ?? [],
    defaultopenvasscanner: scanners ?? [],
    defaultportlist: ports ?? [],
    defaultsmbcredential: creds ?? [],
    defaultsnmpcredential: creds ?? [],
    defaultsshcredential: creds ?? [],
    defaultschedule: scheds ?? [],
    defaulttarget: targets ?? [],
  };

  const LABELS: Record<FieldName, string> = {
    defaultalert: _('Default Alert'),
    defaultesxicredential: _('Default ESXi Credential'),
    defaultopenvasscanconfig: _('Default OpenVAS Scan Config'),
    defaultopenvasscanner: _('Default OpenVAS Scanner'),
    defaultportlist: _('Default Port List'),
    defaultsmbcredential: _('Default SMB Credential'),
    defaultsnmpcredential: _('Default SNMP Credential'),
    defaultsshcredential: _('Default SSH Credential'),
    defaultschedule: _('Default Schedule'),
    defaulttarget: _('Default Target'),
  };

  const editModes = useMemo(
    () =>
      FIELD_NAMES.reduce(
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
    FIELD_NAMES.forEach(name => {
      const setting: Setting<string> = defaultsSel.getByName(name) ?? {};
      setValues(value => ({
        ...value,
        [name]: (setting.value as string) || UNSET_VALUE,
      }));
    });
  }, [defaultsSel]);

  const saveField = async (key: FieldName) => {
    const setting = defaultsSel.getByName(key) as Setting<string>;
    if (!setting?.id) {
      const settingId = DEFAULT_SETTINGS[key];
      if (!settingId) {
        setErrorMessage(key, _('Cannot save setting: missing setting ID.'));
        return;
      }
      await saveSetting(settingId, key, values[key], value =>
        setIsEditing(editState => ({...editState, [key]: value})),
      );
    } else {
      await saveSetting(setting.id, key, values[key], value =>
        setIsEditing(editState => ({...editState, [key]: value})),
      );
    }
  };

  const cancelField = (key: FieldName) => {
    const setting: Setting<string> = defaultsSel.getByName(key) ?? {};
    setValues(value => ({
      ...value,
      [key]: (setting.value as string) || UNSET_VALUE,
    }));
    setIsEditing(editState => ({...editState, [key]: false}));
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
        <TableRow>
          <TableHead>{_('Setting')}</TableHead>
          <TableHead>{_('Value')}</TableHead>
          <TableHead>{_('Actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FIELD_NAMES.map(key => {
          const setting: Setting<string> = defaultsSel.getByName(key) ?? {};
          const rawItems = ITEMS_MAP[key] ?? [];
          const formattedItems = rawItems.map(item => ({
            name: item.name || item.id,
            id: item.id,
            deprecated: item.deprecated,
          }));
          const selectItems = renderSelectItems(formattedItems, UNSET_VALUE);
          const editMode = isEditing[key];
          const currentVal = values[key];
          const matched = selectItems.find(i => String(i.value) === currentVal);
          const viewLabel = matched?.label ?? '';
          const entityType = ENTITY_TYPE_MAP[key];
          const canAccess = capabilities?.mayAccess?.(entityType) ?? false;

          if (!canAccess) {
            return undefined;
          }

          return (
            <EditableSettingRow
              key={key}
              disableEditIcon={disableEditIcon}
              editComponent={
                <Select
                  items={selectItems}
                  name={key}
                  value={currentVal}
                  onChange={newValue => {
                    setValues(updatedValues => ({
                      ...updatedValues,
                      [key]: newValue,
                    }));
                    onInteraction();
                  }}
                />
              }
              errorMessage={getErrorMessage(key)}
              isEditMode={editMode}
              label={LABELS[key]}
              title={setting.comment}
              viewComponent={
                <Layout>
                  {isDefined(currentVal) && currentVal !== UNSET_VALUE ? (
                    <DetailsLink id={currentVal} type={entityType}>
                      {viewLabel}
                    </DetailsLink>
                  ) : (
                    <span>{_('None')}</span>
                  )}
                </Layout>
              }
              onCancel={() => cancelField(key)}
              onEdit={() =>
                setIsEditing(editState => ({...editState, [key]: true}))
              }
              onSave={() => saveField(key)}
            />
          );
        })}
      </TableBody>
    </StripedTable>
  );
};

export default DefaultSettings;
