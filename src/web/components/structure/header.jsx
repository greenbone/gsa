/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';

import {useHistory} from 'react-router-dom';

import {AppHeader} from '@greenbone/opensight-ui-components';

import _ from 'gmp/locale';

import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import useUserName from 'web/hooks/useUserName';
import useGmp from 'web/hooks/useGmp';

import LogoutIcon from 'web/components/icon/logouticon';
import getLogo from 'web/components/structure/getLogo';
import MySettingsIcon from 'web/components/icon/mysettingsicon';
import LanguageSwitch from './languageswitch';
import SessionTimer from '../sessionTimer/SessionTimer';

const Header = () => {
  const gmp = useGmp();
  const username = useUserName();
  const loggedIn = useUserIsLoggedIn();
  const history = useHistory();
  const logoComponent = getLogo(gmp.settings.vendorLabel);

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
      logo={logoComponent}
      languageSwitch={<LanguageSwitch />}
      menuPoints={menuPoints}
      isLoggedIn={loggedIn}
      sessionTimer={<SessionTimer />}
      username={username}
      logoLink="/"
    />
  );
};

export default Header;
