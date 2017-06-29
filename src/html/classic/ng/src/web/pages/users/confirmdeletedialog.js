/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import {withDialog} from '../../components/dialog/dialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Select2 from '../../components/form/select2.js';

import Layout from '../../components/layout/layout.js';

const ConfirmDeleteDialog = ({
    deleteUsers,
    username,
    users,
    inheritor_id,
    onValueChange,
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
  return (
    <Layout flex="column">
      <h2>{headline}</h2>
      <p>
        {_('If no inheriting user is selected, all owned resources will ' +
            'be deleted as well.')}
      </p>
      <FormGroup
        title={_('Inheriting user')}>
        <Select2
          name="inheritor_id"
          value={inheritor_id}
          onChange={onValueChange}>
          <option value="--">--</option>
          <option value="self">{_('(Current User)')}</option>
          {
            users.map(user => {
              return (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              );
            })
          }
        </Select2>
      </FormGroup>
    </Layout>
  );
};

ConfirmDeleteDialog.propTypes = {
  deleteUsers: PropTypes.arrayLike,
  inheritor_id: PropTypes.id,
  username: PropTypes.string,
  users: PropTypes.arrayLike.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default withDialog(ConfirmDeleteDialog, {
  footer: _('Delete'),
});
