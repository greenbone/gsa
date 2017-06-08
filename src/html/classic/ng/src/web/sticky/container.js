/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import PropTypes from '../proptypes.js';

const EVENTS = [
  'resize',
  'scroll',
  'touchstart',
  'touchmove',
  'touchend',
  'pageshow',
  'load',
];

class StickyContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.subscribers = new Set();

    this.notify = this.notify.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  componentDidMount() {
    for (const name of EVENTS) {
      window.addEventListener(name, this.notify);
    }
  }

  componentWillUnmount() {
    for (const name of EVENTS) {
      window.removeEventListener(name, this.notify);
    }
  }

  notify(event) {
    if (!this.frame_pending) {
      const {currentTarget} = event;

      window.requestAnimationFrame(() => {
        this.frame_pending = false;

        const {top, bottom} = this.container.getBoundingClientRect();

        this.subscribers.forEach(handler => handler({
          distanceFromTop: top,
          distanceFromBottom: bottom,
          eventSource: currentTarget === window ?
            document.body : this.container,
          container: this.container,
        }));
      });

      this.frame_pending = true;
    }
  }

  subscribe(handler) {
    this.subscribers.add(handler);
  }

  unsubscribe(handler) {
    this.subscribers.delete(handler);
  }

  render() {
    return (
      <div
        {...this.props}
        ref={ref => this.container = ref}
        onScroll={this.notify}
        onTouchStart={this.notify}
        onTouchMove={this.notify}
        onTouchEnd={this.notify}
      >
      </div>
    );
  }

  getChildContext() {
    return {
      subscribe: this.subscribe,
      unsubscribe: this.unsubscribe,
    };
  }
}

StickyContainer.childContextTypes = {
  subscribe: PropTypes.func,
  unsubscribe: PropTypes.func,
};


export default StickyContainer;

// vim: set ts=2 sw=2 tw=80:
