/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ErrorMessage from 'web/components/error/ErrorMessage';
import {screen, render} from 'web/testing';

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

    const {element} = render(
      <ErrorMessage details={details} message={message}>
        <span id="bar">bar</span>
      </ErrorMessage>,
    );

    const icon = element.querySelector('svg');

    expect(icon).not.toBeNull();

    expect(screen.getByTestId('error-message')).toHaveTextContent(message);
    expect(screen.getByTestId('error-details')).toHaveTextContent(details);
    expect(element.querySelector('#bar')).toHaveTextContent('bar');
  });
});
