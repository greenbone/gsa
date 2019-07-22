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

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
} from 'gmp/models/task';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Checkbox from 'web/components/form/checkbox';
import YesNoRadio from 'web/components/form/yesnoradio';
import Spinner from 'web/components/form/spinner';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import AddResultsToAssetsGroup from 'web/pages/tasks/addresultstoassetsgroup';
import AutoDeleteReportsGroup from 'web/pages/tasks/autodeletereportsgroup';

const DEFAULT_MAX_CHECKS = 4;
const DEFAULT_MAX_HOSTS = 20;

const CreateAuditDialog = ({
  alertIds = [],
  alerts = [],
  alterable = NO_VALUE,
  auto_delete = AUTO_DELETE_NO,
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  capabilities,
  comment = '',
  hostsOrdering = HOSTS_ORDERING_SEQUENTIAL,
  in_assets = YES_VALUE,
  maxChecks = DEFAULT_MAX_CHECKS,
  maxHosts = DEFAULT_MAX_HOSTS,
  name = _('Unnamed'),
  scheduleId = UNSET_VALUE,
  schedulePeriods = NO_VALUE,
  schedules = [],
  sourceIface = '',
  targetId,
  targets,
  title = _('New Audit'),
  onAlertsChange,
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewTargetClick,
  onSave,
  onScheduleChange,
  onTargetChange,
  ...data
}) => {
  const targetItems = renderSelectItems(targets);

  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const alertItems = renderSelectItems(alerts);

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
  };

  const controlledData = {
    alertIds,
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
                  items={targetItems}
                  value={state.targetId}
                  onChange={onTargetChange}
                />
                <Layout>
                  <NewIcon
                    title={_('Create a new target')}
                    onClick={onNewTargetClick}
                  />
                </Layout>
              </Divider>
            </FormGroup>

            {capabilities.mayOp('get_alerts') && (
              <FormGroup title={_('Alerts')}>
                <Divider>
                  <MultiSelect
                    name="alertIds"
                    items={alertItems}
                    value={state.alertIds}
                    onChange={onAlertsChange}
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
                    onChange={onScheduleChange}
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

            <FormGroup title={_('Alterable Audit')}>
              <YesNoRadio
                name="alterable"
                value={state.alterable}
                onChange={onValueChange}
              />
            </FormGroup>

            <AutoDeleteReportsGroup
              autoDelete={state.auto_delete}
              autoDeleteData={state.auto_delete_data}
              onChange={onValueChange}
            />

            <Layout flex="column" grow="1">
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

CreateAuditDialog.propTypes = {
  alertIds: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.yesno,
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  hostsOrdering: PropTypes.oneOf(['sequential', 'random', 'reverse']),
  in_assets: PropTypes.yesno,
  maxChecks: PropTypes.number,
  maxHosts: PropTypes.number,
  minQod: PropTypes.number,
  name: PropTypes.string,
  scheduleId: PropTypes.idOrZero,
  schedulePeriods: PropTypes.yesno,
  schedules: PropTypes.array,
  sourceIface: PropTypes.string,
  targetId: PropTypes.idOrZero,
  targets: PropTypes.array,
  title: PropTypes.string,
  onAlertsChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func.isRequired,
  onNewScheduleClick: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScheduleChange: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
};

export default withCapabilities(CreateAuditDialog);

// vim: set ts=2 sw=2 tw=80:
