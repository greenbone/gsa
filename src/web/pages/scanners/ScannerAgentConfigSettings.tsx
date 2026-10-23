/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import {
  type default as Scanner,
  type AgentControlDefaults,
  type AgentControlRetry,
  type AgentScriptExecutor,
  type Heartbeat,
  type SchedulerCronEntry,
} from 'gmp/models/scanner';
import NumberField from 'web/components/form/NumberField';
import Radio from 'web/components/form/Radio';
import SchedulerCronFields from 'web/components/form/SchedulerCronFields';
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

interface ScannerConfigValues
  extends
    AgentControlRetry,
    AgentScriptExecutor,
    Heartbeat,
    AgentControlDefaults {}

type ConfigFieldKey = keyof ScannerConfigValues;
type FormValue = ScannerConfigValues[ConfigFieldKey];

const renderConfigValue = (value: FormValue): ReactNode => {
  if (Array.isArray(value)) {
    return <Layout>{value.map(entry => entry.cron).join(', ')}</Layout>;
  }

  return <Layout>{value}</Layout>;
};

const mapCronExpressionsToEntries = (
  cronTimes: string[],
  existingEntries: SchedulerCronEntry[],
): SchedulerCronEntry[] => {
  const matchedIndexes = cronTimes.map(() => -1);
  const usedIndexes = new Set<number>();

  cronTimes.forEach((cron, index) => {
    if (existingEntries[index]?.cron === cron) {
      matchedIndexes[index] = index;
      usedIndexes.add(index);
    }
  });

  cronTimes.forEach((cron, index) => {
    if (matchedIndexes[index] >= 0) {
      return;
    }

    // First, preserve delays with matching cron entries that shifted rows.
    let targetIndex = existingEntries.findIndex(
      (entry, entryIndex) =>
        entry.cron === cron && !usedIndexes.has(entryIndex),
    );

    // If the cron was edited in place, keep its delay with the same row.
    if (
      targetIndex < 0 &&
      index < existingEntries.length &&
      !usedIndexes.has(index)
    ) {
      targetIndex = index;
    }

    if (targetIndex >= 0) {
      matchedIndexes[index] = targetIndex;
      usedIndexes.add(targetIndex);
    }
  });

  return cronTimes.map((cron, index) => ({
    cron,
    maxDelaySeconds:
      existingEntries[matchedIndexes[index]]?.maxDelaySeconds ?? 0,
  }));
};

interface ConfigFieldDefinition {
  key: ConfigFieldKey;
  label: string;
  title: string;
  renderEdit: (
    values: ScannerConfigValues,
    onChange: (value: FormValue) => void,
    activeCronExpressions?: string[],
  ) => ReactNode;
  renderView: (value: FormValue) => ReactNode;
}

interface EditableConfigFieldProps {
  field: ConfigFieldDefinition;
  activeCronExpressions?: string[];
  fieldValues: ScannerConfigValues;
  editValues: Partial<ScannerConfigValues>;
  isEditMode: boolean;
  errorMessage?: string;
  onEdit: (value: FormValue) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  onChangeValue: (value: FormValue) => void;
}

const getScannerPayload = (scanner: Scanner): ScannerConfigValues => {
  const agentDefaults = scanner.agentControlConfig?.agentDefaults;
  const agentControlDefaults = scanner.agentControlConfig?.agentControlDefaults;
  const cronTimes = agentDefaults?.agentScriptExecutor.schedulerCronTimes;

  return {
    attempts: agentDefaults?.agentControl.retry.attempts ?? 0,
    delayInSeconds: agentDefaults?.agentControl.retry.delayInSeconds ?? 0,
    maxJitterInSeconds:
      agentDefaults?.agentControl.retry.maxJitterInSeconds ?? 0,
    bulkSize: agentDefaults?.agentScriptExecutor.bulkSize ?? 0,
    bulkThrottleTimeInMs:
      agentDefaults?.agentScriptExecutor.bulkThrottleTimeInMs ?? 0,
    indexerDirDepth: agentDefaults?.agentScriptExecutor.indexerDirDepth ?? 0,
    schedulerCronTimes: cronTimes ?? [],
    intervalInSeconds: agentDefaults?.heartbeat.intervalInSeconds ?? 0,
    missUntilInactive: agentDefaults?.heartbeat.missUntilInactive ?? 0,
    updateToLatest: agentControlDefaults?.updateToLatest ?? false,
  };
};

const renderNumberField = (
  key: ConfigFieldKey,
  min: number,
  value: number,
  onChange: (value: number) => void,
) => (
  <NumberField
    min={min}
    name={key}
    type="int"
    value={value}
    onChange={onChange}
  />
);

const renderCronField = (
  activeCronExpressions: string[],
  value: SchedulerCronEntry[],
  onChange: (value: SchedulerCronEntry[]) => void,
) => (
  <SchedulerCronFields
    activeCronExpressions={activeCronExpressions}
    name="schedulerCronTimes"
    value={value.map(({cron}) => cron)}
    onChange={cronTimes =>
      onChange(mapCronExpressionsToEntries(cronTimes, value))
    }
  />
);

const renderRadioField = (
  value: boolean,
  onChange: (value: boolean) => void,
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
  activeCronExpressions = [],
  fieldValues,
  editValues,
  isEditMode,
  errorMessage,
  onEdit,
  onCancel,
  onSave,
  onChangeValue,
}: EditableConfigFieldProps) => {
  const fieldValue = fieldValues[field.key];
  const displayValues = isEditMode
    ? {...fieldValues, ...editValues}
    : fieldValues;

  const editComponent = field.renderEdit(
    displayValues,
    onChangeValue,
    activeCronExpressions,
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
  const activeCronExpressions =
    agentDefaults?.agentScriptExecutor.schedulerCronTimes.map(
      ({cron}) => cron,
    ) ?? [];

  const [savedValues, setSavedValues] = useState<{
    scanner: Scanner;
    values: Partial<ScannerConfigValues>;
  }>();
  const fieldValues = {
    ...getScannerPayload(scanner),
    ...(savedValues?.scanner === scanner ? savedValues.values : {}),
  };
  const [editValues, setEditValues] = useState<Partial<ScannerConfigValues>>(
    {},
  );
  const [editModes, setEditModes] = useState<
    Partial<Record<ConfigFieldKey, boolean>>
  >({});
  const [errorMessages, setErrorMessages] = useState<
    Partial<Record<ConfigFieldKey, string>>
  >({});

  const setEditValue = (key: ConfigFieldKey, value: FormValue) => {
    setEditValues(prev => ({...prev, [key]: value}));
  };

  const handleEdit = (key: ConfigFieldKey, currentValue: FormValue) => {
    setEditValue(key, currentValue);
    setEditModes(prev => ({...prev, [key]: true}));
  };

  const handleCancel = (key: ConfigFieldKey) => {
    setEditValues(prev => {
      const next = {...prev};
      delete next[key];
      return next;
    });
    setEditModes(prev => ({...prev, [key]: false}));
    setErrorMessages(prev => ({...prev, [key]: ''}));
  };

  const handleSave = async (key: ConfigFieldKey) => {
    if (!scanner.id) {
      setErrorMessages(prev => ({
        ...prev,
        [key]: _('Cannot save: scanner ID is missing.'),
      }));
      return;
    }

    const payload = fieldValues;
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
      if (editedValue !== undefined) {
        setSavedValues(prev => ({
          scanner,
          values: {
            ...(prev?.scanner === scanner ? prev.values : {}),
            [key]: editedValue,
          },
        }));
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
          renderEdit: ({attempts}, onChange) =>
            renderNumberField('attempts', 0, attempts, onChange),
          renderView: renderConfigValue,
        },
        {
          key: 'delayInSeconds',
          label: _('Retry Delay (seconds)'),
          title: _('Delay between retries in seconds'),
          renderEdit: ({delayInSeconds}, onChange) =>
            renderNumberField('delayInSeconds', 0, delayInSeconds, onChange),
          renderView: renderConfigValue,
        },
        {
          key: 'maxJitterInSeconds',
          label: _('Max Jitter (seconds)'),
          title: _('Maximum jitter in seconds for retry delays'),
          renderEdit: ({maxJitterInSeconds}, onChange) =>
            renderNumberField(
              'maxJitterInSeconds',
              0,
              maxJitterInSeconds,
              onChange,
            ),
          renderView: renderConfigValue,
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
          renderEdit: ({bulkSize}, onChange) =>
            renderNumberField('bulkSize', 0, bulkSize, onChange),
          renderView: renderConfigValue,
        },
        {
          key: 'bulkThrottleTimeInMs',
          label: _('Bulk Throttle Time (ms)'),
          title: _('Bulk operation throttle time in milliseconds'),
          renderEdit: ({bulkThrottleTimeInMs}, onChange) =>
            renderNumberField(
              'bulkThrottleTimeInMs',
              0,
              bulkThrottleTimeInMs,
              onChange,
            ),
          renderView: renderConfigValue,
        },
        {
          key: 'indexerDirDepth',
          label: _('Indexer Directory Depth'),
          title: _('Directory depth for indexer'),
          renderEdit: ({indexerDirDepth}, onChange) =>
            renderNumberField('indexerDirDepth', 0, indexerDirDepth, onChange),
          renderView: renderConfigValue,
        },
        {
          key: 'schedulerCronTimes',
          label: _('Scheduler Cron Times'),
          title: _('Cron expressions for scheduler'),
          renderEdit: ({schedulerCronTimes}, onChange, cronExpr = []) =>
            renderCronField(cronExpr, schedulerCronTimes, onChange),
          renderView: val => {
            const displayValue = Array.isArray(val)
              ? val.map(({cron}) => cron).join(', ') || _('Not set')
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
          renderEdit: ({intervalInSeconds}, onChange) =>
            renderNumberField(
              'intervalInSeconds',
              1,
              intervalInSeconds,
              onChange,
            ),
          renderView: renderConfigValue,
        },
        {
          key: 'missUntilInactive',
          label: _('Miss Until Inactive'),
          title: _('Number of missed heartbeats until inactive'),
          renderEdit: ({missUntilInactive}, onChange) =>
            renderNumberField(
              'missUntilInactive',
              0,
              missUntilInactive,
              onChange,
            ),
          renderView: renderConfigValue,
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
          renderEdit: ({updateToLatest}, onChange) =>
            renderRadioField(updateToLatest, onChange),
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
                activeCronExpressions={activeCronExpressions}
                editValues={editValues}
                errorMessage={errorMessages[field.key]}
                field={field}
                fieldValues={fieldValues}
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
