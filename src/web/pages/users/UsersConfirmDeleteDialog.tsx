/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type User from 'gmp/models/user';
import {isDefined} from 'gmp/utils/identity';
import DialogContent from 'web/components/dialog/DialogContent';
import DialogError from 'web/components/dialog/DialogError';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import {renderSelectItems} from 'web/utils/Render';

interface UsersConfirmDeleteDialogState {
  deleteUsers: User[];
  inheritorId: string;
}

interface UsersConfirmDeleteDialogProps {
  deleteUsers?: User[];
  inheritorId?: string;
  inheritorUsers?: User[];
  error?: string;
  onErrorClose?: () => void;
}

const UsersConfirmDeleteDialog = ({
  deleteUsers = [],
  inheritorId = '--',
  inheritorUsers,
  error,
  onErrorClose,
}: UsersConfirmDeleteDialogProps) => {
  const [_] = useTranslation();
  const [state, setState] = useState<UsersConfirmDeleteDialogState>({
    deleteUsers,
    inheritorId,
  });

  const handleValueChange = (value: string, name?: string) => {
    if (name === 'inheritorId') {
      setState(prevState => ({...prevState, inheritorId: value}));
    }
  };

  const handleErrorClose = () => {
    if (isDefined(onErrorClose)) {
      onErrorClose();
    }
  };

  let headline;
  if (deleteUsers.length === 1) {
    headline = _('User {{name}} will be deleted.', {
      name: deleteUsers[0].name ?? '',
    });
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
    ...renderSelectItems(
      (inheritorUsers ?? []).map(user => ({
        id: user.id ?? '',
        name: user.name ?? '',
      })),
    ),
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

export default UsersConfirmDeleteDialog;
