/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, wait} from 'web/testing';
import {getFormattedDate} from 'gmp/locale/date';
import date from 'gmp/models/date';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import {setSessionTimeout as setSessionTimeoutAction} from 'web/store/usersettings/actions';

const TestUserSessionTimeout = () => {
  const [sessionTimeout, renewSessionTimeout] = useUserSessionTimeout();
  return (
    <button onClick={() => renewSessionTimeout()} onKeyDown={() => {}}>
      {getFormattedDate(sessionTimeout, 'DD-MM-YY')}
    </button>
  );
};

describe('useUserSessionTimeout tests', () => {
  test('should return the users session timeout', () => {
    const {render, store} = rendererWith({store: true, gmp: {}});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);
  });

  test('should allow to renew the session timeout', async () => {
    const renewSession = testing.fn(() =>
      Promise.resolve({data: date('2020-01-01')}),
    );
    const {render, store} = rendererWith({
      store: true,
      gmp: {user: {renewSession}},
    });

    const timeout = date('2019-10-10');
    store.dispatch(setSessionTimeoutAction(timeout));

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);
    fireEvent.click(element);

    expect(renewSession).toHaveBeenCalledTimes(1);
    await wait();
    expect(element).toHaveTextContent(/^01-01-20$/);
  });
});
