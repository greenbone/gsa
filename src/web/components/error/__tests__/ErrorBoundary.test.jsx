/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import {screen} from 'web/testing';
import {render, fireEvent} from 'web/utils/Testing';

const ThrowError = () => {
  throw new Error('foo');
};

describe('ErrorBoundary tests', () => {
  test('should render children if no error occurs', () => {
    const {element} = render(
      <ErrorBoundary message="An error occurred">
        <span>foo</span>
      </ErrorBoundary>,
    );

    expect(element.childNodes.length).toEqual(1);
    expect(element.nodeName).toEqual('SPAN');
    expect(element).toHaveTextContent('foo');
  });

  test('should render ErrorMessage if error occurs', () => {
    const origConsoleError = console.error;
    console.error = () => {};

    const message = 'An error occurred';
    render(
      <ErrorBoundary message={message}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent(message);
    expect(screen.getByTestId('error-details')).toHaveTextContent(
      'Please try again',
    );

    console.error = origConsoleError;
  });

  test('should allow to display error details', () => {
    const origConsoleError = console.error;
    console.error = () => {};

    const message = 'An error occurred';
    render(
      <ErrorBoundary message={message}>
        <ThrowError />
      </ErrorBoundary>,
    );

    const toggle = screen.getByTestId('errorpanel-toggle');

    fireEvent.click(toggle);

    expect(screen.getByTestId('errorpanel-heading')).toHaveTextContent(
      'Error: foo',
    );
    expect(screen.getByTestId('errorpanel-component-stack')).not.toBeNull();
    expect(screen.getByTestId('errorpanel-error-stack')).not.toBeNull();

    console.error = origConsoleError;
  });
});
