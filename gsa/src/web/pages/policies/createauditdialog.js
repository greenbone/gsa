/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import logger from 'gmp/log';

import {forEach, first} from 'gmp/utils/array';
import {isDefined, isArray} from 'gmp/utils/identity';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
} from 'gmp/models/task';

import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';

import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

const get_scanner = (scanners, scanner_id) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scanner_id;
  });
};

const DEFAULT_MAX_CHECKS = 4;
const DEFAULT_MAX_HOSTS = 20;
const DEFAULT_MIN_QOD = 70;

const CreateAuditDialog = ({
  add_tag = NO_VALUE,
  alert_ids = [],
  alerts = [],
  alterable = NO_VALUE,
  apply_overrides = YES_VALUE,
  auto_delete = AUTO_DELETE_NO,
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  capabilities,
  comment = '',
  //config_id = FULL_AND_FAST_SCAN_CONFIG_ID,
  config_id = undefined,
  //config_id = scan_configs[0].id,
  hosts_ordering = HOSTS_ORDERING_SEQUENTIAL,
  in_assets = YES_VALUE,
  max_checks = DEFAULT_MAX_CHECKS,
  max_hosts = DEFAULT_MAX_HOSTS,
  min_qod = DEFAULT_MIN_QOD,
  name = _('Unnamed'),
  scan_configs = [],
  scanner_id = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [
    {
      id: OPENVAS_DEFAULT_SCANNER_ID,
      scannerType: OPENVAS_SCANNER_TYPE,
    },
  ],
  schedule_id = UNSET_VALUE,
  schedule_periods = NO_VALUE,
  schedules = [],
  source_iface = '',
  tags = [],
  target_id,
  targets,
  task,
  title = _('New Audit'),
  //onAlertsChange,
  onClose,
  //onNewAlertClick,
  //onNewScheduleClick,
  onNewTargetClick,
  onSave,
  //onScanConfigChange,
  //onScannerChange,
  //onScheduleChange,
  onTargetChange,
  ...data
}) => {
  const scanner = get_scanner(scanners, scanner_id);
  const scanner_type = isDefined(scanner) ? scanner.scannerType : undefined; //scannerType

  console.log('scanner=', scanner, 'scanner type=', scanner_type);
  console.log('scan_configs=', scan_configs);

  const target_items = renderSelectItems(targets);

  const tag = tags.find(element => {
    return element.name === 'task:compliance';
  });

  console.log('tag=', tag);

  const tag_id = tag ? tag.id : undefined;

  console.log('tags=', tags, 'tag_id=', tag_id);

  // having a task means we are editing a task
  const hasTask = isDefined(task);

  const change_task = hasTask ? task.isChangeable() : true;

  /*   const showTagSelection = !hasTask && tags.length > 0;

  const tag_id = showTagSelection ? first(tags).id : undefined; */

  const uncontrolledData = {
    ...data,
    add_tag,
    alterable,
    apply_overrides,
    auto_delete,
    auto_delete_data,
    comment,
    hosts_ordering,
    in_assets,
    max_checks,
    max_hosts,
    min_qod,
    name,
    scanner_type,
    scanner_id,
    source_iface,
    tag_id,
    tags,
    task,
  };

  const controlledData = {
    alert_ids,
    config_id,
    schedule_id,
    scanner_id,
    scanner_type,
    tag_id,
    target_id,
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
                  name="target_id"
                  disabled={!change_task}
                  items={target_items}
                  value={state.target_id}
                  onChange={onTargetChange}
                />
                {change_task && (
                  <Layout>
                    <NewIcon
                      title={_('Create a new target')}
                      onClick={onNewTargetClick}
                    />
                  </Layout>
                )}
              </Divider>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

CreateAuditDialog.propTypes = {
  add_tag: PropTypes.yesno,
  alert_ids: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.yesno,
  apply_overrides: PropTypes.yesno,
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  config_id: PropTypes.idOrZero,
  hosts_ordering: PropTypes.oneOf(['sequential', 'random', 'reverse']),
  in_assets: PropTypes.yesno,
  max_checks: PropTypes.number,
  max_hosts: PropTypes.number,
  min_qod: PropTypes.number,
  name: PropTypes.string,
  scan_configs: PropTypes.arrayOf(PropTypes.model),
  scanner_id: PropTypes.idOrZero,
  scanners: PropTypes.array,
  schedule_id: PropTypes.idOrZero,
  schedule_periods: PropTypes.yesno,
  schedules: PropTypes.array,
  source_iface: PropTypes.string,
  tag_id: PropTypes.id,
  tags: PropTypes.array,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  task: PropTypes.model,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
};

export default withCapabilities(CreateAuditDialog);

// vim: set ts=2 sw=2 tw=80:
