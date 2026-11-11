/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {render, screen, userEvent} from 'web/testing';
import InlineNotification from 'web/components/notification/InlineNotification';

describe('InlineNotification', () => {
  test('announces errors and keeps them visible after a retry', async () => {
    const retry = testing.fn();
    render(
      <InlineNotification
        action={{label: 'Retry selection', onClick: retry}}
        details="The previous selection has been preserved."
        message="Could not load the selected group."
        severity="error"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not load the selected group.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The previous selection has been preserved.',
    );
    await userEvent.click(
      screen.getByRole('button', {name: 'Retry selection'}),
    );
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toBeVisible();
    expect(
      screen.queryByRole('button', {name: /close/i}),
    ).not.toBeInTheDocument();
  });

  test('announces partial results as a status without an error alert', () => {
    render(
      <InlineNotification
        message="Some computers were not returned."
        severity="warning"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Some computers were not returned.',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('prevents duplicate retries while the action is loading', async () => {
    const retry = testing.fn();
    render(
      <InlineNotification
        action={{label: 'Retry', onClick: retry, isLoading: true}}
        message="Connection failed."
        severity="error"
      />,
    );
    const button = screen.getByRole('button', {name: 'Retry'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-loading', 'true');
    await userEvent.click(button);
    expect(retry).not.toHaveBeenCalled();
  });
});
