/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {TimePicker} from '@greenbone/ui-lib';
import {
  DONT_START_VALUE,
  IMMEDIATELY_START_VALUE,
  SCHEDULE_START_VALUE,
} from 'gmp/commands/wizard';
import {
  type default as Credential,
  esxi_credential_filter,
  smb_credential_filter,
  ssh_credential_filter,
} from 'gmp/models/credential';
import type {Date} from 'gmp/models/date';
import type ScanConfig from 'gmp/models/scanconfig';
import {first} from 'gmp/utils/array';
import SaveDialog from 'web/components/dialog/SaveDialog';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextField from 'web/components/form/TextField';
import TimeZoneSelect from 'web/components/form/TimeZoneSelect';
import Column from 'web/components/layout/Column';
import Layout from 'web/components/layout/Layout';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';
import {formatSplitTime} from 'web/utils/timePickerHelpers';
import {WizardContent, WizardIcon} from 'web/wizard/TaskWizard';

type AutoStartType =
  | typeof IMMEDIATELY_START_VALUE
  | typeof SCHEDULE_START_VALUE
  | typeof DONT_START_VALUE;

interface AdvancedTaskWizardState {
  alertEmail?: string;
  autoStart: AutoStartType;
  scanConfigId: string;
  startDate: Date;
  esxiCredential?: string;
  smbCredential?: string;
  sshCredential?: string;
  sshPort: number;
  startHour: number;
  startMinute: number;
  startTimezone: string;
  targetHosts: string;
  taskName: string;
}

export type AdvancedTaskWizardData = AdvancedTaskWizardState;

interface AdvancedTaskWizardProps {
  alertEmail?: string;
  autoStart?: AutoStartType;
  credentials?: Credential[];
  esxiCredential?: string;
  scanConfigId?: string;
  scanConfigs?: ScanConfig[];
  smbCredential?: string;
  sshCredential?: string;
  sshPort?: number;
  startDate: Date;
  startHour: number;
  startMinute: number;
  startTimezone: string;
  targetHosts?: string;
  taskName?: string;
  onClose?: () => void;
  onSave?: (values: AdvancedTaskWizardData) => void;
}

const DEFAULT_SSH_PORT = 22;

const AdvancedTaskWizard = ({
  alertEmail,
  autoStart = IMMEDIATELY_START_VALUE,
  credentials = [],
  esxiCredential = '',
  scanConfigId,
  scanConfigs = [],
  smbCredential = '',
  sshCredential = '',
  sshPort = DEFAULT_SSH_PORT,
  startDate,
  startHour,
  startMinute,
  startTimezone,
  targetHosts = '',
  taskName = '',
  onClose,
  onSave,
}: AdvancedTaskWizardProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const configItems = renderSelectItems(scanConfigs as RenderSelectItemProps[]);

  const [timePickerValue, setTimePickerValue] = useState(
    formatSplitTime(startHour, startMinute),
  );
  const sshCredentialItems = renderSelectItems(
    credentials.filter(ssh_credential_filter) as RenderSelectItemProps[],
    '',
  );
  const smbCredentialItems = renderSelectItems(
    credentials.filter(smb_credential_filter) as RenderSelectItemProps[],
    '',
  );
  const esxiCredentialItems = renderSelectItems(
    credentials.filter(esxi_credential_filter) as RenderSelectItemProps[],
    '',
  );

  const data = {
    alertEmail,
    autoStart,
    scanConfigId:
      scanConfigId ?? (first<ScanConfig, ScanConfig>(scanConfigs).id as string),
    startDate,
    esxiCredential,
    smbCredential,
    sshCredential,
    sshPort,
    startHour,
    startMinute,
    startTimezone,
    targetHosts,
    taskName,
  };

  const handleTimeChange = (
    selectedValue: string,
    onValueChange: (value: number, name: string) => void,
  ) => {
    const [startHour, startMinute] = selectedValue.split(':');
    setTimePickerValue(selectedValue);
    onValueChange(parseInt(startHour), 'startHour');
    onValueChange(parseInt(startMinute), 'startMinute');
  };

  return (
    <SaveDialog<{}, AdvancedTaskWizardState>
      buttonTitle={_('Create')}
      defaultValues={data}
      title={_('Advanced Task Wizard')}
      width="900px"
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout align={['start', 'start']}>
            <WizardIcon />
            <Layout basis="35%">
              <WizardContent>
                <p>
                  <b>{_('Quick start: Create a new task')}</b>
                </p>
                <p>
                  {_(
                    'This wizard can help you by creating a new scan task and ' +
                      'automatically starting it.',
                  )}
                </p>
                <p>
                  {_(
                    'All you need to do is enter a name for the new task and' +
                      ' the IP address or host name of the target, and select a' +
                      ' scan configuration.',
                  )}
                </p>
                <p>
                  {_(
                    'You can choose, whether you want to run the scan immediately',
                  )}
                  {capabilities.mayAccess('schedule') &&
                    capabilities.mayCreate('schedule') &&
                    _(', schedule the task for a later date and time,')}
                  {_(
                    ' or just create the task so you can run it manually later.',
                  )}
                </p>
                <p>
                  {_(
                    'In order to run an authenticated scan, you have to ' +
                      'select SSH and/or SMB credentials, but you can also run ' +
                      'an unauthenticated scan by not selecting any credentials.',
                  )}
                  {capabilities.mayAccess('alert') &&
                    capabilities.mayCreate('alert') && <br />}
                  {capabilities.mayAccess('alert') &&
                    capabilities.mayCreate('alert') &&
                    _(
                      'If you enter an email address in the "Email report to"' +
                        ' field, a report of the scan will be sent to this ' +
                        'address once it is finished.',
                    )}
                </p>
                <p>
                  {_(
                    'For any other setting the defaults from ' +
                      '"My Settings" will be applied.',
                  )}
                </p>
              </WizardContent>
            </Layout>
            <Column>
              <FormGroup title={_('Task Name')}>
                <TextField
                  grow="1"
                  maxLength={80}
                  name="taskName"
                  value={state.taskName}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Scan Config')}>
                <Select
                  items={configItems}
                  name="scanConfigId"
                  value={state.scanConfigId}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Target Host(s)')}>
                <TextField
                  grow="1"
                  maxLength={2000}
                  name="targetHosts"
                  value={state.targetHosts}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Start Time')}>
                <Radio
                  checked={state.autoStart === IMMEDIATELY_START_VALUE}
                  name="autoStart"
                  title={_('Start immediately')}
                  value={IMMEDIATELY_START_VALUE}
                  onChange={onValueChange}
                />

                {capabilities?.mayCreate('schedule') &&
                  capabilities?.mayAccess('schedule') && (
                    <>
                      <Column>
                        <Radio
                          checked={state.autoStart === SCHEDULE_START_VALUE}
                          name="autoStart"
                          title={_('Create Schedule:')}
                          value={SCHEDULE_START_VALUE}
                          onChange={onValueChange}
                        />
                        <DatePicker
                          label={_('Start Date')}
                          name={'startDate'}
                          value={state.startDate}
                          onChange={onValueChange}
                        />
                        <TimePicker
                          label={_('Start Time')}
                          name="startTime"
                          value={timePickerValue}
                          onChange={selectedTime =>
                            handleTimeChange(selectedTime, onValueChange)
                          }
                        />
                      </Column>
                      <TimeZoneSelect
                        label={_('Timezone')}
                        name="startTimezone"
                        value={state.startTimezone}
                        onChange={onValueChange}
                      />
                    </>
                  )}

                <Radio
                  checked={state.autoStart === DONT_START_VALUE}
                  name="autoStart"
                  title={_('Do not start automatically')}
                  value={DONT_START_VALUE}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup direction="row" title={_('SSH Credential')}>
                <Select
                  items={sshCredentialItems}
                  name="sshCredential"
                  value={state.sshCredential}
                  onChange={onValueChange}
                />
                <span>{_(' on port ')}</span>
                <Spinner
                  max={65535}
                  min={0}
                  name="sshPort"
                  type="int"
                  value={state.sshPort}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('SMB Credential')}>
                <Select
                  items={smbCredentialItems}
                  name="smbCredential"
                  value={state.smbCredential}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('ESXi Credential')}>
                <Select
                  items={esxiCredentialItems}
                  name="esxiCredential"
                  value={state.esxiCredential}
                  onChange={onValueChange}
                />
              </FormGroup>

              {capabilities?.mayCreate('alert') &&
                capabilities?.mayAccess('alert') && (
                  <FormGroup title={_('Email report to')}>
                    <TextField
                      grow="1"
                      maxLength={80}
                      name="alertEmail"
                      value={state.alertEmail}
                      onChange={onValueChange}
                    />
                  </FormGroup>
                )}
            </Column>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

export default AdvancedTaskWizard;
