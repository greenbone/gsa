/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, fireEvent, waitFor} from 'web/testing';
import SaveDialog from 'web/components/dialog/SaveDialog';

describe('SaveDialog tests', () => {
  test('should render SaveDialog with title', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog title="Test Dialog" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    expect(screen.getDialogTitle()).toHaveTextContent('Test Dialog');
    expect(screen.getDialogContent()).toHaveTextContent('Dialog content');
  });

  test('should render SaveDialog with custom button title', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog
        buttonTitle="Submit"
        title="Test Dialog"
        onClose={handleClose}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('should render SaveDialog with default button title', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog title="Test Dialog" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('should render SaveDialog with function as children', () => {
    const handleClose = testing.fn();
    const renderFn = testing.fn(({values}) => <div>Value: {values.name}</div>);

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
      >
        {renderFn}
      </SaveDialog>,
    );

    expect(screen.getDialogContent()).toHaveTextContent('Value: test');
    expect(renderFn).toHaveBeenCalled();
  });

  test('should call onClose when cancel button is clicked', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog title="Test Dialog" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(handleClose).toHaveBeenCalled();
  });

  test('should call onSave when save button is clicked', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
        onSave={handleSave}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Save'));

    expect(handleSave).toHaveBeenCalledWith({name: 'test'});
  });

  test('should update values when onValueChange is called', () => {
    const handleClose = testing.fn();
    const renderFn = testing.fn(({values, onValueChange}) => (
      <div>
        Value: {values.name}
        <button onClick={() => onValueChange('newValue', 'name')}>
          Update
        </button>
      </div>
    ));

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
      >
        {renderFn}
      </SaveDialog>,
    );

    expect(screen.getByText(/Value: test/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Update'));

    expect(screen.getByText(/Value: newValue/)).toBeInTheDocument();
  });

  test('should support controlled values', () => {
    const handleClose = testing.fn();
    const renderFn = testing.fn(({values}) => <div>Value: {values.name}</div>);

    const {rerender} = render(
      <SaveDialog
        title="Test Dialog"
        values={{name: 'initial'}}
        onClose={handleClose}
      >
        {renderFn}
      </SaveDialog>,
    );

    expect(screen.getByText(/Value: initial/)).toBeInTheDocument();

    rerender(
      <SaveDialog
        title="Test Dialog"
        values={{name: 'updated'}}
        onClose={handleClose}
      >
        {renderFn}
      </SaveDialog>,
    );

    expect(screen.getByText(/Value: updated/)).toBeInTheDocument();
  });

  test('should display error message when error is provided', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog
        error="Test error message"
        title="Test Dialog"
        onClose={handleClose}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  test('should handle async onSave', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn().mockResolvedValue(undefined);

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
        onSave={handleSave}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Save'));

    expect(handleSave).toHaveBeenCalledWith({name: 'test'});

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });
  });

  test('should handle async onSave error', async () => {
    const handleClose = testing.fn();
    const handleError = testing.fn();
    const error = new Error('Save failed');
    const handleSave = testing.fn().mockRejectedValue(error);

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
        onError={handleError}
        onSave={handleSave}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(error);
    });
  });

  test('should display async error message in dialog', async () => {
    const handleClose = testing.fn();
    const error = new Error('Save failed');
    const handleSave = testing.fn().mockRejectedValue(error);

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
        onSave={handleSave}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  test('should not call onSave twice when clicked multiple times while loading', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(resolve, 1000);
        }),
    );

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
        onSave={handleSave}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Save'));
    fireEvent.click(screen.getByText('Save'));

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  test('should render multi-step dialog', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog multiStep={2} title="Test Dialog" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    expect(screen.queryDialogTitle()).toHaveTextContent('Test Dialog');
    expect(screen.getByTestId('dialog-next-button')).toBeInTheDocument();
  });

  test('should navigate through multi-step dialog', () => {
    const handleClose = testing.fn();
    const renderFn = testing.fn(({currentStep}) => (
      <div>Step: {currentStep}</div>
    ));

    render(
      <SaveDialog multiStep={2} title="Test Dialog" onClose={handleClose}>
        {renderFn}
      </SaveDialog>,
    );

    expect(screen.getByText('Step: 0')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-next-button'));

    expect(screen.getByText('Step: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-previous-button'));

    expect(screen.getByText('Step: 0')).toBeInTheDocument();
  });

  test('should disable prev button on first step', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog multiStep={2} title="Test Dialog" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    const prevButton = screen.getByTestId('dialog-previous-button');
    expect(prevButton).toBeDisabled();
  });

  test('should disable next button on last step', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog multiStep={2} title="Test Dialog" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByTestId('dialog-next-button'));
    fireEvent.click(screen.getByTestId('dialog-next-button'));

    const nextButton = screen.getByTestId('dialog-next-button');
    expect(nextButton).toBeDisabled();
  });

  test('should support custom dialog width', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog title="Test Dialog" width="50vw" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    const dialog = screen.getDialog();
    expect(dialog).toHaveStyle('width: 50vw');
  });

  test('should use default dialog width', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog title="Test Dialog" onClose={handleClose}>
        <div>Dialog content</div>
      </SaveDialog>,
    );

    const dialog = screen.getDialog();
    expect(dialog).toHaveStyle('width: 40vw');
  });

  test('should merge default and controlled values', () => {
    const handleClose = testing.fn();
    const renderFn = testing.fn(({values}) => (
      <div>
        Name: {values.name}, Email: {values.email}
      </div>
    ));

    render(
      <SaveDialog
        defaultValues={{name: 'John'}}
        title="Test Dialog"
        values={{email: 'john@example.com'}}
        onClose={handleClose}
      >
        {renderFn}
      </SaveDialog>,
    );

    expect(
      screen.getByText('Name: John, Email: john@example.com'),
    ).toBeInTheDocument();
  });

  test('should prioritize controlled values over default values', () => {
    const handleClose = testing.fn();
    const renderFn = testing.fn(({values}) => <div>Value: {values.name}</div>);

    render(
      <SaveDialog
        defaultValues={{name: 'default'}}
        title="Test Dialog"
        values={{name: 'controlled'}}
        onClose={handleClose}
      >
        {renderFn}
      </SaveDialog>,
    );

    expect(screen.getByText('Value: controlled')).toBeInTheDocument();
  });

  test('should update error state when error prop changes', () => {
    const handleClose = testing.fn();

    const {rerender} = render(
      <SaveDialog
        error="Initial error"
        title="Test Dialog"
        onClose={handleClose}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    expect(screen.getByText('Initial error')).toBeInTheDocument();

    rerender(
      <SaveDialog
        error="Updated error"
        title="Test Dialog"
        onClose={handleClose}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    expect(screen.getByText('Updated error')).toBeInTheDocument();
  });

  test('should call onError callback on async save error', async () => {
    const handleClose = testing.fn();
    const handleError = testing.fn();
    const error = new Error('Custom error');
    const handleSave = testing.fn().mockRejectedValue(error);

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
        onError={handleError}
        onSave={handleSave}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith(error);
    });
  });

  test('should handle sync onSave', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <SaveDialog
        defaultValues={{name: 'test'}}
        title="Test Dialog"
        onClose={handleClose}
        onSave={handleSave}
      >
        <div>Dialog content</div>
      </SaveDialog>,
    );

    fireEvent.click(screen.getByText('Save'));

    expect(handleSave).toHaveBeenCalledWith({name: 'test'});
  });

  test('should render children without function', () => {
    const handleClose = testing.fn();

    render(
      <SaveDialog title="Test Dialog" onClose={handleClose}>
        <div>Static content</div>
      </SaveDialog>,
    );

    expect(screen.getDialogContent()).toHaveTextContent('Static content');
  });
});
