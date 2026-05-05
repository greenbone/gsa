/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useCallback} from 'react';
import {useLocation} from 'react-router';
import useGmp from 'web/hooks/useGmp';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import useUserName from 'web/hooks/useUserName';
import {saveLastVisitedPage} from 'web/utils/user-last-visited-page';

interface AuthorizedProps {
  children: React.ReactNode;
}

const Authorized = ({children}: AuthorizedProps) => {
  const gmp = useGmp();
  const location = useLocation();

  const isLoggedIn = useUserIsLoggedIn();
  const username = useUserName();

  const logout = useCallback(() => {
    if (username && location.pathname !== '/login') {
      const currentPath = `${location.pathname}${location.search ?? ''}`;
      saveLastVisitedPage(username, currentPath);
    }

    gmp.logout();
  }, [gmp, username, location]);

  const responseError = useCallback(
    (xhr: XMLHttpRequest) => {
      if (xhr.status === 401) {
        logout();
      }
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
