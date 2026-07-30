/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import Message from 'web/components/error/Message';

describe('Message component tests', () => {
  test('should render the message text', () => {
    render(<Message message="Something went wrong" />);

    expect(screen.getByTestId('message')).toHaveTextContent(
      'Something went wrong',
    );
  });

  test('should render details when provided', () => {
    render(
      <Message details="Please try again" message="Something went wrong" />,
    );

    expect(screen.getByTestId('message-details')).toHaveTextContent(
      'Please try again',
    );
  });

  test('should not render details when omitted', () => {
    render(<Message message="Something went wrong" />);

    expect(screen.queryByTestId('message-details')).not.toBeInTheDocument();
  });

  test('should render children', () => {
    render(
      <Message message="Something went wrong">
        <button>Retry</button>
      </Message>,
    );

    expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument();
  });

  test('should forward data-testid to the container', () => {
    render(<Message data-testid="my-message" message="Something went wrong" />);

    expect(screen.getByTestId('my-message')).toBeInTheDocument();
  });
});
