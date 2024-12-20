/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TICKET_STATUS, TICKET_STATUS_TRANSLATIONS} from 'gmp/models/ticket';
import React, {useState} from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import FormGroup from 'web/components/form/formgroup';
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
          <FormGroup title={_('Status')}>
            <Select
              items={STATUS_ITEMS}
              name="status"
              value={values.status}
              onChange={handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Assigned User')}>
            <Select
              items={renderSelectItems(users)}
              name="userId"
              value={values.userId}
              onChange={handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Note for Open')}>
            <TextArea
              errorContent={errors.openNote}
              maxRows="5"
              name="openNote"
              value={values.openNote}
              onChange={handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Note for Fixed')}>
            <TextArea
              errorContent={errors.fixedNote}
              maxRows="5"
              name="fixedNote"
              value={values.fixedNote}
              onChange={handleValueChange}
            />
          </FormGroup>
          <FormGroup title={_('Note for Closed')}>
            <TextArea
              errorContent={errors.closedNote}
              maxRows="5"
              name="closedNote"
              value={values.closedNote}
              onChange={handleValueChange}
            />
          </FormGroup>
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
