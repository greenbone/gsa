/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import SaveDialogFooter from 'web/components/dialog/SaveDialogFooter';
import {render, fireEvent, screen} from 'web/testing';

describe('SaveDialogFooter', () => {
  const defaultProps = {
    multiStep: 0,
    isLoading: false,
    prevDisabled: false,
    nextDisabled: false,
    buttonTitle: 'Save',
    currentStep: 0,
    setCurrentStep: testing.fn(),
    onClose: testing.fn(),
    handleSaveClick: testing.fn(),
  };

  test('renders DialogFooter when multiStep is 0', () => {
    render(<SaveDialogFooter {...defaultProps} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

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
