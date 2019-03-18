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

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

const EditProcessDialog = ({
  processComment = '',
  processName = _('Unnamed'),
  onClose,
  onSave,
  onChange,
}) => {
  return (
    <SaveDialog
      buttonTitle={_('OK')}
      title={_('Edit Process Node')}
      values={{processName, processComment}}
      width="500px"
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <Layout flex="column">
          <FormGroup title={_('Name')}>
            <TextField
              name="processName"
              value={processName}
              grow="1"
              onChange={onChange}
            />
          </FormGroup>
          <FormGroup title={_('Comment')}>
            <TextField
              name="processComment"
              value={processComment}
              grow="1"
              onChange={onChange}
            />
          </FormGroup>
        </Layout>
      )}
    </SaveDialog>
  );
};

EditProcessDialog.propTypes = {
  processComment: PropTypes.string,
  processName: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditProcessDialog;

// vim: set ts=2 sw=2 tw=80:
