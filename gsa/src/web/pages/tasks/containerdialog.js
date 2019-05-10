/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {YES_VALUE} from 'gmp/parser';

import {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
} from 'gmp/models/task';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';

import Layout from '../../components/layout/layout.js';

import AddResultsToAssetsGroup from './addresultstoassetsgroup.js';
import AutoDeleteReportsGroup from './autodeletereportsgroup.js';

const ContainerTaskDialog = ({
  auto_delete = AUTO_DELETE_KEEP,
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  comment = '',
  in_assets = YES_VALUE,
  name = '',
  task,
  title = _('New Container Task'),
  onClose,
  onSave,
}) => {
  const isEdit = isDefined(task);

  const data = {
    auto_delete,
    auto_delete_data,
    comment,
    in_assets,
    name,
    id: isEdit ? task.id : undefined,
  };

  return (
    <SaveDialog
      title={title}
      defaultValues={data}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            {isEdit && (
              <React.Fragment>
                <AddResultsToAssetsGroup
                  inAssets={state.in_assets}
                  onChange={onValueChange}
                />
                <AutoDeleteReportsGroup
                  autoDelete={state.auto_delete}
                  autoDeleteData={state.auto_delete_data}
                  onChange={onValueChange}
                />
              </React.Fragment>
            )}
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

ContainerTaskDialog.propTypes = {
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  comment: PropTypes.string,
  in_assets: PropTypes.yesno,
  name: PropTypes.string,
  task: PropTypes.model,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ContainerTaskDialog;

// vim: set ts=2 sw=2 tw=80:
