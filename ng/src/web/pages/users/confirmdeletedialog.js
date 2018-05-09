/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018  Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined, map} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Select from '../../components/form/select.js';

import Layout from '../../components/layout/layout.js';

const ConfirmDeleteDialog = ({
    deleteUsers,
    id,
    inheritor_id,
    title,
    username,
    users,
    visible,
    onClose,
    onSave,
  }) => {

  let headline = '';

  if (is_defined(username)) {
    headline = _('User {{username}} will be deleted.', {username});
  }
  else if (deleteUsers.length > 1) {
    headline = _('{{count}} users will be deleted',
      {count: deleteUsers.length});
  }
  else {
    headline = _('1 user will be deleted');
  }

  const data = {
    deleteUsers,
    id,
    inheritor_id,
    username,
  };

  const inheritingUserOptions = map(users, user => ({
    label: user.name,
    value: user.id,
  }));
  inheritingUserOptions.unshift({
    label: '--',
    value: '--',
    }, {
    label: _('Current User'),
    value: 'self,',
  });

  return (
    <SaveDialog
      buttonTitle={_('Delete')}
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={data}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">
            <h2>{headline}</h2>
            <p>
              {_('If no inheriting user is selected, all owned resources will' +
                  ' be deleted as well.')}
            </p>
            <FormGroup
              title={_('Inheriting user')}>
              <Select
                name="inheritor_id"
                items={inheritingUserOptions}
                value={state.inheritor_id}
                onChange={onValueChange}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

ConfirmDeleteDialog.propTypes = {
  deleteUsers: PropTypes.array,
  id: PropTypes.string,
  inheritor_id: PropTypes.id,
  title: PropTypes.string.isRequired,
  username: PropTypes.string,
  users: PropTypes.array.isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ConfirmDeleteDialog;

// vim: set ts=2 sw=2 tw=80:
