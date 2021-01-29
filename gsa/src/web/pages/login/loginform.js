/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {Button, Input} from '@greenbone/ui-components';

import _ from 'gmp/locale';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';
import ProductImage from 'web/components/img/product';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const Paper = styled.div`
  background: ${Theme.white};
  box-shadow: 0px 14px 22px ${Theme.mediumGray};
  padding: 4rem;
  max-width: 30rem;
`;

const Panel = styled.div`
  margin: 5px auto;
  padding-bottom: 10px;
  font-size: 9pt;
  border: 1px solid ${Theme.lightGray};
  padding: 10px;
  margin-bottom: 10px;
`;

const StyledLayout = styled(Layout)`
  min-height: 12rem;
  justify-content: space-evenly;
`;

const Error = styled.p`
  color: ${Theme.warningRed};
  font-weight: bold;
  text-align: center;
  margin: 10px;
`;

const StyledButton = styled(Button)`
  margin-top: 2rem;
  width: 100%;
`;

const StyledPanel = styled(Panel)`
  margin-top: 20px;
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
      <Paper>
        <Layout align={'center'}>
          <ProductImage />
        </Layout>
        <Layout flex={'column'}>
          {showProtocolInsecure && (
            <StyledPanel data-testid="protocol-insecure">
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
            </StyledPanel>
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

        <>
          {showLogin && !isIE11 && (
            <StyledLayout flex={'column'}>
              <Input
                margin={'normal'}
                type={'text'}
                autoComplete="username"
                name="username"
                grow="1"
                label={_('Username')}
                value={username}
                autoFocus="autofocus"
                tabIndex="1"
                onChange={e =>
                  this.handleValueChange(e.target.value, e.target.name)
                }
              />
              <Input
                margin={'normal'}
                type={'password'}
                autoComplete="current-password"
                name="password"
                grow="1"
                label={_('Password')}
                value={password}
                onKeyDown={this.handleKeyDown}
                onChange={e =>
                  this.handleValueChange(e.target.value, e.target.name)
                }
              />
              <StyledButton
                data-testid="login-button"
                onClick={this.handleSubmit}
              >
                {_('Login')}
              </StyledButton>
            </StyledLayout>
          )}
          {isDefined(error) && <Error data-testid="error">{error}</Error>}
        </>

        {showGuestLogin && (
          <div data-testid="guest-login">
            <StyledButton
              data-testid="guest-login-button"
              onClick={onGuestLoginClick}
            >
              {_('Login as Guest')}
            </StyledButton>
          </div>
        )}
      </Paper>
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
