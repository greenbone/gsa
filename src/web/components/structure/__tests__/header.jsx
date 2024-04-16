/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {rendererWith} from 'web/utils/testing';

import Header from '../header';
import {setUsername} from 'web/store/usersettings/actions';

describe('Header tests', () => {
  test('should render header', () => {
    const isLoggedIn = testing.fn().mockReturnValue(true);
    const gmp = {isLoggedIn, settings: {vendorVersion: ''}};
    const {render, store} = rendererWith({gmp, router: true, store: true});
    store.dispatch(setUsername('username'));

    const {element} = render(<Header />);

    expect(element).toBeInTheDocument();
  });
});
