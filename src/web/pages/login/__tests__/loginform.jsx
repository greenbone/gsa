/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import LoginForm from '../loginform';

const gmp = {settings: {}};

describe('LoginForm tests', () => {
  test('should render full LoginForm', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    const {getByName} = render(
      <LoginForm
        error="An Error Occurred"
        showGuestLogin
        showLogin
        showProtocolInsecure
        onSubmit={handleSubmit}
        onGuestLoginClick={handleClick}
      />,
    );

    expect(getByName('username')).toBeInTheDocument();
    expect(getByName('password')).toBeInTheDocument();
  });

  test('should display error', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        error="An Error Occurred"
        onSubmit={handleSubmit}
        onGuestLoginClick={handleClick}
      />,
    );

    expect(screen.getByTestId('error')).toHaveTextContent('An Error Occurred');
  });

  test('should not display error by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onSubmit={handleSubmit} onGuestLoginClick={handleClick} />,
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
        onSubmit={handleSubmit}
        onGuestLoginClick={handleClick}
      />,
    );

    expect(screen.getByTestId('protocol-insecure')).toBeInTheDocument();
  });

  test('should not display insecure protocol message by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <LoginForm onSubmit={handleSubmit} onGuestLoginClick={handleClick} />,
    );

    expect(queryByTestId('protocol-insecure')).toBeNull();
  });

  test('should display IE11 message', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm
        isIE11
        onSubmit={handleSubmit}
        onGuestLoginClick={handleClick}
      />,
    );

    expect(screen.getByTestId('IE11')).toBeInTheDocument();
  });

  test('should not display IE11 message by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <LoginForm onSubmit={handleSubmit} onGuestLoginClick={handleClick} />,
    );

    expect(queryByTestId('IE11')).toBeNull();
  });

  test('should display login fields by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    const {getByName} = render(
      <LoginForm onSubmit={handleSubmit} onGuestLoginClick={handleClick} />,
    );

    expect(getByName('username')).toBeInTheDocument();
    expect(getByName('password')).toBeInTheDocument();
  });

  test('should allow to disable login fields', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    const {queryByName} = render(
      <LoginForm
        showLogin={false}
        onSubmit={handleSubmit}
        onGuestLoginClick={handleClick}
      />,
    );

    expect(queryByName('username')).not.toBeInTheDocument();
    expect(queryByName('password')).not.toBeInTheDocument();
  });

  test('should allow to login with username and password', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    const {getByName} = render(
      <LoginForm onSubmit={handleSubmit} onGuestLoginClick={handleClick} />,
    );

    const usernameField = getByName('username');
    const passwordField = getByName('password');

    fireEvent.change(usernameField, {target: {value: 'foo'}});
    fireEvent.change(passwordField, {target: {value: 'bar'}});

    const button = screen.getByTestId('login-button');
    fireEvent.click(button);

    expect(handleSubmit).toBeCalledWith('foo', 'bar');
  });

  test('should not display guest login by default', () => {
    const handleSubmit = testing.fn();
    const handleClick = testing.fn();

    const {render} = rendererWith({gmp});

    render(
      <LoginForm onSubmit={handleSubmit} onGuestLoginClick={handleClick} />,
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
        onSubmit={handleSubmit}
        onGuestLoginClick={handleClick}
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
        onSubmit={handleSubmit}
        onGuestLoginClick={handleClick}
      />,
    );

    const button = screen.getByTestId('guest-login-button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
