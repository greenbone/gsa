/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import Titlebar from './titlebar.js';

import MenuBar from './menu/menubar.js';

export class Header extends React.Component {

  constructor(props) {
    super(props);

    this.logout = this.logout.bind(this);
  }

  logout(event) {
    let {router, gmp} = this.context;

    event.preventDefault();

    gmp.logout().then(() => {
      router.push('/login?type=logout');
    })
    .catch(() => {
      router.push('/login?type=logout');
    });
  }

  render() {
    return (
      <header>
        <Titlebar onLogoutClick={this.logout}/>
        <MenuBar/>
      </header>
    );
  }
}

Header.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  router: React.PropTypes.object.isRequired,
};

export default Header;

// vim: set ts=2 sw=2 tw=80:
