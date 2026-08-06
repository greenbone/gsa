/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import {type EntityActionData} from 'gmp/commands/entity';
import type Ticket from 'gmp/models/ticket';
import {TICKET_STATUS, type TicketStatusValue} from 'gmp/models/ticket';
import type User from 'gmp/models/user';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import {
  useCloneTicket,
  useCreateTicket,
  useDeleteTicket,
  useSaveTicket,
} from 'web/hooks/use-query/tickets';
import {useGetUsers} from 'web/hooks/use-query/users';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import TicketCreateDialog from 'web/pages/tickets/TicketCreateDialog';
import TicketEditDialog from 'web/pages/tickets/TicketEditDialog';

interface TicketComponentRenderProps {
  clone: (entity: Ticket) => Promise<void>;
  createFromResult: (result: {id: string; name?: string}) => void;
  delete: (entity: Ticket) => Promise<void>;
  download: (entity: Ticket) => Promise<void>;
  edit: (ticket: Ticket) => void;
  solve: (ticket: Ticket) => void;
  close: (ticket: Ticket) => void;
}

interface TicketComponentProps {
  children: (props: TicketComponentRenderProps) => ReactNode;
  onCloneError?: (error: Error) => void;
  onCloned?: (response: EntityActionData) => void;
  onCreateError?: (error: Error) => void;
  onCreated?: (response: EntityActionData) => void;
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onSaveError?: (error: Error) => void;
  onSaved?: () => void;
}

const TicketComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onSaved,
  onSaveError,
}: TicketComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const {data: usersData} = useGetUsers();
  const users = usersData?.entities ?? [];

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  const [result, setResult] = useState<{id: string; name?: string}>();
  const [ticket, setTicket] = useState<Ticket>();
  const [userId, setUserId] = useState<string>();

  const createMutation = useCreateTicket({
    onSuccess: onCreated,
    onError: onCreateError,
  });
  const saveMutation = useSaveTicket({
    onSuccess: onSaved,
    onError: onSaveError,
  });
  const cloneMutation = useCloneTicket({
    onSuccess: onCloned,
    onError: onCloneError,
  });
  const deleteMutation = useDeleteTicket({
    onSuccess: onDeleted,
    onError: onDeleteError,
  });
  const downloadTicket = useEntityDownload<Ticket>(
    entity => gmp.ticket.export(entity),
    {
      onDownloaded,
      onDownloadError,
    },
  );

  const handleOpenCreateDialog = (resultData: {id: string; name?: string}) => {
    setResult(resultData);
    setCreateDialogVisible(true);
  };

  const handleCloseCreateDialog = () => {
    setUserId(undefined);
    setCreateDialogVisible(false);
  };

  const handleOpenEditDialog = (ticketData: Ticket) => {
    setTicket(ticketData);
    setEditDialogVisible(true);
  };

  const closeEditDialog = () => {
    setEditDialogVisible(false);
    setTicket(undefined);
  };

  const handleOpenSolvedDialog = (ticketData: Ticket) => {
    setTicket(
      Object.assign({}, ticketData, {
        status: TICKET_STATUS.fixed,
      }) as Ticket,
    );
    setEditDialogVisible(true);
  };

  const handleOpenClosedDialog = (ticketData: Ticket) => {
    setTicket(
      Object.assign({}, ticketData, {
        status: TICKET_STATUS.closed,
      }) as Ticket,
    );
    setEditDialogVisible(true);
  };

  const handleUserIdChange = (id: string) => {
    setUserId(id);
  };

  const cloneTicket = async (entity: Ticket) => {
    await cloneMutation.mutateAsync({id: entity.id});
  };

  const deleteTicket = async (entity: Ticket) => {
    await deleteMutation.mutateAsync({id: entity.id});
  };

  const downloadTicketEntity = async (entity: Ticket) => {
    await downloadTicket(entity);
  };

  const handleCreateTicket = async (d: {
    resultId?: string;
    userId?: string;
    note: string;
  }) => {
    await createMutation.mutateAsync({
      resultId: d.resultId ?? '',
      userId: d.userId ?? '',
      note: d.note,
    });
    handleCloseCreateDialog();
  };

  const handleSaveTicket = async (data: {
    openNote: string;
    fixedNote: string;
    closedNote: string;
    status: TicketStatusValue;
    ticketId: string;
    userId: string;
  }) => {
    await saveMutation.mutateAsync({
      id: data.ticketId,
      openNote: data.openNote,
      fixedNote: data.fixedNote,
      closedNote: data.closedNote,
      status: data.status,
      userId: data.userId,
    });
    closeEditDialog();
  };

  return (
    <>
      {children({
        clone: cloneTicket,
        createFromResult: handleOpenCreateDialog,
        delete: deleteTicket,
        download: downloadTicketEntity,
        edit: handleOpenEditDialog,
        solve: handleOpenSolvedDialog,
        close: handleOpenClosedDialog,
      })}
      {createDialogVisible && isDefined(result) && (
        <TicketCreateDialog
          resultId={result.id}
          title={_('Create new Ticket for Result {{- name}}', {
            name: result.name ?? '',
          })}
          userId={isDefined(userId) ? userId : selectSaveId(users)}
          users={users as User[]}
          onClose={handleCloseCreateDialog}
          onSave={handleCreateTicket}
          onUserIdChange={handleUserIdChange}
        />
      )}
      {editDialogVisible && isDefined(ticket) && (
        <TicketEditDialog
          closedNote={ticket.closedNote}
          fixedNote={ticket.fixedNote}
          openNote={ticket.openNote}
          status={
            ticket.status === 'verified'
              ? TICKET_STATUS.closed
              : (ticket.status as TicketStatusValue)
          }
          ticketId={ticket.id}
          title={_('Edit Ticket {{- name}}', {name: ticket.name ?? ''})}
          userId={ticket.assignedTo?.id ?? ''}
          users={users as User[]}
          onClose={closeEditDialog}
          onSave={handleSaveTicket}
        />
      )}
    </>
  );
};

export default TicketComponent;
