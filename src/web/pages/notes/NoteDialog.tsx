/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Note from 'gmp/models/note';
import {
  ANY,
  MANUAL,
  DEFAULT_DAYS,
  ACTIVE_YES_ALWAYS_VALUE,
  DEFAULT_OID_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_NO_VALUE,
  type Active,
  type AnyOrManual,
} from 'gmp/models/override';
import type Task from 'gmp/models/task';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import DateTime from 'web/components/date/DateTime';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import {
  getNvtDisplayName,
  renderNvtName,
  type RenderSelectItemProps,
  renderSelectItems,
  severityFormat,
} from 'web/utils/Render';
import {
  LOG_VALUE,
  translatedResultSeverityRiskFactor,
} from 'web/utils/severity';

interface NoteDialogDefaultValues {
  active: Active;
  days: number;
  fixed: boolean;
  hosts: AnyOrManual;
  hostsManual: string;
  oid: string;
  port: AnyOrManual;
  portManual: string;
  resultId: AnyOrManual;
  resultUuid?: string;
  resultName?: string;
  severity?: number;
  taskId: AnyOrManual;
  taskUuid?: string;
  taskName?: string;
  text: string;
}

interface NoteDialogValues {
  id?: string;
}

type NoteDialogData = NoteDialogDefaultValues & NoteDialogValues;

interface NoteDialogProps {
  active?: Active;
  days?: number;
  fixed?: boolean;
  hosts?: AnyOrManual;
  hostsManual?: string;
  id?: string;
  note?: Note;
  nvtName?: string;
  oid?: string;
  port?: AnyOrManual;
  portManual?: string;
  resultId?: AnyOrManual;
  resultName?: string;
  resultUuid?: string;
  severity?: number;
  taskId?: AnyOrManual;
  taskName?: string;
  taskUuid?: string;
  tasks?: Task[];
  text?: string;
  title?: string;
  onClose: () => void;
  onSave: (data: NoteDialogData) => void;
}

const NoteDialog = ({
  active = ACTIVE_YES_ALWAYS_VALUE,
  days = DEFAULT_DAYS,
  fixed = false,
  id,
  hosts = ANY,
  hostsManual = '',
  note,
  nvtName,
  oid,
  port = ANY,
  portManual = '',
  resultId = ANY,
  resultName,
  resultUuid,
  severity,
  taskId = ANY,
  taskName,
  tasks,
  taskUuid,
  text = '',
  title,
  onClose,
  onSave,
}: NoteDialogProps) => {
  const [_] = useTranslation();
  const isEdit = isDefined(note);

  title = title || _('New Note');

  const data = {
    severity,
    active,
    days,
    fixed,
    hosts,
    hostsManual,
    id,
    oid: oid ?? DEFAULT_OID_VALUE,
    port,
    portManual,
    resultId,
    resultUuid,
    resultName,
    taskId,
    taskUuid,
    taskName,
    text,
  };

  return (
    <SaveDialog<NoteDialogValues, NoteDialogDefaultValues>
      defaultValues={data}
      title={title}
      values={{id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            {state.fixed && isDefined(oid) && (
              <FormGroup data-testid="group-nvt-oid" title={_('NVT')}>
                <span>{renderNvtName(oid, nvtName)}</span>
              </FormGroup>
            )}
            {state.fixed && !isDefined(oid) && (
              <FormGroup data-testid="group-nvt-no-oid" title={_('NVT')}>
                <span>{renderNvtName(state.oid, nvtName)}</span>
              </FormGroup>
            )}
            {isEdit && !state.fixed && (
              <FormGroup
                data-testid="group-nvt"
                direction="column"
                title={_('NVT')}
              >
                <Radio
                  checked={state.oid === oid}
                  name="oid"
                  title={getNvtDisplayName(oid as string, nvtName)}
                  value={oid}
                  onChange={onValueChange}
                />
                <Row>
                  <Radio
                    checked={state.oid !== oid}
                    name="oid"
                    value={DEFAULT_OID_VALUE}
                    onChange={onValueChange}
                  />
                  <TextField
                    disabled={state.oid === oid}
                    name="oid"
                    value={state.oid === oid ? DEFAULT_OID_VALUE : state.oid}
                    onChange={onValueChange}
                  />
                </Row>
              </FormGroup>
            )}
            {!isEdit && !state.fixed && (
              <FormGroup title={_('NVT OID')}>
                <TextField
                  name="oid"
                  value={state.oid}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
            <FormGroup data-testid="group-active" title={_('Active')}>
              <Row>
                <Radio
                  checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                  name="active"
                  title={_('yes, always')}
                  value={ACTIVE_YES_ALWAYS_VALUE}
                  onChange={onValueChange}
                />
                {isEdit && note.isActive() && isDefined(note.endTime) && (
                  <Row>
                    <Radio
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      name="active"
                      title={_('yes, until')}
                      value={ACTIVE_YES_UNTIL_VALUE}
                      onChange={onValueChange}
                    />
                    <DateTime date={note.endTime} />
                  </Row>
                )}
              </Row>
              <Row>
                <Radio
                  checked={state.active === ACTIVE_YES_FOR_NEXT_VALUE}
                  name="active"
                  title={_('yes, for the next')}
                  value={ACTIVE_YES_FOR_NEXT_VALUE}
                  onChange={onValueChange}
                />
                <Spinner
                  disabled={state.active !== ACTIVE_YES_FOR_NEXT_VALUE}
                  min={1}
                  name="days"
                  type="int"
                  value={state.days}
                  onChange={onValueChange}
                />
                <span>{_('days')}</span>
              </Row>
              <Radio
                checked={state.active === ACTIVE_NO_VALUE}
                name="active"
                title={_('no')}
                value={ACTIVE_NO_VALUE}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup data-testid="group-hosts" title={_('Hosts')}>
              <Radio
                checked={state.hosts === ANY}
                name="hosts"
                title={_('Any')}
                value={ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.hosts === MANUAL}
                  name="hosts"
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  disabled={state.hosts !== MANUAL}
                  name="hostsManual"
                  value={state.hostsManual}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup data-testid="group-location" title={_('Location')}>
              <Radio
                checked={state.port === ANY}
                name="port"
                title={_('Any')}
                value={ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.port === MANUAL}
                  name="port"
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  disabled={state.port !== MANUAL}
                  name="portManual"
                  value={state.portManual}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup data-testid="group-severity" title={_('Severity')}>
              <Row>
                <Radio
                  checked={isEmpty(state.severity)}
                  name="severity"
                  title={_('Any')}
                  value=""
                  onChange={onValueChange}
                />
                {isDefined(severity) && (
                  <>
                    {severity > LOG_VALUE ? (
                      <Radio
                        checked={true}
                        convert={parseFloat}
                        name="severity"
                        title={' > ' + severityFormat(severity - 0.1)}
                        value={severity}
                        onChange={onValueChange}
                      />
                    ) : (
                      <Radio
                        checked={state.severity === severity}
                        convert={parseFloat}
                        name="severity"
                        title={translatedResultSeverityRiskFactor(severity)}
                        value={severity}
                        onChange={onValueChange}
                      />
                    )}
                  </>
                )}
              </Row>
              {!isDefined(severity) && (
                <>
                  <Radio
                    checked={state.severity === 0.1}
                    convert={parseFloat}
                    name="severity"
                    title={_('> 0.0')}
                    value={0.1}
                    onChange={onValueChange}
                  />
                  <Radio
                    checked={state.severity === 0.0}
                    convert={parseFloat}
                    name="severity"
                    title={_('Log')}
                    value={0.0}
                    onChange={onValueChange}
                  />
                </>
              )}
            </FormGroup>

            <FormGroup data-testid="group-task" title={_('Task')}>
              <Radio
                checked={state.taskId === ANY}
                name="taskId"
                title={_('Any')}
                value={ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.taskId === MANUAL}
                  name="taskId"
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <Select
                  disabled={state.taskId !== MANUAL}
                  items={renderSelectItems(tasks as RenderSelectItemProps[])}
                  name="taskUuid"
                  value={state.taskUuid}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup data-testid="group-result" title={_('Result')}>
              <Radio
                checked={state.resultId === ANY}
                name="resultId"
                title={_('Any')}
                value={ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.resultId === MANUAL}
                  name="resultId"
                  title={
                    state.fixed
                      ? _('Only selected result ({{- name}})', {
                          name: state.resultName as string,
                        })
                      : _('UUID')
                  }
                  value={MANUAL}
                  onChange={onValueChange}
                />
                {!fixed && (
                  <TextField
                    disabled={state.resultId !== MANUAL}
                    name="resultUuid"
                    value={state.resultUuid}
                    onChange={onValueChange}
                  />
                )}
              </Row>
            </FormGroup>

            <FormGroup title={_('Text')}>
              <TextArea
                autosize={true}
                minRows="4"
                name="text"
                value={state.text}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

export default NoteDialog;
