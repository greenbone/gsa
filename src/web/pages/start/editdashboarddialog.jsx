/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

import {MAX_TITLE_LENGTH} from './newdashboarddialog';

const EditDashboardDialog = ({
  dashboardId,
  dashboardTitle,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  return (
    <SaveDialog
      title={_('Edit Dashboard')}
      defaultValues={{
        dashboardId,
        dashboardTitle,
      }}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <FormGroup title={_('Dashboard Title')}>
          <TextField
            grow="1"
            name="dashboardTitle"
            maxLength={MAX_TITLE_LENGTH}
            value={values.dashboardTitle}
            onChange={onValueChange}
          />
        </FormGroup>
      )}
    </SaveDialog>
  );
};

EditDashboardDialog.propTypes = {
  dashboardId: PropTypes.id.isRequired,
  dashboardTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditDashboardDialog;
