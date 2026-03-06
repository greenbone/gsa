/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FileField from 'web/components/form/FileField';
import FormGroup from 'web/components/form/FormGroup';
import actionFunction from 'web/entity/hooks/action-function';
import {useUploadKey} from 'web/hooks/use-query/feed-key';
import useTranslation from 'web/hooks/useTranslation';
import {validateFeedKeyFile} from 'web/utils/feed-key-validation';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      setValidationError(null);
      return;
    }

    // Validate the file
    const validationResult = await validateFeedKeyFile(file);
    if (validationResult.isValid === false) {
      setValidationError(validationResult.error || _('Invalid key file'));
    } else {
      setValidationError(null);
    }
  };

  const handleError = (e: Error) => {
    setError(e.message);
  };

  const handleErrorClose = () => {
    setError(undefined);
  };

  const handleSave = async (values: FormValues) => {
    if (!values.keyFile) {
      throw new Error(_('Please select a key file to upload'));
    }

    // If there's a validation error, don't proceed
    if (validationError) {
      throw new Error(validationError);
    }

    await actionFunction(uploadKeyMutation.mutateAsync(values.keyFile), {
      onSuccess: onSuccess,
      successMessage: _('Key uploaded successfully'),
    });
  };

  return (
    <SaveDialog<FormValues>
      buttonTitle={_('Upload')}
      defaultValues={{keyFile: undefined}}
      error={error}
      title={_('Upload Feed Key')}
      width="500px"
      onClose={onClose}
      onError={handleError}
      onErrorClose={handleErrorClose}
      onSave={handleSave}
    >
      {({values, onValueChange}) => (
        <>
          <FormGroup title={_('Key File')}>
            <FileField
              accept=".pem,.key"
              error={validationError}
              name="keyFile"
              title={_('Select key file (.pem or .key)')}
              value={values.keyFile}
              onChange={(file, name) => {
                onValueChange(file, name);
                void handleFileChange(file);
              }}
            />
          </FormGroup>
          <FormGroup title={_('Information')}>
            <p>
              {_(
                'Please upload your feed key file provided by Greenbone. The file should be in .pem or .key format.',
              )}
            </p>
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

export default FeedKeyUploadDialog;
