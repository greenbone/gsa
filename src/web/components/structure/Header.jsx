/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {AppHeader} from '@greenbone/opensight-ui-components-mantinev7';
import {useCallback} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router';
import LogoutIcon from 'web/components/icon/LogoutIcon';
import MySettingsIcon from 'web/components/icon/MySettingsIcon';
import SessionTimer from 'web/components/sessionTimer/SessionTimer';
import getLogo from 'web/components/structure/getLogo';
import LanguageSwitch from 'web/components/structure/LanguageSwitch';
import useGmp from 'web/hooks/useGmp';
import useManualURL from 'web/hooks/useManualURL';
import useTranslation from 'web/hooks/useTranslation';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import useUserName from 'web/hooks/useUserName';

const Header = () => {
  const [_] = useTranslation();

  const gmp = useGmp();
  const [username] = useUserName();
  const [loggedIn] = useUserIsLoggedIn();
  const navigate = useNavigate();
  const logoComponent = getLogo(gmp.settings.vendorLabel);
  const timezone = useSelector(state => state.userSettings.timezone);
  const manualURL = useManualURL();

  const handleSettingsClick = useCallback(
    event => {
      event.preventDefault();
      navigate('/usersettings');
    },
    [navigate],
  );

  const handleLogout = useCallback(
    event => {
      event.preventDefault();

      gmp.doLogout().then(() => {
        navigate('/login?type=logout');
      });
    },
    [gmp, navigate],
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
      ianaTimeZone={timezone}
      isLoggedIn={loggedIn}
      isThemeSwitchVisible={false}
      languageSwitch={<LanguageSwitch />}
      logo={logoComponent}
      logoLink="/dashboards"
      manualLink={manualURL}
      menuPoints={menuPoints}
      sessionTimer={<SessionTimer />}
      username={username}
    />
  );
};

export default Header;
