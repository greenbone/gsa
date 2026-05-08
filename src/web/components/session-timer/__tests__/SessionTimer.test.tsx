/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  expect,
  test,
  testing,
  afterEach,
  beforeEach,
} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import date from 'gmp/models/date';
import {createSession} from 'gmp/testing';
import SessionTimer from 'web/components/session-timer/SessionTimer';

const currentTime = date('2024-01-01T12:00:00Z');

const createGmp = ({
  renewSession = testing
    .fn()
    .mockResolvedValue({data: currentTime.add(10, 'minutes')}),
} = {}) => ({
  session: createSession({
    sessionTimeout: currentTime.add(5, 'minutes'),
  }),
  user: {
    renewSession,
  },
});

describe('SessionTimer tests', () => {
  afterEach(() => {
    testing.useRealTimers();
  });

  beforeEach(() => {
    testing.useFakeTimers();
    testing.setSystemTime(currentTime.toDate());
    testing.setTimerTickMode('nextTimerAsync');
  });

  test('renders session timer component', async () => {
    const {render} = rendererWith({gmp: createGmp()});
    render(<SessionTimer />);

    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  test('renews session timeout on button click', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});
    render(<SessionTimer />);

    expect(screen.getByText('5:00')).toBeInTheDocument();

    const button = screen.getByRole('button', {name: 'Refresh CCW Icon'});
    fireEvent.click(button);

    await wait();

    expect(gmp.user.renewSession).toHaveBeenCalled();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });
});
