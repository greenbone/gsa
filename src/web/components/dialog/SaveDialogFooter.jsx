/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DialogFooter from 'web/components/dialog/DialogTwoButtonFooter';
import MultiStepFooter from 'web/components/dialog/MultiStepFooter';
import PropTypes from 'web/utils/PropTypes';

const SaveDialogFooter = ({
  multiStep,
  isLoading,
  prevDisabled,
  nextDisabled,
  buttonTitle,
  currentStep,
  setCurrentStep,
  onClose,
  handleSaveClick,
}) => {
  return multiStep > 0 ? (
    <MultiStepFooter
      loading={isLoading}
      nextDisabled={nextDisabled}
      prevDisabled={prevDisabled}
      rightButtonTitle={buttonTitle}
      onLeftButtonClick={onClose}
      onNextButtonClick={() =>
        setCurrentStep(currentStep < multiStep ? currentStep + 1 : currentStep)
      }
      onPreviousButtonClick={() =>
        setCurrentStep(currentStep > 0 ? currentStep - 1 : currentStep)
      }
      onRightButtonClick={handleSaveClick}
    />
  ) : (
    <DialogFooter
      isLoading={isLoading}
      rightButtonTitle={buttonTitle}
      onLeftButtonClick={onClose}
      onRightButtonClick={handleSaveClick}
    />
  );
};

SaveDialogFooter.propTypes = {
  multiStep: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  prevDisabled: PropTypes.bool.isRequired,
  nextDisabled: PropTypes.bool.isRequired,
  buttonTitle: PropTypes.string.isRequired,
  currentStep: PropTypes.number.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSaveClick: PropTypes.func.isRequired,
};

export default SaveDialogFooter;
