/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DateTime from 'web/components/date/DateTime';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {getConnectionStatusLabel} from 'web/components/label/AgentsState';
import Column from 'web/components/layout/Column';
import Layout from 'web/components/layout/Layout';
import Row from 'web/components/layout/Row';
import Section from 'web/components/section/Section';

import useTranslation from 'web/hooks/useTranslation';
import useUserTimezone from 'web/hooks/useUserTimezone';
import Theme from 'web/utils/Theme';

const AgentDialogEdit = ({
  id,
  name,
  ipAddress = '',
  version = '',
  status = 'Active',
  port = 8443,
  schedulerCronTime = undefined,
  heartbeatIntervalInSeconds,
  config,
  title,
  lastContact,
  systemScanCompleted,
  configurationUpdated,
  heartbeatReceived,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  name = name || _('Unnamed');
  title = title || _('Edit Agent Details');

  const extractSchedulerCronTime = () => {
    const cronTimes = config?.agent_script_executor?.scheduler_cron_times;
    if (Array.isArray(cronTimes) && cronTimes.length > 0) {
      const firstCronTime = cronTimes[0];
      if (typeof firstCronTime === 'string' && !firstCronTime.startsWith('@')) {
        return firstCronTime;
      }
    }

    const cronConfig = config?.agent_script_executor?.scheduler_cron_time;

    if (typeof cronConfig === 'string') {
      if (cronConfig.startsWith('@')) {
        return '0 */12 * * *';
      }
      return cronConfig;
    } else if (typeof cronConfig === 'object' && cronConfig?.cron) {
      if (typeof cronConfig.cron === 'string') {
        if (cronConfig.cron.startsWith('@')) {
          return '0 */12 * * *';
        }
        return cronConfig.cron;
      } else if (Array.isArray(cronConfig.cron)) {
        const cronExpression = cronConfig.cron.find(
          cron => typeof cron === 'string' && !cron.startsWith('@'),
        );
        return cronExpression || '0 */12 * * *';
      }
    }

    return '0 */12 * * *';
  };

  const extractedSchedulerCronTime =
    schedulerCronTime ?? extractSchedulerCronTime();

  const extractedHeartbeatInterval =
    heartbeatIntervalInSeconds ?? config?.heartbeat?.interval_in_seconds ?? 300;

  const data = {
    id,
    name,
    ipAddress,
    version,
    status,
    port,
    schedulerCronTime: extractedSchedulerCronTime,
    heartbeatIntervalInSeconds: extractedHeartbeatInterval,
    lastContact,
    systemScanCompleted,
    configurationUpdated,
    heartbeatReceived,
  };

  const [userTimezone] = useUserTimezone();
  return (
    <SaveDialog
      defaultValues={{
        ...data,
        schedulerCronExpression: extractedSchedulerCronTime,
        useAdvancedCron: false,
        cronPreset: 'every-12-hours',
      }}
      title={title}
      values={{lastContact}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Column gap="md">
            <Section title={_('Basic Information')}>
              <Column gap="lg">
                <Row>
                  <Layout basis="48%">
                    <TextField
                      disabled
                      name="name"
                      title={_('Agent Name')}
                      value={state.name}
                      onChange={onValueChange}
                    />
                  </Layout>
                  <Layout basis="48%">
                    {/*
                     * TODO This should show IP type (IPv4/IPv6) or do not show at all if missing
                     */}
                    <TextField
                      disabled
                      name="ipAddress"
                      title={_('IP Address')}
                      value={state.ipAddress}
                      onChange={onValueChange}
                    />
                  </Layout>
                </Row>
                <Row>
                  <Layout basis="48%">
                    <FormGroup direction="row" gap="md" title={_('Status')}>
                      {getConnectionStatusLabel(state.status)}
                    </FormGroup>
                  </Layout>

                  <Layout basis="48%">
                    <FormGroup title={_('Last Contact')}>
                      <DateTime
                        date={state.lastContact}
                        timezone={userTimezone}
                      />
                    </FormGroup>{' '}
                  </Layout>
                </Row>
              </Column>
            </Section>

            <Section title={_('Recent Activity')}>
              <Column gap="md">
                <FormGroup title={_('Heartbeat received')}>
                  <DateTime
                    date={state.heartbeatReceived}
                    timezone={userTimezone}
                  />
                </FormGroup>

                <FormGroup
                  title={_('Configuration updated/System scan completed')}
                >
                  <DateTime
                    date={state.configurationUpdated}
                    timezone={userTimezone}
                  />
                </FormGroup>
              </Column>
            </Section>

            <Section title={_('Configuration Details')}>
              <Column gap="lg">
                {/* Port configuration */}
                <NumberField
                  disabled
                  max={65535}
                  min={1}
                  name="port"
                  title={_('Port')}
                  type="int"
                  value={state.port}
                  onChange={onValueChange}
                />

                {/* Scheduler Cron Time */}
                <FormGroup title={_('Scheduler Settings')}>
                  <Column gap="md">
                    <Checkbox
                      checked={state.useAdvancedCron}
                      name="useAdvancedCron"
                      title={_('Use advanced cron expression')}
                      onChange={onValueChange}
                    />

                    {!state.useAdvancedCron ? (
                      <Select
                        items={[
                          {
                            label: _('Every hour'),
                            value: '0 * * * *',
                          },
                          {
                            label: _('Every 2 hours'),
                            value: '0 */2 * * *',
                          },
                          {
                            label: _('Every 4 hours'),
                            value: '0 */4 * * *',
                          },
                          {
                            label: _('Every 6 hours'),
                            value: '0 */6 * * *',
                          },
                          {
                            label: _('Every 8 hours'),
                            value: '0 */8 * * *',
                          },
                          {
                            label: _('Every 12 hours'),
                            value: '0 */12 * * *',
                          },
                          {
                            label: _('Daily at midnight'),
                            value: '0 0 * * *',
                          },
                          {
                            label: _('Daily at noon'),
                            value: '0 12 * * *',
                          },
                          {
                            label: _('Daily at 6 AM and 6 PM'),
                            value: '0 6,18 * * *',
                          },
                          {
                            label: _('Weekly (Sunday at midnight)'),
                            value: '0 0 * * 0',
                          },
                          {
                            label: _('Monthly (1st day at midnight)'),
                            value: '0 0 1 * *',
                          },
                          {
                            label: _('Every 2nd day at midnight and noon'),
                            value: '0 0,12 1 */2 *',
                          },
                        ]}
                        label="Scheduler Cron Expression"
                        name="schedulerCronExpression"
                        placeholder={_('Select a schedule')}
                        title={_('Schedule')}
                        value={state.schedulerCronExpression}
                        onChange={onValueChange}
                      />
                    ) : (
                      <TextField
                        name="schedulerCronExpression"
                        placeholder="0 0,12 1 */2 *"
                        title={_('Custom Cron Expression')}
                        value={state.schedulerCronExpression}
                        onChange={onValueChange}
                      />
                    )}

                    <div
                      style={{
                        fontSize: '12px',
                        color: Theme.darkGray,
                        marginTop: '4px',
                      }}
                    >
                      {!state.useAdvancedCron ? (
                        <>
                          {_(
                            'Choose from common scheduling options above, or enable advanced mode for custom expressions.',
                          )}
                          <br />
                          {_('Current expression')}:{' '}
                          <code>{state.schedulerCronExpression}</code>
                        </>
                      ) : (
                        <>
                          {_(
                            'Enter a custom cron expression. Format: minute hour day month weekday',
                          )}
                          <br />• {_('Example')}: 0 0,12 1 */2 * (at midnight
                          and noon on the 1st day of every 2nd month)
                          <br />• {_('Minute')}: 0-59, {_('Hour')}: 0-23,{' '}
                          {_('Day')}: 1-31, {_('Month')}: 1-12, {_('Weekday')}:
                          0-7
                          <br />• * = {_('any value')}, , ={' '}
                          {_('list separator')}, - = {_('range')}, / ={' '}
                          {_('step values')}
                        </>
                      )}
                    </div>
                  </Column>
                </FormGroup>

                {/* Heartbeat Configuration */}
                <NumberField
                  min={1}
                  name="heartbeatIntervalInSeconds"
                  title={_('Heartbeat Interval (seconds)')}
                  type="int"
                  value={state.heartbeatIntervalInSeconds}
                  onChange={onValueChange}
                />
              </Column>
            </Section>
          </Column>
        );
      }}
    </SaveDialog>
  );
};

export default AgentDialogEdit;
