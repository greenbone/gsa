/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


/* eslint-disable no-console */

import {describe, test, expect} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import ErrorPanel from '../errorpanel';

describe('ErrorPanel tests', () => {
  test('should render message', () => {
    const message = 'An error occurred';
    const {getByTestId} = render(<ErrorPanel message={message} />);

    expect(getByTestId('error-message')).toHaveTextContent(message);
    expect(getByTestId('error-details')).toHaveTextContent('Please try again');
  });

  test('should allow to display error stack details', () => {
    const message = 'An error occurred';

    const error = {
      name: 'Error',
      message: 'foo',
      stack: 'Foo Bar',
    };

    const {getByTestId, queryByTestId} = render(
      <ErrorPanel message={message} error={error} />,
    );

    const toggle = getByTestId('errorpanel-toggle');

    fireEvent.click(toggle);

    expect(getByTestId('errorpanel-heading')).toHaveTextContent('Error: foo');
    expect(queryByTestId('errorpanel-component-stack')).toBeNull();
    expect(getByTestId('errorpanel-error-stack')).not.toBeNull();
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

    const {getByTestId} = render(
      <ErrorPanel message={message} error={error} info={info} />,
    );

    const toggle = getByTestId('errorpanel-toggle');

    fireEvent.click(toggle);

    expect(getByTestId('errorpanel-heading')).toHaveTextContent('Error: foo');
    expect(getByTestId('errorpanel-component-stack')).not.toBeNull();
    expect(getByTestId('errorpanel-error-stack')).not.toBeNull();
  });
});
