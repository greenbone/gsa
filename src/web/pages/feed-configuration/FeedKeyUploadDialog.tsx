/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import actionFunction from 'web/entity/hooks/action-function';
import {useUploadKey} from 'web/hooks/use-query/feed-key';
import useTranslation from 'web/hooks/useTranslation';

interface FeedKeyUploadDialogProps {
  onClose: () => void;
  onError: (error: Error) => void;
  onSuccess: () => void;
}

interface FormValues {
  keyFile?: File;
}

const FeedKeyUploadDialog = ({
  onClose,
  onError,
  onSuccess,
}: FeedKeyUploadDialogProps) => {
  const [_] = useTranslation();
  const uploadKeyMutation = useUploadKey();

  const handleSave = async (values: FormValues) => {
    if (!values.keyFile) {
      throw new Error(_('Please select a key file to upload'));
    }

    await actionFunction(uploadKeyMutation.mutateAsync(values.keyFile), {
      onSuccess: onSuccess,
      successMessage: _('Key uploaded successfully'),
      onError: error => {
        onError(error);
        throw error;
      },
    });
  };

  return (
    <SaveDialog<FormValues>
      buttonTitle={_('Upload')}
      defaultValues={{keyFile: undefined}}
      title={_('Upload Feed Key')}
      width="500px"
      onClose={onClose}
      onSave={handleSave}
    >
      {({values, onValueChange}) => (
        <>
          <FormGroup title={_('Key File')}>
            <FileField
              accept=".pem"
              name="keyFile"
              title={_('Select key file (.pem)')}
              value={values.keyFile}
              onChange={onValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Information')}>
            <p>
              {_(
                'Please select the feed key file provided by Greenbone. Supported formats include .pem files.',
              )}
            </p>
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

export default FeedKeyUploadDialog;
