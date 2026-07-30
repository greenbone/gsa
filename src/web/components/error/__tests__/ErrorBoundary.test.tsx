/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, beforeEach, afterEach, vi} from '@gsa/testing';
import {screen, render, fireEvent} from 'web/testing';
import ErrorBoundary from 'web/components/error/ErrorBoundary';

const ThrowError = () => {
  throw new Error('something went wrong');
};

describe('ErrorBoundary tests', () => {
  beforeEach(() => {
    // suppress React's error boundary console output in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render children when no error occurs', () => {
    render(
      <ErrorBoundary message="An error occurred">
        <span>foo</span>
      </ErrorBoundary>,
    );

    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  test('should render the error message when a child throws', () => {
    render(
      <ErrorBoundary message="An error occurred">
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'An error occurred',
    );
    expect(screen.getByTestId('error-details')).toHaveTextContent(
      'Please try again',
    );
  });

  test('should use a default message when none is provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'An error occurred on this page.',
    );
  });

  test('should show error stack and component stack in details panel', () => {
    render(
      <ErrorBoundary message="An error occurred">
        <ThrowError />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByTestId('errorpanel-toggle'));

    expect(screen.getByTestId('errorpanel-heading')).toHaveTextContent(
      'Error: something went wrong',
    );
    expect(screen.getByTestId('errorpanel-error-stack')).toBeInTheDocument();
    expect(
      screen.getByTestId('errorpanel-component-stack'),
    ).toBeInTheDocument();
  });
});
