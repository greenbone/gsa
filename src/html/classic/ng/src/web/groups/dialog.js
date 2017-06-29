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

import  _ from '../../locale.js';
import {is_defined, map} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../utils/proptypes.js';

import {withDialog} from '../components/dialog/dialog.js';

import Checkbox from '../components/form/checkbox.js';
import FormGroup from '../components/form/formgroup.js';
import Select2 from '../components/form/select2.js';
import TextField from '../components/form/textfield.js';

const Dialog = ({
    all_users,
    comment,
    grant_full,
    id,
    name,
    users,
    onValueChange
  }) => {

  const is_edit = is_defined(id);
  return (
    <Layout flex="column">
      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          grow="1"
          value={name}
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup
        title={_('Comment')}
        flex="column">
        <TextField
          name="comment"
          value={comment}
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup
        title={_('Users')}>
        <Select2
          multiple
          name="users"
          value={users}
          onChange={onValueChange}
        >
          {
            map(all_users, user => {
              return (
                <option
                  key={user.id}
                  value={user.name}>
                  {user.name}
                </option>
              );
            })
          }
        </Select2>
      </FormGroup>

      {!is_edit &&
        <FormGroup
          title={_('Special Groups')}>
          <Checkbox
            name="grant_full"
            checkedValue="1"
            unCheckedValue="0"
            checked={grant_full === '1'}
            title={_('Create permission to grant full read and write access ' +
              'among all group members and across any resources')}
            onChange={onValueChange}
          />
        </FormGroup>
      }
    </Layout>
  );
};

Dialog.propTypes = {
  all_users: PropTypes.arrayLike,
  comment: PropTypes.string,
  grant_full: PropTypes.oneOf(['0', '1']),
  id: PropTypes.id,
  name: PropTypes.string,
  users: PropTypes.arrayLike,
  onValueChange: PropTypes.func.isRequired,
};


export default withDialog(Dialog, {
  title: _('New Group'),
  footer: _('Save'),
  defaultState: {
    name: _('Unnamed'),
  },
});

// vim: set ts=2 sw=2 tw=80:
