/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date as GmpDate} from 'gmp/models/date';
import DateTime from 'web/components/date/DateTime';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import MultiValueTextField from 'web/components/form/MultiValueTextField';
import TextField from 'web/components/form/TextField';
import ComponentWithInfoTip from 'web/components/info-tip/ComponentWithInfoTip';
import {getConnectionStatusLabel} from 'web/components/label/AgentsStateLabel';
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
  excludedPaths?: string[];
  id?: string;
  intervalInSeconds: number;
  ipAddress: string;
  name: string;
  port: number;
  schedulerCronExpression?: string;
  updateToLatest?: boolean;
}

export type AgentDialogState = AgentDialogDefaultValues;

interface AgentDialogProps {
  comment?: string;
  configurationUpdated?: GmpDate;
  excludedPaths?: string[];
  heartbeatReceived?: GmpDate;
  id?: string;
  intervalInSeconds?: number;
  ipAddress?: string;
  lastContact?: GmpDate;
  name?: string;
  port?: number;
  status?: string;
  title?: string;
  updateToLatest?: boolean;
  onClose: () => void;
  onSave: (values: AgentDialogState) => void | Promise<void>;
}

const AgentDialog = ({
  comment,
  configurationUpdated,
  excludedPaths,
  heartbeatReceived,
  id,
  intervalInSeconds = DEFAULT_HEARTBEAT_INTERVAL,
  ipAddress = '',
  lastContact,
  name,
  port = 0,
  status = '',
  title,
  updateToLatest,
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
        excludedPaths,
        id,
        intervalInSeconds,
        ipAddress,
        name,
        port,
        updateToLatest: updateToLatest ?? false,
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
              activeCronExpression={DEFAULT_CRON_EXPRESSION}
              hideSchedulerCronField={true}
              intervalInSeconds={state.intervalInSeconds}
              port={state.port}
              schedulerCronExpression={state.schedulerCronExpression}
              onValueChange={onValueChange}
            >
              <ComponentWithInfoTip
                helpAriaLabel={_('More information about excluded paths')}
                helpContent={_(
                  'Paths must be absolute. Files and directories are supported. Excluding a directory also excludes its descendants. Nonexistent absolute paths are allowed. Invalid paths are ignored. Wildcards are not supported.',
                )}
                slot={
                  <MultiValueTextField
                    name="excludedPaths"
                    title={_('Excluded paths')}
                    value={state.excludedPaths ?? []}
                    onChange={onValueChange}
                  />
                }
              />
            </AgentConfigurationSection>

            <Column gap="md">
              <FormGroup title={_('Automatic Update Settings')}>
                <Checkbox
                  checked={state.updateToLatest}
                  name="updateToLatest"
                  title={_('Enable automatic updates')}
                  onChange={onValueChange}
                />
              </FormGroup>
            </Column>
          </Column>
        );
      }}
    </SaveDialog>
  );
};

export default AgentDialog;
