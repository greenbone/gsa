/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import date from 'gmp/models/date';

import {GET_CURRENT_USER_IS_AUTHENTICATED} from 'web/graphql/auth';

import {setSessionTimeout} from 'web/store/usersettings/actions';

import {rendererWith, act} from 'web/utils/testing';

import SessionObserver, {
  setClearTimeoutFuncForTesting,
  setTimeoutFuncForTesting,
} from '../sessionobserver';

let setTimeoutMock;
let clearTimeoutMock;

beforeEach(() => {
  jest.useFakeTimers();

  setTimeoutMock = jest.fn(x => global.setTimeout(x));
  clearTimeoutMock = jest.fn(x => global.clearTimeout(x));

  setTimeoutFuncForTesting(setTimeoutMock);
  setClearTimeoutFuncForTesting(clearTimeoutMock);
});

afterAll(() => {
  setTimeoutFuncForTesting(global.setTimeout);
  setClearTimeoutFuncForTesting(global.clearTimeout);

  jest.useRealTimers();
});

describe('SessionObserver tests', () => {
  test('should not render without a session timeout', () => {
    const logout = jest.fn();
    const gmp = {
      logout,
    };
    const {render} = rendererWith({store: true, gmp});

    const {element, unmount} = render(<SessionObserver />);

    expect(element).toBeNull();

    unmount();

    expect(setTimeoutMock).not.toHaveBeenCalled();
    expect(clearTimeoutMock).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
  });

  test('should start timer for checking authentication status', () => {
    const logout = jest.fn();
    const gmp = {
      logout,
    };
    const {render, store} = rendererWith({store: true, gmp});

    const timeout = date().add(300, 'seconds');

    store.dispatch(setSessionTimeout(timeout));

    const {element} = render(<SessionObserver />);

    expect(element).toBeNull();

    expect(setTimeoutMock).toHaveBeenCalled();
    expect(clearTimeoutMock).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
  });

  test('should cancel timer on unmount', () => {
    const logout = jest.fn();
    const gmp = {
      logout,
    };
    const {render, store} = rendererWith({store: true, gmp});

    const timeout = date().add(300, 'seconds');

    store.dispatch(setSessionTimeout(timeout));

    const {element, unmount} = render(<SessionObserver />);

    expect(element).toBeNull();

    expect(setTimeoutMock).toHaveBeenCalled();
    expect(clearTimeoutMock).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();

    unmount();

    expect(clearTimeoutMock).toHaveBeenCalled();
  });

  test.skip('should logout if user is not authenticated anymore', () => {
    const mock = {
      request: {
        query: GET_CURRENT_USER_IS_AUTHENTICATED,
      },
      result: {
        data: {
          currentUser: {
            isAuthenticated: false,
          },
        },
      },
    };

    const logout = jest.fn();
    const gmp = {
      logout,
    };
    const {render, store} = rendererWith({
      store: true,
      gmp,
      queryMocks: [mock],
    });

    const timeout = date().add(300, 'seconds');

    store.dispatch(setSessionTimeout(timeout));

    const {element} = render(<SessionObserver />);

    expect(element).toBeNull();

    act(() => {
      jest.runAllTimers();
    });

    expect(setTimeoutMock).toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
    expect(clearTimeoutMock).not.toHaveBeenCalled();
  });

  test('should not logout if user is still authenticated', () => {
    // not sure about this case. under normal circumstances this should never happen.
    // if the session timer fires the user should not have a valid session at the backend anymore.
    const mock = {
      request: {
        query: GET_CURRENT_USER_IS_AUTHENTICATED,
      },
      result: {
        data: {
          currentUser: {
            isAuthenticated: true,
          },
        },
      },
    };

    const logout = jest.fn();
    const gmp = {
      logout,
    };
    const {render, store} = rendererWith({
      store: true,
      gmp,
      queryMocks: [mock],
    });

    const timeout = date().add(300, 'seconds');

    store.dispatch(setSessionTimeout(timeout));

    const {element} = render(<SessionObserver />);

    expect(element).toBeNull();

    act(() => {
      jest.runAllTimers();
    });

    expect(setTimeoutMock).toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(clearTimeoutMock).not.toHaveBeenCalled();
  });
});
