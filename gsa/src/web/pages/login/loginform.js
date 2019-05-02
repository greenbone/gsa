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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import PasswordField from 'web/components/form/passwordfield';
import Button from 'web/components/form/button';
import TextField from 'web/components/form/textfield';

import ProductImage from 'web/components/img/product';

import Layout from 'web/components/layout/layout';

import Table from 'web/components/table/simpletable';
import Body from 'web/components/table/body';
import Row from 'web/components/table/row';
import Data from 'web/components/table/data';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const LoginTable = styled(Table)`
  table-layout: fixed;
`;

const Panel = styled.div`
  width: 300px;
  margin: 5px auto;
  padding-bottom: 10px;
  font-size: 9pt;
`;

const LoginPanel = styled.div`
  display: flex;
  flex-direction: row;
`;

const Error = styled.p`
  color: ${Theme.warningRed};
  font-weight: bold;
  text-align: center;
  margin: 10px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${Theme.lightGray};
  padding: 10px;
  margin-bottom: 10px;
`;

const StyledData = styled(Data)`
  font-weight: bold;
  text-align: right;
  padding-right: 5px;
  table-layout: fixed;
  width: 200px;
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
        <Wrapper>
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

          {isIE11 && (
            <Panel data-testid="IE11">
              <Error>{_('Warning: You are using IE11')}</Error>
              <p>
                {_(
                  'You are using Internet Explorer 11. You might encounter appearance and performance issues.',
                )}
              </p>
            </Panel>
          )}

          <LoginPanel>
            <ProductImage />

            {showLogin && (
              <LoginTable>
                <Body>
                  <Row>
                    <StyledData>{_('Username')}</StyledData>
                    <Data>
                      <TextField
                        grow="1"
                        autoComplete="username"
                        name="username"
                        placeholder={_('e.g. johndoe')}
                        value={username}
                        autoFocus="autofocus"
                        tabIndex="1"
                        onChange={this.handleValueChange}
                      />
                    </Data>
                  </Row>
                  <Row>
                    <StyledData>{_('Password')}</StyledData>
                    <Data>
                      <PasswordField
                        autoComplete="current-password"
                        name="password"
                        grow="1"
                        placeholder={_('Password')}
                        value={password}
                        onKeyDown={this.handleKeyDown}
                        onChange={this.handleValueChange}
                      />
                    </Data>
                  </Row>
                  <Row>
                    <Data />
                    <Data>
                      <Button
                        data-testid="login-button"
                        title={_('Login')}
                        onClick={this.handleSubmit}
                      />
                    </Data>
                  </Row>
                </Body>
              </LoginTable>
            )}
          </LoginPanel>

          {isDefined(error) && (
            <Panel>
              <Error data-testid="error">{error}</Error>
            </Panel>
          )}
        </Wrapper>

        {showGuestLogin && (
          <Wrapper data-testid="guest-login">
            <LoginPanel>
              <Layout align={['center', 'center']}>
                <Button
                  data-testid="guest-login-button"
                  title={_('Login as Guest')}
                  onClick={onGuestLoginClick}
                />
              </Layout>
            </LoginPanel>
          </Wrapper>
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
