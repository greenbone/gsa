/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {connect} from 'react-redux';

import {withRouter} from 'react-router-dom';

import styled from 'styled-components';

import Rejection from 'gmp/http/rejection';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import withGmp from 'web/utils/withGmp';

import Logo from 'web/components/img/greenbone';

import Layout from 'web/components/layout/layout';

import Footer from 'web/components/structure/footer';
import Header from 'web/components/structure/header';

import {
  setSessionTimeout,
  setUsername,
  updateTimezone,
  setIsLoggedIn,
} from 'web/store/usersettings/actions';

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

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGuestLogin = this.handleGuestLogin.bind(this);
  }

  handleSubmit(username, password) {
    this.login(username, password);
  }

  handleGuestLogin() {
    const {gmp} = this.props;
    this.login(gmp.settings.guestUsername, gmp.settings.guestPassword);
  }

  login(username, password) {
    const {gmp} = this.props;

    gmp.login(username, password).then(
      data => {
        const {locale, timezone, sessionTimeout} = data;

        const {location, history} = this.props;

        this.props.setTimezone(timezone);
        this.props.setLocale(locale);
        this.props.setSessionTimeout(sessionTimeout);
        this.props.setUsername(username);
        // must be set before changing the location
        this.props.setIsLoggedIn(true);

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
      },
      rej => {
        log.error(rej);
        this.setState({error: rej});
      },
    );
  }

  componentDidMount() {
    // reset token
    const {gmp} = this.props;
    gmp.clearToken();
  }

  render() {
    const {error} = this.state;
    const {gmp} = this.props;

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
              onGuestLoginClick={this.handleGuestLogin}
              onSubmit={this.handleSubmit}
            />
          </LoginLayout>
          <LoginSpacer />
        </LoginBox>
        <Footer />
      </StyledLayout>
    );
  }
}

LoginPage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  setIsLoggedIn: PropTypes.func.isRequired,
  setLocale: PropTypes.func.isRequired,
  setSessionTimeout: PropTypes.func.isRequired,
  setTimezone: PropTypes.func.isRequired,
  setUsername: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  setTimezone: timezone => dispatch(updateTimezone(gmp)(timezone)),
  setLocale: locale => gmp.setLocale(locale),
  setSessionTimeout: timeout => dispatch(setSessionTimeout(timeout)),
  setUsername: username => dispatch(setUsername(username)),
  setIsLoggedIn: value => dispatch(setIsLoggedIn(value)),
});

export default compose(
  withRouter,
  withGmp,
  connect(
    null,
    mapDispatchToProps,
  ),
)(LoginPage);

// vim: set ts=2 sw=2 tw=80:
