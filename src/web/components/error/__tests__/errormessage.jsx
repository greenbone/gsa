/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

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

    expect(getByTestId('error-message')).toHaveTextContent(message);
    expect(getByTestId('error-details')).toHaveTextContent(details);
    expect(element.querySelector('#bar')).toHaveTextContent('bar');
  });
});
