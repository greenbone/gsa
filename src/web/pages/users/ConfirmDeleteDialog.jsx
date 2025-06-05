/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {isDefined} from 'gmp/utils/identity';
import DialogContent from 'web/components/dialog/Content';
import DialogError from 'web/components/dialog/DialogError';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';

const ConfirmDeleteDialog = ({
  deleteUsers = [],
  inheritorId = '--',
  inheritorUsers,
  error,
  onErrorClose,
}) => {
  const [_] = useTranslation();
  const [state, setState] = useState({
    deleteUsers,
    inheritorId,
  });

  const handleValueChange = (value, name) => {
    setState(prevState => ({...prevState, [name]: value}));
  };

  const handleErrorClose = () => {
    if (isDefined(onErrorClose)) {
      onErrorClose();
    }
  };

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
    <DialogContent>
      {error && <DialogError error={error} onCloseClick={handleErrorClose} />}
      <ErrorBoundary message={_('An error occurred in this dialog.')}>
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
              onChange={handleValueChange}
            />
          </FormGroup>
        </>
      </ErrorBoundary>
    </DialogContent>
  );
};

ConfirmDeleteDialog.propTypes = {
  deleteUsers: PropTypes.array.isRequired,
  error: PropTypes.string,
  inheritorId: PropTypes.id,
  inheritorUsers: PropTypes.array,
  onErrorClose: PropTypes.func,
};

export default ConfirmDeleteDialog;
