/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DialogFooter from 'web/components/dialog/DialogTwoButtonFooter';
import MultiStepFooter from 'web/components/dialog/MultiStepFooter';

interface SaveDialogFooterProps {
  multiStep: number;
  isLoading: boolean;
  prevDisabled: boolean;
  nextDisabled: boolean;
  buttonTitle: string;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onClose: () => void;
  handleSaveClick: () => void;
}

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
}: SaveDialogFooterProps) => {
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

export default SaveDialogFooter;
