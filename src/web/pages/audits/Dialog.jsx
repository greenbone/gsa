/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
} from 'gmp/models/audit';
import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import AddResultsToAssetsGroup from 'web/pages/tasks/AddResultsToAssetsGroup';
import AutoDeleteReportsGroup from 'web/pages/tasks/AutoDeleteReportsGroup';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';
const Title = styled.div`
  flex-grow: 1;
`;

const getScanner = (scanners, scanner_id) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scanner_id;
  });
};

const ScannerSelect = ({
  changeAudit,
  isLoading,
  scannerId,
  scanners,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Scanner')}>
      <Select
        disabled={!changeAudit}
        isLoading={isLoading}
        items={renderSelectItems(scanners)}
        name="scanner_id"
        value={scannerId}
        onChange={onChange}
      />
    </FormGroup>
  );
};

ScannerSelect.propTypes = {
  changeAudit: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  policies: PropTypes.shape({
    [OPENVAS_SCANNER_TYPE]: PropTypes.array,
  }),
  scannerId: PropTypes.id.isRequired,
  scanners: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

const AuditDialog = ({
  alertIds = [],
  alerts = [],
  alterable = NO_VALUE,
  auto_delete = AUTO_DELETE_NO,
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  comment = '',
  fromPolicy = false,
  hostsOrdering = HOSTS_ORDERING_SEQUENTIAL,
  in_assets = YES_VALUE,
  isLoadingScanners = false,
  maxChecks = DEFAULT_MAX_CHECKS,
  maxHosts = DEFAULT_MAX_HOSTS,
  name,
  policies = [],
  policyId,
  scannerId = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [
    {
      id: OPENVAS_DEFAULT_SCANNER_ID,
      scannerType: OPENVAS_SCANNER_TYPE,
    },
  ],
  scheduleId = UNSET_VALUE,
  schedulePeriods = NO_VALUE,
  schedules = [],
  targetId,
  targets,
  audit,
  title,
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewTargetClick,
  onSave,
  onScannerChange,
  onChange,
  ...data
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  title = title || _('New Audit');
  name = name || _('Unnamed');

  const targetItems = renderSelectItems(targets);

  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const policyItems = renderSelectItems(policies);

  policyId = selectSaveId(policies, policyId, undefined);

  const adjustedAlertsIds =
    alertIds.length === 1 && alertIds[0] === 0 ? [] : alertIds;

  const alertItems = renderSelectItems(alerts);

  // having an audit means we are editing an audit
  const hasAudit = isDefined(audit);

  const changeAudit = hasAudit ? audit.isChangeable() : true;

  const scanner = getScanner(scanners, scannerId);
  const scannerType = isDefined(scanner) ? scanner.scannerType : undefined;

  const uncontrolledData = {
    ...data,
    alterable,
    auto_delete,
    auto_delete_data,
    comment,
    hostsOrdering,
    in_assets,
    maxChecks,
    maxHosts,
    name,
    scannerId,
    scannerType,
    schedulePeriods,
    audit,
  };

  const controlledData = {
    alertIds: adjustedAlertsIds,
    policyId,
    scannerId,
    scannerType,
    scheduleId,
    targetId,
  };

  return (
    <SaveDialog
      defaultValues={uncontrolledData}
      title={title}
      values={controlledData}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup direction="row" title={_('Scan Targets')}>
              <Select
                disabled={!changeAudit}
                items={targetItems}
                name="targetId"
                value={state.targetId}
                onChange={onChange}
              />
              {changeAudit && (
                <NewIcon
                  title={_('Create a new target')}
                  onClick={onNewTargetClick}
                />
              )}
            </FormGroup>

            {capabilities.mayOp('get_alerts') && (
              <FormGroup direction="row" title={_('Alerts')}>
                <MultiSelect
                  items={alertItems}
                  name="alertIds"
                  value={state.alertIds}
                  onChange={onChange}
                />
                <NewIcon
                  title={_('Create a new alert')}
                  onClick={onNewAlertClick}
                />
              </FormGroup>
            )}

            {capabilities.mayOp('get_schedules') && (
              <FormGroup direction="row" title={_('Schedule')}>
                <Select
                  items={scheduleItems}
                  name="scheduleId"
                  value={state.scheduleId}
                  onChange={onChange}
                />
                <Checkbox
                  checked={state.schedulePeriods === YES_VALUE}
                  checkedValue={YES_VALUE}
                  name="schedulePeriods"
                  title={_('Once')}
                  unCheckedValue={NO_VALUE}
                  onChange={onValueChange}
                />
                <NewIcon
                  title={_('Create a new schedule')}
                  onClick={onNewScheduleClick}
                />
              </FormGroup>
            )}

            <AddResultsToAssetsGroup
              inAssets={state.in_assets}
              onChange={onValueChange}
            />

            {changeAudit && (
              <FormGroup title={_('Alterable Audit')}>
                <YesNoRadio
                  disabled={audit && !audit.isNew()}
                  name="alterable"
                  value={state.alterable}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <AutoDeleteReportsGroup
              autoDelete={state.auto_delete}
              autoDeleteData={state.auto_delete_data}
              onChange={onValueChange}
            />

            <Title
              title={
                changeAudit
                  ? null
                  : _(
                      'This setting is not alterable once the audit has been run at least once.',
                    )
              }
            >
              <ScannerSelect
                changeAudit={changeAudit}
                isLoading={isLoadingScanners}
                scannerId={state.scannerId}
                scanners={scanners}
                onChange={onScannerChange}
              />
            </Title>

            <FormGroup title={_('Policy')}>
              <Select
                disabled={!changeAudit || hasAudit || fromPolicy}
                items={policyItems}
                name="policyId"
                value={policyId}
                onChange={onChange}
              />
            </FormGroup>

            <FormGroup title={_('Order for target hosts')} titleSize="4">
              <Select
                items={[
                  {
                    value: 'sequential',
                    label: _('Sequential'),
                  },
                  {
                    value: 'random',
                    label: _('Random'),
                  },
                  {
                    value: 'reverse',
                    label: _('Reverse'),
                  },
                ]}
                name="hostsOrdering"
                value={state.hostsOrdering}
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Maximum concurrently executed NVTs per host')}>
              <Spinner
                min="0"
                name="maxChecks"
                type="int"
                value={state.maxChecks}
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Maximum concurrently scanned hosts')}>
              <Spinner
                min="0"
                name="maxHosts"
                type="int"
                value={state.maxHosts}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

AuditDialog.propTypes = {
  alertIds: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.yesno,
  audit: PropTypes.model,
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  comment: PropTypes.string,
  fromPolicy: PropTypes.bool,
  hostsOrdering: PropTypes.oneOf(['sequential', 'random', 'reverse']),
  in_assets: PropTypes.yesno,
  isLoadingScanners: PropTypes.bool,
  maxChecks: PropTypes.number,
  maxHosts: PropTypes.number,
  name: PropTypes.string,
  policies: PropTypes.arrayOf(PropTypes.model),
  policyId: PropTypes.idOrZero,
  scannerId: PropTypes.idOrZero,
  scanners: PropTypes.array,
  scheduleId: PropTypes.idOrZero,
  schedulePeriods: PropTypes.yesno,
  schedules: PropTypes.array,
  targetId: PropTypes.idOrZero,
  targets: PropTypes.array,
  title: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func.isRequired,
  onNewScheduleClick: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScannerChange: PropTypes.func.isRequired,
};

export default AuditDialog;
