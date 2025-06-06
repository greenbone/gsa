/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import useTranslation from 'web/hooks/useTranslation';

interface PortListImportDialogProps {
  onClose: () => void;
  onSave: (data: {xmlFile: File}) => void | Promise<void>;
}

const PortListImportDialog = ({onClose, onSave}: PortListImportDialogProps) => {
  const [_] = useTranslation();
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      title={_('Import Port List')}
      onClose={onClose}
      onSave={onSave}
    >
      {({onValueChange}) => {
        return (
          <FormGroup title={_('Import XML Port List')}>
            <FileField name="xmlFile" onChange={onValueChange} />
          </FormGroup>
        );
      }}
    </SaveDialog>
  );
};

export default PortListImportDialog;
