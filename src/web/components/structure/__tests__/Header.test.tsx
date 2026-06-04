/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import date from 'gmp/models/date';
import {createSession} from 'gmp/testing';
import Header from 'web/components/structure/Header';

const createGmp = () => ({
  settings: {
    vendorLabel: 'gsm-150_label.svg',
  },
  session: createSession({
    username: 'testUser',
    timezone: 'UTC',
    sessionTimeout: date(Date.now() + 3600 * 1000),
  }),
  doLogout: testing.fn().mockResolvedValue(undefined),
});

describe('Header tests', () => {
  test('renders component', async () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      router: true,
    });

    render(<Header />);

    expect(screen.getByText('UTC')).toBeVisible();

    const langBtn = screen.getByRole('button', {
      name: 'Switch language to German',
    });
    expect(langBtn).toBeVisible();

    const renewBtn = screen.getByRole('button', {
      name: 'Refresh CCW Icon',
    });
    expect(renewBtn).toBeVisible();

    const username = screen.getByText('testUser');
    expect(username).toBeVisible();

    const themeSwitch = screen.queryByRole('button', {
      name: 'Switch color theme',
    });

    expect(themeSwitch).toBeInTheDocument();

    await waitFor(() => {
      const logo = screen.getByTestId('Enterprise150');
      expect(logo).toBeVisible();
    });

    const manualLink = screen.getByTestId('manual-link');
    expect(manualLink).toBeVisible();
  });

  test('opens user menu, checks items and logs out user', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      router: true,
    });

    render(<Header />);

    const settingsBtn = screen.getByText('testUser');
    fireEvent.mouseOver(settingsBtn);
    await waitFor(() => screen.getByText('Settings'));

    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);
    expect(gmp.doLogout).toHaveBeenCalled();
  });
});
