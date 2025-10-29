/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date as GmpDate} from 'gmp/models/date';
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

import AgentConfigurationSection, {
  DEFAULT_CRON_EXPRESSION,
  DEFAULT_HEARTBEAT_INTERVAL,
} from 'web/pages/agents/components/AgentConfigurationSection';

interface AgentDialogDefaultValues {
  comment?: string;
  id?: string;
  intervalInSeconds: number;
  ipAddress: string;
  name: string;
  port: number;
  schedulerCronExpression?: string;
  useAdvancedCron?: boolean;
}

export type AgentDialogState = AgentDialogDefaultValues;

interface AgentDialogProps {
  comment?: string;
  configurationUpdated?: GmpDate;
  heartbeatReceived?: GmpDate;
  id?: string;
  intervalInSeconds?: number;
  ipAddress?: string;
  lastContact?: GmpDate;
  name?: string;
  port?: number;
  schedulerCronTime?: string;
  status?: string;
  title?: string;
  onClose: () => void;
  onSave: (values: AgentDialogState) => void | Promise<void>;
}

const AgentDialog = ({
  comment,
  configurationUpdated,
  heartbeatReceived,
  id,
  intervalInSeconds = DEFAULT_HEARTBEAT_INTERVAL,
  ipAddress = '',
  lastContact,
  name,
  port = 0,
  schedulerCronTime = DEFAULT_CRON_EXPRESSION,
  status = '',
  title,
  onClose,
  onSave,
}: AgentDialogProps) => {
  const [_] = useTranslation();
  name = name || _('Unnamed');
  title = title || _('Edit Agent Details');
  return (
    <SaveDialog<{}, AgentDialogDefaultValues>
      defaultValues={{
        comment,
        id,
        intervalInSeconds,
        schedulerCronExpression: schedulerCronTime,
        ipAddress,
        name,
        port,
        useAdvancedCron: false,
      }}
      title={title}
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
                      {getConnectionStatusLabel(status)}
                    </FormGroup>
                  </Layout>

                  <Layout basis="48%">
                    <FormGroup title={_('Last Contact')}>
                      <DateTime date={lastContact} />
                    </FormGroup>{' '}
                  </Layout>
                </Row>
              </Column>
            </Section>

            <Section title={_('Recent Activity')}>
              <Column gap="md">
                <FormGroup title={_('Heartbeat received')}>
                  <DateTime date={heartbeatReceived} />
                </FormGroup>

                <FormGroup
                  title={_('Configuration updated/System scan completed')}
                >
                  <DateTime date={configurationUpdated} />
                </FormGroup>
              </Column>
            </Section>

            <AgentConfigurationSection
              activeCronExpression={schedulerCronTime}
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

export default AgentDialog;
