/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {SubscriptionContext} from 'web/components/provider/subscriptionprovider';

const withSubscription = Component => {
  const SubscriptionWrapper = props => (
    <SubscriptionContext.Consumer>
      {subscribe => <Component {...props} subscribe={subscribe} />}
    </SubscriptionContext.Consumer>
  );

  return SubscriptionWrapper;
};

export default withSubscription;

// vim: set ts=2 sw=2 tw=80:
