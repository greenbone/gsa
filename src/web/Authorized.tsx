/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import useGmp from 'web/hooks/useGmp';
import {setIsLoggedIn} from 'web/store/usersettings/actions';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';

interface AuthorizedProps {
  children: React.ReactNode;
}

const Authorized = ({children}: AuthorizedProps) => {
  const gmp = useGmp();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(selectIsLoggedIn);

  const logout = useCallback(() => {
    gmp.logout();
    dispatch(setIsLoggedIn(false));
  }, [dispatch, gmp]);

  const responseError = useCallback(
    (xhr: XMLHttpRequest) => {
      if (xhr.status === 401) {
        logout();
        return Promise.resolve(xhr);
      }
      return Promise.reject(xhr);
    },
    [logout],
  );

  useEffect(() => {
    const unsubscribe = gmp.addHttpErrorHandler(responseError);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [gmp, responseError]);

  return isLoggedIn ? children : null;
};

export default Authorized;
