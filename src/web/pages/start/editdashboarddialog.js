/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import PropTypes from 'web/utils/proptypes';

import {MAX_TITLE_LENGTH} from './newdashboarddialog';

const EditDashboardDialog = ({
  dashboardId,
  dashboardTitle,
  onClose,
  onSave,
}) => (
  <SaveDialog
    title={_('Edit Dashboard')}
    width="550px"
    minHeight={165}
    minWidth={340}
    defaultValues={{
      dashboardId,
      dashboardTitle,
    }}
    onClose={onClose}
    onSave={onSave}
  >
    {({values, onValueChange}) => (
      <React.Fragment>
        <FormGroup title={_('Dashboard Title')} titleSize={4}>
          <TextField
            grow
            name="dashboardTitle"
            maxLength={MAX_TITLE_LENGTH}
            value={values.dashboardTitle}
            onChange={onValueChange}
          />
        </FormGroup>
      </React.Fragment>
    )}
  </SaveDialog>
);

EditDashboardDialog.propTypes = {
  dashboardId: PropTypes.id.isRequired,
  dashboardTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditDashboardDialog;

// vim: set ts=2 sw=2 tw=80:
