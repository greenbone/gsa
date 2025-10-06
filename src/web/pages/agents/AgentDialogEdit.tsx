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

import AgentConfigurationSection, {
  DEFAULT_CRON_EXPRESSION,
  DEFAULT_HEARTBEAT_INTERVAL,
} from 'web/pages/agents/components/AgentConfigurationSection';

const AgentDialogEdit = ({
  id,
  name,
  ipAddress = '',
  version = '',
  status = '',
  port = 0,
  intervalInSeconds,
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

  const extractedSchedulerCronTime =
    config?.agentScriptExecutor?.schedulerCronTimes?.[0] ??
    DEFAULT_CRON_EXPRESSION;

  const extractedHeartbeatInterval =
    intervalInSeconds ??
    config?.heartbeat?.intervalInSeconds ??
    DEFAULT_HEARTBEAT_INTERVAL;

  const data = {
    id,
    name,
    ipAddress,
    version,
    status,
    port,
    schedulerCronTime: extractedSchedulerCronTime,
    intervalInSeconds: extractedHeartbeatInterval,
    lastContact,
    systemScanCompleted,
    configurationUpdated,
    heartbeatReceived,
  };

  const defaultsKey = [
    id,
    extractedSchedulerCronTime,
    extractedHeartbeatInterval,
    ipAddress,
  ].join('|');

  const [userTimezone] = useUserTimezone();
  return (
    <SaveDialog
      key={defaultsKey}
      defaultValues={{
        ...data,
        schedulerCronExpression: extractedSchedulerCronTime,
        useAdvancedCron: false,
        intervalInSeconds: extractedHeartbeatInterval,
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
                  {state.ipAddress && (
                    <Layout basis="48%">
                      <TextField
                        disabled
                        name="ipAddress"
                        title={_('IP Address')}
                        value={state.ipAddress}
                        onChange={onValueChange}
                      />
                    </Layout>
                  )}
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
              intervalInSeconds={state.intervalInSeconds}
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
