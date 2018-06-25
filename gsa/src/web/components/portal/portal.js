/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import ReactDOM from 'react-dom';

import Logger from 'gmp/log';

import {has_value} from 'gmp/utils/identity';

const log = Logger.getLogger('web.components.portal');

let portal = document.getElementById('portals');

if (!has_value(portal)) {
  const [body] = document.getElementsByTagName('body');

  portal = document.createElement('div');
  portal.setAttribute('id', 'portals');
  body.appendChild(portal);

  log.debug('Created portal', portal);
}

class Portal extends React.Component {

  constructor(...args) {
    super(...args);

    this.element = document.createElement('div');
  }

  componentDidMount() {
    portal.appendChild(this.element);
  }

  componentWillUnmount() {
    portal.removeChild(this.element);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.element,
    );
  }
}

export default Portal;

// vim: set ts=2 sw=2 tw=80:
