/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from '../locale.js';

import Layout from './components/layout/layout.js';

import PropTypes from './proptypes.js';

import GreenboneIcon from './components/icon/greenboneicon.js';
import Icon from './components/icon/icon.js';

import Link from './link/link.js';
import LegacyLink from './link/legacylink.js';

import './css/titlebar.css';

const LogoutLink = glamorous.a({
  color: '#393637',
  cursor: 'pointeri',
  '&:link, &:hover': {
    color: '#393637',
  },
});

const UserLink = LogoutLink.withComponent(LegacyLink);

const Greenbone = () => {
  return (
    <Layout flex>
      <GreenboneIcon/>
      <Icon
        img="gsa.svg"
        size="default"
        alt={_('Greenbone Security Assistant')}
        className="greenbone-text"/>
    </Layout>
  );

};

const Titlebar = ({onLogoutClick}, {gmp}) => {
  return (
    <Layout
      className="titlebar"
      flex
      align={['space-between', 'center']}>
      {gmp.isLoggedIn() &&
        <Link
          to="/"
          title={_('Dashboard')}
        >
          <Greenbone/>
        </Link>
      }
      {gmp.isLoggedIn() ?
        <Layout>
          <span>Logged in as </span>
          <UserLink cmd="get_my_settings">
            <b>{gmp.username}</b>
          </UserLink>
          <span> | </span>
          <LogoutLink onClick={onLogoutClick}>Logout</LogoutLink>
        </Layout> :
        <Greenbone/>
      }
    </Layout>
  );
};

Titlebar.propTypes = {
  onLogoutClick: PropTypes.func,
};

Titlebar.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default Titlebar;

// vim: set ts=2 sw=2 tw=80:
