/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

const CreateProcessDialog = ({
  comment = '',
  id,
  name = _('Unnamed'),
  onClose,
  onCreate,
  onEdit,
}) => {
  const isEdit = isDefined(id);
  const title = isEdit ? _('Edit Process') : _('Create Process');
  const buttonTitle = isEdit ? _('Save') : _('Create');
  const onSave = isEdit ? onEdit : onCreate;
  return (
    <SaveDialog
      buttonTitle={buttonTitle}
      title={title}
      defaultValues={{name, comment, id}}
      width="500px"
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <Layout flex="column">
          <FormGroup title={_('Name')}>
            <TextField
              name="name"
              value={name}
              grow="1"
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Comment')}>
            <TextField
              name="comment"
              value={comment}
              grow="1"
              onChange={onValueChange}
            />
          </FormGroup>
        </Layout>
      )}
    </SaveDialog>
  );
};

CreateProcessDialog.propTypes = {
  comment: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  onEdit: PropTypes.func,
};

export default CreateProcessDialog;

// vim: set ts=2 sw=2 tw=80:
