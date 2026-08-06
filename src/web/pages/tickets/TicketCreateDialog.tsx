/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type User from 'gmp/models/user';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import useFormValidation from 'web/components/form/useFormValidation';
import useFormValues from 'web/components/form/useFormValues';
import useTranslation from 'web/hooks/useTranslation';
import {createTicketRules as validationRules} from 'web/pages/tickets/validation-rules';
import {renderSelectItems} from 'web/utils/Render';

interface TicketCreateDialogProps {
  resultId?: string;
  title?: string;
  userId?: string;
  users?: User[];
  onClose: () => void;
  onSave: (data: {resultId?: string; userId?: string; note: string}) => void;
  onUserIdChange: (value: string, name?: string) => void;
}

const fieldsToValidate = ['note'];

const TicketCreateDialog = ({
  resultId,
  title,
  userId,
  users,
  onClose,
  onSave,
  onUserIdChange,
}: TicketCreateDialogProps) => {
  const [_] = useTranslation();
  const [error, setError] = useState<string | undefined>();

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
      onErrorClose={() => setError(undefined)}
      onSave={validate}
    >
      {({values}) => (
        <>
          <Select
            items={renderSelectItems(
              users?.map(user => ({id: user.id ?? '', name: user.name ?? ''})),
            )}
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

export default TicketCreateDialog;
