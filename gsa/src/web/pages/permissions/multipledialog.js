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

import {typeName, getEntityType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

export const CURRENT_RESOURCE_ONLY = '0';
export const INCLUDE_RELATED_RESOURCES = '1';
export const RELATED_RESOURCES_ONLY = '2';

const MultiplePermissionDialog = withCapabilities(({
  capabilities,
  entityName = '',
  entityType = '',
  groupId,
  groups = [],
  id,
  includeRelated = CURRENT_RESOURCE_ONLY,
  permission = 'read',
  related = [],
  roleId,
  roles = [],
  subjectType = 'user',
  title = _('Create Multiple Permissions'),
  userId,
  users = [],
  visible = true,
  onClose,
  onSave,
}) => {
  const hasRelated = related.length > 0;

  const data = {
    entityName,
    entityType,
    groupId,
    groups,
    id,
    includeRelated,
    permission,
    related,
    roleId,
    roles,
    subjectType,
    userId,
    users,
  };

  const includeRelatedItems = [];
  if (hasRelated || includeRelated === INCLUDE_RELATED_RESOURCES) {
    includeRelatedItems.push({
      label: _('including related resources'),
      value: INCLUDE_RELATED_RESOURCES,
    });
  }

  includeRelatedItems.push({
    label: _('for current resource only'),
    value: CURRENT_RESOURCE_ONLY,
  });

  if (hasRelated || includeRelated === RELATED_RESOURCES_ONLY) {
    includeRelatedItems.push({
      label: _('for related resources only'),
      value: RELATED_RESOURCES_ONLY,
    });
  }

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
              title={_('Grant')}
            >
              <Divider>
                <Select
                  name="permission"
                  value={state.permission}
                  items={[{
                    label: _('read'),
                    value: 'read',
                  }, {
                    label: _('write'),
                    value: 'write',
                  }]}
                  onChange={onValueChange}
                />
                <span>{_('Permission')}</span>
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
                      name="subjectType"
                      checked={state.subjectType === 'user'}
                      title={_('User')}
                      value="user"
                      onChange={onValueChange}
                    >
                    </Radio>
                    <Select
                      name="userId"
                      value={state.userId}
                      items={renderSelectItems(users)}
                      onChange={onValueChange}
                    />
                  </Divider>
                }

                {capabilities.mayAccess('roles') &&
                  <Divider>
                    <Radio
                      name="subjectType"
                      checked={state.subjectType === 'role'}
                      title={_('Role')}
                      value="role"
                      onChange={onValueChange}
                    >
                    </Radio>
                    <Select
                      name="roleId"
                      value={state.roleId}
                      items={renderSelectItems(roles)}
                      onChange={onValueChange}
                    />
                  </Divider>
                }

                {capabilities.mayAccess('groups') &&
                  <Divider>
                    <Radio
                      name="subjectType"
                      checked={state.subjectType === 'group'}
                      title={_('Group')}
                      value="group"
                      onChange={onValueChange}
                    >
                    </Radio>
                    <Select
                      name="groupId"
                      value={state.groupId}
                      items={renderSelectItems(groups)}
                      onChange={onValueChange}
                    />
                  </Divider>
                }
              </Divider>
            </FormGroup>
            <FormGroup
              title={_('on')}
              flex="column"
            >
              <Divider>
                <span>{typeName(getEntityType(state))}</span>
                <i>{state.entityName}</i>
                <Select
                  name="includeRelated"
                  value={state.includeRelated}
                  items={includeRelatedItems}
                  onChange={onValueChange}
                />
              </Divider>
              {hasRelated &&
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
});

MultiplePermissionDialog.propTypes = {
  entityName: PropTypes.string,
  entityType: PropTypes.string,
  groupId: PropTypes.id,
  groups: PropTypes.array,
  id: PropTypes.id.isRequired,
  includeRelated: PropTypes.oneOf([
    CURRENT_RESOURCE_ONLY,
    INCLUDE_RELATED_RESOURCES,
    RELATED_RESOURCES_ONLY,
  ]),
  permission: PropTypes.oneOf(['read', 'proxy']),
  related: PropTypes.array, // array of models
  roleId: PropTypes.id,
  roles: PropTypes.array,
  subjectType: PropTypes.oneOf([
    'user', 'role', 'group',
  ]),
  title: PropTypes.string,
  userId: PropTypes.id,
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
