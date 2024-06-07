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
import React, {useCallback} from 'react';

import {useHistory} from 'react-router-dom';

import {AppHeader} from '@greenbone/opensight-ui-components';

import _ from 'gmp/locale';

import useUserIsLoggedIn from 'web/utils/useUserIsLoggedIn';
import useUserName from 'web/utils/useUserName';
import useGmp from 'web/utils/useGmp';

import LogoutIcon from 'web/components/icon/logouticon';
import MySettingsIcon from 'web/components/icon/mysettingsicon';
import LanguageSwitch from './languageswitch';

const Header = () => {
  const gmp = useGmp();
  const username = useUserName();
  const loggedIn = useUserIsLoggedIn();
  const history = useHistory();

  const handleSettingsClick = useCallback(
    event => {
      event.preventDefault();
      history.push('/usersettings');
    },
    [history],
  );

  const handleLogout = useCallback(
    event => {
      event.preventDefault();

      gmp.doLogout().then(() => {
        history.push('/login?type=logout');
      });
    },
    [gmp, history],
  );

  const menuPoints = [
    {
      to: handleSettingsClick,
      linkText: _('Settings'),
      icon: <MySettingsIcon />,
    },
    {
      to: handleLogout,
      linkText: _('Logout'),
      icon: <LogoutIcon />,
    },
  ];
  return (
    <AppHeader
      languageSwitch={<LanguageSwitch />}
      menuPoints={menuPoints}
      isLoggedIn={loggedIn}
      username={username}
      logoLink="/"
    />
  );
};

export default Header;
