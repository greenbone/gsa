/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable no-console */

import React from 'react';

import {render, fireEvent} from 'web/utils/testing';
import ErrorBoundary from '../errorboundary';

const ThrowError = () => {
  throw new Error('foo');
};

describe('ErrorBoundary tests', () => {
  test('should render children if no error occurs', () => {
    const {container, element} = render(
      <ErrorBoundary message="An error occurred">
        <span>foo</span>
      </ErrorBoundary>,
    );

    expect(container.childNodes.length).toEqual(1);
    expect(element.nodeName).toEqual('SPAN');
    expect(element).toHaveTextContent('foo');
  });

  test('should render ErrorMessage if error occurs', () => {
    const origConsoleError = console.error;
    console.error = () => {};

    const message = 'An error occurred';
    const {getByTestId} = render(
      <ErrorBoundary message={message}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(getByTestId('error-message')).toHaveTextContent(message);
    expect(getByTestId('error-details')).toHaveTextContent('Please try again');

    console.error = origConsoleError;
  });

  test('should allow to display error details', () => {
    const origConsoleError = console.error;
    console.error = () => {};

    const message = 'An error occurred';
    const {getByTestId} = render(
      <ErrorBoundary message={message}>
        <ThrowError />
      </ErrorBoundary>,
    );

    const toggle = getByTestId('errorpanel-toggle');

    fireEvent.click(toggle);

    expect(getByTestId('errorpanel-heading')).toHaveTextContent('Error: foo');
    expect(getByTestId('errorpanel-component-stack')).not.toBeNull();
    expect(getByTestId('errorpanel-error-stack')).not.toBeNull();

    console.error = origConsoleError;
  });
});
