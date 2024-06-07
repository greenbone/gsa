/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {rendererWith} from 'web/utils/testing';

import Titlebar from '../titlebar';
import {setIsLoggedIn, setUsername} from 'web/store/usersettings/actions';

import {setLocale} from 'gmp/locale/lang';

setLocale('en');

describe('Titlebar tests', () => {
  test('should render content if user is logged in', () => {
    const gmp = {settings: {vendorVersion: ''}};

    const {render, store} = rendererWith({gmp, router: true, store: true});

    store.dispatch(setUsername('username'));
    store.dispatch(setIsLoggedIn(true));

    const {baseElement, getByTestId} = render(<Titlebar />);
    const menuElement = getByTestId('usermenu');

    expect(baseElement).toMatchSnapshot();
    expect(menuElement).toBeDefined();
    expect(baseElement).not.toHaveTextContent('Vendor Version');
  });

  test('should not render content if user is logged out', () => {
    const gmp = {settings: {vendorVersion: 'Vendor Version'}};

    const {render, store} = rendererWith({gmp, router: true, store: true});

    store.dispatch(setUsername('username'));
    store.dispatch(setIsLoggedIn(false));

    const {baseElement} = render(<Titlebar />);

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).not.toHaveTextContent('username');
    expect(baseElement).toHaveTextContent('Vendor Version');
  });
});
