/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
