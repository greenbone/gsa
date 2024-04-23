/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {rendererWith, screen, fireEvent} from 'web/utils/testing';

import DialogNotification from '../dialognotification';
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

describe('DialogNotification tests', () => {
  test('should display a message', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Message');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display a message with subject', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-message-with-subject');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('bar');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should allow to close dialog', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    const button = screen.getByTestId('show-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Message');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');

    const dialogFooter = screen.getByTestId('dialog-notification-footer');
    const closeButton = dialogFooter.querySelector('button');

    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should display an error message', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-error-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Error');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display a success message', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-success-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Success');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display an error', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-error');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Error');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });
});
