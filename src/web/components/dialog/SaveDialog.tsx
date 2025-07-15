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
import State from 'web/utils/State';

interface SaveDialogRenderProps<TValues> {
  currentStep: number;
  values: TValues;
  onValueChange: (value: TValues[keyof TValues], name?: string) => void; // name is optional for now to support compatibility with uncontrolled components
}

interface SaveDialogProps<TValues, TDefaultValues> {
  buttonTitle?: string;
  children:
    | React.ReactNode
    | ((
        props: SaveDialogRenderProps<TValues & TDefaultValues>,
      ) => React.ReactNode);
  defaultValues?: TDefaultValues; // default values for uncontrolled values
  error?: string; // for errors controlled from parent (onErrorClose must be used if set)
  multiStep?: number; // number of steps for multi-step dialogs
  title: string;
  values?: TValues; // should be used for controlled values
  width?: string; // width of the dialog, default is '40vw'
  onClose?: () => void; // function to call when dialog is closed
  onError?: (error: Error) => void; // function to call when an error occurs
  onErrorClose?: () => void; // function to call when error dialog is closed
  onSave?: (state: TValues & TDefaultValues) => Promise<void> | void; // function to call when save button is clicked
}

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

  const setError = err => {
    setIsLoading(false);

    if (onError) {
      onError(err);
    } else {
      setStateError(err.message);
    }
  };

  const handleSaveClick = state => {
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

  return (
    <State {...defaultValues}>
      {({state, onValueChange}) => {
        const childValues = {...state, ...values};

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
                <DialogError
                  error={stateError}
                  onCloseClick={handleErrorClose}
                />
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
      }}
    </State>
  );
};

export default SaveDialog;
