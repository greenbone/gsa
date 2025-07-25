/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {act, fireEvent, rendererWith, screen} from 'web/testing';
import useSessionTracker from 'web/hooks/useSessionTracker';

const TestSessionTracker = ({onClick}: {onClick?: () => void}) => {
  useSessionTracker();
  return <button data-testid="session-btn">Session Button</button>;
};

const runTimers = async () => {
  await act(async () => {
    await testing.advanceTimersToNextTimerAsync();
  });
};

describe('useSessionTracker', () => {
  test('should renew session on mount and on user activity with cooldown', async () => {
    testing.useFakeTimers();
    const renewSession = testing.fn().mockRejectedValueOnce({
      data: new Date(),
    });

    const {render} = rendererWith({
      store: true,
      gmp: {
        user: {renewSession},
      },
    });

    render(<TestSessionTracker />);
    const btn = screen.getByTestId('session-btn');

    expect(renewSession).toHaveBeenCalledTimes(1);

    renewSession.mockClear();

    fireEvent.click(btn);
    expect(renewSession).toHaveBeenCalledTimes(1);

    renewSession.mockClear();

    fireEvent.click(btn);
    expect(renewSession).not.toHaveBeenCalled();

    await runTimers();
    fireEvent.click(btn);
    expect(renewSession).toHaveBeenCalledTimes(1);
  });

  test('should not new session on non-button click', () => {
    testing.useFakeTimers();
    const renewSession = testing.fn().mockRejectedValueOnce({
      data: new Date(),
    });

    const {render} = rendererWith({
      store: true,
      gmp: {
        user: {renewSession},
      },
    });

    const NonButtonComponent = () => {
      useSessionTracker();
      return <div data-testid="non-button">Non Button</div>;
    };

    render(<NonButtonComponent />);
    const nonButton = screen.getByTestId('non-button');

    renewSession.mockClear();

    fireEvent.click(nonButton);
    expect(renewSession).not.toHaveBeenCalled();
  });

  test('should  renew session on keypress, wheel, and drag events with cooldown resets', async () => {
    testing.useFakeTimers();
    const renewSession = testing.fn().mockRejectedValueOnce({
      data: new Date(),
    });

    const {render} = rendererWith({
      store: true,
      gmp: {
        user: {renewSession},
      },
    });

    render(<TestSessionTracker />);

    renewSession.mockClear();

    fireEvent.keyPress(document, {key: 'Enter'});
    expect(renewSession).toHaveBeenCalledTimes(1);

    await runTimers();
    renewSession.mockClear();

    fireEvent.wheel(document);
    expect(renewSession).toHaveBeenCalledTimes(1);

    await runTimers();
    renewSession.mockClear();

    fireEvent.drag(document);
    expect(renewSession).toHaveBeenCalledTimes(1);
  });
});
