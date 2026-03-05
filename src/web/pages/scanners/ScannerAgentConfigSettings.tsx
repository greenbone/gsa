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
  errorKey: string;
  label: string;
  title: string;
  defaultValue: FormValue;
  getValue: (
    scanner: Scanner,
  ) => number | string | boolean | string[] | undefined;
  renderEdit: (
    value: FormValue,
    onChange: (value: FormValue) => void,
  ) => ReactNode;
  renderView: (value: FormValue) => ReactNode;
}

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
  const activeCronExpressions =
    agentDefaults?.agentScriptExecutor.schedulerCronTimes ?? [];
  const activeCronExpression = activeCronExpressions[0] ?? '';

  const [formValues, setFormValues] = useState({
    attempts: agentDefaults?.agentControl.retry.attempts ?? 0,
    delayInSeconds: agentDefaults?.agentControl.retry.delayInSeconds ?? 0,
    maxJitterInSeconds:
      agentDefaults?.agentControl.retry.maxJitterInSeconds ?? 0,
    bulkSize: agentDefaults?.agentScriptExecutor.bulkSize ?? 0,
    bulkThrottleTimeInMs:
      agentDefaults?.agentScriptExecutor.bulkThrottleTimeInMs ?? 0,
    indexerDirDepth: agentDefaults?.agentScriptExecutor.indexerDirDepth ?? 0,
    schedulerCronTimes:
      agentDefaults?.agentScriptExecutor.schedulerCronTimes ?? [],
    intervalInSeconds: agentDefaults?.heartbeat.intervalInSeconds ?? 0,
    missUntilInactive: agentDefaults?.heartbeat.missUntilInactive ?? 0,
    updateToLatest: agentControlDefaults?.updateToLatest ?? false,
  });

  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    setFormValues({
      attempts: agentDefaults?.agentControl.retry.attempts ?? 0,
      delayInSeconds: agentDefaults?.agentControl.retry.delayInSeconds ?? 0,
      maxJitterInSeconds:
        agentDefaults?.agentControl.retry.maxJitterInSeconds ?? 0,
      bulkSize: agentDefaults?.agentScriptExecutor.bulkSize ?? 0,
      bulkThrottleTimeInMs:
        agentDefaults?.agentScriptExecutor.bulkThrottleTimeInMs ?? 0,
      indexerDirDepth: agentDefaults?.agentScriptExecutor.indexerDirDepth ?? 0,
      schedulerCronTimes:
        agentDefaults?.agentScriptExecutor.schedulerCronTimes ?? [],
      intervalInSeconds: agentDefaults?.heartbeat.intervalInSeconds ?? 0,
      missUntilInactive: agentDefaults?.heartbeat.missUntilInactive ?? 0,
      updateToLatest: agentControlDefaults?.updateToLatest ?? false,
    });
  }, [agentDefaults, agentControlDefaults]);

  const updateField = (key: string, value: FormValue) => {
    setFormValues(prev => ({...prev, [key]: value}));
  };

  const setError = (field: string, message: string) => {
    setErrorMessages(prev => ({...prev, [field]: message}));
  };

  const clearError = (field: string) => {
    setErrorMessages(prev => ({...prev, [field]: ''}));
  };

  const setEditMode = (key: string, value: boolean) => {
    setEditModes(prev => ({...prev, [key]: value}));
  };

  const handleSave = async (key: string) => {
    if (!scanner.id) {
      setError(key, _('Cannot save: scanner ID is missing.'));
      return;
    }

    try {
      await modifyAgentControlConfig({
        id: scanner.id,
        ...formValues,
        updateToLatest: formValues.updateToLatest ? 1 : 0,
      });
      setEditMode(key, false);
      clearError(key);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : _('An error occurred while saving the setting, please try again.');
      setError(key, message);
    }
  };

  const handleCancel = (key: string, defaultValue: FormValue) => {
    updateField(key, defaultValue);
    setEditMode(key, false);
    clearError(key);
  };

  const renderNumberField =
    (key: string, min: number = 0) =>
    (value: FormValue, onChange: (value: FormValue) => void) => (
      <NumberField
        min={min}
        name={key}
        type="int"
        value={value as number}
        onChange={onChange as (value: number) => void}
      />
    );

  const renderCronField = (
    value: FormValue,
    onChange: (value: FormValue) => void,
  ) => {
    const cronValue = Array.isArray(value)
      ? (value[0] ?? '')
      : (value as string);
    const handleChange = (newValue: string) => {
      // Store as array with single value
      onChange([newValue]);
    };
    return (
      <SchedulerCronField
        activeCronExpression={activeCronExpression}
        name="schedulerCronTimes"
        title={_('Schedule')}
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
        title={_('Yes')}
        value={true}
        onChange={() => onChange(true)}
      />
      <Radio
        checked={value === false}
        name="updateToLatest"
        title={_('No')}
        value={false}
        onChange={() => onChange(false)}
      />
    </Row>
  );

  const sections: Array<{
    title: string;
    fields: ConfigFieldDefinition[];
  }> = [
    {
      title: _('Agent Control - Retry Settings'),
      fields: [
        {
          key: 'attempts',
          errorKey: 'attempts',
          label: _('Retry Attempts'),
          title: _('Number of retry attempts'),
          defaultValue: agentDefaults?.agentControl.retry.attempts ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.agentControl.retry.attempts,
          renderEdit: renderNumberField('attempts'),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'delayInSeconds',
          errorKey: 'delay',
          label: _('Retry Delay (seconds)'),
          title: _('Delay between retries in seconds'),
          defaultValue: agentDefaults?.agentControl.retry.delayInSeconds ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.agentControl.retry
              .delayInSeconds,
          renderEdit: renderNumberField('delayInSeconds'),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'maxJitterInSeconds',
          errorKey: 'jitter',
          label: _('Max Jitter (seconds)'),
          title: _('Maximum jitter in seconds for retry delays'),
          defaultValue:
            agentDefaults?.agentControl.retry.maxJitterInSeconds ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.agentControl.retry
              .maxJitterInSeconds,
          renderEdit: renderNumberField('maxJitterInSeconds'),
          renderView: val => <Layout>{val}</Layout>,
        },
      ],
    },
    {
      title: _('Agent Script Executor'),
      fields: [
        {
          key: 'bulkSize',
          errorKey: 'bulkSize',
          label: _('Bulk Size'),
          title: _('Bulk operation size'),
          defaultValue: agentDefaults?.agentScriptExecutor.bulkSize ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.agentScriptExecutor.bulkSize,
          renderEdit: renderNumberField('bulkSize'),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'bulkThrottleTimeInMs',
          errorKey: 'bulkThrottle',
          label: _('Bulk Throttle Time (ms)'),
          title: _('Bulk operation throttle time in milliseconds'),
          defaultValue:
            agentDefaults?.agentScriptExecutor.bulkThrottleTimeInMs ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.agentScriptExecutor
              .bulkThrottleTimeInMs,
          renderEdit: renderNumberField('bulkThrottleTimeInMs'),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'indexerDirDepth',
          errorKey: 'indexerDirDepth',
          label: _('Indexer Directory Depth'),
          title: _('Directory depth for indexer'),
          defaultValue: agentDefaults?.agentScriptExecutor.indexerDirDepth ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.agentScriptExecutor
              .indexerDirDepth,
          renderEdit: renderNumberField('indexerDirDepth'),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'schedulerCronTimes',
          errorKey: 'schedulerCron',
          label: _('Scheduler Cron Time'),
          title: _('Cron expression for scheduler'),
          defaultValue:
            agentDefaults?.agentScriptExecutor.schedulerCronTimes ?? [],
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.agentScriptExecutor
              .schedulerCronTimes,
          renderEdit: renderCronField,
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
          errorKey: 'interval',
          label: _('Interval (seconds)'),
          title: _('Heartbeat interval in seconds'),
          defaultValue: agentDefaults?.heartbeat.intervalInSeconds ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.heartbeat.intervalInSeconds,
          renderEdit: renderNumberField('intervalInSeconds', 1),
          renderView: val => <Layout>{val}</Layout>,
        },
        {
          key: 'missUntilInactive',
          errorKey: 'missUntilInactive',
          label: _('Miss Until Inactive'),
          title: _('Number of missed heartbeats until inactive'),
          defaultValue: agentDefaults?.heartbeat.missUntilInactive ?? 0,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentDefaults?.heartbeat.missUntilInactive,
          renderEdit: renderNumberField('missUntilInactive'),
          renderView: val => <Layout>{val}</Layout>,
        },
      ],
    },
    {
      title: _('Agent Control Defaults'),
      fields: [
        {
          key: 'updateToLatest',
          errorKey: 'updateToLatest',
          label: _('Update to Latest'),
          title: _('Automatically update agents to latest version'),
          defaultValue: agentControlDefaults?.updateToLatest ?? false,
          getValue: (s: Scanner) =>
            s.agentControlConfig?.agentControlDefaults?.updateToLatest,
          renderEdit: renderRadioField,
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
              <EditableSettingRow
                key={field.key}
                editComponent={field.renderEdit(
                  formValues[field.key as keyof typeof formValues],
                  (value: FormValue) => updateField(field.key, value),
                )}
                errorMessage={errorMessages[field.errorKey]}
                isEditMode={editModes[field.key] || false}
                label={field.label}
                title={field.title}
                viewComponent={field.renderView(
                  formValues[field.key as keyof typeof formValues],
                )}
                onCancel={() => handleCancel(field.key, field.defaultValue)}
                onEdit={() => setEditMode(field.key, true)}
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
