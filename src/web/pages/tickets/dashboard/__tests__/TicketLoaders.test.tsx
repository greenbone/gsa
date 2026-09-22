/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {TicketsListLoader} from 'web/pages/tickets/dashboard/TicketLoaders';

const createGmp = (tickets: Record<string, unknown>) => ({tickets});

const renderWithSubscriptionContext = ({
  gmp,
  subscribe,
  children,
}: {
  gmp: Record<string, unknown>;
  subscribe: SubscribeFunc;
  children: ReactElement;
}) => {
  const {render} = rendererWith({gmp, store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {children}
    </SubscriptionContext.Provider>,
  );
};

describe('TicketsListLoader', () => {
  test('should load tickets and render them', async () => {
    const data = [{status: 'Open'}];
    const getAll = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getAll});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <TicketsListLoader filter={filter}>{children}</TicketsListLoader>
      ),
    });

    await waitFor(() => {
      expect(getAll).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith(
      'tickets.timer',
      expect.any(Function),
    );
    expect(subscribe).toHaveBeenCalledWith(
      'tickets.changed',
      expect.any(Function),
    );
  });
});
