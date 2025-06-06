/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import ErrorContainer from 'web/components/error/ErrorContainer';
import Button from 'web/components/form/Button';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import TextField from 'web/components/form/TextField';
import useFormValues from 'web/components/form/useFormValues';
import GreenboneLoginLogo from 'web/components/img/GreenboneLoginLogo';
import ProductImage from 'web/components/img/Product';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

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

const StyledWarningError = styled.p`
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
  const [_] = useTranslation();
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
      <Divider flex="column" grow="1" margin="10px">
        <Layout align="center">
          <GreenboneLoginLogo width="300px" />
        </Layout>

        <Layout flex="column">
          {showProtocolInsecure && (
            <StyledPanel data-testid="protocol-insecure">
              <StyledWarningError>
                {_('Warning: Connection unencrypted')}
              </StyledWarningError>
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
              <StyledWarningError>
                {_('Warning: You are using IE11')}
              </StyledWarningError>
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
            <FormGroup>
              <H1>{_('Sign in to your account')}</H1>
              <TextField
                autoComplete="username"
                autoFocus={true}
                name="username"
                placeholder={_('Username')}
                tabIndex="1"
                title={_('Username')}
                value={username}
                onChange={handleValueChange}
              />
              <PasswordField
                autoComplete="current-password"
                name="password"
                placeholder={_('Password')}
                title={_('Password')}
                value={password}
                onChange={handleValueChange}
                onKeyDown={handleKeyDown}
              />
              <Button data-testid="login-button" onClick={handleSubmit}>
                {_('Sign in')}
              </Button>
            </FormGroup>
          )}
        </>

        {showGuestLogin && (
          <FormGroup data-testid="guest-login">
            <Button
              data-testid="guest-login-button"
              onClick={onGuestLoginClick}
            >
              {_('Sign in as Guest')}
            </Button>
          </FormGroup>
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
