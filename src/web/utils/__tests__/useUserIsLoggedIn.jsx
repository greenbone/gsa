/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {setIsLoggedIn as setIsLoggedInAction} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from '../testing';

import useUserIsLoggedIn from '../useUserIsLoggedIn';

const TestUserIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useUserIsLoggedIn();
  return (
    <span onClick={() => setIsLoggedIn(false)}>
      {isLoggedIn ? 'yes' : 'no'}
    </span>
  );
};

describe('useUserIsLoggedIn tests', () => {
  test('should return the users login status', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setIsLoggedInAction(true));

    const {element} = render(<TestUserIsLoggedIn />);

    expect(element).toHaveTextContent(/^yes$/);
  });

  test('should allow to update the users login status', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setIsLoggedInAction(true));

    const {element} = render(<TestUserIsLoggedIn />);

    expect(element).toHaveTextContent(/^yes$/);

    fireEvent.click(element);

    expect(element).toHaveTextContent(/^no$/);
  });
});
