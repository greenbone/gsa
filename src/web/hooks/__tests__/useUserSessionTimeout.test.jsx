/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {getFormattedDate} from 'gmp/locale/date';
import date from 'gmp/models/date';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import {setSessionTimeout as setSessionTimeoutAction} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/Testing';

const TestUserSessionTimeout = () => {
  const [sessionTimeout, setSessionTimeout] = useUserSessionTimeout();
  return (
    <button
      onClick={() => setSessionTimeout(date('2020-03-10'))}
      onKeyDown={() => {}}
    >
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
});
