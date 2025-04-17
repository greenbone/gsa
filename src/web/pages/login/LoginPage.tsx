/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Rejection from 'gmp/http/rejection';
import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useLocation, useNavigate} from 'react-router';
import styled from 'styled-components';
import Img from 'web/components/img/Img';
import Layout from 'web/components/layout/Layout';
import Footer from 'web/components/structure/Footer';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import LoginForm from 'web/pages/login/LoginForm';
import CommunityFeedUsageNotification from 'web/pages/login/notifications/CommunityFeedUsageNotification';
import {
  setSessionTimeout,
  setUsername,
  setIsLoggedIn,
} from 'web/store/usersettings/actions';
import Theme from 'web/utils/Theme';

interface ErrorType {
  message?: string;
  reason?: string;
}

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

const BackgroundTopImage = styled(Img)`
  position: fixed;
  top: 0;
  right: 0;
`;

const BackgroundBottomImage = styled(Img)`
  position: fixed;
  bottom: 0;
  left: 0;
`;

const isIE11 = () => {
  const match = /Trident\/([\d.]+)/.exec(navigator.userAgent);
  return match ? +match[1] >= 7 : false;
};

const LoginPage: React.FC = () => {
  const gmp = useGmp();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isLoggedIn] = useUserIsLoggedIn();
  const [error, setError] = useState<ErrorType>();
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
  }, [isLoggedIn, navigate]);

  const login = async (username: string, password: string) => {
    try {
      const data = await gmp.login(username, password);

      const {locale, timezone, sessionTimeout} = data;

      gmp.setTimezone(timezone);
      gmp.setLocale(locale);
      dispatch(setSessionTimeout(sessionTimeout));
      dispatch(setUsername(username));
      // must be set before changing the location

      dispatch(setIsLoggedIn(true));

      if (location?.state?.next && location.state.next !== location.pathname) {
        await navigate(location.state.next, {replace: true});
      } else {
        await navigate('/dashboards', {replace: true});
      }
    } catch (error) {
      log.error(error);
      setError(error as ErrorType);
    }

    try {
      // @ts-expect-error
      const userSettings = await gmp.user.currentSettings();

      localStorage.setItem(
        'userInterfaceTimeFormat',
        userSettings.data.userinterfacetimeformat.value,
      );
      localStorage.setItem(
        'userInterfaceDateFormat',
        userSettings.data.userinterfacedateformat.value,
      );

      // @ts-expect-error
      const isCommunityFeed: boolean = await gmp.feedstatus.isCommunityFeed();

      if (isCommunityFeed) {
        CommunityFeedUsageNotification();
      }
    } catch (error) {
      log.error(error);
    }
  };

  const handleSubmit = async (username: string, password: string) => {
    await login(username, password);
  };

  const handleGuestLogin = async () => {
    await login(gmp.settings.guestUsername, gmp.settings.guestPassword);
  };

  let message: string | undefined;

  if (error) {
    if (error.reason === Rejection.REASON_UNAUTHORIZED) {
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
      <BackgroundTopImage src="login-top.svg" />
      <BackgroundBottomImage src="login-bottom.svg" />
      <LoginForm
        error={message}
        isIE11={isIE11()}
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
