/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {setTimezone as setTimezoneAction} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent} from 'web/utils/Testing';

import useUserTimezone from '../useUserTimezone';

const TestUserTimezone = () => {
  const [timezone, setUserTimezone] = useUserTimezone();
  return <span onClick={() => setUserTimezone('UTC')}>{timezone}</span>;
};

describe('useUserTimezone tests', () => {
  test('should return the users timezone', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezoneAction('CET'));

    const {element} = render(<TestUserTimezone />);

    expect(element).toHaveTextContent(/^CET$/);
  });

  test('should allow to update the user timezone', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezoneAction('CET'));

    const {element} = render(<TestUserTimezone />);

    expect(element).toHaveTextContent(/^CET$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^UTC$/);
  });
});
