/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import withDialogNotification, {
  type DialogNotificationProps,
} from 'web/components/notification/withDialogNotification';

interface TestProps extends DialogNotificationProps {
  label?: string;
}

interface TestOwnProps {
  label?: string;
}

const TestComponent = ({
  label = 'test',
  showError,
  showErrorMessage,
  showMessage,
  showSuccessMessage,
}: TestProps) => (
  <div>
    <span>{label}</span>
    <button data-testid="show-message" onClick={() => showMessage('message')} />
    <button
      data-testid="show-message-with-subject"
      onClick={() => showMessage('message', 'Subject')}
    />
    <button
      data-testid="show-error-message"
      onClick={() => showErrorMessage('error message')}
    />
    <button
      data-testid="show-success-message"
      onClick={() => showSuccessMessage('success message')}
    />
    <button
      data-testid="show-error"
      onClick={() => showError({message: 'error'})}
    />
  </div>
);

const WrappedComponent = withDialogNotification<TestOwnProps>(TestComponent);

const click = (testId: string) => fireEvent.click(screen.getByTestId(testId));

describe('withDialogNotification tests', () => {
  test('should set the wrapper display name', () => {
    expect(WrappedComponent.displayName).toBe(
      'withDialogNotification(TestComponent)',
    );
  });

  test('should render the wrapped component and forward props', () => {
    render(<WrappedComponent label="custom label" />);

    expect(screen.getByText('custom label')).toBeInTheDocument();
    expect(screen.queryDialog()).not.toBeInTheDocument();
  });

  test.each([
    ['show-message', 'Message', 'message'],
    ['show-message-with-subject', 'Subject', 'message'],
    ['show-error-message', 'Error', 'error message'],
    ['show-success-message', 'Success', 'success message'],
    ['show-error', 'Error', 'error'],
  ])('should show the %s notification as %s', (testId, title, message) => {
    render(<WrappedComponent />);

    click(testId);

    expect(screen.getDialogTitle()).toHaveTextContent(title);
    expect(screen.getDialogContent()).toHaveTextContent(message);
  });

  test('should close the notification dialog', () => {
    render(<WrappedComponent />);

    click('show-message');
    expect(screen.queryDialog()).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Close'}));

    expect(screen.queryDialog()).not.toBeInTheDocument();
  });
});
