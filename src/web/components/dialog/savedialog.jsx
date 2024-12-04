/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';

import {isDefined, isFunction} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import State from 'web/utils/state';

import ErrorBoundary from 'web/components/error/errorboundary';

import useTranslation from 'web/hooks/useTranslation';

import DialogContent from 'web/components/dialog/content';
import Dialog from 'web/components/dialog/dialog';
import DialogError from 'web/components/dialog/error';
import SaveDialogFooter from 'web/components/dialog/SaveDialogFooter';

const SaveDialog = ({
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
}) => {
  const [_] = useTranslation();
  buttonTitle = buttonTitle || _('Save');

  const [isLoading, setIsLoading] = useState(false);
  const [stateError, setStateError] = useState(undefined);
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
      if (isDefined(promise)) {
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
            width={width}
            title={title}
            onClose={onClose}
            footer={
              <SaveDialogFooter
                multiStep={multiStep}
                isLoading={isLoading}
                prevDisabled={prevDisabled}
                nextDisabled={nextDisabled}
                buttonTitle={buttonTitle}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                onClose={onClose}
                handleSaveClick={() => handleSaveClick(childValues)}
              />
            }
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

SaveDialog.propTypes = {
  buttonTitle: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
  defaultValues: PropTypes.object, // default values for uncontrolled values
  error: PropTypes.string, // for errors controlled from parent (onErrorClose must be used if set)
  multiStep: PropTypes.number,
  title: PropTypes.string.isRequired,
  values: PropTypes.object, // should be used for controlled values
  width: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default SaveDialog;
