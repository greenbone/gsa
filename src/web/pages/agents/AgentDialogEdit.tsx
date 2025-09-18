/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DateTime from 'web/components/date/DateTime';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import {getConnectionStatusLabel} from 'web/components/label/AgentsState';
import Column from 'web/components/layout/Column';
import Layout from 'web/components/layout/Layout';
import Row from 'web/components/layout/Row';
import Section from 'web/components/section/Section';

import useTranslation from 'web/hooks/useTranslation';
import useUserTimezone from 'web/hooks/useUserTimezone';

import AgentConfigurationSection from 'web/pages/agents/components/AgentConfigurationSection';

const AgentDialogEdit = ({
  id,
  name,
  ipAddress = '',
  version = '',
  status = '',
  port = 0,
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

            <AgentConfigurationSection
              activeCronExpression={extractedSchedulerCronTime}
              heartbeatIntervalInSeconds={state.heartbeatIntervalInSeconds}
              port={state.port}
              schedulerCronExpression={state.schedulerCronExpression}
              useAdvancedCron={state.useAdvancedCron}
              onValueChange={onValueChange}
            />
          </Column>
        );
      }}
    </SaveDialog>
  );
};

export default AgentDialogEdit;
