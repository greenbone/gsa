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
import {map} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {type_name} from '../../utils/render.js';

import {withDialog} from '../../components/dialog/dialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select2 from '../../components/form/select2.js';
import Text from '../../components/form/text.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

const MultiplePermissionDialog = ({
  entity_name,
  entity_type,
  group_id,
  groups = [],
  include_related,
  permission,
  related = [],
  role_id,
  roles = [],
  subject_type,
  user_id,
  users = [],
  onValueChange,
}, {capabilities}) => {
  return (
    <Layout flex="column">
      <FormGroup
        title={_('Grant')}>
        <Select2
          name="permission"
          value={permission}
          onChange={onValueChange}>
          <option value="read">{_('read')}</option>
          <option value="proxy">{_('proxy')}</option>
        </Select2>
        <Text>{_('Permission')}</Text>
      </FormGroup>
      <FormGroup
        flex="column"
        title={_('to')}
      >
        {capabilities.mayAccess('users') &&
          <Layout flex box>
            <Radio
              name="subject_type"
              checked={subject_type === 'user'}
              title={_('User')}
              value="user"
              onChange={onValueChange}>
            </Radio>
            <Select2
              name="user_id"
              value={user_id}
              onChange={onValueChange}>
              {map(users, user => (
                <option
                  key={user.id}
                  value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select2>
          </Layout>
        }

        {capabilities.mayAccess('roles') &&
          <Layout flex box>
            <Radio
              name="subject_type"
              checked={subject_type === 'role'}
              title={_('Role')}
              value="role"
              onChange={onValueChange}>
            </Radio>
            <Select2
              name="role_id"
              value={role_id}
              onChange={onValueChange}>
              {map(roles, role => {
                return (
                  <option
                    key={role.id}
                    value={role.id}>
                    {role.name}
                  </option>
                );
              })}
            </Select2>
          </Layout>
        }

        {capabilities.mayAccess('groups') &&
          <Layout flex box>
            <Radio
              name="subject_type"
              checked={subject_type === 'group'}
              title={_('Group')}
              value="group"
              onChange={onValueChange}>
            </Radio>
            <Select2
              name="group_id"
              value={group_id}
              onChange={onValueChange}>
              {map(groups, group => (
                <option
                  key={group.id}
                  value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select2>
          </Layout>
        }
      </FormGroup>
      <FormGroup
        title={_('on')}
        flex="column">
        <Divider>
          <Text>{type_name(entity_type) + ' ' + entity_name}</Text>
          <Select2
            name="include_related"
            value={include_related}
            onChange={onValueChange}>
            <option value="1">{_('including related resources')}</option>
            <option value="0">{_('for current resource only')}</option>
            <option value="2">{_('for related resources only')}</option>
          </Select2>
        </Divider>
        {related.length > 0 &&
          <ul>
            {related.map(rentity => (
              <li key={rentity.id}>
                <Divider>
                  {type_name(rentity.entity_type)}
                  <i>{rentity.name}</i>
                </Divider>
              </li>
            ))}
          </ul>
        }
      </FormGroup>
    </Layout>
  );
};

MultiplePermissionDialog.propTypes = {
  id: PropTypes.id.isRequired,
  entity_type: PropTypes.string.isRequired,
  entity_name: PropTypes.string.isRequired,
  group_id: PropTypes.id,
  groups: PropTypes.arrayLike,
  include_related: PropTypes.oneOf(['0', '1', '2']).isRequired,
  permission: PropTypes.oneOf(['read', 'proxy']).isRequired,
  related: PropTypes.array, // array of models
  role_id: PropTypes.id,
  roles: PropTypes.arrayLike,
  subject_type: PropTypes.oneOf([
    'user', 'role', 'group',
  ]).isRequired,
  user_id: PropTypes.id,
  users: PropTypes.arrayLike,
  onValueChange: PropTypes.func.isRequired,
};

MultiplePermissionDialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withDialog(MultiplePermissionDialog, {
  title: _('Create Multiple Permissions'),
  footer: _('Save'),
  defaultState: {
    include_related: '1',
    permission: 'read',
    subject_type: 'user',
  },
});

// vim: set ts=2 sw=2 tw=80:
