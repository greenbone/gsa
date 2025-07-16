/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState, useMemo} from 'react';

import {YES_VALUE, NO_VALUE, parseYesNo, YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

import Checkbox from 'web/components/form/Checkbox';
import Spinner from 'web/components/form/Spinner';

import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';

import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import EditableSettingRow from 'web/pages/user-settings/EditableSettingRow';
import useSettingSave from 'web/pages/user-settings/useSettingSave';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

interface SeveritySettingsProps {
  disableEditIcon?: boolean;
}

const SeveritySettings = ({disableEditIcon = false}: SeveritySettingsProps) => {
  const [_] = useTranslation();

  const {
    getErrorMessage,
    saveSetting,
    onInteraction,
    clearErrorMessage,
    setErrorMessage,
  } = useSettingSave();

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);

  const defaultSeverity = useMemo(
    () => userDefaultsSelector.getByName('defaultseverity') ?? {},
    [userDefaultsSelector],
  );
  const dynamicSeverity = useMemo(
    () => userDefaultsSelector.getByName('dynamicseverity') ?? {},
    [userDefaultsSelector],
  );

  const [dynamicSeverityEditMode, setDynamicSeverityEditMode] = useState(false);
  const [dynamicSeverityState, setDynamicSeverityState] =
    useState<YesNo>(NO_VALUE);
  const [defaultSeverityEditMode, setDefaultSeverityEditMode] = useState(false);
  const [defaultSeverityState, setDefaultSeverityState] = useState<
    string | number
  >('');

  useEffect(() => {
    if (dynamicSeverity?.value) {
      setDynamicSeverityState(dynamicSeverity.value as YesNo);
    }
  }, [dynamicSeverity]);

  useEffect(() => {
    if (defaultSeverity?.value) {
      setDefaultSeverityState(defaultSeverity.value);
    }
  }, [defaultSeverity]);

  const getYesNoValue = (setting?: string | number): string => {
    if (!isDefined(setting)) {
      return '';
    }
    return parseYesNo(String(setting)) === YES_VALUE ? _('Yes') : _('No');
  };

  const dynamicSeverityValue = getYesNoValue(dynamicSeverity.value);

  const toggleDynamicSeverityEditMode = (): void => {
    setDynamicSeverityEditMode(!dynamicSeverityEditMode);
    onInteraction();
  };

  const saveDynamicSeverity = async (): Promise<void> => {
    if (!dynamicSeverity?.id) {
      setErrorMessage(
        'dynamicSeverity',
        _('Cannot save dynamic severity: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      dynamicSeverity.id,
      'dynamicSeverity',
      String(dynamicSeverityState),
      setDynamicSeverityEditMode,
    );
  };

  const cancelDynamicSeverityEdit = (): void => {
    setDynamicSeverityState((dynamicSeverity.value as YesNo) ?? NO_VALUE);
    setDynamicSeverityEditMode(false);
    clearErrorMessage('dynamicSeverity');
    onInteraction();
  };

  const handleDynamicSeverityChange = (value: YesNo): void => {
    setDynamicSeverityState(value);
    onInteraction();
  };

  const toggleDefaultSeverityEditMode = (): void => {
    setDefaultSeverityEditMode(!defaultSeverityEditMode);
    onInteraction();
  };

  const saveDefaultSeverity = async (): Promise<void> => {
    if (!defaultSeverity?.id) {
      setErrorMessage(
        'defaultSeverity',
        _('Cannot save default severity: missing setting ID.'),
      );
      return;
    }
    await saveSetting(
      defaultSeverity.id,
      'defaultSeverity',
      String(defaultSeverityState),
      setDefaultSeverityEditMode,
    );
  };

  const cancelDefaultSeverityEdit = (): void => {
    setDefaultSeverityState(defaultSeverity.value ?? '');
    setDefaultSeverityEditMode(false);
    clearErrorMessage('defaultSeverity');
    onInteraction();
  };

  const handleDefaultSeverityChange = (value: string | number): void => {
    setDefaultSeverityState(value);
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
        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <Checkbox<YesNo>
              checked={dynamicSeverityState === YES_VALUE}
              checkedValue={YES_VALUE}
              name="dynamicSeverity"
              title={_('Dynamic Severity')}
              unCheckedValue={NO_VALUE}
              onChange={handleDynamicSeverityChange}
            />
          }
          errorMessage={getErrorMessage('dynamicSeverity')}
          isEditMode={dynamicSeverityEditMode}
          label={_('Dynamic Severity')}
          title={dynamicSeverity.comment}
          viewComponent={<span>{dynamicSeverityValue}</span>}
          onCancel={cancelDynamicSeverityEdit}
          onEdit={toggleDynamicSeverityEditMode}
          onSave={saveDynamicSeverity}
        />
        <EditableSettingRow
          disableEditIcon={disableEditIcon}
          editComponent={
            <Spinner
              max={10}
              min={0}
              name="defaultSeverity"
              precision={1}
              step={0.1}
              type="float"
              value={defaultSeverityState as number}
              onChange={handleDefaultSeverityChange}
            />
          }
          errorMessage={getErrorMessage('defaultSeverity')}
          isEditMode={defaultSeverityEditMode}
          label={_('Default Severity')}
          title={defaultSeverity.comment}
          viewComponent={<span>{defaultSeverity.value}</span>}
          onCancel={cancelDefaultSeverityEdit}
          onEdit={toggleDefaultSeverityEditMode}
          onSave={saveDefaultSeverity}
        />
      </TableBody>
    </StripedTable>
  );
};

export default SeveritySettings;
