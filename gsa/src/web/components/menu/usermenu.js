/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {connect} from 'react-redux';

import {withRouter} from 'react-router-dom';

import styled, {keyframes} from 'styled-components';

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import LogoutIcon from 'web/components/icon/logouticon';
import MySettingsIcon from 'web/components/icon/mysettingsicon';
import ScheduleIcon from 'web/components/icon/scheduleicon';
import UserIcon from 'web/components/icon/usericon';

import Divider from 'web/components/layout/divider';
import Link from 'web/components/link/link';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import withGmp from 'web/utils/withGmp';

import {getUsername, getSessionTimeout} from 'web/store/usersettings/selectors';

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
  width: 255px;
`;

const Entry = styled.li`
  height: 30px;
  width: 255px;
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

class UserMenuContainer extends React.Component {
  constructor(...args) {
    super(...args);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout(event) {
    const {gmp, history} = this.props;

    event.preventDefault();

    gmp.doLogout().then(() => {
      history.push('/login?type=logout');
    });
  }
  render() {
    const {sessionTimeout, userName} = this.props;

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
                    date: longDate(sessionTimeout),
                  })}
                </span>
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
            <Entry>
              <Divider
                data-testid="usermenu-logout"
                onClick={event => this.handleLogout(event)}
              >
                <LogoutIcon />
                <span>{_('Log Out')}</span>
              </Divider>
            </Entry>
          </List>
        </Div>
      </UserMenu>
    );
  }
}

UserMenuContainer.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  history: PropTypes.object.isRequired,
  icon: PropTypes.element,
  sessionTimeout: PropTypes.date,
  userName: PropTypes.string,
};

export default compose(
  withGmp,
  withRouter,
  connect(rootState => ({
    sessionTimeout: getSessionTimeout(rootState),
    userName: getUsername(rootState),
  })),
)(UserMenuContainer);

// vim: set ts=2 sw=2 tw=80:
