/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import PropTypes from 'web/utils/proptypes';

const log = Logger.getLogger('web.components.provider.subscription');

export const SubscriptionContext = React.createContext();

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
      const subscribers = this.getSubscribers(name);  
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

  render() {
    const {children} = this.props;
    return (
      <SubscriptionContext.Provider value={this.handleSubscribe}>
        {children({notify: this.handleNotify})}
      </SubscriptionContext.Provider>
    );
  }
}

SubscriptionProvider.propTypes = {
  children: PropTypes.func.isRequired,
};

export default SubscriptionProvider;

// vim: set ts=2 sw=2 tw=80:
