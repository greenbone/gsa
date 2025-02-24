/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Rejection from 'gmp/http/rejection';
import _ from 'gmp/locale';
import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import Img from 'web/components/img/Img';
import Layout from 'web/components/layout/Layout';
import Footer from 'web/components/structure/Footer';
import LoginForm from 'web/pages/login/LoginForm';
import {
  setSessionTimeout,
  setUsername,
  updateTimezone,
  setIsLoggedIn,
} from 'web/store/usersettings/actions';
import {isLoggedIn} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';
import withGmp from 'web/utils/withGmp';
import {withRouter} from 'web/utils/withRouter';


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

  async login(username, password) {
    const {gmp} = this.props;

    try {
      const data = await gmp.login(username, password);

      const {location, navigate} = this.props;
      const {locale, timezone, sessionTimeout} = data;

      this.props.setTimezone(timezone);
      this.props.setLocale(locale);
      this.props.setSessionTimeout(sessionTimeout);
      this.props.setUsername(username);
      // must be set before changing the location
      this.props.setIsLoggedIn(true);

      if (location?.state?.next && location.state.next !== location.pathname) {
        navigate(location.state.next, {replace: true});
      } else {
        navigate('/dashboards', {replace: true});
      }
    } catch (error) {
      log.error(error);
      this.setState({error});
    }

    try {
      const userSettings = await gmp.user.currentSettings();

      localStorage.setItem(
        'userInterfaceTimeFormat',
        userSettings.data.userinterfacetimeformat.value,
      );
      localStorage.setItem(
        'userInterfaceDateFormat',
        userSettings.data.userinterfacedateformat.value,
      );
    } catch (error) {
      log.error(error);
    }
  }

  componentDidMount() {
    const {navigate, isLoggedIn = false} = this.props;

    // redirect user to main page if he is already logged in
    if (isLoggedIn) {
      navigate('/dashboards', {replace: true});
    }
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
        <BackgroundTopImage src="login-top.svg" />
        <BackgroundBottomImage src="login-bottom.svg" />
        <LoginForm
          error={message}
          isIE11={isIE11()}
          showGuestLogin={showGuestLogin}
          showLogin={showLogin}
          showProtocolInsecure={showProtocolInsecure}
          onGuestLoginClick={this.handleGuestLogin}
          onSubmit={this.handleSubmit}
        />
        <Footer />
      </StyledLayout>
    );
  }
}

LoginPage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  navigate: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
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

const mapStateToProp = (rootState, ownProps) => ({
  isLoggedIn: isLoggedIn(rootState),
});

export default compose(
  withRouter,
  withGmp,
  connect(mapStateToProp, mapDispatchToProps),
)(LoginPage);
