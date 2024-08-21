/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
