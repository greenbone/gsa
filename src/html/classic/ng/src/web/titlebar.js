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

import Layout from './layout.js';
import Link from './link.js';
import LegacyLink from './legacylink.js';

import Icon from './icons/icon.js';

import './css/titlebar.css';

export class Titlebar extends React.Component {
  render() {
    let {gmp} = this.context;
    let {onLogoutClick} = this.props;

    const gb = (
      <Icon img="greenbone.svg"
        alt="Greenbone Security Assistant"
        className="greenbone-icon"/>
    );
    const gsa = (
      <Icon img="gsa.svg"
        alt="Greenbone Security Assistant"
        className="greenbone-text"/>
    );
    return (
      <Layout className="titlebar" flex>
        {gmp.isLoggedIn() &&
          <Link to="/" title="Dashboard" className="auto">
            {gb}
            {gsa}
          </Link>
        }
        {gmp.isLoggedIn() &&
          <div className="user-panel">
            <span>Logged in as </span>
            <LegacyLink cmd="get_my_settings">
              <b>{gmp.username}</b>
            </LegacyLink>
            <span> | </span>
            <a onClick={onLogoutClick} className="none">Logout</a>
          </div>
        }
        {!gmp.isLoggedIn() &&
          <span className="none">
            {gb}
            {gsa}
          </span>
        }
      </Layout>
    );
  }
}

Titlebar.propTypes = {
  onLogoutClick: React.PropTypes.func,
};

Titlebar.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export {Titlebar as default};

// vim: set ts=2 sw=2 tw=80:
