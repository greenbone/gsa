/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useEffect} from 'react';

import {isDefined, isFunction} from 'gmp/utils/identity';

import State from 'web/utils/state';
import PropTypes from 'web/utils/proptypes';

import ErrorBoundary from 'web/components/error/errorboundary';

import useTranslation from 'web/hooks/useTranslation';

import Dialog from 'web/components/dialog/dialog';
import DialogContent, {StickyFooter} from 'web/components/dialog/content';
import DialogError from 'web/components/dialog/error';
import DialogFooter from 'web/components/dialog/twobuttonfooter';
import MultiStepFooter from 'web/components/dialog/multistepfooter';

const SaveDialogContent = ({
  error,
  multiStep = 0,
  onError,
  onErrorClose,
  onSave,
  ...props
}) => {
  const [_] = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [stateError, setStateError] = useState(undefined);

  const [currentStep, setCurrentStep] = useState(0);

  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);

  useEffect(() => {
    setPrevDisabled(currentStep === 0);
    setNextDisabled(currentStep === multiStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

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

  const handleStepChange = index => {
    setCurrentStep(index);
  };

  const handleSaveClick = state => {
    if (onSave && !isLoading) {
      const promise = onSave(state);
      if (isDefined(promise)) {
        setIsLoading(true);
        // eslint-disable-next-line no-shadow
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

  const {buttonTitle, children, close, defaultValues, values} = props;

  return (
    <State {...defaultValues}>
      {({state, onValueChange}) => {
        const childValues = {...state, ...values};
        return (
          <DialogContent>
            {stateError && (
              <DialogError error={stateError} onCloseClick={handleErrorClose} />
            )}
            <ErrorBoundary message={_('An error occurred in this dialog.')}>
              {isFunction(children)
                ? children({
                    currentStep,
                    values: childValues,
                    onStepChange: handleStepChange,
                    onValueChange,
                  })
                : children}
            </ErrorBoundary>
            <StickyFooter>
              {multiStep > 0 ? (
                <MultiStepFooter
                  loading={isLoading}
                  prevDisabled={prevDisabled}
                  nextDisabled={nextDisabled}
                  rightButtonTitle={buttonTitle}
                  onNextButtonClick={() =>
                    setCurrentStep(
                      currentStep < multiStep ? currentStep + 1 : currentStep,
                    )
                  }
                  onLeftButtonClick={close}
                  onPreviousButtonClick={() =>
                    setCurrentStep(
                      currentStep > 0 ? currentStep - 1 : currentStep,
                    )
                  }
                  onRightButtonClick={() => handleSaveClick(childValues)}
                />
              ) : (
                <DialogFooter
                  isLoading={isLoading}
                  rightButtonTitle={buttonTitle}
                  onLeftButtonClick={close}
                  onRightButtonClick={() => handleSaveClick(childValues)}
                />
              )}
            </StickyFooter>
          </DialogContent>
        );
      }}
    </State>
  );
};

SaveDialogContent.propTypes = {
  buttonTitle: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  close: PropTypes.func.isRequired,
  defaultValues: PropTypes.object,
  error: PropTypes.string,
  multiStep: PropTypes.number,
  nextDisabled: PropTypes.bool,
  prevDisabled: PropTypes.bool,
  values: PropTypes.object,
  onError: PropTypes.func,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

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
  return (
    <Dialog width={width} title={title} onClose={onClose}>
      <SaveDialogContent
        buttonTitle={buttonTitle}
        close={onClose}
        defaultValues={defaultValues}
        error={error}
        multiStep={multiStep}
        values={values}
        onErrorClose={onErrorClose}
        onError={onError}
        onSave={onSave}
      >
        {children}
      </SaveDialogContent>
    </Dialog>
  );
};

SaveDialog.propTypes = {
  buttonTitle: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
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

// vim: set ts=2 sw=2 tw=80:
