/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import React from 'react';

import _ from 'gmp/locale';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';
import Layout from 'web/components/layout/layout';
import useFormValidation, {
  syncVariables,
} from 'web/components/form/useFormValidation';
import {createTicketRules as validationRules} from './validationrules';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

const CreateTicketDialog = ({
  resultId,
  title = _('Create new Ticket for Result'),
  userId,
  users,
  onClose,
  onSave,
  onUserIdChange,
}) => {
  const validationSchema = {
    note: '',
  };

  const {
    shouldWarn,
    formValues,
    handleValueChange,
    validityStatus,
    handleSubmit,
  } = useFormValidation(validationSchema, validationRules, onSave);

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={vals => handleSubmit(vals)}
      values={{
        resultId,
        userId,
      }}
    >
      {({values, onValueChange}) => {
        syncVariables(values, formValues);
        return (
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
                hasError={shouldWarn && !validityStatus.note.isValid} // default false if undefined (if we don't want to do validation on this textarea)
                errorContent={validityStatus.note.error}
                name="note"
                grow="1"
                rows="5"
                value={values.note}
                onChange={handleValueChange}
              />
            </FormGroup>
          </Layout>
        );
      }}
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
