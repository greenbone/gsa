/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  TICKET_STATUS,
  TICKET_STATUS_TRANSLATIONS,
  type TicketStatusValue,
} from 'gmp/models/ticket';
import type User from 'gmp/models/user';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import useFormValidation from 'web/components/form/useFormValidation';
import useFormValues from 'web/components/form/useFormValues';
import useTranslation from 'web/hooks/useTranslation';
import {editTicketRules} from 'web/pages/tickets/validation-rules';
import {renderSelectItems, type RenderSelectItemProps} from 'web/utils/Render';

interface TicketEditDialogProps {
  closedNote?: string;
  fixedNote?: string;
  openNote?: string;
  ticketId: string;
  title?: string;
  status: TicketStatusValue;
  userId: string;
  users?: User[];
  onClose: () => void;
  onSave: (data: {
    status: TicketStatusValue;
    ticketId: string;
    userId: string;
    openNote: string;
    closedNote: string;
    fixedNote: string;
  }) => void;
}

const fieldsToValidate = ['openNote', 'closedNote', 'fixedNote'];

const TicketEditDialog = ({
  closedNote = '',
  fixedNote = '',
  openNote = '',
  ticketId,
  title,
  status,
  userId,
  users,
  onClose,
  onSave,
}: TicketEditDialogProps) => {
  const [_] = useTranslation();
  const [error, setError] = useState<string | undefined>();
  const [formValues, handleValueChange] = useFormValues({
    ticketId,
    closedNote,
    fixedNote,
    openNote,
    status,
    userId,
  });

  const {errors, validate} = useFormValidation(
    editTicketRules as never,
    formValues,
    {
      onValidationSuccess: onSave,
      onValidationError: setError,
      fieldsToValidate,
    },
  );

  const STATUS_ITEMS = Object.entries(TICKET_STATUS_TRANSLATIONS)
    // a user should not be able to set the status to "Fix Verified" when editing a ticket
    // the status "Fix Verified" is only set by the system when a fix is verified, not by the user
    .filter(([key, value]) => key !== TICKET_STATUS.verified)
    .map(([ticketStatus, translation]) => ({
      value: ticketStatus,
      label: String(translation),
    }));

  title = title || _('Edit Ticket');

  return (
    <SaveDialog
      error={error}
      title={title}
      values={formValues}
      onClose={onClose}
      onErrorClose={() => setError(undefined)}
      onSave={validate}
    >
      {({values}) => (
        <>
          <Select
            items={STATUS_ITEMS}
            label={_('Status')}
            name="status"
            value={values.status}
            onChange={handleValueChange}
          />
          <Select
            items={renderSelectItems(users as RenderSelectItemProps[])}
            label={_('Assign To User')}
            name="userId"
            value={values.userId}
            onChange={handleValueChange}
          />
          <TextArea
            errorContent={error && errors.openNote}
            maxRows="5"
            name="openNote"
            required={values.status === TICKET_STATUS.open}
            title={_('Note for Open')}
            value={values.openNote}
            onChange={handleValueChange}
          />
          <TextArea
            errorContent={error && errors.fixedNote}
            maxRows="5"
            name="fixedNote"
            required={values.status === TICKET_STATUS.fixed}
            title={_('Note for Fixed')}
            value={values.fixedNote}
            onChange={handleValueChange}
          />
          <TextArea
            errorContent={error && errors.closedNote}
            maxRows="5"
            name="closedNote"
            required={values.status === TICKET_STATUS.closed}
            title={_('Note for Closed')}
            value={values.closedNote}
            onChange={handleValueChange}
          />
        </>
      )}
    </SaveDialog>
  );
};

export default TicketEditDialog;
