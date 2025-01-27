/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TICKET_STATUS, TICKET_STATUS_TRANSLATIONS} from 'gmp/models/ticket';
import React, {useState} from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';
import useFormValidation from 'web/components/form/useFormValidation';
import useFormValues from 'web/components/form/useFormValues';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import {editTicketRules as validationRules} from './validationrules';

const STATUS = [TICKET_STATUS.open, TICKET_STATUS.fixed, TICKET_STATUS.closed];

const fieldsToValidate = ['openNote', 'closedNote', 'fixedNote'];

const EditTicketDialog = ({
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
}) => {
  const [_] = useTranslation();
  const [error, setError] = useState();
  const [formValues, handleValueChange] = useFormValues({
    ticketId,
    closedNote,
    fixedNote,
    openNote,
    status,
    userId,
  });
  const {errors, validate} = useFormValidation(validationRules, formValues, {
    onValidationSuccess: onSave,
    onValidationError: setError,
    fieldsToValidate,
  });
  const STATUS_ITEMS = STATUS.map(ticketStatus => ({
    value: ticketStatus,
    label: `${TICKET_STATUS_TRANSLATIONS[ticketStatus]}`,
  }));

  title = title || _('Edit Ticket');

  return (
    <SaveDialog
      error={error}
      title={title}
      values={formValues}
      onClose={onClose}
      onErrorClose={() => setError()}
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
            items={renderSelectItems(users)}
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

EditTicketDialog.propTypes = {
  closedNote: PropTypes.string,
  fixedNote: PropTypes.string,
  openNote: PropTypes.string,
  status: PropTypes.oneOf(STATUS),
  ticketId: PropTypes.id.isRequired,
  title: PropTypes.toString,
  userId: PropTypes.id.isRequired,
  users: PropTypes.arrayOf(PropTypes.model),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditTicketDialog;
