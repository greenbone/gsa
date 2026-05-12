/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Navigate, useNavigation} from 'react-router';
import Loading from 'web/components/loading/Loading';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import useUserName from 'web/hooks/useUserName';
import LoginPage from 'web/pages/login/LoginPage';
import {
  getLastVisitedPage,
  clearLastVisitedPage,
} from 'web/utils/user-last-visited-page';

const LoginPageRoute = () => {
  const isLoggedIn = useUserIsLoggedIn();
  const username = useUserName();
  const navigation = useNavigation();

  if (navigation.state === 'loading') {
    return <Loading />;
  }

  if (isLoggedIn) {
    let redirectPath = '/dashboards';
    if (username) {
      const lastVisited = getLastVisitedPage(username);
      if (lastVisited && lastVisited !== '/login') {
        redirectPath = lastVisited;
        clearLastVisitedPage(username);
      }
    }
    return <Navigate replace to={redirectPath} />;
  }

  return <LoginPage />;
};

export default LoginPageRoute;
