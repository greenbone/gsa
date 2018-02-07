/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {map} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {type_name} from '../../utils/render.js';

import withDialog from '../../components/dialog/withDialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import Text from '../../components/form/text.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

export const CURRENT_RESOURCE_ONLY = '0';
export const INCLUDE_RELATED_RESOURCES = '1';
export const RELATED_RESOURCES_ONY = '2';

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
  const has_related = related.length > 0;
  return (
    <Layout flex="column">
      <FormGroup
        title={_('Grant')}>
        <Select
          name="permission"
          value={permission}
          onChange={onValueChange}>
          <option value="read">{_('read')}</option>
          <option value="proxy">{_('proxy')}</option>
        </Select>
        <Text>{_('Permission')}</Text>
      </FormGroup>
      <FormGroup
        flex="column"
        title={_('to')}
      >
        {capabilities.mayAccess('users') &&
          <Divider>
            <Radio
              name="subject_type"
              checked={subject_type === 'user'}
              title={_('User')}
              value="user"
              onChange={onValueChange}>
            </Radio>
            <Select
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
            </Select>
          </Divider>
        }

        {capabilities.mayAccess('roles') &&
          <Divider>
            <Radio
              name="subject_type"
              checked={subject_type === 'role'}
              title={_('Role')}
              value="role"
              onChange={onValueChange}>
            </Radio>
            <Select
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
            </Select>
          </Divider>
        }

        {capabilities.mayAccess('groups') &&
          <Divider>
            <Radio
              name="subject_type"
              checked={subject_type === 'group'}
              title={_('Group')}
              value="group"
              onChange={onValueChange}>
            </Radio>
            <Select
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
            </Select>
          </Divider>
        }
      </FormGroup>
      <FormGroup
        title={_('on')}
        flex="column">
        <Divider>
          <Text>{type_name(entity_type)}</Text>
          <i>{entity_name}</i>
          <Select
            name="include_related"
            value={include_related}
            onChange={onValueChange}>
            {has_related &&
              <option value={INCLUDE_RELATED_RESOURCES}>
                {_('including related resources')}
              </option>
            }

            <option value={CURRENT_RESOURCE_ONLY}>
              {_('for current resource only')}
            </option>

            {has_related &&
              <option value={RELATED_RESOURCES_ONY}>
                {_('for related resources only')}
              </option>
            }
          </Select>
        </Divider>
        {has_related &&
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
  entity_name: PropTypes.string.isRequired,
  entity_type: PropTypes.string.isRequired,
  group_id: PropTypes.id,
  groups: PropTypes.array,
  id: PropTypes.id.isRequired,
  include_related: PropTypes.oneOf([
    CURRENT_RESOURCE_ONLY,
    INCLUDE_RELATED_RESOURCES,
    RELATED_RESOURCES_ONY,
  ]).isRequired,
  permission: PropTypes.oneOf(['read', 'proxy']).isRequired,
  related: PropTypes.array, // array of models
  role_id: PropTypes.id,
  roles: PropTypes.array,
  subject_type: PropTypes.oneOf([
    'user', 'role', 'group',
  ]).isRequired,
  user_id: PropTypes.id,
  users: PropTypes.array,
  onValueChange: PropTypes.func.isRequired,
};

MultiplePermissionDialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withDialog({
  title: _('Create Multiple Permissions'),
  footer: _('Save'),
  defaultState: {
    include_related: INCLUDE_RELATED_RESOURCES,
    permission: 'read',
    subject_type: 'user',
  },
})(MultiplePermissionDialog);

// vim: set ts=2 sw=2 tw=80:
