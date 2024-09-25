/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import MultiSelect from 'web/components/form/multiselect';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

const Dialog = ({allUsers, grant_full, group, title, onClose, onSave}) => {
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
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={{
        ...DEFAULTS,
        ...group,
      }}
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

            <FormGroup title={_('Comment')} flex="column">
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Users')}>
              <MultiSelect
                name="users"
                items={userOptions}
                value={state.users}
                onChange={onValueChange}
              />
            </FormGroup>

            {!is_edit && (
              <FormGroup title={_('Special Groups')}>
                <Checkbox
                  name="grant_full"
                  checkedValue="1"
                  unCheckedValue="0"
                  checked={state.grant_full === '1'}
                  title={_(
                    'Create permission to grant full read and write ' +
                      'access among all group members and across any resources',
                  )}
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
  grant_full: PropTypes.oneOf(['0', '1']),
  group: PropTypes.model,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
