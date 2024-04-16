/* Copyright (C) 2017-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, {useState, useEffect} from 'react';

import {isDefined, isFunction} from 'gmp/utils/identity';

import State from 'web/utils/state';
import PropTypes from 'web/utils/proptypes';

import ErrorBoundary from 'web/components/error/errorboundary';

import useTranslation from 'web/hooks/useTranslation';

import Dialog from './dialog';
import DialogContent from './content';
import DialogError from './error';
import DialogFooter from './twobuttonfooter';
import MultiStepFooter from './multistepfooter';

const SaveDialogContent = ({
  error,
  multiStep = 0,
  onError,
  onErrorClose,
  onSave,
  ...props
}) => {
  const [_] = useTranslation();
  const [isLoading, setLoading] = useState(false);
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
    setLoading(false);
  }, [error]);

  const setError = err => {
    setLoading(false);

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
        setLoading(true);
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
  width = 'lg',
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
