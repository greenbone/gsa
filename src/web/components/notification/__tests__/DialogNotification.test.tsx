/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen, fireEvent, within} from 'web/testing';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

const TestComponent = () => {
  const {
    dialogState,
    closeDialog,
    showMessage,
    showError,
    showErrorMessage,
    showSuccessMessage,
  } = useDialogNotification();
  return (
    <div>
      <button data-testid="show-message" onClick={() => showMessage('foo')} />
      <button
        data-testid="show-message-with-subject"
        onClick={() => showMessage('foo', 'bar')}
      />
      <button
        data-testid="show-error-message"
        onClick={() => showErrorMessage('foo')}
      />
      <button
        data-testid="show-success-message"
        onClick={() => showSuccessMessage('foo')}
      />
      <button
        data-testid="show-error"
        onClick={() => showError(new Error('foo'))}
      />
      <DialogNotification {...dialogState} onCloseClick={closeDialog} />
    </div>
  );
};

const getDialogFooter = () => screen.getByTestId('dialog-notification-footer');

const showMessage = () => {
  const button = screen.getByTestId('show-message');
  fireEvent.click(button);
};
const showError = () => {
  const button = screen.getByTestId('show-error');
  fireEvent.click(button);
};
const showMessageWithSubject = () => {
  const button = screen.getByTestId('show-message-with-subject');
  fireEvent.click(button);
};
const showErrorMessage = () => {
  const button = screen.getByTestId('show-error-message');
  fireEvent.click(button);
};
const showSuccessMessage = () => {
  const button = screen.getByTestId('show-success-message');

  fireEvent.click(button);
};

describe('DialogNotification tests', () => {
  test('should display a message', () => {
    render(<TestComponent />);

    expect(screen.queryDialog()).not.toBeInTheDocument();

    showMessage();

    expect(screen.queryDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('Message');
    expect(screen.getDialogContent()).toHaveTextContent('foo');
  });

  test('should display a message with subject', () => {
    render(<TestComponent />);

    expect(screen.queryDialog()).not.toBeInTheDocument();

    showMessageWithSubject();

    expect(screen.queryDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('bar');
    expect(screen.getDialogContent()).toHaveTextContent('foo');
  });

  test('should allow to close dialog', () => {
    render(<TestComponent />);

    showMessage();

    expect(screen.queryDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('Message');
    expect(screen.getDialogContent()).toHaveTextContent('foo');
    const dialogFooter = within(getDialogFooter());
    const closeButton = dialogFooter.getByRole('button', {
      name: 'Close',
    });
    fireEvent.click(closeButton);
    expect(screen.queryDialog()).not.toBeInTheDocument();
  });

  test('should display an error message', () => {
    render(<TestComponent />);

    expect(screen.queryDialog()).not.toBeInTheDocument();

    showErrorMessage();

    expect(screen.queryDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('Error');
    expect(screen.getDialogContent()).toHaveTextContent('foo');
  });

  test('should display a success message', () => {
    render(<TestComponent />);

    expect(screen.queryDialog()).not.toBeInTheDocument();

    showSuccessMessage();

    expect(screen.queryDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('Success');
    expect(screen.getDialogContent()).toHaveTextContent('foo');
  });

  test('should display an error', () => {
    render(<TestComponent />);

    expect(screen.queryDialog()).not.toBeInTheDocument();

    showError();

    expect(screen.getDialogTitle()).toHaveTextContent('Error');
    expect(screen.getDialogContent()).toHaveTextContent('foo');
  });
});
