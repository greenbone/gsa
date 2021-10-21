/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import ReactDOM from 'react-dom';

import Logger from 'gmp/log';

import {hasValue} from 'gmp/utils/identity';

const log = Logger.getLogger('web.components.portal');

let portal = document.getElementById('portals');

if (!hasValue(portal)) {
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
    return ReactDOM.createPortal(this.props.children, this.element);
  }
}

export default Portal;

// vim: set ts=2 sw=2 tw=80:
