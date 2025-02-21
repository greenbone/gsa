/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';

const ConfirmDeleteDialog = ({
  deleteUsers = [],
  inheritorId = '--',
  title,
  inheritorUsers,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  let headline;
  if (deleteUsers.length === 1) {
    headline = _('User {{name}} will be deleted.', {name: deleteUsers[0].name});
  } else if (deleteUsers.length > 1) {
    headline = _('{{count}} users will be deleted', {
      count: deleteUsers.length,
    });
  } else {
    headline = _('1 user will be deleted');
  }

  const data = {
    deleteUsers,
    inheritorId,
  };

  const inheritingUserItems = [
    {
      label: '--',
      value: '--',
    },
    {
      label: _('Current User'),
      value: 'self',
    },
    ...renderSelectItems(inheritorUsers),
  ];

  return (
    <SaveDialog
      buttonTitle={_('Delete')}
      defaultValues={data}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <h2>{headline}</h2>
            <p>
              {_(
                'If no inheriting user is selected, all owned resources will' +
                  ' be deleted as well.',
              )}
            </p>
            <FormGroup title={_('Inheriting user')}>
              <Select
                items={inheritingUserItems}
                name="inheritorId"
                value={state.inheritorId}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

ConfirmDeleteDialog.propTypes = {
  deleteUsers: PropTypes.array.isRequired,
  inheritorId: PropTypes.id,
  inheritorUsers: PropTypes.array,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ConfirmDeleteDialog;
