/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import Header from 'web/components/structure/Header';
import {
  setTimezone,
  setUsername,
  setIsLoggedIn,
} from 'web/store/usersettings/actions';

const gmp = {
  settings: {
    vendorLabel: 'gsm-150_label.svg',
  },
  doLogout: testing.fn().mockResolvedValue(undefined),
};

describe('Header', () => {
  test('renders component', () => {
    const {render, store} = rendererWith({
      gmp,
      router: true,
      store: true,
    });
    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('testUser'));
    store.dispatch(setIsLoggedIn(true));

    render(<Header />);

    expect(screen.getByText('UTC')).toBeVisible();

    const langBtn = screen.getByRole('button', {
      name: 'Switch language to German',
    });
    expect(langBtn).toBeVisible();

    const renewBtn = screen.getByRole('button', {
      name: 'Refresh Icon',
    });
    expect(renewBtn).toBeVisible();

    const username = screen.getByText('testUser');
    expect(username).toBeVisible();

    const themeSwitch = screen.queryByRole('button', {
      name: 'Switch color theme',
    });

    expect(themeSwitch).not.toBeInTheDocument();

    const logo = screen.getByTestId('Enterprise150');
    expect(logo).toBeVisible();

    const manualLink = screen.getByTestId('manual-link');
    expect(manualLink).toBeVisible();
  });

  test('opens user menu, checks items and logs out user', async () => {
    const {render, store} = rendererWith({
      gmp,
      router: true,
      store: true,
    });
    store.dispatch(setUsername('testUser'));
    store.dispatch(setIsLoggedIn(true));

    render(<Header />);

    const settingsBtn = screen.getByText('testUser');
    fireEvent.mouseOver(settingsBtn);
    await waitFor(() => screen.getByText('Settings'));

    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);
    expect(gmp.doLogout).toHaveBeenCalled();
  });
});
