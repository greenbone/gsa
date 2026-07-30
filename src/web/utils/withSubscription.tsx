/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {updateDisplayName} from 'web/utils/display-name';

export interface WithSubscriptionComponentProps {
  subscribe: SubscribeFunc | undefined;
}

type WithSubscriptionProps<TProps> = Omit<TProps, 'subscribe'>;

const withSubscription = <TProps extends WithSubscriptionComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  const SubscriptionWrapper = (props: WithSubscriptionProps<TProps>) => (
    <SubscriptionContext.Consumer>
      {subscribe => <Component {...(props as TProps)} subscribe={subscribe} />}
    </SubscriptionContext.Consumer>
  );

  return updateDisplayName(SubscriptionWrapper, Component, 'withSubscription');
};

export default withSubscription;
