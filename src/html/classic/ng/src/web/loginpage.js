/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../locale.js';
import {autobind, KeyCode, is_empty} from '../utils.js';
import logger from '../log.js';

import Header from './header.js';
import Footer from './footer.js';
import Layout from './layout.js';
import Main from './main.js';

import FormGroup from './form/formgroup.js';
import TextField from './form/textfield.js';
import PasswordField from './form/passwordfield.js';
import SubmitButton from './form/submitbutton.js';

import Icon from './icons/icon.js';

import './css/login.css';

const log = logger.getLogger('web.login');

export class LoginPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      error: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(username, password) {
    let {router, gmp} = this.context;

    gmp.login(username, password).then(token => {
      let {location} = this.props;
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
    let {gmp} = this.context;
    gmp.token = undefined;
  }

  render() {
    let {type} = this.props.location.query;
    let {error} = this.state;
    let message;

    switch (type) {
      case 'failed':
        message = _('Login failed.');
        break;
      case 'error':
        message = _('Login failed. Error during authentication.');
        break;
      case 'gmpdown':
        message = _('Login failed. GMP Service is down.');
        break;
      case 'session':
        message = _('Session expired. Please login again.');
        break;
      case 'already':
        message = _('Already logged out.');
        break;
      case 'token':
        message = _('Token missing or bad. Please login again.');
        break;
      case 'cookie':
        message = _('Cookie missing or bad. Please login again.');
        break;
      case 'logout':
        message = _('Successfully logged out.');
        break;
      default:
        break;
    }

    if (error) {
      if (is_empty(error.message)) {
        message = _('Unknown error on login');
      }
      else {
        message = error.message;
      }
    }

    return (
      <Layout flex="column" className="login">
        <Header/>
        <Main flex align={['space-around', 'center']} wrap>
          <LoginForm onSubmit={this.onSubmit} error={message}/>
          <LogoBox/>
        </Main>
        <Footer/>
      </Layout>
    );
  }
}

LoginPage.contextTypes = {
  router: React.PropTypes.object.isRequired,
  gmp: React.PropTypes.object.isRequired,
};


const LogoBox = () => {
  return (
    <Icon className="greenbone-icon" size="default" img="greenbone.svg"/>
  );
};

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};

    autobind(this, 'on');
  }

  onSubmit(event) {
    event.preventDefault();

    if (!this.props.onSubmit) {
      return;
    }

    let {username, password} = this.state;
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
    let {error} = this.props;
    let {username, password} = this.state;
    let protocol_insecure = (window.location.protocol !== 'https:');
    return (
      <Layout flex="column">
        {error &&
          <div className="login-panel">
            <p className="error">{error}</p>
          </div>
        }
        {protocol_insecure &&
          <div className="login-panel">
            <p className="error">{_('Warning: Connection unencrypted')}</p>
            <p>{_('The connection to this GSA is not encrypted, allowing anyone listening to the traffic to steal your credentials.')}</p>
            <p>{_('Please configure a TLS certificate for the HTTPS service or ask your administrator to do so as soon as possible.')}</p>
          </div>
        }
        <Layout flex align="space-around" className="login-panel">
          <Icon img="login-label.png" size="default"/>
          <Layout flex="column" align="space-around" grow="1">
            <Layout flex="column">
              <FormGroup title={_('Username')} titleSize="4">
                <TextField name="username"
                  grow="1"
                  placeholder={_('e.g. johndoe')}
                  value={username}
                  autoFocus="autofocus"
                  tabIndex="1"
                  onChange={this.onValueChange}/>
              </FormGroup>
              <FormGroup title={_('Password')} titleSize="4">
                <PasswordField name="password"
                  grow="1"
                  placeholder={_('Password')}
                  value={password}
                  onKeyDown={this.onKeyDown}
                  onChange={this.onValueChange}/>
              </FormGroup>
            </Layout>
            <FormGroup size="6" offset="6">
              <SubmitButton title={_('Login')} onClick={this.onSubmit}/>
            </FormGroup>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

LoginForm.propTypes = {
  onSubmit: React.PropTypes.func,
  error: React.PropTypes.string,
};

export default LoginPage;

// vim: set ts=2 sw=2 tw=80:
