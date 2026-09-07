/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import SaveDialogFooter from 'web/components/dialog/SaveDialogFooter';

describe('SaveDialogFooter', () => {
  const defaultProps = {
    multiStep: 0,
    isLoading: false,
    isSaving: false,
    prevDisabled: false,
    nextDisabled: false,
    buttonTitle: 'Save',
    currentStep: 0,
    setCurrentStep: testing.fn(),
    onClose: testing.fn(),
    handleSaveClick: testing.fn(),
  };

  test('renders DialogTwoButtonFooter when multiStep is 0', () => {
    render(<SaveDialogFooter {...defaultProps} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test.each([
    {isLoading: false, isSaving: false},
    {isLoading: true, isSaving: false},
    {isLoading: false, isSaving: true},
    {isLoading: true, isSaving: true},
  ])(
    'handles single-step buttons with isLoading=$isLoading and isSaving=$isSaving',
    ({isLoading, isSaving}) => {
      const onClose = testing.fn();
      const handleSaveClick = testing.fn();

      render(
        <SaveDialogFooter
          {...defaultProps}
          handleSaveClick={handleSaveClick}
          isLoading={isLoading}
          isSaving={isSaving}
          onClose={onClose}
        />,
      );

      const cancelButton = screen.getByTestId('dialog-close-button');
      const saveButton = screen.getByTestId('dialog-save-button');

      if (isSaving) {
        expect(cancelButton).toBeDisabled();
      } else {
        expect(cancelButton).toBeEnabled();
      }

      if (isLoading || isSaving) {
        expect(saveButton).toHaveAttribute('data-loading', 'true');
        expect(saveButton).toBeDisabled();
      } else {
        expect(saveButton).not.toHaveAttribute('data-loading');
        expect(saveButton).toBeEnabled();
      }

      fireEvent.click(cancelButton);
      fireEvent.click(saveButton);

      expect(onClose).toHaveBeenCalledTimes(isSaving ? 0 : 1);
      expect(handleSaveClick).toHaveBeenCalledTimes(
        isLoading || isSaving ? 0 : 1,
      );
    },
  );

  test('renders MultiStepFooter when multiStep is greater than 0', () => {
    render(<SaveDialogFooter {...defaultProps} multiStep={3} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('calls setCurrentStep with incremented value on next button click in MultiStepFooter', () => {
    render(<SaveDialogFooter {...defaultProps} multiStep={3} />);
    fireEvent.click(screen.getByTestId('dialog-next-button'));
    expect(defaultProps.setCurrentStep).toHaveBeenCalledWith(1);
  });

  test('calls setCurrentStep with decremented value on previous button click in MultiStepFooter', () => {
    render(
      <SaveDialogFooter {...defaultProps} currentStep={2} multiStep={3} />,
    );
    fireEvent.click(screen.getByTestId('dialog-previous-button'));
    expect(defaultProps.setCurrentStep).toHaveBeenCalledWith(1);
  });

  test('calls onClose when left button is clicked', () => {
    render(<SaveDialogFooter {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('calls handleSaveClick when right button is clicked', () => {
    render(<SaveDialogFooter {...defaultProps} />);
    fireEvent.click(screen.getByText('Save'));
    expect(defaultProps.handleSaveClick).toHaveBeenCalled();
  });
});
