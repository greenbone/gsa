/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {fireEvent, rendererWith} from 'web/testing';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import {setIsLoggedIn} from 'web/store/usersettings/actions';

const TestComponent = () => {
  const [isLoggedIn, setLoggedIn] = useUserIsLoggedIn();
  return (
    <span onClick={() => setLoggedIn(!isLoggedIn)}>{String(isLoggedIn)}</span>
  );
};

describe('useUserIsLoggedIn tests', () => {
  test('should return the user logged-in state', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setIsLoggedIn(false));

    const {element} = render(<TestComponent />);

    expect(element).toHaveTextContent(/^false$/);
  });

  test('should allow to change the user logged-in state', () => {
    const {render, store} = rendererWith({store: true});

    store.dispatch(setIsLoggedIn(false));

    const {element} = render(<TestComponent />);

    expect(element).toHaveTextContent(/^false$/);
    fireEvent.click(element);
    expect(element).toHaveTextContent(/^true$/);
  });
});
