/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
