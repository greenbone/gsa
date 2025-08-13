/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import {MAX_TITLE_LENGTH} from 'web/pages/start/NewDashboardDialog';

interface EditDashboardDialogProps {
  dashboardId: string;
  dashboardTitle: string;
  onClose: () => void;
  onSave: (values: {dashboardId: string; dashboardTitle: string}) => void;
}

const EditDashboardDialog = ({
  dashboardId,
  dashboardTitle,
  onClose,
  onSave,
}: EditDashboardDialogProps) => {
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

export default EditDashboardDialog;
