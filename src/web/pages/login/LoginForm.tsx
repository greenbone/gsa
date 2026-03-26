/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import ErrorContainer from 'web/components/error/ErrorContainer';
import Button from 'web/components/form/Button';
import FormGroup from 'web/components/form/FormGroup';
import PasswordField from 'web/components/form/PasswordField';
import TextField from 'web/components/form/TextField';
import useFormValues from 'web/components/form/useFormValues';
import LoginLogo from 'web/components/img/LoginLogo';
import ProductImage from 'web/components/img/ProductImage';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface LoginFormProps {
  error?: string;
  showGuestLogin?: boolean;
  showLogin?: boolean;
  showProtocolInsecure?: boolean;
  onGuestLoginClick: () => void;
  onSubmit: (username: string, password: string) => void;
}

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
  onGuestLoginClick,
  onSubmit,
}: LoginFormProps) => {
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
          <LoginLogo />
        </Layout>

        <Layout flex="column">
          {showProtocolInsecure && (
            <StyledPanel data-testid="protocol-insecure">
              <StyledWarningError>
                {_('Warning: Connection unencrypted')}
              </StyledWarningError>
              <p>
                {_(
                  'The connection to this web application is not encrypted, allowing ' +
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

        <>
          {isDefined(error) && (
            <StyledErrorContainer data-testid="error">
              {error}
            </StyledErrorContainer>
          )}

          {showLogin && (
            <FormGroup>
              <H1>{_('Sign in to your account')}</H1>
              <TextField
                autoComplete="username"
                autoFocus={true}
                name="username"
                placeholder={_('Username')}
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

export default LoginForm;
