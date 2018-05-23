/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

const MAX_TITLE_LENGTH = 50;

const NewDashboardDialog = ({
  onClose,
  onSave,
}) => (
  <SaveDialog
    buttonTitle={_('Add')}
    title={_('Add new Dashboard')}
    width="550px"
    minHeight={165}
    minWidth={340}
    defaultValues={{
      title: _('Unnamed'),
    }}
    onClose={onClose}
    onSave={onSave}
  >
    {({
      data,
      onValueChange,
    }) => (
      <FormGroup
        title={_('Dashboard Title')}
        titleSize={4}
      >
        <TextField
          grow
          name="title"
          maxLength={MAX_TITLE_LENGTH}
          value={data.title}
          onChange={onValueChange}
        />
      </FormGroup>
    )}
  </SaveDialog>
);

NewDashboardDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NewDashboardDialog;

// vim: set ts=2 sw=2 tw=80:
