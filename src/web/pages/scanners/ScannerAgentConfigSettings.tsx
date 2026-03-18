/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useEffect, useState} from 'react';
import type Scanner from 'gmp/models/scanner';
import NumberField from 'web/components/form/NumberField';
import Radio from 'web/components/form/Radio';
import SchedulerCronField from 'web/components/form/SchedulerCronField';
import Column from 'web/components/layout/Column';
import Layout from 'web/components/layout/Layout';
import Row from 'web/components/layout/Row';
import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {useModifyScannerAgentControlConfig} from 'web/hooks/use-query/scanner';
import useTranslation from 'web/hooks/useTranslation';
import EditableSettingRow from 'web/pages/user-settings/EditableSettingRow';

interface ScannerAgentConfigSettingsProps {
  scanner: Scanner;
  onChanged?: () => void;
  onError: (error: Error) => void;
}

type FormValue = number | string | string[] | boolean;

interface ConfigFieldDefinition {
  key: string;
  label: string;
  title: string;
  getValue: (scanner: Scanner) => FormValue;
  renderEdit: (
    value: FormValue,
    onChange: (value: FormValue) => void,
    activeCronExpression?: string,
  ) => ReactNode;
  renderView: (value: FormValue) => ReactNode;
}

interface EditableConfigFieldProps {
  field: ConfigFieldDefinition;
  activeCronExpression?: string;
  fieldValue: FormValue;
  editValue: FormValue | undefined;
  isEditMode: boolean;
  errorMessage?: string;
  onEdit: (value: FormValue) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  onChangeValue: (value: FormValue) => void;
}

const getScannerPayload = (scanner: Scanner) => {
  const agentDefaults = scanner.agentControlConfig?.agentDefaults;
  const agentControlDefaults = scanner.agentControlConfig?.agentControlDefaults;
  const cronTimes = agentDefaults?.agentScriptExecutor.schedulerCronTimes;
  const firstCronTime =
    Array.isArray(cronTimes) && cronTimes.length > 0 ? cronTimes[0] : undefined;

  return {
    attempts: agentDefaults?.agentControl.retry.attempts ?? 0,
    delayInSeconds: agentDefaults?.agentControl.retry.delayInSeconds ?? 0,
    maxJitterInSeconds:
      agentDefaults?.agentControl.retry.maxJitterInSeconds ?? 0,
    bulkSize: agentDefaults?.agentScriptExecutor.bulkSize ?? 0,
    bulkThrottleTimeInMs:
      agentDefaults?.agentScriptExecutor.bulkThrottleTimeInMs ?? 0,
    indexerDirDepth: agentDefaults?.agentScriptExecutor.indexerDirDepth ?? 0,
    schedulerCronTimes: firstCronTime ? [firstCronTime] : [],
    intervalInSeconds: agentDefaults?.heartbeat.intervalInSeconds ?? 0,
    missUntilInactive: agentDefaults?.heartbeat.missUntilInactive ?? 0,
    updateToLatest: agentControlDefaults?.updateToLatest ?? false,
  };
};

const renderNumberField = (
  key: string,
  min: number,
  value: FormValue,
  onChange: (value: FormValue) => void,
) => (
  <NumberField
    min={min}
    name={key}
    type="int"
    value={value as number}
    onChange={onChange as (value: number) => void}
  />
);

const renderCronField = (
  activeCronExpression: string,
  value: FormValue,
  onChange: (value: FormValue) => void,
) => {
  const cronValue = Array.isArray(value) ? (value[0] ?? '') : (value as string);
  const handleChange = (newValue: string) => {
    // Store as array with single value
    onChange([newValue]);
  };
  return (
    <SchedulerCronField
      activeCronExpression={activeCronExpression}
      name="schedulerCronTimes"
      title=""
      value={cronValue}
      onChange={handleChange}
    />
  );
};

const renderRadioField = (
  value: FormValue,
  onChange: (value: FormValue) => void,
) => (
  <Row gap="md">
    <Radio
      checked={value === true}
      name="updateToLatest"
      title="Yes"
      value={true}
      onChange={() => onChange(true)}
    />
    <Radio
      checked={value === false}
      name="updateToLatest"
      title="No"
      value={false}
      onChange={() => onChange(false)}
    />
  </Row>
);

const EditableConfigField = ({
  field,
  activeCronExpression = '',
  fieldValue,
  editValue,
  isEditMode,
  errorMessage,
  onEdit,
  onCancel,
  onSave,
  onChangeValue,
}: EditableConfigFieldProps) => {
  const displayValue = isEditMode ? (editValue ?? fieldValue) : fieldValue;

  const editComponent = field.renderEdit(
    displayValue,
    onChangeValue,
    activeCronExpression,
  );

  return (
    <EditableSettingRow
      editComponent={editComponent}
      errorMessage={errorMessage}
      isEditMode={isEditMode}
      label={field.label}
      title={field.title}
      viewComponent={field.renderView(fieldValue)}
      onCancel={onCancel}
      onEdit={() => onEdit(fieldValue)}
      onSave={onSave}
    />
  );
};

const ScannerAgentConfigSettings = ({
  scanner,
  onChanged,
  onError,
}: ScannerAgentConfigSettingsProps) => {
  const [_] = useTranslation();

  const {mutateAsync: modifyAgentControlConfig} =
    useModifyScannerAgentControlConfig({
      onSuccess: onChanged,
      onError: error => onError(new Error(error.message)),
    });

  const agentDefaults = scanner.agentControlConfig?.agentDefaults;
  const agentControlDefaults = scanner.agentControlConfig?.agentControlDefaults;
  const activeCronExpression =
    agentDefaults?.agentScriptExecutor.schedulerCronTimes?.[0] ?? '';

  // Persistent state for field values (synced with scanner prop via useEffect)
  const [fieldValues, setFieldValues] = useState<Record<string, FormValue>>({});
  const [editValues, setEditValues] = useState<Record<string, FormValue>>({});
  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
    {},
  );

  // Sync field values with scanner prop when it changes
  useEffect(() => {
    const cronTimes = agentDefaults?.agentScriptExecutor.schedulerCronTimes;
    const firstCronTime =
      Array.isArray(cronTimes) && cronTimes.length > 0
        ? cronTimes[0]
        : undefined;

    setFieldValues({
      attempts: agentDefaults?.agentControl.retry.attempts ?? 0,
      delayInSeconds: agentDefaults?.agentControl.retry.delayInSeconds ?? 0,
      maxJitterInSeconds:
        agentDefaults?.agentControl.retry.maxJitterInSeconds ?? 0,
      bulkSize: agentDefaults?.agentScriptExecutor.bulkSize ?? 0,
      bulkThrottleTimeInMs:
        agentDefaults?.agentScriptExecutor.bulkThrottleTimeInMs ?? 0,
      indexerDirDepth: agentDefaults?.agentScriptExecutor.indexerDirDepth ?? 0,
      schedulerCronTimes: firstCronTime ? [firstCronTime] : [],
      intervalInSeconds: agentDefaults?.heartbeat.intervalInSeconds ?? 0,
      missUntilInactive: agentDefaults?.heartbeat.missUntilInactive ?? 0,
      updateToLatest: agentControlDefaults?.updateToLatest ?? false,
    });
  }, [
    agentDefaults?.agentControl.retry.attempts,
    agentDefaults?.agentControl.retry.delayInSeconds,
    agentDefaults?.agentControl.retry.maxJitterInSeconds,
    agentDefaults?.agentScriptExecutor.bulkSize,
    agentDefaults?.agentScriptExecutor.bulkThrottleTimeInMs,
    agentDefaults?.agentScriptExecutor.indexerDirDepth,
    agentDefaults?.agentScriptExecutor.schedulerCronTimes,
    agentDefaults?.heartbeat.intervalInSeconds,
    agentDefaults?.heartbeat.missUntilInactive,
    agentControlDefaults?.updateToLatest,
  ]);

  const setEditValue = (key: string, value: FormValue) => {
    setEditValues(prev => ({...prev, [key]: value}));
  };

  const handleEdit = (key: string, currentValue: FormValue) => {
    setEditValue(key, currentValue);
    setEditModes(prev => ({...prev, [key]: true}));
  };

  const handleCancel = (key: string) => {
    setEditValues(prev => {
      const next = {...prev};
      delete next[key];
      return next;
    });
    setEditModes(prev => ({...prev, [key]: false}));
    setErrorMessages(prev => ({...prev, [key]: ''}));
  };

  const handleSave = async (key: string) => {
    if (!scanner.id) {
      setErrorMessages(prev => ({
        ...prev,
        [key]: _('Cannot save: scanner ID is missing.'),
      }));
      return;
    }

    const payload = getScannerPayload(scanner);
    const editedValue = editValues[key];
    const updateToLatest =
      key === 'updateToLatest' ? editedValue : payload.updateToLatest;

    try {
      await modifyAgentControlConfig({
        id: scanner.id,
        ...payload,
        [key]: editedValue,
        updateToLatest: updateToLatest ? 1 : 0,
      });
      // Update field state with the saved value
      if (editedValue !== undefined) {
        setFieldValues(prev => ({...prev, [key]: editedValue}));
      }
      handleCancel(key);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : _('An error occurred while saving the setting, please try again.');
      setErrorMessages(prev => ({...prev, [key]: message}));
    }
  };

  const sections: Array<{
    title: string;
    fields: ConfigFieldDefinition[];
  }> = [
    {
      title: _('Agent Control - Retry Settings'),
      fields: [
        {
          key: 'attempts',
          label: _('Retry Attempts'),
          title: _('Number of retry attempts'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.agentControl.retry
              .attempts ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('attempts', 0, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'delayInSeconds',
          label: _('Retry Delay (seconds)'),
          title: _('Delay between retries in seconds'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.agentControl.retry
              .delayInSeconds ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('delayInSeconds', 0, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'maxJitterInSeconds',
          label: _('Max Jitter (seconds)'),
          title: _('Maximum jitter in seconds for retry delays'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.agentControl.retry
              .maxJitterInSeconds ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('maxJitterInSeconds', 0, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
      ],
    },
    {
      title: _('Agent Script Executor'),
      fields: [
        {
          key: 'bulkSize',
          label: _('Bulk Size'),
          title: _('Bulk operation size'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.agentScriptExecutor
              .bulkSize ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('bulkSize', 0, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'bulkThrottleTimeInMs',
          label: _('Bulk Throttle Time (ms)'),
          title: _('Bulk operation throttle time in milliseconds'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.agentScriptExecutor
              .bulkThrottleTimeInMs ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('bulkThrottleTimeInMs', 0, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'indexerDirDepth',
          label: _('Indexer Directory Depth'),
          title: _('Directory depth for indexer'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.agentScriptExecutor
              .indexerDirDepth ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('indexerDirDepth', 0, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'schedulerCronTimes',
          label: _('Scheduler Cron Time'),
          title: _('Cron expression for scheduler'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.agentScriptExecutor
              .schedulerCronTimes ?? [],
          renderEdit: (value, onChange, cronExpr = '') =>
            renderCronField(cronExpr, value, onChange),
          renderView: val => {
            const displayValue = Array.isArray(val)
              ? val.join(', ') || _('Not set')
              : _('Not set');
            return <Layout>{displayValue}</Layout>;
          },
        },
      ],
    },
    {
      title: _('Heartbeat'),
      fields: [
        {
          key: 'intervalInSeconds',
          label: _('Interval (seconds)'),
          title: _('Heartbeat interval in seconds'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.heartbeat
              .intervalInSeconds ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('intervalInSeconds', 1, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'missUntilInactive',
          label: _('Miss Until Inactive'),
          title: _('Number of missed heartbeats until inactive'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentDefaults?.heartbeat
              .missUntilInactive ?? 0,
          renderEdit: (value, onChange) =>
            renderNumberField('missUntilInactive', 0, value, onChange),
          renderView: val => <Layout>{val}</Layout>,
        },
      ],
    },
    {
      title: _('Agent Control Defaults'),
      fields: [
        {
          key: 'updateToLatest',
          label: _('Update to Latest'),
          title: _('Automatically update agents to latest version'),
          getValue: (scanner: Scanner) =>
            scanner.agentControlConfig?.agentControlDefaults?.updateToLatest ??
            false,
          renderEdit: (value, onChange) => renderRadioField(value, onChange),
          renderView: val => (
            <Layout>{val === true ? _('Yes') : _('No')}</Layout>
          ),
        },
      ],
    },
  ];

  return (
    <Column gap="lg">
      {sections.map(section => (
        <StripedTable key={section.title}>
          <colgroup>
            <col width="30%" />
            <col width="55%" />
            <col width="15%" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>{section.title}</TableHead>
              <TableHead />
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.fields.map(field => (
              <EditableConfigField
                key={field.key}
                activeCronExpression={activeCronExpression}
                editValue={editValues[field.key]}
                errorMessage={errorMessages[field.key]}
                field={field}
                fieldValue={fieldValues[field.key] ?? field.getValue(scanner)}
                isEditMode={editModes[field.key] ?? false}
                onCancel={() => handleCancel(field.key)}
                onChangeValue={value => setEditValue(field.key, value)}
                onEdit={value => handleEdit(field.key, value)}
                onSave={() => handleSave(field.key)}
              />
            ))}
          </TableBody>
        </StripedTable>
      ))}
    </Column>
  );
};

export default ScannerAgentConfigSettings;
