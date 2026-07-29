/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {isDefined, isFunction} from 'gmp/utils/identity';
import Dialog from 'web/components/dialog/Dialog';
import DialogContent from 'web/components/dialog/DialogContent';
import DialogError from 'web/components/dialog/DialogError';
import SaveDialogFooter from 'web/components/dialog/SaveDialogFooter';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import useTranslation from 'web/hooks/useTranslation';

interface ValueChangeFunction<TValues> {
  (value: TValues[keyof TValues], name?: string): void; // name is optional for now to support compatibility with uncontrolled components
}

interface SaveDialogRenderProps<TValues, TDefaultValues> {
  currentStep: number;
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
  multiStep?: number; // number of steps for multi-step dialogs
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
  multiStep = 0,
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

  const [isLoading, setIsLoading] = useState(false);
  const [stateError, setStateError] = useState<string | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState(0);

  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);

  useEffect(() => {
    setPrevDisabled(currentStep === 0);
    setNextDisabled(currentStep === multiStep);
  }, [currentStep, multiStep]);

  useEffect(() => {
    setStateError(error);
    setIsLoading(false);
  }, [error]);

  const setError = (err: Error) => {
    setIsLoading(false);

    if (onError) {
      onError(err);
    } else {
      setStateError(err.message);
    }
  };

  const handleSaveClick = (state: TValues & TDefaultValues) => {
    if (onSave && !isLoading) {
      const promise = onSave(state);
      if (isFunction(promise?.then)) {
        setIsLoading(true);
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
        <SaveDialogFooter
          buttonTitle={buttonTitle}
          currentStep={currentStep}
          handleSaveClick={() => handleSaveClick(childValues)}
          isLoading={isLoading}
          multiStep={multiStep}
          nextDisabled={nextDisabled}
          prevDisabled={prevDisabled}
          setCurrentStep={setCurrentStep}
          onClose={onClose}
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
                currentStep,
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
