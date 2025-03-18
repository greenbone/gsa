/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import useUserTimezone from 'web/hooks/useUserTimezone';
import {setTimezone as setTimezoneAction} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent} from 'web/utils/Testing';

const TestUserTimezone = () => {
  const [timezone, setUserTimezone] = useUserTimezone();
  return (
    <span onClick={() => setUserTimezone('Coordinated Universal Time')}>
      {timezone}
    </span>
  );
};

describe('useUserTimezone tests', () => {
  test('should return the users timezone', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezoneAction('Central European Standard'));

    const {element} = render(<TestUserTimezone />);

    expect(element).toHaveTextContent(/^Central European Standard$/);
  });

  test('should allow to update the user timezone', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezoneAction('Central European Standard'));

    const {element} = render(<TestUserTimezone />);

    expect(element).toHaveTextContent(/^Central European Standard$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^Coordinated Universal Time$/);
  });
});
