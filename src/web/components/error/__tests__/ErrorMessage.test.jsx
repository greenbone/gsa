/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ErrorMessage from 'web/components/error/ErrorMessage';
import {render} from 'web/utils/Testing';


describe('ErrorMessage tests', () => {
  test('should render', () => {
    const {element} = render(
      <ErrorMessage details="Because of foo." message="An error occurred." />,
    );

    expect(element).toBeVisible();
  });

  test('should render with message, details and children', () => {
    const message = 'An error occurred.';
    const details = 'Because of foo.';

    const {element, getByTestId} = render(
      <ErrorMessage details={details} message={message}>
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
