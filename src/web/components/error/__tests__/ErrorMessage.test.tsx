/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, render} from 'web/testing';
import ErrorMessage from 'web/components/error/ErrorMessage';

describe('ErrorMessage tests', () => {
  test('should render the message', () => {
    render(<ErrorMessage message="An error occurred." />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'An error occurred.',
    );
  });

  test('should render details when provided', () => {
    render(
      <ErrorMessage details="Because of foo." message="An error occurred." />,
    );

    expect(screen.getByTestId('error-details')).toHaveTextContent(
      'Because of foo.',
    );
  });

  test('should not render details when omitted', () => {
    render(<ErrorMessage message="An error occurred." />);

    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
  });

  test('should render an alert icon', () => {
    render(<ErrorMessage message="An error occurred." />);

    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
  });

  test('should render children', () => {
    render(
      <ErrorMessage message="An error occurred.">
        <button>Retry</button>
      </ErrorMessage>,
    );

    expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument();
  });

  test('should forward data-testid to the container', () => {
    render(
      <ErrorMessage data-testid="my-error" message="An error occurred." />,
    );

    expect(screen.getByTestId('my-error')).toBeInTheDocument();
  });
});
