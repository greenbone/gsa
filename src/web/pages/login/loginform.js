/* Copyright (C) 2016-2022 Greenbone AG
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
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import PasswordField from 'web/components/form/passwordfield';
import ErrorContainer from 'web/components/error/errorcontainer';
import useFormValues from 'web/components/form/useFormValues';
import ProductImage from 'web/components/img/product';
import GreenboneLoginLogo from 'web/components/img/greenboneloginlogo';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const Button = styled.button`
  box-sizing: border-box;
  color: ${Theme.white};
  background-color: ${Theme.loginButtonGray};
  border: none;
  border-radius: 3px;
  font-size: 1rem;
  font-weight: normal;
  min-height: 2.25rem;
  margin: 0;
  padding-right: 1.25rem;
  padding-left: 1.25rem;
  &:hover {
    cursor: pointer;
    background-color: ${Theme.loginButtonHover};
  }
  & + & {
    margin-left: 1.25rem;
  }
`;

const StyledFormGroup = styled(FormGroup)`
  display: flex;
  flex-grow: 1;
  margin: 0;
  font-family: 'DroidSans', Arial, sans-serif;
  width: 100%;
  margin-bottom: 1rem;
`;

const fieldStyles = () => `
  font-family: 'DroidSans', Arial, sans-serif;
  width: 100%;
  font-size: 12pt;
  margin-top: 16px;
  margin-bottom: 8px;
  border: none;
  border-bottom: 1px solid ${Theme.mediumDarkGray};
  transition: border-bottom-color 0.2s ease-in-out;
  &:hover {
    border-bottom: 2px solid ${Theme.darkGray};
  }
  &:focus {
    outline: none; 
    border-bottom: 2px solid ${Theme.darkGray};
  }
`;

const StyledTextField = styled(TextField)`
  ${fieldStyles()}
`;

const StyledPasswordField = styled(PasswordField)`
  ${fieldStyles()}
  margin-bottom: 4px;
`;

const Paper = styled(Layout)`
  background: ${Theme.white};
  box-shadow: 0px 14px 22px ${Theme.mediumGray};
  border-radius: 3px;
  padding: 4rem;
  width: 30rem;
  z-index: ${Theme.Layers.higher};
`;

const Panel = styled.div`
  margin: 5px auto;
  padding-bottom: 10px;
  font-size: 9pt;
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

const StyledErrorContainer = styled(ErrorContainer)`
  margin: 0 0 0 0;
  font-size: 15px;
  border-radius: 4px;
`;

const StyledButton = styled(Button)`
  width: 100%;
`;

const StyledPanel = styled(Panel)`
  margin-top: 20px;
`;

const H1 = styled.h1`
  display: flex;
  flex-grow: 1;
`;

const ProductImageContainer = styled(Layout)`
  margin-top: 30px;
`;

const LoginForm = ({
  error,
  showGuestLogin = false,
  showLogin = true,
  showProtocolInsecure = false,
  isIE11 = false,
  onGuestLoginClick,
  onSubmit,
}) => {
  const [{username, password}, handleValueChange] = useFormValues({
    username: '',
    password: '',
  });

  const handleSubmit = () => {
    if (isDefined(onSubmit)) {
      onSubmit(username, password);
    }
  };

  const handleKeyDown = event => {
    if (event.keyCode === KeyCode.ENTER) {
      handleSubmit();
    }
  };

  return (
    <Paper>
      <Divider flex="column" margin="10px" grow="1">
        <Layout align={'center'}>
          <GreenboneLoginLogo width="300px" />
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
          {isDefined(error) && (
            <StyledErrorContainer data-testid="error">
              {error}
            </StyledErrorContainer>
          )}

          {showLogin && !isIE11 && (
            <StyledLayout flex={'column'}>
              <H1>{_('Sign in to your account')}</H1>
              <StyledFormGroup size="12" paddingLeft="2px">
                <StyledTextField
                  autoComplete="username"
                  name="username"
                  grow="1"
                  placeholder={_('Username')}
                  value={username}
                  autoFocus={true}
                  tabIndex="1"
                  onChange={handleValueChange}
                />
              </StyledFormGroup>
              <StyledFormGroup size="12" paddingLeft="2px">
                <StyledPasswordField
                  autoComplete="current-password"
                  name="password"
                  grow="1"
                  placeholder={_('Password')}
                  value={password}
                  onKeyDown={handleKeyDown}
                  onChange={handleValueChange}
                />
              </StyledFormGroup>
              <StyledButton data-testid="login-button" onClick={handleSubmit}>
                {_('Sign In')}
              </StyledButton>
            </StyledLayout>
          )}
        </>

        {showGuestLogin && (
          <div data-testid="guest-login">
            <StyledButton
              data-testid="guest-login-button"
              onClick={onGuestLoginClick}
            >
              {_('Sign In as Guest')}
            </StyledButton>
          </div>
        )}

        <ProductImageContainer align={'center'}>
          <ProductImage />
        </ProductImageContainer>
      </Divider>
    </Paper>
  );
};

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
