/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, wait} from 'web/testing';
import {getFormattedDate} from 'gmp/locale/date';
import date from 'gmp/models/date';
import {createSession} from 'gmp/testing';
import useSessionTimeout from 'web/hooks/useSessionTimeout';

const TestUserSessionTimeout = () => {
  const [sessionTimeout, renewSessionTimeout] = useSessionTimeout();
  return (
    <button onClick={() => renewSessionTimeout()} onKeyDown={() => {}}>
      {getFormattedDate(sessionTimeout, 'DD-MM-YY')}
    </button>
  );
};

const createGmp = ({
  renewSession = testing.fn().mockResolvedValue({data: date('2020-01-01')}),
  sessionTimeout = date('2019-10-10'),
} = {}) => ({
  user: {
    renewSession,
  },
  session: createSession({sessionTimeout}),
});

describe('useSessionTimeout tests', () => {
  test('should return the users session timeout', () => {
    const gmp = createGmp();
    const {render} = rendererWith({store: true, gmp});

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);
  });

  test('should allow to renew the session timeout', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);
    fireEvent.click(element);

    expect(gmp.user.renewSession).toHaveBeenCalledTimes(1);
    await wait();
    expect(element).toHaveTextContent(/^01-01-20$/);
  });
});
