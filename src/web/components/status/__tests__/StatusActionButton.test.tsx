/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, render} from 'web/testing';
import StatusActionButton from 'web/components/status/StatusActionButton';

const labels = {
  idle: 'Verify credential',
  testing: 'Verifying credential...',
  success: 'Credential verified',
  failed: 'Credential verification failed',
};

const states = [undefined, 'testing', 'success', 'failed'] as const;

describe('StatusActionButton', () => {
  test('associates extra guidance without replacing the visible name', () => {
    render(
      <>
        <StatusActionButton
          aria-describedby="verification-help"
          labels={labels}
        />
        <p id="verification-help">Save changes before verifying.</p>
      </>,
    );
    const button = screen.getByRole('button', {name: labels.idle});
    expect(button).toHaveAccessibleDescription(
      'Save changes before verifying.',
    );
  });

  test.each(states)('renders labels and default icons for %s', status => {
    const handleClick = testing.fn();
    render(
      <StatusActionButton
        labels={labels}
        status={status}
        onClick={handleClick}
      />,
    );
    const state = status ?? 'idle';
    const button = screen.getByRole('button', {name: labels[state]});
    expect(button).toBeVisible();
    expect(button).toHaveTextContent(labels[state]);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute(
      'title',
      status === 'testing' ? labels.testing : labels.idle,
    );
    const iconIds = {
      idle: 'start-icon',
      testing: 'refresh-ccw-icon',
      success: 'check-icon',
      failed: 'alert-circle-icon',
    };
    const icon = screen.getByTestId(iconIds[state]);
    expect(icon).toBeVisible();
    expect(icon.closest('[aria-hidden="true"]')).not.toBeNull();
    if (status === 'testing') expect(button).toBeDisabled();
    else expect(button).not.toBeDisabled();
  });

  test.each([undefined, 'success', 'failed'] as const)(
    'allows clicks and keyboard activation for %s',
    status => {
      const handleClick = testing.fn();
      render(
        <StatusActionButton
          labels={labels}
          status={status}
          onClick={handleClick}
        />,
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.keyDown(button, {key: 'Enter'});
      fireEvent.keyDown(button, {key: ' '});
      fireEvent.keyDown(button, {key: 'Escape'});
      expect(handleClick).toHaveBeenCalledTimes(3);
      button.focus();
      expect(button).toHaveFocus();
    },
  );

  test.each(states)('blocks interaction when disabled for %s', status => {
    const handleClick = testing.fn();
    render(
      <StatusActionButton
        disabled
        labels={labels}
        status={status}
        onClick={handleClick}
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    fireEvent.keyDown(button, {key: 'Enter'});
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('blocks interaction while testing', () => {
    const handleClick = testing.fn();
    render(
      <StatusActionButton
        labels={labels}
        status="testing"
        onClick={handleClick}
      />,
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.keyDown(button, {key: ' '});
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('is disabled without an action', () => {
    render(<StatusActionButton labels={labels} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test.each(states)('allows overriding the icon for %s', status => {
    const state = status ?? 'idle';
    render(
      <StatusActionButton
        icons={{[state]: <span>Custom icon</span>}}
        labels={labels}
        status={status}
      />,
    );
    const icon = screen.getByText('Custom icon');
    expect(icon).toBeVisible();
    expect(icon.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('button').querySelector('svg')).toBeNull();
  });

  test('uses the default for an omitted icon override', () => {
    render(
      <StatusActionButton
        icons={{idle: null}}
        labels={labels}
        status="success"
      />,
    );
    expect(screen.getByTestId('check-icon')).toBeVisible();
  });

  test('allows hiding an icon with null', () => {
    render(<StatusActionButton icons={{idle: null}} labels={labels} />);
    const button = screen.getByRole('button', {name: labels.idle});
    expect(button.querySelector('svg')).toBeNull();
    expect(button.querySelector('[aria-hidden]')).toBeNull();
  });
});
