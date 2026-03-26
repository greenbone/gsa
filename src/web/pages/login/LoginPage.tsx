/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import {notifications} from '@mantine/notifications';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router';
import styled from 'styled-components';
import {ResponseRejection} from 'gmp/http/rejection';
import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import Image from 'web/components/img/Image';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Footer from 'web/components/structure/Footer';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import LoginForm from 'web/pages/login/LoginForm';
import {
  setSessionTimeout,
  setUsername,
  setIsLoggedIn,
  setTimezone,
} from 'web/store/usersettings/actions';
import Theme from 'web/utils/Theme';
import {
  getLastVisitedPage,
  clearLastVisitedPage,
} from 'web/utils/user-last-visited-page';

const log = logger.getLogger('web.login');
const StyledLayout = styled(Layout)`
  background: radial-gradient(
    51.84% 102.52% at 58.54% 44.97%,
    #a1ddba 0%,
    ${Theme.green} 67.26%
  );
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const BackgroundTopImage = styled(Image)`
  position: fixed;
  top: 0;
  right: 0;
`;

const BackgroundBottomImage = styled(Image)`
  position: fixed;
  bottom: 0;
  left: 0;
`;

const LoginPage = () => {
  const gmp = useGmp();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoggedIn] = useUserIsLoggedIn();
  const [error, setError] = useState<Error>();
  const [_] = useTranslation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      // redirect user to main page if he is already logged in

      if (isLoggedIn) {
        try {
          await navigate('/dashboards', {replace: true});
        } catch (error) {
          log.error(error);
        }
      }
    };

    void checkLoginStatus();

    notifications.clean();
  }, [isLoggedIn, navigate]);

  const login = async (username: string, password: string) => {
    try {
      const data = await gmp.login(username, password);

      const {locale, timezone, sessionTimeout} = data;

      gmp.setTimezone(timezone);
      gmp.setLocale(locale);
      dispatch(setSessionTimeout(sessionTimeout));
      dispatch(setUsername(username));
      dispatch(setTimezone(timezone));

      dispatch(setIsLoggedIn(true));

      const userLastVisitedPath = getLastVisitedPage(username);

      // Only redirect to saved page if it exists for THIS specific user
      // Otherwise always redirect to homepage
      let redirectPath = '/dashboards';

      if (userLastVisitedPath && userLastVisitedPath !== '/login') {
        redirectPath = userLastVisitedPath;
        clearLastVisitedPage(username);
      }

      await navigate(redirectPath, {replace: true});
    } catch (error) {
      log.error(error);
      setError(error as Error);
    }

    try {
      const {data: userSettings} = await gmp.user.currentSettings();

      localStorage.setItem(
        'userInterfaceTimeFormat',
        userSettings.userinterfacetimeformat?.value as string,
      );
      localStorage.setItem(
        'userInterfaceDateFormat',
        userSettings.userinterfacedateformat?.value as string,
      );
    } catch (error) {
      log.error(error);
    }
  };

  const handleSubmit = async (username: string, password: string) => {
    await login(username, password);
  };

  const handleGuestLogin = async () => {
    await login(
      gmp.settings.guestUsername ?? 'guest',
      gmp.settings.guestPassword ?? 'guest',
    );
  };

  let message: string | undefined;

  if (error) {
    if (error instanceof ResponseRejection && error.status === 401) {
      message = _('Login Failed. Invalid password or username.');
    } else if (isEmpty(error.message)) {
      message = _('Unknown error on login.');
    } else {
      message = error.message;
    }
  }

  const showGuestLogin =
    isDefined(gmp.settings.guestUsername) &&
    isDefined(gmp.settings.guestPassword);

  const showLogin = !gmp.settings.disableLoginForm;
  const showProtocolInsecure = window.location.protocol !== 'https:';

  return (
    <StyledLayout>
      <PageTitle />
      <BackgroundTopImage src="login-top.svg" />
      <BackgroundBottomImage src="login-bottom.svg" />
      <LoginForm
        error={message}
        showGuestLogin={showGuestLogin}
        showLogin={showLogin}
        showProtocolInsecure={showProtocolInsecure}
        onGuestLoginClick={handleGuestLogin}
        onSubmit={handleSubmit}
      />
      <Footer />
    </StyledLayout>
  );
};

export default LoginPage;
