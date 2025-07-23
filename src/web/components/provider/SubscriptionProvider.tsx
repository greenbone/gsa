/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';

const log = Logger.getLogger('web.components.provider.subscription');

export type Subscriber = (...args: unknown[]) => void;

export type SubscribeFunc = (name: string, func: Subscriber) => () => void;

export const SubscriptionContext = React.createContext<
  SubscribeFunc | undefined
>(undefined);

export type NotifyFunc = (name: string) => Subscriber;

interface SubscriptionRenderProps {
  notify: NotifyFunc;
}

interface SubscriptionProviderProps {
  children: (props: SubscriptionRenderProps) => React.ReactNode;
}

class SubscriptionProvider extends React.Component<SubscriptionProviderProps> {
  subscriptions: Record<string, Subscriber[]>;

  constructor(props: SubscriptionProviderProps) {
    super(props);

    this.subscriptions = {};

    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleNotify = this.handleNotify.bind(this);
  }

  getSubscribers(name: string) {
    let subscribers = this.subscriptions[name];

    if (!isDefined(subscribers)) {
      subscribers = [];
      this.setSubscribers(name, subscribers);
    }

    return subscribers;
  }

  setSubscribers(name: string, subscribers: Subscriber[]) {
    this.subscriptions[name] = subscribers;
  }

  handleSubscribe(name: string, func: Subscriber) {
    const subscribers = this.getSubscribers(name);
    subscribers.push(func);

    return () => {
      const subscribers = this.getSubscribers(name);
      this.setSubscribers(
        name,
        subscribers.filter(item => item !== func),
      );
    };
  }

  handleNotify(name: string) {
    log.debug('Subscription notifier created', name);
    return (...args: unknown[]) => {
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

export default SubscriptionProvider;
