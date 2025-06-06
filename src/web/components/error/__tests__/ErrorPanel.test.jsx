/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
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
    const message = 'An error occurred';

    const error = {
      name: 'Error',
      message: 'foo',
      stack: 'Foo Bar',
    };

    render(<ErrorPanel error={error} message={message} />);

    const toggle = screen.getByTestId('errorpanel-toggle');

    fireEvent.click(toggle);

    expect(screen.getByTestId('errorpanel-heading')).toHaveTextContent(
      'Error: foo',
    );
    expect(screen.queryByTestId('errorpanel-component-stack')).toBeNull();
    expect(screen.getByTestId('errorpanel-error-stack')).not.toBeNull();
  });

  test('should allow to display component stack details', () => {
    const message = 'An error occurred';

    const error = {
      name: 'Error',
      message: 'foo',
      stack: 'Foo Bar',
    };

    const info = {
      componentStack: 'Lorem Ipsum',
    };

    render(<ErrorPanel error={error} info={info} message={message} />);

    const toggle = screen.getByTestId('errorpanel-toggle');

    fireEvent.click(toggle);

    expect(screen.getByTestId('errorpanel-heading')).toHaveTextContent(
      'Error: foo',
    );
    expect(screen.getByTestId('errorpanel-component-stack')).not.toBeNull();
    expect(screen.getByTestId('errorpanel-error-stack')).not.toBeNull();
  });
});
