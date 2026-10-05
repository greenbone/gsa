/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import type Ticket from 'gmp/models/ticket';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetTicketsParams {
  filter?: FilterType;
}

export const useGetTickets = ({filter}: UseGetTicketsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Ticket>({
    gmpMethod: gmp.tickets.get.bind(gmp.tickets),
    queryId: 'get_tickets',
    filter,
    keepPreviousData: true,
  });
};
