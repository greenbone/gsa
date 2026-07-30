/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Logger from 'gmp/log';
import {hasValue} from 'gmp/utils/identity';

interface PortalProps {
  children?: React.ReactNode;
}

const log = Logger.getLogger('web.components.portal');

let portalContainer = document.getElementById('portals');

if (!hasValue(portalContainer)) {
  const [body] = document.getElementsByTagName('body');

  portalContainer = document.createElement('div');
  portalContainer.setAttribute('id', 'portals');
  body.appendChild(portalContainer);

  log.debug('Created portal', portalContainer);
}

class Portal extends React.Component<PortalProps> {
  element: HTMLDivElement;

  constructor(props: PortalProps) {
    super(props);

    this.element = document.createElement('div');
  }

  componentDidMount() {
    portalContainer?.appendChild(this.element);
  }

  componentWillUnmount() {
    portalContainer?.removeChild(this.element);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.element);
  }
}

export default Portal;
