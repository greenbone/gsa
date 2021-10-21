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

import {setLocale} from 'gmp/locale/lang';

import {render, fireEvent} from 'web/utils/testing';

import ErrorPanel from '../errorpanel';

setLocale('en');

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
