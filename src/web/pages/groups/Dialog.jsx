/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const Dialog = ({allUsers, group, title, onClose, onSave}) => {
  const [_] = useTranslation();
  const is_edit = isDefined(group);

  title = title || _('New Group');

  const userOptions = map(allUsers, user => ({
    value: user.name,
    label: user.name,
  }));

  const DEFAULTS = {name: _('Unnamed'), users: []};

  return (
    <SaveDialog
      defaultValues={{
        ...DEFAULTS,
        ...group,
      }}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup flex="column" title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Users')}>
              <MultiSelect
                items={userOptions}
                name="users"
                value={state.users}
                onChange={onValueChange}
              />
            </FormGroup>

            {!is_edit && (
              <FormGroup title={_('Special Groups')}>
                <Checkbox
                  checked={state.grant_full === '1'}
                  checkedValue="1"
                  name="grant_full"
                  title={_(
                    'Create permission to grant full read and write ' +
                      'access among all group members and across any resources',
                  )}
                  unCheckedValue="0"
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

Dialog.propTypes = {
  allUsers: PropTypes.array,
  group: PropTypes.model,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default Dialog;
