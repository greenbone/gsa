/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import SubscriptionProvider, {
  type Subscriber,
  SubscriptionContext,
} from 'web/components/provider/SubscriptionProvider';

const TestComponent = ({subscriber}: {subscriber: Subscriber}) => {
  const subscribe = React.useContext(SubscriptionContext);

  React.useEffect(() => {
    if (subscribe) {
      const unsubscribe = subscribe('testEvent', subscriber);
      return () => unsubscribe();
    }
  }, [subscribe, subscriber]);

  return null;
};

describe('SubscriptionProvider', () => {
  test('should subscribe and notify subscribers correctly', () => {
    const mockSubscriber = testing.fn();
    render(
      <SubscriptionProvider>
        {({notify}) => (
          <>
            <TestComponent subscriber={mockSubscriber} />
            <button onClick={() => notify('testEvent')('testArg')}>
              Notify
            </button>
          </>
        )}
      </SubscriptionProvider>,
    );

    const notifyButton = screen.getByText('Notify');
    fireEvent.click(notifyButton);
    expect(mockSubscriber).toHaveBeenCalledWith('testArg');
  });
});
