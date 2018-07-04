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

import _ from 'gmp/locale';

import {map} from 'gmp/utils/array';

import {typeName, getEntityType} from 'gmp/utils/entitytype';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import Text from '../../components/form/text.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

export const CURRENT_RESOURCE_ONLY = '0';
export const INCLUDE_RELATED_RESOURCES = '1';
export const RELATED_RESOURCES_ONLY = '2';

const MultiplePermissionDialog = ({
  entity_name = '',
  entity_type = '',
  group_id = '',
  groups = [],
  id,
  include_related = INCLUDE_RELATED_RESOURCES,
  permission = 'read',
  related = [],
  role_id = '',
  roles = [],
  subject_type = 'user',
  title = _('Create Multiple Permissions'),
  user_id = '',
  users = [],
  visible = true,
  onClose,
  onSave,
}, {capabilities}) => {
  const has_related = related.length > 0;

  const data = {
    entity_name,
    entity_type,
    group_id,
    groups,
    id,
    include_related,
    permission,
    related,
    role_id,
    roles,
    subject_type,
    user_id,
    users,
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({
        values: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">
            <FormGroup
              title={_('Grant')}>
              <Divider>
                <Select
                  name="permission"
                  value={state.permission}
                  onChange={onValueChange}>
                  <option value="read">{_('read')}</option>
                  <option value="proxy">{_('proxy')}</option>
                </Select>
                <Text>{_('Permission')}</Text>
              </Divider>
            </FormGroup>
            <FormGroup
              flex="column"
              title={_('to')}
            >
              <Divider flex="column">
                {capabilities.mayAccess('users') &&
                  <Divider>
                    <Radio
                      name="subject_type"
                      checked={state.subject_type === 'user'}
                      title={_('User')}
                      value="user"
                      onChange={onValueChange}>
                    </Radio>
                    <Select
                      name="user_id"
                      value={state.user_id}
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
                      checked={state.subject_type === 'role'}
                      title={_('Role')}
                      value="role"
                      onChange={onValueChange}>
                    </Radio>
                    <Select
                      name="role_id"
                      value={state.role_id}
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
                      checked={state.subject_type === 'group'}
                      title={_('Group')}
                      value="group"
                      onChange={onValueChange}>
                    </Radio>
                    <Select
                      name="group_id"
                      value={state.group_id}
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
              </Divider>
            </FormGroup>
            <FormGroup
              title={_('on')}
              flex="column">
              <Divider>
                <Text>{typeName(getEntityType(state))}</Text>
                <i>{state.entity_name}</i>
                <Select
                  name="include_related"
                  value={state.include_related}
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
                    <option value={RELATED_RESOURCES_ONLY}>
                      {_('for related resources only')}
                    </option>
                  }
                </Select>
              </Divider>
              {has_related &&
                <ul>
                  {state.related.map(rentity => (
                    <li key={rentity.id}>
                      <Divider>
                        {typeName(getEntityType(rentity))}
                        <i>{rentity.name}</i>
                      </Divider>
                    </li>
                  ))}
                </ul>
              }
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

MultiplePermissionDialog.propTypes = {
  entity_name: PropTypes.string,
  entity_type: PropTypes.string,
  group_id: PropTypes.id,
  groups: PropTypes.array,
  id: PropTypes.id.isRequired,
  include_related: PropTypes.oneOf([
    CURRENT_RESOURCE_ONLY,
    INCLUDE_RELATED_RESOURCES,
    RELATED_RESOURCES_ONLY,
  ]),
  permission: PropTypes.oneOf(['read', 'proxy']),
  related: PropTypes.array, // array of models
  role_id: PropTypes.id,
  roles: PropTypes.array,
  subject_type: PropTypes.oneOf([
    'user', 'role', 'group',
  ]),
  title: PropTypes.string,
  user_id: PropTypes.id,
  users: PropTypes.array,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

MultiplePermissionDialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default MultiplePermissionDialog;

// vim: set ts=2 sw=2 tw=80:
