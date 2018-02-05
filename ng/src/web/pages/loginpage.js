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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import logger from 'gmp/log.js';
import {is_defined, KeyCode, is_empty} from 'gmp/utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../utils/proptypes.js';

import FormGroup from '../components/form/formgroup.js';
import PasswordField from '../components/form/passwordfield.js';
import SubmitButton from '../components/form/submitbutton.js';
import TextField from '../components/form/textfield.js';

import GBIcon from '../components/icon/greenboneicon.js';
import Icon from '../components/icon/icon.js';

import Footer from '../components/structure/footer.js';
import Header from '../components/structure/header.js';
import Main from '../components/structure/main.js';

const log = logger.getLogger('web.login');

const panelcss = {
  marginTop: '5px',
  marginBottom: '5px',
  paddingBottom: '10px',
  width: '380px',
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

const Error = glamorous.p(
  'error',
  {
    color: '#d83636',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '10px',
  }
);

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};

    this.onSubmit = this.onSubmit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onSubmit() {
    if (!this.props.onSubmit) {
      return;
    }

    const {username, password} = this.state;
    this.props.onSubmit(username, password);
  }

  onValueChange(value, name) {
    this.setState({[name]: value});
  }

  onKeyDown(event) {
    if (event.keyCode === KeyCode.ENTER) {
      this.onSubmit(event);
    }
  }

  render() {
    const {error} = this.props;
    const {username, password} = this.state;
    const protocol_insecure = window.location.protocol !== 'https:';
    return (
      <Layout flex="column" shrink="0">
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
          align="space-around">
          <Layout
            flex="column"
            align="space-around"
            grow="1"
            width="380px"
          >
            <Layout flex="row">
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
                    onChange={this.onValueChange}/>
                </FormGroup>
                <FormGroup title={_('Password')} titleSize="4">
                  <PasswordField
                    name="password"
                    grow="1"
                    placeholder={_('Password')}
                    value={password}
                    onKeyDown={this.onKeyDown}
                    onChange={this.onValueChange}/>
                </FormGroup>
                <FormGroup size="4" offset="4">
                  <SubmitButton
                    flex
                    grow
                    title={_('Login')}
                    onClick={this.onSubmit}
                  />
                </FormGroup>
              </Layout>
            </Layout>
          </Layout>
        </LoginPanel>
        {is_defined(error) &&
          <Panel>
            <Error>{error}</Error>
          </Panel>
        }
      </Layout>
    );
  }
}

LoginForm.propTypes = {
  error: PropTypes.string,
  onSubmit: PropTypes.func,
};

const GreenboneIcon = glamorous(GBIcon)({
  minWidth: '60px',
  width: '100%',
  minHeight: '60px',
  height: '100%', // for IE11 fix
  maxHeight: '315px',
  margin: '40px 0px',
});

const LoginMain = glamorous(Main)({
  background: '#fefefe',
  height: '100%',
});

const LoginLayout = glamorous(Layout)({
  height: '100%',
});

const LoginHeader = glamorous(Header)({
  color: '#393637',
});

const StyledIcon = glamorous(Icon)({
  height: '95px',
  marginTop: '-7px',
});

const StyledLayout = glamorous(Layout)({
  margin: '0 auto',
  height: '100%',
});

const MenuSpacer = glamorous.div({
  minHeight: '35px',
  background: '#393637',
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

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(username, password) {
    const {router, gmp} = this.context;

    gmp.login(username, password).then(token => {
      const {location} = this.props;
      if (location && location.state && location.state.next &&
          location.state.next !== location.pathname) {
        router.replace(location.state.next);
      }
      else {
        router.replace('/ng');
      }
    }, rej => {
      log.error(rej);
      this.setState({error: rej});
    });
  }

  componentWillMount() {
    // reset token
    const {gmp} = this.context;
    gmp.token = undefined;
  }

  render() {
    const {error} = this.state;
    let message;

    if (error) {
      if (is_empty(error.message)) {
        message = _('Unknown error on login');
      }
      else {
        message = error.message;
      }
    }

    return (
      <LoginLayout flex="column" className="login">
        <LoginHeader/>
        <MenuSpacer/>
        <LoginMain>
          <StyledLayout
            flex="column"
            align={['start', 'center']}
            grow="1"
            position="relative">
            <GreenboneIcon/>
            <Wrapper>
              <LoginForm onSubmit={this.onSubmit} error={message}/>
            </Wrapper>
          </StyledLayout>
        </LoginMain>
        <Footer/>
      </LoginLayout>
    );
  }
}

LoginPage.contextTypes = {
  router: PropTypes.object.isRequired,
  gmp: PropTypes.gmp.isRequired,
};

export default LoginPage;

// vim: set ts=2 sw=2 tw=80:
