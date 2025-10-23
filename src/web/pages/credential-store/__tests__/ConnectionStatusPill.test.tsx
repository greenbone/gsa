/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {screen, fireEvent, render} from 'web/testing';
import 'jest-styled-components';
import ConnectionStatusPill from 'web/pages/credential-store/ConnectionStatusPill';

describe('ConnectionStatusPill', () => {
  let handleClick;

  beforeEach(() => {
    handleClick = testing.fn();
  });

  describe('initial state (default)', () => {
    test('renders correctly with all expected properties', () => {
      render(<ConnectionStatusPill onClick={handleClick} />);

      const button = screen.getByRole('button');

      expect(button).toBeVisible();
      expect(button).toHaveTextContent('Test Connection');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute(
        'aria-label',
        'Test connection button. Click to start connection test.',
      );
      expect(button).toHaveAttribute('title', 'Test Connection');

      const svg = button.querySelector('svg');
      expect(svg).toBeVisible();

      const plugZapIcon = screen.getByLabelText('Plug Zap Icon');
      expect(plugZapIcon).toBeVisible();

      expect(button).toHaveStyleRule('cursor', 'pointer');
    });

    test('handles interactions correctly', () => {
      render(<ConnectionStatusPill onClick={handleClick} />);

      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);

      handleClick.mockClear();
      fireEvent.keyDown(button, {key: 'Enter'});
      expect(handleClick).toHaveBeenCalledTimes(1);

      handleClick.mockClear();
      fireEvent.keyDown(button, {key: ' '});
      expect(handleClick).toHaveBeenCalledTimes(1);

      handleClick.mockClear();
      fireEvent.keyDown(button, {key: 'Escape'});
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('testing state', () => {
    test('renders correctly with all expected properties', () => {
      render(<ConnectionStatusPill status="testing" onClick={handleClick} />);

      const button = screen.getByRole('button');

      expect(button).toBeVisible();
      expect(button).toHaveTextContent('Testing connection...');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute(
        'aria-label',
        'Connection test in progress. Please wait.',
      );
      expect(button).toHaveAttribute('title', 'Testing in progress...');

      const svg = button.querySelector('svg');
      expect(svg).toBeVisible();

      const scheduleIcon = screen.getByLabelText('Schedule Icon');
      expect(scheduleIcon).toBeVisible();

      expect(button).toHaveStyleRule('cursor', 'not-allowed');
    });

    test('is non-interactive', () => {
      render(<ConnectionStatusPill status="testing" onClick={handleClick} />);

      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();

      fireEvent.keyDown(button, {key: 'Enter'});
      expect(handleClick).not.toHaveBeenCalled();

      expect(button).toBeDisabled();
    });
  });

  describe('success state', () => {
    test('renders correctly with all expected properties', () => {
      render(<ConnectionStatusPill status="success" onClick={handleClick} />);

      const button = screen.getByRole('button');

      expect(button).toBeVisible();
      expect(button).toHaveTextContent('Connection successful');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute(
        'aria-label',
        'Connection test successful. Click to test again.',
      );
      expect(button).toHaveAttribute('title', 'Test Connection');

      const svg = button.querySelector('svg');
      expect(svg).toBeVisible();

      const verifyIcon = screen.getByLabelText('Verify Icon');
      expect(verifyIcon).toBeVisible();

      expect(button).toHaveStyleRule('cursor', 'pointer');
    });

    test('handles interactions correctly', () => {
      render(<ConnectionStatusPill status="success" onClick={handleClick} />);

      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);

      handleClick.mockClear();
      fireEvent.keyDown(button, {key: 'Enter'});
      expect(handleClick).toHaveBeenCalledTimes(1);

      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('failed state', () => {
    test('renders correctly with all expected properties', () => {
      render(<ConnectionStatusPill status="failed" onClick={handleClick} />);

      const button = screen.getByRole('button');

      expect(button).toBeVisible();
      expect(button).toHaveTextContent('Connection failed');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute(
        'aria-label',
        'Connection test failed. Click to retry test.',
      );
      expect(button).toHaveAttribute('title', 'Test Connection');

      const svg = button.querySelector('svg');
      expect(svg).toBeVisible();

      const verifyNoIcon = screen.getByLabelText('Verify No Icon');
      expect(verifyNoIcon).toBeVisible();

      expect(button).toHaveStyleRule('cursor', 'pointer');
    });

    test('handles interactions correctly', () => {
      render(<ConnectionStatusPill status="failed" onClick={handleClick} />);

      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);

      handleClick.mockClear();
      fireEvent.keyDown(button, {key: ' '});
      expect(handleClick).toHaveBeenCalledTimes(1);

      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('disabled state', () => {
    test('renders as disabled regardless of status', () => {
      render(<ConnectionStatusPill disabled onClick={handleClick} />);

      const button = screen.getByRole('button');

      expect(button).toBeVisible();
      expect(button).toBeDisabled();
      expect(button).toHaveStyleRule('cursor', 'not-allowed');

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('works with success status', () => {
      render(
        <ConnectionStatusPill
          disabled
          status="success"
          onClick={handleClick}
        />,
      );

      const button = screen.getByRole('button');

      expect(button).toHaveTextContent('Connection successful');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('testing status overrides disabled=false', () => {
      render(
        <ConnectionStatusPill
          disabled={false}
          status="testing"
          onClick={handleClick}
        />,
      );

      const button = screen.getByRole('button');

      expect(button).toHaveTextContent('Testing connection...');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('no onClick handler', () => {
    test('renders as disabled when no handler provided', () => {
      render(<ConnectionStatusPill />);

      const button = screen.getByRole('button');

      expect(button).toBeVisible();
      expect(button).toBeDisabled();

      fireEvent.click(button);
    });
  });
});
