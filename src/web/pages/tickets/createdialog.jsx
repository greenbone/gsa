/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import _ from 'gmp/locale';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';
import Layout from 'web/components/layout/layout';
import useFormValidation from 'web/components/form/useFormValidation';
import useFormValues from 'web/components/form/useFormValues';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import {createTicketRules as validationRules} from './validationrules';

const fieldsToValidate = ['note'];

const CreateTicketDialog = ({
  resultId,
  title = _('Create new Ticket for Result'),
  userId,
  users,
  onClose,
  onSave,
  onUserIdChange,
}) => {
  const [error, setError] = useState();

  const [formValues, handleValueChange] = useFormValues({note: ''});
  const {hasError, errors, validate} = useFormValidation(
    validationRules,
    formValues,
    {
      onValidationSuccess: onSave,
      onValidationError: setError,
      fieldsToValidate,
    },
  );

  return (
    <SaveDialog
      error={error}
      title={title}
      onClose={onClose}
      onErrorClose={() => setError()}
      onSave={validate}
      values={{
        resultId,
        userId,
        ...formValues,
      }}
    >
      {({values}) => (
        <Layout flex="column">
          <FormGroup title={_('Assign To User')}>
            <Select
              name="userId"
              value={values.userId}
              items={renderSelectItems(users)}
              onChange={onUserIdChange}
            />
          </FormGroup>
          <FormGroup title={_('Note')}>
            <TextArea
              hasError={hasError && !!errors.note} // default false if undefined (if we don't want to do validation on this textarea)
              errorContent={errors.note}
              name="note"
              grow="1"
              rows="5"
              value={values.note}
              onChange={handleValueChange}
            />
          </FormGroup>
        </Layout>
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
