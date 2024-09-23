/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import date from 'gmp/models/date';
import {longDate} from 'gmp/locale/date';

import {setSessionTimeout, setUsername} from 'web/store/usersettings/actions';

import {fireEvent, rendererWith, screen, act} from 'web/utils/testing';

import UserMenu from '../usermenu';

describe('UserMenu component tests', () => {
  test('should render UserMenu', () => {
    const {render} = rendererWith({gmp: {}, router: true, store: true});

    const {element} = render(<UserMenu />);

    expect(element).toBeInTheDocument();
  });

  test('should render username and sessionTimeout', () => {
    const {render, store} = rendererWith({gmp: {}, router: true, store: true});
    const timeout = date('2018-10-10');

    store.dispatch(setSessionTimeout(timeout));
    store.dispatch(setUsername('foo'));

    const {element} = render(<UserMenu />);

    expect(element).toHaveTextContent(longDate(timeout));
    expect(element).toHaveTextContent('foo');
  });

  test('should route to usersettings on click', () => {
    const {render} = rendererWith({
      gmp: {},
      store: true,
      router: true,
    });

    const {getByTestId} = render(<UserMenu />);
    const userSettingsElement = getByTestId('usermenu-settings');

    fireEvent.click(userSettingsElement);

    expect(window.location.pathname).toMatch('usersettings');
  });

  test('should logout user on click', async () => {
    const doLogout = testing.fn().mockResolvedValue();
    const gmp = {
      doLogout,
    };
    const {render} = rendererWith({gmp, store: true, router: true});

    render(<UserMenu />);
    const userSettingsElement = screen.getByTestId('usermenu-logout');

    await act(async () => {
      fireEvent.click(userSettingsElement);
    });

    expect(gmp.doLogout).toHaveBeenCalled();
  });

  test('should renew session timeout on click', async () => {
    const renewSession = testing
      .fn()
      .mockResolvedValue({data: '2019-10-10T12:00:00Z'});
    const gmp = {
      user: {
        renewSession,
      },
    };
    const {render} = rendererWith({gmp, store: true, router: true});

    const {getAllByTestId} = render(<UserMenu />);
    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      fireEvent.click(icons[3]);
    });

    expect(gmp.user.renewSession).toHaveBeenCalled();
  });
});
