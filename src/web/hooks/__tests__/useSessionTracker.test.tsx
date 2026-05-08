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
import date from 'gmp/models/date';
import {createSession} from 'gmp/testing';
import useSessionTracker from 'web/hooks/useSessionTracker';

const createGmp = ({
  newDate = date(),
  renewSession = testing.fn().mockResolvedValue({data: newDate}),
} = {}) => ({
  user: {
    renewSession,
  },
  session: createSession({sessionTimeout: newDate}),
});

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
    const gmp = createGmp();
    const {render} = rendererWith({
      store: true,
      gmp,
    });

    render(<TestSessionTracker />);
    const btn = screen.getByTestId('session-btn');

    expect(gmp.user.renewSession).toHaveBeenCalledTimes(1);

    gmp.user.renewSession.mockClear();

    fireEvent.click(btn);
    expect(gmp.user.renewSession).toHaveBeenCalledTimes(1);

    gmp.user.renewSession.mockClear();

    fireEvent.click(btn);
    expect(gmp.user.renewSession).toHaveBeenCalledOnce();
    gmp.user.renewSession.mockClear();

    await runTimers();
    fireEvent.click(btn);
    expect(gmp.user.renewSession).toHaveBeenCalledOnce();
  });

  test('should not new session on non-button click', () => {
    testing.useFakeTimers();
    const gmp = createGmp();
    const {render} = rendererWith({
      store: true,
      gmp,
    });

    const NonButtonComponent = () => {
      useSessionTracker();
      return <div data-testid="non-button">Non Button</div>;
    };

    render(<NonButtonComponent />);
    const nonButton = screen.getByTestId('non-button');

    gmp.user.renewSession.mockClear();

    fireEvent.click(nonButton);
    expect(gmp.user.renewSession).not.toHaveBeenCalled();
  });

  test('should  renew session on keypress, wheel, and drag events with cooldown resets', async () => {
    testing.useFakeTimers();
    const gmp = createGmp();
    const {render} = rendererWith({
      store: true,
      gmp,
    });

    render(<TestSessionTracker />);

    gmp.user.renewSession.mockClear();

    fireEvent.keyPress(document, {key: 'Enter'});
    expect(gmp.user.renewSession).toHaveBeenCalledOnce();

    await runTimers();
    gmp.user.renewSession.mockClear();

    fireEvent.wheel(document);
    expect(gmp.user.renewSession).toHaveBeenCalledOnce();

    await runTimers();
    gmp.user.renewSession.mockClear();

    fireEvent.drag(document);
    expect(gmp.user.renewSession).toHaveBeenCalledOnce();
  });
});
