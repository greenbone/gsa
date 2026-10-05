/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionData} from 'gmp/commands/entity';
import type Response from 'gmp/http/response';
import {
  type default as Ticket,
  type TicketStatusValue,
} from 'gmp/models/ticket';
import useGmp from 'web/hooks/useGmp';
import useGetEntity from 'web/queries/useGetEntity';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetTicketParams {
  id: string;
}

interface UseTicketMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

interface TicketCreateInput {
  resultId: string;
  userId: string;
  note?: string;
}

interface TicketSaveInput {
  id: string;
  openNote?: string;
  fixedNote?: string;
  closedNote?: string;
  status: TicketStatusValue;
  userId: string;
}

export const useGetTicket = ({id}: UseGetTicketParams) => {
  const gmp = useGmp();
  return useGetEntity<Ticket>({
    gmpMethod: gmp.ticket.get.bind(gmp.ticket),
    queryId: 'get_ticket',
    id,
  });
};

export const useCreateTicket = ({
  onSuccess,
  onError,
}: UseTicketMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<TicketCreateInput, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.ticket.create(data);
      return response.data;
    },
    invalidateQueryIds: ['get_tickets'],
    onSuccess,
    onError,
  });
};

export const useSaveTicket = ({
  onSuccess,
  onError,
}: UseTicketMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<TicketSaveInput, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.ticket.save(data);
      return response.data;
    },
    invalidateQueryIds: ['get_tickets', 'get_ticket'],
    onSuccess,
    onError,
  });
};

export const useCloneTicket = ({
  onSuccess,
  onError,
}: UseTicketMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<{id: string}, EntityActionData>({
    gmpMethod: async ({id}: {id: string}) => {
      const response = await gmp.ticket.clone({id});
      return response.data;
    },
    invalidateQueryIds: ['get_tickets'],
    onSuccess,
    onError,
  });
};

export const useDeleteTicket = ({
  onSuccess,
  onError,
}: UseTicketMutationCallbacks<void> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<{id: string}, void>({
    gmpMethod: ({id}: {id: string}) => gmp.ticket.delete({id}),
    invalidateQueryIds: ['get_tickets', 'get_ticket'],
    onSuccess,
    onError,
  });
};

export const useDownloadTicket = ({
  onSuccess,
  onError,
}: UseTicketMutationCallbacks<Response<string>> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<{id: string}, Response<string>>({
    gmpMethod: ({id}: {id: string}) => gmp.ticket.export({id}),
    onSuccess,
    onError,
  });
};
