/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {getUsername, getSessionTimeout} from 'web/store/usersettings/selectors';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Link from './link';
import {longDate} from 'gmp/locale/date';

const StyledLink = styled(Link)`
  color: ${Theme.darkGray};
  cursor: pointer;
  font-weight: bold;
  &:link,
  &:hover,
  &:active,
  &:visited {
    color: ${Theme.darkGray};
  }
`;

const UserLink = ({sessionTimeout, username}) => (
  <StyledLink
    to="usersettings"
    title={_('Your session will end at {{date}}', {
      date: longDate(sessionTimeout),
    })}
  >
    {username}
  </StyledLink>
);

UserLink.propTypes = {
  sessionTimeout: PropTypes.date,
  username: PropTypes.string.isRequired,
};

export default connect(rootState => ({
  sessionTimeout: getSessionTimeout(rootState),
  username: getUsername(rootState),
}))(UserLink);

// vim: set ts=2 sw=2 tw=80:
