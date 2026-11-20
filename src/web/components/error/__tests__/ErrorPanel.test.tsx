/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, fireEvent} from 'web/testing';
import ErrorPanel from 'web/components/error/ErrorPanel';

describe('ErrorPanel tests', () => {
  test('should render message', () => {
    const message = 'An error occurred';
    render(<ErrorPanel message={message} />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(message);
    expect(screen.getByTestId('error-details')).toHaveTextContent(
      'Please try again',
    );
  });

  test('should allow to display error stack details', () => {
    const error = new Error('something went wrong');
    render(<ErrorPanel error={error} message="An error occurred" />);

    fireEvent.click(screen.getByTestId('errorpanel-toggle'));

    expect(screen.getByTestId('errorpanel-heading')).toHaveTextContent(
      'Error: something went wrong',
    );
    expect(screen.getByTestId('errorpanel-error-stack')).toHaveTextContent(
      'Error: something went wrong',
    );
    expect(
      screen.queryByTestId('errorpanel-component-stack'),
    ).not.toBeInTheDocument();
  });

  test('shows request details and keeps a pending retry disabled', () => {
    const retry = testing.fn();
    const {rerender} = render(
      <ErrorPanel
        action={{label: 'Retry', onClick: retry}}
        details="The previous selection has been preserved."
        message="Could not load the selected group."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The previous selection has been preserved.',
    );
    fireEvent.click(screen.getByRole('button', {name: 'Retry'}));
    expect(retry).toHaveBeenCalledOnce();
    rerender(
      <ErrorPanel
        action={{label: 'Retry', onClick: retry, isLoading: true}}
        message="Could not load the selected group."
      />,
    );
    const button = screen.getByRole('button', {name: 'Retry'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-loading', 'true');
  });

  test('should allow to display component stack details', () => {
    const error = new Error('something went wrong');
    const info = {
      componentStack: '\n    at App\n    at Router',
    };

    render(
      <ErrorPanel error={error} info={info} message="An error occurred" />,
    );

    fireEvent.click(screen.getByTestId('errorpanel-toggle'));

    expect(screen.getByTestId('errorpanel-heading')).toHaveTextContent(
      'Error: something went wrong',
    );
    expect(screen.getByTestId('errorpanel-component-stack')).toHaveTextContent(
      'at App',
    );
    expect(screen.getByTestId('errorpanel-error-stack')).toHaveTextContent(
      'Error: something went wrong',
    );
  });

  test('should toggle details visibility on repeated clicks', () => {
    const error = new Error('toggled error');
    render(<ErrorPanel error={error} message="An error occurred" />);

    const toggle = screen.getByTestId('errorpanel-toggle');

    fireEvent.click(toggle);
    expect(screen.getByTestId('errorpanel-error-stack')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(
      screen.queryByTestId('errorpanel-error-stack'),
    ).not.toBeInTheDocument();
  });
});
