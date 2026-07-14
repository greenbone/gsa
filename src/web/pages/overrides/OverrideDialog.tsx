/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type default as Override,
  type Active,
  ANY,
  MANUAL,
  ACTIVE_YES_ALWAYS_VALUE,
  DEFAULT_DAYS,
  DEFAULT_OID_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  type AnyOrManual,
} from 'gmp/models/override';
import type Task from 'gmp/models/task';
import {parseBoolean, parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import Radio from 'web/components/form/Radio';
import Select, {type SelectItem} from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ActiveFormGroup, {
  computeDaysUntil,
} from 'web/pages/overrides/ActiveFormGroup';
import {
  getNvtDisplayName,
  renderNvtName,
  type RenderSelectItemProps,
  renderSelectItems,
  severityFormat,
} from 'web/utils/Render';
import {
  FALSE_POSITIVE_VALUE,
  LOG_VALUE,
  MEDIUM_VALUE,
  LOW_VALUE,
  _FALSE_POSITIVE,
  _LOG,
  _LOW,
  _MEDIUM,
  _HIGH,
  translatedResultSeverityRiskFactor,
  _CRITICAL,
  getSeverityLevelBoundaries,
} from 'web/utils/severity';

interface OverrideDialogDefaultValues {
  active?: Active;
  customSeverity?: boolean;
  days?: number;
  hosts?: string;
  hostsManual?: string;
  newSeverity?: number;
  newSeverityFromList?: number;
  oid?: string;
  override?: Override;
  port?: string;
  portManual?: string;
  resultId?: string;
  resultUuid?: string;
  severity?: number;
  taskId?: string;
  taskName?: string;
  tasks?: Task[];
  taskUuid?: string;
  text: string;
}

interface OverrideDialogValues {
  id?: string;
}

type OverrideDialogState = OverrideDialogDefaultValues & OverrideDialogValues;

interface OverrideDialogProps {
  active?: Active;
  customSeverity?: boolean;
  days?: number;
  fixed?: boolean;
  hosts?: AnyOrManual;
  hostsManual?: string;
  id?: string;
  newSeverity?: number;
  newSeverityFromList?: number;
  nvtName?: string;
  oid?: string;
  override?: Override;
  port?: AnyOrManual;
  portManual?: string;
  resultId?: AnyOrManual;
  resultName?: string;
  resultUuid?: string;
  severity?: number;
  taskId?: AnyOrManual;
  taskName?: string;
  tasks?: Task[];
  taskUuid?: string;
  text?: string;
  title?: string;
  onClose: () => void;
  onSave: (values: OverrideDialogState) => void;
}

const OverrideDialog = ({
  active = ACTIVE_YES_ALWAYS_VALUE,
  customSeverity = false,
  days = DEFAULT_DAYS,
  fixed = false,
  hosts = ANY,
  hostsManual = '',
  id,
  newSeverity,
  newSeverityFromList = FALSE_POSITIVE_VALUE,
  nvtName,
  oid,
  override,
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
}: OverrideDialogProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const isEdit = isDefined(override);
  const severityBoundaries = getSeverityLevelBoundaries(
    gmp.settings.severityRating,
  );

  title = title || _('New Override');

  const computedDays =
    isDefined(override?.endTime) && active === ACTIVE_YES_UNTIL_VALUE
      ? computeDaysUntil(override.endTime)
      : days;

  const data = {
    active,
    customSeverity,
    days: computedDays,
    hosts,
    hostsManual,
    newSeverity,
    newSeverityFromList,
    oid: isDefined(oid) ? oid : DEFAULT_OID_VALUE,
    override,
    port,
    portManual,
    resultId,
    resultUuid,
    severity,
    taskId,
    taskName,
    tasks,
    taskUuid,
    text,
  };

  const severityFromListItems: SelectItem[] = [];

  if (isEdit) {
    severityFromListItems.push({
      label: '--',
      value: '',
    });
  }

  if (severityBoundaries.minCritical) {
    severityFromListItems.push({
      value: String(severityBoundaries.minCritical),
      label: `${_CRITICAL}`,
    });
  }

  severityFromListItems.push(
    {
      value: String(severityBoundaries.minHigh),
      label: `${_HIGH}`,
    },
    {
      value: String(MEDIUM_VALUE),
      label: `${_MEDIUM}`,
    },
    {
      value: String(LOW_VALUE),
      label: `${_LOW}`,
    },
    {
      value: String(LOG_VALUE),
      label: `${_LOG}`,
    },
    {
      value: String(FALSE_POSITIVE_VALUE),
      label: `${_FALSE_POSITIVE}`,
    },
  );

  return (
    <SaveDialog<OverrideDialogValues, OverrideDialogDefaultValues>
      defaultValues={data}
      title={title}
      values={{id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            {fixed && isDefined(oid) && (
              <FormGroup data-testid="group-nvt" title={_('NVT')}>
                <span>{renderNvtName(oid, nvtName)}</span>
              </FormGroup>
            )}
            {fixed && !isDefined(oid) && (
              <FormGroup data-testid="group-nvt" title={_('NVT')}>
                <span>{renderNvtName(state.oid as string, nvtName)}</span>
              </FormGroup>
            )}
            {isEdit && !fixed && (
              <FormGroup data-testid="group-nvt" title={_('NVT')}>
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
            {!isEdit && !fixed && (
              <FormGroup title={_('NVT OID')}>
                <TextField
                  grow="1"
                  name="oid"
                  value={state.oid}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <ActiveFormGroup
              active={state.active}
              isEdit={isEdit}
              item={override}
              onValueChange={onValueChange}
            />

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
                  grow="1"
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
                  grow="1"
                  name="portManual"
                  value={state.portManual}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup data-testid="group-severity" title={_('Severity')}>
              <Radio
                checked={isEmpty(state.severity)}
                name="severity"
                title={_('Any')}
                value=""
                onChange={onValueChange}
              />
              {isDefined(severity) && severity > 0 ? (
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
                  title={translatedResultSeverityRiskFactor(severity as number)}
                  value={severity}
                  onChange={onValueChange}
                />
              )}
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
                    checked={state.severity === 0}
                    convert={parseFloat}
                    name="severity"
                    title={_('Log')}
                    value={0}
                    onChange={onValueChange}
                  />
                </>
              )}
            </FormGroup>

            <FormGroup
              data-testid="group-new-severity"
              direction="column"
              title={_('New Severity')}
            >
              <Row>
                <Radio<boolean>
                  checked={!state.customSeverity}
                  convert={parseBoolean}
                  name="customSeverity"
                  value={false}
                  onChange={onValueChange}
                />
                <Select
                  disabled={state.customSeverity}
                  items={severityFromListItems}
                  name="newSeverityFromList"
                  value={String(state.newSeverityFromList)}
                  onChange={onValueChange}
                />
              </Row>
              <Row>
                <Radio<boolean>
                  checked={state.customSeverity}
                  convert={parseBoolean}
                  name="customSeverity"
                  title={_('Other')}
                  value={true}
                  onChange={onValueChange}
                />
                <NumberField
                  disabled={!state.customSeverity}
                  max={10}
                  min={0}
                  name="newSeverity"
                  precision={1}
                  type="float"
                  value={state.newSeverity}
                  onChange={onValueChange}
                />
              </Row>
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
                  grow="1"
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
                    isDefined(resultName)
                      ? _('Only selected result ({{- name}})', {
                          name: resultName,
                        })
                      : _('UUID')
                  }
                  value={MANUAL}
                  onChange={onValueChange}
                />
                {!fixed && (
                  <TextField
                    disabled={state.resultId !== MANUAL}
                    grow="1"
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

export default OverrideDialog;
