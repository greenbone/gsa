/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, screen, rendererWith, fireEvent} from 'web/testing';
import LoginForm from 'web/pages/login/LoginForm';

const gmp = {settings: {}};

describe('LoginForm tests', () => {
  test('should render full LoginForm', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        showGuestLogin
        showLogin
        showProtocolInsecure
        error="An Error Occurred"
        onGuestLoginClick={handleClick}
        onSubmit={handleSubmit}
      />,
    );

    expect(screen.getByName('username')).toBeInTheDocument();
    expect(screen.getByName('password')).toBeInTheDocument();
  });

  test('should display error', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        error="An Error Occurred"
        onGuestLoginClick={handleClick}
        onSubmit={handleSubmit}
      />,
    );

    expect(screen.getByTestId('error')).toHaveTextContent('An Error Occurred');
  });

  test('should not display error by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onGuestLoginClick={handleClick} onSubmit={handleSubmit} />,
    );

    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('should display insecure protocol message', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        showProtocolInsecure
        onGuestLoginClick={handleClick}
        onSubmit={handleSubmit}
      />,
    );

    expect(screen.getByTestId('protocol-insecure')).toBeInTheDocument();
  });

  test('should not display insecure protocol message by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onGuestLoginClick={handleClick} onSubmit={handleSubmit} />,
    );

    expect(screen.queryByTestId('protocol-insecure')).toBeNull();
  });

  test('should display IE11 message', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        isIE11
        onGuestLoginClick={handleClick}
        onSubmit={handleSubmit}
      />,
    );

    expect(screen.getByTestId('IE11')).toBeInTheDocument();
  });

  test('should not display IE11 message by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onGuestLoginClick={handleClick} onSubmit={handleSubmit} />,
    );

    expect(screen.queryByTestId('IE11')).toBeNull();
  });

  test('should display login fields by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onGuestLoginClick={handleClick} onSubmit={handleSubmit} />,
    );

    expect(screen.getByName('username')).toBeInTheDocument();
    expect(screen.getByName('password')).toBeInTheDocument();
  });

  test('should allow to disable login fields', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        showLogin={false}
        onGuestLoginClick={handleClick}
        onSubmit={handleSubmit}
      />,
    );

    expect(screen.queryByName('username')).not.toBeInTheDocument();
    expect(screen.queryByName('password')).not.toBeInTheDocument();
  });

  test('should allow to login with username and password', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onGuestLoginClick={handleClick} onSubmit={handleSubmit} />,
    );

    const usernameField = screen.getByName('username');
    const passwordField = screen.getByName('password');

    changeInputValue(usernameField, 'foo');
    changeInputValue(passwordField, 'bar');

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    expect(handleSubmit).toBeCalledWith('foo', 'bar');
  });

  test('should not display guest login by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onGuestLoginClick={handleClick} onSubmit={handleSubmit} />,
    );

    expect(screen.queryByTestId('guest-login')).not.toBeInTheDocument();
    expect(screen.queryByTestId('guest-login-button')).not.toBeInTheDocument();
  });

  test('should allow to display guest login', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        showGuestLogin={true}
        onGuestLoginClick={handleClick}
        onSubmit={handleSubmit}
      />,
    );

    expect(screen.getByTestId('guest-login')).toBeInTheDocument();
    expect(screen.getByTestId('guest-login-button')).toBeInTheDocument();
  });

  test('should allow to login as guest', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        showGuestLogin={true}
        onGuestLoginClick={handleClick}
        onSubmit={handleSubmit}
      />,
    );

    const button = screen.getByTestId('guest-login-button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
