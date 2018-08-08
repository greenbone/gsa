/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {withRouter} from 'react-router-dom';

import glamorous from 'glamorous';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Layout from '../components/layout/layout.js';

import PropTypes from '../utils/proptypes.js';
import compose from '../utils/compose';
import withGmp from '../utils/withGmp';
import Theme from 'web/utils/theme';

import FormGroup from '../components/form/formgroup.js';
import PasswordField from '../components/form/passwordfield.js';
import SubmitButton from '../components/form/submitbutton.js';
import TextField from '../components/form/textfield.js';

import GBIcon from '../components/icon/greenboneicon.js';
import Icon from '../components/icon/icon.js';

import Footer from '../components/structure/footer.js';
import Header from '../components/structure/header.js';

const log = logger.getLogger('web.login');

const panelcss = {
  marginTop: '5px',
  marginBottom: '5px',
  paddingBottom: '10px',
  fontSize: '9pt',
};

const Panel = glamorous.div(
  'login-panel',
  panelcss,
);

const LoginPanel = glamorous(Layout)(
  'login-panel',
  panelcss,
);

const Div = glamorous.div({
  display: 'flex',
  flexDirection: 'row',
  margin: '0 auto',
});

const Error = glamorous.p(
  'error',
  {
    color: Theme.warningRed,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '10px',
  }
);

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleSubmit() {
    const {onSubmit} = this.props;

    if (!isDefined(onSubmit)) {
      return;
    }

    const {username, password} = this.state;
    onSubmit(username, password);
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleKeyDown(event) {
    if (event.keyCode === KeyCode.ENTER) {
      this.handleSubmit(event);
    }
  }

  render() {
    const {error} = this.props;
    const {username, password} = this.state;
    const protocol_insecure = window.location.protocol !== 'https:';
    return (
      <React.Fragment>
        {protocol_insecure &&
          <Panel>
            <Error>{_('Warning: Connection unencrypted')}</Error>
            <p>{_('The connection to this GSA is not encrypted, allowing ' +
              'anyone listening to the traffic to steal your credentials.')}</p>
            <p>{_('Please configure a TLS certificate for the HTTPS service ' +
              'or ask your administrator to do so as soon as possible.')}</p>
          </Panel>
        }

        <LoginPanel
          flex="column"
          align="space-around"
        >
          <Layout flex="row">
            <Div>
              <StyledIcon img="login-label.png" size="default"/>
              <Layout flex="column">
                <FormGroup title={_('Username')} titleSize="4">
                  <TextField
                    name="username"
                    grow="1"
                    placeholder={_('e.g. johndoe')}
                    value={username}
                    autoFocus="autofocus"
                    tabIndex="1"
                    onChange={this.handleValueChange}
                  />
                </FormGroup>
                <FormGroup title={_('Password')} titleSize="4">
                  <PasswordField
                    name="password"
                    grow="1"
                    placeholder={_('Password')}
                    value={password}
                    onKeyDown={this.handleKeyDown}
                    onChange={this.handleValueChange}
                  />
                </FormGroup>
                <FormGroup size="4" offset="4">
                  <SubmitButton
                    flex
                    grow
                    title={_('Login')}
                    onClick={this.handleSubmit}
                  />
                </FormGroup>
              </Layout>
            </Div>
          </Layout>
        </LoginPanel>
        {isDefined(error) &&
          <Panel>
            <Error>{error}</Error>
          </Panel>
        }
      </React.Fragment>
    );
  }
}

LoginForm.propTypes = {
  error: PropTypes.string,
  onSubmit: PropTypes.func,
};

const GreenboneIcon = glamorous(GBIcon)({
  width: '30vh',
  margin: '30px auto',
  position: 'sticky',
});

const LoginLayout = glamorous(Layout)({
  height: '100%',
  width: '420px',
  margin: '0 auto',
  padding: '20px 20px 0px 20px',
});

const StyledLayout = glamorous(Layout)({
  flexDirection: 'column',
  height: '100vh',
});

const LoginHeader = glamorous(Header)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
});

const StyledIcon = glamorous(Icon)({
  height: '95px',
  marginLeft: '5px',
});

const MenuSpacer = glamorous.div({
  background: '#393637',
  position: 'absolute',
  top: '42px',
  left: 0,
  right: 0,
  height: '35px',
  zIndex: '500',
});

const Wrapper = glamorous.div({
    border: '1px solid #ddd',
    padding: '10px',
});

class LoginPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      error: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(username, password) {
    const {history, gmp} = this.props;

    gmp.login(username, password).then(token => {
      const {location} = this.props;
      if (location && location.state && location.state.next &&
          location.state.next !== location.pathname) {
        history.replace(location.state.next);
      }
      else {
        history.replace('/');
      }
    }, rej => {
      log.error(rej);
      this.setState({error: rej});
    });
  }

  componentWillMount() {
    // reset token
    const {gmp} = this.props;
    gmp.token = undefined;
  }

  render() {
    const {error} = this.state;
    let message;

    if (error) {
      if (isEmpty(error.message)) {
        message = _('Unknown error on login');
      }
      else {
        message = error.message;
      }
    }

    return (
      <StyledLayout>
        <LoginHeader/>
        <MenuSpacer/>
        <LoginLayout flex="column" className="login">
          <GreenboneIcon/>
          <Wrapper>
            <LoginForm
              error={message}
              onSubmit={this.handleSubmit}
            />
          </Wrapper>
        </LoginLayout>
        <Footer/>
      </StyledLayout>
    );
  }
}

LoginPage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default compose(
  withRouter,
  withGmp,
)(LoginPage);

// vim: set ts=2 sw=2 tw=80:
