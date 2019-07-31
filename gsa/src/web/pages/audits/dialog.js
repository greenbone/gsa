/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
} from 'gmp/models/audit';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import Checkbox from 'web/components/form/checkbox';
import YesNoRadio from 'web/components/form/yesnoradio';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import AddResultsToAssetsGroup from 'web/pages/tasks/addresultstoassetsgroup';
import AutoDeleteReportsGroup from 'web/pages/tasks/autodeletereportsgroup';

const AuditDialog = ({
  alertIds = [],
  alerts = [],
  alterable = NO_VALUE,
  auto_delete = AUTO_DELETE_NO,
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  capabilities,
  comment = '',
  fromPolicy = false,
  hostsOrdering = HOSTS_ORDERING_SEQUENTIAL,
  in_assets = YES_VALUE,
  maxChecks = DEFAULT_MAX_CHECKS,
  maxHosts = DEFAULT_MAX_HOSTS,
  name = _('Unnamed'),
  policies = [],
  policyId,
  scheduleId = UNSET_VALUE,
  schedulePeriods = NO_VALUE,
  schedules = [],
  sourceIface = '',
  targetId,
  targets,
  audit,
  title = _('New Audit'),
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewTargetClick,
  onSave,
  onChange,
  ...data
}) => {
  const targetItems = renderSelectItems(targets);

  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const policyItems = renderSelectItems(policies);

  const alertItems = renderSelectItems(alerts);

  // having an audit means we are editing an audit
  const hasAudit = isDefined(audit);

  const changeAudit = hasAudit ? audit.isChangeable() : true;

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
    sourceIface,
    audit,
  };

  const controlledData = {
    alertIds,
    policyId,
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
        const currentPolicyId = selectSaveId(policies, state.policyId);

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
                  <Checkbox
                    name="schedulePeriods"
                    checked={state.schedulePeriods === YES_VALUE}
                    checkedValue={YES_VALUE}
                    unCheckedValue={NO_VALUE}
                    title={_('Once')}
                    onChange={onValueChange}
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
              inAssets={state.in_assets}
              onChange={onValueChange}
            />

            {changeAudit && (
              <FormGroup title={_('Alterable Audit')}>
                <YesNoRadio
                  name="alterable"
                  disabled={audit && !audit.isNew()}
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

            <Layout flex="column" grow="1">
              <FormGroup titleSize="2" title={_('Policy')}>
                <Select
                  name="policyId"
                  disabled={!changeAudit || hasAudit || fromPolicy}
                  items={policyItems}
                  value={currentPolicyId}
                  onChange={onChange}
                />
              </FormGroup>
              <FormGroup titleSize="4" title={_('Network Source Interface')}>
                <TextField
                  name="sourceIface"
                  value={state.sourceIface}
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup titleSize="4" title={_('Order for target hosts')}>
                <Select
                  name="hostsOrdering"
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
                  value={state.hostsOrdering}
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup
                titleSize="4"
                title={_('Maximum concurrently executed NVTs per host')}
              >
                <Spinner
                  name="maxChecks"
                  size="10"
                  min="0"
                  maxLength="10"
                  value={state.maxChecks}
                  onChange={onValueChange}
                />
              </FormGroup>
              <FormGroup
                titleSize="4"
                title={_('Maximum concurrently scanned hosts')}
              >
                <Spinner
                  name="maxHosts"
                  type="int"
                  min="0"
                  size="10"
                  maxLength="10"
                  value={state.maxHosts}
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
  alterable: PropTypes.yesno,
  audit: PropTypes.model,
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  fromPolicy: PropTypes.bool,
  hostsOrdering: PropTypes.oneOf(['sequential', 'random', 'reverse']),
  in_assets: PropTypes.yesno,
  maxChecks: PropTypes.number,
  maxHosts: PropTypes.number,
  name: PropTypes.string,
  policies: PropTypes.arrayOf(PropTypes.model),
  policyId: PropTypes.idOrZero,
  scheduleId: PropTypes.idOrZero,
  schedulePeriods: PropTypes.yesno,
  schedules: PropTypes.array,
  sourceIface: PropTypes.string,
  targetId: PropTypes.idOrZero,
  targets: PropTypes.array,
  title: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func.isRequired,
  onNewScheduleClick: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default withCapabilities(AuditDialog);

// vim: set ts=2 sw=2 tw=80:
