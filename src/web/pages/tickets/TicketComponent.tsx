/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import {type EntityActionData} from 'gmp/commands/entity';
import {
  TICKET_STATUS,
  type TicketStatusValue,
  type default as Ticket,
} from 'gmp/models/ticket';
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
  onCreated?: (response: {data: EntityActionData}) => void;
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onSaveError?: (error: Error) => void;
  onSaved?: () => void;
}

const TICKET_EDIT_STATUS: Record<TicketStatusValue, TicketStatusValue> = {
  [TICKET_STATUS.open]: TICKET_STATUS.open,
  [TICKET_STATUS.fixed]: TICKET_STATUS.fixed,
  [TICKET_STATUS.verified]: TICKET_STATUS.closed,
  [TICKET_STATUS.closed]: TICKET_STATUS.closed,
};

const getTicketEditStatus = (status?: TicketStatusValue): TicketStatusValue => {
  if (!status) {
    return TICKET_STATUS.open;
  }

  if (status in TICKET_EDIT_STATUS) {
    return TICKET_EDIT_STATUS[status];
  }

  return status as TicketStatusValue;
};

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

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [usersEnabled, setUsersEnabled] = useState(false);

  const {data: usersData} = useGetUsers({enabled: usersEnabled});
  const users = usersData?.entities ?? [];

  const [result, setResult] = useState<{id: string; name?: string}>();
  const [ticket, setTicket] = useState<Ticket>();
  const [editStatus, setEditStatus] = useState<TicketStatusValue>(
    TICKET_STATUS.open,
  );
  const [userId, setUserId] = useState<string>();

  const createMutation = useCreateTicket({
    onSuccess: response => onCreated?.({data: response}),
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
    setUsersEnabled(true);
    setResult(resultData);
    setCreateDialogVisible(true);
  };

  const handleCloseCreateDialog = () => {
    setUserId(undefined);
    setCreateDialogVisible(false);
  };

  const handleOpenEditDialog = (ticketData: Ticket) => {
    setUsersEnabled(true);
    setTicket(ticketData);
    setEditStatus(getTicketEditStatus(ticketData.status));
    setEditDialogVisible(true);
  };

  const closeEditDialog = () => {
    setEditDialogVisible(false);
    setTicket(undefined);
  };

  const handleOpenSolvedDialog = (ticketData: Ticket) => {
    setUsersEnabled(true);
    setTicket(ticketData);
    setEditStatus(TICKET_STATUS.fixed);
    setEditDialogVisible(true);
  };

  const handleOpenClosedDialog = (ticketData: Ticket) => {
    setUsersEnabled(true);
    setTicket(ticketData);
    setEditStatus(TICKET_STATUS.closed);
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
          status={editStatus}
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
