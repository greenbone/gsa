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

import {isDefined} from 'gmp/utils/identity';
import Logger from 'gmp/log';

import PropTypes from '../../utils/proptypes.js';

const log = Logger.getLogger('web.components.provider.subscription');

class SubscriptionProvider extends React.Component {
  constructor(...args) {
    super(...args);

    this.subscriptions = {};

    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleNotify = this.handleNotify.bind(this);
  }

  getSubscribers(name) {
    let subscribers = this.subscriptions[name];

    if (!isDefined(subscribers)) {
      subscribers = [];
      this.setSubscribers(name, subscribers);
    }

    return subscribers;
  }

  setSubscribers(name, subscribers) {
    this.subscriptions[name] = subscribers;
  }

  handleSubscribe(name, func) {
    const subscribers = this.getSubscribers(name);
    subscribers.push(func);

    return () => {
      const subscribers = this.getSubscribers(name); // eslint-disable-line no-shadow
      this.setSubscribers(name, subscribers.filter(item => item !== func));
    };
  }

  handleNotify(name) {
    log.debug('Subscription notifier created', name);
    return (...args) => {
      log.debug('Notify subscribers for', name);
      const subscribers = this.getSubscribers(name);

      for (const subscriber of subscribers) {
        subscriber(...args);
      }
    };
  }

  getChildContext() {
    return {
      subscribe: this.handleSubscribe,
    };
  }

  render() {
    const {children} = this.props;
    return children({notify: this.handleNotify});
  }
}

SubscriptionProvider.childContextTypes = {
  subscribe: PropTypes.func.isRequired,
};

SubscriptionProvider.propTypes = {
  children: PropTypes.func.isRequired,
};

export default SubscriptionProvider;

// vim: set ts=2 sw=2 tw=80:
