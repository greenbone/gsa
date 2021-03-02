/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import React from 'react';

import {useHistory} from 'react-router-dom';

import styled, {keyframes} from 'styled-components';
import {gql, useMutation} from '@apollo/client';

import _ from 'gmp/locale';
import {dateTimeWithTimeZone} from 'gmp/locale/date';

import LogoutIcon from 'web/components/icon/logouticon';
import MySettingsIcon from 'web/components/icon/mysettingsicon';
import RefreshIcon from 'web/components/icon/refreshicon';
import ScheduleIcon from 'web/components/icon/scheduleicon';
import UserIcon from 'web/components/icon/usericon';

import Divider from 'web/components/layout/divider';
import Link from 'web/components/link/link';

import Theme from 'web/utils/theme';
import useGmp from 'web/utils/useGmp';
import useUserName from 'web/utils/useUserName';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useUserTimezone from 'web/utils/useUserTimezone';

const UserMenu = styled.span`
  display: inline-flex;
  flex-direction: column;
`;

const Div = styled.div`
  position: relative;
  display: none;
  ${UserMenu}:hover & {
    display: block;
  }
  animation: ${keyframes({
      '0%': {
        transform: 'scale(0.9)',
        opacity: 0.2,
      },
      '100%': {
        transform: 'scale(1.0)',
        opacity: 1,
      },
    })}
    0.1s ease-in;
`;

const List = styled.ul`
  position: absolute;
  margin: 0;
  padding: 0;
  right: 0;
  top: 0;
  z-index: ${Theme.Layers.menu};
  list-style: none;
  font-size: 10px;
  width: 300px;
`;

const Entry = styled.li`
  height: 30px;
  width: 300px;
  border-left: 1px solid ${Theme.mediumGray};
  border-right: 1px solid ${Theme.mediumGray};
  display: flex;
  align-items: center;
  background-color: ${Theme.white};
  padding-left: 12px;

  &:hover {
    background: ${Theme.green};
    color: ${Theme.white};
    cursor: pointer;
  }
  &:first-child {
    border-top: 1px solid ${Theme.mediumGray};
    cursor: default;
    background-color: ${Theme.dialogGray}
    &:hover {
      color: ${Theme.black};
    }
  }
  &:nth-child(2) {
    cursor: default;
    background-color: ${Theme.dialogGray}
    &:hover {
      color: ${Theme.black};
    }
  }
  &:last-child {
    border-top: 1px solid ${Theme.mediumGray};
    border-bottom: 1px solid ${Theme.mediumGray};
  }
`;

const StyledUserIcon = styled(UserIcon)`
  margin-right: 10px;
`;

const StyledLink = styled(Link)`
  width: 100%;
  height: 100%;
  &:link,
  &:hover,
  &:active,
  &:visited,
  &:hover {
    color: inherit;
    text-decoration: none;
  }
`;

export const LOGOUT = gql`
  mutation {
    logout {
      ok
    }
  }
`;

const UserMenuContainer = () => {
  const [sessionTimeout, renewSession] = useUserSessionTimeout();
  const [userTimezone] = useUserTimezone();
  const [userName] = useUserName();
  const gmp = useGmp();
  const history = useHistory();
  const [logout] = useMutation(LOGOUT);

  const handleLogout = event => {
    event.preventDefault();

    if (gmp.settings.enableHyperionOnly) {
      logout()
        .then(() => gmp.logout())
        .then(() => {
          history.push('/login?type=logout');
        });
    } else {
      gmp
        .doLogout()
        .then(logout)
        .then(() => {
          history.push('/login?type=logout');
        });
    }
  };

  const handleRenewSessionTimeout = () => {
    renewSession();
  };

  return (
    <UserMenu data-testid="usermenu">
      <StyledUserIcon size="medium" />
      <Div>
        <List>
          <Entry title={_('Logged in as: {{userName}}', {userName})}>
            <Divider>
              <UserIcon />
              <span>{userName}</span>
            </Divider>
          </Entry>
          <Entry>
            <Divider>
              <ScheduleIcon />
              <span>
                {_('Session timeout: {{date}}', {
                  date: dateTimeWithTimeZone(sessionTimeout, userTimezone),
                })}
              </span>
              <RefreshIcon
                title={_('Renew session timeout')}
                size="small"
                onClick={handleRenewSessionTimeout}
              />
            </Divider>
          </Entry>
          <Entry>
            <StyledLink to="usersettings" data-testid="usermenu-settings">
              <Divider>
                <MySettingsIcon />
                <span>{_('My Settings')}</span>
              </Divider>
            </StyledLink>
          </Entry>
          <Entry data-testid="usermenu-logout" onClick={handleLogout}>
            <Divider>
              <LogoutIcon />
              <span>{_('Log Out')}</span>
            </Divider>
          </Entry>
        </List>
      </Div>
    </UserMenu>
  );
};

export default UserMenuContainer;

// vim: set ts=2 sw=2 tw=80:
