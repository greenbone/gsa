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
import React from 'react';

import {render} from 'web/utils/testing';

import ErrorMessage from '../errormessage';

describe('ErrorMessage tests', () => {
  test('should render', () => {
    const {element} = render(
      <ErrorMessage message="An error occurred." details="Because of foo." />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render with message, details and children', () => {
    const message = 'An error occurred.';
    const details = 'Because of foo.';

    const {element, getByTestId} = render(
      <ErrorMessage message={message} details={details}>
        <span id="bar">bar</span>
      </ErrorMessage>,
    );

    const icon = element.querySelector('svg');

    expect(icon).not.toBeNull();
    expect(icon).toHaveTextContent('st_nonavailable.svg');

    expect(getByTestId('error-message')).toHaveTextContent(message);
    expect(getByTestId('error-details')).toHaveTextContent(details);
    expect(element.querySelector('#bar')).toHaveTextContent('bar');
  });
});
