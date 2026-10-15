/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {isDefined, isFunction} from 'gmp/utils/identity';
import Dialog from 'web/components/dialog/Dialog';
import DialogContent from 'web/components/dialog/DialogContent';
import DialogError from 'web/components/dialog/DialogError';
import DialogTwoButtonFooter from 'web/components/dialog/DialogTwoButtonFooter';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import useTranslation from 'web/hooks/useTranslation';

interface ValueChangeFunction<TValues> {
  (value: TValues[keyof TValues], name?: string): void; // name is optional for now to support compatibility with uncontrolled components
}

interface SaveDialogRenderProps<TValues, TDefaultValues> {
  values: TValues & TDefaultValues;
  onValueChange: ValueChangeFunction<TDefaultValues>;
}

interface SaveDialogProps<TValues, TDefaultValues> {
  buttonTitle?: string;
  children:
    | React.ReactNode
    | ((
        props: SaveDialogRenderProps<TValues, TDefaultValues>,
      ) => React.ReactNode);
  defaultValues?: TDefaultValues; // default values for uncontrolled values which are updated via the onValueChange function of the render props
  error?: string; // for errors controlled from parent (onErrorClose must be used if set)
  isLoading?: boolean; // for loading state controlled from parent. disables the save button
  title: string;
  values?: TValues; // should be used for controlled values handles outside of the SaveDialog. They are expected to be updated via separate handler functions.
  width?: string; // width of the dialog, default is '40vw'
  onClose?: () => void; // function to call when dialog is closed
  onError?: (error: Error) => void; // function to call when an error occurs
  onErrorClose?: () => void; // function to call when error dialog is closed
  onSave?: (state: TValues & TDefaultValues) => Promise<void> | void; // function to call when save button is clicked
}

const useDialogState = <TInitialValues,>(
  initialValues?: TInitialValues,
): [TInitialValues, ValueChangeFunction<TInitialValues>] => {
  const [state, setState] = useState<TInitialValues>(
    initialValues ?? ({} as TInitialValues),
  );

  const onValueChange = (
    value: TInitialValues[keyof TInitialValues],
    name?: string,
  ) => {
    if (isDefined(name)) {
      setState(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  return [state, onValueChange];
};

const SaveDialog = <TValues, TDefaultValues = {}>({
  buttonTitle,
  children,
  defaultValues,
  error,
  isLoading = false,
  title,
  values,
  width = '40vw',
  onClose,
  onError,
  onErrorClose,
  onSave,
}: SaveDialogProps<TValues, TDefaultValues>) => {
  const [_] = useTranslation();
  buttonTitle = buttonTitle || _('Save');

  const [isSaving, setIsSaving] = useState(false);
  const [stateError, setStateError] = useState<string | undefined>(error);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setStateError(error);
    setIsSaving(false);
  }, [error]);

  const setError = (err: Error) => {
    setIsSaving(false);

    if (onError) {
      onError(err);
    } else {
      setStateError(err.message);
    }
  };

  const handleSaveClick = (state: TValues & TDefaultValues) => {
    if (onSave && !isLoading) {
      const promise = onSave(state);
      // oxlint-disable-next-line typescript/unbound-method
      if (isFunction(promise?.then)) {
        setIsSaving(true);
        return promise.catch(error => setError(error));
      }
    }
  };

  const handleErrorClose = () => {
    if (isDefined(onErrorClose)) {
      onErrorClose();
    } else {
      setStateError(undefined);
    }
  };

  const [state, onValueChange] = useDialogState<TDefaultValues>(defaultValues);
  const childValues = {...state, ...values} as TValues & TDefaultValues;
  return (
    <Dialog
      footer={
        <DialogTwoButtonFooter
          isLoading={isLoading}
          isSaving={isSaving}
          rightButtonTitle={buttonTitle}
          onLeftButtonClick={onClose}
          onRightButtonClick={() => handleSaveClick(childValues)}
        />
      }
      title={title}
      width={width}
      onClose={onClose}
    >
      <DialogContent>
        {stateError && (
          <DialogError error={stateError} onCloseClick={handleErrorClose} />
        )}
        <ErrorBoundary message={_('An error occurred in this dialog.')}>
          {isFunction(children)
            ? children({
                values: childValues,
                onValueChange,
              })
            : children}
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default SaveDialog;
