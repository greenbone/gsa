/* Copyright (C) 2017-2022 Greenbone AG
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

import {isDefined} from 'gmp/utils/identity';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

import AddResultsToAssetsGroup from './addresultstoassetsgroup';

const ContainerTaskDialog = ({
  comment = '',
  in_assets = YES_VALUE,
  name = '',
  task,
  title,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const isEdit = isDefined(task);

  title = title || _('New Container Task');

  const data = {
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

            {isEdit && (
              <AddResultsToAssetsGroup
                inAssets={state.in_assets}
                onChange={onValueChange}
              />
            )}
          </>
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
