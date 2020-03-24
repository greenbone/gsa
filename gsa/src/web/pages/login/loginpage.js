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

import {useMutation} from '@apollo/react-hooks';
import moment from 'gmp/models/date';

import gql from 'graphql-tag';

import {useSelector, useDispatch} from 'react-redux';

import {useHistory} from 'react-router-dom';

import styled from 'styled-components';

import Rejection from 'gmp/http/rejection';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Theme from 'web/utils/theme';
import useGmp from 'web/utils/useGmp';

import Logo from 'web/components/img/greenbone';

import Layout from 'web/components/layout/layout';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';

import {
  setSessionTimeout as setSessionTimeoutAction,
  setUsername as setUsernameAction,
  updateTimezone as updateTimezoneAction,
  setIsLoggedIn as setIsLoggedInAction,
} from 'web/store/usersettings/actions';

import {isLoggedIn as isLoggedInSelector} from 'web/store/usersettings/selectors';

import LoginForm from './loginform';

import {toGraphQL} from 'web/utils/graphql.js';

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ok
      sessionTimeout
      timezone
    }
  }
`;

const useLogin = () => {
  const [login] = useMutation(LOGIN);
  return toGraphQL(login);
};

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

const LoginPage = () => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const loginMutation = useLogin();
  // const location = useLocation(); might be needed again later
  const history = useHistory();
  const isLoggedIn = useSelector(isLoggedInSelector);

  const handleSubmit = (username, password) => {
    login(username, password);
  };

  const handleGuestLogin = () => {
    login(gmp.settings.guestUsername, gmp.settings.guestPassword);
  };

  const setLocale = locale => gmp.setLocale(locale);
  const setTimezone = timezone => dispatch(updateTimezoneAction(gmp)(timezone));
  const setSessionTimeout = timeout =>
    dispatch(setSessionTimeoutAction(timeout));
  const setUsername = username => dispatch(setUsernameAction(username));
  const setIsLoggedIn = value => dispatch(setIsLoggedInAction(value));

  const login = (username, password) => {
    loginMutation({username, password})
      .then(resp => {
        const {locale, timezone, sessionTimeout} = resp.data.login;

        const dateObj = new Date(sessionTimeout);

        setTimezone(timezone);
        setLocale(locale);
        setSessionTimeout(moment(dateObj)); // convert sessionTimeout to Moment instance
        setUsername(username);
      })
      .then(() => {
        // must be set before changing the location
        setIsLoggedIn(true);

        history.replace('/tasks'); // always redirect to tasks for demo purposes
      })
      .catch(rej => {
        log.error(rej);
        setError(rej);
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      history.replace('/tasks');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  let message;

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
