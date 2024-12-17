/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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

import {createTicketRules as validationRules} from './validationrules';

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
          <FormGroup title={_('Assign To User')}>
            <Select
              items={renderSelectItems(users)}
              name="userId"
              value={values.userId}
              onChange={onUserIdChange}
            />
          </FormGroup>
          <FormGroup title={_('Note')}>
            <TextArea
              errorContent={errors.note}
              minRows="5"
              name="note"
              value={values.note}
              onChange={handleValueChange}
            />
          </FormGroup>
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

// vim: set ts=2 sw=2 tw=80:
