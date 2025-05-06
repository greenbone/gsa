/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import {MAX_TITLE_LENGTH} from 'web/pages/start/NewDashboardDialog';
import PropTypes from 'web/utils/PropTypes';

const EditDashboardDialog = ({
  dashboardId,
  dashboardTitle,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  return (
    <SaveDialog
      defaultValues={{
        dashboardId,
        dashboardTitle,
      }}
      title={_('Edit Dashboard')}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <FormGroup title={_('Dashboard Title')}>
          <TextField
            grow="1"
            maxLength={MAX_TITLE_LENGTH}
            name="dashboardTitle"
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
