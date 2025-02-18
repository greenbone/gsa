/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/utils/Testing';

import DialogNotification from '../DialogNotification';
import useDialogNotification from '../useDialogNotification';

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

const queryDialog = () => screen.queryByRole('dialog');
const getDialog = () => screen.getByRole('dialog');
const getDialogTitleBar = () =>
  getDialog().querySelector('.mantine-Modal-title');
const getDialogContent = () => getDialog().querySelector('.mantine-Modal-body');
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

    expect(queryDialog()).not.toBeInTheDocument();

    showMessage();

    expect(queryDialog()).toBeInTheDocument();

    const dialogTitleBar = getDialogTitleBar();

    expect(dialogTitleBar).toHaveTextContent('Message');

    const dialogContent = getDialogContent();

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display a message with subject', () => {
    render(<TestComponent />);

    expect(queryDialog()).not.toBeInTheDocument();

    showMessageWithSubject();

    expect(queryDialog()).toBeInTheDocument();

    const dialogTitleBar = getDialogTitleBar();

    expect(dialogTitleBar).toHaveTextContent('bar');

    const dialogContent = getDialogContent();

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should allow to close dialog', () => {
    render(<TestComponent />);

    showMessage();

    expect(queryDialog()).toBeInTheDocument();

    const dialogTitleBar = getDialogTitleBar();

    expect(dialogTitleBar).toHaveTextContent('Message');

    const dialogContent = getDialogContent();

    expect(dialogContent).toHaveTextContent('foo');

    const dialogFooter = getDialogFooter();
    const closeButton = dialogFooter.querySelector('button');
    fireEvent.click(closeButton);

    expect(queryDialog()).not.toBeInTheDocument();
  });

  test('should display an error message', () => {
    render(<TestComponent />);

    expect(queryDialog()).not.toBeInTheDocument();

    showErrorMessage();

    expect(queryDialog()).toBeInTheDocument();

    const dialogTitleBar = getDialogTitleBar();

    expect(dialogTitleBar).toHaveTextContent('Error');

    const dialogContent = getDialogContent();

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display a success message', () => {
    render(<TestComponent />);

    expect(queryDialog()).not.toBeInTheDocument();

    showSuccessMessage();

    expect(queryDialog()).toBeInTheDocument();

    const dialogTitleBar = getDialogTitleBar();

    expect(dialogTitleBar).toHaveTextContent('Success');

    const dialogContent = getDialogContent();

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display an error', () => {
    render(<TestComponent />);

    expect(queryDialog()).not.toBeInTheDocument();

    showError();

    const dialogTitleBar = getDialogTitleBar();

    expect(dialogTitleBar).toHaveTextContent('Error');

    const dialogContent = getDialogContent();

    expect(dialogContent).toHaveTextContent('foo');
  });
});
