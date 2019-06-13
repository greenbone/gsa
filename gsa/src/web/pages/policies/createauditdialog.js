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

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

const CreateAuditDialog = ({
  comment = '',
  name = _('Unnamed'),
  target_id,
  targets,
  title = _('New Audit'),
  onClose,
  onNewTargetClick,
  onSave,
  onTargetChange,
  ...data
}) => {
  const target_items = renderSelectItems(targets);

  const uncontrolledData = {
    ...data,
    comment,
    name,
  };

  const controlledData = {
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
                  items={target_items}
                  value={state.target_id}
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
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

CreateAuditDialog.propTypes = {
  // add_tag: PropTypes.yesno,
  // alert_ids: PropTypes.array,
  // alerts: PropTypes.array,
  // alterable: PropTypes.yesno,
  // apply_overrides: PropTypes.yesno,
  // auto_delete: PropTypes.oneOf(['keep', 'no']),
  // auto_delete_data: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  // config_id: PropTypes.idOrZero,
  // hosts_ordering: PropTypes.oneOf(['sequential', 'random', 'reverse']),
  // in_assets: PropTypes.yesno,
  // max_checks: PropTypes.number,
  // max_hosts: PropTypes.number,
  // min_qod: PropTypes.number,
  name: PropTypes.string,
  // scan_configs: PropTypes.arrayOf(PropTypes.model),
  // scanner_id: PropTypes.idOrZero,
  // scanners: PropTypes.array,
  // schedule_id: PropTypes.idOrZero,
  // schedule_periods: PropTypes.yesno,
  // schedules: PropTypes.array,
  // source_iface: PropTypes.string,
  // tag_id: PropTypes.id,
  // tags: PropTypes.array,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  // task: PropTypes.model,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
};

export default withCapabilities(CreateAuditDialog);

// vim: set ts=2 sw=2 tw=80:
