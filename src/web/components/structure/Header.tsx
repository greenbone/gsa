/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';
import {AppHeader} from '@greenbone/ui-lib';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router';
import {LogoutIcon, MySettingsIcon} from 'web/components/icon';
import SessionTimer from 'web/components/sessionTimer/SessionTimer';
import getLogo from 'web/components/structure/getLogo';
import LanguageSwitch from 'web/components/structure/LanguageSwitch';
import useGmp from 'web/hooks/useGmp';
import useManualURL from 'web/hooks/useManualURL';
import useTranslation from 'web/hooks/useTranslation';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import useUserName from 'web/hooks/useUserName';
import {ApplianceLogo} from 'web/utils/applianceData';

const Header = () => {
  const [_] = useTranslation();

  const gmp = useGmp();
  const [username] = useUserName();
  const [loggedIn] = useUserIsLoggedIn();
  const navigate = useNavigate();
  const logoComponent = getLogo(gmp?.settings?.vendorLabel as ApplianceLogo);
  const timezone = useSelector<{userSettings: {timezone: string}}, string>(
    state => state.userSettings.timezone,
  );
  const manualURL = useManualURL();

  const handleSettingsClick = useCallback(async () => {
    await navigate('/usersettings');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    void gmp.doLogout().then(() => {
      return navigate('/login?type=logout');
    });
  }, [gmp, navigate]);

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
      userNavWidth={150}
      username={username}
    />
  );
};

export default Header;
