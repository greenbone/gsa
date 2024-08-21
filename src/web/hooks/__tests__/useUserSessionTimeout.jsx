/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {dateFormat} from 'gmp/locale/date';
import date from 'gmp/models/date';

import {setSessionTimeout as setSessionTimeoutAction} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import useUserSessionTimeout from '../useUserSessionTimeout';

const TestUserSessionTimeout = () => {
  const [sessionTimeout, setSessionTimeout] = useUserSessionTimeout();
  return (
    <span onClick={() => setSessionTimeout(date('2020-03-10'))}>
      {dateFormat(sessionTimeout, 'DD-MM-YY')}
    </span>
  );
};

describe('useUserSessionTimeout tests', () => {
  test('should return the users session timeout', () => {
    const {render, store} = rendererWith({store: true});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);
  });

  test('should allow to set the users session timeout', () => {
    const {render, store} = rendererWith({store: true});

    const timeout = date('2019-10-10');

    store.dispatch(setSessionTimeoutAction(timeout));

    const {element} = render(<TestUserSessionTimeout />);

    expect(element).toHaveTextContent(/^10-10-19$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^10-03-20$/);
  });
});
