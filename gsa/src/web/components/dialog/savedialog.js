/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogError from 'web/components/dialog/error';
import DialogFooter from 'web/components/dialog/twobuttonfooter';
import DialogTitle from 'web/components/dialog/title';
import MultiStepFooter from 'web/components/dialog/multistepfooter';
import ScrollableContent from 'web/components/dialog/scrollablecontent';

import ErrorBoundary from 'web/components/error/errorboundary';

import State from 'web/utils/state';
import PropTypes from 'web/utils/proptypes';

const SaveDialogContent = ({
  onSave,
  error,
  multiStep = 0,
  onError,
  onErrorClose = undefined,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
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
    const {graphQLErrors, networkError} = err;
    if (onError) {
      onError(err);
    } else if (isDefined(networkError) && networkError) {
      setStateError(networkError.message);
    } else if (isDefined(graphQLErrors) && graphQLErrors.length > 0) {
      setStateError(graphQLErrors[0].message);
    } else {
      setStateError(err.message);
    }
  };
  const handleStepChange = index => {
    setCurrentStep(index);
  };
  const handleSaveClick = state => {
    if (onSave && !loading) {
      const promise = onSave(state);
      if (isDefined(promise)) {
        setLoading(true);
        // eslint-disable-next-line no-shadow
        promise.catch(error => setError(error));
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
  const {
    buttonTitle,
    children,
    close,
    defaultValues,
    moveProps,
    heightProps,
    title,
    values,
  } = props;
  return (
    <State {...defaultValues}>
      {({state, onValueChange}) => {
        const childValues = {...state, ...values};
        return (
          <DialogContent>
            <DialogTitle title={title} onCloseClick={close} {...moveProps} />
            {stateError && (
              <DialogError error={stateError} onCloseClick={handleErrorClose} />
            )}
            <ErrorBoundary message={_('An error occurred in this dialog.')}>
              <ScrollableContent
                data-testid="save-dialog-content"
                {...heightProps}
              >
                {children({
                  currentStep,
                  values: childValues,
                  onStepChange: handleStepChange,
                  onValueChange,
                })}
              </ScrollableContent>
            </ErrorBoundary>
            {multiStep > 0 ? (
              <MultiStepFooter
                loading={loading}
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
                loading={loading}
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
  close: PropTypes.func.isRequired,
  defaultValues: PropTypes.object,
  error: PropTypes.string,
  heightProps: PropTypes.object,
  moveProps: PropTypes.object,
  multiStep: PropTypes.number,
  nextDisabled: PropTypes.bool,
  prevDisabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  values: PropTypes.object,
  onError: PropTypes.func,
  onErrorClose: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};
const SaveDialog = ({
  buttonTitle = _('Save'),
  children,
  defaultValues,
  error,
  initialHeight,
  minHeight,
  minWidth,
  multiStep = 0,
  title,
  values,
  width,
  onClose,
  onError,
  onErrorClose,
  onSave,
}) => {
  return (
    <Dialog
      height={initialHeight}
      width={width}
      minHeight={minHeight}
      minWidth={minWidth}
      onClose={onClose}
    >
      {({close, moveProps, heightProps}) => (
        <SaveDialogContent
          buttonTitle={buttonTitle}
          close={close}
          defaultValues={defaultValues}
          error={error}
          moveProps={moveProps}
          multiStep={multiStep}
          heightProps={heightProps}
          title={title}
          values={values}
          onErrorClose={onErrorClose}
          onError={onError}
          onSave={onSave}
        >
          {children}
        </SaveDialogContent>
      )}
    </Dialog>
  );
};
SaveDialog.propTypes = {
  buttonTitle: PropTypes.string,
  defaultValues: PropTypes.object, // default values for uncontrolled values
  error: PropTypes.string, // for errors controlled from parent (onErrorClose must be used if set)
  initialHeight: PropTypes.string,
  minHeight: PropTypes.numberOrNumberString,
  minWidth: PropTypes.numberOrNumberString,
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
