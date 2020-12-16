/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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

import React, {useState, useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {useHistory, useLocation} from 'react-router-dom';

import styled from 'styled-components';

import Rejection from 'gmp/http/rejection';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import moment from 'gmp/models/date';

import {isDefined, hasValue} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Logo from 'web/components/img/greenbone';

import Layout from 'web/components/layout/layout';

import {useLogin} from 'web/graphql/auth';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';

import {
  setSessionTimeout as setSessionTimeoutAction,
  setUsername as setUsernameAction,
  updateTimezone as updateTimezoneAction,
  setIsLoggedIn as setIsLoggedInAction,
} from 'web/store/usersettings/actions';

import {isLoggedIn as isLoggedInSelector} from 'web/store/usersettings/selectors';

import Theme from 'web/utils/theme';
import useGmp from 'web/utils/useGmp';

import LoginForm from './loginform';

const log = logger.getLogger('web.login');

const GreenboneLogo = styled(Logo)`
  width: 30vh;
  margin: 30px auto;
  position: sticky;
`;

const LoginBox = styled(Layout)`
  ${'' /* flex-grow: 1; */}
  width: 100%;
  flex-direction: row;
  align-items: stretch;
`;

const LoginSpacer = styled(Layout)`
  width: 42%;
`;

const LoginLayout = styled(Layout)`
  height: 100%;
  padding: 20px 20px 0px 20px;
`;

const StyledLayout = styled(Layout)`
  flex-direction: column;
  height: 100vh;
`;

const LoginHeader = styled(Header)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const MenuSpacer = styled.div`
  background: ${Theme.darkGray};
  position: fixed;
  top: 42px;
  left: 0;
  right: 0;
  height: 35px;
  z-index: ${Theme.Layers.menu};
`;

const isIE11 = () =>
  navigator.userAgent.match(/Trident\/([\d.]+)/)
    ? +navigator.userAgent.match(/Trident\/([\d.]+)/)[1] >= 7
    : false;

const getErrorsDetails = (errors = []) => errors.map(e => e.message).join('. ');

const getErrorMessage = error => {
  if (error.reason === Rejection.REASON_UNAUTHORIZED) {
    return _('Login Failed. Invalid password or username.');
  }

  if (isEmpty(error.message)) {
    return _('Unknown error on login.');
  }

  let errors;
  let {message, networkError, graphQLErrors} = error;

  if (hasValue(networkError)) {
    errors = networkError?.result?.errors;
  } else if (hasValue(graphQLErrors)) {
    errors = graphQLErrors;
  }

  if (isDefined(errors)) {
    message += ': ' + getErrorsDetails(errors) + '.';
  }
  return message;
};

const LoginPage = () => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [loginMutation] = useLogin();
  const location = useLocation();
  const history = useHistory();
  const isLoggedIn = useSelector(isLoggedInSelector);

  let login;

  const handleSubmit = (username, password) => {
    login(username, password);
  };

  const handleGuestLogin = () => {
    login(gmp.settings.guestUsername, gmp.settings.guestPassword);
  };

  const setLocale = locale => gmp.setLocale(locale);
  const setTimezone = timezone => dispatch(updateTimezoneAction(gmp)(timezone));
  const setSessionTimeout = timeout =>
    dispatch(setSessionTimeoutAction(moment(timeout)));
  const setUsername = username => dispatch(setUsernameAction(username));
  const setIsLoggedIn = value => dispatch(setIsLoggedInAction(value));

  if (gmp.settings.enableHyperionOnly) {
    login = (username, password) => {
      loginMutation({username, password})
        .then(resp => {
          const {locale, timezone, sessionTimeout} = resp.data.login;

          gmp.settings.username = username;
          gmp.settings.timezone = timezone;
          gmp.settings.locale = locale;

          setTimezone(timezone);
          setLocale(locale);
          setSessionTimeout(sessionTimeout);
          setUsername(username);

          // must be set before changing the location
          setIsLoggedIn(true);

          history.replace('/tasks'); // always redirect to tasks for demo purposes. This should be changed to '/' once hyperion is no longer in demo.
        })
        .catch(err => {
          log.error(err);
          setError(err);
        });
    };
  } else {
    login = (username, password) => {
      let gmpLoginData;
      gmp.login
        .login(username, password) // put gmp.login back into promise chain
        .then(loginData => {
          gmpLoginData = loginData;
          return loginMutation({username, password});
        })
        .then(response => {
          const {locale, timezone, sessionTimeout} = response.data.login;
          const {token} = gmpLoginData;

          // only store settings if both logins have been successfully
          gmp.settings.username = username;
          gmp.settings.timezone = timezone;
          gmp.settings.token = token;
          gmp.settings.locale = locale;

          setTimezone(timezone);
          setLocale(locale);
          setSessionTimeout(sessionTimeout);
          setUsername(username);
          // must be set before changing the location
          setIsLoggedIn(true);

          if (
            location &&
            location.state &&
            location.state.next &&
            location.state.next !== location.pathname
          ) {
            history.replace(location.state.next);
          } else {
            history.replace('/');
          }
        })
        .catch(rej => {
          log.error(rej);
          setError(rej);
        });
    };
  }

  useEffect(() => {
    if (isLoggedIn) {
      history.replace('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const message = error ? getErrorMessage(error) : undefined;

  const showGuestLogin =
    isDefined(gmp.settings.guestUsername) &&
    isDefined(gmp.settings.guestPassword);

  const showLogin = !gmp.settings.disableLoginForm;
  const showProtocolInsecure = window.location.protocol !== 'https:';

  return (
    <StyledLayout>
      <LoginHeader />
      <MenuSpacer />
      <LoginBox>
        <LoginSpacer />
        <LoginLayout flex="column" className="login">
          <GreenboneLogo />
          <LoginForm
            error={message}
            showGuestLogin={showGuestLogin}
            showLogin={showLogin}
            showProtocolInsecure={showProtocolInsecure}
            isIE11={isIE11()}
            onGuestLoginClick={handleGuestLogin}
            onSubmit={handleSubmit}
          />
        </LoginLayout>
        <LoginSpacer />
      </LoginBox>
      <Footer />
    </StyledLayout>
  );
};

export default LoginPage;

// vim: set ts=2 sw=2 tw=80:
