/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {SubscriptionContext} from 'web/components/provider/SubscriptionProvider';
import {updateDisplayName} from 'web/utils/displayName';

const withSubscription = Component => {
  const SubscriptionWrapper = props => (
    <SubscriptionContext.Consumer>
      {subscribe => <Component {...props} subscribe={subscribe} />}
    </SubscriptionContext.Consumer>
  );

  return updateDisplayName(SubscriptionWrapper, Component, 'withSubscription');
};

export default withSubscription;
