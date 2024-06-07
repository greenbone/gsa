/* Copyright (C) 2019-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, {useState} from 'react';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';
import useFormValidation from 'web/components/form/useFormValidation';
import useFormValues from 'web/components/form/useFormValues';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import useTranslation from 'web/hooks/useTranslation';

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
        <>
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
              errorContent={errors.note}
              name="note"
              minRows="5"
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
