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
import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import PasswordField from 'web/components/form/passwordfield';
import Button from 'web/components/form/button';
import TextField from 'web/components/form/textfield';
import FormGroup from 'web/components/form/formgroup';

import ProductImage from 'web/components/img/product';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const Panel = styled.div`
  margin: 5px auto;
  padding-bottom: 10px;
  font-size: 9pt;
  border: 1px solid ${Theme.lightGray};
  padding: 10px;
  margin-bottom: 10px;
`;

const LoginPanel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  border: 1px solid ${Theme.lightGray};
  padding: 10px;
  margin-bottom: 10px;
`;

const Error = styled.p`
  color: ${Theme.warningRed};
  font-weight: bold;
  text-align: center;
  margin: 10px;
`;

const StyledDivRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const StyledDivColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

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
    const {
      error,
      showGuestLogin = false,
      showLogin = true,
      showProtocolInsecure = false,
      isIE11 = false,
      onGuestLoginClick,
    } = this.props;
    const {username, password} = this.state;
    return (
      <React.Fragment>
        <Layout>
          {showProtocolInsecure && (
            <Panel data-testid="protocol-insecure">
              <Error>{_('Warning: Connection unencrypted')}</Error>
              <p>
                {_(
                  'The connection to this GSA is not encrypted, allowing ' +
                    'anyone listening to the traffic to steal your credentials.',
                )}
              </p>
              <p>
                {_(
                  'Please configure a TLS certificate for the HTTPS service ' +
                    'or ask your administrator to do so as soon as possible.',
                )}
              </p>
            </Panel>
          )}
        </Layout>

        <Layout>
          {isIE11 && (
            <Panel data-testid="IE11">
              <Error>{_('Warning: You are using IE11')}</Error>
              <p>
                {_(
                  'You are using Internet Explorer 11. This browser is not supported anymore. Please use an up-to-date alternative or contact your system administrator.',
                )}
              </p>
            </Panel>
          )}
        </Layout>

        <LoginPanel>
          <StyledDivColumn>
            <StyledDivRow>
              <ProductImage />
              {showLogin && !isIE11 && (
                <Layout flex="column">
                  <FormGroup title={_('Username')} titleSize="4">
                    <TextField
                      autoComplete="username"
                      name="username"
                      grow="1"
                      placeholder={_('Username')}
                      value={username}
                      autoFocus="autofocus"
                      tabIndex="1"
                      onChange={this.handleValueChange}
                    />
                  </FormGroup>
                  <FormGroup title={_('Password')} titleSize="4">
                    <PasswordField
                      autoComplete="current-password"
                      name="password"
                      grow="1"
                      placeholder={_('Password')}
                      value={password}
                      onKeyDown={this.handleKeyDown}
                      onChange={this.handleValueChange}
                    />
                  </FormGroup>
                  <FormGroup size="4" offset="4">
                    <Layout grow="1">
                      <Button
                        data-testid="login-button"
                        title={_('Login')}
                        onClick={this.handleSubmit}
                      />
                    </Layout>
                  </FormGroup>
                </Layout>
              )}
            </StyledDivRow>
            {isDefined(error) && <Error data-testid="error">{error}</Error>}
          </StyledDivColumn>
        </LoginPanel>

        {showGuestLogin && (
          <LoginPanel data-testid="guest-login">
            <Layout align={['center', 'center']}>
              <Button
                data-testid="guest-login-button"
                title={_('Login as Guest')}
                onClick={onGuestLoginClick}
              />
            </Layout>
          </LoginPanel>
        )}
      </React.Fragment>
    );
  }
}

LoginForm.propTypes = {
  error: PropTypes.string,
  isIE11: PropTypes.bool,
  showGuestLogin: PropTypes.bool,
  showLogin: PropTypes.bool,
  showProtocolInsecure: PropTypes.bool,
  onGuestLoginClick: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default LoginForm;

// vim: set ts=2 sw=2 tw=80:
