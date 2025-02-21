/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import useFormValidation from 'web/components/form/useFormValidation';
import useFormValues from 'web/components/form/useFormValues';
import useTranslation from 'web/hooks/useTranslation';
import {createTicketRules as validationRules} from 'web/pages/tickets/validationrules';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';


const fieldsToValidate = ['note'];

const CreateTicketDialog = ({
  resultId,
  title,
  userId,
  users,
  onClose,
  onSave,
  onUserIdChange,
}) => {
  const [_] = useTranslation();
  const [error, setError] = useState();

  const [formValues, handleValueChange] = useFormValues({note: ''});
  const {errors, validate} = useFormValidation(validationRules, formValues, {
    onValidationSuccess: onSave,
    onValidationError: setError,
    fieldsToValidate,
  });

  title = title || _('Create new Ticket for Result');

  return (
    <SaveDialog
      error={error}
      title={title}
      values={{
        resultId,
        userId,
        ...formValues,
      }}
      onClose={onClose}
      onErrorClose={() => setError()}
      onSave={validate}
    >
      {({values}) => (
        <>
          <Select
            items={renderSelectItems(users)}
            label={_('Assign To User')}
            name="userId"
            value={values.userId}
            onChange={onUserIdChange}
          />
          <TextArea
            required
            errorContent={error && errors.note}
            minRows="5"
            name="note"
            title={_('Note')}
            value={values.note}
            onChange={handleValueChange}
          />
        </>
      )}
    </SaveDialog>
  );
};

CreateTicketDialog.propTypes = {
  resultId: PropTypes.id,
  title: PropTypes.toString,
  userId: PropTypes.id,
  users: PropTypes.arrayOf(PropTypes.model),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onUserIdChange: PropTypes.func.isRequired,
};

export default CreateTicketDialog;
