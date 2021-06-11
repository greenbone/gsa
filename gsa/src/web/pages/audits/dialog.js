/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
} from 'gmp/models/audit';

import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';

import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import SaveDialog from 'web/components/dialog/savedialog';

import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import AddResultsToAssetsGroup from 'web/pages/tasks/addresultstoassetsgroup';
import AutoDeleteReportsGroup from 'web/pages/tasks/autodeletereportsgroup';
import {toBoolean} from 'web/pages/tasks/dialog';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

const getScanner = (scanners, scanner_id) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scanner_id;
  });
};

const ScannerSelect = props => {
  const {changeAudit, isLoading, scannerId, scanners, onChange} = props;

  return (
    <FormGroup title={_('Scanner')}>
      <Select
        name="scanner_id"
        value={scannerId}
        disabled={!changeAudit}
        items={renderSelectItems(scanners)}
        isLoading={isLoading}
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
  alterable = false,
  audit,
  autoDelete = false,
  autoDeleteReports = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  capabilities,
  comment = '',
  createAssets = true,
  fromPolicy = false,
  isLoadingScanners = false,
  maxConcurrentNvts = DEFAULT_MAX_CHECKS,
  maxConcurrentHosts = DEFAULT_MAX_HOSTS,
  name = _('Unnamed'),
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
  schedules = [],
  targetId,
  targets,
  title = _('New Audit'),
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewTargetClick,
  onSave,
  onScannerChange,
  onChange,
  ...data
}) => {
  const targetItems = renderSelectItems(targets);

  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const policyItems = renderSelectItems(policies);

  policyId = selectSaveId(policies, policyId, undefined);

  const alertItems = renderSelectItems(alerts);

  // having an audit means we are editing an audit
  const hasAudit = isDefined(audit);

  const changeAudit = hasAudit ? audit.isChangeable() : true;

  const scanner = getScanner(scanners, scannerId);
  const scannerType = isDefined(scanner) ? scanner.scannerType : undefined;

  const uncontrolledData = {
    ...data,
    alterable,
    autoDelete,
    autoDeleteReports,
    comment,
    createAssets,
    maxConcurrentNvts,
    maxConcurrentHosts,
    name,
    scannerId,
    scannerType,
    audit,
  };

  const controlledData = {
    alertIds,
    policyId,
    scannerId,
    scannerType,
    scheduleId,
    targetId,
  };

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                size="30"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                grow="1"
                size="30"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Scan Targets')}>
              <Divider>
                <Select
                  name="targetId"
                  disabled={!changeAudit}
                  items={targetItems}
                  value={state.targetId}
                  onChange={onChange}
                />
                {changeAudit && (
                  <Layout>
                    <NewIcon
                      title={_('Create a new target')}
                      onClick={onNewTargetClick}
                    />
                  </Layout>
                )}
              </Divider>
            </FormGroup>

            {capabilities.mayOp('get_alerts') && (
              <FormGroup title={_('Alerts')}>
                <Divider>
                  <MultiSelect
                    name="alertIds"
                    items={alertItems}
                    value={state.alertIds}
                    onChange={onChange}
                  />
                  <Layout>
                    <NewIcon
                      title={_('Create a new alert')}
                      onClick={onNewAlertClick}
                    />
                  </Layout>
                </Divider>
              </FormGroup>
            )}

            {capabilities.mayOp('get_schedules') && (
              <FormGroup title={_('Schedule')}>
                <Divider>
                  <Select
                    name="scheduleId"
                    value={state.scheduleId}
                    items={scheduleItems}
                    onChange={onChange}
                  />
                  <Layout>
                    <NewIcon
                      title={_('Create a new schedule')}
                      onClick={onNewScheduleClick}
                    />
                  </Layout>
                </Divider>
              </FormGroup>
            )}

            <AddResultsToAssetsGroup
              createAssets={state.createAssets}
              onChange={onValueChange}
            />

            {changeAudit && (
              <FormGroup title={_('Alterable Audit')}>
                <YesNoRadio
                  name="alterable"
                  disabled={audit && !audit.isNew()}
                  value={state.alterable}
                  yesValue={true}
                  noValue={false}
                  convert={toBoolean}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <AutoDeleteReportsGroup
              autoDelete={state.autoDelete}
              autoDeleteReports={state.autoDeleteReports}
              onChange={onValueChange}
            />

            <div
              title={
                changeAudit
                  ? null
                  : _(
                      'This setting is not alterable once the audit has been run at least once.',
                    )
              }
            >
              <ScannerSelect
                scanners={scanners}
                scannerId={state.scannerId}
                changeAudit={changeAudit}
                isLoading={isLoadingScanners}
                onChange={onScannerChange}
              />
            </div>

            <Layout flex="column" grow="1">
              <FormGroup titleSize="2" title={_('Policy')}>
                <Select
                  name="policyId"
                  disabled={!changeAudit || fromPolicy}
                  items={policyItems}
                  value={policyId}
                  onChange={onChange}
                />
              </FormGroup>
              <FormGroup
                titleSize="4"
                title={_('Maximum concurrently executed NVTs per host')}
              >
                <Spinner
                  name="maxConcurrentNvts"
                  size="10"
                  min="0"
                  maxLength="10"
                  value={state.maxConcurrentNvts}
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup
                titleSize="4"
                title={_('Maximum concurrently scanned hosts')}
              >
                <Spinner
                  name="maxConcurrentHosts"
                  type="int"
                  min="0"
                  size="10"
                  maxLength="10"
                  value={state.maxConcurrentHosts}
                  onChange={onValueChange}
                />
              </FormGroup>
            </Layout>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

AuditDialog.propTypes = {
  alertIds: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.bool,
  audit: PropTypes.model,
  autoDelete: PropTypes.bool,
  autoDeleteReports: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  createAssets: PropTypes.bool,
  fromPolicy: PropTypes.bool,
  isLoadingScanners: PropTypes.bool,
  maxConcurrentHosts: PropTypes.number,
  maxConcurrentNvts: PropTypes.number,
  name: PropTypes.string,
  policies: PropTypes.arrayOf(PropTypes.model),
  policyId: PropTypes.idOrZero,
  scannerId: PropTypes.idOrZero,
  scanners: PropTypes.array,
  scheduleId: PropTypes.idOrZero,
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

export default withCapabilities(AuditDialog);

// vim: set ts=2 sw=2 tw=80:
